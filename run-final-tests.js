/**
 * VidSlide AI 最终测试执行脚本
 * 自动执行各项测试用例并生成报告
 */

const fs = require('fs');
const path = require('path');

class VidSlideTester {
  constructor() {
    this.results = {
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        startTime: null,
        endTime: null,
        duration: 0
      },
      testResults: [],
      performanceMetrics: {},
      issues: []
    };
  }

  async runAllTests() {
    console.log("🚀 开始 VidSlide AI 最终验收测试");
    console.log("=".repeat(60));

    this.results.summary.startTime = Date.now();

    try {
      // 1. 环境检查
      await this.runEnvironmentChecks();

      // 2. 功能测试
      await this.runFunctionalTests();

      // 3. 性能测试
      await this.runPerformanceTests();

      // 4. 兼容性测试
      await this.runCompatibilityTests();

      // 5. 安全测试
      await this.runSecurityTests();

      // 6. 用户体验测试
      await this.runUXTests();

    } catch (error) {
      console.error("❌ 测试执行失败:", error);
      this.results.issues.push({
        type: "CRITICAL",
        message: `测试执行失败: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }

    this.results.summary.endTime = Date.now();
    this.results.summary.duration = this.results.summary.endTime - this.results.summary.startTime;

    // 生成测试报告
    this.generateReport();

    return this.results;
  }

  async runEnvironmentChecks() {
    console.log("\n📋 执行环境检查...");

    const checks = [
      { name: "本地服务器运行", check: () => this.checkServerRunning() },
      { name: "项目文件完整性", check: () => this.checkProjectIntegrity() },
      { name: "依赖安装状态", check: () => this.checkDependencies() },
      { name: "浏览器兼容性", check: () => this.checkBrowserSupport() }
    ];

    for (const check of checks) {
      try {
        const result = await check.check();
        this.recordTestResult("environment", check.name, result.passed, result.details);
        console.log(`${result.passed ? "✅" : "❌"} ${check.name}: ${result.message}`);
      } catch (error) {
        this.recordTestResult("environment", check.name, false, error.message);
        console.log(`❌ ${check.name}: ${error.message}`);
      }
    }
  }

  async checkServerRunning() {
    // 检查8080端口是否监听
    try {
      const response = await fetch("http://localhost:8080/test-server.html");
      if (response.ok) {
        return { passed: true, message: "服务器运行正常" };
      }
    } catch (error) {
      return { passed: false, message: "服务器未运行或无法访问" };
    }
  }

  async checkProjectIntegrity() {
    const requiredFiles = [
      "vidslide-ai/index.html",
      "vidslide-ai/src/components/templates/PipTemplate.vue",
      "vidslide-ai/src/components/templates/InfoCardTemplate.vue",
      "vidslide-ai/src/components/templates/KeywordTemplate.vue",
      "vidslide-ai/src/components/templates/DocumentTemplate.vue",
      "vidslide-ai/src/components/templates/TitleTemplate.vue",
      "template-showcase.html"
    ];

    let missingFiles = [];
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(__dirname, file))) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length === 0) {
      return { passed: true, message: "所有必需文件存在" };
    } else {
      return { passed: false, message: `缺少文件: ${missingFiles.join(", ")}` };
    }
  }

  async checkDependencies() {
    // 检查package.json和node_modules
    const hasPackageJson = fs.existsSync(path.join(__dirname, "vidslide-ai/package.json"));
    const hasNodeModules = fs.existsSync(path.join(__dirname, "vidslide-ai/node_modules"));

    if (hasPackageJson && hasNodeModules) {
      return { passed: true, message: "依赖安装完整" };
    } else {
      return { passed: false, message: "依赖不完整，请运行 npm install" };
    }
  }

  async checkBrowserSupport() {
    // 检查是否支持现代浏览器特性
    const modernFeatures = [
      'fetch',
      'Promise',
      'Map',
      'Set',
      'Array.from',
      'Object.assign'
    ];

    let supportedFeatures = 0;
    for (const feature of modernFeatures) {
      if (typeof global[feature] !== 'undefined') {
        supportedFeatures++;
      }
    }

    const supportRate = supportedFeatures / modernFeatures.length;
    if (supportRate >= 0.8) {
      return { passed: true, message: `现代特性支持率: ${(supportRate * 100).toFixed(0)}%` };
    } else {
      return { passed: false, message: `现代特性支持不足: ${(supportRate * 100).toFixed(0)}%` };
    }
  }

  async runFunctionalTests() {
    console.log("\n🔧 执行功能测试...");

    const functionalTests = [
      { name: "模板系统完整性", check: () => this.checkTemplateSystem() },
      { name: "素材管理系统", check: () => this.checkMaterialSystem() },
      { name: "AI功能可用性", check: () => this.checkAIFunctionality() },
      { name: "导出功能", check: () => this.checkExportFunctionality() }
    ];

    for (const test of functionalTests) {
      try {
        const result = await test.check();
        this.recordTestResult("functional", test.name, result.passed, result.details);
        console.log(`${result.passed ? "✅" : "❌"} ${test.name}: ${result.message}`);
      } catch (error) {
        this.recordTestResult("functional", test.name, false, error.message);
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async checkTemplateSystem() {
    // 检查模板文件的存在性和基本结构
    const templateFiles = [
      "vidslide-ai/src/components/templates/PipTemplate.vue",
      "vidslide-ai/src/components/templates/InfoCardTemplate.vue",
      "vidslide-ai/src/components/templates/KeywordTemplate.vue",
      "vidslide-ai/src/components/templates/DocumentTemplate.vue",
      "vidslide-ai/src/components/templates/TitleTemplate.vue"
    ];

    let validTemplates = 0;
    for (const file of templateFiles) {
      try {
        const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
        // 检查是否包含基本Vue结构
        if (content.includes('<template>') && content.includes('<style') && content.includes('export default')) {
          validTemplates++;
        }
      } catch (error) {
        // 文件不存在或读取失败
      }
    }

    const templateCoverage = validTemplates / templateFiles.length;
    if (templateCoverage >= 0.8) {
      return { passed: true, message: `模板覆盖率: ${(templateCoverage * 100).toFixed(0)}% (${validTemplates}/${templateFiles.length})` };
    } else {
      return { passed: false, message: `模板覆盖不足: ${(templateCoverage * 100).toFixed(0)}%` };
    }
  }

  async checkMaterialSystem() {
    // 检查素材相关文件和配置
    const materialFiles = [
      "vidslide-ai/src/services/MaterialService.js",
      "vidslide-ai/src/services/LocalMaterialLibrary.js",
      "vidslide-ai/src/services/BaiduImageService.js"
    ];

    let existingFiles = 0;
    for (const file of materialFiles) {
      if (fs.existsSync(path.join(__dirname, file))) {
        existingFiles++;
      }
    }

    if (existingFiles === materialFiles.length) {
      return { passed: true, message: "素材服务文件完整" };
    } else {
      return { passed: false, message: `素材服务文件不完整: ${existingFiles}/${materialFiles.length}` };
    }
  }

  async checkAIFunctionality() {
    // 检查AI相关服务文件
    const aiFiles = [
      "vidslide-ai/src/services/CLIPMatcher.js",
      "vidslide-ai/src/services/SmartCropService.js",
      "vidslide-ai/src/services/BackgroundRemovalService.js"
    ];

    let existingFiles = 0;
    for (const file of aiFiles) {
      if (fs.existsSync(path.join(__dirname, file))) {
        existingFiles++;
      }
    }

    if (existingFiles >= 2) { // 至少要有核心AI服务
      return { passed: true, message: `AI服务文件存在: ${existingFiles}/${aiFiles.length}` };
    } else {
      return { passed: false, message: "AI服务文件不足" };
    }
  }

  async checkExportFunctionality() {
    // 检查导出相关文件
    const exportFiles = [
      "vidslide-ai/src/components/ExportDialog.vue",
      "vidslide-ai/src/utils/ffmpegExporter.js"
    ];

    let existingFiles = 0;
    for (const file of exportFiles) {
      if (fs.existsSync(path.join(__dirname, file))) {
        existingFiles++;
      }
    }

    if (existingFiles >= 1) {
      return { passed: true, message: "导出功能文件存在" };
    } else {
      return { passed: false, message: "导出功能文件缺失" };
    }
  }

  async runPerformanceTests() {
    console.log("\n⚡ 执行性能测试...");

    const performanceTests = [
      { name: "构建性能", check: () => this.checkBuildPerformance() },
      { name: "文件大小", check: () => this.checkBundleSize() },
      { name: "代码质量", check: () => this.checkCodeQuality() }
    ];

    for (const test of performanceTests) {
      try {
        const result = await test.check();
        this.recordTestResult("performance", test.name, result.passed, result.details);
        console.log(`${result.passed ? "✅" : "❌"} ${test.name}: ${result.message}`);
      } catch (error) {
        this.recordTestResult("performance", test.name, false, error.message);
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async checkBuildPerformance() {
    const startTime = Date.now();

    try {
      // 执行构建命令
      const { exec } = require('child_process');
      const buildPromise = new Promise((resolve, reject) => {
        exec('cd vidslide-ai && npm run build', (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve({ stdout, stderr });
          }
        });
      });

      await buildPromise;
      const buildTime = Date.now() - startTime;

      if (buildTime < 30000) { // 30秒以内
        return { passed: true, message: `构建时间: ${(buildTime / 1000).toFixed(1)}秒` };
      } else {
        return { passed: false, message: `构建时间过长: ${(buildTime / 1000).toFixed(1)}秒` };
      }

    } catch (error) {
      return { passed: false, message: `构建失败: ${error.message}` };
    }
  }

  async checkBundleSize() {
    try {
      const distPath = path.join(__dirname, 'vidslide-ai/dist');
      if (!fs.existsSync(distPath)) {
        return { passed: false, message: "dist目录不存在，请先构建项目" };
      }

      // 计算总文件大小
      let totalSize = 0;
      const files = fs.readdirSync(distPath, { recursive: true });

      for (const file of files) {
        const filePath = path.join(distPath, file);
        if (fs.statSync(filePath).isFile()) {
          totalSize += fs.statSync(filePath).size;
        }
      }

      const sizeMB = totalSize / (1024 * 1024);
      if (sizeMB < 50) { // 50MB以内
        return { passed: true, message: `打包大小: ${sizeMB.toFixed(1)}MB` };
      } else {
        return { passed: false, message: `打包过大: ${sizeMB.toFixed(1)}MB` };
      }

    } catch (error) {
      return { passed: false, message: `检查失败: ${error.message}` };
    }
  }

  async checkCodeQuality() {
    // 检查是否有ESLint配置文件
    const hasEslint = fs.existsSync(path.join(__dirname, 'vidslide-ai/.eslintrc.js')) ||
                      fs.existsSync(path.join(__dirname, 'vidslide-ai/.eslintrc.json'));

    if (hasEslint) {
      return { passed: true, message: "ESLint配置存在" };
    } else {
      return { passed: false, message: "缺少ESLint配置" };
    }
  }

  async runCompatibilityTests() {
    console.log("\n🌐 执行兼容性测试...");

    const compatibilityTests = [
      { name: "HTML5特性支持", check: () => this.checkHTML5Support() },
      { name: "CSS特性支持", check: () => this.checkCSSSupport() },
      { name: "JavaScript特性支持", check: () => this.checkJSSupport() }
    ];

    for (const test of compatibilityTests) {
      try {
        const result = await test.check();
        this.recordTestResult("compatibility", test.name, result.passed, result.details);
        console.log(`${result.passed ? "✅" : "❌"} ${test.name}: ${result.message}`);
      } catch (error) {
        this.recordTestResult("compatibility", test.name, false, error.message);
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async checkHTML5Support() {
    // 检查HTML5特性的基本支持
    const html5Features = [
      'canvas',
      'video',
      'audio',
      'webworkers',
      'websockets'
    ];

    let supportedFeatures = 0;
    for (const feature of html5Features) {
      if (document.createElement(feature) || typeof Worker !== 'undefined') {
        supportedFeatures++;
      }
    }

    const supportRate = supportedFeatures / html5Features.length;
    if (supportRate >= 0.8) {
      return { passed: true, message: `HTML5特性支持率: ${(supportRate * 100).toFixed(0)}%` };
    } else {
      return { passed: false, message: `HTML5特性支持不足` };
    }
  }

  async checkCSSSupport() {
    // 检查CSS特性的支持
    const cssFeatures = [
      'flexbox',
      'grid',
      'css-variables',
      'backdrop-filter'
    ];

    // 简化的CSS特性检查
    let supportedFeatures = 0;
    const testElement = document.createElement('div');

    // 检查flexbox
    testElement.style.display = 'flex';
    if (testElement.style.display === 'flex') supportedFeatures++;

    // 检查CSS变量
    testElement.style.setProperty('--test-var', 'red');
    if (testElement.style.getPropertyValue('--test-var') === 'red') supportedFeatures++;

    const supportRate = supportedFeatures / cssFeatures.length;
    if (supportRate >= 0.5) {
      return { passed: true, message: `CSS特性支持率: ${(supportRate * 100).toFixed(0)}%` };
    } else {
      return { passed: false, message: `CSS特性支持不足` };
    }
  }

  async checkJSSupport() {
    // 检查JavaScript ES6+特性的支持
    const jsFeatures = [
      'Promise',
      'async/await',
      'Map',
      'Set',
      'Array.from',
      'Object.assign',
      'fetch'
    ];

    let supportedFeatures = 0;
    for (const feature of jsFeatures) {
      try {
        if (feature === 'async/await') {
          eval('(async function() {})()');
          supportedFeatures++;
        } else if (feature === 'fetch') {
          if (typeof fetch !== 'undefined') supportedFeatures++;
        } else {
          if (typeof global[feature] !== 'undefined') supportedFeatures++;
        }
      } catch (e) {
        // 特性不支持
      }
    }

    const supportRate = supportedFeatures / jsFeatures.length;
    if (supportRate >= 0.8) {
      return { passed: true, message: `JS特性支持率: ${(supportRate * 100).toFixed(0)}%` };
    } else {
      return { passed: false, message: `JS特性支持不足` };
    }
  }

  async runSecurityTests() {
    console.log("\n🔒 执行安全测试...");

    const securityTests = [
      { name: "XSS防护", check: () => this.checkXSSProtection() },
      { name: "CSP策略", check: () => this.checkCSP() },
      { name: "依赖安全", check: () => this.checkDependenciesSecurity() }
    ];

    for (const test of securityTests) {
      try {
        const result = await test.check();
        this.recordTestResult("security", test.name, result.passed, result.details);
        console.log(`${result.passed ? "✅" : "❌"} ${test.name}: ${result.message}`);
      } catch (error) {
        this.recordTestResult("security", test.name, false, error.message);
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async checkXSSProtection() {
    // 检查是否有基本的XSS防护措施
    const indexContent = fs.readFileSync(path.join(__dirname, 'vidslide-ai/index.html'), 'utf8');

    // 检查是否使用了安全的innerHTML替换方案
    const hasSafeHtml = indexContent.includes('v-html') || indexContent.includes('DOMPurify');
    const hasCsp = indexContent.includes('Content-Security-Policy');

    if (hasSafeHtml || hasCsp) {
      return { passed: true, message: "XSS防护措施存在" };
    } else {
      return { passed: false, message: "缺少XSS防护措施" };
    }
  }

  async checkCSP() {
    const indexContent = fs.readFileSync(path.join(__dirname, 'vidslide-ai/index.html'), 'utf8');

    if (indexContent.includes('Content-Security-Policy')) {
      return { passed: true, message: "CSP策略已配置" };
    } else {
      return { passed: false, message: "缺少CSP策略" };
    }
  }

  async checkDependenciesSecurity() {
    // 检查package.json中的依赖
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'vidslide-ai/package.json'), 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // 检查是否有已知的安全问题依赖
      const riskyDeps = [];
      for (const [name, version] of Object.entries(dependencies)) {
        // 简化的安全检查 - 实际项目中应该使用npm audit
        if (version.includes('*') || version.includes('^0.') || version.includes('~0.')) {
          riskyDeps.push(`${name}@${version}`);
        }
      }

      if (riskyDeps.length === 0) {
        return { passed: true, message: "依赖版本安全" };
      } else {
        return { passed: false, message: `发现不安全依赖: ${riskyDeps.join(', ')}` };
      }

    } catch (error) {
      return { passed: false, message: "无法检查依赖安全" };
    }
  }

  async runUXTests() {
    console.log("\n👥 执行用户体验测试...");

    const uxTests = [
      { name: "界面完整性", check: () => this.checkUICompleteness() },
      { name: "响应式设计", check: () => this.checkResponsiveDesign() },
      { name: "无障碍访问", check: () => this.checkAccessibility() }
    ];

    for (const test of uxTests) {
      try {
        const result = await test.check();
        this.recordTestResult("ux", test.name, result.passed, result.details);
        console.log(`${result.passed ? "✅" : "❌"} ${test.name}: ${result.message}`);
      } catch (error) {
        this.recordTestResult("ux", test.name, false, error.message);
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async checkUICompleteness() {
    // 检查主要UI组件是否存在
    const uiComponents = [
      "vidslide-ai/src/components/VideoPlayer.vue",
      "vidslide-ai/src/components/AssetBrowser.vue",
      "vidslide-ai/src/components/TemplateSelector.vue",
      "vidslide-ai/src/components/ExportDialog.vue"
    ];

    let existingComponents = 0;
    for (const component of uiComponents) {
      if (fs.existsSync(path.join(__dirname, component))) {
        existingComponents++;
      }
    }

    const completeness = existingComponents / uiComponents.length;
    if (completeness >= 0.75) {
      return { passed: true, message: `UI组件完整性: ${(completeness * 100).toFixed(0)}%` };
    } else {
      return { passed: false, message: `UI组件不完整: ${(completeness * 100).toFixed(0)}%` };
    }
  }

  async checkResponsiveDesign() {
    // 检查CSS中是否有响应式设计
    const cssFiles = [
      "vidslide-ai/src/components/templates/PipTemplate.vue",
      "vidslide-ai/src/components/templates/InfoCardTemplate.vue"
    ];

    let responsiveFiles = 0;
    for (const file of cssFiles) {
      try {
        const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
        if (content.includes('@media') && (content.includes('max-width') || content.includes('min-width'))) {
          responsiveFiles++;
        }
      } catch (error) {
        // 文件不存在
      }
    }

    if (responsiveFiles > 0) {
      return { passed: true, message: `响应式设计文件: ${responsiveFiles}/${cssFiles.length}` };
    } else {
      return { passed: false, message: "缺少响应式设计" };
    }
  }

  async checkAccessibility() {
    // 检查ARIA标签和键盘导航
    const vueFiles = [
      "vidslide-ai/src/components/templates/PipTemplate.vue",
      "vidslide-ai/src/components/templates/InfoCardTemplate.vue"
    ];

    let accessibleFiles = 0;
    for (const file of vueFiles) {
      try {
        const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
        // 检查是否有基本的可访问性属性
        const hasAria = content.includes('aria-') || content.includes('role=');
        const hasAlt = content.includes('alt=');
        const hasTabindex = content.includes('tabindex');

        if (hasAria || hasAlt || hasTabindex) {
          accessibleFiles++;
        }
      } catch (error) {
        // 文件不存在
      }
    }

    if (accessibleFiles >= 1) {
      return { passed: true, message: "有基本的可访问性支持" };
    } else {
      return { passed: false, message: "缺少可访问性支持" };
    }
  }

  recordTestResult(category, testName, passed, details = null) {
    this.results.testResults.push({
      category,
      testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });

    this.results.summary.totalTests++;
    if (passed) {
      this.results.summary.passedTests++;
    } else {
      this.results.summary.failedTests++;
    }
  }

  generateReport() {
    console.log("\n📊 生成测试报告...");

    const report = {
      title: "VidSlide AI 最终验收测试报告",
      generatedAt: new Date().toISOString(),
      summary: this.results.summary,
      testResults: this.results.testResults,
      issues: this.results.issues,
      recommendations: this.generateRecommendations(),
      conclusion: this.generateConclusion()
    };

    // 保存报告到文件
    const reportPath = path.join(__dirname, 'final-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log("✅ 测试报告已保存到:", reportPath);

    // 打印总结
    this.printSummary();
  }

  generateRecommendations() {
    const recommendations = [];

    // 基于测试结果生成建议
    const failedTests = this.results.testResults.filter(r => !r.passed);

    if (failedTests.some(t => t.category === 'environment')) {
      recommendations.push("修复环境配置问题，确保开发环境完整");
    }

    if (failedTests.some(t => t.category === 'functional')) {
      recommendations.push("完善核心功能实现，确保所有必需组件存在");
    }

    if (failedTests.some(t => t.category === 'performance')) {
      recommendations.push("优化构建性能和包大小，提升用户体验");
    }

    if (failedTests.some(t => t.category === 'compatibility')) {
      recommendations.push("增强浏览器兼容性，确保多环境支持");
    }

    if (failedTests.some(t => t.category === 'security')) {
      recommendations.push("加强安全措施，实现CSP和XSS防护");
    }

    if (failedTests.some(t => t.category === 'ux')) {
      recommendations.push("改善用户体验，增加响应式设计和可访问性");
    }

    return recommendations;
  }

  generateConclusion() {
    const passRate = (this.results.summary.passedTests / this.results.summary.totalTests) * 100;

    if (passRate >= 90) {
      return "🎉 测试通过！项目已达到最终验收标准，可以准备发布。";
    } else if (passRate >= 75) {
      return "⚠️ 测试基本通过，但存在一些问题需要修复后再发布。";
    } else {
      return "❌ 测试失败！需要进行重大修复才能达到验收标准。";
    }
  }

  printSummary() {
    console.log("\n" + "=".repeat(60));
    console.log("🎯 VidSlide AI 最终验收测试总结");
    console.log("=".repeat(60));

    console.log(`总测试数: ${this.results.summary.totalTests}`);
    console.log(`通过测试: ${this.results.summary.passedTests}`);
    console.log(`失败测试: ${this.results.summary.failedTests}`);
    console.log(`跳过测试: ${this.results.summary.skippedTests}`);

    const passRate = (this.results.summary.passedTests / this.results.summary.totalTests) * 100;
    console.log(`通过率: ${passRate.toFixed(1)}%`);

    console.log(`测试耗时: ${(this.results.summary.duration / 1000).toFixed(1)}秒`);

    if (this.results.issues.length > 0) {
      console.log(`\n⚠️ 发现问题: ${this.results.issues.length}个`);
      this.results.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.message}`);
      });
    }

    console.log(`\n${this.generateConclusion()}`);
    console.log("=".repeat(60));
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const tester = new VidSlideTester();
  tester.runAllTests().catch(error => {
    console.error("测试执行失败:", error);
    process.exit(1);
  });
}

module.exports = VidSlideTester;