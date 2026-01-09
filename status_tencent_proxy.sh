#!/bin/bash
# 📊 腾讯云科学上网状态检查脚本

echo "📊 腾讯云科学上网状态检查"
echo "==========================="

# 检查V2Ray进程
echo "🔍 V2Ray客户端状态："
if ps aux | grep -v grep | grep v2ray > /dev/null; then
    echo "✅ V2Ray运行中"
    ps aux | grep -v grep | grep v2ray | awk '{print "   PID: " $2 " | CPU: " $3 "% | MEM: " $4 "%"}'
else
    echo "❌ V2Ray未运行"
fi

echo ""

# 检查端口监听
echo "🔍 本地端口状态："
echo "SOCKS5端口 (1080): $(lsof -i :1080 2>/dev/null | grep LISTEN | wc -l) 个连接"
echo "HTTP端口 (1081): $(lsof -i :1081 2>/dev/null | grep LISTEN | wc -l) 个连接"

echo ""

# 检查系统代理设置
echo "🔍 系统代理设置："
WEB_PROXY=$(networksetup -getwebproxy Wi-Fi | grep "Enabled:" | awk '{print $2}')
SECURE_PROXY=$(networksetup -getsecurewebproxy Wi-Fi | grep "Enabled:" | awk '{print $2}')

if [ "$WEB_PROXY" = "Yes" ]; then
    echo "✅ HTTP代理已启用"
else
    echo "❌ HTTP代理未启用"
fi

if [ "$SECURE_PROXY" = "Yes" ]; then
    echo "✅ HTTPS代理已启用"
else
    echo "❌ HTTPS代理未启用"
fi

echo ""

# 测试网络连接
echo "🧪 网络连接测试："
echo -n "Google: "
curl -x http://127.0.0.1:1081 -I https://www.google.com --connect-timeout 5 --max-time 10 2>/dev/null | head -1 | grep -q "200\|301\|302" && echo "✅ 连接成功" || echo "❌ 连接失败"

echo -n "GitHub: "
curl -x http://127.0.0.1:1081 -I https://github.com --connect-timeout 5 --max-time 10 2>/dev/null | head -1 | grep -q "200\|301\|302" && echo "✅ 连接成功" || echo "❌ 连接失败"

echo ""

# 显示配置信息
echo "📋 配置信息："
if [ -f "tencent_client_config.json" ]; then
    SERVER_IP=$(grep -o '"address": "[^"]*"' tencent_client_config.json | cut -d'"' -f4)
    echo "服务器IP: $SERVER_IP"
    echo "本地SOCKS5端口: 1080"
    echo "本地HTTP端口: 1081"
else
    echo "❌ 未找到配置文件"
fi