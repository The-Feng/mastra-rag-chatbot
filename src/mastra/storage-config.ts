/**
 * Mastra 存儲配置
 * 將 Agent 數據持久化到 PostgreSQL
 */

import { LibSQLStore } from '@mastra/libsql';

// 獲取 PostgreSQL 連接字符串
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.warn('⚠️ POSTGRES_URL not set, using in-memory storage');
}

/**
 * 創建持久化的 Mastra 存儲
 * 用於存儲 observability、scores 等數據
 */
export function createPersistentStorage() {
  // 在 Cloudflare Workers 中，使用 LibSQLStore 作為存儲
  // 如果需要 PostgreSQL，可以在 Workers 環境中使用外部連接
  return new LibSQLStore({
    url: connectionString ? `file:${connectionString}` : ':memory:',
  });
}

/**
 * 創建 Agent 記憶存儲
 * 用於存儲 Agent 的對話歷史和上下文
 */
export function createAgentMemoryStorage() {
  // 在 Cloudflare Workers 中，使用 LibSQLStore 作為存儲
  return new LibSQLStore({
    url: connectionString ? `file:${connectionString}` : ':memory:',
  });
}

