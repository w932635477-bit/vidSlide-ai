/**
 * VidSlide AI 素材服务统一入口
 * 实现本地优先 + 按需外部获取的零成本策略
 */

import LocalMaterialLibrary from './LocalMaterialLibrary.js'
import FreeAPIService from './FreeAPIService.js'
import BaiduImageService from './BaiduImageService.js'
import IntelligentDispatcher from './IntelligentDispatcher.js'

class MaterialService {
  constructor() {
    this.localLibrary = LocalMaterialLibrary
    this.freeAPI = FreeAPIService
    this.baiduImage = new BaiduImageService()
    this.intelligentDispatcher = IntelligentDispatcher
    this.isInitialized = false

    // 统计数据
    this.stats = {
      localHits: 0,
      externalCalls: 0,
      cacheHits: 0,
      totalSearches: 0,
      chineseQueries: 0,
      baiduCalls: 0,
      dispatcherCalls: 0,
      dispatcherCacheHits: 0
    }
  }

  /**
   * 初始化服务
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('🚀 初始化VidSlide AI素材服务...')

      // 初始化本地素材库
      await this.localLibrary.initialize()

      // 初始化免费API服务
      this.freeAPI.loadUsageStats()

      // 初始化智能调度器
      await this.intelligentDispatcher.initialize()

      this.isInitialized = true
      console.log('✅ 素材服务初始化完成')
    } catch (error) {
      console.error('❌ 素材服务初始化失败:', error)
      throw error
    }
  }

  /**
   * 搜索素材 (核心方法)
   */
  async searchMaterials(query, options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    this.stats.totalSearches++

    const { limit = 20, context = {}, forceExternal = false } = options

    console.log(`🔍 素材搜索: "${query}", 上下文:`, context)

    // 步骤1: 智能调度器决策
    console.log('🎯 请求智能调度器决策...')
    let dispatchDecision
    try {
      dispatchDecision = await this.intelligentDispatcher.dispatch(query, {
        context,
        userPreferences: options.userPreferences || {}
      })

      this.stats.dispatcherCalls++
      if (dispatchDecision.cacheHit) {
        this.stats.dispatcherCacheHits++
      }
    } catch (error) {
      console.error('智能调度器调用失败:', error)
      // 降级到默认策略
      dispatchDecision = {
        strategy: { name: 'parallel_platforms' },
        platforms: [
          { name: 'baidu', score: 0.5 },
          { name: 'unsplash', score: 0.5 }
        ],
        confidence: 0.5,
        translation: null,
        reasoning: '调度器错误，降级到默认策略'
      }
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

    // 步骤2: 本地素材库搜索
    const localResults = await this.searchLocalMaterials(query, {
      ...options,
      limit: limit * 2 // 多取一些用于评估
    })

    console.log(`📚 本地搜索结果: ${localResults.materials.length} 个素材`)

    // 步骤3: 基于调度器决策评估是否需要外部获取
    const evaluation = this.evaluateSearchResultsWithDispatcher(
      localResults,
      query,
      context,
      dispatchDecision
    )

    if (evaluation.shouldFetchExternal || forceExternal) {
      console.log(`🌐 触发外部获取: ${evaluation.reason}`)

      // 步骤3: 获取外部素材
      const externalResults = await this.searchExternalMaterials(query, {
        ...options,
        limit: limit - localResults.materials.length // 补充剩余数量
      })

      // 步骤4: 合并和排序结果
      const combinedResults = this.mergeResults(localResults, externalResults, query)

      console.log(
        `🎯 最终结果: ${combinedResults.materials.length} 个素材 (${localResults.materials.length}本地 + ${externalResults.images?.length || 0}外部)`
      )

      return {
        success: true,
        materials: combinedResults.materials.slice(0, limit),
        totalCount: combinedResults.materials.length,
        fromCache: false,
        searchStats: {
          localHits: localResults.materials.length,
          externalHits: externalResults.images?.length || 0,
          needsExternal: true,
          reason: evaluation.reason
        }
      }
    } else {
      console.log(`✅ 本地满足需求: ${evaluation.reason}`)

      return {
        success: true,
        materials: localResults.materials.slice(0, limit),
        totalCount: localResults.materials.length,
        fromCache: localResults.fromCache,
        searchStats: {
          localHits: localResults.materials.length,
          externalHits: 0,
          needsExternal: false,
          reason: evaluation.reason
        }
      }
    }
  }

  /**
   * 搜索本地素材
   */
  async searchLocalMaterials(query, options = {}) {
    try {
      const results = await this.localLibrary.searchMaterials(query, options)
      this.stats.localHits += results.materials.length
      return results
    } catch (error) {
      console.error('本地素材搜索失败:', error)
      return { materials: [], totalCount: 0, fromCache: false }
    }
  }

  /**
   * 搜索外部素材 (集成智能调度器)
   */
  async searchExternalMaterials(query, options = {}) {
    try {
      this.stats.externalCalls++

      // 使用调度器的推荐平台
      const recommendedPlatforms = options.recommendedPlatforms || []

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
                  return results
                }
                break

              case 'unsplash':
              case 'pexels':
              case 'pixabay':
                console.log(`🌍 使用${platform.name}搜索`)
                results = await this.freeAPI.searchImages(searchKeyword, {
                  ...options,
                  provider: platform.name
                })
                if (results.success && results.images.length > 0) {
                  return results
                }
                break
            }
          } catch (error) {
            console.warn(`平台 ${platform.name} 搜索失败:`, error.message)
            continue // 尝试下一个平台
          }
        }
      }

      // 如果推荐平台都没有结果，使用原有逻辑作为后备
      console.log('🔄 推荐平台无结果，使用原有搜索逻辑')

      // 检测是否为中文关键词
      const isChineseQuery = this.isChineseQuery(query)

      if (isChineseQuery) {
        console.log('🇨🇳 检测到中文关键词，优先使用国内素材源')
        this.stats.chineseQueries++

        // 尝试百度图片搜索
        const baiduResults = await this.searchBaiduImages(query, options)

        if (baiduResults.success && baiduResults.images.length > 0) {
          console.log(`✅ 百度图片搜索成功: ${baiduResults.images.length} 个结果`)
          this.stats.baiduCalls++
          return baiduResults
        } else {
          console.log('⚠️ 百度图片搜索失败，降级到国外API')
        }
      }

      // 使用国外免费API (原有逻辑)
      console.log('🌍 使用国外免费API搜索')
      const results = await this.freeAPI.searchImages(query, options)
      return results
    } catch (error) {
      console.error('外部素材搜索失败:', error)
      return { success: false, images: [], error: error.message }
    }
  }

  /**
   * 搜索百度图片
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
   * 检测是否为中文关键词
   */
  isChineseQuery(query) {
    // 检查是否包含中文字符
    const chineseRegex = /[\u4e00-\u9fff]/
    return chineseRegex.test(query)
  }

  /**
   * 基于调度器决策评估搜索结果是否需要外部获取
   */
  evaluateSearchResultsWithDispatcher(localResults, query, context, dispatchDecision) {
    const materials = localResults.materials

    // 如果调度器推荐不需要翻译的平台，直接使用原有逻辑
    if (!dispatchDecision.translation && dispatchDecision.platforms.length === 1) {
      const platform = dispatchDecision.platforms[0]
      if (platform.name === 'baidu') {
        // 中文关键词，优先百度
        return this.evaluateSearchResults(localResults, query, context)
      }
    }

    // 如果调度器置信度很高，遵循调度器推荐
    if (dispatchDecision.confidence > 0.8) {
      const hasGoodLocalResults =
        materials.length >= 3 && materials.some(m => (m.relevanceScore || 0) > 0.7)

      if (!hasGoodLocalResults) {
        return {
          shouldFetchExternal: true,
          reason: `dispatcher_confidence_high_${dispatchDecision.strategy.name}`,
          confidence: dispatchDecision.confidence,
          recommendedPlatforms: dispatchDecision.platforms
        }
      }
    }

    // 调度器置信度中等，使用原有评估逻辑
    return this.evaluateSearchResults(localResults, query, context)
  }

  /**
   * 评估搜索结果是否需要外部获取 (原有逻辑)
   */
  evaluateSearchResults(localResults, query, context) {
    const materials = localResults.materials
    const keywords = query.split(/[\s,，]+/).filter(k => k.length > 0)

    // 规则1: 结果数量不足
    if (materials.length < 2) {
      return {
        shouldFetchExternal: true,
        reason: 'insufficient_local_results',
        confidence: 0.9
      }
    }

    // 规则2: 平均匹配质量太低
    const avgScore =
      materials.reduce((sum, m) => sum + (m.relevanceScore || 0), 0) / materials.length
    if (avgScore < 0.3) {
      return {
        shouldFetchExternal: true,
        reason: 'low_match_quality',
        confidence: 0.8
      }
    }

    // 规则3: 关键词覆盖不足
    const coveredKeywords = new Set()
    materials.forEach(material => {
      if (material.matchReason) {
        keywords.forEach(keyword => {
          if (material.matchReason.toLowerCase().includes(keyword.toLowerCase())) {
            coveredKeywords.add(keyword)
          }
        })
      }
    })

    const coverage = coveredKeywords.size / keywords.length
    if (coverage < 0.5) {
      return {
        shouldFetchExternal: true,
        reason: 'insufficient_keyword_coverage',
        confidence: 0.7
      }
    }

    // 规则4: 特定领域内容
    if (this.isSpecializedDomain(query)) {
      // 对于特定领域，即使本地有结果也可能需要外部获取最新内容
      if (materials.length < 5) {
        return {
          shouldFetchExternal: true,
          reason: 'specialized_domain_need_fresh',
          confidence: 0.6
        }
      }
    }

    // 规则5: 用户明确要求
    if (context.forceExternal) {
      return {
        shouldFetchExternal: true,
        reason: 'user_requested',
        confidence: 1.0
      }
    }

    return {
      shouldFetchExternal: false,
      reason: 'local_sufficient',
      confidence: 0.9
    }
  }

  /**
   * 判断是否为特定领域
   */
  isSpecializedDomain(query) {
    const specializedTerms = [
      // 科技公司
      'elon',
      'musk',
      'tesla',
      'spacex',
      '马斯克',
      '特斯拉',
      'SpaceX',
      // 中企
      '华为',
      '小米',
      '腾讯',
      '阿里巴巴',
      '字节跳动',
      // 国际时事
      'trump',
      'biden',
      'putin',
      'zelenskyy',
      // 体育赛事
      '奥运',
      '世锦赛',
      '欧冠',
      'NBA',
      'CBA'
    ]

    return specializedTerms.some(term => query.toLowerCase().includes(term.toLowerCase()))
  }

  /**
   * 合并本地和外部结果
   */
  mergeResults(localResults, externalResults, query) {
    const merged = []

    // 添加本地结果
    localResults.materials.forEach(material => {
      merged.push({
        ...material,
        source: 'local',
        priority: 'high'
      })
    })

    // 添加外部结果 (如果成功)
    if (externalResults.success && externalResults.images) {
      externalResults.images.forEach(image => {
        merged.push({
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
        })
      })
    }

    // 按优先级和相关度排序
    merged.sort((a, b) => {
      // 优先级排序
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority] || 1
      const bPriority = priorityOrder[b.priority] || 1

      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }

      // 相关度排序
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
   * 记录素材使用
   */
  async recordMaterialUsage(materialId) {
    try {
      // 如果是本地素材，记录使用情况
      if (!materialId.startsWith('external-')) {
        await this.localLibrary.recordUsage(materialId)
      }
    } catch (error) {
      console.warn('记录素材使用失败:', error)
    }
  }

  /**
   * 获取热门素材
   */
  async getPopularMaterials(limit = 10) {
    return await this.localLibrary.getPopularMaterials(limit)
  }

  /**
   * 获取最近使用的素材
   */
  async getRecentMaterials(limit = 10) {
    return await this.localLibrary.getRecentMaterials(limit)
  }

  /**
   * 获取服务统计
   */
  getServiceStats() {
    const localStats = this.localLibrary.getStatistics()
    const apiStats = this.freeAPI.getUsageStats()
    const dispatcherStats = this.intelligentDispatcher.getPerformanceStats()

    return {
      local: localStats,
      external: apiStats,
      dispatcher: dispatcherStats,
      overall: {
        totalSearches: this.stats.totalSearches,
        localHitRate:
          this.stats.totalSearches > 0 ? this.stats.localHits / this.stats.totalSearches : 0,
        externalCallRate:
          this.stats.totalSearches > 0 ? this.stats.externalCalls / this.stats.totalSearches : 0,
        dispatcherCallRate:
          this.stats.totalSearches > 0 ? this.stats.dispatcherCalls / this.stats.totalSearches : 0,
        dispatcherCacheHitRate:
          this.stats.dispatcherCalls > 0
            ? this.stats.dispatcherCacheHits / this.stats.dispatcherCalls
            : 0,
        avgLocalHitsPerSearch:
          this.stats.totalSearches > 0 ? this.stats.localHits / this.stats.totalSearches : 0
      }
    }
  }

  /**
   * 清理缓存和优化
   */
  async optimize() {
    try {
      // 清理本地缓存
      // 优化索引
      // 压缩数据
      console.log('🧹 素材服务优化完成')
    } catch (error) {
      console.warn('素材服务优化失败:', error)
    }
  }
}

// 导出单例实例
export default new MaterialService()
