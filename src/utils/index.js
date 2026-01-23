/**
 * 模板注册中心
 * 负责注册和管理所有模板
 */

// 导入基础模板
import pictureInPictureTemplate from './basic/pictureInPictureTemplate.js'
import infoCardTemplate from './basic/infoCardTemplate.js'
import keywordHighlightTemplate from './basic/keywordHighlightTemplate.js'
import timelineTemplate from './basic/timelineTemplate.js'
import splitScreenTemplate from './basic/splitScreenTemplate.js'
import dialogPopupTemplate from './basic/dialogPopupTemplate.js'
import chartAnalysisTemplate from './basic/chartAnalysisTemplate.js'
import documentDisplayTemplate from './basic/documentDisplayTemplate.js'
import minimalistTemplate from './basic/minimalistTemplate.js'
import speakerFocusTemplate from './basic/speakerFocusTemplate.js'
import educationalTemplate from './basic/educationalTemplate.js'
import productShowcaseTemplate from './basic/productShowcaseTemplate.js'

// 导入短视频模板
import douyinMarketingTemplate from './short-video/douyinMarketingTemplate.js'
import trafficAcquisitionTemplate from './short-video/trafficAcquisitionTemplate.js'
import adPerformanceTemplate from './short-video/adPerformanceTemplate.js'
import personalIpTemplate from './short-video/personalIpTemplate.js'
import fanEngagementTemplate from './short-video/fanEngagementTemplate.js'
import knowledgeSharingTemplate from './short-video/knowledgeSharingTemplate.js'
import comparisonReviewTemplate from './short-video/comparisonReviewTemplate.js'
import dataStorytellingTemplate from './short-video/dataStorytellingTemplate.js'

// 导入PPT模板
import pptTitleSlideTemplate from './ppt/pptTitleSlideTemplate.js'
import pptBulletPointsTemplate from './ppt/pptBulletPointsTemplate.js'
import pptBigNumberTemplate from './ppt/pptBigNumberTemplate.js'
import pptComparisonTemplate from './ppt/pptComparisonTemplate.js'
import pptQuoteTemplate from './ppt/pptQuoteTemplate.js'

/**
 * 所有模板的注册表
 */
export const templateRegistry = {
  // 基础模板 (12个)
  'picture-in-picture': pictureInPictureTemplate,
  'info-card': infoCardTemplate,
  'keyword-highlight': keywordHighlightTemplate,
  timeline: timelineTemplate,
  'split-screen': splitScreenTemplate,
  'dialog-popup': dialogPopupTemplate,
  'chart-analysis': chartAnalysisTemplate,
  'document-display': documentDisplayTemplate,
  minimalist: minimalistTemplate,
  'speaker-focus': speakerFocusTemplate,
  educational: educationalTemplate,
  'product-showcase': productShowcaseTemplate,

  // 短视频模板 (8个)
  'douyin-marketing': douyinMarketingTemplate,
  'traffic-acquisition': trafficAcquisitionTemplate,
  'ad-performance': adPerformanceTemplate,
  'personal-ip': personalIpTemplate,
  'fan-engagement': fanEngagementTemplate,
  'knowledge-sharing': knowledgeSharingTemplate,
  'comparison-review': comparisonReviewTemplate,
  'data-storytelling': dataStorytellingTemplate,

  // PPT模板 (5个)
  'ppt-title-slide': pptTitleSlideTemplate,
  'ppt-bullet-points': pptBulletPointsTemplate,
  'ppt-big-number': pptBigNumberTemplate,
  'ppt-comparison': pptComparisonTemplate,
  'ppt-quote': pptQuoteTemplate
}

/**
 * 获取所有模板
 */
export function getAllTemplates() {
  return Object.values(templateRegistry)
}

/**
 * 根据ID获取模板
 */
export function getTemplateById(id) {
  return templateRegistry[id] || null
}

/**
 * 根据类别获取模板
 */
export function getTemplatesByCategory(category) {
  return Object.values(templateRegistry).filter(template => template.category === category)
}

/**
 * 获取模板统计信息
 */
export function getTemplateStats() {
  const templates = Object.values(templateRegistry)
  const stats = {
    total: templates.length,
    byCategory: {},
    byType: {}
  }

  templates.forEach(template => {
    // 按类别统计
    const category = template.category || 'unknown'
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1

    // 按类型统计
    const type = template.metadata?.tags?.[0] || 'unknown'
    stats.byType[type] = (stats.byType[type] || 0) + 1
  })

  return stats
}

console.log(`📋 模板注册中心: 已注册 ${Object.keys(templateRegistry).length} 个模板`)
