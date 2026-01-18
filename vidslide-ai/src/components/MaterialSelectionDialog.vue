<template>
  <div v-if="visible" class="material-selection-dialog-overlay" @click="handleOverlayClick">
    <div class="material-selection-dialog" @click.stop>
      <!-- 对话框头部 -->
      <header class="dialog-header">
        <div class="header-content">
          <h3 class="dialog-title">
            <span class="title-icon">🎨</span>
            素材选择
          </h3>
          <p class="dialog-subtitle">
            找到 <strong>{{ materials.length }}</strong> 个素材
            <span v-if="source" class="source-badge"> 来自: {{ getSourceLabel(source) }} </span>
          </p>
        </div>
        <button class="close-btn" aria-label="关闭对话框" @click="handleClose">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <!-- 搜索和筛选 -->
      <div class="dialog-filters">
        <div class="search-box">
          <svg
            class="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="searchQuery" type="text" placeholder="搜索素材..." class="search-input" />
        </div>
        <div class="filter-controls">
          <button
            v-for="filter in filters"
            :key="filter.value"
            :class="['filter-btn', { active: selectedFilter === filter.value }]"
            @click="selectedFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- 素材网格 -->
      <div class="materials-grid">
        <div
          v-for="material in filteredMaterials"
          :key="material.id"
          :class="['material-card', { selected: isSelected(material) }]"
          @click="toggleSelection(material)"
        >
          <!-- 素材缩略图 -->
          <div class="material-thumbnail">
            <img
              v-if="material.thumbnail || material.url"
              :src="material.thumbnail || material.url"
              :alt="material.title || '素材'"
              loading="lazy"
              @error="handleImageError"
            />
            <div v-else class="thumbnail-placeholder">
              <span class="placeholder-icon">{{ getTypeIcon(material.type) }}</span>
            </div>

            <!-- 选中标记 -->
            <div v-if="isSelected(material)" class="selection-badge">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
                stroke="white"
                stroke-width="2"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <!-- 素材类型标签 -->
            <div class="material-type-badge">
              {{ getTypeLabel(material.type) }}
            </div>
          </div>

          <!-- 素材信息 -->
          <div class="material-info">
            <h4 class="material-title">{{ material.title || '未命名素材' }}</h4>
            <p v-if="material.description" class="material-description">
              {{ material.description }}
            </p>
            <div class="material-meta">
              <span v-if="material.source" class="meta-item">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {{ material.source }}
              </span>
              <span v-if="material.size" class="meta-item">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                </svg>
                {{ formatSize(material.size) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredMaterials.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <h3>未找到素材</h3>
          <p>尝试调整搜索条件或筛选器</p>
        </div>
      </div>

      <!-- 对话框底部 -->
      <footer class="dialog-footer">
        <div class="selection-summary">
          已选择 <strong>{{ selectedMaterials.length }}</strong> 个素材
        </div>
        <div class="footer-actions">
          <button class="btn btn-secondary" @click="handleClose">取消</button>
          <button
            class="btn btn-primary"
            :disabled="selectedMaterials.length === 0"
            @click="handleConfirm"
          >
            确认使用 ({{ selectedMaterials.length }})
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  materials: {
    type: Array,
    default: () => []
  },
  source: {
    type: String,
    default: ''
  },
  platforms: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'confirm', 'update:visible'])

// 搜索和筛选
const searchQuery = ref('')
const selectedFilter = ref('all')
const selectedMaterials = ref([])

const filters = [
  { label: '全部', value: 'all' },
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '图标', value: 'icon' },
  { label: '插图', value: 'illustration' }
]

// 过滤后的素材
const filteredMaterials = computed(() => {
  let result = props.materials

  // 按类型筛选
  if (selectedFilter.value !== 'all') {
    result = result.filter(m => m.type === selectedFilter.value)
  }

  // 按搜索关键词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m => {
      const title = (m.title || '').toLowerCase()
      const description = (m.description || '').toLowerCase()
      return title.includes(query) || description.includes(query)
    })
  }

  return result
})

// 选择相关方法
const isSelected = material => {
  return selectedMaterials.value.some(m => m.id === material.id)
}

