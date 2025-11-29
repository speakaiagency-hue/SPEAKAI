import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

let db: ReturnType<typeof drizzle> | null = null;

export async function initializeDatabase() {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    db = drizzle(pool);
    console.log("✅ Database connected");
  }

  return db;
}

export async function getDatabase() {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}
