# 部署状态和说明

## ✅ 已完成的配置

### 1. 构建配置优化
- ✅ 添加了 `--minify` 进行代码压缩
- ✅ 将所有 Node.js 内置模块标记为 external：
  - `crypto`, `events`, `stream`, `stream/web`
  - `fs`, `fs/promises`, `path`, `os`, `util`, `module`
- ✅ 将不兼容的依赖标记为 external：
  - `pg`, `mammoth`, `pdf-parse`, `textract`
  - `node-html-better-parser`
  - `@opentelemetry/*` (所有 OpenTelemetry 包)

### 2. Wrangler 配置
- ✅ 更新了 `compatibility_date` 到 `2024-09-23`
- ✅ 启用了 `nodejs_compat` 标志以支持 Node.js 内置模块
- ✅ 配置了生产和预发布环境

### 3. GitHub Actions
- ✅ 自动部署工作流已配置（`.github/workflows/deploy-cloudflare.yml`）
- ✅ 手动部署工作流已配置（`.github/workflows/deploy-cloudflare-manual.yml`）

## 🚀 如何部署

### 方法 1: 直接部署到生产环境

```bash
pnpm run deploy:worker
```

### 方法 2: 部署到预发布环境

```bash
pnpm run deploy:worker:staging
```

### 方法 3: 使用 Wrangler 直接部署

```bash
# 部署到生产环境
npx wrangler deploy --env production

# 部署到预发布环境
npx wrangler deploy --env staging
```

## ⚠️ 重要提示

### 文件大小限制

当前项目由于依赖较大，可能会遇到以下情况：

1. **免费计划限制**: 3 MiB（压缩后）
2. **付费计划限制**: 10 MiB（压缩后）

如果遇到文件大小限制错误，有以下解决方案：

#### 解决方案 1: 升级到付费计划

访问 [Cloudflare Workers 定价页面](https://dash.cloudflare.com/workers/plans) 升级计划。

#### 解决方案 2: 进一步优化

如果仍然超过限制，可以考虑：

1. **移除不需要的功能**：
   - 移除 RAG 功能（如果不需要）
   - 移除图像生成功能（如果不需要）

2. **拆分为多个 Worker**：
   - 一个 Worker 处理聊天
   - 一个 Worker 处理文档上传
   - 一个 Worker 处理图像生成

3. **使用 Cloudflare Pages Functions** 替代部分功能

### 环境变量设置

部署成功后，请在 Cloudflare Dashboard 中设置环境变量：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 选择你的 Worker（`mastra-agent` 或 `mastra-agent-staging`）
4. 点击 **Settings** → **Variables**
5. 添加以下环境变量：
   - `OPENAI_API_KEY`: 你的 OpenAI API Key
   - `POSTGRES_URL`: 你的 PostgreSQL 连接字符串（如果使用）

## 📝 当前构建配置

```json
{
  "build:worker": "tsc && esbuild src/worker.ts --bundle --format=esm --outfile=dist/worker.js --platform=neutral --target=es2022 --minify --external:pg --external:mammoth --external:pdf-parse --external:textract --external:crypto --external:events --external:stream --external:stream/web --external:fs --external:fs/promises --external:path --external:os --external:util --external:module --external:node-html-better-parser --external:@opentelemetry/*"
}
```

## 🔍 故障排除

### 如果部署失败

1. **检查认证**:
   ```bash
   npx wrangler whoami
   ```

2. **查看详细日志**:
   日志文件位置会在错误信息中显示，例如：
   ```
   /Users/gjf/Library/Preferences/.wrangler/logs/wrangler-YYYY-MM-DD_HH-MM-SS_NNN.log
   ```

3. **重新登录**:
   ```bash
   npx wrangler login
   ```

4. **清理并重新构建**:
   ```bash
   rm -rf dist
   pnpm run build:worker
   pnpm run deploy:worker
   ```

## 📊 构建文件

- **位置**: `dist/worker.js`
- **状态**: ✅ 已生成

查看文件大小：
```bash
ls -lh dist/worker.js
```

## 🎯 下一步

1. 确认 Cloudflare 账号已登录
2. 运行部署命令
3. 在 Cloudflare Dashboard 中设置环境变量
4. 测试 Worker 端点

## 📚 相关文档

- [README.md](./README.md) - 项目主文档
- [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) - Cloudflare 部署详细指南
- [wrangler.toml](./wrangler.toml) - Wrangler 配置文件
- [package.json](./package.json) - 项目配置和脚本

