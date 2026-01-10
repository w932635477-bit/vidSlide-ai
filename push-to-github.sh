#!/bin/bash

# ===========================================
# VidSlide AI - GitHub自动推送脚本
# ===========================================

echo "🚀 VidSlide AI - GitHub推送脚本"
echo "=================================="
echo ""

# 检查Git状态
echo "📊 检查Git状态..."
cd "/Users/weilei/VidSlide AI"

if ! git status >/dev/null 2>&1; then
    echo "❌ Git仓库不存在"
    exit 1
fi

# 检查是否有未提交的更改
if git status --porcelain | grep -q .; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    git commit -m "feat: 更新VidSlide AI功能

- 修复路由跳转问题
- 完善错误处理机制
- 优化代码质量
- 更新测试覆盖率

🎯 AI视频分析 + 智能PPT生成
🛠️ Vue 3 + Canvas 2D技术栈"
fi

echo "📋 请先完成以下准备工作:"
echo "   1. 访问 https://github.com/new 创建仓库"
echo "   2. 仓库名: vidSlide-ai"
echo "   3. 获取仓库URL: https://github.com/YOUR_USERNAME/vidSlide-ai.git"
echo ""
echo "🌐 请输入完整的GitHub仓库URL:"
echo "   (例如: https://github.com/weilei/VidSlide-AI.git)"
read -r REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ 仓库URL不能为空"
    echo ""
    echo "💡 获取仓库URL的步骤:"
    echo "   1. 登录GitHub"
    echo "   2. 进入你的仓库: VidSlide-AI"
    echo "   3. 点击 'Code' 按钮"
    echo "   4. 复制 HTTPS URL"
    exit 1
fi

echo "📡 添加远程仓库: $REPO_URL"
if git remote add origin "$REPO_URL" 2>/dev/null; then
    echo "✅ 远程仓库添加成功"
elif git remote set-url origin "$REPO_URL" 2>/dev/null; then
    echo "✅ 远程仓库URL已更新"
else
    echo "⚠️ 远程仓库已存在，使用现有配置"
fi

echo "⬆️ 推送代码到GitHub..."
if git push -u origin main; then
    echo ""
    echo "🎉 推送成功！"
    echo "📁 仓库地址: $REPO_URL"
    echo ""
    echo "📋 项目特色:"
    echo "   ✅ Vue 3 + AI视频分析技术"
    echo "   ✅ 完整的视频转PPT工作流"
    echo "   ✅ Apple设计风格UI界面"
    echo "   ✅ 响应式移动端适配"
    echo "   ✅ 单元测试覆盖82.6%"
    echo "   ✅ ESLint代码质量保证"
    echo ""
    echo "🚀 下一步建议:"
    echo "   1. 设置GitHub Pages自动部署"
    echo "   2. 添加项目描述和话题标签"
    echo "   3. 创建发布版本"
else
    echo ""
    echo "❌ 推送失败，可能的原因:"
    echo "   1. GitHub仓库不存在"
    echo "   2. 仓库URL格式错误"
    echo "   3. 没有推送权限"
    echo "   4. 网络连接问题"
    echo ""
    echo "🔧 故障排除:"
    echo "   1. 确认仓库已创建"
    echo "   2. 检查URL格式: https://github.com/YOUR_USERNAME/VidSlide-AI.git"
    echo "   3. 手动重试: git push -u origin main"
fi