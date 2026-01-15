#!/usr/bin/env node

/**
 * VidSlide AI - UI对接问题识别脚本
 * 自动识别和分类UI集成中的问题
 */

const fs = require('fs');
const path = require('path');

class IntegrationIssueIdentifier {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.issues = [];
  }

  // P0问题：阻塞性问题
  identifyP0Issues() {
    console.log('🔴 检查P0问题（阻塞性问题）...');

    // 检查核心文件是否存在
    const coreFiles = [
      'vidslide-ai/src/views/WorkspaceView.vue',
      'vidslide-ai/src/App.vue',
      'vidslide-ai/src/main.js',
      'vidslide-ai/src/router/index.js'
    ];

    coreFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (!fs.existsSync(filePath)) {
        this.issues.push({
          id: `P0-${this.issues.length + 1}`,
          priority: 'P0',
          category: '核心文件缺失',
          component: file,
          title: `核心文件缺失: ${file}`,
          description: `必需的核心文件 ${file} 不存在`,
          impact: '应用无法启动',
          solution: `创建 ${file} 文件`,
          status: 'open'
        });
      }
    });

    // 检查WorkspaceView.vue的基本结构
    const workspacePath = path.join(this.projectRoot, 'src/views/WorkspaceView.vue');
    if (fs.existsSync(workspacePath)) {
      const content = fs.readFileSync(workspacePath, 'utf8');

      // 检查template
      if (!content.includes('<template>')) {
        this.issues.push({
          id: `P0-${this.issues.length + 1}`,
          priority: 'P0',
          category: '模板结构错误',
          component: 'WorkspaceView.vue',
          title: '工作页面缺少template',
          description: 'WorkspaceView.vue缺少<template>标签',
          impact: '页面无法渲染',
          solution: '添加<template>部分',
          status: 'open'
        });
      }

      // 检查script
      if (!content.includes('<script')) {
        this.issues.push({
          id: `P0-${this.issues.length + 1}`,
          priority: 'P0',
          category: '脚本结构错误',
          component: 'WorkspaceView.vue',
          title: '工作页面缺少script',
          description: 'WorkspaceView.vue缺少<script>标签',
          impact: '组件逻辑无法执行',
          solution: '添加<script setup>或<script>部分',
          status: 'open'
        });
      }

      // 检查export default
      if (!content.includes('export default') && !content.includes('defineComponent')) {
        this.issues.push({
          id: `P0-${this.issues.length + 1}`,
          priority: 'P0',
          category: '组件导出错误',
          component: 'WorkspaceView.vue',
          title: '工作页面缺少组件导出',
          description: 'WorkspaceView.vue缺少export default或defineComponent',
          impact: '组件无法注册',
          solution: '添加组件导出语句',
          status: 'open'
        });
      }
    }
  }

  // P1问题：功能性问题
  identifyP1Issues() {
    console.log('🟡 检查P1问题（功能性问题）...');

    const workspacePath = path.join(this.projectRoot, 'src/views/WorkspaceView.vue');
    if (!fs.existsSync(workspacePath)) return;

    const content = fs.readFileSync(workspacePath, 'utf8');

    // 检查数据绑定
    const template = content.match(/<template>([\s\S]*?)<\/template>/)?.[1] || '';
    const script = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] || '';

    // 检查关键数据属性
    const requiredData = ['videoSrc', 'selectedTemplate', 'pipEnabled'];
    requiredData.forEach(dataProp => {
      if (!script.includes(dataProp)) {
        this.issues.push({
          id: `P1-${this.issues.length + 1}`,
          priority: 'P1',
          category: '数据绑定缺失',
          component: 'WorkspaceView.vue',
          title: `缺少响应式数据: ${dataProp}`,
          description: `组件缺少必需的响应式数据 ${dataProp}`,
          impact: `相关功能无法正常工作`,
          solution: `添加 ref(${dataProp}) 或 reactive 数据`,
          status: 'open'
        });
      }
    });

    // 检查模板渲染
    if (!template.includes('{{')) {
      this.issues.push({
        id: `P1-${this.issues.length + 1}`,
        priority: 'P1',
        category: '模板渲染问题',
        component: 'WorkspaceView.vue',
        title: '模板缺少数据绑定',
        description: '工作页面模板没有使用任何数据绑定',
        impact: '页面内容静态，无法响应数据变化',
        solution: '添加适当的 {{ }} 数据绑定',
        status: 'open'
      });
    }

    // 检查事件处理
    if (!template.includes('@click') && !template.includes('@change') && !template.includes('v-on:')) {
      this.issues.push({
        id: `P1-${this.issues.length + 1}`,
        priority: 'P1',
        category: '交互事件缺失',
        component: 'WorkspaceView.vue',
        title: '缺少用户交互事件',
        description: '工作页面没有绑定任何用户交互事件',
        impact: '用户无法与页面进行交互',
        solution: '添加 @click、@change 等事件处理',
        status: 'open'
      });
    }

    // 检查组件依赖
    const componentDeps = ['VideoUploader', 'TemplateSelector', 'Timeline'];
    componentDeps.forEach(dep => {
      if (script.includes(dep) && !script.includes(`import ${dep}`)) {
        this.issues.push({
          id: `P1-${this.issues.length + 1}`,
          priority: 'P1',
          category: '组件导入缺失',
          component: 'WorkspaceView.vue',
          title: `组件导入缺失: ${dep}`,
          description: `使用了 ${dep} 组件但没有导入`,
          impact: `组件无法正常渲染`,
          solution: `添加 import ${dep} from '@/components/${dep}.vue'`,
          status: 'open'
        });
      }
    });
  }

  // P2问题：优化性问题
  identifyP2Issues() {
    console.log('🟢 检查P2问题（优化性问题）...');

    const workspacePath = path.join(this.projectRoot, 'src/views/WorkspaceView.vue');
    if (!fs.existsSync(workspacePath)) return;

    const content = fs.readFileSync(workspacePath, 'utf8');
    const style = content.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] || '';

    // 检查样式完整性
    if (!style || style.trim().length < 100) {
      this.issues.push({
        id: `P2-${this.issues.length + 1}`,
        priority: 'P2',
        category: '样式优化',
        component: 'WorkspaceView.vue',
        title: '样式实现不完整',
        description: '工作页面样式代码较少，可能影响视觉效果',
        impact: '页面样式可能不美观',
        solution: '完善CSS样式，实现专业UI设计',
        status: 'open'
      });
    }

    // 检查响应式设计
    if (!style.includes('@media') && !style.includes('responsive')) {
      this.issues.push({
        id: `P2-${this.issues.length + 1}`,
        priority: 'P2',
        category: '响应式设计缺失',
        component: 'WorkspaceView.vue',
        title: '缺少响应式设计',
        description: '工作页面没有适配不同屏幕尺寸',
        impact: '在移动设备上显示效果不佳',
        solution: '添加@media查询和响应式布局',
        status: 'open'
      });
    }

    // 检查无障碍访问
    const template = content.match(/<template>([\s\S]*?)<\/template>/)?.[1] || '';
    if (!template.includes('aria-') && !template.includes('role=')) {
      this.issues.push({
        id: `P2-${this.issues.length + 1}`,
        priority: 'P2',
        category: '无障碍访问',
        component: 'WorkspaceView.vue',
        title: '缺少无障碍访问支持',
        description: '工作页面没有ARIA属性或角色定义',
        impact: '残障用户使用体验不佳',
        solution: '添加aria-label、role等无障碍属性',
        status: 'open'
      });
    }
  }

  // 分析问题影响范围
  analyzeImpact() {
    const impactAnalysis = {
      P0: { count: 0, description: '阻塞性问题，必须立即解决' },
      P1: { count: 0, description: '功能性问题，影响用户体验' },
      P2: { count: 0, description: '优化性问题，可逐步改进' }
    };

    this.issues.forEach(issue => {
      impactAnalysis[issue.priority].count++;
    });

    return impactAnalysis;
  }

  // 生成修复计划
  generateFixPlan() {
    const fixPlan = {
      immediate: [], // 立即修复
      thisWeek: [],  // 本周内修复
      thisMonth: [], // 本月内修复
      optimization: [] // 优化阶段
    };

    this.issues.forEach(issue => {
      switch(issue.priority) {
        case 'P0':
          fixPlan.immediate.push(issue);
          break;
        case 'P1':
          fixPlan.thisWeek.push(issue);
          break;
        case 'P2':
          fixPlan.optimization.push(issue);
          break;
      }
    });

    return fixPlan;
  }

  // 执行问题识别
  async runIdentification() {
    console.log('🔍 VidSlide AI - UI对接问题识别');
    console.log('=' .repeat(50));

    // 清空之前的问题
    this.issues = [];

    // 执行各级别检查
    this.identifyP0Issues();
    this.identifyP1Issues();
    this.identifyP2Issues();

    // 分析和报告
    const impact = this.analyzeImpact();
    const fixPlan = this.generateFixPlan();

    this.generateReport(impact, fixPlan);

    return {
      issues: this.issues,
      impact,
      fixPlan
    };
  }

  // 生成问题报告
  generateReport(impact, fixPlan) {
    console.log('\n📊 问题识别结果汇总');
    console.log('=' .repeat(50));

    console.log(`总问题数: ${this.issues.length}`);
    console.log(`P0问题: ${impact.P0.count} - ${impact.P0.description}`);
    console.log(`P1问题: ${impact.P1.count} - ${impact.P1.description}`);
    console.log(`P2问题: ${impact.P2.count} - ${impact.P2.description}`);

    if (this.issues.length > 0) {
      console.log('\n📋 详细问题列表:');

      ['immediate', 'thisWeek', 'thisMonth', 'optimization'].forEach((phase, index) => {
        const phaseName = ['立即修复', '本周修复', '本月修复', '优化阶段'][index];
        const issues = fixPlan[phase];

        if (issues.length > 0) {
          console.log(`\n${phaseName} (${issues.length}个):`);
          issues.forEach((issue, idx) => {
            console.log(`  ${idx + 1}. [${issue.id}] ${issue.title}`);
            console.log(`     ${issue.description}`);
            console.log(`     💡 ${issue.solution}`);
          });
        }
      });

      console.log('\n🎯 修复建议:');
      if (impact.P0.count > 0) {
        console.log('  🚨 优先解决所有P0问题，确保基本功能可用');
      }
      if (impact.P1.count > 0) {
        console.log('  ⚠️  随后解决P1问题，提升用户体验');
      }
      if (impact.P2.count > 0) {
        console.log('  💡  最后处理P2问题，实现产品优化');
      }
    } else {
      console.log('\n✅ 未发现明显问题！UI对接状态良好。');
    }

    // 保存详细报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: impact,
      issues: this.issues,
      fixPlan
    };

    const reportPath = path.join(this.projectRoot, 'reports', `integration-issues-${new Date().toISOString().split('T')[0]}.json`);
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存: ${reportPath}`);
  }
}

// 执行问题识别
if (require.main === module) {
  const identifier = new IntegrationIssueIdentifier();
  identifier.runIdentification().catch(console.error);
}

module.exports = IntegrationIssueIdentifier;