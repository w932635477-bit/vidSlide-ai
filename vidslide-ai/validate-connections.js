/**
 * VidSlide AI - 连接验证脚本
 * 验证UI界面与核心功能连接是否正常工作
 */

console.log('✅ 开始VidSlide AI连接验证...\n')

// 验证1: 检查应用是否正常加载
console.log('1️⃣ 检查应用加载状态...')
if (typeof window !== 'undefined' && window.Vue) {
  console.log('✅ Vue.js已加载')
} else {
  console.log('❌ Vue.js未加载')
}

// 验证2: 检查路由是否正常
console.log('\n2️⃣ 检查路由状态...')
if (typeof window !== 'undefined' && window.location) {
  console.log(`🌐 当前URL: ${window.location.href}`)
  console.log(`📄 当前路径: ${window.location.pathname}`)

  if (window.location.pathname.includes('/editor')) {
    console.log('✅ 正在编辑器页面')
  } else {
    console.log('⚠️ 不在编辑器页面，请导航到 /editor')
  }
}

// 验证3: 检查核心组件是否存在
console.log('\n3️⃣ 检查核心组件存在性...')
const components = [
  'TemplateSelector',
  'UserAdjustmentPanel',
  'PictureInPicture',
  'VideoEditorView'
]

components.forEach(component => {
  if (document.querySelector(`[data-component="${component}"]`) ||
      document.querySelector(component.toLowerCase().replace('view', '-view'))) {
    console.log(`✅ ${component}组件存在`)
  } else {
    console.log(`❌ ${component}组件未找到`)
  }
})

// 验证4: 检查事件监听器
console.log('\n4️⃣ 检查事件监听器...')
let eventListenersFound = 0

// 检查点击事件
document.querySelectorAll('[data-event]').forEach(el => {
  eventListenersFound++
  console.log(`✅ 找到事件监听器: ${el.getAttribute('data-event')}`)
})

// 检查模板选择器
const templateCards = document.querySelectorAll('.template-card')
if (templateCards.length > 0) {
  console.log(`✅ 找到 ${templateCards.length} 个模板卡片`)
  templateCards.forEach((card, index) => {
    if (card.onclick || card.getAttribute('@click')) {
      console.log(`✅ 模板卡片 ${index + 1} 有点击事件`)
    } else {
      console.log(`❌ 模板卡片 ${index + 1} 缺少点击事件`)
    }
  })
} else {
  console.log('❌ 未找到模板卡片')
}

// 检查参数调整面板
const adjustmentInputs = document.querySelectorAll('input[type="range"]')
if (adjustmentInputs.length > 0) {
  console.log(`✅ 找到 ${adjustmentInputs.length} 个参数调整控件`)
  adjustmentInputs.forEach((input, index) => {
    if (input.oninput || input.getAttribute('@input')) {
      console.log(`✅ 参数控件 ${index + 1} 有输入事件`)
    } else {
      console.log(`❌ 参数控件 ${index + 1} 缺少输入事件`)
    }
  })
} else {
  console.log('⚠️ 未找到参数调整控件（可能还未选择模板）')
}

// 验证5: 检查Canvas渲染
console.log('\n5️⃣ 检查Canvas渲染状态...')
const canvas = document.querySelector('canvas')
if (canvas) {
  console.log('✅ Canvas元素存在')
  console.log(`📐 Canvas尺寸: ${canvas.width}x${canvas.height}`)

  const ctx = canvas.getContext('2d') || canvas.getContext('webgl')
  if (ctx) {
    console.log('✅ Canvas上下文可用')
  } else {
    console.log('❌ Canvas上下文不可用')
  }
} else {
  console.log('❌ Canvas元素不存在')
}

// 验证6: 检查样式系统
console.log('\n6️⃣ 检查样式系统...')
const rootStyles = getComputedStyle(document.documentElement)
const designTokens = [
  '--apple-blue',
  '--apple-gray',
  '--bg-primary',
  '--text-primary'
]

designTokens.forEach(token => {
  const value = rootStyles.getPropertyValue(token)
  if (value) {
    console.log(`✅ 设计令牌 ${token}: ${value}`)
  } else {
    console.log(`❌ 设计令牌 ${token} 缺失`)
  }
})

// 验证7: 功能测试
console.log('\n7️⃣ 执行功能测试...')

// 测试视频上传
const fileInputs = document.querySelectorAll('input[type="file"]')
if (fileInputs.length > 0) {
  console.log('✅ 视频上传输入框存在')
} else {
  console.log('❌ 视频上传输入框不存在')
}

// 测试按钮功能
const buttons = document.querySelectorAll('button')
if (buttons.length > 0) {
  console.log(`✅ 找到 ${buttons.length} 个按钮`)
} else {
  console.log('❌ 未找到按钮')
}

// 验证8: 性能检查
console.log('\n8️⃣ 性能检查...')
if ('performance' in window) {
  const perfData = performance.getEntriesByType('navigation')[0]
  console.log(`⚡ DOM加载时间: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`)
  console.log(`🚀 页面加载时间: ${perfData.loadEventEnd - perfData.loadEventStart}ms`)
}

// 验证9: 无障碍访问检查
console.log('\n9️⃣ 无障碍访问检查...')
let ariaLabels = 0
let roles = 0

document.querySelectorAll('[aria-label]').forEach(() => ariaLabels++)
document.querySelectorAll('[role]').forEach(() => roles++)

console.log(`♿ ARIA标签数量: ${ariaLabels}`)
console.log(`♿ 角色属性数量: ${roles}`)

// 验证10: 控制台错误检查
console.log('\n🔟 控制台错误检查...')
// 注意：这里无法直接检查控制台错误，建议手动检查

console.log('\n🎯 连接验证完成！')
console.log('请检查上述结果，确保所有项目都显示✅')
console.log('如果发现❌项目，请参考fix-connections.js进行修复')