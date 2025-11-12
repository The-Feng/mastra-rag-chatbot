# 🔗 如何获取 CLOUDFLARE_WORKER_URL

## 📋 什么是 CLOUDFLARE_WORKER_URL？

这是你的 Cloudflare Workers 部署后的访问 URL，格式通常是：
```
https://mastra-agent.your-subdomain.workers.dev
```

## 🚀 获取方法

### 方法 1: 从部署输出中获取（推荐）

#### 步骤 1: 部署 Workers

```bash
cd /Users/gjf/Desktop/project/jcyd-34/new-mastra

# 构建并部署
pnpm run build:worker
pnpm run deploy:worker
```

#### 步骤 2: 查看部署输出

部署成功后会显示类似这样的输出：

```
⛅️ wrangler 4.47.0
───────────────────
Total Upload: 526.60 KiB / gzip: ~115 KiB
Published mastra-agent (X.XX sec)
  https://mastra-agent.your-subdomain.workers.dev  ← 这就是你的 Worker URL
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**复制这个 URL**，例如：
```
https://mastra-agent.gjf20001001.workers.dev
```

### 方法 2: 从 Cloudflare Dashboard 获取

#### 步骤 1: 登录 Cloudflare Dashboard

1. 访问：https://dash.cloudflare.com/
2. 登录你的账号

#### 步骤 2: 找到 Workers

1. 在左侧菜单点击 **Workers & Pages**
2. 找到你的 Worker：`mastra-agent`
3. 点击进入

#### 步骤 3: 查看 URL

在 Worker 详情页面，你会看到：

- **Workers URL**: `https://mastra-agent.your-subdomain.workers.dev`
- 或者点击 **View** 按钮查看完整 URL

### 方法 3: 使用 Wrangler CLI 查询

```bash
# 查看已部署的 Workers
npx wrangler deployments list

# 或者查看 Worker 信息
npx wrangler whoami
```

### 方法 4: 从 GitHub Actions 日志获取

如果使用 GitHub Actions 自动部署：

1. 进入 GitHub 仓库 → **Actions**
2. 找到最新的 **Deploy to Cloudflare Workers** 运行
3. 点击查看日志
4. 在日志中查找类似这样的输出：
   ```
   Published mastra-agent
     https://mastra-agent.your-subdomain.workers.dev
   ```

## 📝 URL 格式说明

### 标准格式

```
https://[worker-name].[subdomain].workers.dev
```

### 示例

- `https://mastra-agent.gjf20001001.workers.dev`
- `https://mastra-agent.abc123.workers.dev`
- `https://mastra-agent.workers.dev`（如果使用默认子域名）

### 各部分说明

- `mastra-agent` - 你的 Worker 名称（在 `wrangler.toml` 中定义）
- `gjf20001001` - 你的 Cloudflare 账号子域名（自动生成）
- `workers.dev` - Cloudflare Workers 域名

## 🔧 设置到 GitHub Secrets

### 步骤 1: 复制 Worker URL

从上述任一方法获取完整的 Worker URL，例如：
```
https://mastra-agent.gjf20001001.workers.dev
```

### 步骤 2: 添加到 GitHub Secrets

1. **进入 GitHub 仓库**
2. **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 填写：
   - **Name**: `CLOUDFLARE_WORKER_URL`
   - **Value**: 粘贴你的 Worker URL（例如：`https://mastra-agent.gjf20001001.workers.dev`）
5. 点击 **Add secret**

### 步骤 3: 验证

确认 Secret 已添加：
- ✅ `CLOUDFLARE_API_TOKEN`
- ✅ `CLOUDFLARE_ACCOUNT_ID`
- ✅ `CLOUDFLARE_WORKER_URL` ← 新添加的

## ⚠️ 重要提示

### 1. URL 必须完整

✅ **正确**：
```
https://mastra-agent.gjf20001001.workers.dev
```

❌ **错误**：
```
mastra-agent.gjf20001001.workers.dev  （缺少 https://）
https://mastra-agent.gjf20001001.workers.dev/  （末尾不要斜杠）
```

### 2. 不要包含路径

✅ **正确**：
```
https://mastra-agent.gjf20001001.workers.dev
```

❌ **错误**：
```
https://mastra-agent.gjf20001001.workers.dev/api/chat
```

### 3. 环境区分

如果你有多个环境：

- **生产环境**: `https://mastra-agent.your-subdomain.workers.dev`
- **预发布环境**: `https://mastra-agent-staging.your-subdomain.workers.dev`

通常使用生产环境的 URL。

## 🧪 验证 Worker URL

### 方法 1: 浏览器访问

在浏览器中打开 Worker URL：
```
https://mastra-agent.your-subdomain.workers.dev
```

应该看到：
- 如果 Worker 有页面：显示页面内容
- 如果只有 API：可能显示错误或 JSON 响应

### 方法 2: 测试健康检查端点

```bash
curl https://mastra-agent.your-subdomain.workers.dev/health
```

应该返回：
```json
{"status":"ok","version":"1.0.0"}
```

### 方法 3: 测试 API 端点

```bash
curl -X POST https://mastra-agent.your-subdomain.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'
```

## 🔄 如果 Worker URL 改变了

如果重新部署后 URL 改变了：

1. **获取新的 URL**（使用上述任一方法）
2. **更新 GitHub Secret**：
   - Settings → Secrets → Actions
   - 找到 `CLOUDFLARE_WORKER_URL`
   - 点击 **Update**
   - 粘贴新的 URL
   - 保存

## 📋 快速检查清单

- [ ] Workers 已成功部署
- [ ] 从部署输出或 Dashboard 获取了 Worker URL
- [ ] URL 格式正确（包含 `https://`，不包含路径）
- [ ] 已添加到 GitHub Secrets 作为 `CLOUDFLARE_WORKER_URL`
- [ ] 已验证 URL 可以访问（浏览器或 curl）

## 🎯 完整示例

假设你的 Worker URL 是：
```
https://mastra-agent.gjf20001001.workers.dev
```

在 GitHub Secrets 中设置：

```
Name:  CLOUDFLARE_WORKER_URL
Value: https://mastra-agent.gjf20001001.workers.dev
```

然后前端页面会自动使用这个 URL 调用 API。

---

**现在就去部署 Workers 并获取 URL 吧！** 🚀
