/**
 * 生成卡片样本 - 展示实际效果
 */

import ProfessionalCardGenerator from '../src/services/ProfessionalCardGenerator.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateCardSamples() {
  console.log('🎨 生成卡片样本...\n');

  const generator = new ProfessionalCardGenerator();

  // 测试数据：模拟优化后的关键词对象
  const testKeywords = [
    {
      text: '巨量ad',
      english: 'Massive AD',
      category: 'platform'
    },
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

  const styles = ['blue', 'yellow', 'purple'];

  console.log('生成3个样本卡片：\n');

  for (let i = 0; i < testKeywords.length; i++) {
    const keyword = testKeywords[i];
    const style = styles[i];

    console.log(`${i + 1}. 生成卡片: ${keyword.text} (${keyword.english})`);
    console.log(`   样式: ${style}`);

    try {
      const cardPath = await generator.generateCard(keyword, {
        style: style,
        width: 600,
        height: 300,
        fontSize: 72,
        fontWeight: 'bold',
        cornerRadius: 20,
        shadowBlur: 20,
        addDecoration: true
      });

      console.log(`   ✅ 生成成功: ${cardPath}\n`);
    } catch (error) {
      console.error(`   ❌ 生成失败: ${error.message}\n`);
    }
  }

  console.log('🎉 所有卡片样本生成完成！');
  console.log(`\n📁 输出目录: ${generator.outputDir}`);
  console.log('\n请查看生成的卡片图片，验证：');
  console.log('  ✅ 尺寸: 600x300');
  console.log('  ✅ 中文主标题（大字）');
  console.log('  ✅ 英文副标题（小字）');
  console.log('  ✅ 渐变背景');
  console.log('  ✅ 圆角效果');
}

// 运行
generateCardSamples().catch(console.error);
