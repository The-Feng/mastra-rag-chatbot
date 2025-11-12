import { Pool, Client } from "pg";

// 创建全局连接池（单例模式）
let pool: Pool | null = null;

// 获取数据库连接池
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error("POSTGRES_URL environment variable is not set. Please set the database connection string, e.g.: postgresql://postgres:postgres@localhost:5432/mastra_rag");
    }
    
    pool = new Pool({
      connectionString,
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000, // 空闲连接超时时间
      connectionTimeoutMillis: 2000, // 连接超时时间
    });

    // 处理连接错误
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  
  return pool;
}

export async function ensureVectorDB() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("POSTGRES_URL environment variable is not set. Please set the database connection string, e.g.: postgresql://postgres:postgres@localhost:5432/mastra_rag");
  }
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
  } catch (error) {
    throw new Error(`Unable to connect to database: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  // Ensure pgvector extension exists
  await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

  // Create vector table
  await client.query(`
    CREATE TABLE IF NOT EXISTS docs (
      id TEXT PRIMARY KEY,
      text TEXT,
      vector vector(1536),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Add created_at column (if table exists but doesn't have this column)
  try {
    await client.query(`
      ALTER TABLE docs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
  } catch (error) {
    // Ignore error (column may already exist)
  }
  
  // Create index for created_at to improve retrieval performance
  try {
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_docs_created_at ON docs(created_at DESC);
    `);
  } catch (error) {
    // Ignore error
  }

  // Create index for metadata->>'uploadedAt' to improve query performance
  try {
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_docs_uploaded_at ON docs((metadata->>'uploadedAt'));
    `);
  } catch (error) {
    // Ignore error
  }

  console.log("✅ pgvector database table is ready");
  await client.end();
}

