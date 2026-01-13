/**
 * TemplateArchitecture.test.js
 * 模板架构系统单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import TemplateArchitecture from './TemplateArchitecture.js'

describe('TemplateArchitecture', () => {
  let architecture

  beforeEach(() => {
    architecture = new TemplateArchitecture()
  })

  describe('初始化', () => {
    it('应该正确初始化架构', () => {
      expect(architecture.templates).toBeInstanceOf(Map)
      expect(architecture.constraints).toBeInstanceOf(Map)
      expect(architecture.initialized).toBe(false)
    })

    it('应该异步初始化模板', async () => {
      await architecture.initialize()

      expect(architecture.initialized).toBe(true)
      expect(architecture.templates.size).toBeGreaterThan(0)
    })
  })

  describe('模板管理', () => {
    beforeEach(async () => {
      await architecture.initialize()
    })

    it('应该获取模板定义', () => {
      const template = architecture.getTemplate('picture-in-picture')
      expect(template).toBeDefined()
      expect(template.id).toBe('picture-in-picture')
      expect(template.layers).toBeDefined()
    })

    it('应该返回所有模板列表', () => {
      const templates = architecture.getAllTemplates()
      expect(templates).toBeInstanceOf(Array)
      expect(templates.length).toBeGreaterThan(0)
      expect(templates[0]).toHaveProperty('id')
      expect(templates[0]).toHaveProperty('name')
    })

    it('应该返回null当模板不存在时', () => {
      const template = architecture.getTemplate('non-existent')
      expect(template).toBeNull()
    })
  })

  describe('模板推荐', () => {
    beforeEach(async () => {
      await architecture.initialize()
    })

    it('应该基于内容分析推荐模板', () => {
      const contentAnalysis = {
        contentType: 'video',
        keywords: ['演讲', '演示'],
        textDensity: 0.3,
        dataMentions: 0.1
      }

      const recommendations = architecture.recommendTemplates(contentAnalysis)

      expect(recommendations).toBeInstanceOf(Array)
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations[0]).toHaveProperty('template')
      expect(recommendations[0]).toHaveProperty('score')
      expect(recommendations[0]).toHaveProperty('reason')
    })

    it('应该为视频内容推荐画中画模板', () => {
      const contentAnalysis = {
        contentType: 'video',
        keywords: [],
        hasVideo: true
      }

      const recommendations = architecture.recommendTemplates(contentAnalysis)

      const pipRecommendation = recommendations.find(r => r.template.id === 'picture-in-picture')
      expect(pipRecommendation).toBeDefined()
      expect(pipRecommendation.score).toBeGreaterThan(0)
    })

    it('应该为教育内容推荐教育模板', () => {
      const contentAnalysis = {
        contentType: 'educational',
        keywords: ['学习', '教学']
      }

      const recommendations = architecture.recommendTemplates(contentAnalysis)

      const educationalRec = recommendations.find(r => r.template.id === 'educational')
      expect(educationalRec).toBeDefined()
    })
  })

  describe('约束验证', () => {
    beforeEach(async () => {
      await architecture.initialize()
    })

    it('应该验证修改权限', () => {
      const result = architecture.validateModification('picture-in-picture', 'background-overlay', 'opacity', 0.5)

      // 固定层应该不允许修改
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('不可修改')
    })

    it('应该允许调整层修改', () => {
      const result = architecture.validateModification('picture-in-picture', 'user-overlay', 'content', 'new content')

      expect(result.valid).toBe(true)
    })

    it('应该验证尺寸约束', () => {
      const result = architecture.validateModification('picture-in-picture', 'pip-container', 'size', 600)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('尺寸不能大于')
    })

    it('应该验证位置约束', () => {
      const result = architecture.validateModification('picture-in-picture', 'pip-container', 'position', 'invalid-position')

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('位置必须是')
    })
  })

  describe('模板实例化', () => {
    beforeEach(async () => {
      await architecture.initialize()
    })

    it('应该创建模板实例', () => {
      const instance = architecture.createTemplateInstance('picture-in-picture')

      expect(instance).toHaveProperty('instanceId')
      expect(instance).toHaveProperty('createdAt')
      expect(instance.layers).toBeDefined()
      expect(instance.layers.fixed).toBeDefined()
      expect(instance.layers.dynamic).toBeDefined()
      expect(instance.layers.adjustable).toBeDefined()
    })

    it('应该应用自定义选项', () => {
      const customizations = {
        theme: { primaryColor: '#FF0000' },
        layers: {
          'user-overlay': { content: 'Custom content' }
        }
      }

      const instance = architecture.createTemplateInstance('picture-in-picture', customizations)

      expect(instance.theme.primaryColor).toBe('#FF0000')
    })

    it('应该拒绝无效的自定义选项', () => {
      const customizations = {
        layers: {
          'background-overlay': { opacity: 0.3 } // 固定层不允许修改
        }
      }

      const instance = architecture.createTemplateInstance('picture-in-picture', customizations)

      // 固定层的修改应该被拒绝
      expect(instance.layers.fixed[0].properties.opacity).not.toBe(0.3)
    })
  })

  describe('统计信息', () => {
    beforeEach(async () => {
      await architecture.initialize()
    })

    it('应该提供统计信息', () => {
      const stats = architecture.getStatistics()

      expect(stats).toHaveProperty('totalTemplates')
      expect(stats).toHaveProperty('templatesByCategory')
      expect(stats).toHaveProperty('layersByType')
      expect(stats.totalTemplates).toBeGreaterThan(0)
      expect(stats.layersByType.fixed).toBeGreaterThan(0)
      expect(stats.layersByType.dynamic).toBeGreaterThan(0)
      expect(stats.layersByType.adjustable).toBeGreaterThan(0)
    })
  })

  describe('错误处理', () => {
    it('应该在模板不存在时抛出错误', () => {
      expect(() => {
        architecture.createTemplateInstance('non-existent-template')
      }).toThrow('模板 non-existent-template 不存在')
    })
  })

  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      architecture.initialized = true
      architecture.templates.set('test', {})
      architecture.constraints.set('test', {})

      architecture.cleanup()

      expect(architecture.templates.size).toBe(0)
      expect(architecture.constraints.size).toBe(0)
      expect(architecture.initialized).toBe(false)
    })
  })
})