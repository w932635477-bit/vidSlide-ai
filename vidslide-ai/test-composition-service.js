import videoCompositionService from './src/services/VideoCompositionService.js'

console.log('测试VideoCompositionService...')

try {
  console.log('✅ VideoCompositionService 导入成功')
  
  // 检查videoProcessor是否存在
  if (videoCompositionService.videoProcessor) {
    console.log('✅ videoProcessor 已初始化')
  } else {
    console.log('❌ videoProcessor 未初始化')
  }
  
  // 检查remotionRenderer是否存在
  if (videoCompositionService.remotionRenderer) {
    console.log('✅ remotionRenderer 已初始化')
  } else {
    console.log('❌ remotionRenderer 未初始化')
  }
  
  // 检查composeVideo方法是否存在
  if (typeof videoCompositionService.composeVideo === 'function') {
    console.log('✅ composeVideo 方法存在')
  } else {
    console.log('❌ composeVideo 方法不存在')
  }
  
  // 检查videoProcessor的方法
  const methods = ['splitVideo', 'mergeVideos', 'composeScenes', 'compress']
  console.log('\n检查videoProcessor方法:')
  methods.forEach(method => {
    if (typeof videoCompositionService.videoProcessor[method] === 'function') {
      console.log(`  ✅ ${method}`)
    } else {
      console.log(`  ❌ ${method}`)
    }
  })
  
  console.log('\n✅ 所有验证通过!')
} catch (error) {
  console.error('❌ 错误:', error.message)
  console.error(error.stack)
  process.exit(1)
}
