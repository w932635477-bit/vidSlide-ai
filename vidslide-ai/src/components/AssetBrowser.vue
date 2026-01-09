/** * AssetBrowser.vue * VidSlide AI - 紧急补齐阶段 *
实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统 */

<!--
  VidSlide AI - 素材浏览器组件
  提供完整的素材库浏览、搜索、下载功能
  支持本地素材和外部API素材的统一管理

  核心功能：
  - 关键词搜索和高级过滤
  - 本地+外部素材统一展示
  - 版权状态实时检查
  - 批量下载和收藏管理
  - 响应式设计和用户体验优化
-->
<template>
  <div
class="asset-browser" role="main"
aria-label="素材浏览器"
>
    <!-- 浏览器头部 -->
    <header
class="browser-header" role="banner"
>
      <div class="header-left">
        <h1 id="asset-browser-title">
素材浏览器
</h1>
        <el-tag
:type="getStatusColor()" size="small"
aria-label="浏览器状态"
>
          {{ getStatusText() }}
        </el-tag>
      </div>

      <div
class="header-actions" role="toolbar"
aria-label="浏览器操作"
>
        <el-button
          type="primary"
          size="small"
          :loading="isLoading"
          aria-label="刷新素材列表"
          :aria-describedby="isLoading ? 'loading-status' : undefined"
          @click="refreshAssets"
        >
          <el-icon aria-hidden="true">
            <RefreshRight />
          </el-icon>
          刷新
        </el-button>
        <span
v-if="isLoading" id="loading-status"
class="sr-only"
>正在加载素材...</span>

        <el-button
          type="success"
          size="small"
          aria-label="上传本地素材文件"
          @click="openUploadDialog"
        >
          <el-icon aria-hidden="true">
            <Upload />
          </el-icon>
          上传本地
        </el-button>
      </div>
    </header>

    <!-- 搜索和过滤区域 -->
    <section
class="search-filters" aria-labelledby="search-filters-heading"
>
      <h2 id="search-filters-heading"
class="sr-only"
>
搜索和过滤选项
</h2>
      <div class="search-row">
        <el-input
          v-model="searchQuery"
          placeholder="搜索素材..."
          clearable
          aria-label="搜索素材关键词"
          aria-describedby="search-help"
          @input="debouncedSearch"
          @clear="clearSearch"
        >
          <template #prefix>
            <el-icon aria-hidden="true">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <span
id="search-help" class="sr-only"
>输入关键词搜索图片、视频或音频素材</span>

        <el-select
v-model="selectedCategory" placeholder="分类"
clearable @change="applyFilters"
>
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          >
            <span>{{ category.icon }} {{ category.name }}</span>
          </el-option>
        </el-select>

        <el-select
v-model="selectedType" placeholder="类型"
clearable @change="applyFilters"
>
          <el-option
label="图片" value="image"
/>
          <el-option
label="视频" value="video"
/>
          <el-option
label="音频" value="audio"
/>
        </el-select>

        <el-select
v-model="sortBy" placeholder="排序"
@change="applySorting"
>
          <el-option
label="最新使用" value="lastUsed"
/>
          <el-option
label="创建时间" value="createdAt"
/>
          <el-option
label="名称" value="name"
/>
          <el-option
label="大小" value="fileSize"
/>
        </el-select>
      </div>

      <div class="filter-row">
        <el-checkbox-group
v-model="colorFilters" @change="applyFilters"
>
          <el-checkbox
v-for="color in supportedColors" :key="color.id"
:label="color.id"
>
            {{ color.name }}
          </el-checkbox>
        </el-checkbox-group>

        <el-switch
          v-model="showDownloadedOnly"
          active-text="仅显示已下载"
          inactive-text="显示全部"
          @change="applyFilters"
        />
      </div>
    </section>
  </div>

  <!-- 素材网格 -->
  <section
class="assets-grid" aria-labelledby="assets-grid-heading"
role="region"
>
    <h2 id="assets-grid-heading"
class="sr-only"
>
素材列表
</h2>

    <!-- 加载状态 -->
    <div
