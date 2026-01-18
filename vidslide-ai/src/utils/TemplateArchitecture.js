/**
 * TemplateArchitecture - Remotion模板架构
 * 使用Remotion的30个专业视频模板
 */

import RemotionService from '../services/RemotionService.js'

class TemplateArchitecture {
  constructor() {
    this.templates = new Map()
    this.constraints = new Map()
    this.initialized = false
    this.remotionService = RemotionService
  }

  /**
   * 初始化模板架构
   */
  async initialize() {
    if (this.initialized) {
      console.log('⚠️ TemplateArchitecture 已经初始化')
      return
    }

    console.log('🚀 初始化 TemplateArchitecture (Remotion模板)...')

    // 从Remotion服务加载所有模板
    await this.loadRemotionTemplates()

    // 设置约束系统
    this.setupConstraints()

    this.initialized = true
    console.log(`✅ TemplateArchitecture 初始化完成，共加载 ${this.templates.size} 个Remotion模板`)
  }

  /**
   * 从Remotion服务加载模板
   */
  async loadRemotionTemplates() {
    try {
      // 获取Remotion模板列表
      const remotionTemplates = await this.remotionService.getAvailableTemplates()

      if (remotionTemplates && remotionTemplates.templates) {
        remotionTemplates.templates.forEach(template => {
          this.templates.set(template.id, {
            ...template,
            type: 'remotion',
            renderer: 'remotion'
          })
        })
        console.log(`📋 已加载 ${remotionTemplates.templates.length} 个Remotion模板`)
      }
    } catch (error) {
      console.error('❌ 加载Remotion模板失败:', error)
      // 使用默认模板列表
      this.loadDefaultTemplates()
    }
  }

  /**
   * 加载默认模板列表（当Remotion服务不可用时）
   */
  loadDefaultTemplates() {
    const defaultTemplates = this.remotionService.getDefaultTemplates()
    if (defaultTemplates && defaultTemplates.templates) {
      defaultTemplates.templates.forEach(template => {
        this.templates.set(template.id, {
          ...template,
          type: 'remotion',
          renderer: 'remotion'
        })
      })
      console.log(`📋 已加载 ${defaultTemplates.templates.length} 个默认Remotion模板`)
    }
  }

  /**
   * 设置约束系统
   */
  setupConstraints() {
    // Remotion模板的约束规则
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
    const { keywords = [], textDensity = 0, dataMentions = 0, contentType = '' } = contentAnalysis
    const recommendations = []

    // 根据内容类型匹配Remotion模板
    if (contentType === 'data' || dataMentions > 0.3) {
      // 数据展示类 -> 数据可视化模板
      const dataTemplates = this.getTemplatesByCategory('data')
      if (dataTemplates.length > 0) {
        recommendations.push({
          template: dataTemplates[0], // AnimatedBarChart
          score: 0.9,
          reason: '内容包含数据信息，适合数据可视化模板'
        })
      }
    }

    if (contentType === 'comparison' || keywords.some(k => ['对比', '区别', '比较', '优缺点', 'vs', 'VS'].includes(k))) {
      // 对比类 -> 对比分析模板
      const comparisonTemplates = this.getTemplatesByCategory('comparison')
      if (comparisonTemplates.length > 0) {
        recommendations.push({
          template: comparisonTemplates[0], // SplitComparison
          score: 0.85,
          reason: '内容包含对比元素，适合分屏对比模板'
        })
      }
    }

    if (contentType === 'text' || textDensity > 0.7) {
      // 文字密集 -> 文字动画模板
      const textTemplates = this.getTemplatesByCategory('text')
      if (textTemplates.length > 0) {
        recommendations.push({
          template: textTemplates[0], // KineticTypography
          score: 0.8,
          reason: '内容文字密集，适合文字动画模板'
        })
      }
    }

    if (contentType === 'showcase' || keywords.some(k => ['产品', '展示', '介绍', '推荐'].includes(k))) {
      // 展示类 -> 产品展示模板
      const showcaseTemplates = this.getTemplatesByCategory('showcase')
      if (showcaseTemplates.length > 0) {
        recommendations.push({
          template: showcaseTemplates[0], // GlassmorphismStack
          score: 0.85,
          reason: '内容适合产品展示，使用磨砂玻璃效果'
        })
      }
    }

    // 如果没有匹配到特定类型，使用默认模板
    if (recommendations.length === 0) {
      const allTemplates = this.getAllTemplates()
      if (allTemplates.length > 0) {
        recommendations.push({
          template: allTemplates[0],
          score: 0.6,
          reason: '使用默认模板'
        })
      }
    }

    // 按评分排序，返回前3个
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 3)
  }

  /**
   * 渲染Remotion模板
   * @param {string} templateId - 模板ID
   * @param {Object} props - 模板属性
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<{renderId: string, videoUrl: string}>}
   */
  async renderTemplate(templateId, props = {}, onProgress) {
    try {
      console.log(`🎬 开始渲染Remotion模板: ${templateId}`)

      // 调用Remotion服务渲染
      const result = await this.remotionService.renderVideo(templateId, props)

      // 等待渲染完成
      const progress = await this.remotionService.getRenderProgress(result.renderId)

      // 轮询进度
      while (progress.status !== 'done' && progress.status !== 'error') {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const newProgress = await this.remotionService.getRenderProgress(result.renderId)

        if (onProgress) {
          onProgress(newProgress)
        }

        if (newProgress.status === 'done') {
          break
        }

        if (newProgress.status === 'error') {
          throw new Error(newProgress.error || '渲染失败')
        }
      }

      const videoUrl = `${this.remotionService.baseURL}/download/${result.renderId}`

      console.log(`✅ Remotion模板渲染完成: ${videoUrl}`)

      return {
        renderId: result.renderId,
        videoUrl,
        success: true
      }
    } catch (error) {
      console.error('❌ Remotion模板渲染失败:', error)
      throw error
    }
  }

  /**
   * 获取模板统计信息
   */
  getStatistics() {
    const stats = {
      totalTemplates: this.templates.size,
      templatesByCategory: {},
      renderer: 'remotion'
    }

    for (const template of this.templates.values()) {
      const category = template.category || 'unknown'
      stats.templatesByCategory[category] = (stats.templatesByCategory[category] || 0) + 1
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
