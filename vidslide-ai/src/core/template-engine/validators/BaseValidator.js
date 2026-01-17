/**
 * VidSlide AI - 基础验证器
 * 提供所有验证器的基础功能和工具方法
 *
 * @module BaseValidator
 * @description 抽象基类，定义验证器的通用接口和辅助方法
 */

/**
 * 基础验证器类
 * @class BaseValidator
 * @description 所有验证器的抽象基类，提供通用验证方法
 */
export class BaseValidator {
  /**
   * 构造函数
   * @param {Object} constraints - 约束配置
   */
  constructor(constraints) {
    this.constraints = constraints
  }

  /**
   * 验证方法（子类必须实现）
   * @param {Object} adjustments - 用户调整数据
   * @param {string} templateType - 模板类型
   * @param {Array} violations - 违反规则列表
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   * @throws {Error} 子类必须实现此方法
   */
  validate(adjustments, templateType, violations, warnings, suggestions) {
    throw new Error('validate() method must be implemented by subclass')
  }

  /**
   * 添加违规项
   * @param {Array} violations - 违规列表
   * @param {Object} violation - 违规信息
   */
  addViolation(violations, violation) {
    violations.push({
      severity: 'high',
      timestamp: new Date().toISOString(),
      ...violation
    })
  }

  /**
   * 添加警告项
   * @param {Array} warnings - 警告列表
   * @param {Object} warning - 警告信息
   */
  addWarning(warnings, warning) {
    warnings.push({
      severity: 'medium',
      timestamp: new Date().toISOString(),
      ...warning
    })
  }

  /**
   * 添加建议项
   * @param {Array} suggestions - 建议列表
   * @param {Object} suggestion - 建议信息
   */
  addSuggestion(suggestions, suggestion) {
    suggestions.push({
      severity: 'low',
      timestamp: new Date().toISOString(),
      ...suggestion
    })
  }

  /**
   * 检查值是否在范围内
   * @param {number} value - 要检查的值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {boolean} 是否在范围内
   */
  isInRange(value, min, max) {
    return value >= min && value <= max
  }

  /**
   * 检查值是否小于最小值
   * @param {number} value - 要检查的值
   * @param {number} min - 最小值
   * @returns {boolean} 是否小于最小值
   */
  isBelowMin(value, min) {
    return value < min
  }

  /**
   * 检查值是否大于最大值
   * @param {number} value - 要检查的值
   * @param {number} max - 最大值
   * @returns {boolean} 是否大于最大值
   */
  isAboveMax(value, max) {
    return value > max
  }

  /**
   * 检查数组是否包含值
   * @param {Array} array - 数组
   * @param {*} value - 要检查的值
   * @returns {boolean} 是否包含
   */
  includes(array, value) {
    return array.includes(value)
  }

  /**
   * 获取约束配置
   * @param {string} key - 配置键
   * @returns {*} 配置值
   */
  getConstraint(key) {
    return this.constraints[key]
  }

  /**
   * 格式化错误消息
   * @param {string} template - 消息模板
   * @param {Object} params - 参数对象
   * @returns {string} 格式化后的消息
   */
  formatMessage(template, params) {
    let message = template
    for (const key in params) {
      message = message.replace(`{${key}}`, params[key])
    }
    return message
  }

  /**
   * 验证必需字段
   * @param {Object} data - 数据对象
   * @param {Array} requiredFields - 必需字段列表
   * @param {Array} violations - 违规列表
   */
  validateRequiredFields(data, requiredFields, violations) {
    requiredFields.forEach(field => {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        this.addViolation(violations, {
          type: 'MISSING_REQUIRED_FIELD',
          field: field,
          message: `缺少必需字段: ${field}`,
          required: true
        })
      }
    })
  }

  /**
   * 验证数据类型
   * @param {*} value - 要验证的值
   * @param {string} expectedType - 期望的类型
   * @returns {boolean} 类型是否匹配
   */
  validateType(value, expectedType) {
    const actualType = Array.isArray(value) ? 'array' : typeof value
    return actualType === expectedType
  }
}

export default BaseValidator
