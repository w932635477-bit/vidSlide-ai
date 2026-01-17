/**
 * VidSlide AI - 文字验证器
 * 验证文字内容、长度、字符、字体等规范
 *
 * @module TextValidator
 * @description 处理所有与文字相关的验证逻辑
 */

import { BaseValidator } from './BaseValidator.js'

/**
 * 文字验证器类
 * @class TextValidator
 * @extends BaseValidator
 * @description 验证文字内容、长度、字符、字体大小、行高等
 */
export class TextValidator extends BaseValidator {
  /**
   * 构造函数
   * @param {Object} textConstraints - 文字约束配置
   * @param {Object} typographyConstraints - 字体约束配置
   */
  constructor(textConstraints, typographyConstraints) {
    super(textConstraints)
    this.typographyConstraints = typographyConstraints
  }

  /**
   * 验证文字内容
   * @param {Object} adjustments - 用户调整数据
   * @param {string} templateType - 模板类型
   * @param {Array} violations - 违反规则列表
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  validate(adjustments, templateType, violations, warnings, suggestions) {
    // 验证文字内容
    if (adjustments.text) {
      this.validateTextContent(adjustments.text, templateType, violations, warnings, suggestions)
    }

    // 验证字体设置
    if (adjustments.typography) {
      this.validateTypography(adjustments.typography, violations, warnings, suggestions)
    }

    // 验证字体大小
    if (adjustments.fontSize) {
      this.validateFontSize(adjustments.fontSize, violations, warnings)
    }

    // 验证行高
    if (adjustments.lineHeight) {
      this.validateLineHeight(adjustments.lineHeight, warnings, suggestions)
    }

    // 验证字重
    if (adjustments.fontWeight) {
      this.validateFontWeight(adjustments.fontWeight, violations, warnings)
    }
  }

  /**
   * 验证文字内容
   * @param {string} text - 文字内容
   * @param {string} templateType - 模板类型
   * @param {Array} violations - 违规列表
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  validateTextContent(text, templateType, violations, warnings, suggestions) {
    const textConstraints = this.constraints

    // 长度验证
    const maxLength = textConstraints.maxLength[templateType] || 500
    if (text.length > maxLength) {
      this.addViolation(violations, {
        type: 'TEXT_LENGTH',
        field: 'text',
        message: `文字内容过长，最大允许${maxLength}字符`,
        current: text.length,
        limit: maxLength
      })
    }

    if (text.length < textConstraints.minLength) {
      this.addViolation(violations, {
        type: 'TEXT_LENGTH',
        field: 'text',
        message: `文字内容过短，最少需要${textConstraints.minLength}字符`,
        current: text.length,
        limit: textConstraints.minLength
      })
    }

    // 字符验证
    if (!textConstraints.allowedChars.test(text)) {
      this.addWarning(warnings, {
        type: 'TEXT_CHARS',
        field: 'text',
        message: '包含不建议使用的特殊字符',
        suggestion: '建议使用标准中英文字符和常见标点'
      })
    }

    // 内容质量检查
    if (this.isTextTooRepetitive(text)) {
      this.addSuggestion(suggestions, {
        type: 'TEXT_QUALITY',
        message: '文字内容可能过于重复',
        suggestion: '建议使用更多样化的表达方式'
      })
    }

    // 检查空白字符
    if (this.hasExcessiveWhitespace(text)) {
      this.addWarning(warnings, {
        type: 'TEXT_WHITESPACE',
        field: 'text',
        message: '文字包含过多空白字符',
        suggestion: '建议清理多余的空格和换行'
      })
    }
  }

  /**
   * 验证字体设置
   * @param {Object} typography - 字体设置
   * @param {Array} violations - 违规列表
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  validateTypography(typography, violations, warnings, suggestions) {
    const { fontSize, lineHeight, fontWeight } = typography

    if (fontSize) {
      this.validateFontSize(fontSize, violations, warnings)
    }

    if (lineHeight) {
      this.validateLineHeight(lineHeight, warnings, suggestions)
    }

    if (fontWeight) {
      this.validateFontWeight(fontWeight, violations, warnings)
    }
  }

  /**
   * 验证字体大小
   * @param {number} fontSize - 字体大小(px)
   * @param {Array} violations - 违规列表
   * @param {Array} warnings - 警告列表
   */
  validateFontSize(fontSize, violations, warnings) {
    const fontSizeConstraints = this.typographyConstraints.fontSize

    if (fontSize < fontSizeConstraints.min) {
      this.addViolation(violations, {
        type: 'FONT_SIZE_OUT_OF_RANGE',
        field: 'fontSize',
        message: `字体大小 ${fontSize}px 小于最小值 ${fontSizeConstraints.min}px`,
        current: fontSize,
        min: fontSizeConstraints.min
      })
    }

    if (fontSize > fontSizeConstraints.max) {
      this.addViolation(violations, {
        type: 'FONT_SIZE_OUT_OF_RANGE',
        field: 'fontSize',
        message: `字体大小 ${fontSize}px 大于最大值 ${fontSizeConstraints.max}px`,
        current: fontSize,
        max: fontSizeConstraints.max
      })
    }

    // 检查是否在推荐范围内
    const recommended = fontSizeConstraints.recommended
    let inRecommendedRange = false

    for (const type in recommended) {
      const range = recommended[type]
      if (fontSize >= range.min && fontSize <= range.max) {
        inRecommendedRange = true
        break
      }
    }

    if (!inRecommendedRange && fontSize >= fontSizeConstraints.min && fontSize <= fontSizeConstraints.max) {
      this.addWarning(warnings, {
        type: 'FONT_SIZE_NOT_RECOMMENDED',
        field: 'fontSize',
        message: `字体大小 ${fontSize}px 不在推荐范围内`,
        suggestion: '建议使用标题(24-48px)、副标题(16-24px)、正文(14-18px)或说明(12-14px)的推荐大小'
      })
    }
  }

