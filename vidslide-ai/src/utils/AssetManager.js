/**
 * VidSlide AI - 资产管理器
 * 统一管理本地素材库、外部API和版权检查
 */

import IndexedDBStorage from './IndexedDBStorage.js'
import ExternalAPI from './ExternalAPI.js'
import CopyrightChecker from './CopyrightChecker.js'

/**
 * 资产管理器主类
 * 统一管理本地素材库、外部API集成和版权检查功能
 * 提供完整的事件驱动架构，支持素材的搜索、下载、管理等操作
 */
export class AssetManager {
  /**
   * 创建资产管理器实例
   * 初始化所有子模块但不立即连接数据库
   * 包含性能优化：懒加载、缓存、内存管理
   */
  constructor() {
    this.storage = new IndexedDBStorage()
    this.externalAPI = new ExternalAPI()
    this.copyrightChecker = new CopyrightChecker()

    this.isInitialized = false
    this.eventListeners = new Map()

    // 性能优化属性
    this.assetCache = new Map() // LRU缓存
    this.cacheMaxSize = 50 // 最大缓存数量
    this.loadingPromises = new Map() // 避免重复加载
    this.blobUrls = new Set() // 跟踪blob URLs用于清理
    this.performanceStats = {
      cacheHits: 0,
      cacheMisses: 0,
      loadTime: [],
      memoryUsage: 0
    }
  }

  /**
   * 初始化资产管理器
   * 连接IndexedDB数据库，设置事件监听器
   * 必须在执行任何其他操作前调用此方法
   * @returns {Promise<void>} 初始化完成后的Promise
   * @throws {Error} 当数据库初始化失败时抛出错误
   */
  /**
   * initialize 方法
   * VidSlide AI 功能实现
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      const startTime = performance.now()

      // 初始化本地存储
      await this.storage.initialize()
      console.log('本地存储初始化成功')

      // 初始化性能监控
      this.startPerformanceMonitoring()

      const initTime = performance.now() - startTime
      console.log(`AssetManager初始化完成，耗时: ${initTime.toFixed(2)}ms`)

      // 触发初始化完成事件
      this.emit('initialized', {})

      this.isInitialized = true
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.error('资产管理器初始化失败:', error)
      throw new Error('无法初始化素材管理系统')
    }
  }

  /**
   * 性能监控启动
   */
  /**

   * startPerformanceMonitoring 方法

   * VidSlide AI 功能实现

   */

