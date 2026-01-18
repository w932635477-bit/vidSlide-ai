/**
 * 外部搜索服务
 * 负责从外部API（Unsplash、Pexels、Pixabay、百度图片）搜索素材
 */

import FreeAPIService from './FreeAPIService.js'
import BaiduImageService from './BaiduImageService.js'
import IntelligentDispatcher from './IntelligentDispatcher.js'
import CacheService from './CacheService.js'
import OfflineSupport from './OfflineSupport.js'
import { isChineseQuery } from './materialConverters.js'

class ExternalSearchService {
  constructor() {
    this.freeAPI = FreeAPIService
    this.baiduImage = new BaiduImageService()
    this.intelligentDispatcher = IntelligentDispatcher
    this.cacheService = CacheService
    this.offlineSupport = OfflineSupport
    this.stats = {
      externalCalls: 0,
      externalCacheHits: 0,
      chineseQueries: 0,
      baiduCalls: 0,
      dispatcherCalls: 0,
      dispatcherCacheHits: 0
    }
  }

  /**
   * 初始化外部搜索服务
   */
  async initialize() {
    console.log('🌐 初始化外部搜索服务...')
    this.freeAPI.loadUsageStats()
    await this.intelligentDispatcher.initialize()
    console.log('✅ 外部搜索服务初始化完成')
  }

  /**
   * 获取智能调度器决策
   * @param {string} query - 查询关键词
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 调度决策
   */
  async getDispatchDecision(query, options = {}) {
    try {
      console.log('🎯 请求智能调度器决策...')
      const dispatchDecision = await this.intelligentDispatcher.dispatch(query, {
        context: options.context || {},
        userPreferences: options.userPreferences || {}
      })

      this.stats.dispatcherCalls++
      if (dispatchDecision.cacheHit) {
        this.stats.dispatcherCacheHits++
      }

      console.log(
        `🎯 调度决策: ${dispatchDecision.strategy.name}, 置信度: ${(dispatchDecision.confidence * 100).toFixed(1)}%`
      )
      console.log(`🏢 推荐平台: ${dispatchDecision.platforms.map(p => p.name).join(', ')}`)
      if (dispatchDecision.translation) {
        console.log(
          `🌐 翻译: "${dispatchDecision.translation.original}" → "${dispatchDecision.translation.translated}"`
        )
      }

      return dispatchDecision
    } catch (error) {
      console.error('智能调度器调用失败:', error)
      // 降级到默认策略
      return {
        strategy: { name: 'parallel_platforms' },
        platforms: [
          { name: 'unsplash', score: 0.6 },
          { name: 'pexels', score: 0.5 }
        ],
        confidence: 0.5,
        translation: null,
        reasoning: '调度器错误，降级到默认策略'
      }
    }
  }

