/**
 * 测试VideoEditorView组件渲染状态
 */

console.log('🎯 测试VideoEditorView组件渲染状态...\n')

// 等待页面完全加载
setTimeout(async () => {
  console.log('⏰ 检查页面加载状态...')

  // 检查Vue实例
  const app = document.getElementById('app')
  if (!app) {
    console.log('❌ #app元素不存在')
    return
  }

  console.log('✅ #app元素存在')

  // 检查是否有Vue实例
  const vueInstance = app.__vue__
  if (vueInstance) {
    console.log('✅ Vue实例已挂载')
    console.log('📊 路由信息:', vueInstance.$route?.name || 'unknown')
  } else {
    console.log('❌ Vue实例未挂载')
  }

  // 检查VideoEditorView组件
  const editorView = app.querySelector('.video-editor-view')
  if (editorView) {
    console.log('✅ VideoEditorView组件已渲染')
    console.log('📦 组件内容长度:', editorView.innerHTML.length)

    // 检查关键元素
    const checks = [
      { selector: '.upload-section', name: '上传区域' },
      { selector: '.editor-section', name: '编辑区域' },
      { selector: '.left-panel', name: '左侧面板' },
      { selector: '.main-editor', name: '主编辑区' },
      { selector: '.template-selector', name: '模板选择器' },
      { selector: '.adjustment-panel', name: '参数调整面板' }
    ]

    checks.forEach(({ selector, name }) => {
      const element = editorView.querySelector(selector)
      console.log(`${element ? '✅' : '❌'} ${name}: ${element ? '存在' : '不存在'}`)
    })
  } else {
    console.log('❌ VideoEditorView组件未渲染')

    // 检查其他可能的组件
    const allDivs = app.querySelectorAll('div[class*="view"]')
    console.log('🔍 找到的view类元素:', allDivs.length)
    allDivs.forEach((div, i) => {
      console.log(`  ${i + 1}. ${div.className}`)
    })
  }

  // 检查控制台错误
  console.log('\n🔍 检查最近的控制台错误...')
  // 这里无法直接检查控制台，但可以检查页面上的错误指示器

  console.log('\n🎯 测试完成！请查看上述结果。')
}, 3000) // 等待3秒让组件完全加载
