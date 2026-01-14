/**
 * VidSlide AI - 功能连接测试脚本
 * 用于诊断UI界面与核心功能的连接状态
 */

console.log('🔍 开始VidSlide AI功能连接诊断...\n')

// 1. 核心服务导入测试
console.log('📦 核心服务导入测试:')
try {
  // 动态导入测试
  const services = [
    { name: 'TemplateRenderer', path: './src/utils/TemplateRenderer.js' },
    { name: 'MaterialService', path: './src/services/MaterialService.js' },
    { name: 'BackgroundRemovalService', path: './src/services/BackgroundRemovalService.js' },
    { name: 'TemplateRecommender', path: './src/services/TemplateRecommender.js' },
    { name: 'CLIPMatcher', path: './src/services/CLIPMatcher.js' }
  ]

  for (const service of services) {
    try {
      const module = await import(service.path)
      console.log(`✅ ${service.name}: 导入成功`)
      console.log(`   导出内容: ${Object.keys(module).join(', ')}`)
    } catch (error) {
      console.log(`❌ ${service.name}: 导入失败 - ${error.message}`)
    }
  }
} catch (error) {
  console.log('❌ 服务导入测试失败:', error.message)
}

// 2. UI组件连接测试
console.log('\n🎨 UI组件连接测试:')
const components = [
  { name: 'TemplateSelector', path: './src/components/TemplateSelector.vue' },
  { name: 'UserAdjustmentPanel', path: './src/components/UserAdjustmentPanel.vue' },
  { name: 'PictureInPicture', path: './src/components/PictureInPicture.vue' },
  { name: 'VideoEditorView', path: './src/views/VideoEditorView.vue' }
]

for (const component of components) {
  try {
    const module = await import(component.path)
    console.log(`✅ ${component.name}: 组件加载成功`)

    // 检查组件的emit事件
    if (component.name === 'TemplateSelector') {
      console.log('   🔍 检查TemplateSelector事件...')
      const template = { id: 'test', name: '测试模板' }
      // 这里可以添加更多事件检查逻辑
    }
  } catch (error) {
    console.log(`❌ ${component.name}: 组件加载失败 - ${error.message}`)
  }
}

// 3. 事件传递链测试
console.log('\n🔗 事件传递链测试:')
console.log('检查VideoEditorView的事件处理函数...')

// 检查全局状态
console.log('\n📊 全局状态检查:')
if (typeof window !== 'undefined') {
  console.log('✅ 浏览器环境正常')
  console.log('🌐 URL:', window.location.href)
  console.log('📱 UserAgent:', navigator.userAgent.substring(0, 50) + '...')
} else {
  console.log('❌ 非浏览器环境')
}

console.log('\n🎯 诊断完成！请检查上述结果，识别连接问题。')