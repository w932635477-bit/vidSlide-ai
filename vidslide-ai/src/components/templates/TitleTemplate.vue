/** * TitleTemplate.vue * VidSlide AI - 标题文字模板 *
实现醒目的标题设计，适合章节开头，支持自定义字体和动画效果 */

<!-- TitleTemplate 组件模板 -->
<template>
  <div class="title-template" :style="{ width: slideWidth + 'px', height: slideHeight + 'px' }">
    <!-- 动态背景 -->
    <div class="dynamic-background">
      <div class="bg-layer layer-1"></div>
      <div class="bg-layer layer-2"></div>
      <div class="bg-layer layer-3"></div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <!-- 主标题 -->
      <div class="main-title-section">
        <h1 class="main-title" :style="titleStyle">
          {{ title || 'VidSlide AI' }}
        </h1>
        <div class="title-decoration">
          <div class="decoration-line" :style="{ background: accentColor }"></div>
          <div class="decoration-dots">
            <span v-for="i in 3" :key="i" class="dot" :style="{ background: accentColor }"></span>
          </div>
        </div>
      </div>

      <!-- 副标题 -->
      <div v-if="subtitle" class="subtitle-section">
        <h2 class="subtitle">{{ subtitle }}</h2>
      </div>

      <!-- 描述文字 -->
      <div v-if="description" class="description-section">
        <p class="description">{{ description }}</p>
      </div>

      <!-- 章节信息 -->
      <div v-if="chapterInfo" class="chapter-info">
        <div class="chapter-badge" :style="{ background: accentColor }">
          {{ chapterInfo.chapter }}
        </div>
        <div class="chapter-title">{{ chapterInfo.title }}</div>
        <div class="chapter-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: chapterInfo.progress + '%',
                background: accentColor
              }"
            ></div>
          </div>
          <span class="progress-text">{{ chapterInfo.progress }}%</span>
        </div>
      </div>
    </div>

    <!-- 装饰元素 -->
    <div class="decorative-elements">
      <div class="floating-shapes">
        <div
          v-for="shape in floatingShapes"
          :key="shape.id"
          class="floating-shape"
          :class="`shape-${shape.type}`"
          :style="getShapeStyle(shape)"
        ></div>
      </div>
    </div>

    <!-- 页脚信息 -->
    <div v-if="showFooter" class="footer-section">
      <div class="footer-content">
        <span class="footer-text">{{ footerText || 'AI 驱动的演示制作工具' }}</span>
        <div class="footer-logo">🎨 VidSlide</div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * TitleTemplate 组件
 * 真正的标题文字模板实现
 */
export default {
  name: 'TitleTemplate',
  props: {
    // 幻灯片尺寸
    width: {
      type: Number,
      default: 1920
    },
    height: {
      type: Number,
      default: 1080
    },
    // 标题内容
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    // 章节信息
    chapterInfo: {
      type: Object,
      default: null
    },
    // 样式配置
    accentColor: {
      type: String,
      default: '#667eea'
    },
    titleSize: {
      type: String,
      default: 'large', // small, medium, large, xlarge
      validator: value => ['small', 'medium', 'large', 'xlarge'].includes(value)
    },
    // 显示配置
    showFooter: {
      type: Boolean,
      default: true
    },
    footerText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      floatingShapes: this.generateFloatingShapes()
    }
  },
  computed: {
    slideWidth() {
      return this.width
    },
    slideHeight() {
      return this.height
    },
    titleStyle() {
      const sizes = {
        small: '4em',
        medium: '5em',
        large: '6em',
        xlarge: '8em'
      }

      return {
        fontSize: sizes[this.titleSize] || sizes.large,
        color: this.accentColor
      }
    }
  },
  methods: {
    generateFloatingShapes() {
      const shapes = []
      const types = ['circle', 'square', 'triangle']

      for (let i = 0; i < 8; i++) {
        shapes.push({
          id: i,
          type: types[Math.floor(Math.random() * types.length)],
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 30 + 20,
          rotation: Math.random() * 360,
          speed: Math.random() * 20 + 10,
          opacity: Math.random() * 0.3 + 0.1
        })
      }

      return shapes
    },
    getShapeStyle(shape) {
      return {
        left: `${shape.x}%`,
        top: `${shape.y}%`,
        width: `${shape.size}px`,
        height: `${shape.size}px`,
        transform: `rotate(${shape.rotation}deg)`,
        opacity: shape.opacity,
        animationDuration: `${shape.speed}s`
      }
    }
  }
}
</script>

