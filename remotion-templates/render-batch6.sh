#!/bin/bash

# 渲染第6批模板 (24-28)
# 创意特效类剩余 + 混合效果类开始

echo "🎬 开始渲染第6批模板 (24-28)..."

# 创建输出目录
mkdir -p output/batch6

# 24. MorphShapeTransition - 形态变换
echo "🎆 渲染模板24: MorphShapeTransition..."
npx remotion render src/index.jsx MorphShapeTransition output/batch6/24-morph-shape-transition.mp4 \
  --props='{"title":"形态变换","subtitle":"流体动画","brandColor":"#A29BFE"}' \
  --codec=h264

# 25. FloatingIslands - 漂浮岛屿
echo "🎆 渲染模板25: FloatingIslands..."
npx remotion render src/index.jsx FloatingIslands output/batch6/25-floating-islands.mp4 \
  --props='{"title":"漂浮岛屿","subtitle":"3D空间","brandColor":"#6C5CE7"}' \
  --codec=h264

# 26. MagneticCards - 磁吸卡片
echo "🎨 渲染模板26: MagneticCards..."
npx remotion render src/index.jsx MagneticCards output/batch6/26-magnetic-cards.mp4 \
  --props='{"title":"磁吸卡片","subtitle":"物理模拟","brandColor":"#6C5CE7"}' \
  --codec=h264

# 27. PerspectiveGallery - 透视画廊
echo "🎨 渲染模板27: PerspectiveGallery..."
npx remotion render src/index.jsx PerspectiveGallery output/batch6/27-perspective-gallery.mp4 \
  --props='{"title":"透视画廊","subtitle":"3D深度","images":[],"brandColor":"#E74C3C"}' \
  --codec=h264

# 28. SplitFlap - 翻页显示屏
echo "🎨 渲染模板28: SplitFlap..."
npx remotion render src/index.jsx SplitFlap output/batch6/28-split-flap.mp4 \
  --props='{"title":"SPLIT FLAP","subtitle":"Display Board","brandColor":"#2C3E50"}' \
  --codec=h264

echo "✅ 第6批模板渲染完成！"
echo "📁 输出目录: output/batch6/"
ls -lh output/batch6/
