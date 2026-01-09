#!/bin/bash
# 🚀 安装腾讯云代理到系统PATH

echo "🚀 安装腾讯云科学上网到系统PATH"
echo "==============================="

SCRIPT_PATH="/Users/weilei/VidSlide AI/proxy"
GLOBAL_PATH="/usr/local/bin/proxy"

# 检查脚本是否存在
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ 错误：找不到代理脚本文件"
    exit 1
fi

# 检查是否已安装
if [ -L "$GLOBAL_PATH" ] || [ -f "$GLOBAL_PATH" ]; then
    echo "⚠️  proxy命令已存在于系统PATH中"
    echo "是否要覆盖？(y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "安装取消"
        exit 0
    fi
fi

# 创建符号链接
echo "📦 安装到系统PATH..."
if sudo ln -sf "$SCRIPT_PATH" "$GLOBAL_PATH"; then
    echo "✅ 安装成功！"
    echo ""
    echo "🎯 现在你可以在任何目录使用："
    echo "  proxy start    # 启动代理"
    echo "  proxy stop     # 停止代理"
    echo "  proxy status   # 查看状态"
    echo "  proxy test     # 测试连接"
    echo "  proxy help     # 显示帮助"
    echo ""
    echo "💡 例如："
    echo "  proxy start    # 一键启动科学上网"
    echo "  proxy status   # 检查代理状态"
else
    echo "❌ 安装失败，请检查权限"
    exit 1
fi

echo ""
echo "🎉 安装完成！现在可以在任何地方使用proxy命令了！"