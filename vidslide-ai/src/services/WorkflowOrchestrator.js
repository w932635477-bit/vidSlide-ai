/**
 * VidSlide AI - 工作流编排器（智能Agent）
 *
 * 功能：
 * - 理解工作流程的语义和依赖关系
 * - 动态调整执行策略
 * - 智能错误恢复和降级处理
 * - 依赖分析和拓扑排序
 */

import { WorkflowEngine } from './WorkflowEngine.js'
import { getAllTemplates } from '../utils/templates/index.js'

export class WorkflowOrchestrator {
  constructor() {
    // 工作流引擎
    this.engine = new WorkflowEngine()

    // 工作流程知识库
    this.workflowKnowledge = {
      steps: [
        {
          id: 'video-analysis',
          name: '视频分析',
          purpose: '提取视频的元数据、关键帧、语音内容',
          dependencies: [],
          requiredInputs: ['videoFile'],
          outputs: [
            'metadata',
            'keyframes',
            'scenes',
            'transcript',
            'keywords',
            'topics',
            'contentType'
          ],
          criticalOutputs: ['transcript', 'keywords', 'contentType'],
          estimatedTime: 20000, // 20秒
          retryable: true,
          fallbackStrategy: 'use-mock-data'
        },
        {
          id: 'template-recommendation',
          name: '模板推荐',
          purpose: '根据内容分析结果推荐最合适的模板',
          dependencies: ['video-analysis'],
          requiredInputs: ['keywords', 'contentType'],
          outputs: ['selectedTemplate'],
          criticalOutputs: ['selectedTemplate'],
          estimatedTime: 5000, // 5秒
          retryable: true,
          fallbackStrategy: 'use-default-template'
        },
        {
          id: 'material-matching',
          name: '素材匹配',
          purpose: '为关键词搜索匹配的素材',
          dependencies: ['video-analysis'],
          requiredInputs: ['keywords'],
          outputs: ['materials'],
          criticalOutputs: [],
          estimatedTime: 15000, // 15秒
          retryable: true,
          fallbackStrategy: 'skip'
        },
        {
          id: 'content-composition',
          name: '内容组合',
          purpose: '将分析结果、模板、素材组合成场景序列',
          dependencies: ['video-analysis', 'template-recommendation'],
          requiredInputs: ['transcript', 'keywords', 'selectedTemplate'],
          outputs: ['scenes', 'composition'],
          criticalOutputs: ['scenes'],
          estimatedTime: 8000, // 8秒
          retryable: true,
          fallbackStrategy: 'simplify-scenes'
        },
        {
          id: 'rendering',
          name: '渲染导出',
          purpose: '渲染所有场景并生成最终预览',
          dependencies: ['content-composition'],
          requiredInputs: ['scenes', 'metadata'],
          outputs: ['renderedScenes', 'previewUrl', 'canExport'],
          criticalOutputs: ['renderedScenes'],
          estimatedTime: 10000, // 10秒
          retryable: true,
          fallbackStrategy: 'reduce-quality'
        }
      ]
    }

    // 执行上下文
    this.context = null
  }

  /**
   * 智能执行工作流
   * @param {File} videoFile - 视频文件
   * @param {Object} options - 选项
   * @returns {Promise<Object>} - 执行结果
   */
  async executeWorkflow(videoFile, options = {}) {
    // 初始化上下文
    this.context = {
      videoFile,
      data: {},
      errors: [],
      warnings: [],
      startTime: Date.now(),
      options
    }

    // 重置引擎
    this.engine.reset()

    // 按依赖关系排序步骤
    const sortedSteps = this.topologicalSort(this.workflowKnowledge.steps)

    // 注册步骤到引擎
    for (const stepDef of sortedSteps) {
      this.engine.registerStep({
        id: stepDef.id,
        name: stepDef.name,
        execute: async (inputData, log) => {
          return await this.executeStepWithFallback(stepDef, inputData, log)
        },
        validate: output => {
          return this.validateOutput(stepDef, output)
        }
      })
    }

    try {
      // 执行工作流
      const result = await this.engine.executeWorkflow({
        videoFile,
        ...this.context.data
      })

      // 添加统计信息
      result.statistics = this.engine.getStatistics()
      result.warnings = this.context.warnings
      result.executionTime = Date.now() - this.context.startTime

      return result
    } catch (error) {
      console.error('❌ 工作流执行失败:', error)
      throw new Error(`工作流执行失败: ${error.message}`)
    }
  }

