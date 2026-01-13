/** * KeywordTemplate.vue * VidSlide AI - 关键词高亮模板 *
实现突出显示重要词汇，增强记忆效果，支持中英文双语显示 */

<!-- KeywordTemplate 组件模板 -->
<template>
  <div class="keyword-template" :style="{ width: slideWidth + 'px', height: slideHeight + 'px' }">
    <!-- 背景层 -->
    <div class="background-layer">
      <div class="bg-pattern"></div>
      <div class="bg-gradient"></div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-section">
      <!-- 标题 -->
      <div class="title-area">
        <h1 class="main-title">{{ title || '关键词高亮展示' }}</h1>
        <p class="subtitle">{{ subtitle || '突出显示核心概念' }}</p>
      </div>

      <!-- 关键词展示区域 -->
      <div class="keywords-section">
        <div
          v-for="(keyword, index) in keywords"
          :key="keyword.id"
          class="keyword-card"
          :class="`keyword-${index + 1}`"
          :style="getKeywordStyle(keyword, index)"
        >
          <!-- 关键词内容 -->
          <div class="keyword-content">
            <div class="keyword-text">{{ keyword.text }}</div>
            <div v-if="keyword.translation" class="keyword-translation">
              {{ keyword.translation }}
            </div>
          </div>

          <!-- 关键词装饰 -->
          <div class="keyword-decoration" :style="{ background: keyword.color }">
            <div class="decoration-shape"></div>
          </div>

          <!-- 发光效果 -->
          <div class="keyword-glow" :style="{ background: keyword.color }"></div>
        </div>
      </div>

      <!-- 说明文字 -->
      <div class="description-section">
        <p class="description">{{ description || '通过视觉突出和颜色编码，帮助观众快速识别和记忆重要概念' }}</p>
      </div>
    </div>

    <!-- 动画粒子效果 -->
    <div v-if="showParticles" class="particles-container">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="getParticleStyle(particle)"
      ></div>
    </div>
  </div>
</template>

<script>
/**
 * KeywordTemplate 组件
 * 真正的关键词高亮展示模板实现
 */
export default {
  name: 'KeywordTemplate',
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
    // 关键词数据
    keywords: {
      type: Array,
      default: () => [
        {
          id: 1,
          text: '人工智能',
          translation: 'Artificial Intelligence',
          color: '#667eea'
        },
        {
          id: 2,
          text: '机器学习',
          translation: 'Machine Learning',
          color: '#764ba2'
        },
        {
          id: 3,
          text: '深度学习',
          translation: 'Deep Learning',
          color: '#f093fb'
        },
        {
          id: 4,
          text: '神经网络',
          translation: 'Neural Networks',
          color: '#4facfe'
        },
        {
          id: 5,
          text: '大数据',
          translation: 'Big Data',
          color: '#43e97b'
        },
        {
          id: 6,
          text: '云计算',
          translation: 'Cloud Computing',
          color: '#38f9d7'
        }
      ]
    },
    // 说明文字
    description: {
      type: String,
      default: ''
    },
    // 特效开关
    showParticles: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      particles: this.generateParticles()
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
    getKeywordStyle(keyword, index) {
      const delay = index * 0.1
      return {
        '--keyword-color': keyword.color,
        '--keyword-color-light': this.lightenColor(keyword.color, 0.3),
        animationDelay: `${delay}s`
      }
    },
    lightenColor(color, percent) {
      const num = parseInt(color.replace("#", ""), 16)
      const amt = Math.round(2.55 * percent * 100)
      const R = (num >> 16) + amt
      const G = (num >> 8 & 0x00FF) + amt
      const B = (num & 0x0000FF) + amt
      return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
    },
    generateParticles() {
      const particles = []
      for (let i = 0; i < 20; i++) {
        particles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.1
        })
      }
      return particles
    },
    getParticleStyle(particle) {
      return {
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        opacity: particle.opacity,
        animationDuration: `${particle.speed * 10}s`
      }
    }
  }
}
</script>

<style scoped>
.keyword-template {
  position: relative;
  background: #f8f9fa;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 背景层 - 苹果风格的微妙背景 */
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(0,123,255,0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(52,199,89,0.03) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255,59,48,0.02) 0%, transparent 50%);
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    rgba(0,123,255,0.02) 0%,
    rgba(52,199,89,0.02) 50%,
    rgba(255,59,48,0.02) 100%);
}

/* 内容区域 */
.content-section {
  position: relative;
  z-index: 2;
  padding: 60px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
}

/* 标题区域 */
.title-area {
  text-align: center;
  margin-bottom: 60px;
}

.main-title {
  font-size: 4em;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5em;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1.5em;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  margin: 0;
}

/* 关键词展示区域 */
.keywords-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
  flex: 1;
}

/* 关键词卡片 - 苹果风格卡片 */
.keyword-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: keywordFadeIn 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.keyword-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
}

@keyframes keywordFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.keyword-content {
  position: relative;
  z-index: 2;
}

.keyword-text {
  font-size: 2em;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 8px;
  line-height: 1.2;
  text-align: center;
}

.keyword-translation {
  font-size: 1.1em;
  color: #7f8c8d;
  font-weight: 500;
  text-align: center;
  opacity: 0.8;
}

.keyword-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  border-radius: 20px 20px 0 0;
}

.decoration-shape {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  border-radius: inherit;
}

.keyword-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 22px;
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: blur(8px);
}

.keyword-card:hover .keyword-glow {
  opacity: 0.3;
}

/* 说明文字区域 */
.description-section {
  text-align: center;
}

.description {
  font-size: 1.3em;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  font-weight: 400;
}

/* 粒子效果 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particleFloat 15s linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .main-title {
    font-size: 3.5em;
  }

  .keywords-section {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 25px;
  }

  .keyword-card {
    padding: 25px;
  }

  .keyword-text {
    font-size: 1.8em;
  }
}

@media (max-width: 1024px) {
  .content-section {
    padding: 40px;
  }

  .main-title {
    font-size: 3em;
  }

  .subtitle {
    font-size: 1.3em;
  }

  .keywords-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 40px;
  }

  .keyword-card {
    padding: 20px;
  }

  .keyword-text {
    font-size: 1.5em;
  }

  .description {
    font-size: 1.1em;
  }
}

@media (max-width: 768px) {
  .keyword-template {
    width: 100% !important;
    height: auto !important;
    min-height: 800px;
    border-radius: 16px;
  }

  .content-section {
    padding: 30px 20px;
  }

  .title-area {
    margin-bottom: 40px;
  }

  .main-title {
    font-size: 2.2em;
  }

  .subtitle {
    font-size: 1.1em;
  }

  .keywords-section {
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 30px;
  }

  .keyword-card {
    padding: 20px;
    border-radius: 16px;
  }

  .keyword-text {
    font-size: 1.4em;
  }

  .keyword-translation {
    font-size: 1em;
  }

  .description {
    font-size: 1em;
  }

  .particles-container {
    display: none;
  }
}
</style>
