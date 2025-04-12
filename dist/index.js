// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import createMemoryStore from "memorystore";
import session from "express-session";
var MemoryStore = createMemoryStore(session);
var MemStorage = class {
  users;
  documents;
  orders;
  residents;
  notifications;
  activities;
  sessionStore;
  userIdCounter;
  documentIdCounter;
  orderIdCounter;
  residentIdCounter;
  notificationIdCounter;
  activityIdCounter;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.documents = /* @__PURE__ */ new Map();
    this.orders = /* @__PURE__ */ new Map();
    this.residents = /* @__PURE__ */ new Map();
    this.notifications = /* @__PURE__ */ new Map();
    this.activities = /* @__PURE__ */ new Map();
    this.userIdCounter = 1;
    this.documentIdCounter = 1;
    this.orderIdCounter = 1;
    this.residentIdCounter = 1;
    this.notificationIdCounter = 1;
    this.activityIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
      // prune expired entries every 24h
    });
    this.initializeResidentData();
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userIdCounter++;
    const createdAt = /* @__PURE__ */ new Date();
    const user = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  // Document operations
  async getDocument(id) {
    return this.documents.get(id);
  }
  async getDocumentsByUserId(userId) {
    return Array.from(this.documents.values()).filter(
      (document) => document.userId === userId
    );
  }
  async createDocument(insertDocument) {
    const id = this.documentIdCounter++;
    const uploadedAt = /* @__PURE__ */ new Date();
    const document = { ...insertDocument, id, uploadedAt };
    this.documents.set(id, document);
    return document;
  }
  async deleteDocument(id) {
    return this.documents.delete(id);
  }
  // Order operations
  async getOrder(id) {
    return this.orders.get(id);
  }
  async getOrderByOrderId(orderId) {
    return Array.from(this.orders.values()).find(
      (order) => order.orderId === orderId
    );
  }
  async getOrdersByUserId(userId) {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  async createOrder(insertOrder) {
    const id = this.orderIdCounter++;
    const createdAt = /* @__PURE__ */ new Date();
    const updatedAt = createdAt;
    const order = { ...insertOrder, id, createdAt, updatedAt };
    this.orders.set(id, order);
    return order;
  }
  async updateOrderStatus(id, status) {
    const order = this.orders.get(id);
    if (!order) return void 0;
    const updatedOrder = {
      ...order,
      status,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  // Resident operations
  async getResident(id) {
    return this.residents.get(id);
  }
  async getResidents(source) {
    if (source) {
      return Array.from(this.residents.values()).filter(
        (resident) => resident.source === source
      );
    }
    return Array.from(this.residents.values());
  }
  async createResident(insertResident) {
    const id = this.residentIdCounter++;
    const resident = { ...insertResident, id };
    this.residents.set(id, resident);
    return resident;
  }
  // Notification operations
  async getNotificationsByUserId(userId) {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId
    );
  }
  async createNotification(insertNotification) {
    const id = this.notificationIdCounter++;
    const createdAt = /* @__PURE__ */ new Date();
    const notification = { ...insertNotification, id, isRead: false, createdAt };
    this.notifications.set(id, notification);
    return notification;
  }
  async markNotificationAsRead(id) {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }
  // Activity operations
  async getActivitiesByUserId(userId) {
    return Array.from(this.activities.values()).filter((activity) => activity.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createActivity(insertActivity) {
    const id = this.activityIdCounter++;
    const createdAt = /* @__PURE__ */ new Date();
    const activity = { ...insertActivity, id, createdAt };
    this.activities.set(id, activity);
    return activity;
  }
  // Initialize resident data
  initializeResidentData() {
    const internalResidents = [
      {
        name: "Ion Popescu",
        residentId: "MD2304981",
        address: "Str. \u0218tefan cel Mare 42, Chi\u0219in\u0103u",
        registrationDate: new Date(2022, 5, 15),
        source: "internal",
        data: { phone: "+373 69 123 456", email: "ipopescu@mail.md" }
      },
      {
        name: "Maria Ionescu",
        residentId: "MD2309875",
        address: "Str. Bucure\u0219ti 23, Chi\u0219in\u0103u",
        registrationDate: new Date(2022, 8, 20),
        source: "internal",
        data: { phone: "+373 69 987 654", email: "mionescu@mail.md" }
      },
      {
        name: "Vasile Rusu",
        residentId: "MD2303451",
        address: "Str. Alba Iulia 102, Chi\u0219in\u0103u",
        registrationDate: new Date(2022, 2, 10),
        source: "internal",
        data: { phone: "+373 69 567 890", email: "vrusu@mail.md" }
      }
    ];
    const externalResidents = [
      {
        name: "Ana Codreanu",
        residentId: "MD2308532",
        address: "Str. Mihai Eminescu 18, B\u0103l\u021Bi",
        registrationDate: new Date(2022, 1, 5),
        source: "external",
        data: { phone: "+373 69 111 222", email: "acodreanu@mail.md" }
      },
      {
        name: "Dumitru Moraru",
        residentId: "MD2307764",
        address: "Str. Decebal 45, Cahul",
        registrationDate: new Date(2022, 3, 25),
        source: "external",
        data: { phone: "+373 69 333 444", email: "dmoraru@mail.md" }
      },
      {
        name: "Elena Lungu",
        residentId: "MD2301298",
        address: "Str. Independen\u021Bei 78, Ungheni",
        registrationDate: new Date(2022, 7, 8),
        source: "external",
        data: { phone: "+373 69 555 666", email: "elungu@mail.md" }
      }
    ];
    [...internalResidents, ...externalResidents].forEach((resident) => {
      this.createResident(resident);
    });
  }
};
var storage = new MemStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString("hex");
  const sessionSettings = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1e3 * 60 * 60 * 24
      // 1 day
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      await storage.createNotification({
        userId: user.id,
        title: "Welcome to RTA",
        message: "Welcome to the Report Transfer Application. Start by exploring your dashboard or uploading your first document.",
        type: "info"
      });
      await storage.createActivity({
        userId: user.id,
        action: "User Registration",
        details: "New user account created"
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err, user) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.login(user, async (err2) => {
        if (err2) return next(err2);
        await storage.createActivity({
          userId: user.id,
          action: "User Login",
          details: "User logged in successfully"
        });
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    if (req.user) {
      const userId = req.user.id;
      req.logout((err) => {
        if (err) return next(err);
        try {
          storage.createActivity({
            userId,
            action: "User Logout",
            details: "User logged out successfully"
          });
        } catch (e) {
        }
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(200);
    }
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user;
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
}

// server/routes.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  company: text("company"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow()
});
var documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  // xlsx or docx
  path: text("path").notNull(),
  size: integer("size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderId: text("order_id").notNull().unique(),
  status: text("status").notNull().default("pending"),
  totalDocuments: integer("total_documents").notNull(),
  documentType: text("document_type").notNull(),
  price: integer("price"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});
var residents = pgTable("residents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  residentId: text("resident_id").notNull(),
  address: text("address").notNull(),
  registrationDate: timestamp("registration_date").notNull(),
  source: text("source").notNull().default("internal"),
  data: jsonb("data")
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  company: true,
  role: true
});
var insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  name: true,
  type: true,
  path: true,
  size: true
});
var insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  orderId: true,
  status: true,
  totalDocuments: true,
  documentType: true,
  price: true
});
var insertResidentSchema = createInsertSchema(residents).pick({
  name: true,
  residentId: true,
  address: true,
  registrationDate: true,
  source: true,
  data: true
});
var insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true
});
var insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  action: true,
  details: true
});