  /**
   * 执行步骤（带降级处理）
   * @param {Object} stepDef - 步骤定义
   * @param {Object} inputData - 输入数据
   * @param {Function} log - 日志函数
   * @returns {Promise<Object>} - 输出数据
   */
  async executeStepWithFallback(stepDef, inputData, log) {
    try {
      // 检查依赖是否满足
      if (!this.checkDependencies(stepDef, inputData)) {
        throw new Error(`步骤 ${stepDef.name} 的依赖未满足`)
      }

      // 检查必需输入
      if (!this.checkRequiredInputs(stepDef, inputData)) {
        throw new Error(`步骤 ${stepDef.name} 缺少必需输入`)
      }

      // 执行步骤的实际逻辑
      const result = await this.executeStepLogic(stepDef, inputData, log)

      return result
    } catch (error) {
      log(`执行失败: ${error.message}`)

      // 尝试降级处理
      if (stepDef.fallbackStrategy) {
        log(`尝试降级策略: ${stepDef.fallbackStrategy}`)

        const fallbackResult = await this.executeFallback(stepDef, inputData, log)

        if (fallbackResult) {
          this.context.warnings.push({
            step: stepDef.name,
            message: `使用了降级策略: ${stepDef.fallbackStrategy}`,
            originalError: error.message
          })

          return fallbackResult
        }
      }

      // 检查是否可以跳过
      if (!this.isStepCritical(stepDef)) {
        log(`步骤非关键，已跳过`)

        this.context.warnings.push({
          step: stepDef.name,
          message: '步骤失败但已跳过',
          error: error.message
        })

        return inputData // 返回原始输入，继续流程
      }

      // 无法恢复，抛出错误
      throw error
    }
  }

  /**
   * 执行步骤的实际逻辑
   * @param {Object} stepDef - 步骤定义
   * @param {Object} inputData - 输入数据
   * @param {Function} log - 日志函数
   * @returns {Promise<Object>} - 输出数据
   */
  async executeStepLogic(stepDef, inputData, log) {
    switch (stepDef.id) {
      case 'video-analysis':
        return await this.analyzeVideo(inputData, log)

      case 'template-recommendation':
        return await this.recommendTemplate(inputData, log)

      case 'material-matching':
        return await this.matchMaterials(inputData, log)

      case 'content-composition':
        return await this.composeContent(inputData, log)

      case 'rendering':
        return await this.renderFinal(inputData, log)

      default:
        throw new Error(`未知步骤: ${stepDef.id}`)
    }
  }

  /**
   * 步骤1: 分析视频
   */
  async analyzeVideo(inputData, log) {
    const { videoFile } = inputData

    log('加载视频文件')
    // 这里调用实际的 VideoProcessingService
    // 为了演示，我们返回模拟数据

    log('提取视频元数据')
    const metadata = {
      duration: 180,
      width: 1920,
      height: 1080,
      fps: 30,
      size: videoFile.size
    }

    log('提取关键帧')
    const keyframes = []

    log('检测场景')
    const scenes = []

    log('语音识别')
    const transcript = '这是一个关于人工智能技术的演讲，介绍了AI在各个领域的应用。'

    log('提取关键词')
    const keywords = [
      { text: '人工智能', weight: 0.9 },
      { text: '技术', weight: 0.8 },
      { text: '应用', weight: 0.7 }
    ]

    log('分析内容类型')
    const contentType = 'tech'

    log('提取主题')
    const topics = ['人工智能', '技术', '应用']

    return {
      ...inputData,
      metadata,
      keyframes,
      scenes,
      transcript,
      keywords,
      topics,
      contentType
    }
  }

