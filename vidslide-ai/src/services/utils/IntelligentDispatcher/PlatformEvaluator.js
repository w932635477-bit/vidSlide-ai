/**
 * PlatformEvaluator.js
 * 平台评估器 - Vue环境优化版本
 */

class PlatformEvaluator {
  constructor() {
    // 平台配置 - 基于实际API能力和约束文档
    this.platforms = {
      baidu: {
        name: '百度图片',
        language: 'chinese',
        strengths: [
          'chinese_content',
          'cultural_relevance',
          'local_hotspots',
          'high_quality',
          'free_commercial'
        ],
        weaknesses: ['english_content', 'international_brands', 'response_speed'],
        apiLimit: 100, // 每日免费额度
        responseTime: 1500, // 毫秒
        accuracy: 0.85,
        cost: 0,
        reliability: 0.9
      },
      unsplash: {
        name: 'Unsplash',
        language: 'english',
        strengths: [
          'photography_quality',
          'creative_content',
          'international',
          'high_resolution',
          'free_commercial'
        ],
        weaknesses: ['chinese_content', 'cultural_context', 'api_limits'],
        apiLimit: 5000,
        responseTime: 2000,
        accuracy: 0.82,
        cost: 0,
        reliability: 0.95
      },
      pexels: {
        name: 'Pexels',
        language: 'english',
        strengths: [
          'video_content',
          'diverse_styles',
          'free_commercial',
          'good_quality',
          'large_collection'
        ],
        weaknesses: ['chinese_specific', 'brand_specific', 'api_limits'],
        apiLimit: 200,
        responseTime: 1800,
        accuracy: 0.78,
        cost: 0,
        reliability: 0.9
      },
      pixabay: {
        name: 'Pixabay',
        language: 'english',
        strengths: [
          'large_collection',
          'multilingual_tags',
          'free_commercial',
          'fast_response',
          'good_quality'
        ],
        weaknesses: ['chinese_specific', 'quality_consistency', 'creative_limitations'],
        apiLimit: 5000,
        responseTime: 1600,
        accuracy: 0.75,
        cost: 0,
        reliability: 0.95
      }
    }

    // 评估权重配置
    this.weights = {
      languageMatch: 0.35, // 语言匹配度 (最重要)
      contentRelevance: 0.3, // 内容相关性
      culturalFit: 0.15, // 文化适应度
      performance: 0.1, // 性能表现
      reliability: 0.1 // 可靠性
    }

    // 缓存评估结果
    this.evaluationCache = new Map()
    this.cacheMaxSize = 100
  }

  /**
   * 计算各平台匹配分数
   * @param {string} keyword - 关键词
   * @param {Object} analysis - 关键词分析结果
   * @returns {Object} 各平台得分
   */
  calculateScores(keyword, analysis) {
    const cacheKey = `${keyword}_${analysis.language}_${analysis.category}`

    // 检查缓存
    if (this.evaluationCache.has(cacheKey)) {
      return this.evaluationCache.get(cacheKey)
    }

    const scores = {}

    for (const [platformKey, platform] of Object.entries(this.platforms)) {
      scores[platformKey] = this.calculatePlatformScore(keyword, analysis, platform)
    }

    // 缓存结果
    this.updateCache(cacheKey, scores)

    return scores
  }

  /**
   * 计算单个平台的分数
   */
  calculatePlatformScore(keyword, analysis, platform) {
    let score = 0

    // 1. 语言匹配度
    score += this.calculateLanguageMatch(analysis, platform) * this.weights.languageMatch

    // 2. 内容相关性
    score +=
      this.calculateContentRelevance(keyword, analysis, platform) * this.weights.contentRelevance

    // 3. 文化适应度
    score += this.calculateCulturalFit(keyword, analysis, platform) * this.weights.culturalFit

    // 4. 性能表现
    score += this.calculatePerformance(platform) * this.weights.performance

    // 5. 可靠性
    score += this.calculateReliability(platform) * this.weights.reliability

    return Math.min(Math.max(score, 0), 1) // 确保在0-1范围内
  }

  /**
   * 计算语言匹配度
   */
  calculateLanguageMatch(analysis, platform) {
    const { language, chineseRatio, englishRatio } = analysis

    if (platform.language === 'chinese' && language === 'chinese') {
      return Math.min(chineseRatio * 1.2, 1) // 中文平台匹配中文关键词
    } else if (platform.language === 'english' && language === 'english') {
      return Math.min(englishRatio * 1.2, 1) // 英文平台匹配英文关键词
    } else if (platform.language === 'english' && language === 'mixed') {
      return englishRatio * 0.8 // 英文平台对混合关键词的部分匹配
    }

    return 0.1 // 基础分数，避免完全不匹配
  }

  /**
   * 计算内容相关性
   */
  calculateContentRelevance(keyword, analysis, platform) {
    let relevance = 0.5 // 基础相关性

    // 根据关键词内容调整相关性
    if (platform.strengths.includes('chinese_content') && analysis.chineseRatio > 0.5) {
      relevance += 0.3
    }

    if (platform.strengths.includes('photography_quality') && this.isPhotographyKeyword(keyword)) {
      relevance += 0.2
    }

    if (
      platform.strengths.includes('cultural_relevance') &&
      this.isCulturalKeyword(keyword, analysis)
    ) {
      relevance += 0.25
    }

    if (platform.strengths.includes('video_content') && this.isVideoKeyword(keyword)) {
      relevance += 0.15
    }

    if (platform.strengths.includes('large_collection') && analysis.length > 5) {
      relevance += 0.1 // 长关键词在大集合中更容易找到
    }

    return Math.min(relevance, 1)
  }

