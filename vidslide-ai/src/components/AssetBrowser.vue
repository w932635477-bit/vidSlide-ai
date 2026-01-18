<template>
  <div class="asset-browser" role="main" aria-label="素材浏览器">
    <!-- 浏览器头部 -->
    <AssetBrowserHeader
      :status="assetManagerStatus"
      :is-loading="isLoading"
      @refresh="refreshAssets"
      @upload="openUploadDialog"
    />

    <!-- 智能调度器状态 -->
    <section class="dispatcher-section">
      <DispatcherStatus
        :search-query="searchQuery"
        :is-searching="isLoading"
        :current-strategy="dispatcherStrategy"
        @strategy-changed="handleStrategyChanged"
      />
    </section>

    <!-- 搜索和过滤区域 -->
    <AssetSearchFilters
      v-model:search-query="searchQuery"
      v-model:selected-category="selectedCategory"
      v-model:selected-type="selectedType"
      v-model:sort-by="sortBy"
      v-model:color-filters="colorFilters"
      v-model:show-downloaded-only="showDownloadedOnly"
      :categories="categories"
      :supported-colors="supportedColors"
      @clear="clearSearch"
      @update:search-query="debouncedSearch"
      @update:selected-category="applyFilters"
      @update:selected-type="applyFilters"
      @update:sort-by="applySorting"
      @update:color-filters="applyFilters"
      @update:show-downloaded-only="applyFilters"
    />

    <!-- 素材网格 -->
    <AssetGrid
      :assets="assets"
      :selected-assets="selectedAssets"
      :downloading-assets="downloadingAssets"
      :is-loading="isLoading"
      :has-search="!!searchQuery"
      :empty-description="getEmptyDescription()"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-assets="totalAssets"
      @select="selectAsset"
      @preview="previewAsset"
      @download="downloadAsset"
      @action="handleAssetAction"
      @clear-search="clearSearch"
      @load-popular="loadPopularAssetsOrShowConfig"
      @size-change="handleSizeChange"
      @page-change="handleCurrentChange"
    />

    <!-- API配置对话框 -->
    <el-dialog
      v-model="apiConfigDialogVisible"
      title="配置外部素材API"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="api-config-content">
        <!-- API配置内容... (保持原有配置界面) -->
      </div>
      <template #footer>
        <el-button @click="cancelApiConfig">取消</el-button>
        <el-button type="primary" :loading="configuringApis" @click="confirmApiConfig">
          确认配置
        </el-button>
      </template>
    </el-dialog>

    <!-- 素材预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="previewAssetData?.name || '素材预览'"
      width="80%"
      :before-close="closePreview"
    >
      <div class="asset-preview">
        <!-- 预览内容... (保持原有预览界面) -->
      </div>
      <template #footer>
        <el-button @click="closePreview">关闭</el-button>
        <el-button
          v-if="!previewAssetData?.isDownloaded"
          type="primary"
          :loading="downloadingAssets.includes(previewAssetData?.id)"
          @click="downloadAsset(previewAssetData)"
        >
          下载素材
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAssetManager } from '../../utils/AssetManager.js'
import { API_CONFIGS } from '../../config/api-keys.js'
import AssetBrowserHeader from './asset-browser/AssetBrowserHeader.vue'
import AssetSearchFilters from './asset-browser/AssetSearchFilters.vue'
import AssetGrid from './asset-browser/AssetGrid.vue'
import DispatcherStatus from './DispatcherStatus.vue'

