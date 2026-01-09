/** * TemplateSelector.vue * VidSlide AI - 紧急补齐阶段 *
实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统 */

<!-- TemplateSelector 组件模板 -->
<template>
  <div class="template-selector">
    <h3 class="selector-title">选择PPT模板</h3>
    <div class="templates-grid">
      <div
        v-for="template in templates"
        :key="template.id"
        class="template-item"
        :class="{ active: selectedTemplate === template.id }"
        @click="selectTemplate(template.id)"
      >
        <component :is="template.component" :width="320" :height="180" class="template-preview" />
        <div class="template-info">
          <h4>{{ template.name }}</h4>
          <p>{{ template.description }}</p>
        </div>
      </div>
    </div>
    <div v-if="selectedTemplate" class="selected-template">
      <p>已选择: {{ getSelectedTemplateName() }}</p>
      <button
class="confirm-btn" @click="confirmSelection">确认使用</button>
    </div>
  </div>
</template>

<script>
import PipTemplate from './PipTemplate.vue'
import InfoCardTemplate from './InfoCardTemplate.vue'
import KeywordTemplate from './KeywordTemplate.vue'
import DocumentTemplate from './DocumentTemplate.vue'
import TitleTemplate from './TitleTemplate.vue'

/**
 * TemplateSelector 组件
 * 紧急补齐阶段功能实现
 */
export default {
  name: 'TemplateSelector',
  components: {
    PipTemplate,
    InfoCardTemplate,
    KeywordTemplate,
    DocumentTemplate,
    TitleTemplate
  },
  data() {
    return {
      selectedTemplate: null,
      templates: [
        {
          id: 'pip',
          name: '画中画效果',
          description: '视频与内容并排显示，适合讲解演示',
          component: 'PipTemplate'
        },
        {
          id: 'info-card',
          name: '信息卡片',
          description: '清晰的信息展示，适合数据呈现',
          component: 'InfoCardTemplate'
        },
        {
          id: 'keyword',
          name: '关键词高亮',
          description: '突出显示重点词汇，增强记忆效果',
          component: 'KeywordTemplate'
        },
        {
          id: 'document',
          name: '文档展示',
          description: '文档内容清晰展示，适合资料分享',
          component: 'DocumentTemplate'
        },
        {
          id: 'title',
          name: '标题文本',
          description: '醒目的标题设计，适合章节开头',
          component: 'TitleTemplate'
        }
      ]
    }
  },
  methods: {
    selectTemplate(templateId) {
      this.selectedTemplate = templateId
      this.$emit('template-selected', templateId)
    },
    getSelectedTemplateName() {
      const template = this.templates.find(t => t.id === this.selectedTemplate)
      return template ? template.name : ''
    },
    confirmSelection() {
      this.$emit('template-confirmed', this.selectedTemplate)
    }
  }
}
</script>

<style scoped>
.template-selector {
  padding: 20px;
  background: #1a1a1a;
  border-radius: 12px;
  color: white;
}

.selector-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #fff;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.template-item {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.template-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.template-item.active {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}

.template-preview {
  width: 100%;
  margin-bottom: 12px;
  border-radius: 6px;
  overflow: hidden;
}

.template-info h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #fff;
}

.template-info p {
  font-size: 14px;
  color: #ccc;
  line-height: 1.4;
}

.selected-template {
  background: #007aff;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.selected-template p {
  margin-bottom: 12px;
  font-weight: 500;
}

.confirm-btn {
  background: white;
  color: #007aff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  background: #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .template-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .template-card {
    padding: 16px;
  }

  .template-info h4 {
    font-size: 14px;
  }

  .template-info p {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .template-selector {
    padding: 16px;
  }

  .template-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .template-card {
    padding: 12px;
  }

  .selected-template {
    padding: 12px;
  }

  .confirm-btn {
    padding: 6px 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .template-selector h3 {
    font-size: 18px;
  }

  .template-card {
    flex-direction: column;
    text-align: center;
  }

  .template-info {
    margin-top: 12px;
  }
}
</style>
