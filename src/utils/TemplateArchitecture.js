/**
 * TemplateArchitecture - 模板架构（简化版）
 * 注意：Remotion 已被移除，此文件保留用于兼容性
 */

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

    console.log('🚀 初始化 TemplateArchitecture (简化版)...')

    // 加载默认模板
    this.loadDefaultTemplates()

    // 设置约束系统
    this.setupConstraints()

    this.initialized = true
    console.log(`✅ TemplateArchitecture 初始化完成，共加载 ${this.templates.size} 个模板`)
  }

  /**
   * 加载默认模板列表
   */
  loadDefaultTemplates() {
    // 简化的默认模板
    const defaultTemplates = [
      {
        id: 'modern-business',
        name: 'Modern Business',
        category: 'business',
        description: '现代商务风格',
        type: 'composition',
        renderer: 'ffmpeg'
      },
      {
        id: 'tech-style',
        name: 'Tech Style',
        category: 'technology',
        description: '科技风格',
        type: 'composition',
        renderer: 'ffmpeg'
      },
      {
        id: 'data-visualization',
        name: 'Data Visualization',
        category: 'data',
        description: '数据可视化',
        type: 'composition',
        renderer: 'ffmpeg'
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template)
    })

    console.log(`📋 已加载 ${defaultTemplates.length} 个默认模板`)
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
   * 注意：新的黑底模板系统只有4个模板，推荐逻辑已简化
   * 实际的场景级模板选择由 MicroSceneGenerator 负责
   */
  recommendTemplates(contentAnalysis) {
    const { keywords = [], dataMentions = 0, contentType = '' } = contentAnalysis
    const recommendations = []

    // 获取所有可用模板
    const allTemplates = this.getAllTemplates()

    if (allTemplates.length === 0) {
      console.warn('⚠️ 没有可用的模板')
      return []
    }

    // 根据内容类型推荐黑底模板
    if (contentType === 'data' || dataMentions > 0.3) {
      // 数据展示类 -> 黑底图表模板
      const chartTemplate = allTemplates.find(t => t.id === 'BlackBackgroundChart')
      if (chartTemplate) {
        recommendations.push({
          template: chartTemplate,
          score: 0.9,
          reason: '内容包含数据信息，适合图表模板'
        })
      }
    }

    if (
      contentType === 'emphasis' ||
      keywords.some(k => k.score && k.score > 0.8)
    ) {
      // 强调类 -> 黑底强调模板
      const emphasisTemplate = allTemplates.find(t => t.id === 'BlackBackgroundEmphasis')
      if (emphasisTemplate) {
        recommendations.push({
          template: emphasisTemplate,
          score: 0.85,
          reason: '内容包含重点强调，适合强调模板'
        })
      }
    }

    // 默认使用黑底基础模板（80%的场景）
    const basicTemplate = allTemplates.find(t => t.id === 'BlackBackgroundBasic')
    if (basicTemplate) {
      recommendations.push({
        template: basicTemplate,
        score: 0.8,
        reason: '通用场景，使用基础模板'
      })
    }

    // 如果没有匹配到任何模板，使用第一个可用模板
    if (recommendations.length === 0 && allTemplates.length > 0) {
      recommendations.push({
        template: allTemplates[0],
        score: 0.6,
        reason: '使用默认模板'
      })
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
