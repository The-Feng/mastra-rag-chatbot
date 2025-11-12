# Mastra RAG Chatbot

智能文檔問答助手，基於 Mastra 框架和 RAG（檢索增強生成）技術。

## 功能特性

- 📄 **文檔上傳與處理**：支持 PDF、Word (.docx, .doc) 和純文本文件
- 💬 **智能問答**：基於上傳文檔內容回答問題
- 📝 **自動總結**：上傳文檔後自動生成總結
- 🖼️ **圖片分析**：分析上傳的圖片並提供詳細描述
- 🔄 **流式響應**：實時流式輸出回答內容

## 安裝依賴

```bash
pnpm install
# 或
npm install
```

## 環境變量配置

創建 `.env` 文件並設置以下環境變量：

```bash
# PostgreSQL 數據庫連接字符串
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/mastra_rag

# OpenAI API Key
OPENAI_API_KEY=your-api-key-here
```

## 數據庫設置

1. 確保 PostgreSQL 已安裝並運行
2. 安裝 pgvector 擴展：
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. 運行應用程序時，`ensureVectorDB()` 會自動創建必要的表和索引

## 運行項目

### 方式 1：使用 Mastra CLI（開發模式）

```bash
pnpm dev
# 或
npm run dev
```

這會啟動 Mastra 的開發服務器，可以在 Mastra Playground 中測試 workflows 和 agents。

### 方式 2：使用自定義服務器（帶頁面界面）

```bash
# 安裝依賴（如果還沒安裝）
pnpm install

# 運行服務器
pnpm server
# 或開發模式（自動重載）
pnpm server:dev
```

然後在瀏覽器中打開 `http://localhost:3000` 訪問聊天界面。

## 項目結構

```
new-mastra/
├── src/
│   └── mastra/
│       ├── agents/          # Agents（RAG Agent, Weather Agent）
│       ├── tools/           # Tools（RAG tools, document tools, image tools）
│       ├── workflows/       # Workflows（RAG workflows, weather workflow）
│       ├── prompts/         # Prompts（RAG prompts, image prompts）
│       ├── db.ts            # 數據庫配置
│       ├── rag.ts           # RAG 核心功能
│       ├── image.ts         # 圖片分析
│       ├── workflow-executor.ts  # Workflow 執行器
│       └── index.ts         # Mastra 實例註冊
├── public/
│   └── index.html          # 前端頁面
├── server.ts               # Express 服務器
└── package.json
```

## API 端點

### POST /api/chat
發送聊天消息，獲取流式響應。

**請求體：**
```json
{
  "query": "您的問題"
}
```

**響應：** 流式文本響應

### POST /api/upload
上傳文檔文件。

**請求體：** multipart/form-data
- `file`: 文件（PDF, Word, 或文本文件）

**響應：**
```json
{
  "success": true,
  "count": 100,
  "summary": "文檔總結...",
  "message": "成功導入 100 個文檔片段"
}
```

### POST /api/image
上傳圖片進行分析。

**請求體：** multipart/form-data
- `file`: 圖片文件

**響應：**
```json
{
  "success": true,
  "description": "圖片描述...",
  "message": "圖片分析完成"
}
```

### GET /api/health
健康檢查端點。

## 使用說明

1. **上傳文檔**：點擊「上傳文件」按鈕，選擇要上傳的文檔
2. **查看總結**：上傳完成後，系統會自動生成文檔總結
3. **提問**：在輸入框中輸入關於文檔的問題，點擊「發送」或按 Enter 鍵
4. **查看回答**：AI 會基於文檔內容實時流式輸出回答

## 注意事項

1. **數據庫連接**：確保 PostgreSQL 數據庫已正確配置並可訪問
2. **pgvector 擴展**：數據庫必須安裝 pgvector 擴展
3. **文件處理**：`.doc` 格式需要系統安裝 `antiword` 工具
   - macOS: `brew install antiword`
   - Linux: `sudo apt-get install antiword` 或 `sudo yum install antiword`
4. **API Keys**：確保 OpenAI API Key 已正確配置

## 技術棧

- **框架**：Mastra
- **數據庫**：PostgreSQL + pgvector
- **AI SDK**：Vercel AI SDK (@ai-sdk/openai)
- **服務器**：Express.js
- **前端**：原生 HTML/CSS/JavaScript

## 開發

### 修復的問題

1. **RAG Agent 工具調用問題**：
   - 改進了 Agent 的 instructions，明確要求必須使用工具
   - 優化了工具描述，確保 Agent 知道何時使用哪個工具

2. **頁面實現**：
   - 創建了完整的 HTML 頁面界面
   - 實現了 Express 服務器處理 API 請求
   - 支持流式響應和文件上傳

## 部署到 Cloudflare Workers

### 使用 GitHub Actions 自動部署

項目已配置 GitHub Actions 自動部署到 Cloudflare Workers。

#### 設置步驟

1. **獲取 Cloudflare API Token**
   - 登錄 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 點擊右上角頭像 → **"My Profile"** → **"API Tokens"**
   - 點擊 **"Create Token"** → 選擇 **"Edit Cloudflare Workers"** 模板
   - 配置權限後創建並複製 Token

2. **獲取 Account ID**
   - 在 Cloudflare Dashboard 中選擇您的帳號
   - 複製 **"Account ID"**

3. **設置 GitHub Secrets**
   - 在 GitHub 倉庫中：**Settings** → **Secrets and variables** → **Actions**
   - 添加以下 secrets：
     - `CLOUDFLARE_API_TOKEN`: 您的 API Token
     - `CLOUDFLARE_ACCOUNT_ID`: 您的 Account ID

4. **推送代碼**
   ```bash
   git add .
   git commit -m "Add GitHub Actions workflow"
   git push origin main
   ```

推送後，GitHub Actions 會自動構建並部署到 Cloudflare Workers。

#### 部署環境

- **生產環境** (`mastra-agent`): 推送到 `main` 分支時自動部署
- **預發布環境** (`mastra-agent-staging`): 推送到 `main` 分支時自動部署

#### 手動部署

也可以在 GitHub Actions 頁面手動觸發部署：
1. 進入 **Actions** 標籤
2. 選擇 **"Deploy to Cloudflare Workers (Manual)"**
3. 點擊 **"Run workflow"**
4. 選擇環境（production 或 staging）

#### 設置環境變量

部署後，需要在 Cloudflare Dashboard 中手動設置環境變量：

1. 登錄 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Workers & Pages**
3. 選擇 Worker（`mastra-agent` 或 `mastra-agent-staging`）
4. 點擊 **Settings** → **Variables**
5. 在 **Environment Variables** 部分添加：
   - `OPENAI_API_KEY`: 您的 OpenAI API Key
   - `POSTGRES_URL`: 您的 PostgreSQL 連接字符串

**注意**：環境變量需要在部署後手動在 Cloudflare Dashboard 中設置，不會在部署過程中自動設置。

詳細說明請參考：
- [AUTO_DEPLOY_SETUP.md](./AUTO_DEPLOY_SETUP.md) - 🚀 **自动化部署设置指南（推荐）**
- [GITHUB_DEPLOY.md](./GITHUB_DEPLOY.md) - GitHub 上傳與部署完整指南
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - GitHub Actions 詳細設置
- [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) - Cloudflare Workers 部署指南

## 許可證

ISC

