#!/usr/bin/env node

/**
 * 测试单个段落的微场景生成
 * MVP 测试：验证一个段落的处理逻辑
 */

import MicroSceneGenerator from './vidslide-ai/src/services/MicroSceneGenerator.js'

console.log('🧪 测试单个段落的微场景生成\n')
console.log('=' .repeat(60))

// 模拟一个主场景（segment）
const mainScene = {
  id: 0,
  startTime: 0,
  endTime: 10,
  title: '测试场景',
  // 模拟字幕（绝对时间）
  transcript: [
    { text: '如何在抖音上获取流量', startTime: 0, endTime: 2 },
    { text: '使用巨量AD投放广告', startTime: 2, endTime: 4 },
    { text: '提高粉丝转化率', startTime: 4, endTime: 6 },
    { text: '优化投放策略', startTime: 6, endTime: 8 },
    { text: '获得更好的ROI', startTime: 8, endTime: 10 }
  ]
}

// 模拟关键词
const keywords = [
  { text: '流量', score: 0.9 },
  { text: '抖音', score: 0.8 },
  { text: '巨量AD', score: 0.7 },
  { text: '粉丝', score: 0.6 },
  { text: '投放', score: 0.8 },
  { text: 'ROI', score: 0.7 }
]

// 模拟素材
const materials = [
  { id: 1, url: 'material1.jpg', title: '流量素材' },
  { id: 2, url: 'material2.jpg', title: '广告素材' },
  { id: 3, url: 'material3.jpg', title: '数据素材' }
]

console.log('\n📋 输入数据:')
console.log(`  主场景: ${mainScene.startTime}s - ${mainScene.endTime}s`)
console.log(`  字幕片段: ${mainScene.transcript.length} 个`)
console.log(`  关键词: ${keywords.length} 个`)
console.log(`  素材: ${materials.length} 个`)

console.log('\n📝 字幕内容:')
mainScene.transcript.forEach((t, i) => {
  console.log(`  ${i + 1}. "${t.text}" @ ${t.startTime}s - ${t.endTime}s`)
})

console.log('\n🔑 关键词列表:')
keywords.forEach((k, i) => {
  console.log(`  ${i + 1}. "${k.text}" (重要性: ${k.score})`)
})

console.log('\n' + '='.repeat(60))
console.log('\n🚀 开始生成微场景...\n')

// 生成微场景
const microScenes = MicroSceneGenerator.generateMicroScenes(
  mainScene,
  keywords,
  materials
)

console.log('\n' + '='.repeat(60))
console.log('\n📊 生成结果分析:\n')

console.log(`✅ 总共生成 ${microScenes.length} 个微场景`)

// 统计
const compositionScenes = microScenes.filter(s => s.type === 'composition')
const originalScenes = microScenes.filter(s => s.type === 'original')

console.log(`  - 🎨 组合场景: ${compositionScenes.length} 个`)
console.log(`  - 📹 原视频片段: ${originalScenes.length} 个`)

console.log('\n📋 详细场景列表:\n')
microScenes.forEach((scene, i) => {
  const icon = scene.type === 'composition' ? '🎨' : '📹'
  const type = scene.type === 'composition' ? '组合场景' : '原视频'
  const duration = (scene.endTime - scene.startTime).toFixed(1)

  console.log(`${i + 1}. ${icon} ${type}`)
  console.log(`   时间: ${scene.startTime.toFixed(1)}s - ${scene.endTime.toFixed(1)}s (持续 ${duration}s)`)

  if (scene.type === 'composition') {
    console.log(`   关键词: ${scene.keyword}`)
    console.log(`   模板: ${scene.template}`)
    console.log(`   重要性: ${scene.importance.toFixed(2)}`)
    console.log(`   PIP配置: ${JSON.stringify(scene.pipConfig)}`)
  }
  console.log('')
})

console.log('='.repeat(60))
console.log('\n✅ 测试完成！\n')

// 验证结果
console.log('🔍 验证结果:\n')

let hasComposition = compositionScenes.length > 0
let hasOriginal = originalScenes.length > 0
let timelineContinuous = true

// 检查时间线是否连续
for (let i = 1; i < microScenes.length; i++) {
  if (Math.abs(microScenes[i].startTime - microScenes[i - 1].endTime) > 0.1) {
    timelineContinuous = false
    console.log(`⚠️ 时间线不连续: 场景 ${i} 和场景 ${i + 1} 之间有间隙`)
  }
}

console.log(`${hasComposition ? '✅' : '❌'} 包含组合场景`)
console.log(`${hasOriginal ? '✅' : '❌'} 包含原视频片段`)
console.log(`${timelineContinuous ? '✅' : '❌'} 时间线连续`)
console.log(`${microScenes[0].startTime === mainScene.startTime ? '✅' : '❌'} 开始时间正确`)
console.log(`${microScenes[microScenes.length - 1].endTime === mainScene.endTime ? '✅' : '❌'} 结束时间正确`)

if (hasComposition && hasOriginal && timelineContinuous) {
  console.log('\n🎉 测试通过！微场景生成逻辑正确！')
} else {
  console.log('\n❌ 测试失败，需要修复问题')
}
