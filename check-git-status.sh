#!/bin/bash

echo "=== Git 状态检查 ==="
echo ""

echo "1. 当前目录："
pwd
echo ""

echo "2. Git 远程配置："
git remote -v
echo ""

echo "3. 当前分支："
git branch
echo ""

echo "4. 提交记录（最近 5 个）："
git log --oneline -5
echo ""

echo "5. 未推送的提交："
git log --oneline origin/main..HEAD 2>&1 || echo "  无法连接到远程仓库或远程分支不存在"
echo ""

echo "6. SSH 连接测试："
ssh -T git@github-personal 2>&1
echo ""

echo "7. 检查远程仓库连接："
git ls-remote origin 2>&1 | head -3
echo ""

echo "=== 检查完成 ==="

