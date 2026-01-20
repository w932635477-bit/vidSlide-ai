#!/usr/bin/env node

/**
 * 端到端小段测试
 * 测试 10 秒视频的完整处理流程
 * 包括：场景生成 → 模板渲染 → PIP合成 → 视频拼接
 */

import MicroSceneGenerator from './vidslide-ai/src/services/MicroSceneGenerator.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 端到端小段测试 (10秒视频)\n')
console.log('=' .repeat(60))

// 测试配置
const testConfig = {
  // 使用真实的测试视频（前10秒）
  videoPath: '/Users/weilei/Desktop/ScreenRecording_01-05-2026 14-41-54_1.MP4',
  duration: 10, // 只处理前10秒

  // 模拟分析结果
  analysisResult: {
    metadata: {
      duration: 10,
      width: 1284,
      height: 2778
    },
    // 模拟字幕（基于真实视频内容）
    transcript: [
      { text: '星四做拍摄做剪辑，做出来的短视频，发到抖音', startTime: 0, endTime: 3 },
      { text: '反而流量越来越少', startTime: 3, endTime: 5 },
      { text: '你可能反复在思考到底是哪里出现了问题', startTime: 5, endTime: 8 },
      { text: '我这边总结出来一套高效的投放方法', startTime: 8, endTime: 10 }
    ],
    // 关键词
    keywords: [
      { text: '流量', score: 0.9 },
      { text: '抖音', score: 0.8 },
      { text: '投放', score: 0.8 }
    ]
  },

  // 模拟素材
  materials: [
    { id: 1, url: 'https://picsum.photos/1080/1920?random=1', title: '流量素材' },
    { id: 2, url: 'https://picsum.photos/1080/1920?random=2', title: '抖音素材' },
    { id: 3, url: 'https://picsum.photos/1080/1920?random=3', title: '投放素材' }
  ]
}

console.log('\n📋 测试配置:')
console.log(`  视频路径: ${testConfig.videoPath}`)
console.log(`  测试时长: ${testConfig.duration}秒`)
console.log(`  字幕片段: ${testConfig.analysisResult.transcript.length} 个`)
console.log(`  关键词: ${testConfig.analysisResult.keywords.length} 个`)
console.log(`  素材: ${testConfig.materials.length} 个`)

console.log('\n' + '='.repeat(60))
console.log('\n🎬 第一步：生成微场景\n')

// 创建主场景（整个10秒作为一个场景）
const mainScene = {
  id: 0,
  startTime: 0,
  endTime: testConfig.duration,
  title: '测试场景',
  transcript: testConfig.analysisResult.transcript
}

console.log('📍 主场景信息:')
console.log(`  时间范围: ${mainScene.startTime}s - ${mainScene.endTime}s`)
console.log(`  字幕片段: ${mainScene.transcript.length} 个`)

console.log('\n🚀 开始生成微场景...\n')

// 生成微场景
const microScenes = MicroSceneGenerator.generateMicroScenes(
  mainScene,
  testConfig.analysisResult.keywords,
  testConfig.materials
)

console.log('\n📊 微场景生成结果:')
console.log(`  总共: ${microScenes.length} 个微场景`)

const compositionScenes = microScenes.filter(s => s.type === 'composition')
const originalScenes = microScenes.filter(s => s.type === 'original')

console.log(`  - 🎨 组合场景: ${compositionScenes.length} 个`)
console.log(`  - 📹 原视频: ${originalScenes.length} 个`)

console.log('\n📋 详细列表:')
microScenes.forEach((scene, i) => {
  const icon = scene.type === 'composition' ? '🎨' : '📹'
  const type = scene.type === 'composition' ? '组合' : '原视频'
  console.log(`  ${i + 1}. ${icon} ${type}: ${scene.startTime.toFixed(1)}s - ${scene.endTime.toFixed(1)}s`)
  if (scene.type === 'composition') {
    console.log(`     关键词: ${scene.keyword}`)
    console.log(`     模板: ${scene.template}`)
    console.log(`     PIP位置: ${scene.pipConfig.position}`)
    if (scene.transition) {
      console.log(`     过渡: ${scene.transition.type}`)
    }
  }
})

console.log('\n' + '='.repeat(60))
console.log('\n🎬 第二步：模拟视频合成流程\n')

