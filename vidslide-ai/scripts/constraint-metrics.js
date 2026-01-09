/**
 * VidSlide AI 约束合规度量工具
 * 统计和分析约束合规情况
 */

const fs = require('fs')
const path = require('path')

class ConstraintMetrics {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..')
    this.metricsFile = path.join(this.projectRoot, '.constraint-metrics.json')
    this.metrics = this.loadMetrics()
  }

  /**
   * 加载历史度量数据
   */
  /**

   * loadMetrics 方法

   * VidSlide AI 功能实现

   */

  loadMetrics() {
    try {
      if (fs.existsSync(this.metricsFile)) {
        return JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'))
      }
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.warn('无法加载度量数据:', error.message)
    }
    return {
      startDate: new Date().toISOString(),
      totalChecks: 0,
      violations: [],
      warnings: [],
      complianceRate: 100,
      history: []
    }
  }

  /**
   * 保存度量数据
   */
  /**

   * saveMetrics 方法

   * VidSlide AI 功能实现

   */

  saveMetrics() {
    try {
      fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2))
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.error('无法保存度量数据:', error.message)
    }
  }

  /**
   * 记录检查结果
   */
  /**

   * recordCheckResult 方法

   * VidSlide AI 功能实现

   */

  recordCheckResult(violations = [], warnings = []) {
    const timestamp = new Date().toISOString()
    const checkResult = {
      timestamp,
      violationsCount: violations.length,
      warningsCount: warnings.length,
      compliance: violations.length === 0,
      details: {
        violations: violations.map(v => ({
          type: v.type,
          severity: v.severity,
          message: v.message
        })),
        warnings: warnings.map(w => ({
          type: w.type,
          message: w.message
        }))
      }
    }

    // 更新统计
    this.metrics.totalChecks++
    this.metrics.violations.push(...violations)
    this.metrics.warnings.push(...warnings)

    // 计算合规率
    const totalIssues = this.metrics.violations.length + this.metrics.warnings.length
    this.metrics.complianceRate =
      this.metrics.totalChecks > 0
        ? ((this.metrics.totalChecks - totalIssues / this.metrics.totalChecks) /
            this.metrics.totalChecks) *
          100
        : 100

    // 添加到历史记录
    this.metrics.history.push(checkResult)

    // 只保留最近50条记录
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (this.metrics.history.length > 50) {
      this.metrics.history = this.metrics.history.slice(-50)
    }

    this.saveMetrics()

    return checkResult
  }

  /**
   * 生成合规性报告
   */
  /**

   * generateReport 方法

   * VidSlide AI 功能实现

   */

  generateReport() {
    const report = {
      summary: this.getSummary(),
      trends: this.getTrends(),
      topIssues: this.getTopIssues(),
      recommendations: this.getRecommendations()
    }

    return report
  }

  /**
   * 获取汇总统计
   */
  /**

   * getSummary 方法

   * VidSlide AI 功能实现

   */

  getSummary() {
    const recentChecks = this.metrics.history.slice(-10) // 最近10次检查
    const recentViolations = recentChecks.reduce((sum, check) => sum + check.violationsCount, 0)
    const recentWarnings = recentChecks.reduce((sum, check) => sum + check.warningsCount, 0)

    return {
      totalChecks: this.metrics.totalChecks,
      totalViolations: this.metrics.violations.length,
      totalWarnings: this.metrics.warnings.length,
      complianceRate: Math.round(this.metrics.complianceRate),
      recentChecks: recentChecks.length,
      recentViolations,
      recentWarnings,
      averageViolationsPerCheck: (
        this.metrics.violations.length / Math.max(this.metrics.totalChecks, 1)
      ).toFixed(2)
    }
  }

  /**
   * 获取趋势分析
   */
  /**

   * getTrends 方法

   * VidSlide AI 功能实现

   */

  getTrends() {
    const history = this.metrics.history
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (history.length < 5) {
      return { message: '历史数据不足，无法分析趋势' }
    }

    const recent = history.slice(-5)
    const earlier = history.slice(-10, -5)

    const recentAvgViolations =
      recent.reduce((sum, check) => sum + check.violationsCount, 0) / recent.length
    const earlierAvgViolations =
      earlier.reduce((sum, check) => sum + check.violationsCount, 0) / earlier.length

    const trend = recentAvgViolations - earlierAvgViolations
    let trendDirection = 'stable'
    if (trend > 0.5) trendDirection = 'worsening'
    else if (trend < -0.5) trendDirection = 'improving'

    return {
      trendDirection,
      recentAvgViolations: recentAvgViolations.toFixed(2),
      earlierAvgViolations: earlierAvgViolations.toFixed(2),
      change: trend.toFixed(2)
    }
  }

  /**
   * 获取最常见问题
   */
  /**

   * getTopIssues 方法

   * VidSlide AI 功能实现

   */

  getTopIssues() {
    const issues = {}

    // 统计违反类型
    this.metrics.violations.forEach(violation => {
      issues[violation.type] = (issues[violation.type] || 0) + 1
    })

    // 统计警告类型
    this.metrics.warnings.forEach(warning => {
      issues[warning.type] = (issues[warning.type] || 0) + 1
    })

    // 排序并返回前5个
    return Object.entries(issues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))
  }

  /**
   * 获取改进建议
   */
  /**

   * getRecommendations 方法

   * VidSlide AI 功能实现

   */

  getRecommendations() {
    const recommendations = []
    const summary = this.getSummary()
    const trends = this.getTrends()
    const topIssues = this.getTopIssues()

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (summary.complianceRate < 80) {
      recommendations.push('合规率较低，建议加强约束执行')
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (trends.trendDirection === 'worsening') {
      recommendations.push('约束违反趋势上升，需要加强开发过程控制')
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (topIssues.length > 0) {
      const topIssue = topIssues[0]
      recommendations.push(`重点关注${topIssue.type}类型问题 (${topIssue.count}次)`)
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (summary.recentViolations > summary.recentWarnings) {
      recommendations.push('违反约束的问题较多，建议在开发前加强检查')
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (recommendations.length === 0) {
      recommendations.push('约束执行良好，继续保持')
    }

    return recommendations
  }

  /**
   * 打印报告
   */
  /**

   * printReport 方法

   * VidSlide AI 功能实现

   */

  printReport() {
    const report = this.generateReport()

    console.log('\n' + '='.repeat(60))
    console.log('📊 VidSlide AI 约束合规度量报告')
    console.log('='.repeat(60))

    console.log('\n📈 汇总统计:')
    console.log(`总检查次数: ${report.summary.totalChecks}`)
    console.log(`合规率: ${report.summary.complianceRate}%`)
    console.log(`总违反次数: ${report.summary.totalViolations}`)
    console.log(`总警告次数: ${report.summary.totalWarnings}`)
    console.log(`平均违反/检查: ${report.summary.averageViolationsPerCheck}`)

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (report.trends.message) {
      console.log(`\n📉 趋势分析: ${report.trends.message}`)
    } else {
      console.log(`\n📉 趋势分析: ${report.trends.trendDirection}`)
      console.log(`最近平均违反: ${report.trends.recentAvgViolations}`)
      console.log(`之前平均违反: ${report.trends.earlierAvgViolations}`)
      console.log(`变化: ${report.trends.change}`)
    }

    console.log('\n🎯 最常见问题:')
    report.topIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type}: ${issue.count}次`)
    })

    console.log('\n💡 改进建议:')
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`)
    })

    console.log('\n' + '='.repeat(60))
  }

  /**
   * 重置度量数据
   */
  /**

   * reset 方法

   * VidSlide AI 功能实现

   */

  reset() {
    this.metrics = {
      startDate: new Date().toISOString(),
      totalChecks: 0,
      violations: [],
      warnings: [],
      complianceRate: 100,
      history: []
    }
    this.saveMetrics()
    console.log('✅ 度量数据已重置')
  }
}

// CLI接口
/**

 * if 方法

 * VidSlide AI 功能实现

 */

if (require.main === module) {
  const metrics = new ConstraintMetrics()
  const command = process.argv[2]

  /**


   * switch 方法


   * VidSlide AI 功能实现


   */

  switch (command) {
  case 'report':
    metrics.printReport()
    break
  case 'reset':
    metrics.reset()
    break
  default:
    console.log('使用方法:')
    console.log('  node constraint-metrics.js report  # 显示报告')
    console.log('  node constraint-metrics.js reset   # 重置数据')
    break
  }
}

module.exports = ConstraintMetrics
