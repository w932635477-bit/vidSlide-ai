/**
 * VidSlide AI - 约束系统模块索引
 * 统一导出所有约束系统相关模块
 *
 * @module index
 * @description 提供约束系统的统一入口
 */

// 核心系统
export { ConstraintSystem } from './ConstraintSystem.js'

// 验证器
export { BaseValidator } from './validators/BaseValidator.js'
export { TextValidator } from './validators/TextValidator.js'
export { ColorValidator } from './validators/ColorValidator.js'
export { SizeValidator } from './validators/SizeValidator.js'
export { UXValidator } from './validators/UXValidator.js'

// 配置
export {
  TEXT_CONSTRAINTS,
  POSITION_CONSTRAINTS,
  SIZE_CONSTRAINTS,
  COLOR_CONSTRAINTS,
  LAYOUT_CONSTRAINTS,
  PERFORMANCE_CONSTRAINTS,
  PROFESSIONALISM_CONSTRAINTS,
  TYPOGRAPHY_CONSTRAINTS,
  HIERARCHY_CONSTRAINTS,
  BRANDING_CONSTRAINTS,
  UX_CONSTRAINTS,
  getAllConstraints,
  getConstraintsByCategory,
  getTemplateConstraint
} from './config/constraintConfig.js'

// 默认导出
export { ConstraintSystem as default } from './ConstraintSystem.js'
