/**
 * 智能推荐系统
 * 基于本地模板库的关键词匹配和内容分析
 * 为视频内容推荐最合适的PPT模板和布局
 */

// 本地模板库
/**
 * TEMPLATE_LIBRARY 函数
 * VidSlide AI 紧急补齐阶段功能实现
 * @description TEMPLATE_LIBRARY 功能的具体实现
 */
// TEMPLATE_LIBRARY - 变量声明
const TEMPLATE_LIBRARY = [
  // 商业演示模板
  {
    id: 'business-intro',
    name: '商业介绍模板',
    category: 'business',
    keywords: ['介绍', '公司', '企业', '业务', '服务', '产品'],
    description: '适合企业介绍和产品展示',
    layout: {
      slides: [
        { type: 'title', elements: ['title', 'subtitle'] },
        { type: 'content', elements: ['heading', 'bullet-list', 'image'] },
        { type: 'features', elements: ['icon-grid', 'descriptions'] },
        { type: 'contact', elements: ['contact-info', 'call-to-action'] }
      ]
    },
    score: 0
  },

  // 教育培训模板
  {
    id: 'education-lecture',
    name: '教育讲座模板',
    category: 'education',
    keywords: ['教学', '课程', '培训', '学习', '教育', '讲座', '知识'],
    description: '适合教育培训和学术讲座',
    layout: {
      slides: [
        { type: 'title', elements: ['title', 'author', 'date'] },
        { type: 'outline', elements: ['numbered-list', 'timeline'] },
        { type: 'content', elements: ['heading', 'paragraph', 'diagram'] },
        { type: 'summary', elements: ['key-points', 'q-and-a'] }
      ]
    },
    score: 0
  },

  // 技术演示模板
  {
    id: 'tech-demo',
    name: '技术演示模板',
    category: 'technology',
    keywords: ['技术', '演示', '开发', '代码', '创新', '解决方案', '平台'],
    description: '适合技术产品演示和解决方案展示',
    layout: {
      slides: [
        { type: 'title', elements: ['title', 'tagline'] },
        { type: 'problem', elements: ['problem-statement', 'challenge'] },
        { type: 'solution', elements: ['architecture', 'flowchart'] },
        { type: 'demo', elements: ['screenshots', 'code-snippet'] },
        { type: 'results', elements: ['metrics', 'testimonials'] }
      ]
    },
    score: 0
  },

  // 营销推广模板
  {
    id: 'marketing-campaign',
    name: '营销推广模板',
    category: 'marketing',
    keywords: ['营销', '推广', '广告', '品牌', '活动', '销售', '市场'],
    description: '适合营销活动和品牌推广',
    layout: {
      slides: [
        { type: 'hero', elements: ['hero-image', 'headline', 'cta'] },
        { type: 'campaign', elements: ['campaign-overview', 'target-audience'] },
        { type: 'strategy', elements: ['marketing-mix', 'timeline'] },
        { type: 'results', elements: ['roi', 'engagement-metrics'] }
      ]
    },
    score: 0
  },

  // 项目管理模板
  {
    id: 'project-management',
    name: '项目管理模板',
    category: 'management',
    keywords: ['项目', '管理', '计划', '进度', '团队', '目标', '里程碑'],
    description: '适合项目管理报告和进度更新',
    layout: {
      slides: [
        { type: 'executive-summary', elements: ['project-overview', 'key-metrics'] },
        { type: 'timeline', elements: ['gantt-chart', 'milestones'] },
        { type: 'team', elements: ['team-structure', 'roles-responsibilities'] },
        { type: 'risks', elements: ['risk-assessment', 'mitigation-plan'] },
        { type: 'next-steps', elements: ['action-items', 'timeline'] }
      ]
    },
    score: 0
  },

  // 数据分析模板
  {
    id: 'data-analysis',
    name: '数据分析模板',
    category: 'analytics',
    keywords: ['数据', '分析', '图表', '统计', '报告', '洞察', '趋势'],
    description: '适合数据分析报告和业务洞察',
    layout: {
      slides: [
        { type: 'dashboard', elements: ['kpi-overview', 'charts'] },
        { type: 'insights', elements: ['key-findings', 'trends'] },
        { type: 'methodology', elements: ['data-sources', 'analysis-methods'] },
        { type: 'recommendations', elements: ['actionable-insights', 'next-steps'] }
      ]
    },
    score: 0
  },

  // 创意设计模板
  {
    id: 'creative-portfolio',
    name: '创意作品集模板',
    category: 'creative',
    keywords: ['创意', '设计', '作品', '艺术', '视觉', '美学', '灵感'],
    description: '适合创意作品展示和设计案例',
    layout: {
      slides: [
        { type: 'portfolio-hero', elements: ['hero-image', 'artist-statement'] },
        { type: 'gallery', elements: ['image-grid', 'project-descriptions'] },
        { type: 'process', elements: ['design-process', 'inspiration'] },
        { type: 'about', elements: ['artist-bio', 'contact'] }
      ]
    },
    score: 0
  },

  // 财务报告模板
  {
    id: 'financial-report',
    name: '财务报告模板',
    category: 'finance',
    keywords: ['财务', '报告', '预算', '收益', '成本', '投资', 'ROI'],
    description: '适合财务报告和预算分析',
    layout: {
      slides: [
        { type: 'financial-summary', elements: ['revenue-chart', 'profit-loss'] },
        { type: 'budget-analysis', elements: ['budget-vs-actual', 'variance-analysis'] },
        { type: 'forecast', elements: ['projections', 'assumptions'] },
        { type: 'recommendations', elements: ['cost-savings', 'investment-opportunities'] }
      ]
    },
    score: 0
  },

  // 健康医疗模板
  {
    id: 'healthcare-presentation',
    name: '健康医疗模板',
    category: 'healthcare',
    keywords: ['健康', '医疗', '患者', '治疗', '预防', '保健', '医院'],
    description: '适合医疗健康主题的演示',
    layout: {
      slides: [
        { type: 'health-overview', elements: ['health-statistics', 'key-issues'] },
        { type: 'treatment', elements: ['treatment-options', 'success-rates'] },
        { type: 'prevention', elements: ['preventive-measures', 'lifestyle-tips'] },
        { type: 'resources', elements: ['support-services', 'additional-resources'] }
      ]
    },
    score: 0
  },

  // 通用模板
  {
    id: 'general-purpose',
    name: '通用演示模板',
    category: 'general',
    keywords: ['演示', '展示', '介绍', '总结', '讨论', '会议'],
    description: '适用于各种通用演示需求',
    layout: {
      slides: [
        { type: 'title', elements: ['title', 'subtitle'] },
        { type: 'agenda', elements: ['agenda-list'] },
        { type: 'content', elements: ['heading', 'content', 'visual'] },
        { type: 'conclusion', elements: ['summary', 'next-steps'] }
      ]
    },
    score: 0
  }
]

