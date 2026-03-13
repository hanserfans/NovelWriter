#!/bin/bash

# 设置国内镜像源以加速打包

echo "🔧 配置 Electron 镜像源..."

# 设置 Electron 镜像（淘宝镜像）
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
export ELECTRON_CUSTOM_DIR="v28.3.3"

# 设置其他镜像源
export SASS_BINARY_SITE="https://npmmirror.com/mirrors/node-sass/"
export PYTHON_MIRROR="https://npmmirror.com/mirrors/python/"

echo "✅ 镜像源配置完成"
echo "   Electron: $ELECTRON_MIRROR"
echo ""

# 执行打包
echo "📦 开始打包..."
npm run build:mac

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 打包成功！"
    echo "📁 请查看 dist/ 目录"
else
    echo ""
    echo "❌ 打包失败"
    echo "💡 建议："
    echo "  1. 检查网络连接"
    echo "  2. 尝试使用 VPN"
    echo "  3. 手动下载 Electron 到缓存目录"
fi