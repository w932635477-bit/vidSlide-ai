/** * DocumentTemplate.vue * VidSlide AI - 文档展示模板 *
实现文档内容清晰展示，支持多文档重叠显示，3D倾斜效果 */

<!-- DocumentTemplate 组件模板 -->
<template>
  <div class="document-template" :style="{ width: slideWidth + 'px', height: slideHeight + 'px' }">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>

    <!-- 标题区域 -->
    <div class="title-section">
      <h1 class="main-title">{{ title || '文档内容展示' }}</h1>
      <p class="subtitle">{{ subtitle || '清晰的文档呈现方式' }}</p>
    </div>

    <!-- 文档层叠区域 -->
    <div class="documents-stack">
      <div
        v-for="(document, index) in documents"
        :key="document.id"
        class="document-layer"
        :class="`layer-${index + 1}`"
        :style="getDocumentStyle(document, index)"
      >
        <!-- 文档内容 -->
        <div class="document-content">
          <div class="document-header">
            <h3 class="document-title">{{ document.title }}</h3>
            <div class="document-meta">
              <span class="document-type">{{ document.type }}</span>
              <span class="document-date">{{ document.date }}</span>
            </div>
          </div>

          <div class="document-body">
            <div v-for="paragraph in document.content" :key="paragraph.id" class="document-paragraph">
              <p>{{ paragraph.text }}</p>
            </div>
          </div>

          <div class="document-footer">
            <div class="document-stats">
              <span class="stat-item">📄 {{ document.pages }}页</span>
              <span class="stat-item">👁️ {{ document.views }}</span>
            </div>
          </div>
        </div>

        <!-- 文档阴影和装饰 -->
        <div class="document-shadow"></div>
        <div class="document-border" :style="{ borderColor: document.color }"></div>
      </div>
    </div>

    <!-- 导航指示器 -->
    <div class="navigation-indicators">
      <div
        v-for="(document, index) in documents"
        :key="`indicator-${document.id}`"
        class="indicator"
        :class="{ active: currentDocument === index }"
        @click="currentDocument = index"
      ></div>
    </div>
  </div>
</template>

<script>
/**
 * DocumentTemplate 组件
 * 真正的文档展示模板实现
 */
export default {
  name: 'DocumentTemplate',
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
    // 文档数据
    documents: {
      type: Array,
      default: () => [
        {
          id: 1,
          title: 'VidSlide AI 技术文档',
          type: '技术文档',
          date: '2024-01-13',
          color: '#667eea',
          pages: 45,
          views: '2.3k',
          content: [
            { id: 1, text: 'VidSlide AI是一款基于人工智能的视频转PPT工具，能够自动分析视频内容并生成专业的演示文稿。' },
            { id: 2, text: '核心功能包括智能剪辑、模板引擎、素材管理和AI内容分析，为用户提供全方位的演示制作体验。' }
          ]
        },
        {
          id: 2,
          title: '用户使用指南',
          type: '使用手册',
          date: '2024-01-12',
          color: '#764ba2',
          pages: 28,
          views: '1.8k',
          content: [
            { id: 1, text: '本指南详细介绍了VidSlide AI的各项功能使用方法，包括视频上传、内容分析、模板选择等操作流程。' },
            { id: 2, text: '通过本指南，您可以快速掌握软件的使用技巧，提升演示制作效率。' }
          ]
        },
        {
          id: 3,
          title: 'API开发文档',
          type: '开发文档',
          date: '2024-01-11',
          color: '#f093fb',
          pages: 67,
          views: '956',
          content: [
            { id: 1, text: 'VidSlide AI提供丰富的API接口，支持第三方应用集成和自定义开发。' },
            { id: 2, text: '本文档包含完整的API参考、示例代码和最佳实践指导。' }
          ]
        }
      ]
    }
  },
  data() {
    return {
      currentDocument: 0
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
    getDocumentStyle(document, index) {
      const isActive = this.currentDocument === index
      const offset = (index - this.currentDocument) * 30
      const rotation = (index - this.currentDocument) * 2

      return {
        transform: `translateX(${offset}px) translateY(${Math.abs(offset) * 0.5}px) rotateY(${rotation}deg)`,
        zIndex: this.documents.length - Math.abs(index - this.currentDocument),
        opacity: isActive ? 1 : 0.7 - Math.abs(index - this.currentDocument) * 0.2,
        '--document-color': document.color
      }
    }
  }
}
</script>

