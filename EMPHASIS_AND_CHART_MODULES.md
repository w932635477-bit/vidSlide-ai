# 📊 强调类和图表类模块实现方案

**日期**: 2026-01-20
**版本**: v2.1.0
**状态**: 📋 补充设计

---

## 📋 目录

1. [模块分析](#模块分析)
2. [强调类模块](#强调类模块)
3. [图表类模块](#图表类模块)
4. [技术实现](#技术实现)
5. [集成方案](#集成方案)

---

## 🔍 模块分析

### 强调类模块特征

**视觉特征**:
- 🖤 **背景**: 纯黑色或深色背景
- 🎯 **主体**: 单个关键词或概念图片，居中放置
- ✨ **特效**: 强烈的发光效果、边缘光晕
- 📏 **布局**: 极简，突出主体
- 💬 **文字**: 大号关键词文字叠加

**适用场景**:
- 核心概念强调
- 品牌词展示
- 重点观点突出
- 章节标题

### 图表类模块特征

**视觉特征**:
- 🖤 **背景**: 黑色或深色背景
- 📊 **主体**: 数据图表（柱状图、饼图、折线图等）
- 🎨 **配色**: 鲜艳的渐变色（蓝色、紫色、橙色等）
- 📈 **数据**: 清晰的数值标注
- 💡 **设计**: 现代、科技感强

**适用场景**:
- 数据对比
- 趋势展示
- 统计信息
- 成果展示

---

## 🎨 强调类模块

### 实现方案

**技术路线**: 豆包生图 + 黑色背景模板 + 强化特效

```
关键词 → 豆包生图API → 概念图片 → 黑色背景模板 → 添加特效 → 最终效果
```

### Prompt设计

```javascript
const emphasisPrompts = {
  concept: '{keyword}，概念图，简洁，现代，科技感，纯色背景，居中构图，高清',
  icon: '{keyword}，图标风格，扁平化，简约，科技感，透明背景，高清',
  abstract: '{keyword}，抽象艺术，几何图形，渐变色，科技感，高清',
  realistic: '{keyword}，写实风格，产品摄影，专业，高清'
}
```

### Remotion模板

**文件**: `remotion-templates/src/templates/BlackBackgroundEmphasis.jsx`

```jsx
import { AbsoluteFill, Img, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const BlackBackgroundEmphasis = ({
  imageUrl,           // 豆包生成的关键词图片
  keyword,            // 关键词文字
  subtitle,           // 副标题
  emphasisLevel = 'high', // 强调级别: 'high', 'medium', 'low'
  glowColor = '#667eea', // 发光颜色
  animationType = 'fade-scale' // 动画类型
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 根据强调级别调整特效强度
  const glowIntensity = {
    high: 0.8,
    medium: 0.5,
    low: 0.3
  }[emphasisLevel];

  // 淡入动画
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  // 缩放动画
  const scale = spring({
    frame: frame,
    fps,
    config: { damping: 20, stiffness: 100 }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* 背景光晕效果 */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at center, ${glowColor}20 0%, transparent 70%)`,
        opacity: glowIntensity
      }} />

      {/* 主图片 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${0.8 + scale * 0.2})`,
        opacity,
        maxWidth: '85%',
        maxHeight: '70%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Img 
          src={imageUrl} 
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '100%',
            objectFit: 'contain',
            filter: `drop-shadow(0 0 ${60 * glowIntensity}px ${glowColor})`
          }}
        />
      </div>

      {/* 关键词文字 */}
      {keyword && (
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: interpolate(frame, [30, 50], [0, 1]),
          fontSize: '96px',
          fontWeight: 'bold',
          color: '#ffffff',
          textShadow: `0 0 60px ${glowColor}`,
          letterSpacing: '8px',
          textAlign: 'center',
          maxWidth: '90%'
        }}>
          {keyword}
        </div>
      )}

      {/* 副标题 */}
      {subtitle && (
        <div style={{
          position: 'absolute',
          bottom: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: interpolate(frame, [40, 60], [0, 1]),
          fontSize: '40px',
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
          maxWidth: '80%'
        }}>
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};
```

### DoubaoImageService 扩展

**文件**: `vidslide-ai/src/services/DoubaoImageService.js`

```javascript
/**
 * 生成强调类图片
 * @param {string} keyword - 关键词
 * @param {string} style - 风格: 'concept', 'icon', 'abstract', 'realistic'
 * @returns {Promise<string>} 图片URL
 */
async generateEmphasisImage(keyword, style = 'concept') {
  const prompts = {
    concept: `${keyword}，概念图，简洁，现代，科技感，纯色背景，居中构图，高清，4K`,
    icon: `${keyword}，图标风格，扁平化，简约，科技感，透明背景，矢量图，高清`,
    abstract: `${keyword}，抽象艺术，几何图形，渐变色，蓝紫色调，科技感，高清`,
    realistic: `${keyword}，写实风格，产品摄影，专业光影，高清，4K`
  };

  return await this.generateImage(prompts[style], {
    size: '1024x1024',
    quality: 'hd',
    style: 'vivid'
  });
}
```

---

## 📊 图表类模块

### 实现方案

**技术路线**: 代码生成图表（Chart.js） + 黑色背景模板

```
数据 → Chart.js → Canvas渲染 → 导出图片 → 黑色背景模板 → 最终效果
```

**为什么不用豆包生图**:
- ❌ 图表数据准确性难以保证
- ❌ 无法精确控制数值
- ❌ 样式一致性差
- ✅ 代码生成更可控、更准确

### ChartGenerationService

**文件**: `vidslide-ai/src/services/ChartGenerationService.js`

```javascript
import { createCanvas } from 'canvas';
import Chart from 'chart.js/auto';

/**
 * 图表生成服务
 */
class ChartGenerationService {
  /**
   * 生成柱状图
   * @param {Array} data - 数据数组 [{label, value}]
   * @param {object} options - 图表选项
   * @returns {Promise<string>} 图表图片URL
   */
  async generateBarChart(data, options = {}) {
    const canvas = createCanvas(1080, 1200);
    const ctx = canvas.getContext('2d');

    // 使用Chart.js渲染
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: this.generateGradient(ctx, options.colors),
          borderRadius: 15,
          borderWidth: 0
        }]
      },
      options: {
        ...this.getDefaultChartOptions(),
        ...options
      }
    });

    // 导出为图片
    return canvas.toDataURL('image/png');
  }

  /**
   * 生成饼图
   */
  async generatePieChart(data, options = {}) {
    const canvas = createCanvas(1080, 1200);
    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: this.generateColorPalette(data.length),
          borderWidth: 3,
          borderColor: '#000000'
        }]
      },
      options: {
        ...this.getDefaultChartOptions(),
        ...options
      }
    });

    return canvas.toDataURL('image/png');
  }

  /**
   * 生成折线图
   */
  async generateLineChart(data, options = {}) {
    const canvas = createCanvas(1080, 1200);
    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.value),
          borderColor: options.lineColor || '#667eea',
          backgroundColor: this.generateGradient(ctx, options.colors, true),
          borderWidth: 4,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: '#ffffff'
        }]
      },
      options: {
        ...this.getDefaultChartOptions(),
        ...options
      }
    });

    return canvas.toDataURL('image/png');
  }

  /**
   * 生成渐变色
   */
  generateGradient(ctx, colors = ['#667eea', '#764ba2'], isArea = false) {
    const gradient = ctx.createLinearGradient(0, 0, 0, isArea ? 1200 : 800);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
  }

  /**
   * 生成调色板
   */
  generateColorPalette(count) {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0'
    ];
    return colors.slice(0, count);
  }

  /**
   * 默认图表配置（黑色主题）
   */
  getDefaultChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#ffffff',
            font: { size: 28, weight: 'bold' },
            padding: 20
          }
        },
        title: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: { 
            color: '#ffffff', 
            font: { size: 24 } 
          },
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            lineWidth: 1
          }
        },
        y: {
          ticks: { 
            color: '#ffffff', 
            font: { size: 24 } 
          },
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            lineWidth: 1
          }
        }
      }
    };
  }
}

