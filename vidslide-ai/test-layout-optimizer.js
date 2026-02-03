/**
 * 测试状态转移矩阵优化器的实际效果
 *
 * 对比优化前后的场景序列
 */

import { SimpleLayoutOptimizer } from './src/services/SimpleLayoutOptimizer.js';

// 模拟场景数据
const mockScenes = [
  { id: 1, startTime: 0, endTime: 3, keyword: '人工智能', text: '人工智能' },
  { id: 2, startTime: 3, endTime: 6, keyword: '机器学习', text: '机器学习' },
  { id: 3, startTime: 6, endTime: 9, keyword: '深度学习', text: '深度学习' },
  { id: 4, startTime: 9, endTime: 12, keyword: '神经网络', text: '神经网络' },
  { id: 5, startTime: 12, endTime: 15, keyword: '自然语言处理', text: '自然语言处理' },
  { id: 6, startTime: 15, endTime: 18, keyword: '计算机视觉', text: '计算机视觉' },
  { id: 7, startTime: 18, endTime: 21, keyword: '强化学习', text: '强化学习' },
  { id: 8, startTime: 21, endTime: 24, keyword: '迁移学习', text: '迁移学习' },
  { id: 9, startTime: 24, endTime: 27, keyword: '生成对抗网络', text: '生成对抗网络' },
  { id: 10, startTime: 27, endTime: 30, keyword: '大语言模型', text: '大语言模型' }
];

const videoDuration = 30;

console.log('🎬 状态转移矩阵优化器测试\n');
console.log('=' .repeat(60));

// 创建优化器
const optimizer = new SimpleLayoutOptimizer({
  log: (level, message) => {
    const prefix = {
      'info': '📊',
      'debug': '🔍',
      'warn': '⚠️'
    }[level] || '  ';
    console.log(`${prefix} ${message}`);
  }
});

// 测试1：基础优化
console.log('\n📋 测试1：基础场景优化');
console.log('-'.repeat(60));

const scenes1 = JSON.parse(JSON.stringify(mockScenes));
const optimized1 = optimizer.generateOptimizedSequence(scenes1, videoDuration);

console.log('\n场景序列:');
optimized1.forEach((scene, index) => {
  console.log(`  ${index + 1}. [${scene.startTime}s-${scene.endTime}s] ${scene.type} - ${scene.keyword}`);
});

// 测试2：验证序列合理性
console.log('\n\n📋 测试2：序列验证');
console.log('-'.repeat(60));

const validation = optimizer.validateSequence(optimized1);
console.log(`验证结果: ${validation.valid ? '✅ 通过' : '❌ 失败'}`);
if (!validation.valid) {
  console.log('问题列表:');
  validation.issues.forEach(issue => console.log(`  - ${issue}`));
}

// 测试3：多次运行，观察随机性
console.log('\n\n📋 测试3：随机性测试（运行10次）');
console.log('-'.repeat(60));

const typeDistributions = [];
for (let i = 0; i < 10; i++) {
  const scenes = JSON.parse(JSON.stringify(mockScenes));
  const optimized = optimizer.generateOptimizedSequence(scenes, videoDuration, {
    rules: {}
  });

  const typeCount = {};
  optimized.forEach(scene => {
    typeCount[scene.type] = (typeCount[scene.type] || 0) + 1;
  });

  typeDistributions.push(typeCount);
}

console.log('\n场景类型分布统计:');
const avgDistribution = {};
const types = ['original', 'card-group', 'video-with-card', 'multi-layer-composition'];

types.forEach(type => {
  const counts = typeDistributions.map(d => d[type] || 0);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  avgDistribution[type] = { avg, min, max };

  console.log(`  ${type}:`);
  console.log(`    平均: ${avg.toFixed(1)}个 (${(avg/mockScenes.length*100).toFixed(1)}%)`);
  console.log(`    范围: ${min}-${max}个`);
});

// 测试4：内容密度影响
console.log('\n\n📋 测试4：内容密度计算');
console.log('-'.repeat(60));

const densityTests = [
  { startTime: 0, windowSize: 5, label: '开始5秒' },
  { startTime: 10, windowSize: 5, label: '中间5秒' },
  { startTime: 20, windowSize: 5, label: '结尾5秒' }
];

densityTests.forEach(test => {
  const density = optimizer.calculateSimpleDensity(mockScenes, test.startTime, test.windowSize);
  console.log(`\n${test.label}:`);
  console.log(`  密度: ${density.density.toFixed(2)} (关键词/秒)`);
  console.log(`  复杂度: ${density.complexity.toFixed(2)}`);
  console.log(`  综合得分: ${density.score.toFixed(2)}`);
});

// 测试5：对比优化前后
console.log('\n\n📋 测试5：优化前后对比');
console.log('-'.repeat(60));

// 模拟原有的交替逻辑
function simulateAlternating(scenes) {
  const types = ['card-group', 'multi-layer-composition'];
  return scenes.map((scene, index) => {
    if (index === 0 || index === scenes.length - 1) {
      return { ...scene, type: 'original' };
    }
    return { ...scene, type: types[index % 2] };
  });
}

const scenesOld = JSON.parse(JSON.stringify(mockScenes));
const oldSequence = simulateAlternating(scenesOld);

const scenesNew = JSON.parse(JSON.stringify(mockScenes));
const newSequence = optimizer.generateOptimizedSequence(scenesNew, videoDuration);

console.log('\n原有逻辑（交替）:');
oldSequence.forEach((scene, index) => {
  console.log(`  ${index + 1}. ${scene.type}`);
});

console.log('\n新逻辑（状态转移矩阵）:');
newSequence.forEach((scene, index) => {
  console.log(`  ${index + 1}. ${scene.type}`);
});

// 计算多样性指标
function calculateDiversity(sequence) {
  let changes = 0;
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i].type !== sequence[i-1].type) {
      changes++;
    }
  }
  return changes / (sequence.length - 1);
}

const oldDiversity = calculateDiversity(oldSequence);
const newDiversity = calculateDiversity(newSequence);

console.log('\n多样性指标（场景切换频率）:');
console.log(`  原有逻辑: ${(oldDiversity * 100).toFixed(1)}%`);
console.log(`  新逻辑: ${(newDiversity * 100).toFixed(1)}%`);
console.log(`  提升: ${((newDiversity - oldDiversity) * 100).toFixed(1)}%`);

// 测试6：动态时长
console.log('\n\n📋 测试6：动态时长调整');
console.log('-'.repeat(60));

const sceneTypes = ['original', 'card-group', 'video-with-card', 'multi-layer-composition'];
const densityLevels = [
  { score: 0.2, label: '低密度' },
  { score: 0.5, label: '中密度' },
  { score: 0.9, label: '高密度' }
];

sceneTypes.forEach(type => {
  console.log(`\n${type}:`);
  densityLevels.forEach(level => {
    const duration = optimizer.calculateDynamicDuration(type, level);
    console.log(`  ${level.label}: ${duration}秒`);
  });
});

console.log('\n' + '='.repeat(60));
console.log('✅ 测试完成！\n');