// 关键词权重配置
/**
 * KEYWORD_WEIGHTS 函数
 * VidSlide AI 紧急补齐阶段功能实现
 * @description KEYWORD_WEIGHTS 功能的具体实现
 */
// KEYWORD_WEIGHTS - 变量声明
const KEYWORD_WEIGHTS = {
  title: 3.0, // 标题关键词权重最高
  content: 2.0, // 内容关键词权重较高
  metadata: 1.5, // 元数据关键词中等权重
  context: 1.0 // 上下文关键词基础权重
}

// 相似度阈值
/**
 * SIMILARITY_THRESHOLDS 函数
 * VidSlide AI 紧急补齐阶段功能实现
 * @description SIMILARITY_THRESHOLDS 功能的具体实现
 */
// SIMILARITY_THRESHOLDS - 变量声明
const SIMILARITY_THRESHOLDS = {
  high: 0.8, // 高相似度
  medium: 0.6, // 中等相似度
  low: 0.4 // 低相似度
}

/**
 * 智能推荐系统类
 */
/**
 * SmartRecommender 类
 * 紧急补齐阶段功能实现
 */
export class SmartRecommender {
  constructor() {
    this.templates = TEMPLATE_LIBRARY
  }

  /**
   * 分析视频内容并推荐模板
   * @param {Object} videoAnalysis - 视频分析结果
   * @param {Object} transcription - 语音转文字结果
   * @param {Object} metadata - 视频元数据
   * @returns {Array} 推荐模板列表
   */
  /**

   * recommendTemplates 方法

   * VidSlide AI 功能实现

   */

