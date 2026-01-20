#!/usr/bin/env node

/**
 * 完整的单段落测试
 * 模拟从视频分析到场景生成的完整流程
 */

import MicroSceneGenerator from './vidslide-ai/src/services/MicroSceneGenerator.js'

console.log('🧪 完整的单段落测试\n')
console.log('=' .repeat(60))

// 模拟视频分析结果
const analysisResult = {
  metadata: {
    duration: 30,
    width: 1080,
    height: 1920
  },
  // 模拟字幕（绝对时间）
  transcript: [
    { text: '大家好，今天教大家如何在抖音上获取流量', startTime: 0, endTime: 3 },
    { text: '首先要了解抖音的推荐机制', startTime: 3, endTime: 6 },
    { text: '然后使用巨量AD进行精准投放', startTime: 6, endTime: 9 },
    { text: '这样可以快速积累粉丝', startTime: 9, endTime: 12 },
    { text: '接下来我会详细讲解投放策略', startTime: 12, endTime: 15 },
    { text: '包括如何优化投放效果', startTime: 15, endTime: 18 },
    { text: '以及如何提高ROI', startTime: 18, endTime: 21 },
    { text: '最后总结一下今天的内容', startTime: 21, endTime: 24 },
    { text: '如果觉得有用请点赞关注', startTime: 24, endTime: 27 },
    { text: '我们下期再见', startTime: 27, endTime: 30 }
  ],
  // 模拟关键词
  keywords: [
    { text: '流量', score: 0.9 },
    { text: '抖音', score: 0.8 },
    { text: '巨量AD', score: 0.7 },
    { text: '粉丝', score: 0.6 },
    { text: '投放', score: 0.8 },
    { text: 'ROI', score: 0.7 }
  ]
}

// 模拟素材
const materials = [
  { id: 1, url: 'material1.jpg', title: '流量素材' },
  { id: 2, url: 'material2.jpg', title: '广告素材' },
  { id: 3, url: 'material3.jpg', title: '数据素材' }
]

console.log('\n📋 输入数据:')
console.log(`  视频时长: ${analysisResult.metadata.duration}s`)
console.log(`  字幕片段: ${analysisResult.transcript.length} 个`)
console.log(`  关键词: ${analysisResult.keywords.length} 个`)
console.log(`  素材: ${materials.length} 个`)

console.log('\n📝 字幕内容:')
analysisResult.transcript.forEach((t, i) => {
  console.log(`  ${i + 1}. "${t.text.substring(0, 30)}..." @ ${t.startTime}s - ${t.endTime}s`)
})

console.log('\n🔑 关键词列表:')
analysisResult.keywords.forEach((k, i) => {
  console.log(`  ${i + 1}. "${k.text}" (重要性: ${k.score})`)
})

console.log('\n' + '='.repeat(60))
console.log('\n🚀 开始场景分割和微场景生成...\n')

// 模拟场景分割（简单按时间分割）
const segments = [
  { id: 0, startTime: 0, endTime: 10, title: '第一段' },
  { id: 1, startTime: 10, endTime: 20, title: '第二段' },
  { id: 2, startTime: 20, endTime: 30, title: '第三段' }
]

console.log(`📊 视频分割为 ${segments.length} 个主场景:\n`)
segments.forEach((seg, i) => {
  console.log(`  ${i + 1}. ${seg.title}: ${seg.startTime}s - ${seg.endTime}s`)
})

console.log('\n' + '='.repeat(60))
console.log('\n🎬 为每个主场景生成微场景...\n')

const allScenes = []

for (const segment of segments) {
  console.log(`\n📍 处理主场景 ${segment.id}: ${segment.title} (${segment.startTime}s - ${segment.endTime}s)`)
  console.log('-'.repeat(60))

  // 获取该段的字幕
  const segmentTranscript = analysisResult.transcript.filter(
    t => t.startTime >= segment.startTime && t.endTime <= segment.endTime
  )

  console.log(`  字幕片段: ${segmentTranscript.length} 个`)

  // 为segment添加transcript
  const segmentWithTranscript = {
    ...segment,
    transcript: segmentTranscript
  }

  // 生成微场景
  const microScenes = MicroSceneGenerator.generateMicroScenes(
    segmentWithTranscript,
    analysisResult.keywords,
    materials
  )

  console.log(`\n  ✅ 生成 ${microScenes.length} 个微场景`)

  // 添加到总场景列表
  microScenes.forEach((scene, i) => {
    allScenes.push({
      ...scene,
      id: `${segment.id}-${i}`,
      segmentId: segment.id,
      segmentTitle: segment.title
    })
  })
}

