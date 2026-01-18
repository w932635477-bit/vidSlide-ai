/**
 * MaterialService 重构验证测试脚本
 * 测试所有模块的功能完整性
 */

import MaterialService from './MaterialService.js'

class MaterialServiceTester {
  constructor() {
    this.testResults = []
    this.passedTests = 0
    this.failedTests = 0
  }

  /**
   * 记录测试结果
   */
  recordTest(testName, passed, message = '') {
    this.testResults.push({
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    })

    if (passed) {
      this.passedTests++
      console.log(`✅ ${testName}: PASSED ${message ? `- ${message}` : ''}`)
    } else {
      this.failedTests++
      console.error(`❌ ${testName}: FAILED ${message ? `- ${message}` : ''}`)
    }
  }

  /**
   * 测试1: 服务初始化
   */
  async testInitialization() {
    console.log('\n=== 测试1: 服务初始化 ===')
    try {
      await MaterialService.initialize()
      this.recordTest('服务初始化', MaterialService.isInitialized, '所有子服务已初始化')
    } catch (error) {
      this.recordTest('服务初始化', false, error.message)
    }
  }

  /**
   * 测试2: 本地搜索功能
   */
  async testLocalSearch() {
    console.log('\n=== 测试2: 本地搜索功能 ===')
    try {
      const result = await MaterialService.searchLocalMaterials('科技', { limit: 5 })
      this.recordTest(
        '本地搜索',
        result && result.materials !== undefined,
        `返回 ${result.materials?.length || 0} 个素材`
      )
    } catch (error) {
      this.recordTest('本地搜索', false, error.message)
    }
  }

  /**
   * 测试3: 预置素材搜索
   */
  async testPresetSearch() {
    console.log('\n=== 测试3: 预置素材搜索 ===')
    try {
      const result = await MaterialService.localSearch.searchPresetMaterials('technology', {
        limit: 5
      })
      this.recordTest(
        '预置素材搜索',
        result && result.materials && result.materials.length > 0,
        `返回 ${result.materials?.length || 0} 个预置素材`
      )
    } catch (error) {
      this.recordTest('预置素材搜索', false, error.message)
    }
  }

  /**
   * 测试4: 外部搜索功能（模拟）
   */
  async testExternalSearch() {
    console.log('\n=== 测试4: 外部搜索功能 ===')
    try {
      // 测试调度器决策
      const decision = await MaterialService.externalSearch.getDispatchDecision('technology')
      this.recordTest(
        '智能调度器',
        decision && decision.platforms && decision.platforms.length > 0,
        `推荐平台: ${decision.platforms?.map(p => p.name).join(', ')}`
      )
    } catch (error) {
      this.recordTest('智能调度器', false, error.message)
    }
  }

  /**
   * 测试5: 缓存服务
   */
  async testCacheService() {
    console.log('\n=== 测试5: 缓存服务 ===')
    try {
      const stats = await MaterialService.cache.getStats()
      this.recordTest('缓存统计', stats !== null, `缓存命中: ${stats.cacheHits || 0}`)
    } catch (error) {
      this.recordTest('缓存统计', false, error.message)
    }
  }

  /**
   * 测试6: 质量评估
   */
  async testQualityEvaluator() {
    console.log('\n=== 测试6: 质量评估 ===')
    try {
      const mockResults = {
        materials: [
          { name: '科技背景', relevanceScore: 0.8 },
          { name: '技术设备', relevanceScore: 0.7 }
        ]
      }
      const evaluation = MaterialService.quality.evaluateSearchResults(mockResults, '科技', {})
      this.recordTest(
        '质量评估',
        evaluation && evaluation.shouldFetchExternal !== undefined,
        `评估结果: ${evaluation.reason}`
      )
    } catch (error) {
      this.recordTest('质量评估', false, error.message)
    }
  }

  /**
   * 测试7: 智能匹配（降级测试）
   */
  async testMatching() {
    console.log('\n=== 测试7: 智能匹配 ===')
    try {
      const mockMaterials = [
        { name: '科技背景', tags: ['technology', 'tech'] },
        { name: '商务场景', tags: ['business'] }
      ]
      const matched = MaterialService.matching.fallbackKeywordMatch('technology', mockMaterials)
      this.recordTest(
        '关键词匹配',
        matched && matched.length > 0,
        `匹配到 ${matched.length} 个素材`
      )
    } catch (error) {
      this.recordTest('关键词匹配', false, error.message)
    }
  }

  /**
   * 测试8: 精选素材服务
   */
  async testCuratedService() {
    console.log('\n=== 测试8: 精选素材服务 ===')
    try {
      const library = MaterialService.browseCuratedLibrary()
      this.recordTest('精选素材库', library && library.length > 0, `配方总数: ${library.length}`)

      const stats = MaterialService.getCuratedLibraryStats()
      this.recordTest(
        '配方库统计',
        stats && stats.totalRecipes !== undefined,
        `总配方: ${stats.totalRecipes}, 分类: ${stats.totalCategories}`
      )
    } catch (error) {
      this.recordTest('精选素材服务', false, error.message)
    }
  }

