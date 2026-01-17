#!/bin/bash

# 渲染第5批模板 (19-23)
# 文字动画类剩余 + 创意特效类开始

echo "🎬 开始渲染第5批模板 (19-23)..."

# 创建输出目录
mkdir -p output/batch5

# 19. GlitchText - 故障艺术文字
echo "✍️ 渲染模板19: GlitchText..."
npx remotion render src/index.jsx GlitchText output/batch5/19-glitch-text.mp4 \
  --props='{"title":"GLITCH","subtitle":"Digital Error","brandColor":"#00FF41","accentColor":"#FF0080"}' \
  --codec=h264

# 20. ThreeDExtrudeText - 3D挤出文字
echo "✍️ 渲染模板20: ThreeDExtrudeText..."
npx remotion render src/index.jsx ThreeDExtrudeText output/batch5/20-3d-extrude-text.mp4 \
  --props='{"title":"3D TEXT","subtitle":"Extrude Effect","brandColor":"#FF6B6B","accentColor":"#4ECDC4"}' \
  --codec=h264

# 21. ParticleExplosion - 粒子爆炸
echo "🎆 渲染模板21: ParticleExplosion..."
npx remotion render src/index.jsx ParticleExplosion output/batch5/21-particle-explosion.mp4 \
  --props='{"title":"粒子爆炸","subtitle":"能量释放","brandColor":"#FF6B6B"}' \
  --codec=h264

# 22. RippleWave - 涟漪波纹
echo "🎆 渲染模板22: RippleWave..."
npx remotion render src/index.jsx RippleWave output/batch5/22-ripple-wave.mp4 \
  --props='{"title":"涟漪波纹","subtitle":"水波扩散","brandColor":"#4ECDC4"}' \
  --codec=h264

# 23. LightBeamScan - 光束扫描
echo "🎆 渲染模板23: LightBeamScan..."
npx remotion render src/index.jsx LightBeamScan output/batch5/23-light-beam-scan.mp4 \
  --props='{"title":"光束扫描","subtitle":"科技感","brandColor":"#00F5FF"}' \
  --codec=h264

echo "✅ 第5批模板渲染完成！"
echo "📁 输出目录: output/batch5/"
ls -lh output/batch5/
