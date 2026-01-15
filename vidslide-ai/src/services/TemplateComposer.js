/**
 * TemplateComposer - 模板组合服务
 *
 * 将多个PPT风格模板组合成完整的视频序列
 * 根据内容分析自动编排模板顺序和时长
 */

import TemplateArchitecture from '../utils/TemplateArchitecture.js'
import TemplateRecommender from './TemplateRecommender.js'

class TemplateComposer {
  constructor() {
    this.initialized = false

    // 预定义的组合模式
    this.compositionPatterns = {
      // 标准演示模式：开场 -> 要点 -> 数据 -> 总结
      'standard-presentation': {
        name: '标准演示',
        description: '适合知识分享和教程内容',
        sequence: [
          { template: 'ppt-title-slide', duration: 3000, trigger: 'intro' },
          { template: 'ppt-bullet-points', duration: 5000, trigger: 'points' },
          { template: 'ppt-big-number', duration: 4000, trigger: 'data' },
          { template: 'ppt-quote', duration: 3000, trigger: 'conclusion' }
        ],
        transitions: ['fade', 'slide-left', 'fade', 'fade']
      },

      // 数据驱动模式：数据 -> 对比 -> 结论
      'data-driven': {
        name: '数据驱动',
        description: '适合数据分析和报告内容',
        sequence: [
          { template: 'ppt-title-slide', duration: 2000, trigger: 'intro' },
          { template: 'ppt-big-number', duration: 4000, trigger: 'hero-data' },
          { template: 'ppt-comparison', duration: 5000, trigger: 'comparison' },
          { template: 'ppt-bullet-points', duration: 4000, trigger: 'insights' },
          { template: 'ppt-quote', duration: 3000, trigger: 'takeaway' }
        ],
        transitions: ['fade', 'scale', 'slide-left', 'fade', 'fade']
      },

      // 对比分析模式：问题 -> 对比 -> 推荐
      'comparison-analysis': {
        name: '对比分析',
        description: '适合产品评测和选择建议',
        sequence: [
          { template: 'ppt-title-slide', duration: 2000, trigger: 'intro' },
          { template: 'ppt-bullet-points', duration: 4000, trigger: 'criteria' },
          { template: 'ppt-comparison', duration: 6000, trigger: 'compare' },
          { template: 'ppt-quote', duration: 3000, trigger: 'recommendation' }
        ],
        transitions: ['fade', 'slide-up', 'slide-left', 'fade']
      },

      // 营销推广模式：钩子 -> 痛点 -> 方案 -> CTA
      'marketing-funnel': {
        name: '营销漏斗',
        description: '适合产品推广和获客内容',
        sequence: [
          { template: 'ppt-quote', duration: 3000, trigger: 'hook' },
          { template: 'ppt-bullet-points', duration: 4000, trigger: 'pain-points' },
          { template: 'ppt-big-number', duration: 3000, trigger: 'results' },
          { template: 'ppt-title-slide', duration: 3000, trigger: 'cta' }
        ],
        transitions: ['scale', 'slide-up', 'scale', 'fade']
      },

      // 故事叙述模式：背景 -> 发展 -> 高潮 -> 结局
      'storytelling': {
        name: '故事叙述',
        description: '适合案例分享和经历讲述',
        sequence: [
          { template: 'ppt-title-slide', duration: 3000, trigger: 'setup' },
          { template: 'ppt-bullet-points', duration: 5000, trigger: 'development' },
          { template: 'ppt-big-number', duration: 4000, trigger: 'climax' },
          { template: 'ppt-quote', duration: 4000, trigger: 'resolution' }
        ],
        transitions: ['fade', 'slide-left', 'scale', 'fade']
      },

      // 快速要点模式：适合短视频
      'quick-points': {
        name: '快速要点',
        description: '适合短视频快速展示',
        sequence: [
          { template: 'ppt-title-slide', duration: 2000, trigger: 'intro' },
          { template: 'ppt-bullet-points', duration: 6000, trigger: 'points' },
          { template: 'ppt-quote', duration: 2000, trigger: 'summary' }
        ],
        transitions: ['fade', 'slide-up', 'fade']
      }
    }

    // 场景触发器映射 - 根据关键词触发模板切换
    this.sceneTriggers = {
      // 开场触发词
      intro: ['大家好', '今天', '欢迎', '开始', '首先', '我们来'],

      // 要点触发词
      points: ['第一', '第二', '第三', '首先', '其次', '然后', '最后', '要点', '步骤'],

      // 数据触发词
      data: ['数据', '增长', '下降', '%', '万', '亿', '达到', '超过', '突破'],

      // 对比触发词
      comparison: ['对比', '区别', '不同', '优点', '缺点', 'vs', 'VS', '比较'],

      // 结论触发词
      conclusion: ['总结', '所以', '因此', '记住', '关键', '核心', '重要'],

      // 钩子触发词
      hook: ['你知道吗', '想不想', '有没有', '为什么', '如何'],

      // 痛点触发词
      'pain-points': ['问题', '困扰', '难题', '痛点', '烦恼'],

      // 结果触发词
      results: ['结果', '效果', '成果', '收益', '回报'],

      // CTA触发词
      cta: ['点击', '关注', '私信', '联系', '了解更多']
    }
  }

