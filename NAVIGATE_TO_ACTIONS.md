# 🧭 如何找到 GitHub Actions 工作流

## ⚠️ 重要：你在错误的页面

**Settings → Actions → General** 是**配置页面**，不会显示工作流列表。

## ✅ 正确的步骤

### 步骤 1: 离开 Settings 页面

1. **点击页面顶部的仓库名称**（例如：`your-username/your-repo`）
   - 或者点击浏览器地址栏中的仓库名称
   - 这会带你回到仓库主页

### 步骤 2: 找到 Actions 标签页

在仓库主页的**顶部导航栏**，你会看到：

```
┌─────────────────────────────────────────────────────────┐
│  [仓库图标] your-username/your-repo                     │
├─────────────────────────────────────────────────────────┤
│  Code  │  Issues  │  Pull requests  │  Actions  │  ...  │
│         ↑                                              │
│     点击这里！                                          │
└─────────────────────────────────────────────────────────┘
```

**点击 "Actions" 标签**（不是 Settings）

### 步骤 3: 查看工作流

进入 Actions 页面后：

**左侧边栏**应该显示：
- ✅ All workflows
- ✅ Deploy to Cloudflare Workers
- ✅ Deploy to Cloudflare Pages  
- ✅ Deploy to Cloudflare Workers (Manual)

**右侧**显示工作流运行历史（如果有的话）

## 🔍 如果 Actions 标签页是空的

### 检查 1: 确认 GitHub Actions 已启用

1. 回到 **Settings → Actions → General**
2. 确认 **"Allow all actions and reusable workflows"** 已选中
3. 如果没有，选择它并保存

### 检查 2: 确认工作流文件存在

工作流文件应该已经在 GitHub 上了（已确认）。

### 检查 3: 手动触发测试

1. 在 **Actions 标签页**
2. 左侧选择 **"Deploy to Cloudflare Pages"**
3. 点击右侧的 **"Run workflow"** 按钮
4. 选择分支：**master**
5. 点击绿色的 **"Run workflow"** 按钮

## 📸 视觉指南

### 错误的位置 ❌
```
仓库主页
  └── Settings（设置）
      └── Actions
          └── General ← 你在这里（配置页面）
              ├── Workflow permissions
              └── Runners
```

### 正确的位置 ✅
```
仓库主页
  └── Actions（标签页）← 应该在这里（工作流页面）
      ├── All workflows
      ├── Deploy to Cloudflare Workers
      └── Deploy to Cloudflare Pages
```

## 🚀 快速操作

### 方法 1: 直接访问 Actions 页面

在浏览器地址栏输入：
```
https://github.com/your-username/your-repo/actions
```

替换 `your-username` 和 `your-repo` 为你的实际值。

### 方法 2: 从仓库主页导航

1. 访问你的仓库主页
2. 点击顶部导航栏的 **"Actions"** 标签
3. 应该看到工作流列表

## 🔧 如果仍然看不到工作流

### 可能原因 1: GitHub Actions 被禁用

**解决**：
1. Settings → Actions → General
2. 选择 **"Allow all actions and reusable workflows"**
3. 保存更改

### 可能原因 2: 工作流文件路径错误

**检查**：
- 文件应该在 `.github/workflows/` 目录
- 文件扩展名应该是 `.yml` 或 `.yaml`
- 文件名不能有特殊字符

### 可能原因 3: 工作流文件语法错误

**检查**：
- YAML 语法是否正确
- 缩进是否正确（使用空格，不是 Tab）

## 📋 完整检查清单

- [ ] 在正确的页面：**Actions 标签页**（不是 Settings）
- [ ] GitHub Actions 已启用（Settings → Actions → General）
- [ ] 工作流文件在 `.github/workflows/` 目录
- [ ] 工作流文件已推送到 GitHub
- [ ] 推送到 `master` 分支

## 🎯 立即操作

### 步骤 1: 导航到 Actions 页面

**方法 A**：点击仓库主页顶部的 **"Actions"** 标签

**方法 B**：直接访问：
```
https://github.com/你的用户名/你的仓库名/actions
```

### 步骤 2: 查看工作流列表

在左侧应该看到：
- Deploy to Cloudflare Workers
- Deploy to Cloudflare Pages

### 步骤 3: 如果没有看到，手动触发

1. 点击 **"Deploy to Cloudflare Pages"**
2. 点击 **"Run workflow"**
3. 选择 **master** 分支
4. 点击 **"Run workflow"**

---

**记住：工作流在 Actions 标签页，不在 Settings！** 🎯

