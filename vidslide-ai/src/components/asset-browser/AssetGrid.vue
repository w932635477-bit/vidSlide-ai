<template>
  <section class="assets-grid" aria-labelledby="assets-grid-heading" role="region">
    <h2 id="assets-grid-heading" class="sr-only">素材列表</h2>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state" aria-live="polite">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <p>正在加载素材...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="assets.length === 0" class="empty-state" aria-live="polite">
      <el-empty :description="emptyDescription" :image-size="100">
        <template #image>
          <el-icon size="100" class="empty-icon">
            <Picture />
          </el-icon>
        </template>
        <el-button v-if="hasSearch" type="primary" @click="$emit('clear-search')">
          清除搜索
        </el-button>
        <el-button v-else type="primary" @click="$emit('load-popular')">
          浏览热门素材
        </el-button>
      </el-empty>
    </div>

    <!-- 素材列表 -->
    <div v-else class="assets-list" role="grid">
      <AssetItem
        v-for="asset in assets"
        :key="asset.id"
        :asset="asset"
        :is-selected="selectedAssets.includes(asset.id)"
        :is-downloading="downloadingAssets.includes(asset.id)"
        @select="$emit('select', asset)"
        @preview="$emit('preview', asset)"
        @download="$emit('download', asset)"
        @action="$emit('action', $event)"
      />
    </div>

    <!-- 分页 -->
    <div v-if="totalAssets > pageSize" class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="totalAssets"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="$emit('size-change', $event)"
        @current-change="$emit('page-change', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import { Loading, Picture } from '@element-plus/icons-vue'
import AssetItem from './AssetItem.vue'

defineProps({
  assets: {
    type: Array,
    default: () => []
  },
  selectedAssets: {
    type: Array,
    default: () => []
  },
  downloadingAssets: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  hasSearch: {
    type: Boolean,
    default: false
  },
  emptyDescription: {
    type: String,
    default: '暂无素材'
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 24
  },
  totalAssets: {
    type: Number,
    default: 0
  }
})

defineEmits([
  'select',
  'preview',
  'download',
  'action',
  'clear-search',
  'load-popular',
  'size-change',
  'page-change'
])
</script>

<style scoped>
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
}

.loading-state .el-icon {
  font-size: 56px;
  margin-bottom: 20px;
  color: #007aff;
  animation: pulse 2s infinite;
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

.empty-icon {
  color: #d1d1d6;
}

.assets-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  padding: 16px 24px;
}

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
</style>
