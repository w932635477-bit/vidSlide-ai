/**
 * useMaterialManagement - 素材管理Composable（简化版）
 * 注意：MaterialService 已在简化架构中移除
 * 现在使用豆包生图替代素材搜索
 */
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useWorkspaceStore } from '@/stores/workspaceStore'

export function useMaterialManagement() {
  const store = useWorkspaceStore()

  // 搜索素材（简化版 - 使用豆包生图）
  const searchMaterials = async requirement => {
    try {
      console.log('⚠️ 素材搜索功能已简化，现在使用豆包生图')
      console.log('🔍 需求:', requirement)

      ElMessage.info('现在使用豆包生图，无需搜索素材')

      // 返回空结果
      return {
        source: 'doubao',
        materials: [],
        platforms: []
      }
    } catch (error) {
      console.error('❌ 搜索失败:', error)
      ElMessage.error('搜索失败: ' + error.message)
      throw error
    }
  }

  // 授权搜索（简化版 - 不再需要）
  const authorizeSearch = async platforms => {
    console.log('⚠️ 授权搜索功能已简化')
    store.hideAuthorizationDialog()
    ElMessage.info('现在使用豆包生图，无需授权')
    return { materials: [], source: 'doubao', platforms: [] }
  }

  // 取消授权
  const cancelAuthorization = () => {
    console.log('用户取消授权')
    store.hideAuthorizationDialog()
    ElMessage.info('已取消')
  }

  // 仅使用本地素材（简化版 - 不再需要）
  const useLocalOnly = async () => {
    console.log('⚠️ 本地素材功能已简化')
    store.hideAuthorizationDialog()
    ElMessage.info('现在使用豆包生图')
    return { materials: [], source: 'doubao', platforms: [] }
  }

  // 确认选择素材
  const confirmMaterialSelection = selectedMaterials => {
    console.log('用户选择的素材:', selectedMaterials)

    if (selectedMaterials.length > 0) {
      ElMessage.success(`已选择 ${selectedMaterials.length} 个素材`)
    }

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
