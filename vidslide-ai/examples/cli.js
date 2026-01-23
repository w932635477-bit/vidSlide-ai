#!/usr/bin/env node

/**
 * VidSlide AI - 命令行工具
 *
 * 使用方法：
 * node examples/cli.js /path/to/video.mp4
 */

import dotenv from 'dotenv';
import { generateVideo } from '../src/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // 获取命令行参数
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node examples/cli.js <视频路径>');
    console.log('');
    console.log('示例:');
    console.log('  node examples/cli.js /path/to/video.mp4');
    console.log('  node examples/cli.js /path/to/video.mp4 --allow-rework');
    process.exit(1);
  }

  const videoPath = args[0];
  const allowRework = args.includes('--allow-rework');

  console.log('🚀 VidSlide AI - 多智能体蜂群系统');
  console.log('=====================================');
  console.log('');
  console.log(`📹 输入视频: ${videoPath}`);
  console.log(`🔄 允许返工: ${allowRework ? '是' : '否'}`);
  console.log('');

  try {
    // 执行视频生成
    const result = await generateVideo(videoPath, {
      allowRework: allowRework,
      cacheDir: path.join(__dirname, '../.cache'),
      outputDir: path.join(__dirname, '../output'),
      logLevel: 'info'
    });

    console.log('');
    console.log('=====================================');

    if (result.success) {
      console.log('✅ 视频生成成功！');
      console.log('');
      console.log(`📁 输出路径: ${result.videoPath}`);
      console.log(`⭐ 质量评分: ${result.qualityScore.toFixed(2)}/100`);
      console.log('');

      // 显示性能报告
      if (result.report && result.report.performance) {
        const perf = result.report.performance;
        console.log('📊 性能报告:');
        console.log(`  - 总耗时: ${(perf.totalDuration / 1000).toFixed(2)}秒`);
        console.log(`  - 平均阶段时间: ${(perf.avgPhaseTime / 1000).toFixed(2)}秒`);
        console.log(`  - 成功率: ${perf.successRate.toFixed(2)}%`);
        console.log(`  - 错误数: ${perf.errorCount}个`);
        console.log(`  - 警告数: ${perf.warnCount}个`);
      }

    } else {
      console.log('❌ 视频生成失败');
      console.log('');
      console.log(`错误: ${result.error}`);

      if (result.violations && result.violations.length > 0) {
        console.log('');
        console.log('违规项:');
        result.violations.forEach((v, i) => {
          console.log(`  ${i + 1}. ${v}`);
        });
      }

      if (result.suggestions && result.suggestions.length > 0) {
        console.log('');
        console.log('改进建议:');
        result.suggestions.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s}`);
        });
      }
    }

    console.log('');
    console.log('=====================================');

  } catch (error) {
    console.error('');
    console.error('💥 发生严重错误:');
    console.error(error.message);
    console.error('');
    console.error('堆栈跟踪:');
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
