#!/bin/bash

# 渲染第7批模板 (29-30)
# 混合效果类剩余

echo "🎬 开始渲染第7批模板 (29-30)..."

# 创建输出目录
mkdir -p output/batch7

# 29. CrystalPrism - 水晶棱镜
echo "🎨 渲染模板29: CrystalPrism..."
npx remotion render src/index.jsx CrystalPrism output/batch7/29-crystal-prism.mp4 \
  --props='{"title":"水晶棱镜","subtitle":"光线折射","brandColor":"#9B59B6"}' \
  --codec=h264

# 30. InkSpread - 墨水扩散
echo "🎨 渲染模板30: InkSpread..."
npx remotion render src/index.jsx InkSpread output/batch7/30-ink-spread.mp4 \
  --props='{"title":"墨水扩散","subtitle":"艺术效果","images":[],"brandColor":"#2D3436","accentColor":"#636E72"}' \
  --codec=h264

echo "✅ 第7批模板渲染完成！"
echo "📁 输出目录: output/batch7/"
ls -lh output/batch7/
