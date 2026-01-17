/**
 * TemplateArchitecture - 简化版核心架构
 * 从2,923行简化到~300行
 * 模板定义已拆分到独立文件
 */

import { templateRegistry, getAllTemplates, getTemplateById, getTemplatesByCategory } from './templates/index.js'

class TemplateArchitecture {
  constructor() {
    this.templates = new Map()
    this.constraints = new Map()
    this.initialized = false
  }

  /**
   * 初始化模板架构
   */
  async initialize() {
    if (this.initialized) {
      console.log('⚠️ TemplateArchitecture 已经初始化')
      return
    }

    console.log('🚀 初始化 TemplateArchitecture...')

    // 从注册表加载所有模板
    this.loadTemplatesFromRegistry()

    // 设置约束系统
    this.setupConstraints()

    this.initialized = true
    console.log(`✅ TemplateArchitecture 初始化完成，共加载 ${this.templates.size} 个模板`)
  }

  /**
   * 从注册表加载模板
   */
  loadTemplatesFromRegistry() {
    Object.entries(templateRegistry).forEach(([id, template]) => {
      this.templates.set(id, template)
    })
  }

  /**
   * 设置约束系统
   */
  setupConstraints() {
    // 全局约束规则
    this.constraints.set('global', {
      maxLayers: 10,
      maxElementsPerLayer: 5,
      allowedTypes: ['fixed', 'dynamic', 'adjustable'],
      zIndexRange: { min: 1, max: 100 }
    })

    // 层级特定约束
    this.constraints.set('fixed', {
      modifiable: false,
      removable: false,
      properties: ['position', 'size', 'style', 'animation'],
      userAdjustable: ['position', 'size']
    })

    this.constraints.set('dynamic', {
      modifiable: false,
      removable: false,
      properties: ['content', 'data', 'config'],
      userAdjustable: []
    })

    this.constraints.set('adjustable', {
      modifiable: true,
      removable: true,
      properties: ['content', 'style', 'position', 'config'],
      userAdjustable: ['content', 'style', 'position', 'config']
    })
  }

  /**
   * 获取模板定义
   */
  getTemplate(templateId) {
    return this.templates.get(templateId) || null
  }

  /**
   * 获取所有模板列表
   */
  getAllTemplates() {
    return Array.from(this.templates.values())
  }

  /**
   * 根据类别获取模板
   */
  getTemplatesByCategory(category) {
    return this.getAllTemplates().filter(t => t.category === category)
  }

  /**
   * 根据内容类型推荐模板
   */
  recommendTemplates(contentAnalysis) {
    const { keywords = [], textDensity = 0, dataMentions = 0, hasVideo = false } = contentAnalysis
    const recommendations = []

    // 规则引擎匹配
    if (hasVideo && keywords.some(k => ['演讲', '演示', '讲解'].includes(k))) {
      const template = this.templates.get('picture-in-picture')
      if (template) {
        recommendations.push({
          template,
          score: 0.9,
          reason: '视频内容包含演讲元素，适合画中画模板'
        })
      }
    }

    if (dataMentions > 0.3) {
      const template = this.templates.get('info-card')
      if (template) {
        recommendations.push({
          template,
          score: 0.8,
          reason: '内容包含大量数据信息，适合信息卡片展示'
        })
      }
    }

    if (keywords.some(k => ['时间', '发展', '历程', '阶段'].includes(k))) {
      const template = this.templates.get('timeline')
      if (template) {
        recommendations.push({
          template,
          score: 0.85,
          reason: '内容涉及时间发展，适合时间线展示'
        })
      }
    }

    if (keywords.some(k => ['对比', '区别', '比较', '优缺点'].includes(k))) {
      const template = this.templates.get('split-screen')
      if (template) {
        recommendations.push({
          template,
          score: 0.8,
          reason: '内容包含对比元素，适合分屏展示'
        })
      }
    }

    if (keywords.length > 0) {
      const template = this.templates.get('keyword-highlight')
      if (template) {
        recommendations.push({
          template,
          score: 0.7,
          reason: '内容包含关键词，适合高亮展示'
        })
      }
    }

    // 按评分排序
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 3)
  }

  /**
   * 验证模板修改是否符合约束
   */
  validateModification(templateId, layerId, property, value) {
    const template = this.getTemplate(templateId)
    if (!template) {
      return { valid: false, reason: '模板不存在' }
    }

    // 查找层定义
    let layerDef = null
    for (const layerType of Object.keys(template.layers)) {
      const layer = template.layers[layerType].find(l => l.id === layerId)
      if (layer) {
        layerDef = { ...layer, layerType }
        break
      }
    }

    if (!layerDef) {
      return { valid: false, reason: '层不存在' }
    }

    // 检查层级约束
    const layerConstraints = this.constraints.get(layerDef.layerType)
    if (!layerConstraints) {
      return { valid: false, reason: '层级约束未定义' }
    }

    // 检查是否允许修改
    if (!layerConstraints.modifiable) {
      return {
        valid: false,
        reason: layerDef.constraints?.reason || `${layerDef.layerType}层不可修改`
      }
    }

    // 检查属性是否允许调整
    if (!layerConstraints.userAdjustable.includes(property)) {
      return {
        valid: false,
        reason: `属性 ${property} 不允许用户调整`
      }
    }

    return { valid: true }
  }

  /**
   * 创建新的模板实例
   */
  createTemplateInstance(templateId, customizations = {}) {
    const template = this.getTemplate(templateId)
    if (!template) {
      throw new Error(`模板 ${templateId} 不存在`)
    }

    // 深拷贝模板定义
    const instance = JSON.parse(JSON.stringify(template))

    // 应用自定义选项
    this.applyCustomizations(instance, customizations)

    // 设置实例元数据
    instance.instanceId = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    instance.createdAt = new Date().toISOString()
    instance.version = '1.0'

    return instance
  }

  /**
   * 应用自定义选项
   */
  applyCustomizations(instance, customizations) {
    if (customizations.theme) {
      instance.theme = { ...instance.theme, ...customizations.theme }
    }

    if (customizations.layers) {
      for (const [layerId, properties] of Object.entries(customizations.layers)) {
        const layer = this.findLayer(instance, layerId)
        if (layer && layer.type === 'adjustable') {
          for (const [prop, value] of Object.entries(properties)) {
            const validation = this.validateModification(instance.id, layerId, prop, value)
            if (validation.valid) {
              layer.properties[prop] = value
            } else {
              console.warn(`自定义选项被拒绝: ${validation.reason}`)
            }
          }
        }
      }
    }
  }

  /**
   * 查找层定义
   */
  findLayer(instance, layerId) {
    for (const layerType of Object.keys(instance.layers)) {
      const layer = instance.layers[layerType].find(l => l.id === layerId)
      if (layer) return layer
    }
    return null
  }

  /**
   * 获取模板统计信息
   */
  getStatistics() {
    const stats = {
      totalTemplates: this.templates.size,
      templatesByCategory: {},
      layersByType: { fixed: 0, dynamic: 0, adjustable: 0 }
    }

    for (const template of this.templates.values()) {
      const category = template.category
      stats.templatesByCategory[category] = (stats.templatesByCategory[category] || 0) + 1

      for (const [layerType, layers] of Object.entries(template.layers)) {
        stats.layersByType[layerType] += layers.length
      }
    }

    return stats
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.templates.clear()
    this.constraints.clear()
    this.initialized = false
  }
}

// 导出单例
export default new TemplateArchitecture()
