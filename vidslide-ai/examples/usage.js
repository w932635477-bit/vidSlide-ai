/**
 * VidSlide AI - 使用示例
 *
 * 演示如何在代码中使用多智能体蜂群系统
 */

import { generateVideo, getSystemStatus, ProjectManager } from '../src/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// 示例1: 基础使用
// ============================================
async function example1_basic() {
  console.log('示例1: 基础使用');
  console.log('=====================================');

  const videoPath = '/path/to/your/video.mp4';

  const result = await generateVideo(videoPath);

  if (result.success) {
    console.log('✅ 成功!');
    console.log('输出视频:', result.videoPath);
    console.log('质量评分:', result.qualityScore);
  } else {
    console.log('❌ 失败:', result.error);
  }
}

// ============================================
// 示例2: 带配置选项
// ============================================
async function example2_withOptions() {
  console.log('示例2: 带配置选项');
  console.log('=====================================');

  const videoPath = '/path/to/your/video.mp4';

  const result = await generateVideo(videoPath, {
    allowRework: true,           // 允许返工
    cacheDir: '.cache',          // 缓存目录
    outputDir: 'output',         // 输出目录
    logLevel: 'debug'            // 日志级别
  });

  if (result.success) {
    console.log('✅ 成功!');
    console.log('输出视频:', result.videoPath);
    console.log('质量评分:', result.qualityScore);

    // 查看详细报告
    console.log('');
    console.log('详细报告:');
    console.log(JSON.stringify(result.report, null, 2));
  }
}

// ============================================
// 示例3: 批量处理
// ============================================
async function example3_batch() {
  console.log('示例3: 批量处理');
  console.log('=====================================');

  const videos = [
    '/path/to/video1.mp4',
    '/path/to/video2.mp4',
    '/path/to/video3.mp4'
  ];

  const results = [];

  for (let i = 0; i < videos.length; i++) {
    const videoPath = videos[i];
    console.log(`处理视频 ${i + 1}/${videos.length}: ${videoPath}`);

    try {
      const result = await generateVideo(videoPath);
      results.push({
        videoPath: videoPath,
        success: result.success,
        outputPath: result.videoPath,
        qualityScore: result.qualityScore
      });

      console.log(`  ✅ 完成 (评分: ${result.qualityScore})`);

    } catch (error) {
      console.log(`  ❌ 失败: ${error.message}`);
      results.push({
        videoPath: videoPath,
        success: false,
        error: error.message
      });
    }
  }

  // 汇总结果
  console.log('');
  console.log('批量处理结果:');
  const successCount = results.filter(r => r.success).length;
  console.log(`  成功: ${successCount}/${videos.length}`);
  console.log(`  失败: ${videos.length - successCount}/${videos.length}`);
}

// ============================================
// 示例4: 高级用法 - 直接使用ProjectManager
// ============================================
async function example4_advanced() {
  console.log('示例4: 高级用法');
  console.log('=====================================');

  // 创建自定义配置的ProjectManager
  const pm = new ProjectManager({
    cacheManager: {
      cacheDir: '.cache',
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7天
      maxSize: 1024 * 1024 * 1024       // 1GB
    },
    logger: {
      logLevel: 'debug',
      logFile: 'logs/vidslide.log'
    }
  });

  // 检查系统状态
  const status = pm.getStatus();
  console.log('系统状态:');
  console.log(JSON.stringify(status, null, 2));

  // 执行视频生成
  const videoPath = '/path/to/your/video.mp4';
  const result = await pm.execute(videoPath, {
    allowRework: true
  });

  if (result.success) {
    console.log('✅ 成功!');
  }
}

// ============================================
// 示例5: 获取系统状态
// ============================================
function example5_status() {
  console.log('示例5: 获取系统状态');
  console.log('=====================================');

  const status = getSystemStatus();

  console.log('系统名称:', status.name);
  console.log('系统就绪:', status.ready);
  console.log('');
  console.log('智能体列表:');
  status.agents.forEach(agent => {
    console.log(`  - ${agent.name}: ${agent.status.ready ? '就绪' : '未就绪'}`);
  });
  console.log('');
  console.log('质量总监:', status.qualityDirector.ready ? '就绪' : '未就绪');
}

// ============================================
// 运行示例
// ============================================
async function runExamples() {
  console.log('VidSlide AI - 使用示例');
  console.log('=====================================');
  console.log('');

  // 取消注释以运行相应示例

  // await example1_basic();
  // await example2_withOptions();
  // await example3_batch();
  // await example4_advanced();
  example5_status();
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(error => {
    console.error('错误:', error);
    process.exit(1);
  });
}

export {
  example1_basic,
  example2_withOptions,
  example3_batch,
  example4_advanced,
  example5_status
};
