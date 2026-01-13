/** * InfoCardTemplate.vue * VidSlide AI - 信息卡片模板 *
实现清晰的数据信息展示，支持多行内容和自定义颜色，支持多卡片布局 */

<!-- InfoCardTemplate 组件模板 -->
<template>
  <div class="info-card-template" :style="{ width: slideWidth + 'px', height: slideHeight + 'px' }">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <!-- 标题区域 -->
    <div class="title-section">
      <h1 class="main-title">{{ title || '信息卡片展示' }}</h1>
      <p class="subtitle">{{ subtitle || '清晰的数据呈现方式' }}</p>
    </div>

    <!-- 卡片网格 -->
    <div class="cards-grid" :class="`grid-${cardsPerRow}`">
      <div
        v-for="(card, index) in cards"
        :key="card.id"
        class="info-card"
        :class="`card-${index + 1}`"
        :style="getCardStyle(card)"
      >
        <!-- 卡片图标 -->
        <div class="card-icon" :style="{ background: card.color }">
          <component :is="getIconComponent(card.icon)" class="icon-svg" />
        </div>

        <!-- 卡片内容 -->
        <div class="card-content">
          <h3 class="card-title">{{ card.title }}</h3>
          <div class="card-value">{{ card.value }}</div>
          <p class="card-description">{{ card.description }}</p>
        </div>

        <!-- 卡片装饰 -->
        <div class="card-decoration" :style="{ background: card.color }"></div>
      </div>
    </div>

    <!-- 数据来源标注 -->
    <div v-if="showSource" class="data-source">
      <span>数据来源: {{ dataSource || 'VidSlide AI 分析' }}</span>
    </div>
  </div>
</template>

<script>
/**
 * InfoCardTemplate 组件
 * 真正的信息卡片展示模板实现
 */
export default {
  name: 'InfoCardTemplate',
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
    // 卡片数据
    cards: {
      type: Array,
      default: () => [
        {
          id: 1,
          title: '用户增长',
          value: '245%',
          description: '相比去年同期增长',
          color: '#667eea',
          icon: 'users'
        },
        {
          id: 2,
          title: '收入提升',
          value: '¥2.4M',
          description: '季度营收突破',
          color: '#764ba2',
          icon: 'trending-up'
        },
        {
          id: 3,
          title: '客户满意度',
          value: '98.5%',
          description: '用户评价得分',
          color: '#f093fb',
          icon: 'star'
        },
        {
          id: 4,
          title: '市场份额',
          value: '32.1%',
          description: '行业领先地位',
          color: '#4facfe',
          icon: 'pie-chart'
        }
      ]
    },
    // 布局配置
    cardsPerRow: {
      type: Number,
      default: 2,
      validator: value => [1, 2, 3, 4].includes(value)
    },
    // 显示配置
    showSource: {
      type: Boolean,
      default: true
    },
    dataSource: {
      type: String,
      default: ''
    }
  },
  computed: {
    slideWidth() {
      return this.width
    },
    slideHeight() {
      return this.height
    }
  },
  methods: {
    getCardStyle(card) {
      return {
        '--card-color': card.color,
        '--card-color-light': this.lightenColor(card.color, 0.3)
      }
    },
    lightenColor(color, percent) {
      // 简单的颜色变亮函数
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * percent * 100);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    },
    getIconComponent(iconName) {
      // 返回对应的图标组件，这里暂时用简单的SVG
      const icons = {
        users: 'users',
        'trending-up': 'trending-up',
        star: 'star',
        'pie-chart': 'pie-chart'
      }
      return icons[iconName] || 'star'
    }
  }
}
</script>

<style scoped>
.info-card-template {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  margin: 0 auto;
  padding: 48px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 背景装饰 - 苹果风格的微妙装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0,123,255,0.04) 0%, rgba(0,123,255,0.02) 100%);
  backdrop-filter: blur(40px);
}

