/**
 * 测试优化后的卡片系统
 *
 * 验证：
 * 1. 关键词提取准确性（从原文精确提取）
 * 2. 卡片内容正确性（关键词 + 英文翻译）
 * 3. 卡片样式（600x300、渐变、圆角、双语）
 * 4. 卡片位置（底部居中）
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { generateVideo } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testOptimizedCards() {
  console.log('🧪 测试优化后的卡片系统\n');
  console.log('=' .repeat(60));

  try {
    // 使用测试视频sample.mp4
    const videoPath = path.join(__dirname, '../../test-videos/sample.mp4');

    console.log('\n📹 测试视频:', videoPath);
    console.log('\n🎯 预期效果:');
    console.log('  ✅ 关键词: "巨量ad" (不是"质量ad")');
    console.log('  ✅ 卡片内容: "巨量ad" + "Massive AD"');
    console.log('  ✅ 卡片尺寸: 600x300');
    console.log('  ✅ 卡片样式: 渐变背景 + 圆角');
    console.log('  ✅ 卡片位置: 底部居中');
    console.log('\n' + '='.repeat(60));

    // 执行完整流程
    console.log('\n▶️  开始执行完整流程...\n');
    const result = await generateVideo(videoPath, {
      allowRework: false,
      logLevel: 'info'
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成！');
    console.log('\n📊 结果分析:');

    // 检查执行结果
    if (result.success) {
      console.log('\n✅ 视频生成成功！');
      console.log(`📹 输出路径: ${result.videoPath}`);
      console.log(`⭐ 质量评分: ${result.qualityScore || 'N/A'}`);

      console.log('\n请查看生成的视频，验证:');
      console.log('  ✅ 卡片显示"巨量ad" + "Massive AD"');
      console.log('  ✅ 卡片在视频底部居中');
      console.log('  ✅ 卡片有渐变背景和圆角');
    } else {
      console.log('\n❌ 视频生成失败');
      if (result.error) {
        console.log(`错误: ${result.error}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 测试完成！\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    console.error('\n错误详情:', error.stack);
    process.exit(1);
  }
}

// 运行测试
testOptimizedCards();
