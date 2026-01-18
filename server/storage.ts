import { 
  type User, 
  type InsertUser, 
  users, 
  userCredits, 
  creditTransactions, 
  creditsEvents,
  pendingPurchases // ✅ importar schema da tabela nova
} from "@shared/schema";
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

    // Criação das tabelas (se não existirem)
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

      -- ✅ Nova tabela para compras pendentes
      CREATE TABLE IF NOT EXISTS pending_purchases (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        purchase_id TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        product_id TEXT,
        credits INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        used BOOLEAN DEFAULT false
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
  logWebhookEvent(
    purchaseId: string,
    userId: string,
    credits: number,
    productId?: string,
    productName?: string,
    rawPayload?: any
  ): Promise<void>;

  // ✅ Novos métodos para fluxo compra antes do cadastro
  addPendingPurchase(data: { purchaseId: string; email: string; productId: string; credits: number; status: string }): Promise<void>;
  findPendingPurchasesByEmail(email: string): Promise<any[]>;
  markPendingAsUsed(purchaseId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ... (outros métodos já implementados)

  async addPendingPurchase(data: { purchaseId: string; email: string; productId: string; credits: number; status: string }) {
    const database = await getDb();
    await database.insert(pendingPurchases).values({
      purchase_id: data.purchaseId,
      email: data.email,
      product_id: data.productId,
      credits: data.credits,
      status: data.status,
    });
  }

  async findPendingPurchasesByEmail(email: string) {
    const database = await getDb();
    const result = await database
      .select()
      .from(pendingPurchases)
      .where(eq(pendingPurchases.email, email))
      .where(eq(pendingPurchases.used, false));
    return result;
  }

  async markPendingAsUsed(purchaseId: string) {
    const database = await getDb();
    await database
      .update(pendingPurchases)
      .set({ used: true })
      .where(eq(pendingPurchases.purchase_id, purchaseId));
  }
}

export const storage = new DatabaseStorage();
