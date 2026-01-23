/**
 * VidSlide AI - 路由测试脚本
 * 测试路由和组件加载是否正常
 */

console.log('🛣️ 开始路由测试...\n')

// 1. 检查路由器实例
console.log('🔍 检查Vue Router:')
if (window.Vue && window.Vue.router) {
  console.log('✅ Vue Router存在')
  console.log('📊 当前路由:', window.Vue.router.currentRoute.value)
} else {
  console.log('❌ Vue Router不存在')
}

// 2. 检查页面内容
console.log('\n📄 检查页面内容:')
const app = document.getElementById('app')
if (app) {
  console.log('✅ #app元素存在')
  const content = app.textContent || app.innerText
  console.log('📝 页面文本内容:', content.substring(0, 200) + '...')

  // 检查是否有Vue组件内容
  if (content.includes('VidSlide') || content.includes('视频')) {
    console.log('✅ 包含VidSlide相关内容')
  } else {
    console.log('❌ 不包含VidSlide相关内容')
  }
} else {
  console.log('❌ #app元素不存在')
}

// 3. 手动测试路由跳转
console.log('\n🧪 手动路由测试:')

// 测试跳转到主页
console.log('🏠 测试跳转到主页...')
if (window.Vue && window.Vue.router) {
  try {
    window.Vue.router.push('/')
    setTimeout(() => {
      console.log('✅ 主页跳转完成')
      const newContent = document.getElementById('app').textContent
      console.log('📝 新页面内容:', newContent.substring(0, 100) + '...')
    }, 1000)
  } catch (error) {
    console.log('❌ 主页跳转失败:', error.message)
  }
} else {
  console.log('❌ 无法进行路由测试')
}

// 4. 检查组件异步加载
console.log('\n📦 检查组件异步加载:')
const testImports = [
  () => import('./src/views/HomeView.vue'),
  () => import('./src/views/VideoEditorView.vue'),
  () => import('./src/components/TemplateSelector.vue')
]

testImports.forEach(async (importFunc, index) => {
  try {
    const module = await importFunc()
    console.log(`✅ 组件${index + 1}异步加载成功`)
  } catch (error) {
    console.log(`❌ 组件${index + 1}异步加载失败:`, error.message)
  }
})

// 5. 检查网络请求
console.log('\n🌐 检查网络请求:')
if (window.performance && window.performance.getEntriesByType) {
  const resources = window.performance.getEntriesByType('resource')
  const jsFiles = resources.filter(r => r.name.includes('.js') || r.name.includes('.vue'))
  console.log(`📊 加载的JS/Vue文件数量: ${jsFiles.length}`)
  jsFiles.slice(-5).forEach(file => {
    console.log(`  - ${file.name.split('/').pop()}: ${file.duration.toFixed(2)}ms`)
  })
}

console.log('\n🎯 路由测试完成！')
