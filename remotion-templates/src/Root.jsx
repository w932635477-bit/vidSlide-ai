/**
 * Remotion Root - 主入口文件
 * 注册所有独特的视频模板
 */
import React from 'react';
import { Composition } from 'remotion';

// 专用模板
import { MultiLayerVertical } from './templates/MultiLayerVertical';

// 基础展示类 (5个)
import { GlassmorphismStack } from './templates/GlassmorphismStack';
import { LuxuryProductShowcase } from './templates/LuxuryProductShowcase';
import { NeumorphismSoft } from './templates/NeumorphismSoft';
import { HolographicRainbow } from './templates/HolographicRainbow';
import { MinimalWhiteSpace } from './templates/MinimalWhiteSpace';

// 对比分析类 (5个)
import { SplitComparison } from './templates/SplitComparison';
import { BeforeAfterSlider } from './templates/BeforeAfterSlider';
import { DiagonalSplit } from './templates/DiagonalSplit';
import { CircularReveal } from './templates/CircularReveal';
import { FlipCard } from './templates/FlipCard';

// 数据可视化类 (5个)
import { AnimatedBarChart } from './templates/AnimatedBarChart';
import { CircularProgress } from './templates/CircularProgress';
import { LineChartFlow } from './templates/LineChartFlow';
import { RadarChart } from './templates/RadarChart';
import { InfographicGrid } from './templates/InfographicGrid';

// 文字动画类 (5个)
import { KineticTypography } from './templates/KineticTypography';
import { NeonGlowText } from './templates/NeonGlowText';
import { LiquidMorphText } from './templates/LiquidMorphText';
import { GlitchText } from './templates/GlitchText';
import { ThreeDExtrudeText } from './templates/ThreeDExtrudeText';

// 创意特效类 (5个)
import { ParticleExplosion } from './templates/ParticleExplosion';
import { RippleWave } from './templates/RippleWave';
import { LightBeamScan } from './templates/LightBeamScan';
import { MorphShapeTransition } from './templates/MorphShapeTransition';
import { FloatingIslands } from './templates/FloatingIslands';

// 混合效果类 (5个)
import { MagneticCards } from './templates/MagneticCards';
import { PerspectiveGallery } from './templates/PerspectiveGallery';
import { SplitFlap } from './templates/SplitFlap';
import { CrystalPrism } from './templates/CrystalPrism';
import { InkSpread } from './templates/InkSpread';

