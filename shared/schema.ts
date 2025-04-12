import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  company: text("company"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // xlsx or docx
  path: text("path").notNull(),
  size: integer("size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderId: text("order_id").notNull().unique(),
  status: text("status").notNull().default("pending"),
  totalDocuments: integer("total_documents").notNull(),
  documentType: text("document_type").notNull(),
  price: integer("price"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const residents = pgTable("residents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  residentId: text("resident_id").notNull(),
  address: text("address").notNull(),
  registrationDate: timestamp("registration_date").notNull(),
  source: text("source").notNull().default("internal"),
  data: jsonb("data"),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  company: true,
  role: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  name: true,
  type: true,
  path: true,
  size: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  orderId: true,
  status: true,
  totalDocuments: true,
  documentType: true,
  price: true,
});

export const insertResidentSchema = createInsertSchema(residents).pick({
  name: true,
  residentId: true,
  address: true,
  registrationDate: true,
  source: true,
  data: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  action: true,
  details: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertResident = z.infer<typeof insertResidentSchema>;
export type Resident = typeof residents.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
