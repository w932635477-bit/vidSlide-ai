/**
 * 测试脚本：验证原视频+卡片效果
 *
 * 目标：实现理想效果图中的"强化学习"和"涌现"概念卡片
 *
 * 测试流程：
 * 1. ContentAnalyst - 内容理解
 * 2. SceneDesigner - 场景设计（只测试video-with-card类型）
 * 3. VisualDesigner - 卡片设计
 * 4. VideoEngineer - 视频合成
 * 5. QualityDirector - 质量检查
 */

import ProjectManager from './src/agents/core/ProjectManager.js';
import ContentAnalyst from './src/agents/executors/ContentAnalyst.js';
import SceneDesigner from './src/agents/executors/SceneDesigner.js';
import VisualDesigner from './src/agents/executors/VisualDesigner.js';
import VideoEngineer from './src/agents/executors/VideoEngineer.js';
import QualityDirector from './src/agents/quality/QualityDirector.js';
import Logger from './src/core/Logger.js';
import path from 'path';
import fs from 'fs';

// 测试配置
const TEST_CONFIG = {
  // 测试视频路径（需要准备一个测试视频）
  testVideoPath: './test-data/test-video.mp4',

  // 输出目录
  outputDir: './test-output',

  // 模拟数据（如果没有真实视频）
  mockMode: true,

  // 模拟的文案内容
  mockTranscript: `
    当然了整个推理模型的过程，
    AI的深度思考，究竟是怎么实现的？
    其实主要依赖两个核心概念：
    第一个是强化学习，通过不断试错来优化决策。
    第二个是涌现，当系统足够复杂时会产生意想不到的能力。
  `,

  // 期望的卡片内容
  expectedCards: [
    {
      text: '强化学习',
      subtitle: 'Reinforcement Learning',
      style: 'blue'
    },
    {
      text: '涌现',
      subtitle: 'Emergence',
      style: 'yellow'
    }
  ]
};

class VideoWithCardsTest {
  constructor() {
    this.logger = new Logger({ level: 'debug' });
    this.results = {
      phase1: null,
      phase2: null,
      phase3: null,
      phase4: null,
      phase5: null
    };
  }