v-if="isLoading" class="loading-state"
aria-live="polite" aria-label="正在加载素材"
>
      <el-icon
class="is-loading" aria-hidden="true"
>
        <Loading />
      </el-icon>
      <p>正在加载素材...</p>
    </div>

    <!-- 空状态 -->
    <div
v-else-if="assets.length === 0" class="empty-state"
aria-live="polite"
>
      <el-empty
:description="getEmptyDescription()" :image-size="100"
>
        <template #image>
          <el-icon
size="100" class="empty-icon"
aria-hidden="true"
>
            <Picture />
          </el-icon>
        </template>
        <el-button
v-if="searchQuery" type="primary"
aria-label="清除搜索条件" @click="clearSearch"
>
          清除搜索
        </el-button>
        <el-button
          v-else
          type="primary"
          aria-label="浏览热门素材"
          @click="loadPopularAssetsOrShowConfig"
        >
          浏览热门素材
        </el-button>
      </el-empty>
    </div>

    <!-- 素材列表 -->
    <div
      v-else
      class="assets-list"
      role="grid"
      aria-label="素材网格列表"
      aria-rowcount="dynamic"
      :aria-colcount="Math.ceil(Math.sqrt(assets.length))"
    >
      <article
        v-for="(asset, index) in assets"
        :key="asset.id"
        class="asset-item"
        :class="{ selected: selectedAssets.includes(asset.id) }"
        role="gridcell"
        tabindex="0"
        :aria-label="`素材: ${asset.name}`"
        :aria-selected="selectedAssets.includes(asset.id)"
        :aria-describedby="`asset-info-${asset.id}`"
        @click="selectAsset(asset)"
        @dblclick="previewAsset(asset)"
        @keydown.enter="previewAsset(asset)"
        @keydown.space.prevent="selectAsset(asset)"
        @keydown.arrow-right="focusNextAsset(index)"
        @keydown.arrow-left="focusPreviousAsset(index)"
        @keydown.arrow-down="focusAssetBelow(index)"
        @keydown.arrow-up="focusAssetAbove(index)"
      >
        <!-- 素材缩略图 -->
        <div class="asset-thumbnail">
          <img
            v-if="asset.thumbnail"
            :src="asset.thumbnail"
            :alt="asset.name"
            @error="handleImageError"
          >
          <div
v-else class="thumbnail-placeholder"
>
            <el-icon size="32">
              <Picture />
            </el-icon>
          </div>

          <!-- 下载状态指示器 -->
          <div
v-if="asset.isDownloaded" class="download-indicator"
>
            <el-icon
size="16" color="#67C23A"
>
              <Check />
            </el-icon>
          </div>

          <!-- 版权状态指示器 -->
          <div
            v-if="asset.copyrightInfo"
            class="copyright-indicator"
            :class="getCopyrightClass(asset.copyrightInfo)"
            :aria-label="getCopyrightStatusText(asset.copyrightInfo)"
          >
            <el-icon
size="16" aria-hidden="true"
>
              <Warning v-if="asset.copyrightInfo.status === 'unknown'" />
              <SuccessFilled v-else-if="asset.copyrightInfo.isSafe" />
              <CircleClose v-else />
            </el-icon>
          </div>
        </div>

        <!-- 素材信息 -->
        <div
:id="`asset-info-${asset.id}`" class="asset-info"
>
          <h3
class="asset-name" :title="asset.name"
>
            {{ asset.name }}
          </h3>
          <div class="asset-meta">
            <span
class="asset-source" aria-label="来源"
>
              {{ getSourceDisplayName(asset.source) }}
            </span>
            <span
              v-if="asset.fileSize"
              class="asset-size"
              :aria-label="`文件大小: ${formatFileSize(asset.fileSize)}`"
            >
              {{ formatFileSize(asset.fileSize) }}
            </span>
          </div>
          <div
