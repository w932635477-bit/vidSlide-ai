# 抖音视频排版设计规范
## VidSlide AI 最佳实践指南

**版本**: 1.0
**日期**: 2026-01-20
**状态**: 设计阶段

---

## 一、核心设计原则

### 1.1 设计理念
- **清晰优先**: 信息层次分明，用户3秒内能抓住重点
- **呼吸感**: 留白充足，不拥挤
- **专业感**: 视觉精致，符合商业级标准
- **一致性**: 同一视频内风格统一

### 1.2 抖音视频特点
- **竖屏尺寸**: 1080x1920 (9:16)
- **观看时长**: 15-60秒，需要快速传达信息
- **UI预留**: 顶部状态栏、底部交互区
- **PIP视频**: 讲解人视频通常在右上角或底部

---

## 二、画布分区规范

### 2.1 安全区域定义

```
┌─────────────────────────────────┐ 0px
│   顶部安全区 (状态栏预留)        │
├─────────────────────────────────┤ 100px
│                                 │
│   标题区域                       │
│   - 主标题                       │
│   - 副标题（可选）               │
│                                 │
├─────────────────────────────────┤ 400px
│                                 │
│                                 │
│   主内容区                       │
│   - 图片/图表                    │
│   - 可视化内容                   │
│   - PIP视频（右上角）            │
│                                 │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤ 1600px
│                                 │
│   底部信息区                     │
│   - 关键词标签                   │
│   - 装饰文字                     │
│                                 │
├─────────────────────────────────┤ 1820px
│   底部安全区 (抖音UI预留)        │
└─────────────────────────────────┘ 1920px
```

### 2.2 区域尺寸

| 区域 | Y坐标范围 | 高度 | 用途 |
|------|----------|------|------|
| 顶部安全区 | 0-100 | 100px | 状态栏预留 |
| 标题区 | 100-400 | 300px | 主标题、副标题 |
| 主内容区 | 400-1600 | 1200px | 图片、图表、可视化 |
| 底部信息区 | 1600-1820 | 220px | 关键词、装饰文字 |
| 底部安全区 | 1820-1920 | 100px | 抖音UI预留 |

### 2.3 边距规范

```javascript
const margins = {
  horizontal: 60,      // 左右边距
  top: 100,           // 顶部边距
  bottom: 100,        // 底部边距
  contentPadding: 40  // 内容间距
};
```

---

## 三、图片布局方案

### 3.1 单图布局（1张图片）

**适用场景**: 重点强调、产品展示、人物特写

```
尺寸: 900x900
位置: 居中 (540, 960)
圆角: 24px
边框: 4px 白色/金色
阴影: 0 8px 32px rgba(0,0,0,0.3)
```

**布局示意**:
```
┌─────────────────────────────────┐
│         主标题                   │
├─────────────────────────────────┤
│                                 │
│        ┌─────────┐              │
│        │         │              │
│        │  单图   │   [PIP]      │
│        │         │              │
│        └─────────┘              │
│                                 │
├─────────────────────────────────┤
│  [关键词1] [关键词2] [关键词3]   │
└─────────────────────────────────┘
```

### 3.2 双图布局（2张图片）

**适用场景**: 对比、前后、AB测试

**方案A: 左右并排**
```
图1: (270, 900, 420x420)
图2: (810, 900, 420x420)
间距: 120px
```

**方案B: 上下排列**
```
图1: (540, 700, 700x700)
图2: (540, 1300, 700x700)
间距: 100px
```

**布局示意（左右）**:
```
┌─────────────────────────────────┐
│         主标题                   │
├─────────────────────────────────┤
│                                 │
│   ┌──────┐    ┌──────┐  [PIP]  │
│   │ 图1  │    │ 图2  │          │
│   └──────┘    └──────┘          │
│                                 │
├─────────────────────────────────┤
│  [关键词1] [关键词2] [关键词3]   │
└─────────────────────────────────┘
```

### 3.3 三图布局（3张图片）

**适用场景**: 步骤展示、多角度、系列内容

**方案A: 金字塔布局（推荐）**
```
图1: (540, 650, 700x700)   // 上方大图
图2: (300, 1300, 400x400)  // 左下小图
图3: (780, 1300, 400x400)  // 右下小图
```

**方案B: 网格布局**
```
图1: (270, 800, 420x420)
图2: (810, 800, 420x420)
图3: (540, 1300, 420x420)
```

