/**
 * 测试高级提示词生成器和智能排版服务
 */

import { getInstance as getPromptGenerator } from './vidslide-ai/src/services/AdvancedPromptGenerator.js';
import { getInstance as getLayoutService } from './vidslide-ai/src/services/SmartLayoutService.js';

const promptGenerator = getPromptGenerator();
const layoutService = getLayoutService();

console.log('🎨 测试高级提示词生成器和智能排版服务\n');
console.log('='.repeat(80));

// 测试关键词
const keywords = [
  '人工智能',
  '大数据分析',
  '云计算',
  '区块链技术',
  '物联网'
];

console.log('\n📝 第一部分：高级提示词生成\n');
console.log('-'.repeat(80));

keywords.forEach((keyword, index) => {
  console.log(`\n${index + 1}. 关键词: ${keyword}`);
  console.log('-'.repeat(40));

  // 生成不同风格的提示词
  const styles = ['tech', 'business', 'data', 'emphasis'];
  const style = styles[index % styles.length];

  const prompt = promptGenerator.generate(keyword, {
    stylePreset: style,
    sceneType: index % 3 === 0 ? 'emphasis' : 'basic',
    includeEffects: true,
    randomize: true
  });

  console.log(`风格: ${style}`);
  console.log(`提示词: ${prompt}`);
  console.log(`长度: ${prompt.length} 字符`);
});

console.log('\n\n📐 第二部分：智能排版生成\n');
console.log('-'.repeat(80));

// 生成5个场景的布局
const layouts = layoutService.generateBatchLayouts(5, {
  avoidRepeat: true
});

layouts.forEach((layout, index) => {
  console.log(`\n场景 ${index + 1}:`);
  console.log('-'.repeat(40));
  console.log(`尺寸: ${layout.size.width}x${layout.size.height} (缩放: ${layout.size.scale})`);
  console.log(`位置: (${layout.position.x}, ${layout.position.y}) - ${layout.position.anchor}`);
  console.log(`样式: 边框${layout.style.borderColor} ${layout.style.borderWidth}px, 圆角${layout.style.borderRadius}px`);
  console.log(`发光: ${layout.style.glowColor} (强度: ${layout.style.glowIntensity})`);
  console.log(`动画: ${layout.animation.type} (${layout.animation.duration}s)`);

  // 检查PIP重叠
  const overlap = layoutService.checkPIPOverlap(layout);
  console.log(`PIP重叠: ${overlap ? '❌ 是' : '✅ 否'}`);
});

console.log('\n\n🎬 第三部分：完整流程演示\n');
console.log('-'.repeat(80));

// 模拟完整的生成流程
keywords.forEach((keyword, index) => {
  console.log(`\n场景 ${index + 1}: ${keyword}`);
  console.log('-'.repeat(40));

  // 1. 生成提示词
  const prompt = promptGenerator.generate(keyword, {
    stylePreset: ['tech', 'business', 'data'][index % 3],
    sceneType: 'basic',
    includeEffects: true
  });

  console.log(`📝 豆包提示词:`);
  console.log(`   ${prompt}`);

  // 2. 生成布局
  const layout = layoutService.generateLayout({
    sceneIndex: index,
    totalScenes: keywords.length,
    importance: index === 0 ? 'high' : 'normal',
    contentType: index % 3 === 0 ? 'emphasis' : 'general'
  });

  console.log(`\n📐 排版配置:`);
  console.log(`   尺寸: ${layout.size.width}x${layout.size.height}`);
  console.log(`   位置: (${layout.position.x}, ${layout.position.y})`);
  console.log(`   边框: ${layout.style.borderColor} ${layout.style.borderWidth}px`);
  console.log(`   圆角: ${layout.style.borderRadius}px`);
  console.log(`   发光: ${layout.style.glowColor} (${layout.style.glowIntensity})`);

  // 3. 生成FFmpeg命令（示例）
  console.log(`\n🎥 FFmpeg滤镜:`);
  console.log(`   ${layoutService.generateFFmpegFilter(layout, index + 1)}`);
});

console.log('\n\n✅ 测试完成！\n');
console.log('='.repeat(80));

// 统计信息
console.log('\n📊 统计信息:');
console.log(`   测试关键词数: ${keywords.length}`);
console.log(`   生成提示词数: ${keywords.length}`);
console.log(`   生成布局数: ${layouts.length}`);
console.log(`   平均提示词长度: ${Math.round(keywords.reduce((sum, kw) => {
  const p = promptGenerator.generate(kw);
  return sum + p.length;
}, 0) / keywords.length)} 字符`);

console.log('\n💡 关键改进:');
console.log('   ✅ 提示词包含详细视觉效果（边框、圆角、阴影、发光）');
console.log('   ✅ 智能排版避免PIP遮挡');
console.log('   ✅ 样式多样化，不千篇一律');
console.log('   ✅ 自动生成FFmpeg滤镜命令');
console.log('');
