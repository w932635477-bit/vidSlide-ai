# 🎨 VidSlide AI - 视觉设计规范

## 📋 设计系统总览 (Design System Overview)

基于苹果设计哲学，我们建立了一套完整的设计系统，确保VidSlide AI在所有平台和设备上都能提供一致、高质量的用户体验。

---

## 🎨 色彩系统 (Color System)

### 品牌色彩 (Brand Colors)

#### 主品牌色 (Primary)
- **VidSlide Blue**: `#007AFF`
  - RGB: (0, 122, 255)
  - 使用场景: 主要按钮、链接、强调元素
  - 对比度: 满足WCAG AA标准

#### 辅助品牌色 (Secondary)
- **VidSlide Gold**: `#FFD700`
  - RGB: (255, 215, 0)
  - 使用场景: 成功状态、完成操作、奖励元素

#### AI特色色 (AI Accent)
- **VidSlide Green**: `#34C759`
  - RGB: (52, 199, 89)
  - 使用场景: AI功能、智能化操作、智能建议

### 功能色彩 (Functional Colors)

#### 状态色彩 (Status Colors)
```css
/* 成功状态 */
.success { color: #34C759; }
.success-bg { background: rgba(52, 199, 89, 0.1); }

/* 警告状态 */
.warning { color: #FF9500; }
.warning-bg { background: rgba(255, 149, 0, 0.1); }

/* 错误状态 */
.error { color: #FF3B30; }
.error-bg { background: rgba(255, 59, 48, 0.1); }

/* 信息状态 */
.info { color: #007AFF; }
.info-bg { background: rgba(0, 122, 255, 0.1); }
```

#### 功能模块色彩 (Module Colors)
```css
/* 视频编辑 */
.video-module { border-left: 4px solid #FF6B35; }

/* PPT设计 */
.ppt-module { border-left: 4px solid #007AFF; }

/* 文字处理 */
.text-module { border-left: 4px solid #5856D6; }

/* AI功能 */
.ai-module { border-left: 4px solid #34C759; }
```

### 主题系统 (Theme System)

#### 深色主题 (Dark Theme - Default)
```css
:root.dark {
  --bg-primary: #1A1A1A;
  --bg-secondary: #2A2A2A;
  --bg-tertiary: #3A3A3A;

  --text-primary: #FFFFFF;
  --text-secondary: #CCCCCC;
  --text-tertiary: #999999;

  --border-primary: #38383A;
  --border-secondary: #48484A;

  --shadow-primary: rgba(0, 0, 0, 0.3);
  --shadow-secondary: rgba(0, 0, 0, 0.5);
}
```

#### 浅色主题 (Light Theme)
```css
:root.light {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8F9FA;
  --bg-tertiary: #E9ECEF;

  --text-primary: #1A1A1A;
  --text-secondary: #6C757D;
  --text-tertiary: #ADB5BD;

  --border-primary: #DEE2E6;
  --border-secondary: #CED4DA;

  --shadow-primary: rgba(0, 0, 0, 0.1);
  --shadow-secondary: rgba(0, 0, 0, 0.15);
}
```

---

## 🔤 字体系统 (Typography System)

### 字体族 (Font Family)

#### 主要字体 (Primary)
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
             'Helvetica Neue', Helvetica, Arial, sans-serif;
