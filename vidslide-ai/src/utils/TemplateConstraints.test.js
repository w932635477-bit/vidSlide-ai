/**
 * TemplateConstraints.test.js
 * 模板约束系统单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import TemplateConstraints from './TemplateConstraints.js'

describe('TemplateConstraints', () => {
  let constraints

  beforeEach(() => {
    constraints = new TemplateConstraints()
  })

  describe('初始化', () => {
    it('应该正确初始化约束系统', () => {
      expect(constraints.constraints).toBeInstanceOf(Map)
      expect(constraints.validators).toBeInstanceOf(Map)
      expect(constraints.initialized).toBe(false)
    })

    it('应该异步初始化约束', async () => {
      await constraints.initialize()

      expect(constraints.initialized).toBe(true)
      expect(constraints.constraints.has('global')).toBe(true)
      expect(constraints.constraints.has('fixed')).toBe(true)
    })
  })

  describe('修改验证', () => {
    beforeEach(async () => {
      await constraints.initialize()
    })

    it('应该拒绝固定层修改', () => {
      const result = constraints.validateModification('fixed', 'position', 'center')

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('不可修改')
    })

    it('应该允许调整层修改', () => {
      const result = constraints.validateModification('adjustable', 'content', 'new content')

      expect(result.valid).toBe(true)
    })

    it('应该验证尺寸范围', () => {
      const result = constraints.validateModification('fixed', 'size', 500)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('尺寸不能大于')
    })

    it('应该验证位置选项', () => {
      const result = constraints.validateModification('fixed', 'position', 'invalid')

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('位置必须是')
    })

    it('应该验证动画参数', () => {
      const result = constraints.validateModification('adjustable', 'animation', { duration: 5 })

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('动画时长必须在')
    })
  })

  describe('自动修复', () => {
    beforeEach(async () => {
      await constraints.initialize()
    })

    it('应该修复超出范围的尺寸', () => {
      const fixedValue = constraints.applyAutoFix(
        { type: 'fixed' },
        'size',
        1000 // 超出最大值
      )

      expect(fixedValue).toBe(400) // pip最大值
    })

    it('应该修复无效的位置', () => {
      const fixedValue = constraints.applyAutoFix(
        { type: 'fixed' },
        'position',
        'invalid-position'
      )

      expect(['top-left', 'top-right', 'bottom-left', 'bottom-right']).toContain(fixedValue)
    })
  })

  describe('约束摘要', () => {
    beforeEach(async () => {
      await constraints.initialize()
    })

    it('应该提供约束摘要', () => {
      const summary = constraints.getConstraintsSummary('adjustable')

      expect(summary).toHaveProperty('modifiable', true)
      expect(summary).toHaveProperty('removable', true)
      expect(summary).toHaveProperty('allowedProperties')
      expect(summary.allowedProperties).toContain('content')
    })

    it('应该识别约束类型', () => {
      const type = constraints.getRestrictionType({ allowed: ['option1', 'option2'] })
      expect(type).toBe('enum')

      const rangeType = constraints.getRestrictionType({ min: 0, max: 100 })
      expect(rangeType).toBe('range')

      const exactType = constraints.getRestrictionType({ exact: 'fixed' })
      expect(exactType).toBe('exact')
    })
  })

  describe('默认状态管理', () => {
    beforeEach(async () => {
      await constraints.initialize()
    })

    it('应该保存默认状态', () => {
      const defaultState = { layers: [] }
      constraints.saveDefaultState('test-template', defaultState)

      const restored = constraints.restoreToDefault('test-template')
      expect(restored).toEqual(defaultState)
    })

    it('应该撤销修改', () => {
      constraints.recordModification('test-template', { property: 'test', oldValue: 1, newValue: 2 })

      const undoResult = constraints.undoModification('test-template')
      expect(undoResult).toHaveProperty('property', 'test')
    })
  })

  describe('性能和健康检查', () => {
    it('应该提供健康状态', () => {
      const health = constraints.getHealthStatus()

      expect(health).toHaveProperty('initialized')
      expect(health).toHaveProperty('currentRenderer')
      expect(health).toHaveProperty('webglSupported')
    })
  })

  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      constraints.initialized = true
      constraints.constraints.set('test', {})
      constraints.validators.set('test', () => {})
      constraints.recovery.defaultStates.set('test', {})

      constraints.cleanup()

      expect(constraints.constraints.size).toBe(0)
      expect(constraints.validators.size).toBe(0)
      expect(constraints.recovery.defaultStates.size).toBe(0)
      expect(constraints.initialized).toBe(false)
    })
  })
})