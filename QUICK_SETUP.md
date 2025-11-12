# 🚀 快速設置 Supabase（5 分鐘）

## 方法 1：使用自動設置腳本（推薦）⭐

### 步驟 1：運行設置腳本

```bash
pnpm run setup:supabase
```

或直接運行：

```bash
node scripts/setup-supabase.js
```

### 步驟 2：按照提示輸入信息

腳本會提示您輸入：
1. **Supabase 項目 URL**：例如 `https://xxxxx.supabase.co`
2. **數據庫密碼**：您在創建 Supabase 項目時設置的密碼
3. **數據庫端口**：默認 5432（直接回車即可）

### 步驟 3：完成！

腳本會自動：
- ✅ 創建 `.env` 文件
- ✅ 設置連接字符串
- ✅ 可選：設置 Cloudflare Workers 環境變量

---

## 方法 2：手動設置

### 步驟 1：註冊 Supabase

1. 訪問 https://supabase.com
2. 點擊 "Start your project"
3. 使用 GitHub 或 Email 註冊

### 步驟 2：創建項目

1. 點擊 "New Project"
2. 填寫：
   - **Name**: `mastra-rag`
   - **Database Password**: 設置強密碼（記住它！）
   - **Region**: 選擇離您最近的區域
3. 點擊 "Create new project"
4. 等待 2-3 分鐘創建完成

### 步驟 3：獲取連接字符串

1. 點擊左側 **Settings** → **Database**
2. 找到 **Connection string**
3. 選擇 **URI** 標籤
4. 複製連接字符串
5. 將 `[YOUR-PASSWORD]` 替換為您的實際密碼

### 步驟 4：啟用 pgvector

1. 點擊左側 **SQL Editor**
2. 點擊 **New query**
3. 輸入並執行：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 步驟 5：創建 .env 文件

```bash
# 複製示例文件
cp .env.example .env

# 編輯 .env 文件，填入您的連接字符串和 API Key
```

編輯 `.env` 文件：

```bash
POSTGRES_URL=postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
OPENAI_API_KEY=sk-your-openai-api-key-here
```

---

## ✅ 驗證設置

### 測試連接

```bash
# 運行服務器
pnpm server
```

如果看到以下消息，說明設置成功：

```
✅ pgvector database table is ready
🚀 Server running on http://localhost:3000
```

### 檢查數據庫

1. 在 Supabase Dashboard 中
2. 點擊 **Table Editor**
3. 應該能看到 `docs` 表（運行應用後會自動創建）

---

## 🎉 完成！

您的 Supabase 數據庫已經設置完成！

## 📝 下一步

1. **設置 OpenAI API Key**（如果還沒設置）
   - 在 `.env` 文件中設置 `OPENAI_API_KEY`
   - 或運行：`npx wrangler secret put OPENAI_API_KEY`（Cloudflare Workers）

2. **測試應用**
   ```bash
   pnpm server
   ```
   訪問 http://localhost:3000

3. **部署到 Cloudflare Workers**（可選）
   ```bash
   pnpm run deploy:worker
   ```

---

## 🐛 遇到問題？

查看詳細指南：[SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)

## 💡 提示

- **免費層級**：500MB 數據庫，完全免費
- **自動備份**：Supabase 每天自動備份
- **安全**：不要在代碼中硬編碼密碼

