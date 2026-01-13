/**
 * IntelligentDispatcher.js
 * VidSlide AI 智能素材调度器 - Vue环境版本
 *
 * 基于Node.js测试版本优化，适配Vue应用环境
 * 提供更精细的平台选择和性能监控
 */

import KeywordAnalyzer from './utils/IntelligentDispatcher/KeywordAnalyzer.js'
import PlatformEvaluator from './utils/IntelligentDispatcher/PlatformEvaluator.js'
import TranslationService from './utils/IntelligentDispatcher/TranslationService.js'

class IntelligentDispatcher {
  constructor() {
    this.keywordAnalyzer = new KeywordAnalyzer()
    this.platformEvaluator = new PlatformEvaluator()
    this.translationService = new TranslationService()

    // Vue环境优化：使用更轻量的性能监控
    this.performanceMetrics = {
      analysisTime: [],
      dispatchTime: [],
      translationTime: [],
      totalTime: [],
      successRate: [],
      platformUsage: {}
    }

    // 缓存优化：使用Map存储最近结果
    this.resultCache = new Map()
    this.cacheMaxSize = 50

    this.isInitialized = false
  }

  /**
   * 初始化调度器
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('🎯 初始化智能素材调度器...')

      // 预热翻译服务
      await this.translationService.initialize()

      this.isInitialized = true
      console.log('✅ 智能调度器初始化完成')
    } catch (error) {
      console.error('❌ 智能调度器初始化失败:', error)
      throw error
    }
  }

  /**
   * 智能调度素材获取
   * @param {string} keyword - 关键词
   * @param {Object} options - 调度选项
   * @returns {Promise<Object>} 调度决策结果
   */
  async dispatch(keyword, options = {}) {
    const startTime = performance.now()

    if (!this.isInitialized) {
      await this.initialize()
    }

    // 处理空关键词
    if (!keyword || keyword.trim().length === 0) {
      return {
        keyword,
        error: '关键词不能为空',
        strategy: null,
        platforms: [],
        translation: null,
        estimatedTime: 0,
        confidence: 0,
        reasoning: '',
        performance: { totalTime: performance.now() - startTime }
      }
    }

    const result = {
      keyword,
      strategy: null,
      platforms: [],
      translation: null,
      estimatedTime: 0,
      confidence: 0,
      reasoning: '',
      performance: {}
      // cacheHit: undefined (第一次调用时)
    }

    try {
      // 1. 检查缓存
      const cacheKey = this.generateCacheKey(keyword, options)
      const cachedResult = this.resultCache.get(cacheKey)

      if (cachedResult && this.isCacheValid(cachedResult)) {
        result.cacheHit = true
        return { ...cachedResult, cacheHit: true }
      }

      // 2. 关键词分析
      const analysisStart = performance.now()
      const analysis = this.keywordAnalyzer.analyze(keyword)
      const analysisTime = performance.now() - analysisStart

      // 3. 策略选择
      const strategy = this.selectStrategy(analysis, options)

      // 4. 平台评估和选择
      const platformScores = this.platformEvaluator.calculateScores(keyword, analysis)
      const platforms = this.selectPlatforms(strategy, platformScores, keyword)

      // 5. 翻译处理 (如需要)
      let translatedKeyword = keyword
      if (strategy.translation) {
        const translationStart = performance.now()
        try {
          translatedKeyword = await this.translationService.translate(keyword)
          const translationTime = performance.now() - translationStart

          result.translation = {
            original: keyword,
            translated: translatedKeyword,
            time: translationTime
          }
        } catch (translationError) {
          console.warn('翻译失败，使用原文:', translationError.message)
          // 翻译失败时不设置translation，继续使用原文
        }
      }

      // 6. 构建最终结果
      result.strategy = strategy
      result.platforms = platforms
      result.estimatedTime = this.calculateEstimatedTime(strategy, platforms)
      result.confidence = this.calculateConfidence(strategy, analysis, platforms)
      result.reasoning = this.generateReasoning(strategy, analysis, platforms)

      // 7. 性能记录
      const totalTime = performance.now() - startTime
      result.performance = {
        analysisTime,
        dispatchTime: totalTime - analysisTime,
        totalTime,
        strategy: strategy.name,
        platformCount: platforms.length
      }

      // 8. 更新缓存
      this.updateCache(cacheKey, result)

      // 9. 记录性能指标
      this.recordPerformanceMetrics(result.performance, result.platforms)

      return result
    } catch (error) {
      result.error = error.message
      result.performance = { totalTime: performance.now() - startTime }

      console.error('智能调度失败:', error)
      return result
    }
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(keyword, options) {
    // 使用简单哈希方法，避免btoa的字符限制
    const key = `${keyword}_${JSON.stringify(options)}_${Date.now()}`
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36).slice(0, 16) // 16字符的36进制字符串
  }

