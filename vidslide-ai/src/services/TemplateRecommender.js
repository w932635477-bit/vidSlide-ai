/**
 * TemplateRecommender - 智能模板推荐服务
 *
 * 基于内容分析自动推荐最适合的模板
 */

import TemplateArchitecture from '../utils/TemplateArchitecture.js'

class TemplateRecommender {
  constructor() {
    this.architecture = TemplateArchitecture
    this.recommendationCache = new Map()
    this.cacheMaxSize = 100
    this.initialized = false
  }

  /**
   * 初始化推荐服务
   */
  async initialize() {
    if (this.initialized) return

    await this.architecture.initialize()
    this.setupRecommendationRules()
    this.initialized = true

    console.log('智能模板推荐服务已初始化')
  }

  /**
   * 设置推荐规则
   */
  setupRecommendationRules() {
    this.rules = {
      // 内容类型规则
      contentType: {
        video: {
          templates: ['picture-in-picture', 'speaker-focus', 'info-card'],
          weight: 0.9,
          reason: '视频内容适合叠加展示和演讲者聚焦'
        },
        presentation: {
          templates: [
            'ppt-title-slide',
            'ppt-bullet-points',
            'info-card',
            'keyword-highlight',
            'timeline',
            'minimalist'
          ],
          weight: 0.85,
          reason: '演示内容适合PPT风格结构化展示'
        },
        educational: {
          templates: [
            'ppt-bullet-points',
            'educational',
            'timeline',
            'split-screen',
            'document-display',
            'knowledge-sharing'
          ],
          weight: 0.85,
          reason: '教育内容适合要点列表和逻辑化展示'
        },
        promotional: {
          templates: [
            'douyin-marketing',
            'traffic-acquisition',
            'product-showcase',
            'ad-performance'
          ],
          weight: 0.9,
          reason: '营销推广内容适合短视频营销模板'
        },
        data: {
          templates: [
            'ppt-big-number',
            'data-storytelling',
            'chart-analysis',
            'ad-performance',
            'timeline'
          ],
          weight: 0.9,
          reason: '数据内容适合大数字展示和数据故事模板'
        },
        document: {
          templates: ['document-display', 'minimalist', 'info-card'],
          weight: 0.8,
          reason: '文档内容适合文件展示和简洁布局'
        },
        // 短视频/自媒体类型
        shortVideo: {
          templates: ['douyin-marketing', 'traffic-acquisition', 'personal-ip', 'fan-engagement'],
          weight: 0.95,
          reason: '短视频内容适合抖音营销和流量获客模板'
        },
        marketing: {
          templates: [
            'traffic-acquisition',
            'ad-performance',
            'douyin-marketing',
            'product-showcase'
          ],
          weight: 0.9,
          reason: '营销内容适合流量和投放效果模板'
        },
        review: {
          templates: ['ppt-comparison', 'comparison-review', 'split-screen', 'product-showcase'],
          weight: 0.85,
          reason: '评测内容适合PPT对比和种草模板'
        },
        // PPT风格内容类型
        pptStyle: {
          templates: [
            'ppt-title-slide',
            'ppt-bullet-points',
            'ppt-big-number',
            'ppt-comparison',
            'ppt-quote'
          ],
          weight: 0.9,
          reason: 'PPT风格内容适合专业演示模板'
        },
        quote: {
          templates: ['ppt-quote', 'keyword-highlight', 'minimalist'],
          weight: 0.85,
          reason: '金句引用内容适合引用展示模板'
        }
      },

      // 关键词规则
      keywords: {
        // ========== 短视频/自媒体专用规则 ==========

        // 抖音/短视频平台
        shortVideo: {
          patterns: ['抖音', '快手', '小红书', '视频号', 'B站', '短视频', '直播', '带货'],
          template: 'douyin-marketing',
          weight: 0.95,
          reason: '短视频平台内容适合抖音营销模板'
        },

        // 流量获客
        trafficAcquisition: {
          patterns: [
            '获客',
            '流量',
            '转化',
            '变现',
            '引流',
            '私域',
            '公域',
            '漏斗',
            '陌生流量',
            '流量推送'
          ],
          template: 'traffic-acquisition',
          weight: 0.95,
          reason: '流量获客内容适合流量漏斗模板'
        },

        // 广告投放
        advertising: {
          patterns: [
            '投放',
            '巨量AD',
            '质量AD',
            '广告',
            'ROI',
            'CPM',
            'CPC',
            'CTR',
            '推广',
            '信息流'
          ],
          template: 'ad-performance',
          weight: 0.9,
          reason: '广告投放内容适合投放效果模板'
        },

        // IP打造
        personalBrand: {
          patterns: ['做IP', 'IP', 'KOL', 'KOC', '个人品牌', '人设', '账号', '自媒体', 'MCN'],
          template: 'personal-ip',
          weight: 0.9,
          reason: 'IP打造内容适合个人品牌模板'
        },

        // 粉丝互动
        fanEngagement: {
          patterns: ['粉丝', '互动', '点赞', '评论', '分享', '收藏', '关注', '原生互动', '社区'],
          template: 'fan-engagement',
          weight: 0.85,
          reason: '粉丝互动内容适合互动展示模板'
        },

        // 干货分享
        knowledgeSharing: {
          patterns: ['干货', '技巧', '方法', '攻略', '教程', '分享', '总结', '玩法', '套路'],
          template: 'knowledge-sharing',
          weight: 0.85,
          reason: '干货分享内容适合知识展示模板'
        },

        // 种草评测
        review: {
          patterns: ['种草', '拔草', '评测', '测评', '推荐', '好物', '安利', '避坑'],
          template: 'comparison-review',
          weight: 0.85,
          reason: '种草评测内容适合对比推荐模板'
        },

        // 数据故事
        dataStory: {
          patterns: ['增长', '下降', '趋势', '数据', '统计', '分析', '报告', '指标'],
          template: 'data-storytelling',
          weight: 0.9,
          reason: '数据内容适合数据故事模板'
        },

        // ========== 通用规则 ==========

        // 时间相关
        time: {
          patterns: ['时间', '发展', '历程', '阶段', '历史', '未来', '过去'],
          template: 'timeline',
          weight: 0.9,
          reason: '时间相关内容适合时间线展示'
        },

        // 对比相关
        comparison: {
          patterns: ['对比', '区别', '比较', '优缺点', '差异', '选择', 'vs', 'VS'],
          template: 'split-screen',
          weight: 0.85,
          reason: '对比内容适合分屏展示'
        },

        // 关键词强调
        keywords: {
          patterns: ['重要', '关键', '重点', '强调', '注意', '记住', '核心'],
          template: 'keyword-highlight',
          weight: 0.75,
          reason: '强调内容适合关键词高亮'
        },

        // 演讲相关
        speech: {
          patterns: ['演讲', '演示', '讲解', '介绍', '说明', '展示', '演讲者'],
          template: 'speaker-focus',
          weight: 0.9,
          reason: '演讲内容适合演讲者聚焦展示'
        },

        // 产品相关
        product: {
          patterns: ['产品', '商品', '服务', '功能', '特点', '优势', '价格', '优惠'],
          template: 'product-showcase',
          weight: 0.85,
          reason: '产品内容适合产品展示模板'
        },

        // 教育相关
        education: {
          patterns: ['学习', '教学', '课程', '教育', '培训', '知识', '技能'],
          template: 'educational',
          weight: 0.85,
          reason: '教育内容适合教育模板'
        },

        // 文档相关
        document: {
          patterns: ['文档', '文件', '资料', '报告', '手册', '指南'],
          template: 'document-display',
          weight: 0.8,
          reason: '文档内容适合文件展示模板'
        },

        // 对话弹窗相关
        popup: {
          patterns: ['提醒', '提示', '警告', '通知'],
          template: 'dialog-popup',
          weight: 0.75,
          reason: '需要强调的内容适合弹窗展示'
        },

        // ========== PPT风格专用规则 ==========

        // PPT标题/开场
        pptTitle: {
          patterns: ['开场', '标题', '主题', '今天', '介绍', '欢迎', '大家好'],
          template: 'ppt-title-slide',
          weight: 0.85,
          reason: '开场内容适合PPT标题幻灯片'
        },

        // PPT要点/列表
        pptBullets: {
          patterns: [
            '第一',
            '第二',
            '第三',
            '首先',
            '其次',
            '然后',
            '最后',
            '要点',
            '步骤',
            '方法',
            '技巧'
          ],
          template: 'ppt-bullet-points',
          weight: 0.9,
          reason: '列举内容适合PPT要点列表模板'
        },

        // PPT大数字
        pptNumber: {
          patterns: ['增长', '下降', '提升', '达到', '超过', '突破', '%', '万', '亿', '倍'],
          template: 'ppt-big-number',
          weight: 0.9,
          reason: '数据增长内容适合PPT大数字展示'
        },

        // PPT对比
        pptComparison: {
          patterns: ['对比', '区别', '不同', '优点', '缺点', '好处', '坏处', '利弊', 'vs', 'VS'],
          template: 'ppt-comparison',
          weight: 0.9,
          reason: '对比分析内容适合PPT左右对比模板'
        },

        // PPT金句
        pptQuote: {
          patterns: ['金句', '名言', '格言', '记住', '核心', '关键', '重要的是', '一句话'],
          template: 'ppt-quote',
          weight: 0.85,
          reason: '金句名言内容适合PPT引用模板'
        }
      },

      // 内容密度规则
      contentDensity: {
        high: {
          threshold: 0.7,
          templates: ['minimalist', 'keyword-highlight', 'dialog-popup'],
          weight: 0.8,
          reason: '内容密度高，适合简洁和强调展示'
        },
        medium: {
          threshold: 0.4,
          templates: ['info-card', 'timeline', 'educational'],
          weight: 0.9,
          reason: '内容适中，适合结构化和教育化展示'
        },
        low: {
          threshold: 0.2,
          templates: ['picture-in-picture', 'speaker-focus', 'product-showcase'],
          weight: 0.85,
          reason: '内容简单，适合视觉吸引展示'
        }
      },

      // 数据提及规则
      dataMentions: {
        high: {
          threshold: 0.3,
          templates: ['chart-analysis', 'timeline', 'document-display'],
          weight: 0.9,
          reason: '数据提及多，适合图表和文档展示'
        },
        medium: {
          threshold: 0.15,
          templates: ['info-card', 'split-screen', 'educational'],
          weight: 0.8,
          reason: '数据提及中等，适合信息和对比展示'
        }
      },

      // 情感倾向规则
      sentiment: {
        positive: {
          templates: ['picture-in-picture', 'keyword-highlight', 'product-showcase'],
          weight: 0.8,
          reason: '积极内容适合生动和产品化展示'
        },
        neutral: {
          templates: ['info-card', 'timeline', 'minimalist'],
          weight: 0.9,
          reason: '中性内容适合专业和简洁展示'
        },
        serious: {
          templates: ['timeline', 'educational', 'document-display'],
          weight: 0.85,
          reason: '严肃内容适合正式和教育化展示'
        }
      }
    }
  }

