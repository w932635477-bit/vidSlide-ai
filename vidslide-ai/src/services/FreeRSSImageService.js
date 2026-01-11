/**
 * VidSlide AI - 免费RSS图片服务
 * 通过RSS feeds和网页抓取提供完全免费的时事图片
 */

class FreeRSSImageService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 1000 * 60 * 15 // 15分钟缓存

    // 免费RSS新闻源配置
    this.newsSources = {
      tech: [
        { name: 'Hacker News', rss: 'https://hnrss.org/frontpage', category: 'tech' },
        { name: 'TechCrunch', rss: 'https://techcrunch.com/feed/', category: 'tech' },
        {
          name: 'Ars Technica',
          rss: 'https://feeds.arstechnica.com/arstechnica/index',
          category: 'tech'
        },
        { name: 'MIT Tech Review', rss: 'https://www.technologyreview.com/feed/', category: 'tech' }
      ],

      business: [
        {
          name: 'Reuters Business',
          rss: 'https://feeds.reuters.com/reuters/businessNews',
          category: 'business'
        },
        {
          name: 'Bloomberg',
          rss: 'https://feeds.bloomberg.com/bloomberg/markets/news.rss',
          category: 'business'
        },
        {
          name: 'WSJ Markets',
          rss: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
          category: 'business'
        }
      ],

      general: [
        { name: 'BBC News', rss: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'general' },
        {
          name: 'Reuters World',
          rss: 'https://feeds.reuters.com/Reuters/worldNews',
          category: 'general'
        },
        { name: 'AP News', rss: 'https://feeds.apnews.com/rss/apf-topnews', category: 'general' }
      ]
    }

    // 热门关键词映射
    this.keywordMapping = {
      elon: ['elon musk', 'tesla', 'spacex', 'x', 'twitter'],
      musk: ['elon musk', 'tesla', 'spacex', 'x', 'twitter'],
      ai: ['artificial intelligence', 'machine learning', 'openai', 'chatgpt'],
      technology: ['tech', 'innovation', 'startup', 'software'],
      business: ['market', 'economy', 'stock', 'finance', 'company'],
      whitehouse: ['white house', 'president', 'biden', 'trump', 'congress'],
      crypto: ['bitcoin', 'cryptocurrency', 'blockchain', 'ethereum']
    }
  }

  /**
   * 搜索最新图片 (完全免费)
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Array>} 图片结果数组
   */
  async searchLatestImages(query, options = {}) {
    const { timeRange = '7d', maxResults = 20, minQuality = 'medium' } = options

    const cacheKey = `rss-${query}-${timeRange}-${maxResults}`

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📋 使用RSS缓存结果')
        return cached.results
      }
    }

    console.log(`📰 开始免费RSS图片搜索: ${query}`)

    try {
      // 1. 找到相关的RSS源
      const relevantFeeds = this.findRelevantFeeds(query)
      console.log(`📡 找到 ${relevantFeeds.length} 个相关RSS源`)

      // 2. 并行获取RSS内容
      const feedPromises = relevantFeeds.map(feed => this.fetchRSSFeed(feed, timeRange))

      const feedResults = await Promise.allSettled(feedPromises)

      // 3. 收集所有文章
      const allArticles = []
      feedResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          allArticles.push(...result.value)
        }
      })

      console.log(`📄 获取到 ${allArticles.length} 篇文章`)

      // 4. 从文章中提取图片
      const imagePromises = allArticles
        .slice(0, Math.min(20, allArticles.length)) // 限制处理文章数量
        .map(article => this.extractImagesFromArticle(article, query))

      const imageResults = await Promise.allSettled(imagePromises)

      // 5. 收集所有图片
      const allImages = []
      imageResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          allImages.push(...result.value)
        }
      })

      console.log(`🖼️ 提取到 ${allImages.length} 张图片`)

      // 6. 过滤和排序
      const processedImages = this.processImages(allImages, query, {
        maxResults,
        minQuality
      })

      // 7. 缓存结果
      this.cache.set(cacheKey, {
        results: processedImages,
        timestamp: Date.now()
      })

      console.log(`✅ RSS搜索完成，返回 ${processedImages.length} 张图片`)
      return processedImages
    } catch (error) {
      console.error('❌ RSS图片搜索失败:', error)
      return []
    }
  }

  /**
   * 找到相关的RSS源
   */
  findRelevantFeeds(query) {
    const lowerQuery = query.toLowerCase()
    const relevantFeeds = []

    // 扩展关键词匹配
    const expandedKeywords = this.expandKeywords(lowerQuery)

    // 按类别匹配
    if (
      expandedKeywords.some(k =>
        ['elon', 'musk', 'tesla', 'spacex', 'ai', 'tech', 'technology'].includes(k)
      )
    ) {
      relevantFeeds.push(...this.newsSources.tech)
    }

    if (
      expandedKeywords.some(k => ['business', 'market', 'economy', 'finance', 'stock'].includes(k))
    ) {
      relevantFeeds.push(...this.newsSources.business)
    }

    // 默认添加通用新闻源
    relevantFeeds.push(...this.newsSources.general.slice(0, 2))

    // 去重
    return [...new Set(relevantFeeds)]
  }

  /**
   * 扩展关键词 (处理同义词和缩写)
   */
  expandKeywords(query) {
    const words = query.toLowerCase().split(' ')
    const expanded = new Set(words)

    // 添加同义词映射
    words.forEach(word => {
      if (this.keywordMapping[word]) {
        this.keywordMapping[word].forEach(synonym => expanded.add(synonym))
      }
    })

    // 处理复合关键词
    if (query.includes('elon musk') || (query.includes('elon') && query.includes('musk'))) {
      expanded.add('elon')
      expanded.add('musk')
      expanded.add('tesla')
      expanded.add('spacex')
    }

    return Array.from(expanded)
  }

  /**
   * 获取单个RSS源
   */
  async fetchRSSFeed(feedInfo, timeRange) {
    try {
      const response = await fetch('http://localhost:8081/proxy-fetch-rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: feedInfo.rss,
          timeRange: timeRange
        })
      })

      const data = await response.json()

      if (data.success && data.articles) {
        // 为每篇文章添加源信息
        return data.articles.map(article => ({
          ...article,
          feedName: feedInfo.name,
          category: feedInfo.category
        }))
      }
    } catch (error) {
      console.warn(`获取RSS失败 ${feedInfo.name}:`, error.message)
    }

    return []
  }

  /**
   * 从文章中提取图片
   */
  async extractImagesFromArticle(article, query) {
    try {
      const response = await fetch('http://localhost:8081/proxy-scrape-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: article.url })
      })

      const data = await response.json()

      if (data.success && data.images) {
        return data.images.map(img => ({
          id: `rss-${article.feedName}-${Date.now()}-${Math.random()}`,
          url: img.url,
          thumbnail: img.thumbnail || img.url,
          title: `${article.feedName}: ${article.title}`,
          description: article.description || '',
          source: 'rss',
          publishedAt: article.publishedAt,
          relevance: this.calculateRelevance(query, article.title + article.description),
          articleUrl: article.url,
          feedName: article.feedName,
          category: article.category
        }))
      }
    } catch (error) {
      console.warn(`文章图片提取失败 ${article.url}:`, error.message)
    }

    return []
  }

  /**
   * 处理和过滤图片结果
   */
  processImages(images, query, options) {
    const { maxResults, minQuality } = options

    // 去重
    const uniqueImages = images.filter(
      (img, index, self) => index === self.findIndex(i => i.url === img.url)
    )

    // 质量过滤
    const qualityFiltered = uniqueImages.filter(img => {
      // 检查图片URL是否有效
      if (!img.url || !this.isValidImageUrl(img.url)) return false

      // 检查是否包含查询关键词
      const relevance = img.relevance || 0
      return relevance > 0.1 // 最低相关性阈值
    })

    // 按相关性和时间排序
    const sortedImages = qualityFiltered.sort((a, b) => {
      // 优先相关性
      const relevanceDiff = (b.relevance || 0) - (a.relevance || 0)
      if (Math.abs(relevanceDiff) > 0.1) return relevanceDiff

      // 其次时间
      return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
    })

    return sortedImages.slice(0, maxResults)
  }

  /**
   * 计算相关性
   */
  calculateRelevance(query, text) {
    if (!text) return 0

    const queryWords = this.expandKeywords(query)
    const textLower = text.toLowerCase()
    let score = 0

    queryWords.forEach(word => {
      if (textLower.includes(word)) {
        score += 1
      }
    })

    return score / queryWords.length
  }

  /**
   * 检查图片URL是否有效
   */
  isValidImageUrl(url) {
    if (!url) return false

    // 检查文件扩展名
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const lowerUrl = url.toLowerCase()

    const hasValidExtension = validExtensions.some(ext => lowerUrl.includes(ext))
    if (!hasValidExtension) return false

    // 过滤小图片和图标
    if (
      lowerUrl.includes('icon') ||
      lowerUrl.includes('logo') ||
      lowerUrl.includes('avatar') ||
      lowerUrl.includes('thumb')
    ) {
      return false
    }

    // 过滤广告图片
    if (lowerUrl.includes('ads') || lowerUrl.includes('banner') || lowerUrl.includes('sponsor')) {
      return false
    }

    return true
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitRate: 'N/A' // 可以后续添加命中率统计
    }
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear()
    console.log('🗑️ RSS图片缓存已清除')
  }
}

// 创建单例实例
export const freeRSSImageService = new FreeRSSImageService()
export default freeRSSImageService
