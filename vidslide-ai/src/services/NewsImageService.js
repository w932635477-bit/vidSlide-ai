/**
 * VidSlide AI - 最新时事图片服务
 * 集成多种来源提供最新的时事图片搜索
 */

import { API_CONFIGS } from '../config/api-keys.js'

class NewsImageService {
  constructor() {
    this.sources = {
      primary: ['googleSearch', 'bingSearch'],
      secondary: ['newsapi', 'twitter'],
      fallback: ['openai', 'pexels']
    }

    this.cache = new Map()
    this.cacheTimeout = 1000 * 60 * 30 // 30分钟缓存
  }

  /**
   * 搜索最新时事图片
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Array>} 图片结果数组
   */
  async searchLatestImages(query, options = {}) {
    const cacheKey = `${query}-${JSON.stringify(options)}`

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.results
      }
    }

    const {
      timeRange = '7d', // 时间范围: 1d, 7d, 30d
      minQuality = 'medium', // 最低质量: low, medium, high
      maxResults = 20, // 最大结果数
      sources = ['all'] // 数据源: all, google, bing, newsapi, twitter
    } = options

    try {
      const allResults = []

      // 1. 并行搜索主要数据源
      const primaryPromises = this.getPrimarySources(sources).map(source =>
        this.searchFromSource(source, query, { timeRange, maxResults: 10 })
      )

      const primaryResults = await Promise.allSettled(primaryPromises)

      // 收集主要来源结果
      primaryResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          allResults.push(...result.value)
        }
      })

      // 2. 如果结果不够，搜索次要来源
      if (allResults.length < maxResults / 2) {
        const secondaryPromises = this.getSecondarySources(sources).map(source =>
          this.searchFromSource(source, query, { timeRange, maxResults: 8 })
        )

        const secondaryResults = await Promise.allSettled(secondaryPromises)

        secondaryResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            allResults.push(...result.value)
          }
        })
      }

      // 3. 如果还是不够，使用AI生成兜底
      if (allResults.length < 5 && sources.includes('all')) {
        try {
          const aiResults = await this.generateAIImages(query, 3)
          allResults.push(...aiResults)
        } catch (error) {
          console.warn('AI图片生成失败:', error)
        }
      }

      // 4. 过滤、排序和去重
      const processedResults = this.processResults(allResults, {
        minQuality,
        maxResults,
        query
      })

      // 缓存结果
      this.cache.set(cacheKey, {
        results: processedResults,
        timestamp: Date.now()
      })

      return processedResults
    } catch (error) {
      console.error('最新图片搜索失败:', error)
      // 返回降级结果
      return this.getFallbackResults(query)
    }
  }

  /**
   * 从指定数据源搜索图片
   */
  async searchFromSource(source, query, options) {
    const config = API_CONFIGS[source]
    if (!config || !this.isSourceConfigured(source)) {
      return []
    }

    switch (source) {
      case 'googleSearch':
        return this.searchGoogleImages(query, options)
      case 'bingSearch':
        return this.searchBingImages(query, options)
      case 'newsapi':
        return this.searchNewsAPIImages(query, options)
      case 'twitter':
        return this.searchTwitterImages(query, options)
      case 'pexels':
        return this.searchPexelsImages(query, options)
      default:
        return []
    }
  }

  /**
   * Google Custom Search图片搜索
   */
  async searchGoogleImages(query, options) {
    const { timeRange = '7d', maxResults = 10 } = options
    const config = API_CONFIGS.googleSearch

    const params = new URLSearchParams({
      key: config.apiKey,
      cx: config.cx,
      q: query,
      searchType: 'image',
      imgSize: 'large',
      imgType: 'news',
      dateRestrict: this.convertTimeRange(timeRange),
      safe: 'active',
      num: Math.min(maxResults, 10)
    })

    try {
      const response = await fetch(`${config.baseUrl}?${params}`)
      const data = await response.json()

      if (!data.items) return []

      return data.items.map(item => ({
        id: item.link,
        url: item.link,
        thumbnail: item.image.thumbnailLink,
        title: item.title,
        source: 'google',
        width: item.image.width,
        height: item.image.height,
        publishedAt: new Date().toISOString(),
        relevance: this.calculateRelevance(query, item.title + item.snippet)
      }))
    } catch (error) {
      console.warn('Google图片搜索失败:', error)
      return []
    }
  }

  /**
   * Bing图片搜索
   */
  async searchBingImages(query, options) {
    const { timeRange = '7d', maxResults = 10 } = options
    const config = API_CONFIGS.bingSearch

    const params = new URLSearchParams({
      q: query,
      count: Math.min(maxResults, 50),
      freshness: this.convertBingTimeRange(timeRange),
      safeSearch: 'Strict',
      size: 'Large'
    })

    try {
      const response = await fetch(config.endpoint, {
        headers: {
          'Ocp-Apim-Subscription-Key': config.apiKey
        },
        body: params,
        method: 'POST'
      })

      const data = await response.json()

      if (!data.value) return []

      return data.value.map(item => ({
        id: item.contentUrl,
        url: item.contentUrl,
        thumbnail: item.thumbnailUrl,
        title: item.name,
        source: 'bing',
        width: item.width,
        height: item.height,
        publishedAt: item.datePublished || new Date().toISOString(),
        relevance: this.calculateRelevance(query, item.name)
      }))
    } catch (error) {
      console.warn('Bing图片搜索失败:', error)
      return []
    }
  }

  /**
   * NewsAPI新闻图片搜索
   */
  async searchNewsAPIImages(query, options) {
    const { timeRange = '7d', maxResults = 10 } = options
    const config = API_CONFIGS.newsapi

    const params = new URLSearchParams({
      q: query,
      apiKey: config.apiKey,
      language: 'en,zh',
      sortBy: 'publishedAt',
      pageSize: Math.min(maxResults, 100)
    })

    // 添加时间过滤
    if (timeRange !== 'all') {
      const fromDate = this.getDateFromRange(timeRange)
      params.set('from', fromDate)
    }

    try {
      const response = await fetch(`${config.baseUrl}/everything?${params}`)
      const data = await response.json()

      if (!data.articles) return []

      const images = []
      for (const article of data.articles) {
        if (article.urlToImage && images.length < maxResults) {
          images.push({
            id: article.urlToImage,
            url: article.urlToImage,
            thumbnail: article.urlToImage,
            title: article.title,
            description: article.description,
            source: 'newsapi',
            publishedAt: article.publishedAt,
            relevance: this.calculateRelevance(query, article.title + article.description),
            articleUrl: article.url,
            sourceName: article.source.name
          })
        }
      }

      return images
    } catch (error) {
      console.warn('NewsAPI搜索失败:', error)
      return []
    }
  }

  /**
   * Twitter图片搜索
   */
  async searchTwitterImages(query, options) {
    const { maxResults = 10 } = options
    const config = API_CONFIGS.twitter

    // 构建Twitter搜索查询
    const searchQuery = this.buildTwitterQuery(query)

    const params = new URLSearchParams({
      query: searchQuery,
      'tweet.fields': 'created_at,public_metrics,entities',
      'user.fields': 'name,username,verified',
      'media.fields': 'url,preview_image_url,type',
      expansions: 'attachments.media_keys,author_id',
      max_results: Math.min(maxResults, 100)
    })

    try {
      const response = await fetch(`${config.baseUrl}/tweets/search/recent?${params}`, {
        headers: {
          Authorization: `Bearer ${config.bearerToken}`
        }
      })

      const data = await response.json()

      if (!data.data || !data.includes?.media) return []

      const images = []
      const mediaMap = new Map()

      // 构建媒体映射
      data.includes.media.forEach(media => {
        if (media.type === 'photo') {
          mediaMap.set(media.media_key, media)
        }
      })

      // 提取图片
      for (const tweet of data.data) {
        if (tweet.attachments?.media_keys) {
          for (const mediaKey of tweet.attachments.media_keys) {
            const media = mediaMap.get(mediaKey)
            if (media && images.length < maxResults) {
              images.push({
                id: media.url,
                url: media.url,
                thumbnail: media.preview_image_url || media.url,
                title: `Twitter: ${tweet.text.substring(0, 50)}...`,
                source: 'twitter',
                publishedAt: tweet.created_at,
                relevance: this.calculateRelevance(query, tweet.text),
                tweetUrl: `https://twitter.com/i/status/${tweet.id}`,
                author: data.includes.users.find(u => u.id === tweet.author_id)?.name
              })
            }
          }
        }
      }

      return images
    } catch (error) {
      console.warn('Twitter图片搜索失败:', error)
      return []
    }
  }

  /**
   * AI生成图片（兜底方案）
   */
  async generateAIImages(query, count = 3) {
    const config = API_CONFIGS.openai
    if (!config.apiKey) return []

    const prompts = this.generateAIPrompts(query, count)

    const images = []
    for (const prompt of prompts) {
      try {
        const response = await fetch(`${config.baseUrl}/images/generations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            size: '1792x1024',
            quality: 'standard',
            n: 1
          })
        })

        const data = await response.json()

        if (data.data?.[0]?.url) {
          images.push({
            id: `ai-${Date.now()}-${Math.random()}`,
            url: data.data[0].url,
            thumbnail: data.data[0].url,
            title: `AI生成: ${query}`,
            source: 'ai-generated',
            publishedAt: new Date().toISOString(),
            relevance: 0.8,
            isAIGenerated: true,
            prompt: prompt
          })
        }
      } catch (error) {
        console.warn('AI图片生成失败:', error)
      }
    }

    return images
  }

  /**
   * 辅助方法
   */
  getPrimarySources(requestedSources) {
    if (requestedSources.includes('all')) {
      return this.sources.primary.filter(source => this.isSourceConfigured(source))
    }
    return requestedSources.filter(
      source => this.sources.primary.includes(source) && this.isSourceConfigured(source)
    )
  }

  getSecondarySources(requestedSources) {
    if (requestedSources.includes('all')) {
      return this.sources.secondary.filter(source => this.isSourceConfigured(source))
    }
    return requestedSources.filter(
      source => this.sources.secondary.includes(source) && this.isSourceConfigured(source)
    )
  }

  isSourceConfigured(source) {
    const config = API_CONFIGS[source]
    if (!config) return false

    switch (source) {
      case 'googleSearch':
        return !!(config.apiKey && config.cx)
      case 'bingSearch':
      case 'newsapi':
      case 'pexels':
      case 'pixabay':
        return !!config.apiKey
      case 'twitter':
        return !!config.bearerToken
      case 'openai':
        return !!config.apiKey
      default:
        return false
    }
  }

  convertTimeRange(range) {
    const mapping = {
      '1d': 'd1',
      '7d': 'w1',
      '30d': 'm1',
      all: ''
    }
    return mapping[range] || 'w1'
  }

  convertBingTimeRange(range) {
    const mapping = {
      '1d': 'Day',
      '7d': 'Week',
      '30d': 'Month',
      all: ''
    }
    return mapping[range] || 'Week'
  }

  getDateFromRange(range) {
    const now = new Date()
    const days =
      {
        '1d': 1,
        '7d': 7,
        '30d': 30
      }[range] || 7

    now.setDate(now - days)
    return now.toISOString().split('T')[0]
  }

  buildTwitterQuery(query) {
    // 构建Twitter高级搜索查询
    const keywords = query.split(' ').filter(k => k.length > 1)
    const queryParts = [keywords.join(' OR '), 'has:images', '-is:retweet', 'lang:en OR lang:zh']

    return queryParts.join(' ')
  }

  generateAIPrompts(query, count) {
    const basePrompts = [
      `Professional photograph of ${query}, high quality, realistic, modern setting`,
      `News photography style image related to ${query}, journalistic, detailed`,
      `Conceptual illustration about ${query}, professional design, clean style`,
      `Documentary style photo of ${query}, authentic, high resolution`
    ]

    return basePrompts.slice(0, count)
  }

  calculateRelevance(query, text) {
    if (!text) return 0

    const queryWords = query.toLowerCase().split(' ')
    const textLower = text.toLowerCase()

    let score = 0
    for (const word of queryWords) {
      if (textLower.includes(word)) {
        score += 1
      }
    }

    return Math.min(score / queryWords.length, 1)
  }

  processResults(results, options) {
    const { minQuality, maxResults, query } = options

    // 去重
    const uniqueResults = this.removeDuplicates(results)

    // 质量过滤
    const filteredResults = this.filterByQuality(uniqueResults, minQuality)

    // 相关性排序
    const sortedResults = filteredResults.sort((a, b) => {
      // 优先级: 相关性 > 发布时间 > 来源质量
      const relevanceDiff = (b.relevance || 0) - (a.relevance || 0)
      if (relevanceDiff !== 0) return relevanceDiff

      const timeDiff = new Date(b.publishedAt) - new Date(a.publishedAt)
      if (timeDiff !== 0) return timeDiff

      const sourcePriority = this.getSourcePriority(b.source) - this.getSourcePriority(a.source)
      return sourcePriority
    })

    return sortedResults.slice(0, maxResults)
  }

  removeDuplicates(results) {
    const seen = new Set()
    return results.filter(result => {
      const key = result.url || result.id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  filterByQuality(results, minQuality) {
    const qualityThresholds = {
      low: 0,
      medium: 0.3,
      high: 0.6
    }

    const threshold = qualityThresholds[minQuality] || 0

    return results.filter(result => {
      const relevance = result.relevance || 0
      const hasRequiredFields = !!(result.url && result.title)
      const isRecent = this.isRecent(result.publishedAt)

      return relevance >= threshold && hasRequiredFields && isRecent
    })
  }

  isRecent(publishedAt) {
    if (!publishedAt) return true
    const published = new Date(publishedAt)
    const now = new Date()
    const daysDiff = (now - published) / (1000 * 60 * 60 * 24)
    return daysDiff <= 30 // 30天内的内容算近期
  }

  getSourcePriority(source) {
    const priorities = {
      google: 10,
      bing: 9,
      newsapi: 8,
      twitter: 7,
      pexels: 5,
      'ai-generated': 3
    }
    return priorities[source] || 0
  }

  getFallbackResults(query) {
    // 返回一些通用的图片作为兜底
    return [
      {
        id: 'fallback-1',
        url: '/public/materials-test/business/unsplash_qW_k6x5OfRc.jpg',
        title: `${query} - 商业相关`,
        source: 'fallback',
        publishedAt: new Date().toISOString(),
        relevance: 0.5
      },
      {
        id: 'fallback-2',
        url: '/public/materials-test/technology/unsplash_oRKF_ZBJYGM.jpg',
        title: `${query} - 科技相关`,
        source: 'fallback',
        publishedAt: new Date().toISOString(),
        relevance: 0.5
      }
    ]
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// 导出单例实例
export const newsImageService = new NewsImageService()
export default newsImageService