export default new ChartGenerationService();
```

### ChartDataExtractor

**文件**: `vidslide-ai/src/services/ChartDataExtractor.js`

```javascript
/**
 * 图表数据提取器
 */
class ChartDataExtractor {
  /**
   * 从场景内容中提取图表数据
   */
  extractChartData(scene) {
    const { content, keywords, transcript } = scene;

    // 检测是否包含数据
    const hasNumbers = /\d+\.?\d*%?/.test(content);
    if (!hasNumbers) return null;

    // 提取数值和标签
    const dataPoints = this.parseDataPoints(content);
    if (dataPoints.length === 0) return null;

    // 判断图表类型
    const chartType = this.detectChartType(content, dataPoints);

    return {
      type: chartType,
      data: dataPoints,
      title: this.extractTitle(content),
      subtitle: this.extractSubtitle(content)
    };
  }

  /**
   * 解析数据点
   */
  parseDataPoints(content) {
    // 匹配模式: "标签: 数值" 或 "标签 数值%"
    const patterns = [
      /([^:：\d]+)[：:]\s*(\d+\.?\d*)%?/g,
      /([^:：\d]+)\s+(\d+\.?\d*)%/g,
      /(\d+\.?\d*)%?\s*([^:：\d]+)/g
    ];

    const dataPoints = [];
    for (const pattern of patterns) {
      let match;
      const tempData = [];
      while ((match = pattern.exec(content)) !== null) {
        tempData.push({
          label: (match[1] || match[2]).trim(),
          value: parseFloat(match[2] || match[1])
        });
      }
      if (tempData.length > 0) {
        dataPoints.push(...tempData);
        break;
      }
    }

    return dataPoints;
  }

