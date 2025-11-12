# 🚀 GitHub 上傳與自動部署指南

## 📋 概述

本指南將幫助您：
1. 將項目上傳到 GitHub
2. 配置自動部署到 Cloudflare Workers
3. 設置必要的 Secrets

## 🎯 快速開始

### 步驟 1：初始化 Git 倉庫（如果還沒有）

```bash
cd /Users/gjf/Desktop/project/jcyd-34/new-mastra

# 初始化 Git（如果還沒有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Mastra RAG Chatbot"
```

### 步驟 2：在 GitHub 創建倉庫

1. 訪問 [GitHub](https://github.com)
2. 點擊右上角 **"+"** → **"New repository"**
3. 填寫倉庫信息：
   - **Repository name**: `mastra-rag-chatbot`（或您喜歡的名稱）
   - **Description**: `智能文檔問答助手，基於 Mastra 框架和 RAG 技術`
   - **Visibility**: Public 或 Private
   - **不要**勾選 "Initialize with README"（我們已經有 README）
4. 點擊 **"Create repository"**

### 步驟 3：連接本地倉庫到 GitHub

```bash
# 添加遠程倉庫（替換 YOUR_USERNAME 為您的 GitHub 用戶名）
git remote add origin https://github.com/YOUR_USERNAME/mastra-rag-chatbot.git

# 推送代碼
git branch -M main
git push -u origin main
```

---

## 🔐 步驟 4：設置 Cloudflare Secrets

### 4.1 獲取 Cloudflare API Token

1. 登錄 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 點擊右上角頭像 → **"My Profile"**
3. 點擊 **"API Tokens"** 標籤
4. 點擊 **"Create Token"**
5. 選擇 **"Edit Cloudflare Workers"** 模板
6. 配置權限：
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **Workers KV Storage** → **Edit**（如果使用 KV）
   - **Account** → **Workers R2 Storage** → **Edit**（如果使用 R2）
7. 點擊 **"Continue to summary"** → **"Create Token"**
8. **複製 Token**（只顯示一次！）

### 4.2 獲取 Account ID

1. 在 Cloudflare Dashboard 中
2. 選擇您的帳號（右側邊欄）
3. 複製 **"Account ID"**

### 4.3 設置 GitHub Secrets

1. 在 GitHub 倉庫中
2. 點擊 **Settings** → **Secrets and variables** → **Actions**
3. 點擊 **"New repository secret"**
4. 添加以下 secrets：

   **Secret 1**：
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: 您剛才複製的 API Token

   **Secret 2**：
   - **Name**: `CLOUDFLARE_ACCOUNT_ID`
   - **Value**: 您的 Account ID

---

## 🚀 步驟 5：觸發自動部署

### 方式 1：自動部署（推送到 main 分支）

當您推送代碼到 `main` 分支時，會自動：
1. ✅ 安裝 pnpm
2. ✅ 安裝依賴
3. ✅ 構建 Worker
4. ✅ 部署到生產環境和預發布環境

```bash
# 修改代碼後
git add .
git commit -m "Update code"
git push origin main
```

### 方式 2：手動觸發部署

1. 在 GitHub 倉庫中
2. 點擊 **Actions** 標籤
3. 選擇 **"Deploy to Cloudflare Workers (Manual)"**
4. 點擊 **"Run workflow"**
5. 選擇環境（production 或 staging）
6. 點擊 **"Run workflow"**

---

## ✅ 驗證部署

### 檢查 GitHub Actions

1. 在 GitHub 倉庫中
2. 點擊 **Actions** 標籤
3. 查看最新的 workflow run
4. 應該看到 ✅ 綠色標記表示成功

### 檢查 Cloudflare Dashboard

1. 登錄 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Workers & Pages**
3. 應該看到您的 Worker 已部署：
   - `mastra-agent`（生產環境）
   - `mastra-agent-staging`（預發布環境）
4. 點擊 Worker 查看日誌和統計

---

## 🔧 配置環境變量

部署後，需要在 Cloudflare Workers 中設置環境變量：

### 方法 1：使用 Wrangler CLI（推薦）

```bash
# 設置 OpenAI API Key
npx wrangler secret put OPENAI_API_KEY --env production
# 然後粘貼您的 API Key

# 設置 PostgreSQL 連接字符串
npx wrangler secret put POSTGRES_URL --env production
# 然後粘貼您的 Supabase 連接字符串

# 同樣設置預發布環境
npx wrangler secret put OPENAI_API_KEY --env staging
npx wrangler secret put POSTGRES_URL --env staging
```

### 方法 2：在 Cloudflare Dashboard 設置

1. 進入 **Workers & Pages** → 選擇您的 Worker
2. 點擊 **Settings** → **Variables**
3. 添加環境變量：
   - `OPENAI_API_KEY`
   - `POSTGRES_URL`

---

## 📝 Workflow 說明

### 自動部署 Workflow

**觸發條件**：
- 推送到 `main` 分支
- 手動觸發（workflow_dispatch）

**執行步驟**：
1. Checkout 代碼
2. 安裝 pnpm
3. 設置 Node.js（版本 20）
4. 安裝依賴（使用 pnpm-lock.yaml）
5. 構建 Worker
6. 部署到生產環境
7. 部署到預發布環境

### 手動部署 Workflow

**觸發條件**：
- 僅手動觸發

**執行步驟**：
1. 選擇環境（production 或 staging）
2. 執行相同的構建和部署步驟

---

## 🐛 常見問題

### Q: 構建失敗，提示找不到 pnpm？

**A:** 確保 workflow 中包含：
```yaml
- name: Install pnpm
  uses: pnpm/action-setup@v2
```

### Q: 依賴安裝失敗？

**A:** 檢查：
1. `pnpm-lock.yaml` 是否已提交到 Git
2. `package.json` 中的依賴是否正確
3. 是否有私有包需要額外配置

### Q: 部署失敗，提示認證錯誤？

**A:** 檢查：
1. GitHub Secrets 是否正確設置
2. Cloudflare API Token 是否有正確權限
3. Account ID 是否正確

### Q: Worker 部署成功但無法訪問？

**A:** 檢查：
1. 環境變量是否設置（OPENAI_API_KEY, POSTGRES_URL）
2. Worker 日誌中是否有錯誤
3. 網絡連接是否正常

---

## 💡 最佳實踐

### 1. 提交 pnpm-lock.yaml

確保 `pnpm-lock.yaml` 已提交到 Git：

```bash
git add pnpm-lock.yaml
git commit -m "Add pnpm-lock.yaml"
```

### 2. 使用分支保護

在 GitHub 設置分支保護規則：
- 要求 PR 審查
- 要求通過 CI 檢查

### 3. 環境變量管理

- 使用 GitHub Secrets 存儲敏感信息
- 不要在代碼中硬編碼 API Keys
- 使用不同的環境變量區分生產和預發布環境

### 4. 監控部署

- 定期檢查 Cloudflare Dashboard 中的 Worker 日誌
- 設置告警通知
- 監控 API 使用量

---

## 📚 相關文檔

- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - 詳細的 GitHub Actions 設置指南
- [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) - Cloudflare Workers 部署指南
- [SETUP_DATABASE.md](./SETUP_DATABASE.md) - Supabase 數據庫設置指南

---

## 🎉 完成！

您的項目現在已經：
- ✅ 上傳到 GitHub
- ✅ 配置了自動部署
- ✅ 設置了必要的 Secrets

**下一步**：
1. 推送代碼到 GitHub
2. 設置 GitHub Secrets
3. 設置 Cloudflare Workers 環境變量
4. 自動部署！

需要幫助？查看相關文檔或 GitHub Actions 日誌。



