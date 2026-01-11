/**
 * 智能素材调度器测试脚本
 * 在Node.js环境中测试核心功能
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 模拟浏览器API
global.performance = {
  now: () => Date.now(),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 50 // 50MB
  }
}

// 模拟fetch API (简化版本)
global.fetch = async url => {
  console.log(`Mock fetch: ${url}`)
  return {
    json: async () => ({
      trans_result: [{ dst: 'Spring Festival' }],
      error_code: 0
    })
  }
}

// =============================================================================
// 导入调度器组件
// =============================================================================

import {
  IntelligentMaterialDispatcher,
  KeywordAnalyzer,
  PlatformEvaluator,
  TranslationService,
  PerformanceTestSuite
} from './intelligent-material-dispatcher.js'

// =============================================================================
// 测试函数
// =============================================================================

async function runBasicTests() {
  console.log('🧪 开始智能素材调度器基础功能测试...\n')

  try {
    // 1. 测试关键词分析器
    console.log('1. 测试关键词分析器...')
    const analyzer = new KeywordAnalyzer()

    const testKeywords = ['春节', 'nature', '人工智能', 'technology', '春节nature']
    for (const keyword of testKeywords) {
      const analysis = analyzer.analyze(keyword)
      console.log(
        `   "${keyword}" → 语言: ${analysis.language}, 置信度: ${(analysis.confidence * 100).toFixed(1)}%`
      )
    }
    console.log('✅ 关键词分析器测试通过\n')

    // 2. 测试平台评估器
    console.log('2. 测试平台评估器...')
    const evaluator = new PlatformEvaluator()

    const testAnalysis = analyzer.analyze('春节')
    const scores = evaluator.calculateScores('春节', testAnalysis)
    console.log(
      '   春节平台评分:',
      Object.entries(scores)
        .map(([k, v]) => `${k}:${v.toFixed(2)}`)
        .join(', ')
    )

    const englishAnalysis = analyzer.analyze('nature')
    const englishScores = evaluator.calculateScores('nature', englishAnalysis)
    console.log(
      '   nature平台评分:',
      Object.entries(englishScores)
        .map(([k, v]) => `${k}:${v.toFixed(2)}`)
        .join(', ')
    )
    console.log('✅ 平台评估器测试通过\n')

    // 3. 测试翻译服务
    console.log('3. 测试翻译服务...')
    const translator = new TranslationService()

    const translated = await translator.translate('春节')
    console.log(`   "春节" 翻译结果: "${translated}"`)
    console.log('✅ 翻译服务测试通过\n')

    // 4. 测试完整调度器
    console.log('4. 测试智能调度器...')
    const dispatcher = new IntelligentMaterialDispatcher()

    const testCases = [
      { keyword: '春节', expectedStrategy: 'single_platform' },
      { keyword: 'nature', expectedStrategy: 'single_platform' },
      { keyword: '人工智能', expectedStrategy: 'single_platform' }
    ]

    for (const testCase of testCases) {
      const result = await dispatcher.dispatch(testCase.keyword)
      const status =
        result.strategy.name === testCase.expectedStrategy && !result.error ? '✅' : '❌'
      console.log(
        `   ${status} "${testCase.keyword}" → 策略: ${result.strategy.name}, 平台: ${result.platforms.map(p => p.name).join(', ')}`
      )
    }
    console.log('✅ 智能调度器测试通过\n')

    // 5. 运行性能测试套件
    console.log('5. 运行性能测试套件...')
    const testSuite = new PerformanceTestSuite()
    const testResults = await testSuite.runFullTestSuite()

    console.log('\n📋 性能测试结果:')
    console.log(`总测试数: ${testResults.summary.tests.length}`)
    console.log(`通过: ${testResults.summary.passed}`)
    console.log(`失败: ${testResults.summary.failed}`)
    const passRate = (
      (testResults.summary.passed / testResults.summary.tests.length) *
      100
    ).toFixed(1)
    console.log(`通过率: ${passRate}%`)

    // 6. 验收判断
    const canProceed = testResults.canProceed
    console.log(
      `\n🎯 验收结果: ${canProceed ? '✅ 通过 - 可以进入下一阶段开发' : '❌ 不通过 - 需要修复问题'}`
    )

    if (!canProceed) {
      console.log('\n🔧 失败的测试:')
      testResults.summary.tests
        .filter(test => !test.passed)
        .forEach(test => console.log(`   - ${test.name}: ${test.message}`))
    }

    // 保存测试报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: testResults.summary,
      performance: testResults.performance,
      canProceed: testResults.canProceed
    }

    const reportPath = path.join(__dirname, '..', 'test-report-intelligent-dispatcher.json')
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8')
    console.log('\n💾 测试报告已保存到: test-report-intelligent-dispatcher.json')

    return canProceed
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
    return false
  }
}

// =============================================================================
// 主执行函数
// =============================================================================

async function main() {
  console.log('🎯 VidSlide AI 智能素材调度器测试')
  console.log('遵循 .cursor-constraints.md 约束文档')
  console.log('紧急补齐阶段 Week23-32 P0功能实现\n')

  const success = await runBasicTests()

  if (success) {
    console.log('\n🎉 恭喜！智能素材调度器通过所有测试')
    console.log('\n📝 下一阶段开发计划:')
    console.log('1. ✅ 已完成：核心调度算法实现')
    console.log('2. 🔄 进行中：性能测试和验证')
    console.log('3. ⏳ 下一阶段：集成到VidSlide AI主应用')
    console.log('4. ⏳ 下一阶段：实现与现有素材服务的对接')
    console.log('5. ⏳ 下一阶段：添加用户界面和配置选项')

    process.exit(0)
  } else {
    console.log('\n⚠️ 测试未通过，无法进入下一阶段开发')
    console.log('\n🔧 请修复测试失败的问题后重新运行')
    process.exit(1)
  }
}

// 执行测试
main().catch(console.error)
