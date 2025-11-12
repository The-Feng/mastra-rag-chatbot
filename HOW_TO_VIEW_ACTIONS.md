# 📋 如何查看 GitHub Actions 工作流

## 🎯 两个不同的页面

GitHub 中有两个与 Actions 相关的页面：

### 1. Settings → Actions（设置页面）
- **路径**：仓库 → Settings → Actions → General
- **用途**：配置 Actions 权限和设置
- **包含**：General、Runners 等设置选项

### 2. Actions 标签页（工作流页面）⭐
- **路径**：仓库顶部导航栏 → **Actions** 标签
- **用途**：查看和管理工作流运行
- **包含**：工作流列表、运行历史、日志

## 🔍 如何查看工作流运行

### 步骤 1: 进入 Actions 标签页

1. **打开你的 GitHub 仓库**
2. **点击顶部导航栏的 "Actions" 标签**
   - 通常在 "Code"、"Issues"、"Pull requests" 旁边
   - 图标是一个齿轮/播放按钮

### 步骤 2: 查看工作流列表

在 Actions 页面左侧，你应该看到：

- ✅ **All workflows** - 所有工作流
- ✅ **Deploy to Cloudflare Workers** - Workers 部署工作流
- ✅ **Deploy to Cloudflare Pages** - Pages 部署工作流
- ✅ **Deploy to Cloudflare Workers (Manual)** - 手动部署工作流

### 步骤 3: 查看运行历史

- 如果工作流已运行过，右侧会显示运行历史
- 绿色 ✅ = 成功
- 红色 ❌ = 失败
- 黄色 🟡 = 进行中

## 🚀 如何触发工作流

### 方法 1: 自动触发（推送到 master）

```bash
cd /Users/gjf/Desktop/project/jcyd-34/new-mastra

git add .
git commit -m "Trigger GitHub Actions"
git push origin master
```

推送后：
1. 进入 **Actions** 标签页
2. 应该看到新的工作流运行开始
3. 点击查看实时日志

### 方法 2: 手动触发

1. **进入 Actions 标签页**（不是 Settings）
2. **在左侧选择工作流**：
   - "Deploy to Cloudflare Workers" 或
   - "Deploy to Cloudflare Pages"
3. **点击右侧的 "Run workflow" 按钮**
4. **选择分支**：`master`
5. **点击绿色的 "Run workflow" 按钮**
6. **等待运行开始**（几秒钟后会出现新的运行）

## 📊 查看工作流运行详情

### 点击运行后，你会看到：

1. **运行状态**
   - 进行中：黄色圆点
   - 成功：绿色 ✅
   - 失败：红色 ❌

2. **运行步骤**
   - Checkout
   - Install pnpm / Setup Node.js
   - Install dependencies
   - Build Worker
   - Deploy to Cloudflare...

3. **实时日志**
   - 点击每个步骤查看详细日志
   - 可以看到构建和部署的实时输出

## 🔧 如果看不到工作流

### 问题 1: Actions 标签页是空的

**可能原因**：
- 工作流文件还没有推送到 GitHub
- 工作流文件路径不正确

**解决**：
```bash
# 确认工作流文件存在
ls -la .github/workflows/

# 应该看到：
# deploy-cloudflare.yml
# deploy-pages.yml
# deploy-cloudflare-manual.yml

# 如果不存在，添加并推送
git add .github/workflows/
git commit -m "Add GitHub Actions workflows"
git push origin master
```

### 问题 2: 工作流文件存在但不显示

**检查**：
1. 确认文件在 `.github/workflows/` 目录
2. 确认文件扩展名是 `.yml` 或 `.yaml`
3. 确认 YAML 语法正确

### 问题 3: 工作流没有自动触发

**检查**：
1. 确认推送到的是 `master` 分支
2. 确认工作流文件中的分支配置是 `master`
3. 查看是否有语法错误

## 📝 快速检查清单

- [ ] 在正确的页面：**Actions 标签页**（不是 Settings）
- [ ] 工作流文件在 `.github/workflows/` 目录
- [ ] 工作流文件已推送到 GitHub
- [ ] 推送到 `master` 分支
- [ ] GitHub Actions 已启用（Settings → Actions → General）

## 🎯 立即操作

### 如果工作流还没运行过：

1. **推送代码触发**：
```bash
git add .
git commit -m "Trigger GitHub Actions deployment"
git push origin master
```

2. **然后查看**：
   - 进入 **Actions** 标签页
   - 等待几秒钟
   - 应该看到新的工作流运行

### 如果工作流已运行过：

1. **进入 Actions 标签页**
2. **查看左侧工作流列表**
3. **点击工作流名称查看运行历史**
4. **点击最新的运行查看详情**

## 🔗 页面导航说明

```
GitHub 仓库页面
├── Code（代码）
├── Issues（问题）
├── Pull requests（拉取请求）
├── Actions（工作流）⭐ ← 在这里查看工作流
├── Projects（项目）
├── Wiki（维基）
└── Settings（设置）
    └── Actions（Actions 设置）← 这里是配置，不是查看运行
        ├── General
        └── Runners
```

## 💡 提示

- **查看工作流运行**：使用顶部导航栏的 **Actions** 标签
- **配置 Actions 设置**：使用 **Settings → Actions**
- **工作流运行后**：会在 Actions 标签页显示历史记录

---

**现在就去 Actions 标签页查看工作流吧！** 🚀

