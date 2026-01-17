/**
 * VidSlide AI - 颜色验证器
 * 验证颜色搭配、对比度、亮度等规范
 *
 * @module ColorValidator
 * @description 处理所有与颜色相关的验证逻辑，包括对比度、亮度、色彩组合等
 */

import { BaseValidator } from './BaseValidator.js'

/**
 * 颜色验证器类
 * @class ColorValidator
 * @extends BaseValidator
 * @description 验证颜色对比度、亮度、色彩搭配等
 */
export class ColorValidator extends BaseValidator {
  /**
   * 构造函数
   * @param {Object} colorConstraints - 颜色约束配置
   * @param {Object} professionalismConstraints - 专业性约束配置
   */
  constructor(colorConstraints, professionalismConstraints) {
    super(colorConstraints)
    this.professionalismConstraints = professionalismConstraints
  }

  /**
   * 验证颜色
   * @param {Object} adjustments - 用户调整数据
   * @param {string} templateType - 模板类型
   * @param {Array} violations - 违反规则列表
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  validate(adjustments, templateType, violations, warnings, suggestions) {
    if (adjustments.colors) {
      const { background, text, accent } = adjustments.colors

      // 对比度验证
      if (background && text) {
        this.validateContrast(text, background, violations, warnings)
      }

      // 颜色组合验证
      const colorCombination = [background, text, accent].filter(c => c)
      if (colorCombination.length >= 2) {
        this.validateColorCombination(colorCombination, warnings)
      }

      // 亮度验证
      this.validateBrightness(background, 'background', warnings, suggestions)
      this.validateBrightness(text, 'text', warnings, suggestions)
      this.validateBrightness(accent, 'accent', warnings, suggestions)
    }
  }

  /**
   * 验证对比度
   * @param {string} textColor - 文字颜色
   * @param {string} backgroundColor - 背景颜色
   * @param {Array} violations - 违规列表
   * @param {Array} warnings - 警告列表
   */
  validateContrast(textColor, backgroundColor, violations, warnings) {
    const colorConstraints = this.constraints
    const contrastRatio = this.calculateContrastRatio(textColor, backgroundColor)

    if (contrastRatio < colorConstraints.contrastRatio.min) {
      this.addViolation(violations, {
        type: 'CONTRAST_RATIO',
        field: 'colors',
        message: `文字与背景对比度不足 ${contrastRatio.toFixed(2)}，需要至少 ${colorConstraints.contrastRatio.min}`,
        current: contrastRatio,
        required: colorConstraints.contrastRatio.min
      })
    } else if (contrastRatio < colorConstraints.contrastRatio.recommended) {
      this.addWarning(warnings, {
        type: 'CONTRAST_RATIO',
        field: 'colors',
        message: `建议提高对比度至 ${colorConstraints.contrastRatio.recommended} 以获得更好可读性`,
        current: contrastRatio,
        recommended: colorConstraints.contrastRatio.recommended
      })
    }
  }

  /**
   * 验证颜色组合
   * @param {Array} colorCombination - 颜色组合
   * @param {Array} warnings - 警告列表
   */
  validateColorCombination(colorCombination, warnings) {
    const avoidCombinations = this.professionalismConstraints?.avoidCombinations || []
    const isAvoided = avoidCombinations.some(combo => this.colorsMatch(combo, colorCombination))

    if (isAvoided) {
      this.addWarning(warnings, {
        type: 'COLOR_COMBINATION',
        field: 'colors',
        message: '当前颜色组合可能影响专业外观',
        suggestion: '建议使用预设的专业配色方案'
      })
    }
  }

  /**
   * 验证亮度
   * @param {string} color - 颜色值
   * @param {string} fieldName - 字段名称
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  validateBrightness(color, fieldName, warnings, suggestions) {
    if (!color) return

    const colorConstraints = this.constraints
    const brightness = this.calculateBrightness(color)

    if (brightness < colorConstraints.brightness.min || brightness > colorConstraints.brightness.max) {
      this.addSuggestion(suggestions, {
        type: 'BRIGHTNESS',
        field: fieldName,
        message: `${fieldName} 颜色亮度 ${brightness.toFixed(2)} 超出推荐范围`,
        suggestion: `建议亮度在 ${colorConstraints.brightness.min} - ${colorConstraints.brightness.max} 之间`
      })
    }
  }

  /**
   * 计算对比度比率
   * @param {string} color1 - 颜色1
   * @param {string} color2 - 颜色2
   * @returns {number} 对比度比率
   */
  calculateContrastRatio(color1, color2) {
    const lum1 = this.calculateLuminance(color1)
    const lum2 = this.calculateLuminance(color2)

    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  }