  /**
   * 生成模板推荐
   * @param {Object} contentAnalysis - 内容分析结果
   * @param {Object} options - 推荐选项
   * @returns {Array} 推荐结果列表
   */
  async generateRecommendations(contentAnalysis, options = {}) {
    if (!this.initialized) {
      await this.initialize()
    }

    const cacheKey = this.generateCacheKey(contentAnalysis, options)
    const cached = this.recommendationCache.get(cacheKey)
    if (cached) {
      console.log('使用缓存的推荐结果')
      return cached
    }

    console.log('生成新的模板推荐...')

    const recommendations = []

    // 1. 内容类型分析
    const contentTypeRecs = this.analyzeContentType(contentAnalysis)
    recommendations.push(...contentTypeRecs)

    // 2. 关键词分析
    const keywordRecs = this.analyzeKeywords(contentAnalysis.keywords || [])
    recommendations.push(...keywordRecs)

    // 3. 内容密度分析
    const densityRecs = this.analyzeContentDensity(contentAnalysis)
    recommendations.push(...densityRecs)

    // 4. 数据提及分析
    const dataRecs = this.analyzeDataMentions(contentAnalysis)
    recommendations.push(...dataRecs)

    // 5. 情感倾向分析
    const sentimentRecs = this.analyzeSentiment(contentAnalysis)
    recommendations.push(...sentimentRecs)

    // 6. 去重和评分
    const uniqueRecommendations = this.deduplicateAndScore(recommendations)

    // 7. 应用用户偏好
    const personalizedRecs = this.applyUserPreferences(uniqueRecommendations, options)

    // 8. 排序和限制数量
    const finalRecommendations = this.sortAndLimitRecommendations(
      personalizedRecs,
      options.maxRecommendations || 3
    )

    // 缓存结果
    this.setCache(cacheKey, finalRecommendations)

    return finalRecommendations
  }

