/**
 * VidSlide AI 自动素材获取脚本
 * 自动从Unsplash、Pexels、Pixabay获取并组织素材
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// API配置
const API_CONFIGS = {
  unsplash: {
    baseUrl: 'https://api.unsplash.com',
    accessKey: 'zPjqHo_L8Vx-gckbifgYM1bJxnYbFRgFXLXFwWcAN30',
    appId: '851289'
  },
  pexels: {
    baseUrl: 'https://api.pexels.com/v1',
    apiKey: 'LnDV3UqDXRD71HMtGzXByhFF1mwwuHdU4RKXsMKtjgHOaCOV1iwrA0Xz'
  },
  pixabay: {
    baseUrl: 'https://pixabay.com/api/',
    apiKey: '52722038-7ac4769e00433c06f9c6333bc'
  }
}

// 素材分类体系
const MATERIAL_CATEGORIES = {
  // 基础图标类
  icons: {
    technology: [
      'computer',
      'mobile phone',
      'internet',
      'software',
      'programming',
      'artificial intelligence',
      'robot',
      'digital',
      'network',
      'cloud computing'
    ],
    business: [
      'business',
      'finance',
      'money',
      'growth',
      'success',
      'teamwork',
      'meeting',
      'presentation',
      'strategy',
      'leadership'
    ],
    education: [
      'education',
      'learning',
      'book',
      'student',
      'teacher',
      'knowledge',
      'study',
      'school',
      'university',
      'graduation'
    ],
    lifestyle: [
      'home',
      'family',
      'food',
      'travel',
      'health',
      'fitness',
      'nature',
      'happiness',
      'friendship',
      'lifestyle'
    ]
  },

  // 图表元素类
  charts: {
    data: [
      'statistics',
      'data analysis',
      'graph',
      'chart',
      'analytics',
      'report',
      'dashboard',
      'metrics',
      'performance',
      'results'
    ],
    business_charts: [
      'business chart',
      'financial chart',
      'growth chart',
      'sales chart',
      'market analysis',
      'business intelligence',
      'kpi dashboard'
    ],
    education_charts: [
      'educational chart',
      'learning progress',
      'academic performance',
      'study statistics',
      'education metrics',
      'knowledge graph'
    ]
  },

  // 背景模板类
  backgrounds: {
    modern: [
      'modern background',
      'abstract background',
      'geometric pattern',
      'gradient background',
      'minimal background',
      'clean design'
    ],
    business: [
      'business background',
      'corporate background',
      'professional background',
      'office background',
      'meeting room',
      'boardroom'
    ],
    education: [
      'education background',
      'classroom background',
      'school background',
      'learning environment',
      'study background'
    ],
    creative: [
      'creative background',
      'artistic background',
      'colorful background',
      'inspiring background',
      'motivational background'
    ]
  },

  // 装饰元素类
  decorations: {
    arrows: ['arrow', 'direction', 'pointer', 'navigation', 'flow'],
    shapes: ['shape', 'geometry', 'circle', 'square', 'triangle', 'polygon'],
    dividers: ['divider', 'separator', 'ornament', 'decoration', 'border']
  }
}

// 用户类型关键词映射
const USER_TYPE_KEYWORDS = {
  自媒体创作者: ['modern', 'trendy', 'social media', 'content creation', 'influencer'],
  知识博主: ['professional', 'academic', 'expert', 'knowledge', 'authority'],
  企业培训师: ['corporate', 'business', 'training', 'professional', 'enterprise'],
  教育工作者: ['educational', 'learning', 'teaching', 'student-friendly', 'academic']
}

// 下载配置
const DOWNLOAD_CONFIG = {
  maxImagesPerCategory: 50, // 每个分类最大图片数
  maxImagesPerKeyword: 10, // 每个关键词最大图片数
  minImageSize: 800, // 最小图片尺寸
  preferredFormats: ['jpg', 'png'], // 优先格式
  outputDir: path.join(__dirname, '../public/materials'),
  metadataFile: 'materials-metadata.json'
}

class MaterialFetcher {
  constructor() {
    this.downloadedUrls = new Set()
    this.metadata = {
      lastUpdate: new Date().toISOString(),
      categories: {},
      totalMaterials: 0,
      sources: {}
    }
    this.loadExistingMetadata()
  }

  /**
   * 加载已存在的元数据
   */
  loadExistingMetadata() {
    const metadataPath = path.join(DOWNLOAD_CONFIG.outputDir, DOWNLOAD_CONFIG.metadataFile)
    if (fs.existsSync(metadataPath)) {
      try {
        this.metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
        // 恢复已下载的URL集合
        Object.values(this.metadata.categories).forEach(category => {
          Object.values(category).forEach(subcategory => {
            subcategory.forEach(material => {
              this.downloadedUrls.add(material.sourceUrl)
            })
          })
        })
        console.log(`📋 加载现有元数据: ${this.metadata.totalMaterials} 个素材`)
      } catch (error) {
        console.warn('⚠️ 无法加载元数据文件，将重新创建')
      }
    }
  }

  /**
   * HTTP请求封装
   */
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        headers: {
          'User-Agent': 'VidSlide-AI-Material-Fetcher/1.0.0',
          ...options.headers
        },
        ...options
      }

      https
        .get(url, requestOptions, res => {
          let data = ''

          res.on('data', chunk => {
            data += chunk
          })

          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                resolve(JSON.parse(data))
              } else {
                reject(new Error(`HTTP ${res.statusCode}: ${data}`))
              }
            } catch (error) {
              reject(new Error(`解析响应失败: ${error.message}`))
            }
          })
        })
        .on('error', error => {
          reject(error)
        })
    })
  }

  /**
   * 从Unsplash获取图片
   */
  async fetchFromUnsplash(keyword, count = 10) {
    try {
      const url = `${API_CONFIGS.unsplash.baseUrl}/search/photos?query=${encodeURIComponent(keyword)}&per_page=${count}&client_id=${API_CONFIGS.unsplash.accessKey}`
      const response = await this.makeRequest(url)

      return response.results.map(photo => ({
        id: photo.id,
        title: photo.description || photo.alt_description || keyword,
        sourceUrl: photo.urls.raw,
        thumbnailUrl: photo.urls.thumb,
        downloadUrl: photo.urls.full,
        width: photo.width,
        height: photo.height,
        source: 'unsplash',
        author: photo.user.name,
        license: 'Unsplash License',
        tags: photo.tags?.map(tag => tag.title) || [],
        color: photo.color
      }))
    } catch (error) {
      console.error(`❌ Unsplash API错误 (${keyword}):`, error.message)
      return []
    }
  }

  /**
   * 从Pexels获取图片
   */
  async fetchFromPexels(keyword, count = 10) {
    try {
      const url = `${API_CONFIGS.pexels.baseUrl}/search?query=${encodeURIComponent(keyword)}&per_page=${count}`
      const response = await this.makeRequest(url, {
        headers: {
          Authorization: API_CONFIGS.pexels.apiKey
        }
      })

      return response.photos.map(photo => ({
        id: photo.id.toString(),
        title: photo.alt || keyword,
        sourceUrl: photo.src.original,
        thumbnailUrl: photo.src.medium,
        downloadUrl: photo.src.large,
        width: photo.width,
        height: photo.height,
        source: 'pexels',
        author: photo.photographer,
        license: 'Pexels License',
        tags: [], // Pexels API不提供标签
        color: null
      }))
    } catch (error) {
      console.error(`❌ Pexels API错误 (${keyword}):`, error.message)
      return []
    }
  }

  /**
   * 从Pixabay获取图片
   */
  async fetchFromPixabay(keyword, count = 10) {
    try {
      const url = `${API_CONFIGS.pixabay.baseUrl}?key=${API_CONFIGS.pixabay.apiKey}&q=${encodeURIComponent(keyword)}&per_page=${count}&lang=zh`
      const response = await this.makeRequest(url)

      return response.hits.map(hit => ({
        id: hit.id.toString(),
        title: hit.tags || keyword,
        sourceUrl: hit.largeImageURL,
        thumbnailUrl: hit.previewURL,
        downloadUrl: hit.webformatURL,
        width: hit.imageWidth,
        height: hit.imageHeight,
        source: 'pixabay',
        author: hit.user,
        license: 'Pixabay License',
        tags: hit.tags.split(',').map(tag => tag.trim()),
        color: null
      }))
    } catch (error) {
      console.error(`❌ Pixabay API错误 (${keyword}):`, error.message)
      return []
    }
  }

  /**
   * 下载图片文件
   */
  async downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
      // 确保目录存在
      const dir = path.dirname(filepath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      const file = fs.createWriteStream(filepath)

      https
        .get(url, response => {
          if (response.statusCode !== 200) {
            reject(new Error(`下载失败: HTTP ${response.statusCode}`))
            return
          }

          response.pipe(file)

          file.on('finish', () => {
            file.close()
            resolve()
          })

          file.on('error', error => {
            fs.unlink(filepath, () => {}) // 删除失败的文件
            reject(error)
          })
        })
        .on('error', error => {
          fs.unlink(filepath, () => {}) // 删除失败的文件
          reject(error)
        })
    })
  }

  /**
   * 质量筛选图片
   */
  filterImage(material) {
    // 检查是否已下载
    if (this.downloadedUrls.has(material.sourceUrl)) {
      return false
    }

    // 检查尺寸
    if (
      material.width < DOWNLOAD_CONFIG.minImageSize ||
      material.height < DOWNLOAD_CONFIG.minImageSize
    ) {
      return false
    }

    // 检查宽高比（避免极端比例）
    const aspectRatio = material.width / material.height
    if (aspectRatio < 0.1 || aspectRatio > 10) {
      return false
    }

    return true
  }

  /**
   * 保存素材元数据
   */
  saveMetadata(category, subcategory, material, localPath) {
    if (!this.metadata.categories[category]) {
      this.metadata.categories[category] = {}
    }
    if (!this.metadata.categories[category][subcategory]) {
      this.metadata.categories[category][subcategory] = []
    }

    const materialInfo = {
      ...material,
      localPath: path.relative(DOWNLOAD_CONFIG.outputDir, localPath),
      downloadTime: new Date().toISOString(),
      fileSize: fs.existsSync(localPath) ? fs.statSync(localPath).size : 0
    }

    this.metadata.categories[category][subcategory].push(materialInfo)
    this.metadata.totalMaterials++
    this.downloadedUrls.add(material.sourceUrl)

    // 更新来源统计
    if (!this.metadata.sources[material.source]) {
      this.metadata.sources[material.source] = 0
    }
    this.metadata.sources[material.source]++
  }

  /**
   * 获取指定分类的素材
   */
  async fetchCategoryMaterials(
    category,
    subcategory,
    keywords,
    maxCount = DOWNLOAD_CONFIG.maxImagesPerCategory
  ) {
    console.log(`🔍 获取分类素材: ${category}/${subcategory} (${keywords.length} 个关键词)`)

    const allMaterials = []
    const downloadedCount = this.metadata.categories[category]?.[subcategory]?.length || 0
    const remainingCount = Math.max(0, maxCount - downloadedCount)

    if (remainingCount === 0) {
      console.log(`⏭️ 分类 ${category}/${subcategory} 已达到最大数量，跳过`)
      return []
    }

    // 并行获取不同平台的素材
    const fetchPromises = []

    for (const keyword of keywords.slice(0, 5)) {
      // 限制关键词数量
      const imagesPerKeyword = Math.ceil(remainingCount / keywords.length / 3) // 平均分配到3个平台

      fetchPromises.push(this.fetchFromUnsplash(keyword, imagesPerKeyword))
      fetchPromises.push(this.fetchFromPexels(keyword, imagesPerKeyword))
      fetchPromises.push(this.fetchFromPixabay(keyword, imagesPerKeyword))
    }

    try {
      const results = await Promise.allSettled(fetchPromises)

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allMaterials.push(...result.value)
        }
      })
    } catch (error) {
      console.error('❌ 获取素材失败:', error.message)
    }

    // 去重和筛选
    const uniqueMaterials = allMaterials
      .filter(material => this.filterImage(material))
      .filter(
        (material, index, self) => index === self.findIndex(m => m.sourceUrl === material.sourceUrl)
      )
      .slice(0, remainingCount)

    console.log(`📥 发现 ${uniqueMaterials.length} 个新素材`)

    // 下载素材
    const downloadPromises = uniqueMaterials.map(async material => {
      try {
        const ext = path.extname(material.downloadUrl) || '.jpg'
        const filename = `${material.source}_${material.id}${ext}`
        const categoryDir = path.join(DOWNLOAD_CONFIG.outputDir, category, subcategory)
        const filepath = path.join(categoryDir, filename)

        await this.downloadImage(material.downloadUrl, filepath)
        this.saveMetadata(category, subcategory, material, filepath)

        console.log(`✅ 下载完成: ${category}/${subcategory}/${filename}`)
        return true
      } catch (error) {
        console.error(`❌ 下载失败: ${material.sourceUrl}`, error.message)
        return false
      }
    })

    const downloadResults = await Promise.allSettled(downloadPromises)
    const successCount = downloadResults.filter(r => r.status === 'fulfilled' && r.value).length

    console.log(`🎉 ${category}/${subcategory} 下载完成: ${successCount}/${uniqueMaterials.length}`)
    return successCount
  }

  /**
   * 生成用户类型推荐配置
   */
  async generateUserRecommendations() {
    console.log('🎯 生成用户类型推荐配置...')

    const recommendations = {}

    for (const [userType, keywords] of Object.entries(USER_TYPE_KEYWORDS)) {
      recommendations[userType] = {}

      for (const [category, subcategories] of Object.entries(MATERIAL_CATEGORIES)) {
        recommendations[userType][category] = {}

        for (const [subcategory, categoryKeywords] of Object.entries(subcategories)) {
          // 结合用户关键词和分类关键词
          const combinedKeywords = [...keywords, ...categoryKeywords].slice(0, 10)
          const availableCount = this.metadata.categories[category]?.[subcategory]?.length || 0

          recommendations[userType][category][subcategory] = {
            keywords: combinedKeywords,
            availableMaterials: availableCount,
            recommended: availableCount >= 10 // 至少10个素材才推荐
          }
        }
      }
    }

    // 保存推荐配置
    const recommendationsPath = path.join(DOWNLOAD_CONFIG.outputDir, 'user-recommendations.json')
    fs.writeFileSync(recommendationsPath, JSON.stringify(recommendations, null, 2))
    console.log(`💾 用户推荐配置已保存: ${recommendationsPath}`)
  }

  /**
   * 保存元数据
   */
  saveMetadataFile() {
    const metadataPath = path.join(DOWNLOAD_CONFIG.outputDir, DOWNLOAD_CONFIG.metadataFile)
    this.metadata.lastUpdate = new Date().toISOString()

    fs.writeFileSync(metadataPath, JSON.stringify(this.metadata, null, 2))
    console.log(`💾 元数据已保存: ${this.metadata.totalMaterials} 个素材`)
  }

  /**
   * 主执行函数
   */
  async run() {
    console.log('🚀 开始自动获取VidSlide AI素材库...\n')

    // 确保输出目录存在
    if (!fs.existsSync(DOWNLOAD_CONFIG.outputDir)) {
      fs.mkdirSync(DOWNLOAD_CONFIG.outputDir, { recursive: true })
    }

    let totalDownloaded = 0

    // 遍历所有分类
    for (const [category, subcategories] of Object.entries(MATERIAL_CATEGORIES)) {
      console.log(`\n📂 处理分类: ${category}`)

      for (const [subcategory, keywords] of Object.entries(subcategories)) {
        const downloaded = await this.fetchCategoryMaterials(
          category,
          subcategory,
          keywords,
          DOWNLOAD_CONFIG.maxImagesPerCategory
        )
        totalDownloaded += downloaded

        // 避免API限制，添加延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // 生成用户推荐配置
    await this.generateUserRecommendations()

    // 保存最终元数据
    this.saveMetadataFile()

    console.log('\n🎉 素材获取完成！')
    console.log(`📊 本次新增: ${totalDownloaded} 个素材`)
    console.log(`📈 素材总量: ${this.metadata.totalMaterials} 个`)
    console.log(`📁 输出目录: ${DOWNLOAD_CONFIG.outputDir}`)

    // 显示统计信息
    console.log('\n📈 数据统计:')
    Object.entries(this.metadata.sources).forEach(([source, count]) => {
      console.log(`  ${source}: ${count} 个素材`)
    })
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const fetcher = new MaterialFetcher()
  fetcher.run().catch(error => {
    console.error('❌ 脚本执行失败:', error)
    process.exit(1)
  })
}

export default MaterialFetcher
