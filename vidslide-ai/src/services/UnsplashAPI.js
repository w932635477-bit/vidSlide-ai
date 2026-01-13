/**
 * Unsplash API 集成服务
 * 提供专业摄影素材的搜索和获取功能
 */
class UnsplashAPI {
  constructor() {
    // 注意：实际使用需要申请API密钥
    this.apiKey = 'YOUR_UNSPLASH_ACCESS_KEY' // 需要替换为真实的API密钥
    this.baseUrl = 'https://api.unsplash.com'
    this.cache = new Map()
  }

  /**
   * 搜索照片
   * @param {string} query - 搜索关键词
   * @param {object} options - 搜索选项
   * @returns {Promise<Array>} 照片数组
   */
  async searchPhotos(query, options = {}) {
    const {
      page = 1,
      perPage = 20,
      orientation = 'landscape',
      color,
      orderBy = 'relevant'
    } = options

    const cacheKey = `search_${query}_${page}_${perPage}_${orientation}_${color}_${orderBy}`

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const params = new URLSearchParams({
        query,
        page,
        per_page: perPage,
        orientation,
        order_by: orderBy
      })

      if (color) params.append('color', color)

      const url = `${this.baseUrl}/search/photos?${params}`
      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${this.apiKey}`,
          'Accept-Version': 'v1'
        }
      })

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`)
      }

      const data = await response.json()

      // 转换数据格式
      const photos = data.results.map(photo => this.transformPhotoData(photo))

      // 缓存结果
      this.cache.set(cacheKey, photos)

      return photos
    } catch (error) {
      console.error('Unsplash search error:', error)
      return []
    }
  }

  /**
   * 获取热门照片
   * @param {object} options - 获取选项
   * @returns {Promise<Array>} 热门照片数组
   */
  async getPopularPhotos(options = {}) {
    const { page = 1, perPage = 20, orderBy = 'popular' } = options

    const cacheKey = `popular_${page}_${perPage}_${orderBy}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const params = new URLSearchParams({
        page,
        per_page: perPage,
        order_by: orderBy
      })

      const url = `${this.baseUrl}/photos?${params}`
      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${this.apiKey}`,
          'Accept-Version': 'v1'
        }
      })

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`)
      }

      const data = await response.json()
      const photos = data.map(photo => this.transformPhotoData(photo))

      this.cache.set(cacheKey, photos)
      return photos
    } catch (error) {
      console.error('Unsplash popular photos error:', error)
      return []
    }
  }

  /**
   * 获取随机照片
   * @param {object} options - 获取选项
   * @returns {Promise<Array>} 随机照片数组
   */
  async getRandomPhotos(options = {}) {
    const { count = 10, query, orientation = 'landscape', featured = true } = options

    try {
      const params = new URLSearchParams({
        count,
        featured: featured.toString()
      })

      if (query) params.append('query', query)
      if (orientation) params.append('orientation', orientation)

      const url = `${this.baseUrl}/photos/random?${params}`
      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${this.apiKey}`,
          'Accept-Version': 'v1'
        }
      })

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`)
      }

      const data = await response.json()
      const photos = Array.isArray(data) ? data : [data]
      return photos.map(photo => this.transformPhotoData(photo))
    } catch (error) {
      console.error('Unsplash random photos error:', error)
      return []
    }
  }

  /**
   * 获取照片详情
   * @param {string} photoId - 照片ID
   * @returns {Promise<Object>} 照片详情
   */
  async getPhoto(photoId) {
    const cacheKey = `photo_${photoId}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const url = `${this.baseUrl}/photos/${photoId}`
      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${this.apiKey}`,
          'Accept-Version': 'v1'
        }
      })

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`)
      }

      const data = await response.json()
      const photo = this.transformPhotoData(data)

      this.cache.set(cacheKey, photo)
      return photo
    } catch (error) {
      console.error('Unsplash photo detail error:', error)
      return null
    }
  }

  /**
   * 下载照片（触发下载计数）
   * @param {string} photoId - 照片ID
   * @returns {Promise<string>} 下载链接
   */
  async triggerDownload(photoId) {
    try {
      const url = `${this.baseUrl}/photos/${photoId}/download`
      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${this.apiKey}`,
          'Accept-Version': 'v1'
        }
      })

      if (!response.ok) {
        throw new Error(`Unsplash download trigger error: ${response.status}`)
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Unsplash download trigger error:', error)
      return null
    }
  }

  /**
   * 转换Unsplash照片数据为统一格式
   * @param {Object} photo - Unsplash照片数据
   * @returns {Object} 标准化照片数据
   */
  transformPhotoData(photo) {
    return {
      id: photo.id,
      platform: 'unsplash',
      title: photo.description || photo.alt_description || 'Untitled',
      description: photo.description || photo.alt_description,
      author: {
        name: photo.user.name,
        username: photo.user.username,
        avatar: photo.user.profile_image?.small,
        portfolio: photo.user.portfolio_url
      },
      urls: {
        thumb: photo.urls.thumb,
        small: photo.urls.small,
        regular: photo.urls.regular,
        full: photo.urls.full,
        raw: photo.urls.raw
      },
      dimensions: {
        width: photo.width,
        height: photo.height
      },
      aspectRatio: photo.width / photo.height,
      color: photo.color,
      tags: photo.tags?.map(tag => tag.title) || [],
      categories: this.extractCategories(photo),
      quality: this.assessQuality(photo),
      license: {
        type: 'Unsplash License',
        commercial: true,
        attribution: true
      },
      stats: {
        likes: photo.likes,
        downloads: photo.downloads,
        views: photo.views
      },
      createdAt: photo.created_at,
      updatedAt: photo.updated_at,
      links: {
        html: photo.links.html,
        download: photo.links.download,
        download_location: photo.links.download_location
      }
    }
  }

  /**
   * 从照片数据中提取分类信息
   * @param {Object} photo - Unsplash照片数据
   * @returns {Array} 分类标签
   */
  extractCategories(photo) {
    const categories = []

    // 基于标签分类
    if (photo.tags) {
      photo.tags.forEach(tag => {
        const title = tag.title.toLowerCase()
        if (title.includes('nature') || title.includes('landscape') || title.includes('mountain')) {
          categories.push('nature')
        }
        if (title.includes('city') || title.includes('urban') || title.includes('architecture')) {
          categories.push('urban')
        }
        if (title.includes('people') || title.includes('portrait') || title.includes('person')) {
          categories.push('people')
        }
        if (title.includes('food') || title.includes('drink') || title.includes('restaurant')) {
          categories.push('food')
        }
        if (
          title.includes('technology') ||
          title.includes('computer') ||
          title.includes('digital')
        ) {
          categories.push('technology')
        }
        if (title.includes('business') || title.includes('office') || title.includes('corporate')) {
          categories.push('business')
        }
      })
    }

    // 基于描述分类
    const description = (photo.description + ' ' + (photo.alt_description || '')).toLowerCase()
    if (
      description.includes('sea') ||
      description.includes('ocean') ||
      description.includes('beach')
    ) {
      categories.push('sea')
    }
    if (
      description.includes('sunset') ||
      description.includes('dawn') ||
      description.includes('sunrise')
    ) {
      categories.push('sunset')
    }
    if (
      description.includes('night') ||
      description.includes('dark') ||
      description.includes('moon')
    ) {
      categories.push('night')
    }

    return [...new Set(categories)] // 去重
  }

  /**
   * 评估照片质量
   * @param {Object} photo - Unsplash照片数据
   * @returns {number} 质量评分 (0-100)
   */
  assessQuality(photo) {
    let score = 50 // 基础分数

    // 分辨率评分
    const pixels = photo.width * photo.height
    if (pixels > 20000000)
      score += 20 // 4K+
    else if (pixels > 8000000)
      score += 15 // 1080p+
    else if (pixels > 2000000) score += 10 // 720p+

    // 受欢迎程度
    if (photo.likes > 1000) score += 15
    else if (photo.likes > 500) score += 10
    else if (photo.likes > 100) score += 5

    // 下载量
    if (photo.downloads > 50000) score += 10
    else if (photo.downloads > 10000) score += 7
    else if (photo.downloads > 1000) score += 5

    // 标签丰富度
    if (photo.tags && photo.tags.length > 10) score += 5
    else if (photo.tags && photo.tags.length > 5) score += 3

    // 描述完整性
    if (photo.description && photo.description.length > 20) score += 5

    return Math.min(100, Math.max(0, score))
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   * @returns {Object} 缓存统计信息
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// 导出单例实例
export default new UnsplashAPI()
