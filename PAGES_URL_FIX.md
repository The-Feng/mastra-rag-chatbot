# 🔧 Pages URL 配置说明

## 📋 当前配置

我已经将 Pages 项目名称更新为 `mastra-agent`，这样你的 Pages URL 将是：

```
https://mastra-agent.pages.dev
```

## 🎯 如果你想要使用 `mastra-agent.gjf20001001.pages.dev`

这个 URL 格式看起来像是自定义域名或子域名。有几种方式可以实现：

### 方法 1: 使用 Cloudflare Pages 的自定义域名

1. **部署 Pages 后**，访问 Cloudflare Dashboard
2. 进入 **Pages** → **mastra-agent**
3. 点击 **Custom domains** → **Set up a custom domain**
4. 输入你的域名：`mastra-agent.gjf20001001.com`（或你想要的域名）

### 方法 2: 使用 Pages 的子域名

Pages 默认会使用 `项目名.pages.dev` 格式。如果你想要 `mastra-agent.gjf20001001.pages.dev`，这需要：

1. 在 Cloudflare Dashboard 中设置自定义域名
2. 或者使用 Cloudflare Workers 的路由功能

### 方法 3: 使用 Workers 路由（推荐）

如果你想让 Pages 和 Workers 使用相同的域名：

1. **设置 Workers 路由**：
   - 在 Cloudflare Dashboard → Workers & Pages → `mastra-agent`
   - Settings → Routes
   - 添加路由：`mastra-agent.gjf20001001.com/*`

2. **设置 Pages 自定义域名**：
   - Pages → `mastra-agent` → Custom domains
   - 添加：`mastra-agent.gjf20001001.com`

3. **配置路由规则**：
   - `/api/*` → Workers
   - `/*` → Pages

## 🚀 快速解决方案

### 选项 A: 使用默认 Pages URL

部署后访问：
```
https://mastra-agent.pages.dev
```

### 选项 B: 设置自定义域名

1. 部署 Pages（使用当前配置）
2. 在 Cloudflare Dashboard 中设置自定义域名
3. 配置 DNS 记录（如果需要）

## 📝 当前配置

项目名称已设置为：`mastra-agent`

这意味着：
- Pages URL: `https://mastra-agent.pages.dev`
- Workers URL: `https://mastra-agent.your-subdomain.workers.dev`

## 🔍 检查部署状态

部署后，你可以：

1. **查看 GitHub Actions**：
   - Actions → Deploy to Cloudflare Pages
   - 查看部署日志和 URL

2. **查看 Cloudflare Dashboard**：
   - Pages → `mastra-agent`
   - 查看部署状态和 URL

3. **访问页面**：
   - 使用 Pages 提供的 URL

## ⚙️ 如果需要修改项目名称

如果你想使用不同的项目名称，修改 `.github/workflows/deploy-pages.yml`：

```yaml
projectName: mastra-agent  # 修改这里
```

然后重新部署。

---

**现在推送代码，Pages 会自动部署到 `mastra-agent.pages.dev`！** 🚀