**布局示意（金字塔）**:
```
┌─────────────────────────────────┐
│         主标题                   │
├─────────────────────────────────┤
│        ┌─────────┐              │
│        │  图1    │   [PIP]      │
│        └─────────┘              │
│                                 │
│   ┌──────┐    ┌──────┐          │
│   │ 图2  │    │ 图3  │          │
│   └──────┘    └──────┘          │
├─────────────────────────────────┤
│  [关键词1] [关键词2] [关键词3]   │
└─────────────────────────────────┘
```

### 3.4 四图布局（4张图片）

**适用场景**: 网格展示、多产品、对比矩阵

**2x2 网格布局**
```
图1: (300, 800, 400x400)   // 左上
图2: (780, 800, 400x400)   // 右上
图3: (300, 1280, 400x400)  // 左下
图4: (780, 1280, 400x400)  // 右下
间距: 80px
```

---

## 四、图片裁剪规范

### 4.1 裁剪策略

```javascript
const cropStrategies = {
  // 智能裁剪：保留主体
  smart: {
    fit: 'cover',
    position: 'attention',  // 使用Sharp的attention策略
    kernel: 'lanczos3'      // 高质量缩放
  },

  // 人物裁剪：保留人脸
  portrait: {
    fit: 'cover',
    position: 'entropy',    // 保留高信息密度区域
    withoutEnlargement: true
  },

  // 产品裁剪：完整展示
  product: {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    position: 'center'
  },

  // 风景裁剪：保留中心
  landscape: {
    fit: 'cover',
    position: 'center',
    kernel: 'lanczos3'
  }
};
```

### 4.2 裁剪边距

为避免裁得太紧，添加安全边距：

```javascript
// 在裁剪前先缩小5%，确保主体不被切掉
const safeResize = {
  width: targetWidth * 0.95,
  height: targetHeight * 0.95
};
```

### 4.3 图片质量

```javascript
const imageQuality = {
  format: 'png',           // 使用PNG保持质量
  compressionLevel: 6,     // 平衡质量和大小
  adaptiveFiltering: true  // 自适应过滤
};
```

---

## 五、文字排版规范

### 5.1 字体规范

| 元素 | 字体大小 | 字重 | 颜色 | 行高 |
|------|---------|------|------|------|
| 主标题 | 64px | Bold (700) | #FFFFFF | 1.2 |
| 副标题 | 40px | Medium (500) | rgba(255,255,255,0.9) | 1.3 |
| 关键词标签 | 24px | SemiBold (600) | #FFFFFF | 1.0 |
| 装饰文字 | 28px | Light (300) | rgba(255,255,255,0.6) | 1.2 |
| 数据标注 | 32px | Bold (700) | #FFD700 | 1.0 |

### 5.2 标题位置

```javascript
const titleConfig = {
  // 主标题
  main: {
    x: 540,              // 水平居中
    y: 220,              // 顶部220px
    maxWidth: 900,       // 最大宽度
    align: 'center',
    shadow: true         // 添加阴影增强可读性
  },

  // 副标题
  sub: {
    x: 540,
    y: 300,
    maxWidth: 800,
    align: 'center',
    opacity: 0.9
  }
};
```

### 5.3 关键词标签

```javascript
const keywordConfig = {
  position: {
    y: 1680,             // 底部固定位置
    startX: 100,         // 起始X坐标
    spacing: 20          // 标签间距
  },

  style: {
    height: 48,
    padding: 20,         // 左右内边距
    borderRadius: 24,    // 圆角
    backgroundColor: '#667eea',
    opacity: 0.95
  },

  text: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 600
  },

  maxCount: 3            // 最多显示3个关键词
};
```

### 5.4 文字特效

**发光效果（Glow）**:
```javascript
const glowEffect = {
  blur: 12,
  color: '#667eea',
  opacity: 0.8,
  spread: 4
};
```

**阴影效果（Shadow）**:
```javascript
const shadowEffect = {
  offsetX: 0,
  offsetY: 4,
  blur: 16,
  color: 'rgba(0,0,0,0.5)'
};
```

**描边效果（Stroke）**:
```javascript
const strokeEffect = {
  width: 2,
  color: '#000000',
  opacity: 0.3
};
```

---

## 六、视觉特效规范

### 6.1 背景渐变

