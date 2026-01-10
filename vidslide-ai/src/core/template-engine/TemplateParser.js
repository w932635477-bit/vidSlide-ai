/**
 * VidSlide AI - 模板解析器
 * 负责解析模板配置，处理内容适配和约束验证
 */

import {
  TEMPLATE_TYPES,
  TEMPLATE_CONFIGS,
  TEMPLATE_TRIGGERS,
  TEMPLATE_PRIORITY
} from './TemplateDefinitions.js'

export class TemplateParser {
  constructor() {
    this.templates = TEMPLATE_CONFIGS
    this.triggers = TEMPLATE_TRIGGERS
    this.priority = TEMPLATE_PRIORITY
  }

  /**
   * 解析内容并推荐最适合的模板
   * @param {string} content - 内容文本
   * @param {Object} context - 上下文信息
   * @param {Object} constraints - 约束条件
   * @returns {Object} 解析结果
   */
  /**

   * parseContent 方法

   * VidSlide AI 功能实现

   */

  parseContent(content, context = {}, constraints = {}) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!content || typeof content !== 'string') {
      return this.getDefaultTemplate()
    }

    // 1. 评估所有模板的匹配度
    const matches = this.evaluateTemplateMatches(content, context)

    // 2. 按优先级排序
    const sortedMatches = this.sortByPriority(matches)

    // 3. 选择最佳模板
    const bestMatch = sortedMatches[0] || this.getDefaultTemplate()

    // 4. 应用约束验证
    const validatedTemplate = this.applyConstraints(bestMatch, constraints)

    // 5. 解析内容数据
    const parsedData = this.parseContentData(content, validatedTemplate)

    return {
      template: validatedTemplate,
      data: parsedData,
      confidence: bestMatch.confidence || 0,
      alternatives: sortedMatches.slice(1, 3) // 提供2个备选方案
    }
  }

  /**
   * 评估所有模板的匹配度
   * @param {string} content - 内容文本
   * @param {Object} context - 上下文信息
   * @returns {Array} 匹配结果数组
   */
  /**

   * evaluateTemplateMatches 方法

   * VidSlide AI 功能实现

   */

  evaluateTemplateMatches(content, context) {
    const matches = []

    for (const templateType of Object.values(TEMPLATE_TYPES)) {
      const trigger = this.triggers[templateType]
      if (trigger && trigger(content, context)) {
        const config = this.templates[templateType]
        const confidence = this.calculateConfidence(content, config, context)

        matches.push({
          type: templateType,
          config: config,
          confidence: confidence,
          reason: this.getMatchReason(content, config)
        })
      }
    }

    return matches
  }

  /**
   * 计算模板匹配置信度
   * @param {string} content - 内容文本
   * @param {Object} config - 模板配置
   * @param {Object} context - 上下文信息
   * @returns {number} 置信度 (0-1)
   */
  /**

   * calculateConfidence 方法

   * VidSlide AI 功能实现

   */

  calculateConfidence(content, config, context) {
    let confidence = 0

    // 1. 关键词匹配度 (40%)
    const keywordMatches = config.keywords.filter(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length
    confidence += (keywordMatches / config.keywords.length) * 0.4

    // 2. 内容特征匹配度 (30%)
    confidence += this.evaluateContentFeatures(content, config) * 0.3

    // 3. 上下文相关性 (20%)
    confidence += this.evaluateContextRelevance(context, config) * 0.2

    // 4. 模板独特性加成 (10%)
    confidence += this.evaluateTemplateUniqueness(config) * 0.1

    return Math.min(confidence, 1.0)
  }

  /**
   * 评估内容特征匹配度
   * @param {string} content - 内容文本
   * @param {Object} config - 模板配置
   * @returns {number} 特征匹配度 (0-1)
   */
  /**

   * evaluateContentFeatures 方法

   * VidSlide AI 功能实现

   */

  evaluateContentFeatures(content, config) {
    const features = {
      [TEMPLATE_TYPES.DIALOG_POPUP]: () => {
        // 短内容适合弹窗
        const wordCount = content.split(/\s+/).length
        return wordCount < 20 ? 1.0 : Math.max(0, 1.0 - (wordCount - 20) / 50)
      },

      [TEMPLATE_TYPES.TIMELINE_DISPLAY]: () => {
        // 检测时间相关模式
        const yearMatches = content.match(/\b(19|20)\d{2}\b/g)
        const timeWords = ['发展', '历史', '进程', '阶段', '演变']
        const timeWordMatches = timeWords.filter(word => content.includes(word)).length
        return Math.min((yearMatches?.length || 0) * 0.3 + timeWordMatches * 0.2, 1.0)
      },

      [TEMPLATE_TYPES.SPLIT_SCREEN]: () => {
        // 检测对比模式
        const contrastWords = ['对比', '比较', '差异', '不同', '变化', '前后']
        const contrastMatches = contrastWords.filter(word => content.includes(word)).length
        return Math.min(contrastMatches * 0.3, 1.0)
      },

      [TEMPLATE_TYPES.CHART_ANALYSIS]: () => {
        // 检测数据模式
        const numberMatches = content.match(/\d+(\.\d+)?%?/g)
        const dataWords = ['数据', '统计', '增长', '下降', '比例', '百分比']
        const dataMatches = dataWords.filter(word => content.includes(word)).length
        return Math.min((numberMatches?.length || 0) * 0.2 + dataMatches * 0.3, 1.0)
      },

      [TEMPLATE_TYPES.EMPHASIS_FOCUS]: () => {
        // 检测强调模式
        const emphasisWords = ['重要', '核心', '关键', '重点', '总结', '结论']
        const emphasisMatches = emphasisWords.filter(word => content.includes(word)).length
        const length = content.length
        // 短而重要的内容适合强调
        const lengthScore = length < 50 ? 1.0 : Math.max(0, 1.0 - (length - 50) / 200)
        return Math.min(emphasisMatches * 0.4 + lengthScore * 0.6, 1.0)
      }
    }

    const evaluator = features[config.name] || (() => 0.5)
    return evaluator()
  }

  /**
   * 评估上下文相关性
   * @param {Object} context - 上下文信息
   * @param {Object} config - 模板配置
   * @returns {number} 相关性评分 (0-1)
   */
  /**

   * evaluateContextRelevance 方法

   * VidSlide AI 功能实现

   */

  evaluateContextRelevance(context, config) {
    let relevance = 0.5 // 基础相关性

    // 根据上下文调整相关性
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (context.previousTemplate) {
      // 避免连续使用相同模板
      relevance -= context.previousTemplate === config.name ? 0.2 : 0
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (context.videoDuration) {
      // 根据视频时长调整
      const duration = context.videoDuration
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if (duration < 60) {
        // 短视频
        relevance += config.name === TEMPLATE_TYPES.EMPHASIS_FOCUS ? 0.1 : -0.1
      } else if (duration > 300) {
        /**
         * if 方法
         * VidSlide AI 功能实现
         */
        // 长视频
        relevance += config.name === TEMPLATE_TYPES.TIMELINE_DISPLAY ? 0.1 : 0
      }
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (context.contentType) {
      // 根据内容类型调整
      const typeMapping = {
        educational: [TEMPLATE_TYPES.TIMELINE_DISPLAY, TEMPLATE_TYPES.CHART_ANALYSIS],
        promotional: [TEMPLATE_TYPES.EMPHASIS_FOCUS, TEMPLATE_TYPES.SPLIT_SCREEN],
        technical: [TEMPLATE_TYPES.CHART_ANALYSIS, TEMPLATE_TYPES.SPLIT_SCREEN],
        narrative: [TEMPLATE_TYPES.DIALOG_POPUP, TEMPLATE_TYPES.EMPHASIS_FOCUS]
      }

      const suitableTypes = typeMapping[context.contentType] || []
      relevance += suitableTypes.includes(config.name) ? 0.2 : -0.1
    }

    return Math.max(0, Math.min(1, relevance))
  }

  /**
   * 评估模板独特性
   * @param {Object} config - 模板配置
   * @returns {number} 独特性评分 (0-1)
   */
  /**

   * evaluateTemplateUniqueness 方法

   * VidSlide AI 功能实现

   */

  evaluateTemplateUniqueness(config) {
    // 不同模板有不同的独特性权重
    const uniquenessWeights = {
      [TEMPLATE_TYPES.EMPHASIS_FOCUS]: 0.9, // 全屏效果独特
      [TEMPLATE_TYPES.CHART_ANALYSIS]: 0.8, // 数据可视化独特
      [TEMPLATE_TYPES.TIMELINE_DISPLAY]: 0.7, // 时间线展示独特
      [TEMPLATE_TYPES.SPLIT_SCREEN]: 0.6, // 分屏对比独特
      [TEMPLATE_TYPES.DIALOG_POPUP]: 0.4 // 弹窗较为常见
    }

    return uniquenessWeights[config.name] || 0.5
  }

  /**
   * 获取匹配原因说明
   * @param {string} content - 内容文本
   * @param {Object} config - 模板配置
   * @returns {string} 匹配原因
   */
  /**

   * getMatchReason 方法

   * VidSlide AI 功能实现

   */

  getMatchReason(content, config) {
    const reasons = []

    // 检查关键词匹配
    const matchedKeywords = config.keywords.filter(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    )
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (matchedKeywords.length > 0) {
      reasons.push(`包含关键词: ${matchedKeywords.join(', ')}`)
    }

    // 检查内容特征
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (config.name === TEMPLATE_TYPES.DIALOG_POPUP && content.length < 100) {
      reasons.push('内容简短，适合弹窗展示')
    }

    if (config.name === TEMPLATE_TYPES.TIMELINE_DISPLAY && /\b(19|20)\d{2}\b/.test(content)) {
      reasons.push('包含年份信息，适合时间线展示')
    }

    if (config.name === TEMPLATE_TYPES.CHART_ANALYSIS && /\d+(\.\d+)?%?/.test(content)) {
      reasons.push('包含数据信息，适合图表分析')
    }

    return reasons.join('; ') || '基于内容特征智能匹配'
  }

  /**
   * 按优先级排序匹配结果
   * @param {Array} matches - 匹配结果数组
   * @returns {Array} 排序后的结果
   */
  /**

   * sortByPriority 方法

   * VidSlide AI 功能实现

   */

  sortByPriority(matches) {
    return matches.sort((a, b) => {
      // 首先按置信度排序
      if (Math.abs(a.confidence - b.confidence) > 0.1) {
        return b.confidence - a.confidence
      }

      // 其次按模板优先级排序
      const aPriority = this.priority.indexOf(a.type)
      const bPriority = this.priority.indexOf(b.type)

      /**


       * if 方法


       * VidSlide AI 功能实现


       */

      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority
      }

      // 优先级相同的按置信度倒序
      return b.confidence - a.confidence
    })
  }

  /**
   * 应用约束验证
   * @param {Object} template - 模板对象
   * @param {Object} constraints - 约束条件
   * @returns {Object} 验证后的模板
   */
  /**

   * applyConstraints 方法

   * VidSlide AI 功能实现

   */

  applyConstraints(template, constraints) {
    const result = { ...template }

    // 尺寸约束
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (constraints.maxWidth || constraints.maxHeight) {
      result.config.visual.size = { ...result.config.visual.size }

      /**


       * if 方法


       * VidSlide AI 功能实现


       */

      if (constraints.maxWidth && result.config.visual.size.width > constraints.maxWidth) {
        result.config.visual.size.width = constraints.maxWidth
      }

      /**


       * if 方法


       * VidSlide AI 功能实现


       */

      if (constraints.maxHeight && result.config.visual.size.height > constraints.maxHeight) {
        result.config.visual.size.height = constraints.maxHeight
      }
    }

    // 位置约束
    if (
      constraints.allowedPositions &&
      !constraints.allowedPositions.includes(result.config.visual.position)
    ) {
      result.config.visual.position = constraints.allowedPositions[0] || 'center'
    }

    // 内容长度约束
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (
      constraints.maxContentLength &&
      template.data?.content?.length > constraints.maxContentLength
    ) {
      result.data.content = result.data.content.substring(0, constraints.maxContentLength) + '...'
    }

    return result
  }

  /**
   * 解析内容数据
   * @param {string} content - 原始内容
   * @param {Object} template - 模板对象
   * @returns {Object} 解析后的数据
   */
  /**

   * parseContentData 方法

   * VidSlide AI 功能实现

   */

  parseContentData(content, template) {
    const data = {
      originalContent: content,
      processedContent: content,
      metadata: {}
    }

    /**


     * switch 方法


     * VidSlide AI 功能实现


     */

    switch (template.type) {
    case TEMPLATE_TYPES.DIALOG_POPUP:
      data.content = this.parseDialogContent(content)
      break

    case TEMPLATE_TYPES.TIMELINE_DISPLAY:
      data.content = this.parseTimelineContent(content)
      break

    case TEMPLATE_TYPES.SPLIT_SCREEN:
      data.content = this.parseSplitScreenContent(content)
      break

    case TEMPLATE_TYPES.CHART_ANALYSIS:
      data.content = this.parseChartContent(content)
      break

    case TEMPLATE_TYPES.EMPHASIS_FOCUS:
      data.content = this.parseEmphasisContent(content)
      break

    default:
      data.content = { text: content }
    }

    return data
  }

  /**
   * 解析对话弹窗内容
   */
  /**

   * parseDialogContent 方法

   * VidSlide AI 功能实现

   */

  parseDialogContent(content) {
    // 提取标题和内容
    const lines = content.split('\n').filter(line => line.trim())
    return {
      title: lines[0] || '重要提示',
      text: lines.slice(1).join('\n') || content,
      type: 'dialog'
    }
  }

  /**
   * 解析时间线内容
   */
  /**

   * parseTimelineContent 方法

   * VidSlide AI 功能实现

   */

  parseTimelineContent(content) {
    // 提取年份和事件
    const yearRegex = /\b(19|20)\d{2}\b/g
    const years = content.match(yearRegex) || []
    const events = content.split(/\b(19|20)\d{2}\b/).filter(part => part.trim())

    return {
      years: years,
      events: events,
      type: 'timeline'
    }
  }

  /**
   * 解析分屏对比内容
   */
  /**

   * parseSplitScreenContent 方法

   * VidSlide AI 功能实现

   */

  parseSplitScreenContent(content) {
    // 尝试分割对比内容
    const separators = [' vs ', ' VS ', ' 对比 ', ' 比较 ', ' vs. ', ' VS. ']
    let leftContent = content
    let rightContent = content

    /**


     * for 方法


     * VidSlide AI 功能实现


     */

    for (const separator of separators) {
      if (content.includes(separator)) {
        const parts = content.split(separator)
        leftContent = parts[0].trim()
        rightContent = parts.slice(1).join(separator).trim()
        break
      }
    }

    return {
      left: { content: leftContent, label: '对比项A' },
      right: { content: rightContent, label: '对比项B' },
      type: 'comparison'
    }
  }

  /**
   * 解析图表内容
   */
  /**

   * parseChartContent 方法

   * VidSlide AI 功能实现

   */

  parseChartContent(content) {
    // 提取数字数据
    const numbers = content.match(/\d+(\.\d+)?%?/g) || []
    const labels = content.split(/\d+(\.\d+)?%?/).filter(part => part.trim())

    return {
      title: labels[0] || '数据分析',
      data: numbers.map((num, index) => ({
        value: parseFloat(num),
        label: labels[index + 1] || `数据${index + 1}`
      })),
      type: 'chart'
    }
  }

  /**
   * 解析强调内容
   */
  /**

   * parseEmphasisContent 方法

   * VidSlide AI 功能实现

   */

  parseEmphasisContent(content) {
    // 提取关键句子
    const sentences = content.split(/[.!?]/).filter(s => s.trim())
    const mainSentence = sentences[0] || content

    return {
      title: mainSentence.trim(),
      subtitle: sentences.slice(1).join('. ').trim(),
      type: 'emphasis'
    }
  }

  /**
   * 获取默认模板
   * @returns {Object} 默认模板
   */
  /**

   * getDefaultTemplate 方法

   * VidSlide AI 功能实现

   */

  getDefaultTemplate() {
    const defaultType = TEMPLATE_TYPES.DIALOG_POPUP
    return {
      type: defaultType,
      config: this.templates[defaultType],
      confidence: 0.5,
      reason: '默认模板选择'
    }
  }

  /**
   * 获取模板配置
   * @param {string} type - 模板类型
   * @returns {Object} 模板配置
   */
  /**

   * getTemplateConfig 方法

   * VidSlide AI 功能实现

   */

  getTemplateConfig(type) {
    return this.templates[type]
  }

  /**
   * 获取所有可用模板
   * @returns {Array} 模板列表
   */
  /**

   * getAvailableTemplates 方法

   * VidSlide AI 功能实现

   */

  getAvailableTemplates() {
    return Object.values(TEMPLATE_TYPES).map(type => ({
      type,
      ...this.templates[type]
    }))
  }
}

export default TemplateParser