  /**
   * 初始化组合服务
   */
  async initialize() {
    if (this.initialized) return

    await TemplateArchitecture.initialize()
    await TemplateRecommender.initialize()

    this.initialized = true
    console.log('模板组合服务已初始化')
  }

  /**
   * 根据内容分析自动选择组合模式
   * @param {Object} contentAnalysis - 内容分析结果
   * @returns {string} 组合模式ID
   */
  selectCompositionPattern(contentAnalysis) {
    const { keywords = [], contentType, dataMentions = 0 } = contentAnalysis
    const keywordTexts = keywords.map(k => (k.text || k).toLowerCase())

    // 数据密集型内容
    if (dataMentions > 0.3 || keywordTexts.some(k =>
      ['数据', '增长', '统计', '分析', '报告'].some(p => k.includes(p))
    )) {
      return 'data-driven'
    }

    // 对比评测内容
    if (keywordTexts.some(k =>
      ['对比', '评测', '测评', 'vs', '区别', '选择'].some(p => k.includes(p))
    )) {
      return 'comparison-analysis'
    }

    // 营销获客内容
    if (contentType === 'promotional' || contentType === 'marketing' ||
        keywordTexts.some(k =>
          ['获客', '转化', '变现', '投放', '推广'].some(p => k.includes(p))
        )) {
      return 'marketing-funnel'
    }

    // 故事/案例内容
    if (keywordTexts.some(k =>
      ['故事', '经历', '案例', '分享', '历程'].some(p => k.includes(p))
    )) {
      return 'storytelling'
    }

    // 短内容使用快速要点
    if (keywords.length <= 3) {
      return 'quick-points'
    }

    // 默认使用标准演示
    return 'standard-presentation'
  }

  /**
   * 生成视频模板组合序列
   * @param {Object} contentAnalysis - 内容分析结果
   * @param {Object} options - 组合选项
   * @returns {Object} 组合序列
   */
  async generateComposition(contentAnalysis, options = {}) {
    await this.initialize()

    const {
      patternId = null,
      totalDuration = 30000, // 默认30秒
      minSceneDuration = 2000,
      maxSceneDuration = 8000
    } = options

    // 选择组合模式
    const selectedPattern = patternId || this.selectCompositionPattern(contentAnalysis)
    const pattern = this.compositionPatterns[selectedPattern]

    if (!pattern) {
      throw new Error(`未知的组合模式: ${selectedPattern}`)
    }

    // 分析内容段落
    const segments = this.analyzeContentSegments(contentAnalysis)

    // 生成场景序列
    const scenes = this.generateSceneSequence(pattern, segments, {
      totalDuration,
      minSceneDuration,
      maxSceneDuration
    })

    // 为每个场景填充内容
    const populatedScenes = this.populateSceneContent(scenes, contentAnalysis)

    return {
      patternId: selectedPattern,
      patternName: pattern.name,
      description: pattern.description,
      totalDuration: populatedScenes.reduce((sum, s) => sum + s.duration, 0),
      sceneCount: populatedScenes.length,
      scenes: populatedScenes,
      transitions: pattern.transitions.slice(0, populatedScenes.length - 1)
    }
  }

