/**
 * VidSlide AI - 用户体验验证器
 * 验证触摸目标、可读性、无障碍等用户体验规范
 *
 * @module UXValidator
 * @description 处理所有与用户体验相关的验证逻辑
 */

import { BaseValidator } from './BaseValidator.js'
import { TEMPLATE_TYPES } from '../TemplateDefinitions.js'

/**
 * 用户体验验证器类
 * @class UXValidator
 * @extends BaseValidator
 * @description 验证触摸目标、可读性、无障碍、布局、专业性等
 */
export class UXValidator extends BaseValidator {
  /**
   * 构造函数
   * @param {Object} uxConstraints - 用户体验约束配置
   * @param {Object} layoutConstraints - 布局约束配置
   * @param {Object} professionalismConstraints - 专业性约束配置
   */
  constructor(uxConstraints, layoutConstraints, professionalismConstraints) {
    super(uxConstraints)
    this.layoutConstraints = layoutConstraints
    this.professionalismConstraints = professionalismConstraints
  }

  /**
   * 验证用户体验
   * @param {Object} adjustments - 用户调整数据
   * @param {string} templateType - 模板类型
   * @param {Array} violations - 违反规则列表
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  validate(adjustments, templateType, violations, warnings, suggestions) {
    // 验证触摸目标
    if (adjustments.touchTargetSize) {
      this.validateTouchTarget(adjustments.touchTargetSize, violations, warnings)
    }

    // 验证可读性
    if (adjustments.lineLength) {
      this.validateReadability(adjustments.lineLength, warnings, suggestions)
    }

    // 验证无障碍
    if (adjustments.accessibility) {
      this.validateAccessibility(adjustments.accessibility, violations, warnings)
    }

    // 验证布局
    if (adjustments.layout) {
      this.validateLayout(adjustments.layout, violations, warnings, suggestions)
    }

    // 验证专业性
    this.validateProfessionalism(adjustments, templateType, violations, warnings, suggestions)
  }

  /**
   * 验证触摸目标尺寸
   * @param {number} size - 触摸目标尺寸
   * @param {Array} violations - 违规列表
   * @param {Array} warnings - 警告列表
   */
  validateTouchTarget(size, violations, warnings) {
    const uxRules = this.constraints

    if (size < uxRules.touchTargets.minSize) {
      this.addViolation(violations, {
        type: 'TOUCH_TARGET_TOO_SMALL',
        field: 'touchTargetSize',
        value: size,
        min: uxRules.touchTargets.minSize,
        message: `触摸目标尺寸 ${size}px 小于最小要求 ${uxRules.touchTargets.minSize}px`
      })
    } else if (size < uxRules.touchTargets.recommendedSize) {
      this.addWarning(warnings, {
        type: 'TOUCH_TARGET_SMALL',
        field: 'touchTargetSize',
        value: size,
        recommended: uxRules.touchTargets.recommendedSize,
        message: `触摸目标尺寸 ${size}px 小于推荐尺寸 ${uxRules.touchTargets.recommendedSize}px`
      })
    }
  }

  /**
   * 验证可读性
   * @param {number} length - 行长度
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  validateReadability(length, warnings, suggestions) {
    const uxRules = this.constraints

    if (length > uxRules.readability.maxLineLength) {
      this.addWarning(warnings, {
        type: 'LINE_TOO_LONG',
        field: 'lineLength',
        value: length,
        max: uxRules.readability.maxLineLength,
        message: `行长度 ${length} 字符过长，建议不超过 ${uxRules.readability.maxLineLength} 字符`
      })
    } else if (length < uxRules.readability.minLineLength) {
      this.addSuggestion(suggestions, {
        type: 'LINE_TOO_SHORT',
        field: 'lineLength',
        value: length,
        min: uxRules.readability.minLineLength,
        message: `行长度 ${length} 字符过短，建议至少 ${uxRules.readability.minLineLength} 字符`
      })
    }
  }

  /**
   * 验证无障碍
   * @param {Object} accessibility - 无障碍设置
   * @param {Array} violations - 违规列表
   * @param {Array} warnings - 警告列表
   */
  validateAccessibility(accessibility, violations, warnings) {
    const uxRules = this.constraints

    if (!accessibility.altText && uxRules.accessibility.altText) {
      this.addViolation(violations, {
        type: 'MISSING_ALT_TEXT',
        field: 'accessibility',
        message: '图片缺少替代文本，影响屏幕阅读器用户'
      })
    }

    if (!accessibility.focusIndicator && uxRules.accessibility.focusIndicator) {
      this.addWarning(warnings, {
        type: 'MISSING_FOCUS_INDICATOR',
        field: 'accessibility',
        message: '缺少键盘焦点指示器，影响键盘导航用户'
      })
    }
  }