export const RemotionRoot = () => {
  return (
    <>
      {/* ========== 专用模板 - 多层竖版视频 ========== */}

      <Composition
        id="MultiLayerVertical"
        component={MultiLayerVertical}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: '多层竖版模板',
          subtitle: '专为抖音优化',
          content: '',
          backgroundMaterial: null,
          chartData: null,
          brandColor: '#3742FA',
          accentColor: '#FF6B6B',
        }}
      />
      {/* ========== 基础展示类 (5个) ========== */}

      <Composition
        id="GlassmorphismStack"
        component={GlassmorphismStack}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '磨砂玻璃堆叠',
          subtitle: '3D卡片效果',
          images: [],
          brandColor: '#007AFF',
        }}
      />

      <Composition
        id="LuxuryProductShowcase"
        component={LuxuryProductShowcase}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '奢华系列',
          subtitle: '尊贵品质',
          images: [],
          accentColor: '#FFD700',
        }}
      />

      <Composition
        id="NeumorphismSoft"
        component={NeumorphismSoft}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '新拟态设计',
          subtitle: '柔和质感',
          images: [],
          brandColor: '#5B9FED',
          backgroundColor: '#e0e5ec',
        }}
      />

      <Composition
        id="HolographicRainbow"
        component={HolographicRainbow}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '全息投影',
          subtitle: '未来科技',
          images: [],
          brandColor: '#00F5FF',
        }}
      />

      <Composition
        id="MinimalWhiteSpace"
        component={MinimalWhiteSpace}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '极简主义',
          subtitle: 'Less is More',
          images: [],
          brandColor: '#000000',
          accentColor: '#666666',
        }}
      />

      {/* ========== 对比分析类 (5个) ========== */}

      <Composition
        id="SplitComparison"
        component={SplitComparison}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          leftTitle: '传统方案',
          rightTitle: '我们的方案',
          leftImage: null,
          rightImage: null,
          leftColor: '#FF6B6B',
          rightColor: '#4ECDC4',
        }}
      />

      <Composition
        id="BeforeAfterSlider"
        component={BeforeAfterSlider}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '前后对比',
          subtitle: '滑动查看差异',
          leftImage: null,
          rightImage: null,
          leftLabel: 'BEFORE',
          rightLabel: 'AFTER',
          brandColor: '#007AFF',
        }}
      />

      <Composition
        id="DiagonalSplit"
        component={DiagonalSplit}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '对角线对比',
          subtitle: '动态分割',
          leftImage: null,
          rightImage: null,
          leftLabel: '方案A',
          rightLabel: '方案B',
          brandColor: '#FF6B6B',
          accentColor: '#4ECDC4',
        }}
      />

      <Composition
        id="CircularReveal"
        component={CircularReveal}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '圆形揭示',
          subtitle: '中心扩散',
          beforeImage: null,
          afterImage: null,
          beforeLabel: 'BEFORE',
          afterLabel: 'AFTER',
          brandColor: '#9B59B6',
        }}
      />

      <Composition
        id="FlipCard"
        component={FlipCard}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '翻转对比',
          subtitle: '3D翻转效果',
          frontImage: null,
          backImage: null,
          frontLabel: '正面',
          backLabel: '反面',
          brandColor: '#E74C3C',
          accentColor: '#3498DB',
        }}
      />

      {/* ========== 数据可视化类 (3个) ========== */}

      <Composition
        id="AnimatedBarChart"
        component={AnimatedBarChart}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: '数据增长',
          subtitle: '季度对比',
          brandColor: '#3742FA',
        }}
      />

      <Composition
        id="CircularProgress"
        component={CircularProgress}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '完成进度',
          subtitle: '项目状态',
          percentage: 75,
          brandColor: '#2ED573',
          accentColor: '#1ABC9C',
        }}
      />

      <Composition
        id="LineChartFlow"
        component={LineChartFlow}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '增长趋势',
          subtitle: '持续上升',
          brandColor: '#FFA502',
        }}
      />

      <Composition
        id="RadarChart"
        component={RadarChart}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '能力雷达',
          subtitle: '综合评估',
          brandColor: '#8E44AD',
        }}
      />

      <Composition
        id="InfographicGrid"
        component={InfographicGrid}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '数据概览',
          subtitle: '关键指标',
          brandColor: '#E67E22',
        }}
      />

      {/* ========== 文字动画类 (5个) ========== */}

      <Composition
        id="KineticTypography"
        component={KineticTypography}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'KINETIC',
          subtitle: 'Typography',
          brandColor: '#A29BFE',
        }}
      />

      <Composition
        id="NeonGlowText"
        component={NeonGlowText}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'NEON',
          subtitle: 'Glow Effect',
          brandColor: '#FF006E',
          accentColor: '#00F5FF',
        }}
      />

      <Composition
        id="LiquidMorphText"
        component={LiquidMorphText}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'LIQUID',
          subtitle: 'Morph Effect',
          brandColor: '#00B894',
        }}
      />

      <Composition
        id="GlitchText"
        component={GlitchText}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'GLITCH',
          subtitle: 'Digital Error',
          brandColor: '#00FF41',
          accentColor: '#FF0080',
        }}
      />

      <Composition
        id="ThreeDExtrudeText"
        component={ThreeDExtrudeText}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '3D TEXT',
          subtitle: 'Extrude Effect',
          brandColor: '#FF6B6B',
          accentColor: '#4ECDC4',
        }}
      />

      {/* ========== 创意特效类 (5个) ========== */}

      <Composition
        id="ParticleExplosion"
        component={ParticleExplosion}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '粒子爆炸',
          subtitle: '能量释放',
          brandColor: '#FF6B6B',
        }}
      />

      <Composition
        id="RippleWave"
        component={RippleWave}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '涟漪波纹',
          subtitle: '水波扩散',
          brandColor: '#4ECDC4',
        }}
      />

      <Composition
        id="LightBeamScan"
        component={LightBeamScan}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '光束扫描',
          subtitle: '科技感',
          brandColor: '#00F5FF',
        }}
      />

      <Composition
        id="MorphShapeTransition"
        component={MorphShapeTransition}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '形态变换',
          subtitle: '流体动画',
          brandColor: '#A29BFE',
        }}
      />

      <Composition
        id="FloatingIslands"
        component={FloatingIslands}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '漂浮岛屿',
          subtitle: '3D空间',
          brandColor: '#6C5CE7',
        }}
      />

      {/* ========== 混合效果类 (5个) ========== */}

      <Composition
        id="MagneticCards"
        component={MagneticCards}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '磁吸卡片',
          subtitle: '物理模拟',
          brandColor: '#6C5CE7',
        }}
      />

      <Composition
        id="PerspectiveGallery"
        component={PerspectiveGallery}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '透视画廊',
          subtitle: '3D深度',
          images: [],
          brandColor: '#E74C3C',
        }}
      />

      <Composition
        id="SplitFlap"
        component={SplitFlap}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'SPLIT FLAP',
          subtitle: 'Display Board',
          brandColor: '#2C3E50',
        }}
      />

      <Composition
        id="CrystalPrism"
        component={CrystalPrism}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '水晶棱镜',
          subtitle: '光线折射',
          brandColor: '#9B59B6',
        }}
      />

      <Composition
        id="InkSpread"
        component={InkSpread}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: '墨水扩散',
          subtitle: '艺术效果',
          images: [],
          brandColor: '#2D3436',
          accentColor: '#636E72',
        }}
      />
    </>
  );
};