v-if="asset.author" class="asset-author"
:aria-label="`作者: ${asset.author.name}`"
>
            by {{ asset.author.name }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div
class="asset-actions" role="group"
:aria-label="`${asset.name}的操作`"
>
          <el-button
            v-if="!asset.isDownloaded"
            type="primary"
            size="small"
            :loading="downloadingAssets.includes(asset.id)"
            :aria-label="`下载素材: ${asset.name}`"
            :aria-describedby="
              downloadingAssets.includes(asset.id) ? `downloading-${asset.id}` : undefined
            "
            @click.stop="downloadAsset(asset)"
          >
            下载
          </el-button>
          <span
            v-if="downloadingAssets.includes(asset.id)"
            :id="`downloading-${asset.id}`"
            class="sr-only"
          >
            正在下载{{ asset.name }}
          </span>

          <el-dropdown
            trigger="click"
            :aria-label="`${asset.name}的更多操作`"
            @command="cmd => handleAssetAction(cmd, asset)"
          >
            <el-button
size="small" :aria-label="`打开${asset.name}的操作菜单`"
@click.stop
>
              <el-icon aria-hidden="true">
                <More />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="{ action: 'preview', asset }">
                  <el-icon><View /></el-icon>
                  预览
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'info', asset }">
                  <el-icon><InfoFilled /></el-icon>
                  详细信息
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="asset.isDownloaded"
                  :command="{ action: 'delete', asset }"
                  divided
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </article>
    </div>

    <!-- 分页 -->
    <div
v-if="totalAssets > pageSize" class="pagination"
>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalAssets"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- API配置对话框 -->
    <el-dialog
      v-model="apiConfigDialogVisible"
      title="配置外部素材API"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="api-config-content">
        <el-alert
          title="免费素材API配置"
          description="为了获取免费的高质量素材，您需要配置以下API密钥。这些API完全免费，不涉及任何费用。"
          type="info"
          :closable="false"
          class="mb-4"
        />

        <div class="api-config-section">
          <h4 class="section-title">
            <el-icon><Picture /></el-icon>
            Unsplash API (推荐)
          </h4>
          <div class="api-info">
            <p>Unsplash是最大的免费图片素材库，提供数百万张高质量图片。</p>
            <div class="api-steps">
              <ol>
                <li>
                  访问
                  <a
                    href="https://unsplash.com/developers"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Unsplash Developers
                  </a>
                </li>
                <li>点击 "New Application" 创建应用</li>
                <li>复制 "Access Key" 并粘贴到下方</li>
              </ol>
            </div>
            <el-input
              v-model="apiKeys.unsplash"
              placeholder="输入Unsplash Access Key"
              type="password"
              show-password
              class="api-key-input"
            />
          </div>
        </div>

        <div class="api-config-section">
          <h4 class="section-title">
            <el-icon><VideoCamera /></el-icon>
            Pexels API (可选)
          </h4>
          <div class="api-info">
            <p>Pexels提供免费的高清图片和视频素材。</p>
            <div class="api-steps">
              <ol>
                <li>
                  访问
                  <a
href="https://www.pexels.com/api/" target="_blank"
rel="noopener noreferrer"
>
                    Pexels API
                  </a>
                </li>
                <li>点击 "Get Started" 注册账号</li>
                <li>复制 "API Key" 并粘贴到下方</li>
              </ol>
            </div>
            <el-input
              v-model="apiKeys.pexels"
              placeholder="输入Pexels API Key"
              type="password"
              show-password
              class="api-key-input"
            />
          </div>
        </div>

        <div class="api-notice">
          <el-alert
            title="隐私保护说明"
            description="您的API密钥只会存储在本地浏览器中，不会上传到任何服务器。所有素材下载和使用都会进行版权检查，确保合规使用。"
            type="success"
            :closable="false"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="cancelApiConfig">
取消
</el-button>
        <el-button