```javascript
const backgroundGradients = {
  // 科技风格
  tech: {
    type: 'linear',
    angle: 180,
    stops: [
      { offset: 0, color: '#0a0e27' },
      { offset: 50, color: '#1a1f3a' },
      { offset: 100, color: '#0a0e27' }
    ]
  },

  // 商务风格
  business: {
    type: 'linear',
    angle: 180,
    stops: [
      { offset: 0, color: '#0f1419' },
      { offset: 50, color: '#1e2936' },
      { offset: 100, color: '#0f1419' }
    ]
  },

  // 数据风格
  data: {
    type: 'linear',
    angle: 180,
    stops: [
      { offset: 0, color: '#0d1b2a' },
      { offset: 50, color: '#1b263b' },
      { offset: 100, color: '#0d1b2a' }
    ]
  }
};
```

### 6.2 装饰元素

**线条装饰**:
```javascript
const decorativeLines = {
  // 顶部分隔线
  top: {
    x1: 100, y1: 380,
    x2: 980, y2: 380,
    stroke: '#667eea',
    strokeWidth: 2,
    opacity: 0.3
  },

  // 底部分隔线
  bottom: {
    x1: 100, y1: 1620,
    x2: 980, y2: 1620,
    stroke: '#667eea',
    strokeWidth: 2,
    opacity: 0.3
  }
};
```

**角落装饰**:
```javascript
const cornerDecorations = {
  topLeft: {
    points: '60,60 60,140 140,140',
    stroke: '#667eea',
    strokeWidth: 3,
    opacity: 0.5
  }
};
```

### 6.3 图片边框和阴影

```javascript
const imageEffects = {
  // 边框
  border: {
    width: 4,
    color: '#FFFFFF',
    radius: 24,
    opacity: 0.9
  },

  // 阴影
  shadow: {
    offsetX: 0,
    offsetY: 8,
    blur: 32,
    color: 'rgba(0,0,0,0.3)'
  },

  // 发光
  glow: {
    blur: 16,
    color: '#667eea',
    opacity: 0.4
  }
};
```

---

## 七、PIP视频配置

### 7.1 位置方案

**方案A: 右上角（推荐）**
```javascript
const pipConfig = {
  x: 720,              // 右侧留360px边距
  y: 120,              // 顶部留120px
  width: 320,
  height: 180,
  borderRadius: 16,
  borderWidth: 3,
  borderColor: '#FFFFFF'
};
```

**方案B: 右下角**
```javascript
const pipConfig = {
  x: 720,
  y: 1400,
  width: 320,
  height: 180,
  borderRadius: 16,
  borderWidth: 3,
  borderColor: '#FFFFFF'
};
```

### 7.2 PIP避让规则

```javascript
// 检查图片是否与PIP重叠
function checkPIPOverlap(imageRect, pipRect) {
  return !(
    imageRect.right < pipRect.left ||
    imageRect.left > pipRect.right ||
    imageRect.bottom < pipRect.top ||
    imageRect.top > pipRect.bottom
  );
}

// 如果重叠，调整图片位置
function adjustForPIP(layout, pipArea) {
  if (checkPIPOverlap(layout, pipArea)) {
    // 向左或向下移动图片
    layout.x -= 100;
  }
  return layout;
}
```

---

## 八、颜色规范

### 8.1 主题色

```javascript
const colorPalette = {
  // 主色调
  primary: '#667eea',      // 蓝紫色
  secondary: '#764ba2',    // 深紫色

  // 强调色
  accent: '#FFD700',       // 金色
  danger: '#ff6b6b',       // 红色
  success: '#51cf66',      // 绿色
  info: '#4ecdc4',         // 青色

  // 中性色
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: 'rgba(255,255,255,0.1)',
    200: 'rgba(255,255,255,0.2)',
    300: 'rgba(255,255,255,0.3)',
    600: 'rgba(255,255,255,0.6)',
    900: 'rgba(255,255,255,0.9)'
  },

  // 背景色
  background: {
    dark: '#0a0e27',
    medium: '#1a1f3a',
    light: '#2a2f4a'
  }
};
```

### 8.2 颜色使用规则

| 元素 | 颜色 | 用途 |
|------|------|------|
| 背景 | background.dark | 主背景 |
| 主标题 | white | 最高对比度 |
| 副标题 | gray.900 | 次要信息 |
| 关键词标签 | primary | 品牌色 |
| 强调内容 | accent | 吸引注意 |
| 装饰元素 | primary + opacity | 视觉点缀 |
| 数据标注 | accent | 突出数据 |

---

## 九、动画和过渡

### 9.1 入场动画

```javascript
const entranceAnimations = {
  // 淡入
  fadeIn: {
    duration: 0.5,
    easing: 'ease-out',
    from: { opacity: 0 },
    to: { opacity: 1 }
  },

  // 缩放进入
  zoomIn: {
    duration: 0.6,
    easing: 'ease-out',
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 }
  },

  // 滑入
  slideIn: {
    duration: 0.5,
    easing: 'ease-out',
    from: { y: 50, opacity: 0 },
    to: { y: 0, opacity: 1 }
  }
};
```

