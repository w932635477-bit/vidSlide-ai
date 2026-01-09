/**
 * PerformanceMonitor长期稳定性测试
 * VidSlide AI - 性能监控验证工具
 */

const { performance } = require('perf_hooks')

class PerformanceStabilityTester {
  constructor() {
    this.testDuration = 60 * 60 * 1000 // 1小时
    this.sampleInterval = 5000 // 5秒采样一次
    this.memoryThreshold = 50 * 1024 * 1024 // 50MB
    this.fpsThreshold = 50 // 50 FPS
    this.results = {
      startTime: null,
      endTime: null,
      memoryUsage: [],
      fpsHistory: [],
      renderTimeHistory: [],
      gcEvents: 0,
      alertsTriggered: 0,
      memoryLeaks: [],
      performanceDegradation: []
    }
  }

  /**
   * 开始长期稳定性测试
   */
  async startLongTermTest() {
    console.log('🚀 开始PerformanceMonitor长期稳定性测试...')
    console.log(`📊 测试时长: ${this.testDuration / 1000 / 60}分钟`)
    console.log(`⏱️ 采样间隔: ${this.sampleInterval / 1000}秒\n`)

    this.results.startTime = performance.now()

    // 模拟组件生命周期
    await this.simulateComponentLifecycle()

    // 分析结果
    this.analyzeResults()
  }

  /**
   * 模拟组件生命周期
   */
  async simulateComponentLifecycle() {
    const testStart = performance.now()
    const testEnd = testStart + this.testDuration

    console.log('🔄 开始模拟组件生命周期...')

    // 模拟组件挂载和卸载周期
    while (performance.now() < testEnd) {
      const cycleStart = performance.now()

      // 模拟组件挂载
      await this.simulateMount()

      // 运行一段时间
      await this.runMonitoringCycle(30 * 1000) // 30秒

      // 模拟组件卸载
      await this.simulateUnmount()

      // 采样系统性能
      await this.sampleSystemPerformance()

      // 检查内存泄漏
      await this.checkMemoryLeaks()

      // 检查性能退化
      await this.checkPerformanceDegradation()

      // 等待下一个周期
      const cycleDuration = performance.now() - cycleStart
      if (cycleDuration < 60000) { // 1分钟周期
        await this.delay(60000 - cycleDuration)
      }
    }
  }

  /**
   * 模拟组件挂载
   */
  async simulateMount() {
    // 模拟PerformanceMonitor组件初始化
    const initialMemory = process.memoryUsage().heapUsed
    this.results.memoryUsage.push({
      timestamp: performance.now(),
      type: 'mount',
      memory: initialMemory
    })
  }

  /**
   * 模拟组件卸载
   */
  async simulateUnmount() {
    // 模拟清理资源
    const cleanupMemory = process.memoryUsage().heapUsed
    this.results.memoryUsage.push({
      timestamp: performance.now(),
      type: 'unmount',
      memory: cleanupMemory
    })

    // 强制垃圾回收（在支持的环境中）
    if (global.gc) {
      global.gc()
      this.results.gcEvents++
    }
  }

  /**
   * 运行监控周期
   */
  async runMonitoringCycle(duration) {
    const startTime = performance.now()

    while (performance.now() - startTime < duration) {
      // 模拟FPS测量
      const fps = this.simulateFpsMeasurement()
      this.results.fpsHistory.push({
        timestamp: performance.now(),
        fps: fps
      })

      // 模拟渲染时间测量
      const renderTime = this.simulateRenderTime()
      this.results.renderTimeHistory.push({
        timestamp: performance.now(),
        renderTime: renderTime
      })

      await this.delay(this.sampleInterval)
    }
  }

  /**
   * 采样系统性能
   */
  async sampleSystemPerformance() {
    const memUsage = process.memoryUsage()

    this.results.memoryUsage.push({
      timestamp: performance.now(),
      type: 'sample',
      memory: memUsage.heapUsed,
      external: memUsage.external,
      rss: memUsage.rss
    })
  }