  /**
   * 运行完整测试
   */
  async runFullTest() {
    console.log('\n' + '='.repeat(60));
    console.log('🎬 开始测试：原视频+卡片效果');
    console.log('='.repeat(60));

    try {
      // 准备测试环境
      await this.prepareTestEnvironment();

      // 阶段1: 测试内容理解
      console.log('\n📋 阶段1: 测试 ContentAnalyst');
      await this.testContentAnalyst();

      // 阶段2: 测试场景设计
      console.log('\n🎨 阶段2: 测试 SceneDesigner');
      await this.testSceneDesigner();

      // 阶段3: 测试卡片设计
      console.log('\n🎴 阶段3: 测试 VisualDesigner');
      await this.testVisualDesigner();

      // 阶段4: 测试视频合成
      console.log('\n🎥 阶段4: 测试 VideoEngineer');
      await this.testVideoEngineer();

      // 阶段5: 测试质量检查
      console.log('\n✅ 阶段5: 测试 QualityDirector');
      await this.testQualityDirector();

      // 生成测试报告
      this.generateTestReport();

      console.log('\n' + '='.repeat(60));
      console.log('✅ 测试完成！');
      console.log('='.repeat(60));

    } catch (error) {
      console.error('\n❌ 测试失败:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }

  /**
   * 准备测试环境
   */
  async prepareTestEnvironment() {
    console.log('\n📁 准备测试环境...');

    // 创建输出目录
    if (!fs.existsSync(TEST_CONFIG.outputDir)) {
      fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
    }

    // 创建子目录
    const dirs = ['cards', 'scenes', 'videos', 'reports'];
    for (const dir of dirs) {
      const dirPath = path.join(TEST_CONFIG.outputDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }

    console.log('  ✓ 输出目录已创建');

    // 检查测试视频
    if (!TEST_CONFIG.mockMode && !fs.existsSync(TEST_CONFIG.testVideoPath)) {
      throw new Error('测试视频不存在: ' + TEST_CONFIG.testVideoPath);
    }

    if (TEST_CONFIG.mockMode) {
      console.log('  ⚠️  使用模拟模式（无需真实视频）');
    } else {
      console.log('  ✓ 测试视频: ' + TEST_CONFIG.testVideoPath);
    }
  }

  /**
   * 测试 ContentAnalyst
   */
  async testContentAnalyst() {
    const analyst = new ContentAnalyst({
      logger: this.logger
    });

    console.log('  → 开始内容分析...');

    if (TEST_CONFIG.mockMode) {
      // 模拟模式：直接构造理解文档
      this.results.phase1 = {
        transcript: TEST_CONFIG.mockTranscript,
        keyPoints: [
          'AI的深度思考依赖强化学习和涌现',
          '强化学习通过试错优化决策',
          '涌现是系统复杂度带来的能力'
        ],
        keywords: ['强化学习', '涌现', 'AI', '深度思考'],
        viewpoints: [
          {
            text: 'AI的深度思考依赖两个核心概念',
            time: { start: 0, end: 5 },
            type: 'main'
          }
        ],
        explanations: [
          {
            text: '强化学习通过不断试错来优化决策',
            keyword: '强化学习',
            time: { start: 5, end: 10 }
          },
          {
            text: '涌现是当系统足够复杂时产生的意想不到的能力',
            keyword: '涌现',
            time: { start: 10, end: 15 }
          }
        ]
      };

      console.log('  ✓ 内容分析完成（模拟）');
    } else {
      // 真实模式：调用实际的智能体
      const result = await analyst.analyze(TEST_CONFIG.testVideoPath);
      this.results.phase1 = result;
      console.log('  ✓ 内容分析完成');
    }

    // 验证结果
    this.validatePhase1();

    // 保存结果
    this.saveResult('phase1_understanding.json', this.results.phase1);
  }

  /**
   * 验证阶段1结果
   */
  validatePhase1() {
    const result = this.results.phase1;

    console.log('\n  📊 验证结果:');
    console.log('    - 文案长度: ' + result.transcript.length + ' 字符');
    console.log('    - 关键词数量: ' + result.keywords.length);
    console.log('    - 观点数量: ' + result.viewpoints.length);
    console.log('    - 解释数量: ' + result.explanations.length);

    // 检查是否包含期望的关键词
    const expectedKeywords = ['强化学习', '涌现'];
    const foundKeywords = expectedKeywords.filter(kw =>
      result.keywords.includes(kw)
    );

    console.log('    - 期望关键词: ' + expectedKeywords.join(', '));
    console.log('    - 找到关键词: ' + foundKeywords.join(', '));

    if (foundKeywords.length < expectedKeywords.length) {
      console.warn('    ⚠️  警告: 部分关键词未找到');
    } else {
      console.log('    ✓ 所有关键词已找到');
    }
  }

  /**
   * 测试 SceneDesigner
   */
  async testSceneDesigner() {
    const designer = new SceneDesigner({
      logger: this.logger
    });

    console.log('  → 开始场景设计...');

    const input = {
      understanding: this.results.phase1,
      videoDuration: 15
    };

    if (TEST_CONFIG.mockMode) {
      // 模拟模式：构造场景方案
      this.results.phase2 = {
        scenes: [
          {
            id: 'scene_1',
            type: 'video-with-card',
            startTime: 5,
            endTime: 10,
            cardText: '强化学习',
            cardSubtitle: 'Reinforcement Learning',
            cardStyle: 'blue',
            cardPosition: { x: 50, y: 1000 },
            cardSize: { width: 450, height: 300 }
          },
          {
            id: 'scene_2',
            type: 'video-with-card',
            startTime: 10,
            endTime: 15,
            cardText: '涌现',
            cardSubtitle: 'Emergence',
            cardStyle: 'yellow',
            cardPosition: { x: 580, y: 1000 },
            cardSize: { width: 450, height: 300 }
          }
        ],
        timeline: {
          totalDuration: 15,
          sceneCount: 2
        }
      };

      console.log('  ✓ 场景设计完成（模拟）');
    } else {
      const result = await designer.decomposeScenes(input);
      this.results.phase2 = result;
      console.log('  ✓ 场景设计完成');
    }

    // 验证结果
    this.validatePhase2();

    // 保存结果
    this.saveResult('phase2_scenes.json', this.results.phase2);
  }

  /**
   * 验证阶段2结果
   */
  validatePhase2() {
    const result = this.results.phase2;

    console.log('\n  📊 验证结果:');
    console.log('    - 场景数量: ' + result.scenes.length);

    // 检查场景类型
    const cardScenes = result.scenes.filter(s => s.type === 'video-with-card');
    console.log('    - 卡片场景: ' + cardScenes.length);

    // 检查时间轴
    let hasOverlap = false;
    for (let i = 0; i < result.scenes.length - 1; i++) {
      const current = result.scenes[i];
      const next = result.scenes[i + 1];
      if (current.endTime > next.startTime) {
        hasOverlap = true;
        console.warn('    ⚠️  场景 ' + current.id + ' 和 ' + next.id + ' 时间重叠');
      }
    }

    if (!hasOverlap) {
      console.log('    ✓ 时间轴无重叠');
    }

    // 检查卡片内容
    const expectedCards = TEST_CONFIG.expectedCards.map(c => c.text);
    const foundCards = cardScenes.map(s => s.cardText);
    console.log('    - 期望卡片: ' + expectedCards.join(', '));
    console.log('    - 生成卡片: ' + foundCards.join(', '));
  }

  /**
   * 测试 VisualDesigner
   */
  async testVisualDesigner() {
    const designer = new VisualDesigner({
      logger: this.logger
    });

    console.log('  → 开始卡片设计...');

    const input = {
      scenes: this.results.phase2.scenes
    };

    if (TEST_CONFIG.mockMode) {
      // 模拟模式：构造卡片资源
      this.results.phase3 = {
        cards: [
          {
            id: 'card_1',
            path: path.join(TEST_CONFIG.outputDir, 'cards', 'card_reinforcement_learning.png'),
            text: '强化学习',
            subtitle: 'Reinforcement Learning',
            style: 'blue',
            size: { width: 450, height: 300 }
          },
          {
            id: 'card_2',
            path: path.join(TEST_CONFIG.outputDir, 'cards', 'card_emergence.png'),
            text: '涌现',
            subtitle: 'Emergence',
            style: 'yellow',
            size: { width: 450, height: 300 }
          }
        ]
      };

      // 生成模拟卡片图片
      await this.generateMockCards(this.results.phase3.cards);

      console.log('  ✓ 卡片设计完成（模拟）');
    } else {
      const result = await designer.designCards(input);
      this.results.phase3 = result;
      console.log('  ✓ 卡片设计完成');
    }

    // 验证结果
    this.validatePhase3();

    // 保存结果
    this.saveResult('phase3_cards.json', this.results.phase3);
  }

  /**
   * 生成模拟卡片
   */
  async generateMockCards(cards) {
    console.log('  → 生成模拟卡片图片...');

    for (const card of cards) {
      // 创建简单的占位符文件
      const content = JSON.stringify({
        text: card.text,
        subtitle: card.subtitle,
        style: card.style,
        size: card.size
      }, null, 2);

      fs.writeFileSync(card.path, content);
      console.log('    ✓ 生成卡片: ' + path.basename(card.path));
    }
  }

  /**
   * 验证阶段3结果
   */
  validatePhase3() {
    const result = this.results.phase3;

    console.log('\n  📊 验证结果:');
    console.log('    - 卡片数量: ' + result.cards.length);

    // 检查文件是否存在
    for (const card of result.cards) {
      const exists = fs.existsSync(card.path);
      const status = exists ? '✓' : '✗';
      console.log('    ' + status + ' ' + card.text + ': ' + path.basename(card.path));
    }
  }

  /**
   * 测试 VideoEngineer
   */
  async testVideoEngineer() {
    const engineer = new VideoEngineer({
      logger: this.logger
    });

    console.log('  → 开始视频合成...');

    const input = {
      videoPath: TEST_CONFIG.testVideoPath,
      scenes: this.results.phase2.scenes,
      cards: this.results.phase3.cards
    };

    if (TEST_CONFIG.mockMode) {
      // 模拟模式：构造输出路径
      this.results.phase4 = {
        finalVideoPath: path.join(TEST_CONFIG.outputDir, 'videos', 'output_with_cards.mp4'),
        duration: 15,
        resolution: '1080x1920',
        scenes: this.results.phase2.scenes.length
      };

      console.log('  ⚠️  跳过实际视频合成（模拟模式）');
      console.log('  → 输出路径: ' + this.results.phase4.finalVideoPath);
    } else {
      const result = await engineer.composeVideoWithCards(input);
      this.results.phase4 = result;
      console.log('  ✓ 视频合成完成');
    }

    // 验证结果
    this.validatePhase4();

    // 保存结果
    this.saveResult('phase4_video.json', this.results.phase4);
  }

  /**
   * 验证阶段4结果
   */
  validatePhase4() {
    const result = this.results.phase4;

    console.log('\n  📊 验证结果:');
    console.log('    - 输出路径: ' + result.finalVideoPath);
    console.log('    - 时长: ' + result.duration + '秒');
    console.log('    - 分辨率: ' + result.resolution);
    console.log('    - 场景数: ' + result.scenes);

    if (!TEST_CONFIG.mockMode && fs.existsSync(result.finalVideoPath)) {
      const stats = fs.statSync(result.finalVideoPath);
      console.log('    - 文件大小: ' + (stats.size / 1024 / 1024).toFixed(2) + ' MB');
      console.log('    ✓ 视频文件已生成');
    }
  }

  /**
   * 测试 QualityDirector
   */
  async testQualityDirector() {
    const director = new QualityDirector({
      logger: this.logger
    });

    console.log('  → 开始质量检查...');

    const input = {
      understanding: this.results.phase1,
      scenes: this.results.phase2,
      cards: this.results.phase3,
      video: this.results.phase4
    };

    if (TEST_CONFIG.mockMode) {
      // 模拟模式：构造质量报告
      this.results.phase5 = {
        passed: true,
        score: 95,
        checks: {
          contentAccuracy: { passed: true, score: 95 },
          cardQuality: { passed: true, score: 98 },
          timelineValidity: { passed: true, score: 100 },
          videoQuality: { passed: true, score: 90 }
        },
        violations: [],
        warnings: [],
        suggestions: [
          '建议增加卡片动画效果',
          '建议优化卡片位置'
        ]
      };

      console.log('  ✓ 质量检查完成（模拟）');
    } else {
      const result = await director.checkAll(input);
      this.results.phase5 = result;
      console.log('  ✓ 质量检查完成');
    }

    // 验证结果
    this.validatePhase5();

    // 保存结果
    this.saveResult('phase5_quality.json', this.results.phase5);
  }

  /**
   * 验证阶段5结果
   */
  validatePhase5() {
    const result = this.results.phase5;

    console.log('\n  📊 验证结果:');
    console.log('    - 总体评分: ' + result.score + '/100');
    console.log('    - 是否通过: ' + (result.passed ? '✓ 是' : '✗ 否'));

    console.log('\n  检查项:');
    for (const key in result.checks) {
      const check = result.checks[key];
      const status = check.passed ? '✓' : '✗';
      console.log('    ' + status + ' ' + key + ': ' + check.score + '/100');
    }

    if (result.violations.length > 0) {
      console.log('\n  ⚠️  违规项:');
      result.violations.forEach((v, i) => {
        console.log('    ' + (i + 1) + '. ' + v);
      });
    }

    if (result.warnings.length > 0) {
      console.log('\n  ⚠️  警告:');
      result.warnings.forEach((w, i) => {
        console.log('    ' + (i + 1) + '. ' + w);
      });
    }

    if (result.suggestions.length > 0) {
      console.log('\n  💡 建议:');
      result.suggestions.forEach((s, i) => {
        console.log('    ' + (i + 1) + '. ' + s);
      });
    }
  }

  /**
   * 保存结果
   */
  saveResult(filename, data) {
    const filepath = path.join(TEST_CONFIG.outputDir, 'reports', filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log('  → 结果已保存: ' + filename);
  }

  /**
   * 生成测试报告
   */
  generateTestReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试报告');
    console.log('='.repeat(60));

    const report = {
      testTime: new Date().toISOString(),
      testMode: TEST_CONFIG.mockMode ? 'mock' : 'real',
      phases: {
        phase1: {
          name: 'ContentAnalyst',
          status: this.results.phase1 ? 'passed' : 'failed',
          keywords: this.results.phase1 ? this.results.phase1.keywords : []
        },
        phase2: {
          name: 'SceneDesigner',
          status: this.results.phase2 ? 'passed' : 'failed',
          sceneCount: this.results.phase2 ? this.results.phase2.scenes.length : 0
        },
        phase3: {
          name: 'VisualDesigner',
          status: this.results.phase3 ? 'passed' : 'failed',
          cardCount: this.results.phase3 ? this.results.phase3.cards.length : 0
        },
        phase4: {
          name: 'VideoEngineer',
          status: this.results.phase4 ? 'passed' : 'failed',
          outputPath: this.results.phase4 ? this.results.phase4.finalVideoPath : null
        },
        phase5: {
          name: 'QualityDirector',
          status: this.results.phase5 && this.results.phase5.passed ? 'passed' : 'failed',
          score: this.results.phase5 ? this.results.phase5.score : 0
        }
      },
      summary: {
        totalPhases: 5,
        passedPhases: Object.values(this.results).filter(r => r !== null).length,
        overallStatus: this.results.phase5 && this.results.phase5.passed ? 'SUCCESS' : 'FAILED'
      }
    };

    // 打印报告
    console.log('\n阶段结果:');
    for (const key in report.phases) {
      const phase = report.phases[key];
      const status = phase.status === 'passed' ? '✓' : '✗';
      console.log('  ' + status + ' ' + phase.name);
    }

    console.log('\n总结:');
    console.log('  - 总阶段数: ' + report.summary.totalPhases);
    console.log('  - 通过阶段: ' + report.summary.passedPhases);
    console.log('  - 整体状态: ' + report.summary.overallStatus);

    // 保存报告
    const reportPath = path.join(TEST_CONFIG.outputDir, 'reports', 'test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('\n📄 完整报告已保存: ' + reportPath);
  }
}

// 运行测试
const test = new VideoWithCardsTest();
test.runFullTest().catch(error => {
  console.error('测试失败:', error);
  process.exit(1);
});
