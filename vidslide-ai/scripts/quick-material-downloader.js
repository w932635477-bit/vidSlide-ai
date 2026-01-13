/**
 * 快速素材下载器 - 直接使用英文关键词
 * 优先使用Unsplash/Pexels/Pixabay，无需翻译
 */

import LocalMaterialLibrary from '../src/services/LocalMaterialLibrary.js'
import MaterialService from '../src/services/MaterialService.js'

class QuickMaterialDownloader {
  constructor() {
    this.library = null
    this.materialService = null
    this.isRunning = false

    // 直接使用英文关键词列表 - 涵盖各个领域
    this.englishKeywords = [
      // 商业与营销
      'business meeting',
      'corporate presentation',
      'marketing strategy',
      'sales growth',
      'brand identity',
      'digital marketing',
      'content marketing',
      'social media',
      'customer success',
      'business analytics',
      'market research',
      'competitive analysis',

      // 教育与培训
      'online education',
      'distance learning',
      'e-learning platform',
      'educational technology',
      'student engagement',
      'learning management',
      'knowledge sharing',
      'skill development',
      'professional training',
      'academic achievement',
      'educational innovation',
      'teaching methods',

      // 科技与创新
      'artificial intelligence',
      'machine learning',
      'data science',
      'cloud computing',
      'internet of things',
      'cybersecurity',
      'blockchain technology',
      'quantum computing',
      'augmented reality',
      'virtual reality',
      'robotics technology',
      'automation',

      // 设计与创意
      'graphic design',
      'ui ux design',
      'user interface',
      'user experience',
      'creative process',
      'design thinking',
      'visual communication',
      'brand design',
      'packaging design',
      'typography design',
      'color theory',
      'design inspiration',

      // 健康与医疗
      'healthcare technology',
      'medical innovation',
      'telemedicine',
      'health monitoring',
      'preventive medicine',
      'patient care',
      'medical research',
      'health education',
      'fitness training',
      'mental health',
      'nutrition science',
      'medical equipment',

      // 环境与可持续发展
      'sustainable development',
      'green energy',
      'environmental protection',
      'climate change',
      'renewable energy',
      'eco friendly',
      'carbon neutral',
      'green technology',
      'environmental conservation',
      'sustainable living',
      'green building',
      'eco innovation',

      // 金融与投资
      'financial planning',
      'investment strategy',
      'wealth management',
      'financial technology',
      'cryptocurrency',
      'blockchain finance',
      'risk management',
      'portfolio management',
      'financial analytics',
      'investment banking',
      'personal finance',
      'fintech innovation',

      // 旅游与生活方式
      'travel experience',
      'cultural tourism',
      'adventure travel',
      'luxury lifestyle',
      'wellness retreat',
      'cultural heritage',
      'urban exploration',
      'nature photography',
      'culinary arts',
      'cultural exchange',
      'travel photography',
      'lifestyle design',

      // 艺术与文化
      'contemporary art',
      'digital art',
      'cultural heritage',
      'artistic expression',
      'cultural diversity',
      'museum collection',
      'art education',
      'creative arts',
      'cultural preservation',
      'artistic innovation',
      'cultural events',
      'art therapy',

      // 体育与娱乐
      'sports technology',
      'fitness equipment',
      'sports training',
      'athletic performance',
      'sports analytics',
      'entertainment industry',
      'gaming technology',
      'sports medicine',
      'recreational activities',
      'sports psychology',
      'entertainment production',
      'fitness lifestyle'
    ]

    this.targetCount = 800
    this.imagesPerKeyword = 5 // 每个关键词下载5张图片
    this.concurrency = 3 // 并发数
    this.downloadedCount = 0
    this.processedKeywords = new Set()
  }

  async initialize() {
    try {
      console.log('🚀 初始化快速素材下载器...')

      // 初始化服务
      this.library = LocalMaterialLibrary
      this.materialService = MaterialService

      await this.library.initialize()
      await this.materialService.initialize()

      console.log('✅ 服务初始化完成')
      return true
    } catch (error) {
      console.error('❌ 初始化失败:', error)
      return false
    }
  }

  async downloadMaterials() {
    if (this.isRunning) {
      console.log('⚠️ 下载已在进行中')
      return
    }

    this.isRunning = true
    console.log(`🎯 开始快速下载 ${this.targetCount} 张素材...`)
    console.log(`📋 关键词数量: ${this.englishKeywords.length}`)
    console.log(`🔄 并发数: ${this.concurrency}`)
    console.log(`🖼️ 每关键词图片数: ${this.imagesPerKeyword}`)

    try {
      // 分批处理关键词，避免一次性请求太多
      const batches = this.chunkArray(this.englishKeywords, this.concurrency)

      for (const batch of batches) {
        if (this.downloadedCount >= this.targetCount) {
          console.log(`🎉 已达到目标数量: ${this.downloadedCount} 张素材`)
          break
        }

        console.log(`📦 处理批次: ${batches.indexOf(batch) + 1}/${batches.length}`)

        // 并发处理一批关键词
        const promises = batch.map(keyword => this.downloadKeywordMaterials(keyword))
        await Promise.allSettled(promises)

        // 检查进度
        await this.checkProgress()

        // 小延迟避免请求过于频繁
        await this.delay(1000)
      }

      console.log(`🎉 下载完成！总计: ${this.downloadedCount} 张素材`)
    } catch (error) {
      console.error('❌ 下载过程出错:', error)
    } finally {
      this.isRunning = false
      await this.showFinalStats()
    }
  }

