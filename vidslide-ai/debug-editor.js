/**
 * VidSlide AI - 编辑器调试脚本
 * 调试VideoEditorView组件渲染问题
 */

console.log('🔍 开始编辑器调试...\n')

// 1. 检查DOM结构
console.log('📄 检查页面DOM结构:')
const app = document.getElementById('app')
if (app) {
  console.log('✅ #app元素存在')
  console.log('📦 #app内容长度:', app.innerHTML.length)
  console.log('📦 #app内容预览:', app.innerHTML.substring(0, 300) + '...')

  // 检查是否有video-editor-view类
  const editorView = app.querySelector('.video-editor-view')
  if (editorView) {
    console.log('✅ video-editor-view元素存在')
    console.log('📦 编辑器内容长度:', editorView.innerHTML.length)
    console.log('📦 编辑器内容预览:', editorView.innerHTML.substring(0, 300) + '...')
  } else {
    console.log('❌ video-editor-view元素不存在')

    // 检查是否有其他Vue组件
    const vueComponents = app.querySelectorAll('[class*="view"]')
    console.log('🔍 找到的view类元素:', vueComponents.length)
    vueComponents.forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.className}: ${el.tagName}`)
    })
  }
} else {
  console.log('❌ #app元素不存在')
}

// 2. 检查Vue实例
console.log('\n🎯 检查Vue实例:')
if (window.Vue) {
  console.log('✅ Vue全局对象存在')

  // 检查是否有Vue实例挂载
  const vueInstance = app.__vue__
  if (vueInstance) {
    console.log('✅ Vue实例已挂载')
    console.log('📊 实例数据:', {
      videoSrc: vueInstance.videoSrc,
      selectedTemplate: vueInstance.selectedTemplate,
      currentStep: vueInstance.currentStep
    })
  } else {
    console.log('❌ Vue实例未挂载')
  }
} else {
  console.log('❌ Vue全局对象不存在')
}

// 3. 检查组件导入
console.log('\n📦 检查组件导入:')
const components = [
  'TemplateSelector',
  'UserAdjustmentPanel',
  'PictureInPicture',
  'AnimationSystem'
]

components.forEach(comp => {
  const elements = document.querySelectorAll(`[data-component*="${comp}"]`)
  if (elements.length > 0) {
    console.log(`✅ ${comp}: 找到${elements.length}个元素`)
  } else {
    console.log(`❌ ${comp}: 未找到元素`)
  }
})

// 4. 检查路由状态
console.log('\n🛣️ 检查路由状态:')
if (window.location) {
  console.log('🌐 当前路径:', window.location.pathname)
  console.log('🔗 当前hash:', window.location.hash)
}

// 5. 检查样式
console.log('\n🎨 检查样式:')
const root = document.documentElement
const testStyles = ['--apple-blue', '--bg-primary', '--text-primary']
testStyles.forEach(style => {
  const value = getComputedStyle(root).getPropertyValue(style)
  console.log(`${value ? '✅' : '❌'} ${style}: ${value || '未定义'}`)
})

// 6. 手动触发上传测试
console.log('\n🧪 手动上传测试:')
const fileInput = document.getElementById('video-file-input')
if (fileInput) {
  console.log('✅ 视频输入框存在')

  // 创建一个测试文件
  const testFile = new File(['test video content'], 'test.mp4', { type: 'video/mp4' })

  // 模拟文件选择
  const event = new Event('change', { bubbles: true })
  Object.defineProperty(event, 'target', {
    value: { files: [testFile] },
    writable: false
  })

  console.log('🎬 触发文件选择事件...')
  fileInput.dispatchEvent(event)

  // 检查是否触发了处理函数
  setTimeout(() => {
    console.log('⏰ 检查上传结果...')
    const editorView = document.querySelector('.video-editor-view')
    if (editorView && editorView.innerHTML.includes('editing')) {
      console.log('✅ 上传成功，显示编辑界面')
    } else {
      console.log('❌ 上传未成功')
    }
  }, 1000)
} else {
  console.log('❌ 视频输入框不存在')
}

console.log('\n🎯 调试完成！请查看上述结果。')
