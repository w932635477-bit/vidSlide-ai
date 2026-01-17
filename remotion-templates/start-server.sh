#!/bin/bash

# Remotion渲染服务器一键启动脚本

echo "🚀 启动Remotion渲染服务器..."
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"

# 进入remotion-templates目录
cd "$(dirname "$0")"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 创建output目录
if [ ! -d "output" ]; then
    mkdir -p output
    echo "📁 创建output目录"
fi

# 启动服务器
echo ""
echo "🎬 启动渲染服务器..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node server.js
