# Cloudflare API Token 设置指南

## 📋 什么是 CLOUDFLARE_API_TOKEN？

`CLOUDFLARE_API_TOKEN` 是用于 GitHub Actions 自动部署到 Cloudflare Workers 的认证令牌。

## 🔑 如何获取 Cloudflare API Token

### 步骤 1: 登录 Cloudflare Dashboard

1. 访问：https://dash.cloudflare.com/
2. 登录你的账号

### 步骤 2: 创建 API Token

1. 点击右上角的 **用户图标** → **My Profile**
2. 在左侧菜单选择 **API Tokens**
3. 点击 **Create Token**
4. 选择 **Edit Cloudflare Workers** 模板（或自定义）

### 步骤 3: 配置 Token 权限

**推荐配置**（使用模板）：
- **Token name**: `GitHub Actions Deploy`
- **Permissions**:
  - **Account** → **Cloudflare Workers:Edit**
  - **Zone** → **Zone:Read** (如果需要)
- **Account Resources**:
  - **Include** → **All accounts** 或选择特定账号
- **Zone Resources**:
  - **Include** → **All zones** (如果需要)

**自定义配置**（更安全）：
```
Account - Cloudflare Workers:Edit
Account - Account Settings:Read
```

### 步骤 4: 创建并复制 Token

1. 点击 **Continue to summary**
2. 检查配置
3. 点击 **Create Token**
4. **立即复制 Token**（只显示一次！）
   ```
   例如：xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## 🔐 在 GitHub 中设置 Secret

### 步骤 1: 进入 GitHub 仓库设置

1. 打开你的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**

### 步骤 2: 添加 Secrets

点击 **New repository secret**，添加以下两个 secrets：

#### Secret 1: CLOUDFLARE_API_TOKEN
- **Name**: `CLOUDFLARE_API_TOKEN`
- **Value**: 粘贴你刚才复制的 API Token
- 点击 **Add secret**

#### Secret 2: CLOUDFLARE_ACCOUNT_ID
- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Value**: 你的 Cloudflare Account ID

**如何找到 Account ID**：
1. 在 Cloudflare Dashboard 右侧边栏
2. 找到 **Account ID**（在域名列表下方）
3. 点击复制

### 步骤 3: 验证 Secrets

确保以下两个 secrets 都已添加：
- ✅ `CLOUDFLARE_API_TOKEN`
- ✅ `CLOUDFLARE_ACCOUNT_ID`

## 🚀 测试自动部署

### 方法 1: 推送到 main 分支

```bash
git add .
git commit -m "Setup Cloudflare Workers deployment"
git push origin main
```

GitHub Actions 会自动触发部署。

### 方法 2: 手动触发

1. 在 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择 **Deploy to Cloudflare Workers** 工作流
4. 点击 **Run workflow** → **Run workflow**

## 📊 查看部署状态

### 在 GitHub Actions 中

1. 进入 **Actions** 标签
2. 查看最新的工作流运行
3. 点击查看详细日志

### 在 Cloudflare Dashboard 中

1. 访问：https://dash.cloudflare.com/
2. 进入 **Workers & Pages**
3. 查看 `mastra-agent` Worker
4. 检查部署状态和日志

## 🔒 安全最佳实践

### 1. Token 权限最小化

只授予必要的权限：
- ✅ `Cloudflare Workers:Edit` - 部署 Worker
- ✅ `Account Settings:Read` - 读取账号设置
- ❌ 不要授予 `Admin` 权限

### 2. 限制 Token 作用域

- 只绑定到需要的账号
- 不要使用 "All accounts"（除非必要）

### 3. 定期轮换 Token

- 每 90 天更新一次 Token
- 删除不再使用的旧 Token

### 4. 使用环境变量保护

Token 存储在 GitHub Secrets 中，不会暴露在代码中。

## ⚠️ 常见问题

### 问题 1: "Invalid API Token"

**原因**：
- Token 已过期或被删除
- Token 权限不足

**解决**：
1. 检查 Token 是否有效
2. 确认权限包含 `Cloudflare Workers:Edit`
3. 重新创建 Token 并更新 GitHub Secret

### 问题 2: "Account ID not found"

**原因**：
- Account ID 错误
- Token 没有访问该账号的权限

**解决**：
1. 确认 Account ID 正确（从 Dashboard 右侧边栏复制）
2. 检查 Token 是否绑定到正确的账号

### 问题 3: 部署成功但 Worker 不工作

**原因**：
- 环境变量未设置
- Worker 代码错误

**解决**：
1. 在 Cloudflare Dashboard 中设置环境变量
2. 查看 Worker 日志排查错误

## 📝 快速参考

### 获取 Account ID

```bash
# 方法 1: Cloudflare Dashboard
# 右侧边栏 → Account ID

# 方法 2: 使用 Wrangler CLI
npx wrangler whoami
```

### 验证 Token

```bash
# 使用 curl 测试
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer YOUR_API_TOKEN"

# 应该返回你的账号信息
```

### 在 GitHub Actions 中使用

```yaml
- name: Deploy to Cloudflare Workers
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: deploy --env production
```

## 🎯 完整设置检查清单

- [ ] 创建 Cloudflare API Token
- [ ] 复制 Token（保存好）
- [ ] 获取 Account ID
- [ ] 在 GitHub 添加 `CLOUDFLARE_API_TOKEN` secret
- [ ] 在 GitHub 添加 `CLOUDFLARE_ACCOUNT_ID` secret
- [ ] 推送代码到 main 分支
- [ ] 检查 GitHub Actions 部署状态
- [ ] 在 Cloudflare Dashboard 验证 Worker
- [ ] 设置 Worker 环境变量（OPENAI_API_KEY）

## 🔗 相关链接

- [Cloudflare API Tokens 文档](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [GitHub Secrets 文档](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Wrangler Action 文档](https://github.com/cloudflare/wrangler-action)

---

**设置完成后，每次推送到 main 分支都会自动部署！** 🚀

