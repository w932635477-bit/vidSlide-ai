/** * PipTemplate.vue * VidSlide AI - 画中画效果模板 *
实现真正的画中画布局：视频与PPT内容并排显示，支持人脸跟踪和无缝切换 */

<!-- PipTemplate 组件模板 -->
<template>
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
            <path d="M8 5v14l11-7z"/>
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
  background: #f8f9fa;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
}

/* 主内容区域 */
.main-content {
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.content-placeholder {
  text-align: left;
  max-width: 600px;
}

.content-placeholder h2 {
  font-size: 3.5em;
  font-weight: 700;
  margin-bottom: 1em;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.content-placeholder p {
  font-size: 1.8em;
  line-height: 1.4;
  margin-bottom: 2em;
  opacity: 0.9;
}

.content-bullets {
  font-size: 1.4em;
  line-height: 1.6;
}

.bullet-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.8em;
}

.bullet-dot {
  color: #ffd700;
  font-weight: bold;
  margin-right: 0.8em;
  font-size: 1.2em;
  margin-top: 0.1em;
}

/* 画中画视频窗口 */
.pip-window {
  background: #000;
  position: relative;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
              linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
              linear-gradient(-45deg, transparent 75%, #1a1a1a 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.play-button {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.play-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.video-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 500;
}

/* 人脸跟踪指示器 */
.face-tracking-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  background: #ff4757;
  border-radius: 50%;
  border: 2px solid white;
  animation: tracking-pulse 2s infinite;
}

.tracking-dot {
  width: 100%;
  height: 100%;
  background: #ff4757;
  border-radius: 50%;
  animation: tracking-dot-pulse 1s infinite;
}

@keyframes tracking-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 71, 87, 0);
  }
}

@keyframes tracking-dot-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
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
    min-height: 600px;
    border-radius: 12px;
  }

  .main-content,
  .pip-window {
    position: static !important;
    width: 100% !important;
    height: auto !important;
    border-radius: 0;
  }

  .main-content {
    order: 2;
    min-height: 400px;
    padding: 30px 20px !important;
  }

  .pip-window {
    order: 1;
    height: 250px !important;
    border-radius: 12px;
    margin: 20px;
  }

  .content-placeholder {
    text-align: center;
  }

  .content-placeholder h2 {
    font-size: 2em;
  }

  .content-placeholder p {
    font-size: 1.1em;
  }

  .template-decoration {
    display: none;
  }
}
</style>
