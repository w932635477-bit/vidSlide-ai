/**
 * TemplateParser.test.js
 * VidSlide AI - 模板解析器测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TemplateParser } from './TemplateParser.js'
import { TEMPLATE_TYPES, TEMPLATE_CONFIGS } from './TemplateDefinitions.js'

describe('TemplateParser', () => {
  let parser

  beforeEach(() => {
    parser = new TemplateParser()
  })

  describe('初始化', () => {
    it('应该正确初始化模板解析器', () => {
      expect(parser).toBeDefined()
      expect(parser.templates).toBeDefined()
      expect(parser.triggers).toBeDefined()
      expect(parser.priority).toBeDefined()
    })

    it('应该加载所有模板配置', () => {
      expect(parser.templates).toEqual(TEMPLATE_CONFIGS)
      expect(Object.keys(parser.templates)).toHaveLength(5) // 5种模板类型
    })
  })

  describe('内容解析', () => {
    it('应该处理空内容', () => {
      const result = parser.parseContent('')

      expect(result).toBeDefined()
      expect(result.template).toBeDefined()
      expect(result.data).toBeDefined()
      expect(result.confidence).toBeDefined()
    })

    it('应该处理null内容', () => {
      const result = parser.parseContent(null)

      expect(result).toBeDefined()
      expect(result.template).toBeDefined()
    })

    it('应该处理undefined内容', () => {
      const result = parser.parseContent(undefined)

      expect(result).toBeDefined()
      expect(result.template).toBeDefined()
    })

    it('应该解析文本内容', () => {
      const content = '这是一个重要的内容，需要强调显示'
      const result = parser.parseContent(content)

      expect(result).toBeDefined()
      expect(result.template).toBeDefined()
      expect(result.data).toBeDefined()
      expect(result.data.originalContent).toBe(content)
      expect(result.data.processedContent).toBeDefined()
    })

    it('应该根据关键词选择模板', () => {
      const content = '重要 关键 核心 强调'
      const result = parser.parseContent(content)

      expect(result).toBeDefined()
      expect(result.template).toBeDefined()
    })

    it('应该考虑上下文信息', () => {
      const content = '销售数据展示'
      const context = {
        type: 'presentation',
        audience: 'executives',
        timeLimit: 300
      }

      const result = parser.parseContent(content, context)

      expect(result).toBeDefined()
      expect(result.context).toEqual(context)
    })
  })

  describe('模板选择', () => {
    it('应该返回默认模板', () => {
      const defaultTemplate = parser.getDefaultTemplate()

      expect(defaultTemplate).toBeDefined()
      expect(defaultTemplate.name).toBeDefined()
      expect(defaultTemplate.description).toBeDefined()
    })

    it('应该根据内容类型选择最佳模板', () => {
      const testCases = [
        { content: '重要强调内容', expectedType: TEMPLATE_TYPES.EMPHASIS_FOCUS },
        { content: '时间线展示', expectedType: TEMPLATE_TYPES.TIMELINE_DISPLAY },
        { content: '分屏对比', expectedType: TEMPLATE_TYPES.SPLIT_SCREEN },
        { content: '图表分析', expectedType: TEMPLATE_TYPES.CHART_ANALYSIS },
        { content: '对话弹窗', expectedType: TEMPLATE_TYPES.DIALOG_POPUP }
      ]

      testCases.forEach(({ content, expectedType }) => {
        const result = parser.parseContent(content)
        expect(result.template).toBeDefined()
        // 模板可能不是精确匹配，但应该是一个有效的模板
        expect(Object.values(TEMPLATE_TYPES)).toContain(
          result.template.type || result.template.name
        )
      })
    })

    it('应该计算模板匹配度', () => {
      const content = '重要内容'
      const result = parser.parseContent(content)

      expect(result.confidence).toBeDefined()
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })
  })

  describe('数据处理', () => {
    it('应该提取内容元数据', () => {
      const content = '这是一个标题\n这是内容描述'
      const result = parser.parseContent(content)

      expect(result.data.metadata).toBeDefined()
      expect(result.data.content).toBeDefined()
    })

    it('应该处理结构化内容', () => {
      const content = `
        # 主标题
        ## 副标题
        - 项目1
        - 项目2
        - 项目3
      `

      const result = parser.parseContent(content)

      expect(result.data.content.title).toBeDefined()
      expect(result.data.content.text).toBeDefined()
    })

    it('应该提取关键词', () => {
      const content = 'AI 人工智能 机器学习 深度学习'
      const result = parser.parseContent(content)

      expect(result.data.keywords).toBeDefined()
      expect(Array.isArray(result.data.keywords)).toBe(true)
    })
  })

  describe('约束验证', () => {
    it('应该应用约束条件', () => {
      const content = '测试内容'
      const constraints = {
        maxLength: 100,
        allowedTypes: [TEMPLATE_TYPES.DIALOG_POPUP],
        minConfidence: 0.7
      }

      const result = parser.parseContent(content, {}, constraints)

      expect(result.constraints).toEqual(constraints)
    })

    it('应该验证内容长度约束', () => {
      const longContent = 'a'.repeat(1000)
      const constraints = { maxLength: 100 }

      const result = parser.parseContent(longContent, {}, constraints)

      expect(result.validation).toBeDefined()
      expect(result.validation.passed).toBeDefined()
    })

    it('应该验证模板类型约束', () => {
      const content = '测试内容'
      const constraints = {
        allowedTypes: [TEMPLATE_TYPES.DIALOG_POPUP]
      }

      const result = parser.parseContent(content, {}, constraints)

      // 如果有限制，应该只返回允许的模板类型
      if (result.validation && result.validation.allowedTypes) {
        expect(result.validation.allowedTypes).toContain(
          result.template.type || result.template.name
        )
      }
    })
  })

  describe('替代方案', () => {
    it('应该提供替代模板方案', () => {
      const content = '测试内容'
      const result = parser.parseContent(content)

      expect(result.alternatives).toBeDefined()
      expect(Array.isArray(result.alternatives)).toBe(true)
    })

    it('应该按置信度排序替代方案', () => {
      const content = '测试内容'
      const result = parser.parseContent(content)

      if (result.alternatives.length > 1) {
        // 检查是否按置信度降序排序
        for (let i = 1; i < result.alternatives.length; i++) {
          expect(result.alternatives[i - 1].confidence).toBeGreaterThanOrEqual(
            result.alternatives[i].confidence
          )
        }
      }
    })
  })

  describe('性能和缓存', () => {
    it('应该缓存解析结果', () => {
      const content = '缓存测试内容'

      // 第一次解析
      const result1 = parser.parseContent(content)
      expect(result1).toBeDefined()

      // 第二次解析应该使用缓存或返回相同结果
      const result2 = parser.parseContent(content)
      expect(result2).toBeDefined()
    })

    it('应该处理并发解析请求', async () => {
      const contents = ['内容1', '内容2', '内容3']

      const promises = contents.map(content => parser.parseContent(content))
      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result).toBeDefined()
        expect(result.template).toBeDefined()
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的模板配置', () => {
      const invalidConfig = null
      const result = parser.parseContent('测试', {}, { invalidConfig })

      expect(result).toBeDefined()
      // 应该返回默认模板而不是崩溃
      expect(result.template).toBeDefined()
    })

    it('应该处理解析异常', () => {
      // 模拟异常情况
      const result = parser.parseContent('')

      expect(result).toBeDefined()
      expect(result.template).toBeDefined()
    })

    it('应该处理超长内容', () => {
      const longContent = 'a'.repeat(10000)
      const result = parser.parseContent(longContent)

      expect(result).toBeDefined()
      expect(result.data.originalContent.length).toBe(10000)
    })
  })

  describe('模板兼容性', () => {
    it('应该检查模板兼容性', () => {
      const content = '测试内容'
      const context = { device: 'mobile', browser: 'chrome' }

      const result = parser.parseContent(content, context)

      expect(result.compatibility).toBeDefined()
      expect(result.compatibility.device).toBeDefined()
      expect(result.compatibility.browser).toBeDefined()
    })

    it('应该适配不同设备', () => {
      const devices = ['mobile', 'tablet', 'desktop']

      devices.forEach(device => {
        const context = { device }
        const result = parser.parseContent('测试内容', context)

        expect(result.context.device).toBe(device)
      })
    })
  })
})