<style scoped>
.document-template {
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
  perspective: 1000px;
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

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0,123,255,0.03) 0%, rgba(52,199,89,0.03) 100%);
  backdrop-filter: blur(20px);
}

.circle-1 {
  width: 160px;
  height: 160px;
  top: -80px;
  right: -80px;
  animation: subtle-circle-float 12s ease-in-out infinite;
}

.circle-2 {
  width: 120px;
  height: 120px;
  bottom: -60px;
  left: -60px;
  animation: subtle-circle-float 16s ease-in-out infinite reverse;
}

.circle-3 {
  width: 80px;
  height: 80px;
  top: 50%;
  left: 25%;
  animation: subtle-circle-float 20s ease-in-out infinite;
}

@keyframes subtle-circle-float {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-6px) scale(1.02);
  }
}

/* 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
  z-index: 3;
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
  font-size: 1.5em;
  color: #7f8c8d;
  font-weight: 400;
  margin: 0;
}

/* 文档层叠区域 */
.documents-stack {
  position: relative;
  height: 500px;
  margin-bottom: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 文档层 */
.document-layer {
  position: absolute;
  width: 400px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.document-layer:hover {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}

.document-content {
  padding: 30px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.document-header {
  margin-bottom: 20px;
}

.document-title {
  font-size: 1.5em;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  line-height: 1.3;
}

.document-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
  color: #7f8c8d;
}

.document-type {
  background: var(--document-color);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
}

.document-body {
  flex: 1;
  overflow-y: auto;
}

.document-paragraph {
  margin-bottom: 12px;
}

.document-paragraph p {
  font-size: 1em;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.document-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.document-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
  color: #7f8c8d;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.document-shadow {
  position: absolute;
  bottom: -10px;
  left: 10px;
  right: 10px;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  filter: blur(4px);
}

.document-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px solid;
  border-radius: 12px;
  pointer-events: none;
  opacity: 0.6;
}

/* 导航指示器 */
.navigation-indicators {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: #667eea;
  border-color: #667eea;
  transform: scale(1.2);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .main-title {
    font-size: 3.5em;
  }

  .documents-stack {
    height: 450px;
  }

  .document-layer {
    width: 360px;
    height: 450px;
  }
}

@media (max-width: 1024px) {
  .document-template {
    padding: 40px;
  }

  .main-title {
    font-size: 3em;
  }

  .subtitle {
    font-size: 1.3em;
  }

  .documents-stack {
    height: 400px;
  }

  .document-layer {
    width: 320px;
    height: 400px;
  }

  .document-content {
    padding: 25px;
  }

  .document-title {
    font-size: 1.3em;
  }
}

@media (max-width: 768px) {
  .document-template {
    width: 100% !important;
    height: auto !important;
    min-height: 700px;
    padding: 30px 20px;
    border-radius: 16px;
  }

  .title-section {
    margin-bottom: 40px;
  }

  .main-title {
    font-size: 2.2em;
  }

  .subtitle {
    font-size: 1.1em;
  }

  .documents-stack {
    height: 350px;
    margin-bottom: 40px;
  }

  .document-layer {
    width: 280px;
    height: 350px;
  }

  .document-content {
    padding: 20px;
  }

  .document-title {
    font-size: 1.2em;
  }

  .document-paragraph p {
    font-size: 0.9em;
  }

  .navigation-indicators {
    bottom: 20px;
  }

  .background-decoration {
    display: none;
  }
}
</style>
