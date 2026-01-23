const RoundedCornerService = require('./src/services/RoundedCornerService.cjs');
const path = require('path');
const fs = require('fs');

/**
 * 圆角效果测试套件
 * 测试不同场景下的圆角实现
 */

async function testRoundedCorners() {
  console.log('🧪 开始圆角效果测试\n');

  const service = new RoundedCornerService();

  // 查找测试视频
  const testVideoPath = findTestVideo();
  if (!testVideoPath) {
    console.error('❌ 未找到测试视频文件');
    console.log('请将测试视频放在以下位置之一：');
    console.log('  - vidslide-ai/test-video.mp4');
    console.log('  - vidslide-ai/input.mp4');
    console.log('  - output/ 目录下的任何 .mp4 文件');
    return;
  }

  console.log(`✅ 找到测试视频: ${testVideoPath}\n`);

  // 测试1：基础圆角（20px）
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试1：基础圆角（20px，无阴影）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const result1 = await service.applyRoundedCornersToVideo(
      testVideoPath,
      20,
      {
        width: 360,
        height: 640,
        borderWidth: 4,
        borderColor: 'white',
        shadow: { enabled: false },
        useVP9: true
      }
    );
    console.log(`✅ 测试1完成: ${result1}\n`);
  } catch (error) {
    console.error(`❌ 测试1失败: ${error.message}\n`);
  }

  // 测试2：圆角+阴影
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试2：圆角+阴影（20px圆角，4px模糊）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const result2 = await service.applyRoundedCornersToVideo(
      testVideoPath,
      20,
      {
        width: 360,
        height: 640,
        borderWidth: 4,
        borderColor: 'white',
        shadow: {
          enabled: true,
          offsetX: 2,
          offsetY: 6,
          blur: 4,
          opacity: 0.3
        },
        useVP9: true
      }
    );
    console.log(`✅ 测试2完成: ${result2}\n`);
  } catch (error) {
    console.error(`❌ 测试2失败: ${error.message}\n`);
  }

  // 测试3：大圆角（50px）
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试3：大圆角（50px，带阴影）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const result3 = await service.applyRoundedCornersToVideo(
      testVideoPath,
      50,
      {
        width: 360,
        height: 640,
        borderWidth: 4,
        borderColor: 'white',
        shadow: {
          enabled: true,
          offsetX: 2,
          offsetY: 6,
          blur: 6,
          opacity: 0.4
        },
        useVP9: true
      }
    );
    console.log(`✅ 测试3完成: ${result3}\n`);
  } catch (error) {
    console.error(`❌ 测试3失败: ${error.message}\n`);
  }

  // 测试4：完全圆形（半径=宽度/2）
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试4：完全圆形（半径=180px）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const result4 = await service.applyRoundedCornersToVideo(
      testVideoPath,
      180,
      {
        width: 360,
        height: 640,
        borderWidth: 4,
        borderColor: 'white',
        shadow: {
          enabled: true,
          offsetX: 2,
          offsetY: 6,
          blur: 4,
          opacity: 0.3
        },
        useVP9: true
      }
    );
    console.log(`✅ 测试4完成: ${result4}\n`);
  } catch (error) {
    console.error(`❌ 测试4失败: ${error.message}\n`);
  }

  // 测试5：H.264降级方案（无透明度）
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试5：H.264降级方案（无透明度，仅边框）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const result5 = await service.applyRoundedCornersToVideo(
      testVideoPath,
      20,
      {
        width: 360,
        height: 640,
        borderWidth: 4,
        borderColor: 'white',
        shadow: { enabled: false },
        useVP9: false  // 使用H.264
      }
    );
    console.log(`✅ 测试5完成: ${result5}\n`);
  } catch (error) {
    console.error(`❌ 测试5失败: ${error.message}\n`);
  }

  // 显示统计信息
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 服务统计信息');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const stats = service.getStats();
  console.log(`蒙版缓存:`);
  console.log(`  - 内存缓存: ${stats.maskCache.memoryCount} 个`);
  console.log(`  - 文件缓存: ${stats.maskCache.fileCount} 个`);
  console.log(`  - 总大小: ${stats.maskCache.totalSizeMB} MB`);
  console.log(`输出目录: ${stats.outputDir}`);
  console.log(`临时目录: ${stats.tempDir}\n`);

  // 检查VP9支持
  const vp9Supported = await service.checkVP9Support();
  console.log(`VP9编码器支持: ${vp9Supported ? '✅ 是' : '❌ 否'}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 所有测试完成！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n请检查 output/ 目录下的生成视频：');
  console.log('  - rounded_*.webm (VP9编码，支持透明圆角)');
  console.log('  - rounded_*.mp4 (H.264编码，仅边框)\n');
}

/**
 * 查找测试视频文件
 */
function findTestVideo() {
  const possiblePaths = [
    path.join(__dirname, 'test-video.mp4'),
    path.join(__dirname, 'input.mp4'),
    path.join(__dirname, '..', 'output', 'task_1768909519845_56sv9vbli', 'segment_48.mp4')
  ];

  // 检查固定路径
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }

  // 查找output目录下的视频
  const outputDir = path.join(__dirname, '..', 'output');
  if (fs.existsSync(outputDir)) {
    // 递归查找所有.mp4文件
    const findMp4 = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const result = findMp4(fullPath);
          if (result) return result;
        } else if (file.endsWith('.mp4')) {
          return fullPath;
        }
      }
      return null;
    };
    return findMp4(outputDir);
  }

  return null;
}

// 运行测试
testRoundedCorners().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
