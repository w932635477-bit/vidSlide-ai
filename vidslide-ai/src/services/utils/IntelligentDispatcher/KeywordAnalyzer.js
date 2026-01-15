/**
 * KeywordAnalyzer.js
 * 关键词智能分析器 - Vue环境优化版本
 */

class KeywordAnalyzer {
  constructor() {
    // 中文关键词特征模式
    this.chinesePatterns = [
      /[\u4e00-\u9fff]/, // 包含中文字符
      /春节|国庆|中秋|端午/, // 传统节日
      /人工智能|大数据|新能源/, // 科技热点
      /传统文化|红色经典/, // 文化内容
      /北京|上海|深圳|杭州/, // 主要城市
      /华为|腾讯|阿里巴巴|字节跳动/, // 中文品牌
      /高铁|共享单车|网购|直播/, // 中式特色
      /中医|书法|京剧|古筝/ // 传统文化
    ]

    // 英文关键词特征模式
    this.englishPatterns = [
      /^[a-zA-Z\s\-.&()]+$/, // 纯英文组合
      /nature|landscape|scenery|mountain/, // 自然风景
      /technology|digital|innovation|ai/, // 科技主题
      /business|corporate|finance|startup/, // 商业金融
      /food|restaurant|cuisine|cooking/, // 美食餐饮
      /travel|vacation|destination|journey/, // 旅游
      /art|design|creative|photography/, // 艺术设计
      /sports|fitness|health|wellness/, // 体育健康
      /education|learning|teaching|school/, // 教育
      /music|concert|performance|instrument/ // 音乐
    ]

    // 缓存分析结果
    this.analysisCache = new Map()
    this.cacheMaxSize = 200
  }

