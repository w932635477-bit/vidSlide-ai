/**
 * VidSlide AI - 智能缓存服务
 * 预加载热门话题，提供快速的图片搜索体验
 */

class SmartCacheService {
  constructor() {
    this.cache = new Map()
    this.hotTopics = [
      // 科技相关
      'Elon Musk',
      'Tesla',
      'SpaceX',
      'AI',
      'Artificial Intelligence',
      'OpenAI',
      'ChatGPT',
      'Machine Learning',
      'Technology',
      'Innovation',

      // 商业相关
      'Business',
      'Market',
      'Stock',
      'Economy',
      'Finance',
      'Company',
      'Cryptocurrency',
      'Bitcoin',
      'Startup',
      'IPO',

      // 时事政治
      'White House',
      'President',
      'Congress',
      'Politics',
      'Government',
      'Election',
      'Policy',
      'International',
      'World News',

      // 娱乐科技
      'Social Media',
      'Twitter',
      'X',
      'Meta',
      'Apple',
      'Google',
      'Microsoft',
      'Amazon',
      'Netflix',
      'Gaming'
    ]

    this.cacheTimeout = 1000 * 60 * 60 * 24 // 24小时缓存
    this.preloadInterval = 1000 * 60 * 30 // 30分钟预加载间隔
    this.isPreloading = false

    // 缓存统计
    this.stats = {
      hits: 0,
      misses: 0,
      preloadCount: 0,
      lastPreload: null
    }

    // 自动启动预加载
    this.startAutoPreload()
  }

  /**
   * 搜索缓存或实时获取
   */
  async searchWithCache(query, options = {}) {
    const normalizedQuery = this.normalizeQuery(query)
    const cacheKey = `${normalizedQuery}-${JSON.stringify(options)}`

    // 检查缓存
    const cached = this.cache.get(cacheKey)
    if (cached && this.isCacheValid(cached)) {
      this.stats.hits++
      console.log(`💾 缓存命中: ${query}`)
      return cached.data
    }

    // 缓存未命中
    this.stats.misses++
    console.log(`🔄 缓存未命中: ${query}`)

    // 从免费服务获取数据
    const data = await this.fetchFromFreeServices(query, options)

    // 缓存结果
    this.cache.set(cacheKey, {
      data: data,
      timestamp: Date.now(),
      expires: Date.now() + this.cacheTimeout,
      query: normalizedQuery
    })

    return data
  }

  /**
   * 从免费服务获取数据
   */
  async fetchFromFreeServices(query, options) {
    const results = []

    // 1. 优先使用RSS服务 (完全免费)
    try {
      const { freeRSSImageService } = await import('./FreeRSSImageService.js')
      const rssResults = await freeRSSImageService.searchLatestImages(query, options)
      results.push(...rssResults)
      console.log(`📰 RSS服务获取到 ${rssResults.length} 张图片`)
    } catch (error) {
      console.warn('RSS服务获取失败:', error.message)
    }

    // 2. 如果结果不够，尝试现有的免费API
    if (results.length < (options.maxResults || 10) / 2) {
      try {
        const freeAPIResults = await this.fetchFromFreeAPIs(query, options)
        results.push(...freeAPIResults)
        console.log(`🔗 免费API获取到 ${freeAPIResults.length} 张图片`)
      } catch (error) {
        console.warn('免费API获取失败:', error.message)
      }
    }

    return this.deduplicateResults(results)
  }

  /**
   * 从现有的免费API获取数据
   */
  async fetchFromFreeAPIs(query, options) {
    const results = []

    // 检查Google免费额度 (100次/日)
    if (this.canUseGoogleFreeQuota()) {
      try {
        const googleResults = await this.searchGoogleFree(query, options)
        results.push(...googleResults)
      } catch (error) {
        console.warn('Google免费搜索失败:', error.message)
      }
    }

    // 检查Bing免费额度 (1000次/月)
    if (this.canUseBingFreeQuota()) {
      try {
        const bingResults = await this.searchBingFree(query, options)
        results.push(...bingResults)
      } catch (error) {
        console.warn('Bing免费搜索失败:', error.message)
      }
    }

    return results
  }

  /**
   * 开始自动预加载
   */
  startAutoPreload() {
    console.log('🚀 启动智能预加载系统...')

    // 立即执行一次预加载
    setTimeout(() => {
      this.preloadHotTopics()
    }, 5000) // 5秒后开始

    // 设置定期预加载
    setInterval(() => {
      this.preloadHotTopics()
    }, this.preloadInterval)
  }

  /**
   * 预加载热门话题
   */
  async preloadHotTopics() {
    if (this.isPreloading) {
      console.log('⏳ 预加载进行中，跳过')
      return
    }

    this.isPreloading = true
    console.log('🔄 开始预加载热门话题...')

    try {
      const preloadPromises = this.hotTopics.map(topic => this.preloadTopic(topic))

      await Promise.allSettled(preloadPromises)

      this.stats.preloadCount++
      this.stats.lastPreload = new Date()

      console.log(`✅ 预加载完成 (${this.hotTopics.length} 个话题)`)
    } catch (error) {
      console.error('❌ 预加载失败:', error)
    } finally {
      this.isPreloading = false
    }
  }

