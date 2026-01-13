#!/bin/bash

# VidSlide AI 推送状态检查脚本

echo "🔍 VidSlide AI 推送状态检查"
echo "================================"
echo ""

echo "📋 本地仓库状态:"
echo "----------------"
git status --short
echo ""

echo "📊 提交历史 (最近5条):"
echo "----------------------"
git log --oneline -5
echo ""

echo "🌐 远程仓库配置:"
echo "----------------"
git remote -v
echo ""

echo "📡 网络连接测试:"
echo "----------------"
echo "测试GitHub连接..."
if curl -s --max-time 10 https://github.com > /dev/null; then
    echo "✅ GitHub连接正常"
else
    echo "❌ GitHub连接失败 - 请检查网络设置"
fi
echo ""

echo "📦 备份文件状态:"
echo "----------------"
if [ -f "vidSlide-ai-v1.0.bundle" ]; then
    echo "✅ Git bundle备份: $(ls -lh vidSlide-ai-v1.0.bundle | awk '{print $5}')B"
else
    echo "❌ Git bundle备份不存在"
fi

if [ -f "vidSlide-ai-v1.0.tar.gz" ]; then
    echo "✅ 压缩包备份: $(ls -lh vidSlide-ai-v1.0.tar.gz | awk '{print $5}')B"
else
    echo "❌ 压缩包备份不存在"
fi
echo ""

echo "🚀 推送尝试:"
echo "------------"
echo "1. 直接推送 (推荐): git push origin ui-design"
echo "2. 强制推送: git push -f origin ui-design"
echo "3. SSH推送: 先配置SSH密钥，然后 git push origin ui-design"
echo "4. Bundle恢复: 在目标机器上使用 vidSlide-ai-v1.0.bundle"
echo ""

echo "💡 故障排除:"
echo "------------"
echo "- 如果网络问题持续，考虑使用VPN或移动网络"
echo "- 检查防火墙设置，确认443端口未被阻止"
echo "- 尝试使用GitHub Desktop等GUI工具"
echo "- 联系网络管理员确认是否有代理设置需求"
echo ""

echo "📞 技术支持:"
echo "------------"
echo "如需帮助，请提供以下信息："
echo "1. 推送时出现的具体错误信息"
echo "2. 当前网络环境 (公司网络/家庭网络/VPN等)"
echo "3. 使用的操作系统和Git版本"
echo ""

echo "🎯 目标: 将 c0a82eff 提交推送到 GitHub ui-design 分支"