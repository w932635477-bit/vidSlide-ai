/** * PipTemplate.vue * VidSlide AI - 画中画效果模板 *
实现真正的画中画布局：视频与PPT内容并排显示，支持人脸跟踪和无缝切换 */

<!-- PipTemplate 组件模板 -->
<template>
  <div role="region" :aria-label="templateDescription">
    <div class="pip-template" :style="{ width: slideWidth + 'px', height: slideHeight + 'px' }">
      <!-- 主内容区域 (右侧大图) -->
      <div class="main-content" :style="mainContentStyle">
        <div class="content-placeholder">
          <h2>{{ title || 'PPT标题内容' }}</h2>
          <p>{{ content || '这里是PPT的主要内容区域，支持多行文字显示和图表展示。' }}</p>
          <div class="content-bullets">
            <div v-for="bullet in bullets" :key="bullet.id" class="bullet-item">
              <span class="bullet-dot">•</span>
              <span>{{ bullet.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 画中画视频区域 (左侧小窗) -->
      <div class="pip-window" :style="pipWindowStyle">
        <div class="video-placeholder">
          <div class="play-button">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div class="video-overlay">
            <span>视频预览</span>
          </div>
        </div>
        <!-- 人脸跟踪指示器 -->
        <div v-if="faceTracking" class="face-tracking-indicator">
          <div class="tracking-dot"></div>
        </div>
      </div>

      <!-- 装饰元素 -->
      <div class="template-decoration">
        <div class="decoration-line" :style="decorationStyle"></div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * PipTemplate 组件
 * 真正的画中画效果模板实现
 */
export default {
  name: 'PipTemplate',
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
    // 内容数据
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    bullets: {
      type: Array,
      default: () => [
        { id: 1, text: '支持视频与PPT并排显示' },
        { id: 2, text: '智能人脸跟踪功能' },
        { id: 3, text: '无缝切换动画效果' }
      ]
    },
    // 功能开关
    faceTracking: {
      type: Boolean,
      default: true
    },
    // 布局配置
    pipPosition: {
      type: String,
      default: 'left', // left, right, top-left, bottom-right
      validator: value => ['left', 'right', 'top-left', 'bottom-right'].includes(value)
    },
    pipSize: {
      type: String,
      default: 'medium', // small, medium, large
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    // 无障碍访问描述
    templateDescription: {
      type: String,
      default: '画中画模板 - 视频与PPT内容并排显示'
    }
  },
  computed: {
    slideWidth() {
      return this.width
    },
    slideHeight() {
      return this.height
    },
    // 主内容区域样式
    mainContentStyle() {
      const base = {
        position: 'absolute',
        right: '0',
        top: '0',
        width: '70%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px 0 0 20px',
        padding: '60px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }

      // 根据画中画位置调整主内容位置
      if (this.pipPosition === 'right') {
        base.left = '0'
        base.right = 'auto'
        base.borderRadius = '0 20px 20px 0'
      }

      return base
    },
    // 画中画窗口样式
    pipWindowStyle() {
      const sizes = {
        small: { width: 320, height: 180 },
        medium: { width: 480, height: 270 },
        large: { width: 640, height: 360 }
      }

      const size = sizes[this.pipSize]
      const base = {
        position: 'absolute',
        width: size.width + 'px',
        height: size.height + 'px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: 10
      }

      // 根据位置设置坐标
      switch (this.pipPosition) {
        case 'left':
          base.left = '60px'
          base.top = '60px'
          break
        case 'right':
          base.right = '60px'
          base.top = '60px'
          break
        case 'top-left':
          base.left = '60px'
          base.top = '60px'
          break
        case 'bottom-right':
          base.right = '60px'
          base.bottom = '60px'
          break
      }

      return base
    },
    // 装饰线样式
    decorationStyle() {
      return {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '2px',
        height: '80%',
        background: 'rgba(255, 255, 255, 0.3)',
        transform: 'translateX(-50%)'
      }
    }
  }
}
</script>

<style scoped>
.pip-template {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  margin: 0 auto;
  font-family:
    -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 主内容区域 - 苹果风格的卡片设计 */
.main-content {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  color: #1d1d1f;
  border-radius: 0 12px 12px 0;
  position: relative;
}

.main-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.02) 0%, rgba(0, 123, 255, 0.01) 100%);
  border-radius: inherit;
}

.content-placeholder {
  position: relative;
  z-index: 1;
  text-align: left;
  max-width: 520px;
}

.content-placeholder h2 {
  font-size: 2.8em;
  font-weight: 700;
  margin-bottom: 1.2em;
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: #1d1d1f;
}

.content-placeholder p {
  font-size: 1.4em;
  line-height: 1.5;
  margin-bottom: 2.4em;
  color: #86868b;
  font-weight: 400;
}

.content-bullets {
  font-size: 1.2em;
  line-height: 1.7;
  color: #1d1d1f;
}

.bullet-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.2em;
  padding: 0.8em 0;
}

.bullet-dot {
  color: #007aff;
  font-weight: 600;
  margin-right: 1em;
  font-size: 1.1em;
  margin-top: 0.1em;
  opacity: 0.8;
}

/* 画中画视频窗口 - 苹果风格的卡片设计 */
.pip-window {
  background: #1d1d1f;
  border-radius: 12px;
  position: relative;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.video-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 12px;
}

.play-button {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.play-button:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.play-button:active {
  transform: scale(0.95);
}

.video-overlay {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.85em;
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* 人脸跟踪指示器 - 苹果风格 */
.face-tracking-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  background: #ff3b30;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4);
  animation: tracking-pulse 2s ease-in-out infinite;
}

@keyframes tracking-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(255, 59, 48, 0);
  }
}

/* 装饰元素 */
.template-decoration {
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .content-placeholder h2 {
    font-size: 3em;
  }

  .content-placeholder p {
    font-size: 1.5em;
  }

  .content-bullets {
    font-size: 1.2em;
  }
}

@media (max-width: 1024px) {
  .pip-template {
    border-radius: 16px;
  }

  .main-content {
    padding: 40px !important;
  }

  .content-placeholder h2 {
    font-size: 2.5em;
  }

  .content-placeholder p {
    font-size: 1.3em;
  }

  .pip-window {
    width: 360px !important;
    height: 203px !important;
  }
}

@media (max-width: 768px) {
  .pip-template {
    width: 100% !important;
    height: auto !important;
    min-height: 560px;
    border-radius: 12px;
    padding: 24px;
  }

  .main-content,
  .pip-window {
    position: static !important;
    width: 100% !important;
    height: auto !important;
    border-radius: 8px;
  }

  .main-content {
    order: 2;
    min-height: 360px;
    padding: 32px !important;
    margin-top: 16px;
  }

  .pip-window {
    order: 1;
    height: 200px !important;
    border-radius: 8px;
  }

  .content-placeholder {
    text-align: center;
    max-width: 100%;
  }

  .content-placeholder h2 {
    font-size: 1.8em;
    margin-bottom: 1em;
  }

  .content-placeholder p {
    font-size: 1em;
    margin-bottom: 1.5em;
  }

  .content-bullets {
    font-size: 1em;
  }

  .template-decoration {
    display: none;
  }
}
</style>
