# Supabase 設置指南（圖文教程）

## 🎯 目標

設置 Supabase PostgreSQL 數據庫，用於存儲：
- 向量數據（文檔片段和嵌入向量）
- Agent 記憶（對話歷史）
- Mastra 工作流記錄

## 📋 前置要求

- Supabase 帳號（免費註冊）
- 5 分鐘時間

## 🚀 步驟 1：註冊 Supabase

### 1.1 訪問 Supabase

打開瀏覽器，訪問：**https://supabase.com**

### 1.2 註冊帳號

1. 點擊右上角 **"Start your project"** 或 **"Sign Up"**
2. 選擇登錄方式：
   - **GitHub**（推薦，最簡單）
   - **Email**（使用郵箱註冊）

### 1.3 創建組織（首次使用）

如果是第一次使用，需要創建組織：
- **Organization name**: 輸入組織名稱（如 `my-org`）
- 點擊 **"Create organization"**

## 📦 步驟 2：創建項目

### 2.1 新建項目

1. 在 Dashboard 中，點擊 **"New Project"** 按鈕
2. 或點擊左側邊欄的 **"Projects"** → **"New Project"**

### 2.2 填寫項目信息

填寫以下信息：

- **Name**: `mastra-rag`（或您喜歡的名稱）
- **Database Password**: 
  - ⚠️ **重要**：設置一個強密碼
  - 建議：至少 12 個字符，包含大小寫字母、數字和特殊字符
  - 💡 **記住這個密碼**，稍後會用到！
- **Region**: 選擇離您最近的區域
  - 推薦：`Southeast Asia (Singapore)`（亞洲用戶）
  - 或：`West US (N. California)`（美國用戶）

### 2.3 創建項目

1. 點擊 **"Create new project"**
2. 等待 2-3 分鐘，項目會自動創建
3. 創建完成後，會自動跳轉到項目 Dashboard

## 🔗 步驟 3：獲取連接字符串

### 3.1 進入設置頁面

1. 在 Supabase Dashboard 中，點擊左側邊欄的 **"Settings"**（齒輪圖標 ⚙️）
2. 點擊 **"Database"** 或 **"Connection Info"**

### 3.2 找到連接字符串（方法 1：直接複製）

在 **"Database"** 頁面中，查找以下部分：

- **"Connection string"** 或
- **"Connection Info"** 或
- **"Database URL"** 或
- **"Connection pooling"**

1. 找到 **"URI"** 或 **"Connection string"** 標籤
2. 點擊連接字符串右側的 **複製圖標** 📋
3. 連接字符串格式類似：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
4. 將 `[YOUR-PASSWORD]` 替換為您創建項目時設置的數據庫密碼

### 3.3 手動構建連接字符串（方法 2：如果找不到）

如果找不到現成的連接字符串，可以手動構建：

1. **獲取項目信息**：
   - 在 **"Database"** 頁面找到：
     - **Host**（主機名）：例如 `db.xxxxx.supabase.co`
     - **Port**（端口）：通常是 `5432`
     - **Database name**（數據庫名）：`postgres`
     - **User**（用戶名）：`postgres`
     - **Password**（密碼）：您創建項目時設置的密碼

2. **構建連接字符串**：
   ```
   postgresql://postgres:您的密碼@主機名:5432/postgres
   ```

   **示例**：
   ```
   postgresql://postgres:MyPassword123!@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```

### 3.4 獲取項目 URL（方法 3：從項目設置）

如果以上方法都找不到，可以從項目設置獲取：

1. 點擊左側 **"Settings"** → **"General"** 或 **"Project Settings"**
2. 找到 **"Reference ID"** 或 **"Project URL"**
3. 項目 URL 格式：`https://xxxxx.supabase.co`
4. 主機名格式：`db.xxxxx.supabase.co`（在項目 URL 前加上 `db.`）

**完整格式示例**：
```
postgresql://postgres:your-actual-password@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## 🔧 步驟 4：啟用 pgvector 擴展

### 4.1 打開 SQL Editor

1. 點擊左側邊欄的 **"SQL Editor"**
2. 點擊 **"New query"** 按鈕

### 4.2 執行 SQL 命令

1. 在編輯器中輸入：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. 點擊 **"Run"** 按鈕（或按 `Cmd/Ctrl + Enter`）
3. 您應該看到：**"Success. No rows returned"**

✅ 這表示 pgvector 擴展已成功啟用！

## ⚙️ 步驟 5：設置環境變量

### 5.1 使用自動設置腳本（推薦）

運行設置腳本：

```bash
# Node.js 版本（推薦）
node scripts/setup-supabase.js

