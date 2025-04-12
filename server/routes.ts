import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { insertDocumentSchema, insertOrderSchema, insertNotificationSchema, insertActivitySchema } from "@shared/schema";

// Setup file upload storage
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_engine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + randomUUID();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_engine,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Only allow xlsx and docx files
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx and .docx files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Authentication
  setupAuth(app);

  // Check authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // API routes
  
  // Document API routes
  app.post("/api/documents/upload", requireAuth, upload.single('document'), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileType = path.extname(req.file.originalname).substring(1);
      const isValidType = ['xlsx', 'docx'].includes(fileType);
      
      if (!isValidType) {
        fs.unlinkSync(req.file.path); // Delete invalid file
        return res.status(400).json({ message: "Invalid file type. Only .xlsx and .docx files are allowed" });
      }
      
      const document = await storage.createDocument({
        userId: req.user!.id,
        name: req.file.originalname,
        type: fileType,
        path: req.file.path,
        size: req.file.size
      });
      
      // Record activity
      await storage.createActivity({
        userId: req.user!.id,
        action: "Document Upload",
        details: `Uploaded document: ${document.name}`
      });
      
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/documents", requireAuth, async (req, res, next) => {
    try {
      const documents = await storage.getDocumentsByUserId(req.user!.id);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/documents/:id", requireAuth, async (req, res, next) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      if (document.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to delete this document" });
      }
      
      // Delete file from disk
      try {
        if (fs.existsSync(document.path)) {
          fs.unlinkSync(document.path);
        }
      } catch (fsError) {
        console.error("Error deleting file:", fsError);
      }
      
      const deleted = await storage.deleteDocument(documentId);
      
      if (deleted) {
        // Record activity
        await storage.createActivity({
          userId: req.user!.id,
          action: "Document Delete",
          details: `Deleted document: ${document.name}`
        });
        
        res.status(200).json({ message: "Document deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete document" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/documents/:id/download", requireAuth, async (req, res, next) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      if (document.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to download this document" });
      }
      
      if (!fs.existsSync(document.path)) {
        return res.status(404).json({ message: "File not found on server" });
      }
      
      // Record activity
      await storage.createActivity({
        userId: req.user!.id,
        action: "Document Download",
        details: `Downloaded document: ${document.name}`
      });
      
      res.download(document.path, document.name);
    } catch (error) {
      next(error);
    }
  });
  
  // Order API routes
  app.post("/api/orders", requireAuth, async (req, res, next) => {
    try {
      const parsedBody = insertOrderSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid order data", errors: parsedBody.error.errors });
      }
      
      const orderData = {
        ...parsedBody.data,
        userId: req.user!.id
      };
      
      const order = await storage.createOrder(orderData);
      
      // Record activity
      await storage.createActivity({
        userId: req.user!.id,
        action: "Order Created",
        details: `Created order: ${order.orderId}`
      });
      
      // Create notification
      await storage.createNotification({
        userId: req.user!.id,
        title: "New Order Created",
        message: `Your order ${order.orderId} has been created successfully with status: ${order.status}`,
        type: "info"
      });
      
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/orders", requireAuth, async (req, res, next) => {
    try {
      let orders = await storage.getOrdersByUserId(req.user!.id);
      
      // Add dummy data if no orders exist
      if (orders.length === 0) {
        // Create some dummy orders for demonstration
        orders = [
          {
            id: 101,
            userId: req.user!.id,
            orderId: "ORD-2023-001",
            status: "completed",
            totalDocuments: 2,
            documentType: "xlsx",
            price: 15.99,
            createdAt: new Date(Date.now() - 86400000 * 10),
            updatedAt: new Date(Date.now() - 86400000 * 9)
          },
          {
            id: 102,
            userId: req.user!.id,
            orderId: "ORD-2023-002",
            status: "completed",
            totalDocuments: 1,
            documentType: "docx",
            price: 9.99,
            createdAt: new Date(Date.now() - 86400000 * 5),
            updatedAt: new Date(Date.now() - 86400000 * 3)
          },
          {
            id: 103,
            userId: req.user!.id,
            orderId: "ORD-2023-003",
            status: "processing",
            totalDocuments: 3,
            documentType: "xlsx",
            price: 24.99,
            createdAt: new Date(Date.now() - 86400000 * 2),
            updatedAt: new Date(Date.now() - 86400000 * 1)
          }
        ];
      }
      
      // Add additional fields for our UI needs
      const enhancedOrders = orders.map(order => {
        const isOpened = Math.random() > 0.5; // Random boolean for demo
        return {
          ...order,
          company: "Ministerul Energiei",
          emergencySituation: Math.random() > 0.7 ? "Critical" : "Normal",
          sender: "Energy Department",
          isOpened: isOpened,
          openedBy: isOpened ? "Administrator" : null
        };
      });
      
      res.json(enhancedOrders);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/orders/:id", requireAuth, async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view this order" });
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/orders/:id/status", requireAuth, async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to update this order" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      if (updatedOrder) {
        // Record activity
        await storage.createActivity({
          userId: req.user!.id,
          action: "Order Status Updated",
          details: `Updated order ${order.orderId} status to: ${status}`
        });
        
        // Create notification
        await storage.createNotification({
          userId: req.user!.id,
          title: "Order Status Updated",
          message: `Your order ${order.orderId} status has been updated to: ${status}`,
          type: "info"
        });
        
        res.json(updatedOrder);
      } else {
        res.status(500).json({ message: "Failed to update order status" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Resident API routes
  app.get("/api/residents", requireAuth, async (req, res, next) => {
    try {
      const source = req.query.source as string | undefined;
      const residents = await storage.getResidents(source);
      res.json(residents);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/residents/:id", requireAuth, async (req, res, next) => {
    try {
      const residentId = parseInt(req.params.id);
      const resident = await storage.getResident(residentId);
      
      if (!resident) {
        return res.status(404).json({ message: "Resident not found" });
      }
      
      res.json(resident);
    } catch (error) {
      next(error);
    }
  });
  
  // Notification API routes
  app.get("/api/notifications", requireAuth, async (req, res, next) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.user!.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/notifications/:id/read", requireAuth, async (req, res, next) => {
    try {
      const notificationId = parseInt(req.params.id);
      const marked = await storage.markNotificationAsRead(notificationId);
      
      if (marked) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Notification not found" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/notifications/read-all", requireAuth, async (req, res, next) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.user!.id);
      const markPromises = notifications.map(notification => 
        storage.markNotificationAsRead(notification.id)
      );
      
      await Promise.all(markPromises);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  // Reports API route
  app.get("/api/reports", requireAuth, async (req, res, next) => {
    try {
      let documents = await storage.getDocumentsByUserId(req.user!.id);
      
      // Add dummy data if no documents exist
      if (documents.length === 0) {
        // Create some dummy documents for demonstration
        documents = [
          {
            id: 201,
            userId: req.user!.id,
            name: "Annual Energy Report 2023.xlsx",
            type: "xlsx",
            path: "/uploads/annual-report-2023.xlsx",
            size: 1024 * 1024, // 1MB
            uploadedAt: new Date(Date.now() - 86400000 * 14)
          },
          {
            id: 202,
            userId: req.user!.id,
            name: "Sustainability Analysis Q4.docx",
            type: "docx",
            path: "/uploads/sustainability-q4.docx",
            size: 512 * 1024, // 512KB
            uploadedAt: new Date(Date.now() - 86400000 * 7)
          },
          {
            id: 203,
            userId: req.user!.id,
            name: "Electric Grid Usage Analysis.xlsx",
            type: "xlsx",
            path: "/uploads/grid-usage.xlsx",
            size: 2048 * 1024, // 2MB
            uploadedAt: new Date(Date.now() - 86400000 * 2)
          }
        ];
      }
      
      // Add additional fields for demo purposes
      const reports = documents.map(doc => {
        const isOpened = Math.random() > 0.5; // Random boolean for demo
        return {
          ...doc,
          company: "Ministerul Energiei",
          receiver: "Department of Energy",
          isOpened: isOpened,
          openedBy: isOpened ? "Administrator" : null,
          updatedAt: doc.uploadedAt, // For demo, use same date for both
          emergencySituation: Math.random() > 0.7 ? "Critical" : "Normal", // For order reports
          sender: "Energy Department"
        };
      });
      
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });
  
  // Activity API routes
  app.get("/api/activities", requireAuth, async (req, res, next) => {
    try {
      const activities = await storage.getActivitiesByUserId(req.user!.id);
      res.json(activities);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
