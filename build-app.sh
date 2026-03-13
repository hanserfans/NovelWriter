#!/bin/bash

# NovelWriter 快速打包脚本

echo "========================================="
echo "  NovelWriter 应用打包工具"
echo "========================================="
echo ""

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: 需要 Node.js 18 或更高版本"
    echo "当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $(node -v)"
echo ""

# 安装依赖
echo "📦 正在安装依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi
echo "✅ 依赖安装完成"
echo ""

# 编译应用
echo "🔨 正在编译应用..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi
echo "✅ 编译完成"
echo ""

# 询问打包平台
echo "请选择打包平台:"
echo "  1) macOS (Intel + Apple Silicon)"
echo "  2) macOS (仅 Intel)"
echo "  3) macOS (仅 Apple Silicon)"
echo "  4) Windows"
echo "  5) Linux"
echo "  6) 全平台"
echo ""
read -p "请输入选项 (1-6): " choice

case $choice in
    1)
        echo "📦 正在打包 macOS (Intel + Apple Silicon)..."
        npm run build:mac
        ;;
    2)
        echo "📦 正在打包 macOS (Intel)..."
        npx electron-builder --mac --x64
        ;;
    3)
        echo "📦 正在打包 macOS (Apple Silicon)..."
        npx electron-builder --mac --arm64
        ;;
    4)
        echo "📦 正在打包 Windows..."
        npm run build:win
        ;;
    5)
        echo "📦 正在打包 Linux..."
        npm run build:linux
        ;;
    6)
        echo "📦 正在打包全平台..."
        npm run build:all
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ 打包完成！"
    echo "========================================="
    echo ""
    echo "📁 安装包位置: dist/"
    echo ""
    ls -lh dist/ 2>/dev/null || echo "请查看 dist 目录"
    echo ""
    echo "💡 提示:"
    echo "  - macOS: .dmg 文件可直接分发给用户安装"
    echo "  - Windows: .exe 安装程序"
    echo "  - Linux: .AppImage 或 .deb 文件"
    echo ""
else
    echo ""
    echo "❌ 打包失败，请检查错误信息"
    exit 1
fi