  /**
   * 分析关键词特征
   * @param {string} keyword - 关键词
   * @returns {Object} 分析结果
   */
  analyze(keyword) {
    if (!keyword || typeof keyword !== 'string') {
      throw new Error('关键词必须是非空字符串')
    }

    // 检查缓存
    const cacheKey = keyword.toLowerCase().trim()
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)
    }

    const result = {
      original: keyword,
      normalized: keyword, // 保留原始内容，不trim
      length: keyword.length,
      chineseChars: this.countChineseChars(keyword),
      englishChars: this.countEnglishChars(keyword),
      chineseRatio: 0,
      englishRatio: 0,
      language: 'unknown',
      confidence: 0,
      category: 'unknown',
      patterns: [],
      features: {}
    }

    // 计算语言比例
    result.chineseRatio = result.chineseChars / result.length
    result.englishRatio = result.englishChars / result.length

    // 确定主要语言
    if (result.chineseChars > 0 && result.englishChars > 0) {
      // 同时包含中英文字符
      result.language = 'mixed'
      result.confidence = Math.min((result.chineseRatio + result.englishRatio) * 0.8, 1)
    } else if (result.chineseChars > 0) {
      // 只有中文字符
      result.language = 'chinese'
      result.confidence = Math.min(result.chineseRatio * 1.2, 1)
    } else if (result.englishChars > 0) {
      // 只有英文字符（可能包含数字和符号）
      result.language = 'english'
      result.confidence = Math.min(result.englishRatio * 1.2, 1)
    } else {
      // 没有中英文字符（纯数字或符号）
      result.language = 'mixed'
      result.confidence = 0.5
    }

    // 匹配模式
    result.patterns = this.matchPatterns(keyword)
    result.category = this.categorizeKeyword(keyword, result.patterns)

    // 提取特征
    result.features = this.extractFeatures(keyword, result)

    // 缓存结果
    this.updateCache(cacheKey, result)

    return result
  }

  /**
   * 统计中文字符数
   */
  countChineseChars(str) {
    return (str.match(/[\u4e00-\u9fff]/g) || []).length
  }

  /**
   * 统计英文字符数
   */
  countEnglishChars(str) {
    return (str.match(/[a-zA-Z]/g) || []).length
  }

  /**
   * 匹配模式
   */
  matchPatterns(keyword) {
    const patterns = []

    // 中文模式匹配
    for (const pattern of this.chinesePatterns) {
      if (pattern.test(keyword)) {
        patterns.push({
          type: 'chinese',
          pattern: pattern.source,
          matched: true,
          weight: this.getPatternWeight(pattern, 'chinese')
        })
      }
    }

    // 英文模式匹配
    for (const pattern of this.englishPatterns) {
      if (pattern.test(keyword)) {
        patterns.push({
          type: 'english',
          pattern: pattern.source,
          matched: true,
          weight: this.getPatternWeight(pattern, 'english')
        })
      }
    }

    return patterns
  }

  /**
   * 获取模式权重
   */
  getPatternWeight(pattern, type) {
    // 根据模式的重要性设置权重
    const weights = {
      chinese: {
        '春节|国庆|中秋|端午': 0.9, // 节日高权重
        '人工智能|大数据|新能源': 0.8, // 科技热点
        '华为|腾讯|阿里巴巴': 0.8, // 品牌
        '北京|上海|深圳': 0.7 // 城市
      },
      english: {
        'nature|landscape|scenery': 0.8, // 自然风景
        'technology|digital|ai': 0.9, // 科技
        'business|corporate': 0.7, // 商业
        'food|restaurant': 0.6 // 美食
      }
    }

    const typeWeights = weights[type] || {}
    for (const [key, weight] of Object.entries(typeWeights)) {
      if (pattern.source.includes(key)) {
        return weight
      }
    }

    return 0.5 // 默认权重
  }

  /**
   * 分类关键词
   */
  categorizeKeyword(keyword, patterns) {
    // 根据匹配的模式确定类别
    const chineseMatches = patterns.filter(p => p.type === 'chinese')
    const englishMatches = patterns.filter(p => p.type === 'english')

    // 检查是否同时包含中英文字符
    const hasChinese = this.countChineseChars(keyword) > 0
    const hasEnglish = this.countEnglishChars(keyword) > 0

    // 如果同时包含中英文字符，优先返回mixed
    if (hasChinese && hasEnglish) {
      return 'mixed'
    }

    if (chineseMatches.length > englishMatches.length) {
      return 'chinese_dominant'
    } else if (englishMatches.length > chineseMatches.length) {
      return 'english_dominant'
    } else if (chineseMatches.length > 0 || englishMatches.length > 0) {
      return 'mixed_with_patterns'
    } else {
      return 'neutral'
    }
  }

  /**
   * 提取关键词特征
   */
  extractFeatures(keyword, analysis) {
    return {
      // 长度特征
      length: {
        short: keyword.length <= 2,
        medium: keyword.length <= 6,
        long: keyword.length > 6
      },

      // 复杂度特征
      complexity: {
        simple: analysis.patterns.length === 0,
        moderate: analysis.patterns.length <= 2,
        complex: analysis.patterns.length > 2
      },

      // 专业度特征
      professionalism: this.assessProfessionalism(keyword, analysis),

      // 时效性特征
      timeliness: this.assessTimeliness(keyword),

      // 情感特征
      sentiment: this.assessSentiment(keyword)
    }
  }

  /**
   * 评估专业度
   */
  assessProfessionalism(keyword, analysis) {
    const professionalTerms = [
      '技术',
      '科技',
      '创新',
      '研究',
      '发展',
      '系统',
      '平台',
      '人工智能',
      '大数据',
      '新能源',
      'technology',
      'research',
      'development',
      'system',
      'platform',
      'ai',
      'artificial intelligence'
    ]

    const hasProfessionalTerms = professionalTerms.some(term =>
      keyword.toLowerCase().includes(term.toLowerCase())
    )

    if (hasProfessionalTerms) return 'high'
    // 只有匹配到专业相关的模式才返回medium，排除通用的中文字符模式
    const professionalPatterns = analysis.patterns.filter(p =>
      p.pattern !== '[\\u4e00-\\u9fff]' && p.pattern !== '^[a-zA-Z\\s\\-.&()]+$'
    )
    if (professionalPatterns.length > 0) return 'medium'
    return 'low'
  }

  /**
   * 评估时效性
   */
  assessTimeliness(keyword) {
    const timelyTerms = [
      '最新',
      '刚刚',
      '今天',
      '昨日',
      '本周',
      '本月',
      '最新',
      '刚刚',
      '今天',
      '昨日',
      '本周',
      '本月',
      'new',
      'latest',
      'today',
      'yesterday',
      'this week',
      'this month'
    ]

    const hasTimelyTerms = timelyTerms.some(term =>
      keyword.toLowerCase().includes(term.toLowerCase())
    )

    return hasTimelyTerms ? 'high' : 'low'
  }

  /**
   * 评估情感倾向
   */
  assessSentiment(keyword) {
    const positiveTerms = [
      '美好',
      '优秀',
      '成功',
      '创新',
      '发展',
      'beautiful',
      'excellent',
      'success'
    ]
    const negativeTerms = [
      '问题',
      '困难',
      '挑战',
      '危机',
      'problem',
      'difficult',
      'challenge',
      'crisis'
    ]

    const hasPositive = positiveTerms.some(term => keyword.includes(term))
    const hasNegative = negativeTerms.some(term => keyword.includes(term))

    if (hasPositive && !hasNegative) return 'positive'
    if (hasNegative && !hasPositive) return 'negative'
    return 'neutral'
  }

  /**
   * 更新缓存
   */
  updateCache(key, result) {
    this.analysisCache.set(key, result)

    // 控制缓存大小
    if (this.analysisCache.size > this.cacheMaxSize) {
      const firstKey = this.analysisCache.keys().next().value
      this.analysisCache.delete(firstKey)
    }
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.analysisCache.clear()
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      size: this.analysisCache.size,
      maxSize: this.cacheMaxSize,
      hitRate: 'N/A' // 需要外部跟踪
    }
  }
}

export default KeywordAnalyzer
