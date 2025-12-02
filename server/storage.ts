import { type User, type InsertUser, users, userCredits } from "@shared/schema";
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
  addCredits(userId: string, amount: number): Promise<any>;
  deductCredits(userId: string, amount: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const database = await getDb();
      const user = await database.select().from(users).where(eq(users.id, id)).limit(1);
      console.log(`🔍 getUser(${id}):`, !!user[0]);
      return user[0];
    } catch (error) {
      console.error("getUser error:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const database = await getDb();
      const user = await database.select().from(users).where(eq(users.username, username)).limit(1);
      console.log(`🔍 getUserByUsername(${username}):`, !!user[0]);
      return user[0];
    } catch (error) {
      console.error("getUserByUsername error:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const database = await getDb();
      const user = await database.select().from(users).where(eq(users.email, email)).limit(1);
      console.log(`🔍 getUserByEmail(${email}):`, !!user[0]);
      return user[0];
    } catch (error) {
      console.error("getUserByEmail error:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const database = await getDb();
      const result = await database.insert(users).values(insertUser).returning();
      console.log("✅ User created:", { id: result[0]?.id, username: insertUser.username });
      return result[0];
    } catch (error) {
      console.error("createUser error:", error);
      throw error;
    }
  }

  async updateUserAvatar(id: string, avatar: string): Promise<User | undefined> {
    try {
      const database = await getDb();
      const result = await database.update(users).set({ avatar }).where(eq(users.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("updateUserAvatar error:", error);
      return undefined;
    }
  }

  async updateUserProfile(id: string, data: { name: string; email: string }): Promise<User | undefined> {
    try {
      const database = await getDb();
      const result = await database.update(users).set(data).where(eq(users.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("updateUserProfile error:", error);
      return undefined;
    }
  }

  async updateUserPassword(id: string, password: string): Promise<User | undefined> {
    try {
      const database = await getDb();
      const result = await database.update(users).set({ password }).where(eq(users.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("updateUserPassword error:", error);
      return undefined;
    }
  }

  async getUserCredits(userId: string) {
    try {
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
    } catch (error) {
      console.error("getUserCredits error:", error);
      return null;
    }
  }

  async addCredits(userId: string, amount: number) {
    try {
      const database = await getDb();
      let credits = await database.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

      if (!credits[0]) {
        // Create new credit entry
        const result = await database
          .insert(userCredits)
          .values({
            userId,
            credits: amount,
            totalPurchased: amount,
            totalUsed: 0,
          })
          .returning();
        return {
          credits: result[0].credits,
          totalUsed: result[0].totalUsed,
          totalPurchased: result[0].totalPurchased,
        };
      }

      // Update existing
      const updated = credits[0].credits + amount;
      const result = await database
        .update(userCredits)
        .set({
          credits: updated,
          totalPurchased: (credits[0].totalPurchased || 0) + amount,
        })
        .where(eq(userCredits.userId, userId))
        .returning();

      return {
        credits: result[0].credits,
        totalUsed: result[0].totalUsed,
        totalPurchased: result[0].totalPurchased,
      };
    } catch (error) {
      console.error("addCredits error:", error);
      return null;
    }
  }

  async deductCredits(userId: string, amount: number) {
    try {
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

      return {
        credits: result[0].credits,
        totalUsed: result[0].totalUsed,
        totalPurchased: result[0].totalPurchased,
      };
    } catch (error) {
      console.error("deductCredits error:", error);
      return null;
    }
  }
}

export const storage = new DatabaseStorage();
