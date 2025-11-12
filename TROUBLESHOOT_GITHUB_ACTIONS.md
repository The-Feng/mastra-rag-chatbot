# 🔍 GitHub Actions 故障排除指南

## ❌ 问题：没有触发自动部署

### 可能的原因和解决方案

#### 1. 检查 GitHub Actions 是否启用

**步骤**：
1. 进入 GitHub 仓库
2. 点击 **Settings** → **Actions** → **General**
3. 确认 **Allow all actions and reusable workflows** 已启用

#### 2. 检查工作流文件位置

确保工作流文件在正确的位置：
```
.github/workflows/
├── deploy-cloudflare.yml
└── deploy-pages.yml
```

#### 3. 检查分支名称

确认推送的分支是 `master`：
```bash
git branch --show-current
```

如果不是 `master`，切换到 master 分支：
```bash
git checkout master
```

#### 4. 检查最近的提交

查看最近的提交是否包含工作流文件的更改：
```bash
git log --oneline -5
```

#### 5. 手动触发测试

如果自动触发不工作，可以手动触发：

1. 进入 GitHub 仓库 → **Actions**
2. 选择 **Deploy to Cloudflare Workers** 或 **Deploy to Cloudflare Pages**
3. 点击 **Run workflow** → **Run workflow**

#### 6. 检查工作流文件语法

工作流文件必须是有效的 YAML。检查语法错误：

```bash
# 可以使用在线工具检查
# https://www.yamllint.com/
```

#### 7. 查看 GitHub Actions 日志

1. 进入 GitHub 仓库 → **Actions**
2. 查看是否有任何工作流运行（即使失败）
3. 点击查看详细日志

#### 8. 确认 Secrets 已设置

检查以下 Secrets 是否已设置：
- ✅ `CLOUDFLARE_API_TOKEN`
- ✅ `CLOUDFLARE_ACCOUNT_ID`
- ✅ `CLOUDFLARE_WORKER_URL`（Pages 部署需要）

#### 9. 移除路径过滤（已修复）

我已经移除了 Pages 工作流的 `paths` 过滤，现在任何推送到 `master` 分支的更改都会触发部署。

### 🔧 快速修复步骤

#### 步骤 1: 确保工作流文件已提交

```bash
git add .github/workflows/
git commit -m "Fix GitHub Actions workflows"
git push origin master
```

#### 步骤 2: 检查 GitHub Actions 页面

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看是否有工作流运行

#### 步骤 3: 手动触发测试

如果自动触发不工作，手动触发一次：

1. Actions → 选择工作流 → Run workflow

#### 步骤 4: 检查工作流配置

确认工作流文件中的分支名称是 `master`：

```yaml
on:
  push:
    branches:
      - master  # 确认这里是 master
```

### 📋 当前配置检查清单

- [ ] 工作流文件在 `.github/workflows/` 目录
- [ ] 分支名称是 `master`
- [ ] GitHub Actions 已启用
- [ ] Secrets 已设置
- [ ] 工作流文件语法正确
- [ ] 已推送到 GitHub

### 🚀 测试部署

创建一个测试提交来触发部署：

```bash
# 创建一个小的更改
echo "# Test" >> README.md
git add README.md
git commit -m "Test: Trigger GitHub Actions"
git push origin master
```

然后检查 GitHub Actions 页面是否触发了工作流。

### 📞 如果仍然不工作

1. **检查 GitHub Actions 限制**：
   - 免费账户有使用限制
   - 检查是否达到限制

2. **查看 GitHub 状态**：
   - https://www.githubstatus.com/
   - 确认 GitHub Actions 服务正常

3. **检查仓库设置**：
   - Settings → Actions → General
   - 确认所有选项都已正确配置

4. **查看工作流运行历史**：
   - Actions → 查看是否有任何历史记录
   - 即使失败的工作流也会显示

---

**如果问题仍然存在，请提供：**
- GitHub Actions 页面的截图
- 工作流运行的日志（如果有）
- 错误信息（如果有）

