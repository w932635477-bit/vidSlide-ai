/**
 * 统计服务
 * 负责收集和管理所有素材服务的统计数据
 */

class StatsService {
  constructor() {
    this.stats = {
      totalSearches: 0,
      localHits: 0,
      externalCalls: 0,
      externalCacheHits: 0,
      externalCached: 0,
      cacheHits: 0,
      chineseQueries: 0,
      baiduCalls: 0,
      dispatcherCalls: 0,
      dispatcherCacheHits: 0
    }
  }

  /**
   * 记录搜索
   */
  recordSearch() {
    this.stats.totalSearches++
  }

  /**
   * 记录本地命中
   * @param {number} count - 命中数量
   */
  recordLocalHit(count = 1) {
    this.stats.localHits += count
  }

  /**
   * 记录外部调用
   */
  recordExternalCall() {
    this.stats.externalCalls++
  }

  /**
   * 记录外部缓存命中
   */
  recordExternalCacheHit() {
    this.stats.externalCacheHits++
  }

  /**
   * 记录外部缓存
   * @param {number} count - 缓存数量
   */
  recordExternalCached(count = 1) {
    this.stats.externalCached += count
  }

  /**
   * 记录缓存命中
   * @param {number} count - 命中数量
   */
  recordCacheHit(count = 1) {
    this.stats.cacheHits += count
  }

  /**
   * 记录中文查询
   */
  recordChineseQuery() {
    this.stats.chineseQueries++
  }

  /**
   * 记录百度调用
   */
  recordBaiduCall() {
    this.stats.baiduCalls++
  }

  /**
   * 记录调度器调用
   */
  recordDispatcherCall() {
    this.stats.dispatcherCalls++
  }

  /**
   * 记录调度器缓存命中
   */
  recordDispatcherCacheHit() {
    this.stats.dispatcherCacheHits++
  }

  /**
   * 获取综合统计信息
   * @param {Object} localStats - 本地搜索统计
   * @param {Object} externalStats - 外部搜索统计
   * @param {Object} cacheStats - 缓存统计
   * @param {Object} matchingStats - 匹配统计
   * @param {Object} curatedStats - 精选统计
   * @returns {Object} 综合统计信息
   */
  getServiceStats(localStats, externalStats, cacheStats, matchingStats, curatedStats) {
    return {
      overall: {
        totalSearches: this.stats.totalSearches,
        localHitRate: this.stats.totalSearches > 0 ? this.stats.localHits / this.stats.totalSearches : 0,
        externalCallRate: this.stats.totalSearches > 0 ? this.stats.externalCalls / this.stats.totalSearches : 0,
        cacheHitRate: this.stats.totalSearches > 0 ? this.stats.cacheHits / this.stats.totalSearches : 0,
        dispatcherCallRate: this.stats.totalSearches > 0 ? this.stats.dispatcherCalls / this.stats.totalSearches : 0,
        dispatcherCacheHitRate: this.stats.dispatcherCalls > 0 ? this.stats.dispatcherCacheHits / this.stats.dispatcherCalls : 0,
        avgLocalHitsPerSearch: this.stats.totalSearches > 0 ? this.stats.localHits / this.stats.totalSearches : 0
      },
      local: localStats,
      external: externalStats,
      cache: cacheStats,
      matching: matchingStats,
      curated: curatedStats,
      raw: this.stats
    }
  }

  /**
   * 获取原始统计数据
   * @returns {Object} 原始统计数据
   */
  getRawStats() {
    return { ...this.stats }
  }

  /**
   * 重置统计数据
   */
  reset() {
    this.stats = {
      totalSearches: 0,
      localHits: 0,
      externalCalls: 0,
      externalCacheHits: 0,
      externalCached: 0,
      cacheHits: 0,
      chineseQueries: 0,
      baiduCalls: 0,
      dispatcherCalls: 0,
      dispatcherCacheHits: 0
    }
  }

  /**
   * 导出统计数据
   * @returns {string} JSON格式的统计数据
   */
  exportStats() {
    return JSON.stringify(this.stats, null, 2)
  }

  /**
   * 导入统计数据
   * @param {string} jsonData - JSON格式的统计数据
   */
  importStats(jsonData) {
    try {
      const imported = JSON.parse(jsonData)
      this.stats = { ...this.stats, ...imported }
    } catch (error) {
      console.error('导入统计数据失败:', error)
    }
  }

  /**
   * 获取性能指标
   * @returns {Object} 性能指标
   */
  getPerformanceMetrics() {
    const total = this.stats.totalSearches

    return {
      efficiency: {
        localHitRate: total > 0 ? this.stats.localHits / total : 0,
        cacheHitRate: total > 0 ? this.stats.cacheHits / total : 0,
        externalCallRate: total > 0 ? this.stats.externalCalls / total : 0
      },
      quality: {
        dispatcherCacheHitRate: this.stats.dispatcherCalls > 0 ? this.stats.dispatcherCacheHits / this.stats.dispatcherCalls : 0,
        externalCacheHitRate: this.stats.externalCalls > 0 ? this.stats.externalCacheHits / this.stats.externalCalls : 0
      },
      usage: {
        totalSearches: this.stats.totalSearches,
        chineseQueryRate: total > 0 ? this.stats.chineseQueries / total : 0,
        baiduUsageRate: this.stats.externalCalls > 0 ? this.stats.baiduCalls / this.stats.externalCalls : 0
      }
    }
  }
}

// 导出单例实例
export default new StatsService()
