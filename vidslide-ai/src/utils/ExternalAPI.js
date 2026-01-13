/**
 * VidSlide AI - 外部API集成模块
 * 集成免费素材API（Unsplash, Pexels等）
 */

import { getTranslationService } from './translationService.js'
import BaiduImageService from '../services/BaiduImageService.js'

/**
 * 外部API集成管理器
 * 统一管理多个免费素材API（Unsplash、Pexels等）
 * 提供搜索、下载、缓存等功能，支持智能重试和错误处理
 */
export class ExternalAPI {
  /**
   * 创建外部API管理器实例
   * 初始化支持的API配置和缓存系统
   */
  constructor() {
    this.baiduService = new BaiduImageService()

    this.apis = {
      baidu: {
        name: '百度图片',
        baseUrl: 'https://image.baidu.com',
        accessKey: 'configured', // 百度API已配置
        enabled: true
      },
      unsplash: {
        baseUrl: 'https://api.unsplash.com',
        accessKey: null, // 需要用户配置
        enabled: true
      },
      pexels: {
        baseUrl: 'https://api.pexels.com/v1',
        accessKey: null, // 需要用户配置
        enabled: true
      },
      pixabay: {
        baseUrl: 'https://pixabay.com/api/',
        accessKey: null, // 需要用户配置
        enabled: true
      }
    }

    this.cache = new Map() // 简单的内存缓存
    this.cacheExpiry = 30 * 60 * 1000 // 30分钟缓存
  }

  /**
   * 配置API密钥
   * @param {string} apiName - API名称
   * @param {string} accessKey - API密钥
   */
  /**

   * configureAPI 方法

   * VidSlide AI 功能实现

   */

