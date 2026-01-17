#!/bin/bash

# 批量渲染脚本 - 渲染所有独特模板

cd "/Users/weilei/VidSlide AI/remotion-templates"

# 创建输出目录
mkdir -p output/batch1

echo "开始渲染7个独特模板..."

# 1. GlassmorphismStack
echo "渲染 1/7: GlassmorphismStack..."
npx remotion render src/index.jsx GlassmorphismStack output/batch1/1-glassmorphism-stack.mp4 \
  --codec h264 \
  --overwrite

# 2. LuxuryProductShowcase
echo "渲染 2/7: LuxuryProductShowcase..."
npx remotion render src/index.jsx LuxuryProductShowcase output/batch1/2-luxury-product.mp4 \
  --codec h264 \
  --overwrite

# 3. NeumorphismSoft
echo "渲染 3/7: NeumorphismSoft..."
npx remotion render src/index.jsx NeumorphismSoft output/batch1/3-neumorphism-soft.mp4 \
  --codec h264 \
  --overwrite

# 4. HolographicRainbow
echo "渲染 4/7: HolographicRainbow..."
npx remotion render src/index.jsx HolographicRainbow output/batch1/4-holographic-rainbow.mp4 \
  --codec h264 \
  --overwrite

# 5. MinimalWhiteSpace
echo "渲染 5/7: MinimalWhiteSpace..."
npx remotion render src/index.jsx MinimalWhiteSpace output/batch1/5-minimal-whitespace.mp4 \
  --codec h264 \
  --overwrite

# 6. SplitComparison
echo "渲染 6/7: SplitComparison..."
npx remotion render src/index.jsx SplitComparison output/batch1/6-split-comparison.mp4 \
  --codec h264 \
  --overwrite

# 7. BeforeAfterSlider
echo "渲染 7/7: BeforeAfterSlider..."
npx remotion render src/index.jsx BeforeAfterSlider output/batch1/7-before-after-slider.mp4 \
  --codec h264 \
  --overwrite

echo ""
echo "✅ 渲染完成！"
echo "输出目录: output/batch1/"
echo ""
ls -lh output/batch1/
