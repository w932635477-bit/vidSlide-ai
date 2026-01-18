/**
 * 智能匹配服务
 * 负责使用CLIP等AI技术进行智能素材匹配
 */

import CLIPMatcher from './CLIPMatcher.js'
import { preprocessMaterialsForCLIP } from './materialConverters.js'

class MatchingService {
  constructor() {
    this.clipMatcher = CLIPMatcher
    this.stats = {
      clipMatches: 0,
      fallbackMatches: 0,
      totalMatches: 0
    }
  }

  /**
   * 使用CLIP进行智能素材匹配
   * @param {string} query - 查询关键词
   * @param {Array} availableMaterials - 可用素材数组
   * @param {Object} contentAnalysis - 内容分析结果
   * @returns {Promise<Array>} 智能排序的素材
   */
  async smartMatchMaterials(query, availableMaterials, contentAnalysis = {}) {
    try {
      console.log(`🧠 使用CLIP智能匹配素材: "${query}"`)

      // 预处理素材数据，确保包含图像
      const processedMaterials = await preprocessMaterialsForCLIP(availableMaterials)

      if (processedMaterials.length === 0) {
        console.warn('⚠️ 没有可用于CLIP匹配的素材')
        return availableMaterials
      }

      // 使用CLIP进行语义匹配
      const smartMatches = await this.clipMatcher.findBestMatches(query, processedMaterials, 20)

      // 记录统计
      this.stats.clipMatches++
      this.stats.totalMatches++

      console.log(`🎯 CLIP匹配完成，返回 ${smartMatches.length} 个智能排序结果`)

      return smartMatches.map(match => ({
        ...match,
        selectionMethod: 'clip-semantic',
        confidence: match.similarity,
        smartRank: match.rank
      }))
    } catch (error) {
      console.warn('❌ CLIP智能匹配失败，使用传统方法:', error.message)

      // 降级到关键词匹配
      return this.fallbackKeywordMatch(query, availableMaterials)
    }
  }

