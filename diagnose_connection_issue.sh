#!/bin/bash

echo "=== 连接问题深度诊断 ==="
echo "时间: $(date)"
echo

echo "🔍 问题分析："
echo "安全组规则显示3006端口已开放，但实际无法连接"
echo

echo "📋 已确认的配置："
echo "✅ 安全组规则：3006端口 允许 0.0.0.0/0 优先级1"
echo "✅ ECS v2ray服务：运行正常 端口监听正常"
echo "✅ 本地v2ray客户端：运行正常"
echo "❌ 外部连接：3006端口连接超时"
echo

echo "🎯 可能的原因："
echo "1. ECS实例内部防火墙 (iptables/ufw)"
echo "2. 阿里云实例安全组规则未生效"
echo "3. v2ray配置问题 (WebSocket路径)"
echo "4. 阿里云地域网络限制"
echo

echo "🛠️ 建议的检查步骤："
echo ""
echo "第一步：在ECS上检查防火墙"
echo "sudo ufw status"
echo "sudo iptables -L -n | grep 3006"
echo ""
echo "第二步：检查v2ray配置"
echo "cat /usr/local/etc/v2ray/config.json"
echo "curl -v http://localhost:3006"
echo ""
echo "第三步：测试WebSocket连接"
echo "curl -v -H 'Upgrade: websocket' -H 'Connection: Upgrade' http://localhost:3006/v2ray"
echo ""
echo "第四步：检查阿里云控制台"
echo "- 确认安全组规则已保存"
echo "- 检查ECS实例状态 (运行中)"
echo "- 确认实例所在地域网络正常"
echo

echo "💡 临时解决方案："
echo "如果问题无法快速解决，可以临时使用以下方式："
echo "1. 禁用系统代理：networksetup -setwebproxystate Wi-Fi off"
echo "2. 使用本地功能：vidslide-working.html (基础功能)"
echo "3. 等待阿里云安全组生效 (可能需要更长时间)"
echo

echo "=== 诊断完成 ==="
