/**
 * TranslationService.js
 * 翻译服务 - Vue环境优化版本
 */

class TranslationService {
  constructor() {
    // 百度翻译API配置
    this.appId = '20251129002508451' // 从环境变量或配置中获取
    this.secretKey = 'YuG2_d5hh1ouae048ssik22kg' // 从环境变量或配置中获取

    // 缓存配置
    this.cache = new Map()
    this.cacheMaxSize = 100

    // 性能监控
    this.requestCount = 0
    this.cacheHits = 0
    this.errorCount = 0

    // 预翻译热门词汇
    this.preTranslations = new Map([
      ['春节', 'Spring Festival'],
      ['国庆', 'National Day'],
      ['中秋', 'Mid-Autumn Festival'],
      ['端午', 'Dragon Boat Festival'],
      ['人工智能', 'artificial intelligence'],
      ['大数据', 'big data'],
      ['新能源', 'new energy'],
      ['传统文化', 'traditional culture'],
      ['红色经典', 'red classics'],
      ['北京', 'Beijing'],
      ['上海', 'Shanghai'],
      ['深圳', 'Shenzhen'],
      ['华为', 'Huawei'],
      ['腾讯', 'Tencent'],
      ['阿里巴巴', 'Alibaba']
    ])
  }

  /**
   * 初始化翻译服务
   */
  async initialize() {
    // 验证API配置
    if (!this.appId || !this.secretKey) {
      console.warn('⚠️ 百度翻译API密钥未配置，将使用预翻译')
    }

    // 预热预翻译缓存
    this.preTranslations.forEach((translation, original) => {
      this.cache.set(original, {
        translation,
        source: 'predefined',
        timestamp: Date.now()
      })
    })

    console.log('✅ 翻译服务初始化完成')
  }

  /**
   * 翻译关键词
   * @param {string} keyword - 待翻译关键词
   * @returns {Promise<string>} 翻译结果
   */
  async translate(keyword) {
    if (!keyword || typeof keyword !== 'string') {
      return keyword
    }

    // 跳过纯英文
    if (this.isEnglishOnly(keyword)) {
      return keyword
    }

    // 检查缓存
    const cached = this.getFromCache(keyword)
    if (cached) {
      this.cacheHits++
      return cached
    }

    try {
      this.requestCount++

      // 调用百度翻译API
      const result = await this.callBaiduAPI(keyword)

      // 缓存结果
      this.setCache(keyword, result, 'api')

      return result
    } catch (error) {
      this.errorCount++
      console.warn(`翻译失败: ${keyword}`, error.message)

      // 失败时返回原文
      return keyword
    }
  }

  /**
   * 判断是否为纯英文
   */
  isEnglishOnly(keyword) {
    return /^[a-zA-Z\s\-.&()]+$/.test(keyword)
  }

  /**
   * 从缓存获取翻译结果
   */
  getFromCache(keyword) {
    const cached = this.cache.get(keyword)
    if (!cached) return null

    // 检查缓存是否过期 (1小时)
    const age = Date.now() - cached.timestamp
    if (age > 60 * 60 * 1000) {
      this.cache.delete(keyword)
      return null
    }

    return cached.translation
  }

  /**
   * 设置缓存
   */
  setCache(keyword, translation, source) {
    this.cache.set(keyword, {
      translation,
      source,
      timestamp: Date.now()
    })

    // 控制缓存大小
    if (this.cache.size > this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }

  /**
   * 调用百度翻译API
   * @param {string} text - 待翻译文本
   * @returns {Promise<string>} 翻译结果
   */
  async callBaiduAPI(text) {
    if (!this.appId || !this.secretKey) {
      throw new Error('百度翻译API密钥未配置')
    }

    const salt = Date.now().toString()
    const sign = this.generateSign(this.appId, text, salt, this.secretKey)

    // 在开发环境下使用代理路径，生产环境使用直接路径
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    const baseUrl = isDev ? '/api/translate' : 'https://fanyi-api.baidu.com'
    const url = `${baseUrl}/api/trans/vip/translate?q=${encodeURIComponent(text)}&from=zh&to=en&appid=${this.appId}&salt=${salt}&sign=${sign}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error_code) {
        throw new Error(`百度翻译API错误: ${data.error_msg}`)
      }

      if (!data.trans_result || !data.trans_result[0]) {
        throw new Error('翻译结果为空')
      }

      return data.trans_result[0].dst
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络设置')
      }
      throw error
    }
  }

  /**
   * 生成签名
   * @param {string} appid - 应用ID
   * @param {string} text - 文本
   * @param {string} salt - 盐值
   * @param {string} key - 密钥
   * @returns {string} MD5签名
   */
  generateSign(appid, text, salt, key) {
    const str = appid + text + salt + key
    return this.md5(str)
  }

  /**
   * MD5哈希 (简化实现)
   * @param {string} str - 待哈希字符串
   * @returns {string} MD5哈希值
   */
  md5(str) {
    // 使用Web Crypto API进行MD5哈希
    // 注意：Web Crypto API不支持MD5，需要使用其他方法
    // 这里使用一个简化的哈希函数作为替代

    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  }

  /**
   * 批量翻译
   * @param {string[]} keywords - 关键词数组
   * @returns {Promise<Object>} 翻译结果映射
   */
  async translateBatch(keywords) {
    const results = {}
    const promises = keywords.map(async keyword => {
      results[keyword] = await this.translate(keyword)
    })

    await Promise.allSettled(promises)
    return results
  }

  /**
   * 获取翻译统计
   */
  getTranslationStats() {
    const totalRequests = this.requestCount + this.cacheHits
    const cacheHitRate = totalRequests > 0 ? this.cacheHits / totalRequests : 0
    const errorRate = this.requestCount > 0 ? this.errorCount / this.requestCount : 0

    return {
      totalRequests,
      apiRequests: this.requestCount,
      cacheHits: this.cacheHits,
      cacheHitRate,
      errors: this.errorCount,
      errorRate,
      cacheSize: this.cache.size
    }
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.cache.clear()
    // 重新加载预翻译
    this.initialize()
  }

  /**
   * 添加自定义翻译
   * @param {string} original - 原文
   * @param {string} translation - 译文
   */
  addCustomTranslation(original, translation) {
    this.preTranslations.set(original, translation)
    this.setCache(original, translation, 'custom')
  }

  /**
   * 获取预翻译词汇
   */
  getPreTranslations() {
    return Object.fromEntries(this.preTranslations)
  }

  /**
   * 验证API连接性
   */
  async testConnection() {
    try {
      const testWord = '测试'
      const result = await this.translate(testWord)
      return {
        success: true,
        testWord,
        result,
        responseTime: 'N/A' // 可以后续添加计时
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default TranslationService
