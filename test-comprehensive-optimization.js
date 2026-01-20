/**
 * 综合优化测试
 * 测试所有优化功能：布局、裁剪、文字渲染
 */

import { getInstance as getCompositionGenerator } from './vidslide-ai/src/services/CompositionUnitGeneratorV3.js';
import { getInstance as getCropService } from './vidslide-ai/src/services/SmartCropServiceV2.js';
import { getInstance as getTextRenderer } from './vidslide-ai/src/services/AdvancedTextRenderer.js';
import fs from 'fs';
import path from 'path';

console.log('='.repeat(70));
console.log('VidSlide AI - 综合优化测试');
console.log('='.repeat(70));

// 测试配置
const testCases = [
  {
    name: '科技风格 - 单图大标题',
    config: {
      mainTitle: 'AI驱动的未来',
      subTitle: '探索人工智能的无限可能',
      keywords: ['创新', '智能', '未来'],
      images: ['./test-output/test-image-1.png'],
      stylePreset: 'tech',
      layoutStyle: 'auto'
    }
  },
  {
    name: '商务风格 - 双图对比',
    config: {
      mainTitle: '效率提升300%',
      keywords: ['高效', '专业', '可靠'],
      images: ['./test-output/test-image-1.png', './test-output/test-image-2.png'],
      stylePreset: 'business',
      layoutStyle: 'auto'
    }
  },
  {
    name: '数据风格 - 三图展示',
    config: {
      mainTitle: '数据驱动决策',
      subTitle: '让数据说话',
      keywords: ['精准', '洞察', '增长'],
      images: [
        './test-output/test-image-1.png',
        './test-output/test-image-2.png',
        './test-output/test-image-3.png'
      ],
      stylePreset: 'data',
      layoutStyle: 'auto'
    }
  }
];

// 运行测试
async function runComprehensiveTests() {
  console.log('\n📋 测试计划:');
  console.log(`  - ${testCases.length} 个布局测试`);
  console.log(`  - 图片裁剪优化验证`);
  console.log(`  - 文字渲染效果验证`);
  console.log(`  - 性能指标测试\n`);

  const generator = getCompositionGenerator();
  const cropService = getCropService();
  const textRenderer = getTextRenderer();

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];

    console.log('\n' + '='.repeat(70));
    console.log(`测试 ${i + 1}/${testCases.length}: ${testCase.name}`);
    console.log('='.repeat(70));

    try {
      // 1. 测试图片裁剪
      console.log('\n[1/3] 测试智能裁剪...');
      const cropTests = await testCropping(cropService, testCase.config.images[0]);

      // 2. 测试文字渲染
      console.log('\n[2/3] 测试文字渲染...');
      const textTests = testTextRendering(textRenderer, testCase.config);

      // 3. 生成完整组合单元
      console.log('\n[3/3] 生成组合单元...');
      const testStartTime = Date.now();
      const outputPath = await generator.generateCompositionUnit(testCase.config);
      const duration = Date.now() - testStartTime;

      console.log(`\n✓ 测试完成`);
      console.log(`  耗时: ${duration}ms`);
      console.log(`  输出: ${outputPath}`);

      results.push({
        name: testCase.name,
        success: true,
        duration,
        outputPath,
        cropTests,
        textTests
      });

    } catch (error) {
      console.error(`\n✗ 测试失败:`, error.message);

      results.push({
        name: testCase.name,
        success: false,
        error: error.message
      });
    }
  }

  const totalDuration = Date.now() - startTime;

  // 输出测试报告
  printTestReport(results, totalDuration);

  return results;
}

/**
 * 测试图片裁剪
 */
async function testCropping(cropService, imagePath) {
  const strategies = ['attention', 'entropy', 'center'];
  const results = {};

  for (const strategy of strategies) {
    try {
      const startTime = Date.now();

      await cropService.smartCrop(imagePath, {
        width: 600,
        height: 600,
        strategy,
        safeMargin: true,
        quality: 'high'
      });

      const duration = Date.now() - startTime;

      results[strategy] = {
        success: true,
        duration
      };

      console.log(`  ✓ ${strategy}: ${duration}ms`);

    } catch (error) {
      results[strategy] = {
        success: false,
        error: error.message
      };

      console.log(`  ✗ ${strategy}: 失败`);
    }
  }

  return results;
}

