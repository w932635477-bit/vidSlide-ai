/**
 * VidSlide AI - 约束系统测试脚本
 * 验证重构后的约束系统功能完整性
 *
 * @description 测试所有验证器和约束系统核心功能
 */

import { ConstraintSystem } from './ConstraintSystem.js'
import { TEMPLATE_TYPES } from './TemplateDefinitions.js'

/**
 * 测试结果统计
 */
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
}

/**
 * 测试断言函数
 */
function assert(condition, testName) {
  testResults.total++
  if (condition) {
    testResults.passed++
    console.log(`✓ ${testName}`)
  } else {
    testResults.failed++
    console.error(`✗ ${testName}`)
  }
}

/**
 * 测试文字验证
 */
function testTextValidation() {
  console.log('\n=== 测试文字验证 ===')
  const system = new ConstraintSystem()

  // 测试1: 文字长度过长
  const result1 = system.validateAdjustments(
    { text: 'a'.repeat(300) },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    result1.violations.some(v => v.type === 'TEXT_LENGTH'),
    '文字长度过长应产生违规'
  )

  // 测试2: 文字长度正常
  const result2 = system.validateAdjustments(
    { text: '这是一段正常的文字内容' },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    !result2.violations.some(v => v.type === 'TEXT_LENGTH'),
    '正常文字长度不应产生违规'
  )

  // 测试3: 字体大小验证
  const result3 = system.validateAdjustments(
    { fontSize: 8 },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    result3.violations.some(v => v.type === 'FONT_SIZE_OUT_OF_RANGE'),
    '字体过小应产生违规'
  )

  // 测试4: 字体大小正常
  const result4 = system.validateAdjustments(
    { fontSize: 16 },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    !result4.violations.some(v => v.type === 'FONT_SIZE_OUT_OF_RANGE'),
    '正常字体大小不应产生违规'
  )
}

/**
 * 测试颜色验证
 */
