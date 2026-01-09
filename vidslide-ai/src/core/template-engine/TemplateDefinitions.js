/**
 * VidSlide AI - 模板定义
 * 定义5种核心模板类型及其配置
 */

// 模板类型枚举
/**
 * TEMPLATE_TYPES 函数
 * VidSlide AI 紧急补齐阶段功能实现
 * @description TEMPLATE_TYPES 功能的具体实现
 */
// TEMPLATE_TYPES - 变量声明
export const TEMPLATE_TYPES = {
  DIALOG_POPUP: 'dialog-popup', // 对话弹窗
  TIMELINE_DISPLAY: 'timeline-display', // 时间线展示
  SPLIT_SCREEN: 'split-screen', // 分屏对比
  CHART_ANALYSIS: 'chart-analysis', // 图表分析
  EMPHASIS_FOCUS: 'emphasis-focus' // 重点强调
}

// 模板配置
/**
 * TEMPLATE_CONFIGS 函数
 * VidSlide AI 紧急补齐阶段功能实现
 * @description TEMPLATE_CONFIGS 功能的具体实现
 */
// TEMPLATE_CONFIGS - 变量声明
export const TEMPLATE_CONFIGS = {
  [TEMPLATE_TYPES.DIALOG_POPUP]: {
    name: '对话弹窗',
    description: '强调关键词的弹出式对话框',
    category: 'content-emphasis',
    trigger: 'keyword-match',
    keywords: ['重要', '强调', '注意', '关键', '核心'],

    // 视觉配置
    visual: {
      position: 'bottom-right', // 位置
      size: { width: 0.25, height: 0.2 }, // 相对主画面比例
      shape: 'rounded-rectangle', // 形状
      background: 'rgba(0,0,0,0.8)', // 背景
      border: '2px solid rgba(255,255,255,0.8)', // 边框
      shadow: '0 4px 12px rgba(0,0,0,0.3)', // 阴影
      animation: {
        type: 'fade-in-scale',
        duration: 300,
        easing: 'ease-out'
      }
    },

    // 内容配置
    content: {
      title: { fontSize: 18, color: '#ffffff', fontWeight: 'bold' },
      text: { fontSize: 14, color: '#ffffff', lineHeight: 1.4 },
      maxLines: 3,
      textAlign: 'center'
    }
  },

  [TEMPLATE_TYPES.TIMELINE_DISPLAY]: {
    name: '时间线展示',
    description: '展示历史发展和时间进程',
    category: 'progress-display',
    trigger: 'timeline-detection',
    keywords: ['发展', '历史', '时间', '进程', '演变', '阶段'],

    visual: {
      position: 'left-to-right',
      size: { width: 1.0, height: 0.3 },
      shape: 'timeline',
      background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
      animation: {
        type: 'progress-bar',
        duration: 2000,
        easing: 'linear'
      }
    },

    content: {
      years: { fontSize: 24, color: '#FFD700', fontWeight: 'bold' },
      events: { fontSize: 16, color: '#ffffff' },
      connectors: { color: '#FFD700', width: 3 },
      badges: { background: 'rgba(255,215,0,0.2)', border: '1px solid #FFD700' }
    }
  },

  [TEMPLATE_TYPES.SPLIT_SCREEN]: {
    name: '分屏对比',
    description: '左右分屏展示对比内容',
    category: 'comparison',
    trigger: 'contrast-detection',
    keywords: ['对比', '比较', '差异', '不同', '变化', '前后'],

    visual: {
      position: 'center',
      size: { width: 1.0, height: 0.8 },
      shape: 'dual-panel',
      background: 'rgba(0,0,0,0.1)',
      divider: { color: '#ffffff', width: 2, style: 'dashed' },
      animation: {
        type: 'slide-in-sync',
        duration: 500,
        direction: 'from-center'
      }
    },

    content: {
      leftPanel: { background: 'rgba(255,0,0,0.1)', label: '之前/观点A' },
      rightPanel: { background: 'rgba(0,255,0,0.1)', label: '之后/观点B' },
      labels: { fontSize: 18, color: '#ffffff', fontWeight: 'bold' },
      text: { fontSize: 14, color: '#ffffff' }
    }
  },

  [TEMPLATE_TYPES.CHART_ANALYSIS]: {
    name: '图表分析',
    description: '智能图表展示数据分析',
    category: 'data-visualization',
    trigger: 'data-detection',
    keywords: ['数据', '统计', '图表', '分析', '增长', '下降', '比例'],

    visual: {
      position: 'center',
      size: { width: 0.8, height: 0.6 },
      shape: 'chart-container',
      background: 'rgba(255,255,255,0.95)',
      border: '2px solid #007BFF',
      shadow: '0 8px 24px rgba(0,0,0,0.2)',
      animation: {
        type: 'data-animation',
        duration: 1500,
        stagger: 200
      }
    },

    content: {
      title: { fontSize: 20, color: '#333', fontWeight: 'bold' },
      chart: { type: 'auto', colors: ['#007BFF', '#28A745', '#FFC107', '#DC3545'] },
      labels: { fontSize: 12, color: '#666' },
      values: { fontSize: 14, color: '#333', fontWeight: 'bold' },
      highlights: { color: '#FFD700', animation: 'pulse' }
    }
  },

  [TEMPLATE_TYPES.EMPHASIS_FOCUS]: {
    name: '重点强调',
    description: '全屏文字强调核心观点',
    category: 'attention-focus',
    trigger: 'importance-detection',
    keywords: ['重要', '核心', '关键', '重点', '总结', '结论'],

    visual: {
      position: 'center',
      size: { width: 1.0, height: 1.0 },
      shape: 'fullscreen',
      background: 'radial-gradient(circle, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
      animation: {
        type: 'fade-in-text',
        duration: 800,
        stagger: 100
      }
    },

    content: {
      title: { fontSize: 48, color: '#FFD700', fontWeight: 'bold', textAlign: 'center' },
      subtitle: { fontSize: 24, color: '#ffffff', textAlign: 'center' },
      highlights: { color: '#FFD700', animation: 'glow' },
      effects: ['text-shadow', 'letter-spacing', 'line-height']
    }
  }
}

