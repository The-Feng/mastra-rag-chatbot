# 🚀 快速开始指南

## ✅ 当前状态

你的 `mastra-agent` Worker 已经配置好了：
- ✅ 精简版 Worker（526KB，适合免费计划）
- ✅ 完整的聊天界面页面
- ✅ GitHub Actions 自动部署配置

## 📋 需要完成的步骤

### 1. 设置 Cloudflare API Token（用于 GitHub Actions）

**详细步骤**：查看 `CLOUDFLARE_API_TOKEN_SETUP.md`

**快速步骤**：
1. 访问 https://dash.cloudflare.com/profile/api-tokens
2. 创建 Token（使用 "Edit Cloudflare Workers" 模板）
3. 复制 Token
4. 在 GitHub 仓库：Settings → Secrets → Actions
5. 添加两个 secrets：
   - `CLOUDFLARE_API_TOKEN` = 你的 Token
   - `CLOUDFLARE_ACCOUNT_ID` = 你的 Account ID（Dashboard 右侧）

### 2. 本地部署（测试）

```bash
# 1. 构建
pnpm run build:worker

# 2. 部署
pnpm run deploy:worker
```

### 3. 设置环境变量

部署成功后：
1. 访问 Cloudflare Dashboard
2. Workers & Pages → `mastra-agent`
3. Settings → Variables
4. 添加：`OPENAI_API_KEY` = 你的 OpenAI API Key

### 4. 访问页面

打开浏览器访问：
```
https://mastra-agent.你的子域名.workers.dev
```

你会看到一个漂亮的聊天界面！💬

## 🎯 功能说明

### 当前精简版包含：

✅ **聊天界面**：
- 美观的 Web UI
- 实时流式响应
- Markdown 格式支持
- 移动端友好

✅ **API 端点**：
- `POST /api/chat` - 聊天接口
- `GET /health` - 健康检查

❌ **未包含**（需要完整版）：
- 文件上传
- RAG 文档问答
- 图像分析

## 🔄 自动部署

设置好 GitHub Secrets 后：

```bash
git add .
git commit -m "Deploy to Cloudflare Workers"
git push origin main
```

GitHub Actions 会自动部署！

## 📚 相关文档

- `CLOUDFLARE_API_TOKEN_SETUP.md` - API Token 设置指南
- `FINAL_DEPLOY.md` - 完整部署说明
- `DEPLOY_INSTRUCTIONS.md` - 部署指令
- `README.md` - 项目主文档

---

**现在就开始设置吧！** 🎉

