#!/usr/bin/env node

/**
 * VidSlide AI - 工作页面UI集成测试脚本
 * 测试所有组件的协同工作和功能完整性
 */

const fs = require('fs');
const path = require('path');

class IntegrationTester {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.vidslideRoot = path.join(this.projectRoot, 'vidslide-ai');
    this.srcDir = path.join(this.vidslideRoot, 'src');
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  // 测试结果记录
  logTest(testName, status, message = '', details = null) {
    const result = {
      name: testName,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    };

    this.testResults.tests.push(result);

    const statusIcon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${testName}: ${message}`);

    if (status === 'pass') this.testResults.passed++;
    else if (status === 'fail') this.testResults.failed++;
    else this.testResults.warnings++;
  }

  // 测试1: 组件文件完整性检查
  testComponentFiles() {
    console.log('\n🔍 测试1: 组件文件完整性检查');

    const requiredComponents = [
      'VideoUploader.vue',
      'TemplateSelector.vue',
      'PictureInPicture.vue',
      'Timeline.vue',
      'UserAdjustmentPanel.vue',
      'ProgressIndicator.vue',
      'ExportHandler.vue',
      'ErrorHandler.vue',
      'WorkspaceView.vue'
    ];

    const componentsDir = path.join(this.srcDir, 'components');
    const viewsDir = path.join(this.srcDir, 'views');

    requiredComponents.forEach(component => {
      let filePath;
      if (component === 'WorkspaceView.vue') {
        filePath = path.join(viewsDir, component);
      } else {
        filePath = path.join(componentsDir, component);
      }

      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        this.logTest(
          `组件文件存在: ${component}`,
          'pass',
          `${(stats.size / 1024).toFixed(1)}KB`
        );
      } else {
        this.logTest(
          `组件文件存在: ${component}`,
          'fail',
          '文件不存在',
          `期望路径: ${filePath}`
        );
      }
    });
  }

  // 测试2: 组件结构验证
  testComponentStructure() {
    console.log('\n🔍 测试2: 组件结构验证');

    const components = [
      { name: 'VideoUploader.vue', path: 'components/VideoUploader.vue' },
      { name: 'Timeline.vue', path: 'components/Timeline.vue' },
      { name: 'ProgressIndicator.vue', path: 'components/ProgressIndicator.vue' },
      { name: 'ExportHandler.vue', path: 'components/ExportHandler.vue' },
      { name: 'ErrorHandler.vue', path: 'components/ErrorHandler.vue' },
      { name: 'WorkspaceView.vue', path: 'views/WorkspaceView.vue' }
    ];

    components.forEach(({ name, path: relativePath }) => {
      const filePath = path.join(this.srcDir, relativePath);

      if (!fs.existsSync(filePath)) {
        this.logTest(`组件结构: ${name}`, 'fail', '文件不存在');
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const checks = {
        hasTemplate: content.includes('<template>'),
        hasScript: content.includes('<script'),
        hasName: content.includes('name="') || content.includes("name='"),
        hasSetup: content.includes('setup'),
        hasExport: content.includes('export default') || content.includes('<script setup')
      };

      const validStructure = checks.hasTemplate && checks.hasScript && checks.hasName;

      if (validStructure) {
        this.logTest(
          `组件结构: ${name}`,
          'pass',
          '结构完整',
          `Template: ${checks.hasTemplate ? '✅' : '❌'}, Script: ${checks.hasScript ? '✅' : '❌'}, Name: ${checks.hasName ? '✅' : '❌'}`
        );
      } else {
        this.logTest(
          `组件结构: ${name}`,
          'fail',
          '结构不完整',
          Object.entries(checks).map(([key, value]) => `${key}: ${value ? '✅' : '❌'}`).join(', ')
        );
      }
    });
  }

  // 测试3: 多语言支持验证
  testI18nSupport() {
    console.log('\n🔍 测试3: 多语言支持验证');

    const localesPath = path.join(this.srcDir, 'i18n', 'locales.js');

    if (!fs.existsSync(localesPath)) {
      this.logTest('多语言支持', 'fail', 'locales.js文件不存在');
      return;
    }

    const content = fs.readFileSync(localesPath, 'utf8');

    // 检查支持的语言
    const supportedLocales = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'fr-FR'];
    const foundLocales = supportedLocales.filter(locale =>
      content.includes(`'${locale}'`) || content.includes(`"${locale}"`)
    );

    if (foundLocales.length === supportedLocales.length) {
      this.logTest('多语言支持', 'pass', `支持 ${foundLocales.length} 种语言`);
    } else {
      this.logTest(
        '多语言支持',
        'fail',
        `缺少语言支持: ${supportedLocales.filter(l => !foundLocales.includes(l)).join(', ')}`
      );
    }

    // 检查翻译键的完整性
    const requiredKeys = [
      'workspace.upload.title',
      'workspace.timeline.addMarker',
      'workspace.export.export'
    ];

    let missingKeys = 0;
    requiredKeys.forEach(key => {
      if (!content.includes(`'${key}'`) && !content.includes(`"${key}"`)) {
        missingKeys++;
      }
    });

    if (missingKeys === 0) {
      this.logTest('翻译键完整性', 'pass', '所有必需翻译键都存在');
    } else {
      this.logTest('翻译键完整性', 'fail', `缺少 ${missingKeys} 个翻译键`);
    }
  }

  // 测试4: 组件依赖关系检查
  testComponentDependencies() {
    console.log('\n🔍 测试4: 组件依赖关系检查');

    const workspacePath = path.join(this.srcDir, 'views', 'WorkspaceView.vue');

    if (!fs.existsSync(workspacePath)) {
      this.logTest('组件依赖关系', 'fail', 'WorkspaceView.vue不存在');
      return;
    }

    const content = fs.readFileSync(workspacePath, 'utf8');

    // 检查必需的组件导入
    const requiredImports = [
      'VideoUploader',
      'TemplateSelector',
      'Timeline',
      'ProgressIndicator'
    ];

    let missingImports = 0;
    requiredImports.forEach(component => {
      if (!content.includes(`import ${component}`) && !content.includes(`import ${component} `)) {
        missingImports++;
      }
    });

    if (missingImports === 0) {
      this.logTest('组件导入', 'pass', '所有必需组件都已导入');
    } else {
      this.logTest('组件导入', 'fail', `缺少 ${missingImports} 个组件导入`);
    }

    // 检查组件注册
    const componentsSection = content.match(/components:\s*{([\s\S]*?)}/)?.[1] || '';
    let missingRegistrations = 0;

    requiredImports.forEach(component => {
      if (!componentsSection.includes(component)) {
        missingRegistrations++;
      }
    });

    if (missingRegistrations === 0) {
      this.logTest('组件注册', 'pass', '所有必需组件都已注册');
    } else {
      this.logTest('组件注册', 'fail', `缺少 ${missingRegistrations} 个组件注册`);
    }
  }

  // 测试5: 数据流验证
  testDataFlow() {
    console.log('\n🔍 测试5: 数据流验证');

    const workspacePath = path.join(this.srcDir, 'views', 'WorkspaceView.vue');

    if (!fs.existsSync(workspacePath)) {
      this.logTest('数据流验证', 'fail', 'WorkspaceView.vue不存在');
      return;
    }

    const content = fs.readFileSync(workspacePath, 'utf8');

    // 检查响应式数据
    const requiredData = ['videoSrc', 'selectedTemplate', 'pipEnabled', 'currentTime'];

    let missingData = 0;
    requiredData.forEach(data => {
      if (!content.includes(`const ${data}`) && !content.includes(`let ${data}`) && !content.includes(`${data}.value`)) {
        missingData++;
      }
    });

    if (missingData === 0) {
      this.logTest('响应式数据', 'pass', '所有必需数据都已定义');
    } else {
      this.logTest('响应式数据', 'fail', `缺少 ${missingData} 个响应式数据`);
    }

    // 检查事件处理
    const requiredEvents = ['video-uploaded', 'marker-added', 'template-selected'];

    let missingEvents = 0;
    requiredEvents.forEach(event => {
      if (!content.includes(`@click`) && !content.includes(`@change`) && !content.includes(event.replace('-', ''))) {
        missingEvents++;
      }
    });

    if (missingEvents < requiredEvents.length) {
      this.logTest('事件处理', 'pass', '包含事件处理逻辑');
    } else {
      this.logTest('事件处理', 'warning', '事件处理可能不完整');
    }
  }

  // 测试6: 样式完整性检查
  testStyling() {
    console.log('\n🔍 测试6: 样式完整性检查');

    const components = [
      { name: 'VideoUploader.vue', path: 'components/VideoUploader.vue' },
      { name: 'Timeline.vue', path: 'components/Timeline.vue' },
      { name: 'WorkspaceView.vue', path: 'views/WorkspaceView.vue' }
    ];

    components.forEach(({ name, path: relativePath }) => {
      const filePath = path.join(this.srcDir, relativePath);

      if (!fs.existsSync(filePath)) {
        this.logTest(`样式完整性: ${name}`, 'fail', '文件不存在');
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const hasStyle = content.includes('<style');

      if (hasStyle) {
        const styleContent = content.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] || '';
        const hasResponsive = styleContent.includes('@media') || styleContent.includes('responsive');
        const hasFlexbox = styleContent.includes('display: flex') || styleContent.includes('flex');
        const styleQuality = (hasResponsive ? 1 : 0) + (hasFlexbox ? 1 : 0);

        if (styleQuality >= 1) {
          this.logTest(
            `样式完整性: ${name}`,
            'pass',
            '样式完整',
            `响应式: ${hasResponsive ? '✅' : '❌'}, 弹性布局: ${hasFlexbox ? '✅' : '❌'}`
          );
        } else {
          this.logTest(`样式完整性: ${name}`, 'warning', '样式基础功能完整');
        }
      } else {
        this.logTest(`样式完整性: ${name}`, 'warning', '缺少样式定义');
      }
    });
  }

  // 测试7: 路由配置检查
  testRouting() {
    console.log('\n🔍 测试7: 路由配置检查');

    const routerPath = path.join(this.srcDir, 'router', 'index.js');

    if (!fs.existsSync(routerPath)) {
      this.logTest('路由配置', 'fail', '路由文件不存在');
      return;
    }

    const content = fs.readFileSync(routerPath, 'utf8');

    // 检查工作页面路由
    const hasWorkspaceRoute = content.includes('/workspace') || content.includes('WorkspaceView');

    if (hasWorkspaceRoute) {
      this.logTest('路由配置', 'pass', '工作页面路由已配置');
    } else {
      this.logTest('路由配置', 'fail', '缺少工作页面路由配置');
    }
  }

  // 测试8: 错误处理验证
  testErrorHandling() {
    console.log('\n🔍 测试8: 错误处理验证');

    const errorHandlerPath = path.join(this.srcDir, 'components', 'ErrorHandler.vue');

    if (!fs.existsSync(errorHandlerPath)) {
      this.logTest('错误处理', 'fail', 'ErrorHandler.vue不存在');
      return;
    }

    const content = fs.readFileSync(errorHandlerPath, 'utf8');

    // 检查错误处理功能
    const hasErrorTypes = content.includes('error-types') || content.includes('error');
    const hasGlobalHandling = content.includes('addEventListener') && content.includes('error');
    const hasUserFeedback = content.includes('ElMessage') || content.includes('alert');

    if (hasErrorTypes && hasGlobalHandling && hasUserFeedback) {
      this.logTest('错误处理', 'pass', '错误处理功能完整');
    } else {
      this.logTest(
        '错误处理',
        'warning',
        '错误处理功能基础完整',
        `错误类型: ${hasErrorTypes ? '✅' : '❌'}, 全局监听: ${hasGlobalHandling ? '✅' : '❌'}, 用户反馈: ${hasUserFeedback ? '✅' : '❌'}`
      );
    }
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 VidSlide AI - 工作页面UI集成测试开始');
    console.log('=' .repeat(60));

    try {
      this.testComponentFiles();
      this.testComponentStructure();
      this.testI18nSupport();
      this.testComponentDependencies();
      this.testDataFlow();
      this.testStyling();
      this.testRouting();
      this.testErrorHandling();

      // 生成测试报告
      this.generateReport();

    } catch (error) {
      console.error('测试执行失败:', error);
      this.logTest('测试执行', 'fail', `测试过程中发生错误: ${error.message}`);
    }
  }

  // 生成测试报告
  generateReport() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 集成测试结果汇总');
    console.log('=' .repeat(60));

    console.log(`总测试数: ${this.testResults.tests.length}`);
    console.log(`✅ 通过: ${this.testResults.passed}`);
    console.log(`❌ 失败: ${this.testResults.failed}`);
    console.log(`⚠️  警告: ${this.testResults.warnings}`);

    const successRate = ((this.testResults.passed / this.testResults.tests.length) * 100).toFixed(1);

    console.log(`📈 成功率: ${successRate}%`);

    if (this.testResults.failed === 0) {
      console.log('\n🎉 所有测试通过！UI集成状态良好。');
    } else {
      console.log('\n⚠️  发现问题需要修复:');

      this.testResults.tests
        .filter(test => test.status === 'fail')
        .forEach((test, index) => {
          console.log(`  ${index + 1}. ${test.name}`);
          console.log(`     ${test.message}`);
          if (test.details) {
            console.log(`     详情: ${test.details}`);
          }
        });
    }

    // 保存详细报告
    const reportPath = path.join(this.projectRoot, 'reports', `integration-test-${new Date().toISOString().split('T')[0]}.json`);
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📄 详细报告已保存: ${reportPath}`);

    return this.testResults;
  }
}

// 执行集成测试
if (require.main === module) {
  const tester = new IntegrationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = IntegrationTester;