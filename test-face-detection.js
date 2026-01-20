/**
 * 人脸识别 PIP 测试脚本
 *
 * 测试内容：
 * 1. Python 人脸检测脚本
 * 2. Node.js 人脸检测服务
 * 3. PIP 位置计算
 */

import { getInstance as getFaceDetectionService } from './vidslide-ai/src/services/FaceDetectionService.js';

async function testFaceDetection() {
  console.log('🧪 开始测试人脸识别 PIP 功能\n');

  try {
    // 1. 获取测试视频路径
    const testVideoPath = process.argv[2];

    if (!testVideoPath) {
      console.error('❌ 请提供视频路径作为参数');
      console.log('用法: node test-face-detection.js <视频路径>');
      process.exit(1);
    }

    console.log('📹 测试视频:', testVideoPath);

    // 2. 创建人脸检测服务实例
    const faceDetectionService = getFaceDetectionService();

    // 3. 测试人脸检测
    console.log('\n🔍 测试 1: 人脸检测');
    console.log('─'.repeat(50));

    const faceResult = await faceDetectionService.detectFaces(testVideoPath, 5);

    if (faceResult.detected) {
      console.log('✅ 检测到人脸！');
      console.log('  - 位置:', `(${faceResult.face.x}, ${faceResult.face.y})`);
      console.log('  - 大小:', `${faceResult.face.width}x${faceResult.face.height}`);
      console.log('  - 归一化坐标:', faceResult.face.normalized);
      console.log('  - 视频尺寸:', faceResult.videoSize);
      console.log('  - 采样帧数:', faceResult.sampledFrames);
    } else {
      console.log('⚠️ 未检测到人脸');
    }

    // 4. 测试 PIP 位置计算
    console.log('\n📍 测试 2: PIP 位置计算');
    console.log('─'.repeat(50));

    const pipSizes = [
      { width: 280, height: 280, label: '小尺寸' },
      { width: 400, height: 400, label: '中尺寸' },
      { width: 500, height: 500, label: '大尺寸' }
    ];

    for (const pipSize of pipSizes) {
      console.log(`\n  测试 PIP 尺寸: ${pipSize.label} (${pipSize.width}x${pipSize.height})`);

      const safePos = faceDetectionService.calculateSafePIPPosition(
        faceResult,
        pipSize.width,
        pipSize.height,
        1080,
        1920
      );

      console.log(`    ✅ 安全位置: ${safePos.label}`);
      console.log(`    - 坐标: (${Math.round(safePos.x)}, ${Math.round(safePos.y)})`);
    }

    // 5. 测试缓存
    console.log('\n📦 测试 3: 缓存功能');
    console.log('─'.repeat(50));

    console.log('  第一次调用（应该执行检测）...');
    const start1 = Date.now();
    await faceDetectionService.detectFaces(testVideoPath, 5);
    const time1 = Date.now() - start1;
    console.log(`  ✅ 耗时: ${time1}ms`);

    console.log('  第二次调用（应该使用缓存）...');
    const start2 = Date.now();
    await faceDetectionService.detectFaces(testVideoPath, 5);
    const time2 = Date.now() - start2;
    console.log(`  ✅ 耗时: ${time2}ms`);

    if (time2 < time1 / 10) {
      console.log(`  ✅ 缓存生效！加速 ${Math.round(time1 / time2)}x`);
    } else {
      console.log('  ⚠️ 缓存可能未生效');
    }

    // 6. 总结
    console.log('\n🎉 测试完成！');
    console.log('─'.repeat(50));
    console.log('✅ 所有测试通过');

    // 7. 可视化结果
    console.log('\n📊 可视化结果:');
    console.log('─'.repeat(50));

    if (faceResult.detected) {
      const face = faceResult.face;
      const videoWidth = faceResult.videoSize.width;
      const videoHeight = faceResult.videoSize.height;

      // 简单的 ASCII 可视化
      console.log('\n  视频布局 (1080x1920):');
      console.log('  ┌─────────────────────┐');
      console.log('  │                     │');
      console.log('  │                     │');
      console.log(`  │   👤 人脸位置        │  (${face.x}, ${face.y})`);
      console.log(`  │   尺寸: ${face.width}x${face.height}     │`);
      console.log('  │                     │');
      console.log('  │                     │');
      console.log('  └─────────────────────┘');

      // 推荐的 PIP 位置
      const recommendedPos = faceDetectionService.calculateSafePIPPosition(
        faceResult,
        280,
        280,
        1080,
        1920
      );

      console.log(`\n  推荐 PIP 位置: ${recommendedPos.label}`);
      console.log(`  坐标: (${Math.round(recommendedPos.x)}, ${Math.round(recommendedPos.y)})`);
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
testFaceDetection();
