#!/bin/bash

# 批量渲染脚本 - 渲染第4批模板（11-13）

cd "/Users/weilei/VidSlide AI/remotion-templates"

# 创建输出目录
mkdir -p output/batch3

echo "开始渲染第4批3个模板（11-13）..."

# 11. AnimatedBarChart
echo "渲染 11/13: AnimatedBarChart..."
npx remotion render src/index.jsx AnimatedBarChart output/batch3/11-animated-bar-chart.mp4 \
  --codec h264 \
  --overwrite

# 12. CircularProgress
echo "渲染 12/13: CircularProgress..."
npx remotion render src/index.jsx CircularProgress output/batch3/12-circular-progress.mp4 \
  --codec h264 \
  --overwrite

# 13. LineChartFlow
echo "渲染 13/13: LineChartFlow..."
npx remotion render src/index.jsx LineChartFlow output/batch3/13-line-chart-flow.mp4 \
  --codec h264 \
  --overwrite

echo ""
echo "✅ 第4批渲染完成！"
echo "输出目录: output/batch3/"
echo ""
ls -lh output/batch3/
