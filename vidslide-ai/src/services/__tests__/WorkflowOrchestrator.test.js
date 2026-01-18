/**
 * WorkflowOrchestrator 集成测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { WorkflowOrchestrator } from '../WorkflowOrchestrator.js'

describe('WorkflowOrchestrator', () => {
  let orchestrator

  beforeEach(() => {
    orchestrator = new WorkflowOrchestrator()
  })

  describe('工作流执行', () => {
    it('应该能够执行完整的工作流', async () => {
      // 创建模拟视频文件
      const mockVideoFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const result = await orchestrator.executeWorkflow(mockVideoFile)

      // 验证结果包含所有必需的输出
      expect(result).toHaveProperty('transcript')
      expect(result).toHaveProperty('keywords')
      expect(result).toHaveProperty('selectedTemplate')
      expect(result).toHaveProperty('scenes')
      expect(result).toHaveProperty('renderedScenes')
      expect(result).toHaveProperty('canExport')
    })

    it('应该按正确的依赖顺序执行步骤', async () => {
      const mockVideoFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const engine = orchestrator.getEngine()
      const executionOrder = []

      engine.on('step:start', data => {
        executionOrder.push(data.stepName)
      })

      await orchestrator.executeWorkflow(mockVideoFile)

      // 验证执行顺序
      expect(executionOrder).toEqual(['视频分析', '模板推荐', '素材匹配', '内容组合', '渲染导出'])
    })

    it('应该正确传递数据到下一个步骤', async () => {
      const mockVideoFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const result = await orchestrator.executeWorkflow(mockVideoFile)

      // 验证数据传递
      expect(result.videoFile).toBe(mockVideoFile)
      expect(result.keywords).toBeDefined()
      expect(result.selectedTemplate).toBeDefined()
      expect(result.scenes).toBeDefined()
    })
  })

  describe('依赖关系', () => {
    it('应该正确识别步骤依赖', () => {
      const steps = orchestrator.workflowKnowledge.steps

      // 视频分析没有依赖
      const videoAnalysis = steps.find(s => s.id === 'video-analysis')
      expect(videoAnalysis.dependencies).toHaveLength(0)

      // 模板推荐依赖视频分析
      const templateRec = steps.find(s => s.id === 'template-recommendation')
      expect(templateRec.dependencies).toContain('video-analysis')

      // 内容组合依赖视频分析和模板推荐
      const contentComp = steps.find(s => s.id === 'content-composition')
      expect(contentComp.dependencies).toContain('video-analysis')
      expect(contentComp.dependencies).toContain('template-recommendation')
    })

    it('应该能够进行拓扑排序', () => {
      const steps = orchestrator.workflowKnowledge.steps
      const sorted = orchestrator.topologicalSort(steps)

      // 验证排序结果
      const ids = sorted.map(s => s.id)

      // 视频分析应该在最前面
      expect(ids[0]).toBe('video-analysis')

      // 模板推荐应该在视频分析之后
      const videoAnalysisIndex = ids.indexOf('video-analysis')
      const templateRecIndex = ids.indexOf('template-recommendation')
      expect(templateRecIndex).toBeGreaterThan(videoAnalysisIndex)

      // 内容组合应该在模板推荐之后
      const contentCompIndex = ids.indexOf('content-composition')
      expect(contentCompIndex).toBeGreaterThan(templateRecIndex)
    })
  })

  describe('输出验证', () => {
    it('应该验证关键输出', () => {
      const stepDef = orchestrator.workflowKnowledge.steps.find(s => s.id === 'video-analysis')

      // 有效输出
      const validOutput = {
        transcript: '测试文本',
        keywords: [{ text: '关键词', weight: 1.0 }],
        contentType: 'tech'
      }

      expect(orchestrator.validateOutput(stepDef, validOutput)).toBe(true)

      // 无效输出 - 缺少关键字段
      const invalidOutput = {
        transcript: '测试文本'
        // 缺少 keywords 和 contentType
      }

      expect(orchestrator.validateOutput(stepDef, invalidOutput)).toBe(false)
    })

    it('应该验证输出的有效性', () => {
      // 有效的 transcript
      expect(orchestrator.isValidOutput('transcript', '测试文本')).toBe(true)
      expect(orchestrator.isValidOutput('transcript', '')).toBe(false)

      // 有效的 keywords
      expect(orchestrator.isValidOutput('keywords', [{ text: 'test' }])).toBe(true)
      expect(orchestrator.isValidOutput('keywords', [])).toBe(false)

      // 有效的 selectedTemplate
      expect(orchestrator.isValidOutput('selectedTemplate', { id: 'test' })).toBe(true)
      expect(orchestrator.isValidOutput('selectedTemplate', null)).toBe(false)
    })
  })

  describe('降级策略', () => {
    it('应该在步骤失败时使用降级策略', async () => {
      // 修改 orchestrator 使某个步骤失败
      const originalExecute = orchestrator.analyzeVideo
      orchestrator.analyzeVideo = async () => {
        throw new Error('分析失败')
      }

      const mockVideoFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      // 应该使用降级策略而不是完全失败
      const result = await orchestrator.executeWorkflow(mockVideoFile)

      // 验证使用了降级数据
      expect(result).toHaveProperty('transcript')
      expect(result).toHaveProperty('keywords')

      // 恢复原始方法
      orchestrator.analyzeVideo = originalExecute
    })

    it('应该能够跳过非关键步骤', () => {
      const materialStep = orchestrator.workflowKnowledge.steps.find(
        s => s.id === 'material-matching'
      )

      // 素材匹配不是关键步骤
      expect(orchestrator.isStepCritical(materialStep)).toBe(false)
    })

    it('应该识别关键步骤', () => {
      const videoAnalysisStep = orchestrator.workflowKnowledge.steps.find(
        s => s.id === 'video-analysis'
      )

      // 视频分析是关键步骤（有关键输出）
      expect(orchestrator.isStepCritical(videoAnalysisStep)).toBe(true)
    })
  })

  describe('错误恢复', () => {
    it('应该在错误后继续执行', async () => {
      const mockVideoFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      // 即使某些步骤失败，也应该完成整个流程
      const result = await orchestrator.executeWorkflow(mockVideoFile)

      expect(result).toBeDefined()
      expect(result.canExport).toBe(true)
    })

    it('应该记录警告信息', async () => {
      const mockVideoFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const result = await orchestrator.executeWorkflow(mockVideoFile)

      // 如果使用了降级策略，应该有警告
      if (result.warnings && result.warnings.length > 0) {
        expect(result.warnings[0]).toHaveProperty('step')
        expect(result.warnings[0]).toHaveProperty('message')
      }
    })
  })

  describe('统计信息', () => {
    it('应该提供执行统计', async () => {
      const mockVideoFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const result = await orchestrator.executeWorkflow(mockVideoFile)

      expect(result.statistics).toBeDefined()
      expect(result.statistics.totalSteps).toBe(5)
      expect(result.statistics.completedSteps).toBeGreaterThan(0)
      expect(result.executionTime).toBeGreaterThan(0)
    })
  })

  describe('步骤实现', () => {
    it('视频分析应该返回正确的数据结构', async () => {
      const mockVideoFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const result = await orchestrator.analyzeVideo({ videoFile: mockVideoFile }, msg =>
        console.log(msg)
      )

      expect(result).toHaveProperty('metadata')
      expect(result).toHaveProperty('keyframes')
      expect(result).toHaveProperty('scenes')
      expect(result).toHaveProperty('transcript')
      expect(result).toHaveProperty('keywords')
      expect(result).toHaveProperty('contentType')
    })

    it('模板推荐应该选择合适的模板', async () => {
      const inputData = {
        contentType: 'tech',
        keywords: [{ text: '技术', weight: 1.0 }]
      }

      const result = await orchestrator.recommendTemplate(inputData, msg => console.log(msg))

      expect(result).toHaveProperty('selectedTemplate')
      expect(result.selectedTemplate).toHaveProperty('id')
    })

    it('素材匹配应该返回素材列表', async () => {
      const inputData = {
        keywords: [
          { text: '技术', weight: 1.0 },
          { text: 'AI', weight: 0.9 }
        ]
      }

      const result = await orchestrator.matchMaterials(inputData, msg => console.log(msg))

      expect(result).toHaveProperty('materials')
      expect(Array.isArray(result.materials)).toBe(true)
    })

    it('内容组合应该生成场景序列', async () => {
      const inputData = {
        transcript: '这是一个测试。这是第二句。',
        keywords: [{ text: '测试', weight: 1.0 }],
        selectedTemplate: { id: 'test-template' },
        materials: [],
        metadata: { duration: 10 }
      }

      const result = await orchestrator.composeContent(inputData, msg => console.log(msg))

      expect(result).toHaveProperty('scenes')
      expect(Array.isArray(result.scenes)).toBe(true)
      expect(result.scenes.length).toBeGreaterThan(0)
    })

    it('渲染应该生成最终结果', async () => {
      const mockVideoFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const inputData = {
        scenes: [{ id: 'scene-1', title: '测试', content: '内容' }],
        metadata: { duration: 10, width: 1920, height: 1080 },
        videoFile: mockVideoFile
      }

      const result = await orchestrator.renderFinal(inputData, msg => console.log(msg))

      expect(result).toHaveProperty('renderedScenes')
      expect(result).toHaveProperty('canExport')
      expect(result.canExport).toBe(true)
    })
  })
})
