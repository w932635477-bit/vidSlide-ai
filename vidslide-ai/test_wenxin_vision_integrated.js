/**
 * 测试WenxinService集成的视觉功能
 */

import dotenv from 'dotenv';
import WenxinService from './src/services/WenxinService.js';
import fs from 'fs';

dotenv.config();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('测试WenxinService视觉功能');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testWenxinVision() {
  const imagePath = '/Users/weilei/VidSlide AI/vidslide-ai/test_vision_image.jpg';

  if (!fs.existsSync(imagePath)) {
    console.error('❌ 测试图片不存在');
    process.exit(1);
  }

  try {
    // 初始化WenxinService
    console.log('步骤1: 初始化WenxinService...\n');
    const wenxinService = new WenxinService({
      logger: {
        info: (msg) => console.log(`ℹ️  ${msg}`),
        warn: (msg) => console.warn(`⚠️  ${msg}`),
        error: (msg) => console.error(`❌ ${msg}`)
      }
    });

    console.log('✅ WenxinService初始化成功\n');

    // 测试视觉理解
    console.log('步骤2: 调用visionChat进行图片识别...\n');
    const result = await wenxinService.visionChat(
      imagePath,
      '请简要描述这张图片的内容（20字以内）',
      {
        model: 'ernie-4.5-turbo-vl',
        temperature: 0.7
      }
    );

    console.log('✅ 视觉理解成功！\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('AI回复:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(result);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 测试图片对比功能
    console.log('步骤3: 测试图片对比分析...\n');
    const comparisonResult = await wenxinService.compareImages(
      imagePath,
      imagePath,
      {
        aspectsToCompare: ['布局', '内容', '风格']
      }
    );

    console.log('✅ 图片对比成功！\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('对比分析结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(comparisonResult);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 WenxinService视觉功能集成测试通过！');
    console.log('✅ visionChat - 图片识别正常');
    console.log('✅ compareImages - 图片对比正常');
    console.log('✅ BCE IAM认证工作正常\n');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('\n错误堆栈:', error.stack);
    process.exit(1);
  }
}

testWenxinVision();
