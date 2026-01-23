/**
 * 真实视频生成测试 - 跳过ASR，直接使用模拟数据
 */

import path from 'path';
import { fileURLToPath } from 'url';
import ContentAnalyst from '../src/agents/executors/ContentAnalyst.js';
import SceneDesigner from '../src/agents/executors/SceneDesigner.js';
import VisualDesigner from '../src/agents/executors/VisualDesigner.js';
import VideoEngineer from '../src/agents/executors/VideoEngineer.js';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateRealVideo() {
  console.log('🎬 生成真实视频+卡片效果\n');
  console.log('='.repeat(80));

  try {
    const videoPath = '/Users/weilei/Desktop/测试视频2.MP4';
    console.log(`\n📹 输入视频: ${videoPath}`);

    // 获取视频时长
    const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
    const durationStr = execSync(durationCmd, { encoding: 'utf-8' }).trim();
    const videoDuration = parseFloat(durationStr);
    console.log(`⏱️  视频时长: ${videoDuration.toFixed(2)}秒`);

    // 模拟内容理解结果
    const understanding = {
      keywords: [
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
      ],
      viewpoints: [
        {
          text: '强化学习通过试错学习',
          timestamp: 10,
          importance: 'high'
        },
        {
          text: '涌现是量变到质变',
          timestamp: 30,
          importance: 'high'
        }
      ],
      explanations: [
        {
          keyword: '强化学习',
          explanation: '通过不断试错和奖励机制让AI学会做出最优决策',
          relatedKeywords: ['机器学习', 'AI']
        }
      ],
      intent: '教育',
      tone: '专业',
      targetAudience: 'AI学习者'
    };

    console.log('\n✅ 内容理解完成');
    console.log(`   关键词: ${understanding.keywords.map(k => k.text).join('、')}`);

    // 场景设计
    console.log('\n🎨 场景设计中...');
    const sceneDesigner = new SceneDesigner();
    const sceneResult = await sceneDesigner.decomposeScenes({
      task_1_2: { understanding },
      videoDuration
    });
    const scenes = sceneResult.scenes;
    console.log(`✅ 场景设计完成: ${scenes.length}个场景`);

    // 视觉设计（生成卡片）
    console.log('\n🎨 生成卡片中...');
    const visualDesigner = new VisualDesigner();
    const cardResult = await visualDesigner.designCards({
      task_2_1: { scenes }
    });
    const cards = cardResult.cards;
    console.log(`✅ 卡片生成完成: ${cards.length}个卡片`);
    cards.forEach((card, i) => {
      console.log(`   ${i + 1}. ${card.keywordObj.text} (${card.keywordObj.english})`);
    });

    // 视频合成
    console.log('\n🎬 视频合成中...');
    const videoEngineer = new VideoEngineer();
    const result = await videoEngineer.composeVideo({
      videoPath,
      task_2_1: { scenes },
      task_3_1: { materials: [] },  // 素材
      task_3_2: { cards },           // 卡片
      outputDir: path.join(__dirname, '../../output')
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ 视频生成成功！');
    console.log(`\n📹 输出路径: ${result.finalVideo}`);
    console.log('\n正在打开视频...');

    // 打开生成的视频
    execSync(`open "${result.finalVideo}"`);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 完成！请查看生成的视频效果\n');

  } catch (error) {
    console.error('\n❌ 生成失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

generateRealVideo();
