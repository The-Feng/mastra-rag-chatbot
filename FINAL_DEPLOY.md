# 🎉 最终部署步骤

## ✅ 问题已解决

使用 `--platform=browser` 代替 `--platform=neutral`，成功移除了所有 Node.js 特定依赖。

### 验证结果
- ✅ 构建成功：526.6KB
- ✅ 无 `@vercel/oidc` 引用
- ✅ 文件大小符合免费计划

## 🚀 立即部署

```bash
cd /Users/gjf/Desktop/project/jcyd-34/new-mastra

# 部署到生产环境
pnpm run deploy:worker
```

## 📊 关键变更

### 构建配置优化

**之前**：
```bash
--platform=neutral --external:@vercel/oidc --external:path ...
```
❌ 问题：external 只是不打包，但 import 语句仍然存在

**现在**：
```bash
--platform=browser --tree-shaking=true
```
✅ 解决：使用浏览器平台，完全移除 Node.js 依赖

### 为什么这样工作？

1. **`--platform=browser`**：
   - 告诉 esbuild 目标是浏览器环境
   - 自动排除 Node.js 特定代码
   - AI SDK 会使用浏览器兼容的代码路径

2. **`--tree-shaking=true`**：
   - 移除未使用的代码
   - 减小最终包大小

3. **`--define:process.env.NODE_ENV="production"`**：
   - 移除开发环境的调试代码
   - 进一步优化包大小

## 🎯 预期部署结果

```
⛅️ wrangler 4.47.0
───────────────────
Total Upload: 526.60 KiB / gzip: ~115 KiB
Uploaded mastra-agent (X.XX sec)
Published mastra-agent (X.XX sec)
  https://mastra-agent.你的子域名.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## ⚡ 部署成功后

### 1. 记录 Worker URL
从部署输出中复制 URL，类似：
```
https://mastra-agent.你的子域名.workers.dev
```

### 2. 设置环境变量

访问 Cloudflare Dashboard：
1. https://dash.cloudflare.com/
2. Workers & Pages → `mastra-agent`
3. Settings → Variables → Environment Variables
4. 添加变量：
   ```
   Name: OPENAI_API_KEY
   Value: sk-...你的API密钥...
   ```
5. 点击 **Deploy** 应用更改

### 3. 测试健康检查

```bash
curl https://mastra-agent.你的子域名.workers.dev/health
```

预期响应：
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### 4. 测试聊天功能

```bash
curl -X POST https://mastra-agent.你的子域名.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"你好，请用一句话介绍你自己"}'
```

应该看到流式响应返回 AI 的回复。

### 5. 访问 Web 界面

在浏览器中打开：
```
https://mastra-agent.你的子域名.workers.dev/
```

你会看到一个简单的欢迎页面，列出可用的 API 端点。

## 📱 集成到应用

### JavaScript/TypeScript

```typescript
async function chat(query: string) {
  const response = await fetch('https://your-worker.workers.dev/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const text = decoder.decode(value);
    console.log(text); // 处理流式响应
  }
}
```

### Python

```python
import requests

def chat(query: str):
    url = "https://your-worker.workers.dev/api/chat"
    response = requests.post(
        url,
        json={"query": query},
        stream=True
    )
    
    for chunk in response.iter_content(chunk_size=1024):
        if chunk:
            print(chunk.decode('utf-8'), end='')
```

## 🔍 监控和调试

### 实时日志

```bash
npx wrangler tail --env production
```

### 查看历史日志

1. 访问 Cloudflare Dashboard
2. Workers & Pages → `mastra-agent`
3. Logs 标签

### 常见问题

**问题：API 返回 500 错误**
- 检查环境变量是否正确设置
- 检查 OPENAI_API_KEY 是否有效
- 查看实时日志

**问题：响应很慢**
- 可能是冷启动，第一次请求会慢一些
- 后续请求应该很快

**问题：超出免费配额**
- Workers 免费计划：100,000 请求/天
- 如需更多，升级到付费计划

## 🔄 更新部署

修改代码后重新部署：

```bash
# 1. 修改 src/worker-minimal.ts
# 2. 重新构建
pnpm run build:worker

# 3. 重新部署
pnpm run deploy:worker
```

## 🎓 下一步学习

1. **自定义域名**：在 Cloudflare Dashboard 中配置
2. **速率限制**：防止滥用
3. **缓存策略**：优化性能
4. **监控告警**：设置异常通知

## 📦 精简版 vs 完整版

### 当前精简版包含：
- ✅ AI 聊天（GPT-4o-mini）
- ✅ 流式响应
- ✅ 健康检查
- ✅ CORS 支持
- ✅ 526KB，适合免费计划

### 完整版额外功能（需付费计划）：
- 📄 文件上传
- 🔍 RAG 文档问答
- 🖼️ 图像分析
- 💾 PostgreSQL 存储
- 📊 约 7MB，需要付费计划

---

## 🚀 现在就部署！

```bash
pnpm run deploy:worker
```

祝部署成功！🎉