  /**
   * 步骤2: 推荐模板
   */
  async recommendTemplate(inputData, log) {
    const { contentType, keywords } = inputData

    log('分析内容特征')

    log('获取可用模板')
    const templates = getAllTemplates()

    if (!templates || templates.length === 0) {
      throw new Error('没有可用的模板')
    }

    log(`找到 ${templates.length} 个模板`)

    // 根据内容类型选择模板
    let selectedTemplate = null

    if (contentType === 'tech' || contentType === 'data') {
      selectedTemplate = templates.find(t => t.id === 'data-visualization')
    } else if (contentType === 'educational') {
      selectedTemplate = templates.find(t => t.id === 'standard-presentation')
    } else if (contentType === 'promotional') {
      selectedTemplate = templates.find(t => t.id === 'marketing-funnel')
    }

    // 如果没找到特定模板，使用第一个
    if (!selectedTemplate) {
      selectedTemplate = templates[0]
      log(`使用默认模板: ${selectedTemplate.name || selectedTemplate.id}`)
    } else {
      log(`自动选择模板: ${selectedTemplate.name || selectedTemplate.id}`)
    }

    // 确保 selectedTemplate 有 id 属性
    if (!selectedTemplate || !selectedTemplate.id) {
      log('警告: 模板缺少 id，使用第一个可用模板')
      selectedTemplate = templates[0]

      // 如果还是没有 id，创建一个基本模板对象
      if (!selectedTemplate || !selectedTemplate.id) {
        selectedTemplate = {
          id: 'default-template',
          name: '默认模板',
          type: 'standard'
        }
        log('使用默认模板对象')
      }
    }

    log(`最终选择模板: ${selectedTemplate.id}`)

    return {
      ...inputData,
      selectedTemplate
    }
  }

  /**
   * 步骤3: 匹配素材
   */
  async matchMaterials(inputData, log) {
    const { keywords } = inputData

    log('开始搜索素材')

    const materials = []

    // 为前5个关键词搜索素材
    const topKeywords = keywords.slice(0, 5)

    for (let i = 0; i < topKeywords.length; i++) {
      const keyword = topKeywords[i]
      log(`搜索素材: ${keyword.text}`)

      // 这里应该调用 MaterialService
      // 为了演示，我们创建占位符
      materials.push({
        keyword: keyword.text,
        material: {
          type: 'placeholder',
          keyword: keyword.text,
          url: null
        }
      })
    }

    log(`找到 ${materials.length} 个素材`)

    return {
      ...inputData,
      materials
    }
  }

  /**
   * 步骤4: 组合内容
   */
  async composeContent(inputData, log) {
    const { transcript, keywords, selectedTemplate, materials, metadata } = inputData

    log('分析转录文本')

    // 简单分段
    const sentences = transcript.split(/[。！？.!?]+/).filter(s => s.trim().length > 0)

    log(`分析出 ${sentences.length} 个句子`)

    log('生成场景序列')

    const scenes = []
    const sentencesPerScene = 2

    for (let i = 0; i < sentences.length; i += sentencesPerScene) {
      const sceneSentences = sentences.slice(i, i + sentencesPerScene)
      const content = sceneSentences.join('。') + '。'

      const sceneKeywords = keywords.filter(k => content.includes(k.text)).slice(0, 3)

      const title = sceneKeywords[0]?.text || content.substring(0, 10) + '...'

      scenes.push({
        id: `scene-${i}`,
        title,
        content,
        keywords: sceneKeywords,
        duration: 3,
        startTime: i * 3,
        endTime: (i + sentencesPerScene) * 3,
        template: selectedTemplate.id,
        material: materials[i % materials.length]
      })
    }

    log(`生成了 ${scenes.length} 个场景`)

    log('优化时长分配')

    const durationPerScene = metadata.duration / scenes.length

    const optimizedScenes = scenes.map((scene, index) => ({
      ...scene,
      duration: durationPerScene,
      startTime: index * durationPerScene,
      endTime: (index + 1) * durationPerScene
    }))

    return {
      ...inputData,
      scenes: optimizedScenes,
      composition: {
        template: selectedTemplate,
        scenes: optimizedScenes,
        materials,
        metadata
      }
    }
  }

  /**
   * 步骤5: 渲染最终视频
   */
  async renderFinal(inputData, log) {
    const { scenes, metadata, videoFile } = inputData

    log('准备渲染数据')

    const renderData = {
      video: {
        file: videoFile,
        url: URL.createObjectURL(videoFile),
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height
      },
      scenes
    }

    log('开始渲染场景')

    const renderedScenes = []

    for (let i = 0; i < scenes.length; i++) {
      log(`渲染场景 ${i + 1}/${scenes.length}`)

      // 这里应该调用实际的渲染器
      // 为了演示，我们模拟渲染
      await this.delay(100)

      renderedScenes.push({
        ...scenes[i],
        rendered: true
      })
    }

    log('渲染完成')

    return {
      ...inputData,
      renderedScenes,
      previewUrl: renderData.video.url,
      canExport: true,
      previewReady: true
    }
  }

