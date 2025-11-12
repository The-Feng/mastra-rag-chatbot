# Git 推送故障排除指南

## 当前状态

- ✅ Git 仓库已初始化
- ✅ 远程仓库已配置：`git@github-personal:The-Feng/mastra-rag-chatbot.git`
- ✅ 有提交记录
- ✅ GitHub Actions workflow 文件已创建

## 常见问题和解决方案

### 问题 1：SSH 连接失败

**症状**：`Connection closed by 198.18.0.22 port 22` 或 `Permission denied`

**解决方案**：

1. **测试 SSH 连接**：
   ```bash
   ssh -T git@github-personal
   ```
   
   如果成功，应该看到：
   ```
   Hi The-Feng! You've successfully authenticated...
   ```

2. **检查 SSH 配置**：
   ```bash
   cat ~/.ssh/config | grep -A 5 "github-personal"
   ```
   
   确认配置类似：
   ```
   Host github-personal
       HostName github.com
       User git
       IdentityFile ~/.ssh/id_rsa_personal
       IdentitiesOnly yes
   ```

3. **检查 SSH 密钥权限**：
   ```bash
   ls -la ~/.ssh/id_rsa_personal
   chmod 600 ~/.ssh/id_rsa_personal
   ```

4. **确认密钥已添加到 GitHub**：
   ```bash
   cat ~/.ssh/id_rsa_personal.pub
   ```
   复制公钥内容，确保已添加到 GitHub 账号的 SSH keys 中。

### 问题 2：远程仓库不存在

**症状**：`ERROR: Repository not found`

**解决方案**：

1. 确认 GitHub 仓库已创建：
   - 访问 https://github.com/The-Feng/mastra-rag-chatbot
   - 确认仓库存在且您有访问权限

2. 如果仓库不存在，创建它：
   - 访问 https://github.com/new
   - 仓库名：`mastra-rag-chatbot`
   - 选择 Public 或 Private
   - **不要**初始化 README（因为本地已有代码）

### 问题 3：分支名称不匹配

**症状**：`error: failed to push some refs`

**解决方案**：

```bash
# 检查本地分支
git branch

# 如果本地是 main，但远程是 master，使用：
git push -u origin main:main

# 或者重命名本地分支
git branch -M main
git push -u origin main
```

### 问题 4：没有提交记录

**症状**：`Everything up-to-date` 但代码未上传

**解决方案**：

```bash
# 检查是否有未提交的文件
git status

# 如果有未提交的文件，添加并提交
git add .
git commit -m "Add GitHub Actions workflow for auto-deployment"

# 然后推送
git push -u origin main
```

## 推送步骤（完整流程）

### 步骤 1：确认远程配置

```bash
cd /Users/gjf/Desktop/project/jcyd-34/new-mastra
git remote -v
```

应该显示：
```
origin	git@github-personal:The-Feng/mastra-rag-chatbot.git (fetch)
origin	git@github-personal:The-Feng/mastra-rag-chatbot.git (push)
```

如果不是，设置：
```bash
git remote set-url origin git@github-personal:The-Feng/mastra-rag-chatbot.git
```

### 步骤 2：测试 SSH 连接

```bash
ssh -T git@github-personal
```

如果成功，继续下一步。如果失败，参考"问题 1"的解决方案。

### 步骤 3：检查提交状态

```bash
git status
git log --oneline -5
```

### 步骤 4：推送代码

```bash
# 如果远程分支不存在，使用：
git push -u origin main

# 如果远程分支已存在，使用：
git push origin main
```

### 步骤 5：验证推送成功

1. 访问 https://github.com/The-Feng/mastra-rag-chatbot
2. 确认代码已上传
3. 确认 `.github/workflows/` 目录存在

## 使用详细模式诊断

如果推送失败，使用详细模式查看具体错误：

```bash
# SSH 详细模式
GIT_SSH_COMMAND="ssh -v" git push -u origin main

# 或者使用 Git 详细模式
GIT_TRACE=1 GIT_CURL_VERBOSE=1 git push -u origin main
```

## 替代方案：使用 HTTPS（如果 SSH 持续失败）

如果 SSH 一直有问题，可以临时使用 HTTPS：

```bash
# 切换到 HTTPS
git remote set-url origin https://github.com/The-Feng/mastra-rag-chatbot.git

# 推送（会提示输入用户名和 Personal Access Token）
git push -u origin main
```

**注意**：使用 HTTPS 需要 Personal Access Token（不是密码）。

## 获取帮助

如果以上方法都无法解决问题，请提供以下信息：

1. `git status` 的输出
2. `git remote -v` 的输出
3. `ssh -T git@github-personal` 的输出
4. `git push -u origin main` 的完整错误信息