  /**
   * 分析内容段落
   * @param {Object} contentAnalysis - 内容分析
   * @returns {Array} 内容段落
   */
  analyzeContentSegments(contentAnalysis) {
    const { keywords = [], transcript = '' } = contentAnalysis
    const segments = []

    // 如果有转录文本，按句子分段
    if (transcript) {
      const sentences = transcript.split(/[。！？\n]+/).filter(s => s.trim())

      sentences.forEach((sentence, index) => {
        const trigger = this.detectTrigger(sentence)
        segments.push({
          index,
          text: sentence.trim(),
          trigger,
          keywords: this.extractSegmentKeywords(sentence, keywords)
        })
      })
    } else {
      // 没有转录文本，根据关键词生成段落
      keywords.forEach((kw, index) => {
        const text = typeof kw === 'string' ? kw : kw.text
        segments.push({
          index,
          text,
          trigger: this.detectTrigger(text),
          keywords: [kw]
        })
      })
    }

    return segments
  }

  /**
   * 检测触发器类型
   * @param {string} text - 文本内容
   * @returns {string|null} 触发器类型
   */
  detectTrigger(text) {
    const lowerText = text.toLowerCase()

    for (const [trigger, patterns] of Object.entries(this.sceneTriggers)) {
      if (patterns.some(p => lowerText.includes(p.toLowerCase()))) {
        return trigger
      }
    }

    return null
  }

  /**
   * 提取段落关键词
   * @param {string} sentence - 句子
   * @param {Array} allKeywords - 所有关键词
   * @returns {Array} 匹配的关键词
   */
  extractSegmentKeywords(sentence, allKeywords) {
    const lowerSentence = sentence.toLowerCase()
    return allKeywords.filter(kw => {
      const text = (typeof kw === 'string' ? kw : kw.text).toLowerCase()
      return lowerSentence.includes(text)
    })
  }

  /**
   * 生成场景序列
   * @param {Object} pattern - 组合模式
   * @param {Array} segments - 内容段落
   * @param {Object} options - 选项
   * @returns {Array} 场景序列
   */
  generateSceneSequence(pattern, segments, options) {
    const { totalDuration, minSceneDuration, maxSceneDuration } = options
    const scenes = []

    // 计算每个场景的基础时长
    const baseDuration = totalDuration / pattern.sequence.length

    pattern.sequence.forEach((sceneTemplate, index) => {
      // 查找匹配此触发器的段落
      const matchingSegments = segments.filter(s => s.trigger === sceneTemplate.trigger)

      // 计算场景时长
      let duration = sceneTemplate.duration || baseDuration

      // 根据内容量调整时长
      if (matchingSegments.length > 0) {
        const contentLength = matchingSegments.reduce((sum, s) => sum + s.text.length, 0)
        duration = Math.max(minSceneDuration, Math.min(maxSceneDuration, contentLength * 50))
      }

      scenes.push({
        index,
        templateId: sceneTemplate.template,
        trigger: sceneTemplate.trigger,
        duration,
        startTime: scenes.reduce((sum, s) => sum + s.duration, 0),
        segments: matchingSegments
      })
    })

    return scenes
  }

  /**
   * 为场景填充内容
   * @param {Array} scenes - 场景序列
   * @param {Object} contentAnalysis - 内容分析
   * @returns {Array} 填充后的场景
   */
  populateSceneContent(scenes, contentAnalysis) {
    const { keywords = [], title = '', subtitle = '' } = contentAnalysis

    return scenes.map((scene, index) => {
      const template = TemplateArchitecture.getTemplate(scene.templateId)

      if (!template) {
        console.warn(`模板不存在: ${scene.templateId}`)
        return scene
      }

      // 根据模板类型填充内容
      const content = this.generateSceneContent(scene, template, contentAnalysis, index)

      return {
        ...scene,
        template,
        content,
        renderConfig: this.generateRenderConfig(template, content)
      }
    })
  }

