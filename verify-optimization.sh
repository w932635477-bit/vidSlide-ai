#!/bin/bash

# VidSlide AI 首页优化验证脚本
# 用于检查CSS优化是否正确应用

echo "🔍 VidSlide AI 首页优化验证"
echo "================================"
echo ""

# 检查CSS文件
echo "📄 检查CSS文件..."
CSS_FILE="/Users/weilei/VidSlide AI/vidslide-ai/src/styles/home-apple-style.css"

if [ -f "$CSS_FILE" ]; then
    FILE_SIZE=$(ls -lh "$CSS_FILE" | awk '{print $5}')
    echo "✅ CSS文件存在: $FILE_SIZE"

    # 检查关键优化点
    echo ""
    echo "🎨 检查关键优化..."

    # 检查间距系统
    if grep -q "spacing-lg: 48px" "$CSS_FILE"; then
        echo "✅ 间距系统已升级 (spacing-lg: 48px)"
    else
        echo "❌ 间距系统未升级"
    fi

    # 检查Logo尺寸
    if grep -q "width: 40px" "$CSS_FILE"; then
        echo "✅ Logo尺寸已增大 (40px)"
    else
        echo "❌ Logo尺寸未增大"
    fi

    # 检查导航栏不透明度
    if grep -q "rgba(255, 255, 255, 0.92)" "$CSS_FILE"; then
        echo "✅ 导航栏不透明度已提高 (0.92)"
    else
        echo "❌ 导航栏不透明度未提高"
    fi

    # 检查Apple标准色值
    if grep -q "#1D1D1F" "$CSS_FILE"; then
        echo "✅ Apple标准色值已应用 (#1D1D1F)"
    else
        echo "❌ Apple标准色值未应用"
    fi

    # 检查背景图片
    if grep -q "hero-bg.png" "$CSS_FILE"; then
        echo "✅ 背景图片已添加"
    else
        echo "❌ 背景图片未添加"
    fi
else
    echo "❌ CSS文件不存在"
fi

echo ""
echo "🖼️  检查图片资源..."

# 检查背景图片
if [ -f "/Users/weilei/VidSlide AI/vidslide-ai/public/assets/hero-bg.png" ]; then
    BG_SIZE=$(ls -lh "/Users/weilei/VidSlide AI/vidslide-ai/public/assets/hero-bg.png" | awk '{print $5}')
    echo "✅ 英雄区背景图: $BG_SIZE"
else
    echo "❌ 英雄区背景图不存在"
fi

# 检查占位符图片
PLACEHOLDER_COUNT=$(find "/Users/weilei/VidSlide AI/vidslide-ai/public/assets/placeholders" -name "*.png" 2>/dev/null | wc -l)
echo "✅ 占位符图片: $PLACEHOLDER_COUNT 张"

echo ""
echo "🌐 检查开发服务器..."

# 检查开发服务器是否运行
if curl -s http://localhost:5176/ > /dev/null 2>&1; then
    echo "✅ 开发服务器运行中: http://localhost:5176/"
else
    echo "❌ 开发服务器未运行"
    echo "   请运行: cd vidslide-ai && npm run dev"
fi

echo ""
echo "================================"
echo "📊 验证完成！"
echo ""
echo "💡 如果样式没有生效，请尝试："
echo "   1. 在浏览器中按 Cmd+Shift+R 强制刷新"
echo "   2. 清除浏览器缓存"
echo "   3. 使用无痕模式访问"
echo ""
echo "📖 查看详细文档："
echo "   - OPTIMIZATION_COMPLETE.md - 优化完成报告"
echo "   - OPTIMIZATION_REPORT.md - 详细优化说明"
echo "   - public/assets/PLACEHOLDER_IMAGES.md - 图片使用说明"
