#!/usr/bin/env node

/**
 * 真实视频测试脚本
 *
 * 使用真实视频测试多智能体蜂群系统的各个组件
 */

import ProjectManager from '../src/agents/coordinator/ProjectManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testWithRealVideo(videoPath) {
  console.log('🎬 真实视频测试');
  console.log('='.repeat(50));
  console.log('');
  console.log(`📹 测试视频: ${videoPath}`);
  console.log('');

  try {
    // 1. 检查视频文件
    console.log('1️⃣  检查视频文件...');
    const fs = await import('fs');
    if (!fs.existsSync(videoPath)) {
      throw new Error(`视频文件不存在: ${videoPath}`);
    }
    const stats = fs.statSync(videoPath);
    console.log(`   ✅ 文件存在 (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    console.log('');

    // 2. 创建ProjectManager
    console.log('2️⃣  初始化ProjectManager...');
    const pm = new ProjectManager({
      cacheManager: {
        cacheDir: path.join(__dirname, '../.cache')
      },
      logger: {
        logLevel: 'info'
      }
    });
    console.log('   ✅ ProjectManager已初始化');
    console.log('');

    // 3. 检查系统状态
    console.log('3️⃣  检查系统状态...');
    const status = pm.getStatus();
    console.log(`   ✅ 系统就绪: ${status.ready}`);
    console.log(`   ✅ 智能体数量: ${status.agents.length}个`);
    console.log('');

    // 4. 获取视频时长
    console.log('4️⃣  获取视频信息...');
    const duration = await pm.getVideoDuration(videoPath);
    console.log(`   ✅ 视频时长: ${duration.toFixed(2)}秒`);
    console.log('');

    // 5. 制定执行计划
    console.log('5️⃣  制定执行计划...');
    const plan = await pm.createExecutionPlan(videoPath, {
      allowRework: false
    });
    console.log(`   ✅ 计划ID: ${plan.id}`);
    console.log(`   ✅ 总任务数: ${pm.countTasks(plan)}个`);
    console.log('');

    // 6. 显示计划详情
    console.log('6️⃣  执行计划详情:');
    for (let i = 1; i <= 5; i++) {
      const phase = plan[`phase${i}`];
      if (phase) {
        console.log(`   阶段${i}: ${phase.name} (${phase.type})`);
        console.log(`     - 任务数: ${phase.tasks.length}个`);
      }
    }
    console.log('');

    console.log('='.repeat(50));
    console.log('✅ 测试完成！系统准备就绪。');
    console.log('');
    console.log('⚠️  注意: 完整执行需要配置API密钥:');
    console.log('   - BAIDU_ASR_API_KEY (百度语音识别)');
    console.log('   - WENXIN_API_KEY (文心一言)');
    console.log('   - DOUBAO_API_KEY (豆包图像生成)');
    console.log('');
    console.log('如果已配置API密钥，可以运行完整流程:');
    console.log(`   node examples/cli.js "${videoPath}"`);

    return {
      success: true,
      videoPath: videoPath,
      duration: duration,
      planId: plan.id,
      totalTasks: pm.countTasks(plan)
    };

  } catch (error) {
    console.error('');
    console.error('❌ 测试失败:', error.message);
    console.error('');
    if (error.stack) {
      console.error('堆栈跟踪:');
      console.error(error.stack);
    }

    return {
      success: false,
      error: error.message
    };
  }
}

// 命令行使用
if (import.meta.url === `file://${process.argv[1]}`) {
  const videoPath = process.argv[2] || path.join(process.env.HOME, 'Desktop', '测试视频2.MP4');

  testWithRealVideo(videoPath)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('未捕获的错误:', error);
      process.exit(1);
    });
}

export default testWithRealVideo;
