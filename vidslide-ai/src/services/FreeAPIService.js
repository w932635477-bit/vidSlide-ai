/**
 * VidSlide AI 免费API服务
 * 集成多个免费图片API，实现智能调度
 */

class FreeAPIService {
  constructor() {
    this.apis = {
      unsplash: {
        name: 'Unsplash',
        baseUrl: 'https://api.unsplash.com',
        monthlyLimit: 5000,
        usedThisMonth: 0,
        priority: 'high',
        lastUsed: 0,
        accessKey: 'zPjqHo_L8Vx-gckbifgYM1bJxnYbFRgFXLXFwWcAN30' // 示例key，需要替换为实际的
      },
      pexels: {
        name: 'Pexels',
        baseUrl: 'https://api.pexels.com/v1',
        monthlyLimit: 200,
        usedThisMonth: 0,
        priority: 'medium',
        lastUsed: 0,
        accessKey: 'J5I7XwR4QFUfDERCjGBdQw70EO28x543C54PZiTEOOugNQEOREvFnVC0' // 新的Pexels API Key
      },
      pixabay: {
        name: 'Pixabay',
        baseUrl: 'https://pixabay.com/api',
        monthlyLimit: 5000,
        usedThisMonth: 0,
        priority: 'medium',
        lastUsed: 0,
        accessKey: '52722038-7ac4769e00433c06f9c6333bc' // 示例key，需要替换为实际的
      }
      // Bing API暂时移除，专注优化现有3个API
      // bing: {
      //   name: 'Bing Search',
      //   baseUrl: 'https://api.bing.microsoft.com/v7.0/images/search',
      //   monthlyLimit: 1000,
      //   usedThisMonth: 0,
      //   priority: 'low',
      //   lastUsed: 0,
      //   accessKey: 'your-bing-key' // 需要替换为实际的
      // }
    }

    // 初始化使用量监控器和代理管理器
    this.usageMonitor = new UsageMonitor(this.apis)
    // 使用原生fetch，不需要proxy manager

    // 延迟到第一次使用时重置（避免Node.js环境问题）
    // this.scheduleMonthlyReset()
  }

  /**
   * 搜索图片
   */
  async searchImages(query, _options = {}) {
    const { limit = 10, orientation = 'landscape', imageType = 'photo' } = _options

    console.log(`🔍 免费API搜索: "${query}", 限制: ${limit}`)

    // 选择最佳API
    const selectedAPI = this.selectBestAPI(query, _options)

    if (!selectedAPI) {
      console.warn('⚠️ 所有免费API都已达到月额度限制')
      return { success: false, error: 'API_LIMIT_EXCEEDED', images: [] }
    }

    console.log(`🎯 选择API: ${selectedAPI.name}`)

    try {
      // 执行搜索
      const result = await this.executeSearch(selectedAPI, query, { limit, orientation, imageType })

      // 记录使用量
      this.recordUsage(selectedAPI.name)

      if (result.success) {
        console.log(`✅ ${selectedAPI.name}搜索成功，返回${result.images.length}张图片`)
        return result
      } else {
        console.warn(`❌ ${selectedAPI.name}搜索失败:`, result.error)
        // 尝试备用API
        return await this.tryFallbackAPI(query, selectedAPI.name, _options)
      }
    } catch (error) {
      console.error(`💥 ${selectedAPI.name}搜索异常:`, error)
      this.recordUsage(selectedAPI.name, true) // 记录失败

      // 尝试备用API
      return await this.tryFallbackAPI(query, selectedAPI.name, _options)
    }
  }

