#!/bin/bash

# VidSlide AI 多智能体系统 - 快速启动脚本

echo "🚀 VidSlide AI 多智能体系统 - 快速启动"
echo "=========================================="
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装Node.js"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo ""

# 进入项目目录
cd "$(dirname "$0")/vidslide-ai"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

# 检查socket.io
if ! grep -q "socket.io" package.json; then
    echo "📦 安装socket.io..."
    npm install socket.io
    echo ""
fi

echo "✅ 依赖检查完成"
echo ""

# 启动服务器
echo "🚀 启动多智能体后端服务器..."
echo "=========================================="
echo ""
echo "📋 API端点:"
echo "  - GET  http://localhost:3002/health"
echo "  - POST http://localhost:3002/api/multi-agent/process"
echo "  - GET  http://localhost:3002/api/multi-agent/status/:taskId"
echo "  - GET  http://localhost:3002/api/multi-agent/timeline/:taskId"
echo "  - GET  http://localhost:3002/api/multi-agent/download/:taskId"
echo ""
echo "🤖 多智能体系统:"
echo "  - Phase 1: ContentAnalyst (内容理解)"
echo "  - Phase 2: SceneDesigner (场景设计)"
echo "  - Phase 3: LayerOrchestrator (层编排)"
echo "  - Phase 4: QualityDirector (质量检查)"
echo "  - Phase 5: VideoEngineer (视频合成)"
echo ""
echo "🌐 测试页面:"
echo "  - file://$(pwd)/../multi-agent-test.html"
echo ""
echo "=========================================="
echo "按 Ctrl+C 停止服务器"
echo "=========================================="
echo ""

node server.js