  /**
   * 降级关键词匹配
   * @param {string} query - 查询关键词
   * @param {Array} materials - 素材数组
   * @returns {Array} 匹配结果
   */
  fallbackKeywordMatch(query, materials) {
    const queryLower = query.toLowerCase()

    this.stats.fallbackMatches++
    this.stats.totalMatches++

    return materials
      .map(material => {
        const nameMatch = (material.name || '').toLowerCase().includes(queryLower) ? 1 : 0
        const descMatch = (material.description || '').toLowerCase().includes(queryLower) ? 0.8 : 0
        const tagMatch = (material.tags || []).some(tag => tag.toLowerCase().includes(queryLower))
          ? 0.6
          : 0

        const score = Math.max(nameMatch, descMatch, tagMatch)

        return {
          ...material,
          similarity: score,
          selectionMethod: 'keyword-fallback',
          confidence: score
        }
      })
      .filter(material => material.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
  }

  /**
   * 计算本地素材匹配度
   * @param {string|Array} keywords - 关键词（字符串或数组）
   * @param {Function} searchLocalMaterials - 本地搜索函数
   * @returns {Promise<Object>} 匹配度评估结果
   */
  async calculateLocalMatchRate(keywords, searchLocalMaterials) {
    try {
      // 标准化关键词为数组
      const keywordArray = Array.isArray(keywords) ? keywords : [keywords]

      if (keywordArray.length === 0) {
        return {
          matchRate: 0,
          avgConfidence: 0,
          coverageRate: 0,
          matchedCount: 0,
          details: '无关键词'
        }
      }

      console.log(`📊 计算本地匹配度: ${keywordArray.join(', ')}`)

      // 搜索本地素材
      const localResults = await searchLocalMaterials(keywordArray.join(' '), {
        limit: 50
      })

      if (localResults.materials.length === 0) {
        console.log('📊 本地匹配度: 0% (无匹配素材)')
        return {
          matchRate: 0,
          avgConfidence: 0,
          coverageRate: 0,
          matchedCount: 0,
          details: '本地无匹配素材'
        }
      }

      // 评估每个素材的匹配质量
      const evaluatedMaterials = await this.evaluateMaterialsQuality(
        keywordArray,
        localResults.materials
      )

      // 计算平均置信度
      const avgConfidence =
        evaluatedMaterials.reduce((sum, m) => sum + (m.confidence || 0), 0) /
        evaluatedMaterials.length

      // 计算关键词覆盖率
      const coveredKeywords = new Set()
      evaluatedMaterials.forEach(material => {
        keywordArray.forEach(keyword => {
          const keywordLower = keyword.toLowerCase()
          const materialText = [
            material.name,
            material.description,
            ...(material.tags || []),
            ...(material.keywords || [])
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          if (materialText.includes(keywordLower)) {
            coveredKeywords.add(keyword)
          }
        })
      })

      const coverageRate = coveredKeywords.size / keywordArray.length

      // 综合评分：置信度 * 0.6 + 覆盖率 * 0.4
      const matchRate = avgConfidence * 0.6 + coverageRate * 0.4

      console.log(`📊 本地匹配度: ${(matchRate * 100).toFixed(1)}%`)
      console.log(`   - 平均置信度: ${(avgConfidence * 100).toFixed(1)}%`)
      console.log(
        `   - 关键词覆盖率: ${(coverageRate * 100).toFixed(1)}% (${coveredKeywords.size}/${keywordArray.length})`
      )
      console.log(`   - 匹配素材数: ${evaluatedMaterials.length}`)

      return {
        matchRate,
        avgConfidence,
        coverageRate,
        matchedCount: evaluatedMaterials.length,
        coveredKeywords: Array.from(coveredKeywords),
        uncoveredKeywords: keywordArray.filter(k => !coveredKeywords.has(k)),
        topMatches: evaluatedMaterials.slice(0, 5),
        details: `匹配度${(matchRate * 100).toFixed(1)}%，覆盖${coveredKeywords.size}/${keywordArray.length}个关键词`
      }
    } catch (error) {
      console.error('计算本地匹配度失败:', error)
      return {
        matchRate: 0,
        avgConfidence: 0,
        coverageRate: 0,
        matchedCount: 0,
        error: error.message
      }
    }
  }

  /**
   * 评估素材质量
   * @param {Array} keywords - 关键词数组
   * @param {Array} materials - 素材数组
   * @returns {Promise<Array>} 评估后的素材数组
   */
  async evaluateMaterialsQuality(keywords, materials) {
    const results = []

    for (const material of materials) {
      let matchType = 'none'
      let confidence = 0

      // 精确匹配检查
      const exactMatch = this.isExactMatch(keywords, material)
      if (exactMatch.isMatch) {
        matchType = 'exact'
        confidence = exactMatch.confidence
      } else {
        // 关键词相似度检查
        const keywordScore = this.calculateKeywordSimilarity(keywords, material)
        if (keywordScore >= 0.5) {
          matchType = 'keyword'
          confidence = keywordScore
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
   * 精确匹配判断
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
   * 计算语义相似度（使用CLIP）
   * @param {Array} keywords - 关键词数组
   * @param {Object} material - 素材对象
   * @returns {Promise<number>} 相似度分数（0-1）
   */
  async calculateSemanticSimilarity(keywords, material) {
    try {
      const query = keywords.join(' ')
      const similarities = await this.clipMatcher.matchTextToImages(query, [material])
      return similarities[0] || 0
    } catch (error) {
      // 降级到关键词相似度
      return this.calculateKeywordSimilarity(keywords, material)
    }
  }

  /**
   * 获取匹配统计
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      clipSuccessRate:
        this.stats.totalMatches > 0 ? this.stats.clipMatches / this.stats.totalMatches : 0,
      fallbackRate:
        this.stats.totalMatches > 0 ? this.stats.fallbackMatches / this.stats.totalMatches : 0
    }
  }
}

// 导出单例实例
export default new MatchingService()