// Props
const props = defineProps({
  selectedAssets: {
    type: Array,
    default: () => []
  },
  multiSelect: {
    type: Boolean,
    default: false
  },
  filterByDownloaded: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['asset-selected', 'asset-previewed', 'assets-downloaded'])

// 资产管理器实例
const assetManager = getAssetManager()

// 响应式数据
const assets = ref([])
const isLoading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedType = ref('')
const sortBy = ref('lastUsed')
const colorFilters = ref([])
const showDownloadedOnly = ref(false)
const dispatcherStrategy = ref('balanced')
const currentPage = ref(1)
const pageSize = ref(24)
const totalAssets = ref(0)
const selectedAssets = ref([...props.selectedAssets])
const downloadingAssets = ref([])
const previewDialogVisible = ref(false)
const previewAssetData = ref(null)
const apiConfigDialogVisible = ref(false)
const apiKeys = ref({
  unsplash: '',
  pexels: '',
  pixabay: ''
})
const configuringApis = ref(false)

// 计算属性
const assetManagerStatus = computed(() => assetManager.getStatus())
const categories = computed(() => assetManager.getSupportedCategories())
const supportedColors = computed(() => assetManager.getSupportedColors())

// 方法
const initializeBrowser = async () => {
  try {
    await assetManager.initialize()
    await autoConfigureAPIs()
    assetManager.on('downloadCompleted', handleDownloadCompleted)
    assetManager.on('downloadFailed', handleDownloadFailed)
    await loadAssets()
  } catch (error) {
    console.error('初始化素材浏览器失败:', error)
    ElMessage.error('初始化素材浏览器失败')
  }
}

const autoConfigureAPIs = async () => {
  try {
    let configuredCount = 0
    if (API_CONFIGS.unsplash?.accessKey && !assetManager.externalAPI.apis.unsplash.accessKey) {
      assetManager.configureAPI('unsplash', API_CONFIGS.unsplash.accessKey)
      configuredCount++
    }
    if (API_CONFIGS.pexels?.apiKey && !assetManager.externalAPI.apis.pexels.accessKey) {
      assetManager.configureAPI('pexels', API_CONFIGS.pexels.apiKey)
      configuredCount++
    }
    if (API_CONFIGS.pixabay?.apiKey && !assetManager.externalAPI.apis.pixabay.accessKey) {
      assetManager.configureAPI('pixabay', API_CONFIGS.pixabay.apiKey)
      configuredCount++
    }
    if (configuredCount > 0) {
      console.log(`自动配置了${configuredCount}个API密钥`)
    }
  } catch (error) {
    console.warn('自动配置API密钥失败:', error)
  }
}

const loadAssets = async () => {
  isLoading.value = true
  try {
    const filters = {}
    if (selectedType.value) filters.type = selectedType.value
    if (selectedCategory.value) filters.category = selectedCategory.value
    if (colorFilters.value.length > 0) filters.color = colorFilters.value[0]
    if (showDownloadedOnly.value) filters.isDownloaded = true

    const options = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value,
      sortBy: sortBy.value,
      sortOrder: 'desc'
    }

    let results
    if (searchQuery.value.trim()) {
      results = await assetManager.searchAssets(searchQuery.value, {
        ...options,
        includeLocal: true,
        includeExternal: true
      })
      assets.value = [...results.local, ...results.external]
    } else {
      const localResults = await assetManager.storage.searchAssets(filters, options)
      if (localResults.length < pageSize.value) {
        const apiStatus = assetManager.getAPIStatus()
        const hasConfiguredApi = apiStatus.unsplash?.configured || apiStatus.pexels?.configured
        if (hasConfiguredApi) {
          try {
            const externalResults = await assetManager.getPopularAssets({
              limit: pageSize.value - localResults.length
            })
            assets.value = [...localResults, ...externalResults]
          } catch (error) {
            console.warn('获取外部热门素材失败:', error)
            assets.value = localResults
            ElMessage.warning('外部素材加载失败，仅显示本地素材')
          }
        } else {
          assets.value = localResults
          if (localResults.length === 0) {
            showApiConfigDialog()
          }
        }
      } else {
        assets.value = localResults
      }
    }
    totalAssets.value = assets.value.length
  } catch (error) {
    console.error('加载素材失败:', error)
    ElMessage.error('加载素材失败，请重试')
  } finally {
    isLoading.value = false
  }
}

const refreshAssets = async () => {
  await loadAssets()
  ElMessage.success('素材列表已刷新')
}

const loadPopularAssetsOrShowConfig = async () => {
  const apiStatus = assetManager.getAPIStatus()
  const hasConfiguredApi = apiStatus.unsplash?.configured || apiStatus.pexels?.configured
  if (!hasConfiguredApi) {
    showApiConfigDialog()
    return
  }
  await loadPopularAssets()
}

const loadPopularAssets = async () => {
  isLoading.value = true
  try {
    assets.value = await assetManager.getPopularAssets({ limit: pageSize.value })
    totalAssets.value = assets.value.length
    searchQuery.value = ''
    selectedCategory.value = ''
    selectedType.value = ''
  } catch (error) {
    console.error('加载热门素材失败:', error)
    ElMessage.error('加载热门素材失败，请检查网络连接或API配置')
  } finally {
    isLoading.value = false
  }
}

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadAssets()
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  loadAssets()
}

const handleStrategyChanged = strategy => {
  console.log('调度策略变更为:', strategy)
  localStorage.setItem('vidslide_dispatcher_strategy', strategy)
  if (searchQuery.value.trim()) {
    loadAssets()
  }
  ElMessage.success(`已切换到${getStrategyDisplayName(strategy)}模式`)
}

const getStrategyDisplayName = strategy => {
  const names = {
    speed: '速度优先',
    quality: '质量优先',
    balanced: '平衡模式',
    auto: '智能自动'
  }
  return names[strategy] || strategy
}

const applyFilters = () => {
  currentPage.value = 1
  loadAssets()
}

const applySorting = () => {
  loadAssets()
}

const selectAsset = asset => {
  if (props.multiSelect) {
    const index = selectedAssets.value.indexOf(asset.id)
    if (index > -1) {
      selectedAssets.value.splice(index, 1)
    } else {
      selectedAssets.value.push(asset.id)
    }
  } else {
    selectedAssets.value = [asset.id]
  }
  emit('asset-selected', asset)
}

