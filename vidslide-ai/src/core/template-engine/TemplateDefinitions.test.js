/**
 * TemplateDefinitions.test.js
 * VidSlide AI - 模板定义测试
 */

import { describe, it, expect } from 'vitest'
import { TEMPLATE_TYPES, TEMPLATE_CONFIGS } from './TemplateDefinitions.js'

describe('TemplateDefinitions', () => {
  describe('TEMPLATE_TYPES', () => {
    it('应该定义所有模板类型', () => {
      expect(TEMPLATE_TYPES).toBeDefined()
      expect(TEMPLATE_TYPES.DIALOG_POPUP).toBe('dialog-popup')
      expect(TEMPLATE_TYPES.TIMELINE_DISPLAY).toBe('timeline-display')
      expect(TEMPLATE_TYPES.SPLIT_SCREEN).toBe('split-screen')
      expect(TEMPLATE_TYPES.CHART_ANALYSIS).toBe('chart-analysis')
      expect(TEMPLATE_TYPES.EMPHASIS_FOCUS).toBe('emphasis-focus')
    })

    it('应该包含5种核心模板类型', () => {
      const types = Object.values(TEMPLATE_TYPES)
      expect(types).toHaveLength(5)
      expect(types).toEqual(expect.arrayContaining([
        'dialog-popup',
        'timeline-display',
        'split-screen',
        'chart-analysis',
        'emphasis-focus'
      ]))
    })

    it('应该有唯一的模板类型值', () => {
      const values = Object.values(TEMPLATE_TYPES)
      const uniqueValues = [...new Set(values)]
      expect(values).toHaveLength(uniqueValues.length)
    })
  })

  describe('TEMPLATE_CONFIGS', () => {
    it('应该为每种模板类型提供配置', () => {
      const types = Object.values(TEMPLATE_TYPES)
      types.forEach(type => {
        expect(TEMPLATE_CONFIGS[type]).toBeDefined()
        expect(TEMPLATE_CONFIGS[type]).toHaveProperty('name')
        expect(TEMPLATE_CONFIGS[type]).toHaveProperty('description')
        expect(TEMPLATE_CONFIGS[type]).toHaveProperty('category')
        expect(TEMPLATE_CONFIGS[type]).toHaveProperty('trigger')
        expect(TEMPLATE_CONFIGS[type]).toHaveProperty('keywords')
        expect(TEMPLATE_CONFIGS[type]).toHaveProperty('visual')
      })
    })

    it('应该有正确的模板配置结构', () => {
      const types = Object.values(TEMPLATE_TYPES)

      types.forEach(type => {
        const config = TEMPLATE_CONFIGS[type]

        // 检查基本属性
        expect(typeof config.name).toBe('string')
        expect(typeof config.description).toBe('string')
        expect(typeof config.category).toBe('string')
        expect(typeof config.trigger).toBe('string')
        expect(Array.isArray(config.keywords)).toBe(true)

        // 检查视觉配置
        expect(config.visual).toBeDefined()
        expect(config.visual).toHaveProperty('position')
        expect(config.visual).toHaveProperty('size')
        expect(config.visual).toHaveProperty('shape')
        expect(config.visual).toHaveProperty('background')
        expect(config.visual).toHaveProperty('border')
        expect(config.visual).toHaveProperty('shadow')
        expect(config.visual).toHaveProperty('animation')
      })
    })

    it('应该包含关键词数组', () => {
      const types = Object.values(TEMPLATE_TYPES)

      types.forEach(type => {
        const config = TEMPLATE_CONFIGS[type]
        expect(Array.isArray(config.keywords)).toBe(true)
        expect(config.keywords.length).toBeGreaterThan(0)
        config.keywords.forEach(keyword => {
          expect(typeof keyword).toBe('string')
        })
      })
    })

    it('应该有合理的尺寸配置', () => {
      const types = Object.values(TEMPLATE_TYPES)

      types.forEach(type => {
        const config = TEMPLATE_CONFIGS[type]
        const size = config.visual.size

        expect(size).toHaveProperty('width')
        expect(size).toHaveProperty('height')
        expect(typeof size.width).toBe('number')
        expect(typeof size.height).toBe('number')
        expect(size.width).toBeGreaterThan(0)
        expect(size.height).toBeGreaterThan(0)
        expect(size.width).toBeLessThanOrEqual(1)
        expect(size.height).toBeLessThanOrEqual(1)
      })
    })

    it('应该包含动画配置', () => {
      const types = Object.values(TEMPLATE_TYPES)

      types.forEach(type => {
        const config = TEMPLATE_CONFIGS[type]
        const animation = config.visual.animation

        expect(animation).toHaveProperty('type')
        expect(animation).toHaveProperty('duration')
        expect(animation).toHaveProperty('easing')
        expect(typeof animation.duration).toBe('number')
        expect(animation.duration).toBeGreaterThan(0)
      })
    })

    it('应该有有效的触发器配置', () => {
      const types = Object.values(TEMPLATE_TYPES)

      types.forEach(type => {
        const config = TEMPLATE_CONFIGS[type]
        const trigger = config.trigger

        expect(['keyword-match', 'time-based', 'event-driven', 'manual']).toContain(trigger)
      })
    })

    it('应该有有效的类别配置', () => {
      const types = Object.values(TEMPLATE_TYPES)

      types.forEach(type => {
        const config = TEMPLATE_CONFIGS[type]
        const category = config.category

        expect([
          'content-emphasis',
          'timeline-presentation',
          'comparison-display',
          'data-visualization',
          'focus-highlight'
        ]).toContain(category)
      })
    })
  })

  describe('模板特定配置', () => {
    it('对话弹窗模板应该有正确的配置', () => {
      const config = TEMPLATE_CONFIGS[TEMPLATE_TYPES.DIALOG_POPUP]

      expect(config.name).toBe('对话弹窗')
      expect(config.category).toBe('content-emphasis')
      expect(config.trigger).toBe('keyword-match')
      expect(config.keywords).toContain('重要')
      expect(config.keywords).toContain('强调')

      expect(config.visual.position).toBe('bottom-right')
      expect(config.visual.shape).toBe('rounded-rectangle')
    })

    it('时间线展示模板应该有正确的配置', () => {
      const config = TEMPLATE_CONFIGS[TEMPLATE_TYPES.TIMELINE_DISPLAY]

      expect(config.name).toBe('时间线展示')
      expect(config.category).toBe('timeline-presentation')
      expect(config.trigger).toBe('time-based')

      expect(config.visual.position).toBe('bottom')
      expect(config.visual.shape).toBe('timeline-bar')
    })

    it('分屏对比模板应该有正确的配置', () => {
      const config = TEMPLATE_CONFIGS[TEMPLATE_TYPES.SPLIT_SCREEN]

      expect(config.name).toBe('分屏对比')
      expect(config.category).toBe('comparison-display')
      expect(config.trigger).toBe('manual')

      expect(config.visual.position).toBe('center')
      expect(config.visual.shape).toBe('split-layout')
    })

    it('图表分析模板应该有正确的配置', () => {
      const config = TEMPLATE_CONFIGS[TEMPLATE_TYPES.CHART_ANALYSIS]

      expect(config.name).toBe('图表分析')
      expect(config.category).toBe('data-visualization')
      expect(config.trigger).toBe('keyword-match')

      expect(config.visual.position).toBe('top-right')
      expect(config.visual.shape).toBe('chart-container')
    })

    it('重点强调模板应该有正确的配置', () => {
      const config = TEMPLATE_CONFIGS[TEMPLATE_TYPES.EMPHASIS_FOCUS]

      expect(config.name).toBe('重点强调')
      expect(config.category).toBe('focus-highlight')
      expect(config.trigger).toBe('keyword-match')

      expect(config.visual.position).toBe('center')
      expect(config.visual.shape).toBe('highlight-overlay')
    })
  })

  describe('配置完整性', () => {
    it('所有模板都应该有content配置', () => {
      const types = Object.values(TEMPLATE_TYPES)

      types.forEach(type => {
        const config = TEMPLATE_CONFIGS[type]
        expect(config).toHaveProperty('content')
        expect(config.content).toHaveProperty('layout')
        expect(config.content).toHaveProperty('typography')
        expect(config.content).toHaveProperty('spacing')
      })
    })

    it('所有模板都应该有interaction配置', () => {
      const types = Object.values(TEMPLATE_TYPES)

      types.forEach(type => {
        const config = TEMPLATE_CONFIGS[type]
        expect(config).toHaveProperty('interaction')
        expect(config.interaction).toHaveProperty('hover')
        expect(config.interaction).toHaveProperty('click')
        expect(config.interaction).toHaveProperty('duration')
      })
    })

    it('所有模板都应该有responsive配置', () => {
      const types = Object.values(TEMPLATE_TYPES)

      types.forEach(type => {
        const config = TEMPLATE_CONFIGS[type]
        expect(config).toHaveProperty('responsive')
        expect(config.responsive).toHaveProperty('mobile')
        expect(config.responsive).toHaveProperty('tablet')
        expect(config.responsive).toHaveProperty('desktop')
      })
    })
  })

  describe('配置验证', () => {
    it('应该验证位置的有效性', () => {
      const types = Object.values(TEMPLATE_TYPES)

      types.forEach(type => {
        const config = TEMPLATE_CONFIGS[type]
        const validPositions = [
          'top-left', 'top', 'top-right',
          'left', 'center', 'right',
          'bottom-left', 'bottom', 'bottom-right'
        ]

        expect(validPositions).toContain(config.visual.position)
      })
    })

    it('应该验证形状的有效性', () => {
      const types = Object.values(TEMPLATE_TYPES)

      types.forEach(type => {
        const config = TEMPLATE_CONFIGS[type]
        const validShapes = [
          'rounded-rectangle', 'circle', 'triangle',
          'timeline-bar', 'split-layout', 'chart-container',
          'highlight-overlay', 'speech-bubble', 'arrow-pointer'
        ]

        expect(validShapes).toContain(config.visual.shape)
      })
    })

    it('应该验证动画类型的有效性', () => {
      const types = Object.values(TEMPLATE_TYPES)

      types.forEach(type => {
        const config = TEMPLATE_CONFIGS[type]
        const validAnimations = [
          'fade-in', 'fade-in-scale', 'slide-in',
          'bounce-in', 'zoom-in', 'rotate-in',
          'timeline-progress', 'chart-animation'
        ]

        expect(validAnimations).toContain(config.visual.animation.type)
      })
    })
  })
})