  /**
   * 选择最佳API
   */
  selectBestAPI(query, _options) {
    const { platform } = _options

    // 如果指定了平台，直接使用该平台
    if (platform && this.apis[platform]) {
      const requestedAPI = this.apis[platform]
      if (requestedAPI.usedThisMonth < requestedAPI.monthlyLimit) {
        return requestedAPI
      } else {
        console.warn(`⚠️ 请求的平台 ${platform} 已达到月额度限制`)
        return null
      }
    }

    // 过滤未超限的API
    const availableAPIs = Object.values(this.apis).filter(
      api => api.usedThisMonth < api.monthlyLimit
    )

    if (availableAPIs.length === 0) {
      return null
    }

    // 计算每个API的评分
    const scoredAPIs = availableAPIs.map(api => ({
      ...api,
      score: this.calculateAPIScore(api, query, _options)
    }))

    // 按评分排序，选择最高分
    scoredAPIs.sort((a, b) => b.score - a.score)

    return scoredAPIs[0]
  }

  /**
   * 计算API评分
   */
  calculateAPIScore(api, query, options) {
    let score = 0

    // 基础优先级分数
    const priorityScores = { high: 10, medium: 5, low: 3 }
    score += priorityScores[api.priority]

    // 关键词匹配分数
    score += this.keywordMatchScore(api.name, query)

    // 使用均衡分数 (避免单个API超限)
    score += this.balanceScore(api)

    // 最近使用惩罚 (避免连续调用同一API)
    score += this.recencyPenalty(api)

    return score
  }

  /**
   * 关键词匹配评分
   */
  keywordMatchScore(apiName, query) {
    const apiStrengths = {
      unsplash: ['nature', 'landscape', 'portrait', 'photography', 'travel'],
      pexels: ['video', 'motion', 'dynamic', 'lifestyle', 'people'],
      pixabay: ['icon', 'illustration', 'vector', 'diagram', 'background'],
      bing: ['news', 'current', 'recent', 'breaking', 'business']
    }

    const strengths = apiStrengths[apiName.toLowerCase()] || []
    const queryWords = query.toLowerCase().split(/\s+/)

    let matchCount = 0
    for (const word of queryWords) {
      if (strengths.some(strength => word.includes(strength) || strength.includes(word))) {
        matchCount++
      }
    }

    return matchCount * 2 // 每个匹配词+2分
  }

  /**
   * 使用均衡评分
   */
  balanceScore(api) {
    const usageRate = api.usedThisMonth / api.monthlyLimit
    // 使用率越低分数越高，鼓励均衡使用
    return (1 - usageRate) * 5
  }

  /**
   * 最近使用惩罚
   */
  recencyPenalty(api) {
    const now = Date.now()
    const timeSinceLastUse = now - api.lastUsed
    const minutesSinceLastUse = timeSinceLastUse / (1000 * 60)

    // 最近使用过则轻微惩罚
    if (minutesSinceLastUse < 5) return -1
    if (minutesSinceLastUse < 15) return -0.5

    return 0
  }

  /**
   * 执行搜索
   */
  async executeSearch(api, query, options) {
    const { limit, orientation, imageType } = options

    switch (api.name.toLowerCase()) {
      case 'unsplash':
        return await this.searchUnsplash(query, limit, orientation)

      case 'pexels':
        return await this.searchPexels(query, limit, orientation)

      case 'pixabay':
        return await this.searchPixabay(query, limit, imageType)

      default:
        return { success: false, error: 'UNSUPPORTED_API', images: [] }
    }
  }

  /**
   * Unsplash搜索
   */
  async searchUnsplash(query, limit, orientation) {
    const params = new URLSearchParams({
      query,
      per_page: Math.min(limit, 30), // Unsplash最大30
      orientation: orientation === 'portrait' ? 'portrait' : 'landscape'
    })

    const url = `${this.apis.unsplash.baseUrl}/search/photos?${params}`

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${this.apis.unsplash.accessKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      const images = data.results.map(item => ({
        id: item.id,
        url: item.urls.regular,
        thumbnail: item.urls.thumb,
        title: item.alt_description || item.description || query,
        source: 'unsplash',
        width: item.width,
        height: item.height,
        author: item.user.name,
        downloadUrl: item.links.download
      }))

      return { success: true, images, total: data.total }
    } catch (error) {
      return { success: false, error: error.message, images: [] }
    }
  }