  /**
   * 分析内容类型
   * @param {Object} contentAnalysis - 内容分析
   * @returns {Array} 推荐结果
   */
  analyzeContentType(contentAnalysis) {
    const recommendations = []
    const { contentType, confidence = 0 } = contentAnalysis

    if (contentType && this.rules.contentType[contentType]) {
      const rule = this.rules.contentType[contentType]
      rule.templates.forEach(templateId => {
        const template = this.architecture.getTemplate(templateId)
        if (template) {
          recommendations.push({
            template,
            score: rule.weight * confidence,
            reason: rule.reason,
            source: 'content-type',
            confidence
          })
        }
      })
    }

    return recommendations
  }

  /**
   * 分析关键词
   * @param {Array} keywords - 关键词数组
   * @returns {Array} 推荐结果
   */
  analyzeKeywords(keywords) {
    const recommendations = []
    const keywordText = keywords
      .map(k => k.text || k)
      .join(' ')
      .toLowerCase()

    for (const [ruleName, rule] of Object.entries(this.rules.keywords)) {
      let matchCount = 0
      let totalWeight = 0

      rule.patterns.forEach(pattern => {
        if (keywordText.includes(pattern.toLowerCase())) {
          matchCount++
          totalWeight += this.calculateKeywordWeight(pattern, keywords)
        }
      })

      if (matchCount > 0) {
        const template = this.architecture.getTemplate(rule.template)
        if (template) {
          const score = rule.weight * (matchCount / rule.patterns.length) * totalWeight
          recommendations.push({
            template,
            score,
            reason: rule.reason,
            source: 'keywords',
            matchedPatterns: rule.patterns.filter(p => keywordText.includes(p.toLowerCase())),
            matchCount
          })
        }
      }
    }

    return recommendations
  }