function testColorValidation() {
  console.log('\n=== 测试颜色验证 ===')
  const system = new ConstraintSystem()

  // 测试1: 对比度不足
  const result1 = system.validateAdjustments(
    {
      colors: {
        background: '#ffffff',
        text: '#f0f0f0'
      }
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    result1.violations.some(v => v.type === 'CONTRAST_RATIO'),
    '对比度不足应产生违规'
  )

  // 测试2: 对比度正常
  const result2 = system.validateAdjustments(
    {
      colors: {
        background: '#ffffff',
        text: '#000000'
      }
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    !result2.violations.some(v => v.type === 'CONTRAST_RATIO'),
    '正常对比度不应产生违规'
  )

  // 测试3: 避免的颜色组合
  const result3 = system.validateAdjustments(
    {
      colors: {
        background: '#ff0000',
        text: '#00ff00'
      }
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    result3.warnings.some(w => w.type === 'COLOR_COMBINATION'),
    '不推荐的颜色组合应产生警告'
  )
}

/**
 * 测试尺寸验证
 */
function testSizeValidation() {
  console.log('\n=== 测试尺寸验证 ===')
  const system = new ConstraintSystem()

  // 测试1: 尺寸过小
  const result1 = system.validateAdjustments(
    {
      size: {
        width: 0.05,
        height: 0.05
      }
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    result1.violations.some(v => v.type === 'SIZE_TOO_SMALL'),
    '尺寸过小应产生违规'
  )

  // 测试2: 尺寸正常
  const result2 = system.validateAdjustments(
    {
      size: {
        width: 0.5,
        height: 0.3
      }
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    !result2.violations.some(v => v.type === 'SIZE_TOO_SMALL'),
    '正常尺寸不应产生违规'
  )

  // 测试3: 位置无效
  const result3 = system.validateAdjustments(
    {
      position: 'invalid-position'
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    result3.violations.some(v => v.type === 'POSITION_INVALID'),
    '无效位置应产生违规'
  )

  // 测试4: 位置有效
  const result4 = system.validateAdjustments(
    {
      position: 'bottom-right'
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    !result4.violations.some(v => v.type === 'POSITION_INVALID'),
    '有效位置不应产生违规'
  )
}

/**
 * 测试用户体验验证
 */
function testUXValidation() {
  console.log('\n=== 测试用户体验验证 ===')
  const system = new ConstraintSystem()

  // 测试1: 触摸目标过小
  const result1 = system.validateAdjustments(
    {
      touchTargetSize: 30
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    result1.violations.some(v => v.type === 'TOUCH_TARGET_TOO_SMALL'),
    '触摸目标过小应产生违规'
  )

  // 测试2: 触摸目标正常
  const result2 = system.validateAdjustments(
    {
      touchTargetSize: 48
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    !result2.violations.some(v => v.type === 'TOUCH_TARGET_TOO_SMALL'),
    '正常触摸目标不应产生违规'
  )

  // 测试3: 缺少替代文本
  const result3 = system.validateAdjustments(
    {
      accessibility: {
        altText: false,
        focusIndicator: true
      }
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    result3.violations.some(v => v.type === 'MISSING_ALT_TEXT'),
    '缺少替代文本应产生违规'
  )

  // 测试4: 布局对齐无效
  const result4 = system.validateAdjustments(
    {
      layout: {
        textAlign: 'invalid-align'
      }
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(
    result4.violations.some(v => v.type === 'ALIGNMENT_INVALID'),
    '无效对齐方式应产生违规'
  )
}

/**
 * 测试合规分数计算
 */
function testComplianceScore() {
  console.log('\n=== 测试合规分数计算 ===')
  const system = new ConstraintSystem()

  // 测试1: 完美合规
  const result1 = system.validateAdjustments(
    {
      text: '正常文字',
      colors: {
        background: '#ffffff',
        text: '#000000'
      },
      size: {
        width: 0.5,
        height: 0.3
      }
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(result1.score === 100, '完美合规应得100分')
  assert(result1.isValid === true, '完美合规应标记为有效')

  // 测试2: 有违规
  const result2 = system.validateAdjustments(
    {
      text: 'a'.repeat(300),
      fontSize: 8
    },
    TEMPLATE_TYPES.DIALOG_POPUP
  )
  assert(result2.score < 100, '有违规应扣分')
  assert(result2.isValid === false, '有违规应标记为无效')
}

/**
 * 测试合规性报告生成
 */
function testComplianceReport() {
  console.log('\n=== 测试合规性报告生成 ===')
  const system = new ConstraintSystem()

  const adjustments = {
    text: 'a'.repeat(300),
    fontSize: 8
  }
  const validationResult = system.validateAdjustments(adjustments, TEMPLATE_TYPES.DIALOG_POPUP)
  const report = system.generateComplianceReport(adjustments, TEMPLATE_TYPES.DIALOG_POPUP, validationResult)

  assert(report.timestamp !== undefined, '报告应包含时间戳')
  assert(report.templateType === TEMPLATE_TYPES.DIALOG_POPUP, '报告应包含模板类型')
  assert(report.overallScore === validationResult.score, '报告应包含总分')
  assert(report.status === 'non-compliant', '报告应标记为不合规')
  assert(report.summary !== undefined, '报告应包含摘要')
  assert(report.details !== undefined, '报告应包含详情')
  assert(report.recommendations !== undefined, '报告应包含建议')
  assert(report.metadata !== undefined, '报告应包含元数据')
}

/**
 * 测试约束配置管理
 */
function testConstraintManagement() {
  console.log('\n=== 测试约束配置管理 ===')
  const system = new ConstraintSystem()

  // 测试1: 获取约束
  const textConstraints = system.getConstraints('text')
  assert(textConstraints !== undefined, '应能获取文字约束')
  assert(textConstraints.minLength !== undefined, '文字约束应包含最小长度')

  // 测试2: 更新约束
  system.updateConstraints('text', { minLength: 5 })
  const updatedConstraints = system.getConstraints('text')
  assert(updatedConstraints.minLength === 5, '应能更新约束配置')

  // 测试3: 重置约束
  system.resetToDefaults()
  const resetConstraints = system.getConstraints('text')
  assert(resetConstraints.minLength === 1, '应能重置为默认约束')
}

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('开始运行约束系统测试...\n')

  try {
    testTextValidation()
    testColorValidation()
    testSizeValidation()
    testUXValidation()
    testComplianceScore()
    testComplianceReport()
    testConstraintManagement()

    console.log('\n=== 测试结果统计 ===')
    console.log(`总测试数: ${testResults.total}`)
    console.log(`通过: ${testResults.passed}`)
    console.log(`失败: ${testResults.failed}`)
    console.log(`通过率: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`)

    if (testResults.failed === 0) {
      console.log('\n✓ 所有测试通过！约束系统重构成功！')
      return true
    } else {
      console.log('\n✗ 部分测试失败，请检查问题')
      return false
    }
  } catch (error) {
    console.error('\n测试执行出错:', error)
    return false
  }
}

// 导出测试函数
export { runAllTests, testTextValidation, testColorValidation, testSizeValidation, testUXValidation }

// 如果直接运行此文件，执行所有测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
}
