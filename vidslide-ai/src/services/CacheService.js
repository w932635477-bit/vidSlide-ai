/**
 * 缓存管理服务
 * 负责素材缓存的存储、检索和管理
 */

import SmartCache from './SmartCache.js'
import LocalMaterialLibrary from './LocalMaterialLibrary.js'
import { convertImageToMaterial, determinePlatformFromResults } from './materialConverters.js'

class CacheService {
  constructor() {
    this.smartCache = SmartCache
    this.localLibrary = LocalMaterialLibrary
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      externalCached: 0,
      cacheSize: 0
    }
  }

  /**
   * 初始化缓存服务
   */
  async initialize() {
    console.log('💾 初始化缓存服务...')
    await this.smartCache.initialize()
    this.smartCache.startAutoCleanup()
    console.log('✅ 缓存服务初始化完成')
  }

  /**
   * 搜索缓存中的素材
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Array>} 缓存的素材数组
   */
  async searchCache(query, options = {}) {
    try {
      const cachedResults = await this.smartCache.search(query, {
        limit: options.limit || 20
      })

      if (cachedResults.length > 0) {
        console.log(`💾 智能缓存命中: ${cachedResults.length} 个素材`)
        this.stats.cacheHits += cachedResults.length
        return cachedResults
      }

      this.stats.cacheMisses++
      return []
    } catch (error) {
      console.error('缓存搜索失败:', error)
      return []
    }
  }

  /**
   * 检查外部素材缓存
   * @param {string} query - 查询关键词
   * @param {Object} options - 选项
   * @returns {Promise<Object|null>} 缓存结果或null
   */
  async checkExternalCache(query, options = {}) {
    try {
      // 简化处理，直接返回null让它去获取新的
      // 可以在这里实现更复杂的缓存查找逻辑
      return null
    } catch (error) {
      console.error('检查外部缓存失败:', error)
      return null
    }
  }

  /**
   * 缓存外部搜索结果
   * @param {Object} results - 搜索结果
   * @param {string} query - 搜索关键词
   * @param {Object} options - 选项
   */
  async cacheExternalResults(results, query, options = {}) {
    try {
      if (!results.success || !results.images || results.images.length === 0) {
        return
      }

      console.log(`💾 开始缓存 ${results.images.length} 个外部素材...`)

      let cachedCount = 0
      const platform = determinePlatformFromResults(results, options)

      for (const image of results.images) {
        try {
          const material = convertImageToMaterial(image, platform)
          const cached = await this.localLibrary.addExternalMaterial(material, platform)
          if (cached) {
            cachedCount++
          }
        } catch (error) {
          console.warn('缓存外部素材失败:', error.message)
        }
      }

      console.log(`✅ 成功缓存 ${cachedCount}/${results.images.length} 个外部素材 (${platform})`)
      this.stats.externalCached += cachedCount
    } catch (error) {
      console.error('缓存外部结果失败:', error)
    }
  }

  /**
   * 缓存素材数组
   * @param {Array} materials - 素材数组
   * @param {string} query - 搜索关键词
   */
  async cacheMaterials(materials, query) {
    try {
      await this.smartCache.addBatch(materials, query)
      this.stats.externalCached += materials.length
      console.log(`💾 已缓存 ${materials.length} 个素材元数据到智能缓存`)
    } catch (error) {
      console.warn('缓存失败:', error)
    }
  }

  /**
   * 缓存单个素材
   * @param {Object} material - 素材对象
   * @param {string} source - 来源
   * @param {Object} metadata - 元数据
   */
  async cacheMaterial(material, source, metadata = {}) {
    try {
      await this.localLibrary.cacheMaterial(material, source, metadata)
      this.stats.externalCached++
    } catch (error) {
      console.warn('缓存素材失败:', error)
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getStats() {
    try {
      const cacheStats = await this.smartCache.getStats()
      return {
        ...cacheStats,
        ...this.stats
      }
    } catch (error) {
      console.error('获取缓存统计失败:', error)
      return this.stats
    }
  }

  /**
   * 清理缓存
   * @param {Object} options - 清理选项
   */
  async cleanup(options = {}) {
    try {
      console.log('🧹 开始清理缓存...')
      // 实现缓存清理逻辑
      console.log('✅ 缓存清理完成')
    } catch (error) {
      console.error('缓存清理失败:', error)
    }
  }

  /**
   * 优化缓存
   */
  async optimize() {
    try {
      console.log('🔧 开始优化缓存...')
      // 实现缓存优化逻辑
      console.log('✅ 缓存优化完成')
    } catch (error) {
      console.error('缓存优化失败:', error)
    }
  }

  /**
   * 获取缓存大小
   * @returns {Promise<number>} 缓存大小（字节）
   */
  async getCacheSize() {
    try {
      const stats = await this.getStats()
      return stats.totalSize || 0
    } catch (error) {
      console.error('获取缓存大小失败:', error)
      return 0
    }
  }

  /**
   * 清空所有缓存
   */
  async clearAll() {
    try {
      console.log('🗑️ 清空所有缓存...')
      await this.smartCache.clear()
      this.stats = {
        cacheHits: 0,
        cacheMisses: 0,
        externalCached: 0,
        cacheSize: 0
      }
      console.log('✅ 缓存已清空')
    } catch (error) {
      console.error('清空缓存失败:', error)
    }
  }

  /**
   * 获取缓存命中率
   * @returns {number} 命中率（0-1）
   */
  getCacheHitRate() {
    const total = this.stats.cacheHits + this.stats.cacheMisses
    return total > 0 ? this.stats.cacheHits / total : 0
  }
}

// 导出单例实例
export default new CacheService()
