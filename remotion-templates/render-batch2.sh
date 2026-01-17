#!/bin/bash

# 批量渲染脚本 - 渲染第3批模板（8-10）

cd "/Users/weilei/VidSlide AI/remotion-templates"

# 创建输出目录
mkdir -p output/batch2

echo "开始渲染第3批3个模板（8-10）..."

# 8. DiagonalSplit
echo "渲染 8/10: DiagonalSplit..."
npx remotion render src/index.jsx DiagonalSplit output/batch2/8-diagonal-split.mp4 \
  --codec h264 \
  --overwrite

# 9. CircularReveal
echo "渲染 9/10: CircularReveal..."
npx remotion render src/index.jsx CircularReveal output/batch2/9-circular-reveal.mp4 \
  --codec h264 \
  --overwrite

# 10. FlipCard
echo "渲染 10/10: FlipCard..."
npx remotion render src/index.jsx FlipCard output/batch2/10-flip-card.mp4 \
  --codec h264 \
  --overwrite

echo ""
echo "✅ 第3批渲染完成！"
echo "输出目录: output/batch2/"
echo ""
ls -lh output/batch2/
