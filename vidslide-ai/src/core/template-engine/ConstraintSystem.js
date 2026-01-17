/**
 * VidSlide AI - 约束系统核心
 * 验证用户调整是否符合专业设计规范
 *
 * @module ConstraintSystem
 * @description 约束系统核心，协调各个验证器进行综合验证
 */

import { TEMPLATE_TYPES } from './TemplateDefinitions.js'
import { getAllConstraints } from './config/constraintConfig.js'
import { TextValidator } from './validators/TextValidator.js'
import { ColorValidator } from './validators/ColorValidator.js'
import { SizeValidator } from './validators/SizeValidator.js'
import { UXValidator } from './validators/UXValidator.js'

/**
 * 约束系统类
 * @class ConstraintSystem
 * @description 核心约束系统，管理所有验证器并提供统一的验证接口
 */
export class ConstraintSystem {
  /**
   * 构造函数
   * 初始化所有验证器
   */
  constructor() {
    this.constraints = getAllConstraints()
    this.initializeValidators()
  }

  /**
   * 初始化验证器
   * @private
   */
  initializeValidators() {
    // 初始化文字验证器
    this.textValidator = new TextValidator(this.constraints.text, this.constraints.typography)

    // 初始化颜色验证器
    this.colorValidator = new ColorValidator(
      this.constraints.colors,
      this.constraints.professionalism
    )

    // 初始化尺寸验证器
    this.sizeValidator = new SizeValidator(this.constraints.size, this.constraints.position)

    // 初始化用户体验验证器
    this.uxValidator = new UXValidator(
      this.constraints.ux,
      this.constraints.layout,
      this.constraints.professionalism
    )
  }

  /**
   * 验证用户调整
   * @param {Object} adjustments - 用户调整数据
   * @param {string} templateType - 模板类型
   * @param {Object} context - 验证上下文
   * @returns {Object} 验证结果 {isValid, violations, warnings, suggestions, score}
   */
  validateAdjustments(adjustments, templateType, context = {}) {
    const violations = []
    const warnings = []
    const suggestions = []

    // 调用各个验证器
    this.textValidator.validate(adjustments, templateType, violations, warnings, suggestions)
    this.colorValidator.validate(adjustments, templateType, violations, warnings, suggestions)
    this.sizeValidator.validate(adjustments, templateType, violations, warnings, suggestions)
    this.uxValidator.validate(adjustments, templateType, violations, warnings, suggestions)

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      suggestions,
      score: this.calculateComplianceScore(violations, warnings)
    }
  }

  /**
   * 计算合规分数
   * @param {Array} violations - 违反项
   * @param {Array} warnings - 警告项
   * @returns {number} 合规分数 (0-100)
   */
  calculateComplianceScore(violations, warnings) {
    const violationPenalty = violations.length * 20 // 每个违反扣20分
    const warningPenalty = warnings.length * 5 // 每个警告扣5分

    const baseScore = 100
    const totalPenalty = violationPenalty + warningPenalty

    return Math.max(0, baseScore - totalPenalty)
  }

  /**
   * 生成合规性报告
   * @param {Object} adjustments - 用户调整数据
   * @param {string} templateType - 模板类型
   * @param {Object} validationResult - 验证结果
   * @returns {Object} 合规性报告
   */
  generateComplianceReport(adjustments, templateType, validationResult) {
    const report = {
      timestamp: new Date().toISOString(),
      templateType: templateType,
      overallScore: validationResult.score,
      status: validationResult.isValid ? 'compliant' : 'non-compliant',
      summary: {
        violations: validationResult.violations.length,
        warnings: validationResult.warnings.length,
        suggestions: validationResult.suggestions.length
      },
      details: {
        violations: validationResult.violations,
        warnings: validationResult.warnings,
        suggestions: validationResult.suggestions
      },
      recommendations: this.generateRecommendations(validationResult),
      metadata: {
        totalChecks:
          validationResult.violations.length +
          validationResult.warnings.length +
          validationResult.suggestions.length,
        criticalIssues: validationResult.violations.filter(v => v.severity === 'high').length,
        complianceLevel: this.getComplianceLevel(validationResult.score)
      }
    }

    return report
  }

  /**
   * 生成修复建议
   * @param {Object} validationResult - 验证结果
   * @returns {Array} 建议列表
   */
  generateRecommendations(validationResult) {
    const recommendations = []

    // 基于违规类型生成建议
    const violationTypes = [...new Set(validationResult.violations.map(v => v.type))]
    const warningTypes = [...new Set(validationResult.warnings.map(w => w.type))]

    // 紧急修复（违规）
    violationTypes.forEach(type => {
      recommendations.push(...this.getRecommendationsForType(type, 'violation'))
    })

    // 改进建议（警告）
    warningTypes.forEach(type => {
      recommendations.push(...this.getRecommendationsForType(type, 'warning'))
    })

    return recommendations
  }

  /**
   * 根据问题类型生成具体建议
   * @param {string} type - 问题类型
   * @param {string} severity - 严重程度
   * @returns {Array} 建议列表
   */
  getRecommendationsForType(type, severity) {
    const recommendations = []
    const recommendationMap = {
      TEXT_LENGTH: {
        priority: severity === 'violation' ? 'high' : 'medium',
        category: 'typography',
        action: '调整文字长度',
        description: '确保文字内容长度在允许范围内',
        implementation: '检查并截断或扩展文字内容'
      },
      FONT_SIZE_OUT_OF_RANGE: {
        priority: 'high',
        category: 'typography',
        action: '调整字体大小',
        description: '使用符合规范的字体大小',
        implementation: '选择12px-72px范围内的字体大小'
      },
      CONTRAST_RATIO: {
        priority: 'high',
        category: 'accessibility',
        action: '提高颜色对比度',
        description: '确保文字与背景的对比度符合WCAG标准',
        implementation: '调整文字或背景颜色，提高对比度至4.5:1以上'
      },
      TOUCH_TARGET_TOO_SMALL: {
        priority: 'high',
        category: 'ux',
        action: '增大触摸目标',
        description: '确保触摸目标至少44px x 44px',
        implementation: '增加按钮或链接的尺寸或内边距'
      },
      MISSING_ALT_TEXT: {
        priority: 'high',
        category: 'accessibility',
        action: '添加替代文本',
        description: '为所有图片添加描述性替代文本',
        implementation: '为img元素添加alt属性，描述图片内容'
      }
    }

    if (recommendationMap[type]) {
      recommendations.push(recommendationMap[type])
    }

    return recommendations
  }

  /**
   * 获取合规性等级
   * @param {number} score - 合规分数
   * @returns {string} 合规等级
   */
  getComplianceLevel(score) {
    if (score >= 90) return 'excellent'
    if (score >= 80) return 'good'
    if (score >= 70) return 'acceptable'
    if (score >= 60) return 'needs-improvement'
    return 'poor'
  }

  /**
   * 获取约束配置
   * @param {string} category - 约束类别
   * @returns {Object} 约束配置
   */
  getConstraints(category) {
    return this.constraints[category] || {}
  }

  /**
   * 更新约束配置
   * @param {string} category - 约束类别
   * @param {Object} newConstraints - 新约束配置
   */
  updateConstraints(category, newConstraints) {
    if (this.constraints[category]) {
      this.constraints[category] = { ...this.constraints[category], ...newConstraints }
      // 重新初始化验证器
      this.initializeValidators()
    }
  }

  /**
   * 重置为默认约束
   */
  resetToDefaults() {
    this.constraints = getAllConstraints()
    this.initializeValidators()
  }
}

export default ConstraintSystem
