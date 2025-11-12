#!/bin/bash

# Git 推送脚本
# 用于推送代码到 GitHub

set -e  # 遇到错误时退出

echo "=== 开始推送到 GitHub ==="
echo ""

# 切换到项目目录
cd /Users/gjf/Desktop/project/jcyd-34/new-mastra

# 1. 检查 Git 状态
echo "1. 检查 Git 状态..."
git status
echo ""

# 2. 确认远程配置
echo "2. 检查远程配置..."
git remote -v
echo ""

# 3. 测试 SSH 连接
echo "3. 测试 SSH 连接..."
if ssh -T git@github-personal 2>&1 | grep -q "successfully authenticated"; then
    echo "   ✅ SSH 连接成功"
else
    echo "   ⚠️  SSH 连接可能有问题，但继续尝试推送..."
fi
echo ""

# 4. 检查是否有未提交的更改
echo "4. 检查未提交的更改..."
if [ -n "$(git status --porcelain)" ]; then
    echo "   发现未提交的文件，正在添加..."
    git add .
    echo "   请输入提交信息（直接回车使用默认信息）："
    read -r commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Add GitHub Actions workflow for auto-deployment"
    fi
    git commit -m "$commit_msg"
else
    echo "   ✅ 没有未提交的更改"
fi
echo ""

# 5. 检查未推送的提交
echo "5. 检查未推送的提交..."
unpushed=$(git log origin/main..HEAD --oneline 2>/dev/null || echo "")
if [ -z "$unpushed" ]; then
    # 尝试检查远程分支是否存在
    if git ls-remote --heads origin main | grep -q main; then
        echo "   ✅ 所有提交已推送"
        exit 0
    else
        echo "   远程分支不存在，将创建新分支"
    fi
else
    echo "   发现未推送的提交："
    echo "$unpushed"
fi
echo ""

# 6. 推送代码
echo "6. 推送到 GitHub..."
echo "   远程：git@github-personal:The-Feng/mastra-rag-chatbot.git"
echo "   分支：main"
echo ""

if git push -u origin main; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "下一步："
    echo "1. 访问 https://github.com/The-Feng/mastra-rag-chatbot 确认代码已上传"
    echo "2. 设置 GitHub Secrets（CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID）"
    echo "3. GitHub Actions 会自动运行并部署到 Cloudflare Workers"
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "请检查："
    echo "1. SSH 连接是否正常：ssh -T git@github-personal"
    echo "2. 远程仓库是否存在：https://github.com/The-Feng/mastra-rag-chatbot"
    echo "3. 查看详细错误信息"
    echo ""
    echo "详细故障排除请参考：TROUBLESHOOTING.md"
    exit 1
fi

