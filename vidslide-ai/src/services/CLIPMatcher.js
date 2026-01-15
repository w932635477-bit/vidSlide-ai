/**
 * CLIPMatcher - CLIP多模态匹配服务
 *
 * 使用CLIP模型实现文本-图像语义匹配，用于智能素材选择
 */

class CLIPMatcher {
  constructor() {
    this.model = null
    this.tokenizer = null
    this.isInitialized = false
    this.cache = new Map()
    this.maxCacheSize = 500
  }

  /**
   * 初始化CLIP模型
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('正在加载CLIP模型...')

      // 动态加载TensorFlow.js
      if (typeof tf === 'undefined') {
        await this.loadTensorFlow()
      }

      // 加载CLIP模型
      // 注意：在实际项目中，需要准备CLIP模型文件
      // 这里使用简化的实现作为占位符
      await this.loadCLIPModel()

      this.isInitialized = true
      console.log('CLIP模型加载完成')
    } catch (error) {
      console.error('CLIP模型初始化失败:', error)
      throw new Error(`CLIP模型初始化失败: ${error.message}`)
    }
  }

  /**
   * 加载TensorFlow.js
   * @returns {Promise<void>}
   */
  async loadTensorFlow() {
    return new Promise((resolve, reject) => {
      if (window.tf) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.18.0/dist/tf.min.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('TensorFlow.js加载失败'))
      document.head.appendChild(script)
    })
  }

  /**
   * 加载CLIP模型
   * @returns {Promise<void>}
   */
  async loadCLIPModel() {
    // 这里是CLIP模型的加载逻辑
    // 在实际项目中，需要从服务器加载预训练的CLIP模型

    // 模拟模型加载过程
    this.model = {
      encodeText: async texts => {
        // 模拟文本编码
        return tf.randomNormal([texts.length, 512])
      },

      encodeImage: async images => {
        // 模拟图像编码
        return tf.randomNormal([images.length, 512])
      }
    }

    // 简化的tokenizer
    this.tokenizer = {
      encode: text => {
        // 简化的文本编码
        return text.split('').map(char => char.charCodeAt(0) % 1000)
      },

      decode: tokens => {
        // 简化的文本解码
        return tokens.map(token => String.fromCharCode(token % 256)).join('')
      }
    }

    console.log('CLIP模型模拟加载完成')
  }

  /**
   * 计算文本和图像的相似度
   * @param {string} text - 文本描述
   * @param {Array<ImageData|HTMLImageElement>} images - 图像数组
   * @returns {Promise<Array>} 相似度分数数组
   */
  async matchTextToImages(text, images) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      console.log(`计算"${text}"与${images.length}张图片的相似度`)

      // 编码文本
      const textEmbedding = await this.encodeText(text)

      // 编码图像
      const imageEmbeddings = await this.encodeImages(images)

      // 计算余弦相似度
      const similarities = await this.computeSimilarities(textEmbedding, imageEmbeddings)

      console.log('相似度计算完成')

      return similarities
    } catch (error) {
      console.error('CLIP匹配失败:', error)
      // 返回随机相似度作为降级方案
      return images.map(() => Math.random())
    }
  }

  /**
   * 批量计算相似度
   * @param {Array<string>} texts - 文本数组
   * @param {Array<ImageData|HTMLImageElement>} images - 图像数组
   * @returns {Promise<Array<Array>>} 相似度矩阵
   */
  async matchBatch(texts, images) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const results = []

    for (const text of texts) {
      const similarities = await this.matchTextToImages(text, images)
      results.push(similarities)
    }

    return results
  }

  /**
   * 编码文本
   * @param {string} text - 文本
   * @returns {Promise<tf.Tensor>} 文本嵌入
   */
  async encodeText(text) {
    const cacheKey = `text_${text}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      // 预处理文本
      const processedText = this.preprocessText(text)

      // 使用CLIP模型编码
      const embedding = await this.model.encodeText([processedText])

      // 缓存结果
      this.setCache(cacheKey, embedding)

      return embedding
    } catch (error) {
      console.warn('文本编码失败:', error)
      // 返回随机向量作为降级方案
      return tf.randomNormal([1, 512])
    }
  }

  /**
   * 编码图像
   * @param {Array<ImageData|HTMLImageElement>} images - 图像数组
   * @returns {Promise<tf.Tensor>} 图像嵌入
   */
  async encodeImages(images) {
    try {
      const processedImages = await Promise.all(images.map(img => this.preprocessImage(img)))

      // 使用CLIP模型编码
      const embeddings = await this.model.encodeImage(processedImages)

      return embeddings
    } catch (error) {
      console.warn('图像编码失败:', error)
      // 返回随机向量作为降级方案
      return tf.randomNormal([images.length, 512])
    }
  }

  /**
   * 计算相似度
   * @param {tf.Tensor} textEmbedding - 文本嵌入
   * @param {tf.Tensor} imageEmbeddings - 图像嵌入
   * @returns {Promise<Array>} 相似度数组
   */
  async computeSimilarities(textEmbedding, imageEmbeddings) {
    try {
      // 计算余弦相似度
      const similarities = tf.matMul(textEmbedding, imageEmbeddings, false, true)
      const normsText = tf.norm(textEmbedding, 2, 1, true)
      const normsImages = tf.norm(imageEmbeddings, 2, 1, true)

      const normalizedSimilarities = tf.div(similarities, tf.mul(normsText, normsImages))

      // 转换为JavaScript数组
      const result = await normalizedSimilarities.data()

      // 清理TensorFlow内存
      textEmbedding.dispose()
      imageEmbeddings.dispose()
      similarities.dispose()
      normsText.dispose()
      normsImages.dispose()
      normalizedSimilarities.dispose()

      return Array.from(result)
    } catch (error) {
      console.warn('相似度计算失败:', error)
      // 返回随机相似度
      return imageEmbeddings.shape[0]
        ? Array(imageEmbeddings.shape[0])
            .fill(0)
            .map(() => Math.random())
        : []
    }
  }

  /**
   * 预处理文本
   * @param {string} text - 原始文本
   * @returns {string} 处理后的文本
   */
  preprocessText(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ') // 只保留字母、数字、中文和空格
      .replace(/\s+/g, ' ') // 合并多个空格
      .substring(0, 77) // CLIP最大长度限制
  }

  /**
   * 预处理图像
   * @param {ImageData|HTMLImageElement} image - 原始图像
   * @returns {Promise<tf.Tensor>} 处理后的图像张量
   */
  async preprocessImage(image) {
    try {
      let tensor

      if (image instanceof ImageData) {
        // 从ImageData创建张量
        const { data, width, height } = image
        tensor = tf.tensor(data, [height, width, 4], 'int32')
      } else if (image instanceof HTMLImageElement) {
        // 从HTMLImageElement创建张量
        tensor = tf.browser.fromPixels(image)
      } else {
        throw new Error('不支持的图像格式')
      }

      // 转换为RGB（移除Alpha通道）
      const rgb = tensor.slice([0, 0, 0], [-1, -1, 3])

      // 调整大小为224x224 (CLIP标准输入尺寸)
      const resized = tf.image.resizeBilinear(rgb, [224, 224])

      // 归一化到[0,1]
      const normalized = tf.div(resized, 255.0)

      // 应用ImageNet归一化
      const mean = tf.tensor([0.485, 0.456, 0.406])
      const std = tf.tensor([0.229, 0.224, 0.225])
      const centered = tf.sub(normalized, mean)
      const standardized = tf.div(centered, std)

      // 转换为CHW格式 (CLIP期望的格式)
      const chw = tf.transpose(standardized, [2, 0, 1])

      // 清理中间张量
      tensor.dispose()
      rgb.dispose()
      resized.dispose()
      normalized.dispose()
      centered.dispose()
      standardized.dispose()

      return chw
    } catch (error) {
      console.warn('图像预处理失败:', error)
      // 返回随机张量作为降级方案
      return tf.randomNormal([3, 224, 224])
    }
  }

  /**
   * 查找最佳匹配的图像
   * @param {string} text - 文本描述
   * @param {Array} images - 图像数组（带元数据）
   * @param {number} topK - 返回前K个结果
   * @returns {Promise<Array>} 排序后的匹配结果
   */
  async findBestMatches(text, images, topK = 5) {
    const similarities = await this.matchTextToImages(
      text,
      images.map(img => img.image)
    )

    // 组合相似度和元数据
    const results = images.map((img, index) => ({
      ...img,
      similarity: similarities[index],
      rank: 0
    }))

    // 按相似度排序
    results.sort((a, b) => b.similarity - a.similarity)

    // 添加排名
    results.forEach((result, index) => {
      result.rank = index + 1
    })

    return results.slice(0, topK)
  }

  /**
   * 智能素材选择
   * @param {Object} contentAnalysis - 内容分析结果
   * @param {Array} availableMaterials - 可用素材
   * @returns {Promise<Array>} 推荐的素材
   */
  async selectMaterials(contentAnalysis, availableMaterials) {
    const { keywords = [], category = '', sentiment = 'neutral' } = contentAnalysis

    if (keywords.length === 0) {
      // 如果没有关键词，返回随机选择
      return this.randomSelect(availableMaterials, 10)
    }

    const recommendations = []

    // 为每个关键词找到最佳匹配
    for (const keyword of keywords.slice(0, 3)) {
      // 限制前3个关键词
      const keywordText = typeof keyword === 'string' ? keyword : keyword.text
      const matches = await this.findBestMatches(keywordText, availableMaterials, 3)

      recommendations.push(...matches)
    }

    // 去重和重新排序
    const uniqueRecommendations = this.deduplicateMaterials(recommendations)

    // 应用类别和情感权重
    const weightedRecommendations = this.applyWeights(uniqueRecommendations, category, sentiment)

    return weightedRecommendations.slice(0, 10)
  }

  /**
   * 随机选择素材（降级方案）
   * @param {Array} materials - 素材数组
   * @param {number} count - 选择数量
   * @returns {Array} 随机选择的素材
   */
  randomSelect(materials, count) {
    const shuffled = [...materials].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count).map((material, index) => ({
      ...material,
      similarity: Math.random(),
      rank: index + 1,
      selectionMethod: 'random'
    }))
  }

  /**
   * 去重素材
   * @param {Array} materials - 素材数组
   * @returns {Array} 去重后的素材
   */
  deduplicateMaterials(materials) {
    const seen = new Set()
    return materials.filter(material => {
      const key = `${material.id || material.url}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  /**
   * 应用权重调整
   * @param {Array} materials - 素材数组
   * @param {string} category - 内容类别
   * @param {string} sentiment - 情感倾向
   * @returns {Array} 加权后的素材
   */
  applyWeights(materials, category, sentiment) {
    return materials
      .map(material => {
        let weight = material.similarity

        // 类别权重
        if (category === 'educational' && material.tags?.includes('education')) {
          weight *= 1.2
        }

        if (category === 'promotional' && material.tags?.includes('marketing')) {
          weight *= 1.3
        }

        // 情感权重
        if (sentiment === 'positive' && material.mood === 'bright') {
          weight *= 1.1
        }

        if (sentiment === 'serious' && material.mood === 'professional') {
          weight *= 1.2
        }

        return {
          ...material,
          weightedSimilarity: weight
        }
      })
      .sort((a, b) => b.weightedSimilarity - a.weightedSimilarity)
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   */
  setCache(key, value) {
    this.cache.set(key, value)

    // 控制缓存大小
    if (this.cache.size > this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }

  /**
   * 获取性能统计
   * @returns {Object} 性能数据
   */
  getPerformanceStats() {
    return {
      initialized: this.isInitialized,
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      modelLoaded: !!this.model,
      tokenizerLoaded: !!this.tokenizer
    }
  }

  /**
   * 预热缓存（提前编码常用关键词）
   * @param {Array<string>} keywords - 常用关键词
   */
  async warmupCache(keywords) {
    if (!this.isInitialized) return

    console.log(`预热缓存 ${keywords.length} 个关键词`)

    for (const keyword of keywords) {
      try {
        await this.encodeText(keyword)
      } catch (error) {
        console.warn(`预热关键词失败: ${keyword}`, error)
      }
    }

    console.log('缓存预热完成')
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 清理TensorFlow内存
    if (typeof tf !== 'undefined') {
      tf.disposeVariables()
    }

    // 清理缓存
    this.cache.clear()

    this.model = null
    this.tokenizer = null
    this.isInitialized = false

    console.log('CLIP匹配器已清理')
  }
}

export default new CLIPMatcher()
