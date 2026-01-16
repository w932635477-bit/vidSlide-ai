/**
 * 智能缓存系统
 *
 * 功能：
 * - LRU缓存淘汰策略
 * - 缓存大小限制（1000个素材元数据）
 * - 缓存过期时间（7天）
 * - 自动清理机制
 * - 缓存统计
 */

class SmartCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000 // 最大缓存数量
    this.ttl = options.ttl || 7 * 24 * 60 * 60 * 1000 // 7天过期时间
    this.dbName = 'VidSlideAI_MaterialCache'
    this.storeName = 'materials'
    this.db = null
    this.isInitialized = false

    // 统计信息
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalCached: 0,
      lastCleanup: null
    }
  }

  /**
   * 初始化IndexedDB
   */
  async initialize() {
    if (this.isInitialized) {
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => {
        console.error('❌ SmartCache初始化失败:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        this.isInitialized = true
        console.log('✅ SmartCache初始化成功')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // 创建对象存储
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' })

          // 创建索引
          objectStore.createIndex('query', 'query', { unique: false })
          objectStore.createIndex('cachedAt', 'cachedAt', { unique: false })
          objectStore.createIndex('lastAccessed', 'lastAccessed', { unique: false })
          objectStore.createIndex('accessCount', 'accessCount', { unique: false })

          console.log('📦 创建SmartCache对象存储')
        }
      }
    })
  }

  /**
   * 添加单个素材到缓存
   * @param {Object} material - 素材对象
   * @param {string} query - 搜索关键词
   */
  async add(material, query) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // 检查缓存大小，如果超过限制则清理
      const currentSize = await this.getSize()
      if (currentSize >= this.maxSize) {
        await this.evictLRU()
      }

      const cacheItem = {
        ...material,
        id: material.id || `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        query,
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 0,
        source: 'external_cache'
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      await objectStore.put(cacheItem)

      this.stats.totalCached++

      return cacheItem
    } catch (error) {
      console.error('缓存添加失败:', error)
      throw error
    }
  }

  /**
   * 批量添加素材到缓存
   * @param {Array} materials - 素材数组
   * @param {string} query - 搜索关键词
   */
  async addBatch(materials, query) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // 检查缓存大小
      const currentSize = await this.getSize()
      const needToEvict = Math.max(0, currentSize + materials.length - this.maxSize)

      if (needToEvict > 0) {
        await this.evictLRU(needToEvict)
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)

      const promises = materials.map(material => {
        const cacheItem = {
          ...material,
          id: material.id || `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          query,
          cachedAt: Date.now(),
          lastAccessed: Date.now(),
          accessCount: 0,
          source: 'external_cache'
        }

        return objectStore.put(cacheItem)
      })

      await Promise.all(promises)

      this.stats.totalCached += materials.length

      console.log(`💾 批量缓存 ${materials.length} 个素材`)

      return materials.length
    } catch (error) {
      console.error('批量缓存失败:', error)
      throw error
    }
  }

  /**
   * 根据关键词搜索缓存
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   */
  async search(query, options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const { limit = 20 } = options

      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const index = objectStore.index('query')

      // 搜索匹配的素材
      const request = index.getAll(query)

      return new Promise((resolve, reject) => {
        request.onsuccess = async () => {
          let results = request.result || []

          // 过滤过期的缓存
          const now = Date.now()
          results = results.filter(item => {
            const age = now - item.cachedAt
            return age < this.ttl
          })

          // 更新访问信息
          for (const item of results) {
            item.lastAccessed = now
            item.accessCount = (item.accessCount || 0) + 1
            await objectStore.put(item)
          }

          // 按访问次数排序
          results.sort((a, b) => b.accessCount - a.accessCount)

          if (results.length > 0) {
            this.stats.hits++
          } else {
            this.stats.misses++
          }

          resolve(results.slice(0, limit))
        }

        request.onerror = () => {
          this.stats.misses++
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('缓存搜索失败:', error)
      this.stats.misses++
      return []
    }
  }

  /**
   * 获取所有缓存素材
   * @param {Object} options - 选项
   */
  async getAll(options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const { limit = 100 } = options

      const transaction = this.db.transaction([this.storeName], 'readonly')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.getAll()

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const results = request.result || []

          // 过滤过期的缓存
          const now = Date.now()
          const validResults = results.filter(item => {
            const age = now - item.cachedAt
            return age < this.ttl
          })

          resolve(validResults.slice(0, limit))
        }

        request.onerror = () => {
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('获取所有缓存失败:', error)
      return []
    }
  }

  /**
   * LRU淘汰策略 - 移除最少使用的缓存
   * @param {number} count - 要淘汰的数量
   */
  async evictLRU(count = 1) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const index = objectStore.index('lastAccessed')

      // 获取所有缓存项，按最后访问时间排序
      const request = index.openCursor()
      const toDelete = []

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result

          if (cursor && toDelete.length < count) {
            toDelete.push(cursor.primaryKey)
            cursor.continue()
          } else {
            // 删除选中的项
            const deletePromises = toDelete.map(key => objectStore.delete(key))

            Promise.all(deletePromises).then(() => {
              this.stats.evictions += toDelete.length
              console.log(`🗑️ LRU淘汰 ${toDelete.length} 个缓存项`)
              resolve(toDelete.length)
            })
          }
        }

        request.onerror = () => {
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('LRU淘汰失败:', error)
      return 0
    }
  }

  /**
   * 清理过期缓存
   */
  async cleanupExpired() {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.openCursor()

      const now = Date.now()
      let deletedCount = 0

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result

          if (cursor) {
            const item = cursor.value
            const age = now - item.cachedAt

            if (age >= this.ttl) {
              cursor.delete()
              deletedCount++
            }

            cursor.continue()
          } else {
            this.stats.lastCleanup = now
            console.log(`🧹 清理 ${deletedCount} 个过期缓存`)
            resolve(deletedCount)
          }
        }

        request.onerror = () => {
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('清理过期缓存失败:', error)
      return 0
    }
  }

  /**
   * 获取缓存大小
   */
  async getSize() {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.count()

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = () => {
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('获取缓存大小失败:', error)
      return 0
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats() {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const size = await this.getSize()
      const hitRate = this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
        : 0

      // 估算缓存占用空间（每个素材元数据约2KB）
      const estimatedSize = size * 2 // KB
      const sizeFormatted = estimatedSize > 1024
        ? `${(estimatedSize / 1024).toFixed(2)} MB`
        : `${estimatedSize} KB`

      return {
        size,
        maxSize: this.maxSize,
        usage: ((size / this.maxSize) * 100).toFixed(2) + '%',
        estimatedSize: sizeFormatted,
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: hitRate + '%',
        evictions: this.stats.evictions,
        totalCached: this.stats.totalCached,
        lastCleanup: this.stats.lastCleanup
          ? new Date(this.stats.lastCleanup).toLocaleString()
          : '从未清理',
        ttl: `${this.ttl / (24 * 60 * 60 * 1000)} 天`
      }
    } catch (error) {
      console.error('获取缓存统计失败:', error)
      return null
    }
  }

  /**
   * 清空所有缓存
   */
  async clear() {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const objectStore = transaction.objectStore(this.storeName)
      const request = objectStore.clear()

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('🗑️ 已清空所有缓存')
          resolve()
        }

        request.onerror = () => {
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('清空缓存失败:', error)
      throw error
    }
  }

  /**
   * 自动清理任务（定期执行）
   */
  async autoCleanup() {
    try {
      // 清理过期缓存
      await this.cleanupExpired()

      // 如果缓存超过90%，执行LRU淘汰
      const size = await this.getSize()
      if (size > this.maxSize * 0.9) {
        const toEvict = Math.floor(this.maxSize * 0.1) // 淘汰10%
        await this.evictLRU(toEvict)
      }

      console.log('✅ 自动清理完成')
    } catch (error) {
      console.error('自动清理失败:', error)
    }
  }

  /**
   * 启动自动清理定时器（每小时执行一次）
   */
  startAutoCleanup() {
    // 每小时执行一次自动清理
    setInterval(() => {
      this.autoCleanup()
    }, 60 * 60 * 1000)

    console.log('⏰ 自动清理定时器已启动（每小时执行一次）')
  }
}

// 导出单例实例
export default new SmartCache({
  maxSize: 1000,
  ttl: 7 * 24 * 60 * 60 * 1000 // 7天
})
