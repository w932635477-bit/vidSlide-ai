/**
 * ContentAnalyst完整功能测试
 * 测试语音识别 + 文心一言分析的完整流程
 */

import ContentAnalyst from '../src/agents/executors/ContentAnalyst.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n' + '='.repeat(60));
console.log('🧪 ContentAnalyst完整功能测试');
console.log('='.repeat(60));

// 简单的logger
const logger = {
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args)
};

async function testContentAnalyst() {
  const analyst = new ContentAnalyst({ logger });

  try {
    // 检查测试视频文件
    const testVideoPath = path.join(__dirname, '../vidslide-ai/test-videos/test-video.mp4');
    console.log('\n📹 测试视频路径:', testVideoPath);

    // 测试1: 语音识别
    console.log('\n' + '='.repeat(60));
    console.log('测试1: 语音转文字');
    console.log('='.repeat(60));

    const speechResult = await analyst.speechToText({
      videoPath: testVideoPath
    });

    console.log('\n✅ 语音识别完成');
    console.log(`   文字稿长度: ${speechResult.wordCount}字符`);
    console.log(`   文字稿预览: ${speechResult.transcript.substring(0, 100)}...`);

    // 测试2: 文心一言分析
    console.log('\n' + '='.repeat(60));
    console.log('测试2: 文心一言深度分析');
    console.log('='.repeat(60));

    const analysisResult = await analyst.analyzeWithWenxin({
      task_1_1: speechResult
    });

    console.log('\n✅ 内容分析完成');
    console.log(`   关键词数量: ${analysisResult.understanding.keywords.length}`);
    console.log(`   关键词: ${analysisResult.understanding.keywords.join(', ')}`);
    console.log(`   观点数量: ${analysisResult.understanding.viewpoints.length}`);
    console.log(`   解释数量: ${analysisResult.understanding.explanations.length}`);
    console.log(`   作者意图: ${analysisResult.understanding.intent}`);

    // 显示详细结果
    console.log('\n' + '='.repeat(60));
    console.log('📊 详细分析结果');
    console.log('='.repeat(60));

    console.log('\n【关键词】');
    analysisResult.understanding.keywords.forEach((keyword, i) => {
      console.log(`  ${i + 1}. ${keyword}`);
    });

    console.log('\n【观点】');
    analysisResult.understanding.viewpoints.forEach((vp, i) => {
      console.log(`  ${i + 1}. ${vp.text} (${vp.importance})`);
      if (vp.timestamp) {
        console.log(`     时间: ${vp.timestamp.start}s - ${vp.timestamp.end}s`);
      }
    });

    console.log('\n【解释】');
    analysisResult.understanding.explanations.forEach((exp, i) => {
      console.log(`  ${i + 1}. 关键词: ${exp.keyword}`);
      console.log(`     解释: ${exp.text}`);
      if (exp.timestamp) {
        console.log(`     时间: ${exp.timestamp.start}s - ${exp.timestamp.end}s`);
      }
    });

    // 最终结果
    console.log('\n' + '='.repeat(60));
    console.log('✅ ContentAnalyst所有功能测试通过！');
    console.log('='.repeat(60));
    console.log('\n📌 系统状态:');
    console.log('   ✅ 百度语音识别: 正常工作');
    console.log('   ✅ 文心一言分析: 正常工作');
    console.log('   ✅ ContentAnalyst: 完全就绪');
    console.log('\n📌 下一步:');
    console.log('   继续实现其他智能体（SceneDesigner, VisualDesigner等）');
    console.log('='.repeat(60));

    return true;

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ 测试失败');
    console.log('='.repeat(60));
    console.error('\n错误信息:', error.message);
    console.error('\n错误堆栈:', error.stack);

    console.log('\n💡 可能的原因:');
    console.log('   1. 测试视频文件不存在');
    console.log('   2. FFmpeg未安装或不在PATH中');
    console.log('   3. 百度ASR API密钥错误');
    console.log('   4. 文心一言API密钥错误');
    console.log('   5. 网络连接问题');

    return false;
  }
}

// 运行测试
testContentAnalyst();