<style scoped>
.title-template {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 微妙的背景装饰 */
.dynamic-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.bg-layer {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0,123,255,0.03) 0%, rgba(52,199,89,0.03) 100%);
  backdrop-filter: blur(20px);
}

.layer-1 {
  width: 280px;
  height: 280px;
  top: -140px;
  right: -140px;
  animation: subtle-bg-float 12s ease-in-out infinite;
}

.layer-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation: subtle-bg-float 16s ease-in-out infinite reverse;
}

.layer-3 {
  width: 140px;
  height: 140px;
  top: 40%;
  left: 30%;
  animation: subtle-bg-float 20s ease-in-out infinite;
}

@keyframes subtle-bg-float {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.02);
  }
}

/* 内容区域 */
.content-area {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 60px;
  box-sizing: border-box;
  color: white;
}

/* 主标题区域 */
.main-title-section {
  margin-bottom: 40px;
}

.main-title {
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
  line-height: 1.05;
  color: #1d1d1f;
  animation: titleSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes titleSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.title-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.decoration-line {
  height: 4px;
  border-radius: 2px;
  width: 100px;
}

.decoration-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* 副标题 */
.subtitle-section {
  margin-bottom: 30px;
}

.subtitle {
  font-size: 2em;
  font-weight: 400;
  opacity: 0.9;
  line-height: 1.3;
  animation: subtitleFadeIn 1.2s ease-out 0.3s both;
}

@keyframes subtitleFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 描述文字 */
.description-section {
  margin-bottom: 40px;
  max-width: 600px;
}

.description {
  font-size: 1.3em;
  line-height: 1.6;
  opacity: 0.8;
  animation: descriptionFadeIn 1.2s ease-out 0.6s both;
}

@keyframes descriptionFadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* 章节信息 */
.chapter-info {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 30px;
  margin-top: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: chapterSlideUp 1s ease-out 0.8s both;
}

@keyframes chapterSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.chapter-badge {
  display: inline-block;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9em;
  margin-bottom: 12px;
}

.chapter-title {
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 20px;
}

.chapter-progress {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease;
}

.progress-text {
  font-weight: 600;
  font-size: 1.1em;
  min-width: 45px;
}

/* 装饰元素 */
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.floating-shape {
  position: absolute;
  animation: shapeFloat 20s linear infinite;
}

@keyframes shapeFloat {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

.shape-circle {
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.shape-square {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  transform: rotate(45deg);
}

.shape-triangle {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 20px solid rgba(255, 255, 255, 0.1);
  background: none;
}

/* 页脚 */
.footer-section {
  position: absolute;
  bottom: 30px;
  left: 40px;
  right: 40px;
  z-index: 3;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-text {
  font-size: 0.9em;
  opacity: 0.8;
}

.footer-logo {
  font-weight: 600;
  font-size: 1.1em;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .main-title {
    font-size: 5em !important;
  }

  .subtitle {
    font-size: 1.7em;
  }

  .description {
    font-size: 1.2em;
  }
}

@media (max-width: 1024px) {
  .content-area {
    padding: 40px;
  }

  .main-title {
    font-size: 4em !important;
  }

  .subtitle {
    font-size: 1.5em;
  }

  .description {
    font-size: 1.1em;
  }

  .chapter-info {
    padding: 25px;
  }
}

@media (max-width: 768px) {
  .title-template {
    width: 100% !important;
    height: auto !important;
    min-height: 600px;
    border-radius: 16px;
  }

  .content-area {
    padding: 30px 20px;
  }

  .main-title {
    font-size: 3em !important;
  }

  .subtitle {
    font-size: 1.2em;
  }

  .title-decoration {
    gap: 15px;
  }

  .decoration-line {
    width: 60px;
  }

  .description {
    font-size: 1em;
  }

  .chapter-info {
    margin-top: 30px;
    padding: 20px;
  }

  .chapter-title {
    font-size: 1.3em;
  }

  .footer-section {
    left: 20px;
    right: 20px;
    bottom: 20px;
  }

  .footer-content {
    padding: 12px 16px;
  }

  .footer-text {
    font-size: 0.8em;
  }

  .footer-logo {
    font-size: 1em;
  }

  .decorative-elements {
    display: none;
  }
}
</style>
