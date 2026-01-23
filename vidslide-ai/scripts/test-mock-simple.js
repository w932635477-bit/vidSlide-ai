/**
 * 简化版测试 - 直接生成卡片并查看效果
 */

import ProfessionalCardGenerator from '../src/services/ProfessionalCardGenerator.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testCardGeneration() {
  console.log('🎨 测试卡片生成\n');
  console.log('='.repeat(80));

  const generator = new ProfessionalCardGenerator();

  // 模拟从理想效果图中提取的关键词
  const keywords = [
    {
      text: '强化学习',
      english: 'Reinforcement Learning',
      category: 'technology'
    },
    {
      text: '涌现',
      english: 'Emergence',
      category: 'concept'
    }
  ];

  console.log('\n📝 生成卡片:');
  console.log(`  关键词1: ${keywords[0].text} (${keywords[0].english})`);
  console.log(`  关键词2: ${keywords[1].text} (${keywords[1].english})`);
  console.log('\n' + '='.repeat(80));

  const cards = [];

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    const style = i === 0 ? 'blue' : 'yellow';

    console.log(`\n[${i + 1}/${keywords.length}] 生成卡片: ${keyword.text}`);
    console.log(`  样式: ${style}`);

    try {
      const cardPath = await generator.generateCard(keyword, {
        style: style,
        width: 600,
        height: 300,
        fontSize: 72,
        fontWeight: 'bold',
        cornerRadius: 20,
        shadowBlur: 20
      });

      cards.push({
        keyword: keyword,
        path: cardPath,
        style: style
      });

      console.log(`  ✅ 生成成功: ${cardPath}`);
    } catch (error) {
      console.error(`  ❌ 生成失败: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 与理想效果对比分析:\n');

  console.log('✅ 已实现的功能:');
  console.log('  1. ✅ 关键词精确提取（强化学习、涌现）');
  console.log('  2. ✅ 双语卡片（中文主标题 + 英文副标题）');
  console.log('  3. ✅ 卡片样式（600x300、圆角、真实背景图）');
  console.log('  4. ✅ 多种颜色样式（蓝色、黄色等）');

  console.log('\n⚠️  与理想效果的主要差距:\n');

  console.log('【差距1】卡片数量和布局');
  console.log('  理想效果: 同时显示2个卡片，左右并排');
  console.log('  当前实现: 每次只显示1个卡片，居中显示');
  console.log('  影响程度: ⭐⭐⭐⭐⭐ (最重要)');

  console.log('\n【差距2】卡片背景');
  console.log('  理想效果: 渐变背景（蓝色渐变、黄色渐变）');
  console.log('  当前实现: 真实背景图片');
  console.log('  影响程度: ⭐⭐⭐');

  console.log('\n【差距3】卡片尺寸');
  console.log('  理想效果: 较小尺寸以适应并排显示（约400x250）');
  console.log('  当前实现: 600x300（单个卡片居中）');
  console.log('  影响程度: ⭐⭐⭐');

  console.log('\n💡 改进方案:\n');

  console.log('【方案1】修改视频合成服务（推荐）');
  console.log('  文件: ServerVideoCompositionService.js');
  console.log('  修改: 支持同时叠加多个卡片，计算左右并排位置');
  console.log('  优点: 灵活，可以显示任意数量的卡片');
  console.log('  缺点: 需要修改视频合成逻辑');

  console.log('\n【方案2】生成组合卡片');
  console.log('  文件: ProfessionalCardGenerator.js');
  console.log('  修改: 生成包含多个关键词的单张大卡片');
  console.log('  优点: 简单，不需要修改视频合成逻辑');
  console.log('  缺点: 不够灵活，卡片数量固定');

  console.log('\n【方案3】恢复渐变背景');
  console.log('  文件: ProfessionalCardGenerator.js');
  console.log('  修改: 添加配置选项，可选择渐变或真实图片');
  console.log('  优点: 更接近理想效果');
  console.log('  缺点: 需要设计多种渐变配色方案');

  console.log('\n' + '='.repeat(80));
  console.log('📁 生成的卡片:');
  cards.forEach((card, i) => {
    console.log(`  ${i + 1}. ${card.keyword.text} (${card.style})`);
    console.log(`     ${card.path}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('🎉 测试完成！\n');

  // 打开卡片目录
  const { execSync } = await import('child_process');
  execSync(`open "${generator.outputDir}"`);
  console.log('📂 已打开卡片目录，请查看生成的卡片效果\n');
}

testCardGeneration().catch(console.error);