/**
 * 测试文字渲染
 */
function testTextRendering(textRenderer, config) {
  const tests = {};

  try {
    // 测试标题渲染
    const titleBuffer = textRenderer.renderTitle({
      text: config.mainTitle,
      x: 540,
      y: 220,
      fontSize: 64,
      effect: 'title'
    });

    tests.title = {
      success: true,
      size: titleBuffer.length
    };

    console.log(`  ✓ 标题渲染: ${titleBuffer.length} bytes`);

  } catch (error) {
    tests.title = {
      success: false,
      error: error.message
    };

    console.log(`  ✗ 标题渲染: 失败`);
  }

  try {
    // 测试关键词渲染
    const keywordBuffer = textRenderer.renderKeywordTags({
      keywords: config.keywords,
      y: 1680
    });

    tests.keywords = {
      success: true,
      size: keywordBuffer.length
    };

    console.log(`  ✓ 关键词渲染: ${keywordBuffer.length} bytes`);

  } catch (error) {
    tests.keywords = {
      success: false,
      error: error.message
    };

    console.log(`  ✗ 关键词渲染: 失败`);
  }

  return tests;
}

/**
 * 打印测试报告
 */
function printTestReport(results, totalDuration) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 测试报告');
  console.log('='.repeat(70));

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`\n总体统计:`);
  console.log(`  总测试数: ${results.length}`);
  console.log(`  成功: ${successCount} ✓`);
  console.log(`  失败: ${failCount} ${failCount > 0 ? '✗' : ''}`);
  console.log(`  总耗时: ${totalDuration}ms`);

  if (successCount > 0) {
    const avgDuration = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.duration, 0) / successCount;

    console.log(`  平均耗时: ${Math.round(avgDuration)}ms`);
  }

  // 详细结果
  console.log(`\n详细结果:`);
  results.forEach((result, index) => {
    console.log(`\n  ${index + 1}. ${result.name}`);

    if (result.success) {
      console.log(`     状态: ✓ 成功`);
      console.log(`     耗时: ${result.duration}ms`);
      console.log(`     输出: ${result.outputPath}`);

      // 裁剪测试结果
      if (result.cropTests) {
        const cropSuccess = Object.values(result.cropTests).filter(t => t.success).length;
        console.log(`     裁剪测试: ${cropSuccess}/3 通过`);
      }

      // 文字测试结果
      if (result.textTests) {
        const textSuccess = Object.values(result.textTests).filter(t => t.success).length;
        console.log(`     文字测试: ${textSuccess}/2 通过`);
      }

    } else {
      console.log(`     状态: ✗ 失败`);
      console.log(`     错误: ${result.error}`);
    }
  });

  // 性能分析
  if (successCount > 0) {
    console.log(`\n性能分析:`);

    const durations = results.filter(r => r.success).map(r => r.duration);
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    console.log(`  最快: ${minDuration}ms`);
    console.log(`  最慢: ${maxDuration}ms`);
    console.log(`  差异: ${maxDuration - minDuration}ms`);
  }

  // 生成的文件
  console.log(`\n生成的文件:`);
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`  ${index + 1}. ${path.basename(result.outputPath)}`);
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('✓ 测试完成！');
  console.log('='.repeat(70));

  // 建议
  console.log(`\n💡 建议:`);
  console.log(`  1. 在浏览器中打开 layout-previews/layout-preview.html 查看布局预览`);
  console.log(`  2. 查看 cache/composition-units/ 目录中的生成图片`);
  console.log(`  3. 对比参考图片，验证视觉效果`);
}

// 运行测试
runComprehensiveTests()
  .then(() => {
    console.log('\n✓ 所有测试完成！\n');
  })
  .catch(error => {
    console.error('\n✗ 测试运行失败:', error);
    process.exit(1);
  });
