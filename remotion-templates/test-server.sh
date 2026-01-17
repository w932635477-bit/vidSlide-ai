#!/bin/bash

# Remotion渲染服务器测试脚本

echo "🧪 测试Remotion渲染服务器"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SERVER_URL="http://localhost:3002"

# 测试1: 健康检查
echo "1️⃣  测试健康检查接口..."
HEALTH=$(curl -s "$SERVER_URL/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ 健康检查通过"
    echo "   响应: $HEALTH"
else
    echo "❌ 健康检查失败"
    exit 1
fi
echo ""

# 测试2: 获取模板列表
echo "2️⃣  测试模板列表接口..."
TEMPLATES=$(curl -s "$SERVER_URL/templates")
TEMPLATE_COUNT=$(echo "$TEMPLATES" | grep -o '"id"' | wc -l | tr -d ' ')
if [ "$TEMPLATE_COUNT" -gt 0 ]; then
    echo "✅ 模板列表获取成功"
    echo "   模板数量: $TEMPLATE_COUNT"
    echo "   前3个模板:"
    echo "$TEMPLATES" | grep -o '"name":"[^"]*"' | head -3 | sed 's/"name":"//g' | sed 's/"//g' | sed 's/^/   - /'
else
    echo "❌ 模板列表获取失败"
    exit 1
fi
echo ""

# 测试3: 测试渲染接口（不实际渲染）
echo "3️⃣  测试渲染接口..."
RENDER_RESPONSE=$(curl -s -X POST "$SERVER_URL/render" \
    -H "Content-Type: application/json" \
    -d '{
        "composition": "GlassmorphismStack",
        "props": {
            "title": "测试标题",
            "subtitle": "测试副标题"
        }
    }')

if echo "$RENDER_RESPONSE" | grep -q "renderId"; then
    echo "✅ 渲染接口响应正常"
    RENDER_ID=$(echo "$RENDER_RESPONSE" | grep -o '"renderId":"[^"]*"' | sed 's/"renderId":"//g' | sed 's/"//g')
    echo "   渲染ID: $RENDER_ID"

    # 等待一下再查询进度
    sleep 1

    # 测试4: 查询渲染进度
    echo ""
    echo "4️⃣  测试进度查询接口..."
    PROGRESS=$(curl -s "$SERVER_URL/progress/$RENDER_ID")
    if echo "$PROGRESS" | grep -q "status"; then
        echo "✅ 进度查询成功"
        echo "   响应: $PROGRESS"
    else
        echo "❌ 进度查询失败"
    fi
else
    echo "❌ 渲染接口测试失败"
    echo "   响应: $RENDER_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 所有测试完成！"