```

#### 等宽字体 (Monospace)
```css
font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
```

### 字体层级 (Type Scale)

#### 标题字体 (Headings)
```css
.h1 { font-size: 2.5rem; font-weight: 600; line-height: 1.2; } /* 40px */
.h2 { font-size: 2rem;   font-weight: 600; line-height: 1.25; } /* 32px */
.h3 { font-size: 1.5rem; font-weight: 600; line-height: 1.3; }  /* 24px */
.h4 { font-size: 1.25rem; font-weight: 600; line-height: 1.4; } /* 20px */
.h5 { font-size: 1.125rem; font-weight: 600; line-height: 1.4; } /* 18px */
.h6 { font-size: 1rem;   font-weight: 600; line-height: 1.5; } /* 16px */
```

#### 正文字体 (Body Text)
```css
.body-large { font-size: 1.125rem; font-weight: 400; line-height: 1.6; } /* 18px */
.body { font-size: 1rem;         font-weight: 400; line-height: 1.6; } /* 16px */
.body-small { font-size: 0.875rem; font-weight: 400; line-height: 1.5; } /* 14px */
.body-xs { font-size: 0.75rem;   font-weight: 400; line-height: 1.5; } /* 12px */
```

#### 界面字体 (Interface)
```css
.caption { font-size: 0.75rem; font-weight: 500; line-height: 1.4; }  /* 12px */
.label { font-size: 0.8125rem; font-weight: 500; line-height: 1.4; } /* 13px */
.button { font-size: 0.875rem; font-weight: 500; line-height: 1.2; } /* 14px */
```

### 响应式字体 (Responsive Typography)

#### 桌面端 (Desktop)
```css
@media (min-width: 1024px) {
  .hero-title { font-size: 4rem; }   /* 64px */
  .hero-subtitle { font-size: 1.5rem; } /* 24px */
}
```

#### 平板端 (Tablet)
```css
@media (min-width: 768px) and (max-width: 1023px) {
  .hero-title { font-size: 3rem; }   /* 48px */
  .hero-subtitle { font-size: 1.25rem; } /* 20px */
}
```

#### 移动端 (Mobile)
```css
@media (max-width: 767px) {
  .hero-title { font-size: 2.5rem; } /* 40px */
  .hero-subtitle { font-size: 1.125rem; } /* 18px */
}
```

---

## 🎯 图标系统 (Icon System)

### 图标风格 (Icon Style)

#### SF Symbols 风格 (Primary)
- **来源**: 苹果SF Symbols图标库
- **风格**: 现代、简洁、一致性强
- **尺寸**: 16px, 20px, 24px, 32px, 40px
- **粗细**: Regular (标准), Medium (中等), Semibold (半粗)

#### 自定义图标 (Custom)
- **风格**: 继承SF Symbols的设计语言
- **比例**: 遵循4px网格系统
- **粗细**: 2px线条宽度
- **圆角**: 2px圆角半径

### 图标尺寸规范 (Icon Size Specifications)

```css
/* 界面图标 */
.icon-xs { width: 16px; height: 16px; }  /* 小图标 */
.icon-sm { width: 20px; height: 20px; }  /* 中小图标 */
.icon-md { width: 24px; height: 24px; }  /* 中等图标 */
.icon-lg { width: 32px; height: 32px; }  /* 大图标 */
.icon-xl { width: 40px; height: 40px; }  /* 特大图标 */