  /**
   * 检查缓存是否有效
   */
  isCacheValid(cachedResult) {
    if (!cachedResult.timestamp) return false

    const age = Date.now() - cachedResult.timestamp
    const maxAge = 5 * 60 * 1000 // 5分钟缓存

    return age < maxAge
  }

  /**
   * 更新缓存
   */
  updateCache(key, result) {
    // 添加时间戳
    const cachedResult = {
      ...result,
      timestamp: Date.now()
    }

    this.resultCache.set(key, cachedResult)

    // 控制缓存大小
    if (this.resultCache.size > this.cacheMaxSize) {
      const firstKey = this.resultCache.keys().next().value
      this.resultCache.delete(firstKey)
    }
  }

  /**
   * 选择调度策略
   */
  selectStrategy(analysis, options) {
    const { language, confidence, category } = analysis

    // 策略1: 单平台精确模式 (默认，速度优先)
    if (confidence > 0.8 || options.speedPriority) {
      return {
        name: 'single_platform',
        type: 'fast',
        platforms: 1,
        translation: language === 'chinese',
        description: '单平台精确模式，速度最快'
      }
    }

    // 策略2: 多平台并行模式 (质量优先)
    if (confidence < 0.6 || options.qualityPriority || category === 'mixed_with_patterns') {
      return {
        name: 'parallel_platforms',
        type: 'quality',
        platforms: 2,
        translation: true,
        description: '多平台并行，质量最优'
      }
    }

    // 策略3: 渐进式扩展 (平衡模式)
    return {
      name: 'progressive_expansion',
      type: 'balanced',
      platforms: 'adaptive',
      translation: language === 'chinese' || language === 'mixed',
      description: '渐进式扩展，平衡速度和质量'
    }
  }

  /**
   * 选择平台
   */
  selectPlatforms(strategy, scores, keyword) {
    const platforms = []

    if (strategy.name === 'single_platform') {
      // 单平台模式：选择最高分平台
      const bestPlatform = Object.entries(scores).reduce(
        (best, [key, score]) => (score > best.score ? { key, score } : best),
        { key: null, score: 0 }
      )

      if (bestPlatform.key) {
        platforms.push({
          name: bestPlatform.key,
          score: bestPlatform.score,
          keyword: keyword,
          priority: 1,
          estimatedTime: this.getPlatformEstimatedTime(bestPlatform.key)
        })
      }
    } else if (strategy.name === 'parallel_platforms') {
      // 多平台并行：选择前2名
      const sortedPlatforms = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)

      sortedPlatforms.forEach(([key, score], index) => {
        platforms.push({
          name: key,
          score,
          keyword: keyword,
          priority: index + 1,
          estimatedTime: this.getPlatformEstimatedTime(key)
        })
      })
    } else if (strategy.name === 'progressive_expansion') {
      // 渐进式：先选1个，预备其他
      const sortedPlatforms = Object.entries(scores).sort(([, a], [, b]) => b - a)

      platforms.push({
        name: sortedPlatforms[0][0],
        score: sortedPlatforms[0][1],
        keyword: keyword,
        priority: 1,
        estimatedTime: this.getPlatformEstimatedTime(sortedPlatforms[0][0])
      })

      // 预备平台
      if (sortedPlatforms.length > 1) {
        platforms[0].backup = {
          name: sortedPlatforms[1][0],
          score: sortedPlatforms[1][1]
        }
      }
    }