type="primary" :loading="configuringApis"
@click="confirmApiConfig"
>
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
        <div class="preview-image">
          <img
            v-if="previewAssetData?.url"
            :src="previewAssetData.url"
            :alt="previewAssetData.name"
          >
        </div>

        <div class="preview-info">
          <div class="info-section">
            <h4>基本信息</h4>
            <dl class="info-list">
              <dt>名称:</dt>
              <dd>{{ previewAssetData?.name }}</dd>
              <dt>类型:</dt>
              <dd>{{ previewAssetData?.type }}</dd>
              <dt>分类:</dt>
              <dd>{{ previewAssetData?.category }}</dd>
              <dt>来源:</dt>
              <dd>{{ getSourceDisplayName(previewAssetData?.source) }}</dd>
              <dt>尺寸:</dt>
              <dd>{{ previewAssetData?.width }} x {{ previewAssetData?.height }}</dd>
              <dt>文件大小:</dt>
              <dd>{{ formatFileSize(previewAssetData?.fileSize) }}</dd>
            </dl>
          </div>

          <div
v-if="previewAssetData?.author" class="info-section"
>
            <h4>作者信息</h4>
            <dl class="info-list">
              <dt>姓名:</dt>
              <dd>{{ previewAssetData.author.name }}</dd>
              <dt>用户名:</dt>
              <dd>{{ previewAssetData.author.username }}</dd>
              <dt>主页:</dt>
              <dd>
                <a
                  :href="previewAssetData.author.profileUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  查看主页
                </a>
              </dd>
            </dl>
          </div>

          <div
v-if="previewAssetData?.copyrightInfo" class="info-section"
>
            <h4>版权信息</h4>
            <div class="copyright-status">
              <el-tag :type="getCopyrightTagType(previewAssetData.copyrightInfo)">
                {{ getCopyrightStatusText(previewAssetData.copyrightInfo) }}
              </el-tag>
            </div>

            <dl
v-if="previewAssetData.copyrightInfo.license" class="info-list"
>
              <dt>许可证:</dt>
              <dd>{{ previewAssetData.copyrightInfo.license.name }}</dd>
              <dt>描述:</dt>
              <dd>{{ previewAssetData.copyrightInfo.license.description }}</dd>
            </dl>

            <div
              v-if="previewAssetData.copyrightInfo.warnings.length > 0"
              class="copyright-warnings"
            >
              <h5>⚠️ 注意事项</h5>
              <ul>
                <li
v-for="warning in previewAssetData.copyrightInfo.warnings" :key="warning"
>
                  {{ warning }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="closePreview">
关闭
</el-button>
        <el-button
          v-if="!previewAssetData?.isDownloaded"
          type="primary"
          :loading="downloadingAssets.includes(previewAssetData?.id)"
          @click="downloadAsset(previewAssetData)"
        >
          下载素材
        </el-button>
        <el-button
          v-if="previewAssetData?.copyrightInfo?.isSafe"
          type="success"
          @click="emitAssetSelected(previewAssetData)"
        >
          选择使用
        </el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Search,
  RefreshRight,
  Upload,
  Loading,
  Picture,
  Check,
  Warning,
  SuccessFilled,
  CircleClose,
  More,
  View,
  InfoFilled,
  Delete,
  VideoCamera
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAssetManager } from '../utils/AssetManager.js'

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

// 响应式数据

// 资产管理器实例，用于管理素材的搜索、下载等操作
const assetManager = getAssetManager()

// 当前显示的素材列表
const assets = ref([])

// 加载状态指示器
const isLoading = ref(false)

// 搜索关键词
const searchQuery = ref('')

// 选中的素材分类
const selectedCategory = ref('')

// 选中的素材类型过滤器
const selectedType = ref('')

// 排序方式
const sortBy = ref('lastUsed')

// 颜色过滤器数组
const colorFilters = ref([])

// 是否只显示已下载的素材
const showDownloadedOnly = ref(false)

// 当前页码
const currentPage = ref(1)

// 每页显示数量
const pageSize = ref(24)

// 素材总数
const totalAssets = ref(0)

// 已选中的素材ID数组
const selectedAssets = ref([...props.selectedAssets])

// 正在下载的素材ID数组
const downloadingAssets = ref([])

// 预览对话框显示状态
const previewDialogVisible = ref(false)

// 当前预览的素材数据
const previewAssetData = ref(null)

// API配置对话框显示状态
const apiConfigDialogVisible = ref(false)

// API密钥存储对象
const apiKeys = ref({
  unsplash: '',
  pexels: ''
})

