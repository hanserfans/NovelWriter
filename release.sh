#!/bin/bash

# NovelWriter GitHub Release 发布脚本

echo "========================================="
echo "  NovelWriter 发布助手"
echo "========================================="
echo ""

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  检测到未提交的更改"
    echo ""
    git status --short
    echo ""
    read -p "是否提交这些更改? (y/n): " commit_choice

    if [ "$commit_choice" = "y" ] || [ "$commit_choice" = "Y" ]; then
        read -p "提交信息: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo "✅ 更改已提交"
    else
        echo "❌ 请先提交或暂存更改"
        exit 1
    fi
fi

# 获取当前版本号
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📌 当前版本: v$CURRENT_VERSION"
echo ""

# 询问新版本号
read -p "请输入新版本号 (当前: $CURRENT_VERSION，回车跳过): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    NEW_VERSION=$CURRENT_VERSION
    echo "使用当前版本号: v$NEW_VERSION"
else
    # 更新 package.json 中的版本号
    npm version $NEW_VERSION --no-git-tag-version
    echo "✅ 版本号已更新到: v$NEW_VERSION"
fi

echo ""
echo "📋 准备发布 v$NEW_VERSION"
echo ""

# 更新 CHANGELOG
read -p "是否需要更新 CHANGELOG.md? (y/n): " update_changelog
if [ "$update_changelog" = "y" ] || [ "$update_changelog" = "Y" ]; then
    echo "请手动编辑 CHANGELOG.md"
    read -p "按回车键继续..."
fi

echo ""
echo "🚀 开始发布流程..."
echo ""

# 创建 Git 标签
TAG_NAME="v$NEW_VERSION"
echo "🏷️  创建标签: $TAG_NAME"
git tag -a $TAG_NAME -m "Release $TAG_NAME"

# 推送到 GitHub
echo ""
read -p "是否推送标签到 GitHub? (y/n): " push_choice

if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
    echo "📤 推送标签到 GitHub..."

    # 先推送代码
    git push origin main
    # 再推送标签
    git push origin $TAG_NAME

    echo ""
    echo "✅ 标签已推送到 GitHub"
    echo ""
    echo "🌐 GitHub Actions 将自动构建所有平台版本"
    echo ""
    echo "🔗 查看构建进度:"
    echo "   https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
    echo ""
    echo "📦 构建完成后，安装包将自动发布到:"
    echo "   https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/releases/tag/$TAG_NAME"
    echo ""
    echo "========================================="
    echo "  ✅ 发布流程已完成"
    echo "========================================="
else
    echo ""
    echo "⚠️  标签已创建但未推送"
    echo "手动推送命令: git push origin $TAG_NAME"
fi