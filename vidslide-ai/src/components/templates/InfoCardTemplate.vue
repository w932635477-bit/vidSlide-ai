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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
  padding: 60px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

/* 背景装饰 */
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
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation: float 6s ease-in-out infinite;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation: float 8s ease-in-out infinite reverse;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 20%;
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
  z-index: 2;
}

.main-title {
  font-size: 4em;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 0.5em;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.subtitle {
  font-size: 1.8em;
  color: #7f8c8d;
  font-weight: 400;
  margin: 0;
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

/* 信息卡片 */
.info-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.info-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.icon-svg {
  width: 40px;
  height: 40px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.card-content {
  text-align: left;
}

.card-title {
  font-size: 1.4em;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  line-height: 1.3;
}

.card-value {
  font-size: 3em;
  font-weight: 800;
  color: var(--card-color);
  margin-bottom: 8px;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.card-description {
  font-size: 1em;
  color: #7f8c8d;
  line-height: 1.4;
  margin: 0;
}

.card-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  opacity: 0.8;
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
    min-height: 800px;
    padding: 30px 20px;
    border-radius: 16px;
  }

  .main-title {
    font-size: 2.2em;
  }

  .subtitle {
    font-size: 1.1em;
  }

  .title-section {
    margin-bottom: 40px;
  }

  .cards-grid {
    gap: 20px;
  }

  .cards-grid.grid-2,
  .cards-grid.grid-3,
  .cards-grid.grid-4 {
    grid-template-columns: 1fr;
  }

  .info-card {
    padding: 24px;
    border-radius: 16px;
  }

  .card-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 16px;
  }

  .icon-svg {
    width: 30px;
    height: 30px;
  }

  .card-title {
    font-size: 1.2em;
  }

  .card-value {
    font-size: 2.2em;
  }

  .card-description {
    font-size: 0.9em;
  }

  .data-source {
    position: static;
    margin-top: 30px;
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
