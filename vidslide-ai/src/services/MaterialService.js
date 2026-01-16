/**
 * VidSlide AI 素材服务统一入口
 * 实现本地优先 + 按需外部获取的零成本策略
 */

import LocalMaterialLibrary from './LocalMaterialLibrary.js'
import FreeAPIService from './FreeAPIService.js'
import BaiduImageService from './BaiduImageService.js'
import IntelligentDispatcher from './IntelligentDispatcher.js'
import CLIPMatcher from './CLIPMatcher.js'
import SmartCache from './SmartCache.js'
import OfflineSupport from './OfflineSupport.js'
import {
  findRecipe,
  searchRecipes,
  searchRecipesByKeyword,
  getRecommendedRecipes,
  getAllRecipes,
  getRecipeStats
} from '../data/curatedMaterialRecipes.js'

class MaterialService {
  constructor() {
    this.localLibrary = LocalMaterialLibrary
    this.freeAPI = FreeAPIService
    this.baiduImage = new BaiduImageService()
    this.intelligentDispatcher = IntelligentDispatcher
    this.clipMatcher = CLIPMatcher
    this.smartCache = SmartCache
    this.offlineSupport = OfflineSupport
    this.isInitialized = false

    // 统计数据
    this.stats = {
      localHits: 0,
      externalCalls: 0,
      externalCacheHits: 0,
      externalCached: 0,
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

      // 初始化智能缓存系统
      console.log('💾 初始化智能缓存系统...')
      await this.smartCache.initialize()
      this.smartCache.startAutoCleanup()
      console.log('✅ 智能缓存系统已启动')

      // 初始化离线支持
      console.log('📡 初始化离线支持...')
      this.offlineSupport.initialize()

      // 添加网络状态监听器
      this.offlineSupport.addListener((status, isOnline) => {
        console.log(`📡 网络状态变化: ${status} (${isOnline ? '在线' : '离线'})`)
        if (isOnline) {
          console.log('✅ 网络已恢复，可以使用外部API')
        } else {
          console.log('⚠️ 网络已断开，将使用缓存素材')
        }
      })
      console.log('✅ 离线支持已启动')

      this.isInitialized = true
      console.log('✅ 素材服务初始化完成')
    } catch (error) {
      console.error('❌ 素材服务初始化失败:', error)
      throw error
    }
  }