// server/routes.ts
var uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
var storage_engine = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + randomUUID();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
var upload = multer({
  storage: storage_engine,
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10MB limit
  fileFilter: function(req, file, cb) {
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx and .docx files are allowed"));
    }
  }
});
async function registerRoutes(app2) {
  setupAuth(app2);
  const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  app2.post("/api/documents/upload", requireAuth, upload.single("document"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const fileType = path.extname(req.file.originalname).substring(1);
      const isValidType = ["xlsx", "docx"].includes(fileType);
      if (!isValidType) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Invalid file type. Only .xlsx and .docx files are allowed" });
      }
      const document = await storage.createDocument({
        userId: req.user.id,
        name: req.file.originalname,
        type: fileType,
        path: req.file.path,
        size: req.file.size
      });
      await storage.createActivity({
        userId: req.user.id,
        action: "Document Upload",
        details: `Uploaded document: ${document.name}`
      });
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/documents", requireAuth, async (req, res, next) => {
    try {
      const documents2 = await storage.getDocumentsByUserId(req.user.id);
      res.json(documents2);
    } catch (error) {
      next(error);
    }
  });
  app2.delete("/api/documents/:id", requireAuth, async (req, res, next) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      if (document.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to delete this document" });
      }
      try {
        if (fs.existsSync(document.path)) {
          fs.unlinkSync(document.path);
        }
      } catch (fsError) {
        console.error("Error deleting file:", fsError);
      }
      const deleted = await storage.deleteDocument(documentId);
      if (deleted) {
        await storage.createActivity({
          userId: req.user.id,
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
  app2.get("/api/documents/:id/download", requireAuth, async (req, res, next) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      if (document.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to download this document" });
      }
      if (!fs.existsSync(document.path)) {
        return res.status(404).json({ message: "File not found on server" });
      }
      await storage.createActivity({
        userId: req.user.id,
        action: "Document Download",
        details: `Downloaded document: ${document.name}`
      });
      res.download(document.path, document.name);
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/orders", requireAuth, async (req, res, next) => {
    try {
      const parsedBody = insertOrderSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid order data", errors: parsedBody.error.errors });
      }
      const orderData = {
        ...parsedBody.data,
        userId: req.user.id
      };
      const order = await storage.createOrder(orderData);
      await storage.createActivity({
        userId: req.user.id,
        action: "Order Created",
        details: `Created order: ${order.orderId}`
      });
      await storage.createNotification({
        userId: req.user.id,
        title: "New Order Created",
        message: `Your order ${order.orderId} has been created successfully with status: ${order.status}`,
        type: "info"
      });
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/orders", requireAuth, async (req, res, next) => {
    try {
      let orders2 = await storage.getOrdersByUserId(req.user.id);
      if (orders2.length === 0) {
        orders2 = [
          {
            id: 101,
            userId: req.user.id,
            orderId: "ORD-2023-001",
            status: "completed",
            totalDocuments: 2,
            documentType: "xlsx",
            price: 15.99,
            createdAt: new Date(Date.now() - 864e5 * 10),
            updatedAt: new Date(Date.now() - 864e5 * 9)
          },
          {
            id: 102,
            userId: req.user.id,
            orderId: "ORD-2023-002",
            status: "completed",
            totalDocuments: 1,
            documentType: "docx",
            price: 9.99,
            createdAt: new Date(Date.now() - 864e5 * 5),
            updatedAt: new Date(Date.now() - 864e5 * 3)
          },
          {
            id: 103,
            userId: req.user.id,
            orderId: "ORD-2023-003",
            status: "processing",
            totalDocuments: 3,
            documentType: "xlsx",
            price: 24.99,
            createdAt: new Date(Date.now() - 864e5 * 2),
            updatedAt: new Date(Date.now() - 864e5 * 1)
          }
        ];
      }
      const enhancedOrders = orders2.map((order) => {
        const isOpened = Math.random() > 0.5;
        return {
          ...order,
          company: "Ministerul Energiei",
          emergencySituation: Math.random() > 0.7 ? "Critical" : "Normal",
          sender: "Energy Department",
          isOpened,
          openedBy: isOpened ? "Administrator" : null
        };
      });
      res.json(enhancedOrders);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/orders/:id", requireAuth, async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to view this order" });
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  });
  app2.patch("/api/orders/:id/status", requireAuth, async (req, res, next) => {
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
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to update this order" });
      }
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      if (updatedOrder) {
        await storage.createActivity({
          userId: req.user.id,
          action: "Order Status Updated",
          details: `Updated order ${order.orderId} status to: ${status}`
        });
        await storage.createNotification({
          userId: req.user.id,
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
  app2.get("/api/residents", requireAuth, async (req, res, next) => {
    try {
      const source = req.query.source;
      const residents2 = await storage.getResidents(source);
      res.json(residents2);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/residents/:id", requireAuth, async (req, res, next) => {
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
  app2.get("/api/notifications", requireAuth, async (req, res, next) => {
    try {
      const notifications2 = await storage.getNotificationsByUserId(req.user.id);
      res.json(notifications2);
    } catch (error) {
      next(error);
    }
  });
  app2.patch("/api/notifications/:id/read", requireAuth, async (req, res, next) => {
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
  app2.patch("/api/notifications/read-all", requireAuth, async (req, res, next) => {
    try {
      const notifications2 = await storage.getNotificationsByUserId(req.user.id);
      const markPromises = notifications2.map(
        (notification) => storage.markNotificationAsRead(notification.id)
      );
      await Promise.all(markPromises);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/reports", requireAuth, async (req, res, next) => {
    try {
      let documents2 = await storage.getDocumentsByUserId(req.user.id);
      if (documents2.length === 0) {
        documents2 = [
          {
            id: 201,
            userId: req.user.id,
            name: "Annual Energy Report 2023.xlsx",
            type: "xlsx",
            path: "/uploads/annual-report-2023.xlsx",
            size: 1024 * 1024,
            // 1MB
            uploadedAt: new Date(Date.now() - 864e5 * 14)
          },
          {
            id: 202,
            userId: req.user.id,
            name: "Sustainability Analysis Q4.docx",
            type: "docx",
            path: "/uploads/sustainability-q4.docx",
            size: 512 * 1024,
            // 512KB
            uploadedAt: new Date(Date.now() - 864e5 * 7)
          },
          {
            id: 203,
            userId: req.user.id,
            name: "Electric Grid Usage Analysis.xlsx",
            type: "xlsx",
            path: "/uploads/grid-usage.xlsx",
            size: 2048 * 1024,
            // 2MB
            uploadedAt: new Date(Date.now() - 864e5 * 2)
          }
        ];
      }
      const reports = documents2.map((doc) => {
        const isOpened = Math.random() > 0.5;
        return {
          ...doc,
          company: "Ministerul Energiei",
          receiver: "Department of Energy",
          isOpened,
          openedBy: isOpened ? "Administrator" : null,
          updatedAt: doc.uploadedAt,
          // For demo, use same date for both
          emergencySituation: Math.random() > 0.7 ? "Critical" : "Normal",
          // For order reports
          sender: "Energy Department"
        };
      });
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/activities", requireAuth, async (req, res, next) => {
    try {
      const activities2 = await storage.getActivitiesByUserId(req.user.id);
      res.json(activities2);
    } catch (error) {
      next(error);
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse;
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    capturedJsonResponse = body;
    return originalJson(body);
  };
  res.on("finish", () => {
    if (!path4.startsWith("/api")) return;
    const duration = Date.now() - start;
    let line = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) {
      line += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }
    if (line.length > 80) {
      line = line.slice(0, 79) + "\u2026";
    }
    log(line);
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
