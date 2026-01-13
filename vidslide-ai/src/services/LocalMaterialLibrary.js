/**
 * VidSlide AI 本地素材库管理系统
 * 实现分层存储策略：本地预置 + 智能缓存 + 按需获取
 */
class LocalMaterialLibrary {
  constructor() {
    // 分层存储管理
    this.presetStore = new PresetMaterialStore() // 本地预置素材库
    this.cacheStore = new SmartCacheStore() // 智能缓存库
    this.runtimeStore = new RuntimeMaterialStore() // 运行时临时存储

    // 平台优先级（国内用户优化）
    this.platformPriority = {
      baidu: 10, // 百度图片 - 国内用户首选
      preset: 9, // 本地预置 - 最快访问
      pexels: 8, // Pexels - 高质量免费
      unsplash: 6, // Unsplash - 专业摄影
      pixabay: 4 // Pixabay - 矢量图丰富
    }

    // 初始化状态
    this.isInitialized = false
    this.stats = {
      presetMaterials: 0,
      cachedMaterials: 0,
      cacheSize: 0,
      totalAccess: 0,
      cacheHits: 0,
      lastCleanup: null,
      // 去重统计
      deduplicationStats: {
        urlDuplicates: 0,
        hashDuplicates: 0,
        titleDuplicates: 0,
        totalDuplicatesPrevented: 0
      }
    }

    // 去重索引
    this.deduplicationIndex = {
      urls: new Set(), // URL去重
      hashes: new Set(), // 内容哈希去重
      titles: new Set(), // 标题去重
      metadata: new Map() // 元数据索引
    }
  }

  /**
   * 初始化本地素材库
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('🏗️ 初始化VidSlide AI本地素材库...')

      // 初始化各层存储
      await Promise.all([
        this.presetStore.initialize(),
        this.cacheStore.initialize(),
        this.runtimeStore.initialize()
      ])

      // 加载统计信息
      await this.loadStats()

      // 启动定期清理任务
      this.startCleanupTimer()

      this.isInitialized = true
      console.log('✅ 本地素材库初始化完成')
      console.log(`📊 预置素材: ${this.stats.presetMaterials} 个`)
      console.log(
        `💾 缓存素材: ${this.stats.cachedMaterials} 个 (${this.formatBytes(this.stats.cacheSize)})`
      )
    } catch (error) {
      console.error('❌ 本地素材库初始化失败:', error)
      throw error
    }
  }

  /**
   * 智能搜索素材
   * 优先级：预置库 → 缓存库 → 按需获取
   */
  async searchMaterials(query, options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    this.stats.totalAccess++

    const results = {
      local: [],
      cached: [],
      total: 0
    }

    // 1. 搜索本地预置库（最快）
    const presetResults = await this.presetStore.search(query, options)
    if (presetResults.length > 0) {
      results.local = presetResults
      results.total += presetResults.length
      console.log(`🎯 本地预置库找到 ${presetResults.length} 个匹配素材`)
    }

    // 2. 搜索智能缓存库
    const cachedResults = await this.cacheStore.search(query, options)
    if (cachedResults.length > 0) {
      results.cached = cachedResults
      results.total += cachedResults.length
      this.stats.cacheHits++
      console.log(`💾 缓存库找到 ${cachedResults.length} 个匹配素材`)
    }

    return results
  }

