#!/usr/bin/env node

/**
 * VidSlide AI - UI对接状态监控脚本
 * 监控工作页面UI组件的集成状态和功能对接情况
 */

const fs = require('fs');
const path = require('path');

class UIIntegrationMonitor {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.workspaceViewPath = path.join(this.projectRoot, 'vidslide-ai/src/views/WorkspaceView.vue');
  }

  // 检查工作页面模板结构
  checkWorkspaceTemplate() {
    if (!fs.existsSync(this.workspaceViewPath)) {
      return {
        status: 'error',
        message: 'WorkspaceView.vue文件不存在',
        template: null
      };
    }

    const content = fs.readFileSync(this.workspaceViewPath, 'utf8');
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);

    if (!templateMatch) {
      return {
        status: 'error',
        message: 'WorkspaceView.vue缺少template部分',
        template: null
      };
    }

    const template = templateMatch[1];

    // 检查关键UI结构
    const checks = {
      // 布局结构
      hasWorkspaceClass: template.includes('class="workspace"'),
      hasHeader: template.includes('<header'),
      hasMain: template.includes('<main'),
      hasAside: template.includes('<aside'),

      // 功能区域
      hasUploadArea: template.includes('upload-area'),
      hasEditorArea: template.includes('editor-area'),
      hasTemplateList: template.includes('template-list'),
      hasTimeline: template.includes('timeline'),

      // 控制面板
      hasPipControls: template.includes('pip-controls') || template.includes('pip-settings'),
      hasAdjustmentPanel: template.includes('adjustment-panel'),

      // 交互元素
      hasVideoElement: template.includes('<video'),
      hasButtons: (template.match(/<button/g) || []).length > 0,
      hasInputs: (template.match(/<input/g) || []).length > 0,
      hasSelects: (template.match(/<select/g) || []).length > 0
    };

    const score = Object.values(checks).filter(Boolean).length;
    const maxScore = Object.keys(checks).length;

    return {
      status: score === maxScore ? 'complete' : score > maxScore * 0.7 ? 'partial' : 'incomplete',
      template,
      checks,
      score,
      maxScore,
      completeness: (score / maxScore) * 100
    };
  }

  // 检查组件依赖关系
  checkComponentDependencies() {
    const content = fs.readFileSync(this.workspaceViewPath, 'utf8');
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);

    if (!scriptMatch) {
      return { dependencies: [], issues: ['缺少script部分'] };
    }

    const script = scriptMatch[1];

    const dependencies = {
      // Vue相关
      vue: script.includes('import') && script.includes('from \'vue\''),
      vueRouter: script.includes('vue-router'),
      elementPlus: script.includes('element-plus'),

      // 自定义组件
      VideoUploader: script.includes('VideoUploader'),
      TemplateSelector: script.includes('TemplateSelector'),
      PictureInPicture: script.includes('PictureInPicture'),
      Timeline: script.includes('Timeline'),
      UserAdjustmentPanel: script.includes('UserAdjustmentPanel'),

      // 工具库
      translation: script.includes('i18n') || script.includes('locales'),
      utils: script.includes('utils') || script.includes('helpers')
    };

    const issues = [];
    const requiredDeps = ['vue', 'VideoUploader', 'TemplateSelector', 'Timeline'];

    requiredDeps.forEach(dep => {
      if (!dependencies[dep]) {
        issues.push(`缺少必需依赖: ${dep}`);
      }
    });

    return { dependencies, issues };
  }

  // 检查数据绑定
  checkDataBinding() {
    const content = fs.readFileSync(this.workspaceViewPath, 'utf8');
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);

    if (!scriptMatch) {
      return { dataBindings: [], issues: ['缺少script部分'] };
    }

    const script = scriptMatch[1];
    const template = fs.readFileSync(this.workspaceViewPath, 'utf8').match(/<template>([\s\S]*?)<\/template>/)?.[1] || '';

    const dataBindings = {
      // 响应式数据
      videoSrc: script.includes('videoSrc') && template.includes('videoSrc'),
      selectedTemplate: script.includes('selectedTemplate') && template.includes('selectedTemplate'),
      pipEnabled: script.includes('pipEnabled') && template.includes('pipEnabled'),
      timelineMarkers: script.includes('timelineMarkers') && template.includes('timelineMarkers'),

      // 计算属性
      hasComputed: script.includes('computed'),
      hasProgress: script.includes('progress') || script.includes('Progress'),

      // 方法
      hasMethods: script.includes('methods') || script.includes('function'),
      hasEventHandlers: template.includes('@click') || template.includes('@change')
    };

    const issues = [];
    const requiredBindings = ['videoSrc', 'selectedTemplate', 'hasMethods'];

    requiredBindings.forEach(binding => {
      if (!dataBindings[binding]) {
        issues.push(`缺少数据绑定: ${binding}`);
      }
    });

    return { dataBindings, issues };
  }

  // 检查样式完整性
  checkStyling() {
    const content = fs.readFileSync(this.workspaceViewPath, 'utf8');
    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);

    if (!styleMatch) {
      return {
        status: 'warning',
        message: '缺少style部分，可能使用外部样式',
        styles: null
      };
    }

    const styles = styleMatch[1];

    const checks = {
      hasWorkspaceStyles: styles.includes('.workspace'),
      hasHeaderStyles: styles.includes('.workspace-header'),
      hasMainStyles: styles.includes('.workspace-main'),
      hasResponsive: styles.includes('@media') || styles.includes('responsive'),
      hasAnimations: styles.includes('@keyframes') || styles.includes('animation'),
      hasFlexbox: styles.includes('display: flex') || styles.includes('flex'),
      hasGrid: styles.includes('display: grid') || styles.includes('grid')
    };

    const score = Object.values(checks).filter(Boolean).length;
    const maxScore = Object.keys(checks).length;

    return {
      status: score > maxScore * 0.6 ? 'good' : 'needs_improvement',
      styles,
      checks,
      score,
      maxScore,
      coverage: (score / maxScore) * 100
    };
  }

  // 生成综合评估报告
  async generateAssessment() {
    console.log('🔍 VidSlide AI - UI对接状态监控');
    console.log('=' .repeat(50));

    const results = {
      timestamp: new Date().toISOString(),
      template: this.checkWorkspaceTemplate(),
      dependencies: this.checkComponentDependencies(),
      dataBinding: this.checkDataBinding(),
      styling: this.checkStyling(),
      summary: {}
    };

    // 计算综合得分
    const scores = {
      template: results.template.completeness || 0,
      dependencies: (1 - (results.dependencies.issues.length / 10)) * 100,
      dataBinding: (1 - (results.dataBinding.issues.length / 5)) * 100,
      styling: results.styling.coverage || 0
    };

    results.summary = {
      overallScore: Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length,
      scores,
      issues: [
        ...results.dependencies.issues.map(issue => ({ type: 'dependency', ...issue })),
        ...results.dataBinding.issues.map(issue => ({ type: 'data_binding', ...issue }))
      ]
    };

    // 输出报告
    this.printReport(results);

    // 保存详细报告
    const reportPath = path.join(this.projectRoot, 'reports', `ui-integration-monitor-${new Date().toISOString().split('T')[0]}.json`);
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    return results;
  }

  // 打印报告
  printReport(results) {
    console.log('\n📊 综合评估结果:');
    console.log(`总体得分: ${results.summary.overallScore.toFixed(1)}/100`);

    console.log('\n📋 详细评分:');
    Object.entries(results.summary.scores).forEach(([key, score]) => {
      const status = score >= 80 ? '✅' : score >= 60 ? '⚠️' : '❌';
      console.log(`  ${key}: ${status} ${score.toFixed(1)}%`);
    });

    if (results.summary.issues.length > 0) {
      console.log('\n⚠️ 发现问题:');
      results.summary.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.type}: ${issue}`);
      });
    }

    // 给出建议
    console.log('\n💡 改进建议:');
    if (results.summary.overallScore >= 80) {
      console.log('  ✅ UI对接状态良好，可以开始功能测试');
    } else if (results.summary.overallScore >= 60) {
      console.log('  ⚠️ UI对接基本完成，需要解决关键问题');
    } else {
      console.log('  ❌ UI对接存在严重问题，需要优先修复');
    }

    if (results.template.status !== 'complete') {
      console.log('  - 完善工作页面模板结构');
    }
    if (results.dependencies.issues.length > 0) {
      console.log('  - 解决组件依赖问题');
    }
    if (results.dataBinding.issues.length > 0) {
      console.log('  - 完善数据绑定');
    }
    if (results.styling.status !== 'good') {
      console.log('  - 优化样式实现');
    }
  }
}

// 执行监控
if (require.main === module) {
  const monitor = new UIIntegrationMonitor();
  monitor.generateAssessment().catch(console.error);
}

module.exports = UIIntegrationMonitor;