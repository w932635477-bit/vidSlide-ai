/**
 * VidSlide AI 素材服务统一入口（重构版）
 * 实现本地优先 + 按需外部获取的零成本策略
 *
 * 架构说明：
 * - MaterialService: 核心服务，协调各个子服务
 * - LocalSearchService: 本地素材搜索
 * - ExternalSearchService: 外部API搜索
 * - CacheService: 缓存管理
 * - MatchingService: 智能匹配
 * - QualityEvaluator: 质量评估
 * - CuratedService: 精选素材
 * - StatsService: 统计服务
 * - materialConverters: 工具函数
 */

import LocalSearchService from './LocalSearchService.js'
import ExternalSearchService from './ExternalSearchService.js'
import CacheService from './CacheService.js'
import MatchingService from './MatchingService.js'
import QualityEvaluator from './QualityEvaluator.js'
import CuratedService from './CuratedService.js'
import StatsService from './StatsService.js'
import OfflineSupport from './OfflineSupport.js'

class MaterialService {
  constructor() {
    // 子服务实例
    this.localSearch = LocalSearchService
    this.externalSearch = ExternalSearchService
    this.cache = CacheService
    this.matching = MatchingService
    this.quality = QualityEvaluator
    this.curated = CuratedService
    this.stats = StatsService
    this.offlineSupport = OfflineSupport

    this.isInitialized = false
  }

  /**
   * 初始化服务
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('🚀 初始化VidSlide AI素材服务...')

      // 初始化各个子服务
      await this.localSearch.initialize()
      await this.externalSearch.initialize()
      await this.cache.initialize()

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
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async searchMaterials(query, options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    this.stats.recordSearch()

    const { limit = 20, context = {}, forceLocal = false } = options

    console.log(`🔍 素材搜索: "${query}", 策略: ${forceLocal ? '仅本地' : '外部优先'}`)

    // 步骤1: 智能调度器决策
    const dispatchDecision = await this.externalSearch.getDispatchDecision(query, options)

    // 步骤2: 外部优先搜索（检查网络状态）
    if (!forceLocal && this.offlineSupport.canUseExternalAPI()) {
      try {
        console.log('🌐 优先使用外部API搜索...')

        const externalResults = await this.externalSearch.searchExternalMaterials(query, {
          ...options,
          platforms: dispatchDecision.platforms,
          translation: dispatchDecision.translation,
          limit
        })

        if (externalResults.images && externalResults.images.length > 0) {
          console.log(`✅ 外部搜索成功: ${externalResults.images.length} 个素材`)
          this.stats.recordExternalCall()

          // 缓存外部结果到本地
          await this.cache.cacheExternalResults(externalResults, query, options)

          // CLIP智能排序（可选）
          let finalMaterials = externalResults.images
          if (options.enableSmartMatching !== false) {
            try {
              finalMaterials = await this.matching.smartMatchMaterials(
                query,
                externalResults.images,
                context
              )
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
    const localResults = await this.localSearch.searchLocalMaterials(query, {
      ...options,
      limit
    })

    if (localResults.materials.length > 0) {
      console.log(`✅ 本地缓存命中: ${localResults.materials.length} 个素材`)
      this.stats.recordCacheHit(localResults.materials.length)

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
    const presetResults = await this.localSearch.searchPresetMaterials(query, { limit })

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
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async searchLocalMaterials(query, options = {}) {
    return await this.localSearch.searchLocalMaterials(query, options)
  }

  /**
   * 搜索外部素材
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async searchExternalMaterials(query, options = {}) {
    return await this.externalSearch.searchExternalMaterials(query, options)
  }

  /**
   * 使用CLIP进行智能素材匹配
   * @param {string} query - 查询关键词
   * @param {Array} availableMaterials - 可用素材数组
   * @param {Object} contentAnalysis - 内容分析结果
   * @returns {Promise<Array>} 智能排序的素材
   */
  async smartMatchMaterials(query, availableMaterials, contentAnalysis = {}) {
    return await this.matching.smartMatchMaterials(query, availableMaterials, contentAnalysis)
  }

  /**
   * 计算本地素材匹配度
   * @param {string|Array} keywords - 关键词
   * @returns {Promise<Object>} 匹配度评估结果
   */
  async calculateLocalMatchRate(keywords) {
    return await this.matching.calculateLocalMatchRate(
      keywords,
      this.localSearch.searchLocalMaterials.bind(this.localSearch)
    )
  }

  /**
   * 记录素材使用
   * @param {string} materialId - 素材ID
   */
  async recordMaterialUsage(materialId) {
    await this.localSearch.recordMaterialUsage(materialId)
  }

  /**
   * 获取热门素材
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>} 热门素材数组
   */
  async getPopularMaterials(limit = 10) {
    return await this.localSearch.getPopularMaterials(limit)
  }

