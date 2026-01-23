const RoundedCornerService = require('./src/services/RoundedCornerService.cjs');
const path = require('path');
const fs = require('fs');

/**
 * 简化的圆角效果测试
 * 只测试基础圆角功能
 */

async function testBasicRoundedCorner() {
  console.log('🧪 开始基础圆角效果测试\n');

  const service = new RoundedCornerService();

  // 查找测试视频
  const testVideoPath = findTestVideo();
  if (!testVideoPath) {
    console.error('❌ 未找到测试视频文件');
    return;
  }

  console.log(`✅ 找到测试视频: ${testVideoPath}\n`);

  // 测试：基础圆角（20px，带阴影）
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试：基础圆角（20px，带阴影）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const result = await service.applyRoundedCornersToVideo(
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
    console.log(`\n✅ 测试完成: ${result}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 圆角效果测试成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n请打开生成的视频查看效果: ${result}\n`);

    // 显示统计信息
    const stats = service.getStats();
    console.log(`📊 服务统计信息:`);
    console.log(`  - 蒙版缓存: ${stats.maskCache.fileCount} 个文件 (${stats.maskCache.totalSizeMB} MB)`);
    console.log(`  - 输出目录: ${stats.outputDir}\n`);

  } catch (error) {
    console.error(`\n❌ 测试失败: ${error.message}`);
    console.error(error.stack);
  }
}

/**
 * 查找测试视频文件
 */
function findTestVideo() {
  // 递归查找output目录下的视频
  const outputDir = path.join(__dirname, '..', 'output');
  if (fs.existsSync(outputDir)) {
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
testBasicRoundedCorner().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
