<template>
  <div class="template-selector">
    <div class="selector-header">
      <h3>选择模板</h3>
      <p>根据内容类型智能推荐最适合的模板</p>
    </div>

    <div class="templates-grid">
      <div
        v-for="template in templates"
        :key="template.id"
        class="template-card"
        @click="selectTemplate(template)"
        :class="{ selected: selectedTemplate?.id === template.id }"
        tabindex="0"
        :aria-label="`${template.name} - ${template.description}`"
        @keydown.enter="selectTemplate(template)"
        @keydown.space.prevent="selectTemplate(template)"
      >
        <div class="template-preview">
          <div class="preview-placeholder">
            <div class="preview-icon">{{ template.icon }}</div>
            <div class="preview-layout" :class="`layout-${template.layout}`">
              <div class="layout-element main"></div>
              <div class="layout-element secondary" v-if="template.hasSecondary"></div>
            </div>
          </div>
        </div>

        <div class="template-info">
          <h4 class="template-name">{{ template.name }}</h4>
          <p class="template-description">{{ template.description }}</p>
          <div class="template-tags">
            <span
              v-for="tag in template.tags"
              :key="tag"
              class="template-tag"
            >
              {{ tag }}
            </span>
          </div>
          <div v-if="template.recommended" class="recommended-badge">
            🎯 推荐
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedTemplate" class="selected-info">
      <div class="selected-header">
        <h4>已选择: {{ selectedTemplate.name }}</h4>
        <button @click="confirmSelection" class="confirm-btn">
          确认使用
        </button>
      </div>
      <div class="template-details">
        <div class="detail-item">
          <strong>适用场景:</strong> {{ selectedTemplate.scenes.join('、') }}
        </div>
        <div class="detail-item">
          <strong>特点:</strong> {{ selectedTemplate.features.join('、') }}
        </div>
        <div class="detail-item">
          <strong>调整范围:</strong> {{ selectedTemplate.adjustable ? '可调整文字和素材' : '预设样式' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TemplateSelector',
  props: {
    contentType: {
      type: String,
      default: 'general'
    },
    videoDuration: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      selectedTemplate: null,
      templates: [
        {
          id: 'pip-basic',
          name: '画中画模板',
          description: '视频与PPT并排显示，适合讲解类内容',
          icon: '📺',
          layout: 'pip',
          hasSecondary: true,
          tags: ['视频', '讲解', '演示'],
          scenes: ['产品介绍', '课程讲解', '功能演示'],
          features: ['人脸跟踪', '智能切换', '响应式布局'],
          adjustable: true,
          recommended: true
        },
        {
          id: 'info-cards',
          name: '信息卡片模板',
          description: '结构化展示多个信息点，适合数据展示',
          icon: '📊',
          layout: 'grid',
          hasSecondary: false,
          tags: ['数据', '列表', '对比'],
          scenes: ['数据分析', '功能对比', '要点总结'],
          features: ['自动布局', '颜色区分', '动画效果'],
          adjustable: true,
          recommended: false
        },
        {
          id: 'keyword-highlight',
          name: '关键词高亮模板',
          description: '突出显示重要关键词，适合演讲强调',
          icon: '🎯',
          layout: 'overlay',
          hasSecondary: false,
          tags: ['关键词', '强调', '高亮'],
          scenes: ['演讲稿', '要点强调', '术语解释'],
          features: ['智能识别', '动态显示', '中英对照'],
          adjustable: true,
          recommended: false
        },
        {
          id: 'document-showcase',
          name: '文档展示模板',
          description: '3D效果展示多个文档，适合资料分享',
          icon: '📄',
          layout: 'stacked',
          hasSecondary: false,
          tags: ['文档', '资料', '展示'],
          scenes: ['资料分享', '文件展示', '内容预览'],
          features: ['3D效果', '交互导航', '详细信息'],
          adjustable: true,
          recommended: false
        },
        {
          id: 'title-slide',
          name: '标题幻灯片模板',
          description: '简洁的标题展示，适合章节开始',
          icon: '📝',
          layout: 'centered',
          hasSecondary: false,
          tags: ['标题', '章节', '开始'],
          scenes: ['章节标题', '主题介绍', '内容开始'],
          features: ['居中布局', '渐入动画', '装饰元素'],
          adjustable: true,
          recommended: false
        }
      ]
    };
  },
  created() {
    this.updateRecommendations();
  },
  methods: {
    updateRecommendations() {
      // 基于内容类型和视频时长更新推荐
      this.templates.forEach(template => {
        template.recommended = this.isRecommended(template);
      });
    },

    isRecommended(template) {
      // 简单的推荐逻辑，实际项目中会更复杂
      if (this.contentType === 'presentation' && template.id === 'pip-basic') {
        return true;
      }
      if (this.contentType === 'data' && template.id === 'info-cards') {
        return true;
      }
      if (this.contentType === 'educational' && template.id === 'keyword-highlight') {
        return true;
      }
      if (this.videoDuration > 300 && template.id === 'document-showcase') {
        return true;
      }
      return false;
    },

    selectTemplate(template) {
      this.selectedTemplate = template;
      this.$emit('template-selected', template);
    },

    confirmSelection() {
      if (this.selectedTemplate) {
        this.$emit('template-confirmed', this.selectedTemplate);
      }
    }
  },
  watch: {
    contentType() {
      this.updateRecommendations();
    },
    videoDuration() {
      this.updateRecommendations();
    }
  }
};
</script>