// 模板触发条件
/**
 * TEMPLATE_TRIGGERS 函数
 * VidSlide AI 紧急补齐阶段功能实现
 * @description TEMPLATE_TRIGGERS 功能的具体实现
 */
// TEMPLATE_TRIGGERS - 变量声明
export const TEMPLATE_TRIGGERS = {
  [TEMPLATE_TYPES.DIALOG_POPUP]: (content, _context) => {
    // 检测关键词
    /**
     * keywords 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description keywords 功能的具体实现
     */
    // keywords - 变量声明
    const keywords = TEMPLATE_CONFIGS[TEMPLATE_TYPES.DIALOG_POPUP].keywords
    /**
     * hasKeyword 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description hasKeyword 功能的具体实现
     */
    // hasKeyword - 变量声明
    const hasKeyword = keywords.some(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    )
    // 检测句子长度（适合弹窗显示）
    /**
     * isShortContent 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description isShortContent 功能的具体实现
     */
    // isShortContent - 变量声明
    const isShortContent = content.length < 100
    return hasKeyword && isShortContent
  },

  [TEMPLATE_TYPES.TIMELINE_DISPLAY]: (content, _context) => {
    // 检测时间相关关键词
    /**
     * keywords 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description keywords 功能的具体实现
     */
    // keywords - 变量声明
    const keywords = TEMPLATE_CONFIGS[TEMPLATE_TYPES.TIMELINE_DISPLAY].keywords
    /**
     * hasKeyword 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description hasKeyword 功能的具体实现
     */
    // hasKeyword - 变量声明
    const hasKeyword = keywords.some(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    )
    // 检测年份格式
    /**
     * hasYears 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description hasYears 功能的具体实现
     */
    // hasYears - 变量声明
    const hasYears = /\b(19|20)\d{2}\b/.test(content)
    return hasKeyword || hasYears
  },

  [TEMPLATE_TYPES.SPLIT_SCREEN]: (content, _context) => {
    // 检测对比关键词
    /**
     * keywords 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description keywords 功能的具体实现
     */
    // keywords - 变量声明
    const keywords = TEMPLATE_CONFIGS[TEMPLATE_TYPES.SPLIT_SCREEN].keywords
    return keywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()))
  },

  [TEMPLATE_TYPES.CHART_ANALYSIS]: (content, _context) => {
    // 检测数据关键词
    /**
     * keywords 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description keywords 功能的具体实现
     */
    // keywords - 变量声明
    const keywords = TEMPLATE_CONFIGS[TEMPLATE_TYPES.CHART_ANALYSIS].keywords
    /**
     * hasKeyword 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description hasKeyword 功能的具体实现
     */
    // hasKeyword - 变量声明
    const hasKeyword = keywords.some(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    )
    // 检测数字模式
    /**
     * hasNumbers 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description hasNumbers 功能的具体实现
     */
    // hasNumbers - 变量声明
    const hasNumbers = /\d+(\.\d+)?%?/.test(content)
    return hasKeyword && hasNumbers
  },

  [TEMPLATE_TYPES.EMPHASIS_FOCUS]: (content, _context) => {
    // 检测重要性关键词
    /**
     * keywords 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description keywords 功能的具体实现
     */
    // keywords - 变量声明
    const keywords = TEMPLATE_CONFIGS[TEMPLATE_TYPES.EMPHASIS_FOCUS].keywords
    return keywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()))
  }
}

// 默认模板配置
/**
 * DEFAULT_TEMPLATE 函数
 * VidSlide AI 紧急补齐阶段功能实现
 * @description DEFAULT_TEMPLATE 功能的具体实现
 */
// DEFAULT_TEMPLATE - 变量声明
export const DEFAULT_TEMPLATE = TEMPLATE_TYPES.DIALOG_POPUP

// 模板优先级（匹配度排序）
/**
 * TEMPLATE_PRIORITY 函数
 * VidSlide AI 紧急补齐阶段功能实现
 * @description TEMPLATE_PRIORITY 功能的具体实现
 */
// TEMPLATE_PRIORITY - 变量声明
export const TEMPLATE_PRIORITY = [
  TEMPLATE_TYPES.EMPHASIS_FOCUS, // 最高优先级 - 全屏强调
  TEMPLATE_TYPES.CHART_ANALYSIS, // 高优先级 - 数据可视化
  TEMPLATE_TYPES.SPLIT_SCREEN, // 中优先级 - 对比展示
  TEMPLATE_TYPES.TIMELINE_DISPLAY, // 中优先级 - 时间线
  TEMPLATE_TYPES.DIALOG_POPUP // 基础优先级 - 弹窗
]

export default {
  TEMPLATE_TYPES,
  TEMPLATE_CONFIGS,
  TEMPLATE_TRIGGERS,
  DEFAULT_TEMPLATE,
  TEMPLATE_PRIORITY
}
