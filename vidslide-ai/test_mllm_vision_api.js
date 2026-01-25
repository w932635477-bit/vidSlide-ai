/**
 * 文心一言视觉API测试脚本
 *
 * 目的：
 * 1. 测试文心一言视觉模型的图片对比功能
 * 2. 验证VisualValidationService的MLLM模式
 * 3. 对比理想效果视频和生成视频的关键帧
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config();

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║   文心一言视觉API测试 - MLLM图片对比功能               ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function testVisionAPI() {
  try {
    // 检查API密钥
    if (!process.env.WENXIN_API_KEY || !process.env.WENXIN_SECRET_KEY) {
      console.error('❌ 错误: 未找到文心一言API密钥');
      console.log('请在.env文件中设置:');
      console.log('  WENXIN_API_KEY=your_api_key');
      console.log('  WENXIN_SECRET_KEY=your_secret_key');
      process.exit(1);
    }

    console.log('✅ API密钥已配置\n');

    // 1. 导入服务
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('步骤1: 导入服务');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const WenxinService = (await import('./src/services/WenxinService.js')).default;
    const VisualValidationService = (await import('./src/services/VisualValidationService.js')).default;

    console.log('✅ WenxinService 导入成功');
    console.log('✅ VisualValidationService 导入成功\n');

    // 2. 准备测试图片
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('步骤2: 准备测试图片');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 提取理想效果视频的关键帧
    const referenceVideoPath = path.join(__dirname, 'reference/ideal_card_reference.mp4');
    const referenceFramePath = path.join(__dirname, 'cache/reference_frame_test.jpg');

    if (!fs.existsSync(referenceVideoPath)) {
      console.error('❌ 理想效果视频不存在:', referenceVideoPath);
      process.exit(1);
    }

    console.log('提取理想效果视频的关键帧...');
    const { execSync } = await import('child_process');

    // 提取第10秒的帧（卡片应该在显示中）
    execSync(
      `ffmpeg -i "${referenceVideoPath}" -ss 10 -vframes 1 -update 1 -y "${referenceFramePath}" 2>/dev/null`
    );

    console.log(`✅ 理想效果关键帧: ${referenceFramePath}`);

    // 使用之前测试生成的视频帧
    const generatedFramePath = path.join(__dirname, 'cache/test_frame_card.jpg');

    if (!fs.existsSync(generatedFramePath)) {
      console.log('⚠️ 生成视频帧不存在，提取新的帧...');

      const generatedVideoPath = path.join(__dirname, 'output/final_1769235829019_compressed.mp4');

      if (fs.existsSync(generatedVideoPath)) {
        execSync(
          `ffmpeg -i "${generatedVideoPath}" -ss 10.5 -vframes 1 -update 1 -y "${generatedFramePath}" 2>/dev/null`
        );
        console.log(`✅ 生成视频关键帧: ${generatedFramePath}`);
      } else {
        console.error('❌ 生成的视频不存在，请先运行 test_e2e_real_video.js');
        process.exit(1);
      }
    } else {
      console.log(`✅ 生成视频关键帧: ${generatedFramePath}`);
    }

    console.log('');

    // 3. 测试WenxinService的visionChat方法
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('步骤3: 测试WenxinService.visionChat()');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const wenxin = new WenxinService();

    console.log('测试单张图片理解...');
    const singleImageResponse = await wenxin.visionChat(
      referenceFramePath,
      '请描述这张图片中的卡片位置、尺寸和样式。',
      { temperature: 0.3 }
    );

    console.log('✅ 单张图片理解成功');
    console.log('响应:', singleImageResponse.substring(0, 100) + '...\n');

    // 4. 测试图片对比功能
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('步骤4: 测试WenxinService.compareImages()');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('对比理想效果和生成结果...');
    console.log('  理想效果: reference_frame_test.jpg');
    console.log('  生成结果: test_frame_card.jpg');
    console.log('');

    const compareResult = await wenxin.compareImages(
      referenceFramePath,
      generatedFramePath,
      {
        position: true,
        size: true,
        textLength: true,
        visualStyle: true
      }
    );

    console.log('✅ 图片对比成功\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('对比结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 格式化输出结果
    console.log(`总体通过: ${compareResult.overallPassed ? '✅ 是' : '❌ 否'}`);
    console.log(`总结: ${compareResult.summary}\n`);

    console.log('详细检查项:');
    console.log('');

    // 位置检查
    console.log('1. 卡片位置:');
    console.log(`   通过: ${compareResult.position.passed ? '✅' : '❌'}`);
    console.log(`   理想效果: ${compareResult.position.reference}`);
    console.log(`   生成结果: ${compareResult.position.generated}`);
    console.log(`   差异说明: ${compareResult.position.difference}`);
    console.log('');

    // 尺寸检查
    console.log('2. 卡片尺寸:');
    console.log(`   通过: ${compareResult.size.passed ? '✅' : '❌'}`);
    console.log(`   理想效果: ${compareResult.size.reference}`);
    console.log(`   生成结果: ${compareResult.size.generated}`);
    console.log(`   差异说明: ${compareResult.size.difference}`);
    console.log('');

    // 文字长度检查
    console.log('3. 文字长度:');
    console.log(`   通过: ${compareResult.textLength.passed ? '✅' : '❌'}`);
    console.log(`   标准: ${compareResult.textLength.reference}`);
    console.log(`   实际: ${compareResult.textLength.generated}`);
    console.log(`   差异说明: ${compareResult.textLength.difference}`);
    console.log('');

    // 视觉样式检查
    console.log('4. 视觉样式:');
    console.log(`   通过: ${compareResult.visualStyle.passed ? '✅' : '❌'}`);
    console.log(`   理想效果: ${compareResult.visualStyle.reference}`);
    console.log(`   生成结果: ${compareResult.visualStyle.generated}`);
    console.log(`   差异说明: ${compareResult.visualStyle.difference}`);
    console.log('');

    // 5. 测试VisualValidationService的MLLM模式
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('步骤5: 测试VisualValidationService (MLLM模式)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const visualValidator = new VisualValidationService();

    console.log('设置环境变量: USE_MOCK_VALIDATION=false');
    process.env.USE_MOCK_VALIDATION = 'false';

    const validationResult = await visualValidator.compareImages(
      referenceFramePath,
      generatedFramePath,
      {
        position: true,
        size: true,
        textLength: true,
        visualStyle: true
      }
    );

    console.log('\n✅ VisualValidationService MLLM模式验证成功');
    console.log(`总体通过: ${validationResult.overallPassed ? '✅' : '❌'}`);
    console.log(`总结: ${validationResult.summary}\n`);

    // 6. 性能统计
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试总结');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ 所有测试通过！');
    console.log('');
    console.log('功能验证:');
    console.log('  ✅ WenxinService.visionChat() - 单张图片理解');
    console.log('  ✅ WenxinService.compareImages() - 图片对比分析');
    console.log('  ✅ VisualValidationService (MLLM模式) - 质量验证');
    console.log('');
    console.log('下一步:');
    console.log('  1. 在端到端测试中启用MLLM验证: USE_MOCK_VALIDATION=false');
    console.log('  2. 观察MLLM验证的准确性和性能');
    console.log('  3. 根据需要调整prompt以提高验证质量');
    console.log('');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n详细错误:');
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
testVisionAPI();