# 或 Bash 版本
chmod +x scripts/setup-supabase.sh
./scripts/setup-supabase.sh
```

腳本會：
- 提示您輸入 Supabase 連接信息
- 自動創建 `.env` 文件
- 可選：設置 Cloudflare Workers 環境變量

### 5.2 手動設置

#### 本地開發（.env 文件）

1. 在項目根目錄創建 `.env` 文件：

```bash
touch .env
```

2. 編輯 `.env` 文件，添加：

```bash
# Supabase PostgreSQL 連接字符串
POSTGRES_URL=postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here
```

#### Cloudflare Workers

```bash
# 設置 PostgreSQL 連接字符串
npx wrangler secret put POSTGRES_URL
# 然後粘貼連接字符串

# 設置 OpenAI API Key
npx wrangler secret put OPENAI_API_KEY
# 然後粘貼 API Key
```

#### AWS Lambda

在 `serverless.yml` 中設置：

```yaml
provider:
  environment:
    POSTGRES_URL: ${env:POSTGRES_URL}
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}
```

或在環境變量中設置：

```bash
export POSTGRES_URL=postgresql://...
export OPENAI_API_KEY=sk-...
```

## ✅ 步驟 6：測試連接

### 6.1 運行應用

```bash
# 安裝依賴（如果還沒安裝）
pnpm install

# 運行服務器
pnpm server
```

### 6.2 檢查連接

如果看到以下消息，說明連接成功：

```
✅ pgvector database table is ready
🚀 Server running on http://localhost:3000
```

### 6.3 驗證數據庫表

在 Supabase Dashboard 中：

1. 點擊左側 **"Table Editor"**
2. 您應該看到 `docs` 表（如果已運行過應用）
3. 表結構應該包含：
   - `id` (TEXT)
   - `text` (TEXT)
   - `vector` (vector(1536))
   - `metadata` (JSONB)
   - `created_at` (TIMESTAMP)

## 🎉 完成！

您的 Supabase 數據庫已經設置完成！

## 📝 下一步

1. **設置 OpenAI API Key**
   - 在 `.env` 文件中設置 `OPENAI_API_KEY`
   - 或使用 `npx wrangler secret put OPENAI_API_KEY`

2. **測試文件上傳**
   - 訪問 `http://localhost:3000`
   - 上傳一個文檔測試

3. **部署到 Cloudflare Workers**
   ```bash
   pnpm run deploy:worker
   ```

## 🐛 常見問題

### Q: 連接失敗怎麼辦？

**A:** 檢查以下幾點：
1. 連接字符串中的密碼是否正確
2. Supabase 項目是否已創建完成
3. 網絡連接是否正常
4. 是否啟用了 pgvector 擴展

### Q: 如何重置數據庫密碼？

**A:** 
1. 進入 Settings → Database
2. 點擊 "Reset database password"
3. 設置新密碼
4. 更新 `.env` 文件中的連接字符串

### Q: 免費層級的限制是什麼？

**A:**
- 數據庫大小：500MB
- API 請求：50,000 次/月
- 存儲：1GB
- 帶寬：2GB/月

對於中小型項目，免費層級完全足夠！

### Q: 如何查看數據庫使用情況？

**A:**
1. 進入 Settings → Usage
2. 查看數據庫大小、API 請求等統計

## 📚 相關資源

- [Supabase 官方文檔](https://supabase.com/docs)
- [pgvector 文檔](https://github.com/pgvector/pgvector)
- [DATABASE_DEPLOYMENT.md](./DATABASE_DEPLOYMENT.md) - 詳細部署說明

## 💡 提示

1. **備份密碼**：將數據庫密碼保存在安全的地方
2. **定期備份**：Supabase 會自動備份，但建議定期導出數據
3. **監控使用量**：定期檢查使用情況，避免超出免費層級
4. **安全**：不要在代碼中硬編碼密碼，使用環境變量

---

需要幫助？查看 [DATABASE_DEPLOYMENT.md](./DATABASE_DEPLOYMENT.md) 獲取更多信息！

