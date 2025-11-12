# 🚀 Cloudflare Pages 快速部署指南

## ✅ 已完成配置

我已经为你配置好了 Cloudflare Pages 部署：

1. ✅ 创建了 GitHub Actions 工作流 (`.github/workflows/deploy-pages.yml`)
2. ✅ 更新了前端代码，支持动态 API URL
3. ✅ 创建了配置文件 (`public/config.js`)
4. ✅ 添加了安全头文件 (`public/_headers`)

## 📋 立即部署步骤

### 步骤 1: 部署 Workers（如果还没部署）

```bash
pnpm run build:worker
pnpm run deploy:worker
```

**记录 Workers URL**，例如：
```
https://mastra-agent.your-subdomain.workers.dev
```

### 步骤 2: 添加 GitHub Secret

1. 进入你的 GitHub 仓库
2. **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加：
   - **Name**: `CLOUDFLARE_WORKER_URL`
   - **Value**: 你的 Workers URL（例如：`https://mastra-agent.xxxx.workers.dev`）
5. 点击 **Add secret**

### 步骤 3: 触发 Pages 部署

#### 方法 1: 推送代码（自动）

```bash
git add .
git commit -m "Setup Cloudflare Pages deployment"
git push origin main
```

#### 方法 2: 手动触发

1. 在 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择 **Deploy to Cloudflare Pages**
4. 点击 **Run workflow** → **Run workflow**

## 🎯 部署后的 URL

### Pages URL（前端）

```
https://mastra-chatbot.pages.dev
```

### Workers URL（后端 API）

```
https://mastra-agent.your-subdomain.workers.dev
```

## ✨ 功能说明

### 前端（Cloudflare Pages）

- ✅ 完整的聊天界面
- ✅ 文件上传功能
- ✅ 图片分析功能
- ✅ Markdown 渲染
- ✅ 代码高亮
- ✅ 响应式设计

### 后端（Cloudflare Workers）

- ✅ 聊天 API (`/api/chat`)
- ✅ 文件上传 API (`/api/upload`)
- ✅ 图片分析 API (`/api/image`)
- ✅ 健康检查 (`/health`)

## 🔧 配置说明

### API URL 配置

前端会自动从 `config.js` 读取 API URL：

```javascript
// 自动生成，根据 GitHub Secret 设置
window.API_BASE_URL = 'https://mastra-agent.xxxx.workers.dev';
```

如果未设置 `CLOUDFLARE_WORKER_URL`，则使用相对路径（适用于 Pages Functions 代理）。

## 🔍 验证部署

### 1. 检查 Pages 部署状态

- GitHub Actions → Deploy to Cloudflare Pages → 查看运行状态
- 或访问 Cloudflare Dashboard → Pages → `mastra-chatbot`

### 2. 访问页面

打开浏览器访问：
```
https://mastra-chatbot.pages.dev
```

### 3. 测试功能

1. **发送消息**：输入问题并发送
2. **上传文件**：点击上传按钮，选择文件
3. **查看响应**：检查消息是否正确显示

### 4. 检查 API 连接

打开浏览器开发者工具（F12）：
- **Network** 标签
- 发送消息或上传文件
- 检查 API 请求是否成功

## 🐛 常见问题

### 问题 1: API 调用失败

**症状**：页面正常，但发送消息时出错

**解决**：
1. 检查 `CLOUDFLARE_WORKER_URL` 是否正确设置
2. 检查 Workers 是否正常运行
3. 查看浏览器控制台的错误信息

### 问题 2: CORS 错误

**症状**：浏览器控制台显示 CORS 错误

**解决**：
1. 确认 Workers 代码中有 CORS 头设置
2. 检查 `Access-Control-Allow-Origin` 头

### 问题 3: Pages 部署失败

**症状**：GitHub Actions 部署失败

**解决**：
1. 检查 `CLOUDFLARE_API_TOKEN` 权限
2. 确认 `public` 目录存在
3. 查看 GitHub Actions 日志

## 📝 文件说明

- `.github/workflows/deploy-pages.yml` - Pages 部署工作流
- `public/config.js` - API 配置文件（自动生成）
- `public/index.html` - 前端页面（已更新，支持动态 API URL）
- `public/_headers` - Pages 安全头文件

## 🎉 完成！

部署成功后，你将拥有：

- 🎨 **美观的前端界面**（Cloudflare Pages）
- ⚡ **高性能的 API 服务**（Cloudflare Workers）
- 🔄 **自动部署**（GitHub Actions）

**详细说明请查看** `CLOUDFLARE_PAGES_SETUP.md`

---

**现在就添加 `CLOUDFLARE_WORKER_URL` secret 并推送代码吧！** 🚀

