/**
 * index.js
 * VidSlide AI - 紧急补齐阶段
 * 实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统
 */

// PPT模板组件导出
export { default as PipTemplate } from './PipTemplate.vue'
export { default as InfoCardTemplate } from './InfoCardTemplate.vue'
export { default as KeywordTemplate } from './KeywordTemplate.vue'
export { default as DocumentTemplate } from './DocumentTemplate.vue'
export { default as TitleTemplate } from './TitleTemplate.vue'
export { default as TemplateSelector } from './TemplateSelector.vue'

// 模板配置
/**
 * TEMPLATE_CONFIGS 函数
 * 紧急补齐阶段功能实现
 */
export const TEMPLATE_CONFIGS = {
  pip: {
    id: 'pip',
    name: '画中画效果',
    description: '视频与内容并排显示，适合讲解演示',
    component: 'PipTemplate'
  },
  'info-card': {
    id: 'info-card',
    name: '信息卡片',
    description: '清晰的信息展示，适合数据呈现',
    component: 'InfoCardTemplate'
  },
  keyword: {
    id: 'keyword',
    name: '关键词高亮',
    description: '突出显示重点词汇，增强记忆效果',
    component: 'KeywordTemplate'
  },
  document: {
    id: 'document',
    name: '文档展示',
    description: '文档内容清晰展示，适合资料分享',
    component: 'DocumentTemplate'
  },
  title: {
    id: 'title',
    name: '标题文本',
    description: '醒目的标题设计，适合章节开头',
    component: 'TitleTemplate'
  }
}

// 获取模板组件
/**
 * getTemplateComponent 函数
 * 紧急补齐阶段功能实现
 */
export function getTemplateComponent(templateId) {
  /**
   * config 函数
   * 紧急补齐阶段功能实现
   */
  const config = TEMPLATE_CONFIGS[templateId]
  return config ? config.component : null
}

// 获取所有模板ID
/**
 * getAllTemplateIds 函数
 * 紧急补齐阶段功能实现
 */
export function getAllTemplateIds() {
  return Object.keys(TEMPLATE_CONFIGS)
}
