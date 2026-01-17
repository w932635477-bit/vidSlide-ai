/**
 * 批量模板生成脚本
 * 快速创建 25 个高级模板
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 模板定义
const templates = [
  // 产品展示类 (5个)
  {
    id: 'GlassmorphismStack',
    name: '磨砂玻璃卡片堆叠',
    category: 'product',
    description: '磨砂效果、双边框、多层阴影',
    created: true, // 已创建
  },
  {
    id: 'LuxuryProductShowcase',
    name: '奢华产品展示',
    category: 'product',
    description: '金色光泽、高级渐变、精致阴影',
  },
  {
    id: 'MinimalElegance',
    name: '极简优雅',
    category: 'product',
    description: '简约设计、细腻动画、高级留白',
  },
  {
    id: 'NeumorphismCard',
    name: '新拟态卡片',
    category: 'product',
    description: '柔和阴影、内外凸效果、细腻质感',
  },
  {
    id: 'HolographicDisplay',
    name: '全息投影展示',
    category: 'product',
    description: '彩虹渐变、光泽效果、未来感',
  },

  // 对比分析类 (5个)
  {
    id: 'PremiumSplitScreen',
    name: '高级分屏对比',
    category: 'comparison',
    description: '磨砂分割线、渐变背景、精致动画',
  },
  {
    id: 'BeforeAfterSlider',
    name: '前后滑动对比',
    category: 'comparison',
    description: '滑动效果、双边框、柔和过渡',
  },
  {
    id: 'VSBattle',
    name: 'VS对战效果',
    category: 'comparison',
    description: '能量光效、冲击波、动态对抗',
  },
  {
    id: 'MirrorComparison',
    name: '镜像对比',
    category: 'comparison',
    description: '镜面反射、对称美学、高级质感',
  },
  {
    id: 'GradientTransition',
    name: '渐变过渡对比',
    category: 'comparison',
    description: '流体渐变、平滑过渡、色彩融合',
  },

  // 数据可视化类 (5个)
  {
    id: 'AnimatedBarChart',
    name: '动态柱状图',
    category: 'data',
    description: '流畅动画、渐变填充、数字滚动',
  },
  {
    id: 'CircularProgress',
    name: '环形进度图',
    category: 'data',
    description: '圆环动画、发光效果、百分比显示',
  },
  {
    id: 'LineChartGrowth',
    name: '增长曲线图',
    category: 'data',
    description: '曲线绘制、光点跟随、数据标注',
  },
  {
    id: 'InfographicStats',
    name: '信息图表统计',
    category: 'data',
    description: '图标动画、数字计数、卡片布局',
  },
  {
    id: 'DataDashboard',
    name: '数据仪表盘',
    category: 'data',
    description: '多图表组合、实时更新、科技感',
  },

  // 文字动画类 (5个)
  {
    id: 'KineticTypography',
    name: '动态字体',
    category: 'text',
    description: '文字分解、粒子效果、流动动画',
  },
  {
    id: 'GlowingText',
    name: '发光文字',
    category: 'text',
    description: '霓虹效果、光晕扩散、渐变色彩',
  },
  {
    id: 'TextReveal',
    name: '文字揭示',
    category: 'text',
    description: '遮罩动画、逐字显示、优雅过渡',
  },
  {
    id: 'ThreeDText',
    name: '3D立体文字',
    category: 'text',
    description: '立体效果、光影变化、旋转动画',
  },
  {
    id: 'LiquidText',
    name: '液态文字',
    category: 'text',
    description: '流体效果、波浪动画、柔和变形',
  },

  // 创意特效类 (5个)
  {
    id: 'ParticleExplosion',
    name: '粒子爆炸',
    category: 'creative',
    description: '粒子系统、爆炸效果、光点飞散',
  },
  {
    id: 'RippleEffect',
    name: '涟漪扩散',
    category: 'creative',
    description: '波纹动画、同心圆、渐变扩散',
  },
  {
    id: 'LightBeam',
    name: '光束扫描',
    category: 'creative',
    description: '光束效果、扫描动画、科技感',
  },
  {
    id: 'MorphTransition',
    name: '形态变换',
    category: 'creative',
    description: '形状过渡、流畅变形、创意转场',
  },
  {
    id: 'FloatingElements',
    name: '漂浮元素',
    category: 'creative',
    description: '悬浮动画、缓慢飘动、空间感',
  },
];

console.log(`📋 模板列表 (共 ${templates.length} 个):\n`);

templates.forEach((template, index) => {
  const status = template.created ? '✅' : '⏳';
  console.log(`${status} ${index + 1}. ${template.name} (${template.id})`);
  console.log(`   类别: ${template.category} | ${template.description}`);
});

console.log(`\n✅ 已创建: ${templates.filter(t => t.created).length} 个`);
console.log(`⏳ 待创建: ${templates.filter(t => !t.created).length} 个`);

export { templates };
