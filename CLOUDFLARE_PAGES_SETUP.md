# Cloudflare Pages 部署指南

## 🎯 概述

将前端页面部署到 Cloudflare Pages，后端 API 部署到 Cloudflare Workers，实现前后端分离架构。

## 📋 架构说明

```
┌─────────────────┐         ┌──────────────────┐
│  Cloudflare     │  API    │  Cloudflare      │
│  Pages          │ ──────> │  Workers         │
│  (前端页面)      │         │  (后端 API)       │
└─────────────────┘         └──────────────────┘
     mastra-chatbot              mastra-agent
     .pages.dev                  .workers.dev
```

## 🚀 部署步骤

### 步骤 1: 设置 GitHub Secrets

在 GitHub 仓库中添加以下 Secrets：

1. **CLOUDFLARE_API_TOKEN**（已设置）
   - 用于部署 Workers 和 Pages

2. **CLOUDFLARE_ACCOUNT_ID**（已设置）
   - 你的 Cloudflare 账号 ID

3. **CLOUDFLARE_WORKER_URL**（新增）
   - 你的 Workers URL
   - 例如：`https://mastra-agent.your-subdomain.workers.dev`
   - 获取方式：部署 Workers 后，从输出中复制 URL

### 步骤 2: 部署 Workers（如果还没部署）

```bash
pnpm run build:worker
pnpm run deploy:worker
```

记录 Workers URL，稍后需要添加到 GitHub Secrets。

### 步骤 3: 配置 GitHub Secrets

1. 进入 GitHub 仓库
2. Settings → Secrets and variables → Actions
3. 添加 `CLOUDFLARE_WORKER_URL`：
   - Name: `CLOUDFLARE_WORKER_URL`
   - Value: 你的 Workers URL（例如：`https://mastra-agent.xxxx.workers.dev`）

### 步骤 4: 触发 Pages 部署

#### 方法 1: 自动部署（推送到 main）

```bash
git add .
git commit -m "Setup Cloudflare Pages deployment"
git push origin main
```

#### 方法 2: 手动触发

1. 在 GitHub 仓库页面
2. Actions → Deploy to Cloudflare Pages
3. Run workflow → Run workflow

## 🔧 配置说明

### 前端配置 (`public/config.js`)

```javascript
// 自动生成，根据环境变量设置
window.API_BASE_URL = 'https://mastra-agent.xxxx.workers.dev';
```

### Pages 项目名称

默认项目名称：`mastra-chatbot`

可以在 `.github/workflows/deploy-pages.yml` 中修改：

```yaml
projectName: mastra-chatbot  # 修改这里
```

### 自定义域名

部署后，可以在 Cloudflare Dashboard 中设置自定义域名：

1. 访问 Cloudflare Dashboard
2. Pages → `mastra-chatbot`
3. Custom domains → Add custom domain

## 📊 部署后的 URL

### Pages URL（前端）

```
https://mastra-chatbot.pages.dev
```

### Workers URL（后端 API）

```
https://mastra-agent.your-subdomain.workers.dev
```

## 🔗 连接 Pages 和 Workers

### 方法 1: 使用 Workers URL（推荐）

在 GitHub Secrets 中设置 `CLOUDFLARE_WORKER_URL`，前端会自动使用这个 URL 调用 API。

### 方法 2: 使用 Pages Functions（高级）

如果 Pages 和 Workers 在同一账号下，可以使用 Pages Functions 作为代理：

1. 创建 `functions/api/[[path]].js`：

```javascript
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const workerUrl = 'https://mastra-agent.xxxx.workers.dev';
  
  return fetch(`${workerUrl}${url.pathname}${url.search}`, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
  });
}
```

这样前端可以使用相对路径 `/api/chat`，Pages Functions 会自动代理到 Workers。

## ⚙️ 环境变量

### Pages 环境变量

在 Cloudflare Dashboard 中设置：

1. Pages → `mastra-chatbot` → Settings → Environment variables
2. 添加变量（如果需要）

### Workers 环境变量

在 Workers 中设置（已配置）：

- `OPENAI_API_KEY`
- `POSTGRES_URL`（如果需要）

## 🔍 验证部署

### 1. 检查 Pages 部署

访问：`https://mastra-chatbot.pages.dev`

应该看到聊天界面。

### 2. 检查 API 连接

打开浏览器开发者工具（F12）：
- Network 标签
- 发送一条消息
- 检查 API 请求是否成功

### 3. 检查 CORS

如果遇到 CORS 错误：

1. 确认 Workers 已设置 CORS 头
2. 检查 `CLOUDFLARE_WORKER_URL` 是否正确

## 🐛 故障排除

### 问题 1: API 调用失败

**症状**：页面加载正常，但发送消息时出错

**解决**：
1. 检查 `CLOUDFLARE_WORKER_URL` 是否正确
2. 检查 Workers 是否正常运行
3. 检查浏览器控制台的错误信息

### 问题 2: CORS 错误

**症状**：浏览器控制台显示 CORS 错误

**解决**：
1. 确认 Workers 代码中有 CORS 头设置
2. 检查 `Access-Control-Allow-Origin` 头

### 问题 3: Pages 部署失败

**症状**：GitHub Actions 部署失败

**解决**：
1. 检查 `CLOUDFLARE_API_TOKEN` 权限
2. 检查 `public` 目录是否存在
3. 查看 GitHub Actions 日志

## 📝 文件结构

```
new-mastra/
├── public/                    # Pages 部署目录
│   ├── index.html            # 前端页面
│   ├── config.js             # API 配置（自动生成）
│   └── _headers              # Pages 头文件
├── .github/
│   └── workflows/
│       ├── deploy-cloudflare.yml  # Workers 部署
│       └── deploy-pages.yml       # Pages 部署
└── src/
    └── worker-minimal.ts     # Workers 代码
```

## 🎯 最佳实践

### 1. 分离前后端

- ✅ Pages 只负责 UI
- ✅ Workers 只负责 API
- ✅ 通过配置连接两者

### 2. 环境管理

- 开发环境：使用本地服务器
- 生产环境：使用 Cloudflare Pages + Workers

### 3. 安全

- ✅ API Token 存储在 GitHub Secrets
- ✅ 环境变量不暴露在代码中
- ✅ CORS 正确配置

## 🔄 更新部署

### 更新前端

```bash
# 修改 public/index.html
git add public/
git commit -m "Update frontend"
git push origin main
```

Pages 会自动重新部署。

### 更新后端

```bash
# 修改 src/worker-minimal.ts
pnpm run build:worker
pnpm run deploy:worker
```

或推送到 main，GitHub Actions 会自动部署。

## 📚 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

## ✅ 检查清单

- [ ] Workers 已部署并运行正常
- [ ] 获取 Workers URL
- [ ] 在 GitHub Secrets 中添加 `CLOUDFLARE_WORKER_URL`
- [ ] 推送代码触发 Pages 部署
- [ ] 访问 Pages URL 验证
- [ ] 测试 API 连接
- [ ] 设置自定义域名（可选）

---

**部署完成后，你的应用将拥有：**
- 🎨 美观的前端界面（Cloudflare Pages）
- ⚡ 高性能的 API 服务（Cloudflare Workers）
- 🔄 自动部署（GitHub Actions）

🎉 **享受你的全栈应用！**