  /**
   * 计算颜色亮度（相对亮度）
   * @param {string} color - 颜色值
   * @returns {number} 亮度值 (0-1)
   */
  calculateLuminance(color) {
    const rgb = this.hexToRgb(color)
    if (!rgb) return 0

    const { r, g, b } = rgb
    const rsRGB = r / 255
    const gsRGB = g / 255
    const bsRGB = b / 255

    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
  }

  /**
   * 计算颜色亮度（感知亮度）
   * @param {string} color - 颜色值
   * @returns {number} 亮度值 (0-1)
   */
  calculateBrightness(color) {
    return this.calculateLuminance(color)
  }

  /**
   * 颜色是否匹配组合
   * @param {Array} combo - 颜色组合
   * @param {Array} colors - 当前颜色
   * @returns {boolean} 是否匹配
   */
  colorsMatch(combo, colors) {
    return combo.every(comboColor =>
      colors.some(currentColor => this.colorsSimilar(comboColor, currentColor))
    )
  }

  /**
   * 颜色是否相似
   * @param {string} color1 - 颜色1
   * @param {string} color2 - 颜色2
   * @returns {boolean} 是否相似
   */
  colorsSimilar(color1, color2) {
    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)

    if (!rgb1 || !rgb2) return false

    const threshold = 50 // 颜色差异阈值
    const diff = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) + Math.pow(rgb1.g - rgb2.g, 2) + Math.pow(rgb1.b - rgb2.b, 2)
    )

    return diff < threshold
  }

  /**
   * HEX转RGB
   * @param {string} hex - HEX颜色值
   * @returns {Object|null} RGB对象或null
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null
  }

  /**
   * RGB转HEX
   * @param {number} r - 红色值 (0-255)
   * @param {number} g - 绿色值 (0-255)
   * @param {number} b - 蓝色值 (0-255)
   * @returns {string} HEX颜色值
   */
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  /**
   * 获取颜色的互补色
   * @param {string} color - 颜色值
   * @returns {string} 互补色
   */
  getComplementaryColor(color) {
    const rgb = this.hexToRgb(color)
    if (!rgb) return color

    return this.rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b)
  }

  /**
   * 调整颜色亮度
   * @param {string} color - 颜色值
   * @param {number} amount - 调整量 (-1 到 1)
   * @returns {string} 调整后的颜色
   */
  adjustBrightness(color, amount) {
    const rgb = this.hexToRgb(color)
    if (!rgb) return color

    const adjust = (value) => {
      const adjusted = value + (amount * 255)
      return Math.max(0, Math.min(255, Math.round(adjusted)))
    }

    return this.rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b))
  }

  /**
   * 检查颜色是否为深色
   * @param {string} color - 颜色值
   * @returns {boolean} 是否为深色
   */
  isDarkColor(color) {
    const luminance = this.calculateLuminance(color)
    return luminance < 0.5
  }

  /**
   * 检查颜色是否为浅色
   * @param {string} color - 颜色值
   * @returns {boolean} 是否为浅色
   */
  isLightColor(color) {
    return !this.isDarkColor(color)
  }

  /**
   * 建议合适的文字颜色
   * @param {string} backgroundColor - 背景颜色
   * @returns {string} 建议的文字颜色
   */
  suggestTextColor(backgroundColor) {
    return this.isDarkColor(backgroundColor) ? '#ffffff' : '#000000'
  }

  /**
   * 验证颜色格式
   * @param {string} color - 颜色值
   * @returns {boolean} 格式是否有效
   */
  isValidColorFormat(color) {
    // 支持 HEX 格式
    const hexPattern = /^#?([a-f\d]{3}|[a-f\d]{6})$/i
    if (hexPattern.test(color)) return true

    // 支持 RGB 格式
    const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i
    if (rgbPattern.test(color)) return true

    // 支持 RGBA 格式
    const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i
    if (rgbaPattern.test(color)) return true

    return false
  }
}

export default ColorValidator