  /**
   * 检查内存泄漏
   */
  async checkMemoryLeaks() {
    const recentMemory = this.results.memoryUsage.slice(-10)
    const avgMemory = recentMemory.reduce((sum, m) => sum + m.memory, 0) / recentMemory.length

    // 检查内存持续增长
    const memoryTrend = this.calculateMemoryTrend(recentMemory)

    if (memoryTrend > 1024 * 1024) { // 1MB增长趋势
      this.results.memoryLeaks.push({
        timestamp: performance.now(),
        trend: memoryTrend,
        average: avgMemory
      })

      console.warn(`⚠️ 检测到内存泄漏趋势: ${Math.round(memoryTrend / 1024 / 1024)}MB`)
    }
  }

  /**
   * 检查性能退化
   */
  async checkPerformanceDegradation() {
    const recentFps = this.results.fpsHistory.slice(-20)
    const avgFps = recentFps.reduce((sum, f) => sum + f.fps, 0) / recentFps.length

    const recentRenderTime = this.results.renderTimeHistory.slice(-20)
    const avgRenderTime = recentRenderTime.reduce((sum, r) => sum + r.renderTime, 0) / recentRenderTime.length

    // 检查FPS持续下降
    const fpsTrend = this.calculateFpsTrend(recentFps)

    if (fpsTrend < -5) { // FPS下降5以上
      this.results.performanceDegradation.push({
        timestamp: performance.now(),
        type: 'fps-degradation',
        trend: fpsTrend,
        average: avgFps
      })

      console.warn(`⚠️ 检测到FPS性能退化: ${fpsTrend.toFixed(1)} FPS`)
    }

    // 检查渲染时间持续增加
    const renderTrend = this.calculateRenderTrend(recentRenderTime)

    if (renderTrend > 2) { // 渲染时间增加2ms以上
      this.results.performanceDegradation.push({
        timestamp: performance.now(),
        type: 'render-degradation',
        trend: renderTrend,
        average: avgRenderTime
      })

      console.warn(`⚠️ 检测到渲染性能退化: +${renderTrend.toFixed(1)}ms`)
    }
  }

  /**
   * 计算内存趋势
   */
  calculateMemoryTrend(memoryData) {
    if (memoryData.length < 2) return 0

    const first = memoryData[0].memory
    const last = memoryData[memoryData.length - 1].memory
    const timeDiff = memoryData[memoryData.length - 1].timestamp - memoryData[0].timestamp

    return (last - first) / (timeDiff / 1000) // 每秒内存变化
  }

  /**
   * 计算FPS趋势
   */
  calculateFpsTrend(fpsData) {
    if (fpsData.length < 2) return 0

    const first = fpsData[0].fps
    const last = fpsData[fpsData.length - 1].fps

    return last - first
  }

  /**
   * 计算渲染时间趋势
   */
  calculateRenderTrend(renderData) {
    if (renderData.length < 2) return 0

    const first = renderData[0].renderTime
    const last = renderData[renderData.length - 1].renderTime

    return last - first
  }

  /**
   * 模拟FPS测量
   */
  simulateFpsMeasurement() {
    // 模拟真实的FPS波动
    const baseFps = 60
    const variation = (Math.random() - 0.5) * 20 // ±10 FPS波动
    const degradation = (performance.now() / 1000 / 60) * 0.1 // 每分钟轻微退化

    return Math.max(10, Math.min(120, baseFps + variation - degradation))
  }

