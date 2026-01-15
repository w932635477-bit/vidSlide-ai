/**
 * VidSlide AI UI测试跟踪器
 * 实时监控和记录用户测试过程中的问题
 */

const fs = require('fs');
const path = require('path');

class UITestTracker {
  constructor() {
    this.testSession = {
      id: `ui-test-${Date.now()}`,
      startTime: new Date().toISOString(),
      endTime: null,
      userAgent: 'Unknown',
      viewport: { width: 0, height: 0 },
      issues: [],
      userActions: [],
      performanceMetrics: {},
      errors: [],
      screenshots: []
    };

    this.currentStep = null;
    this.stepStartTime = null;
  }

  startTest() {
    console.log("🎯 UI测试跟踪器已启动");
    console.log("🔗 测试地址: http://localhost:8080/vidslide-ai/index.html");
    console.log("📋 测试步骤已准备就绪");
    console.log("💬 请描述您正在执行的操作，我会实时跟踪问题");
    console.log("=" .repeat(60));
  }

  logUserAction(action, details = {}) {
    const timestamp = new Date().toISOString();
    this.testSession.userActions.push({
      timestamp,
      action,
      details,
      step: this.currentStep
    });

    console.log(`📝 [${timestamp.slice(11, 19)}] 用户操作: ${action}`);
    if (details.description) {
      console.log(`   └─ ${details.description}`);
    }
  }

  startStep(stepName, description = '') {
    this.currentStep = stepName;
    this.stepStartTime = Date.now();

    console.log(`\n🚀 开始测试步骤: ${stepName}`);
    if (description) {
      console.log(`   └─ ${description}`);
    }

    this.logUserAction('step_start', { stepName, description });
  }

  endStep(result = 'completed', notes = '') {
    const duration = Date.now() - this.stepStartTime;

    console.log(`✅ 完成测试步骤: ${this.currentStep} (${duration}ms)`);
    if (notes) {
      console.log(`   └─ ${notes}`);
    }

    this.logUserAction('step_end', {
      stepName: this.currentStep,
      result,
      duration,
      notes
    });

    this.currentStep = null;
    this.stepStartTime = null;
  }

  reportIssue(severity, category, description, steps = '', expected = '', actual = '') {
    const timestamp = new Date().toISOString();
    const issue = {
      id: `issue-${Date.now()}`,
      timestamp,
      severity, // 'critical', 'major', 'minor', 'cosmetic'
      category, // 'ui', 'functionality', 'performance', 'compatibility', 'accessibility'
      description,
      steps,
      expected,
      actual,
      step: this.currentStep,
      userAgent: this.testSession.userAgent,
      viewport: this.testSession.viewport,
      status: 'open'
    };

    this.testSession.issues.push(issue);

    const severityEmoji = {
      critical: '🔴',
      major: '🟠',
      minor: '🟡',
      cosmetic: '🔵'
    };

    console.log(`\n${severityEmoji[severity]} 发现问题 [${severity.toUpperCase()}]`);
    console.log(`📂 分类: ${category}`);
    console.log(`📝 描述: ${description}`);
    if (steps) console.log(`🔍 复现步骤: ${steps}`);
    if (expected) console.log(`✅ 期望结果: ${expected}`);
    if (actual) console.log(`❌ 实际结果: ${actual}`);
    console.log(`🆔 问题ID: ${issue.id}`);

    this.logUserAction('issue_reported', { issueId: issue.id, severity, category });
  }

  reportError(error, context = '') {
    const timestamp = new Date().toISOString();
    const errorRecord = {
      timestamp,
      error: error.message || error,
      stack: error.stack,
      context,
      step: this.currentStep,
      userAgent: this.testSession.userAgent
    };

    this.testSession.errors.push(errorRecord);

    console.log(`\n💥 JavaScript错误:`);
    console.log(`   └─ ${error.message || error}`);
    if (context) console.log(`   └─ 上下文: ${context}`);
    console.log(`   └─ 步骤: ${this.currentStep || 'N/A'}`);

    this.logUserAction('error_occurred', { error: error.message, context });
  }

  recordPerformance(metric, value, context = '') {
    if (!this.testSession.performanceMetrics[metric]) {
      this.testSession.performanceMetrics[metric] = [];
    }

    this.testSession.performanceMetrics[metric].push({
      timestamp: new Date().toISOString(),
      value,
      context,
      step: this.currentStep
    });

    console.log(`📊 性能指标: ${metric} = ${value}${context ? ` (${context})` : ''}`);
  }