  /**
   * 搜索外部素材
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async searchExternalMaterials(query, options = {}) {
    try {
      this.stats.externalCalls++

      // 检查网络状态
      if (!this.offlineSupport.canUseExternalAPI()) {
        console.log('⚠️ 网络不可用，无法使用外部API')
        return { success: false, images: [], error: 'Network unavailable' }
      }

      // 首先检查缓存
      const cachedResults = await this.cacheService.checkExternalCache(query, options)
      if (cachedResults) {
        console.log(`💾 使用缓存的外部素材: ${cachedResults.images.length} 个结果`)
        this.stats.externalCacheHits++
        return cachedResults
      }

      // 使用调度器的推荐平台
      const recommendedPlatforms = options.platforms || []

      if (recommendedPlatforms.length > 0) {
        console.log(`🎯 遵循调度器推荐: ${recommendedPlatforms.map(p => p.name).join(', ')}`)

        // 优先尝试推荐的平台
        for (const platform of recommendedPlatforms) {
          try {
            let results = null
            const searchKeyword = platform.keyword || query

            switch (platform.name) {
              case 'baidu':
                console.log('🇨🇳 使用百度图片搜索')
                results = await this.searchBaiduImages(searchKeyword, options)
                if (results.success && results.images.length > 0) {
                  this.stats.baiduCalls++
                  results.source = 'baidu'
                  return results
                }
                break

              case 'unsplash':
                console.log('🌍 使用Unsplash搜索')
                results = await this.freeAPI.searchImages(searchKeyword, {
                  ...options,
                  provider: 'unsplash'
                })
                if (results.success && results.images.length > 0) {
                  results.source = 'unsplash'
                  return results
                }
                break

              case 'pexels':
                console.log('🌍 使用Pexels搜索')
                results = await this.freeAPI.searchImages(searchKeyword, {
                  ...options,
                  provider: 'pexels'
                })
                if (results.success && results.images.length > 0) {
                  results.source = 'pexels'
                  return results
                }
                break

              case 'pixabay':
                console.log('🌍 使用Pixabay搜索')
                results = await this.freeAPI.searchImages(searchKeyword, {
                  ...options,
                  provider: 'pixabay'
                })
                if (results.success && results.images.length > 0) {
                  results.source = 'pixabay'
                  return results
                }
                break
            }
          } catch (error) {
            console.warn(`平台 ${platform.name} 搜索失败:`, error.message)
            continue
          }
        }
      }

      // 如果推荐平台都没有结果，使用原有逻辑作为后备
      console.log('🔄 推荐平台无结果，使用原有搜索逻辑')

      // 检测是否为中文关键词
      const isChinese = isChineseQuery(query)

      if (isChinese) {
        console.log('🇨🇳 检测到中文关键词，优先使用国内素材源')
        this.stats.chineseQueries++

        // 尝试百度图片搜索
        const baiduResults = await this.searchBaiduImages(query, options)

        if (baiduResults.success && baiduResults.images.length > 0) {
          console.log(`✅ 百度图片搜索成功: ${baiduResults.images.length} 个结果`)
          this.stats.baiduCalls++
          baiduResults.source = 'baidu'
          return baiduResults
        } else {
          console.log('⚠️ 百度图片搜索失败，降级到国外API')
        }
      }

      // 使用国外免费API
      console.log('🌍 使用国外免费API搜索')
      const results = await this.freeAPI.searchImages(query, options)

      if (results.success && results.images && results.images.length > 0) {
        results.source = results.source || 'unsplash'
        await this.cacheService.cacheExternalResults(results, query, options)
      }

      return results
    } catch (error) {
      console.error('外部素材搜索失败:', error)
      return { success: false, images: [], error: error.message }
    }
  }

  /**
   * 搜索百度图片
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async searchBaiduImages(query, options = {}) {
    try {
      const results = await this.baiduImage.searchImages(query, options)
      return results
    } catch (error) {
      console.error('百度图片搜索异常:', error)
      return { success: false, images: [], error: error.message }
    }
  }

  /**
   * 合并本地和外部结果
   * @param {Object} localResults - 本地搜索结果
   * @param {Object} externalResults - 外部搜索结果
   * @param {string} query - 查询关键词
   * @returns {Promise<Object>} 合并后的结果
   */
  async mergeResults(localResults, externalResults, query) {
    const merged = []

    // 添加本地结果
    localResults.materials.forEach(material => {
      merged.push({
        ...material,
        source: 'local',
        priority: 'high'
      })
    })

    // 添加外部结果
    if (externalResults.success && externalResults.images) {
      for (const image of externalResults.images) {
        const material = {
          id: `external-${image.source}-${image.id}`,
          category: 'external',
          name: image.title || query,
          type: 'image',
          dataUrl: image.url,
          thumbnailUrl: image.thumbnail,
          dimensions: { width: image.width, height: image.height },
          tags: [query],
          keywords: [query],
          source: image.source,
          priority: 'medium',
          externalData: image,
          usageCount: 0
        }

        merged.push(material)

        // 缓存外部素材
        try {
          await this.cacheService.cacheMaterial(material, image.source, {
            query,
            usageCount: 0
          })
        } catch (cacheError) {
          console.warn('缓存外部素材失败:', cacheError)
        }
      }
    }

    // 按优先级和相关度排序
    merged.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority] || 1
      const bPriority = priorityOrder[b.priority] || 1

      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }

      const aScore = a.relevanceScore || 0
      const bScore = b.relevanceScore || 0

      return bScore - aScore
    })

    return {
      materials: merged,
      totalCount: merged.length
    }
  }

  /**
   * 获取外部搜索统计
   * @returns {Object} 统计信息
   */
  getStats() {
    const apiStats = this.freeAPI.getUsageStats()
    const dispatcherStats = this.intelligentDispatcher.getPerformanceStats()

    return {
      ...this.stats,
      api: apiStats,
      dispatcher: dispatcherStats,
      externalCacheHitRate:
        this.stats.externalCalls > 0 ? this.stats.externalCacheHits / this.stats.externalCalls : 0,
      dispatcherCacheHitRate:
        this.stats.dispatcherCalls > 0
          ? this.stats.dispatcherCacheHits / this.stats.dispatcherCalls
          : 0
    }
  }
}

// 导出单例实例
export default new ExternalSearchService()
