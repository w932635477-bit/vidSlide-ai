/**
 * 千帆V2 API测试脚本
 *
 * 用途：验证千帆V2 IAM认证是否正常工作
 */

import dotenv from 'dotenv';
import WenxinService from './src/services/WenxinService.js';

dotenv.config();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('千帆V2 API测试');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testQianfanV2() {
  // 1. 检查密钥是否配置
  console.log('步骤1: 检查密钥配置');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const accessKey = process.env.QIANFAN_ACCESS_KEY;
  const secretKey = process.env.QIANFAN_SECRET_KEY;

  if (!accessKey || !secretKey) {
    console.error('❌ 千帆V2密钥未配置');
    console.log('\n请在.env文件中配置:');
    console.log('  QIANFAN_ACCESS_KEY=your_access_key');
    console.log('  QIANFAN_SECRET_KEY=your_secret_key');
    process.exit(1);
  }

  console.log('✅ Access Key已配置:', accessKey.substring(0, 8) + '...');
  console.log('✅ Secret Key已配置:', secretKey.substring(0, 8) + '...\n');

  // 2. 测试文本聊天
  console.log('步骤2: 测试文本聊天');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const wenxin = new WenxinService();

    console.log('正在调用千帆V2 API...');
    const response = await wenxin.chat('你好,请回复"测试成功"四个字');

    console.log('✅ 文本聊天API调用成功');
    console.log(`   AI回复: ${response}\n`);

  } catch (error) {
    console.error('❌ 文本聊天API调用失败:', error.message);
    console.log('\n可能的原因:');
    console.log('  1. Access Key或Secret Key错误');
    console.log('  2. 账号未开通千帆服务');
    console.log('  3. 网络连接问题');
    console.log('\n详细错误:', error);
    process.exit(1);
  }

  // 3. 测试视觉模型（如果有测试图片）
  console.log('步骤3: 测试视觉模型API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const wenxin = new WenxinService();

    // 创建一个简单的测试数据URL（1x1红色像素）
    const testImageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    console.log('正在调用视觉API（使用测试图片）...');
    const visionResponse = await wenxin.visionChat(
      testImageDataUrl,
      '这是什么颜色的图片?请简短回答'
    );

    console.log('✅ 视觉模型API调用成功');
    console.log(`   AI回复: ${visionResponse}\n`);

  } catch (error) {
    console.warn('⚠️ 视觉模型API调用失败:', error.message);
    console.log('\n可能的原因:');
    console.log('  1. 账号未开通支持视觉的模型（如ERNIE-4.0-8K）');
    console.log('  2. 模型配额不足');
    console.log('  3. 需要在千帆控制台申请开通\n');
    console.log('解决方案:');
    console.log('  访问: https://console.bce.baidu.com/qianfan/');
    console.log('  开通支持视觉的模型（ERNIE-4.0-8K 或 qwen2-vl-7b-instruct）\n');
  }

  // 总结
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试总结');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ 千帆V2 API密钥有效');
  console.log('✅ 文本聊天功能正常');
  console.log('');
  console.log('下一步:');
  console.log('  1. 如果视觉模型测试失败,请开通支持视觉的模型');
  console.log('  2. 运行 node test_mllm_vision_api.js 测试完整功能');
  console.log('  3. 或使用MLLM模式运行端到端测试\n');
}

testQianfanV2().catch(error => {
  console.error('\n❌ 测试过程中发生错误:', error);
  process.exit(1);
});
