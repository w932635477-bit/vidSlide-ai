# 🚀 VidSlide AI - 设计系统实施指南

## 快速开始 (Quick Start)

### 1. 引入设计系统
```javascript
// main.js
import './styles/wegic-design-system.css'
```

### 2. 使用组件类名
```vue
<template>
  <!-- 按钮 -->
  <button class="wegic-btn wegic-btn-primary">
    开始体验
  </button>

  <!-- 卡片 -->
  <div class="wegic-card">
    <h3 class="wegic-heading">标题</h3>
    <p class="wegic-text">内容描述</p>
  </div>

  <!-- 徽章 -->
  <span class="wegic-badge wegic-badge-success">
    完成
  </span>
</template>
```

---

## 📋 组件使用指南

### 🎯 按钮 (Buttons)

| 样式类 | 用途 | 示例 |
|--------|------|------|
| `wegic-btn-primary` | 主要操作 | 开始使用、确认 |
| `wegic-btn-secondary` | 次要操作 | 取消、返回 |
| `wegic-btn-success` | 成功操作 | 保存、完成 |
| `wegic-btn-large` | 大尺寸 | 主要CTA |

```vue
<!-- 主要按钮 -->
<button class="wegic-btn wegic-btn-primary wegic-btn-large">
  开始体验
  <svg class="wegic-btn-icon" width="20" height="20">...</svg>
</button>

<!-- 次要按钮 -->
<button class="wegic-btn wegic-btn-secondary">
  了解更多
</button>
```

### 📄 卡片 (Cards)

| 样式类 | 用途 | 示例 |
|--------|------|------|
| `wegic-card` | 基础卡片 | 内容容器 |
| `wegic-feature-card` | 特性卡片 | 功能展示 |
| `wegic-scenario-card` | 场景卡片 | 使用案例 |

```vue
<div class="wegic-card wegic-feature-card">
  <div class="wegic-feature-icon">⚡</div>
  <h3 class="wegic-feature-title">闪电般快速</h3>
  <p class="wegic-feature-desc">30秒内完成转换</p>
</div>
```

### 🏷️ 徽章和标签 (Badges & Tags)

| 样式类 | 用途 | 示例 |
|--------|------|------|
| `wegic-badge-primary` | 主要徽章 | 新功能、推荐 |
| `wegic-badge-success` | 成功徽章 | 已完成、通过 |
| `wegic-badge-light` | 轻量徽章 | 分类、状态 |
| `wegic-tag` | 标签 | 特性标识 |

```vue
<!-- 徽章 -->
<span class="wegic-badge wegic-badge-primary">✨ 新功能</span>
<span class="wegic-badge wegic-badge-success">✅ 已完成</span>

<!-- 标签 -->
<span class="wegic-tag">AI智能</span>
<span class="wegic-tag">专业模板</span>
```

### ✍️ 文字层次 (Typography)

| 样式类 | 用途 | 字体大小 |
|--------|------|----------|
| `wegic-heading-xl` | 主要标题 | 3-6rem |
| `wegic-heading-lg` | 大标题 | 2-3.5rem |
| `wegic-heading-md` | 中标题 | 1.5-2rem |
| `wegic-text-lg` | 大正文 | 1.125rem |
| `wegic-text` | 标准正文 | 1rem |
| `wegic-text-sm` | 小正文 | 0.875rem |

```vue
<h1 class="wegic-heading wegic-heading-xl">
  VidSlide AI
</h1>

<h2 class="wegic-heading wegic-heading-lg">
  智能视频编辑
</h2>

<p class="wegic-text wegic-text-lg">
  AI驱动的视频到PPT转换工具
</p>
```

---

## 🎨 颜色使用指南

### 主色调 (Primary Colors)
```css
/* 品牌色 */
color: var(--wegic-primary-purple);    /* #8157FF */
background: var(--wegic-primary-blue); /* #172B85 */

/* 功能色 */
color: var(--wegic-success-green);     /* #03b27f */
color: var(--wegic-error-red);         /* #E30138 */
```

### 背景色 (Background Colors)
```css
/* 主要背景 */
background: var(--wegic-bg-white);     /* #ffffff */
background: var(--wegic-bg-light);     /* #FEFEFE */

/* 灰阶背景 */
background: var(--wegic-gray-100);     /* #fbfbfb */
background: var(--wegic-gray-200);     /* #EFEFEF */
```

### 文字颜色 (Text Colors)
```css
/* 标题文字 */
color: var(--wegic-gray-dark);         /* #404040 */

/* 正文文字 */
color: var(--wegic-gray-medium);       /* #666 */

/* 辅助文字 */
color: var(--wegic-gray-light);        /* #b2b2b2 */
```

