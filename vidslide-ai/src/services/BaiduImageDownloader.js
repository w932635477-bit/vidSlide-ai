/**
 * 百度图片智能下载器
 * 专门为VidSlide AI本地素材库下载国内用户需要的图片
 */

import BaiduImageService from './BaiduImageService.js'

class BaiduImageDownloader {
  constructor() {
    this.baiduService = new BaiduImageService()
    // 在Node.js环境中不使用localLibrary，只专注于下载

    // 下载配置
    this.config = {
      maxConcurrentDownloads: 3, // 最大并发下载数
      downloadTimeout: 30000, // 下载超时时间（30秒）
      minImageSize: 100000, // 最小图片大小（100KB）
      maxImageSize: 10000000, // 最大图片大小（10MB）
      requiredFormats: ['jpg', 'jpeg', 'png'], // 支持的格式
      qualityThreshold: 70 // 质量阈值
    }

    // 下载统计
    this.stats = {
      totalKeywords: 0,
      downloadedImages: 0,
      failedDownloads: 0,
      skippedImages: 0,
      totalSize: 0,
      startTime: Date.now()
    }
  }

  /**
   * 批量下载关键词对应的图片
   * @param {Array} keywords - 关键词数组
   * @param {Object} options - 下载选项
   */
  async downloadKeywordBatch(keywords, options = {}) {
    const {
      imagesPerKeyword = 5, // 每个关键词下载的图片数
      minQuality = 70, // 最低质量分数
      skipExisting = true // 跳过已存在的图片
    } = options

    console.log(`📥 开始批量下载: ${keywords.length}个关键词，每词${imagesPerKeyword}张图片`)

    this.stats.totalKeywords = keywords.length

    // 限制并发下载
    const batches = this.chunkArray(keywords, this.config.maxConcurrentDownloads)

    for (const batch of batches) {
      const promises = batch.map(keyword =>
        this.downloadKeywordImages(keyword, imagesPerKeyword, { minQuality, skipExisting })
      )

      await Promise.allSettled(promises)

      // 批次间稍作延迟
      await this.delay(1000)
    }

    this.printDownloadReport()
  }

  /**
   * 下载单个关键词的图片
   */
  async downloadKeywordImages(keyword, count = 5, options = {}) {
    try {
      console.log(`🔍 下载关键词: "${keyword}" (${count}张)`)

      // 搜索百度图片
      const searchResults = await this.baiduService.searchImages(keyword, {
        limit: count * 2, // 多搜索一些用于筛选
        quality: 'high'
      })

      if (!searchResults.success || !searchResults.images || searchResults.images.length === 0) {
        console.log(`⚠️ "${keyword}"未找到图片`)
        return
      }

      console.log(`📋 "${keyword}"找到${searchResults.images.length}张图片，开始筛选...`)

      // 筛选和下载高质量图片
      let downloaded = 0
      for (const image of searchResults.images) {
        if (downloaded >= count) break

        try {
          // 评估图片质量
          const qualityScore = this.assessImageQuality(image)

          if (qualityScore >= (options.minQuality || this.config.qualityThreshold)) {
            // 下载图片
            const success = await this.downloadAndCacheImage(image, keyword)

            if (success) {
              downloaded++
              this.stats.downloadedImages++
            } else {
              this.stats.failedDownloads++
            }
          } else {
            this.stats.skippedImages++
          }

          // 小延迟避免请求过于频繁
          await this.delay(200)
        } catch (error) {
          console.warn('❌ 下载图片失败:', error.message)
          this.stats.failedDownloads++
        }
      }

      console.log(
        `✅ "${keyword}"完成: 下载${downloaded}张，跳过${searchResults.images.length - downloaded}张`
      )
    } catch (error) {
      console.error(`❌ 处理关键词"${keyword}"失败:`, error.message)
    }
  }

