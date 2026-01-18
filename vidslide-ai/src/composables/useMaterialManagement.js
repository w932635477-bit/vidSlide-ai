/**
 * useMaterialManagement - 素材管理Composable
 * 处理素材搜索、选择、授权等功能
 */
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import MaterialService from '@/services/MaterialService'

export function useMaterialManagement() {
  const store = useWorkspaceStore()

  // 初始化素材服务
  const initMaterialService = async () => {
    await MaterialService.initialize()
  }

  // 搜索素材
  const searchMaterials = async requirement => {
    try {
      console.log('🔍 搜索素材:', requirement)

      await initMaterialService()

      // 提取搜索关键词
      const searchKeywords = requirement.relatedKeywords || [requirement.title]
      if (searchKeywords.length === 0) {
        ElMessage.warning('没有可用的搜索关键词')
        return
      }

      const searchKeyword = searchKeywords.join(' ')
      console.log(`🔍 搜索关键词: "${searchKeyword}"`)

      ElMessage.info('正在搜索素材...')

      // 搜索素材
      const results = await MaterialService.searchMaterials(searchKeyword, {
        limit: 20,
        context: {
          type: requirement.type,
          scene: requirement.scene || requirement.priority
        }
      })

      console.log('✅ 搜索完成:', results)

      // 显示结果提示
      if (results.source === 'external') {
        ElMessage.success(
          `找到 ${results.materials.length} 个素材（来自 ${results.platforms.join(', ')}）`
        )
      } else if (results.source === 'cache') {
        ElMessage.info(`找到 ${results.materials.length} 个缓存素材`)
      } else if (results.source === 'preset') {
        ElMessage.warning(`找到 ${results.materials.length} 个预置素材（建议联网获取更多）`)
      }

      // 更新搜索结果并显示对话框
      if (results.materials.length > 0) {
        store.setMaterialSearchResults(results.materials, results.source, results.platforms || [])
        store.showMaterialSelectionDialog()
      } else {
        ElMessage.warning('未找到相关素材')
      }

      return results
    } catch (error) {
      console.error('❌ 素材搜索失败:', error)
      ElMessage.error(`搜索失败: ${error.message}`)
      throw error
    }
  }

  // 授权搜索
  const authorizeSearch = async platforms => {
    try {
      console.log('用户授权平台:', platforms)

      const keywords = store.dialogs.pendingSearchKeywords
      const searchKeyword = keywords.join(' ')

      const results = await MaterialService.searchMaterials(searchKeyword, {
        limit: 20,
        platforms: platforms
      })

      // 关闭授权对话框
      store.hideAuthorizationDialog()

      // 显示搜索结果
      if (results.materials.length > 0) {
        ElMessage.success(`找到 ${results.materials.length} 个素材`)
        store.setMaterialSearchResults(results.materials, results.source, results.platforms || [])
        store.showMaterialSelectionDialog()
      } else {
        ElMessage.warning('未找到相关素材')
      }

      return results
    } catch (error) {
      console.error('授权搜索失败:', error)
      ElMessage.error(`搜索失败: ${error.message}`)
      throw error
    }
  }

  // 取消授权
  const cancelAuthorization = () => {
    console.log('用户取消授权')
    store.hideAuthorizationDialog()
    ElMessage.info('已取消素材搜索')
  }

  // 仅使用本地素材
  const useLocalOnly = async () => {
    try {
      console.log('用户选择仅使用本地素材')

      const keywords = store.dialogs.pendingSearchKeywords
      const searchKeyword = keywords.join(' ')

      const results = await MaterialService.searchMaterials(searchKeyword, {
        limit: 20,
        localOnly: true
      })

      // 关闭授权对话框
      store.hideAuthorizationDialog()

      // 显示搜索结果
      if (results.materials.length > 0) {
        ElMessage.success(`找到 ${results.materials.length} 个本地素材`)
        store.setMaterialSearchResults(results.materials, results.source, [])
        store.showMaterialSelectionDialog()
      } else {
        ElMessage.warning('本地素材库中未找到相关素材')
      }

      return results
    } catch (error) {
      console.error('本地搜索失败:', error)
      ElMessage.error(`搜索失败: ${error.message}`)
      throw error
    }
  }

  // 确认选择素材
  const confirmMaterialSelection = selectedMaterials => {
    console.log('用户选择的素材:', selectedMaterials)

    if (selectedMaterials.length > 0) {
      ElMessage.success(`已选择 ${selectedMaterials.length} 个素材`)

      // TODO: 将选中的素材添加到画布或项目中
      selectedMaterials.forEach(material => {
        console.log('添加素材到画布:', material)
      })
    }

    // 关闭对话框
    closeMaterialDialog()
  }

  // 关闭素材对话框
  const closeMaterialDialog = () => {
    store.hideMaterialSelectionDialog()
    store.clearMaterialSearchResults()
  }

  return {
    // 状态
    showAuthDialog: computed(() => store.dialogs.showAuthDialog),
    showMaterialDialog: computed(() => store.dialogs.showMaterialDialog),
    searchResults: computed(() => store.materials.searchResults),
    searchResultSource: computed(() => store.materials.searchResultSource),
    searchResultPlatforms: computed(() => store.materials.searchResultPlatforms),
    pendingSearchKeywords: computed(() => store.dialogs.pendingSearchKeywords),

    // 方法
    searchMaterials,
    authorizeSearch,
    cancelAuthorization,
    useLocalOnly,
    confirmMaterialSelection,
    closeMaterialDialog
  }
}
