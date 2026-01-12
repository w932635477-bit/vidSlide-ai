<template>
  <div class="workspace-container">
    <!-- 顶部状态栏 -->
    <header class="workspace-header">
      <div class="header-left">
        <button class="btn-back" @click="goHome">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回首页
        </button>
      </div>
      <div class="header-center">
        <h1 class="project-title">VidSlide AI 工作空间</h1>
        <span class="project-status">未保存</span>
      </div>
      <div class="header-right">
        <button class="btn-save">保存</button>
        <button class="btn-export">导出</button>
      </div>
    </header>

    <!-- 主工作区 -->
    <div class="workspace-main">
      <!-- 左侧工具栏 -->
      <aside class="toolbar-left" :class="{ 'collapsed': toolbarCollapsed }">
        <div class="toolbar-header">
          <button class="btn-collapse" @click="toggleToolbar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>

        <div class="toolbar-content">
          <!-- 文件操作组 -->
          <div class="tool-group">
            <div class="group-title">文件</div>
            <button class="tool-btn" title="新建项目">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 4v16m8-8H4"/>
              </svg>
              <span>新建项目</span>
            </button>
            <button class="tool-btn" title="打开项目">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <span>打开项目</span>
            </button>
            <button class="tool-btn" title="保存项目">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              <span>保存项目</span>
            </button>
          </div>

          <!-- 视频工具组 -->
          <div class="tool-group">
            <div class="group-title">视频</div>
            <button class="tool-btn" title="上传视频">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>上传视频</span>
            </button>
            <button class="tool-btn" title="剪辑视频">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span>剪辑视频</span>
            </button>
          </div>

          <!-- PPT工具组 -->
          <div class="tool-group">
            <div class="group-title">演示</div>
            <button class="tool-btn" title="添加幻灯片">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 4v16m8-8H4"/>
              </svg>
              <span>添加幻灯片</span>
            </button>
            <button class="tool-btn" title="模板选择">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              <span>模板选择</span>
            </button>
          </div>

          <!-- AI工具组 -->
          <div class="tool-group">
            <div class="group-title">AI 助手</div>
            <button class="tool-btn" title="智能生成">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              <span>智能生成</span>
            </button>
            <button class="tool-btn" title="一键优化">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span>一键优化</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- 主编辑区 -->
      <main class="main-canvas">
        <div class="canvas-container">
          <div class="canvas-header">
            <div class="zoom-controls">
              <button class="zoom-btn" @click="zoomOut">-</button>
              <span class="zoom-level">{{ zoomLevelText }}</span>
              <button class="zoom-btn" @click="zoomIn">+</button>
            </div>
          </div>

          <div class="canvas-workspace">
            <div class="canvas-content">
              <!-- 视频预览区域 -->
              <div class="video-preview">
                <div class="video-placeholder">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                    <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>
                  </svg>
                  <p>拖拽视频文件到此处开始编辑</p>
                </div>
              </div>

              <!-- PPT预览区域 -->
              <div class="ppt-preview">
                <div class="ppt-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <p>AI将自动生成对应的PPT内容</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 右侧属性面板 -->
      <aside class="properties-panel">
        <div class="panel-tabs">
          <button class="tab-btn active" @click="setActiveTab('style')">🎨 样式</button>
          <button class="tab-btn" @click="setActiveTab('animation')">🎭 动画</button>
          <button class="tab-btn" @click="setActiveTab('ai')">🤖 AI助手</button>
          <button class="tab-btn" @click="setActiveTab('settings')">⚙️ 设置</button>
        </div>

        <div class="panel-content">
          <div class="panel-section">
            <h3>模板选择</h3>
            <div class="template-grid">
              <div class="template-item active">
                <div class="template-preview">
                  <div class="preview-mini"></div>
                </div>
                <span>专业模板</span>
              </div>
              <div class="template-item">
                <div class="template-preview">
                  <div class="preview-mini"></div>
                </div>
                <span>创意模板</span>
              </div>
              <div class="template-item">
                <div class="template-preview">
                  <div class="preview-mini"></div>
                </div>
                <span>简约模板</span>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </div>

    <!-- 底部时间线 -->
    <footer class="timeline-footer">
      <div class="timeline-container">
        <div class="timeline-header">
          <div class="timeline-controls">
            <button class="timeline-btn">⏮️</button>
            <button class="timeline-btn">▶️</button>
            <button class="timeline-btn">⏸️</button>
            <button class="timeline-btn">⏭️</button>
          </div>
          <div class="timeline-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 30%"></div>
            </div>
            <span class="time-display">00:30 / 02:15</span>
          </div>
        </div>

        <!-- 时间线标尺 -->
        <div class="timeline-ruler">
          <div class="ruler-marks">
            <span class="ruler-mark">0:00</span>
            <span class="ruler-mark">0:30</span>
            <span class="ruler-mark">1:00</span>
            <span class="ruler-mark">1:30</span>
            <span class="ruler-mark">2:00</span>
            <span class="ruler-mark">2:30</span>
          </div>
        </div>

        <div class="timeline-tracks">
          <!-- 视频轨道 -->
          <div class="timeline-track video-track">
            <div class="track-label">🎬 视频</div>
            <div class="track-content">
              <div class="clip video-clip" style="left: 0%; width: 40%">
                <div class="clip-handle clip-handle-left"></div>
                <div class="clip-handle clip-handle-right"></div>
              </div>
            </div>
          </div>

          <!-- PPT轨道 -->
          <div class="timeline-track ppt-track">
            <div class="track-label">📊 PPT</div>
            <div class="track-content">
              <div class="clip ppt-clip" style="left: 10%; width: 15%">
                <div class="clip-handle clip-handle-left"></div>
                <div class="clip-handle clip-handle-right"></div>
              </div>
              <div class="clip ppt-clip" style="left: 30%; width: 15%">
                <div class="clip-handle clip-handle-left"></div>
                <div class="clip-handle clip-handle-right"></div>
              </div>
              <div class="clip ppt-clip" style="left: 50%; width: 15%">
                <div class="clip-handle clip-handle-left"></div>
                <div class="clip-handle clip-handle-right"></div>
              </div>
            </div>
          </div>

          <!-- 音频轨道 -->
          <div class="timeline-track audio-track">
            <div class="track-label">🎵 音频</div>
            <div class="track-content">
              <div class="clip audio-clip" style="left: 0%; width: 60%">
                <div class="clip-handle clip-handle-left"></div>
                <div class="clip-handle clip-handle-right"></div>
                <div class="audio-waveform">
                  <div class="waveform-bar"></div>
                  <div class="waveform-bar"></div>
                  <div class="waveform-bar"></div>
                  <div class="waveform-bar"></div>
                  <div class="waveform-bar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'TestWorkspace',
  data() {
    return {
      currentUrl: window.location.href,
      toolbarCollapsed: false,
      activeTab: 'style',
      zoomLevel: 100
    }
  },
  mounted() {
    console.log('🏠 TestWorkspace.vue mounted')
    console.log('Vue实例:', this)
    console.log('Router实例:', this.$router)
    console.log('当前路由:', this.$route)
    console.log('当前URL:', window.location.href)
  },
  methods: {
    goHome() {
      console.log('🏠 goHome called from TestWorkspace')

      if (this.$router) {
        try {
          this.$router.push('/')
          console.log('✅ Router push to home executed')
        } catch (error) {
          console.error('❌ Router push failed:', error)
          // 备用方案
          window.location.href = '/'
        }
      } else {
        console.error('❌ Router not available, using fallback')
        window.location.href = '/'
      }
    },

    toggleToolbar() {
      this.toolbarCollapsed = !this.toolbarCollapsed
    },

    setActiveTab(tab) {
      this.activeTab = tab
    },

    zoomIn() {
      if (this.zoomLevel < 500) {
        this.zoomLevel += 25
      }
    },

    zoomOut() {
      if (this.zoomLevel > 10) {
        this.zoomLevel -= 25
      }
    }
  },

  computed: {
    zoomLevelText() {
      return this.zoomLevel + '%'
    }
  }
}
</script>

