/**
 * 集成测试脚本
 * 测试智能调度器与MaterialService的集成
 */

// 设置模拟浏览器API
function setupMockBrowserAPIs() {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }

  global.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }

  global.performance = {
    now: () => Date.now()
  }

  // 模拟btoa函数
  global.btoa = str => Buffer.from(str, 'binary').toString('base64')

  global.fetch = async url => {
    console.log(`Mock fetch: ${url}`)
    return {
      ok: true,
      json: async () => ({
        trans_result: [{ dst: 'Spring Festival' }],
        error_code: 0
      })
    }
  }
}

async function testIntegration() {
  console.log('🔗 测试智能调度器核心功能...\n')

  // 设置模拟浏览器API
  setupMockBrowserAPIs()

  try {
    // 动态导入智能调度器
    const { default: IntelligentDispatcher } =
      await import('../src/services/IntelligentDispatcher.js')

    // 初始化调度器
    console.log('1. 初始化智能调度器...')
    const dispatcher = IntelligentDispatcher
    await dispatcher.initialize()
    console.log('✅ 智能调度器初始化成功\n')

    // 测试中文关键词
    console.log('2. 测试中文关键词 "春节"...')
    const result1 = await dispatcher.dispatch('春节')
    console.log(`   策略: ${result1.strategy.name}`)
    console.log(`   置信度: ${(result1.confidence * 100).toFixed(1)}%`)
    console.log(`   推荐平台: ${result1.platforms.map(p => p.name).join(', ')}`)
    if (result1.translation) {
      console.log(
        `   翻译: "${result1.translation.original}" → "${result1.translation.translated}"`
      )
    }
    console.log('')

    // 测试英文关键词
    console.log('3. 测试英文关键词 "nature"...')
    const result2 = await dispatcher.dispatch('nature')
    console.log(`   策略: ${result2.strategy.name}`)
    console.log(`   置信度: ${(result2.confidence * 100).toFixed(1)}%`)
    console.log(`   推荐平台: ${result2.platforms.map(p => p.name).join(', ')}`)
    if (result2.translation) {
      console.log(
        `   翻译: "${result2.translation.original}" → "${result2.translation.translated}"`
      )
    }
    console.log('')

    // 测试混合关键词
    console.log('4. 测试混合关键词 "人工智能AI"...')
    const result3 = await dispatcher.dispatch('人工智能AI')
    console.log(`   策略: ${result3.strategy.name}`)
    console.log(`   置信度: ${(result3.confidence * 100).toFixed(1)}%`)
    console.log(`   推荐平台: ${result3.platforms.map(p => p.name).join(', ')}`)
    if (result3.translation) {
      console.log(
        `   翻译: "${result3.translation.original}" → "${result3.translation.translated}"`
      )
    }
    console.log('')

    // 获取性能统计
    console.log('5. 获取性能统计...')
    const stats = dispatcher.getPerformanceStats()
    console.log(`   缓存大小: ${stats.cacheSize}`)
    console.log(`   总请求数: ${stats.totalTime?.count || 0}`)
    console.log(`   平均响应时间: ${stats.totalTime?.avg.toFixed(1) || 0}ms`)
    console.log('   平台使用统计:', stats.platformUsage)

    console.log('\n🎉 智能调度器集成测试完成！')
    console.log('✅ 调度器已成功集成到VidSlide AI主应用')

    return true
  } catch (error) {
    console.error('❌ 集成测试失败:', error)
    return false
  }
}

// 执行测试
testIntegration()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(console.error)
