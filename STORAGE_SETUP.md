# 雲端存儲設置指南

## 📋 概述

本指南說明如何配置雲端存儲來保存：
1. **用戶上傳的文件**（文檔、圖片）
2. **Agent 數據**（向量數據、記憶、工作流記錄）

## 🎯 快速開始

### Cloudflare R2 方案（適用於 Cloudflare Workers）

#### 1. 創建 R2 Bucket

```bash
# 使用 Wrangler CLI
npx wrangler r2 bucket create mastra-files
```

#### 2. 配置 wrangler.toml

```toml
[[r2_buckets]]
binding = "FILES"
bucket_name = "mastra-files"
```

#### 3. 更新 Worker 代碼

在 `src/worker.ts` 中使用 R2：

```typescript
import { uploadFileToR2 } from './storage/r2-storage.js';

// 在 handleUpload 函數中
if (env.FILES) {
  const { key } = await uploadFileToR2(
    env.FILES,
    arrayBuffer,
    file.name || 'unknown',
    file.type || 'application/octet-stream'
  );
  console.log(`📤 File uploaded to R2: ${key}`);
}
```

#### 4. 啟用雲端存儲

在調用 API 時，設置 `saveToCloud: true`：

```typescript
// 在 worker.ts 中
const result = await executeIngestAndSummarize({
  fileBuffer,
  fileName: file.name || 'unknown',
  fileType: file.type || 'application/octet-stream',
  saveToCloud: true, // 啟用雲端存儲
});
```

---

## 📊 Agent 數據持久化

### PostgreSQL 存儲配置

Agent 數據會自動持久化到 PostgreSQL（如果配置了 `POSTGRES_URL`）：

1. **Mastra 存儲**：工作流執行記錄、評分數據
2. **Agent 記憶**：對話歷史、上下文
3. **向量數據**：文檔片段和嵌入向量

#### 配置步驟

1. **設置環境變量**

```bash
export POSTGRES_URL=postgresql://user:password@host:5432/database
```

2. **數據庫會自動創建表**

當您運行應用時，Mastra 會自動創建必要的表。

3. **驗證存儲**

檢查數據庫中是否有以下表：
- `mastra_storage` - Mastra 工作流數據
- `agent_memory` - Agent 記憶
- `docs` - 向量數據（已存在）

---

## 🔧 使用示例

### 上傳文件並保存到雲端

```typescript
// worker.ts
const result = await executeIngestAndSummarize({
  fileBuffer,
  fileName: file.name || 'unknown',
  fileType: file.type || 'application/octet-stream',
  saveToCloud: true, // 啟用雲端存儲
});

// 結果包含雲端存儲信息
return new Response(
  JSON.stringify({
    success: true,
    count: result.count,
    summary: result.summary,
    cloudStorage: result.cloudStorage, // { key, url }
  }),
  { headers: { 'Content-Type': 'application/json' } }
);
```

### 從雲端獲取文件

```typescript
// Cloudflare R2
import { getFileFromR2 } from './storage/r2-storage.js';

// 獲取文件
const fileBuffer = await getFileFromR2(env.FILES, 'uploads/1234567890-document.pdf');
```

---

## 📁 文件結構

```
src/
├── storage/
│   └── r2-storage.ts      # Cloudflare R2 適配器
├── mastra/
│   ├── storage-config.ts  # 持久化存儲配置
│   └── ...
```

---

## 💰 成本估算

### Cloudflare R2
- **存儲**：$0.015/GB/月
- **請求**：免費（前 1000 萬次/月）
- **傳輸**：免費（無出口費用）

**示例**：1000 個文件，每個 1MB，每月訪問 10,000 次
- 存儲：1GB × $0.015 = $0.015/月
- 請求：免費
- **總計**：約 $0.015/月

---

## 🔄 數據備份策略

### 自動備份到雲存儲

1. **PostgreSQL 備份**
   - Supabase：自動備份（內置）

2. **文件備份**
   - 定期將 R2 中的文件複製到備份桶
   - 使用版本控制保留歷史版本

3. **數據庫導出**
   ```bash
   # 導出向量數據
   pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -t docs > backup.sql
   ```

---

## ✅ 檢查清單

### Cloudflare Workers 部署
- [ ] 創建 R2 bucket
- [ ] 配置 wrangler.toml
- [ ] 更新 worker.ts 使用 R2
- [ ] 測試文件上傳

### Agent 數據持久化
- [ ] 設置 POSTGRES_URL
- [ ] 驗證數據庫連接
- [ ] 檢查表是否自動創建
- [ ] 測試 Agent 記憶持久化

---

## 🐛 故障排除

### R2 上傳失敗

1. **檢查 wrangler.toml 配置**
   ```toml
   [[r2_buckets]]
   binding = "FILES"
   bucket_name = "mastra-files"
   ```

2. **檢查 Worker 綁定**
   ```typescript
   // 確保 env.FILES 存在
   console.log('R2 binding:', env.FILES);
   ```

### Agent 數據未持久化

1. **檢查 POSTGRES_URL**
   ```bash
   echo $POSTGRES_URL
   ```

2. **檢查數據庫連接**
   ```typescript
   import { getPool } from './mastra/db.js';
   const pool = getPool();
   await pool.query('SELECT NOW()');
   ```

3. **檢查表是否存在**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

---

## 📚 相關文檔

- [Cloudflare R2 文檔](https://developers.cloudflare.com/r2/)
- [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) - 詳細部署指南

---

## 💡 提示

1. **文件命名**：使用時間戳確保唯一性
2. **清理策略**：定期清理舊文件以節省成本
3. **監控**：設置 R2 Analytics 監控使用量