  /**
   * 生成场景内容
   * @param {Object} scene - 场景
   * @param {Object} template - 模板
   * @param {Object} contentAnalysis - 内容分析
   * @param {number} sceneIndex - 场景索引
   * @returns {Object} 场景内容
   */
  generateSceneContent(scene, template, contentAnalysis, sceneIndex) {
    const { keywords = [], title = '', subtitle = '' } = contentAnalysis
    const content = {}

    switch (template.id) {
      case 'ppt-title-slide':
        content.title = title || (keywords[0]?.text || keywords[0] || '主题')
        content.subtitle = subtitle || ''
        break

      case 'ppt-bullet-points':
        // 提取要点列表
        content.sectionTitle = scene.trigger === 'points' ? '核心要点' : '关键内容'
        content.bullets = keywords.slice(0, 5).map(k => typeof k === 'string' ? k : k.text)
        break

      case 'ppt-big-number':
        // 提取数字数据
        const dataKeyword = keywords.find(k => {
          const text = typeof k === 'string' ? k : k.text
          return /\d+/.test(text)
        })
        content.number = dataKeyword ? (typeof dataKeyword === 'string' ? dataKeyword : dataKeyword.text) : '100%'
        content.label = scene.trigger === 'data' ? '关键数据' : '核心指标'
        content.trend = '+' // 默认上升趋势
        break

      case 'ppt-comparison':
        content.title = '对比分析'
        content.leftTitle = '优势'
        content.rightTitle = '劣势'
        content.leftPoints = keywords.slice(0, 3).map(k => typeof k === 'string' ? k : k.text)
        content.rightPoints = keywords.slice(3, 6).map(k => typeof k === 'string' ? k : k.text)
        break

      case 'ppt-quote':
        // 使用最重要的关键词作为金句
        const quoteKeyword = keywords[0]
        content.quote = typeof quoteKeyword === 'string' ? quoteKeyword : (quoteKeyword?.text || '核心观点')
        content.author = ''
        break

      default:
        content.text = keywords.map(k => typeof k === 'string' ? k : k.text).join(' ')
    }

    return content
  }

  /**
   * 生成渲染配置
   * @param {Object} template - 模板
   * @param {Object} content - 内容
   * @returns {Object} 渲染配置
   */
  generateRenderConfig(template, content) {
    return {
      templateId: template.id,
      layers: template.layers,
      content,
      animations: this.extractAnimations(template),
      metadata: template.metadata
    }
  }

  /**
   * 提取模板动画配置
   * @param {Object} template - 模板
   * @returns {Array} 动画配置
   */
  extractAnimations(template) {
    const animations = []

    const processLayers = (layers) => {
      layers.forEach(layer => {
        if (layer.properties?.animation) {
          animations.push({
            layerId: layer.id,
            ...layer.properties.animation
          })
        }
      })
    }

    if (template.layers.fixed) processLayers(template.layers.fixed)
    if (template.layers.dynamic) processLayers(template.layers.dynamic)
    if (template.layers.adjustable) processLayers(template.layers.adjustable)

    return animations
  }

  /**
   * 获取所有可用的组合模式
   * @returns {Array} 组合模式列表
   */
  getAvailablePatterns() {
    return Object.entries(this.compositionPatterns).map(([id, pattern]) => ({
      id,
      name: pattern.name,
      description: pattern.description,
      sceneCount: pattern.sequence.length,
      templates: pattern.sequence.map(s => s.template)
    }))
  }

  /**
   * 预览组合效果
   * @param {string} patternId - 组合模式ID
   * @returns {Object} 预览信息
   */
  previewPattern(patternId) {
    const pattern = this.compositionPatterns[patternId]
    if (!pattern) return null

    return {
      id: patternId,
      name: pattern.name,
      description: pattern.description,
      sequence: pattern.sequence.map((scene, index) => {
        const template = TemplateArchitecture.getTemplate(scene.template)
        return {
          index,
          templateId: scene.template,
          templateName: template?.name || scene.template,
          duration: scene.duration,
          trigger: scene.trigger,
          transition: pattern.transitions[index] || 'fade'
        }
      }),
      totalDuration: pattern.sequence.reduce((sum, s) => sum + s.duration, 0)
    }
  }

  /**
   * 自定义组合模式
   * @param {string} patternId - 模式ID
   * @param {Object} customPattern - 自定义配置
   */
  registerCustomPattern(patternId, customPattern) {
    if (!customPattern.name || !customPattern.sequence) {
      throw new Error('自定义模式必须包含name和sequence')
    }

    this.compositionPatterns[patternId] = {
      ...customPattern,
      transitions: customPattern.transitions || customPattern.sequence.map(() => 'fade')
    }

    console.log(`已注册自定义组合模式: ${patternId}`)
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.initialized = false
  }
}

export default new TemplateComposer()
