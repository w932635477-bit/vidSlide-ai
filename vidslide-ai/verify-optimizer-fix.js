/**
 * 验证优化器修复 - 快速测试脚本
 *
 * 测试SceneDesigner是否正确使用状态转移矩阵优化器
 */

import SceneDesigner from './src/agents/executors/SceneDesigner.js';

console.log('🔍 验证优化器修复\n');

// 创建测试数据
const mockScenes = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  startTime: i * 3,
  endTime: (i + 1) * 3,
  keyword: `关键词${i + 1}`,
  keywordObj: {
    text: `关键词${i + 1}`,
    english: `keyword${i + 1}`,
    subKeywords: []
  }
}));

const videoDuration = 30;

console.log(`📊 测试数据: ${mockScenes.length}个场景, 视频时长${videoDuration}秒\n`);

// 创建SceneDesigner实例
const designer = new SceneDesigner({
  log: (level, message) => {
    const prefix = {
      'info': '📝',
      'warn': '⚠️',
      'error': '❌',
      'debug': '🔍'
    }[level] || '📝';
    console.log(`${prefix} ${message}`);
  }
});

console.log('✅ SceneDesigner实例创建成功\n');

// 执行场景合并
console.log('🚀 开始执行场景合并...\n');

try {
  // 复制场景数组（避免修改原数据）
  const testScenes = JSON.parse(JSON.stringify(mockScenes));

  // 调用mergeToCardGroups
  designer.mergeToCardGroups(testScenes, videoDuration);

  console.log('\n✅ 场景合并完成！\n');

  // 统计场景类型
  const typeCount = {};
  testScenes.forEach(scene => {
    typeCount[scene.type] = (typeCount[scene.type] || 0) + 1;
  });

  console.log('📊 场景类型分布:');
  console.log(`   - 原视频: ${typeCount['original'] || 0}个`);
  console.log(`   - 卡片组: ${typeCount['card-group'] || 0}个`);
  console.log(`   - 单卡片: ${typeCount['video-with-card'] || 0}个`);
  console.log(`   - 多层场景: ${typeCount['multi-layer-composition'] || 0}个`);
  console.log(`   - 总计: ${testScenes.length}个\n`);

  // 显示场景序列
  console.log('🎬 场景序列:');
  testScenes.forEach((scene, i) => {
    const typeLabel = {
      'original': '原视频',
      'card-group': '卡片组',
      'video-with-card': '单卡片',
      'multi-layer-composition': '多层'
    }[scene.type] || scene.type;

    console.log(`   ${i + 1}. [${scene.startTime.toFixed(1)}s-${scene.endTime.toFixed(1)}s] ${typeLabel}`);
  });

  // 验证是否使用了优化器
  console.log('\n🔍 验证结果:');

  // 检查是否有多样化的场景类型
  const uniqueTypes = Object.keys(typeCount).length;
  if (uniqueTypes >= 3) {
    console.log('   ✅ 场景类型多样化（' + uniqueTypes + '种类型）');
  } else {
    console.log('   ⚠️ 场景类型不够多样化（只有' + uniqueTypes + '种类型）');
  }

  // 检查是否避免了固定交替模式
  let isAlternating = true;
  for (let i = 2; i < testScenes.length - 1; i += 2) {
    if (testScenes[i].type !== testScenes[i - 2].type) {
      isAlternating = false;
      break;
    }
  }

  if (!isAlternating) {
    console.log('   ✅ 避免了固定交替模式');
  } else {
    console.log('   ⚠️ 仍然是固定交替模式');
  }

  // 检查连续相同类型
  let maxConsecutive = 1;
  let currentConsecutive = 1;
  for (let i = 1; i < testScenes.length; i++) {
    if (testScenes[i].type === testScenes[i - 1].type) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 1;
    }
  }

  if (maxConsecutive <= 3) {
    console.log(`   ✅ 连续相同类型不超过${maxConsecutive}个`);
  } else {
    console.log(`   ⚠️ 连续相同类型过多（${maxConsecutive}个）`);
  }

  console.log('\n🎉 验证完成！');

} catch (error) {
  console.error('\n❌ 测试失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}
