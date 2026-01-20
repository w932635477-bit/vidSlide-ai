/**
 * 端到端集成测试
 * 测试新的架构：MicroSceneGeneratorV3 + CompositionUnitGeneratorV3
 */

import { getInstance as getMicroSceneGenerator } from './vidslide-ai/src/services/MicroSceneGeneratorV3.js';
import fs from 'fs';
import path from 'path';

console.log('='.repeat(70));
console.log('端到端集成测试 - 新架构');
console.log('='.repeat(70));

// 模拟主场景数据
const mainScene = {
  id: 1,
  startTime: 0,
  endTime: 15,
  transcript: [
    { startTime: 0, endTime: 3, text: '今天我们来讲解人工智能的基础知识' },
    { startTime: 3, endTime: 6, text: '深度学习是AI的核心技术' },
    { startTime: 6, endTime: 9, text: '神经网络模拟人脑的工作方式' },
    { startTime: 9, endTime: 12, text: '通过大数据训练模型' },
    { startTime: 12, endTime: 15, text: '最终实现智能决策' }
  ]
};

// 模拟关键词数据
const keywords = [
  { text: '人工智能', score: 0.9, category: 'technology' },
  { text: '深度学习', score: 0.8, category: 'technology' },
  { text: '神经网络', score: 0.7, category: 'technology' }
];

// 使用测试图片
const testImages = [
  './test-output/test-image-1.png',
  './test-output/test-image-2.png',
  './test-output/test-image-3.png'
];

// 运行测试
async function runE2ETest() {
  console.log('\n📋 测试配置:');
  console.log(`  主场景时长: ${mainScene.endTime - mainScene.startTime}秒`);
  console.log(`  关键词数量: ${keywords.length}`);
  console.log(`  图片数量: ${testImages.length}`);

  try {
    // 1. 初始化微场景生成器
    console.log('\n🎯 步骤 1: 初始化微场景生成器');
    const microSceneGenerator = getMicroSceneGenerator();

    // 2. 生成微场景
    console.log('\n🎯 步骤 2: 生成微场景');
    const startTime = Date.now();

    const microScenes = await microSceneGenerator.generateMicroScenes(
      mainScene,
      keywords,
      testImages
    );

    const duration = Date.now() - startTime;

    // 3. 输出结果
    console.log('\n' + '='.repeat(70));
    console.log('📊 测试结果');
    console.log('='.repeat(70));

    console.log(`\n总体统计:`);
    console.log(`  生成微场景数: ${microScenes.length}`);
    console.log(`  总耗时: ${duration}ms`);
    console.log(`  平均耗时: ${Math.round(duration / microScenes.length)}ms/场景`);

    console.log(`\n微场景详情:`);
    microScenes.forEach((scene, index) => {
      console.log(`\n  ${index + 1}. ${scene.type === 'composition' ? '🎨 组合场景' : '📹 原视频'}`);
      console.log(`     时间: ${scene.startTime.toFixed(1)}s - ${scene.endTime.toFixed(1)}s`);

      if (scene.type === 'composition') {
        console.log(`     关键词: ${scene.keyword}`);
        console.log(`     重要性: ${scene.importance.toFixed(2)}`);
        console.log(`     组合单元: ${scene.compositionUnitPath}`);
        console.log(`     PIP配置: ${scene.pipConfig.width}x${scene.pipConfig.height} @ (${scene.pipConfig.x}, ${scene.pipConfig.y})`);

        // 检查文件是否存在
        if (fs.existsSync(scene.compositionUnitPath)) {
          const stats = fs.statSync(scene.compositionUnitPath);
          console.log(`     文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
        } else {
          console.log(`     ⚠️ 文件不存在`);
        }
      }
    });

    // 4. 验证结果
    console.log(`\n验证结果:`);

    const compositionScenes = microScenes.filter(s => s.type === 'composition');
    const originalScenes = microScenes.filter(s => s.type === 'original');

    console.log(`  组合场景: ${compositionScenes.length}`);
    console.log(`  原视频场景: ${originalScenes.length}`);

    // 检查所有组合单元文件是否存在
    const allFilesExist = compositionScenes.every(scene =>
      fs.existsSync(scene.compositionUnitPath)
    );

    console.log(`  所有文件存在: ${allFilesExist ? '✓' : '✗'}`);

    // 检查时间连续性
    let timeValid = true;
    for (let i = 1; i < microScenes.length; i++) {
      if (microScenes[i].startTime !== microScenes[i - 1].endTime) {
        timeValid = false;
        console.log(`  ⚠️ 时间不连续: 场景${i}和场景${i + 1}`);
      }
    }

    console.log(`  时间连续性: ${timeValid ? '✓' : '✗'}`);

    // 5. 生成报告
    console.log('\n' + '='.repeat(70));
    console.log('✓ 测试完成！');
    console.log('='.repeat(70));

    console.log(`\n💡 下一步:`);
    console.log(`  1. 查看生成的组合单元图片`);
    console.log(`  2. 使用 FFmpeg 合成最终视频`);
    console.log(`  3. 集成到 MasterAutoGenerationAgent`);

    // 保存测试报告
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      microScenes: microScenes.length,
      compositionScenes: compositionScenes.length,
      originalScenes: originalScenes.length,
      allFilesExist,
      timeValid,
      scenes: microScenes.map(scene => ({
        type: scene.type,
        startTime: scene.startTime,
        endTime: scene.endTime,
        keyword: scene.keyword,
        compositionUnitPath: scene.compositionUnitPath
      }))
    };

    const reportPath = './test-output/e2e-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📄 测试报告已保存: ${reportPath}`);

    return {
      success: true,
      microScenes,
      duration
    };

  } catch (error) {
    console.error('\n✗ 测试失败:', error);
    console.error(error.stack);

    return {
      success: false,
      error: error.message
    };
  }
}

// 运行测试
runE2ETest()
  .then(result => {
    if (result.success) {
      console.log('\n✓ 所有测试通过！\n');
      process.exit(0);
    } else {
      console.log('\n✗ 测试失败\n');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n✗ 测试运行失败:', error);
    process.exit(1);
  });