  /**
   * 计算关键词权重
   * @param {string} pattern - 匹配模式
   * @param {Array} keywords - 关键词数组
   * @returns {number} 权重
   */
  calculateKeywordWeight(pattern, keywords) {
    // 查找匹配的关键词并计算其重要性
    const matchedKeyword = keywords.find(k =>
      (k.text || k).toLowerCase().includes(pattern.toLowerCase())
    )

    if (matchedKeyword && typeof matchedKeyword === 'object' && matchedKeyword.importance) {
      return matchedKeyword.importance
    }

    // 默认权重
    return 0.7
  }

  /**
   * 分析内容密度
   * @param {Object} contentAnalysis - 内容分析
   * @returns {Array} 推荐结果
   */
  analyzeContentDensity(contentAnalysis) {
    const recommendations = []
    const { textDensity = 0 } = contentAnalysis

    let densityLevel = 'medium'
    if (textDensity >= this.rules.contentDensity.high.threshold) {
      densityLevel = 'high'
    } else if (textDensity <= this.rules.contentDensity.low.threshold) {
      densityLevel = 'low'
    }

    const rule = this.rules.contentDensity[densityLevel]
    rule.templates.forEach(templateId => {
      const template = this.architecture.getTemplate(templateId)
      if (template) {
        recommendations.push({
          template,
          score: rule.weight,
          reason: rule.reason,
          source: 'content-density',
          densityLevel,
          textDensity
        })
      }
    })

    return recommendations
  }

