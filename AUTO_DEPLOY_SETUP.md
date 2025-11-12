# 🚀 Cloudflare Workers 自动化部署设置指南

## 📋 概述

项目已配置 GitHub Actions 自动部署到 Cloudflare Workers。当您推送代码到 `main` 分支时，会自动构建并部署到生产环境和预发布环境。

## ✅ 已完成的配置

- ✅ GitHub Actions workflow 文件已创建
- ✅ 自动部署配置（推送到 main 分支时触发）
- ✅ 手动部署选项（可在 GitHub Actions 页面手动触发）
- ✅ 双环境部署（production 和 staging）

## 🔐 步骤 1：获取 Cloudflare 凭证

### 1.1 获取 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击右上角头像 → **"My Profile"**
3. 点击 **"API Tokens"** 标签
4. 点击 **"Create Token"**
5. 选择 **"Edit Cloudflare Workers"** 模板
6. 配置权限：
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **Workers KV Storage** → **Edit**（如果使用 KV）
   - **Account** → **Workers R2 Storage** → **Edit**（如果使用 R2）
7. 点击 **"Continue to summary"** → **"Create Token"**
8. **复制 Token**（只显示一次！请妥善保存）

### 1.2 获取 Account ID

1. 在 Cloudflare Dashboard 中
2. 选择您的账号（右侧边栏）
3. 复制 **"Account ID"**

## 🔑 步骤 2：设置 GitHub Secrets

1. 访问您的 GitHub 仓库：
   ```
   https://github.com/The-Feng/mastra-rag-chatbot
   ```

2. 点击 **Settings** → **Secrets and variables** → **Actions**

3. 点击 **"New repository secret"**，添加以下两个 secrets：

   **Secret 1：CLOUDFLARE_API_TOKEN**
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: 粘贴您刚才复制的 API Token
   - 点击 **"Add secret"**

   **Secret 2：CLOUDFLARE_ACCOUNT_ID**
   - **Name**: `CLOUDFLARE_ACCOUNT_ID`
   - **Value**: 粘贴您的 Account ID
   - 点击 **"Add secret"**

## 🚀 步骤 3：触发自动部署

### 方式 1：自动部署（推送到 main 分支）

推送代码到 `main` 分支后，GitHub Actions 会自动运行：

```bash
cd /Users/gjf/Desktop/project/jcyd-34/new-mastra
git add .
git commit -m "Update code"
git push origin main
```

### 方式 2：手动触发部署

1. 在 GitHub 仓库中
2. 点击 **Actions** 标签
3. 选择 **"Deploy to Cloudflare Workers"** workflow
4. 点击 **"Run workflow"**
5. 选择分支（通常是 `main`）
6. 点击 **"Run workflow"**

## 📊 步骤 4：查看部署状态

### 在 GitHub Actions 中查看

1. 进入仓库的 **Actions** 标签
2. 点击最新的 workflow run
3. 查看部署进度和日志
4. 绿色 ✅ 表示成功，红色 ❌ 表示失败

### 在 Cloudflare Dashboard 中查看

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 应该看到两个 Worker：
   - `mastra-agent`（生产环境）
   - `mastra-agent-staging`（预发布环境）
4. 点击 Worker 查看日志和统计

## ⚙️ 步骤 5：设置 Worker 环境变量

部署后，需要在 Cloudflare Dashboard 中手动设置环境变量：

### 在 Cloudflare Dashboard 设置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 选择 Worker（`mastra-agent` 或 `mastra-agent-staging`）
4. 点击 **Settings** → **Variables**
5. 在 **Environment Variables** 部分添加：
   - `OPENAI_API_KEY`: 您的 OpenAI API Key
   - `POSTGRES_URL`: 您的 PostgreSQL 连接字符串（Supabase 连接字符串）

**注意**：环境变量需要在部署后手动在 Cloudflare Dashboard 中设置，GitHub Actions 部署过程不会自动设置环境变量。

## 🔄 自动化部署流程

当您推送代码到 `main` 分支时，GitHub Actions 会自动执行：

