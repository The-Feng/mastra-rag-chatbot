# 推送代码到 GitHub - 完整指南

## 当前状态

- ✅ Git 仓库已初始化
- ✅ 远程仓库已配置：`git@github-personal:The-Feng/mastra-rag-chatbot.git`
- ✅ SSH 连接测试成功
- ⚠️ 代码尚未推送到 GitHub

## 快速推送步骤

### 方法 1：使用推送脚本（最简单）

```bash
cd /Users/gjf/Desktop/project/jcyd-34/new-mastra
./force-push.sh
```

### 方法 2：手动推送（推荐，可以看到每一步）

#### 步骤 1：检查当前状态

```bash
cd /Users/gjf/Desktop/project/jcyd-34/new-mastra
git status
```

#### 步骤 2：添加所有文件

```bash
# 添加所有文件（包括新创建的 workflow 文件）
git add .

# 检查添加的文件
git status
```

应该看到以下文件被添加：
- `.github/workflows/deploy-cloudflare.yml`
- `.github/workflows/deploy-cloudflare-manual.yml`
- `push-to-github.sh`
- `check-git-status.sh`
- `force-push.sh`
- `TROUBLESHOOTING.md`
- `PUSH_GUIDE.md`（本文件）

#### 步骤 3：提交更改

```bash
git commit -m "Add GitHub Actions workflow for auto-deployment to Cloudflare Workers"
```

#### 步骤 4：推送到 GitHub

```bash
git push -u origin main
```

如果这是第一次推送，GitHub 可能会提示仓库不存在。在这种情况下：

1. **先创建 GitHub 仓库**：
   - 访问：https://github.com/new
   - 仓库名：`mastra-rag-chatbot`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize with README"（因为本地已有代码）
   - 点击 "Create repository"

2. **然后再次推送**：
   ```bash
   git push -u origin main
   ```

#### 步骤 5：验证推送成功

访问以下链接确认代码已上传：
https://github.com/The-Feng/mastra-rag-chatbot

应该能看到：
- ✅ 所有文件都已上传
- ✅ `.github/workflows/` 目录存在
- ✅ 包含两个 workflow 文件

## 如果推送失败

### 错误 1：Repository not found

**原因**：GitHub 仓库不存在

**解决**：
1. 访问 https://github.com/new
2. 创建名为 `mastra-rag-chatbot` 的仓库
3. **不要**初始化 README
4. 再次推送

### 错误 2：Permission denied

**原因**：SSH 密钥未添加到 GitHub 或权限不足

**解决**：
1. 检查 SSH 连接：`ssh -T git@github-personal`
2. 确认 SSH 密钥已添加到 GitHub 账号
3. 确认您有该仓库的写入权限

### 错误 3：Connection refused

**原因**：网络或 SSH 配置问题

**解决**：
1. 检查网络连接
2. 检查 `~/.ssh/config` 中的 `github-personal` 配置
3. 尝试使用详细模式：`GIT_SSH_COMMAND="ssh -v" git push -u origin main`

## 推送成功后的步骤

### 1. 设置 GitHub Secrets

在 GitHub 仓库中设置 Secrets，以便 GitHub Actions 可以部署：

1. 进入仓库：https://github.com/The-Feng/mastra-rag-chatbot
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **"New repository secret"**，添加：

   **Secret 1**：
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: 您的 Cloudflare API Token

   **Secret 2**：
   - **Name**: `CLOUDFLARE_ACCOUNT_ID`
   - **Value**: 您的 Cloudflare Account ID

### 2. 触发自动部署

设置 Secrets 后：
- 推送到 `main` 分支会自动触发部署
- 或在 **Actions** 标签页手动触发

### 3. 查看部署状态

在 **Actions** 标签页查看：
- 构建和部署进度
- 成功或失败状态
- 详细的部署日志

## 验证清单

推送前确认：
- [ ] 所有文件已添加：`git status` 显示干净
- [ ] 有提交记录：`git log --oneline` 显示提交
- [ ] SSH 连接正常：`ssh -T git@github-personal` 成功
- [ ] GitHub 仓库已创建（如果第一次推送）

推送后确认：
- [ ] GitHub 仓库中有代码
- [ ] `.github/workflows/` 目录存在
- [ ] GitHub Secrets 已设置
- [ ] GitHub Actions 工作流已运行

## 需要帮助？

如果遇到问题，请提供：
1. `git status` 的输出
2. `git push -u origin main` 的完整错误信息
3. `ssh -T git@github-personal` 的输出