  /**
   * 获取最近使用的素材
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>} 最近素材数组
   */
  async getRecentMaterials(limit = 10) {
    return await this.localSearch.getRecentMaterials(limit)
  }

  /**
   * 获取个性化推荐
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>} 推荐素材数组
   */
  async getPersonalizedRecommendations(limit = 10) {
    if (!this.isInitialized) {
      await this.initialize()
    }
    return await this.localSearch.getPersonalizedRecommendations(limit)
  }

  /**
   * 获取用户洞察
   * @returns {Promise<Object>} 用户洞察数据
   */
  async getUserInsights() {
    if (!this.isInitialized) {
      await this.initialize()
    }
    return await this.localSearch.getUserInsights()
  }

  /**
   * 获取渐进式加载状态
   * @returns {Object} 加载状态
   */
  getProgressiveLoadingState() {
    return this.localSearch.getProgressiveLoadingState()
  }

  /**
   * 强制加载指定素材包
   * @param {string} packId - 素材包ID
   * @returns {Promise<boolean>} 是否成功
   */
  async forceLoadMaterialPack(packId) {
    return await this.localSearch.forceLoadMaterialPack(packId)
  }

  /**
   * 获取服务统计
   * @returns {Object} 统计信息
   */
  getServiceStats() {
    const localStats = this.localSearch.getStats()
    const externalStats = this.externalSearch.getStats()
    const cacheStats = this.cache.getStats()
    const matchingStats = this.matching.getStats()
    const curatedStats = this.curated.getStats()

    return this.stats.getServiceStats(
      localStats,
      externalStats,
      cacheStats,
      matchingStats,
      curatedStats
    )
  }

  /**
   * 获取缓存统计信息
   * @returns {Promise<Object>} 缓存统计
   */
  async getCacheStats() {
    try {
      const cacheStats = await this.cache.getStats()
      const offlineStats = this.offlineSupport.getStats()
      const serviceStats = this.stats.getRawStats()

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
        service: this.stats.getRawStats()
      }
    }
  }

  /**
   * 清理缓存和优化
   */
  async optimize() {
    try {
      await this.cache.optimize()
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
    return await this.curated.getCuratedMaterial(recipeId, this.searchMaterials.bind(this))
  }

  /**
   * 获取推荐的精选素材
   * @param {Object} context - 上下文信息
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>} 精选素材数组
   */
  async getRecommendedCuratedMaterials(context, limit = 10) {
    return await this.curated.getRecommendedCuratedMaterials(
      context,
      limit,
      this.searchMaterials.bind(this)
    )
  }

  /**
   * 浏览精选素材库
   * @param {string|null} category - 类别名称（可选）
   * @returns {Array} 配方数组
   */
  browseCuratedLibrary(category = null) {
    return this.curated.browseCuratedLibrary(category)
  }

  /**
   * 搜索精选配方
   * @param {string} keyword - 搜索关键词
   * @returns {Array} 匹配的配方数组
   */
  searchCuratedRecipes(keyword) {
    return this.curated.searchCuratedRecipes(keyword)
  }

  /**
   * 按标签搜索配方
   * @param {Array<string>} tags - 标签数组
   * @returns {Array} 匹配的配方数组
   */
  searchRecipesByTags(tags) {
    return this.curated.searchRecipesByTags(tags)
  }

  /**
   * 获取配方库统计信息
   * @returns {Object} 统计信息
   */
  getCuratedLibraryStats() {
    return this.curated.getCuratedLibraryStats()
  }

  /**
   * 批量获取精选素材（按配方ID列表）
   * @param {Array<string>} recipeIds - 配方ID数组
   * @returns {Promise<Array>} 素材数组
   */
  async getCuratedMaterialsBatch(recipeIds) {
    return await this.curated.getCuratedMaterialsBatch(recipeIds, this.searchMaterials.bind(this))
  }

  /**
   * 设置行为监听（保持向后兼容）
   */
  setupBehaviorListeners() {
    // 监听搜索行为
    const originalSearchMaterials = this.searchMaterials.bind(this)
    this.searchMaterials = async (query, options = {}) => {
      const result = await originalSearchMaterials(query, options)

      // 通知本地素材库搜索行为
      if (this.localSearch.localLibrary.searchBehaviorObserver) {
        this.localSearch.localLibrary.searchBehaviorObserver(query, result.materials || [])
      }

      return result
    }

    // 监听素材使用行为
    const originalRecordUsage = this.localSearch.localLibrary.recordUsage.bind(
      this.localSearch.localLibrary
    )
    this.localSearch.localLibrary.recordUsage = async materialId => {
      await originalRecordUsage(materialId)

      // 通知行为观察器
      if (this.localSearch.localLibrary.usageBehaviorObserver) {
        this.localSearch.localLibrary.usageBehaviorObserver(materialId)
      }
    }
  }
}

// 导出单例实例
export default new MaterialService()