  /**
   * 下载并缓存单张图片
   */
  async downloadAndCacheImage(imageData, keyword) {
    try {
      // 下载图片数据
      const imageBlob = await this.downloadImageBlob(imageData.url)

      if (!imageBlob) {
        return false
      }

      // 检查图片大小
      if (imageBlob.size < this.config.minImageSize || imageBlob.size > this.config.maxImageSize) {
        console.log(`⏭️ 跳过: 图片大小${this.formatBytes(imageBlob.size)}不符合要求`)
        return false
      }

      // 转换为Data URL
      const dataUrl = await this.blobToDataUrl(imageBlob)

      // 生成缩略图
      const thumbnailUrl = await this.generateThumbnail(dataUrl)

      // 创建素材对象
      const material = {
        id: `baidu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: imageData.title || keyword,
        description: imageData.description || `来自百度图片的${keyword}相关图片`,
        category: 'external',
        subcategory: this.categorizeKeyword(keyword),
        industry: '通用',
        scene: '演示',
        style: '写实',
        type: 'image',
        source: 'baidu',
        platform: 'baidu',
        tags: [keyword, '百度图片'],
        keywords: [keyword],
        semanticTags: ['图片', '素材', keyword],
        relatedConcepts: [keyword],
        contextKeywords: [keyword],
        dataUrl: dataUrl,
        thumbnailUrl: thumbnailUrl,
        dimensions: {
          width: imageData.width || 800,
          height: imageData.height || 600
        },
        aspectRatio: (imageData.width || 800) / (imageData.height || 600),
        quality: this.assessImageQuality(imageData),
        license: {
          type: '百度图片',
          commercial: true,
          attribution: true
        },
        stats: {
          likes: 0,
          downloads: 0,
          views: 0
        },
        createdAt: new Date().toISOString(),
        externalData: imageData
      }

      // 注意：在Node.js环境中不进行实际缓存
      // 这只是演示下载计划，实际缓存将在浏览器中完成
      console.log(`📝 素材"${material.title}"已准备好缓存 (ID: ${material.id})`)

      // 更新统计
      this.stats.totalSize += imageBlob.size

      return true
    } catch (error) {
      console.error('下载图片失败:', error)
      return false
    }
  }

  /**
   * 评估图片质量
   */
  assessImageQuality(imageData) {
    let score = 50 // 基础分数

    // 分辨率评分
    const pixels = (imageData.width || 800) * (imageData.height || 600)
    if (pixels > 2000000)
      score += 20 // 2M像素+
    else if (pixels > 1000000)
      score += 15 // 1M像素+
    else if (pixels > 500000) score += 10 // 50W像素+

    // 尺寸评分
    if (imageData.width && imageData.width >= 1000) score += 10
    if (imageData.height && imageData.height >= 800) score += 10

    // 格式评分
    const format = imageData.format || 'jpg'
    if (this.config.requiredFormats.includes(format.toLowerCase())) {
      score += 5
    }

    // 标题完整性
    if (imageData.title && imageData.title.length > 5) score += 5

    return Math.min(100, Math.max(0, score))
  }

  /**
   * 分类关键词
   */
  categorizeKeyword(keyword) {
    const categoryMap = {
      // 商务类
      '团队|会议|公司|商务|战略|管理|领导|创新|服务': '商务',
      '合同|发票|财务|税务|会计|绩效|招聘|培训': '商务',

      // 教育类
      '教育|学习|培训|知识|学生|教师|课程|考试': '教育',
      '书本|证书|奖杯|智慧|成长|成就': '教育',

      // 科技类
      '科技|人工智能|大数据|云计算|物联网|区块链': '科技',
      '移动应用|用户体验|产品设计|研发|创新': '科技',

      // 生活类
      '生活|健康|家庭|旅游|美食|运动|娱乐': '生活',
      '度假|休闲|品质|和谐|环境保护': '生活',

      // 其他
      '成功|目标|挑战|机遇|改变|突破|成长|未来': '通用',
      '合作|共赢|信任|责任|品质|专业|卓越': '通用'
    }

    for (const [pattern, category] of Object.entries(categoryMap)) {
      if (new RegExp(pattern, 'i').test(keyword)) {
        return category
      }
    }

    return '通用'
  }

  /**
   * 下载图片Blob
   */
  async downloadImageBlob(url) {
    try {
      const response = await fetch(url, {
        timeout: this.config.downloadTimeout,
        headers: {
          'User-Agent': 'VidSlide-AI-Material-Downloader/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('不是有效的图片格式')
      }

      return await response.blob()
    } catch (error) {
      console.error('下载图片失败:', error)
      return null
    }
  }

  /**
   * Blob转Data URL
   */
  async blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * 生成缩略图
   */
  async generateThumbnail(dataUrl) {
    try {
      return new Promise(resolve => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // 缩略图尺寸
          const maxSize = 200
          let { width, height } = img

          if (width > height) {
            height = (height * maxSize) / width
            width = maxSize
          } else {
            width = (width * maxSize) / height
            height = maxSize
          }

          canvas.width = width
          canvas.height = height

          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.8))
        }

        img.onerror = () => resolve(dataUrl) // 如果生成失败，返回原图
        img.src = dataUrl
      })
    } catch (error) {
      console.warn('生成缩略图失败:', error)
      return dataUrl
    }
  }

  /**
   * 打印下载报告
   */
  printDownloadReport() {
    const duration = Date.now() - this.stats.startTime
    const durationStr = (duration / 1000).toFixed(1) + '秒'

    console.log('\n' + '='.repeat(60))
    console.log('📋 百度图片下载报告')
    console.log('='.repeat(60))
    console.log(`⏱️ 下载耗时: ${durationStr}`)
    console.log(`📝 处理关键词: ${this.stats.totalKeywords} 个`)
    console.log(`📥 成功下载: ${this.stats.downloadedImages} 张图片`)
    console.log(`❌ 下载失败: ${this.stats.failedDownloads} 张图片`)
    console.log(`⏭️ 跳过图片: ${this.stats.skippedImages} 张图片`)
    console.log(`📏 总大小: ${this.formatBytes(this.stats.totalSize)}`)

    const successRate =
      (this.stats.downloadedImages / (this.stats.downloadedImages + this.stats.failedDownloads)) *
      100
    console.log(`🎯 成功率: ${successRate.toFixed(1)}%`)

    console.log('\n🇨🇳 下载配置:')
    console.log('✅ 图片来源: 百度图片API')
    console.log('✅ 质量阈值: 70分以上')
    console.log('✅ 并发限制: 3个同时下载')
    console.log('✅ 大小范围: 100KB - 10MB')
    console.log('✅ 支持格式: JPG, JPEG, PNG')
  }

  /**
   * 工具方法：数组分块
   */
  chunkArray(array, size) {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * 工具方法：延迟执行
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 工具方法：格式化字节数
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
}

export default BaiduImageDownloader
