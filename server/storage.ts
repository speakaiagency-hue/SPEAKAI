import { type User, type InsertUser, users, userCredits, creditTransactions } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";

let db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!db) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    db = drizzle(pool);

    // ✅ Garantir que as tabelas existam
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        name TEXT,
        avatar TEXT,
        status TEXT DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS user_credits (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        credits INTEGER NOT NULL DEFAULT 0,
        total_purchased INTEGER NOT NULL DEFAULT 0,
        total_used INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS credit_transactions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        description TEXT,
        kiwify_purchase_id TEXT,
        operation_type TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
  }
  return db;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserAvatar(id: string, avatar: string): Promise<User | undefined>;
  updateUserProfile(id: string, data: { name: string; email: string }): Promise<User | undefined>;
  updateUserPassword(id: string, password: string): Promise<User | undefined>;
  getUserCredits(userId: string): Promise<{ credits: number; totalUsed: number; totalPurchased: number } | null>;
  addCredits(userId: string, amount: number): Promise<any>;
  deductCredits(userId: string, amount: number): Promise<any>;

  // 👇 novos métodos para idempotência de compras
  hasProcessedPurchase(purchaseId: string): Promise<boolean>;
  markPurchaseProcessed(purchaseId: string, userId?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const database = await getDb();
    const user = await database.select().from(users).where(eq(users.id, id)).limit(1);
    return user[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const database = await getDb();
    const user = await database.select().from(users).where(eq(users.username, username)).limit(1);
    return user[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const database = await getDb();
    const user = await database.select().from(users).where(eq(users.email, email)).limit(1);
    return user[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const database = await getDb();
    const result = await database.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserAvatar(id: string, avatar: string): Promise<User | undefined> {
    const database = await getDb();
    const result = await database.update(users).set({ avatar }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async updateUserProfile(id: string, data: { name: string; email: string }): Promise<User | undefined> {
    const database = await getDb();
    const result = await database.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }

  async updateUserPassword(id: string, password: string): Promise<User | undefined> {
    const database = await getDb();
    const result = await database.update(users).set({ password }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getUserCredits(userId: string) {
    const database = await getDb();
    const credits = await database.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
    if (credits[0]) {
      return {
        credits: credits[0].credits,
        totalUsed: credits[0].totalUsed,
        totalPurchased: credits[0].totalPurchased,
      };
    }
    return null;
  }

  async addCredits(userId: string, amount: number) {
    const database = await getDb();
    let credits = await database.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

    if (!credits[0]) {
      const result = await database
        .insert(userCredits)
        .values({
          userId,
          credits: amount,
          totalPurchased: amount,
          totalUsed: 0,
        })
        .returning();
      return result[0];
    }

    const updated = credits[0].credits + amount;
    const result = await database
      .update(userCredits)
      .set({
        credits: updated,
        totalPurchased: (credits[0].totalPurchased || 0) + amount,
      })
      .where(eq(userCredits.userId, userId))
      .returning();

    return result[0];
  }

  async deductCredits(userId: string, amount: number) {
    const database = await getDb();
    const credits = await database.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

    if (!credits[0] || credits[0].credits < amount) {
      return null;
    }

    const updated = credits[0].credits - amount;
    const result = await database
      .update(userCredits)
      .set({
        credits: updated,
        totalUsed: (credits[0].totalUsed || 0) + amount,
      })
      .where(eq(userCredits.userId, userId))
      .returning();

    return result[0];
  }

  async hasProcessedPurchase(purchaseId: string): Promise<boolean> {
    const database = await getDb();
    const tx = await database
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.kiwifyPurchaseId, purchaseId))
      .limit(1);

    return !!tx[0];
  }

  async markPurchaseProcessed(purchaseId: string, userId?: string): Promise<void> {
    const database = await getDb();
    await database.insert(creditTransactions).values({
      userId: userId || "system",
      type: "purchase",
      amount: 0,
      description: "Compra processada",
      kiwifyPurchaseId: purchaseId,
      operationType: "processed",
    });
  }
}

export const storage = new DatabaseStorage();