  /**
   * 缓存外部获取的素材
   */
  async cacheMaterial(material, source, options = {}) {
    try {
      // 第一步：去重检查
      const deduplicationResult = await this.checkDeduplication(material, source, options)
      if (deduplicationResult.isDuplicate) {
        console.log(`🚫 跳过重复素材: ${material.id} (${deduplicationResult.reason})`)
        this.stats.deduplicationStats.totalDuplicatesPrevented++
        return false
      }

      // 第二步：评估是否值得缓存
      const shouldCache = await this.cacheStore.shouldCache(material, source, options)

      if (shouldCache) {
        await this.cacheStore.store(material, source)

        // 第三步：更新去重索引
        await this.updateDeduplicationIndex(material, source, options)

        // 更新统计
        this.stats.cachedMaterials++
        this.stats.cacheSize += this.cacheStore.estimateSize(material)

        console.log(`💾 已缓存素材: ${material.id} (来源: ${source})`)
        return true
      } else {
        console.log(`⏭️ 跳过缓存: ${material.id} (来源: ${source})`)
        return false
      }
    } catch (error) {
      console.warn('缓存素材失败:', error)
      return false
    }
  }

  /**
   * 检查素材是否重复
   */
  async checkDeduplication(material, source, options = {}) {
    try {
      // 1. URL去重检查（最简单有效）
      if (material.dataUrl || material.url) {
        const url = material.dataUrl || material.url
        if (this.deduplicationIndex.urls.has(url)) {
          this.stats.deduplicationStats.urlDuplicates++
          return { isDuplicate: true, reason: 'URL重复' }
        }
      }

      // 2. 标题去重检查（辅助去重）
      if (material.name || material.title) {
        const title = material.name || material.title
        if (this.deduplicationIndex.titles.has(title)) {
          this.stats.deduplicationStats.titleDuplicates++
          return { isDuplicate: true, reason: '标题重复' }
        }
      }

      // 3. 内容哈希去重检查（可选，需要计算哈希）
      if (options?.enableHashDeduplication && (material.dataUrl || material.url)) {
        const hash = await this.calculateContentHash(material)
        if (hash && this.deduplicationIndex.hashes.has(hash)) {
          this.stats.deduplicationStats.hashDuplicates++
          return { isDuplicate: true, reason: '内容重复' }
        }
      }

      // 4. 检查本地缓存中是否已存在
      const existingMaterial = await this.findExistingMaterial(material)
      if (existingMaterial) {
        return { isDuplicate: true, reason: '本地已存在' }
      }

      return { isDuplicate: false }
    } catch (error) {
      console.warn('去重检查失败:', error)
      // 去重检查失败时，允许缓存（宁可重复也不要遗漏）
      return { isDuplicate: false }
    }
  }

  /**
   * 更新去重索引
   */
  async updateDeduplicationIndex(material, source, options = {}) {
    try {
      // 1. 添加URL到去重索引
      if (material.dataUrl || material.url) {
        const url = material.dataUrl || material.url
        this.deduplicationIndex.urls.add(url)
      }

      // 2. 添加标题到去重索引
      if (material.name || material.title) {
        const title = material.name || material.title
        this.deduplicationIndex.titles.add(title)
      }

      // 3. 计算并添加内容哈希（可选）
      if (options?.enableHashDeduplication && (material.dataUrl || material.url)) {
        const hash = await this.calculateContentHash(material)
        if (hash) {
          this.deduplicationIndex.hashes.add(hash)
        }
      }

      // 4. 添加到元数据索引
      const metadataKey = `${source}_${material.id}`
      this.deduplicationIndex.metadata.set(metadataKey, {
        id: material.id,
        source,
        timestamp: Date.now(),
        url: material.dataUrl || material.url,
        title: material.name || material.title
      })
    } catch (error) {
      console.warn('更新去重索引失败:', error)
    }
  }

  /**
   * 计算内容哈希值
   */
  async calculateContentHash(material) {
    try {
      const url = material.dataUrl || material.url
      if (!url) return null

      // 对于Base64数据，直接计算
      if (url.startsWith('data:')) {
        const base64Data = url.split(',')[1]
        // 简单哈希计算（生产环境中可以使用更复杂的算法）
        let hash = 0
        for (let i = 0; i < base64Data.length; i++) {
          const char = base64Data.charCodeAt(i)
          hash = (hash << 5) - hash + char
          hash = hash & hash // 转换为32位整数
        }
        return Math.abs(hash).toString(36)
      }

      // 对于普通URL，可以考虑下载并计算哈希
      // 这里暂时返回null，避免网络请求
      return null
    } catch (error) {
      console.warn('计算内容哈希失败:', error)
      return null
    }
  }

