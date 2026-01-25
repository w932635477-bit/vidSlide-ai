/**
 * 端到端测试脚本 - 真实视频测试
 * 测试完整的多智能体工作流程
 */

// 加载环境变量
import dotenv from 'dotenv';
dotenv.config();

import ProjectManager from './src/agents/coordinator/ProjectManager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 运行端到端测试
 */
async function runE2ETest() {
  console.log('\n' + '='.repeat(80));
  console.log('🎬 VidSlide AI - 端到端真实视频测试');
  console.log('='.repeat(80));

  // 测试视频路径
  const videoPath = '/Users/weilei/Desktop/测试3.MP4';

  // 验证文件存在
  if (!fs.existsSync(videoPath)) {
    console.error(`❌ 错误: 找不到测试视频: ${videoPath}`);
    process.exit(1);
  }

  // 获取视频信息
  const videoStats = fs.statSync(videoPath);
  console.log(`\n📹 输入视频信息:`);
  console.log(`  路径: ${videoPath}`);
  console.log(`  大小: ${(videoStats.size / 1024 / 1024).toFixed(2)} MB`);

  // 创建输出目录
  const outputDir = path.join(__dirname, 'src/output/e2e-real-test');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  console.log(`  输出目录: ${outputDir}`);

  // 创建ProjectManager实例
  console.log(`\n🤖 初始化智能体系统...`);
  const projectManager = new ProjectManager({
    cacheManager: {
      cacheDir: path.join(outputDir, '.cache')
    },
    logger: {
      logLevel: 'info',
      outputDir: outputDir
    }
  });

  // 显示系统状态
  const status = projectManager.getStatus();
  console.log(`\n✅ 系统就绪:`);
  console.log(`  - ProjectManager: ${status.name}`);
  console.log(`  - 智能体数量: ${status.agents.length}`);
  status.agents.forEach(agent => {
    console.log(`    • ${agent.name}`);
  });
  console.log(`  - 质量总监: ${status.qualityDirector.name || 'QualityDirector'}`);

  // 记录开始时间
  const startTime = Date.now();

  console.log(`\n🚀 开始执行完整工作流程...`);
  console.log('='.repeat(80));

  try {
    // 执行视频生成流程（启用v4.0智能返工系统）
    const result = await projectManager.execute(videoPath, {
      allowRework: true,  // ⭐ 启用智能返工系统（v4.0）
      outputDir: outputDir
    });

    // 记录结束时间
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(80));

    if (result.success) {
      console.log('✅ 视频生成成功！');
      console.log('='.repeat(80));
      console.log(`\n📊 执行结果:`);
      console.log(`  耗时: ${duration} 秒`);
      console.log(`  输出视频: ${result.videoPath}`);
      console.log(`  质量评分: ${result.qualityScore}/100`);

      // ⭐ 显示返工信息（v4.0）
      if (result.reworkCycles) {
        console.log(`  🔄 返工次数: ${result.reworkCycles}次`);
        if (result.phasesReworked) {
          console.log(`  🔧 返工阶段: ${result.phasesReworked.join(', ')}`);
        }
      }

      // 显示报告摘要
      if (result.report) {
        console.log(`\n📋 执行报告:`);
        console.log(`  总任务数: ${result.report.totalTasks || 'N/A'}`);
        console.log(`  成功任务: ${result.report.successTasks || 'N/A'}`);
        console.log(`  失败任务: ${result.report.failedTasks || 'N/A'}`);

        if (result.report.phases) {
          console.log(`\n  各阶段执行情况:`);
          result.report.phases.forEach(phase => {
            console.log(`    - ${phase.name}: ${phase.status} (${phase.duration}ms)`);
          });
        }
      }

      // 检查输出文件
      if (fs.existsSync(result.videoPath)) {
        const outputStats = fs.statSync(result.videoPath);
        console.log(`\n📹 输出视频信息:`);
        console.log(`  大小: ${(outputStats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  路径: ${result.videoPath}`);
      }

      console.log(`\n✨ 端到端测试完成！`);
      console.log('='.repeat(80));

    } else {
      console.log('❌ 视频生成失败！');
      console.log('='.repeat(80));
      console.log(`\n❌ 错误信息: ${result.error}`);

      if (result.violations && result.violations.length > 0) {
        console.log(`\n⚠️  质量违规项 (${result.violations.length}个):`);
        result.violations.forEach((v, i) => {
          console.log(`  ${i + 1}. ${v.message || v}`);
        });
      }

      if (result.warnings && result.warnings.length > 0) {
        console.log(`\n⚠️  警告 (${result.warnings.length}个):`);
        result.warnings.forEach((w, i) => {
          console.log(`  ${i + 1}. ${w.message || w}`);
        });
      }

      if (result.suggestions && result.suggestions.length > 0) {
        console.log(`\n💡 建议:`);
        result.suggestions.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s}`);
        });
      }

      console.log(`\n⏱️  耗时: ${duration} 秒`);
      console.log('='.repeat(80));
    }

  } catch (error) {
    // 记录结束时间
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('💥 执行失败！');
    console.log('='.repeat(80));
    console.log(`\n❌ 错误: ${error.message}`);
    console.log(`\n堆栈信息:`);
    console.log(error.stack);
    console.log(`\n⏱️  耗时: ${duration} 秒`);
    console.log('='.repeat(80));
    process.exit(1);
  }
}

// 运行测试
console.log('');
runE2ETest().catch(error => {
  console.error('\n💥 未捕获的错误:', error);
  process.exit(1);
});