const toggleSelection = material => {
  const index = selectedMaterials.value.findIndex(m => m.id === material.id)
  if (index > -1) {
    selectedMaterials.value.splice(index, 1)
  } else {
    selectedMaterials.value.push(material)
  }
}

// 事件处理
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleOverlayClick = () => {
  handleClose()
}

const handleConfirm = () => {
  if (selectedMaterials.value.length > 0) {
    emit('confirm', selectedMaterials.value)
    handleClose()
  }
}

const handleImageError = event => {
  event.target.style.display = 'none'
  event.target.parentElement.classList.add('image-error')
}

// 辅助方法
const getSourceLabel = source => {
  const labels = {
    external: '外部平台',
    cache: '缓存',
    preset: '预置素材',
    baidu: '百度图片',
    unsplash: 'Unsplash',
    pexels: 'Pexels'
  }
  return labels[source] || source
}

const getTypeIcon = type => {
  const icons = {
    image: '🖼️',
    video: '🎬',
    icon: '🔘',
    illustration: '🎨',
    diagram: '📊',
    chart: '📈'
  }
  return icons[type] || '📄'
}

const getTypeLabel = type => {
  const labels = {
    image: '图片',
    video: '视频',
    icon: '图标',
    illustration: '插图',
    diagram: '图表',
    chart: '数据图'
  }
  return labels[type] || type
}

const formatSize = size => {
  if (!size) return ''
  if (typeof size === 'string') return size
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / (1024 * 1024)).toFixed(1)}MB`
}

// 监听对话框显示状态，重置选择
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      selectedMaterials.value = []
      searchQuery.value = ''
      selectedFilter.value = 'all'
    }
  }
)
</script>

<style scoped>
.material-selection-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.material-selection-dialog {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 头部 */
.dialog-header {
  padding: 24px 32px;
  border-bottom: 1px solid #e5e5e7;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.header-content {
  flex: 1;
}

.dialog-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 28px;
}

.dialog-subtitle {
  font-size: 14px;
  color: #86868b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.source-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #f2f2f7;
  color: #007aff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #86868b;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f2f2f7;
  color: #1d1d1f;
}

/* 筛选区域 */
.dialog-filters {
  padding: 20px 32px;
  border-bottom: 1px solid #e5e5e7;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #d1d1d6;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.filter-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #d1d1d6;
  background: #ffffff;
  color: #1d1d1f;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #007aff;
  color: #007aff;
}

.filter-btn.active {
  background: #007aff;
  border-color: #007aff;
  color: #ffffff;
}

/* 素材网格 */
.materials-grid {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  align-content: start;
}

.material-card {
  border: 2px solid #e5e5e7;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  background: #ffffff;
}

.material-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #007aff;
}

.material-card.selected {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

.material-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 aspect ratio */
  background: #f8f9fa;
  overflow: hidden;
}

.material-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.placeholder-icon {
  font-size: 48px;
  opacity: 0.5;
}

.selection-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: #007aff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.4);
}

.material-type-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.material-info {
  padding: 12px;
}

.material-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-description {
  font-size: 12px;
  color: #86868b;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.material-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #86868b;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  margin: 0 auto 20px;
  color: #d1d1d6;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

/* 底部 */
.dialog-footer {
  padding: 20px 32px;
  border-top: 1px solid #e5e5e7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.selection-summary {
  font-size: 14px;
  color: #86868b;
}

.selection-summary strong {
  color: #007aff;
  font-weight: 600;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f2f2f7;
  color: #1d1d1f;
}

.btn-secondary:hover {
  background: #e5e5e7;
}

.btn-primary {
  background: #007aff;
  color: #ffffff;
}

.btn-primary:hover {
  background: #0056cc;
}

.btn-primary:disabled {
  background: #d1d1d6;
  color: #86868b;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 768px) {
  .material-selection-dialog {
    max-height: 95vh;
    border-radius: 16px 16px 0 0;
  }

  .dialog-header,
  .dialog-filters,
  .materials-grid,
  .dialog-footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .materials-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .dialog-filters {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }
}
</style>