  /**
   * 计算文化适应度
   */
  calculateCulturalFit(keyword, analysis, platform) {
    // 面向中国市场的优化
    if (platform.language === 'chinese') {
      // 百度平台对中国文化内容适应度高
      if (analysis.chineseRatio > 0.5) {
        return 0.9
      }
      // 对英文内容也有一定适应度
      return 0.6
    }

    // 国外平台对中国文化内容的适应度
    if (analysis.chineseRatio > 0.3) {
      return 0.4 // 国外平台对中国文化内容适应度一般
    }

    // 对通用英文内容的适应度
    return 0.8
  }

  /**
   * 计算性能表现
   */
  calculatePerformance(platform) {
    // 基于响应时间的性能评分 (越快评分越高)
    // 2000ms为基准，低于基准的得分更高
    const timeScore = Math.max(0, 1 - (platform.responseTime - 1000) / 2000)
    return Math.max(0.3, timeScore) // 最低0.3分
  }

  /**
   * 计算可靠性
   */
  calculateReliability(platform) {
    // 基于API额度限制的可靠性评分
    const limitScore = Math.min(1, platform.apiLimit / 1000)
    const accuracyScore = platform.accuracy
    const costScore = platform.cost === 0 ? 1 : 0.8 // 免费API可靠性更高

    return (limitScore + accuracyScore + costScore) / 3
  }

  /**
   * 判断是否为摄影相关关键词
   */
  isPhotographyKeyword(keyword) {
    // 摄影相关关键词（不包括风景等自然景观词汇）
    const photoKeywords = [
      '摄影',
      '照片',
      '图片',
      'photo',
      'photography',
      'image',
      '摄影师',
      'photographer',
      'camera',
      '镜头',
      '曝光',
      'composition'
    ]
    return photoKeywords.some(k => keyword.toLowerCase().includes(k))
  }

  /**
   * 判断是否为文化相关关键词
   */
  isCulturalKeyword(keyword, analysis) {
    const culturalKeywords = [
      '文化',
      '传统',
      '节日',
      '艺术',
      '历史',
      '文明',
      'cultural',
      'traditional',
      'festival',
      'art',
      'history',
      'civilization'
    ]

    // 只检查关键词是否包含文化相关术语
    return culturalKeywords.some(k => keyword.toLowerCase().includes(k))
  }

  /**
   * 判断是否为视频相关关键词
   */
  isVideoKeyword(keyword) {
    const videoKeywords = [
      '视频',
      '电影',
      '动画',
      '视频',
      'movie',
      'film',
      'animation',
      '播放',
      '观看',
      '录制',
      '直播',
      'play',
      'watch',
      'record',
      'live'
    ]
    return videoKeywords.some(k => keyword.toLowerCase().includes(k))
  }

  /**
   * 更新缓存
   */
  updateCache(key, scores) {
    // 直接存储scores对象，不添加timestamp以保持引用一致性
    this.evaluationCache.set(key, scores)

    // 控制缓存大小
    if (this.evaluationCache.size > this.cacheMaxSize) {
      const firstKey = this.evaluationCache.keys().next().value
      this.evaluationCache.delete(firstKey)
    }
  }

  /**
   * 获取平台详情
   */
  getPlatformDetails(platformKey) {
    return this.platforms[platformKey] || null
  }

  /**
   * 获取所有平台信息
   */
  getAllPlatforms() {
    return { ...this.platforms }
  }

  /**
   * 更新平台状态 (如API额度变化)
   */
  updatePlatformStatus(platformKey, updates) {
    if (this.platforms[platformKey]) {
      Object.assign(this.platforms[platformKey], updates)
      // 清除相关缓存
      this.clearRelatedCache(platformKey)
    }
  }

  /**
   * 清除相关缓存
   */
  clearRelatedCache(platformKey) {
    for (const [cacheKey, value] of this.evaluationCache) {
      // 如果缓存中包含该平台，删除缓存
      if (Object.keys(value).includes(platformKey)) {
        this.evaluationCache.delete(cacheKey)
      }
    }
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.evaluationCache.clear()
  }

  /**
   * 获取评估统计
   */
  getEvaluationStats() {
    const platformUsage = {}
    for (const [, value] of this.evaluationCache) {
      // 统计各平台被推荐的频率
      const bestPlatform = Object.entries(value)
        .filter(([, v]) => typeof v === 'number')
        .sort(([, a], [, b]) => b - a)[0]

      if (bestPlatform) {
        platformUsage[bestPlatform[0]] = (platformUsage[bestPlatform[0]] || 0) + 1
      }
    }

    return {
      cacheSize: this.evaluationCache.size,
      platformUsage,
      totalEvaluations: this.evaluationCache.size
    }
  }
}

export default PlatformEvaluator