<style scoped>
/* ===========================================
   VidSlide AI - 苹果资深设计师审美
   极致简洁 · 精确比例 · 优雅材质
   =========================================== */

/* 工作空间主容器 - 极致简洁 */
.workspace-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #000000;
  color: rgba(255, 255, 255, 0.85);
  font-family: 'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 顶部状态栏 - 苹果专业工具栏样式 */
.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 20px;
  position: relative;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.workspace-header::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

/* 返回按钮 - 苹果极简风格 */
.header-left .btn-back {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.15s ease;
  -webkit-font-smoothing: antialiased;
}

.header-left .btn-back:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
}

.header-left .btn-back:active {
  background: rgba(255, 255, 255, 0.1);
}

/* 居中标题区域 */
.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.project-title {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.01em;
  text-align: center;
}

.project-status {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255, 59, 48, 0.8);
  background: rgba(255, 59, 48, 0.12);
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 400;
  letter-spacing: 0;
}

/* 右侧操作按钮 - 苹果标准按钮样式 */
.header-right {
  display: flex;
  gap: 8px;
}

.btn-save, .btn-export {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.15s ease;
  -webkit-font-smoothing: antialiased;
  min-width: 64px;
}

.btn-save:hover, .btn-export:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.95);
}

.btn-save:active, .btn-export:active {
  background: rgba(255, 255, 255, 0.08);
}