  /**
   * 搜索素材 (核心方法 - 外部优先策略)
   */
  async searchMaterials(query, options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    this.stats.totalSearches++

    const { limit = 20, context = {}, forceLocal = false } = options

    console.log(`🔍 素材搜索: "${query}", 策略: ${forceLocal ? '仅本地' : '外部优先'}`)

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
      // 降级到默认策略（外部优先）
      dispatchDecision = {
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

    console.log(
      `🎯 调度决策: ${dispatchDecision.strategy.name}, 置信度: ${(dispatchDecision.confidence * 100).toFixed(1)}%`
    )
    console.log(`🏢 推荐平台: ${dispatchDecision.platforms.map(p => p.name).join(', ')}`)
    if (dispatchDecision.translation) {
      console.log(
        `🌐 翻译: "${dispatchDecision.translation.original}" → "${dispatchDecision.translation.translated}"`
      )
    }

    // 步骤2: 外部优先搜索（检查网络状态）
    if (!forceLocal && this.offlineSupport.canUseExternalAPI()) {
      try {
        console.log('🌐 优先使用外部API搜索...')

        const externalResults = await this.searchExternalMaterials(query, {
          ...options,
          platforms: dispatchDecision.platforms,
          translation: dispatchDecision.translation,
          limit
        })

        if (externalResults.images && externalResults.images.length > 0) {
          console.log(`✅ 外部搜索成功: ${externalResults.images.length} 个素材`)
          this.stats.externalCalls++

          // 缓存外部结果到本地
          await this.cacheExternalResults(externalResults.images, query)

          // CLIP智能排序（可选）
          let finalMaterials = externalResults.images
          if (options.enableSmartMatching !== false) {
            try {
              finalMaterials = await this.smartMatchMaterials(query, externalResults.images, context)
              console.log('🧠 已应用CLIP智能排序')
            } catch (error) {
              console.warn('CLIP排序失败，使用默认排序:', error.message)
            }
          }

          return {
            success: true,
            materials: finalMaterials.slice(0, limit),
            totalCount: finalMaterials.length,
            source: 'external',
            platforms: dispatchDecision.platforms.map(p => p.name),
            cached: false,
            searchStats: {
              localHits: 0,
              externalHits: externalResults.images.length,
              strategy: 'external_first',
              smartMatching: options.enableSmartMatching !== false
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ 外部搜索失败，降级到本地缓存:', error.message)
      }
    }

    // 步骤3: 降级到本地缓存
    console.log('📚 使用本地缓存素材...')
    const localResults = await this.searchLocalMaterials(query, {
      ...options,
      limit
    })

    if (localResults.materials.length > 0) {
      console.log(`✅ 本地缓存命中: ${localResults.materials.length} 个素材`)
      this.stats.cacheHits++

      return {
        success: true,
        materials: localResults.materials.slice(0, limit),
        totalCount: localResults.materials.length,
        source: 'cache',
        cached: true,
        searchStats: {
          localHits: localResults.materials.length,
          externalHits: 0,
          strategy: 'cache_fallback'
        }
      }
    }

    // 步骤4: 最后降级到预置素材
    console.log('📦 使用预置素材...')
    const presetResults = await this.searchPresetMaterials(query, { limit })

    return {
      success: presetResults.materials.length > 0,
      materials: presetResults.materials || [],
      totalCount: presetResults.materials?.length || 0,
      source: 'preset',
      cached: false,
      searchStats: {
        localHits: presetResults.materials?.length || 0,
        externalHits: 0,
        strategy: 'preset_fallback'
      }
    }
  }

  /**
   * 搜索本地素材
   */
  async searchLocalMaterials(query, options = {}) {
    try {
      // 首先尝试智能缓存
      const cachedResults = await this.smartCache.search(query, {
        limit: options.limit || 20
      })

      if (cachedResults.length > 0) {
        console.log(`💾 智能缓存命中: ${cachedResults.length} 个素材`)
        this.stats.cacheHits += cachedResults.length
        this.offlineSupport.recordCacheHit()

        return {
          materials: cachedResults,
          totalCount: cachedResults.length,
          fromCache: true,
          breakdown: {
            preset: 0,
            cached: cachedResults.length
          }
        }
      }

      // 缓存未命中，使用本地素材库（预置素材）
      console.log('💾 智能缓存未命中，搜索预置素材...')
      const results = await this.localLibrary.searchMaterials(query, options)

      // 合并本地和缓存的结果
      const allMaterials = [...results.local, ...results.cached]

      this.stats.localHits += allMaterials.length

      return {
        materials: allMaterials,
        totalCount: results.total,
        fromCache: results.cached.length > 0,
        breakdown: {
          preset: results.local.length,
          cached: results.cached.length
        }
      }
    } catch (error) {
      console.error('本地素材搜索失败:', error)
      return { materials: [], totalCount: 0, fromCache: false, breakdown: { preset: 0, cached: 0 } }
    }
  }

  /**
   * 搜索外部素材 (集成智能调度器)
   */
  async searchExternalMaterials(query, options = {}) {
    try {
      this.stats.externalCalls++

      // 首先检查本地缓存中是否已有该查询的结果
      const cachedResults = await this.checkExternalCache(query, options)
      if (cachedResults) {
        console.log(`💾 使用缓存的外部素材: ${cachedResults.images.length} 个结果`)
        this.stats.externalCacheHits++
        return cachedResults
      }

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
                  // 添加平台信息用于缓存
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
          baiduResults.source = 'baidu'
          return baiduResults
        } else {
          console.log('⚠️ 百度图片搜索失败，降级到国外API')
        }
      }

      // 使用国外免费API (原有逻辑)
      console.log('🌍 使用国外免费API搜索')
      const results = await this.freeAPI.searchImages(query, options)

      // 根据查询类型设置默认来源
      if (results.success && results.images && results.images.length > 0) {
        results.source = results.source || 'unsplash' // 默认使用unsplash作为来源标识
        await this.cacheExternalResults(results, query, options)
      }

      return results
    } catch (error) {
      console.error('外部素材搜索失败:', error)
      return { success: false, images: [], error: error.message }
    }
  }

  /**
   * 检查外部素材缓存
   */
  async checkExternalCache(query, options = {}) {
    try {
      // 生成缓存键
      const cacheKey = this.generateExternalCacheKey(query, options)

      // 检查本地素材库是否有缓存的外部素材
      const cachedMaterials = []
      const limit = options.limit || 20

      // 这里可以实现更复杂的缓存查找逻辑
      // 暂时简化处理，直接返回null让它去获取新的
      return null
    } catch (error) {
      console.error('检查外部缓存失败:', error)
      return null
    }
  }

  /**
   * 缓存外部搜索结果
   */
  async cacheExternalResults(results, query, options = {}) {
    try {
      if (!results.success || !results.images || results.images.length === 0) {
        return
      }

      console.log(`💾 开始缓存 ${results.images.length} 个外部素材...`)

      let cachedCount = 0
      const platform = this.determinePlatformFromResults(results, options)

      for (const image of results.images) {
        try {
          // 转换为本地素材格式
          const material = this.convertImageToMaterial(image, platform)

          // 添加到本地素材库缓存
          const cached = await this.localLibrary.addExternalMaterial(material, platform)
          if (cached) {
            cachedCount++
          }
        } catch (error) {
          console.warn('缓存外部素材失败:', error.message)
        }
      }

      console.log(`✅ 成功缓存 ${cachedCount}/${results.images.length} 个外部素材 (${platform})`)

      // 更新统计
      this.stats.externalCached += cachedCount
    } catch (error) {
      console.error('缓存外部结果失败:', error)
    }
  }

  /**
   * 从搜索结果确定平台
   */
  determinePlatformFromResults(results, options) {
    // 根据options或results中的信息判断平台
    if (options.recommendedPlatforms && options.recommendedPlatforms.length > 0) {
      return options.recommendedPlatforms[0].name
    }

    // 根据结果特征判断
    if (results.source) {
      return results.source
    }

    // 默认根据调用路径判断
    return 'unknown'
  }

  /**
   * 将图片数据转换为本地素材格式
   */
  convertImageToMaterial(image, platform) {
    return {
      id: `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: 'external',
      subcategory: this.categorizeImage(image),
      industry: '通用',
      scene: '通用',
      style: '写实',
      name: image.title || image.description || '外部素材',
      type: 'image',
      tags: image.tags || [],
      keywords: [image.title, image.description].filter(Boolean),
      semanticTags: this.extractSemanticTags(image),
      relatedConcepts: [],
      contextKeywords: [],
      dataUrl: image.thumbnail || image.url, // 使用缩略图节省空间
      thumbnailUrl: image.thumbnail || image.url,
      fullUrl: image.url, // 保存完整图片URL
      dimensions: {
        width: image.width || 400,
        height: image.height || 300
      },
      aspectRatio: (image.width || 400) / (image.height || 300),
      source: platform,
      external: true,
      createdAt: new Date().toISOString(),
      usageCount: 0
    }
  }

  /**
   * 根据图片信息进行分类
   */
  categorizeImage(image) {
    const title = (image.title + ' ' + (image.description || '')).toLowerCase()

    if (title.includes('portrait') || title.includes('face') || title.includes('人物')) {
      return '人物'
    }
    if (title.includes('nature') || title.includes('landscape') || title.includes('风景')) {
      return '风景'
    }
    if (title.includes('food') || title.includes('美食') || title.includes('饮食')) {
      return '美食'
    }
    if (title.includes('technology') || title.includes('科技') || title.includes('数字')) {
      return '科技'
    }
    if (title.includes('business') || title.includes('商务') || title.includes('商业')) {
      return '商务'
    }

    return '通用'
  }

  /**
   * 提取语义标签
   */
  extractSemanticTags(image) {
    const tags = []
    const content = (image.title + ' ' + (image.description || '')).toLowerCase()

    // 基础语义标签
    if (content.includes('nature') || content.includes('自然')) tags.push('自然')
    if (content.includes('urban') || content.includes('城市')) tags.push('城市')
    if (content.includes('people') || content.includes('人物')) tags.push('人物')
    if (content.includes('food') || content.includes('美食')) tags.push('美食')
    if (content.includes('technology') || content.includes('科技')) tags.push('科技')
    if (content.includes('business') || content.includes('商务')) tags.push('商务')

    return tags
  }

  /**
   * 生成外部缓存键
   */
  generateExternalCacheKey(query, options) {
    return `${query}_${JSON.stringify(options)}`
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

    // 添加外部结果 (如果成功)
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

        // 缓存外部素材到本地库
        try {
          await this.localLibrary.cacheMaterial(material, image.source, {
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
   * 设置行为监听
   */
  setupBehaviorListeners() {
    // 监听搜索行为
    const originalSearchMaterials = this.searchMaterials.bind(this)
    this.searchMaterials = async (query, options = {}) => {
      const result = await originalSearchMaterials(query, options)

      // 通知本地素材库搜索行为
      if (this.localLibrary.searchBehaviorObserver) {
        this.localLibrary.searchBehaviorObserver(query, result.materials || [])
      }

      return result
    }

    // 监听素材使用行为
    const originalRecordUsage = this.localLibrary.recordUsage.bind(this.localLibrary)
    this.localLibrary.recordUsage = async materialId => {
      await originalRecordUsage(materialId)

      // 通知行为观察器
      if (this.localLibrary.usageBehaviorObserver) {
        this.localLibrary.usageBehaviorObserver(materialId)
      }
    }
  }

  /**
   * 获取渐进式加载状态
   */
  getProgressiveLoadingState() {
    return this.localLibrary.getLoadingState()
  }

  /**
   * 强制加载指定素材包
   */
  async forceLoadMaterialPack(packId) {
    return this.localLibrary.forceLoadPack(packId)
  }

  /**
   * 获取个性化推荐
   */
  async getPersonalizedRecommendations(limit = 10) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return this.localLibrary.generatePersonalizedRecommendations(limit)
  }

  /**
   * 获取用户洞察
   */
  async getUserInsights() {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return this.localLibrary.getUserInsights()
  }

  /**
   * 使用CLIP进行智能素材匹配
   * @param {string} query - 查询关键词
   * @param {Array} availableMaterials - 可用素材数组
   * @param {Object} contentAnalysis - 内容分析结果
   * @returns {Promise<Array>} 智能排序的素材
   */
  async smartMatchMaterials(query, availableMaterials, contentAnalysis = {}) {
    try {
      console.log(`🧠 使用CLIP智能匹配素材: "${query}"`)

      // 预处理素材数据，确保包含图像
      const processedMaterials = await this.preprocessMaterialsForCLIP(availableMaterials)

      if (processedMaterials.length === 0) {
        console.warn('⚠️ 没有可用于CLIP匹配的素材')
        return availableMaterials
      }

      // 使用CLIP进行语义匹配
      const smartMatches = await this.clipMatcher.findBestMatches(query, processedMaterials, 20)

      // 记录统计
      this.stats.clipMatches = (this.stats.clipMatches || 0) + 1

      console.log(`🎯 CLIP匹配完成，返回 ${smartMatches.length} 个智能排序结果`)

      return smartMatches.map(match => ({
        ...match,
        selectionMethod: 'clip-semantic',
        confidence: match.similarity,
        smartRank: match.rank
      }))
    } catch (error) {
      console.warn('❌ CLIP智能匹配失败，使用传统方法:', error.message)

      // 降级到关键词匹配
      return this.fallbackKeywordMatch(query, availableMaterials)
    }
  }

  /**
   * 预处理素材用于CLIP匹配
   * @param {Array} materials - 原始素材数组
   * @returns {Promise<Array>} 处理后的素材数组
   */
  async preprocessMaterialsForCLIP(materials) {
    const processed = []

    for (const material of materials) {
      try {
        let image = null

        // 尝试获取图像数据
        if (material.imageBlob) {
          image = await this.blobToImageData(material.imageBlob)
        } else if (material.thumbnail || material.url) {
          const img = await this.loadImage(material.thumbnail || material.url)
          image = await this.imageToImageData(img)
        }

        if (image) {
          processed.push({
            ...material,
            image,
            // 添加描述文本用于匹配
            description: material.description || material.name || material.tags?.join(' ') || ''
          })
        }
      } catch (error) {
        console.warn(`预处理素材失败: ${material.id || material.name}`, error)
      }
    }

    return processed
  }

  /**
   * 将Blob转换为ImageData
   * @param {Blob} blob - 图片Blob
   * @returns {Promise<ImageData>} 图像数据
   */
  async blobToImageData(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        resolve(ctx.getImageData(0, 0, canvas.width, canvas.height))
      }
      img.onerror = reject
      img.src = URL.createObjectURL(blob)
    })
  }

  /**
   * 将HTMLImageElement转换为ImageData
   * @param {HTMLImageElement} img - 图片元素
   * @returns {Promise<ImageData>} 图像数据
   */
  async imageToImageData(img) {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height))
    })
  }

  /**
   * 加载图片
   * @param {string} src - 图片源
   * @returns {Promise<HTMLImageElement>} 图片元素
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = resolve
      img.onerror = reject
      img.src = src
    })
  }

  /**
   * 降级关键词匹配
   * @param {string} query - 查询关键词
   * @param {Array} materials - 素材数组
   * @returns {Array} 匹配结果
   */
  fallbackKeywordMatch(query, materials) {
    const queryLower = query.toLowerCase()

    return materials
      .map(material => {
        const nameMatch = (material.name || '').toLowerCase().includes(queryLower) ? 1 : 0
        const descMatch = (material.description || '').toLowerCase().includes(queryLower) ? 0.8 : 0
        const tagMatch = (material.tags || []).some(tag => tag.toLowerCase().includes(queryLower))
          ? 0.6
          : 0

        const score = Math.max(nameMatch, descMatch, tagMatch)

        return {
          ...material,
          similarity: score,
          selectionMethod: 'keyword-fallback',
          confidence: score
        }
      })
      .filter(material => material.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
  }

  /**
   * 计算本地素材匹配度
   * @param {string|Array} keywords - 关键词（字符串或数组）
   * @returns {Promise<Object>} 匹配度评估结果
   */
  async calculateLocalMatchRate(keywords) {
    try {
      // 标准化关键词为数组
      const keywordArray = Array.isArray(keywords) ? keywords : [keywords]

      if (keywordArray.length === 0) {
        return {
          matchRate: 0,
          avgConfidence: 0,
          coverageRate: 0,
          matchedCount: 0,
          details: '无关键词'
        }
      }

      console.log(`📊 计算本地匹配度: ${keywordArray.join(', ')}`)

      // 搜索本地素材
      const localResults = await this.searchLocalMaterials(keywordArray.join(' '), {
        limit: 50 // 多取一些用于评估
      })

      if (localResults.materials.length === 0) {
        console.log('📊 本地匹配度: 0% (无匹配素材)')
        return {
          matchRate: 0,
          avgConfidence: 0,
          coverageRate: 0,
          matchedCount: 0,
          details: '本地无匹配素材'
        }
      }

      // 评估每个素材的匹配质量
      const evaluatedMaterials = await this.evaluateMaterialsMatchQuality(
        keywordArray,
        localResults.materials
      )

      // 计算平均置信度
      const avgConfidence =
        evaluatedMaterials.reduce((sum, m) => sum + (m.confidence || 0), 0) /
        evaluatedMaterials.length

      // 计算关键词覆盖率
      const coveredKeywords = new Set()
      evaluatedMaterials.forEach(material => {
        keywordArray.forEach(keyword => {
          const keywordLower = keyword.toLowerCase()
          const materialText = [
            material.name,
            material.description,
            ...(material.tags || []),
            ...(material.keywords || [])
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          if (materialText.includes(keywordLower)) {
            coveredKeywords.add(keyword)
          }
        })
      })

      const coverageRate = coveredKeywords.size / keywordArray.length

      // 综合评分：置信度 * 0.6 + 覆盖率 * 0.4
      const matchRate = avgConfidence * 0.6 + coverageRate * 0.4

      console.log(`📊 本地匹配度: ${(matchRate * 100).toFixed(1)}%`)
      console.log(`   - 平均置信度: ${(avgConfidence * 100).toFixed(1)}%`)
      console.log(`   - 关键词覆盖率: ${(coverageRate * 100).toFixed(1)}% (${coveredKeywords.size}/${keywordArray.length})`)
      console.log(`   - 匹配素材数: ${evaluatedMaterials.length}`)

      return {
        matchRate,
        avgConfidence,
        coverageRate,
        matchedCount: evaluatedMaterials.length,
        coveredKeywords: Array.from(coveredKeywords),
        uncoveredKeywords: keywordArray.filter(k => !coveredKeywords.has(k)),
        topMatches: evaluatedMaterials.slice(0, 5),
        details: `匹配度${(matchRate * 100).toFixed(1)}%，覆盖${coveredKeywords.size}/${keywordArray.length}个关键词`
      }
    } catch (error) {
      console.error('计算本地匹配度失败:', error)
      return {
        matchRate: 0,
        avgConfidence: 0,
        coverageRate: 0,
        matchedCount: 0,
        error: error.message
      }
    }
  }

  /**
   * 评估素材匹配质量
   * @param {Array} keywords - 关键词数组
   * @param {Array} materials - 素材数组
   * @returns {Promise<Array>} 评估后的素材数组
   */
  async evaluateMaterialsMatchQuality(keywords, materials) {
    const results = []

    for (const material of materials) {
      let matchType = 'none'
      let confidence = 0

      // 1. 精确匹配检查（≥90%）
      const exactMatch = this.isExactMatch(keywords, material)
      if (exactMatch.isMatch) {
        matchType = 'exact'
        confidence = exactMatch.confidence
      }
      // 2. 语义相似检查（≥0.7）
      else {
        try {
          // 使用CLIP进行语义匹配
          const semanticScore = await this.calculateSemanticSimilarity(keywords, material)
          if (semanticScore >= 0.7) {
            matchType = 'semantic'
            confidence = semanticScore
          }
          // 3. 行业相关检查
          else {
            const industryMatch = this.isIndustryRelated(keywords, material)
            if (industryMatch.isMatch) {
              matchType = 'industry'
              confidence = industryMatch.confidence
            }
          }
        } catch (error) {
          // CLIP失败时降级到关键词匹配
          const keywordScore = this.calculateKeywordSimilarity(keywords, material)
          if (keywordScore >= 0.5) {
            matchType = 'keyword'
            confidence = keywordScore
          }
        }
      }

      if (matchType !== 'none') {
        results.push({
          ...material,
          matchType,
          confidence
        })
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * 精确匹配判断（≥90%）
   * @param {Array} keywords - 关键词数组
   * @param {Object} material - 素材对象
   * @returns {Object} 匹配结果
   */
  isExactMatch(keywords, material) {
    const materialText = [
      material.name,
      material.title,
      ...(material.tags || []),
      ...(material.keywords || [])
    ]
      .filter(Boolean)
      .map(t => t.toLowerCase())

    let matchCount = 0
    const matchedKeywords = []

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase()
      // 检查是否有完全匹配
      if (materialText.some(text => text === keywordLower || text.includes(keywordLower))) {
        matchCount++
        matchedKeywords.push(keyword)
      }
    }

    const matchRate = matchCount / keywords.length

    return {
      isMatch: matchRate >= 0.9,
      confidence: matchRate >= 0.9 ? 0.95 : matchRate,
      matchedKeywords,
      matchRate
    }
  }

  /**
   * 计算语义相似度（使用CLIP或降级方案）
   * @param {Array} keywords - 关键词数组
   * @param {Object} material - 素材对象
   * @returns {Promise<number>} 相似度分数（0-1）
   */
  async calculateSemanticSimilarity(keywords, material) {
    try {
      // 尝试使用CLIP
      const query = keywords.join(' ')
      const similarities = await this.clipMatcher.matchTextToImages(query, [material])
      return similarities[0] || 0
    } catch (error) {
      // 降级到关键词相似度
      return this.calculateKeywordSimilarity(keywords, material)
    }
  }

  /**
   * 计算关键词相似度（降级方案）
   * @param {Array} keywords - 关键词数组
   * @param {Object} material - 素材对象
   * @returns {number} 相似度分数（0-1）
   */
  calculateKeywordSimilarity(keywords, material) {
    const materialText = [
      material.name,
      material.description,
      ...(material.tags || []),
      ...(material.keywords || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    let totalScore = 0
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase()
      if (materialText.includes(keywordLower)) {
        // 完全包含得1分
        totalScore += 1
      } else {
        // 部分匹配得0.5分
        const words = keywordLower.split(/\s+/)
        const partialMatches = words.filter(word => materialText.includes(word)).length
        totalScore += (partialMatches / words.length) * 0.5
      }
    }

    return Math.min(totalScore / keywords.length, 1)
  }

  /**
   * 行业相关性判断
   * @param {Array} keywords - 关键词数组
   * @param {Object} material - 素材对象
   * @returns {Object} 匹配结果
   */
  isIndustryRelated(keywords, material) {
    const industryMap = {
      科技: ['technology', 'tech', 'digital', 'innovation', 'ai', 'software', 'hardware', '数字', '创新', '智能'],
      教育: ['education', 'learning', 'teaching', 'school', 'university', 'student', '学习', '教学', '学校', '大学'],
      金融: ['finance', 'money', 'banking', 'investment', 'stock', 'economy', '金融', '投资', '银行', '经济'],
      医疗: ['medical', 'health', 'healthcare', 'hospital', 'doctor', 'medicine', '医疗', '健康', '医院', '医生'],
      商务: ['business', 'office', 'meeting', 'corporate', 'professional', '商务', '办公', '会议', '企业'],
      旅游: ['travel', 'tourism', 'vacation', 'destination', 'hotel', '旅游', '度假', '酒店', '景点'],
      美食: ['food', 'restaurant', 'cuisine', 'cooking', 'dining', '美食', '餐厅', '烹饪', '饮食'],
      时尚: ['fashion', 'style', 'clothing', 'design', 'trend', '时尚', '服装', '设计', '潮流'],
      体育: ['sports', 'fitness', 'exercise', 'athlete', 'game', '体育', '健身', '运动', '比赛'],
      娱乐: ['entertainment', 'movie', 'music', 'game', 'show', '娱乐', '电影', '音乐', '游戏']
    }

    // 检查关键词所属行业
    const keywordIndustries = new Set()
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase()
      for (const [industry, terms] of Object.entries(industryMap)) {
        if (terms.some(term => keywordLower.includes(term) || term.includes(keywordLower))) {
          keywordIndustries.add(industry)
        }
      }
    }

    // 检查素材所属行业
    const materialText = [
      material.name,
      material.description,
      material.industry,
      material.scene,
      ...(material.tags || []),
      ...(material.keywords || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const materialIndustries = new Set()
    for (const [industry, terms] of Object.entries(industryMap)) {
      if (terms.some(term => materialText.includes(term))) {
        materialIndustries.add(industry)
      }
    }

    // 计算行业交集
    const commonIndustries = [...keywordIndustries].filter(ind => materialIndustries.has(ind))

    const isMatch = commonIndustries.length > 0
    const confidence = isMatch ? 0.6 + (commonIndustries.length * 0.1) : 0

    return {
      isMatch,
      confidence: Math.min(confidence, 0.85),
      keywordIndustries: Array.from(keywordIndustries),
      materialIndustries: Array.from(materialIndustries),
      commonIndustries
    }
  }

  /**
   * 缓存外部搜索结果
   * @param {Array} materials - 素材数组
   * @param {string} query - 搜索关键词
   */
  async cacheExternalResults(materials, query) {
    try {
      // 使用智能缓存系统（LRU + TTL）
      await this.smartCache.addBatch(materials, query)

      this.stats.externalCached += materials.length
      console.log(`💾 已缓存 ${materials.length} 个素材元数据到智能缓存`)
    } catch (error) {
      console.warn('缓存失败:', error)
    }
  }

  /**
   * 搜索预置素材（最小化本地素材库）
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async searchPresetMaterials(query, options = {}) {
    // 只保留8个高质量预置素材作为最后降级
    const presetMaterials = [
      {
        id: 'preset-tech-001',
        name: '科技背景',
        title: '科技背景',
        url: '/materials-test/technology/unsplash_oRKF_ZBJYGM.jpg',
        thumbnail: '/materials-test/technology/unsplash_oRKF_ZBJYGM.jpg',
        tags: ['科技', 'technology', 'tech', '数字', 'digital'],
        keywords: ['科技', '技术', '创新', '数字化'],
        source: 'preset',
        industry: '科技'
      },
      {
        id: 'preset-tech-002',
        name: '科技设备',
        title: '科技设备',
        url: '/materials-test/technology/pexels_546819.jpeg',
        thumbnail: '/materials-test/technology/pexels_546819.jpeg',
        tags: ['科技', 'technology', 'computer', '电脑'],
        keywords: ['科技', '电脑', '设备', '技术'],
        source: 'preset',
        industry: '科技'
      },
      {
        id: 'preset-business-001',
        name: '商务会议',
        title: '商务会议',
        url: '/materials-test/business/pexels_3184416.jpeg',
        thumbnail: '/materials-test/business/pexels_3184416.jpeg',
        tags: ['商务', 'business', 'meeting', '会议', 'office'],
        keywords: ['商务', '会议', '办公', '企业'],
        source: 'preset',
        industry: '商务'
      },
      {
        id: 'preset-business-002',
        name: '商务场景',
        title: '商务场景',
        url: '/materials-test/business/unsplash_qW_k6x5OfRc.jpg',
        thumbnail: '/materials-test/business/unsplash_qW_k6x5OfRc.jpg',
        tags: ['商务', 'business', 'professional', '专业'],
        keywords: ['商务', '专业', '职场', '工作'],
        source: 'preset',
        industry: '商务'
      },
      {
        id: 'preset-education-001',
        name: '教育学习',
        title: '教育学习',
        url: '/materials-test/education/unsplash_lUaaKCUANVI.jpg',
        thumbnail: '/materials-test/education/unsplash_lUaaKCUANVI.jpg',
        tags: ['教育', 'education', 'learning', '学习', 'study'],
        keywords: ['教育', '学习', '培训', '课程'],
        source: 'preset',
        industry: '教育'
      },
      {
        id: 'preset-education-002',
        name: '教育场景',
        title: '教育场景',
        url: '/materials-test/education/pexels_301926.jpeg',
        thumbnail: '/materials-test/education/pexels_301926.jpeg',
        tags: ['教育', 'education', 'school', '学校'],
        keywords: ['教育', '学校', '教学', '知识'],
        source: 'preset',
        industry: '教育'
      },
      {
        id: 'preset-computer-001',
        name: '计算机设备',
        title: '计算机设备',
        url: '/materials-test/computer/unsplash_Bd7gNnWJBkU.jpg',
        thumbnail: '/materials-test/computer/unsplash_Bd7gNnWJBkU.jpg',
        tags: ['computer', 'technology', '电脑', '科技'],
        keywords: ['电脑', '计算机', '设备', '技术'],
        source: 'preset',
        industry: '科技'
      },
      {
        id: 'preset-computer-002',
        name: '计算机工作',
        title: '计算机工作',
        url: '/materials-test/computer/pexels_577585.jpeg',
        thumbnail: '/materials-test/computer/pexels_577585.jpeg',
        tags: ['computer', 'work', '电脑', '工作'],
        keywords: ['电脑', '工作', '编程', '开发'],
        source: 'preset',
        industry: '科技'
      }
    ]

    const queryLower = query.toLowerCase()
    const results = presetMaterials.filter(material => {
      // 匹配标签
      if (material.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
        return true
      }
      // 匹配关键词
      if (material.keywords.some(kw => kw.toLowerCase().includes(queryLower))) {
        return true
      }
      // 匹配名称
      if (material.name.toLowerCase().includes(queryLower)) {
        return true
      }
      return false
    })

    return {
      materials: results,
      total: results.length
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats() {
    try {
      // 获取智能缓存统计
      const cacheStats = await this.smartCache.getStats()

      // 获取离线支持统计
      const offlineStats = this.offlineSupport.getStats()

      // 获取服务统计
      const serviceStats = {
        totalSearches: this.stats.totalSearches,
        externalCalls: this.stats.externalCalls,
        externalCacheHits: this.stats.externalCacheHits,
        externalCached: this.stats.externalCached,
        cacheHits: this.stats.cacheHits,
        localHits: this.stats.localHits,
        chineseQueries: this.stats.chineseQueries,
        baiduCalls: this.stats.baiduCalls,
        dispatcherCalls: this.stats.dispatcherCalls,
        dispatcherCacheHits: this.stats.dispatcherCacheHits
      }

      return {
        smartCache: cacheStats,
        offlineSupport: offlineStats,
        service: serviceStats
      }
    } catch (error) {
      console.error('获取缓存统计失败:', error)
      return {
        smartCache: null,
        offlineSupport: null,
        service: this.stats
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

  // ==================== 精选素材配方库方法 ====================

  /**
   * 获取精选素材（使用配方）
   * @param {string} recipeId - 配方ID
   * @returns {Promise<Object>} 素材对象
   */
  async getCuratedMaterial(recipeId) {
    const recipe = findRecipe(recipeId)
    if (!recipe) {
      throw new Error(`配方不存在: ${recipeId}`)
    }

    console.log(`💎 获取精选素材: ${recipe.name}`)

    // 1. 先查SmartCache
    const cached = await this.smartCache.search(recipe.searchQuery, {
      limit: 1
    })

    if (cached.length > 0) {
      console.log(`💾 使用缓存的精选素材: ${recipe.name}`)
      return {
        ...cached[0],
        recipe: recipe,
        isCurated: true,
        source: 'cache'
      }
    }

    // 2. 使用配方从外部API获取
    console.log(`🔍 使用配方获取素材: ${recipe.name}`)
    const results = await this.searchMaterials(recipe.searchQuery, {
      limit: 5,
      platforms: recipe.platforms,
      filters: recipe.filters
    })

    if (results.materials.length === 0) {
      throw new Error(`未找到符合配方的素材: ${recipe.name}`)
    }

    // 3. 返回最佳匹配
    return {
      ...results.materials[0],
      recipe: recipe,
      isCurated: true,
      source: results.source
    }
  }

  /**
   * 获取推荐的精选素材
   * @param {Object} context - 上下文信息
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>} 精选素材数组
   */
  async getRecommendedCuratedMaterials(context, limit = 10) {
    console.log('💎 获取推荐的精选素材...')

    const recipes = getRecommendedRecipes(context)
    const materials = []

    for (const recipe of recipes.slice(0, limit)) {
      try {
        const material = await this.getCuratedMaterial(recipe.id)
        materials.push(material)
      } catch (error) {
        console.warn(`获取精选素材失败: ${recipe.name}`, error)
      }
    }

    console.log(`✅ 获取到 ${materials.length} 个精选素材`)
    return materials
  }

  /**
   * 浏览精选素材库
   * @param {string|null} category - 类别名称（可选）
   * @returns {Array} 配方数组
   */
  browseCuratedLibrary(category = null) {
    if (category) {
      const allRecipes = getAllRecipes()
      return allRecipes[category] || []
    }

    // 返回所有配方
    const allRecipes = getAllRecipes()
    const result = []
    for (const [cat, recipes] of Object.entries(allRecipes)) {
      result.push(...recipes.map(r => ({ ...r, category: cat })))
    }

    return result
  }

  /**
   * 搜索精选配方
   * @param {string} keyword - 搜索关键词
   * @returns {Array} 匹配的配方数组
   */
  searchCuratedRecipes(keyword) {
    return searchRecipesByKeyword(keyword)
  }

  /**
   * 按标签搜索配方
   * @param {Array<string>} tags - 标签数组
   * @returns {Array} 匹配的配方数组
   */
  searchRecipesByTags(tags) {
    return searchRecipes(tags)
  }

  /**
   * 获取配方库统计信息
   * @returns {Object} 统计信息
   */
  getCuratedLibraryStats() {
    return getRecipeStats()
  }

  /**
   * 批量获取精选素材（按配方ID列表）
   * @param {Array<string>} recipeIds - 配方ID数组
   * @returns {Promise<Array>} 素材数组
   */
  async getCuratedMaterialsBatch(recipeIds) {
    console.log(`💎 批量获取 ${recipeIds.length} 个精选素材...`)

    const materials = []
    for (const recipeId of recipeIds) {
      try {
        const material = await this.getCuratedMaterial(recipeId)
        materials.push(material)
      } catch (error) {
        console.warn(`获取精选素材失败: ${recipeId}`, error)
      }
    }

    console.log(`✅ 成功获取 ${materials.length}/${recipeIds.length} 个精选素材`)
    return materials
  }
}

// 导出单例实例
export default new MaterialService()
