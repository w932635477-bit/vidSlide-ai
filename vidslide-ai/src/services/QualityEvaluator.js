/**
 * 质量评估服务
 * 负责评估素材匹配质量和搜索结果质量
 */

class QualityEvaluator {
  constructor() {
    this.industryMap = {
      科技: [
        'technology',
        'tech',
        'digital',
        'innovation',
        'ai',
        'software',
        'hardware',
        '数字',
        '创新',
        '智能'
      ],
      教育: [
        'education',
        'learning',
        'teaching',
        'school',
        'university',
        'student',
        '学习',
        '教学',
        '学校',
        '大学'
      ],
      金融: [
        'finance',
        'money',
        'banking',
        'investment',
        'stock',
        'economy',
        '金融',
        '投资',
        '银行',
        '经济'
      ],
      医疗: [
        'medical',
        'health',
        'healthcare',
        'hospital',
        'doctor',
        'medicine',
        '医疗',
        '健康',
        '医院',
        '医生'
      ],
      商务: [
        'business',
        'office',
        'meeting',
        'corporate',
        'professional',
        '商务',
        '办公',
        '会议',
        '企业'
      ],
      旅游: [
        'travel',
        'tourism',
        'vacation',
        'destination',
        'hotel',
        '旅游',
        '度假',
        '酒店',
        '景点'
      ],
      美食: ['food', 'restaurant', 'cuisine', 'cooking', 'dining', '美食', '餐厅', '烹饪', '饮食'],
      时尚: ['fashion', 'style', 'clothing', 'design', 'trend', '时尚', '服装', '设计', '潮流'],
      体育: ['sports', 'fitness', 'exercise', 'athlete', 'game', '体育', '健身', '运动', '比赛'],
      娱乐: ['entertainment', 'movie', 'music', 'game', 'show', '娱乐', '电影', '音乐', '游戏']
    }

    this.specializedTerms = [
      'elon',
      'musk',
      'tesla',
      'spacex',
      '马斯克',
      '特斯拉',
      'SpaceX',
      '华为',
      '小米',
      '腾讯',
      '阿里巴巴',
      '字节跳动',
      'trump',
      'biden',
      'putin',
      'zelenskyy',
      '奥运',
      '世锦赛',
      '欧冠',
      'NBA',
      'CBA'
    ]
  }

  /**
   * 评估搜索结果是否需要外部获取
   * @param {Object} localResults - 本地搜索结果
   * @param {string} query - 查询关键词
   * @param {Object} context - 上下文信息
   * @returns {Object} 评估结果
   */
  evaluateSearchResults(localResults, query, context = {}) {
    const materials = localResults.materials
    const keywords = query.split(/[\s,，]+/).filter(k => k.length > 0)

    // 规则1: 结果数量不足
    if (materials.length < 2) {
      return {
        shouldFetchExternal: true,
        reason: 'insufficient_local_results',
        confidence: 0.9
      }
    }

    // 规则2: 平均匹配质量太低
    const avgScore =
      materials.reduce((sum, m) => sum + (m.relevanceScore || 0), 0) / materials.length
    if (avgScore < 0.3) {
      return {
        shouldFetchExternal: true,
        reason: 'low_match_quality',
        confidence: 0.8
      }
    }

    // 规则3: 关键词覆盖不足
    const coveredKeywords = new Set()
    materials.forEach(material => {
      if (material.matchReason) {
        keywords.forEach(keyword => {
          if (material.matchReason.toLowerCase().includes(keyword.toLowerCase())) {
            coveredKeywords.add(keyword)
          }
        })
      }
    })

    const coverage = coveredKeywords.size / keywords.length
    if (coverage < 0.5) {
      return {
        shouldFetchExternal: true,
        reason: 'insufficient_keyword_coverage',
        confidence: 0.7
      }
    }

    // 规则4: 特定领域内容
    if (this.isSpecializedDomain(query)) {
      if (materials.length < 5) {
        return {
          shouldFetchExternal: true,
          reason: 'specialized_domain_need_fresh',
          confidence: 0.6
        }
      }
    }

    // 规则5: 用户明确要求
    if (context.forceExternal) {
      return {
        shouldFetchExternal: true,
        reason: 'user_requested',
        confidence: 1.0
      }
    }

    return {
      shouldFetchExternal: false,
      reason: 'local_sufficient',
      confidence: 0.9
    }
  }

  /**
   * 基于调度器决策评估搜索结果
   * @param {Object} localResults - 本地搜索结果
   * @param {string} query - 查询关键词
   * @param {Object} context - 上下文信息
   * @param {Object} dispatchDecision - 调度器决策
   * @returns {Object} 评估结果
   */
  evaluateSearchResultsWithDispatcher(localResults, query, context, dispatchDecision) {
    const materials = localResults.materials

    // 如果调度器推荐不需要翻译的平台，直接使用原有逻辑
    if (!dispatchDecision.translation && dispatchDecision.platforms.length === 1) {
      const platform = dispatchDecision.platforms[0]
      if (platform.name === 'baidu') {
        return this.evaluateSearchResults(localResults, query, context)
      }
    }

    // 如果调度器置信度很高，遵循调度器推荐
    if (dispatchDecision.confidence > 0.8) {
      const hasGoodLocalResults =
        materials.length >= 3 && materials.some(m => (m.relevanceScore || 0) > 0.7)

      if (!hasGoodLocalResults) {
        return {
          shouldFetchExternal: true,
          reason: `dispatcher_confidence_high_${dispatchDecision.strategy.name}`,
          confidence: dispatchDecision.confidence,
          recommendedPlatforms: dispatchDecision.platforms
        }
      }
    }

    // 调度器置信度中等，使用原有评估逻辑
    return this.evaluateSearchResults(localResults, query, context)
  }