  /**
   * 查找已存在的素材
   */
  async findExistingMaterial(material) {
    try {
      // 检查缓存存储中是否已存在相同ID的素材
      const existing = await this.cacheStore.findSimilar(material)
      return existing
    } catch (error) {
      console.warn('查找现有素材失败:', error)
      return null
    }
  }

  /**
   * 获取去重统计
   */
  getDeduplicationStats() {
    return {
      ...this.stats.deduplicationStats,
      deduplicationRate:
        this.stats.cachedMaterials > 0
          ? (
              (this.stats.deduplicationStats.totalDuplicatesPrevented /
                (this.stats.cachedMaterials +
                  this.stats.deduplicationStats.totalDuplicatesPrevented)) *
              100
            ).toFixed(2)
          : 0
    }
  }

  /**
   * 清理去重索引（内存优化）
   */
  cleanupDeduplicationIndex() {
    try {
      // 定期清理旧的元数据索引
      const now = Date.now()
      const maxAge = 24 * 60 * 60 * 1000 // 24小时

      for (const [key, metadata] of this.deduplicationIndex.metadata) {
        if (now - metadata.timestamp > maxAge) {
          this.deduplicationIndex.metadata.delete(key)
        }
      }

      console.log('🧹 去重索引清理完成')
    } catch (error) {
      console.warn('清理去重索引失败:', error)
    }
  }

  /**
   * 获取素材详情
   */
  async getMaterial(materialId, options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // 优先从预置库获取
    let material = await this.presetStore.get(materialId)
    if (material) {
      material.source = 'preset'
      return material
    }

    // 从缓存库获取
    material = await this.cacheStore.get(materialId)
    if (material) {
      material.source = 'cached'
      return material
    }

    return null
  }

  /**
   * 记录素材使用情况（用于智能缓存决策）
   */
  async recordUsage(materialId, action = 'view') {
    await this.cacheStore.recordUsage(materialId, action)
  }

  /**
   * 获取统计信息
   */
  async getStatistics() {
    const deduplicationStats = this.getDeduplicationStats()

    return {
      ...this.stats,
      cacheHitRate:
        this.stats.totalAccess > 0
          ? ((this.stats.cacheHits / this.stats.totalAccess) * 100).toFixed(1)
          : 0,
      deduplicationStats,
      storageBreakdown: {
        preset: await this.presetStore.getStats(),
        cached: await this.cacheStore.getStats(),
        runtime: await this.runtimeStore.getStats()
      },
      deduplicationIndex: {
        urls: this.deduplicationIndex.urls.size,
        hashes: this.deduplicationIndex.hashes.size,
        titles: this.deduplicationIndex.titles.size,
        metadata: this.deduplicationIndex.metadata.size
      }
    }
  }

  /**
   * 清理缓存
   */
  async cleanupCache(options = {}) {
    const { targetSize, force = false } = options

    console.log('🧹 开始缓存清理...')

    const cleanedCount = await this.cacheStore.cleanup(targetSize, force)

    // 更新统计
    await this.updateStats()

    console.log(`✅ 清理完成，释放了 ${cleanedCount} 个缓存项`)

    this.stats.lastCleanup = new Date().toISOString()
    await this.saveStats()

    return cleanedCount
  }

  /**
   * 启动定期清理定时器
   */
  startCleanupTimer() {
    // 每小时检查一次缓存大小
    setInterval(
      async () => {
        const stats = await this.getStatistics()
        const cacheSizeMB = stats.cacheSize / (1024 * 1024)

        // 如果缓存超过80%，触发清理
        if (cacheSizeMB > 400) {
          // 400MB
          console.log(`📏 缓存大小达到 ${cacheSizeMB.toFixed(1)}MB，触发自动清理`)
          await this.cleanupCache({ targetSize: 300 * 1024 * 1024 }) // 清理到300MB
        }
      },
      60 * 60 * 1000
    ) // 1小时
  }

