/**
 * VidSlide AI - 模块集成自动化测试
 * 使用 Node.js 验证模块导入和基本功能
 */

import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🎬 VidSlide AI 模块集成测试\n')
console.log('='.repeat(50))

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`✅ ${name}`)
    passed++
  } catch (error) {
    console.log(`❌ ${name}`)
    console.log(`   错误: ${error.message}`)
    failed++
  }
}

function assertExists(filePath, description) {
  const fullPath = join(__dirname, filePath)
  if (!existsSync(fullPath)) {
    throw new Error(`文件不存在: ${filePath}`)
  }
}

function assertContains(filePath, content, description) {
  const fullPath = join(__dirname, filePath)
  const fileContent = readFileSync(fullPath, 'utf-8')
  if (!fileContent.includes(content)) {
    throw new Error(`${description}: 未找到 "${content}"`)
  }
}

// 1. 文件存在性测试
console.log('\n📁 文件存在性测试')
console.log('-'.repeat(50))

test('UnifiedFaceTracker.js 存在', () => {
  assertExists('src/services/UnifiedFaceTracker.js')
})

test('sceneDetection.js 存在', () => {
  assertExists('src/utils/sceneDetection.js')
})

test('PictureInPicture.vue 存在', () => {
  assertExists('src/components/PictureInPicture.vue')
})

test('FaceTrackingSettings.vue 存在', () => {
  assertExists('src/components/FaceTrackingSettings.vue')
})

test('VideoEditorView.vue 存在', () => {
  assertExists('src/views/VideoEditorView.vue')
})

// 2. UnifiedFaceTracker 集成测试
console.log('\n🎯 UnifiedFaceTracker 集成测试')
console.log('-'.repeat(50))

test('UnifiedFaceTracker 导出 TrackerEngine 枚举', () => {
  assertContains('src/services/UnifiedFaceTracker.js', 'export const TrackerEngine')
})

test('UnifiedFaceTracker 支持 MediaPipe 引擎', () => {
  assertContains('src/services/UnifiedFaceTracker.js', "MEDIAPIPE: 'mediapipe'")
})

test('UnifiedFaceTracker 支持 Face-api.js 引擎', () => {
  assertContains('src/services/UnifiedFaceTracker.js', "FACEAPI: 'faceapi'")
})

test('UnifiedFaceTracker 支持基础模式', () => {
  assertContains('src/services/UnifiedFaceTracker.js', "BASIC: 'basic'")
})

test('UnifiedFaceTracker 有 initialize 方法', () => {
  assertContains('src/services/UnifiedFaceTracker.js', 'async initialize(')
})

test('UnifiedFaceTracker 有 startTracking 方法', () => {
  assertContains('src/services/UnifiedFaceTracker.js', 'async startTracking(')
})

test('UnifiedFaceTracker 有 initializeEngine 方法', () => {
  assertContains('src/services/UnifiedFaceTracker.js', 'async initializeEngine(')
})

test('UnifiedFaceTracker 有浏览器检测逻辑', () => {
  assertContains('src/services/UnifiedFaceTracker.js', 'getEnginePriority(')
})

// 3. 场景检测集成测试
console.log('\n🎬 场景检测集成测试')
console.log('-'.repeat(50))

test('SceneDetection 类导出', () => {
  assertContains('src/utils/sceneDetection.js', 'export class SceneDetection')
})

test('SceneDetection 有图像差异检测', () => {
  assertContains('src/utils/sceneDetection.js', 'detectImageDifference')
})

test('SceneDetection 有运动检测', () => {
  assertContains('src/utils/sceneDetection.js', 'motionThreshold')
})

test('SceneDetection 有剪辑点检测', () => {
  assertContains('src/utils/sceneDetection.js', 'cutThreshold')
})

test('SceneDetection 有淡入淡出检测', () => {
  assertContains('src/utils/sceneDetection.js', 'fadeThreshold')
})

// 4. PictureInPicture 组件集成测试
console.log('\n🖼️ PictureInPicture 组件集成测试')
console.log('-'.repeat(50))

