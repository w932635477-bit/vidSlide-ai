<template>
  <div class="workspace-simple">
    <!-- 顶部导航栏 -->
    <nav class="workspace-navbar">
      <div class="navbar-container">
        <button class="back-button" @click="goHome">
          ← Back to Home
        </button>
        <h1 class="workspace-title">VidSlide AI Workspace</h1>
        <div class="navbar-actions">
          <button class="settings-button">⚙️ Settings</button>
          <button class="export-button">📤 Export</button>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="workspace-main">
      <div class="workspace-layout">
        <!-- 左侧工具栏 -->
        <aside class="left-panel">
          <div class="panel-section">
            <h3>🎬 Video Tools</h3>
            <div class="tool-buttons">
              <button class="tool-btn">🎥 Upload Video</button>
              <button class="tool-btn">✂️ Trim</button>
              <button class="tool-btn">🎵 Audio</button>
            </div>
          </div>

          <div class="panel-section">
            <h3>🤖 AI Analysis</h3>
            <div class="analysis-status">
              <p>✅ AssetBrowser syntax fixed</p>
              <p>✅ Component rendering OK</p>
              <p>✅ Route navigation OK</p>
            </div>
          </div>
        </aside>

        <!-- 中央画布区域 -->
        <section class="center-canvas">
          <div class="canvas-placeholder">
            <div class="placeholder-icon">🎨</div>
            <h2>Video Canvas</h2>
            <p>Upload a video to start editing</p>
            <button class="upload-btn">📤 Upload Video</button>
          </div>
        </section>

            <!-- 右侧素材面板 -->
        <aside class="right-panel">
          <div class="panel-section">
            <h3>🖼️ Assets</h3>
            <AssetBrowser
              aria-label="素材浏览器"
              @asset-selected="handleAssetSelected"
            />
          </div>

          <div class="panel-section">
            <h3>🎨 Templates</h3>
            <TemplateSelector
              @template-selected="handleTemplateSelected"
            />
          </div>

          <div class="panel-section">
            <h3>⚙️ Adjustments</h3>
            <UserAdjustmentPanel
              :current-template="selectedTemplate"
              @adjustment-changed="handleAdjustmentChanged"
            />
          </div>

          <div class="panel-section">
            <h3>📊 Performance</h3>
            <PerformanceMonitor
              :auto-start="true"
              aria-label="性能监控面板"
            />
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script>
import AssetBrowser from '../components/AssetBrowser.vue'
import TemplateSelector from '../components/templates/TemplateSelector.vue'
import UserAdjustmentPanel from '../components/UserAdjustmentPanel.vue'
import PerformanceMonitor from '../components/PerformanceMonitor.vue'

export default {
  name: 'WorkspaceViewSimple',
  components: {
    AssetBrowser,
    TemplateSelector,
    UserAdjustmentPanel,
    PerformanceMonitor
  },
  data() {
    return {
      selectedTemplate: null,
      currentUrl: window.location.href
    }
  },
  methods: {
    goHome() {
      this.$router.push('/')
    },
    handleAssetSelected(asset) {
      console.log('Asset selected:', asset)
    },
    handleTemplateSelected(template) {
      console.log('Template selected:', template)
      this.selectedTemplate = template
    },
    handleAdjustmentChanged(adjustments) {
      console.log('Adjustments changed:', adjustments)
    }
  },
  mounted() {
    console.log('VidSlide AI工作空间已加载')
  }
}
</script>

<style scoped>
.workspace-simple {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

/* 导航栏样式 */
.workspace-navbar {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}

.back-button:hover {
  background: #f0f8ff;
}

.workspace-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.navbar-actions {
  display: flex;
  gap: 10px;
}

.settings-button,
.export-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.export-button {
  background: #28a745;
}

.settings-button:hover {
  background: #5a6268;
}

.export-button:hover {
  background: #218838;
}

/* 主要内容区域 */
.workspace-main {
  flex: 1;
  overflow: hidden;
}

.workspace-layout {
  height: 100%;
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  gap: 0;
}

/* 面板样式 */
.left-panel,
.right-panel {
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.right-panel {
  border-right: none;
  border-left: 1px solid #e0e0e0;
}

.panel-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.tool-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.analysis-status p {
  margin: 5px 0;
  font-size: 14px;
  color: #28a745;
}

/* 中央画布区域 */
.center-canvas {
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.canvas-placeholder {
  background: white;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  max-width: 400px;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.canvas-placeholder h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.canvas-placeholder p {
  margin: 0 0 30px 0;
  color: #666;
  font-size: 16px;
}

.upload-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: #0056b3;
}

/* 素材列表 */
.asset-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.asset-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.asset-item:hover {
  background: #f8f9fa;
}

.asset-icon {
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .workspace-layout {
    grid-template-columns: 200px 1fr 250px;
  }
}

@media (max-width: 768px) {
  .workspace-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .left-panel,
  .right-panel {
    border-right: none;
    border-left: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .right-panel {
    border-bottom: none;
    border-top: 1px solid #e0e0e0;
  }

  .navbar-container {
    padding: 0 15px;
  }

  .workspace-title {
    font-size: 16px;
  }
}
</style>