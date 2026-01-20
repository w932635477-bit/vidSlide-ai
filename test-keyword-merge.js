#!/usr/bin/env node

/**
 * 测试关键词合并逻辑
 */

import MicroSceneGenerator from './vidslide-ai/src/services/MicroSceneGenerator.js'

console.log('🧪 测试关键词合并逻辑\n')

// 模拟关键词时间戳（距离很近的关键词）
const keywordTimestamps = [
  { time: 5.0, text: '流量', importance: 0.8, context: '如何获取流量' },
  { time: 5.5, text: '巨量AD', importance: 0.7, context: '使用巨量AD投放' },
  { time: 6.0, text: '投放', importance: 0.6, context: '投放广告的技巧' },
  { time: 10.0, text: '转化', importance: 0.9, context: '提高转化率' },
  { time: 15.0, text: 'ROI', importance: 0.8, context: '优化ROI' }
]

console.log('📊 原始关键词时间戳:')
keywordTimestamps.forEach((kw, i) => {
  console.log(`  ${i + 1}. "${kw.text}" @ ${kw.time}s (重要性: ${kw.importance})`)
})

console.log('\n🔗 开始合并...\n')

// 测试合并逻辑（MicroSceneGenerator 是一个实例，不是类）
const mergedGroups = MicroSceneGenerator.mergeCloseKeywords(keywordTimestamps)

console.log('\n✅ 合并结果:')
mergedGroups.forEach((group, i) => {
  console.log(`\n组 ${i + 1}:`)
  console.log(`  关键词: [${group.keywords.join(', ')}]`)
  console.log(`  时间: ${group.startTime.toFixed(1)}s - ${group.endTime.toFixed(1)}s`)
  console.log(`  持续: ${(group.endTime - group.startTime).toFixed(1)}s`)
  console.log(`  重要性: ${group.importance.toFixed(2)}`)
})

console.log('\n📈 统计:')
console.log(`  原始关键词数: ${keywordTimestamps.length}`)
console.log(`  合并后组数: ${mergedGroups.length}`)
console.log(`  合并率: ${((1 - mergedGroups.length / keywordTimestamps.length) * 100).toFixed(1)}%`)

console.log('\n✅ 测试完成！')
