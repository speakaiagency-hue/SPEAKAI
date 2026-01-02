import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

let db: ReturnType<typeof drizzle> | null = null;
let pool: Pool | null = null;

export async function initializeDatabase() {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("❌ DATABASE_URL environment variable is required");
    }

    try {
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      });

      db = drizzle(pool);

      console.log(`✅ Database connected: ${databaseUrl}`);
    } catch (error) {
      console.error("🔥 Erro ao conectar no banco de dados:", error);
      throw error;
    }
  }

  return db;
}

export async function getDatabase() {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

// ➕ Função opcional para encerrar conexão (útil em testes ou shutdown)
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log("🛑 Database connection closed");
    db = null;
    pool = null;
  }
}
