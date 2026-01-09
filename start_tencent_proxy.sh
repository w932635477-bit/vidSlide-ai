#!/bin/bash
# 🚀 腾讯云科学上网启动脚本

echo "🚀 腾讯云轻量级服务器科学上网"
echo "=============================="

# 检查配置文件是否存在
if [ ! -f "tencent_client_config.json" ]; then
    echo "❌ 未找到客户端配置文件，请先运行配置脚本"
    echo "运行: ./tencent_proxy_setup.sh <服务器IP> <密码>"
    exit 1
fi

# 检查V2Ray是否已下载
if [ ! -f "v2ray" ]; then
    echo "📥 下载V2Ray客户端..."
    curl -L -o v2ray-macos.zip https://github.com/v2fly/v2ray-core/releases/latest/download/v2ray-macos-64.zip
    unzip -q v2ray-macos.zip
    chmod +x v2ray
fi

# 停止现有进程
echo "🛑 停止现有代理进程..."
pkill -f v2ray || true
pkill -f privoxy || true

# 启动V2Ray客户端
echo "⚡ 启动V2Ray客户端..."
./v2ray run -c tencent_client_config.json &
sleep 2

# 检查启动状态
if ps aux | grep -v grep | grep v2ray > /dev/null; then
    echo "✅ V2Ray客户端启动成功"
else
    echo "❌ V2Ray客户端启动失败"
    exit 1
fi

# 设置系统代理
echo "🌐 设置系统代理..."
networksetup -setwebproxy Wi-Fi 127.0.0.1 1081
networksetup -setsecurewebproxy Wi-Fi 127.0.0.1 1081

# 验证代理设置
echo "📋 当前代理设置："
networksetup -getwebproxy Wi-Fi
echo ""

# 测试连接
echo "🧪 测试网络连接..."
echo "测试Google连接："
curl -x http://127.0.0.1:1081 -I https://www.google.com --connect-timeout 10 --max-time 15 | head -1 || echo "❌ Google连接失败"

echo "测试GitHub连接："
curl -x http://127.0.0.1:1081 -I https://github.com --connect-timeout 10 --max-time 15 | head -1 || echo "❌ GitHub连接失败"

echo ""
echo "🎉 腾讯云科学上网配置完成！"
echo ""
echo "📝 使用说明："
echo "• 浏览器会自动使用代理"
echo "• 如需停止：./stop_tencent_proxy.sh"
echo "• 查看状态：ps aux | grep v2ray"
echo ""
echo "💡 提示：首次使用可能需要等待几秒钟建立连接"