const previewAsset = asset => {
  previewAssetData.value = asset
  previewDialogVisible.value = true
  emit('asset-previewed', asset)
}

const closePreview = () => {
  previewDialogVisible.value = false
  previewAssetData.value = null
}

const downloadAsset = async asset => {
  if (downloadingAssets.value.includes(asset.id)) return
  downloadingAssets.value.push(asset.id)
  try {
    const downloadedAsset = await assetManager.downloadAsset(asset, {
      checkCopyright: true,
      addToLibrary: true
    })
    ElMessage.success(`素材"${asset.name}"下载完成`)
    emit('assets-downloaded', downloadedAsset)
    await loadAssets()
  } catch (error) {
    console.error('下载素材失败:', error)
    ElMessage.error(`下载失败: ${error.message}`)
  } finally {
    const index = downloadingAssets.value.indexOf(asset.id)
    if (index > -1) {
      downloadingAssets.value.splice(index, 1)
    }
  }
}

const handleAssetAction = async command => {
  const { action, asset } = command
  switch (action) {
    case 'preview':
      previewAsset(asset)
      break
    case 'info':
      previewAsset(asset)
      break
    case 'delete':
      try {
        await ElMessageBox.confirm(
          `确定要删除素材"${asset.name}"吗？此操作不可恢复。`,
          '确认删除',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        await assetManager.deleteLocalAsset(asset.id)
        ElMessage.success('素材已删除')
        await loadAssets()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除素材失败:', error)
          ElMessage.error('删除素材失败')
        }
      }
      break
  }
}

const handleDownloadCompleted = data => {
  const { asset } = data
  ElMessage.success(`素材"${asset.name}"下载完成`)
  const index = downloadingAssets.value.indexOf(asset.id)
  if (index > -1) {
    downloadingAssets.value.splice(index, 1)
  }
}

const handleDownloadFailed = data => {
  const { asset, error } = data
  ElMessage.error(`素材"${asset.name}"下载失败: ${error.message}`)
  const index = downloadingAssets.value.indexOf(asset.id)
  if (index > -1) {
    downloadingAssets.value.splice(index, 1)
  }
}

const handleSizeChange = newSize => {
  pageSize.value = newSize
  currentPage.value = 1
  loadAssets()
}

const handleCurrentChange = newPage => {
  currentPage.value = newPage
  loadAssets()
}

const openUploadDialog = () => {
  ElMessage.info('本地文件上传功能开发中...')
}

const showApiConfigDialog = () => {
  const savedKeys = localStorage.getItem('vidslide-api-keys')
  if (savedKeys) {
    try {
      const parsedKeys = JSON.parse(savedKeys)
      apiKeys.value = { unsplash: '', pexels: '', pixabay: '', ...parsedKeys }
    } catch (error) {
      console.warn('加载保存的API密钥失败:', error)
    }
  }
  apiConfigDialogVisible.value = true
}

const confirmApiConfig = async () => {
  configuringApis.value = true
  try {
    let configuredCount = 0
    if (apiKeys.value.unsplash.trim()) {
      assetManager.configureAPI('unsplash', apiKeys.value.unsplash.trim())
      configuredCount++
    }
    if (apiKeys.value.pexels.trim()) {
      assetManager.configureAPI('pexels', apiKeys.value.pexels.trim())
      configuredCount++
    }
    if (apiKeys.value.pixabay.trim()) {
      assetManager.configureAPI('pixabay', apiKeys.value.pixabay.trim())
      configuredCount++
    }
    if (configuredCount > 0) {
      localStorage.setItem('vidslide-api-keys', JSON.stringify(apiKeys.value))
      ElMessage.success(`成功配置了${configuredCount}个API，现在可以获取外部素材了！`)
      apiConfigDialogVisible.value = false
      await loadAssets()
    } else {
      ElMessage.warning('请至少配置一个API密钥')
    }
  } catch (error) {
    console.error('API配置失败:', error)
    ElMessage.error('API配置失败，请检查密钥是否正确')
  } finally {
    configuringApis.value = false
  }
}

const cancelApiConfig = () => {
  apiConfigDialogVisible.value = false
  apiKeys.value = { unsplash: '', pexels: '', pixabay: '' }
}

const getEmptyDescription = () => {
  if (searchQuery.value) {
    return `未找到包含"${searchQuery.value}"的素材`
  }
  return '暂无素材，点击"浏览热门素材"或上传本地文件'
}

onMounted(async () => {
  const savedStrategy = localStorage.getItem('vidslide_dispatcher_strategy')
  if (savedStrategy) {
    dispatcherStrategy.value = savedStrategy
  }
  await initializeBrowser()
})

onUnmounted(() => {
  assetManager.off('downloadCompleted', handleDownloadCompleted)
  assetManager.off('downloadFailed', handleDownloadFailed)
})
</script>

<style scoped>
.asset-browser {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dispatcher-section {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}
</style>