  /**
   * 加载统计信息
   */
  async loadStats() {
    try {
      const statsStr = localStorage.getItem('vidslide_material_stats')
      if (statsStr) {
        this.stats = { ...this.stats, ...JSON.parse(statsStr) }
      }
    } catch (error) {
      console.warn('加载统计信息失败:', error)
    }
  }

  /**
   * 保存统计信息
   */
  async saveStats() {
    try {
      localStorage.setItem('vidslide_material_stats', JSON.stringify(this.stats))
    } catch (error) {
      console.warn('保存统计信息失败:', error)
    }
  }

  /**
   * 更新统计信息
   */
  async updateStats() {
    const presetStats = await this.presetStore.getStats()
    const cacheStats = await this.cacheStore.getStats()

    this.stats.presetMaterials = presetStats.count
    this.stats.cachedMaterials = cacheStats.count
    this.stats.cacheSize = cacheStats.size

    await this.saveStats()
  }

  /**
   * 格式化字节数
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
}

/**
 * 本地预置素材库
 * 存储少量高质量的预置素材，不占用太多空间
 */
class PresetMaterialStore {
  constructor() {
    this.dbName = 'VidSlidePresetMaterials'
    this.version = 1
    this.db = null
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = event => {
        this.db = event.target.result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = event.target.result

        // 预置素材存储
        if (!db.objectStoreNames.contains('materials')) {
          const store = db.createObjectStore('materials', { keyPath: 'id' })
          store.createIndex('category', 'category', { unique: false })
          store.createIndex('tags', 'tags', { unique: false })
        }

        // 分类索引
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' })
        }
      }
    })
  }

  async search(query, options = {}) {
    if (!this.db) await this.initialize()

    return new Promise(resolve => {
      const transaction = this.db.transaction(['materials'], 'readonly')
      const store = transaction.objectStore('materials')
      const results = []

      const request = store.openCursor()
      request.onsuccess = event => {
        const cursor = event.target.result
        if (cursor) {
          const material = cursor.value

          // 简单关键词匹配
          if (this.matchesQuery(material, query, options)) {
            results.push(material)
          }

          cursor.continue()
        } else {
          resolve(results)
        }
      }

      request.onerror = () => resolve([])
    })
  }

  matchesQuery(material, query, options) {
    const searchText = query.toLowerCase()

    // 匹配标题
    if (material.title && material.title.toLowerCase().includes(searchText)) {
      return true
    }

    // 匹配标签
    if (material.tags && material.tags.some(tag => tag.toLowerCase().includes(searchText))) {
      return true
    }

    // 匹配分类
    if (material.category && material.category.toLowerCase().includes(searchText)) {
      return true
    }

    return false
  }

  async get(materialId) {
    if (!this.db) await this.initialize()

    return new Promise(resolve => {
      const transaction = this.db.transaction(['materials'], 'readonly')
      const store = transaction.objectStore('materials')
      const request = store.get(materialId)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  }

  async getStats() {
    if (!this.db) await this.initialize()

    return new Promise(resolve => {
      const transaction = this.db.transaction(['materials'], 'readonly')
      const store = transaction.objectStore('materials')
      const countRequest = store.count()

      countRequest.onsuccess = () => {
        resolve({
          count: countRequest.result,
          size: 0 // 预置素材大小较小，暂时不计算
        })
      }

      countRequest.onerror = () => resolve({ count: 0, size: 0 })
    })
  }
}

/**
 * 智能缓存库
 * 实现LRU缓存策略，控制存储大小
 */
class SmartCacheStore {
  constructor() {
    this.maxCacheSize = 500 * 1024 * 1024 // 500MB
    this.currentCacheSize = 0
    this.dbName = 'VidSlideCachedMaterials'
    this.version = 1
    this.db = null

    // 缓存优先级
    this.priority = {
      baidu: 10,
      pexels: 8,
      unsplash: 6,
      pixabay: 4
    }
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = event => {
        this.db = event.target.result
        this.loadCacheSize()
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = event.target.result

        // 缓存素材存储
        if (!db.objectStoreNames.contains('materials')) {
          const store = db.createObjectStore('materials', { keyPath: 'id' })
          store.createIndex('source', 'source', { unique: false })
          store.createIndex('lastAccess', 'lastAccess', { unique: false })
          store.createIndex('usageCount', 'usageCount', { unique: false })
          store.createIndex('tags', 'tags', { unique: false })
        }

        // 使用统计
        if (!db.objectStoreNames.contains('usage')) {
          db.createObjectStore('usage', { keyPath: 'materialId' })
        }
      }
    })
  }

  async shouldCache(material, source, options = {}) {
    if (!this.db) await this.initialize()

    // 百度图片一律缓存
    if (source === 'baidu') {
      return true
    }

    // 检查缓存大小限制
    const materialSize = this.estimateSize(material)
    if (this.currentCacheSize + materialSize > this.maxCacheSize) {
      console.log(`⏭️ 缓存已满，跳过: ${material.id} (${source})`)
      return false
    }

    // 基于使用频率和优先级
    const priority = this.priority[source] || 1
    const usageCount = options.usageCount || 0

    const shouldCacheResult = priority >= 4 || usageCount > 3 // 临时降低阈值用于测试

    if (!shouldCacheResult) {
      console.log(
        `⏭️ 优先级不足，跳过: ${material.id} (${source}, 优先级: ${priority}, 使用次数: ${usageCount})`
      )
    }

    return shouldCacheResult
  }

  async store(material, source) {
    if (!this.db) await this.initialize()

    const materialSize = this.estimateSize(material)

    // 添加缓存元数据
    const cachedMaterial = {
      ...material,
      source,
      cachedAt: new Date().toISOString(),
      lastAccess: Date.now(),
      usageCount: 1,
      size: materialSize
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['materials'], 'readwrite')
      const store = transaction.objectStore('materials')
      const request = store.put(cachedMaterial)

      request.onsuccess = () => {
        this.currentCacheSize += materialSize
        resolve()
      }

      request.onerror = () => reject(request.error)
    })
  }

  async search(query, options = {}) {
    if (!this.db) await this.initialize()

    return new Promise(resolve => {
      const transaction = this.db.transaction(['materials'], 'readonly')
      const store = transaction.objectStore('materials')
      const results = []

      const request = store.openCursor()
      request.onsuccess = event => {
        const cursor = event.target.result
        if (cursor) {
          const material = cursor.value

          // 关键词匹配
          if (this.matchesQuery(material, query, options)) {
            results.push(material)
            // 更新访问时间
            this.recordAccess(material.id)
          }

          cursor.continue()
        } else {
          resolve(results)
        }
      }

      request.onerror = () => resolve([])
    })
  }

  async get(materialId) {
    if (!this.db) await this.initialize()

    return new Promise(resolve => {
      const transaction = this.db.transaction(['materials'], 'readonly')
      const store = transaction.objectStore('materials')
      const request = store.get(materialId)

      request.onsuccess = () => {
        const material = request.result
        if (material) {
          this.recordAccess(materialId)
        }
        resolve(material || null)
      }

      request.onerror = () => resolve(null)
    })
  }

  async findSimilar(material) {
    if (!this.db) await this.initialize()

    return new Promise(resolve => {
      const transaction = this.db.transaction(['materials'], 'readonly')
      const store = transaction.objectStore('materials')
      const similar = []

      const request = store.openCursor()
      request.onsuccess = event => {
        const cursor = event.target.result
        if (cursor) {
          const existing = cursor.value

          // 检查是否相似：相同的URL、标题或内容哈希
          const isSimilar =
            (material.url && existing.url === material.url) ||
            (material.dataUrl && existing.dataUrl === material.dataUrl) ||
            (material.title && existing.title === material.title) ||
            (material.contentHash && existing.contentHash === material.contentHash)

          if (isSimilar) {
            similar.push(existing)
          }

          cursor.continue()
        } else {
          // 返回第一个找到的相似素材（如果有的话）
          resolve(similar.length > 0 ? similar[0] : null)
        }
      }

      request.onerror = () => resolve(null)
    })
  }

  matchesQuery(material, query, options) {
    const searchText = query.toLowerCase()

    // 匹配标题
    if (material.title && material.title.toLowerCase().includes(searchText)) {
      return true
    }

    // 匹配标签
    if (material.tags && material.tags.some(tag => tag.toLowerCase().includes(searchText))) {
      return true
    }

    // 匹配描述
    if (material.description && material.description.toLowerCase().includes(searchText)) {
      return true
    }

    return false
  }

  async recordUsage(materialId, action = 'view') {
    if (!this.db) await this.initialize()

    return new Promise(resolve => {
      const transaction = this.db.transaction(['usage'], 'readwrite')
      const store = transaction.objectStore('usage')
      const request = store.get(materialId)

      request.onsuccess = () => {
        const usage = request.result || {
          materialId,
          views: 0,
          downloads: 0,
          lastAccess: Date.now()
        }

        // 更新使用统计
        usage[action + 's'] = (usage[action + 's'] || 0) + 1
        usage.lastAccess = Date.now()

        const putRequest = store.put(usage)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => resolve() // 不影响主要功能
      }

      request.onerror = () => resolve()
    })
  }

  recordAccess(materialId) {
    // 异步更新访问时间
    setTimeout(async () => {
      if (!this.db) return

      try {
        const transaction = this.db.transaction(['materials'], 'readwrite')
        const store = transaction.objectStore('materials')
        const request = store.get(materialId)

        request.onsuccess = () => {
          const material = request.result
          if (material) {
            material.lastAccess = Date.now()
            material.usageCount = (material.usageCount || 0) + 1
            store.put(material)
          }
        }
      } catch (error) {
        // 静默失败
      }
    }, 0)
  }

  async cleanup(targetSize = this.maxCacheSize * 0.7) {
    if (!this.db) await this.initialize()

    return new Promise(resolve => {
      const transaction = this.db.transaction(['materials'], 'readwrite')
      const store = transaction.objectStore('materials')
      const toDelete = []

      // 获取所有缓存项，按最后访问时间排序
      const request = store.openCursor()
      request.onsuccess = event => {
        const cursor = event.target.result
        if (cursor) {
          toDelete.push({
            id: cursor.value.id,
            lastAccess: cursor.value.lastAccess || 0,
            size: cursor.value.size || 0
          })
          cursor.continue()
        } else {
          // 按访问时间排序（最少使用的在前）
          toDelete.sort((a, b) => a.lastAccess - b.lastAccess)

          // 删除项目直到达到目标大小
          let deletedCount = 0
          let freedSize = 0

          for (const item of toDelete) {
            if (this.currentCacheSize - freedSize <= targetSize) {
              break
            }

            // 删除项目
            const deleteRequest = store.delete(item.id)
            deleteRequest.onsuccess = () => {
              deletedCount++
              freedSize += item.size
              this.currentCacheSize -= item.size
            }
          }

          console.log(`🧹 缓存清理: 删除 ${deletedCount} 项, 释放 ${this.formatBytes(freedSize)}`)
          resolve(deletedCount)
        }
      }

      request.onerror = () => resolve(0)
    })
  }

  estimateSize(material) {
    let size = 0

    // 基础数据
    size += JSON.stringify(material).length * 2

    // 图片数据
    if (material.dataUrl && material.dataUrl.startsWith('data:image/')) {
      const base64Data = material.dataUrl.split(',')[1]
      if (base64Data) {
        size += (base64Data.length * 3) / 4
      }
    }

    // 缩略图
    if (material.thumbnailUrl && material.thumbnailUrl !== material.dataUrl) {
      if (material.thumbnailUrl.startsWith('data:image/')) {
        const thumbData = material.thumbnailUrl.split(',')[1]
        if (thumbData) {
          size += (thumbData.length * 3) / 4
        }
      }
    }

    return size
  }

  async loadCacheSize() {
    if (!this.db) return

    return new Promise(resolve => {
      const transaction = this.db.transaction(['materials'], 'readonly')
      const store = transaction.objectStore('materials')
      let totalSize = 0

      const request = store.openCursor()
      request.onsuccess = event => {
        const cursor = event.target.result
        if (cursor) {
          totalSize += cursor.value.size || 0
          cursor.continue()
        } else {
          this.currentCacheSize = totalSize
          resolve()
        }
      }

      request.onerror = () => resolve()
    })
  }

  async getStats() {
    if (!this.db) await this.initialize()

    await this.loadCacheSize()

    return new Promise(resolve => {
      const transaction = this.db.transaction(['materials'], 'readonly')
      const store = transaction.objectStore('materials')
      const countRequest = store.count()

      countRequest.onsuccess = () => {
        resolve({
          count: countRequest.result,
          size: this.currentCacheSize
        })
      }

      countRequest.onerror = () => resolve({ count: 0, size: 0 })
    })
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
}

