import { users, User, InsertUser, documents, Document, InsertDocument, orders, Order, InsertOrder, residents, Resident, InsertResident, notifications, Notification, InsertNotification, activities, Activity, InsertActivity } from "@shared/schema";
import { randomBytes } from "crypto";
import createMemoryStore from "memorystore";
import session from "express-session";

// Memory Store for sessions
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByOrderId(orderId: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Resident operations
  getResident(id: number): Promise<Resident | undefined>;
  getResidents(source?: string): Promise<Resident[]>;
  createResident(resident: InsertResident): Promise<Resident>;
  
  // Notification operations
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Activity operations
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private orders: Map<number, Order>;
  private residents: Map<number, Resident>;
  private notifications: Map<number, Notification>;
  private activities: Map<number, Activity>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private documentIdCounter: number;
  private orderIdCounter: number;
  private residentIdCounter: number;
  private notificationIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.orders = new Map();
    this.residents = new Map();
    this.notifications = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.documentIdCounter = 1;
    this.orderIdCounter = 1;
    this.residentIdCounter = 1;
    this.notificationIdCounter = 1;
    this.activityIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with some resident data
    this.initializeResidentData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.userId === userId,
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const uploadedAt = new Date();
    const document: Document = { ...insertDocument, id, uploadedAt };
    this.documents.set(id, document);
    return document;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderByOrderId(orderId: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.orderId === orderId,
    );
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const createdAt = new Date();
    const updatedAt = createdAt;
    const order: Order = { ...insertOrder, id, createdAt, updatedAt };
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = { 
      ...order, 
      status, 
      updatedAt: new Date() 
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Resident operations
  async getResident(id: number): Promise<Resident | undefined> {
    return this.residents.get(id);
  }

  async getResidents(source?: string): Promise<Resident[]> {
    if (source) {
      return Array.from(this.residents.values()).filter(
        (resident) => resident.source === source,
      );
    }
    return Array.from(this.residents.values());
  }

  async createResident(insertResident: InsertResident): Promise<Resident> {
    const id = this.residentIdCounter++;
    const resident: Resident = { ...insertResident, id };
    this.residents.set(id, resident);
    return resident;
  }

  // Notification operations
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId,
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const createdAt = new Date();
    const notification: Notification = { ...insertNotification, id, isRead: false, createdAt };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }

  // Activity operations
  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const createdAt = new Date();
    const activity: Activity = { ...insertActivity, id, createdAt };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Initialize resident data
  private initializeResidentData() {
    const internalResidents: InsertResident[] = [
      {
        name: "Ion Popescu",
        residentId: "MD2304981",
        address: "Str. Ștefan cel Mare 42, Chișinău",
        registrationDate: new Date(2022, 5, 15),
        source: "internal",
        data: { phone: "+373 69 123 456", email: "ipopescu@mail.md" }
      },
      {
        name: "Maria Ionescu",
        residentId: "MD2309875",
        address: "Str. București 23, Chișinău",
        registrationDate: new Date(2022, 8, 20),
        source: "internal",
        data: { phone: "+373 69 987 654", email: "mionescu@mail.md" }
      },
      {
        name: "Vasile Rusu",
        residentId: "MD2303451",
        address: "Str. Alba Iulia 102, Chișinău",
        registrationDate: new Date(2022, 2, 10),
        source: "internal",
        data: { phone: "+373 69 567 890", email: "vrusu@mail.md" }
      }
    ];
    
    const externalResidents: InsertResident[] = [
      {
        name: "Ana Codreanu",
        residentId: "MD2308532",
        address: "Str. Mihai Eminescu 18, Bălți",
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
        address: "Str. Independenței 78, Ungheni",
        registrationDate: new Date(2022, 7, 8),
        source: "external",
        data: { phone: "+373 69 555 666", email: "elungu@mail.md" }
      }
    ];
    
    [...internalResidents, ...externalResidents].forEach(resident => {
      this.createResident(resident);
    });
  }
}

export const storage = new MemStorage();
