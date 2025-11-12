/**
 * Mastra 存儲配置
 * 將 Agent 數據持久化到 PostgreSQL
 */

import { PGStore } from '@mastra/pg';

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
  if (!connectionString) {
    // 如果沒有 PostgreSQL，回退到內存存儲
    const { LibSQLStore } = require('@mastra/libsql');
    return new LibSQLStore({
      url: ':memory:',
    });
  }

  return new PGStore({
    connectionString,
  });
}

/**
 * 創建 Agent 記憶存儲
 * 用於存儲 Agent 的對話歷史和上下文
 */
export function createAgentMemoryStorage() {
  if (!connectionString) {
    // 如果沒有 PostgreSQL，回退到文件存儲
    const { LibSQLStore } = require('@mastra/libsql');
    return new LibSQLStore({
      url: 'file:../mastra.db',
    });
  }

  return new PGStore({
    connectionString,
  });
}

