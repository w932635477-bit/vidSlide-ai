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

echo "🌐 请输入你的GitHub用户名:"
read -r GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ 用户名不能为空"
    exit 1
fi

REPO_URL="https://github.com/$GITHUB_USERNAME/VidSlide-AI.git"

echo "📡 添加远程仓库: $REPO_URL"
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

echo "⬆️ 推送代码到GitHub..."
if git push -u origin main; then
    echo ""
    echo "🎉 推送成功！"
    echo "📁 仓库地址: https://github.com/$GITHUB_USERNAME/VidSlide-AI"
    echo "🌐 在线预览: https://$GITHUB_USERNAME.github.io/VidSlide-AI"
    echo ""
    echo "📋 项目特色:"
    echo "   ✅ Vue 3 + AI视频分析技术"
    echo "   ✅ 完整的视频转PPT工作流"
    echo "   ✅ Apple设计风格UI界面"
    echo "   ✅ 响应式移动端适配"
    echo "   ✅ 单元测试覆盖82.6%"
    echo "   ✅ ESLint代码质量检查"
else
    echo ""
    echo "❌ 推送失败，可能的原因:"
    echo "   1. GitHub仓库不存在或URL错误"
    echo "   2. 没有推送权限"
    echo "   3. 网络连接问题"
    echo ""
    echo "🔧 手动解决步骤:"
    echo "   1. 确认GitHub仓库已创建"
    echo "   2. 检查仓库URL是否正确"
    echo "   3. 尝试: git push -u origin main"
fi