  /**
   * 评估素材匹配质量
   * @param {Array} keywords - 关键词数组
   * @param {Array} materials - 素材数组
   * @returns {Promise<Array>} 评估后的素材数组
   */
  async evaluateMaterialsMatchQuality(keywords, materials) {
    const results = []

    for (const material of materials) {
      let matchType = 'none'
      let confidence = 0

      // 1. 精确匹配检查（≥90%）
      const exactMatch = this.isExactMatch(keywords, material)
      if (exactMatch.isMatch) {
        matchType = 'exact'
        confidence = exactMatch.confidence
      }
      // 2. 关键词相似度检查
      else {
        const keywordScore = this.calculateKeywordSimilarity(keywords, material)
        if (keywordScore >= 0.5) {
          matchType = 'keyword'
          confidence = keywordScore
        }
        // 3. 行业相关检查
        else {
          const industryMatch = this.isIndustryRelated(keywords, material)
          if (industryMatch.isMatch) {
            matchType = 'industry'
            confidence = industryMatch.confidence
          }
        }
      }

      if (matchType !== 'none') {
        results.push({
          ...material,
          matchType,
          confidence
        })
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * 精确匹配判断（≥90%）
   * @param {Array} keywords - 关键词数组
   * @param {Object} material - 素材对象
   * @returns {Object} 匹配结果
   */
  isExactMatch(keywords, material) {
    const materialText = [
      material.name,
      material.title,
      ...(material.tags || []),
      ...(material.keywords || [])
    ]
      .filter(Boolean)
      .map(t => t.toLowerCase())

    let matchCount = 0
    const matchedKeywords = []

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase()
      if (materialText.some(text => text === keywordLower || text.includes(keywordLower))) {
        matchCount++
        matchedKeywords.push(keyword)
      }
    }

    const matchRate = matchCount / keywords.length

    return {
      isMatch: matchRate >= 0.9,
      confidence: matchRate >= 0.9 ? 0.95 : matchRate,
      matchedKeywords,
      matchRate
    }
  }

  /**
   * 计算关键词相似度
   * @param {Array} keywords - 关键词数组
   * @param {Object} material - 素材对象
   * @returns {number} 相似度分数（0-1）
   */
  calculateKeywordSimilarity(keywords, material) {
    const materialText = [
      material.name,
      material.description,
      ...(material.tags || []),
      ...(material.keywords || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    let totalScore = 0
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase()
      if (materialText.includes(keywordLower)) {
        totalScore += 1
      } else {
        const words = keywordLower.split(/\s+/)
        const partialMatches = words.filter(word => materialText.includes(word)).length
        totalScore += (partialMatches / words.length) * 0.5
      }
    }

    return Math.min(totalScore / keywords.length, 1)
  }

  /**
   * 行业相关性判断
   * @param {Array} keywords - 关键词数组
   * @param {Object} material - 素材对象
   * @returns {Object} 匹配结果
   */
  isIndustryRelated(keywords, material) {
    // 检查关键词所属行业
    const keywordIndustries = new Set()
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase()
      for (const [industry, terms] of Object.entries(this.industryMap)) {
        if (terms.some(term => keywordLower.includes(term) || term.includes(keywordLower))) {
          keywordIndustries.add(industry)
        }
      }
    }

    // 检查素材所属行业
    const materialText = [
      material.name,
      material.description,
      material.industry,
      material.scene,
      ...(material.tags || []),
      ...(material.keywords || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const materialIndustries = new Set()
    for (const [industry, terms] of Object.entries(this.industryMap)) {
      if (terms.some(term => materialText.includes(term))) {
        materialIndustries.add(industry)
      }
    }

    // 计算行业交集
    const commonIndustries = [...keywordIndustries].filter(ind => materialIndustries.has(ind))

    const isMatch = commonIndustries.length > 0
    const confidence = isMatch ? 0.6 + commonIndustries.length * 0.1 : 0

    return {
      isMatch,
      confidence: Math.min(confidence, 0.85),
      keywordIndustries: Array.from(keywordIndustries),
      materialIndustries: Array.from(materialIndustries),
      commonIndustries
    }
  }

  /**
   * 判断是否为特定领域
   * @param {string} query - 查询关键词
   * @returns {boolean} 是否为特定领域
   */
  isSpecializedDomain(query) {
    return this.specializedTerms.some(term => query.toLowerCase().includes(term.toLowerCase()))
  }
}

// 导出单例实例
export default new QualityEvaluator()
