/**
 * VidSlide AI - 约束配置
 * 集中管理所有设计约束规则
 *
 * @module constraintConfig
 * @description 定义文字、颜色、尺寸、布局等各类设计约束
 */

import { TEMPLATE_TYPES } from '../TemplateDefinitions.js'

/**
 * 文字内容约束配置
 * @description 定义文字长度、字符类型等约束
 */
export const TEXT_CONSTRAINTS = {
  minLength: 1,
  maxLength: {
    [TEMPLATE_TYPES.DIALOG_POPUP]: 200,
    [TEMPLATE_TYPES.EMPHASIS_FOCUS]: 100,
    [TEMPLATE_TYPES.TIMELINE_DISPLAY]: 500,
    [TEMPLATE_TYPES.SPLIT_SCREEN]: 300,
    [TEMPLATE_TYPES.CHART_ANALYSIS]: 300
  },
  allowedChars: /^[\u4e00-\u9fa5a-zA-Z0-9\s.,!?\-—:;""''（）《》【】]+$/
}

/**
 * 位置约束配置
 * @description 定义元素位置、边距等约束
 */
export const POSITION_CONSTRAINTS = {
  allowedPositions: {
    [TEMPLATE_TYPES.DIALOG_POPUP]: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
    [TEMPLATE_TYPES.EMPHASIS_FOCUS]: ['center'],
    [TEMPLATE_TYPES.TIMELINE_DISPLAY]: ['bottom', 'left-to-right'],
    [TEMPLATE_TYPES.SPLIT_SCREEN]: ['center'],
    [TEMPLATE_TYPES.CHART_ANALYSIS]: ['center', 'bottom-right', 'bottom-left']
  },
  margins: {
    minEdgeDistance: 20, // 最小边距(px)
    safeArea: 0.1 // 安全区域比例
  }
}

/**
 * 尺寸约束配置
 * @description 定义元素尺寸、宽高比等约束
 */
export const SIZE_CONSTRAINTS = {
  minSize: {
    width: 0.1, // 最小宽度比例
    height: 0.1 // 最小高度比例
  },
  maxSize: {
    width: 0.9, // 最大宽度比例
    height: 0.9 // 最大高度比例
  },
  aspectRatio: {
    [TEMPLATE_TYPES.DIALOG_POPUP]: { min: 1.2, max: 2.5 },
    [TEMPLATE_TYPES.EMPHASIS_FOCUS]: { min: 1.0, max: 2.0 },
    [TEMPLATE_TYPES.TIMELINE_DISPLAY]: { min: 3.0, max: 8.0 },
    [TEMPLATE_TYPES.SPLIT_SCREEN]: { min: 1.5, max: 3.0 },
    [TEMPLATE_TYPES.CHART_ANALYSIS]: { min: 1.0, max: 2.0 }
  }
}

/**
 * 颜色约束配置
 * @description 定义颜色搭配、对比度、亮度等约束
 */
export const COLOR_CONSTRAINTS = {
  allowedPalettes: [
    ['#ffffff', '#000000', '#FFD700', '#007BFF'], // 专业配色
    ['#ffffff', '#333333', '#666666', '#999999'], // 灰度配色
    ['#ffffff', '#007BFF', '#28A745', '#FFC107'] // 彩色配色
  ],
  contrastRatio: {
    min: 4.5, // WCAG AA标准
    recommended: 7.0 // WCAG AAA标准
  },
  brightness: {
    min: 0.2, // 最小亮度
    max: 0.9 // 最大亮度
  }
}

/**
 * 布局约束配置
 * @description 定义文字边距、元素间距、对齐方式等约束
 */
export const LAYOUT_CONSTRAINTS = {
  textMargins: {
    min: 10, // 最小文字边距(px)
    recommended: 20 // 推荐文字边距(px)
  },
  elementSpacing: {
    min: 8, // 最小元素间距(px)
    recommended: 16 // 推荐元素间距(px)
  },
  alignment: {
    allowed: ['left', 'center', 'right', 'justify']
  }
}

/**
 * 性能约束配置
 * @description 定义渲染性能、内存使用等约束
 */
export const PERFORMANCE_CONSTRAINTS = {
  maxRenderTime: 100, // 最大渲染时间(ms)
  maxMemoryUsage: 50, // 最大内存使用(MB)
  maxElements: 100 // 最大元素数量
}

/**
 * 专业性约束配置
 * @description 定义避免的颜色组合、必需元素等约束
 */
export const PROFESSIONALISM_CONSTRAINTS = {
  avoidCombinations: [
    // 避免的颜色组合
    ['#ff0000', '#00ff00'], // 红绿搭配（色盲不友好）
    ['#ffff00', '#0000ff'], // 黄蓝搭配（色盲不友好）
    ['#ffffff', '#ffffff'], // 全白组合
    ['#000000', '#000000'], // 全黑组合
    ['#ff0000', '#ffff00'] // 红黄搭配（警示色误用）
  ],
  requiredElements: {
    [TEMPLATE_TYPES.DIALOG_POPUP]: ['title', 'content'],
    [TEMPLATE_TYPES.EMPHASIS_FOCUS]: ['title'],
    [TEMPLATE_TYPES.TIMELINE_DISPLAY]: ['events', 'years'],
    [TEMPLATE_TYPES.SPLIT_SCREEN]: ['leftContent', 'rightContent'],
    [TEMPLATE_TYPES.CHART_ANALYSIS]: ['data', 'title']
  }
}

