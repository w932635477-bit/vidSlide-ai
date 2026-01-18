<template>
  <div class="wegic-showcase">
    <header class="wegic-header">
      <h1 class="wegic-heading wegic-heading-xl">Wegic Design Showcase</h1>
      <p class="wegic-text wegic-text-lg">从 Wegic.ai 导入的设计元素展示</p>
    </header>

    <section class="wegic-section">
      <h2 class="wegic-heading wegic-heading-lg">按钮组件</h2>
      <div class="button-grid">
        <button class="wegic-btn wegic-btn-primary">
          <span>主要按钮</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </button>

        <button class="wegic-btn wegic-btn-secondary">次要按钮</button>

        <button class="wegic-btn wegic-btn-success">成功按钮</button>
      </div>
    </section>

    <section class="wegic-section">
      <h2 class="wegic-heading wegic-heading-lg">颜色系统</h2>
      <div class="color-palette">
        <div v-for="(color, index) in colorPalette" :key="index" class="color-item">
          <div class="color-swatch" :style="{ backgroundColor: color.value }" />
          <span class="color-name">{{ color.name }}</span>
          <code class="color-code">{{ color.value }}</code>
        </div>
      </div>
    </section>

    <section class="wegic-section">
      <h2 class="wegic-heading wegic-heading-lg">卡片组件</h2>
      <div class="card-grid">
        <div v-for="card in showcaseCards" :key="card.title" class="wegic-card">
          <div class="card-icon" :class="card.iconClass">
            {{ card.icon }}
          </div>
          <h3 class="wegic-heading wegic-heading-md">
            {{ card.title }}
          </h3>
          <p class="wegic-text">
            {{ card.description }}
          </p>
        </div>
      </div>
    </section>

    <section class="wegic-section">
      <h2 class="wegic-heading wegic-heading-lg">徽章和状态</h2>
      <div class="badge-showcase">
        <span class="wegic-badge wegic-badge-primary">
          <span>✨</span>
          新功能
        </span>
        <span class="wegic-badge wegic-badge-success">
          <span>✅</span>
          已完成
        </span>
        <span class="wegic-badge wegic-badge-light">
          <span>🎨</span>
          Wegic设计
        </span>
      </div>
    </section>

    <section class="wegic-section">
      <h2 class="wegic-heading wegic-heading-lg">动画效果</h2>
      <div class="animation-showcase">
        <div class="wegic-card wegic-animate-float">
          <h3>浮动动画</h3>
          <p>轻柔的上下浮动效果</p>
        </div>
        <div class="wegic-card wegic-animate-pulse">
          <h3>脉冲动画</h3>
          <p>规律的缩放效果</p>
        </div>
        <div class="wegic-card wegic-animate-glow">
          <h3>发光动画</h3>
          <p>动态光晕效果</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'WegicDesignShowcase',
  data() {
    return {
      colorPalette: [
        { name: '主蓝色', value: '#172B85' },
        { name: '主紫色', value: '#8157FF' },
        { name: '成功绿', value: '#03b27f' },
        { name: '错误红', value: '#E30138' },
        { name: '深蓝', value: '#00447C' },
        { name: '灰色', value: '#404040' },
        { name: '浅灰', value: '#b2b2b2' },
        { name: '白色', value: '#ffffff' }
      ],
      showcaseCards: [
        {
          title: 'AI 驱动',
          description: '基于 Wegic.ai 的智能设计系统',
          icon: '🤖',
          iconClass: 'icon-ai'
        },
        {
          title: '响应式设计',
          description: '完美适配各种屏幕尺寸',
          icon: '📱',
          iconClass: 'icon-responsive'
        },
        {
          title: '现代化 UI',
          description: '采用最新设计趋势和最佳实践',
          icon: '🎨',
          iconClass: 'icon-modern'
        }
      ]
    }
  }
}
</script>

<style scoped>
.wegic-showcase {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

.wegic-header {
  text-align: center;
  margin-bottom: 60px;
}

.wegic-section {
  margin-bottom: 60px;
}

.wegic-section h2 {
  margin-bottom: 30px;
  text-align: center;
}

.button-grid {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.color-swatch {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.color-name {
  font-weight: 600;
  color: #333;
}

.color-code {
  font-family: monospace;
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
  text-align: center;
}

.icon-ai {
  background: linear-gradient(135deg, #8157ff, #9875ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.icon-responsive {
  background: linear-gradient(135deg, #03b27f, #00bb34);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.icon-modern {
  background: linear-gradient(135deg, #172b85, #00447c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.badge-showcase {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.animation-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.animation-showcase .wegic-card {
  text-align: center;
}

.animation-showcase h3 {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .wegic-showcase {
    padding: 20px 15px;
  }

  .button-grid {
    flex-direction: column;
    align-items: center;
  }

  .color-palette {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .animation-showcase {
    grid-template-columns: 1fr;
  }
}
</style>