  /**
   * 分析数据提及
   * @param {Object} contentAnalysis - 内容分析
   * @returns {Array} 推荐结果
   */
  analyzeDataMentions(contentAnalysis) {
    const recommendations = []
    const { dataMentions = 0 } = contentAnalysis

    let dataLevel = null
    if (dataMentions >= this.rules.dataMentions.high.threshold) {
      dataLevel = 'high'
    } else if (dataMentions >= this.rules.dataMentions.medium.threshold) {
      dataLevel = 'medium'
    }

    if (dataLevel) {
      const rule = this.rules.dataMentions[dataLevel]
      rule.templates.forEach(templateId => {
        const template = this.architecture.getTemplate(templateId)
        if (template) {
          recommendations.push({
            template,
            score: rule.weight,
            reason: rule.reason,
            source: 'data-mentions',
            dataLevel,
            dataMentions
          })
        }
      })
    }

    return recommendations
  }

  /**
   * 分析情感倾向
   * @param {Object} contentAnalysis - 内容分析
   * @returns {Array} 推荐结果
   */
  analyzeSentiment(contentAnalysis) {
    const recommendations = []
    const { sentiment = 'neutral' } = contentAnalysis

    if (this.rules.sentiment[sentiment]) {
      const rule = this.rules.sentiment[sentiment]
      rule.templates.forEach(templateId => {
        const template = this.architecture.getTemplate(templateId)
        if (template) {
          recommendations.push({
            template,
            score: rule.weight,
            reason: rule.reason,
            source: 'sentiment',
            sentiment
          })
        }
      })
    }

    return recommendations
  }

  /**
   * 去重和评分
   * @param {Array} recommendations - 推荐列表
   * @returns {Array} 去重后的推荐
   */
  deduplicateAndScore(recommendations) {
    const templateScores = new Map()

    // 合并相同模板的分数
    recommendations.forEach(rec => {
      const templateId = rec.template.id
      if (!templateScores.has(templateId)) {
        templateScores.set(templateId, {
          template: rec.template,
          totalScore: 0,
          reasons: [],
          sources: new Set(),
          maxScore: 0
        })
      }

      const data = templateScores.get(templateId)
      data.totalScore += rec.score
      data.reasons.push(rec.reason)
      data.sources.add(rec.source)
      data.maxScore = Math.max(data.maxScore, rec.score)

      // 保留其他元数据
      Object.assign(data, rec)
    })

    // 计算最终分数（加权平均 + 多样性奖励）
    return Array.from(templateScores.values()).map(data => ({
      ...data,
      finalScore: this.calculateFinalScore(data),
      reasons: [...new Set(data.reasons)], // 去重理由
      sources: Array.from(data.sources)
    }))
  }

  /**
   * 计算最终分数
   * @param {Object} data - 模板数据
   * @returns {number} 最终分数
   */
  calculateFinalScore(data) {
    const { totalScore, sources, maxScore } = data

    // sources 是 Set，需要使用 size 而不是 length
    const sourceCount = sources.size || sources.length || 1

    // 基础分数：平均分
    const avgScore = totalScore / sourceCount

    // 多样性奖励：匹配多个规则的奖励
    const diversityBonus = Math.min(sourceCount * 0.1, 0.3)

    // 最高分权重
    const maxScoreWeight = maxScore * 0.2

    return Math.min(avgScore + diversityBonus + maxScoreWeight, 1.0)
  }

