<template>
  <div class="pagination" v-if="totalPages > 1">
    <button class="page-btn" @click="$emit('go-to-page', 1)" :disabled="currentPage === 1">
      首页
    </button>
    <button class="page-btn" @click="$emit('go-to-page', currentPage - 1)" :disabled="currentPage === 1">
      上一页
    </button>

    <span class="page-info">
      第 {{ currentPage }} 页，共 {{ totalPages }} 页
    </span>

    <button class="page-btn" @click="$emit('go-to-page', currentPage + 1)" :disabled="currentPage === totalPages">
      下一页
    </button>
    <button class="page-btn" @click="$emit('go-to-page', totalPages)" :disabled="currentPage === totalPages">
      末页
    </button>

    <select :value="pageSize" @change="$emit('change-page-size', Number($event.target.value))" class="page-size-select">
      <option :value="10">10条/页</option>
      <option :value="20">20条/页</option>
      <option :value="50">50条/页</option>
      <option :value="100">100条/页</option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 }
})

defineEmits(['go-to-page', 'change-page-size'])
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 16px 0;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007aff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #86868b;
  margin: 0 16px;
}

.page-size-select {
  padding: 6px 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  background: white;
  font-size: 12px;
}

@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
