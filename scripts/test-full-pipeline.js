/**
 * 完整多智能体流程测试
 * 测试从视频输入到最终合成的完整流程
 */

// 加载环境变量
import dotenv from 'dotenv';
dotenv.config();

import ContentAnalyst from '../src/agents/executors/ContentAnalyst.js';
import SceneDesigner from '../src/agents/executors/SceneDesigner.js';
import VisualDesigner from '../src/agents/executors/VisualDesigner.js';
import MaterialExpert from '../src/agents/executors/MaterialExpert.js';
import VideoEngineer from '../src/agents/executors/VideoEngineer.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 简单的logger
const logger = {
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args)
};

/**
 * 获取视频时长
 */
function getVideoDuration(videoPath) {
  try {
    const cmd = `ffprobe -v quiet -print_format json -show_format "${videoPath}"`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    const info = JSON.parse(output);
    return parseFloat(info.format.duration);
  } catch (error) {
    logger.error('获取视频时长失败:', error.message);
    return 30; // 默认30秒
  }
}

/**
 * 主测试函数
 */
async function testFullPipeline() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 VidSlide AI 完整流程测试');
  console.log('='.repeat(80));

  // 测试视频路径
  const testVideoPath = '/Users/weilei/Desktop/测试视频2.MP4';

  // 检查视频是否存在
  if (!fs.existsSync(testVideoPath)) {
    console.error('❌ 测试视频不存在:', testVideoPath);
    return false;
  }

  console.log('\n📹 测试视频:', testVideoPath);

  // 获取视频时长
  const videoDuration = getVideoDuration(testVideoPath);
  console.log(`⏱️  视频时长: ${videoDuration.toFixed(2)}秒`);

  try {
    // ========================================
    // 阶段1: ContentAnalyst - 内容分析
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('📊 阶段1: ContentAnalyst - 内容分析');
    console.log('='.repeat(80));

    const contentAnalyst = new ContentAnalyst({ logger });

    // 1.1 语音识别
    console.log('\n🎤 任务1.1: 语音转文字');
    const task_1_1 = await contentAnalyst.speechToText({
      videoPath: testVideoPath
    });
    console.log(`✅ 识别完成: ${task_1_1.wordCount}字符`);
    console.log(`   文字稿预览: ${task_1_1.transcript.substring(0, 100)}...`);

    // 1.2 文心一言分析
    console.log('\n🧠 任务1.2: 文心一言深度分析');
    const task_1_2 = await contentAnalyst.analyzeWithWenxin({
      task_1_1: task_1_1
    });
    console.log(`✅ 分析完成:`);
    console.log(`   关键词: ${task_1_2.understanding.keywords.join(', ')}`);
    console.log(`   观点数: ${task_1_2.understanding.viewpoints.length}`);
    console.log(`   解释数: ${task_1_2.understanding.explanations.length}`);

    // ========================================
    // 阶段2: SceneDesigner - 场景设计
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('🎬 阶段2: SceneDesigner - 场景设计');
    console.log('='.repeat(80));

    const sceneDesigner = new SceneDesigner({ logger });

    console.log('\n🎞️  任务2.1: 场景拆解');
    const task_2_1 = await sceneDesigner.decomposeScenes({
      task_1_2: task_1_2,
      videoDuration: videoDuration
    });
    console.log(`✅ 场景设计完成:`);
    console.log(`   总场景数: ${task_2_1.scenes.length}`);
    console.log(`   原视频占比: ${task_2_1.stats.originalRatio}%`);
    console.log(`   卡片场景: ${task_2_1.stats.cardScenes}个`);
    console.log(`   多层场景: ${task_2_1.stats.multiLayerScenes}个`);

    // ========================================
    // 阶段3: VisualDesigner - 视觉设计
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('🎨 阶段3: VisualDesigner - 视觉设计');
    console.log('='.repeat(80));

    const visualDesigner = new VisualDesigner({ logger });

    // 3.1 设计卡片
    console.log('\n🎴 任务3.1: 设计卡片');
    const task_3_1 = await visualDesigner.designCards({
      task_2_1: task_2_1
    });
    console.log(`✅ 卡片设计完成: ${task_3_1.cards.length}个`);

    // 3.2 生成背景
    console.log('\n🖼️  任务3.2: 生成背景');
    const task_3_2 = await visualDesigner.generateBackgrounds({
      task_2_1: task_2_1
    });
    console.log(`✅ 背景生成完成: ${task_3_2.backgrounds.length}个`);

    // ========================================
    // 阶段4: MaterialExpert - 素材准备
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('📦 阶段4: MaterialExpert - 素材准备');
    console.log('='.repeat(80));

    const materialExpert = new MaterialExpert({ logger });

    console.log('\n🔍 任务4.1: 生成素材');
    const task_4_1 = await materialExpert.generateMaterials({
      task_1_2: task_1_2,
      task_2_1: task_2_1
    });
    console.log(`✅ 素材准备完成: ${task_4_1.materials?.length || 0}个`);

    // ========================================
    // 阶段5: VideoEngineer - 视频合成
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('🎬 阶段5: VideoEngineer - 视频合成');
    console.log('='.repeat(80));

    const videoEngineer = new VideoEngineer({ logger });

    // 5.1 提取人脸（可选）
    console.log('\n👤 任务5.1: 提取人脸');
    const task_5_1 = await videoEngineer.extractFace({
      videoPath: testVideoPath
    });
    if (task_5_1.faceVideo) {
      console.log(`✅ 人脸提取完成`);
    } else {
      console.log(`⚠️  未检测到人脸，跳过`);
    }

    // 5.2 合成视频
    console.log('\n🎞️  任务5.2: 合成最终视频');
    const task_5_2 = await videoEngineer.composeVideo({
      videoPath: testVideoPath,
      task_2_1: task_2_1,
      task_3_1: task_4_1,  // 素材
      task_3_2: task_3_1,  // 卡片
      task_3_3: task_3_2,  // 背景
      task_3_4: task_5_1   // 人脸
    });
    console.log(`✅ 视频合成完成`);
    console.log(`   输出路径: ${task_5_2.finalVideo}`);
    console.log(`   文件大小: ${(task_5_2.performance.fileSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   耗时: ${(task_5_2.performance.duration / 1000).toFixed(2)}秒`);

    // ========================================
    // 最终总结
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('✅ 完整流程测试成功！');
    console.log('='.repeat(80));
    console.log('\n📊 流程总结:');
    console.log(`   1. 语音识别: ${task_1_1.wordCount}字符`);
    console.log(`   2. 内容分析: ${task_1_2.understanding.keywords.length}个关键词`);
    console.log(`   3. 场景设计: ${task_2_1.scenes.length}个场景`);
    console.log(`   4. 视觉设计: ${task_3_1.cards.length}个卡片`);
    console.log(`   5. 素材准备: ${task_4_1.materials?.length || 0}个素材`);
    console.log(`   6. 视频合成: 完成`);
    console.log(`\n🎉 最终视频: ${task_5_2.finalVideo}`);
    console.log('='.repeat(80));

    return true;

  } catch (error) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ 测试失败');
    console.log('='.repeat(80));
    console.error('\n错误信息:', error.message);
    console.error('\n错误堆栈:', error.stack);

    console.log('\n💡 可能的原因:');
    console.log('   1. 测试视频文件不存在或损坏');
    console.log('   2. FFmpeg未安装或不在PATH中');
    console.log('   3. API密钥错误或网络问题');
    console.log('   4. 依赖服务未正确初始化');
    console.log('   5. 磁盘空间不足');

    return false;
  }
}

// 运行测试
testFullPipeline().then(success => {
  process.exit(success ? 0 : 1);
});