  recommendTemplates(videoAnalysis = {}, transcription = {}, metadata = {}) {
    // 重置所有模板的分数
    this.templates.forEach(template => {
      template.score = 0
    })

    // 分析不同来源的内容
    this.analyzeContent(videoAnalysis, 'context')
    this.analyzeTranscription(transcription)
    this.analyzeMetadata(metadata)

    // 计算相似度并排序
    /**
     * recommendations 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description recommendations 功能的具体实现
     */
    // recommendations - 变量声明
    const recommendations = this.templates
      .map(template => ({
        ...template,
        confidence: this.calculateConfidence(template.score),
        matchReason: this.generateMatchReason(template)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // 返回前5个推荐

    return recommendations
  }

  /**
   * 分析通用内容关键词
   */
  /**

   * analyzeContent 方法

   * VidSlide AI 功能实现

   */

  analyzeContent(content, weightType = 'content') {
    if (!content || typeof content !== 'object') return

    /**
     * weight 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description weight 功能的具体实现
     */
    // weight - 变量声明
    const weight = KEYWORD_WEIGHTS[weightType] || 1.0

    // 提取所有文本内容
    /**
     * textContent 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description textContent 功能的具体实现
     */
    // textContent - 变量声明
    const textContent = this.extractTextFromObject(content)

    // 分析关键词匹配
    this.matchKeywords(textContent, weight)
  }

  /**
   * 分析语音转文字结果
   */
  /**

   * analyzeTranscription 方法

   * VidSlide AI 功能实现

   */

  analyzeTranscription(transcription) {
    if (!transcription) return

    /**
     * weight 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description weight 功能的具体实现
     */
    // weight - 变量声明
    const weight = KEYWORD_WEIGHTS.title

    // 分析完整文本
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (transcription.text) {
      this.matchKeywords(transcription.text, weight)
    }

    // 分析片段关键词（更高权重）
    if (transcription.segments && Array.isArray(transcription.segments)) {
      transcription.segments.forEach(segment => {
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if (segment.text) {
          this.matchKeywords(segment.text, weight * 1.2)
        }
      })
    }
  }

  /**
   * 分析视频元数据
   */
  /**

   * analyzeMetadata 方法

   * VidSlide AI 功能实现

   */

  analyzeMetadata(metadata) {
    if (!metadata) return

    /**
     * weight 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description weight 功能的具体实现
     */
    // weight - 变量声明
    const weight = KEYWORD_WEIGHTS.metadata

    // 文件名分析
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (metadata.name) {
      this.matchKeywords(metadata.name, weight * 1.5)
    }

    // 其他元数据
    /**
     * metaText 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description metaText 功能的具体实现
     */
    // metaText - 变量声明
    const metaText = this.extractTextFromObject(metadata)
    this.matchKeywords(metaText, weight)
  }

  /**
   * 关键词匹配算法
   */
  /**

   * matchKeywords 方法

   * VidSlide AI 功能实现

   */

  matchKeywords(text, baseWeight) {
    if (!text || typeof text !== 'string') return

    /**
     * normalizedText 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description normalizedText 功能的具体实现
     */
    // normalizedText - 变量声明
    const normalizedText = text.toLowerCase()

    this.templates.forEach(template => {
      /**
       * matchScore 函数
       * VidSlide AI 紧急补齐阶段功能实现
       * @description matchScore 功能的具体实现
       */
      // matchScore - 变量声明
      let matchScore = 0

      template.keywords.forEach(keyword => {
        /**
         * keywordLower 函数
         * VidSlide AI 紧急补齐阶段功能实现
         * @description keywordLower 功能的具体实现
         */
        // keywordLower - 变量声明
        const keywordLower = keyword.toLowerCase()

        // 精确匹配
        if (normalizedText.includes(keywordLower)) {
          matchScore += baseWeight
        }

        // 部分匹配（增加灵活性）
        /**
         * words 函数
         * VidSlide AI 紧急补齐阶段功能实现
         * @description words 功能的具体实现
         */
        // words - 变量声明
        const words = normalizedText.split(/\s+/)
        words.forEach(word => {
          if (word.length > 2 && keywordLower.includes(word)) {
            matchScore += baseWeight * 0.5
          }
        })
      })

      template.score += matchScore
    })
  }

  /**
   * 从对象中提取所有文本内容
   */
  /**

   * extractTextFromObject 方法

   * VidSlide AI 功能实现

   */

  extractTextFromObject(obj, maxDepth = 3, currentDepth = 0) {
    if (currentDepth > maxDepth) return ''

    /**
     * text 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description text 功能的具体实现
     */
    // text - 变量声明
    let text = ''

    /**


     * for 方法


     * VidSlide AI 功能实现


     */

    for (const key in obj) {
      /**
       * value 函数
       * VidSlide AI 紧急补齐阶段功能实现
       * @description value 功能的具体实现
       */
      // value - 变量声明
      const value = obj[key]

      /**


       * if 方法


       * VidSlide AI 功能实现


       */

      if (typeof value === 'string') {
        text += value + ' '
      } else if (typeof value === 'object' && value !== null) {
        text += this.extractTextFromObject(value, maxDepth, currentDepth + 1)
      }
    }

    return text.trim()
  }

  /**
   * 计算置信度
   */
  /**

   * calculateConfidence 方法

   * VidSlide AI 功能实现

   */

  calculateConfidence(score) {
    /**
     * maxPossibleScore 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description maxPossibleScore 功能的具体实现
     */
    // maxPossibleScore - 变量声明
    const maxPossibleScore = 100 // 假设的最大分数
    /**
     * confidence 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description confidence 功能的具体实现
     */
    // confidence - 变量声明
    const confidence = Math.min(score / maxPossibleScore, 1)

    if (confidence >= SIMILARITY_THRESHOLDS.high) return 'high'
    if (confidence >= SIMILARITY_THRESHOLDS.medium) return 'medium'
    return 'low'
  }

  /**
   * 生成匹配原因说明
   */
  /**

   * generateMatchReason 方法

   * VidSlide AI 功能实现

   */

  generateMatchReason(template) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (template.score === 0) {
      return '通用模板推荐'
    }

    /**
     * reasons 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description reasons 功能的具体实现
     */
    // reasons - 变量声明
    const reasons = []
    /**
     * matchedKeywords 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description matchedKeywords 功能的具体实现
     */
    // matchedKeywords - 变量声明
    const matchedKeywords = []

    // 这里可以实现更复杂的匹配原因分析
    // 暂时返回模板描述
    reasons.push(template.description)

    return reasons.join('；')
  }

  /**
   * 获取模板详情
   */
  /**

   * getTemplateById 方法

   * VidSlide AI 功能实现

   */

  getTemplateById(templateId) {
    return this.templates.find(template => template.id === templateId)
  }

  /**
   * 获取所有可用模板
   */
  /**

   * getAllTemplates 方法

   * VidSlide AI 功能实现

   */

  getAllTemplates() {
    return [...this.templates]
  }

  /**
   * 根据类别获取模板
   */
  /**

   * getTemplatesByCategory 方法

   * VidSlide AI 功能实现

   */

  getTemplatesByCategory(category) {
    return this.templates.filter(template => template.category === category)
  }
}

// 单例实例
/**
 * recommenderInstance 函数
 * VidSlide AI 紧急补齐阶段功能实现
 * @description recommenderInstance 功能的具体实现
 */
// recommenderInstance - 变量声明
let recommenderInstance = null

/**
 * getSmartRecommender 函数
 * VidSlide AI 紧急补齐阶段功能实现
 * @description getSmartRecommender 功能的具体实现
 */
export function getSmartRecommender() {
  /**

   * if 方法

   * VidSlide AI 功能实现

   */

  if (!recommenderInstance) {
    recommenderInstance = new SmartRecommender()
  }
  return recommenderInstance
}

// 导出工具函数
export { TEMPLATE_LIBRARY }