/**
 * 运行时临时存储
 * 用于存储运行时的临时数据，不持久化
 */
class RuntimeMaterialStore {
  constructor() {
    this.materials = new Map()
    this.searchIndex = new Map()
  }

  async initialize() {
    // 运行时存储不需要特殊初始化
    return Promise.resolve()
  }

  async store(material, ttl = 300000) {
    // 默认5分钟TTL
    const key = material.id
    this.materials.set(key, {
      data: material,
      expires: Date.now() + ttl
    })

    // 更新搜索索引
    this.updateSearchIndex(material)

    // 自动清理过期项
    setTimeout(() => {
      this.materials.delete(key)
    }, ttl)
  }

  async get(materialId) {
    const item = this.materials.get(materialId)
    if (item && item.expires > Date.now()) {
      return item.data
    } else if (item) {
      this.materials.delete(materialId)
    }
    return null
  }

  async search(query, options = {}) {
    const results = []
    const searchText = query.toLowerCase()

    for (const [key, item] of this.materials) {
      if (item.expires <= Date.now()) {
        this.materials.delete(key)
        continue
      }

      const material = item.data
      if (this.matchesQuery(material, searchText)) {
        results.push(material)
      }
    }

    return results
  }

  matchesQuery(material, searchText) {
    // 检查标题、描述、标签等
    const fields = [material.title, material.description, ...(material.tags || [])].filter(Boolean)

    return fields.some(field => field.toLowerCase().includes(searchText))
  }

  updateSearchIndex(material) {
    // 简单的倒排索引
    const words = [
      ...(material.title || '').split(/\s+/),
      ...(material.description || '').split(/\s+/),
      ...(material.tags || [])
    ].filter(word => word.length > 1)

    words.forEach(word => {
      const key = word.toLowerCase()
      if (!this.searchIndex.has(key)) {
        this.searchIndex.set(key, new Set())
      }
      this.searchIndex.get(key).add(material.id)
    })
  }

  async getStats() {
    // 清理过期项
    const now = Date.now()
    for (const [key, item] of this.materials) {
      if (item.expires <= now) {
        this.materials.delete(key)
      }
    }

    return {
      count: this.materials.size,
      size: 0 // 运行时数据不计算大小
    }
  }
}

// 导出单例实例
export default new LocalMaterialLibrary()