  /**
   * 测试9: 统计服务
   */
  async testStatsService() {
    console.log('\n=== 测试9: 统计服务 ===')
    try {
      const stats = MaterialService.getServiceStats()
      this.recordTest(
        '服务统计',
        stats && stats.overall !== undefined,
        `总搜索: ${stats.overall?.totalSearches || 0}`
      )

      const cacheStats = await MaterialService.getCacheStats()
      this.recordTest('缓存统计', cacheStats !== null, '缓存统计获取成功')
    } catch (error) {
      this.recordTest('统计服务', false, error.message)
    }
  }

  /**
   * 测试10: 完整搜索流程
   */
  async testFullSearchFlow() {
    console.log('\n=== 测试10: 完整搜索流程 ===')
    try {
      // 测试本地优先搜索
      const result1 = await MaterialService.searchMaterials('科技', { forceLocal: true, limit: 5 })
      this.recordTest(
        '本地优先搜索',
        result1 && result1.success,
        `来源: ${result1.source}, 素材数: ${result1.materials?.length || 0}`
      )

      // 测试外部优先搜索（可能降级到本地）
      const result2 = await MaterialService.searchMaterials('technology', { limit: 5 })
      this.recordTest(
        '外部优先搜索',
        result2 && result2.success,
        `来源: ${result2.source}, 素材数: ${result2.materials?.length || 0}`
      )
    } catch (error) {
      this.recordTest('完整搜索流程', false, error.message)
    }
  }

  /**
   * 测试11: 工具函数
   */
  async testUtilityFunctions() {
    console.log('\n=== 测试11: 工具函数 ===')
    try {
      // 测试中文检测
      const { isChineseQuery } = await import('./materialConverters.js')
      const isChinese1 = isChineseQuery('科技')
      const isChinese2 = isChineseQuery('technology')
      this.recordTest('中文检测', isChinese1 === true && isChinese2 === false, '中文检测正常')

      // 测试图片分类
      const { categorizeImage } = await import('./materialConverters.js')
      const category = categorizeImage({ title: 'technology background', description: '' })
      this.recordTest('图片分类', category === '科技', `分类结果: ${category}`)
    } catch (error) {
      this.recordTest('工具函数', false, error.message)
    }
  }

  /**
   * 测试12: API兼容性
   */
  async testAPICompatibility() {
    console.log('\n=== 测试12: API兼容性 ===')
    try {
      // 测试所有公共方法是否存在
      const methods = [
        'initialize',
        'searchMaterials',
        'searchLocalMaterials',
        'searchExternalMaterials',
        'smartMatchMaterials',
        'calculateLocalMatchRate',
        'recordMaterialUsage',
        'getPopularMaterials',
        'getRecentMaterials',
        'getPersonalizedRecommendations',
        'getUserInsights',
        'getServiceStats',
        'getCacheStats',
        'getCuratedMaterial',
        'getRecommendedCuratedMaterials',
        'browseCuratedLibrary',
        'searchCuratedRecipes',
        'getCuratedLibraryStats'
      ]

      const missingMethods = methods.filter(method => typeof MaterialService[method] !== 'function')

      this.recordTest(
        'API兼容性',
        missingMethods.length === 0,
        missingMethods.length > 0 ? `缺失方法: ${missingMethods.join(', ')}` : '所有API方法存在'
      )
    } catch (error) {
      this.recordTest('API兼容性', false, error.message)
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🧪 开始MaterialService重构验证测试...\n')
    console.log('='.repeat(60))

    const startTime = Date.now()

    await this.testInitialization()
    await this.testLocalSearch()
    await this.testPresetSearch()
    await this.testExternalSearch()
    await this.testCacheService()
    await this.testQualityEvaluator()
    await this.testMatching()
    await this.testCuratedService()
    await this.testStatsService()
    await this.testFullSearchFlow()
    await this.testUtilityFunctions()
    await this.testAPICompatibility()

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log('\n' + '='.repeat(60))
    console.log('\n📊 测试结果汇总:')
    console.log(`   总测试数: ${this.testResults.length}`)
    console.log(`   ✅ 通过: ${this.passedTests}`)
    console.log(`   ❌ 失败: ${this.failedTests}`)
    console.log(`   ⏱️  耗时: ${duration}秒`)
    console.log(`   📈 通过率: ${((this.passedTests / this.testResults.length) * 100).toFixed(1)}%`)

    if (this.failedTests === 0) {
      console.log('\n🎉 所有测试通过！重构成功！')
    } else {
      console.log('\n⚠️  部分测试失败，请检查失败的测试项')
    }

    return {
      total: this.testResults.length,
      passed: this.passedTests,
      failed: this.failedTests,
      duration,
      results: this.testResults
    }
  }

  /**
   * 导出测试报告
   */
  exportReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.passedTests,
        failed: this.failedTests,
        passRate: ((this.passedTests / this.testResults.length) * 100).toFixed(1) + '%'
      },
      tests: this.testResults
    }

    return JSON.stringify(report, null, 2)
  }
}

// 运行测试
async function runTests() {
  const tester = new MaterialServiceTester()
  const results = await tester.runAllTests()

  // 导出测试报告
  console.log('\n📄 测试报告:')
  console.log(tester.exportReport())

  return results
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('测试执行失败:', error)
    process.exit(1)
  })
}

export { MaterialServiceTester, runTests }
export default runTests