  /**
   * 检测图表类型
   */
  detectChartType(content, dataPoints) {
    const lowerContent = content.toLowerCase();

    // 关键词匹配
    if (lowerContent.includes('对比') || lowerContent.includes('比较')) {
      return 'bar';
    }
    if (lowerContent.includes('占比') || lowerContent.includes('比例') || 
        lowerContent.includes('份额')) {
      return 'pie';
    }
    if (lowerContent.includes('趋势') || lowerContent.includes('增长') || 
        lowerContent.includes('变化')) {
      return 'line';
    }

    // 根据数据点数量判断
    if (dataPoints.length <= 5) {
      return 'pie';
    } else {
      return 'bar';
    }
  }

  /**
   * 提取标题
   */
  extractTitle(content) {
    // 提取第一句话作为标题
    const sentences = content.split(/[。！？\n]/);
    return sentences[0]?.trim() || '';
  }

  /**
   * 提取副标题
   */
  extractSubtitle(content) {
    // 提取第二句话作为副标题
    const sentences = content.split(/[。！？\n]/);
    return sentences[1]?.trim() || '';
  }
}

export default new ChartDataExtractor();
```

### Remotion模板

**文件**: `remotion-templates/src/templates/BlackBackgroundChart.jsx`

```jsx
import { AbsoluteFill, Img, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const BlackBackgroundChart = ({
  chartImageUrl,      // 图表图片URL
  title,              // 标题
  subtitle,           // 副标题
  chartType = 'bar',  // 图表类型: 'bar', 'pie', 'line'
  highlightColor = '#667eea', // 高亮颜色
  showAnimation = true // 是否显示动画
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 图表淡入 + 缩放动画
  const chartOpacity = interpolate(frame, [0, 30], [0, 1]);
  const chartScale = showAnimation ? spring({
    frame: frame,
    fps,
    config: { damping: 20, stiffness: 100 }
  }) : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* 背景光晕 */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at center, ${highlightColor}15 0%, transparent 70%)`,
        opacity: 0.5
      }} />

      {/* 标题 */}
      {title && (
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: interpolate(frame, [10, 30], [0, 1]),
          fontSize: '56px',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          textShadow: `0 0 30px ${highlightColor}`,
          maxWidth: '90%'
        }}>
          {title}
        </div>
      )}

      {/* 图表 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${0.8 + chartScale * 0.2})`,
        opacity: chartOpacity,
        width: '90%',
        maxHeight: '65%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Img 
          src={chartImageUrl} 
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '100%',
            objectFit: 'contain',
            filter: `drop-shadow(0 0 40px ${highlightColor}40)`
          }}
        />
      </div>

      {/* 副标题/说明 */}
      {subtitle && (
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: interpolate(frame, [40, 60], [0, 1]),
          fontSize: '36px',
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          maxWidth: '85%'
        }}>
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};
```

---

## 🔄 集成方案

### MicroSceneGenerator 更新

**文件**: `vidslide-ai/src/services/MicroSceneGenerator.js`

```javascript
import doubaoService from './DoubaoImageService.js';
import chartService from './ChartGenerationService.js';
import chartExtractor from './ChartDataExtractor.js';

