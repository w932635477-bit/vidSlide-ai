/**
 * VidSlide AI 本地素材库性能测试
 * 测试搜索速度、内存使用、缓存效果等
 */

console.log('🎯 VidSlide AI 本地素材库性能测试')
console.log('='.repeat(50))

const testResults = {
  searchPerformance: [],
  memoryUsage: [],
  cacheEfficiency: [],
  initializationTime: 0
}

// 模拟浏览器环境
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {}
}

global.performance = {
  now: () => Date.now()
}

// Mock IndexedDB
global.indexedDB = {
  open: () => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      createObjectStore: () => ({
        createIndex: () => {},
        put: () => {},
        get: () => {},
        delete: () => {},
        clear: () => {},
        openCursor: () => ({
          onsuccess: null,
          onerror: null,
          result: null
        })
      }),
      transaction: () => ({
        objectStore: () => ({
          put: () => {},
          get: () => {},
          delete: () => {},
          clear: () => {},
          openCursor: () => ({
            onsuccess: null,
            onerror: null,
            result: null
          })
        })
      })
    }
  })
}

async function runPerformanceTests() {
  try {
    console.log('📦 正在导入本地素材库...')

    // 使用CommonJS导入
    const LocalMaterialLibrary = require('../src/services/LocalMaterialLibrary.js').default

    console.log('🚀 开始初始化测试...')
    const initStart = performance.now()

    await LocalMaterialLibrary.initialize()

    const initEnd = performance.now()
    testResults.initializationTime = initEnd - initStart

    console.log(`✅ 初始化完成: ${testResults.initializationTime.toFixed(2)}ms`)

    // 测试搜索性能
    await testSearchPerformance(LocalMaterialLibrary)

    // 测试内存使用
    await testMemoryUsage()

    // 测试缓存效率
    await testCacheEfficiency(LocalMaterialLibrary)

    // 输出结果
    printResults()
  } catch (error) {
    console.error('❌ 性能测试失败:', error)
  }
}

async function testSearchPerformance(library) {
  console.log('\n🔍 测试搜索性能...')

  const testQueries = [
    '图标',
    '图表',
    '教育',
    '科技',
    '商业',
    '背景',
    '装饰',
    '按钮',
    '数据',
    '增长'
  ]

  for (const query of testQueries) {
    const start = performance.now()

    const results = await library.searchMaterials(query, {
      limit: 20,
      context: { industry: '科技', scene: '演示' }
    })

    const end = performance.now()
    const duration = end - start

    testResults.searchPerformance.push({
      query,
      duration,
      resultCount: results.materials?.length || 0,
      fromCache: results.fromCache
    })

    console.log(
      `  "${query}" -> ${duration.toFixed(2)}ms (${results.materials?.length || 0}个结果)`
    )
  }
}

async function testMemoryUsage() {
  console.log('\n💾 测试内存使用...')

  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    testResults.memoryUsage.push({
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss
    })

    console.log(`  堆使用: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  堆总量: ${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  RSS: ${(usage.rss / 1024 / 1024).toFixed(2)} MB`)
  } else {
    console.log('  内存信息不可用 (浏览器环境)')
  }
}

async function testCacheEfficiency(library) {
  console.log('\n⚡ 测试缓存效率...')

  const testQuery = '科技图标'

  // 第一次搜索
  console.log('  第一次搜索...')
  const start1 = performance.now()
  const result1 = await library.searchMaterials(testQuery)
  const end1 = performance.now()

  // 第二次搜索 (应该来自缓存)
  console.log('  第二次搜索 (缓存)...')
  const start2 = performance.now()
  const result2 = await library.searchMaterials(testQuery)
  const end2 = performance.now()

  const cacheHit = result2.fromCache
  const speedup = (end1 - start1) / (end2 - start2)

  testResults.cacheEfficiency.push({
    query: testQuery,
    firstSearch: end1 - start1,
    secondSearch: end2 - start2,
    cacheHit,
    speedup
  })

  console.log(`  缓存命中: ${cacheHit}`)
  console.log(`  性能提升: ${speedup.toFixed(2)}x`)
}

function printResults() {
  console.log('\n📊 性能测试结果汇总')
  console.log('='.repeat(50))

  // 初始化性能
  console.log('🚀 初始化性能:')
  console.log(`  初始化时间: ${testResults.initializationTime.toFixed(2)}ms`)

  // 搜索性能
  console.log('\n🔍 搜索性能:')
  const avgSearchTime =
    testResults.searchPerformance.reduce((sum, test) => sum + test.duration, 0) /
    testResults.searchPerformance.length
  const maxSearchTime = Math.max(...testResults.searchPerformance.map(test => test.duration))
  const minSearchTime = Math.min(...testResults.searchPerformance.map(test => test.duration))

  console.log(`  平均搜索时间: ${avgSearchTime.toFixed(2)}ms`)
  console.log(`  最快搜索: ${minSearchTime.toFixed(2)}ms`)
  console.log(`  最慢搜索: ${maxSearchTime.toFixed(2)}ms`)

  // 缓存效率
  if (testResults.cacheEfficiency.length > 0) {
    console.log('\n⚡ 缓存效率:')
    const cacheTest = testResults.cacheEfficiency[0]
    console.log(`  缓存命中: ${cacheTest.cacheHit ? '✅' : '❌'}`)
    console.log(`  性能提升: ${cacheTest.speedup.toFixed(2)}x`)
  }

  // 内存使用
  if (testResults.memoryUsage.length > 0) {
    console.log('\n💾 内存使用:')
    const memory = testResults.memoryUsage[0]
    console.log(`  堆使用: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB`)
  }

  // 性能评估
  console.log('\n🎯 性能评估:')
  const score = calculatePerformanceScore()
  console.log(`  综合评分: ${score.toFixed(1)}/100`)

  if (score >= 90) {
    console.log('  评级: 🏆 优秀')
  } else if (score >= 80) {
    console.log('  评级: ✅ 良好')
  } else if (score >= 70) {
    console.log('  评级: ⚠️ 一般')
  } else {
    console.log('  评级: ❌ 需要优化')
  }
}

function calculatePerformanceScore() {
  let score = 100

  // 初始化时间评分 (目标: < 1000ms)
  if (testResults.initializationTime > 1000) {
    score -= Math.min(20, (testResults.initializationTime - 1000) / 50)
  }

  // 搜索时间评分 (目标: < 50ms)
  const avgSearchTime =
    testResults.searchPerformance.reduce((sum, test) => sum + test.duration, 0) /
    testResults.searchPerformance.length
  if (avgSearchTime > 50) {
    score -= Math.min(30, (avgSearchTime - 50) / 10)
  }

  // 缓存效率评分
  if (testResults.cacheEfficiency.length > 0) {
    const cacheTest = testResults.cacheEfficiency[0]
    if (!cacheTest.cacheHit) {
      score -= 20
    } else if (cacheTest.speedup < 2) {
      score -= 10
    }
  }

  return Math.max(0, score)
}

// 运行测试
runPerformanceTests().catch(console.error)