// API配置加载状态
const configuringApis = ref(false)

// 计算属性

// 支持的素材分类列表
const categories = computed(() => assetManager.getSupportedCategories())

// 支持的颜色过滤选项
const supportedColors = computed(() => assetManager.getSupportedColors())

/**
 * 获取资产管理器状态对应的颜色
 * @returns {string} Element Plus标签颜色
 */
const getStatusColor = () => {
  const status = assetManager.getStatus()
  if (status.initialized) return 'success'
  if (status.storage) return 'warning'
  return 'danger'
}

/**
 * 获取资产管理器状态对应的文本描述
 * @returns {string} 状态文本
 */
const getStatusText = () => {
  const status = assetManager.getStatus()
  if (status.initialized) return '就绪'
  if (status.storage) return '初始化中'
  return '未初始化'
}

/**
 * 获取空状态时的描述文本
 * @returns {string} 描述文本
 */
const getEmptyDescription = () => {
  if (searchQuery.value) {
    return `未找到包含"${searchQuery.value}"的素材`
  }
  return '暂无素材，点击"浏览热门素材"或上传本地文件'
}

// 方法

/**
 * 初始化素材浏览器组件
 * 设置资产管理器并加载初始素材数据
 */
const initializeBrowser = async () => {
  try {
    await assetManager.initialize()

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
 * 根据当前搜索条件和过滤器从本地和外部API获取素材
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


 * refreshAssets 函数


 * VidSlide AI 功能实现


 */

const refreshAssets = async () => {
  await loadAssets()
  ElMessage.success('素材列表已刷新')
}

/**
 * 加载热门素材或显示配置对话框
 * 检查API配置状态，如果未配置则显示配置对话框，否则加载热门素材
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

/**


 * loadPopularAssets 函数


 * VidSlide AI 功能实现


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

// 防抖搜索
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

/**


 * applyFilters 函数


 * VidSlide AI 功能实现


 */

const applyFilters = () => {
  currentPage.value = 1
  loadAssets()
}

/**


 * applySorting 函数


 * VidSlide AI 功能实现


 */

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

/**


 * closePreview 函数


 * VidSlide AI 功能实现


 */

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

const handleDownloadCompleted = data => {
  const { asset } = data
  ElMessage.success(`素材"${asset.name}"下载完成`)

  // 从下载队列中移除
  const index = downloadingAssets.value.indexOf(asset.id)
  if (index > -1) {
    downloadingAssets.value.splice(index, 1)
  }
}

const handleDownloadFailed = data => {
  const { asset, error } = data
  ElMessage.error(`素材"${asset.name}"下载失败: ${error.message}`)

  // 从下载队列中移除
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

/**


 * openUploadDialog 函数


 * VidSlide AI 功能实现


 */

const openUploadDialog = () => {
  // 这里可以触发文件上传对话框
  ElMessage.info('本地文件上传功能开发中...')
}

const emitAssetSelected = asset => {
  emit('asset-selected', asset)
  closePreview()
}

// API配置相关方法

/**
 * 显示API配置对话框
 * 尝试从本地存储加载已保存的API密钥
 */
const showApiConfigDialog = () => {
  // 尝试从本地存储加载已保存的API密钥
  const savedKeys = localStorage.getItem('vidslide-api-keys')
  if (savedKeys) {
    try {
      const parsedKeys = JSON.parse(savedKeys)
      apiKeys.value = { ...apiKeys.value, ...parsedKeys }
    } catch (error) {
      console.warn('加载保存的API密钥失败:', error)
    }
  }

  apiConfigDialogVisible.value = true
}

/**
 * 确认API配置
 * 验证并应用用户输入的API密钥配置
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
 * 关闭配置对话框并重置输入
 */
const cancelApiConfig = () => {
  apiConfigDialogVisible.value = false
  apiKeys.value = { unsplash: '', pexels: '' }
}

// 工具函数

/**
 * 获取素材来源的显示名称
 * @param {string} source - 素材来源标识
 * @returns {string} 显示名称
 */
const getSourceDisplayName = source => {
  const sourceNames = {
    unsplash: 'Unsplash',
    pexels: 'Pexels',
    local: '本地',
    uploaded: '上传'
  }
  return sourceNames[source] || source || '未知'
}

/**
 * 格式化文件大小显示
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化的文件大小字符串
 */
const formatFileSize = bytes => {
  if (!bytes) return ''
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 获取版权状态对应的CSS类名
 * @param {Object} copyrightInfo - 版权信息对象
 * @returns {string} CSS类名
 */
const getCopyrightClass = copyrightInfo => {
  if (copyrightInfo.isSafe) return 'safe'
  if (copyrightInfo.status === 'unknown') return 'unknown'
  return 'unsafe'
}

/**
 * 获取版权状态对应的Element Plus标签类型
 * @param {Object} copyrightInfo - 版权信息对象
 * @returns {string} 标签类型
 */
const getCopyrightTagType = copyrightInfo => {
  if (copyrightInfo.isSafe) return 'success'
  if (copyrightInfo.status === 'unknown') return 'warning'
  return 'danger'
}

/**
 * 获取版权状态的文本描述
 * @param {Object} copyrightInfo - 版权信息对象
 * @returns {string} 状态文本
 */
const getCopyrightStatusText = copyrightInfo => {
  const statusTexts = {
    free: '免费使用',
    cc: '创意共享',
    paid: '付费许可证',
    copyrighted: '受版权保护',
    unknown: '未知状态'
  }
  return statusTexts[copyrightInfo.status] || '未知'
}

const handleImageError = event => {
  // 图片加载失败时显示占位符
  const img = event.target
  img.style.display = 'none'
  const placeholder = img.parentElement.querySelector('.thumbnail-placeholder')
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}

// 键盘导航辅助方法
const focusNextAsset = currentIndex => {
  const nextIndex = currentIndex + 1
  if (nextIndex < assets.value.length) {
    focusAssetAtIndex(nextIndex)
  }
}

const focusPreviousAsset = currentIndex => {
  const prevIndex = currentIndex - 1
  if (prevIndex >= 0) {
    focusAssetAtIndex(prevIndex)
  }
}

const focusAssetBelow = currentIndex => {
  // 假设网格布局，每行大约4-5个项目
  const itemsPerRow = 4
  const nextIndex = currentIndex + itemsPerRow
  if (nextIndex < assets.value.length) {
    focusAssetAtIndex(nextIndex)
  }
}

const focusAssetAbove = currentIndex => {
  // 假设网格布局，每行大约4-5个项目
  const itemsPerRow = 4
  const prevIndex = currentIndex - itemsPerRow
  if (prevIndex >= 0) {
    focusAssetAtIndex(prevIndex)
  }
}

const focusAssetAtIndex = index => {
  const assetElements = document.querySelectorAll('.asset-item')
  if (assetElements[index]) {
    assetElements[index].focus()
  }
}

// 监听外部属性变化
watch(
  () => props.selectedAssets,
  newSelected => {
    selectedAssets.value = [...newSelected]
  }
)

watch(
  () => props.filterByDownloaded,
  newValue => {
    showDownloadedOnly.value = newValue
    if (newValue) {
      applyFilters()
    }
  }
)

// 生命周期
onMounted(async () => {
  await initializeBrowser()
})

onUnmounted(() => {
  // 清理事件监听
  assetManager.off('downloadCompleted', handleDownloadCompleted)
  assetManager.off('downloadFailed', handleDownloadFailed)
})
</script>

<style scoped>
.asset-browser {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif;
  background: #ffffff;
}

.browser-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5ea;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #f2f2f7 0%, #ffffff 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.022em;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-filters {
  margin-bottom: 24px;
  padding: 0 24px;
}

.search-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-row .el-input {
  flex: 1;
  min-width: 240px;
}

.search-row .el-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.search-row .el-input :deep(.el-input__wrapper):hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.search-row .el-input :deep(.el-input__wrapper):focus-within {
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.search-row .el-select {
  min-width: 140px;
}

.search-row .el-select :deep(.el-select__wrapper) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.color-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-filters .el-checkbox {
  margin: 0;
}

.color-filters .el-checkbox :deep(.el-checkbox__label) {
  padding-left: 8px;
  font-weight: 500;
  color: #1d1d1f;
}

.assets-grid {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px 24px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 320px;
  color: #86868b;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
}

.loading-state .el-icon {
  font-size: 56px;
  margin-bottom: 20px;
  color: #007aff;
  animation: pulse 2s infinite;
}

.empty-icon {
  color: #d1d1d6;
}

.empty-state p {
  margin: 16px 0 24px 0;
  font-size: 16px;
  line-height: 1.4;
}

.assets-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.asset-item {
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
}

.asset-item:hover {
  border-color: #007aff;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.15);
  transform: translateY(-2px);
}

.asset-item.selected {
  border-color: #007aff;
  box-shadow:
    0 0 0 2px rgba(0, 122, 255, 0.2),
    0 4px 16px rgba(0, 122, 255, 0.15);
  transform: translateY(-2px);
}

.asset-thumbnail {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: linear-gradient(135deg, #f2f2f7 0%, #e5e5ea 100%);
  border-radius: 8px 8px 0 0;
}

.asset-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.asset-item:hover .asset-thumbnail img {
  transform: scale(1.08);
}

.thumbnail-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #86868b;
  font-size: 32px;
}

.download-indicator,
.copyright-indicator {
  position: absolute;
  top: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-indicator {
  right: 8px;
  background: rgba(103, 194, 58, 0.9);
  color: white;
}

.copyright-indicator {
  left: 8px;
}

.copyright-indicator.safe {
  background: rgba(103, 194, 58, 0.9);
}

.copyright-indicator.unknown {
  background: rgba(230, 162, 60, 0.9);
}

.copyright-indicator.unsafe {
  background: rgba(245, 108, 108, 0.9);
}

.asset-info {
  padding: 16px;
  background: #ffffff;
}

.asset-name {
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  line-height: 1.2;
  letter-spacing: -0.022em;
}

.asset-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #86868b;
  margin-bottom: 6px;
  font-weight: 500;
}

.asset-source,
.asset-size {
  font-size: 11px;
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.asset-author {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.asset-actions {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e5e5ea;
  background: rgba(242, 242, 247, 0.5);
}

.asset-actions .el-button {
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
  transition: all 0.2s ease;
}

.asset-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  padding: 16px 24px;
}

.pagination :deep(.el-pagination) {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
}

.pagination :deep(.el-pagination .el-pager li) {
  border-radius: 6px;
  margin: 0 2px;
  transition: all 0.2s ease;
}

.pagination :deep(.el-pagination .el-pager li:hover) {
  background-color: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

.pagination :deep(.el-pagination .el-pager li.active) {
  background-color: #007aff;
  color: white;
}

.asset-preview {
  display: flex;
  gap: 24px;
}

.preview-image {
  flex: 1;
}

.preview-image img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
}

.preview-info {
  flex: 1;
  max-height: 400px;
  overflow-y: auto;
}

.info-section {
  margin-bottom: 20px;
}

.info-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-list {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 8px 12px;
  font-size: 14px;
}

.info-list dt {
  font-weight: 500;
  color: #606266;
}

.info-list dd {
  color: #303133;
  margin: 0;
}

.copyright-status {
  margin-bottom: 12px;
}

.copyright-warnings {
  margin-top: 12px;
  padding: 12px;
  background: #fdf6ec;
  border: 1px solid #f5dab1;
  border-radius: 4px;
}

.copyright-warnings h5 {
  margin: 0 0 8px 0;
  color: #e6a23c;
  font-size: 14px;
}

.copyright-warnings ul {
  margin: 0;
  padding-left: 16px;
}

.copyright-warnings li {
  color: #e6a23c;
  font-size: 13px;
  margin-bottom: 4px;
}

/* 响应式设计 - Fluid and Adaptive */
@media (max-width: 1024px) {
  .browser-header {
    padding: 16px 20px;
  }

  .header-left h3 {
    font-size: 18px;
  }

  .search-filters {
    padding: 0 20px;
  }

  .assets-grid {
    padding: 0 20px 20px 20px;
  }

  .assets-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .search-row {
    flex-direction: column;
    gap: 12px;
  }

  .search-row .el-input,
  .search-row .el-select {
    width: 100%;
    min-width: auto;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .assets-list {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .asset-thumbnail {
    height: 140px;
  }

  .asset-info {
    padding: 12px;
  }

  .asset-actions {
    padding: 10px 12px;
  }

  .asset-preview {
    flex-direction: column;
  }

  .preview-info {
    max-height: 250px;
  }
}

@media (max-width: 480px) {
  .browser-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-left {
    justify-content: center;
  }

  .header-actions {
    justify-content: center;
  }

  .assets-list {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .asset-name {
    font-size: 13px;
  }
}

/* 深色模式支持 - Depth and Contrast */
@media (prefers-color-scheme: dark) {
  .asset-browser {
    background: #1c1c1e;
  }

  .browser-header {
    background: linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 100%);
    border-color: #38383a;
  }

  .header-left h3 {
    color: #ffffff;
  }

  .asset-item {
    background: #2c2c2e;
    border-color: #38383a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .asset-item:hover {
    border-color: #007aff;
    box-shadow: 0 4px 16px rgba(0, 122, 255, 0.2);
  }

  .asset-thumbnail {
    background: linear-gradient(135deg, #38383a 0%, #2c2c2e 100%);
  }

  .thumbnail-placeholder {
    color: #98989d;
  }

  .asset-info {
    background: #2c2c2e;
  }

  .asset-name {
    color: #ffffff;
  }

  .asset-meta {
    color: #98989d;
  }

  .asset-source,
  .asset-size {
    background: rgba(0, 122, 255, 0.2);
    color: #5ac8fa;
  }

  .asset-author {
    color: #98989d;
  }

  .asset-actions {
    border-color: #38383a;
    background: rgba(56, 56, 58, 0.5);
  }

  .pagination :deep(.el-pagination .el-pager li:hover) {
    background-color: rgba(0, 122, 255, 0.2);
    color: #5ac8fa;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .asset-item {
    border-width: 2px;
  }

  .asset-name {
    font-weight: 700;
  }

  .asset-source,
  .asset-size {
    border: 1px solid currentColor;
  }
}

/* API配置对话框样式 */
.api-config-content {
  max-height: 60vh;
  overflow-y: auto;
}

.api-config-content .mb-4 {
  margin-bottom: 20px;
}

.api-config-section {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  background: #f8f8f8;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.api-info p {
  margin: 0 0 12px 0;
  color: #3c3c43;
  line-height: 1.5;
}

.api-steps {
  margin-bottom: 16px;
}

.api-steps ol {
  margin: 0;
  padding-left: 20px;
}

.api-steps li {
  margin-bottom: 4px;
  color: #3c3c43;
  line-height: 1.4;
}

.api-steps a {
  color: #007aff;
  text-decoration: none;
}

.api-steps a:hover {
  text-decoration: underline;
}

.api-key-input {
  margin-top: 8px;
}

.api-notice {
  margin-top: 20px;
}

/* 深色模式下的API配置样式 */
@media (prefers-color-scheme: dark) {
  .api-config-section {
    background: #2c2c2e;
    border-color: #38383a;
  }

  .section-title {
    color: #ffffff;
  }

  .api-info p,
  .api-steps li {
    color: #98989d;
  }
}

/* 无障碍辅助样式 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 焦点样式增强 */
.asset-item:focus {
  outline: 2px solid #007aff;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.2);
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .asset-item {
    border-width: 2px;
  }

  .asset-item:focus {
    outline-width: 3px;
  }

  .asset-name {
    font-weight: 700;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .asset-item,
  .asset-thumbnail img,
  .search-row .el-input :deep(.el-input__wrapper),
  .search-row .el-select :deep(.el-select__wrapper),
  .asset-actions .el-button {
    transition: none;
  }

  .asset-item:hover,
  .asset-item.selected {
    transform: none;
  }

  .loading-state .el-icon {
    animation: none;
  }
}
</style>
