/**
 * 测试Store和Composables
 * 运行: npm run dev 然后在浏览器控制台执行
 */

// 测试Store
import { useWorkspaceStore } from './stores/workspaceStore'

export function testStore() {
  console.log('🧪 测试Workspace Store...')

  const store = useWorkspaceStore()

  // 测试视频状态
  console.log('1. 测试视频状态')
  store.setVideo({
    src: 'test.mp4',
    duration: 120,
    width: 1920,
    height: 1080
  })
  console.log('✅ 视频状态:', store.video)
  console.log('✅ 是否竖屏:', store.isVerticalVideo)

  // 测试模板状态
  console.log('2. 测试模板状态')
  store.setTemplate({ id: 'test-template', name: '测试模板' })
  console.log('✅ 模板状态:', store.template)

  // 测试UI状态
  console.log('3. 测试UI状态')
  store.setActiveTab('materials')
  console.log('✅ 当前标签:', store.ui.activeTab)

  // 测试进度
  console.log('4. 测试进度')
  store.showProgress('analyze')
  store.updateProgress(50, 30)
  console.log('✅ 进度状态:', store.progress)
  store.hideProgress()

  // 测试导出状态
  console.log('5. 测试导出状态')
  const state = store.exportState()
  console.log('✅ 导出状态:', state)

  console.log('🎉 Store测试完成！')
  return true
}

// 在浏览器控制台中运行:
// import { testStore } from '/src/test-store.js'
// testStore()
