/**
 * VidSlide AI - 模板引擎入口
 * 统一导出所有模板引擎组件
 */

// 核心组件
export { default as TemplateRenderer } from './TemplateRenderer.js'
export { default as TemplateParser } from './TemplateParser.js'
export { default as VisualEffects } from './VisualEffects.js'
export { default as ConstraintSystem } from './ConstraintSystem.js'

// 模板定义和配置
export {
  TEMPLATE_TYPES,
  TEMPLATE_CONFIGS,
  TEMPLATE_TRIGGERS,
  DEFAULT_TEMPLATE,
  TEMPLATE_PRIORITY
} from './TemplateDefinitions.js'

// 类型定义（用于TypeScript支持）
export const TemplateEngineTypes = {
  // 模板类型
  TEMPLATE_TYPES,

  // 渲染选项
  RenderOptions: {
    animate: 'boolean', // 是否启用动画
    context: 'object', // 上下文信息
    constraints: 'object', // 约束条件
    adjustments: 'object' // 用户调整
  },

  // 验证结果
  ValidationResult: {
    isValid: 'boolean', // 是否有效
    violations: 'array', // 违反项
    warnings: 'array', // 警告项
    suggestions: 'array', // 建议项
    score: 'number' // 合规分数
  },

  // 渲染结果
  RenderResult: {
    success: 'boolean', // 是否成功
    template: 'object', // 模板对象
    validation: 'object', // 验证结果
    renderResult: 'object', // 渲染结果
    performance: 'object' // 性能数据
  }
}

// 工厂函数
export class TemplateEngineFactory {
  /**
   * 创建模板渲染器实例
   * @param {HTMLCanvasElement} canvas - 画布元素
   * @param {CanvasRenderingContext2D} context - 画布上下文
   * @returns {TemplateRenderer} 渲染器实例
   */
  static /**
   * createRenderer 方法
   * VidSlide AI 功能实现
   */
  createRenderer(canvas, context) {
    return new TemplateRenderer(canvas, context)
  }

  /**
   * 创建模板解析器实例
   * @returns {TemplateParser} 解析器实例
   */
  static /**
   * createParser 方法
   * VidSlide AI 功能实现
   */
  createParser() {
    return new TemplateParser()
  }

  /**
   * 创建视觉效果实例
   * @param {HTMLCanvasElement} canvas - 画布元素
   * @param {CanvasRenderingContext2D} context - 画布上下文
   * @returns {VisualEffects} 视觉效果实例
   */
  static /**
   * createVisualEffects 方法
   * VidSlide AI 功能实现
   */
  createVisualEffects(canvas, context) {
    return new VisualEffects(canvas, context)
  }

  /**
   * 创建约束系统实例
   * @returns {ConstraintSystem} 约束系统实例
   */
  static /**
   * createConstraintSystem 方法
   * VidSlide AI 功能实现
   */
  createConstraintSystem() {
    return new ConstraintSystem()
  }
}

// 默认导出
export default {
  TemplateRenderer,
  TemplateParser,
  VisualEffects,
  ConstraintSystem,
  TemplateEngineFactory,
  TemplateEngineTypes
}