    return platforms
  }

  /**
   * 获取平台预估时间
   */
  getPlatformEstimatedTime(platformName) {
    const times = {
      baidu: 1500,
      unsplash: 2000,
      pexels: 1800,
      pixabay: 1600
    }
    return times[platformName] || 2000
  }

  /**
   * 计算预估时间
   */
  calculateEstimatedTime(strategy, platforms) {
    let baseTime = 500 // 基础处理时间

    if (strategy.translation) {
      baseTime += 1000 // 翻译时间
    }

    // 平台响应时间
    const platformTimes = platforms.map(p => p.estimatedTime || 2000)

    if (strategy.name === 'parallel_platforms') {
      baseTime += Math.max(...platformTimes) // 并行取最大值
    } else {
      baseTime += platformTimes.reduce((sum, time) => sum + time, 0) // 串行累加
    }

    return baseTime
  }

  /**
   * 计算置信度
   */
  calculateConfidence(strategy, analysis, platforms) {
    let confidence = analysis.confidence

    // 策略调整
    if (strategy.name === 'parallel_platforms') {
      confidence = Math.min(confidence + 0.2, 1) // 并行策略增加置信度
    }

    // 平台数量调整
    if (platforms.length > 1) {
      confidence = Math.min(confidence + 0.1, 1) // 多平台增加置信度
    }

    return confidence
  }

  /**
   * 生成推理说明
   */
  generateReasoning(strategy, analysis, platforms) {
    const reasons = []

    if (analysis.language === 'chinese') {
      reasons.push('检测到中文关键词，优先选择百度平台')
    } else if (analysis.language === 'english') {
      reasons.push('检测到英文关键词，选择国外平台资源')
    } else if (analysis.language === 'mixed') {
      reasons.push('检测到中英混合关键词')
    }

    if (strategy.name === 'single_platform') {
      reasons.push(`选择最优平台 ${platforms[0]?.name} 以保证速度`)
    } else if (strategy.name === 'parallel_platforms') {
      reasons.push('采用多平台并行以提升结果质量')
    } else if (strategy.name === 'progressive_expansion') {
      reasons.push('采用渐进式扩展策略平衡速度和质量')
    }

    return reasons.join('；')
  }

  /**
   * 记录性能指标
   */
  recordPerformanceMetrics(performance, platforms) {
    this.performanceMetrics.analysisTime.push(performance.analysisTime || 0)
    this.performanceMetrics.dispatchTime.push(performance.dispatchTime || 0)
    this.performanceMetrics.translationTime.push(performance.translation?.time || 0)
    this.performanceMetrics.totalTime.push(performance.totalTime || 0)

    // 更新平台使用统计
    platforms?.forEach(platform => {
      const platformName = typeof platform === 'string' ? platform : platform.name
      this.performanceMetrics.platformUsage[platformName] =
        (this.performanceMetrics.platformUsage[platformName] || 0) + 1
    })

    // 保持最近100条记录
    Object.keys(this.performanceMetrics).forEach(key => {
      if (
        Array.isArray(this.performanceMetrics[key]) &&
        this.performanceMetrics[key].length > 100
      ) {
        this.performanceMetrics[key].shift()
      }
    })
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    const stats = {}
    Object.keys(this.performanceMetrics).forEach(key => {
      const values = this.performanceMetrics[key]
      if (Array.isArray(values) && values.length > 0) {
        stats[key] = {
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        }
      }
    })

    return {
      ...stats,
      platformUsage: this.performanceMetrics.platformUsage,
      cacheSize: this.resultCache.size,
      cacheHitRate: this.calculateCacheHitRate()
    }
  }

  /**
   * 计算缓存命中率
   */
  calculateCacheHitRate() {
    // 简化的命中率计算
    const totalRequests = this.performanceMetrics.totalTime?.length || 0
    const cacheHits = Array.from(this.resultCache.values()).filter(item => item.cacheHit).length

    return totalRequests > 0 ? cacheHits / totalRequests : 0
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.resultCache.clear()
    console.log('🧹 智能调度器缓存已清空')
  }

  /**
   * 获取调度建议
   */
  getOptimizationSuggestions() {
    const stats = this.getPerformanceStats()
    const suggestions = []

    if (stats.totalTime?.avg > 3000) {
      suggestions.push('平均响应时间过长，建议启用缓存预热')
    }

    if (stats.cacheHitRate < 0.3) {
      suggestions.push('缓存命中率偏低，建议优化缓存策略')
    }

    const totalPlatformUsage = Object.values(stats.platformUsage || {}).reduce(
      (sum, count) => sum + count,
      0
    )
    if (totalPlatformUsage > 100) {
      suggestions.push('平台使用较为均衡，调度策略运行良好')
    }

    return suggestions
  }
}

// 创建单例实例
const intelligentDispatcher = new IntelligentDispatcher()

export default intelligentDispatcher