/**
 * 字体设计规范配置
 * @description 定义字体大小、行高、字重等约束
 */
export const TYPOGRAPHY_CONSTRAINTS = {
  fontSize: {
    min: 12, // 最小字体大小(px)
    max: 72, // 最大字体大小(px)
    recommended: {
      title: { min: 24, max: 48 },
      subtitle: { min: 16, max: 24 },
      body: { min: 14, max: 18 },
      caption: { min: 12, max: 14 }
    }
  },
  lineHeight: {
    min: 1.2, // 最小行高倍数
    max: 2.0, // 最大行高倍数
    recommended: {
      title: 1.1, // 标题行高较小
      body: 1.5, // 正文行高适中
      caption: 1.3 // 说明文字行高
    }
  },
  fontWeight: {
    allowed: [300, 400, 500, 600, 700], // 允许的字重
    recommended: {
      title: 600, // 标题使用中等字重
      body: 400, // 正文使用正常字重
      emphasis: 700 // 强调使用粗体
    }
  }
}

/**
 * 视觉层次规范配置
 * @description 定义尺寸比例、对比步进等约束
 */
export const HIERARCHY_CONSTRAINTS = {
  sizeRatio: {
    min: 1.2, // 最小尺寸比例
    max: 2.0, // 最大尺寸比例
    recommended: 1.618 // 黄金比例
  },
  contrastSteps: {
    primary: 1.25, // 主要层次对比
    secondary: 1.125 // 次要层次对比
  },
  maxLevels: 5 // 最大层次数量
}

/**
 * 品牌一致性配置
 * @description 定义配色方案、间距比例尺等约束
 */
export const BRANDING_CONSTRAINTS = {
  colorPalette: {
    maxColors: 3, // 单个设计最多使用颜色数
    primaryColors: ['#007bff', '#28a745', '#ffc107', '#dc3545'], // 推荐主色
    neutralColors: ['#ffffff', '#f8f9fa', '#e9ecef', '#6c757d', '#343a40'] // 中性色
  },
  spacingScale: [4, 8, 12, 16, 24, 32, 48, 64], // 间距比例尺(px)
  borderRadius: [0, 4, 8, 12, 16, 24] // 圆角比例尺(px)
}

/**
 * 用户体验规范配置
 * @description 定义触摸目标、可读性、无障碍等约束
 */
export const UX_CONSTRAINTS = {
  touchTargets: {
    minSize: 44, // 最小触摸目标尺寸(px)
    recommendedSize: 48 // 推荐触摸目标尺寸(px)
  },
  readability: {
    maxLineLength: 80, // 最大行长度(字符)
    minLineLength: 40, // 最小行长度(字符)
    maxLinesPerScreen: 20 // 最大屏幕行数
  },
  accessibility: {
    focusIndicator: true, // 需要焦点指示器
    colorContrast: 4.5, // 最小对比度
    altText: true // 需要替代文本
  }
}

/**
 * 获取所有约束配置
 * @returns {Object} 完整的约束配置对象
 */
export function getAllConstraints() {
  return {
    text: TEXT_CONSTRAINTS,
    position: POSITION_CONSTRAINTS,
    size: SIZE_CONSTRAINTS,
    colors: COLOR_CONSTRAINTS,
    layout: LAYOUT_CONSTRAINTS,
    performance: PERFORMANCE_CONSTRAINTS,
    professionalism: PROFESSIONALISM_CONSTRAINTS,
    typography: TYPOGRAPHY_CONSTRAINTS,
    hierarchy: HIERARCHY_CONSTRAINTS,
    branding: BRANDING_CONSTRAINTS,
    ux: UX_CONSTRAINTS
  }
}

/**
 * 获取特定类别的约束配置
 * @param {string} category - 约束类别
 * @returns {Object} 指定类别的约束配置
 */
export function getConstraintsByCategory(category) {
  const allConstraints = getAllConstraints()
  return allConstraints[category] || {}
}

/**
 * 获取模板类型的特定约束
 * @param {string} templateType - 模板类型
 * @param {string} constraintType - 约束类型
 * @returns {*} 约束值
 */
export function getTemplateConstraint(templateType, constraintType) {
  const allConstraints = getAllConstraints()

  // 遍历所有约束类别，查找模板特定的约束
  for (const category in allConstraints) {
    const categoryConstraints = allConstraints[category]
    if (categoryConstraints[constraintType] && categoryConstraints[constraintType][templateType]) {
      return categoryConstraints[constraintType][templateType]
    }
  }

  return null
}

export default {
  TEXT_CONSTRAINTS,
  POSITION_CONSTRAINTS,
  SIZE_CONSTRAINTS,
  COLOR_CONSTRAINTS,
  LAYOUT_CONSTRAINTS,
  PERFORMANCE_CONSTRAINTS,
  PROFESSIONALISM_CONSTRAINTS,
  TYPOGRAPHY_CONSTRAINTS,
  HIERARCHY_CONSTRAINTS,
  BRANDING_CONSTRAINTS,
  UX_CONSTRAINTS,
  getAllConstraints,
  getConstraintsByCategory,
  getTemplateConstraint
}
