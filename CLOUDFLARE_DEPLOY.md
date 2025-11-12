# Cloudflare Workers 部署指南

本指南將幫助您將 Mastra Agent 部署到 Cloudflare Workers。

## 📋 前置要求

1. **Cloudflare 帳號**：如果您還沒有，請在 [cloudflare.com](https://www.cloudflare.com/) 註冊
2. **Node.js**：版本 >= 20.9.0
3. **Wrangler CLI**：Cloudflare Workers 的命令行工具（將通過 npm 安裝）

## 🚀 快速開始

### 1. 安裝依賴

```bash
pnpm install
# 或
npm install
```

### 2. 登錄 Cloudflare

```bash
npx wrangler login
```

這會打開瀏覽器，讓您登錄 Cloudflare 帳號並授權 Wrangler。

### 3. 配置環境變量

在 Cloudflare Dashboard 中設置環境變量，或使用 `wrangler.toml` 文件：

#### 方法 1：使用 Wrangler CLI（推薦）

```bash
# 設置 OpenAI API Key
npx wrangler secret put OPENAI_API_KEY

# 設置 PostgreSQL 連接字符串
npx wrangler secret put POSTGRES_URL
```

#### 方法 2：在 wrangler.toml 中配置（不推薦，因為會暴露敏感信息）

編輯 `wrangler.toml` 文件，取消註釋並填寫：

```toml
[vars]
OPENAI_API_KEY = "your-api-key"
POSTGRES_URL = "your-postgres-url"
```

**注意**：不建議將敏感信息直接寫在配置文件中，請使用 `wrangler secret` 命令。

### 4. 構建 Worker

```bash
pnpm run build:worker
# 或
npm run build:worker
```

### 5. 本地測試（可選）

```bash
pnpm run dev:worker
# 或
npm run dev:worker
```

這會在本地啟動一個開發服務器，您可以在 `http://localhost:8787` 測試您的 Worker。

### 6. 部署到 Cloudflare

```bash
# 部署到生產環境
pnpm run deploy:worker
# 或
npm run deploy:worker

# 部署到預發布環境
pnpm run deploy:worker:staging
# 或
npm run deploy:worker:staging
```

## 📝 配置說明

### wrangler.toml 配置項

- `name`: Worker 的名稱
- `main`: Worker 的入口文件（構建後的 dist/worker.js）
- `compatibility_date`: 兼容性日期
- `compatibility_flags`: 兼容性標誌（啟用 nodejs_compat 以支持 Node.js API）

### 環境變量

必須設置以下環境變量：

- `OPENAI_API_KEY`: OpenAI API 密鑰
- `POSTGRES_URL`: PostgreSQL 數據庫連接字符串

## ⚠️ 重要注意事項

### 1. PostgreSQL 連接限制

Cloudflare Workers 不支持直接的 TCP 連接，因此 PostgreSQL 連接可能需要：

- **選項 A**：使用支持 HTTP 的 PostgreSQL 代理（如 [PostgREST](https://postgrest.org/) 或 [Supabase](https://supabase.com/)）
- **選項 B**：使用 Cloudflare D1（SQLite）替代 PostgreSQL
- **選項 C**：使用外部 API 服務來處理數據庫操作

### 2. 文件處理限制

Workers 環境中：
- 不支持文件系統操作（`fs` 模塊）
- 不支持 `tmpdir` 等系統路徑
- 不支持 `exec` 等子進程操作

如果您的代碼使用了這些功能，需要：
- 使用內存處理替代文件系統
- 使用 Web API（如 `FormData`）處理文件上傳
- 移除對 `exec` 的依賴

### 3. 靜態文件服務

Workers 主要用於 API 端點。對於前端 HTML/CSS/JS 文件，建議：

- **選項 A**：使用 Cloudflare Pages 部署前端
- **選項 B**：將靜態文件存儲在 R2 或其他 CDN
- **選項 C**：在 Worker 中內嵌簡單的 HTML（不推薦用於複雜應用）

### 4. 依賴大小限制

Workers 有 10MB 的捆綁大小限制。如果您的依賴過大：

- 使用 `--external` 標誌排除不需要打包的模塊
- 考慮使用動態導入
- 拆分 Worker 為多個較小的 Worker

## 🔧 故障排除

### 構建錯誤

如果遇到構建錯誤：

```bash
# 清理構建緩存
rm -rf dist node_modules/.cache

# 重新安裝依賴
pnpm install

# 重新構建
pnpm run build:worker
```

### 部署錯誤

如果部署失敗：

1. 檢查是否已登錄：`npx wrangler whoami`
2. 檢查環境變量是否設置：`npx wrangler secret list`
3. 查看詳細錯誤日誌

### 運行時錯誤

如果 Worker 運行時出錯：

1. 查看 Cloudflare Dashboard 中的日誌
2. 使用 `wrangler tail` 實時查看日誌：

```bash
npx wrangler tail
```

## 📚 相關資源

- [Cloudflare Workers 文檔](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文檔](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Workers 限制](https://developers.cloudflare.com/workers/platform/limits/)

## 🎯 下一步

部署成功後：

1. 在 Cloudflare Dashboard 中查看 Worker 的 URL
2. 測試 API 端點（`/api/chat`, `/api/upload`, `/api/image`, `/api/health`）
3. 設置自定義域名（可選）
4. 配置速率限制和安全性（可選）

## 💡 提示

- 使用 `wrangler dev` 進行本地開發和調試
- 使用 `wrangler tail` 實時查看生產環境日誌
- 定期更新依賴以獲得安全修復和新功能
- 考慮使用 Cloudflare 的 Analytics 來監控 Worker 性能