### 9.2 动画时序

```javascript
const animationTimeline = {
  background: { start: 0, duration: 0.3 },
  images: { start: 0.2, duration: 0.6, stagger: 0.1 },
  title: { start: 0.4, duration: 0.5 },
  keywords: { start: 0.6, duration: 0.4 },
  decorations: { start: 0.8, duration: 0.3 }
};
```

---

## 十、实现检查清单

### 10.1 布局检查

- [ ] 图片之间没有重叠
- [ ] 图片与PIP没有重叠
- [ ] 所有元素在安全区域内
- [ ] 边距符合规范（60px）
- [ ] 图片间距充足（≥80px）

### 10.2 文字检查

- [ ] 标题字体大小正确（64px）
- [ ] 标题位置合理（220px）
- [ ] 关键词不超过3个
- [ ] 文字有足够对比度
- [ ] 文字不遮挡重要内容

### 10.3 视觉检查

- [ ] 背景渐变自然
- [ ] 图片边框和阴影统一
- [ ] 颜色搭配和谐
- [ ] 装饰元素不喧宾夺主
- [ ] 整体有呼吸感

### 10.4 技术检查

- [ ] 图片裁剪保留主体
- [ ] 图片质量清晰
- [ ] SVG渲染正确
- [ ] 文字无锯齿
- [ ] 输出尺寸正确（1080x1920）

---

## 十一、常见问题和解决方案

### 11.1 图片重叠

**问题**: 多张图片堆叠在一起
**原因**: 布局算法没有考虑图片尺寸
**解决**: 使用固定布局模式，预定义每张图片的位置

### 11.2 标题遮挡内容

**问题**: 标题覆盖在图片上
**原因**: 标题位置太低
**解决**: 标题固定在220px，确保在标题区域内

### 11.3 图片裁剪不当

**问题**: 人脸或主体被切掉
**原因**: 使用简单的center裁剪
**解决**: 使用Sharp的attention或entropy策略

### 11.4 文字不清晰

**问题**: 文字模糊或有锯齿
**原因**: SVG渲染参数不当
**解决**: 添加阴影和描边增强可读性

### 11.5 画面太满

**问题**: 没有留白，显得拥挤
**原因**: 图片太大或太多
**解决**: 减小图片尺寸，增加间距

---

## 十二、性能优化

### 12.1 图片处理优化

```javascript
// 使用Sharp的高性能配置
const sharpConfig = {
  sequentialRead: true,    // 顺序读取
  limitInputPixels: false, // 不限制输入像素
  failOnError: false       // 容错处理
};
```

### 12.2 缓存策略

```javascript
// 缓存处理后的图片
const cacheKey = `${imagePath}_${width}x${height}_${fit}`;
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

### 12.3 并行处理

```javascript
// 并行处理多张图片
const processedImages = await Promise.all(
  images.map(img => processImage(img, layout))
);
```

---

## 十三、测试用例

### 13.1 单图测试

```javascript
const testCase1 = {
  mainTitle: 'AI大模型技术',
  keywords: ['人工智能', '深度学习', '神经网络'],
  images: ['robot.jpg'],
  stylePreset: 'tech'
};
```

### 13.2 双图测试

```javascript
const testCase2 = {
  mainTitle: '前后对比',
  keywords: ['效果显著', '数据驱动'],
  images: ['before.jpg', 'after.jpg'],
  stylePreset: 'business'
};
```

### 13.3 三图测试

```javascript
const testCase3 = {
  mainTitle: '三步实现目标',
  keywords: ['简单', '高效', '可靠'],
  images: ['step1.jpg', 'step2.jpg', 'step3.jpg'],
  stylePreset: 'data'
};
```

---

## 附录：参考资源

### A. 抖音视频设计规范
- 竖屏尺寸：1080x1920
- 安全区域：顶部100px，底部100px
- 推荐时长：15-60秒

### B. 字体推荐
- 中文：PingFang SC, Microsoft YaHei
- 英文：Arial, Helvetica, Roboto
- 数字：DIN, Futura

### C. 工具推荐
- 图片处理：Sharp
- 视频合成：FFmpeg
- 设计参考：抖音、快手、小红书

---

**文档维护**: 根据实际测试效果持续更新
**反馈渠道**: 记录用户反馈，优化设计规范
