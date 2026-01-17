/**
 * 素材转换工具函数模块
 * 提供素材格式转换、图像处理等工具函数
 */

/**
 * 将外部图片数据转换为本地素材格式
 * @param {Object} image - 外部图片数据
 * @param {string} platform - 平台名称
 * @returns {Object} 本地素材格式
 */
export function convertImageToMaterial(image, platform) {
  return {
    id: `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category: 'external',
    subcategory: categorizeImage(image),
    industry: '通用',
    scene: '通用',
    style: '写实',
    name: image.title || image.description || '外部素材',
    type: 'image',
    tags: image.tags || [],
    keywords: [image.title, image.description].filter(Boolean),
    semanticTags: extractSemanticTags(image),
    relatedConcepts: [],
    contextKeywords: [],
    dataUrl: image.thumbnail || image.url,
    thumbnailUrl: image.thumbnail || image.url,
    fullUrl: image.url,
    dimensions: {
      width: image.width || 400,
      height: image.height || 300
    },
    aspectRatio: (image.width || 400) / (image.height || 300),
    source: platform,
    external: true,
    createdAt: new Date().toISOString(),
    usageCount: 0
  }
}

/**
 * 根据图片信息进行分类
 * @param {Object} image - 图片对象
 * @returns {string} 分类名称
 */
export function categorizeImage(image) {
  const title = (image.title + ' ' + (image.description || '')).toLowerCase()

  if (title.includes('portrait') || title.includes('face') || title.includes('人物')) {
    return '人物'
  }
  if (title.includes('nature') || title.includes('landscape') || title.includes('风景')) {
    return '风景'
  }
  if (title.includes('food') || title.includes('美食') || title.includes('饮食')) {
    return '美食'
  }
  if (title.includes('technology') || title.includes('科技') || title.includes('数字')) {
    return '科技'
  }
  if (title.includes('business') || title.includes('商务') || title.includes('商业')) {
    return '商务'
  }

  return '通用'
}

/**
 * 提取语义标签
 * @param {Object} image - 图片对象
 * @returns {Array<string>} 语义标签数组
 */
export function extractSemanticTags(image) {
  const tags = []
  const content = (image.title + ' ' + (image.description || '')).toLowerCase()

  if (content.includes('nature') || content.includes('自然')) tags.push('自然')
  if (content.includes('urban') || content.includes('城市')) tags.push('城市')
  if (content.includes('people') || content.includes('人物')) tags.push('人物')
  if (content.includes('food') || content.includes('美食')) tags.push('美食')
  if (content.includes('technology') || content.includes('科技')) tags.push('科技')
  if (content.includes('business') || content.includes('商务')) tags.push('商务')

  return tags
}

/**
 * 检测是否为中文查询
 * @param {string} query - 查询字符串
 * @returns {boolean} 是否为中文
 */
export function isChineseQuery(query) {
  const chineseRegex = /[\u4e00-\u9fff]/
  return chineseRegex.test(query)
}

/**
 * 生成缓存键
 * @param {string} query - 查询字符串
 * @param {Object} options - 选项对象
 * @returns {string} 缓存键
 */
export function generateCacheKey(query, options = {}) {
  const optionsStr = JSON.stringify(options)
  return `${query}_${optionsStr}`
}

/**
 * 将Blob转换为ImageData
 * @param {Blob} blob - 图片Blob
 * @returns {Promise<ImageData>} 图像数据
 */
export async function blobToImageData(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(blob)
  })
}

/**
 * 将HTMLImageElement转换为ImageData
 * @param {HTMLImageElement} img - 图片元素
 * @returns {Promise<ImageData>} 图像数据
 */
export async function imageToImageData(img) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    resolve(ctx.getImageData(0, 0, canvas.width, canvas.height))
  })
}

/**
 * 加载图片
 * @param {string} src - 图片源
 * @returns {Promise<HTMLImageElement>} 图片元素
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 预处理素材用于CLIP匹配
 * @param {Array} materials - 原始素材数组
 * @returns {Promise<Array>} 处理后的素材数组
 */
export async function preprocessMaterialsForCLIP(materials) {
  const processed = []

  for (const material of materials) {
    try {
      let image = null

      if (material.imageBlob) {
        image = await blobToImageData(material.imageBlob)
      } else if (material.thumbnail || material.url) {
        const img = await loadImage(material.thumbnail || material.url)
        image = await imageToImageData(img)
      }

      if (image) {
        processed.push({
          ...material,
          image,
          description: material.description || material.name || material.tags?.join(' ') || ''
        })
      }
    } catch (error) {
      console.warn(`预处理素材失败: ${material.id || material.name}`, error)
    }
  }

  return processed
}

/**
 * 从搜索结果确定平台
 * @param {Object} results - 搜索结果
 * @param {Object} options - 选项
 * @returns {string} 平台名称
 */
export function determinePlatformFromResults(results, options) {
  if (options.recommendedPlatforms && options.recommendedPlatforms.length > 0) {
    return options.recommendedPlatforms[0].name
  }

  if (results.source) {
    return results.source
  }

  return 'unknown'
}
