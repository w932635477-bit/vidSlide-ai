#!/usr/bin/env node

/**
 * 快速验证脚本
 *
 * 用于快速验证多智能体蜂群系统的核心功能
 */

import ContentAnalyst from '../src/agents/executors/ContentAnalyst.js';
import SceneDesigner from '../src/agents/executors/SceneDesigner.js';
import MaterialExpert from '../src/agents/executors/MaterialExpert.js';
import VisualDesigner from '../src/agents/executors/VisualDesigner.js';
import VideoEngineer from '../src/agents/executors/VideoEngineer.js';
import QualityDirector from '../src/agents/quality/QualityDirector.js';
import ProjectManager from '../src/agents/coordinator/ProjectManager.js';

class QuickValidator {
  constructor() {
    this.results = [];
  }

  /**
   * 验证智能体状态
   */
  async validateAgentStatus() {
    console.log('🔍 验证智能体状态...\n');

    const agents = [
      { name: 'ContentAnalyst', instance: new ContentAnalyst() },
      { name: 'SceneDesigner', instance: new SceneDesigner() },
      { name: 'MaterialExpert', instance: new MaterialExpert() },
      { name: 'VisualDesigner', instance: new VisualDesigner() },
      { name: 'VideoEngineer', instance: new VideoEngineer() },
      { name: 'QualityDirector', instance: new QualityDirector() }
    ];

    for (const agent of agents) {
      try {
        const status = agent.instance.getStatus();
        const passed = status.ready === true;

        this.results.push({
          test: `${agent.name} 状态检查`,
          passed: passed,
          message: passed ? '就绪' : '未就绪'
        });

        console.log(`  ${passed ? '✅' : '❌'} ${agent.name}: ${status.ready ? '就绪' : '未就绪'}`);

      } catch (error) {
        this.results.push({
          test: `${agent.name} 状态检查`,
          passed: false,
          message: error.message
        });

        console.log(`  ❌ ${agent.name}: 错误 - ${error.message}`);
      }
    }

    console.log('');
  }

  /**
   * 验证场景拆解功能
   */
  async validateSceneDesign() {
    console.log('🔍 验证场景拆解功能...\n');

    try {
      const sceneDesigner = new SceneDesigner();

      const mockUnderstanding = {
        keywords: ['AI', '机器学习', '深度学习'],
        viewpoints: [
          {
            text: 'AI改变世界',
            timestamp: 10,
            importance: 'high'
          },
          {
            text: '机器学习很重要',
            timestamp: 20,
            importance: 'medium'
          }
        ],
        explanations: [
          {
            keyword: 'AI',
            explanation: '人工智能是计算机科学的分支',
            relatedKeywords: ['机器学习']
          }
        ]
      };

      const result = sceneDesigner.planScenes(mockUnderstanding, 60);

      const passed = result.scenes && result.scenes.length > 0;

      this.results.push({
        test: '场景拆解功能',
        passed: passed,
        message: passed ? `生成${result.scenes.length}个场景` : '失败'
      });

      console.log(`  ${passed ? '✅' : '❌'} 场景拆解: ${passed ? `生成${result.scenes.length}个场景` : '失败'}`);

      if (passed) {
        console.log(`    - 原视频占比: ${result.stats.originalRatio}%`);
        console.log(`    - 卡片场景: ${result.stats.cardScenes}个`);
        console.log(`    - 多层场景: ${result.stats.multiLayerScenes}个`);
      }

    } catch (error) {
      this.results.push({
        test: '场景拆解功能',
        passed: false,
        message: error.message
      });

      console.log(`  ❌ 场景拆解: 错误 - ${error.message}`);
    }

    console.log('');
  }

  /**
   * 验证质量检查功能
   */
  async validateQualityCheck() {
    console.log('🔍 验证质量检查功能...\n');

    try {
      const qualityDirector = new QualityDirector();

      // 测试内容理解检查
      const mockResult = {
        understanding: {
          keywords: ['AI', '机器学习', '深度学习'],
          viewpoints: [
            {
              text: 'AI改变世界',
              timestamp: 10,
              importance: 'high'
            }
          ],
          explanations: [],
          intent: '教育'
        }
      };

      const checkResult = await qualityDirector.checkUnderstanding(mockResult);

      const passed = checkResult.score !== undefined;

      this.results.push({
        test: '质量检查功能',
        passed: passed,
        message: passed ? `评分: ${checkResult.score}分` : '失败'
      });

      console.log(`  ${passed ? '✅' : '❌'} 质量检查: ${passed ? `评分${checkResult.score}分` : '失败'}`);

      if (passed) {
        console.log(`    - 通过: ${checkResult.passed ? '是' : '否'}`);
        console.log(`    - 违规项: ${checkResult.violations.length}个`);
        console.log(`    - 警告项: ${checkResult.warnings.length}个`);
      }

    } catch (error) {
      this.results.push({
        test: '质量检查功能',
        passed: false,
        message: error.message
      });

      console.log(`  ❌ 质量检查: 错误 - ${error.message}`);
    }

    console.log('');
  }

  /**
   * 验证ProjectManager
   */
  async validateProjectManager() {
    console.log('🔍 验证ProjectManager...\n');

    try {
      const pm = new ProjectManager();

      const status = pm.getStatus();

      const passed = status.ready === true && status.agents.length === 5;

      this.results.push({
        test: 'ProjectManager状态',
        passed: passed,
        message: passed ? `${status.agents.length}个智能体就绪` : '未就绪'
      });

      console.log(`  ${passed ? '✅' : '❌'} ProjectManager: ${passed ? '就绪' : '未就绪'}`);

      if (passed) {
        console.log(`    - 智能体数量: ${status.agents.length}个`);
        console.log(`    - 质量总监: ${status.qualityDirector.ready ? '就绪' : '未就绪'}`);
      }

    } catch (error) {
      this.results.push({
        test: 'ProjectManager状态',
        passed: false,
        message: error.message
      });

      console.log(`  ❌ ProjectManager: 错误 - ${error.message}`);
    }

    console.log('');
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('📊 验证报告\n');
    console.log('='.repeat(50));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const passRate = ((passedTests / totalTests) * 100).toFixed(2);

    console.log(`\n总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`通过率: ${passRate}%\n`);

    if (failedTests > 0) {
      console.log('失败的测试:');
      this.results
        .filter(r => !r.passed)
        .forEach((r, i) => {
          console.log(`  ${i + 1}. ${r.test}: ${r.message}`);
        });
      console.log('');
    }

    console.log('='.repeat(50));

    if (passRate >= 80) {
      console.log('\n✅ 系统验证通过！');
    } else {
      console.log('\n⚠️  系统验证未完全通过，请检查失败的测试。');
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      passRate: parseFloat(passRate)
    };
  }

  /**
   * 运行所有验证
   */
  async runAll() {
    console.log('🚀 多智能体蜂群系统 - 快速验证\n');
    console.log('='.repeat(50));
    console.log('');

    await this.validateAgentStatus();
    await this.validateSceneDesign();
    await this.validateQualityCheck();
    await this.validateProjectManager();

    return this.generateReport();
  }
}

// 命令行使用
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new QuickValidator();

  validator.runAll()
    .then(report => {
      process.exit(report.passRate >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('验证过程出错:', error);
      process.exit(1);
    });
}

export default QuickValidator;
