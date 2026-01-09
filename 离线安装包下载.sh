#!/bin/bash

# 🚀 离线科学上网安装包下载脚本
# 通过代理下载各种客户端

echo "=========================================="
echo "🚀 离线科学上网安装包下载脚本"
echo "=========================================="

# 检查网络连接
echo "1. 检查网络连接..."
if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    echo "✅ 网络连接正常"
else
    echo "❌ 网络连接失败，请检查网络"
    exit 1
fi

# 创建下载目录
DOWNLOAD_DIR="./科学上网客户端"
mkdir -p "$DOWNLOAD_DIR"
echo "📁 创建下载目录: $DOWNLOAD_DIR"

# 下载各种客户端
echo ""
echo "2. 开始下载客户端..."

# ClashX (GitHub国内镜像)
echo "📥 下载ClashX..."
if curl -L -o "$DOWNLOAD_DIR/ClashX.dmg" "https://download.fastgit.org/yichengchen/clashX/releases/download/1.90.1/ClashX.dmg" 2>/dev/null; then
    echo "✅ ClashX下载成功"
else
    echo "❌ ClashX下载失败，尝试备用地址..."
    if curl -L -o "$DOWNLOAD_DIR/ClashX.dmg" "https://hub.fastgit.xyz/yichengchen/clashX/releases/download/1.90.1/ClashX.dmg" 2>/dev/null; then
        echo "✅ ClashX下载成功（备用地址）"
    else
        echo "❌ ClashX下载失败"
    fi
fi

# Qv2ray
echo "📥 下载Qv2ray..."
if curl -L -o "$DOWNLOAD_DIR/Qv2ray.dmg" "https://download.fastgit.org/Qv2ray/Qv2ray/releases/download/v2.7.0/Qv2ray-v2.7.0.macOS-x64.dmg" 2>/dev/null; then
    echo "✅ Qv2ray下载成功"
else
    echo "❌ Qv2ray下载失败"
fi

# V2RayX
echo "📥 下载V2RayX..."
if curl -L -o "$DOWNLOAD_DIR/V2RayX.zip" "https://download.fastgit.org/Cenmrev/V2RayX/releases/download/1.5.1/V2RayX.app.zip" 2>/dev/null; then
    echo "✅ V2RayX下载成功"
else
    echo "❌ V2RayX下载失败"
fi

# Surge (付费但功能强大)
echo "📥 下载Surge..."
if curl -L -o "$DOWNLOAD_DIR/Surge.dmg" "https://download.surge.download/macos" 2>/dev/null; then
    echo "✅ Surge下载成功"
else
    echo "❌ Surge下载失败"
fi

echo ""
echo "3. 下载完成情况："
ls -la "$DOWNLOAD_DIR"/

echo ""
echo "=========================================="
echo "🎉 下载完成！"
echo ""
echo "📦 安装说明："
echo "1. 双击 .dmg 文件安装（ClashX、Qv2ray、Surge）"
echo "2. 解压 .zip 文件安装（V2RayX）"
echo "3. 启动应用并配置服务器信息"
echo ""
echo "🔧 服务器配置："
echo "地址: 47.237.178.168"
echo "端口: 3006"
echo "UUID: 00c47e6b-2cba-15b3-79ee-b1e596db2103"
echo "协议: VMess"
echo "传输: WebSocket"
echo "路径: /v2ray"
echo "=========================================="
