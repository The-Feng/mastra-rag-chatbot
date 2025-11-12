# 數據庫表結構說明

## 📋 概述

項目中的數據庫表會**自動創建**，無需手動操作。當您首次運行應用時，系統會自動：

1. ✅ 啟用 pgvector 擴展
2. ✅ 創建 `docs` 表
3. ✅ 創建必要的索引

## 🔄 自動創建機制

### 觸發時機

表會在以下情況自動創建：

1. **首次上傳文檔時**
   - 當您調用 `ingestText()` 或 `ingestFile()` 函數時
   - 會自動調用 `ensureVectorDB()` 函數

2. **首次運行應用時**
   - 當應用首次連接到數據庫時
   - 會自動檢查並創建表

### 創建邏輯

`ensureVectorDB()` 函數（位於 `src/mastra/db.ts`）會執行：

```sql
-- 1. 啟用 pgvector 擴展
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 創建 docs 表
CREATE TABLE IF NOT EXISTS docs (
  id TEXT PRIMARY KEY,
  text TEXT,
  vector vector(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 添加 created_at 列（如果不存在）
ALTER TABLE docs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. 創建索引
CREATE INDEX IF NOT EXISTS idx_docs_created_at ON docs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_docs_uploaded_at ON docs((metadata->>'uploadedAt'));
```

## 📊 表結構

### `docs` 表

用於存儲文檔片段和向量嵌入：

| 列名 | 類型 | 說明 |
|------|------|------|
| `id` | TEXT | 主鍵，格式：`時間戳-來源-chunk索引` |
| `text` | TEXT | 文檔片段文本內容 |
| `vector` | vector(1536) | 文本的向量嵌入（1536 維） |
| `metadata` | JSONB | 元數據，包含來源、上傳時間等信息 |
| `created_at` | TIMESTAMP | 創建時間，默認當前時間 |

### 索引

1. **idx_docs_created_at**
   - 列：`created_at DESC`
   - 用途：優化按時間排序的查詢

2. **idx_docs_uploaded_at**
   - 列：`metadata->>'uploadedAt'`
   - 用途：優化按上傳時間檢索文檔

## 🚀 使用方式

### 方式 1：自動創建（推薦）

**無需任何操作**，直接運行應用：

```bash
# 運行服務器
pnpm server

# 或運行開發模式
pnpm dev
```

當您首次上傳文檔時，表會自動創建。

### 方式 2：手動執行 SQL（可選）

如果您想提前創建表，可以在 Supabase SQL Editor 中執行：

```sql
-- 1. 啟用 pgvector 擴展
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 創建 docs 表
CREATE TABLE IF NOT EXISTS docs (
  id TEXT PRIMARY KEY,
  text TEXT,
  vector vector(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 創建索引
CREATE INDEX IF NOT EXISTS idx_docs_created_at ON docs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_docs_uploaded_at ON docs((metadata->>'uploadedAt'));
```

## ✅ 驗證表是否創建成功

### 方法 1：查看應用日誌

運行應用後，如果看到以下消息，說明表已創建：

```
✅ pgvector database table is ready
```

### 方法 2：在 Supabase Dashboard 中查看

1. 登錄 Supabase Dashboard
2. 點擊左側 **"Table Editor"**
3. 應該能看到 `docs` 表
4. 點擊表名查看結構和數據

### 方法 3：使用 SQL 查詢

在 Supabase SQL Editor 中執行：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 查看 docs 表結構
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'docs';

-- 查看表數據數量
SELECT COUNT(*) FROM docs;
```

## 🔧 常見問題

### Q: 表沒有自動創建？

**A:** 檢查以下幾點：

1. **數據庫連接是否正常**
   ```bash
   # 檢查 .env 文件中的 POSTGRES_URL
   cat .env | grep POSTGRES_URL
   ```

2. **pgvector 擴展是否啟用**
   ```sql
   -- 在 Supabase SQL Editor 中執行
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **是否有足夠權限**
   - 確保數據庫用戶有創建表的權限
   - Supabase 默認用戶 `postgres` 有完整權限

### Q: 如何重置表？

**A:** 如果需要重新創建表：

```sql
-- ⚠️ 警告：這會刪除所有數據！
DROP TABLE IF EXISTS docs CASCADE;

-- 然後重新運行應用，表會自動創建
```

### Q: 如何修改表結構？

**A:** 修改 `src/mastra/db.ts` 中的 `ensureVectorDB()` 函數，然後：

1. 停止應用
2. 手動執行 SQL 修改表結構
3. 或刪除表後重新運行應用（會丟失數據）

### Q: 表創建失敗怎麼辦？

**A:** 檢查錯誤信息：

1. **pgvector 擴展未啟用**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **權限不足**
   - 確保使用正確的數據庫用戶
   - Supabase 使用 `postgres` 用戶

3. **連接字符串錯誤**
   - 檢查 `.env` 文件中的 `POSTGRES_URL`
   - 確保格式正確：`postgresql://postgres:密碼@主機:5432/postgres`

## 📝 總結

- ✅ **表會自動創建**，無需手動操作
- ✅ **首次上傳文檔時**會自動觸發
- ✅ **使用 `CREATE TABLE IF NOT EXISTS`**，安全且冪等
- ✅ **包含必要的索引**，優化查詢性能

只需確保：
1. 數據庫連接正常（`.env` 文件中的 `POSTGRES_URL`）
2. pgvector 擴展已啟用
3. 運行應用即可

需要幫助？查看 [SETUP_DATABASE.md](./SETUP_DATABASE.md) 獲取數據庫設置指南。