<style scoped>
.template-selector {
  max-width: 1200px;
  margin: 0 auto;
}

.selector-header {
  text-align: center;
  margin-bottom: 32px;
}

.selector-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.selector-header p {
  font-size: 16px;
  color: #86868b;
  margin: 0;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.template-card {
  border: 2px solid #e5e5e7;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  position: relative;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #007aff;
}

.template-card.selected {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
}

.template-preview {
  height: 160px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.preview-icon {
  font-size: 32px;
  opacity: 0.8;
}

.preview-layout {
  width: 120px;
  height: 80px;
  position: relative;
  border: 1px solid #d1d1d6;
  border-radius: 4px;
  background: white;
}

.layout-pip .main {
  position: absolute;
  left: 8px;
  top: 8px;
  width: 60px;
  height: 34px;
  background: #007aff;
  border-radius: 4px;
}

.layout-pip .secondary {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 40px;
  height: 64px;
  background: #34c759;
  border-radius: 4px;
}

.layout-grid .main {
  width: 100%;
  height: 100%;
  background: #007aff;
  border-radius: 4px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  padding: 2px;
}

.layout-grid .main::before,
.layout-grid .main::after {
  content: '';
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
}

.layout-overlay .main {
  width: 100%;
  height: 100%;
  background: #007aff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.layout-overlay .main::before {
  content: '关键词';
}

.layout-stacked .main {
  width: 100%;
  height: 100%;
  background: #007aff;
  border-radius: 4px;
  position: relative;
}

.layout-stacked .main::before,
.layout-stacked .main::after {
  content: '';
  position: absolute;
  width: 80%;
  height: 60%;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2px;
  top: 20%;
  left: 10%;
}

.layout-stacked .main::after {
  width: 60%;
  height: 40%;
  background: rgba(255, 255, 255, 0.8);
  top: 30%;
  left: 20%;
}

.layout-centered .main {
  width: 100%;
  height: 100%;
  background: #007aff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 700;
}

.layout-centered .main::before {
  content: '标题';
}

.template-info {
  padding: 20px;
}

.template-name {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.template-description {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.template-tag {
  padding: 4px 8px;
  background: #f2f2f7;
  color: #007aff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
}

.recommended-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ff3b30;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.selected-info {
  border: 1px solid #e5e5e7;
  border-radius: 12px;
  padding: 24px;
  background: #f8f9fa;
}

.selected-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.selected-header h4 {
  margin: 0;
  font-size: 18px;
  color: #1d1d1f;
}

.confirm-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.confirm-btn:hover {
  background: #0056cc;
}

.template-details {
  display: grid;
  gap: 12px;
}

.detail-item {
  font-size: 14px;
  color: #1d1d1f;
  line-height: 1.4;
}

.detail-item strong {
  color: #007aff;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .selector-header {
    margin-bottom: 24px;
  }

  .selector-header h3 {
    font-size: 20px;
  }

  .template-preview {
    height: 140px;
  }

  .preview-layout {
    width: 100px;
    height: 70px;
  }

  .selected-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .confirm-btn {
    align-self: stretch;
  }
}
</style>