---

## 📐 布局和间距

### 容器系统 (Container System)
```css
/* 页面容器 */
.wegic-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
```

### 网格系统 (Grid System)
```css
/* 响应式网格 */
.wegic-demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.wegic-scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}
```

### 间距系统 (Spacing System)
```css
/* 使用 CSS 变量 */
padding: var(--space-md);     /* 16px */
margin-bottom: var(--space-lg); /* 24px */
gap: var(--space-xl);         /* 32px */
```

---

## 🎬 动画使用指南

### 基础动画类 (Animation Classes)
```vue
<!-- 浮动动画 -->
<div class="wegic-animate-float">
  悬浮元素
</div>

<!-- 脉冲动画 -->
<div class="wegic-animate-pulse">
  呼吸效果
</div>

<!-- 发光动画 -->
<div class="wegic-animate-glow">
  强调元素
</div>
```

### 自定义动画 (Custom Animations)
```css
.my-element {
  animation: wegic-float 3s ease-in-out infinite;
}

.my-element:hover {
  animation-play-state: paused; /* 鼠标悬停时暂停 */
}
```

---

## 📱 响应式设计

### 断点使用 (Breakpoint Usage)
```css
/* 移动设备优先 */
.my-component {
  padding: 1rem; /* 移动端默认 */
}

/* 平板及以上 */
@media (min-width: 768px) {
  .my-component {
    padding: 2rem;
  }
}

/* 桌面端 */
@media (min-width: 1200px) {
  .my-component {
    padding: 3rem;
  }
}
```

### 响应式文字 (Responsive Text)
```css
/* 流体文字 */
.responsive-title {
  font-size: clamp(2rem, 5vw, 4rem);
}

.responsive-text {
  font-size: clamp(1rem, 2vw, 1.25rem);
}
```

---

## ♿ 无障碍指南

### 语义化 HTML
```vue
<!-- 正确的方式 -->
<header>页眉内容</header>
<nav>导航内容</nav>
<main>主要内容</main>
<section>内容区块</section>
<article>文章内容</article>
<aside>侧边栏</aside>
<footer>页脚内容</footer>
```

### ARIA 属性
```vue
<!-- 为屏幕阅读器提供额外信息 -->
<button aria-label="关闭菜单">
  ✕
</button>

<div role="tabpanel" aria-labelledby="tab-1">
  标签面板内容
</div>
```

### 焦点管理
```css
/* 清晰的焦点指示器 */
.my-button:focus {
  outline: 2px solid var(--wegic-primary-purple);
  outline-offset: 2px;
}
```

---

## 🔧 开发工具

### CSS 变量检查
```javascript
// 检查变量是否正确加载
const root = document.documentElement;
const primaryColor = getComputedStyle(root)
  .getPropertyValue('--wegic-primary-purple');
console.log('主色调:', primaryColor);
```

### 组件测试
```javascript
// 检查组件渲染
import { mount } from '@vue/test-utils';
import MyComponent from './MyComponent.vue';

const wrapper = mount(MyComponent);
expect(wrapper.classes()).toContain('wegic-card');
```

---

## 📋 检查清单 (Checklist)

### 视觉一致性
- [ ] 使用设计系统规定的颜色
- [ ] 遵循字体层次结构
- [ ] 应用正确的间距系统
- [ ] 使用标准化的组件样式

### 功能完整性
- [ ] 响应式布局正常工作
- [ ] 动画性能良好
- [ ] 无障碍功能完整
- [ ] 跨浏览器兼容

### 代码质量
- [ ] 使用语义化的 CSS 类名
- [ ] 避免内联样式
- [ ] 正确使用 CSS 变量
- [ ] 代码有适当注释

---

## 🆘 常见问题

### Q: 颜色不显示？
A: 检查 CSS 变量是否正确引入，确认变量名拼写正确。

### Q: 动画不工作？
A: 检查是否启用了 `prefers-reduced-motion` 设置。

### Q: 组件样式错乱？
A: 确认组件类名正确，检查 CSS 优先级冲突。

### Q: 响应式不正常？
A: 验证断点设置，检查媒体查询语法。

---

## 📚 资源链接

- **完整设计系统**: `vidSlide-ai-unified-design-system.md`
- **Wegic 设计导出**: `wegic-design-export.json`
- **组件展示页面**: `/wegic-showcase`
- **样式文件**: `src/styles/wegic-design-system.css`

---

*快速掌握 Wegic.ai 设计系统，构建美观专业的 VidSlide AI 界面！* 🎨✨