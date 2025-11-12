# GitHub Actions 自動化部署設置指南

## ✅ 使用 pnpm 不會有問題！

**好消息**：使用 pnpm 在本地開發，通過 GitHub Actions 部署到 Cloudflare Workers **完全沒問題**！

我已經為您配置好了：
- ✅ GitHub Actions workflow 使用 pnpm
- ✅ wrangler.toml 已更新為使用 pnpm
- ✅ 正確的緩存配置

## 🚀 快速設置（5 分鐘）

### 步驟 1：獲取 Cloudflare API Token

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

### 步驟 2：獲取 Account ID

1. 在 Cloudflare Dashboard 中
2. 選擇您的帳號（右側邊欄）
3. 複製 **"Account ID"**

### 步驟 3：設置 GitHub Secrets

1. 在 GitHub 倉庫中
2. 點擊 **Settings** → **Secrets and variables** → **Actions**
3. 點擊 **"New repository secret"**
4. 添加以下 secrets：

   - **Name**: `CLOUDFLARE_API_TOKEN`
     **Value**: 您剛才複製的 API Token

   - **Name**: `CLOUDFLARE_ACCOUNT_ID`
     **Value**: 您的 Account ID

### 步驟 4：推送代碼

```bash
git add .
git commit -m "Add GitHub Actions workflow"
git push origin main
```

GitHub Actions 會自動運行並部署！

## 📋 Workflow 說明

### 自動部署（推送到 main 分支）

當您推送代碼到 `main` 分支時，會自動：
1. ✅ 安裝 pnpm
2. ✅ 安裝依賴（使用 `pnpm-lock.yaml`）
3. ✅ 構建 Worker
4. ✅ 部署到生產環境
5. ✅ 同時部署到預發布環境

### 手動部署

您也可以在 GitHub Actions 頁面手動觸發部署：
1. 進入 **Actions** 標籤
2. 選擇 **"Deploy to Cloudflare Workers (Manual)"**
3. 點擊 **"Run workflow"**
4. 選擇環境（production 或 staging）

## 🔧 配置詳解

### GitHub Actions Workflow

已創建的 workflow 文件：
- `.github/workflows/deploy-cloudflare.yml` - 自動部署
- `.github/workflows/deploy-cloudflare-manual.yml` - 手動部署

**關鍵配置**：

```yaml
# 使用 pnpm
- name: Install pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8

# 安裝依賴（使用 pnpm-lock.yaml）
- name: Install dependencies
  run: pnpm install --frozen-lockfile

# 構建 Worker
- name: Build Worker
  run: pnpm run build:worker
```

### wrangler.toml

已更新為使用 pnpm：

```toml
[build]
command = "pnpm run build:worker"
```

### .npmrc

創建了 `.npmrc` 文件確保 pnpm 配置正確。

## ✅ 驗證部署

### 檢查 GitHub Actions

1. 在 GitHub 倉庫中
2. 點擊 **Actions** 標籤
3. 查看最新的 workflow run
4. 應該看到 ✅ 綠色標記表示成功

### 檢查 Cloudflare Dashboard

1. 登錄 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Workers & Pages**
3. 應該看到您的 Worker 已部署
4. 點擊 Worker 查看日誌和統計

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

### Q: 本地使用 pnpm，但 CI 使用 npm？

**A:** 不會發生！workflow 已配置使用 pnpm：
- 使用 `pnpm/action-setup@v2` 安裝 pnpm
- 使用 `pnpm install` 安裝依賴
- 使用 `pnpm run build:worker` 構建

## 💡 最佳實踐

### 1. 提交 pnpm-lock.yaml

確保 `pnpm-lock.yaml` 已提交到 Git：

```bash
git add pnpm-lock.yaml
git commit -m "Add pnpm-lock.yaml"
```

### 2. 使用 --frozen-lockfile

在 CI 中使用 `--frozen-lockfile` 確保依賴版本一致：

```yaml
run: pnpm install --frozen-lockfile
```

### 3. 設置 Node.js 版本

確保本地和 CI 使用相同的 Node.js 版本：

```yaml
node-version: '20'  # 與 package.json 中的 engines 一致
```

### 4. 使用緩存加速構建

Workflow 已配置 pnpm 緩存，會自動加速構建。

## 📝 環境變量設置

### 在 Cloudflare Dashboard 設置

1. 進入 **Workers & Pages** → 選擇您的 Worker
2. 點擊 **Settings** → **Variables**
3. 添加環境變量：
   - `OPENAI_API_KEY`
   - `POSTGRES_URL`

### 或使用 Wrangler CLI

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put POSTGRES_URL
```

## 🎯 總結

✅ **使用 pnpm 完全沒問題！**

已為您配置：
- ✅ GitHub Actions 使用 pnpm
- ✅ wrangler.toml 使用 pnpm
- ✅ 正確的緩存配置
- ✅ 自動和手動部署選項

**下一步**：
1. 設置 GitHub Secrets
2. 推送代碼
3. 自動部署！

需要幫助？查看 workflow 文件或 Cloudflare 文檔。