  /**
   * 执行降级策略
   */
  async executeFallback(stepDef, inputData, log) {
    log(`执行降级策略: ${stepDef.fallbackStrategy}`)

    switch (stepDef.fallbackStrategy) {
      case 'use-mock-data':
        return this.getMockData(stepDef, inputData)

      case 'use-default-template':
        return this.getDefaultTemplate(inputData)

      case 'skip':
        return inputData // 跳过，返回原始输入

      case 'simplify-scenes':
        return this.generateSimpleScenes(inputData)

      case 'reduce-quality':
        return this.renderLowQuality(inputData)

      default:
        return null
    }
  }

  /**
   * 获取模拟数据
   */
  getMockData(stepDef, inputData) {
    return {
      ...inputData,
      transcript: '模拟转录文本',
      keywords: [{ text: '示例', weight: 1.0 }],
      contentType: 'presentation'
    }
  }

  /**
   * 获取默认模板
   */
  getDefaultTemplate(inputData) {
    const templates = TemplateArchitecture.getAllTemplates()
    return {
      ...inputData,
      selectedTemplate: templates[0]
    }
  }

  /**
   * 生成简单场景
   */
  generateSimpleScenes(inputData) {
    return {
      ...inputData,
      scenes: [
        {
          id: 'scene-1',
          title: '简化场景',
          content: inputData.transcript || '内容',
          duration: inputData.metadata?.duration || 10
        }
      ]
    }
  }

  /**
   * 低质量渲染
   */
  async renderLowQuality(inputData) {
    return {
      ...inputData,
      renderedScenes: inputData.scenes || [],
      canExport: true,
      quality: 'low'
    }
  }

  /**
   * 检查依赖是否满足
   */
  checkDependencies(stepDef, inputData) {
    for (const depId of stepDef.dependencies) {
      const depStep = this.workflowKnowledge.steps.find(s => s.id === depId)
      if (!depStep) continue

      // 检查依赖步骤的输出是否存在
      for (const output of depStep.criticalOutputs) {
        if (!inputData[output]) {
          return false
        }
      }
    }
    return true
  }

  /**
   * 检查必需输入
   */
  checkRequiredInputs(stepDef, inputData) {
    for (const input of stepDef.requiredInputs) {
      if (!inputData[input]) {
        return false
      }
    }
    return true
  }

  /**
   * 验证输出
   */
  validateOutput(stepDef, result) {
    // 检查关键输出是否存在
    for (const output of stepDef.criticalOutputs) {
      if (!result[output]) {
        console.error(`❌ 缺少关键输出: ${output}`)
        return false
      }

      // 检查输出的有效性
      if (!this.isValidOutput(output, result[output])) {
        console.error(`❌ 输出 ${output} 无效`)
        return false
      }
    }

    return true
  }

  /**
   * 检查输出有效性
   */
  isValidOutput(name, value) {
    switch (name) {
      case 'transcript':
        return typeof value === 'string' && value.length > 0

      case 'keywords':
        return Array.isArray(value) && value.length > 0

      case 'contentType':
        return typeof value === 'string' && value.length > 0

      case 'selectedTemplate':
        return value && value.id

      case 'scenes':
        return Array.isArray(value) && value.length > 0

      case 'renderedScenes':
        return Array.isArray(value) && value.length > 0

      default:
        return value !== null && value !== undefined
    }
  }

  /**
   * 判断步骤是否关键
   */
  isStepCritical(stepDef) {
    // 如果有关键输出，则是关键步骤
    if (stepDef.criticalOutputs && stepDef.criticalOutputs.length > 0) {
      return true
    }

    // 如果有其他步骤依赖它，则是关键步骤
    const hasDependents = this.workflowKnowledge.steps.some(step =>
      step.dependencies.includes(stepDef.id)
    )

    return hasDependents
  }

  /**
   * 拓扑排序（按依赖关系排序步骤）
   */
  topologicalSort(steps) {
    const sorted = []
    const visited = new Set()
    const visiting = new Set()

    const visit = step => {
      if (visited.has(step.id)) return
      if (visiting.has(step.id)) {
        throw new Error(`检测到循环依赖: ${step.id}`)
      }

      visiting.add(step.id)

      // 先访问依赖
      for (const depId of step.dependencies) {
        const depStep = steps.find(s => s.id === depId)
        if (depStep) {
          visit(depStep)
        }
      }

      visiting.delete(step.id)
      visited.add(step.id)
      sorted.push(step)
    }

    for (const step of steps) {
      visit(step)
    }

    return sorted
  }

  /**
   * 延迟
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取引擎实例
   */
  getEngine() {
    return this.engine
  }
}

export default WorkflowOrchestrator
