<template>
  <article
    class="asset-item"
    :class="{ selected: isSelected }"
    role="gridcell"
    tabindex="0"
    :aria-label="`素材: ${asset.name}`"
    :aria-selected="isSelected"
    @click="$emit('select', asset)"
    @dblclick="$emit('preview', asset)"
  >
    <!-- 素材缩略图 -->
    <div class="asset-thumbnail">
      <img
        v-if="asset.thumbnail"
        :src="asset.thumbnail"
        :alt="asset.name"
        @error="handleImageError"
      />
      <div v-else class="thumbnail-placeholder">
        <el-icon size="32">
          <Picture />
        </el-icon>
      </div>

      <!-- 下载状态指示器 -->
      <div v-if="asset.isDownloaded" class="download-indicator">
        <el-icon size="16" color="#67C23A">
          <Check />
        </el-icon>
      </div>

      <!-- 版权状态指示器 -->
      <div
        v-if="asset.copyrightInfo"
        class="copyright-indicator"
        :class="getCopyrightClass(asset.copyrightInfo)"
      >
        <el-icon size="16">
          <Warning v-if="asset.copyrightInfo.status === 'unknown'" />
          <SuccessFilled v-else-if="asset.copyrightInfo.isSafe" />
          <CircleClose v-else />
        </el-icon>
      </div>
    </div>

    <!-- 素材信息 -->
    <div class="asset-info">
      <h3 class="asset-name" :title="asset.name">
        {{ asset.name }}
      </h3>
      <div class="asset-meta">
        <span class="asset-source">
          {{ getSourceDisplayName(asset.source) }}
        </span>
        <span v-if="asset.fileSize" class="asset-size">
          {{ formatFileSize(asset.fileSize) }}
        </span>
      </div>
      <div v-if="asset.author" class="asset-author">
        by {{ asset.author.name }}
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="asset-actions" role="group">
      <el-button
        v-if="!asset.isDownloaded"
        type="primary"
        size="small"
        :loading="isDownloading"
        @click.stop="$emit('download', asset)"
      >
        下载
      </el-button>

      <el-dropdown @command="handleCommand">
        <el-button size="small" @click.stop>
          <el-icon><More /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="preview">
              <el-icon><View /></el-icon>
              预览
            </el-dropdown-item>
            <el-dropdown-item command="info">
              <el-icon><InfoFilled /></el-icon>
              详细信息
            </el-dropdown-item>
            <el-dropdown-item
              v-if="asset.isDownloaded"
              command="delete"
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
</template>

<script setup>
import {
  Picture,
  Check,
  Warning,
  SuccessFilled,
  CircleClose,
  More,
  View,
  InfoFilled,
  Delete
} from '@element-plus/icons-vue'

const props = defineProps({
  asset: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isDownloading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'preview', 'download', 'action'])

const handleCommand = (command) => {
  emit('action', { action: command, asset: props.asset })
}

const getSourceDisplayName = (source) => {
  const sourceNames = {
    unsplash: 'Unsplash',
    pexels: 'Pexels',
    local: '本地',
    uploaded: '上传'
  }
  return sourceNames[source] || source || '未知'
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

const getCopyrightClass = (copyrightInfo) => {
  if (copyrightInfo.isSafe) return 'safe'
  if (copyrightInfo.status === 'unknown') return 'unknown'
  return 'unsafe'
}

const handleImageError = (event) => {
  const img = event.target
  img.style.display = 'none'
  const placeholder = img.parentElement.querySelector('.thumbnail-placeholder')
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}
</script>

<style scoped>
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
}

.asset-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #86868b;
  margin-bottom: 6px;
}

.asset-source,
.asset-size {
  font-size: 11px;
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
  padding: 2px 6px;
  border-radius: 4px;
}

.asset-author {
  font-size: 12px;
  color: #6b7280;
}

.asset-actions {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e5e5ea;
  background: rgba(242, 242, 247, 0.5);
}
</style>