/* 按钮图标 */
.btn-icon-sm { width: 16px; height: 16px; }
.btn-icon-md { width: 18px; height: 18px; }
.btn-icon-lg { width: 20px; height: 20px; }
```

### 图标颜色 (Icon Colors)

```css
/* 主要图标颜色 */
.icon-primary { color: #007AFF; }
.icon-secondary { color: #6C757D; }
.icon-success { color: #34C759; }
.icon-warning { color: #FF9500; }
.icon-error { color: #FF3B30; }

/* 深色主题适配 */
.dark .icon-secondary { color: #CCCCCC; }
.dark .icon-muted { color: #999999; }
```

---

## 📐 间距系统 (Spacing System)

### 基础间距 (Base Spacing)
基于4px网格系统，所有间距都是4的倍数。

```css
/* 基础单位 */
.space-1 { width: 4px; height: 4px; }   /* 1单位 */
.space-2 { width: 8px; height: 8px; }   /* 2单位 */
.space-3 { width: 12px; height: 12px; } /* 3单位 */
.space-4 { width: 16px; height: 16px; } /* 4单位 */
.space-5 { width: 20px; height: 20px; } /* 5单位 */
.space-6 { width: 24px; height: 24px; } /* 6单位 */
.space-8 { width: 32px; height: 32px; } /* 8单位 */
.space-10 { width: 40px; height: 40px; } /* 10单位 */
.space-12 { width: 48px; height: 48px; } /* 12单位 */
.space-16 { width: 64px; height: 64px; } /* 16单位 */
```

### 组件间距 (Component Spacing)

#### 内边距 (Padding)
```css
/* 按钮内边距 */
.btn-sm { padding: 8px 16px; }   /* 小按钮 */
.btn-md { padding: 12px 24px; }  /* 中按钮 */
.btn-lg { padding: 16px 32px; }  /* 大按钮 */

/* 卡片内边距 */
.card-sm { padding: 16px; }      /* 小卡片 */
.card-md { padding: 24px; }      /* 中卡片 */
.card-lg { padding: 32px; }      /* 大卡片 */

/* 输入框内边距 */
.input-sm { padding: 8px 12px; } /* 小输入框 */
.input-md { padding: 12px 16px; } /* 中输入框 */
.input-lg { padding: 16px 20px; } /* 大输入框 */
```

#### 外边距 (Margin)
```css
/* 元素间距 */
.stack-xs { margin-bottom: 8px; }  /* 小堆叠 */
.stack-sm { margin-bottom: 16px; } /* 中堆叠 */
.stack-md { margin-bottom: 24px; } /* 大堆叠 */
.stack-lg { margin-bottom: 32px; } /* 特大堆叠 */
.stack-xl { margin-bottom: 48px; } /* 超大堆叠 */

/* 容器边距 */
.container-sm { margin: 0 16px; } /* 小容器 */
.container-md { margin: 0 24px; } /* 中容器 */
.container-lg { margin: 0 32px; } /* 大容器 */
.container-xl { margin: 0 auto; max-width: 1200px; } /* 特大容器 */
```

---

## 🌊 动画系统 (Animation System)

### 动画原则 (Animation Principles)
- **目的性**: 每个动画都有明确的目的
- **一致性**: 所有动画使用统一的缓动函数
- **性能**: 优先使用transform和opacity
- **层次感**: 不同元素有不同的动画时长

### 缓动函数 (Easing Functions)

```css
/* 标准缓动 */
.ease-standard { transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.ease-decelerate { transition-timing-function: cubic-bezier(0.0, 0.0, 0.2, 1); }
.ease-accelerate { transition-timing-function: cubic-bezier(0.4, 0.0, 1, 1); }

/* 苹果风格缓动 */
.ease-apple { transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1); }
.ease-bounce { transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55); }
```

### 动画时长 (Animation Duration)

```css
/* 微动画 */
.duration-micro { transition-duration: 0.1s; }   /* 100ms */
.duration-quick { transition-duration: 0.2s; }   /* 200ms */
.duration-standard { transition-duration: 0.3s; } /* 300ms */

/* 长动画 */
.duration-slow { transition-duration: 0.5s; }    /* 500ms */
.duration-slower { transition-duration: 0.7s; }  /* 700ms */
```

### 预定义动画 (Predefined Animations)

#### 淡入淡出 (Fade)
```css
.fade-in {
  animation: fadeIn 0.3s ease-apple;
}

.fade-out {
  animation: fadeOut 0.3s ease-apple;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

#### 缩放 (Scale)
```css
.scale-in {
  animation: scaleIn 0.3s ease-bounce;
}

.scale-out {
  animation: scaleOut 0.2s ease-apple;
}

@keyframes scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes scaleOut {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.8); opacity: 0; }
}
```

#### 滑动 (Slide)
```css
.slide-in-right {
  animation: slideInRight 0.3s ease-apple;
}

.slide-in-left {
  animation: slideInLeft 0.3s ease-apple;
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

---

## 📦 组件库 (Component Library)

### 按钮组件 (Button Components)

#### 主要按钮 (Primary Button)
```css
.btn-primary {
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  transition: all 0.2s ease-apple;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}
```

#### 次要按钮 (Secondary Button)
```css
.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #007AFF;
  border: 1px solid rgba(0, 122, 255, 0.3);
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease-apple;
}

.btn-secondary:hover {
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.5);
}
```

### 卡片组件 (Card Components)

#### 标准卡片 (Standard Card)
```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px var(--shadow-primary);
  transition: all 0.3s ease-apple;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow-secondary);
}
```

#### 功能卡片 (Feature Card)
```css
.feature-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease-apple;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #007AFF, #34C759, #FFD700);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow-secondary);
}
```

### 输入组件 (Input Components)

#### 文本输入框 (Text Input)
```css
.input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  color: var(--text-primary);
  transition: all 0.2s ease-apple;
}

.input:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

#### 滑块组件 (Slider)
```css
.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border-primary);
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007AFF;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
}
```

---

## 📱 响应式断点 (Responsive Breakpoints)

### 移动优先 (Mobile First)

```css
/* 超小屏幕 (手机竖屏) */
@media (max-width: 480px) {
  .container { padding: 0 16px; }
  .text-size { font-size: 14px; }
  .btn-size { padding: 12px 20px; }
}

/* 小屏幕 (手机横屏) */
@media (min-width: 481px) and (max-width: 767px) {
  .container { padding: 0 20px; }
  .text-size { font-size: 15px; }
  .btn-size { padding: 14px 24px; }
}

/* 中等屏幕 (平板) */
@media (min-width: 768px) and (max-width: 1023px) {
  .container { padding: 0 24px; max-width: 768px; margin: 0 auto; }
  .text-size { font-size: 16px; }
  .btn-size { padding: 16px 28px; }
}

/* 大屏幕 (桌面) */
@media (min-width: 1024px) and (max-width: 1439px) {
  .container { padding: 0 32px; max-width: 1024px; margin: 0 auto; }
  .text-size { font-size: 18px; }
  .btn-size { padding: 16px 32px; }
}

/* 超大屏幕 (宽屏桌面) */
@media (min-width: 1440px) {
  .container { padding: 0 40px; max-width: 1440px; margin: 0 auto; }
  .text-size { font-size: 20px; }
  .btn-size { padding: 18px 36px; }
}
```

---

## ♿ 无障碍设计 (Accessibility)

### 色彩对比度 (Color Contrast)
- **正常文字**: 至少4.5:1对比度
- **大文字**: 至少3:1对比度
- **非文字元素**: 至少3:1对比度

### 焦点指示器 (Focus Indicators)
```css
.focus-ring {
  outline: 2px solid #007AFF;
  outline-offset: 2px;
  border-radius: 4px;
}

.focus-ring-high-contrast {
  outline: 3px solid #FFFFFF;
  outline-offset: 2px;
  box-shadow: 0 0 0 1px #000000;
}
```

### 屏幕阅读器支持 (Screen Reader Support)
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

**这个视觉设计规范确保了VidSlide AI在所有平台上都能提供一致、专业、高质量的用户体验！** 🎨✨