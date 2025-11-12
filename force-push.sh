#!/bin/bash

# 强制推送脚本 - 确保所有代码都推送到 GitHub

set -e

echo "=== 开始推送代码到 GitHub ==="
echo ""

cd /Users/gjf/Desktop/project/jcyd-34/new-mastra

# 1. 显示当前状态
echo "1. 当前 Git 状态："
git status
echo ""

# 2. 显示远程配置
echo "2. 远程仓库配置："
git remote -v
echo ""

# 3. 添加所有文件（包括新创建的 workflow 文件）
echo "3. 添加所有文件..."
git add .
echo "   ✅ 文件已添加"
echo ""

# 4. 检查是否有更改需要提交
if [ -n "$(git status --porcelain)" ]; then
    echo "4. 发现未提交的更改，正在提交..."
    git commit -m "Add GitHub Actions workflow for auto-deployment to Cloudflare Workers"
    echo "   ✅ 提交完成"
else
    echo "4. 没有未提交的更改"
fi
echo ""

# 5. 显示提交历史
echo "5. 最近的提交记录："
git log --oneline -5
echo ""

# 6. 测试 SSH 连接
echo "6. 测试 SSH 连接..."
if ssh -T git@github-personal 2>&1 | grep -q "successfully authenticated"; then
    echo "   ✅ SSH 连接成功"
else
    echo "   ⚠️  SSH 连接测试失败，但继续尝试推送..."
fi
echo ""

# 7. 推送代码
echo "7. 推送到 GitHub..."
echo "   远程：git@github-personal:The-Feng/mastra-rag-chatbot.git"
echo "   分支：main"
echo ""

# 尝试推送
if git push -u origin main 2>&1; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "请访问以下链接确认："
    echo "https://github.com/The-Feng/mastra-rag-chatbot"
    echo ""
    echo "下一步："
    echo "1. 在 GitHub 仓库中设置 Secrets："
    echo "   - CLOUDFLARE_API_TOKEN"
    echo "   - CLOUDFLARE_ACCOUNT_ID"
    echo "2. GitHub Actions 会自动运行并部署到 Cloudflare Workers"
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "可能的原因："
    echo "1. 远程仓库不存在 - 请先创建仓库：https://github.com/new"
    echo "2. SSH 密钥未添加到 GitHub"
    echo "3. 权限问题"
    echo ""
    echo "请检查错误信息并重试"
    exit 1
fi