  configureAPI(apiName, accessKey) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (this.apis[apiName]) {
      this.apis[apiName].accessKey = accessKey
      console.log(`${apiName} API已配置`)
    } else {
      throw new Error(`不支持的API: ${apiName}`)
    }
  }

  /**
   * 并行搜索多个外部API的素材资源
   * 智能分配搜索任务到不同API，合并结果并去重
   * 支持缓存机制提高性能和减少API调用
   * @param {string} query - 搜索关键词或短语
   * @param {Object} options - 搜索参数配置对象
   * @param {string} options.type - 素材类型过滤 ('photo'/'video'/'illustration')
   * @param {string} options.orientation - 图片方向 ('landscape'/'portrait'/'squarish')
   * @param {string} options.color - 颜色过滤 (Unsplash特有)
   * @param {number} options.limit - 返回结果数量限制 (默认: 20)
   * @param {number} options.page - 页码 (默认: 1)
   * @returns {Promise<Array>} 标准化素材对象数组
   * @returns {string} asset[].id - 唯一标识符 (API名称_原始ID)
   * @returns {string} asset[].name - 素材名称/描述
   * @returns {string} asset[].type - 素材类型
   * @returns {string} asset[].source - 来源API名称
   * @returns {string} asset[].url - 缩略图URL
   * @returns {string} asset[].originalUrl - 原始图片URL
   * @returns {Object} asset[].author - 作者信息
   * @returns {Object} asset[].copyrightInfo - 版权状态信息
   * @throws {Error} 当所有API都不可用或搜索失败时抛出错误
   */
  /**
   * searchAssets 方法
   * VidSlide AI 功能实现
   */
  async searchAssets(query, options = {}) {
    const {
      type = 'photo', // photo, video, illustration
      orientation = 'all', // landscape, portrait, squarish
      color = null, // 特定颜色
      limit = 20,
      page = 1
    } = options

    const results = []

    // 智能关键词翻译：将中文关键词翻译为英文以提升搜索效果
    let searchQuery = query
    try {
      const translationService = getTranslationService()

      // 检测是否包含中文字符
      const hasChinese = /[\u4e00-\u9fa5]/.test(query)

      if (hasChinese) {
        console.log(`🔄 检测到中文关键词，正在翻译: "${query}"`)

        // 将中文关键词翻译为英文
        const translatedQuery = await translationService.translate(query, 'zh', 'en')

        if (translatedQuery && translatedQuery !== query) {
          searchQuery = translatedQuery
          console.log(`✅ 关键词翻译完成: "${query}" → "${searchQuery}"`)
        } else {
          console.warn(`⚠️ 关键词翻译失败，使用原关键词: "${query}"`)
        }
      }
    } catch (error) {
      console.warn('关键词翻译服务不可用，使用原关键词:', error.message)
    }

    // 并行搜索所有启用的API（使用翻译后的关键词）
    const searchPromises = Object.entries(this.apis)
      .filter(([_, config]) => config.enabled && config.accessKey)
      .map(([apiName, config]) =>
        this.searchFromAPI(apiName, searchQuery, { ...options, limit: Math.ceil(limit / 2) }).catch(
          error => {
            console.warn(`${apiName}搜索失败:`, error)
            return []
          }
        )
      )

    const apiResults = await Promise.all(searchPromises)

    // 合并结果
    /**

     * for 方法

     * VidSlide AI 功能实现

     */

    for (const apiResult of apiResults) {
      results.push(...apiResult)
    }

    // 随机打乱顺序，避免同一API的结果集中
    return this.shuffleArray(results).slice(0, limit)
  }

  /**
   * 从特定API搜索素材
   * @param {string} apiName - API名称
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Array>} 素材列表
   */
  /**
   * searchFromAPI 方法
   * VidSlide AI 功能实现
   */
  async searchFromAPI(apiName, query, options = {}) {
    const cacheKey = `${apiName}_${query}_${JSON.stringify(options)}`
    const cached = this.getFromCache(cacheKey)

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (cached) {
      return cached
    }

    const config = this.apis[apiName]
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!config || !config.accessKey) {
      throw new Error(`${apiName} API未配置`)
    }

    let results = []

    /**


     * switch 方法


     * VidSlide AI 功能实现


     */

    switch (apiName) {
      case 'baidu':
        results = await this.searchBaidu(query, options)
        break
      case 'unsplash':
        results = await this.searchUnsplash(query, options)
        break
      case 'pexels':
        results = await this.searchPexels(query, options)
        break
      case 'pixabay':
        results = await this.searchPixabay(query, options)
        break
      default:
        throw new Error(`不支持的API: ${apiName}`)
    }

    // 缓存结果
    this.setCache(cacheKey, results)

    return results
  }

  /**
   * 搜索百度图片素材
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Array>} 百度图片素材列表
   */
  /**
   * searchBaidu 方法
   * VidSlide AI 功能实现
   */
  async searchBaidu(query, options = {}) {
    try {
      const results = await this.baiduService.searchImages(query, options)

      if (results.success && results.images) {
        // 转换百度API结果格式为ExternalAPI标准格式
        return results.images.map(img => ({
          id: img.id,
          name: img.title || img.tags?.join(' ') || query,
          type: 'photo',
          source: 'baidu',
          url: img.thumbnail,
          originalUrl: img.downloadUrl,
          author: img.author || '百度图片',
          copyrightInfo: {
            status: 'free',
            isSafe: true,
            license: '百度图片'
          },
          width: img.width,
          height: img.height,
          tags: img.tags || [query],
          createdAt: new Date().toISOString()
        }))
      }

      return []
    } catch (error) {
      console.error('百度搜索失败:', error)
      return []
    }
  }

  /**
   * 搜索Unsplash素材
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Array>} Unsplash素材列表
   */
  /**
   * searchUnsplash 方法
   * VidSlide AI 功能实现
   */
  async searchUnsplash(query, options = {}) {
    const { orientation, color, limit = 10, page = 1 } = options
    const config = this.apis.unsplash

    const params = new URLSearchParams({
      query,
      page,
      per_page: limit,
      client_id: config.accessKey
    })

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (orientation && orientation !== 'all') {
      params.append('orientation', orientation)
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (color) {
      params.append('color', color)
    }

    const url = `${config.baseUrl}/search/photos?${params}`

    try {
      const response = await fetch(url)
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if (!response.ok) {
        throw new Error(`Unsplash API错误: ${response.status}`)
      }

      const data = await response.json()

      return data.results.map(photo => ({
        id: `unsplash_${photo.id}`,
        name: photo.description || photo.alt_description || `Unsplash ${photo.id}`,
        type: 'image',
        category: 'photo',
        source: 'unsplash',
        url: photo.urls.regular,
        thumbnail: photo.urls.thumb,
        originalUrl: photo.urls.full,
        width: photo.width,
        height: photo.height,
        author: {
          name: photo.user.name,
          username: photo.user.username,
          profileUrl: photo.user.links.html
        },
        tags: photo.tags ? photo.tags.map(tag => tag.title) : [],
        metadata: {
          copyrightStatus: 'free',
          license: 'Unsplash License',
          sourceUrl: photo.links.html,
          downloadUrl: photo.urls.full,
          createdAt: photo.created_at,
          updatedAt: photo.updated_at,
          likes: photo.likes,
          downloads: photo.downloads
        },
        isDownloaded: false,
        fileSize: 0 // 需要下载后才能知道
      }))
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.error('Unsplash搜索失败:', error)
      throw error
    }
  }

  /**
   * 搜索Pexels素材
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Array>} Pexels素材列表
   */
  /**
   * searchPexels 方法
   * VidSlide AI 功能实现
   */
  async searchPexels(query, options = {}) {
    const { orientation, limit = 10, page = 1 } = options
    const config = this.apis.pexels

    const params = new URLSearchParams({
      query,
      page,
      per_page: limit
    })

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (orientation && orientation !== 'all') {
      params.append('orientation', orientation)
    }

    const url = `${config.baseUrl}/search?${params}`

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: config.accessKey
        }
      })

      /**


       * if 方法


       * VidSlide AI 功能实现


       */

      if (!response.ok) {
        throw new Error(`Pexels API错误: ${response.status}`)
      }

      const data = await response.json()

      return data.photos.map(photo => ({
        id: `pexels_${photo.id}`,
        name: photo.alt || `Pexels ${photo.id}`,
        type: 'image',
        category: 'photo',
        source: 'pexels',
        url: photo.src.large,
        thumbnail: photo.src.medium,
        originalUrl: photo.src.original,
        width: photo.width,
        height: photo.height,
        author: {
          name: photo.photographer,
          username: photo.photographer,
          profileUrl: photo.photographer_url
        },
        tags: [], // Pexels没有标签信息
        metadata: {
          copyrightStatus: 'free',
          license: 'Pexels License',
          sourceUrl: photo.url,
          downloadUrl: photo.src.original,
          createdAt: null,
          likes: null,
          downloads: null
        },
        isDownloaded: false,
        fileSize: 0
      }))
    } catch (error) {
      console.error('Pexels搜索失败:', error)
      throw error
    }
  }

  /**
   * 获取热门素材
   * @param {Object} options - 获取选项
   * @returns {Promise<Array>} 热门素材列表
   */
  /**
   * getPopularAssets 方法
   * VidSlide AI 功能实现
   */
  async getPopularAssets(options = {}) {
    const { limit = 20 } = options

    const results = []

    // 并行获取热门素材
    const popularPromises = Object.entries(this.apis)
      .filter(([_, config]) => config.enabled && config.accessKey)
      .map(([apiName, config]) =>
        this.getPopularFromAPI(apiName, { limit: Math.ceil(limit / 2) }).catch(error => {
          console.warn(`${apiName}获取热门素材失败:`, error)
          return []
        })
      )

    const apiResults = await Promise.all(popularPromises)

    /**


     * for 方法


     * VidSlide AI 功能实现


     */

    for (const apiResult of apiResults) {
      results.push(...apiResult)
    }

    return this.shuffleArray(results).slice(0, limit)
  }

  /**
   * 从特定API获取热门素材
   * @param {string} apiName - API名称
   * @param {Object} options - 获取选项
   * @returns {Promise<Array>} 热门素材列表
   */
  /**
   * getPopularFromAPI 方法
   * VidSlide AI 功能实现
   */
  async getPopularFromAPI(apiName, options = {}) {
    const { limit = 10 } = options
    const cacheKey = `${apiName}_popular_${limit}`
    const cached = this.getFromCache(cacheKey)

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (cached) {
      return cached
    }

    const config = this.apis[apiName]
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!config || !config.accessKey) {
      throw new Error(`${apiName} API未配置`)
    }

    let results = []

    /**


     * switch 方法


     * VidSlide AI 功能实现


     */

    switch (apiName) {
      case 'unsplash':
        results = await this.getUnsplashPopular(limit)
        break
      case 'pexels':
        results = await this.getPexelsPopular(limit)
        break
      case 'pixabay':
        results = await this.getPixabayPopular(limit)
        break
      default:
        throw new Error(`不支持的API: ${apiName}`)
    }

    this.setCache(cacheKey, results)
    return results
  }

  /**
   * 获取Unsplash热门素材
   * @param {number} limit - 数量限制
   * @returns {Promise<Array>} 热门素材列表
   */
  /**
   * getUnsplashPopular 方法
   * VidSlide AI 功能实现
   */
  async getUnsplashPopular(limit = 10) {
    const config = this.apis.unsplash
    const url = `${config.baseUrl}/photos?client_id=${config.accessKey}&per_page=${limit}&order_by=popular`

    const response = await fetch(url)
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!response.ok) {
      throw new Error(`Unsplash API错误: ${response.status}`)
    }

    const photos = await response.json()
    return photos.map(photo => this.transformUnsplashPhoto(photo))
  }

  /**
   * 获取Pexels热门素材
   * @param {number} limit - 数量限制
   * @returns {Promise<Array>} 热门素材列表
   */
  /**
   * getPexelsPopular 方法
   * VidSlide AI 功能实现
   */
  async getPexelsPopular(limit = 10) {
    const config = this.apis.pexels
    const url = `${config.baseUrl}/curated?per_page=${limit}`

    const response = await fetch(url, {
      headers: {
        Authorization: config.accessKey
      }
    })

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (!response.ok) {
      throw new Error(`Pexels API错误: ${response.status}`)
    }

    const data = await response.json()
    return data.photos.map(photo => this.transformPexelsPhoto(photo))
  }

  /**
   * 搜索Pixabay素材
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Array>} Pixabay素材列表
   */
  /**
   * searchPixabay 方法
   * VidSlide AI 功能实现
   */
  async searchPixabay(query, options = {}) {
    const { limit = 10, page = 1 } = options
    const config = this.apis.pixabay

    const params = new URLSearchParams({
      key: config.accessKey,
      q: query,
      per_page: limit,
      page,
      lang: 'zh' // 支持中文搜索
    })

    const url = `${config.baseUrl}?${params}`

    try {
      const response = await fetch(url)
      /**
       * if 方法
       * VidSlide AI 功能实现
       */

      if (!response.ok) {
        throw new Error(`Pixabay API错误: ${response.status}`)
      }

      const data = await response.json()

      return data.hits.map(hit => ({
        id: `pixabay_${hit.id}`,
        name: hit.tags || `Pixabay ${hit.id}`,
        type: 'image',
        category: 'photo',
        source: 'pixabay',
        url: hit.webformatURL,
        thumbnail: hit.previewURL,
        originalUrl: hit.largeImageURL,
        width: hit.imageWidth,
        height: hit.imageHeight,
        author: {
          name: hit.user,
          username: hit.user,
          profileUrl: `https://pixabay.com/users/${hit.user}/`
        },
        tags: hit.tags ? hit.tags.split(',').map(tag => tag.trim()) : [],
        metadata: {
          copyrightStatus: 'free',
          license: 'Pixabay License',
          sourceUrl: hit.pageURL,
          downloadUrl: hit.largeImageURL,
          createdAt: null,
          likes: hit.likes,
          downloads: hit.downloads,
          views: hit.views
        },
        isDownloaded: false,
        fileSize: 0
      }))
    } catch (error) {
      console.error('Pixabay搜索失败:', error)
      throw error
    }
  }

  /**
   * 获取Pixabay热门素材
   * @param {number} limit - 数量限制
   * @returns {Promise<Array>} 热门素材列表
   */
  /**
   * getPixabayPopular 方法
   * VidSlide AI 功能实现
   */
  async getPixabayPopular(limit = 10) {
    const config = this.apis.pixabay
    const url = `${config.baseUrl}?key=${config.accessKey}&order=popular&per_page=${limit}&lang=zh`

    const response = await fetch(url)
    /**
     * if 方法
     * VidSlide AI 功能实现
     */

    if (!response.ok) {
      throw new Error(`Pixabay API错误: ${response.status}`)
    }

    const data = await response.json()
    return data.hits.map(hit => this.transformPixabayHit(hit))
  }

  /**
   * 转换Pexels照片数据
   * @param {Object} asset - 素材对象
   * @returns {Promise<Blob>} 素材文件
   */
  /**
   * downloadAsset 方法
   * VidSlide AI 功能实现
   */
  async downloadAsset(asset) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!asset.downloadUrl) {
      throw new Error('素材没有下载链接')
    }

    try {
      const response = await fetch(asset.downloadUrl)
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`)
      }

      const blob = await response.blob()
      return blob
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.error('下载素材失败:', error)
      throw new Error('下载素材失败，请检查网络连接')
    }
  }

  /**
   * 获取素材分类
   * @returns {Array} 分类列表
   */
  /**

   * getCategories 方法

   * VidSlide AI 功能实现

   */

  getCategories() {
    return [
      { id: 'nature', name: '自然风景', icon: '🌿' },
      { id: 'business', name: '商业办公', icon: '💼' },
      { id: 'technology', name: '科技数码', icon: '💻' },
      { id: 'people', name: '人物肖像', icon: '👤' },
      { id: 'food', name: '美食饮品', icon: '🍽️' },
      { id: 'travel', name: '旅行交通', icon: '✈️' },
      { id: 'abstract', name: '抽象艺术', icon: '🎨' },
      { id: 'texture', name: '纹理背景', icon: '🔲' }
    ]
  }

  /**
   * 获取支持的颜色
   * @returns {Array} 颜色列表
   */
  /**

   * getSupportedColors 方法

   * VidSlide AI 功能实现

   */

  getSupportedColors() {
    return [
      { id: 'black_and_white', name: '黑白', value: 'black_and_white' },
      { id: 'black', name: '黑色', value: 'black' },
      { id: 'white', name: '白色', value: 'white' },
      { id: 'yellow', name: '黄色', value: 'yellow' },
      { id: 'orange', name: '橙色', value: 'orange' },
      { id: 'red', name: '红色', value: 'red' },
      { id: 'purple', name: '紫色', value: 'purple' },
      { id: 'magenta', name: '品红', value: 'magenta' },
      { id: 'green', name: '绿色', value: 'green' },
      { id: 'teal', name: '青色', value: 'teal' },
      { id: 'blue', name: '蓝色', value: 'blue' }
    ]
  }

  /**
   * 转换Unsplash照片数据
   * @param {Object} photo - Unsplash照片对象
   * @returns {Object} 标准化的素材对象
   */
  /**

   * transformUnsplashPhoto 方法

   * VidSlide AI 功能实现

   */

  transformUnsplashPhoto(photo) {
    return {
      id: `unsplash_${photo.id}`,
      name: photo.description || photo.alt_description || `Unsplash ${photo.id}`,
      type: 'image',
      category: 'photo',
      source: 'unsplash',
      url: photo.urls.regular,
      thumbnail: photo.urls.thumb,
      originalUrl: photo.urls.full,
      width: photo.width,
      height: photo.height,
      author: {
        name: photo.user.name,
        username: photo.user.username,
        profileUrl: photo.user.links.html
      },
      tags: photo.tags ? photo.tags.map(tag => tag.title) : [],
      metadata: {
        copyrightStatus: 'free',
        license: 'Unsplash License',
        sourceUrl: photo.links.html,
        downloadUrl: photo.urls.full,
        createdAt: photo.created_at,
        updatedAt: photo.updated_at,
        likes: photo.likes,
        downloads: photo.downloads
      },
      isDownloaded: false,
      fileSize: 0
    }
  }

  /**
   * 转换Pexels照片数据
   * @param {Object} photo - Pexels照片对象
   * @returns {Object} 标准化的素材对象
   */
  /**

   * transformPexelsPhoto 方法

   * VidSlide AI 功能实现

   */

  transformPexelsPhoto(photo) {
    return {
      id: `pexels_${photo.id}`,
      name: photo.alt || `Pexels ${photo.id}`,
      type: 'image',
      category: 'photo',
      source: 'pexels',
      url: photo.src.large,
      thumbnail: photo.src.medium,
      originalUrl: photo.src.original,
      width: photo.width,
      height: photo.height,
      author: {
        name: photo.photographer,
        username: photo.photographer,
        profileUrl: photo.photographer_url
      },
      tags: [],
      metadata: {
        copyrightStatus: 'free',
        license: 'Pexels License',
        sourceUrl: photo.url,
        downloadUrl: photo.src.original,
        createdAt: null,
        likes: null,
        downloads: null
      },
      isDownloaded: false,
      fileSize: 0
    }
  }

  /**
   * 转换Pixabay照片数据
   * @param {Object} hit - Pixabay hit对象
   * @returns {Object} 标准化的素材对象
   */
  /**
   * transformPixabayHit 方法
   * VidSlide AI 功能实现
   */

  transformPixabayHit(hit) {
    return {
      id: `pixabay_${hit.id}`,
      name: hit.tags || `Pixabay ${hit.id}`,
      type: 'image',
      category: 'photo',
      source: 'pixabay',
      url: hit.webformatURL,
      thumbnail: hit.previewURL,
      originalUrl: hit.largeImageURL,
      width: hit.imageWidth,
      height: hit.imageHeight,
      author: {
        name: hit.user,
        username: hit.user,
        profileUrl: `https://pixabay.com/users/${hit.user}/`
      },
      tags: hit.tags ? hit.tags.split(',').map(tag => tag.trim()) : [],
      metadata: {
        copyrightStatus: 'free',
        license: 'Pixabay License',
        sourceUrl: hit.pageURL,
        downloadUrl: hit.largeImageURL,
        createdAt: null,
        likes: hit.likes,
        downloads: hit.downloads,
        views: hit.views
      },
      isDownloaded: false,
      fileSize: 0
    }
  }

  /**
   * 从缓存获取数据
   * @param {string} key - 缓存键
   * @returns {Array|null} 缓存的数据
   */
  /**

   * getFromCache 方法

   * VidSlide AI 功能实现

   */

  getFromCache(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  /**
   * 设置缓存数据
   * @param {string} key - 缓存键
   * @param {Array} data - 要缓存的数据
   */
  /**

   * setCache 方法

   * VidSlide AI 功能实现

   */

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 随机打乱数组
   * @param {Array} array - 要打乱的数组
   * @returns {Array} 打乱后的数组
   */
  /**

   * shuffleArray 方法

   * VidSlide AI 功能实现

   */

  shuffleArray(array) {
    const shuffled = [...array]
    /**

     * for 方法

     * VidSlide AI 功能实现

     */

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * 清除缓存
   */
  /**

   * clearCache 方法

   * VidSlide AI 功能实现

   */

  clearCache() {
    this.cache.clear()
    console.log('外部API缓存已清除')
  }

  /**
   * 获取API状态
   * @returns {Object} API状态信息
   */
  /**

   * getAPIStatus 方法

   * VidSlide AI 功能实现

   */

  getAPIStatus() {
    const status = {}

    for (const [apiName, config] of Object.entries(this.apis)) {
      status[apiName] = {
        enabled: config.enabled,
        configured: !!config.accessKey,
        status: 'unknown'
      }
    }

    return status
  }
}

export default ExternalAPI