class MicroSceneGenerator {
  async generateMicroScenes(segment, keywords, materials) {
    const scenes = [];

    // 1. 检查是否为图表场景
    const chartData = chartExtractor.extractChartData(segment);
    if (chartData) {
      const chartImage = await chartService.generateChart(chartData);
      scenes.push({
        type: 'composition',
        template: 'BlackBackgroundChart',
        chartImageUrl: chartImage,
        chartType: chartData.type,
        title: chartData.title,
        subtitle: chartData.subtitle,
        startTime: segment.startTime,
        endTime: segment.startTime + 5,
        duration: 5
      });
      return scenes;
    }

    // 2. 处理关键词场景
    for (const keyword of keywords) {
      if (this.isEmphasisScene(keyword)) {
        // 强调类场景
        const image = await doubaoService.generateEmphasisImage(
          keyword.text, 
          'concept'
        );
        scenes.push({
          type: 'composition',
          template: 'BlackBackgroundEmphasis',
          imageUrl: image,
          keyword: keyword.text,
          emphasisLevel: keyword.importance >= 0.9 ? 'high' : 'medium',
          glowColor: this.getGlowColor(keyword),
          startTime: keyword.timestamp,
          endTime: keyword.timestamp + 4,
          duration: 4
        });
      } else {
        // 普通场景
        const image = await doubaoService.generateImage(keyword.text);
        scenes.push({
          type: 'composition',
          template: 'BlackBackgroundKeyword',
          imageUrl: image,
          keyword: keyword.text,
          startTime: keyword.timestamp,
          endTime: keyword.timestamp + 3,
          duration: 3
        });
      }
    }

    return scenes;
  }

  /**
   * 判断是否为强调场景
   */
  isEmphasisScene(keyword) {
    return keyword.importance >= 0.8;
  }

  /**
   * 获取发光颜色
   */
  getGlowColor(keyword) {
    const colors = {
      high: '#667eea',    // 蓝紫色
      tech: '#4facfe',    // 蓝色
      success: '#43e97b', // 绿色
      warning: '#fee140', // 黄色
      danger: '#fa709a'   // 粉色
    };

    // 根据关键词类型返回颜色
    if (keyword.category === 'tech') return colors.tech;
    if (keyword.category === 'success') return colors.success;
    return colors.high;
  }
}

export default new MicroSceneGenerator();
```

---

## 📦 新增文件清单

### 服务层

1. `vidslide-ai/src/services/ChartGenerationService.js` - 图表生成服务
2. `vidslide-ai/src/services/ChartDataExtractor.js` - 图表数据提取器
3. `vidslide-ai/src/services/DoubaoImageService.js` - 扩展强调类图片生成

### Remotion模板层

1. `remotion-templates/src/templates/BlackBackgroundEmphasis.jsx` - 强调类模板
2. `remotion-templates/src/templates/BlackBackgroundChart.jsx` - 图表类模板

### 依赖包

```json
{
  "dependencies": {
    "chart.js": "^4.4.0",
    "canvas": "^2.11.2"
  }
}
```

---

## 📊 更新后的模板体系

```
黑色背景模板系列
├── BlackBackgroundKeyword      (基础: 单图+关键词)
├── BlackBackgroundEmphasis     (强调: 大图+强光效)  ← 新增
├── BlackBackgroundChart        (图表: 数据可视化)  ← 新增
├── BlackBackgroundTitle        (标题: 章节标题)
├── BlackBackgroundMulti        (多图: 网格布局)
└── BlackBackgroundComparison   (对比: 左右对比)
```

---

## 🎯 实施优先级

### Phase 1: 强调类模块 (优先)
- ✅ 视觉效果明显
- ✅ 实现简单
- ✅ 依赖豆包生图

### Phase 2: 图表类模块
- ✅ 技术价值高
- ⚠️ 需要额外依赖
- ⚠️ 数据提取逻辑复杂

---

**准备就绪！可以开始实施！** 🚀
