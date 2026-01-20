/**
 * 简化流程端到端测试
 *
 * 测试内容：
 * 1. 视频分析
 * 2. 关键词提取
 * 3. 豆包生图
 * 4. 模板渲染
 * 5. 视频合成
 */

import MasterAutoGenerationAgent from './vidslide-ai/src/services/MasterAutoGenerationAgent.js';

async function testSimplifiedFlow() {
  console.log('🚀 开始测试简化流程\n');

  try {
    // 1. 准备测试视频（从命令行参数获取）
    const testVideoPath = process.argv[2];

    if (!testVideoPath) {
      console.error('❌ 请提供视频路径作为参数');
      console.log('用法: node test-simplified-flow.js <视频路径>');
      process.exit(1);
    }

    console.log('📹 测试视频:', testVideoPath);

    // 2. 创建 Agent 实例
    const agent = new MasterAutoGenerationAgent();

    // 3. 运行完整流程
    console.log('\n🎬 开始一键生成...\n');

    const result = await agent.autoGenerate(testVideoPath, (progress) => {
      console.log(`📊 进度: ${(progress * 100).toFixed(1)}%`);
    });

    // 4. 输出结果
    console.log('\n✅ 生成完成！');
    console.log('📦 结果:', {
      videoUrl: result.videoUrl,
      duration: result.duration,
      scenes: result.scenes?.length || 0,
      keywords: result.keywords?.length || 0
    });

    // 5. 验证关键点
    console.log('\n🔍 验证关键点:');

    // 检查是否使用了豆包生图
    const hasDoubaoImages = result.scenes?.some(scene =>
      scene.type === 'composition' && scene.imageUrl
    );
    console.log('  ✓ 豆包生图:', hasDoubaoImages ? '✅' : '❌');

    // 检查是否使用了新模板
    const usedTemplates = new Set(
      result.scenes
        ?.filter(s => s.type === 'composition')
        .map(s => s.template)
    );
    console.log('  ✓ 使用的模板:', Array.from(usedTemplates).join(', '));

    // 检查是否有组合场景
    const compositionScenes = result.scenes?.filter(s => s.type === 'composition') || [];
    console.log('  ✓ 组合场景数量:', compositionScenes.length);

    // 检查是否有原视频片段
    const originalScenes = result.scenes?.filter(s => s.type === 'original') || [];
    console.log('  ✓ 原视频片段数量:', originalScenes.length);

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
testSimplifiedFlow();
