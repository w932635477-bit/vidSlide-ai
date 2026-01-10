/**
 * SafariCompatibility Validation - Safari兼容性验证工具
 * 验证Safari浏览器兼容性检测和降级方案的有效性
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

class SafariCompatibilityValidator {
  constructor() {
    this.results = {
      browserDetection: {},
      apiSupport: {},
      fallbackStrategies: {},
      performanceImpact: {},
      userExperience: {}
    }

    this.isInitialized = false
  }

  /**
   * 初始化验证器
   */
  async initialize() {
    if (this.isInitialized) return
    this.isInitialized = true
    console.log('SafariCompatibilityValidator initialized')
  }

  /**
   * 验证浏览器检测
   */
  validateBrowserDetection() {
    console.log('验证Safari浏览器检测...')

    try {
      // 模拟不同浏览器的userAgent
      const testCases = [
        {
          name: 'Safari 15',
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
          expected: { isSafari: true, version: 15 }
        },
        {
          name: 'Safari 14',
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
          expected: { isSafari: true, version: 14 }
        },
        {
          name: 'Chrome',
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
          expected: { isSafari: false, version: null }
        },
        {
          name: 'Firefox',
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
          expected: { isSafari: false, version: null }
        },
        {
          name: 'Edge',
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
          expected: { isSafari: false, version: null }
        }
      ]

      const results = []

      testCases.forEach(testCase => {
        // 创建临时的navigator对象进行测试
        const originalNavigator = navigator
        const mockNavigator = {
          userAgent: testCase.userAgent,
          vendor: testCase.userAgent.includes('Safari') ? 'Apple Computer, Inc.' : 'Google Inc.'
        }

        // 临时替换navigator
        Object.defineProperty(window, 'navigator', {
          value: mockNavigator,
          writable: true
        })

        // 重新创建检查器实例
        const { SafariCompatibilityChecker } = require('./src/utils/safariCompatibility.js')
        const checker = new SafariCompatibilityChecker()

        const detected = {
          isSafari: checker.isSafari,
          version: checker.safariVersion
        }

        const correct =
          detected.isSafari === testCase.expected.isSafari &&
          detected.version === testCase.expected.version

        results.push({
          testName: testCase.name,
          userAgent: testCase.userAgent.substring(0, 50) + '...',
          expected: testCase.expected,
          detected: detected,
          correct: correct
        })

        // 恢复原始navigator
        Object.defineProperty(window, 'navigator', {
          value: originalNavigator,
          writable: true
        })
      })

      const successCount = results.filter(r => r.correct).length
      const success = successCount === results.length

      this.results.browserDetection = {
        success: success,
        totalTests: results.length,
        successfulTests: successCount,
        detailedResults: results
      }

      console.log(
        `✅ 浏览器检测验证完成，准确率: ${((successCount / results.length) * 100).toFixed(1)}%`
      )
      return success
    } catch (error) {
      this.results.browserDetection = {
        success: false,
        error: error.message
      }

      console.error('❌ 浏览器检测验证失败:', error)
      return false
    }
  }

  /**
   * 验证API支持检测
   */
  async validateAPISupport() {
    console.log('验证API支持检测...')

    try {
      const { getSafariCompatibilityChecker } = await import('./src/utils/safariCompatibility.js')
      const checker = getSafariCompatibilityChecker()

      // 运行兼容性检查
      const results = await checker.runCompatibilityCheck()

      // 验证检测结果的合理性
      const validations = [
        {
          name: 'WebAssembly检测',
          check: () => {
            const wa = results.webassembly
            return (
              typeof wa.supported === 'boolean' &&
              (wa.supported ? wa.version !== undefined : wa.reason !== undefined)
            )
          }
        },
        {
          name: 'WebCodecs检测',
          check: () => {
            const wc = results.webcodecs
            return (
              typeof wc.supported === 'boolean' &&
              Array.isArray(wc.supportedFormats) &&
              typeof wc.videoEncoder === 'boolean'
            )
          }
        },
        {
          name: 'WebGL检测',
          check: () => {
            const wg = results.webgl
            return (
              typeof wg.supported === 'boolean' &&
              (wg.supported ? wg.renderer !== undefined : wg.reason !== undefined)
            )
          }
        },
        {
          name: 'MediaRecorder检测',
          check: () => {
            const mr = results.mediaRecorder
            return typeof mr.supported === 'boolean' && Array.isArray(mr.supportedFormats)
          }
        },
        {
          name: 'WebAudio检测',
          check: () => {
            const wa = results.webAudio
            return (
              typeof wa.supported === 'boolean' &&
              (wa.supported ? wa.sampleRate !== undefined : wa.reason !== undefined)
            )
          }
        }
      ]

      const validationResults = validations.map(validation => ({
        name: validation.name,
        valid: validation.check()
      }))

      const successCount = validationResults.filter(r => r.valid).length
      const success = successCount === validations.length

      this.results.apiSupport = {
        success: success,
        totalValidations: validations.length,
        successfulValidations: successCount,
        detailedResults: validationResults,
        compatibilityResults: results
      }

      console.log(
        `✅ API支持检测验证完成，通过率: ${((successCount / validations.length) * 100).toFixed(1)}%`
      )
      return success
    } catch (error) {
      this.results.apiSupport = {
        success: false,
        error: error.message
      }

      console.error('❌ API支持检测验证失败:', error)
      return false
    }
  }

  /**
   * 验证降级策略
   */
  validateFallbackStrategies() {
    console.log('验证降级策略...')

    try {
      const { getSafariFallbackStrategies } = require('./src/utils/safariCompatibility.js')
      const strategies = getSafariFallbackStrategies()

      // 验证策略结构的完整性
      const requiredStrategies = [
        'videoExport',
        'audioProcessing',
        'imageProcessing',
        'storage',
        'performance'
      ]
      const strategyValidations = requiredStrategies.map(strategyName => {
        const strategy = strategies[strategyName]
        return {
          name: strategyName,
          valid: strategy && typeof strategy.primary === 'string',
          strategy: strategy
        }
      })

      const successCount = strategyValidations.filter(r => r.valid).length
      const success = successCount === requiredStrategies.length

      this.results.fallbackStrategies = {
        success: success,
        totalStrategies: requiredStrategies.length,
        validStrategies: successCount,
        detailedResults: strategyValidations
      }

      console.log(`✅ 降级策略验证完成，有效策略: ${successCount}/${requiredStrategies.length}`)
      return success
    } catch (error) {
      this.results.fallbackStrategies = {
        success: false,
        error: error.message
      }

      console.error('❌ 降级策略验证失败:', error)
      return false
    }
  }

  /**
   * 验证性能影响
   */
  async validatePerformanceImpact() {
    console.log('验证性能影响...')

    try {
      const { checkSafariCompatibility } = await import('./src/utils/safariCompatibility.js')

      const startTime = performance.now()
      const _results = await checkSafariCompatibility()
      const endTime = performance.now()

      const detectionTime = endTime - startTime
      const acceptableTime = 2000 // 2秒内完成

      this.results.performanceImpact = {
        success: detectionTime < acceptableTime,
        detectionTime: detectionTime,
        acceptableTime: acceptableTime,
        timeDifference: detectionTime - acceptableTime
      }

      console.log(`✅ 性能影响验证完成，检测时间: ${detectionTime.toFixed(1)}ms`)
      return detectionTime < acceptableTime
    } catch (error) {
      this.results.performanceImpact = {
        success: false,
        error: error.message
      }

      console.error('❌ 性能影响验证失败:', error)
      return false
    }
  }

  /**
   * 验证用户体验
   */
  validateUserExperience() {
    console.log('验证用户体验...')

    try {
      const { getSafariCompatibilitySummary } = require('./src/utils/safariCompatibility.js')
      const summary = getSafariCompatibilitySummary()

      // 验证摘要结构的完整性
      const hasRequiredFields =
        summary &&
        typeof summary.overallScore === 'number' &&
        Array.isArray(summary.supportedFeatures) &&
        Array.isArray(summary.unsupportedFeatures) &&
        Array.isArray(summary.recommendations)

      // 验证建议的实用性
      const hasUsefulRecommendations =
        summary.recommendations &&
        summary.recommendations.length > 0 &&
        summary.recommendations.every(rec => typeof rec === 'string' && rec.length > 0)

      const success = hasRequiredFields && hasUsefulRecommendations

      this.results.userExperience = {
        success: success,
        hasRequiredFields: hasRequiredFields,
        hasUsefulRecommendations: hasUsefulRecommendations,
        summary: summary
      }

      console.log(
        `✅ 用户体验验证完成，摘要完整性: ${hasRequiredFields ? '✅' : '❌'}, 建议实用性: ${hasUsefulRecommendations ? '✅' : '❌'}`
      )
      return success
    } catch (error) {
      this.results.userExperience = {
        success: false,
        error: error.message
      }

      console.error('❌ 用户体验验证失败:', error)
      return false
    }
  }

  /**
   * 运行所有验证
   */
  async validateAll() {
    console.log('🚀 开始Safari兼容性功能全面验证')
    console.log('=====================================')

    await this.initialize()

    const validations = [
      { name: '浏览器检测', method: this.validateBrowserDetection.bind(this) },
      { name: 'API支持检测', method: this.validateAPISupport.bind(this) },
      { name: '降级策略', method: this.validateFallbackStrategies.bind(this) },
      { name: '性能影响', method: this.validatePerformanceImpact.bind(this) },
      { name: '用户体验', method: this.validateUserExperience.bind(this) }
    ]

    const results = []
    let overallScore = 0

    for (const validation of validations) {
      console.log(`\n📋 验证: ${validation.name}`)
      try {
        const success = await validation.method()
        results.push({ name: validation.name, success })
        overallScore += success ? 20 : 0
      } catch (error) {
        console.error(`${validation.name}验证出错:`, error)
        results.push({ name: validation.name, success: false, error: error.message })
      }
    }

    const summary = {
      overallScore: overallScore,
      results: results,
      recommendations: this.generateRecommendations(results),
      nextSteps: this.generateNextSteps(results)
    }

    console.log('\n=====================================')
    console.log(`🏆 验证完成 - 总体得分: ${overallScore}/100`)
    console.log('=====================================')

    return summary
  }

  /**
   * 生成实施建议
   */
  generateRecommendations(results) {
    const recommendations = []

    const failedValidations = results.filter(r => !r.success)

    if (failedValidations.some(r => r.name === '浏览器检测')) {
      recommendations.push('🔧 改进Safari版本检测算法，确保准确识别不同版本')
    }

    if (failedValidations.some(r => r.name === 'API支持检测')) {
      recommendations.push('🎯 完善API支持检测逻辑，考虑更多边界情况')
    }

    if (failedValidations.some(r => r.name === '降级策略')) {
      recommendations.push('📦 补充缺失的降级策略，确保所有功能都有备选方案')
    }

    if (failedValidations.some(r => r.name === '性能影响')) {
      recommendations.push('⚡ 优化兼容性检测性能，避免阻塞用户交互')
    }

    if (failedValidations.some(r => r.name === '用户体验')) {
      recommendations.push('🎨 改进用户反馈，提供更清晰的兼容性提示')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ 所有验证项目通过，可以开始功能实现')
    }

    return recommendations
  }

  /**
   * 生成后续步骤
   */
  generateNextSteps(results) {
    const nextSteps = []

    const allPassed = results.every(r => r.success)

    if (allPassed) {
      nextSteps.push('1. 开始实现Safari兼容性检测组件')
      nextSteps.push('2. 集成降级策略到核心功能')
      nextSteps.push('3. 添加Safari特定优化')
      nextSteps.push('4. 测试兼容性改进效果')
    } else {
      nextSteps.push('1. 分析失败的验证项目')
      nextSteps.push('2. 修复检测和策略逻辑')
      nextSteps.push('3. 重新运行验证测试')
      nextSteps.push('4. 完善兼容性解决方案')
    }

    nextSteps.push('5. 更新功能实现对比分析文档')
    nextSteps.push('6. 在缺失功能开发计划中标记完成')

    return nextSteps
  }

  /**
   * 获取验证摘要
   */
  getValidationSummary() {
    return {
      browserDetection: this.results.browserDetection,
      apiSupport: this.results.apiSupport,
      fallbackStrategies: this.results.fallbackStrategies,
      performanceImpact: this.results.performanceImpact,
      userExperience: this.results.userExperience
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    this.isInitialized = false
  }
}

// 全局验证器实例
let validatorInstance = null

/**
 * 获取Safari兼容性验证器
 */
export function getSafariCompatibilityValidator() {
  if (!validatorInstance) {
    validatorInstance = new SafariCompatibilityValidator()
  }
  return validatorInstance
}

/**
 * 运行Safari兼容性验证
 */
export async function validateSafariCompatibility() {
  const validator = getSafariCompatibilityValidator()
  return await validator.validateAll()
}

/**
 * 获取验证结果摘要
 */
export function getSafariCompatibilityValidationSummary() {
  const validator = getSafariCompatibilityValidator()
  return validator.getValidationSummary()
}

// 自动运行验证（如果在浏览器环境中）
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.validateSafariCompatibility = validateSafariCompatibility
  window.getSafariCompatibilityValidationSummary = getSafariCompatibilityValidationSummary
}
