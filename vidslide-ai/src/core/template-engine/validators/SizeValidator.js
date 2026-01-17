/**
 * VidSlide AI - 尺寸验证器
 * 验证元素尺寸、宽高比、位置等规范
 *
 * @module SizeValidator
 * @description 处理所有与尺寸和位置相关的验证逻辑
 */

import { BaseValidator } from './BaseValidator.js'

/**
 * 尺寸验证器类
 * @class SizeValidator
 * @extends BaseValidator
 * @description 验证元素尺寸、宽高比、位置、边距等
 */
export class SizeValidator extends BaseValidator {
  /**
   * 构造函数
   * @param {Object} sizeConstraints - 尺寸约束配置
   * @param {Object} positionConstraints - 位置约束配置
   */
  constructor(sizeConstraints, positionConstraints) {
    super(sizeConstraints)
    this.positionConstraints = positionConstraints
  }

  /**
   * 验证尺寸和位置
   * @param {Object} adjustments - 用户调整数据
   * @param {string} templateType - 模板类型
   * @param {Array} violations - 违反规则列表
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  validate(adjustments, templateType, violations, warnings, suggestions) {
    // 验证尺寸
    if (adjustments.size) {
      this.validateSize(adjustments.size, templateType, violations, warnings)
    }

    // 验证位置
    if (adjustments.position) {
      this.validatePosition(adjustments.position, templateType, violations, warnings)
    }

    // 验证坐标
    if (adjustments.coordinates) {
      this.validateCoordinates(adjustments.coordinates, violations, warnings)
    }
  }

  /**
   * 验证尺寸
   * @param {Object} size - 尺寸对象 {width, height}
   * @param {string} templateType - 模板类型
   * @param {Array} violations - 违规列表
   * @param {Array} warnings - 警告列表
   */
  validateSize(size, templateType, violations, warnings) {
    const { width, height } = size
    const sizeConstraints = this.constraints
    const minSize = sizeConstraints.minSize
    const maxSize = sizeConstraints.maxSize

    // 尺寸范围验证
    if (width < minSize.width || height < minSize.height) {
      this.addViolation(violations, {
        type: 'SIZE_TOO_SMALL',
        field: 'size',
        message: `尺寸过小，最小尺寸为 ${minSize.width * 100}% x ${minSize.height * 100}%`,
        current: { width, height },
        minimum: minSize
      })
    }

    if (width > maxSize.width || height > maxSize.height) {
      this.addViolation(violations, {
        type: 'SIZE_TOO_LARGE',
        field: 'size',
        message: `尺寸过大，最大尺寸为 ${maxSize.width * 100}% x ${maxSize.height * 100}%`,
        current: { width, height },
        maximum: maxSize
      })
    }

    // 宽高比验证
    const aspectRatio = width / height
    const allowedRatio = sizeConstraints.aspectRatio[templateType]

    if (allowedRatio && (aspectRatio < allowedRatio.min || aspectRatio > allowedRatio.max)) {
      this.addWarning(warnings, {
        type: 'ASPECT_RATIO',
        field: 'size',
        message: `宽高比 ${aspectRatio.toFixed(2)} 超出推荐范围`,
        recommended: `${allowedRatio.min} - ${allowedRatio.max}`,
        current: aspectRatio
      })
    }
  }

  /**
   * 验证位置
   * @param {string} position - 位置标识
   * @param {string} templateType - 模板类型
   * @param {Array} violations - 违规列表
   * @param {Array} warnings - 警告列表
   */
  validatePosition(position, templateType, violations, warnings) {
    const positionConstraints = this.positionConstraints
    const allowedPositions = positionConstraints.allowedPositions[templateType] || []

    if (!allowedPositions.includes(position)) {
      this.addViolation(violations, {
        type: 'POSITION_INVALID',
        field: 'position',
        message: `位置 "${position}" 不适用于此模板类型`,
        allowed: allowedPositions,
        current: position
      })
    }
  }

  /**
   * 验证坐标
   * @param {Object} coordinates - 坐标对象 {x, y}
   * @param {Array} violations - 违规列表
   * @param {Array} warnings - 警告列表
   */
  validateCoordinates(coordinates, violations, warnings) {
    const { x, y } = coordinates
    const margins = this.positionConstraints.margins

    // 边界距离检查
    if (x < margins.minEdgeDistance || y < margins.minEdgeDistance) {
      this.addWarning(warnings, {
        type: 'POSITION_MARGIN',
        field: 'position',
        message: '元素距离屏幕边缘过近',
        suggestion: `建议保持至少${margins.minEdgeDistance}px的边距`
      })
    }

    // 检查是否在安全区域内
    if (x < 0 || y < 0) {
      this.addViolation(violations, {
        type: 'POSITION_OUT_OF_BOUNDS',
        field: 'coordinates',
        message: '元素位置超出屏幕范围',
        current: { x, y }
      })
    }
  }

  /**
   * 计算宽高比
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @returns {number} 宽高比
   */
  calculateAspectRatio(width, height) {
    return width / height
  }

  /**
   * 检查尺寸是否在范围内
   * @param {Object} size - 尺寸对象
   * @param {Object} minSize - 最小尺寸
   * @param {Object} maxSize - 最大尺寸
   * @returns {boolean} 是否在范围内
   */
  isSizeInRange(size, minSize, maxSize) {
    return (
      size.width >= minSize.width &&
      size.width <= maxSize.width &&
      size.height >= minSize.height &&
      size.height <= maxSize.height
    )
  }

  /**
   * 建议合适的尺寸
   * @param {string} templateType - 模板类型
   * @returns {Object} 建议的尺寸
   */
  suggestSize(templateType) {
    const sizeConstraints = this.constraints
    const aspectRatio = sizeConstraints.aspectRatio[templateType]

    if (!aspectRatio) {
      return {
        width: 0.5,
        height: 0.5
      }
    }

    // 使用推荐的宽高比计算尺寸
    const recommendedRatio = (aspectRatio.min + aspectRatio.max) / 2
    const width = 0.6
    const height = width / recommendedRatio

    return { width, height }
  }

  /**
   * 调整尺寸以符合宽高比
   * @param {Object} size - 当前尺寸
   * @param {number} targetRatio - 目标宽高比
   * @param {string} fixedDimension - 固定的维度 ('width' 或 'height')
   * @returns {Object} 调整后的尺寸
   */
  adjustSizeToRatio(size, targetRatio, fixedDimension = 'width') {
    if (fixedDimension === 'width') {
      return {
        width: size.width,
        height: size.width / targetRatio
      }
    } else {
      return {
        width: size.height * targetRatio,
        height: size.height
      }
    }
  }
}

export default SizeValidator