  /**
   * 模拟渲染时间测量
   */
  simulateRenderTime() {
    // 模拟渲染时间波动
    const baseTime = 8.33 // 60fps对应时间
    const variation = (Math.random() - 0.5) * 4 // ±2ms波动
    const degradation = (performance.now() / 1000 / 60) * 0.05 // 每分钟轻微退化

    return Math.max(1, baseTime + variation + degradation)
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 分析测试结果
   */
  analyzeResults() {
    console.log('\n📊 测试结果分析')
    console.log('='.repeat(50))

    this.results.endTime = performance.now()
    const totalDuration = (this.results.endTime - this.results.startTime) / 1000 / 60

    console.log(`⏱️ 总测试时长: ${totalDuration.toFixed(1)}分钟`)
    console.log(`🗑️ GC事件次数: ${this.results.gcEvents}`)
    console.log(`⚠️ 内存泄漏事件: ${this.results.memoryLeaks.length}`)
    console.log(`📉 性能退化事件: ${this.results.performanceDegradation.length}`)

    // 内存使用统计
    const memoryStats = this.calculateMemoryStats()
    console.log(`\n💾 内存使用统计:`)
    console.log(`  平均内存: ${(memoryStats.average / 1024 / 1024).toFixed(1)}MB`)
    console.log(`  峰值内存: ${(memoryStats.peak / 1024 / 1024).toFixed(1)}MB`)
    console.log(`  内存波动: ${(memoryStats.variance / 1024 / 1024).toFixed(1)}MB`)

    // FPS性能统计
    const fpsStats = this.calculateFpsStats()
    console.log(`\n🎮 FPS性能统计:`)
    console.log(`  平均FPS: ${fpsStats.average.toFixed(1)}`)
    console.log(`  最低FPS: ${fpsStats.min}`)
    console.log(`  FPS波动: ${fpsStats.variance.toFixed(1)}`)

    // 稳定性评估
    const stability = this.assessStability()
    console.log(`\n🎯 稳定性评估:`)
    console.log(`  内存稳定性: ${stability.memory}`)
    console.log(`  性能稳定性: ${stability.performance}`)
    console.log(`  整体稳定性: ${stability.overall}`)

    // 生成优化建议
    this.generateOptimizationSuggestions()
  }

  /**
   * 计算内存统计
   */
  calculateMemoryStats() {
    const memorySamples = this.results.memoryUsage.filter(m => m.type === 'sample')

    if (memorySamples.length === 0) return { average: 0, peak: 0, variance: 0 }

    const memories = memorySamples.map(m => m.memory)
    const average = memories.reduce((sum, m) => sum + m, 0) / memories.length
    const peak = Math.max(...memories)
    const variance = Math.sqrt(
      memories.reduce((sum, m) => sum + Math.pow(m - average, 2), 0) / memories.length
    )

    return { average, peak, variance }
  }

  /**
   * 计算FPS统计
   */
  calculateFpsStats() {
    if (this.results.fpsHistory.length === 0) return { average: 0, min: 0, variance: 0 }

    const fps = this.results.fpsHistory.map(f => f.fps)
    const average = fps.reduce((sum, f) => sum + f, 0) / fps.length
    const min = Math.min(...fps)
    const variance = Math.sqrt(
      fps.reduce((sum, f) => sum + Math.pow(f - average, 2), 0) / fps.length
    )

    return { average, min, variance }
  }

  /**
   * 评估稳定性
   */
  assessStability() {
    const memoryStats = this.calculateMemoryStats()
    const fpsStats = this.calculateFpsStats()

    // 内存稳定性评估
    const memoryStability = memoryStats.variance / memoryStats.average < 0.1 ? '良好' :
                           memoryStats.variance / memoryStats.average < 0.2 ? '一般' : '较差'

    // 性能稳定性评估
    const performanceStability = fpsStats.variance < 5 ? '良好' :
                                fpsStats.variance < 10 ? '一般' : '较差'

    // 整体稳定性评估
    const leakEvents = this.results.memoryLeaks.length
    const degradationEvents = this.results.performanceDegradation.length

    let overallStability = '良好'
    if (leakEvents > 5 || degradationEvents > 5) overallStability = '较差'
    else if (leakEvents > 2 || degradationEvents > 2) overallStability = '一般'

    return {
      memory: memoryStability,
      performance: performanceStability,
      overall: overallStability
    }
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestions() {
    console.log('\n💡 优化建议:')

    const stability = this.assessStability()

    if (stability.memory !== '良好') {
      console.log('  • 优化内存管理: 减少历史数据保留或实现更高效的清理策略')
    }

    if (stability.performance !== '良好') {
      console.log('  • 优化性能监控: 实现自适应采样频率，根据系统负载调整')
    }

    if (this.results.memoryLeaks.length > 0) {
      console.log('  • 修复内存泄漏: 检查事件监听器和DOM引用清理')
    }

    if (this.results.performanceDegradation.length > 0) {
      console.log('  • 防止性能退化: 实现监控数据轮换和垃圾回收优化')
    }

    console.log('  • 实现监控暂停: 在页面不可见时自动暂停监控以节省资源')
    console.log('  • 添加健康检查: 定期验证监控系统的运行状态')
  }
}

// 运行测试
if (require.main === module) {
  const tester = new PerformanceStabilityTester()

  // 处理中断信号
  process.on('SIGINT', () => {
    console.log('\n⏹️ 测试被中断，正在生成结果...')
    tester.analyzeResults()
    process.exit(0)
  })

  tester.startLongTermTest().catch(console.error)
}

module.exports = PerformanceStabilityTester