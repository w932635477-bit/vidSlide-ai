<template>
  <header class="workspace-header">
    <div class="header-content">
      <div class="header-left">
        <div class="logo-section">
          <span class="logo-icon">🎬</span>
          <h1 class="workspace-title">VidSlide AI</h1>
        </div>
        <div class="header-actions-left">
          <button class="jianying-btn-icon" title="新建项目" @click="handleNewProject">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button class="jianying-btn-icon" title="打开项目" @click="handleOpenProject">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
              />
            </svg>
          </button>
          <button class="jianying-btn-icon" title="保存项目" @click="handleSaveProject">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </button>
        </div>
      </div>
      <div class="header-right">
        <button class="jianying-btn-primary export-btn" @click="handleExport">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          <span>导出</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const emit = defineEmits(['new-project', 'open-project', 'save-project', 'export-video'])

// 事件处理
const handleNewProject = () => {
  console.log('新建项目')
  emit('new-project')
}

const handleOpenProject = () => {
  console.log('打开项目')
  emit('open-project')
}

const handleSaveProject = () => {
  console.log('保存项目')
  emit('save-project')
}

const handleExport = () => {
  console.log('导出视频')
  emit('export-video')
}
</script>

<style scoped>
.workspace-header {
  /* 使用jianying-header类的样式 */
}

.header-content {
  height: 100%;
  padding: 0 var(--spacing-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1920px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.logo-icon {
  font-size: 32px;
}

.workspace-title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.header-actions-left {
  display: flex;
  gap: var(--spacing-2);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.export-btn {
  padding: var(--spacing-2) var(--spacing-5);
  border-radius: var(--radius-2xl);
}

.export-btn svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .workspace-title {
    display: none;
  }

  .header-content {
    padding: 0 var(--spacing-4);
  }
}
</style>
