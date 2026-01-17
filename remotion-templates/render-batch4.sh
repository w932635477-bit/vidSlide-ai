#!/bin/bash

# 渲染第4批模板 (14-18)
# 数据可视化类剩余 + 文字动画类开始

echo "🎬 开始渲染第4批模板 (14-18)..."

# 创建输出目录
mkdir -p output/batch4

# 14. RadarChart - 雷达图展示
echo "📊 渲染模板14: RadarChart..."
npx remotion render src/index.jsx RadarChart output/batch4/14-radar-chart.mp4 \
  --props='{"title":"能力雷达","subtitle":"综合评估","brandColor":"#8E44AD"}' \
  --codec=h264

# 15. InfographicGrid - 信息图表网格
echo "📊 渲染模板15: InfographicGrid..."
npx remotion render src/index.jsx InfographicGrid output/batch4/15-infographic-grid.mp4 \
  --props='{"title":"数据概览","subtitle":"关键指标","brandColor":"#E67E22"}' \
  --codec=h264

# 16. KineticTypography - 动态字体分解
echo "✍️ 渲染模板16: KineticTypography..."
npx remotion render src/index.jsx KineticTypography output/batch4/16-kinetic-typography.mp4 \
  --props='{"title":"KINETIC","subtitle":"Typography","brandColor":"#A29BFE"}' \
  --codec=h264

# 17. NeonGlowText - 霓虹发光文字
echo "✍️ 渲染模板17: NeonGlowText..."
npx remotion render src/index.jsx NeonGlowText output/batch4/17-neon-glow-text.mp4 \
  --props='{"title":"NEON","subtitle":"Glow Effect","brandColor":"#FF006E","accentColor":"#00F5FF"}' \
  --codec=h264

# 18. LiquidMorphText - 液态变形文字
echo "✍️ 渲染模板18: LiquidMorphText..."
npx remotion render src/index.jsx LiquidMorphText output/batch4/18-liquid-morph-text.mp4 \
  --props='{"title":"LIQUID","subtitle":"Morph Effect","brandColor":"#00B894"}' \
  --codec=h264

echo "✅ 第4批模板渲染完成！"
echo "📁 输出目录: output/batch4/"
ls -lh output/batch4/