.btn-export {
  background: rgba(52, 199, 89, 0.1);
  border-color: rgba(52, 199, 89, 0.2);
  color: rgba(52, 199, 89, 0.9);
}

.btn-export:hover {
  background: rgba(52, 199, 89, 0.15);
  border-color: rgba(52, 199, 89, 0.3);
  color: rgba(52, 199, 89, 1);
}

/* 主工作区 */
.workspace-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧工具栏 - 苹果官网极简风格 */
.toolbar-left {
  width: 260px;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.toolbar-left.collapsed {
  width: 72px;
}

.toolbar-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 8px;
}

.btn-collapse {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
}

.btn-collapse:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

.btn-collapse:active {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 1);
}

.toolbar-content {
  flex: 1;
  padding: 24px 16px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 工具组 - 苹果官网风格 */
.tool-group {
  margin-bottom: 32px;
}

.tool-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
  letter-spacing: -0.01em;
  font-family: 'SF Pro Display', system-ui, sans-serif;
  text-transform: none;
  opacity: 0.9;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 40px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 400;
  font-family: 'SF Pro Text', system-ui, sans-serif;
  letter-spacing: -0.01em;
}

.tool-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.tool-btn:hover {
  color: rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(2px);
}

.tool-btn:hover::before {
  opacity: 1;
}

.tool-btn:active {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(1px);
}

.tool-btn svg {
  width: 18px;
  height: 18px;
  margin-right: 12px;
  opacity: 0.8;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

.tool-btn:hover svg {
  opacity: 1;
}

/* 折叠状态 */
.toolbar-left.collapsed .tool-btn {
  padding: 12px;
  margin-bottom: 6px;
  justify-content: center;
}

.toolbar-left.collapsed .tool-btn svg {
  width: 20px;
  height: 20px;
}

.toolbar-left.collapsed .group-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  white-space: nowrap;
  margin-bottom: 20px;
  transform: rotate(180deg);
  text-align: center;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-left.collapsed .tool-group:not(:last-child) {
  padding-bottom: 16px;
}

/* 主编辑区 */
.main-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #000000;
  position: relative;
}

.canvas-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.canvas-header {
  height: 44px;
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 4px 12px;
  border-radius: 6px;
}

.zoom-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-size: 14px;
  font-weight: 400;
}

.zoom-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
}

.zoom-btn:active {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 1);
}