  setUserEnvironment(userAgent, viewport) {
    this.testSession.userAgent = userAgent;
    this.testSession.viewport = viewport;

    console.log(`🌐 用户环境:`);
    console.log(`   └─ User Agent: ${userAgent}`);
    console.log(`   └─ 视窗: ${viewport.width}×${viewport.height}`);
  }

  takeScreenshot(filename, description = '') {
    const screenshot = {
      filename,
      timestamp: new Date().toISOString(),
      description,
      step: this.currentStep
    };

    this.testSession.screenshots.push(screenshot);

    console.log(`📸 截图已记录: ${filename}`);
    if (description) console.log(`   └─ ${description}`);
  }

  endTest() {
    this.testSession.endTime = new Date().toISOString();

    // 生成测试报告
    this.generateReport();

    console.log("\n🎯 UI测试跟踪完成");
    console.log("=" .repeat(60));
    this.printSummary();
  }

  generateReport() {
    const reportPath = path.join(__dirname, `ui-test-report-${this.testSession.id}.json`);
    const report = {
      session: this.testSession,
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 测试报告已保存: ${reportPath}`);
  }

  generateSummary() {
    const issues = this.testSession.issues;
    const errors = this.testSession.errors;
    const actions = this.testSession.userActions;

    return {
      totalIssues: issues.length,
      issuesBySeverity: {
        critical: issues.filter(i => i.severity === 'critical').length,
        major: issues.filter(i => i.severity === 'major').length,
        minor: issues.filter(i => i.severity === 'minor').length,
        cosmetic: issues.filter(i => i.severity === 'cosmetic').length
      },
      issuesByCategory: this.groupBy(issues, 'category'),
      totalErrors: errors.length,
      totalActions: actions.length,
      sessionDuration: new Date(this.testSession.endTime) - new Date(this.testSession.startTime)
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const issues = this.testSession.issues;

    // 基于问题类型生成建议
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push("🔴 优先修复关键问题，这些问题会严重影响用户体验");
    }

    const uiIssues = issues.filter(i => i.category === 'ui');
    if (uiIssues.length > 0) {
      recommendations.push("🎨 优化UI设计，关注视觉一致性和用户交互体验");
    }

    const functionalityIssues = issues.filter(i => i.category === 'functionality');
    if (functionalityIssues.length > 0) {
      recommendations.push("⚙️ 完善功能实现，确保核心功能正常工作");
    }

    const performanceIssues = issues.filter(i => i.category === 'performance');
    if (performanceIssues.length > 0) {
      recommendations.push("⚡ 优化性能，减少加载时间和响应延迟");
    }

    return recommendations;
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  printSummary() {
    const summary = this.generateSummary();

    console.log("📊 测试总结报告");
    console.log("=".repeat(40));

    console.log(`⏱️  测试时长: ${Math.round(summary.sessionDuration / 1000)}秒`);
    console.log(`📝 用户操作: ${summary.totalActions}次`);
    console.log(`🐛 发现问题: ${summary.totalIssues}个`);
    console.log(`💥 JavaScript错误: ${summary.totalErrors}个`);

    if (summary.totalIssues > 0) {
      console.log(`\n🔍 问题分布:`);
      Object.entries(summary.issuesBySeverity).forEach(([severity, count]) => {
        if (count > 0) {
          const emoji = { critical: '🔴', major: '🟠', minor: '🟡', cosmetic: '🔵' }[severity];
          console.log(`   ${emoji} ${severity}: ${count}个`);
        }
      });

      console.log(`\n📂 问题分类:`);
      Object.entries(summary.issuesByCategory).forEach(([category, count]) => {
        console.log(`   • ${category}: ${count}个`);
      });
    }

    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      console.log(`\n💡 建议:`);
      recommendations.forEach(rec => console.log(`   • ${rec}`));
    }

    console.log("\n🎯 测试完成！");
  }

  // 便捷方法
  critical(category, description, details = {}) {
    this.reportIssue('critical', category, description,
      details.steps, details.expected, details.actual);
  }

  major(category, description, details = {}) {
    this.reportIssue('major', category, description,
      details.steps, details.expected, details.actual);
  }

  minor(category, description, details = {}) {
    this.reportIssue('minor', category, description,
      details.steps, details.expected, details.actual);
  }

  cosmetic(category, description, details = {}) {
    this.reportIssue('cosmetic', category, description,
      details.steps, details.expected, details.actual);
  }
}

// 创建全局测试跟踪器实例
const uiTestTracker = new UITestTracker();

// 如果在浏览器环境中，将其暴露到全局
if (typeof window !== 'undefined') {
  window.uiTestTracker = uiTestTracker;
}

// 如果直接运行此脚本，启动测试
if (require.main === module) {
  uiTestTracker.startTest();
}

module.exports = UITestTracker;