  /**
   * Pexels搜索
   */
  async searchPexels(query, limit, orientation) {
    const params = new URLSearchParams({
      query,
      per_page: Math.min(limit, 80), // Pexels最大80
      orientation: orientation === 'portrait' ? 'portrait' : 'landscape'
    })

    const url = `${this.apis.pexels.baseUrl}/search?${params}`

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: this.apis.pexels.accessKey
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      const images = data.photos.map(item => ({
        id: item.id.toString(),
        url: item.src.large,
        thumbnail: item.src.medium,
        title: item.alt || query,
        source: 'pexels',
        width: item.width,
        height: item.height,
        author: item.photographer,
        downloadUrl: item.src.original
      }))

      return { success: true, images, total: data.total_results }
    } catch (error) {
      return { success: false, error: error.message, images: [] }
    }
  }

  /**
   * Pixabay搜索
   */
  async searchPixabay(query, limit, imageType) {
    const params = new URLSearchParams({
      key: this.apis.pixabay.accessKey,
      q: query,
      per_page: Math.min(limit, 200), // Pixabay最大200
      image_type: imageType || 'photo',
      safesearch: 'true'
    })

    const url = `${this.apis.pixabay.baseUrl}/?${params}`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      const images = data.hits.map(item => ({
        id: item.id.toString(),
        url: item.largeImageURL,
        thumbnail: item.previewURL,
        title: item.tags || query,
        source: 'pixabay',
        width: item.imageWidth,
        height: item.imageHeight,
        author: item.user,
        downloadUrl: item.largeImageURL
      }))

      return { success: true, images, total: data.totalHits }
    } catch (error) {
      return { success: false, error: error.message, images: [] }
    }
  }

  /**
   * 尝试备用API
   */
  async tryFallbackAPI(query, failedAPI, options) {
    console.log(`🔄 尝试备用API (排除${failedAPI})`)

    // 排除失败的API
    const backupAPIs = Object.values(this.apis).filter(
      api => api.name !== failedAPI && api.usedThisMonth < api.monthlyLimit
    )

    if (backupAPIs.length === 0) {
      return { success: false, error: 'NO_BACKUP_API_AVAILABLE', images: [] }
    }

    // 选择备用API
    const backupAPI = backupAPIs[0] // 简单选择第一个可用的

    console.log(`🎯 使用备用API: ${backupAPI.name}`)

    try {
      const result = await this.executeSearch(backupAPI, query, options)
      if (result.success) {
        this.recordUsage(backupAPI.name)
        return result
      }
    } catch (error) {
      console.error(`💥 备用API ${backupAPI.name} 也失败:`, error)
    }

    return { success: false, error: 'ALL_APIS_FAILED', images: [] }
  }

  /**
   * 记录使用量
   */
  recordUsage(apiName, isError = false) {
    const api = Object.values(this.apis).find(a => a.name === apiName)
    if (api) {
      if (!isError) {
        api.usedThisMonth++
      }
      api.lastUsed = Date.now()

      // 保存到本地存储
      this.saveUsageStats()
    }
  }

  /**
   * 保存使用统计
   */
  saveUsageStats() {
    // 只在浏览器环境中保存到localStorage
    if (typeof localStorage !== 'undefined') {
      const stats = {}
      Object.entries(this.apis).forEach(([key, api]) => {
        stats[key] = {
          usedThisMonth: api.usedThisMonth,
          lastUsed: api.lastUsed
        }
      })

      localStorage.setItem('freeAPIUsage', JSON.stringify(stats))
    }
  }

  /**
   * 加载使用统计
   */
  loadUsageStats() {
    // 只在浏览器环境中从localStorage加载
    if (typeof localStorage !== 'undefined') {
      try {
        const stats = JSON.parse(localStorage.getItem('freeAPIUsage') || '{}')
        Object.entries(stats).forEach(([key, data]) => {
          if (this.apis[key]) {
            this.apis[key].usedThisMonth = data.usedThisMonth || 0
            this.apis[key].lastUsed = data.lastUsed || 0
          }
        })
      } catch (error) {
        console.warn('加载API使用统计失败:', error)
      }
    } else {
      console.log('🔄 Node.js环境：跳过localStorage加载')
    }
  }

  /**
   * 每月重置使用量
   */
  scheduleMonthlyReset() {
    // Node.js环境直接跳过
    if (typeof localStorage === 'undefined') {
      console.log('🔄 Node.js环境：跳过localStorage重置检查')
      return
    }

    // 检查是否需要重置 (每月1号)
    const now = new Date()
    const lastReset = localStorage.getItem('lastUsageReset')

    if (!lastReset || new Date(lastReset).getMonth() !== now.getMonth()) {
      // 重置所有API的使用量
      Object.values(this.apis).forEach(api => {
        api.usedThisMonth = 0
      })

      localStorage.setItem('lastUsageReset', now.toISOString())
      console.log('🔄 已重置API月使用量')
    }
  }

  /**
   * 获取使用统计
   */
  getUsageStats() {
    const totalUsed = Object.values(this.apis).reduce((sum, api) => sum + api.usedThisMonth, 0)
    const totalLimit = Object.values(this.apis).reduce((sum, api) => sum + api.monthlyLimit, 0)

    return {
      totalUsed,
      totalLimit,
      usageRate: totalUsed / totalLimit,
      byAPI: Object.entries(this.apis).map(([key, api]) => ({
        name: api.name,
        used: api.usedThisMonth,
        limit: api.monthlyLimit,
        rate: api.usedThisMonth / api.monthlyLimit,
        remaining: api.monthlyLimit - api.usedThisMonth
      })),
      alerts: this.usageMonitor.checkLimits()
    }
  }
}

