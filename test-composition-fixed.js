/**
 * 测试修复版组合单元生成器
 */

import { getInstance as getCompositionGenerator } from './vidslide-ai/src/services/CompositionUnitGeneratorFixed.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function testFixed() {
  console.log('\n🎨 测试修复版组合单元生成');
  console.log('='.repeat(60));

  const generator = getCompositionGenerator();
  const outputDir = './test-output-fixed';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // 使用已下载的图片
    const imagePaths = [
      'test-output-composition/test-image-1.jpg',
      'test-output-composition/test-image-2.jpg',
      'test-output-composition/test-image-3.jpg'
    ];

    // 生成组合单元
    console.log('\n🎬 生成组合单元...');
    const unitPath = await generator.generateCompositionUnit({
      mainTitle: 'AI大模型技术',
      keywords: ['人工智能', '深度学习', '神经网络'],
      images: imagePaths,
      decorativeText: '探索未来科技的无限可能',
      stylePreset: 'tech'
    });

    console.log('\n✅ 组合单元生成成功！');
    console.log(`   文件路径: ${unitPath}`);

    const stats = fs.statSync(unitPath);
    console.log(`   文件大小: ${(stats.size / 1024).toFixed(2)} KB`);

    console.log('\n💡 打开查看效果:');
    console.log(`   open "${unitPath}"`);

    await execAsync(`open "${unitPath}"`);

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    throw error;
  }
}

testFixed().catch(console.error);
