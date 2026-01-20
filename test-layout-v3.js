/**
 * 测试新的布局系统
 * 验证 SmartLayoutServiceV2 和 CompositionUnitGeneratorV3
 */

import { getInstance as getCompositionGenerator } from './vidslide-ai/src/services/CompositionUnitGeneratorV3.js';
import { getInstance as getLayoutService } from './vidslide-ai/src/services/SmartLayoutServiceV2.js';
import fs from 'fs';
import path from 'path';

// 测试图片路径（使用之前生成的测试图片）
const testImagesDir = './test-output';
const testImages = [
  path.join(testImagesDir, 'test-image-1.png'),
  path.join(testImagesDir, 'test-image-2.png'),
  path.join(testImagesDir, 'test-image-3.png')
];

// 如果测试图片不存在，创建占位图片
async function ensureTestImages() {
  if (!fs.existsSync(testImagesDir)) {
    fs.mkdirSync(testImagesDir, { recursive: true });
  }

  const sharp = (await import('sharp')).default;

  for (let i = 0; i < testImages.length; i++) {
    if (!fs.existsSync(testImages[i])) {
      console.log(`创建测试图片 ${i + 1}...`);

      // 创建不同颜色的占位图片
      const colors = [
        { r: 102, g: 126, b: 234 },  // 蓝紫色
        { r: 255, g: 107, b: 107 },  // 红色
        { r: 78, g: 205, b: 196 }    // 青色
      ];

      await sharp({
        create: {
          width: 800,
          height: 800,
          channels: 4,
          background: colors[i]
        }
      })
      .png()
      .toFile(testImages[i]);
    }
  }
}

// 测试用例
const testCases = [
  {
    name: '单图布局 - 科技风格',
    config: {
      mainTitle: 'AI大模型技术',
      subTitle: '探索未来科技的无限可能',
      keywords: ['人工智能', '深度学习', '神经网络'],
      images: [testImages[0]],
      stylePreset: 'tech',
      layoutStyle: 'auto'
    }
  },
  {
    name: '双图布局 - 左右并排',
    config: {
      mainTitle: '前后对比效果',
      keywords: ['效果显著', '数据驱动'],
      images: [testImages[0], testImages[1]],
      stylePreset: 'business',
      layoutStyle: 'auto'
    }
  },
  {
    name: '双图布局 - 上下排列',
    config: {
      mainTitle: '步骤流程展示',
      keywords: ['简单', '高效'],
      images: [testImages[0], testImages[1]],
      stylePreset: 'data',
      layoutStyle: 'vertical'
    }
  },
  {
    name: '三图布局 - 金字塔',
    config: {
      mainTitle: '三步实现目标',
      keywords: ['简单', '高效', '可靠'],
      images: testImages,
      stylePreset: 'tech',
      layoutStyle: 'auto'
    }
  },
  {
    name: '三图布局 - 网格',
    config: {
      mainTitle: '多角度展示',
      keywords: ['全面', '专业', '精准'],
      images: testImages,
      stylePreset: 'business',
      layoutStyle: 'grid'
    }
  }
];

// 运行测试
async function runTests() {
  console.log('='.repeat(60));
  console.log('测试新的布局系统');
  console.log('='.repeat(60));

  // 确保测试图片存在
  await ensureTestImages();

  const generator = getCompositionGenerator();
  const layoutService = getLayoutService();

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];

    console.log(`\n${'='.repeat(60)}`);
    console.log(`测试 ${i + 1}/${testCases.length}: ${testCase.name}`);
    console.log('='.repeat(60));

    try {
      // 预览布局
      console.log('\n[预览] 布局配置:');
      const preview = layoutService.previewLayout(
        testCase.config.images.length,
        {
          layoutStyle: testCase.config.layoutStyle,
          avoidPIP: true
        }
      );

      console.log(`  图片数量: ${preview.layouts.length}`);
      console.log(`  布局验证: ${preview.validation.valid ? '✓ 通过' : '✗ 失败'}`);

      if (!preview.validation.valid) {
        console.log('  问题:', preview.validation.issues);
      }

      preview.layouts.forEach((layout, index) => {
        console.log(`  图片 ${index + 1}:`);
        console.log(`    尺寸: ${layout.size.width}x${layout.size.height}`);
        console.log(`    位置: (${layout.position.x}, ${layout.position.y})`);
      });

      // 生成组合单元
      const startTime = Date.now();
      const outputPath = await generator.generateCompositionUnit(testCase.config);
      const duration = Date.now() - startTime;

      console.log(`\n[结果] 生成成功`);
      console.log(`  耗时: ${duration}ms`);
      console.log(`  输出: ${outputPath}`);

      results.push({
        name: testCase.name,
        success: true,
        duration,
        outputPath
      });

    } catch (error) {
      console.error(`\n[错误] 生成失败:`, error.message);

      results.push({
        name: testCase.name,
        success: false,
        error: error.message
      });
    }
  }

  // 输出测试总结
  console.log('\n' + '='.repeat(60));
  console.log('测试总结');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`\n总测试数: ${results.length}`);
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${failCount}`);

  if (successCount > 0) {
    const avgDuration = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.duration, 0) / successCount;

    console.log(`平均耗时: ${Math.round(avgDuration)}ms`);
  }

  console.log('\n生成的图片:');
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`  ${index + 1}. ${result.name}`);
      console.log(`     ${result.outputPath}`);
    }
  });

  if (failCount > 0) {
    console.log('\n失败的测试:');
    results.forEach((result, index) => {
      if (!result.success) {
        console.log(`  ${index + 1}. ${result.name}`);
        console.log(`     错误: ${result.error}`);
      }
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('测试完成！');
  console.log('='.repeat(60));

  // 返回结果
  return {
    total: results.length,
    success: successCount,
    fail: failCount,
    results
  };
}

// 运行测试
runTests()
  .then(summary => {
    if (summary.fail > 0) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
