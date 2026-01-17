/**
 * 本地搜索服务
 * 负责本地素材库和缓存的搜索
 */

import LocalMaterialLibrary from './LocalMaterialLibrary.js'
import CacheService from './CacheService.js'
import OfflineSupport from './OfflineSupport.js'

class LocalSearchService {
  constructor() {
    this.localLibrary = LocalMaterialLibrary
    this.cacheService = CacheService
    this.offlineSupport = OfflineSupport
    this.stats = {
      localHits: 0,
      cacheHits: 0,
      totalSearches: 0
    }
  }

  /**
   * 初始化本地搜索服务
   */
  async initialize() {
    console.log('📚 初始化本地搜索服务...')
    await this.localLibrary.initialize()
    console.log('✅ 本地搜索服务初始化完成')
  }

  /**
   * 搜索本地素材
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async searchLocalMaterials(query, options = {}) {
    try {
      this.stats.totalSearches++

      // 首先尝试智能缓存
      const cachedResults = await this.cacheService.searchCache(query, {
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
      return {
        materials: [],
        totalCount: 0,
        fromCache: false,
        breakdown: { preset: 0, cached: 0 }
      }
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
   * 获取热门素材
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>} 热门素材数组
   */
  async getPopularMaterials(limit = 10) {
    return await this.localLibrary.getPopularMaterials(limit)
  }

  /**
   * 获取最近使用的素材
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>} 最近素材数组
   */
  async getRecentMaterials(limit = 10) {
    return await this.localLibrary.getRecentMaterials(limit)
  }

  /**
   * 记录素材使用
   * @param {string} materialId - 素材ID
   */
  async recordMaterialUsage(materialId) {
    try {
      if (!materialId.startsWith('external-')) {
        await this.localLibrary.recordUsage(materialId)
      }
    } catch (error) {
      console.warn('记录素材使用失败:', error)
    }
  }

  /**
   * 获取个性化推荐
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>} 推荐素材数组
   */
  async getPersonalizedRecommendations(limit = 10) {
    return this.localLibrary.generatePersonalizedRecommendations(limit)
  }

  /**
   * 获取用户洞察
   * @returns {Promise<Object>} 用户洞察数据
   */
  async getUserInsights() {
    return this.localLibrary.getUserInsights()
  }

  /**
   * 获取渐进式加载状态
   * @returns {Object} 加载状态
   */
  getProgressiveLoadingState() {
    return this.localLibrary.getLoadingState()
  }

  /**
   * 强制加载指定素材包
   * @param {string} packId - 素材包ID
   * @returns {Promise<boolean>} 是否成功
   */
  async forceLoadMaterialPack(packId) {
    return this.localLibrary.forceLoadPack(packId)
  }

  /**
   * 获取本地搜索统计
   * @returns {Object} 统计信息
   */
  getStats() {
    const localStats = this.localLibrary.getStatistics()
    return {
      ...this.stats,
      library: localStats,
      hitRate: this.stats.totalSearches > 0 ? this.stats.localHits / this.stats.totalSearches : 0,
      cacheHitRate: this.stats.totalSearches > 0 ? this.stats.cacheHits / this.stats.totalSearches : 0
    }
  }
}

// 导出单例实例
export default new LocalSearchService()