  startPerformanceMonitoring() {
    // 定期清理过期缓存
    setInterval(() => {
      this.cleanupExpiredCache()
    }, 30000) // 30秒清理一次

    // 内存使用监控
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = performance.memory
        this.performanceStats.memoryUsage = memInfo.usedJSHeapSize
      }, 5000)
    }
  }

  /**
   * LRU缓存清理
   */
  /**

   * cleanupExpiredCache 方法

   * VidSlide AI 功能实现

   */

  cleanupExpiredCache() {
    if (this.assetCache.size <= this.cacheMaxSize) return

    // 清理最旧的缓存项
    const entries = Array.from(this.assetCache.entries())
    const toRemove = entries.slice(0, this.assetCache.size - this.cacheMaxSize)

    /**


     * for 方法


     * VidSlide AI 功能实现


     */

    for (const [key, cachedAsset] of toRemove) {
      this.assetCache.delete(key)

      // 清理blob URL
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if (cachedAsset.blobUrl) {
        URL.revokeObjectURL(cachedAsset.blobUrl)
        this.blobUrls.delete(cachedAsset.blobUrl)
      }
    }
  }

  /**
   * 获取缓存的素材（性能优化）
   */
  /**

   * getCachedAsset 方法

   * VidSlide AI 功能实现

   */

  getCachedAsset(assetId) {
    const cached = this.assetCache.get(assetId)
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (cached) {
      this.performanceStats.cacheHits++
      // 更新访问时间（LRU）
      cached.lastAccess = Date.now()
      return cached
    }
    this.performanceStats.cacheMisses++
    return null
  }

  /**
   * 设置缓存素材
   */
  /**

   * setCachedAsset 方法

   * VidSlide AI 功能实现

   */

  setCachedAsset(assetId, assetData) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (this.assetCache.size >= this.cacheMaxSize) {
      this.cleanupExpiredCache()
    }

    assetData.lastAccess = Date.now()
    this.assetCache.set(assetId, assetData)

    // 跟踪blob URL
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (assetData.blobUrl) {
      this.blobUrls.add(assetData.blobUrl)
    }
  }

  /**
   * 获取性能统计
   */
  /**

   * getPerformanceStats 方法

   * VidSlide AI 功能实现

   */

  getPerformanceStats() {
    const cacheHitRate =
      (this.performanceStats.cacheHits /
        (this.performanceStats.cacheHits + this.performanceStats.cacheMisses)) *
      100

    return {
      ...this.performanceStats,
      cacheHitRate: cacheHitRate.toFixed(1) + '%',
      cacheSize: this.assetCache.size,
      activeBlobUrls: this.blobUrls.size,
      averageLoadTime:
        this.performanceStats.loadTime.length > 0
          ? (
            this.performanceStats.loadTime.reduce((a, b) => a + b, 0) /
              this.performanceStats.loadTime.length
          ).toFixed(2) + 'ms'
          : 'N/A'
    }
  }

  /**
   * 内存清理
   */
  /**

   * cleanupMemory 方法

   * VidSlide AI 功能实现

   */

  cleanupMemory() {
    // 清理所有blob URLs
    /**

     * for 方法

     * VidSlide AI 功能实现

     */

    for (const url of this.blobUrls) {
      URL.revokeObjectURL(url)
    }
    this.blobUrls.clear()

    // 清空缓存
    this.assetCache.clear()

    // 清空加载Promise
    this.loadingPromises.clear()

    console.log('AssetManager内存已清理')
  }

  /**
   * 配置外部API访问密钥
   * 设置Unsplash或Pexels API的访问凭据
   * 配置后才能使用相应的外部素材搜索功能
   * @param {string} apiName - API名称 ('unsplash' | 'pexels')
   * @param {string} accessKey - API访问密钥
   * @throws {Error} 当API名称不支持时抛出错误
   */
  /**

   * configureAPI 方法

   * VidSlide AI 功能实现

   */

  configureAPI(apiName, accessKey) {
    this.externalAPI.configureAPI(apiName, accessKey)
    this.emit('apiConfigured', { apiName })
  }

  /**
   * 搜索素材资源
   * 同时在本地存储和外部API中搜索素材
   * 支持关键词搜索、分类过滤、类型过滤等高级功能
   * @param {string} query - 搜索关键词，支持模糊匹配
   * @param {Object} options - 搜索选项配置对象
   * @param {boolean} options.includeLocal - 是否搜索本地素材库 (默认: true)
   * @param {boolean} options.includeExternal - 是否搜索外部API (默认: true)
   * @param {number} options.limit - 结果数量限制 (默认: 20)
   * @param {string} options.type - 素材类型过滤 ('image' | 'video' | 'audio')
   * @param {string} options.category - 分类过滤
   * @param {string} options.color - 颜色过滤 (Unsplash特有)
   * @param {string} options.orientation - 方向过滤 (landscape/portrait/squarish)
   * @returns {Promise<Object>} 搜索结果对象
   * @returns {Array} results.local - 本地素材结果数组
   * @returns {Array} results.external - 外部API素材结果数组
   * @returns {number} results.total - 总结果数量
   * @throws {Error} 当搜索过程中发生错误时抛出
   */
  /**
   * searchAssets 方法
   * VidSlide AI 功能实现
   */
  async searchAssets(query, options = {}) {
    const searchStartTime = performance.now()

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    // 生成缓存键
    const cacheKey = `${query}-${JSON.stringify(options)}`
    const cachedResult = this.getCachedAsset(cacheKey)
    if (cachedResult && Date.now() - cachedResult.lastAccess < 300000) {
      // 5分钟缓存
      return cachedResult.data
    }

    // 解析搜索选项参数
    const {
      includeLocal = true, // 是否包含本地素材
      includeExternal = true, // 是否包含外部素材
      limit = 20, // 结果数量限制
      type = null, // 素材类型过滤
      category = null // 分类过滤
    } = options

    // 初始化搜索结果对象
    const results = {
      local: [], // 本地素材搜索结果
      external: [], // 外部API搜索结果
      total: 0 // 总结果数量
    }

    try {
      // 搜索本地素材库
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if (includeLocal) {
        const localFilters = { keyword: query }
        if (type) localFilters.type = type
        if (category) localFilters.category = category

        results.local = await this.storage.searchAssets(localFilters, { limit })
      }

      // 搜索外部API
      if (includeExternal && query.trim()) {
        const externalOptions = {
          limit: limit - results.local.length,
          type,
          color: options.color,
          orientation: options.orientation
        }

        results.external = await this.externalAPI.searchAssets(query, externalOptions)
      }

      // 为外部素材添加版权信息
      // 遍历所有外部素材，为每个素材执行版权检查
      /**

       * for 方法

       * VidSlide AI 功能实现

       */

      for (const asset of results.external) {
        try {
          // 调用版权检查器进行检查
          const copyrightInfo = await this.copyrightChecker.checkCopyright(asset)
          // 将版权信息添加到素材对象中
          asset.copyrightInfo = copyrightInfo
        } catch (error) {
          /**
           * catch 方法
           * VidSlide AI 功能实现
           */
          // 处理版权检查失败的情况
          console.warn(`获取素材 ${asset.id} 版权信息失败:`, error)
          // 设置默认的版权信息
          asset.copyrightInfo = {
            status: 'unknown', // 未知状态
            isSafe: false, // 不安全
            warnings: ['版权检查失败'] // 警告信息
          }
        }
      }

      results.total = results.local.length + results.external.length

      // 触发搜索完成事件
      // 缓存搜索结果
      this.setCachedAsset(cacheKey, { data: results })

      // 记录性能统计
      const searchTime = performance.now() - searchStartTime
      this.performanceStats.loadTime.push(searchTime)

      this.emit('searchCompleted', { query, options, results })

      return results
    } catch (error) {
      console.error('素材搜索失败:', error)
      throw new Error('搜索素材时发生错误，请重试')
    }
  }

  /**
   * 获取热门推荐素材
   * 从外部API获取当前热门的免费素材
   * 自动进行版权检查并添加到结果中
   * 适用于用户浏览和发现新素材的场景
   * @param {Object} options - 获取配置选项
   * @param {number} options.limit - 获取数量限制 (默认: 20)
   * @param {boolean} options.includeCopyright - 是否包含版权信息 (默认: true)
   * @returns {Promise<Array>} 热门素材对象数组
   * @returns {string} asset[].id - 素材唯一标识符
   * @returns {string} asset[].name - 素材名称
   * @returns {string} asset[].source - 来源平台 ('unsplash'/'pexels')
   * @returns {Object} asset[].copyrightInfo - 版权状态信息
   * @fires AssetManager#popularAssetsLoaded - 热门素材加载完成时触发
   * @throws {Error} 当API不可用或网络错误时抛出
   */
  async /**
   * getPopularAssets 方法
   * VidSlide AI 功能实现
   */
  async getPopularAssets(options = {}) {
    const { limit = 20, includeCopyright = true } = options

    try {
      const assets = await this.externalAPI.getPopularAssets({ limit })

      /**


       * if 方法


       * VidSlide AI 功能实现


       */

      if (includeCopyright) {
        // 批量检查版权
        const copyrightResults = await this.copyrightChecker.checkCopyrightBatch(assets)

        // 将版权信息添加到素材中
        /**

         * for 方法

         * VidSlide AI 功能实现

         */

        for (let i = 0; i < assets.length; i++) {
          assets[i].copyrightInfo = copyrightResults[i]
        }
      }

      this.emit('popularAssetsLoaded', { assets, options })

      return assets
    } catch (error) {
      console.error('获取热门素材失败:', error)
      throw new Error('获取热门素材失败，请检查网络连接')
    }
  }

  /**
   * 下载并存储素材到本地库
   * 从外部API下载素材文件，进行版权检查，然后存储到本地IndexedDB
   * 支持进度回调和错误处理
   * @param {Object} asset - 要下载的素材对象 (来自searchAssets的结果)
   * @param {Object} options - 下载选项配置
   * @param {boolean} options.checkCopyright - 是否进行版权检查 (默认: true)
   * @param {boolean} options.addToLibrary - 是否添加到本地库 (默认: true)
   * @returns {Promise<Object>} 下载完成的素材对象
   * @returns {string} result.id - 本地存储的素材ID
   * @returns {string} result.localPath - 本地文件blob URL
   * @returns {Object} result.copyrightValidation - 版权验证结果
   * @fires AssetManager#downloadStarted - 下载开始时触发
   * @fires AssetManager#downloadCompleted - 下载完成时触发
   * @fires AssetManager#downloadFailed - 下载失败时触发
   * @throws {Error} 当版权检查失败或下载失败时抛出
   */
  /**
   * downloadAsset 方法
   * VidSlide AI 功能实现
   */
  async downloadAsset(asset, options = {}) {
    // 解析下载选项
    const {
      checkCopyright = true, // 是否检查版权
      addToLibrary = true // 是否添加到本地库
    } = options

    try {
      // 第一步：版权检查（可选）
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if (checkCopyright) {
        const copyrightValidation = await this.copyrightChecker.validateAssetUsage(asset)

        /**


         * if 方法


         * VidSlide AI 功能实现


         */

        if (!copyrightValidation.canUse) {
          throw new Error(`版权检查失败: ${copyrightValidation.issues.join(', ')}`)
        }

        asset.copyrightValidation = copyrightValidation
      }

      // 第二步：触发下载开始事件
      this.emit('downloadStarted', { asset, options })

      // 第三步：执行实际下载操作
      const blob = await this.externalAPI.downloadAsset(asset)
      const fileSize = blob.size

      // 创建本地文件引用
      const localUrl = URL.createObjectURL(blob)

      // 准备存储数据
      const assetData = {
        ...asset,
        localPath: localUrl,
        fileSize,
        isDownloaded: true,
        downloadedAt: new Date().toISOString(),
        blob // 保存blob引用以便后续使用
      }

      // 添加到本地库
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if (addToLibrary) {
        const assetId = await this.storage.storeAsset(assetData)
        assetData.id = assetId
      }

      // 触发下载完成事件
      this.emit('downloadCompleted', { asset: assetData, options })

      return assetData
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.error('下载素材失败:', error)

      // 触发下载失败事件
      this.emit('downloadFailed', { asset, error, options })

      throw error
    }
  }

  /**
   * 获取本地素材
   * @param {string} assetId - 素材ID
   * @returns {Promise<Object>} 素材数据
   */
  /**
   * getLocalAsset 方法
   * VidSlide AI 功能实现
   */
  async getLocalAsset(assetId) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const asset = await this.storage.getAsset(assetId)

      // 触发素材访问事件
      this.emit('assetAccessed', { asset })

      return asset
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.error('获取本地素材失败:', error)
      throw new Error('获取素材失败，请检查素材是否存在')
    }
  }

  /**
   * 删除本地素材
   * @param {string} assetId - 素材ID
   * @returns {Promise<void>}
   */
  async /**
   * deleteLocalAsset 方法
   * VidSlide AI 功能实现
   */
  async deleteLocalAsset(assetId) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // 获取素材信息以便清理
      const asset = await this.storage.getAsset(assetId)

      // 清理本地URL
      if (asset.localPath && asset.localPath.startsWith('blob:')) {
        URL.revokeObjectURL(asset.localPath)
      }

      // 删除存储记录
      await this.storage.deleteAsset(assetId)

      // 触发删除事件
      this.emit('assetDeleted', { assetId, asset })
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.error('删除素材失败:', error)
      throw new Error('删除素材失败，请重试')
    }
  }

  /**
   * 获取素材库统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async /**
   * getLibraryStats 方法
   * VidSlide AI 功能实现
   */
  async getLibraryStats() {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const storageStats = await this.storage.getStorageStats()
      const apiStatus = this.externalAPI.getAPIStatus()

      const stats = {
        local: storageStats,
        external: apiStatus,
        copyright: {
          cacheSize: this.copyrightChecker.getCacheStats().size,
          supportedLicenses: this.copyrightChecker.getSupportedLicenses().length,
          safeLicenses: this.copyrightChecker.getSafeLicenses().length
        }
      }

      return stats
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.error('获取统计信息失败:', error)
      throw new Error('获取统计信息失败')
    }
  }

  /**
   * 清理过期素材
   * @param {number} daysOld - 删除多少天前的未使用素材
   * @returns {Promise<number>} 删除的素材数量
   */
  async /**
   * cleanupExpiredAssets 方法
   * VidSlide AI 功能实现
   */
  async cleanupExpiredAssets(daysOld = 90) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const deletedCount = await this.storage.cleanupOldAssets(daysOld)

      // 触发清理完成事件
      this.emit('cleanupCompleted', { deletedCount, daysOld })

      return deletedCount
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.error('清理过期素材失败:', error)
      throw new Error('清理过期素材失败')
    }
  }

  /**
   * 导出素材库数据
   * @returns {Promise<string>} JSON字符串
   */
  async /**
   * exportLibrary 方法
   * VidSlide AI 功能实现
   */
  async exportLibrary() {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const jsonData = await this.storage.exportData()

      // 触发导出事件
      this.emit('libraryExported', { dataSize: jsonData.length })

      return jsonData
    } catch (error) {
      console.error('导出素材库失败:', error)
      throw new Error('导出素材库失败')
    }
  }

  /**
   * 导入素材库数据
   * @param {string} jsonData - JSON字符串
   * @returns {Promise<number>} 导入的素材数量
   */
  async /**
   * importLibrary 方法
   * VidSlide AI 功能实现
   */
  async importLibrary(jsonData) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const importedCount = await this.storage.importData(jsonData)

      // 触发导入事件
      this.emit('libraryImported', { importedCount })

      return importedCount
    } catch (error) {
      console.error('导入素材库失败:', error)
      throw new Error('导入素材库失败，请检查数据格式')
    }
  }

  /**
   * 检查素材版权状态
   * @param {Object} asset - 素材对象
   * @returns {Promise<Object>} 版权检查结果
   */
  async /**
   * checkAssetCopyright 方法
   * VidSlide AI 功能实现
   */
  async checkAssetCopyright(asset) {
    return await this.copyrightChecker.checkCopyright(asset)
  }

  /**
   * 验证素材使用许可
   * @param {Object} asset - 素材对象
   * @param {string} intendedUse - 预期用途
   * @returns {Promise<Object>} 验证结果
   */
  async /**
   * validateAssetUsage 方法
   * VidSlide AI 功能实现
   */
  async validateAssetUsage(asset, intendedUse = 'commercial') {
    return await this.copyrightChecker.validateAssetUsage(asset, intendedUse)
  }

  /**
   * 获取支持的素材分类
   * @returns {Array} 分类列表
   */
  /**

   * getSupportedCategories 方法

   * VidSlide AI 功能实现

   */

  getSupportedCategories() {
    return this.externalAPI.getCategories()
  }

  /**
   * 获取支持的颜色过滤
   * @returns {Array} 颜色列表
   */
  /**

   * getSupportedColors 方法

   * VidSlide AI 功能实现

   */

  getSupportedColors() {
    return this.externalAPI.getSupportedColors()
  }

  /**
   * 获取API状态
   * @returns {Object} API状态
   */
  /**

   * getAPIStatus 方法

   * VidSlide AI 功能实现

   */

  getAPIStatus() {
    return this.externalAPI.getAPIStatus()
  }

  /**
   * 注册事件监听器
   * 允许外部组件监听资产管理器的事件
   * 支持多个监听器注册到同一事件
   * @param {string} event - 事件名称 ('downloadStarted', 'downloadCompleted', 'searchCompleted' 等)
   * @param {Function} callback - 事件触发时的回调函数
   * @example
   * assetManager.on('downloadCompleted', (data) => {
   *   console.log('下载完成:', data.asset.name);
   * });
   */
  /**

   * on 方法

   * VidSlide AI 功能实现

   */

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  /**

   * off 方法

   * VidSlide AI 功能实现

   */

  off(event, callback) {
    const listeners = this.eventListeners.get(event)
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (listeners) {
      const index = listeners.indexOf(callback)
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发指定事件
   * 通知所有注册的监听器执行相应的回调函数
   * 如果某个监听器执行出错，会记录错误但不中断其他监听器
   * @param {string} event - 要触发的事件名称
   * @param {Object} data - 传递给监听器回调函数的数据对象
   * @private
   */
  /**

   * emit 方法

   * VidSlide AI 功能实现

   */

  emit(event, data) {
    const listeners = this.eventListeners.get(event)
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          /**
           * catch 方法
           * VidSlide AI 功能实现
           */
          console.error(`事件 ${event} 的回调函数执行失败:`, error)
        }
      })
    }
  }

  /**
   * 清除所有缓存
   */
  /**

   * clearAllCaches 方法

   * VidSlide AI 功能实现

   */

  clearAllCaches() {
    this.externalAPI.clearCache()
    this.copyrightChecker.clearCache()
    console.log('所有缓存已清除')
  }

  /**
   * 销毁资产管理器
   */
  async /**
   * destroy 方法
   * VidSlide AI 功能实现
   */
  destroy() {
    try {
      // 关闭数据库连接
      this.storage.close()

      // 清除事件监听器
      this.eventListeners.clear()

      // 清除缓存
      this.clearAllCaches()

      this.isInitialized = false
      console.log('资产管理器已销毁')
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.error('销毁资产管理器失败:', error)
    }
  }

  /**
   * 获取资产管理器状态
   * @returns {Object} 状态信息
   */
  /**

   * getStatus 方法

   * VidSlide AI 功能实现

   */

  getStatus() {
    return {
      initialized: this.isInitialized,
      storage: this.storage.isInitialized,
      apis: this.getAPIStatus(),
      cache: {
        external: this.externalAPI.cache.size,
        copyright: this.copyrightChecker.getCacheStats().size
      },
      listeners: Array.from(this.eventListeners.keys())
    }
  }
}

// 创建全局单例实例
let assetManagerInstance = null

/**
 * getAssetManager 函数
 * VidSlide AI 功能实现
 * @description getAssetManager 功能的具体实现
 */
export async function getAssetManager() {
  /**

   * if 方法

   * VidSlide AI 功能实现

   */

  if (!assetManagerInstance) {
    assetManagerInstance = new AssetManager()
  }
  return assetManagerInstance
}

export default AssetManager
