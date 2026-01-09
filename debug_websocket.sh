#!/bin/bash

echo "=== WebSocket连接调试脚本 ==="
echo ""

# 测试基本的TCP连接
echo "1. 测试TCP连接到ECS 3128端口:"
if nc -zv 47.237.178.168 3128 2>/dev/null; then
    echo "   ✅ TCP连接成功"
else
    echo "   ❌ TCP连接失败 - ECS服务未启动或端口未开放"
    exit 1
fi
echo ""

# 测试WebSocket握手 (使用curl)
echo "2. 测试WebSocket握手:"
echo "   尝试连接到: ws://47.237.178.168:3128/v2ray"

# 使用curl测试WebSocket (如果支持)
if command -v curl >/dev/null 2>&1; then
    # 尝试HTTP升级到WebSocket
    result=$(curl -I -H "Upgrade: websocket" -H "Connection: Upgrade" -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" -H "Sec-WebSocket-Version: 13" http://47.237.178.168:3128/v2ray --connect-timeout 5 --max-time 10 2>/dev/null | head -1)
    if echo "$result" | grep -q "101 Switching Protocols"; then
        echo "   ✅ WebSocket握手成功"
    else
        echo "   ❌ WebSocket握手失败"
        echo "   响应: $result"
    fi
else
    echo "   ⚠️  curl不支持WebSocket测试"
fi
echo ""

# 检查本地v2ray日志
echo "3. 检查本地v2ray连接日志:"
echo "   查看最近的v2ray日志输出..."
echo ""

# 提供手动测试命令
echo "4. 手动测试命令:"
echo "   # 测试TCP连接"
echo "   nc -zv 47.237.178.168 3128"
echo ""
echo "   # 测试WebSocket (如果有websocat工具)"
echo "   echo '测试WebSocket连接' | websocat ws://47.237.178.168:3128/v2ray"
echo ""

# 检查阿里云安全组建议
echo "5. 阿里云安全组检查:"
echo "   登录阿里云控制台 → ECS实例 → 安全组"
echo "   确保有入站规则:"
echo "   - 协议: TCP"
echo "   - 端口: 3128"
echo "   - 来源: 0.0.0.0/0"
echo ""

echo "=== 调试完成 ==="