console.log('\n' + '='.repeat(60))
console.log('\n📊 最终场景列表:\n')

console.log(`✅ 总共生成 ${allScenes.length} 个场景`)

// 统计
const compositionScenes = allScenes.filter(s => s.type === 'composition')
const originalScenes = allScenes.filter(s => s.type === 'original')

console.log(`  - 🎨 组合场景: ${compositionScenes.length} 个`)
console.log(`  - 📹 原视频片段: ${originalScenes.length} 个`)

console.log('\n📋 详细场景列表:\n')
allScenes.forEach((scene, i) => {
  const icon = scene.type === 'composition' ? '🎨' : '📹'
  const type = scene.type === 'composition' ? '组合' : '原视频'
  const duration = (scene.endTime - scene.startTime).toFixed(1)

  console.log(`${i + 1}. ${icon} ${type} [${scene.segmentTitle}]`)
  console.log(`   ID: ${scene.id}`)
  console.log(`   时间: ${scene.startTime.toFixed(1)}s - ${scene.endTime.toFixed(1)}s (持续 ${duration}s)`)

  if (scene.type === 'composition') {
    console.log(`   关键词: ${scene.keyword}`)
    console.log(`   模板: ${scene.template}`)
    console.log(`   PIP位置: ${scene.pipConfig.position}`)
    if (scene.transition) {
      console.log(`   过渡: ${scene.transition.type} (${scene.transition.description})`)
    }
  }
  console.log('')
})

console.log('='.repeat(60))
console.log('\n🔍 验证结果:\n')

// 验证时间线连续性
let timelineContinuous = true
for (let i = 1; i < allScenes.length; i++) {
  const prevScene = allScenes[i - 1]
  const currScene = allScenes[i]

  // 检查是否在同一个主场景内
  if (prevScene.segmentId === currScene.segmentId) {
    if (Math.abs(currScene.startTime - prevScene.endTime) > 0.1) {
      timelineContinuous = false
      console.log(`⚠️ 时间线不连续: 场景 ${i} 和场景 ${i + 1} 之间有间隙`)
    }
  }
}

console.log(`${compositionScenes.length > 0 ? '✅' : '❌'} 包含组合场景`)
console.log(`${originalScenes.length > 0 ? '✅' : '❌'} 包含原视频片段`)
console.log(`${timelineContinuous ? '✅' : '❌'} 时间线连续`)
console.log(`${allScenes[0].startTime === 0 ? '✅' : '❌'} 开始时间正确`)
console.log(`${allScenes[allScenes.length - 1].endTime === analysisResult.metadata.duration ? '✅' : '❌'} 结束时间正确`)

// 检查模板多样性
const templates = compositionScenes.map(s => s.template)
const uniqueTemplates = [...new Set(templates)]
console.log(`${uniqueTemplates.length > 1 ? '✅' : '❌'} 模板多样性 (使用了 ${uniqueTemplates.length} 种模板)`)

// 检查PIP位置多样性
const pipPositions = compositionScenes.map(s => s.pipConfig.position)
const uniquePositions = [...new Set(pipPositions)]
console.log(`${uniquePositions.length > 1 ? '✅' : '❌'} PIP位置多样性 (使用了 ${uniquePositions.length} 种位置)`)

// 检查过渡特效
const transitionScenes = compositionScenes.filter(s => s.transition)
console.log(`${transitionScenes.length > 0 ? '✅' : '❌'} 包含过渡特效 (${transitionScenes.length} 个场景有过渡)`)

console.log('\n' + '='.repeat(60))

if (compositionScenes.length > 0 && timelineContinuous && uniqueTemplates.length > 1) {
  console.log('\n🎉 测试通过！微场景生成逻辑完全正确！')
  console.log('\n✨ 优化效果:')
  console.log(`  - 生成了 ${compositionScenes.length} 个组合场景`)
  console.log(`  - 使用了 ${uniqueTemplates.length} 种不同模板`)
  console.log(`  - 使用了 ${uniquePositions.length} 种不同PIP位置`)
  console.log(`  - ${transitionScenes.length} 个场景有过渡特效`)
  console.log('\n🚀 可以进行完整视频测试了！')
} else {
  console.log('\n❌ 测试失败，需要修复问题')
}
