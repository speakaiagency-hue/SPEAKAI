import { 
  type User, 
  type InsertUser, 
  users, 
  userCredits, 
  creditTransactions, 
  creditsEvents 
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";

let db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!db) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    db = drizzle(pool);

    // Create tables if they don't exist
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

      CREATE TABLE IF NOT EXISTS credits_events (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id VARCHAR NOT NULL UNIQUE,
        user_id VARCHAR NOT NULL,
        product_id VARCHAR,
        product_name TEXT,
        credits_applied INTEGER NOT NULL,
        raw_payload JSON,
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
  getUserCredits(userId: string): Promise<any>;
  addCredits(userId: string, amount: number, purchaseId?: string): Promise<any>;
  deductCredits(userId: string, amount: number): Promise<any>;
  hasProcessedPurchase(purchaseId: string): Promise<any>;
  logWebhookEvent(purchaseId: string, userId: string, credits: number, productId?: string, productName?: string, rawPayload?: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ... seus métodos já existentes (getUser, getUserByEmail, etc)

  async addCredits(userId: string, amount: number, purchaseId?: string) {
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

      // registra transação
      await database.insert(creditTransactions).values({
        userId,
        type: "purchase",
        amount,
        kiwifyPurchaseId: purchaseId,
        description: "Créditos adicionados via Kiwify",
      });

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

    // registra transação
    await database.insert(creditTransactions).values({
      userId,
      type: "purchase",
      amount,
      kiwifyPurchaseId: purchaseId,
      description: "Créditos adicionados via Kiwify",
    });

    return result[0];
  }

  async hasProcessedPurchase(purchaseId: string) {
    const database = await getDb();
    const event = await database.select().from(creditsEvents).where(eq(creditsEvents.eventId, purchaseId)).limit(1);
    return event[0] || null;
  }

  async logWebhookEvent(purchaseId: string, userId: string, credits: number, productId?: string, productName?: string, rawPayload?: any) {
    const database = await getDb();
    await database.insert(creditsEvents).values({
      eventId: purchaseId,
      userId,
      productId,
      productName,
      creditsApplied: credits,
      rawPayload,
    });
  }
}

export const storage = new DatabaseStorage();
