/**
 * SimpleNarrativeDetector - 简单叙事检测器
 *
 * 功能：
 * 1. 基于规则识别叙事模式
 * 2. 支持4种模式：sequential_reveal, comparison, timeline, basic
 * 3. 返回模式名称和置信度
 */

class SimpleNarrativeDetector {
  constructor() {
    // 定义4种叙事模式
    this.patterns = {
      sequential_reveal: {
        name: 'sequential_reveal',
        description: '顺序揭示：悬念 → 揭示 → 悬念 → 揭示',
        rules: [
          { check: 'hasSuspenseRevealPattern', weight: 0.5 },
          { check: 'hasMultipleConcepts', weight: 0.3 },
          { check: 'hasAlternatingTypes', weight: 0.2 }
        ]
      },
      comparison: {
        name: 'comparison',
        description: '对比模式：A vs B',
        rules: [
          { check: 'hasComparisonKeywords', weight: 0.4 },
          { check: 'hasMultipleConcepts', weight: 0.3 },
          { check: 'hasBalancedSegments', weight: 0.3 }
        ]
      },
      timeline: {
        name: 'timeline',
        description: '时间线：按时间顺序展开',
        rules: [
          { check: 'hasTimeKeywords', weight: 0.5 },
          { check: 'hasChronologicalOrder', weight: 0.3 },
          { check: 'hasMultipleTimePoints', weight: 0.2 }
        ]
      },
      basic: {
        name: 'basic',
        description: '基础模式：简单线性叙事',
        rules: []
      }
    }

    // 关键词库
    this.keywords = {
      suspense: ['什么', '呢', '？', '猜猜', '是什么', '会是'],
      comparison: ['对比', 'vs', '比较', '区别', '不同', '相同', '而', '但是'],
      time: ['年', '月', '日', '时期', '阶段', '第一', '第二', '第三', '接下来', '然后', '最后']
    }
  }

  /**
   * 检测叙事模式
   * @param {Object} analysisResult - 内容分析结果
   * @returns {Object} 模式信息 { name, confidence, description }
   */
  detect(analysisResult) {
    console.log('开始检测叙事模式...')

    // 1. 分析段落特征
    const stats = this.analyzeSegments(analysisResult.segments)

    // 2. 匹配模式
    const pattern = this.matchPattern(stats, analysisResult.segments)

    console.log(`✅ 检测到模式: ${pattern.name} (置信度: ${pattern.confidence})`)
    return pattern
  }

  /**
   * 分析段落特征
   */
  analyzeSegments(segments) {
    const stats = {
      totalSegments: segments.length,
      suspenseCount: 0,
      revealCount: 0,
      openingCount: 0,
      conclusionCount: 0,
      conceptCount: 0,
      uniqueConcepts: new Set(),
      hasTimeKeywords: false,
      hasComparisonKeywords: false,
      hasSuspenseRevealPattern: false,
      hasAlternatingTypes: false,
      hasMultipleConcepts: false,
      hasBalancedSegments: false,
      hasChronologicalOrder: false,
      hasMultipleTimePoints: false
    }

    // 统计段落类型
    segments.forEach(segment => {
      if (segment.type === 'suspense') stats.suspenseCount++
      if (segment.type === 'reveal') stats.revealCount++
      if (segment.type === 'opening') stats.openingCount++
      if (segment.type === 'conclusion') stats.conclusionCount++

      // 收集概念
      if (segment.concepts) {
        segment.concepts.forEach(concept => {
          stats.uniqueConcepts.add(concept)
        })
      }

      // 检测关键词
      const text = segment.text || ''
      if (this.containsKeywords(text, this.keywords.time)) {
        stats.hasTimeKeywords = true
      }
      if (this.containsKeywords(text, this.keywords.comparison)) {
        stats.hasComparisonKeywords = true
      }
    })

    stats.conceptCount = stats.uniqueConcepts.size

    // 检测悬念-揭示模式
    stats.hasSuspenseRevealPattern = this.checkSuspenseRevealPattern(segments)

    // 检测交替类型
    stats.hasAlternatingTypes = this.checkAlternatingTypes(segments)

    // 检测多个概念
    stats.hasMultipleConcepts = stats.conceptCount >= 2

    // 检测平衡段落
    stats.hasBalancedSegments = this.checkBalancedSegments(segments)

    // 检测时间顺序
    stats.hasChronologicalOrder = this.checkChronologicalOrder(segments)

    // 检测多个时间点
    stats.hasMultipleTimePoints = this.checkMultipleTimePoints(segments)

    return stats
  }