  /**
   * 验证行高
   * @param {number} lineHeight - 行高倍数
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  validateLineHeight(lineHeight, warnings, suggestions) {
    const lineHeightConstraints = this.typographyConstraints.lineHeight

    if (lineHeight < lineHeightConstraints.min) {
      this.addWarning(warnings, {
        type: 'LINE_HEIGHT_TOO_SMALL',
        field: 'lineHeight',
        message: `行高 ${lineHeight} 过小，可能影响可读性`,
        current: lineHeight,
        min: lineHeightConstraints.min,
        suggestion: `建议使用至少 ${lineHeightConstraints.min} 的行高`
      })
    }

    if (lineHeight > lineHeightConstraints.max) {
      this.addWarning(warnings, {
        type: 'LINE_HEIGHT_TOO_LARGE',
        field: 'lineHeight',
        message: `行高 ${lineHeight} 过大，可能浪费空间`,
        current: lineHeight,
        max: lineHeightConstraints.max,
        suggestion: `建议使用不超过 ${lineHeightConstraints.max} 的行高`
      })
    }

    // 推荐行高建议
    const recommended = lineHeightConstraints.recommended
    if (lineHeight >= lineHeightConstraints.min && lineHeight <= lineHeightConstraints.max) {
      this.addSuggestion(suggestions, {
        type: 'LINE_HEIGHT_RECOMMENDATION',
        field: 'lineHeight',
        message: '可以根据文字类型优化行高',
        suggestion: `标题建议 ${recommended.title}，正文建议 ${recommended.body}，说明建议 ${recommended.caption}`
      })
    }
  }

  /**
   * 验证字重
   * @param {number} fontWeight - 字重
   * @param {Array} violations - 违规列表
   * @param {Array} warnings - 警告列表
   */
  validateFontWeight(fontWeight, violations, warnings) {
    const fontWeightConstraints = this.typographyConstraints.fontWeight

    if (!fontWeightConstraints.allowed.includes(fontWeight)) {
      this.addViolation(violations, {
        type: 'FONT_WEIGHT_INVALID',
        field: 'fontWeight',
        message: `字重 ${fontWeight} 不在允许范围内`,
        current: fontWeight,
        allowed: fontWeightConstraints.allowed
      })
    }

    // 推荐字重建议
    const recommended = fontWeightConstraints.recommended
    if (fontWeightConstraints.allowed.includes(fontWeight)) {
      this.addWarning(warnings, {
        type: 'FONT_WEIGHT_RECOMMENDATION',
        field: 'fontWeight',
        message: '可以根据文字用途选择合适的字重',
        suggestion: `标题建议 ${recommended.title}，正文建议 ${recommended.body}，强调建议 ${recommended.emphasis}`
      })
    }
  }

  /**
   * 检查文字是否过于重复
   * @param {string} text - 文字内容
   * @returns {boolean} 是否重复
   */
  isTextTooRepetitive(text) {
    const words = text.toLowerCase().split(/\s+/)
    const wordCount = words.length
    const uniqueWords = new Set(words).size

    // 如果唯一单词少于总单词的30%，认为重复
    return uniqueWords / wordCount < 0.3
  }

  /**
   * 检查是否有过多空白字符
   * @param {string} text - 文字内容
   * @returns {boolean} 是否有过多空白
   */
  hasExcessiveWhitespace(text) {
    // 检查连续空格
    if (/\s{3,}/.test(text)) {
      return true
    }

    // 检查连续换行
    if (/\n{3,}/.test(text)) {
      return true
    }

    return false
  }
}

export default TextValidator