  async downloadKeywordMaterials(keyword) {
    try {
      if (this.processedKeywords.has(keyword)) {
        return // 已处理过
      }

      console.log(`🔍 搜索素材: "${keyword}"`)

      // 直接使用免费API搜索，跳过复杂的调度逻辑
      const results = await this.searchFreeAPIs(keyword)

      if (results && results.length > 0) {
        // 缓存新下载的素材
        let cachedCount = 0
        for (const material of results) {
          try {
            await this.library.cacheMaterial(material)
            cachedCount++
          } catch (error) {
            // 去重或缓存失败，跳过
          }
        }

        if (cachedCount > 0) {
          this.downloadedCount += cachedCount
          this.processedKeywords.add(keyword)
          console.log(
            `💾 "${keyword}": 缓存了 ${cachedCount} 张素材 (累计: ${this.downloadedCount})`
          )
        } else {
          console.log(`⚠️ "${keyword}": 所有素材已存在或缓存失败`)
        }
      } else {
        console.log(`⚠️ "${keyword}": 未找到素材`)
      }
    } catch (error) {
      console.warn(`⚠️ "${keyword}" 下载失败:`, error.message)
    }
  }

  async searchFreeAPIs(keyword) {
    const providers = ['unsplash', 'pexels', 'pixabay']
    const allResults = []

    for (const provider of providers) {
      try {
        console.log(`🌐 尝试 ${provider}...`)
        const results = await this.materialService.freeAPI.searchImages(keyword, {
          limit: Math.ceil(this.imagesPerKeyword / providers.length),
          platform: provider
        })

        if (results.success && results.images && results.images.length > 0) {
          // 转换为素材格式
          const materials = results.images.map(img => ({
            id: `${provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: `${keyword} - ${provider}`,
            url: img.url || img.src || img.thumbnail,
            thumbnail: img.thumbnail || img.url || img.src,
            source: provider,
            category: this.guessCategory(keyword),
            tags: [keyword, provider],
            width: img.width || 800,
            height: img.height || 600,
            size: img.size || 0,
            timestamp: Date.now()
          }))

          allResults.push(...materials)
          console.log(`✅ ${provider}: 找到 ${materials.length} 张素材`)
        }
      } catch (error) {
        console.warn(`⚠️ ${provider} 搜索失败:`, error.message)
      }
    }

    return allResults
  }

  guessCategory(keyword) {
    const categoryMap = {
      business: ['business', 'corporate', 'meeting', 'presentation', 'marketing', 'sales', 'brand'],
      education: ['education', 'learning', 'training', 'student', 'teaching', 'knowledge', 'skill'],
      technology: [
        'technology',
        'ai',
        'machine learning',
        'data',
        'cloud',
        'cybersecurity',
        'blockchain'
      ],
      design: ['design', 'ui', 'ux', 'graphic', 'creative', 'visual', 'brand'],
      health: ['health', 'medical', 'fitness', 'wellness', 'patient', 'nutrition'],
      environment: ['environment', 'green', 'sustainable', 'eco', 'climate', 'renewable'],
      finance: ['finance', 'investment', 'wealth', 'financial', 'portfolio', 'banking'],
      travel: ['travel', 'tourism', 'adventure', 'luxury', 'cultural', 'nature'],
      art: ['art', 'cultural', 'museum', 'creative', 'painting', 'sculpture'],
      sports: ['sports', 'fitness', 'athletic', 'training', 'performance', 'gaming']
    }

    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(k => keyword.toLowerCase().includes(k))) {
        return category
      }
    }

    return 'general'
  }

  async checkProgress() {
    try {
      const stats = await this.library.getStatistics()
      console.log(`📊 当前进度: ${stats.externalMaterials || 0} 张外部素材`)
    } catch (error) {
      console.warn('⚠️ 无法获取统计信息:', error)
    }
  }

  async showFinalStats() {
    try {
      const stats = await this.library.getStatistics()
      console.log('\n🎯 最终统计:')
      console.log(`📚 本地素材: ${stats.localMaterials || 0} 个`)
      console.log(`💾 缓存素材: ${stats.externalMaterials || 0} 个`)
      console.log(`🎯 总素材数: ${stats.totalMaterials || 0} 个`)
      console.log(`💾 存储大小: ${this.formatBytes(stats.totalSize || 0)}`)
    } catch (error) {
      console.error('❌ 获取最终统计失败:', error)
    }
  }

  chunkArray(array, size) {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  async getStatus() {
    const stats = await this.library.getStatistics()
    return {
      isRunning: this.isRunning,
      downloadedCount: this.downloadedCount,
      targetCount: this.targetCount,
      processedKeywords: this.processedKeywords.size,
      totalKeywords: this.englishKeywords.length,
      stats: stats
    }
  }
}

// 导出单例实例
const downloader = new QuickMaterialDownloader()

export default downloader

// 浏览器环境专用方法
if (typeof window !== 'undefined') {
  // 将下载器实例暴露到全局作用域，供HTML调用
  window.quickDownloader = downloader

  // 便捷方法
  window.startQuickDownload = async function () {
    console.log('🎯 快速素材下载器启动...')
    const success = await downloader.initialize()
    if (success) {
      return downloader.downloadMaterials()
    }
    return false
  }

  window.checkQuickDownloadStatus = async function () {
    return await downloader.getStatus()
  }

  window.clearQuickMaterials = async function () {
    return await downloader.library.clearAllMaterials()
  }
}