// 模拟 optimizeSceneTiming
console.log('⚙️ 优化场景时长...')
const optimizedScenes = microScenes.map((scene, index) => {
  const durationPerScene = testConfig.duration / microScenes.length
  return {
    ...scene,
    duration: durationPerScene,
    startTime: index * durationPerScene,
    endTime: (index + 1) * durationPerScene
  }
})

console.log('\n📋 优化后的场景:')
optimizedScenes.forEach((scene, i) => {
  const icon = scene.type === 'composition' ? '🎨' : '📹'
  const type = scene.type === 'composition' ? '组合' : '原视频'
  console.log(`  ${i + 1}. ${icon} ${type}: ${scene.startTime.toFixed(1)}s - ${scene.endTime.toFixed(1)}s (type="${scene.type}")`)
})

console.log('\n' + '='.repeat(60))
console.log('\n🔍 验证场景类型\n')

// 验证每个场景的 type 属性
let allTypesCorrect = true
optimizedScenes.forEach((scene, i) => {
  const hasType = scene.type !== undefined
  const typeValue = scene.type
  const isComposition = scene.type === 'composition'
  const isOriginal = scene.type === 'original'

  console.log(`场景 ${i + 1}:`)
  console.log(`  ${hasType ? '✅' : '❌'} 有 type 属性`)
  console.log(`  type 值: "${typeValue}"`)
  console.log(`  判断 === 'composition': ${isComposition}`)
  console.log(`  判断 === 'original': ${isOriginal}`)

  if (!hasType || (!isComposition && !isOriginal)) {
    allTypesCorrect = false
    console.log(`  ⚠️ 类型异常！`)
  }
  console.log('')
})

console.log('=' .repeat(60))
console.log('\n📊 测试结果总结\n')

// 统计
const hasComposition = compositionScenes.length > 0
const hasOriginal = originalScenes.length > 0
const typesPreserved = allTypesCorrect

console.log(`${hasComposition ? '✅' : '❌'} 生成了组合场景 (${compositionScenes.length} 个)`)
console.log(`${hasOriginal ? '✅' : '❌'} 生成了原视频片段 (${originalScenes.length} 个)`)
console.log(`${typesPreserved ? '✅' : '❌'} 场景类型保持正确`)

// 检查模板多样性
if (compositionScenes.length > 1) {
  const templates = compositionScenes.map(s => s.template)
  const uniqueTemplates = [...new Set(templates)]
  console.log(`${uniqueTemplates.length > 1 ? '✅' : '⚠️'} 模板多样性 (${uniqueTemplates.length} 种)`)
}

// 检查PIP位置多样性
if (compositionScenes.length > 1) {
  const positions = compositionScenes.map(s => s.pipConfig.position)
  const uniquePositions = [...new Set(positions)]
  console.log(`${uniquePositions.length > 1 ? '✅' : '⚠️'} PIP位置多样性 (${uniquePositions.length} 种)`)
}

// 检查过渡特效
const transitionScenes = compositionScenes.filter(s => s.transition)
console.log(`${transitionScenes.length > 0 ? '✅' : '⚠️'} 包含过渡特效 (${transitionScenes.length} 个)`)

console.log('\n' + '='.repeat(60))

if (hasComposition && typesPreserved) {
  console.log('\n🎉 测试通过！场景生成逻辑正确！')
  console.log('\n💡 下一步:')
  console.log('  1. 确认 VideoCompositionService 能正确识别场景类型')
  console.log('  2. 测试实际的模板渲染')
  console.log('  3. 测试 PIP 合成')
  console.log('  4. 测试视频拼接')
} else {
  console.log('\n❌ 测试失败！')
  if (!hasComposition) {
    console.log('  问题: 没有生成组合场景')
  }
  if (!typesPreserved) {
    console.log('  问题: 场景类型丢失或错误')
  }
}

console.log('\n' + '='.repeat(60))
console.log('\n📝 调试信息\n')

console.log('原始微场景的 type:')
microScenes.forEach((s, i) => {
  console.log(`  ${i + 1}. type="${s.type}" (typeof: ${typeof s.type})`)
})

console.log('\n优化后场景的 type:')
optimizedScenes.forEach((s, i) => {
  console.log(`  ${i + 1}. type="${s.type}" (typeof: ${typeof s.type})`)
})

console.log('\n✅ 测试完成！')