.zoom-level {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  min-width: 40px;
  text-align: center;
  font-weight: 400;
  font-family: 'SF Pro Text', system-ui, sans-serif;
  letter-spacing: 0;
}

.canvas-workspace {
  flex: 1;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.canvas-workspace::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.4;
  pointer-events: none;
}

.canvas-content {
  display: flex;
  gap: 40px;
  align-items: center;
  max-width: 1400px;
  width: 100%;
  padding: 40px;
  position: relative;
  z-index: 1;
}

.video-preview, .ppt-preview {
  flex: 1;
  aspect-ratio: 16/9;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.video-preview:hover, .ppt-preview:hover {
  border-color: rgba(0, 122, 255, 0.3);
  background: rgba(255, 255, 255, 0.04);
}

.video-placeholder, .ppt-placeholder {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  z-index: 1;
}

.video-placeholder svg, .ppt-placeholder svg {
  margin-bottom: 16px;
  opacity: 0.6;
  width: 48px;
  height: 48px;
}

.video-placeholder p, .ppt-placeholder p {
  font-size: 13px;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0;
  color: rgba(255, 255, 255, 0.6);
}

/* 右侧属性面板 */
.properties-panel {
  width: 320px;
  background: rgba(0, 0, 0, 0.9);
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
}

.panel-tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.tab-btn {
  flex: 1;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  padding: 12px 16px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 400;
  transition: all 0.15s ease;
  border-bottom: 2px solid transparent;
  letter-spacing: 0;
}

.tab-btn.active {
  color: rgba(0, 122, 255, 0.9);
  border-bottom-color: rgba(0, 122, 255, 0.6);
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.03);
}

.panel-content {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  overflow-x: hidden;
}

.panel-section {
  margin-bottom: 24px;
}

.panel-section:last-child {
  margin-bottom: 0;
}

.panel-section h3 {
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 16px 0;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'SF Pro Text', system-ui, sans-serif;
  letter-spacing: 0;
  text-transform: uppercase;
  font-size: 10px;
}

.template-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.template-item {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  position: relative;
}

.template-item.active {
  border-color: rgba(0, 122, 255, 0.4);
  background: rgba(0, 122, 255, 0.06);
}

.template-item.active::after {
  content: '';
  position: absolute;
  top: 6px;
  right: 6px;
  width: 4px;
  height: 4px;
  background: rgba(0, 122, 255, 0.9);
  border-radius: 50%;
}

.template-item:hover {
  border-color: rgba(0, 122, 255, 0.3);
  background: rgba(255, 255, 255, 0.03);
}

.template-preview {
  width: 100%;
  height: 48px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-mini {
  width: 24px;
  height: 18px;
  background: rgba(0, 122, 255, 0.6);
  border-radius: 2px;
}

.template-item span {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
  letter-spacing: 0;
}

.color-palette {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-item {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 2px solid transparent;
  position: relative;
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.active {
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.15);
}

.color-item.active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

/* 底部时间线 */
.timeline-footer {
  height: 120px;
  background: rgba(0, 0, 0, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.timeline-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.timeline-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.timeline-header::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%);
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 4px 6px;
}

.timeline-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-size: 14px;
  position: relative;
}

.timeline-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
  transform: scale(1.02);
}

.timeline-btn:active {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 1);
  transform: scale(0.98);
}

.timeline-btn:first-child,
.timeline-btn:last-child {
  width: 28px;
  height: 28px;
  font-size: 12px;
}

.timeline-progress {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-left: 32px;
  padding: 12px 0;
  position: relative;
}

.progress-bar {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.progress-bar:hover {
  background: rgba(255, 255, 255, 0.15);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.8) 0%, rgba(0, 122, 255, 0.9) 100%);
  border-radius: 2px;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 0 4px rgba(0, 122, 255, 0.3);
}

.progress-fill::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(0, 122, 255, 0.4);
}

.time-display {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  font-family: 'SF Pro Text', system-ui, sans-serif;
  letter-spacing: -0.01em;
  min-width: 80px;
  text-align: center;
  opacity: 0.9;
}

