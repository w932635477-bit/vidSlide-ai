/**
 * VidSlide AI 性能测试套件
 * 测试所有核心功能的性能表现
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

// Node.js环境兼容性处理
if (typeof window === 'undefined') {
  // 模拟localStorage
  const localStorageMock = {
    data: {},
    setItem: function (key, value) {
      this.data[key] = value
    },
    getItem: function (key) {
      return this.data[key] || null
    },
    removeItem: function (key) {
      delete this.data[key]
    },
    clear: function () {
      this.data = {}
    },
    get length() {
      return Object.keys(this.data).length
    },
    key: function (index) {
      const keys = Object.keys(this.data)
      return keys[index] || null
    }
  }

  global.window = {
    location: { search: '' },
    localStorage: localStorageMock,
    document: {
      createElement: () => ({
        getContext: () => ({
          fillStyle: '',
          fillRect: () => {},
          fill: () => {},
          beginPath: () => {},
          arc: () => {}
        })
      })
    },
    performance: {
      now: () => Date.now(),
      memory: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 200 * 1024 * 1024
      }
    }
  }
  global.document = global.window.document
  global.performance = global.window.performance
  global.localStorage = global.window.localStorage
}

class PerformanceTestSuite {
  constructor() {
    this.results = {
      templateRendering: {},
      assetManagement: {},
      faceTracking: {},
      smartCropping: {},
      backgroundRemoval: {},
      videoExport: {},
      timelineSync: {},
      overall: {}
    }
    this.startTime = null
    this.endTime = null
  }

  /**
   * 运行完整的性能测试套件
   */
  async runFullSuite() {
    console.log('🚀 开始 VidSlide AI 性能测试套件...')
    this.startTime = performance.now()

    try {
      // 1. 模板渲染性能测试
      await this.testTemplateRendering()

      // 2. 素材管理性能测试
      await this.testAssetManagement()

      // 3. 人脸跟踪性能测试
      await this.testFaceTracking()

      // 4. 智能裁剪性能测试
      await this.testSmartCropping()

      // 5. 背景移除性能测试
      await this.testBackgroundRemoval()

      // 6. 视频导出性能测试
      await this.testVideoExport()

      // 7. 时序同步性能测试
      await this.testTimelineSync()

      // 8. 综合性能分析
      this.analyzeOverallPerformance()
    } catch (error) {
      console.error('❌ 性能测试失败:', error)
    }

    this.endTime = performance.now()
    const totalTime = this.endTime - this.startTime

    console.log(`✅ 性能测试套件完成，总耗时: ${totalTime.toFixed(2)}ms`)
    this.printResults()
  }

  /**
   * 测试模板渲染性能
   */
  async testTemplateRendering() {
    console.log('📊 测试模板渲染性能...')

    const results = this.results.templateRendering
    const startTime = performance.now()

    try {
      // 模拟模板渲染场景
      const canvas = document.createElement('canvas')
      canvas.width = 1920
      canvas.height = 1080
      const ctx = canvas.getContext('2d')

      // 测试不同复杂度的模板渲染
      const complexities = ['simple', 'medium', 'complex']

      for (const complexity of complexities) {
        const testStart = performance.now()

        // 模拟渲染操作
        await this.simulateTemplateRendering(ctx, canvas.width, canvas.height, complexity)

        const testTime = performance.now() - testStart
        results[`${complexity}Template`] = {
          time: testTime,
          fps: 1000 / testTime,
          memoryUsage: this.getMemoryUsage()
        }
      }

      results.totalTime = performance.now() - startTime
      results.status = 'success'
    } catch (error) {
      results.status = 'error'
      results.error = error.message
    }
  }

  /**
   * 测试素材管理性能
   */
  async testAssetManagement() {
    console.log('📊 测试素材管理性能...')

    const results = this.results.assetManagement
    const startTime = performance.now()

    try {
      // 模拟素材管理操作
      const testAssets = this.generateTestAssets(50)

      // 测试素材存储性能
      const storeStart = performance.now()
      for (const asset of testAssets) {
        await this.simulateAssetStorage(asset)
      }
      results.storeTime = performance.now() - storeStart

      // 测试素材检索性能
      const retrieveStart = performance.now()
      for (let i = 0; i < 100; i++) {
        const randomAsset = testAssets[Math.floor(Math.random() * testAssets.length)]
        await this.simulateAssetRetrieval(randomAsset.id)
      }
      results.retrieveTime = performance.now() - retrieveStart

      // 测试素材搜索性能
      const searchStart = performance.now()
      const searchTerms = ['nature', 'business', 'technology', 'portrait']
      for (const term of searchTerms) {
        await this.simulateAssetSearch(term)
      }
      results.searchTime = performance.now() - searchStart

      results.totalTime = performance.now() - startTime
      results.status = 'success'
    } catch (error) {
      results.status = 'error'
      results.error = error.message
    }
  }

  /**
   * 测试人脸跟踪性能
   */
  async testFaceTracking() {
    console.log('📊 测试人脸跟踪性能...')

    const results = this.results.faceTracking
    const startTime = performance.now()

    try {
      // 模拟人脸跟踪测试
      const testVideos = [
        { duration: 30, resolution: '720p' },
        { duration: 60, resolution: '1080p' },
        { duration: 30, resolution: '4K' }
      ]

      for (const video of testVideos) {
        const testStart = performance.now()

        const trackingResults = await this.simulateFaceTracking(video)

        const testTime = performance.now() - testStart
        results[`${video.resolution}_${video.duration}s`] = {
          time: testTime,
          fps: 30, // 假设30fps输入
          trackingAccuracy: trackingResults.accuracy,
          processingFPS: video.duration / (testTime / 1000),
          memoryUsage: this.getMemoryUsage()
        }
      }

      results.totalTime = performance.now() - startTime
      results.status = 'success'
    } catch (error) {
      results.status = 'error'
      results.error = error.message
    }
  }

  /**
   * 测试智能裁剪性能
   */
  async testSmartCropping() {
    console.log('📊 测试智能裁剪性能...')

    const results = this.results.smartCropping
    const startTime = performance.now()

    try {
      // 模拟智能裁剪测试
      const testImages = [
        { width: 1920, height: 1080, format: 'landscape' },
        { width: 1080, height: 1920, format: 'portrait' },
        { width: 4000, height: 3000, format: 'high-res' }
      ]

      for (const image of testImages) {
        const testStart = performance.now()

        const cropResult = await this.simulateSmartCropping(image)

        const testTime = performance.now() - testStart
        results[image.format] = {
          time: testTime,
          originalSize: `${image.width}x${image.height}`,
          croppedSize: cropResult.size,
          quality: cropResult.quality,
          memoryUsage: this.getMemoryUsage()
        }
      }

      results.totalTime = performance.now() - startTime
      results.status = 'success'
    } catch (error) {
      results.status = 'error'
      results.error = error.message
    }
  }

  /**
   * 测试背景移除性能
   */
  async testBackgroundRemoval() {
    console.log('📊 测试背景移除性能...')

    const results = this.results.backgroundRemoval
    const startTime = performance.now()

    try {
      // 模拟背景移除测试
      const testScenarios = ['person-centered', 'person-offset', 'complex-scene', 'small-person']

      for (const scenario of testScenarios) {
        const testStart = performance.now()

        const removalResult = await this.simulateBackgroundRemoval(scenario)

        const testTime = performance.now() - testStart
        results[scenario] = {
          time: testTime,
          accuracy: removalResult.accuracy,
          processingTime: testTime,
          memoryUsage: this.getMemoryUsage()
        }
      }

      results.totalTime = performance.now() - startTime
      results.status = 'success'
    } catch (error) {
      results.status = 'error'
      results.error = error.message
    }
  }

  /**
   * 测试视频导出性能
   */
  async testVideoExport() {
    console.log('📊 测试视频导出性能...')

    const results = this.results.videoExport
    const startTime = performance.now()

    try {
      // 模拟视频导出测试
      const exportConfigs = [
        { resolution: '720p', format: 'mp4', quality: 'medium' },
        { resolution: '1080p', format: 'mp4', quality: 'high' },
        { resolution: '4K', format: 'mp4', quality: 'ultra' }
      ]

      for (const config of exportConfigs) {
        const testStart = performance.now()

        const exportResult = await this.simulateVideoExport(config)

        const testTime = performance.now() - testStart
        results[`${config.resolution}_${config.quality}`] = {
          time: testTime,
          fileSize: exportResult.size,
          bitrate: exportResult.bitrate,
          encodingSpeed: exportResult.speed,
          memoryUsage: this.getMemoryUsage()
        }
      }

      results.totalTime = performance.now() - startTime
      results.status = 'success'
    } catch (error) {
      results.status = 'error'
      results.error = error.message
    }
  }

  /**
   * 测试时序同步性能
   */
  async testTimelineSync() {
    console.log('📊 测试时序同步性能...')

    const results = this.results.timelineSync
    const startTime = performance.now()

    try {
      // 模拟时序同步测试
      const syncScenarios = [
        { tracks: 5, duration: 60 },
        { tracks: 10, duration: 120 },
        { tracks: 20, duration: 300 }
      ]

      for (const scenario of syncScenarios) {
        const testStart = performance.now()

        const syncResult = await this.simulateTimelineSync(scenario)

        const testTime = performance.now() - testStart
        results[`${scenario.tracks}tracks_${scenario.duration}s`] = {
          time: testTime,
          syncAccuracy: syncResult.accuracy,
          memoryUsage: this.getMemoryUsage(),
          performanceScore: syncResult.score
        }
      }

      results.totalTime = performance.now() - startTime
      results.status = 'success'
    } catch (error) {
      results.status = 'error'
      results.error = error.message
    }
  }

  /**
   * 分析整体性能表现
   */
  analyzeOverallPerformance() {
    console.log('📊 分析整体性能表现...')

    const overall = this.results.overall

    // 计算各项性能指标
    const allResults = Object.values(this.results).filter(
      result => typeof result === 'object' && result.totalTime
    )

    overall.totalTestTime = this.endTime - this.startTime
    overall.averagePerformance =
      allResults.reduce((sum, result) => sum + result.totalTime, 0) / allResults.length
    overall.memoryPeak = Math.max(
      ...allResults.map(result => result.memoryUsage || 0).filter(Boolean)
    )
    overall.successRate =
      (allResults.filter(result => result.status === 'success').length / allResults.length) * 100

    // 性能评分 (0-100)
    const performanceScore = this.calculatePerformanceScore()
    overall.performanceScore = performanceScore

    // 性能分类
    if (performanceScore >= 90) {
      overall.rating = '优秀'
      overall.recommendations = ['性能表现优秀，继续保持']
    } else if (performanceScore >= 80) {
      overall.rating = '良好'
      overall.recommendations = ['性能表现良好，建议小幅优化']
    } else if (performanceScore >= 70) {
      overall.rating = '一般'
      overall.recommendations = ['性能表现一般，需要重点优化']
    } else {
      overall.rating = '需优化'
      overall.recommendations = ['性能表现不佳，需要全面优化']
    }
  }

  /**
   * 计算性能评分
   */
  calculatePerformanceScore() {
    const weights = {
      templateRendering: 0.15,
      assetManagement: 0.15,
      faceTracking: 0.2,
      smartCropping: 0.1,
      backgroundRemoval: 0.1,
      videoExport: 0.15,
      timelineSync: 0.15
    }

    let totalScore = 0
    let totalWeight = 0

    for (const [key, weight] of Object.entries(weights)) {
      const result = this.results[key]
      if (result && result.status === 'success') {
        // 根据执行时间和内存使用计算子项评分
        const timeScore = Math.max(0, 100 - result.totalTime / 100) // 假设100ms以内满分
        const memoryScore = result.memoryUsage ? Math.max(0, 100 - result.memoryUsage / 50) : 100
        const itemScore = (timeScore + memoryScore) / 2

        totalScore += itemScore * weight
        totalWeight += weight
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0
  }

  /**
   * 模拟模板渲染
   */
  async simulateTemplateRendering(ctx, width, height, complexity) {
    return new Promise(resolve => {
      setTimeout(
        () => {
          // 模拟不同复杂度的渲染操作
          switch (complexity) {
          case 'simple':
            ctx.fillStyle = '#4A90E2'
            ctx.fillRect(0, 0, width, height)
            break
          case 'medium':
            for (let i = 0; i < 10; i++) {
              ctx.fillStyle = `hsl(${i * 36}, 70%, 60%)`
              ctx.fillRect((i * width) / 10, 0, width / 10, height)
            }
            break
          case 'complex':
            for (let i = 0; i < 100; i++) {
              ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`
              ctx.fillRect(Math.random() * width, Math.random() * height, 50, 50)
            }
            break
          }
          resolve()
        },
        Math.random() * 50 + 10
      ) // 10-60ms随机延迟
    })
  }

  /**
   * 模拟素材存储
   */
  async simulateAssetStorage(asset) {
    return new Promise(resolve => {
      setTimeout(
        () => {
          // 模拟存储操作
          localStorage.setItem(`asset_${asset.id}`, JSON.stringify(asset))
          resolve()
        },
        Math.random() * 20 + 5
      ) // 5-25ms随机延迟
    })
  }

  /**
   * 模拟素材检索
   */
  async simulateAssetRetrieval(assetId) {
    return new Promise(resolve => {
      setTimeout(
        () => {
          const asset = localStorage.getItem(`asset_${assetId}`)
          resolve(asset ? JSON.parse(asset) : null)
        },
        Math.random() * 10 + 2
      ) // 2-12ms随机延迟
    })
  }

  /**
   * 模拟素材搜索
   */
  async simulateAssetSearch(term) {
    return new Promise(resolve => {
      setTimeout(
        () => {
          const results = []
          for (let i = 0; i < localStorage.length; i++) {
            const _key = localStorage.key(i)
            if (key && key.includes(term)) {
              const asset = localStorage.getItem(key)
              if (asset) results.push(JSON.parse(asset))
            }
          }
          resolve(results)
        },
        Math.random() * 30 + 10
      ) // 10-40ms随机延迟
    })
  }

  /**
   * 模拟人脸跟踪
   */
  async simulateFaceTracking(video) {
    return new Promise(resolve => {
      setTimeout(
        () => {
          resolve({
            accuracy: Math.random() * 0.3 + 0.7, // 70-100%准确率
            faces: Math.floor(Math.random() * 5) + 1,
            landmarks: 468,
            processingTime: Math.random() * 100 + 50
          })
        },
        Math.random() * 200 + 100
      ) // 100-300ms随机延迟
    })
  }

  /**
   * 模拟智能裁剪
   */
  async simulateSmartCropping(image) {
    return new Promise(resolve => {
      setTimeout(
        () => {
          resolve({
            size: `${Math.floor(image.width * 0.8)}x${Math.floor(image.height * 0.8)}`,
            quality: Math.random() * 0.2 + 0.8, // 80-100%质量
            confidence: Math.random() * 0.3 + 0.7
          })
        },
        Math.random() * 150 + 50
      ) // 50-200ms随机延迟
    })
  }

  /**
   * 模拟背景移除
   */
  async simulateBackgroundRemoval(scenario) {
    return new Promise(resolve => {
      setTimeout(
        () => {
          resolve({
            accuracy: Math.random() * 0.4 + 0.6, // 60-100%准确率
            processingTime: Math.random() * 500 + 200,
            maskQuality: Math.random() * 0.3 + 0.7
          })
        },
        Math.random() * 300 + 100
      ) // 100-400ms随机延迟
    })
  }

  /**
   * 模拟视频导出
   */
  async simulateVideoExport(config) {
    return new Promise(resolve => {
      setTimeout(
        () => {
          const sizeMultipliers = { '720p': 1, '1080p': 2.5, '4K': 8 }
          const qualityMultipliers = { medium: 1, high: 1.5, ultra: 2 }

          const baseSize = 50 * 1024 * 1024 // 50MB base
          const size =
            baseSize * sizeMultipliers[config.resolution] * qualityMultipliers[config.quality]

          resolve({
            size: size,
            bitrate: Math.floor(size / 60), // 60秒视频
            speed: Math.random() * 2 + 0.5 // 0.5-2.5x实时速度
          })
        },
        Math.random() * 1000 + 500
      ) // 500-1500ms随机延迟
    })
  }

  /**
   * 模拟时序同步
   */
  async simulateTimelineSync(scenario) {
    return new Promise(resolve => {
      setTimeout(
        () => {
          resolve({
            accuracy: Math.random() * 0.2 + 0.8, // 80-100%准确率
            syncDrift: Math.random() * 50, // 0-50ms漂移
            score: Math.random() * 20 + 80 // 80-100分
          })
        },
        Math.random() * 200 + 50
      ) // 50-250ms随机延迟
    })
  }

  /**
   * 生成测试素材数据
   */
  generateTestAssets(count) {
    const assets = []
    const categories = ['image', 'video', 'audio']
    const tags = ['nature', 'business', 'technology', 'portrait', 'landscape']

    for (let i = 0; i < count; i++) {
      assets.push({
        id: `asset_${i}`,
        name: `Test Asset ${i}`,
        type: categories[Math.floor(Math.random() * categories.length)],
        tags: tags.slice(0, Math.floor(Math.random() * tags.length) + 1),
        size: Math.floor(Math.random() * 10 * 1024 * 1024) + 1024 * 1024, // 1-11MB
        created: new Date().toISOString()
      })
    }

    return assets
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  /**
   * 打印测试结果
   */
  printResults() {
    console.log('\n📈 VidSlide AI 性能测试结果')
    console.log('='.repeat(50))

    Object.entries(this.results).forEach(([category, result]) => {
      if (category === 'overall') return

      console.log(`\n🔸 ${category.toUpperCase()}`)
      if (result.status === 'success') {
        console.log(`  ✅ 总耗时: ${result.totalTime.toFixed(2)}ms`)

        Object.entries(result).forEach(([key, value]) => {
          if (
            key !== 'status' &&
            key !== 'totalTime' &&
            key !== 'error' &&
            typeof value === 'object'
          ) {
            console.log(`    ${key}: ${JSON.stringify(value, null, 2).replace(/\n/g, '\n    ')}`)
          }
        })
      } else {
        console.log(`  ❌ 失败: ${result.error}`)
      }
    })

    // 打印整体评估
    const overall = this.results.overall
    console.log('\n🏆 整体性能评估')
    console.log(`  性能评分: ${overall.performanceScore.toFixed(1)}/100`)
    console.log(`  等级: ${overall.rating}`)
    console.log(`  成功率: ${overall.successRate.toFixed(1)}%`)
    console.log(`  内存峰值: ${overall.memoryPeak.toFixed(1)}MB`)
    console.log(`  总测试时间: ${overall.totalTestTime.toFixed(2)}ms`)

    console.log('\n💡 优化建议:')
    overall.recommendations.forEach(rec => console.log(`  • ${rec}`))
  }
}

// 导出性能测试套件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceTestSuite
}

// 如果在浏览器环境中运行，自动执行测试
if (typeof window !== 'undefined') {
  window.PerformanceTestSuite = PerformanceTestSuite

  // 如果URL包含性能测试参数，自动运行
  if (window.location.search.includes('performance-test')) {
    const suite = new PerformanceTestSuite()
    suite.runFullSuite()
  }
}

// 如果在Node.js环境中直接运行此文件，自动执行测试
if (
  typeof process !== 'undefined' &&
  process.argv &&
  process.argv[1] &&
  process.argv[1].endsWith('performance-test-suite.js')
) {
  const suite = new PerformanceTestSuite()
  suite
    .runFullSuite()
    .then(() => {
      console.log('\n✅ 性能测试完成')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n❌ 性能测试失败:', error)
      process.exit(1)
    })
}