test('PictureInPicture 导入 UnifiedFaceTracker', () => {
  assertContains('src/components/PictureInPicture.vue', 'import UnifiedFaceTracker')
})

test('PictureInPicture 导入 TrackerEngine', () => {
  assertContains('src/components/PictureInPicture.vue', 'TrackerEngine')
})

test('PictureInPicture 有引擎显示名称函数', () => {
  assertContains('src/components/PictureInPicture.vue', 'getEngineDisplayName')
})

test('PictureInPicture 有人脸跟踪支持状态', () => {
  assertContains('src/components/PictureInPicture.vue', 'faceTrackingSupported')
})

test('PictureInPicture 有当前引擎状态', () => {
  assertContains('src/components/PictureInPicture.vue', 'currentTrackerEngine')
})

// 5. FaceTrackingSettings 组件集成测试
console.log('\n⚙️ FaceTrackingSettings 组件集成测试')
console.log('-'.repeat(50))

test('FaceTrackingSettings 导入 UnifiedFaceTracker', () => {
  assertContains('src/components/FaceTrackingSettings.vue', 'import UnifiedFaceTracker')
})

test('FaceTrackingSettings 有预览功能', () => {
  assertContains('src/components/FaceTrackingSettings.vue', 'startPreview')
})

test('FaceTrackingSettings 有引擎状态显示', () => {
  assertContains('src/components/FaceTrackingSettings.vue', 'currentEngine')
})

test('FaceTrackingSettings 有实时人脸框绘制', () => {
  assertContains('src/components/FaceTrackingSettings.vue', 'drawRealFaceBox')
})

// 6. VideoEditorView 集成测试
console.log('\n🎥 VideoEditorView 集成测试')
console.log('-'.repeat(50))

test('VideoEditorView 导入 UnifiedFaceTracker', () => {
  assertContains('src/views/VideoEditorView.vue', 'import UnifiedFaceTracker')
})

test('VideoEditorView 导入 SceneDetection', () => {
  assertContains('src/views/VideoEditorView.vue', 'import { SceneDetection }')
})

test('VideoEditorView 有场景检测器状态', () => {
  assertContains('src/views/VideoEditorView.vue', 'sceneDetector')
})

test('VideoEditorView 有场景分析功能', () => {
  assertContains('src/views/VideoEditorView.vue', 'analyzeVideoScenes')
})

test('VideoEditorView 有检测到的场景列表', () => {
  assertContains('src/views/VideoEditorView.vue', 'detectedScenes')
})

test('VideoEditorView 有智能画中画定位', () => {
  assertContains('src/views/VideoEditorView.vue', 'handleFaceDetectedForPip')
})

// 7. 多浏览器兼容性配置测试
console.log('\n🌐 多浏览器兼容性配置测试')
console.log('-'.repeat(50))

test('UnifiedFaceTracker 有 Chrome 浏览器检测', () => {
  assertContains('src/services/UnifiedFaceTracker.js', 'Chrome')
})

test('UnifiedFaceTracker 有 Firefox 浏览器检测', () => {
  assertContains('src/services/UnifiedFaceTracker.js', 'Firefox')
})

test('UnifiedFaceTracker 有 Safari 浏览器检测', () => {
  assertContains('src/services/UnifiedFaceTracker.js', 'Safari')
})

test('UnifiedFaceTracker 有 Edge 浏览器检测', () => {
  assertContains('src/services/UnifiedFaceTracker.js', 'Edge')
})

test('UnifiedFaceTracker 有自动降级逻辑', () => {
  assertContains('src/services/UnifiedFaceTracker.js', 'fallback')
})

// 输出测试结果
console.log('\n' + '='.repeat(50))
console.log('📊 测试结果汇总')
console.log('='.repeat(50))
console.log(`✅ 通过: ${passed}`)
console.log(`❌ 失败: ${failed}`)
console.log(`📝 总计: ${passed + failed}`)
console.log(`📈 通过率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`)

if (failed === 0) {
  console.log('\n🎉 所有测试通过！集成验证成功。')
} else {
  console.log('\n⚠️ 部分测试失败，请检查上述错误。')
  process.exit(1)
}
