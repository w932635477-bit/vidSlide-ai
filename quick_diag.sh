#!/bin/bash

echo "=== 快速诊断脚本 ==="
echo "时间: $(date)"
echo

echo "1. v2ray进程状态:"
ps aux | grep v2ray | grep -v grep || echo "❌ 未找到v2ray进程"
echo

echo "2. 系统代理状态:"
echo "HTTP代理: $(networksetup -getwebproxy Wi-Fi | grep -E 'Enabled|Server|Port' | tr '\n' ' ')"
echo "HTTPS代理: $(networksetup -getsecurewebproxy Wi-Fi | grep -E 'Enabled|Server|Port' | tr '\n' ' ')"
echo

echo "3. 代理端口检查:"
echo "1080 (SOCKS): $(nc -zv 127.0.0.1 1080 2>&1 | grep -o 'succeeded\|failed')"
echo "1081 (HTTP): $(nc -zv 127.0.0.1 1081 2>&1 | grep -o 'succeeded\|failed')"
echo

echo "4. 网络连通性:"
ping -c 1 8.8.8.8 >/dev/null 2>&1 && echo "✅ IP连通正常" || echo "❌ IP连通失败"
echo

echo "5. ECS服务器状态:"
ping -c 1 47.237.178.168 >/dev/null 2>&1 && echo "✅ ECS服务器可达" || echo "❌ ECS服务器不可达"
echo

echo "6. ECS端口检查:"
echo "SSH(22): $(nc -zv 47.237.178.168 22 2>&1 | grep -o 'succeeded\|failed')"
echo "V2Ray(3006): $(nc -zv 47.237.178.168 3006 2>&1 | grep -o 'succeeded\|failed')"
echo

echo "7. 代理功能测试:"
curl -x http://127.0.0.1:1081 --connect-timeout 3 --max-time 5 -s http://httpbin.org/ip >/dev/null 2>&1 && echo "✅ 代理功能正常" || echo "❌ 代理功能异常"
echo

echo "=== 诊断完成 ==="
