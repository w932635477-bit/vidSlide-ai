#!/usr/bin/env node

/**
 * VidSlide AI - UI组件检查脚本
 * 检查工作页面所需的所有UI组件是否就绪
 */

const fs = require('fs');
const path = require('path');

class UIComponentChecker {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.componentsDir = path.join(this.projectRoot, 'vidslide-ai/src/components');
    this.viewsDir = path.join(this.projectRoot, 'vidslide-ai/src/views');
  }

  // 必需的UI组件清单
  getRequiredComponents() {
    return {
      // 核心组件
      'VideoUploader.vue': {
        type: '核心组件',
        priority: 'P0',
        description: '视频上传组件',
        required: true
      },
      'TemplateSelector.vue': {
        type: '核心组件',
        priority: 'P0',
        description: '模板选择组件',
        required: true
      },
      'PictureInPicture.vue': {
        type: '核心组件',
        priority: 'P0',
        description: '画中画组件',
        required: true
      },
      'Timeline.vue': {
        type: '核心组件',
        priority: 'P0',
        description: '时间轴组件',
        required: true
      },
      'UserAdjustmentPanel.vue': {
        type: '核心组件',
        priority: 'P0',
        description: '用户调整面板',
        required: true
      },

      // 辅助组件
      'ProgressIndicator.vue': {
        type: '辅助组件',
        priority: 'P1',
        description: '进度指示器',
        required: true
      },
      'ExportHandler.vue': {
        type: '辅助组件',
        priority: 'P1',
        description: '导出处理器',
        required: true
      },
      'ErrorHandler.vue': {
        type: '辅助组件',
        priority: 'P1',
        description: '错误处理器',
        required: true
      },

      // 视图组件
      'WorkspaceView.vue': {
        type: '视图组件',
        priority: 'P0',
        description: '工作页面主视图',
        path: 'vidslide-ai/src/views/WorkspaceView.vue',
        required: true
      }
    };
  }

  // 检查组件文件是否存在
  checkComponentExists(componentName, customPath = null) {
    const componentPath = customPath || path.join(this.componentsDir, componentName);
    const exists = fs.existsSync(componentPath);

    let stats = null;
    let size = 0;
    let lastModified = null;

    if (exists) {
      stats = fs.statSync(componentPath);
      size = stats.size;
      lastModified = stats.mtime;
    }

    return {
      exists,
      path: componentPath,
      size,
      lastModified,
      sizeKB: (size / 1024).toFixed(1)
    };
  }

  // 检查组件内容质量
  checkComponentQuality(componentPath) {
    if (!fs.existsSync(componentPath)) {
      return { valid: false, reason: '文件不存在' };
    }

    const content = fs.readFileSync(componentPath, 'utf8');

    const checks = {
      hasTemplate: content.includes('<template>'),
      hasScript: content.includes('<script'),
      hasStyle: content.includes('<style'),
      hasName: content.includes('name:'),
      hasProps: content.includes('props:') || content.includes('defineProps'),
      hasEmits: content.includes('emits:') || content.includes('defineEmits'),
      hasExport: content.includes('export default'),
      linesCount: content.split('\n').length,
      hasComments: (content.match(/<!--[\s\S]*?-->/g) || []).length > 0
    };

    const score = Object.values(checks).filter(Boolean).length;
    const maxScore = Object.keys(checks).length;

    return {
      valid: checks.hasTemplate && checks.hasScript && checks.hasExport,
      checks,
      score,
      maxScore,
      quality: score / maxScore,
      recommendations: this.generateRecommendations(checks)
    };
  }

  // 生成改进建议
  generateRecommendations(checks) {
    const recommendations = [];

    if (!checks.hasTemplate) recommendations.push('添加<template>部分');
    if (!checks.hasScript) recommendations.push('添加<script>部分');
    if (!checks.hasStyle) recommendations.push('考虑添加<style>部分');
    if (!checks.hasName) recommendations.push('添加组件name属性');
    if (!checks.hasProps && !checks.hasEmits) recommendations.push('考虑使用Composition API');
    if (!checks.hasComments) recommendations.push('添加必要的注释');
    if (checks.linesCount < 50) recommendations.push('组件可能过于简单，确认功能完整性');

    return recommendations;
  }

  // 执行完整检查
  async runCheck() {
    console.log('🔍 VidSlide AI - UI组件检查开始');
    console.log('=' .repeat(50));

    const components = this.getRequiredComponents();
    const results = {
      summary: {
        total: Object.keys(components).length,
        existing: 0,
        missing: 0,
        valid: 0,
        invalid: 0
      },
      components: {},
      issues: []
    };

    for (const [componentName, config] of Object.entries(components)) {
      console.log(`\n📋 检查组件: ${componentName}`);

      const componentPath = config.path || path.join(this.componentsDir, componentName);
      const existence = this.checkComponentExists(componentName, config.path);

      if (existence.exists) {
        results.summary.existing++;
        console.log(`  ✅ 文件存在: ${existence.sizeKB}KB`);

        const quality = this.checkComponentQuality(componentPath);

        if (quality.valid) {
          results.summary.valid++;
          console.log(`  ✅ 组件有效 (质量评分: ${(quality.quality * 100).toFixed(0)}%)`);
        } else {
          results.summary.invalid++;
          console.log(`  ❌ 组件无效: ${quality.reason}`);
          results.issues.push({
            type: 'invalid_component',
            component: componentName,
            priority: config.priority,
            reason: quality.reason,
            recommendations: quality.recommendations
          });
        }

        results.components[componentName] = {
          ...config,
          existence,
          quality
        };

      } else {
        results.summary.missing++;
        console.log(`  ❌ 文件缺失`);

        results.issues.push({
          type: 'missing_component',
          component: componentName,
          priority: config.priority,
          description: config.description,
          path: componentPath
        });

        results.components[componentName] = {
          ...config,
          existence
        };
      }
    }

    // 生成报告
    this.generateReport(results);

    return results;
  }

  // 生成检查报告
  generateReport(results) {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 检查结果汇总');
    console.log('=' .repeat(50));

    console.log(`总组件数: ${results.summary.total}`);
    console.log(`已存在: ${results.summary.existing} (${((results.summary.existing / results.summary.total) * 100).toFixed(1)}%)`);
    console.log(`缺失: ${results.summary.missing} (${((results.summary.missing / results.summary.total) * 100).toFixed(1)}%)`);
    console.log(`有效: ${results.summary.valid} (${results.summary.existing > 0 ? ((results.summary.valid / results.summary.existing) * 100).toFixed(1) : 0}%)`);
    console.log(`无效: ${results.summary.invalid}`);

    if (results.issues.length > 0) {
      console.log('\n⚠️ 发现问题:');
      results.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.priority}] ${issue.component}: ${issue.type === 'missing_component' ? '组件缺失' : '组件无效'}`);
        if (issue.recommendations) {
          issue.recommendations.forEach(rec => console.log(`    - ${rec}`));
        }
      });
    } else {
      console.log('\n✅ 所有必需组件都已就绪！');
    }

    // 保存详细报告
    const reportPath = path.join(this.projectRoot, 'reports', `ui-components-check-${new Date().toISOString().split('T')[0]}.json`);
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 详细报告已保存: ${reportPath}`);
  }
}

// 执行检查
if (require.main === module) {
  const checker = new UIComponentChecker();
  checker.runCheck().catch(console.error);
}

module.exports = UIComponentChecker;