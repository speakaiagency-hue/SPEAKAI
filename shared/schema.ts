import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  name: text("name"),
  avatar: text("avatar"),
  status: text("status").default("active"),
});

export const userCredits = pgTable("user_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  credits: integer("credits").default(0).notNull(),
  totalPurchased: integer("total_purchased").default(0).notNull(),
  totalUsed: integer("total_used").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // "purchase", "usage", "refund", "admin"
  amount: integer("amount").notNull(),
  description: text("description"),
  kiwifyPurchaseId: text("kiwify_purchase_id"),
  operationType: text("operation_type"), // "chat", "image", "prompt", "video"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserCredits = typeof userCredits.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
