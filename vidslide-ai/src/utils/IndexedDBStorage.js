/**
 * VidSlide AI - IndexedDB 本地存储管理器
 * 负责素材的本地存储、检索和管理
 */

/**
 * IndexedDB本地存储管理器
 * 提供完整的本地素材库存储、检索和管理功能
 * 支持素材元数据、搜索索引、批量操作等高级特性
 */
export class IndexedDBStorage {
  /**
   * 创建IndexedDB存储实例
   * @param {string} dbName - 数据库名称 (默认: 'VidSlideAssets')
   * @param {number} version - 数据库版本号 (默认: 1)
   */
  constructor(dbName = 'VidSlideAssets', version = 1) {
    this.dbName = dbName
    this.version = version
    this.db = null
    this.isInitialized = false
  }

  /**
   * 初始化IndexedDB数据库连接
   * 创建必要的对象存储和索引结构
   * 如果数据库不存在会自动创建，如果版本更新会自动升级
   * @returns {Promise<void>} 数据库初始化完成
   * @throws {Error} 当数据库初始化失败时抛出错误
   */
  async /**
   * initialize 方法
   * VidSlide AI 功能实现
   */
  initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error('IndexedDB 初始化失败:', request.error)
        reject(new Error('无法初始化本地存储'))
      }

      request.onsuccess = () => {
        this.db = request.result
        this.isInitialized = true
        console.log('IndexedDB 初始化成功')
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = event.target.result

        // 创建素材存储对象
        if (!db.objectStoreNames.contains('assets')) {
          const assetStore = db.createObjectStore('assets', { keyPath: 'id' })
          assetStore.createIndex('type', 'type', { unique: false })
          assetStore.createIndex('category', 'category', { unique: false })
          assetStore.createIndex('tags', 'tags', { unique: false })
          assetStore.createIndex('createdAt', 'createdAt', { unique: false })
          assetStore.createIndex('lastUsed', 'lastUsed', { unique: false })
        }

        // 创建素材元数据存储对象
        if (!db.objectStoreNames.contains('assetMetadata')) {
          const metadataStore = db.createObjectStore('assetMetadata', { keyPath: 'assetId' })
          metadataStore.createIndex('copyrightStatus', 'copyrightStatus', { unique: false })
          metadataStore.createIndex('license', 'license', { unique: false })
          metadataStore.createIndex('source', 'source', { unique: false })
        }

        // 创建用户收藏存储对象
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'assetId' })
        }

        // 创建下载记录存储对象
        if (!db.objectStoreNames.contains('downloads')) {
          const downloadStore = db.createObjectStore('downloads', {
            keyPath: 'id',
            autoIncrement: true
          })
          downloadStore.createIndex('assetId', 'assetId', { unique: false })
          downloadStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        console.log('IndexedDB 数据库结构创建完成')
      }
    })
  }

  /**
   * 存储素材到本地IndexedDB库
   * 自动生成唯一ID，设置时间戳，同步存储元数据
   * 支持事务性操作，确保数据一致性
   * @param {Object} asset - 素材数据对象
   * @param {string} asset.name - 素材名称
   * @param {string} asset.type - 素材类型 ('image'/'video'/'audio')
   * @param {string} asset.url - 素材URL或base64数据
   * @param {string} asset.category - 素材分类
   * @param {Array} asset.tags - 标签数组
   * @param {Object} asset.metadata - 版权和来源元数据
   * @returns {Promise<string>} 生成的素材唯一ID
   * @throws {Error} 当存储失败或素材已存在时抛出错误
   */
  /**
   * storeAsset 方法
   * VidSlide AI 功能实现
   */
  async storeAsset(asset) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['assets', 'assetMetadata'], 'readwrite')
      const assetStore = transaction.objectStore('assets')
      const metadataStore = transaction.objectStore('assetMetadata')

      // 生成素材ID
      const assetId = asset.id || `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 准备素材数据
      const assetData = {
        id: assetId,
        ...asset,
        createdAt: asset.createdAt || new Date().toISOString(),
        lastUsed: asset.lastUsed || new Date().toISOString(),
        localPath: asset.localPath || null,
        fileSize: asset.fileSize || 0,
        isDownloaded: asset.isDownloaded || false
      }

      // 存储素材
      // 执行素材存储操作
      const assetRequest = assetStore.add(assetData)

      // 素材存储成功处理
      assetRequest.onsuccess = () => {
        // 存储元数据
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if (asset.metadata) {
          const metadataData = {
            assetId,
            ...asset.metadata,
            lastUpdated: new Date().toISOString()
          }

          const metadataRequest = metadataStore.add(metadataData)
          metadataRequest.onerror = () => {
            console.warn('元数据存储失败:', metadataRequest.error)
          }
        }

        resolve(assetId)
      }

      assetRequest.onerror = () => {
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if (assetRequest.error.name === 'ConstraintError') {
          reject(new Error('素材已存在'))
        } else {
          reject(new Error('存储素材失败: ' + assetRequest.error.message))
        }
      }

      transaction.oncomplete = () => {
        console.log('素材存储完成:', assetId)
      }
    })
  }

  /**
   * 获取素材
   * @param {string} assetId - 素材ID
   * @returns {Promise<Object>} 素材数据
   */
  /**
   * getAsset 方法
   * VidSlide AI 功能实现
   */
  async getAsset(assetId) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['assets'], 'readonly')
      const store = transaction.objectStore('assets')
      const request = store.get(assetId)

      request.onsuccess = () => {
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if (request.result) {
          // 更新最后使用时间
          this.updateLastUsed(assetId).catch(console.warn)
          resolve(request.result)
        } else {
          reject(new Error('素材不存在'))
        }
      }

      // 处理查询错误
      request.onerror = () => {
        reject(new Error('获取素材失败: ' + request.error.message))
      }
    })
  }

  /**
   * 更新素材最后使用时间
   * @param {string} assetId - 素材ID
   * @returns {Promise<void>}
   */
  /**
   * updateLastUsed 方法
   * VidSlide AI 功能实现
   */
  async updateLastUsed(assetId) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['assets'], 'readwrite')
      const store = transaction.objectStore('assets')
      const request = store.get(assetId)

      request.onsuccess = () => {
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if (request.result) {
          const asset = request.result
          asset.lastUsed = new Date().toISOString()

          const updateRequest = store.put(asset)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve() // 素材不存在，静默处理
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 搜索素材
   * @param {Object} filters - 搜索条件
   * @param {Object} options - 搜索选项
   * @returns {Promise<Array>} 素材列表
   */
  /**
   * searchAssets 方法
   * VidSlide AI 功能实现
   */
  async searchAssets(filters = {}, options = {}) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['assets'], 'readonly')
      const store = transaction.objectStore('assets')
      const request = store.openCursor()
      const results = []

      request.onsuccess = event => {
        const cursor = event.target.result
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if (cursor) {
          const asset = cursor.value

          // 应用搜索过滤器
          if (this.matchesFilters(asset, filters)) {
            results.push(asset)
          }

          cursor.continue()
        } else {
          // 应用排序和分页
          const sortedResults = this.applySorting(results, options.sortBy, options.sortOrder)
          const paginatedResults = this.applyPagination(
            sortedResults,
            options.offset,
            options.limit
          )

          resolve(paginatedResults)
        }
      }

      request.onerror = () => {
        reject(new Error('搜索素材失败: ' + request.error.message))
      }
    })
  }

  /**
   * 检查素材是否匹配过滤条件
   * @param {Object} asset - 素材对象
   * @param {Object} filters - 过滤条件
   * @returns {boolean}
   */
  /**

   * matchesFilters 方法

   * VidSlide AI 功能实现

   */

  matchesFilters(asset, filters) {
    // 类型过滤
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (filters.type && asset.type !== filters.type) {
      return false
    }

    // 分类过滤
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (filters.category && asset.category !== filters.category) {
      return false
    }

    // 标签过滤
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (filters.tags && filters.tags.length > 0) {
      const assetTags = asset.tags || []
      const hasMatchingTag = filters.tags.some(tag =>
        assetTags.some(assetTag => assetTag.toLowerCase().includes(tag.toLowerCase()))
      )
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if (!hasMatchingTag) {
        return false
      }
    }

    // 关键词搜索
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      const searchableText = [asset.name, asset.description, asset.category, ...(asset.tags || [])]
        .join(' ')
        .toLowerCase()

      if (!searchableText.includes(keyword)) {
        return false
      }
    }

    // 下载状态过滤
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (filters.isDownloaded !== undefined && asset.isDownloaded !== filters.isDownloaded) {
      return false
    }

    return true
  }

  /**
   * 应用排序
   * @param {Array} assets - 素材数组
   * @param {string} sortBy - 排序字段
   * @param {string} sortOrder - 排序顺序
   * @returns {Array}
   */
  /**

   * applySorting 方法

   * VidSlide AI 功能实现

   */

  applySorting(assets, sortBy = 'lastUsed', sortOrder = 'desc') {
    return assets.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      // 处理日期字段
      if (sortBy.includes('At') || sortBy.includes('Used')) {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      /**


       * if 方法


       * VidSlide AI 功能实现


       */

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1
      }
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  /**
   * 应用分页
   * @param {Array} assets - 素材数组
   * @param {number} offset - 偏移量
   * @param {number} limit - 限制数量
   * @returns {Array}
   */
  /**

   * applyPagination 方法

   * VidSlide AI 功能实现

   */

  applyPagination(assets, offset = 0, limit = 50) {
    return assets.slice(offset, offset + limit)
  }

  /**
   * 删除素材
   * @param {string} assetId - 素材ID
   * @returns {Promise<void>}
   */
  /**
   * deleteAsset 方法
   * VidSlide AI 功能实现
   */
  async deleteAsset(assetId) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['assets', 'assetMetadata', 'favorites'], 'readwrite')

      // 删除素材
      const assetStore = transaction.objectStore('assets')
      const assetRequest = assetStore.delete(assetId)

      // 删除元数据
      const metadataStore = transaction.objectStore('assetMetadata')
      const metadataRequest = metadataStore.delete(assetId)

      // 删除收藏记录
      const favoriteStore = transaction.objectStore('favorites')
      const favoriteRequest = favoriteStore.delete(assetId)

      assetRequest.onsuccess = () => {
        console.log('素材删除成功:', assetId)
        resolve()
      }

      assetRequest.onerror = () => {
        reject(new Error('删除素材失败: ' + assetRequest.error.message))
      }

      transaction.oncomplete = () => {
        console.log('素材及其相关数据删除完成')
      }
    })
  }

  /**
   * 获取存储统计信息
   * @returns {Promise<Object>} 统计信息
   */
  /**
   * getStorageStats 方法
   * VidSlide AI 功能实现
   */
  async getStorageStats() {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['assets'], 'readonly')
      const store = transaction.objectStore('assets')
      const request = store.openCursor()
      const stats = {
        totalAssets: 0,
        totalSize: 0,
        downloadedAssets: 0,
        assetTypes: {},
        categories: {}
      }

      request.onsuccess = event => {
        const cursor = event.target.result
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if (cursor) {
          const asset = cursor.value

          stats.totalAssets++
          stats.totalSize += asset.fileSize || 0

          /**


           * if 方法


           * VidSlide AI 功能实现


           */

          if (asset.isDownloaded) {
            stats.downloadedAssets++
          }

          // 统计类型分布
          stats.assetTypes[asset.type] = (stats.assetTypes[asset.type] || 0) + 1

          // 统计分类分布
          /**

           * if 方法

           * VidSlide AI 功能实现

           */

          if (asset.category) {
            stats.categories[asset.category] = (stats.categories[asset.category] || 0) + 1
          }

          cursor.continue()
        } else {
          resolve(stats)
        }
      }

      request.onerror = () => {
        reject(new Error('获取统计信息失败: ' + request.error.message))
      }
    })
  }

  /**
   * 清理过期素材
   * @param {number} daysOld - 删除多少天前的未使用素材
   * @returns {Promise<number>} 删除的素材数量
   */
  /**
   * cleanupOldAssets 方法
   * VidSlide AI 功能实现
   */
  async cleanupOldAssets(daysOld = 90) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['assets'], 'readwrite')
      const store = transaction.objectStore('assets')
      const request = store.openCursor()
      let deletedCount = 0

      request.onsuccess = event => {
        const cursor = event.target.result
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if (cursor) {
          const asset = cursor.value
          const lastUsed = new Date(asset.lastUsed)

          /**


           * if 方法


           * VidSlide AI 功能实现


           */

          if (lastUsed < cutoffDate && !asset.isFavorite) {
            cursor.delete()
            deletedCount++
          }

          cursor.continue()
        } else {
          resolve(deletedCount)
        }
      }

      request.onerror = () => {
        reject(new Error('清理过期素材失败: ' + request.error.message))
      }
    })
  }

  /**
   * 导出素材数据
   * @returns {Promise<string>} JSON字符串
   */
  async /**
   * exportData 方法
   * VidSlide AI 功能实现
   */
  async exportData() {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.isInitialized) {
      await this.initialize()
    }

    const [assets, metadata] = await Promise.all([
      this.searchAssets({}, { limit: 10000 }), // 获取所有素材
      this.getAllMetadata()
    ])

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      assets,
      metadata
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 导入素材数据
   * @param {string} jsonData - JSON字符串
   * @returns {Promise<number>} 导入的素材数量
   */
  /**
   * importData 方法
   * VidSlide AI 功能实现
   */
  async importData(jsonData) {
    const importData = JSON.parse(jsonData)

    if (!importData.assets || !Array.isArray(importData.assets)) {
      throw new Error('无效的导入数据格式')
    }

    let importedCount = 0
    /**

     * for 方法

     * VidSlide AI 功能实现

     */

    for (const asset of importData.assets) {
      try {
        await this.storeAsset(asset)
        importedCount++
      } catch (error) {
        /**
         * catch 方法
         * VidSlide AI 功能实现
         */
        console.warn('导入素材失败:', asset.id, error)
      }
    }

    return importedCount
  }

  /**
   * 获取所有元数据（内部方法）
   * @returns {Promise<Array>}
   */
  async /**
   * getAllMetadata 方法
   * VidSlide AI 功能实现
   */
  getAllMetadata() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['assetMetadata'], 'readonly')
      const store = transaction.objectStore('assetMetadata')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error('获取元数据失败: ' + request.error.message))
      }
    })
  }

  /**
   * 关闭数据库连接
   */
  /**

   * close 方法

   * VidSlide AI 功能实现

   */

  close() {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (this.db) {
      this.db.close()
      this.db = null
      this.isInitialized = false
    }
  }

  /**
   * 删除整个数据库
   * @returns {Promise<void>}
   */
  async /**
   * deleteDatabase 方法
   * VidSlide AI 功能实现
   */
  deleteDatabase() {
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(this.dbName)

      deleteRequest.onsuccess = () => {
        console.log('数据库删除成功')
        this.db = null
        this.isInitialized = false
        resolve()
      }

      deleteRequest.onerror = () => {
        reject(new Error('删除数据库失败: ' + deleteRequest.error.message))
      }
    })
  }
}

export default IndexedDBStorage
