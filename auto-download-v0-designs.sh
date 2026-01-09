#!/bin/bash

echo "=== 自动下载V0设计文件脚本 ==="
echo "GitHub仓库: https://github.com/w932635477-bit/v0-vid-slide-ai-apple-style-templates"
echo ""

# 设置代理
PROXY="http://127.0.0.1:1081"
BASE_URL="https://raw.githubusercontent.com/w932635477-bit/v0-vid-slide-ai-apple-style-templates/main"

# 创建目录
mkdir -p v0-design-exports/{templates,components,responsive}

cd v0-design-exports

echo "📂 开始下载Templates文件..."
echo ""

# 下载Templates文件
templates=(
    "vidSlide-pip-template.png"
    "vidSlide-info-card-template.png"
    "vidSlide-keyword-highlight-template.png"
    "vidSlide-document-display-template.png"
    "vidSlide-title-text-template.png"
)

for file in "${templates[@]}"; do
    echo "下载: $file"
    if curl -x "$PROXY" -L -o "templates/$file" "$BASE_URL/$file" --insecure --silent --show-error; then
        if [ -f "templates/$file" ] && [ -s "templates/$file" ]; then
            size=$(stat -f%z "templates/$file" 2>/dev/null || stat -c%s "templates/$file" 2>/dev/null)
            echo "✅ 成功: $file ($size bytes)"
        else
            echo "❌ 失败: $file (文件为空或不存在)"
            rm -f "templates/$file"
        fi
    else
        echo "❌ 失败: $file (下载错误)"
    fi
    echo ""
done

echo "🛠️ 开始下载Components文件..."
echo ""

# 下载Components文件
components=(
    "vidSlide-property-panel.png"
    "vidSlide-timeline-editor.png"
)

for file in "${components[@]}"; do
    echo "下载: $file"
    if curl -x "$PROXY" -L -o "components/$file" "$BASE_URL/$file" --insecure --silent --show-error; then
        if [ -f "components/$file" ] && [ -s "components/$file" ]; then
            size=$(stat -f%z "components/$file" 2>/dev/null || stat -c%s "components/$file" 2>/dev/null)
            echo "✅ 成功: $file ($size bytes)"
        else
            echo "❌ 失败: $file (文件为空或不存在)"
            rm -f "components/$file"
        fi
    else
        echo "❌ 失败: $file (下载错误)"
    fi
    echo ""
done

echo "📱 开始下载Responsive文件..."
echo ""

# 下载Responsive文件
responsive=(
    "vidSlide-templates-desktop.png"
    "vidSlide-templates-tablet.png"
    "vidSlide-templates-mobile.png"
)

for file in "${responsive[@]}"; do
    echo "下载: $file"
    if curl -x "$PROXY" -L -o "responsive/$file" "$BASE_URL/$file" --insecure --silent --show-error; then
        if [ -f "responsive/$file" ] && [ -s "responsive/$file" ]; then
            size=$(stat -f%z "responsive/$file" 2>/dev/null || stat -c%s "responsive/$file" 2>/dev/null)
            echo "✅ 成功: $file ($size bytes)"
        else
            echo "❌ 失败: $file (文件为空或不存在)"
            rm -f "responsive/$file"
        fi
    else
        echo "❌ 失败: $file (下载错误)"
    fi
    echo ""
done

echo "=== 下载完成统计 ==="
echo ""

# 统计结果
echo "Templates目录:"
ls -la templates/ | grep -v "^d" | wc -l
echo "文件列表:"
ls -la templates/

echo ""
echo "Components目录:"
ls -la components/ | grep -v "^d" | wc -l
echo "文件列表:"
ls -la components/

echo ""
echo "Responsive目录:"
ls -la responsive/ | grep -v "^d" | wc -l
echo "文件列表:"
ls -la responsive/

echo ""
echo "总文件数统计:"
total_files=$(find . -name "*.png" -type f | wc -l)
echo "PNG文件总数: $total_files"

if [ "$total_files" -eq 10 ]; then
    echo "🎉 恭喜！所有10个设计文件下载完成！"
elif [ "$total_files" -gt 0 ]; then
    echo "⚠️ 部分文件下载完成 ($total_files/10)，请检查缺失的文件"
else
    echo "❌ 下载失败，请检查："
    echo "   1. GitHub仓库是否存在且可访问"
    echo "   2. 文件名是否正确"
    echo "   3. 网络代理是否正常工作"
    echo "   4. 仓库是否为私有（需要登录）"
fi

echo ""
echo "=== 下一步操作 ==="
echo "1. 检查下载的文件质量"
echo "2. 运行质量验证: cat quality-checklist.md"
echo "3. 如有问题，请参考: cat download-instructions.md"