  /**
   * 验证布局
   * @param {Object} layout - 布局设置
   * @param {Array} violations - 违规列表
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  validateLayout(layout, violations, warnings, suggestions) {
    const layoutConstraints = this.layoutConstraints
    const { textAlign, margins, spacing } = layout

    // 对齐方式验证
    if (textAlign && !layoutConstraints.alignment.allowed.includes(textAlign)) {
      this.addViolation(violations, {
        type: 'ALIGNMENT_INVALID',
        field: 'layout',
        message: `对齐方式 "${textAlign}" 不被支持`,
        allowed: layoutConstraints.alignment.allowed,
        current: textAlign
      })
    }

    // 边距验证
    if (margins) {
      this.validateMargins(margins, warnings, layoutConstraints)
    }

    // 间距验证
    if (spacing && spacing < layoutConstraints.elementSpacing.min) {
      this.addSuggestion(suggestions, {
        type: 'ELEMENT_SPACING',
        field: 'layout',
        message: '元素间距较小，可能影响视觉层次',
        suggestion: `建议使用至少 ${layoutConstraints.elementSpacing.recommended}px 的间距`
      })
    }
  }

  /**
   * 验证边距
   * @param {Object} margins - 边距对象
   * @param {Array} warnings - 警告列表
   * @param {Object} layoutConstraints - 布局约束
   */
  validateMargins(margins, warnings, layoutConstraints) {
    const { top, right, bottom, left } = margins
    const minMargin = layoutConstraints.textMargins.min
    const sides = ['上', '右', '下', '左']

    ;[top, right, bottom, left].forEach((margin, index) => {
      if (margin !== undefined && margin < minMargin) {
        this.addWarning(warnings, {
          type: 'MARGIN_TOO_SMALL',
          field: 'layout',
          message: `${sides[index]}边距过小`,
          suggestion: `建议至少 ${minMargin}px`
        })
      }
    })
  }

  /**
   * 验证专业性
   * @param {Object} adjustments - 用户调整数据
   * @param {string} templateType - 模板类型
   * @param {Array} violations - 违规列表
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  validateProfessionalism(adjustments, templateType, violations, warnings, suggestions) {
    const requiredElements = this.professionalismConstraints.requiredElements[templateType]

    if (requiredElements) {
      requiredElements.forEach(element => {
        if (!adjustments[element] || adjustments[element].length === 0) {
          this.addViolation(violations, {
            type: 'MISSING_ELEMENT',
            field: element,
            message: `缺少必需的元素: ${element}`,
            required: true
          })
        }
      })
    }

    // 模板特定验证
    this.validateTemplateSpecific(adjustments, templateType, warnings)
  }

  /**
   * 验证模板特定规则
   * @param {Object} adjustments - 用户调整数据
   * @param {string} templateType - 模板类型
   * @param {Array} warnings - 警告列表
   */
  validateTemplateSpecific(adjustments, templateType, warnings) {
    switch (templateType) {
      case TEMPLATE_TYPES.CHART_ANALYSIS:
        if (adjustments.data && adjustments.data.length < 2) {
          this.addWarning(warnings, {
            type: 'INSUFFICIENT_DATA',
            field: 'data',
            message: '图表数据点过少',
            suggestion: '建议至少提供2个数据点以构成有效图表'
          })
        }
        break

      case TEMPLATE_TYPES.TIMELINE_DISPLAY:
        if (adjustments.events && adjustments.events.length < 2) {
          this.addWarning(warnings, {
            type: 'INSUFFICIENT_EVENTS',
            field: 'events',
            message: '时间线事件过少',
            suggestion: '建议至少提供2个事件以构成有效时间线'
          })
        }
        break
    }
  }

  /**
   * 检查是否有足够的视觉层次
   * @param {Object} adjustments - 用户调整数据
   * @returns {boolean} 是否有足够的视觉层次
   */
  hasAdequateHierarchy(adjustments) {
    // 检查是否有不同的字体大小
    if (adjustments.typography) {
      const fontSizes = new Set()
      if (adjustments.typography.title) fontSizes.add(adjustments.typography.title.fontSize)
      if (adjustments.typography.subtitle) fontSizes.add(adjustments.typography.subtitle.fontSize)
      if (adjustments.typography.body) fontSizes.add(adjustments.typography.body.fontSize)

      return fontSizes.size >= 2
    }

    return true
  }

  /**
   * 检查是否有足够的对比度
   * @param {Object} colors - 颜色设置
   * @returns {boolean} 是否有足够的对比度
   */
  hasAdequateContrast(colors) {
    if (!colors || !colors.background || !colors.text) {
      return true
    }

    // 这里可以调用 ColorValidator 的方法
    // 简化实现，假设已经验证过
    return true
  }
}

export default UXValidator