  /**
   * 应用用户偏好
   * @param {Array} recommendations - 推荐列表
   * @param {Object} options - 用户选项
   * @returns {Array} 个性化推荐
   */
  applyUserPreferences(recommendations, options) {
    const { userPreferences = {}, excludeTemplates = [] } = options

    return recommendations
      .filter(rec => !excludeTemplates.includes(rec.template.id))
      .map(rec => {
        let adjustedScore = rec.finalScore

        // 应用用户偏好权重
        if (userPreferences.favoriteTemplates?.includes(rec.template.id)) {
          adjustedScore *= 1.2 // 偏好模板加权
        }

        if (userPreferences.dislikedTemplates?.includes(rec.template.id)) {
          adjustedScore *= 0.7 // 不喜欢模板减权
        }

        // 风格偏好
        if (userPreferences.preferredStyle) {
          const templateStyle = rec.template.metadata?.tags?.[0] || 'general'
          if (templateStyle === userPreferences.preferredStyle) {
            adjustedScore *= 1.1
          }
        }

        return {
          ...rec,
          finalScore: Math.min(adjustedScore, 1.0),
          personalized: true
        }
      })
  }

  /**
   * 排序和限制数量
   * @param {Array} recommendations - 推荐列表
   * @param {number} maxCount - 最大数量
   * @returns {Array} 排序后的推荐
   */
  sortAndLimitRecommendations(recommendations, maxCount) {
    return recommendations
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, maxCount)
      .map((rec, index) => ({
        ...rec,
        rank: index + 1,
        confidence: Math.round(rec.finalScore * 100)
      }))
  }

  /**
   * 生成缓存键
   * @param {Object} contentAnalysis - 内容分析
   * @param {Object} options - 选项
   * @returns {string} 缓存键
   */
  generateCacheKey(contentAnalysis, options) {
    // 创建简化的指纹用于缓存
    const fingerprint = {
      contentType: contentAnalysis.contentType,
      keywords: contentAnalysis.keywords
        ?.slice(0, 5)
        .map(k => k.text || k)
        .join(','),
      textDensity: Math.round((contentAnalysis.textDensity || 0) * 10) / 10,
      dataMentions: Math.round((contentAnalysis.dataMentions || 0) * 10) / 10,
      sentiment: contentAnalysis.sentiment,
      userPrefs: options.userPreferences
    }

    // 使用简单的哈希函数代替btoa（支持中文）
    const str = JSON.stringify(fingerprint)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return 'cache_' + Math.abs(hash).toString(36)
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {Array} recommendations - 推荐结果
   */
  setCache(key, recommendations) {
    this.recommendationCache.set(key, recommendations)

    // 控制缓存大小
    if (this.recommendationCache.size > this.cacheMaxSize) {
      const firstKey = this.recommendationCache.keys().next().value
      this.recommendationCache.delete(firstKey)
    }
  }

  /**
   * 获取推荐统计
   * @returns {Object} 统计信息
   */
  getStatistics() {
    return {
      cacheSize: this.recommendationCache.size,
      maxCacheSize: this.cacheMaxSize,
      rulesCount: Object.keys(this.rules).length,
      availableTemplates: this.architecture.getAllTemplates().length
    }
  }

  /**
   * 学习用户反馈
   * @param {string} templateId - 模板ID
   * @param {boolean} accepted - 是否接受
   * @param {Object} contentAnalysis - 内容分析
   */
  learnFromFeedback(templateId, accepted, contentAnalysis) {
    // 这里可以实现机器学习算法来改进推荐
    // 暂时记录反馈用于分析
    console.log(`用户反馈: ${templateId} - ${accepted ? '接受' : '拒绝'}`)

    // 可以存储到本地存储或发送到服务器
    const feedback = {
      templateId,
      accepted,
      contentFingerprint: this.generateCacheKey(contentAnalysis, {}),
      timestamp: Date.now()
    }

    // 存储反馈历史（简化实现）
    const feedbackHistory = JSON.parse(localStorage.getItem('template-feedback') || '[]')
    feedbackHistory.push(feedback)

    // 限制历史数量
    if (feedbackHistory.length > 100) {
      feedbackHistory.shift()
    }

    localStorage.setItem('template-feedback', JSON.stringify(feedbackHistory))
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.recommendationCache.clear()
    this.initialized = false
  }
}

export default new TemplateRecommender()
