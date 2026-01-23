/**
 * VidSlide AI - 翻译服务模块
 * 集成百度翻译API，提供中英文翻译功能
 */

/**
 * 百度翻译服务类
 * 提供文本翻译功能，支持中英文互译
 */
export class TranslationService {
  /**
   * 创建翻译服务实例
   * @param {Object} config - 配置对象
   */
  constructor(config = {}) {
    this.config = {
      appid: config.appid || '20251129002508451',
      key: config.key || '7HSjcjQ7aETcw0HqpMA7',
      from: config.from || 'zh', // 源语言
      to: config.to || 'en' // 目标语言
    }

    this.cache = new Map() // 翻译缓存
    this.cacheExpiry = 24 * 60 * 60 * 1000 // 24小时缓存
  }

  /**
   * 翻译文本
   * @param {string} text - 要翻译的文本
   * @param {Object} options - 翻译选项
   * @param {string} options.from - 源语言 (默认: auto)
   * @param {string} options.to - 目标语言 (默认: en)
   * @returns {Promise<string>} 翻译结果
   */
  async translate(text, options = {}) {
    if (!text || text.trim() === '') {
      return text
    }

    const from = options.from || this.config.from
    const to = options.to || this.config.to
    const cacheKey = `${from}_${to}_${text}`

    // 检查缓存
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const translatedText = await this.callBaiduAPI(text, from, to)

      // 缓存结果
      this.setCache(cacheKey, translatedText)

      return translatedText
    } catch (error) {
      console.error('翻译失败:', error)

      // 翻译失败时返回原文
      return text
    }
  }

  /**
   * 调用百度翻译API
   * @param {string} text - 要翻译的文本
   * @param {string} from - 源语言
   * @param {string} to - 目标语言
   * @returns {Promise<string>} 翻译结果
   */
  async callBaiduAPI(text, from, to) {
    const { appid, key, secret } = this.config

    // 使用新的AI文本翻译API (Bearer Token鉴权)
    const requestBody = {
      appid: appid,
      from: from,
      to: to,
      q: text
    }

    const response = await fetch('https://fanyi-api.baidu.com/ait/api/aiTextTranslate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`百度翻译API错误: ${response.status}`)
    }

    const data = await response.json()

    if (data.error_code) {
      throw new Error(`翻译API错误: ${data.error_msg}`)
    }

    if (!data.trans_result || data.trans_result.length === 0) {
      throw new Error('翻译结果为空')
    }

    return data.trans_result[0].dst
  }

  /**
   * 生成百度翻译API签名
   * @param {string} appid - 应用ID
   * @param {string} text - 文本
   * @param {string} salt - 随机数
   * @param {string} key - 密钥
   * @returns {string} MD5签名
   */
  generateSign(appid, text, salt, key) {
    const str = appid + text + salt + key
    return this.md5(str)
  }

  /**
   * 简单的MD5实现 (实际项目中应该使用crypto-js等库)
   * 注意: 这是一个简化的实现，生产环境建议使用专业的MD5库
   * @param {string} str - 要哈希的字符串
   * @returns {string} MD5哈希值
   */
  md5(str) {
    // 简化的MD5实现，仅用于演示
    // 生产环境应该使用crypto-js或类似的库
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * 批量翻译
   * @param {Array<string>} texts - 要翻译的文本数组
   * @param {Object} options - 翻译选项
   * @returns {Promise<Array<string>>} 翻译结果数组
   */
  async translateBatch(texts, options = {}) {
    const results = []

    // 限制并发数量，避免API限制
    const batchSize = 5

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      const batchPromises = batch.map(text => this.translate(text, options))

      try {
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
      } catch (error) {
        console.error('批量翻译失败:', error)
        // 失败时返回原文
        results.push(...batch)
      }

      // 添加延迟，避免API限制
      if (i + batchSize < texts.length) {
        await this.delay(100)
      }
    }

    return results
  }

  /**
   * 检测文本语言
   * @param {string} text - 要检测的文本
   * @returns {Promise<string>} 检测到的语言代码
   */
  async detectLanguage(text) {
    // 简化的语言检测
    // 生产环境可以使用更复杂的算法或第三方服务
    const chineseRegex = /[\u4e00-\u9fa5]/
    const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/
    const koreanRegex = /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/

    if (chineseRegex.test(text)) {
      return 'zh'
    } else if (japaneseRegex.test(text)) {
      return 'jp'
    } else if (koreanRegex.test(text)) {
      return 'kor'
    } else {
      return 'en'
    }
  }

  /**
   * 获取翻译缓存
   * @param {string} key - 缓存键
   * @returns {string|null} 缓存的翻译结果
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
   * 设置翻译缓存
   * @param {string} key - 缓存键
   * @param {string} data - 翻译结果
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 清除翻译缓存
   */
  clearCache() {
    this.cache.clear()
    console.log('翻译缓存已清除')
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise} 延迟Promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取服务状态
   * @returns {Object} 服务状态信息
   */
  getStatus() {
    return {
      configured: !!(this.config.appid && this.config.key),
      cacheSize: this.cache.size,
      cacheExpiry: this.cacheExpiry
    }
  }
}

/**
 * 默认翻译服务实例
 */
let defaultTranslationService = null

/**
 * 获取默认翻译服务实例
 * @returns {TranslationService} 翻译服务实例
 */
export function getTranslationService() {
  if (!defaultTranslationService) {
    defaultTranslationService = new TranslationService()
  }
  return defaultTranslationService
}

/**
 * 配置翻译服务
 * @param {Object} config - 配置对象
 */
export function configureTranslationService(config) {
  defaultTranslationService = new TranslationService(config)
}

export default TranslationService
