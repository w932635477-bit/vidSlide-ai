/**
 * useAssetBrowser.js
 * VidSlide AI - 素材浏览器业务逻辑
 *
 * 提供素材浏览、搜索、过滤、下载等核心业务逻辑
 *
 * 功能：
 * - 素材加载和搜索
 * - 过滤和排序
 * - 下载管理
 * - API配置
 * - 状态管理
 */

import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAssetManager } from '../utils/AssetManager.js'
import { API_CONFIGS } from '../config/api-keys.js'

/**
 * 素材浏览器业务逻辑组合式函数
 * @param {Object} props - 组件属性
 * @param {Function} emit - 事件发射器
 * @returns {Object} 业务逻辑状态和方法
 */
export function useAssetBrowser(props, emit) {
  // ==================== 核心状态 ====================

  // 资产管理器实例
  const assetManager = getAssetManager()

  // 素材列表
  const assets = ref([])

  // 加载状态
  const isLoading = ref(false)

  // 搜索和过滤状态
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const selectedType = ref('')
  const sortBy = ref('lastUsed')
  const colorFilters = ref([])
  const showDownloadedOnly = ref(false)

  // 调度器策略
  const dispatcherStrategy = ref('balanced')

  // 分页状态
  const currentPage = ref(1)
  const pageSize = ref(24)
  const totalAssets = ref(0)

  // 选中的素材
  const selectedAssets = ref([...props.selectedAssets])

  // 下载队列
  const downloadingAssets = ref([])

  // API配置状态
  const apiConfigDialogVisible = ref(false)
  const apiKeys = ref({
    unsplash: '',
    pexels: '',
    pixabay: ''
  })
  const configuringApis = ref(false)

  // ==================== 计算属性 ====================

  // 支持的分类列表
  const categories = computed(() => assetManager.getSupportedCategories())

  // 支持的颜色过滤选项
  const supportedColors = computed(() => assetManager.getSupportedColors())

  // 获取资产管理器状态颜色
  const getStatusColor = () => {
    const status = assetManager.getStatus()
    if (status.initialized) return 'success'
    if (status.storage) return 'warning'
    return 'danger'
  }

  // 获取资产管理器状态文本
  const getStatusText = () => {
    const status = assetManager.getStatus()
    if (status.initialized) return '就绪'
    if (status.storage) return '初始化中'
    return '未初始化'
  }

  // 获取空状态描述
  const getEmptyDescription = () => {
    if (searchQuery.value) {
      return `未找到包含"${searchQuery.value}"的素材`
    }
    return '暂无素材，点击"浏览热门素材"或上传本地文件'
  }

  // ==================== API配置方法 ====================

  /**
   * 自动配置API密钥
   * 从预定义配置中自动设置API密钥
   */
  const autoConfigureAPIs = async () => {
    try {
      let configuredCount = 0

      // 配置Unsplash API
      if (API_CONFIGS.unsplash?.accessKey && !assetManager.externalAPI.apis.unsplash.accessKey) {
        assetManager.configureAPI('unsplash', API_CONFIGS.unsplash.accessKey)
        configuredCount++
      }

      // 配置Pexels API
      if (API_CONFIGS.pexels?.apiKey && !assetManager.externalAPI.apis.pexels.accessKey) {
        assetManager.configureAPI('pexels', API_CONFIGS.pexels.apiKey)
        configuredCount++
      }

      // 配置Pixabay API
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

  /**
   * 显示API配置对话框
   */
  const showApiConfigDialog = () => {
    // 尝试从本地存储加载已保存的API密钥
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

  /**
   * 确认API配置
   */
  const confirmApiConfig = async () => {
    configuringApis.value = true

    try {
      let configuredCount = 0

      // 配置Unsplash API
      if (apiKeys.value.unsplash.trim()) {
        assetManager.configureAPI('unsplash', apiKeys.value.unsplash.trim())
        configuredCount++
      }

      // 配置Pexels API
      if (apiKeys.value.pexels.trim()) {
        assetManager.configureAPI('pexels', apiKeys.value.pexels.trim())
        configuredCount++
      }

      // 配置Pixabay API
      if (apiKeys.value.pixabay.trim()) {
        assetManager.configureAPI('pixabay', apiKeys.value.pixabay.trim())
        configuredCount++
      }

      if (configuredCount > 0) {
        // 保存到本地存储
        localStorage.setItem('vidslide-api-keys', JSON.stringify(apiKeys.value))

        ElMessage.success(`成功配置了${configuredCount}个API，现在可以获取外部素材了！`)

        // 关闭对话框
        apiConfigDialogVisible.value = false

        // 刷新素材列表
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

  /**
   * 取消API配置
   */
  const cancelApiConfig = () => {
    apiConfigDialogVisible.value = false
    apiKeys.value = { unsplash: '', pexels: '', pixabay: '' }
  }

  // ==================== 素材加载方法 ====================

  /**
   * 初始化素材浏览器
   */
  const initializeBrowser = async () => {
    try {
      await assetManager.initialize()

      // 自动配置API密钥
      await autoConfigureAPIs()

      // 设置事件监听
      assetManager.on('downloadCompleted', handleDownloadCompleted)
      assetManager.on('downloadFailed', handleDownloadFailed)

      // 加载初始素材
      await loadAssets()
    } catch (error) {
      console.error('初始化素材浏览器失败:', error)
      ElMessage.error('初始化素材浏览器失败')
    }
  }

  /**
   * 加载素材列表
   */
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
        // 搜索模式
        results = await assetManager.searchAssets(searchQuery.value, {
          ...options,
          includeLocal: true,
          includeExternal: true
        })

        // 合并本地和外部结果
        assets.value = [...results.local, ...results.external]
      } else {
        // 浏览模式 - 优先显示本地素材
        const localResults = await assetManager.storage.searchAssets(filters, options)

        if (localResults.length < pageSize.value) {
          // 本地素材不足，检查是否需要补充外部热门素材
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
            // API未配置，显示配置提示
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

  /**
   * 刷新素材列表
   */
  const refreshAssets = async () => {
    await loadAssets()
    ElMessage.success('素材列表已刷新')
  }

  /**
   * 加载热门素材
   */
  const loadPopularAssets = async () => {
    isLoading.value = true

    try {
      assets.value = await assetManager.getPopularAssets({
        limit: pageSize.value
      })
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

  /**
   * 加载热门素材或显示配置对话框
   */
  const loadPopularAssetsOrShowConfig = async () => {
    // 检查API是否已配置
    const apiStatus = assetManager.getAPIStatus()
    const hasConfiguredApi = apiStatus.unsplash?.configured || apiStatus.pexels?.configured

    if (!hasConfiguredApi) {
      showApiConfigDialog()
      return
    }

    await loadPopularAssets()
  }

  // ==================== 搜索和过滤方法 ====================

  // 防抖搜索
  let searchTimeout = null
  const debouncedSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      loadAssets()
    }, 300)
  }

  /**
   * 清除搜索
   */
  const clearSearch = () => {
    searchQuery.value = ''
    loadAssets()
  }

  /**
   * 应用过滤器
   */
  const applyFilters = () => {
    currentPage.value = 1
    loadAssets()
  }

  /**
   * 应用排序
   */
  const applySorting = () => {
    loadAssets()
  }

  /**
   * 处理调度策略变更
   */
  const handleStrategyChanged = (strategy) => {
    console.log('调度策略变更为:', strategy)

    // 保存用户偏好设置
    localStorage.setItem('vidslide_dispatcher_strategy', strategy)

    // 如果当前有搜索查询，重新执行搜索以应用新策略
    if (searchQuery.value.trim()) {
      loadAssets()
    }

    ElMessage.success(`已切换到${getStrategyDisplayName(strategy)}模式`)
  }

  /**
   * 获取策略显示名称
   */
  const getStrategyDisplayName = (strategy) => {
    const names = {
      speed: '速度优先',
      quality: '质量优先',
      balanced: '平衡模式',
      auto: '智能自动'
    }
    return names[strategy] || strategy
  }

  // ==================== 素材操作方法 ====================

  /**
   * 选择素材
   */
  const selectAsset = (asset) => {
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

  /**
   * 下载素材
   */
  const downloadAsset = async (asset) => {
    if (downloadingAssets.value.includes(asset.id)) return

    downloadingAssets.value.push(asset.id)

    try {
      const downloadedAsset = await assetManager.downloadAsset(asset, {
        checkCopyright: true,
        addToLibrary: true
      })

      ElMessage.success(`素材"${asset.name}"下载完成`)
      emit('assets-downloaded', downloadedAsset)

      // 刷新列表
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

  /**
   * 处理素材操作
   */
  const handleAssetAction = async (command) => {
    const { action, asset } = command

    switch (action) {
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

          // 刷新列表
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

  // ==================== 事件处理方法 ====================

  /**
   * 处理下载完成事件
   */
  const handleDownloadCompleted = (data) => {
    const { asset } = data
    ElMessage.success(`素材"${asset.name}"下载完成`)

    // 从下载队列中移除
    const index = downloadingAssets.value.indexOf(asset.id)
    if (index > -1) {
      downloadingAssets.value.splice(index, 1)
    }
  }

  /**
   * 处理下载失败事件
   */
  const handleDownloadFailed = (data) => {
    const { asset, error } = data
    ElMessage.error(`素材"${asset.name}"下载失败: ${error.message}`)

    // 从下载队列中移除
    const index = downloadingAssets.value.indexOf(asset.id)
    if (index > -1) {
      downloadingAssets.value.splice(index, 1)
    }
  }

  // ==================== 分页方法 ====================

  /**
   * 处理每页大小变更
   */
  const handleSizeChange = (newSize) => {
    pageSize.value = newSize
    currentPage.value = 1
    loadAssets()
  }

  /**
   * 处理当前页变更
   */
  const handleCurrentChange = (newPage) => {
    currentPage.value = newPage
    loadAssets()
  }

  /**
   * 打开上传对话框
   */
  const openUploadDialog = () => {
    ElMessage.info('本地文件上传功能开发中...')
  }

  // ==================== 监听器 ====================

  // 监听外部属性变化
  watch(
    () => props.selectedAssets,
    (newSelected) => {
      selectedAssets.value = [...newSelected]
    }
  )

  watch(
    () => props.filterByDownloaded,
    (newValue) => {
      showDownloadedOnly.value = newValue
      if (newValue) {
        applyFilters()
      }
    }
  )

  // ==================== 清理方法 ====================

  /**
   * 清理事件监听器
   */
  const cleanup = () => {
    assetManager.off('downloadCompleted', handleDownloadCompleted)
    assetManager.off('downloadFailed', handleDownloadFailed)
  }

  // ==================== 返回值 ====================

  return {
    // 状态
    assets,
    isLoading,
    searchQuery,
    selectedCategory,
    selectedType,
    sortBy,
    colorFilters,
    showDownloadedOnly,
    dispatcherStrategy,
    currentPage,
    pageSize,
    totalAssets,
    selectedAssets,
    downloadingAssets,
    apiConfigDialogVisible,
    apiKeys,
    configuringApis,

    // 计算属性
    categories,
    supportedColors,

    // 方法
    getStatusColor,
    getStatusText,
    getEmptyDescription,
    initializeBrowser,
    loadAssets,
    refreshAssets,
    loadPopularAssets,
    loadPopularAssetsOrShowConfig,
    debouncedSearch,
    clearSearch,
    applyFilters,
    applySorting,
    handleStrategyChanged,
    selectAsset,
    downloadAsset,
    handleAssetAction,
    handleSizeChange,
    handleCurrentChange,
    openUploadDialog,
    showApiConfigDialog,
    confirmApiConfig,
    cancelApiConfig,
    cleanup
  }
}