.timeline-tracks {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
}

.timeline-track {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 32px;
  position: relative;
}

.timeline-track::before {
  content: '';
  position: absolute;
  top: 0;
  left: 72px;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.06) 50%, transparent 100%);
  z-index: 1;
}

.track-label {
  width: 64px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
  flex-shrink: 0;
  font-weight: 500;
  font-family: 'SF Pro Text', system-ui, sans-serif;
  letter-spacing: -0.01em;
  padding-right: 12px;
  position: relative;
  z-index: 2;
}

.track-content {
  flex: 1;
  height: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.video-track .track-content {
  background: rgba(255, 107, 53, 0.06);
  border-color: rgba(255, 107, 53, 0.15);
}

.ppt-track .track-content {
  background: rgba(0, 122, 255, 0.06);
  border-color: rgba(0, 122, 255, 0.15);
}

.audio-track .track-content {
  background: rgba(52, 199, 89, 0.06);
  border-color: rgba(52, 199, 89, 0.15);
}

.clip {
  height: 20px;
  position: absolute;
  top: 2px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.clip:hover {
  transform: translateY(-1px);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.video-clip {
  background: rgba(255, 107, 53, 0.8);
  border-color: rgba(255, 107, 53, 0.5);
}

.ppt-clip {
  background: rgba(0, 122, 255, 0.8);
  border-color: rgba(0, 122, 255, 0.5);
}

.audio-clip {
  background: rgba(52, 199, 89, 0.8);
  border-color: rgba(52, 199, 89, 0.5);
}

/* 轨道分割线 */
.track-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 39px,
      rgba(255, 255, 255, 0.08) 39px,
      rgba(255, 255, 255, 0.08) 40px
    );
  pointer-events: none;
  z-index: 1;
}

.clip {
  z-index: 2;
}

/* 时间线标尺 */
.timeline-ruler {
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  margin-bottom: 12px;
}

/* 剪辑手柄 */
.clip-handle {
  position: absolute;
  top: 0;
  width: 8px;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: ew-resize;
  border-radius: 0 2px 2px 0;
}

.clip-handle-left {
  left: 0;
  border-radius: 2px 0 0 2px;
}

.clip-handle-right {
  right: 0;
}

.clip:hover .clip-handle {
  opacity: 1;
}

.clip-handle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 8px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 1px;
}

/* 音频波形 */
.audio-waveform {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 4px;
  pointer-events: none;
}

.waveform-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2px;
  animation: audioWave 1.5s ease-in-out infinite;
}

.waveform-bar:nth-child(1) { animation-delay: 0s; width: 4px; }
.waveform-bar:nth-child(2) { animation-delay: 0.1s; width: 6px; }
.waveform-bar:nth-child(3) { animation-delay: 0.2s; width: 8px; }
.waveform-bar:nth-child(4) { animation-delay: 0.3s; width: 5px; }
.waveform-bar:nth-child(5) { animation-delay: 0.4s; width: 7px; }

@keyframes audioWave {
  0%, 100% { opacity: 0.4; transform: scaleY(0.5); }
  50% { opacity: 1; transform: scaleY(1); }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .toolbar-left {
    width: 200px;
  }

  .properties-panel {
    width: 280px;
  }

  .canvas-content {
    flex-direction: column;
    gap: 40px;
    padding: 40px;
  }

  .video-preview, .ppt-preview {
    width: 100%;
    max-width: 600px;
  }
}

@media (max-width: 768px) {
  .workspace-header {
    padding: 0 16px;
  }

  .toolbar-left {
    width: 68px;
  }

  .toolbar-left .tool-group {
    display: none;
  }

  .properties-panel {
    width: 250px;
  }

  .timeline-footer {
    height: 100px;
  }

  .timeline-tracks {
    padding: 16px 20px;
  }

  .canvas-content {
    gap: 32px;
    padding: 32px;
  }
}
</style>