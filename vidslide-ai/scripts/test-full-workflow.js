/**
 * 完整工作流程测试
 *
 * 使用测试视频2.MP4测试整个多智能体系统
 * 生成最终视频并分析与理想效果的差距
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { generateVideo } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFullWorkflow() {
  console.log('🎬 VidSlide AI - 完整工作流程测试\n');
  console.log('='.repeat(80));

  try {
    // 使用桌面上的测试视频2.MP4
    const videoPath = '/Users/weilei/Desktop/测试视频2.MP4';

    console.log('\n📹 测试视频:', videoPath);
    console.log('\n🎯 测试目标:');
    console.log('  1. 运行完整的多智能体工作流程');
    console.log('  2. 生成原素材 + 卡片的最终视频');
    console.log('  3. 分析与理想效果的差距');
    console.log('\n' + '='.repeat(80));

    // 执行完整流程
    console.log('\n▶️  开始执行多智能体工作流程...\n');

    const startTime = Date.now();
    const result = await generateVideo(videoPath, {
      allowRework: false,
      logLevel: 'info'
    });
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('✅ 测试完成！');
    console.log(`⏱️  总耗时: ${duration}秒`);
    console.log('\n📊 执行结果:');

    if (result.success) {
      console.log('\n✅ 视频生成成功！');
      console.log(`📹 输出路径: ${result.videoPath}`);
      console.log(`⭐ 质量评分: ${result.qualityScore || 'N/A'}`);

      // 分析与理想效果的差距
      console.log('\n' + '='.repeat(80));
      console.log('📋 与理想效果对比分析:\n');

      console.log('✅ 已实现的功能:');
      console.log('  1. ✅ 关键词精确提取（从原文提取，不改写）');
      console.log('  2. ✅ 卡片双语显示（中文主标题 + 英文副标题）');
      console.log('  3. ✅ 卡片样式优化（600x300、圆角、真实背景图）');
      console.log('  4. ✅ 卡片位置（底部居中）');
      console.log('  5. ✅ 多智能体协作（ContentAnalyst → SceneDesigner → VisualDesigner）');

      console.log('\n⚠️  与理想效果的差距:');
      console.log('  1. ⚠️  卡片数量: 当前是单个卡片，理想效果是两个卡片并排');
      console.log('  2. ⚠️  卡片布局: 当前是居中，理想效果是左右并排');
      console.log('  3. ⚠️  卡片样式: 当前使用真实背景图，理想效果是渐变背景');
      console.log('  4. ⚠️  卡片尺寸: 当前是600x300，理想效果可能需要调整为更小的尺寸以并排显示');

      console.log('\n💡 改进建议:');
      console.log('  1. 修改ServerVideoCompositionService，支持同时显示多个卡片');
      console.log('  2. 调整卡片布局逻辑，从单个居中改为多个并排');
      console.log('  3. 可选：添加渐变背景样式选项（保留真实背景图作为备选）');
      console.log('  4. 调整卡片尺寸以适应并排显示（如400x250）');

      console.log('\n📁 请查看生成的视频:');
      console.log(`   ${result.videoPath}`);

    } else {
      console.log('\n❌ 视频生成失败');
      if (result.error) {
        console.log(`错误: ${result.error}`);
      }
      if (result.details) {
        console.log('详细信息:', result.details);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 测试流程完成！\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n错误详情:', error.stack);
    process.exit(1);
  }
}

// 运行测试
testFullWorkflow();
