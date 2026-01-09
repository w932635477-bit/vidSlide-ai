#!/bin/bash
# 🛑 腾讯云科学上网停止脚本

echo "🛑 停止腾讯云科学上网服务"
echo "==========================="

# 停止V2Ray进程
echo "停止V2Ray客户端..."
pkill -f v2ray || echo "V2Ray进程未运行"

# 停止Privoxy进程
echo "停止Privoxy进程..."
pkill -f privoxy || echo "Privoxy进程未运行"

# 禁用系统代理
echo "禁用系统代理..."
networksetup -setwebproxystate Wi-Fi off
networksetup -setsecurewebproxystate Wi-Fi off

echo ""
echo "✅ 腾讯云科学上网服务已停止"
echo "浏览器将恢复直连网络"