  /**
   * 预加载单个话题
   */
  async preloadTopic(topic) {
    try {
      const cacheKey = `${this.normalizeQuery(topic)}-{"timeRange":"7d","maxResults":15}`

      // 检查是否已经缓存
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (this.isCacheValid(cached)) {
          return // 已经缓存且有效
        }
      }

      // 预加载数据
      const data = await this.fetchFromFreeServices(topic, {
        timeRange: '7d',
        maxResults: 15,
        source: 'preload'
      })

      if (data && data.length > 0) {
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now(),
          expires: Date.now() + this.cacheTimeout,
          query: this.normalizeQuery(topic),
          preload: true
        })

        console.log(`📥 预加载: ${topic} (${data.length} 张图片)`)
      }
    } catch (error) {
      console.warn(`预加载失败 ${topic}:`, error.message)
    }
  }

  /**
   * 检查Google免费额度
   */
  canUseGoogleFreeQuota() {
    const today = new Date().toDateString()
    const usage = JSON.parse(localStorage.getItem('google_free_usage') || '{}')

    if (usage.date !== today) {
      // 重置每日使用量
      usage.date = today
      usage.count = 0
    }

    return usage.count < 100 // 每日100次免费
  }

  /**
   * 检查Bing免费额度
   */
  canUseBingFreeQuota() {
    const thisMonth = new Date().getMonth()
    const usage = JSON.parse(localStorage.getItem('bing_free_usage') || '{}')

    if (usage.month !== thisMonth) {
      // 重置每月使用量
      usage.month = thisMonth
      usage.count = 0
    }

    return usage.count < 1000 // 每月1000次免费
  }

  /**
   * Google免费搜索
   */
  async searchGoogleFree(query, options) {
    // 模拟Google免费搜索 (实际需要API密钥)
    // 这里返回空结果，因为需要API密钥
    console.log('⚠️ Google免费搜索需要API密钥')
    return []
  }

  /**
   * Bing免费搜索
   */
  async searchBingFree(query, options) {
    // 模拟Bing免费搜索 (实际需要API密钥)
    // 这里返回空结果，因为需要API密钥
    console.log('⚠️ Bing免费搜索需要API密钥')
    return []
  }

  /**
   * 规范化查询
   */
  normalizeQuery(query) {
    return query.toLowerCase().trim()
  }

  /**
   * 检查缓存是否有效
   */
  isCacheValid(cached) {
    return cached && cached.expires > Date.now()
  }

  /**
   * 去重结果
   */
  deduplicateResults(results) {
    const seen = new Set()
    return results.filter(result => {
      const key = result.url || result.id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? ((this.stats.hits / totalRequests) * 100).toFixed(1) : 0

    return {
      ...this.stats,
      totalRequests,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.size,
      isPreloading: this.isPreloading,
      cacheEntries: Array.from(this.cache.keys()).map(key => ({
        key,
        expires: new Date(this.cache.get(key).expires).toLocaleString(),
        isPreload: this.cache.get(key).preload || false
      }))
    }
  }

  /**
   * 手动预加载指定话题
   */
  async preloadSpecificTopics(topics) {
    console.log(`🎯 手动预加载指定话题: ${topics.join(', ')}`)

    const promises = topics.map(topic => this.preloadTopic(topic))
    await Promise.allSettled(promises)

    console.log('✅ 手动预加载完成')
  }

  /**
   * 更新热门话题列表
   */
  updateHotTopics(newTopics) {
    this.hotTopics = [...new Set([...this.hotTopics, ...newTopics])]
    console.log(`📝 热门话题已更新为 ${this.hotTopics.length} 个`)
  }

  /**
   * 清除过期缓存
   */
  cleanExpiredCache() {
    const now = Date.now()
    let cleaned = 0

    for (const [key, value] of this.cache.entries()) {
      if (value.expires <= now) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 清理了 ${cleaned} 个过期缓存项`)
    }
  }

  /**
   * 清除所有缓存
   */
  clearAllCache() {
    this.cache.clear()
    this.stats.hits = 0
    this.stats.misses = 0
    console.log('🗑️ 所有缓存已清除')
  }

  /**
   * 获取预加载状态
   */
  getPreloadStatus() {
    return {
      isActive: true,
      intervalMinutes: this.preloadInterval / (1000 * 60),
      nextPreload: this.stats.lastPreload
        ? new Date(this.stats.lastPreload.getTime() + this.preloadInterval).toLocaleString()
        : '即将开始',
      hotTopicsCount: this.hotTopics.length,
      lastPreloadCount: this.stats.preloadCount
    }
  }
}

// 创建单例实例
export const smartCacheService = new SmartCacheService()
export default smartCacheService
