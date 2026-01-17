<template>
  <section class="search-filters" aria-labelledby="search-filters-heading">
    <h2 id="search-filters-heading" class="sr-only">搜索和过滤选项</h2>

    <div class="search-row">
      <el-input
        :model-value="searchQuery"
        placeholder="搜索素材..."
        clearable
        aria-label="搜索素材关键词"
        @input="$emit('update:searchQuery', $event)"
        @clear="$emit('clear')"
      >
        <template #prefix>
          <el-icon aria-hidden="true">
            <Search />
          </el-icon>
        </template>
      </el-input>

      <el-select
        :model-value="selectedCategory"
        placeholder="分类"
        clearable
        @change="$emit('update:selectedCategory', $event)"
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
        :model-value="selectedType"
        placeholder="类型"
        clearable
        @change="$emit('update:selectedType', $event)"
      >
        <el-option label="图片" value="image" />
        <el-option label="视频" value="video" />
        <el-option label="音频" value="audio" />
      </el-select>

      <el-select
        :model-value="sortBy"
        placeholder="排序"
        @change="$emit('update:sortBy', $event)"
      >
        <el-option label="最新使用" value="lastUsed" />
        <el-option label="创建时间" value="createdAt" />
        <el-option label="名称" value="name" />
        <el-option label="大小" value="fileSize" />
      </el-select>
    </div>

    <div class="filter-row">
      <el-checkbox-group
        :model-value="colorFilters"
        @change="$emit('update:colorFilters', $event)"
      >
        <el-checkbox
          v-for="color in supportedColors"
          :key="color.id"
          :label="color.id"
        >
          {{ color.name }}
        </el-checkbox>
      </el-checkbox-group>

      <el-switch
        :model-value="showDownloadedOnly"
        active-text="仅显示已下载"
        inactive-text="显示全部"
        @change="$emit('update:showDownloadedOnly', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'

defineProps({
  searchQuery: String,
  selectedCategory: String,
  selectedType: String,
  sortBy: String,
  colorFilters: Array,
  showDownloadedOnly: Boolean,
  categories: Array,
  supportedColors: Array
})

defineEmits([
  'update:searchQuery',
  'update:selectedCategory',
  'update:selectedType',
  'update:sortBy',
  'update:colorFilters',
  'update:showDownloadedOnly',
  'clear'
])
</script>

<style scoped>
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

.search-row .el-select {
  min-width: 140px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
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