.shape-1 {
  width: 240px;
  height: 240px;
  top: -120px;
  right: -120px;
  animation: subtle-float 8s ease-in-out infinite;
}

.shape-2 {
  width: 160px;
  height: 160px;
  bottom: -80px;
  left: -80px;
  animation: subtle-float 12s ease-in-out infinite reverse;
}

.shape-3 {
  width: 120px;
  height: 120px;
  top: 50%;
  left: 20%;
  animation: subtle-float 16s ease-in-out infinite;
}

@keyframes subtle-float {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.02);
  }
}

/* 标题区域 - 苹果风格的排版 */
.title-section {
  text-align: center;
  margin-bottom: 56px;
  position: relative;
  z-index: 2;
}

.main-title {
  font-size: 3.2em;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.75em;
  letter-spacing: -0.025em;
  line-height: 1.05;
}

.subtitle {
  font-size: 1.4em;
  color: #86868b;
  font-weight: 400;
  margin: 0;
  line-height: 1.3;
}

/* 卡片网格 */
.cards-grid {
  display: grid;
  gap: 40px;
  position: relative;
  z-index: 2;
}

.grid-1 {
  grid-template-columns: 1fr;
  max-width: 600px;
  margin: 0 auto;
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
  max-width: 1200px;
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
  max-width: 1600px;
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* 信息卡片 - 苹果风格卡片设计 */
.info-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
  background: linear-gradient(135deg, var(--card-color) 0%, rgba(var(--card-color-rgb), 0.8) 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon-svg {
  width: 32px;
  height: 32px;
  color: #ffffff;
}

.card-content {
  text-align: left;
}

.card-title {
  font-size: 1.2em;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.card-value {
  font-size: 2.4em;
  font-weight: 700;
  color: var(--card-color);
  margin-bottom: 8px;
  line-height: 1.1;
  letter-spacing: -0.025em;
}

.card-description {
  font-size: 0.95em;
  color: #86868b;
  line-height: 1.4;
  margin: 0;
  font-weight: 400;
}

/* 数据来源 */
.data-source {
  position: absolute;
  bottom: 30px;
  right: 40px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 0.9em;
  color: #7f8c8d;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .main-title {
    font-size: 3.5em;
  }

  .subtitle {
    font-size: 1.5em;
  }

  .info-card {
    padding: 32px;
  }

  .card-value {
    font-size: 2.5em;
  }
}

@media (max-width: 1024px) {
  .info-card-template {
    padding: 40px;
  }

  .main-title {
    font-size: 3em;
  }

  .subtitle {
    font-size: 1.3em;
  }

  .cards-grid.grid-2 {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .cards-grid.grid-3,
  .cards-grid.grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .info-card-template {
    width: 100% !important;
    height: auto !important;
    min-height: 720px;
    padding: 32px 24px;
    border-radius: 12px;
  }

  .main-title {
    font-size: 2.4em;
  }

  .subtitle {
    font-size: 1.2em;
  }

  .title-section {
    margin-bottom: 48px;
  }

  .cards-grid {
    gap: 16px;
  }

  .cards-grid.grid-2,
  .cards-grid.grid-3,
  .cards-grid.grid-4 {
    grid-template-columns: 1fr;
  }

  .info-card {
    padding: 24px;
    border-radius: 12px;
  }

  .card-icon {
    width: 56px;
    height: 56px;
    margin-bottom: 16px;
    border-radius: 10px;
  }

  .icon-svg {
    width: 28px;
    height: 28px;
  }

  .card-title {
    font-size: 1.1em;
  }

  .card-value {
    font-size: 2em;
  }

  .card-description {
    font-size: 0.9em;
  }

  .data-source {
    position: static;
    margin-top: 32px;
    text-align: center;
    display: inline-block;
    margin-left: auto;
    margin-right: auto;
  }

  .background-decoration {
    display: none;
  }
}
</style>