1. ✅ **Checkout** - 检出代码
2. ✅ **Install pnpm** - 安装 pnpm 包管理器
3. ✅ **Setup Node.js** - 设置 Node.js 环境（版本 20）
4. ✅ **Install dependencies** - 安装项目依赖（使用 pnpm-lock.yaml）
5. ✅ **Build Worker** - 构建 Worker（运行 `pnpm run build:worker`）
6. ✅ **Deploy to Production** - 部署到生产环境（`mastra-agent`）
7. ✅ **Deploy to Staging** - 部署到预发布环境（`mastra-agent-staging`）

## 📝 Workflow 配置说明

### 自动部署 Workflow

**文件**: `.github/workflows/deploy-cloudflare.yml`

**触发条件**:
- 推送到 `main` 分支
- 手动触发（workflow_dispatch）

**部署环境**:
- Production: `mastra-agent`
- Staging: `mastra-agent-staging`

### 手动部署 Workflow

**文件**: `.github/workflows/deploy-cloudflare-manual.yml`

**触发条件**:
- 仅手动触发

**功能**:
- 可以选择部署到 production 或 staging 环境

## 🐛 常见问题

### Q1: 部署失败，提示 "Authentication failed"

**原因**: GitHub Secrets 未设置或设置错误

**解决**:
1. 检查 GitHub Secrets 是否正确设置
2. 确认 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` 都存在
3. 确认 API Token 有正确的权限

### Q2: 构建失败，提示找不到依赖

**原因**: `pnpm-lock.yaml` 未提交或依赖配置错误

**解决**:
1. 确保 `pnpm-lock.yaml` 已提交到 Git
2. 检查 `package.json` 中的依赖是否正确
3. 在本地运行 `pnpm install` 确保依赖正常

### Q3: Worker 部署成功但无法访问

**原因**: 环境变量未设置

**解决**:
1. 在 Cloudflare Dashboard 中设置环境变量
2. 或使用 `wrangler secret put` 命令设置
3. 确认环境变量名称正确（`OPENAI_API_KEY`, `POSTGRES_URL`）

### Q4: 部署到错误的 Worker

**原因**: `wrangler.toml` 配置错误

**解决**:
1. 检查 `wrangler.toml` 中的环境配置
2. 确认 `[env.production]` 和 `[env.staging]` 的 `name` 字段正确

## ✅ 验证清单

部署前确认：
- [ ] GitHub Secrets 已设置（`CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`）
- [ ] `pnpm-lock.yaml` 已提交到 Git
- [ ] `.github/workflows/` 目录已提交到 Git
- [ ] 代码已推送到 `main` 分支

部署后确认：
- [ ] GitHub Actions workflow 运行成功
- [ ] Cloudflare Dashboard 中看到 Worker 已部署
- [ ] Worker 环境变量已设置
- [ ] Worker 可以正常访问和运行

## 🎯 快速开始

1. **设置 GitHub Secrets**（5 分钟）
   - 获取 Cloudflare API Token 和 Account ID
   - 在 GitHub 仓库中设置 Secrets

2. **推送代码**（1 分钟）
   ```bash
   git push origin main
   ```

3. **设置环境变量**（2 分钟）
   - 在 Cloudflare Dashboard 中设置：
   - Workers & Pages → 选择 Worker → Settings → Variables
   - 添加 `OPENAI_API_KEY` 和 `POSTGRES_URL`

4. **完成！** 🎉
   - GitHub Actions 会自动部署
   - 在 Cloudflare Dashboard 中查看部署状态

## 📚 相关文档

- [GITHUB_DEPLOY.md](./GITHUB_DEPLOY.md) - GitHub 上传与部署完整指南
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - GitHub Actions 详细设置
- [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) - Cloudflare Workers 部署指南

## 🎉 完成！

设置完成后，每次推送代码到 `main` 分支，GitHub Actions 会自动：
- ✅ 构建 Worker
- ✅ 部署到生产环境
- ✅ 部署到预发布环境

无需手动操作，完全自动化！🚀

