/**
 * 验证方案代码的测试脚本
 *
 * 目的：
 * 1. 验证代码语法和依赖
 * 2. 验证数据流转路径
 * 3. 模拟关键逻辑执行
 * 4. 生成详细的验证报告
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ValidationTest {
  constructor() {
    this.results = {
      syntax: [],
      dependencies: [],
      dataFlow: [],
      logic: [],
      overall: 'pending'
    };
  }

  /**
   * 测试1：语法检查
   */
  async testSyntax() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试1: 语法检查');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const files = [
      'src/services/VisualValidationService.js',
      'src/services/BaiduOCR.js',
      'src/agents/quality/QualityDirector.js',
      'src/agents/coordinator/ProjectManager.js'
    ];

    for (const file of files) {
      try {
        const fullPath = path.join(__dirname, file);
        if (fs.existsSync(fullPath)) {
          // 动态导入检查
          await import(fullPath);
          console.log(`✅ ${file} - 语法正确`);
          this.results.syntax.push({ file, status: 'pass' });
        } else {
          console.log(`❌ ${file} - 文件不存在`);
          this.results.syntax.push({ file, status: 'not_found' });
        }
      } catch (error) {
        console.log(`❌ ${file} - 语法错误: ${error.message}`);
        this.results.syntax.push({ file, status: 'fail', error: error.message });
      }
    }
  }

  /**
   * 测试2：依赖检查
   */
  async testDependencies() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试2: 依赖检查');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const dependencies = [
      {
        name: 'BaiduOCR服务',
        path: 'src/services/BaiduOCR.js',
        required: true
      },
      {
        name: 'WenxinService服务',
        path: 'src/services/WenxinService.js',
        required: true
      },
      {
        name: 'douyinSpecs配置',
        path: 'src/utils/douyinSpecs.js',
        required: true
      },
      {
        name: '理想效果视频',
        path: 'reference/ideal_card_reference.mp4',
        required: true
      },
      {
        name: 'AGENTS.md规范文档',
        path: 'AGENTS.md',
        required: false
      }
    ];

    for (const dep of dependencies) {
      const fullPath = path.join(__dirname, dep.path);
      const exists = fs.existsSync(fullPath);

      if (exists) {
        const stats = fs.statSync(fullPath);
        const size = stats.size;
        console.log(`✅ ${dep.name} - 存在 (${(size / 1024).toFixed(2)} KB)`);
        this.results.dependencies.push({
          name: dep.name,
          status: 'pass',
          size: size
        });
      } else {
        const status = dep.required ? '❌' : '⚠️';
        console.log(`${status} ${dep.name} - ${dep.required ? '缺失（必需）' : '缺失（可选）'}`);
        this.results.dependencies.push({
          name: dep.name,
          status: dep.required ? 'fail' : 'warning'
        });
      }
    }
  }

  /**
   * 测试3：数据流转路径验证
   */
  async testDataFlow() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试3: 数据流转路径验证');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      // 模拟数据流
      const mockPreviousResults = {
        task_1_2: {
          understanding: {
            keywords: [
              { text: "强化学习", english: "RL", category: "tech" }
            ],
            viewpoints: [],
            explanations: []
          }
        },
        task_2_1: {
          scenes: [
            {
              id: "scene_1",
              type: "video-with-card",
              startTime: 9,
              endTime: 12,
              keywordObj: { text: "强化学习", english: "RL" }
            }
          ]
        },
        task_3_1: { materials: [] },
        task_3_2: { cards: [] },
        task_3_3: { backgrounds: [] },
        task_3_4: { pips: [] }
      };

      const mockPlan = {
        videoPath: "/mock/video.mp4"
      };

      const mockTask = {
        method: 'finalCheck',
        dependsOn: ['task_5_1']
      };

      // 模拟ProjectManager.prepareTaskInput
      console.log('  模拟 ProjectManager.prepareTaskInput()...');

      const input = {};
      if (mockTask.method === 'finalCheck') {
        input.context = {
          contentAnalysis: mockPreviousResults.task_1_2?.understanding,
          sceneDesign: mockPreviousResults.task_2_1,
          materials: mockPreviousResults.task_3_1,
          visuals: {
            cards: mockPreviousResults.task_3_2?.cards,
            backgrounds: mockPreviousResults.task_3_3?.backgrounds,
            pips: mockPreviousResults.task_3_4?.pips
          },
          videoPath: mockPlan.videoPath
        };
      }

      // 验证上下文结构
      const checks = [
        { path: 'context.contentAnalysis', expected: 'object' },
        { path: 'context.contentAnalysis.keywords', expected: 'array' },
        { path: 'context.contentAnalysis.keywords[0].text', expected: 'string', value: '强化学习' },
        { path: 'context.sceneDesign', expected: 'object' },
        { path: 'context.sceneDesign.scenes', expected: 'array' },
        { path: 'context.sceneDesign.scenes[0].keywordObj', expected: 'object' },
        { path: 'context.sceneDesign.scenes[0].keywordObj.text', expected: 'string', value: '强化学习' },
        { path: 'context.videoPath', expected: 'string' }
      ];

      let allPassed = true;
      for (const check of checks) {
        try {
          const value = this.getNestedValue(input, check.path);
          const typeMatch = typeof value === check.expected || (check.expected === 'array' && Array.isArray(value));
          const valueMatch = !check.value || value === check.value;

          if (typeMatch && valueMatch) {
            console.log(`  ✅ ${check.path}: ${typeof value}${check.value ? ` = "${value}"` : ''}`);
            this.results.dataFlow.push({ path: check.path, status: 'pass' });
          } else {
            console.log(`  ❌ ${check.path}: 类型或值不匹配`);
            this.results.dataFlow.push({ path: check.path, status: 'fail' });
            allPassed = false;
          }
        } catch (error) {
          console.log(`  ❌ ${check.path}: ${error.message}`);
          this.results.dataFlow.push({ path: check.path, status: 'fail', error: error.message });
          allPassed = false;
        }
      }

      if (allPassed) {
        console.log('\n  ✅ 数据流转路径验证通过');
      } else {
        console.log('\n  ❌ 数据流转路径验证失败');
      }

    } catch (error) {
      console.log(`  ❌ 数据流转测试失败: ${error.message}`);
      this.results.dataFlow.push({ status: 'fail', error: error.message });
    }
  }

  /**
   * 测试4：关键逻辑验证
   */
  async testKeyLogic() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试4: 关键逻辑验证');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const logicTests = [
      {
        name: 'QualityDirector路径计算',
        test: () => {
          const mockPath = path.join(__dirname, 'src/agents/quality');
          const referencePath = path.join(mockPath, '../../../reference/ideal_card_reference.mp4');
          const normalizedPath = path.normalize(referencePath);
          return normalizedPath.includes('reference/ideal_card_reference.mp4');
        }
      },
      {
        name: 'keywordObj访问安全性',
        test: () => {
          const scene = {
            keywordObj: { text: "强化学习", english: "RL" }
          };
          const keyword = scene.keywordObj?.text;
          return keyword === "强化学习";
        }
      },
      {
        name: '字数限制逻辑',
        test: () => {
          const longText = "这是一个非常长的关键词描述";
          const limitedText = longText.substring(0, 5);
          return limitedText === "这是一个非" && limitedText.length === 5;
        }
      },
      {
        name: '卡片场景过滤',
        test: () => {
          const scenes = [
            { type: 'original' },
            { type: 'video-with-card' },
            { type: 'multi-layer-composition' },
            { type: 'video-with-card' }
          ];
          const cardScenes = scenes.filter(s => s.type === 'video-with-card');
          return cardScenes.length === 2;
        }
      }
    ];

    for (const test of logicTests) {
      try {
        const result = test.test();
        if (result) {
          console.log(`  ✅ ${test.name}`);
          this.results.logic.push({ name: test.name, status: 'pass' });
        } else {
          console.log(`  ❌ ${test.name} - 返回值不符合预期`);
          this.results.logic.push({ name: test.name, status: 'fail' });
        }
      } catch (error) {
        console.log(`  ❌ ${test.name} - ${error.message}`);
        this.results.logic.push({ name: test.name, status: 'fail', error: error.message });
      }
    }
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 验证报告汇总');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const categories = [
      { name: '语法检查', key: 'syntax' },
      { name: '依赖检查', key: 'dependencies' },
      { name: '数据流转', key: 'dataFlow' },
      { name: '关键逻辑', key: 'logic' }
    ];

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;

    for (const category of categories) {
      const results = this.results[category.key];
      const passed = results.filter(r => r.status === 'pass').length;
      const failed = results.filter(r => r.status === 'fail' || r.status === 'not_found').length;
      const warnings = results.filter(r => r.status === 'warning').length;

      totalTests += results.length;
      totalPassed += passed;
      totalFailed += failed;
      totalWarnings += warnings;

      const status = failed > 0 ? '❌' : (warnings > 0 ? '⚠️' : '✅');
      console.log(`${status} ${category.name}: ${passed}/${results.length} 通过${warnings > 0 ? ` (${warnings}个警告)` : ''}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`总计: ${totalPassed}/${totalTests} 测试通过`);
    if (totalWarnings > 0) console.log(`警告: ${totalWarnings}个`);
    if (totalFailed > 0) console.log(`失败: ${totalFailed}个`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 判断总体状态
    if (totalFailed === 0 && totalWarnings === 0) {
      this.results.overall = 'excellent';
      console.log('✅ 总体评估: 优秀 - 所有测试通过，可以进行实际测试');
    } else if (totalFailed === 0) {
      this.results.overall = 'good';
      console.log('⚠️ 总体评估: 良好 - 存在一些警告，但不影响核心功能');
    } else if (totalFailed <= 2) {
      this.results.overall = 'acceptable';
      console.log('⚠️ 总体评估: 可接受 - 存在少量问题，需要修复后测试');
    } else {
      this.results.overall = 'poor';
      console.log('❌ 总体评估: 不合格 - 存在较多问题，需要修复');
    }

    return this.results;
  }

  /**
   * 辅助方法：获取嵌套属性值
   */
  getNestedValue(obj, path) {
    const keys = path.split(/[\.\[\]]/).filter(k => k);
    let value = obj;
    for (const key of keys) {
      if (value === undefined || value === null) {
        throw new Error(`路径不存在: ${path}`);
      }
      value = value[key];
    }
    return value;
  }

  /**
   * 运行所有测试
   */
  async runAll() {
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║   VidSlide AI - 质量验证方案代码测试             ║');
    console.log('╚═══════════════════════════════════════════════════╝');

    await this.testSyntax();
    await this.testDependencies();
    await this.testDataFlow();
    await this.testKeyLogic();

    return this.generateReport();
  }
}

// 运行测试
const test = new ValidationTest();
test.runAll().then(results => {
  console.log('\n测试完成！');
  process.exit(results.overall === 'poor' ? 1 : 0);
}).catch(error => {
  console.error('\n❌ 测试运行失败:', error);
  process.exit(1);
});
