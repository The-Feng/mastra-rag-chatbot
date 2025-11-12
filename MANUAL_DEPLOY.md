# 🔧 手动部署到 Cloudflare Workers

如果 GitHub Actions 还没有运行，或者您想先手动部署一次，请按照以下步骤操作。

## 📋 前置要求

1. **Cloudflare 账号**：已注册并登录
2. **Node.js**：版本 >= 20.9.0
3. **项目依赖**：已安装

## 🚀 手动部署步骤

### 步骤 1：登录 Cloudflare

```bash
cd /Users/gjf/Desktop/project/jcyd-34/new-mastra

# 登录 Cloudflare（会打开浏览器）
npx wrangler login
```

这会打开浏览器，让您登录 Cloudflare 账号并授权 Wrangler。

### 步骤 2：安装依赖（如果还没有）

```bash
pnpm install
```

### 步骤 3：构建 Worker

```bash
pnpm run build:worker
```

这会生成 `dist/worker.js` 文件。

### 步骤 4：部署到生产环境

```bash
# 部署到生产环境（mastra-agent）
pnpm run deploy:worker
# 或
npx wrangler deploy --env production
```

### 步骤 5：部署到预发布环境（可选）

```bash
# 部署到预发布环境（mastra-agent-staging）
pnpm run deploy:worker:staging
# 或
npx wrangler deploy --env staging
```

## ⚙️ 设置环境变量

部署后，需要在 Cloudflare Dashboard 中设置环境变量：

### 在 Cloudflare Dashboard 设置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 选择 Worker（`mastra-agent` 或 `mastra-agent-staging`）
4. 点击 **Settings** → **Variables**
5. 在 **Environment Variables** 部分添加：
   - `OPENAI_API_KEY`: 您的 OpenAI API Key
   - `POSTGRES_URL`: 您的 PostgreSQL 连接字符串

**注意**：环境变量需要在部署后手动在 Cloudflare Dashboard 中设置，不会在部署过程中自动设置。

## ✅ 验证部署

### 1. 在 Cloudflare Dashboard 查看

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 应该看到：
   - `mastra-agent`（生产环境）
   - `mastra-agent-staging`（预发布环境，如果部署了）

### 2. 测试 Worker

部署成功后，您会得到一个 URL，例如：
```
https://mastra-agent.YOUR_SUBDOMAIN.workers.dev
```

测试健康检查端点：
```bash
curl https://mastra-agent.YOUR_SUBDOMAIN.workers.dev/api/health
```

## 🐛 常见问题

### Q1: 部署失败，提示 "Authentication required"

**解决**：
```bash
npx wrangler login
```

### Q2: 构建失败

**解决**：
1. 确保依赖已安装：`pnpm install`
2. 检查 Node.js 版本：`node --version`（需要 >= 20.9.0）
3. 查看构建错误信息

### Q3: 部署成功但 Worker 无法运行

**解决**：
1. 检查环境变量是否设置
2. 查看 Worker 日志：在 Cloudflare Dashboard 中点击 Worker → Logs
3. 使用 `npx wrangler tail` 实时查看日志

### Q4: 找不到 dist/worker.js

**解决**：
```bash
# 先构建
pnpm run build:worker

# 确认文件存在
ls -la dist/worker.js
```

## 📝 完整命令序列

```bash
# 1. 进入项目目录
cd /Users/gjf/Desktop/project/jcyd-34/new-mastra

# 2. 登录 Cloudflare
npx wrangler login

# 3. 安装依赖
pnpm install

# 4. 构建 Worker
pnpm run build:worker

# 5. 部署到生产环境
pnpm run deploy:worker

# 6. 在 Cloudflare Dashboard 中设置环境变量
# 访问 Workers & Pages → 选择 Worker → Settings → Variables
```

## 🎯 下一步

部署成功后：
1. ✅ 在 Cloudflare Dashboard 中查看 Worker
2. ✅ 设置环境变量
3. ✅ 测试 API 端点
4. ✅ 配置 GitHub Actions 自动部署（参考 AUTO_DEPLOY_SETUP.md）

## 📚 相关文档

- [AUTO_DEPLOY_SETUP.md](./AUTO_DEPLOY_SETUP.md) - 自动化部署设置指南
- [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) - Cloudflare Workers 部署详细指南