/**
 * 使用量监控器
 */
class UsageMonitor {
  constructor(apis) {
    this.apis = apis
    this.alerts = []
  }

  checkLimits() {
    const warnings = []
    const criticals = []

    Object.values(this.apis).forEach(api => {
      const usageRate = api.usedThisMonth / api.monthlyLimit

      if (usageRate > 0.9) {
        criticals.push({
          level: 'critical',
          api: api.name,
          message: `${api.name} API 使用率已达 ${Math.round(usageRate * 100)}%`,
          remaining: api.monthlyLimit - api.usedThisMonth
        })
      } else if (usageRate > 0.7) {
        warnings.push({
          level: 'warning',
          api: api.name,
          message: `${api.name} API 使用率 ${Math.round(usageRate * 100)}%`,
          remaining: api.monthlyLimit - api.usedThisMonth
        })
      }
    })

    return { warnings, criticals }
  }
}

/**
 * 智能代理管理器
 */
class SmartProxyManager {
  constructor() {
    // 在中国大陆环境下，可能需要代理
    this.useProxy = this.detectIfProxyNeeded()
    this.proxyUrl = 'https://cors-anywhere.herokuapp.com/' // 示例代理，需要替换为稳定的
  }

  detectIfProxyNeeded() {
    // 检测是否在中国大陆 (简化检测)
    // 实际应该基于地理位置API或网络测试
    return false // 默认不使用代理，需要时开启
  }

  async fetch(url, options = {}) {
    let targetUrl = url

    // 如果需要代理，添加代理前缀
    if (this.useProxy) {
      targetUrl = this.proxyUrl + url
    }

    // 设置默认headers
    const defaultHeaders = {
      Accept: 'application/json',
      'User-Agent': 'VidSlide-AI/1.0'
    }

    const mergedOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    }

    try {
      const response = await fetch(targetUrl, mergedOptions)

      // 检查是否是代理相关的错误
      if (this.useProxy && response.status === 403) {
        console.warn('代理服务拒绝访问，尝试直连...')
        this.useProxy = false
        return this.fetch(url, options) // 递归重试直连
      }

      return response
    } catch (error) {
      // 如果代理失败，尝试直连
      if (this.useProxy) {
        console.warn('代理请求失败，尝试直连...')
        this.useProxy = false
        return this.fetch(url, options)
      }

      throw error
    }
  }
}

// 导出单例实例（延迟创建，避免Node.js环境问题）
let instance = null
export default (() => {
  if (!instance) {
    instance = new FreeAPIService()
  }
  return instance
})()