  /**
   * 匹配模式
   */
  matchPattern(stats, segments) {
    const scores = {}

    // 计算每个模式的得分
    for (const [patternName, pattern] of Object.entries(this.patterns)) {
      if (patternName === 'basic') continue // basic是默认模式

      let score = 0
      pattern.rules.forEach(rule => {
        if (stats[rule.check]) {
          score += rule.weight
        }
      })

      scores[patternName] = score
    }

    // 找到最高分的模式
    let bestPattern = 'basic'
    let bestScore = 0

    for (const [patternName, score] of Object.entries(scores)) {
      if (score > bestScore && score > 0.5) {
        // 阈值0.5
        bestPattern = patternName
        bestScore = score
      }
    }

    return {
      name: bestPattern,
      confidence: bestScore || 0.5,
      description: this.patterns[bestPattern].description,
      stats: stats
    }
  }

  /**
   * 检查文本是否包含关键词
   */
  containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword))
  }

  /**
   * 检查悬念-揭示模式
   */
  checkSuspenseRevealPattern(segments) {
    let suspenseRevealCount = 0

    for (let i = 0; i < segments.length - 1; i++) {
      if (segments[i].type === 'suspense' && segments[i + 1].type === 'reveal') {
        suspenseRevealCount++
      }
    }

    return suspenseRevealCount >= 2
  }

  /**
   * 检查交替类型
   */
  checkAlternatingTypes(segments) {
    if (segments.length < 3) return false

    let alternatingCount = 0
    for (let i = 0; i < segments.length - 1; i++) {
      if (segments[i].type !== segments[i + 1].type) {
        alternatingCount++
      }
    }

    return alternatingCount / (segments.length - 1) > 0.6
  }

  /**
   * 检查平衡段落
   */
  checkBalancedSegments(segments) {
    const conceptGroups = {}

    segments.forEach(segment => {
      if (segment.concepts && segment.concepts.length > 0) {
        const concept = segment.concepts[0]
        conceptGroups[concept] = (conceptGroups[concept] || 0) + 1
      }
    })

    const counts = Object.values(conceptGroups)
    if (counts.length < 2) return false

    const avg = counts.reduce((a, b) => a + b, 0) / counts.length
    const variance =
      counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length

    return variance < 2 // 方差小于2认为是平衡的
  }

  /**
   * 检查时间顺序
   */
  checkChronologicalOrder(segments) {
    const years = []

    segments.forEach(segment => {
      const text = segment.text || ''
      const yearMatch = text.match(/(\d{4})年/)
      if (yearMatch) {
        years.push(parseInt(yearMatch[1]))
      }
    })

    if (years.length < 2) return false

    // 检查是否递增
    for (let i = 0; i < years.length - 1; i++) {
      if (years[i] >= years[i + 1]) {
        return false
      }
    }

    return true
  }

  /**
   * 检查多个时间点
   */
  checkMultipleTimePoints(segments) {
    let timePointCount = 0

    segments.forEach(segment => {
      const text = segment.text || ''
      if (/\d{4}年|\d{1,2}月|\d{1,2}日|第[一二三四五]/.test(text)) {
        timePointCount++
      }
    })

    return timePointCount >= 3
  }
}

export default SimpleNarrativeDetector
