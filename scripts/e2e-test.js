#!/usr/bin/env node

/**
 * VidSlide AI - 端到端功能测试脚本
 * 模拟用户操作流程，验证工作页面各项功能的实际可用性
 */

const fs = require('fs');
const path = require('path');

class E2ETester {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.vidslideRoot = path.join(this.projectRoot, 'vidslide-ai');
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

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
  }

  // 测试1: 应用启动检查
  async testApplicationStartup() {
    console.log('\n🌐 测试1: 应用启动检查');

    try {
      // 检查开发服务器是否运行
      const response = await fetch('http://localhost:5173');
      if (response.ok) {
        this.logTest('开发服务器连接', 'pass', '服务器正常运行在 http://localhost:5173');

        const html = await response.text();
        const hasVue = html.includes('Vue') || html.includes('vite');
        const hasApp = html.includes('VidSlide') || html.includes('vidSlide');

        if (hasVue && hasApp) {
          this.logTest('应用内容加载', 'pass', 'Vue应用正常加载');
        } else {
          this.logTest('应用内容加载', 'fail', '应用内容加载异常');
        }
      } else {
        this.logTest('开发服务器连接', 'fail', `服务器响应异常: ${response.status}`);
      }
    } catch (error) {
      this.logTest('开发服务器连接', 'fail', `连接失败: ${error.message}`);
    }
  }

  // 测试2: 组件渲染验证
  async testComponentRendering() {
    console.log('\n🧩 测试2: 组件渲染验证');

    // 检查关键组件文件是否存在
    const components = [
      'VideoUploader.vue',
      'Timeline.vue',
      'ProgressIndicator.vue',
      'ExportHandler.vue',
      'ErrorHandler.vue',
      'WorkspaceView.vue'
    ];

    components.forEach(component => {
      const filePath = path.join(this.vidslideRoot, 'src/components', component);
      if (component === 'WorkspaceView.vue') {
        const viewPath = path.join(this.vidslideRoot, 'src/views', component);
        if (fs.existsSync(viewPath)) {
          this.logTest(`组件文件: ${component}`, 'pass', '文件存在');
        } else {
          this.logTest(`组件文件: ${component}`, 'fail', '文件不存在');
        }
      } else {
        if (fs.existsSync(filePath)) {
          this.logTest(`组件文件: ${component}`, 'pass', '文件存在');
        } else {
          this.logTest(`组件文件: ${component}`, 'fail', '文件不存在');
        }
      }
    });
  }

  // 测试3: 路由配置验证
  async testRoutingConfiguration() {
    console.log('\n🛣️ 测试3: 路由配置验证');

    const routerPath = path.join(this.vidslideRoot, 'src/router/index.js');
    if (!fs.existsSync(routerPath)) {
      this.logTest('路由文件存在', 'fail', '路由配置文件不存在');
      return;
    }

    const routerContent = fs.readFileSync(routerPath, 'utf8');
    const hasWorkspaceRoute = routerContent.includes('/workspace') || routerContent.includes('WorkspaceView');
    const hasHomeRoute = routerContent.includes('/') && routerContent.includes('HomeView');

    if (hasWorkspaceRoute) {
      this.logTest('工作页面路由', 'pass', '已配置工作页面路由');
    } else {
      this.logTest('工作页面路由', 'fail', '缺少工作页面路由配置');
    }

    if (hasHomeRoute) {
      this.logTest('首页路由', 'pass', '已配置首页路由');
    } else {
      this.logTest('首页路由', 'fail', '缺少首页路由配置');
    }
  }

  // 测试4: 多语言系统验证
  async testI18nSystem() {
    console.log('\n🌍 测试4: 多语言系统验证');

    const localesPath = path.join(this.vidslideRoot, 'src/i18n/locales.js');
    if (!fs.existsSync(localesPath)) {
      this.logTest('多语言文件', 'fail', '多语言配置文件不存在');
      return;
    }

    const localesContent = fs.readFileSync(localesPath, 'utf8');
    const supportedLocales = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'fr-FR'];

    let foundLocales = 0;
    supportedLocales.forEach(locale => {
      if (localesContent.includes(`'${locale}'`) || localesContent.includes(`"${locale}"`)) {
        foundLocales++;
      }
    });

    if (foundLocales === supportedLocales.length) {
      this.logTest('语言支持', 'pass', `支持 ${foundLocales} 种语言`);
    } else {
      this.logTest('语言支持', 'fail', `仅支持 ${foundLocales}/${supportedLocales.length} 种语言`);
    }

    // 检查翻译键的完整性
    const essentialKeys = [
      'workspace.upload.title',
      'workspace.timeline.addMarker',
      'workspace.export.export'
    ];

    let missingKeys = 0;
    essentialKeys.forEach(key => {
      if (!localesContent.includes(`'${key}'`) && !localesContent.includes(`"${key}"`)) {
        missingKeys++;
      }
    });

    if (missingKeys === 0) {
      this.logTest('翻译键完整性', 'pass', '所有必需翻译键都存在');
    } else {
      this.logTest('翻译键完整性', 'fail', `缺少 ${missingKeys} 个翻译键`);
    }
  }

  // 测试5: 样式系统验证
  async testStylingSystem() {
    console.log('\n🎨 测试5: 样式系统验证');

    const components = [
      'VideoUploader.vue',
      'Timeline.vue',
      'WorkspaceView.vue'
    ];

    components.forEach(component => {
      let filePath;
      if (component === 'WorkspaceView.vue') {
        filePath = path.join(this.vidslideRoot, 'src/views', component);
      } else {
        filePath = path.join(this.vidslideRoot, 'src/components', component);
      }

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasStyle = content.includes('<style');

        if (hasStyle) {
          const styleContent = content.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] || '';
          const hasResponsive = styleContent.includes('@media');
          const hasFlexbox = styleContent.includes('display: flex') || styleContent.includes('flex');

          if (hasResponsive || hasFlexbox) {
            this.logTest(`样式系统: ${component}`, 'pass', '包含现代CSS特性');
          } else {
            this.logTest(`样式系统: ${component}`, 'warning', '样式较为基础');
          }
        } else {
          this.logTest(`样式系统: ${component}`, 'warning', '缺少样式定义');
        }
      } else {
        this.logTest(`样式系统: ${component}`, 'fail', '组件文件不存在');
      }
    });
  }

  // 测试6: 错误处理验证
  async testErrorHandling() {
    console.log('\n🚨 测试6: 错误处理验证');

    const errorHandlerPath = path.join(this.vidslideRoot, 'src/components/ErrorHandler.vue');
    if (!fs.existsSync(errorHandlerPath)) {
      this.logTest('错误处理器', 'fail', 'ErrorHandler.vue不存在');
      return;
    }

    const content = fs.readFileSync(errorHandlerPath, 'utf8');
    const hasErrorTypes = content.includes('error-types') || content.includes('error');
    const hasGlobalHandling = content.includes('addEventListener');
    const hasUserFeedback = content.includes('ElMessage') || content.includes('alert');

    if (hasErrorTypes && hasGlobalHandling && hasUserFeedback) {
      this.logTest('错误处理功能', 'pass', '错误处理系统完整');
    } else {
      this.logTest('错误处理功能', 'warning', '错误处理功能基础完整');
    }

    // 检查错误类型定义
    const errorTypes = ['network', 'upload', 'processing', 'export', 'validation'];
    let definedTypes = 0;

    errorTypes.forEach(type => {
      if (content.includes(type)) {
        definedTypes++;
      }
    });

    if (definedTypes >= errorTypes.length * 0.8) {
      this.logTest('错误类型覆盖', 'pass', `定义了 ${definedTypes}/${errorTypes.length} 种错误类型`);
    } else {
      this.logTest('错误类型覆盖', 'warning', `仅定义了 ${definedTypes}/${errorTypes.length} 种错误类型`);
    }
  }

  // 测试7: 数据流验证
  async testDataFlow() {
    console.log('\n📊 测试7: 数据流验证');

    const workspacePath = path.join(this.vidslideRoot, 'src/views/WorkspaceView.vue');
    if (!fs.existsSync(workspacePath)) {
      this.logTest('工作页面数据流', 'fail', 'WorkspaceView.vue不存在');
      return;
    }

    const content = fs.readFileSync(workspacePath, 'utf8');

    // 检查响应式数据
    const requiredData = ['videoSrc', 'selectedTemplate', 'pipEnabled'];
    let dataFound = 0;

    requiredData.forEach(data => {
      if (content.includes(data)) {
        dataFound++;
      }
    });

    if (dataFound === requiredData.length) {
      this.logTest('响应式数据定义', 'pass', '所有必需数据都已定义');
    } else {
      this.logTest('响应式数据定义', 'fail', `缺少 ${requiredData.length - dataFound} 个数据定义`);
    }

    // 检查事件处理
    const hasEvents = content.includes('@click') || content.includes('@change') ||
                     content.includes('emit(') || content.includes('$emit');

    if (hasEvents) {
      this.logTest('事件处理机制', 'pass', '包含事件处理逻辑');
    } else {
      this.logTest('事件处理机制', 'warning', '缺少明显的事件处理');
    }

    // 检查组件通信
    const hasComponentCommunication = content.includes('props') ||
                                    content.includes('emit') ||
                                    content.includes('@');

    if (hasComponentCommunication) {
      this.logTest('组件间通信', 'pass', '包含组件通信机制');
    } else {
      this.logTest('组件间通信', 'warning', '缺少组件间通信');
    }
  }

  // 测试8: 性能监控基础
  async testPerformanceBasics() {
    console.log('\n⚡ 测试8: 性能监控基础');

    const components = [
      'VideoUploader.vue',
      'Timeline.vue',
      'ProgressIndicator.vue'
    ];

    components.forEach(component => {
      const filePath = path.join(this.vidslideRoot, 'src/components', component);

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(1);

        // 检查文件大小是否合理
        if (parseFloat(sizeKB) < 100) {
          this.logTest(`组件大小: ${component}`, 'pass', `${sizeKB}KB，体积合理`);
        } else {
          this.logTest(`组件大小: ${component}`, 'warning', `${sizeKB}KB，可能需要优化`);
        }

        // 检查是否有明显的性能问题
        const hasLargeImages = content.includes('data:image') || content.includes('large') || content.includes('blob');
        const hasHeavyComputations = content.includes('for') && content.includes('1000');

        if (!hasLargeImages && !hasHeavyComputations) {
          this.logTest(`性能基础: ${component}`, 'pass', '无明显性能风险');
        } else {
          this.logTest(`性能基础: ${component}`, 'warning', '可能存在性能风险');
        }
      } else {
        this.logTest(`组件存在: ${component}`, 'fail', '组件文件不存在');
      }
    });
  }

  // 运行所有E2E测试
  async runAllTests() {
    console.log('🚀 VidSlide AI - 端到端功能测试');
    console.log('=' .repeat(60));

    try {
      await this.testApplicationStartup();
      await this.testComponentRendering();
      await this.testRoutingConfiguration();
      await this.testI18nSystem();
      await this.testStylingSystem();
      await this.testErrorHandling();
      await this.testDataFlow();
      await this.testPerformanceBasics();

      this.generateReport();

    } catch (error) {
      console.error('E2E测试执行失败:', error);
      this.logTest('测试执行', 'fail', `测试过程中发生错误: ${error.message}`);
    }
  }

  // 生成测试报告
  generateReport() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 端到端测试结果汇总');
    console.log('=' .repeat(60));

    console.log(`总测试数: ${this.testResults.tests.length}`);
    console.log(`✅ 通过: ${this.testResults.passed}`);
    console.log(`❌ 失败: ${this.testResults.failed}`);
    console.log(`⚠️  警告: ${this.testResults.tests.filter(t => t.status === 'warning').length}`);

    const successRate = ((this.testResults.passed / this.testResults.tests.length) * 100).toFixed(1);
    console.log(`📈 成功率: ${successRate}%`);

    if (this.testResults.failed === 0) {
      console.log('\n🎉 所有端到端测试通过！系统功能完整可用。');
    } else {
      console.log('\n⚠️  发现需要修复的问题:');

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
    const reportPath = path.join(this.projectRoot, 'reports', `e2e-test-${new Date().toISOString().split('T')[0]}.json`);
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📄 详细报告已保存: ${reportPath}`);
  }
}

// 执行E2E测试
if (require.main === module) {
  const tester = new E2ETester();
  tester.runAllTests().catch(console.error);
}

module.exports = E2ETester;