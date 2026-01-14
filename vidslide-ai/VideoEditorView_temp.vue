<!--
  VidSlide AI - 苹果风格专业工作界面
  基于V0.dev设计的完整功能工作空间
  三栏布局：工具栏 + 主编辑区 + 属性面板 + 时间线
-->
<template>
  <!-- 标题栏 -->
  <div class="title-bar">
    <h1>🎬 VidSlide AI - 专业视频编辑工作台</h1>
  </div>

  <!-- 主工作区 -->
  <div class="workspace">
    <!-- 左侧工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <button class="tool-btn" title="新建项目" @click="newProject">📄</button>
        <button class="tool-btn" title="打开项目" @click="openProject">📂</button>
        <button class="tool-btn" title="保存" @click="saveProject">💾</button>
      </div>

      <div class="tool-group">
        <button class="tool-btn active" title="上传视频" @click="uploadVideo">🎥</button>
        <button class="tool-btn" title="剪辑" @click="trimVideo">✂️</button>
        <button class="tool-btn" title="分割" @click="splitVideo">🔀</button>
      </div>

      <div class="tool-group">
        <button class="tool-btn" title="模板选择" @click="selectTemplate">🎨</button>
        <button class="tool-btn" title="幻灯片管理" @click="manageSlides">📊</button>
        <button class="tool-btn" title="样式设置" @click="setStyle">🎯</button>
      </div>

      <div class="tool-group">
        <button class="tool-btn" title="文字工具" @click="textTool">📝</button>
        <button class="tool-btn" title="形状工具" @click="shapeTool">⬜</button>
        <button class="tool-btn" title="颜色" @click="colorTool">🎨</button>
      </div>

      <div class="tool-group">
        <button class="tool-btn" title="AI生成" @click="aiGenerate">🤖</button>
        <button class="tool-btn" title="智能同步" @click="smartSync">⚡</button>
        <button class="tool-btn" title="一键优化" @click="optimize">✨</button>
      </div>
    </div>

    <!-- 主编辑区 -->
    <div class="main-canvas">
      <div class="canvas-container">
        <div class="canvas-content">
          <div class="template-preview">
            <img
              :src="currentTemplateImage"
              :alt="currentTemplateName + '模板预览'"
              class="template-image"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧属性面板 -->
    <div class="properties-panel">
      <div class="panel-tabs">
        <button
          class="panel-tab"
          :class="{ active: activePanelTab === 'template' }"
          @click="activePanelTab = 'template'"
        >
          🎨 模板
        </button>
        <button
          class="panel-tab"
          :class="{ active: activePanelTab === 'style' }"
          @click="activePanelTab = 'style'"
        >
          ⚙️ 样式
        </button>
        <button
          class="panel-tab"
          :class="{ active: activePanelTab === 'animation' }"
          @click="activePanelTab = 'animation'"
        >
          🎬 动画
        </button>
        <button
          class="panel-tab"
          :class="{ active: activePanelTab === 'ai' }"
          @click="activePanelTab = 'ai'"
        >
          🤖 AI助手
        </button>
      </div>

      <div class="panel-content">
        <!-- 模板标签页 -->
        <div v-if="activePanelTab === 'template'" class="property-group">
          <h3>模板选择</h3>
          <div class="template-selector">
            <div
              v-for="template in templates"
              :key="template.id"
              class="template-card"
              :class="{ selected: selectedTemplateId === template.id }"
              @click="selectTemplateById(template.id)"
            >
              <div class="template-name">{{ template.name }}</div>
              <div class="template-desc">{{ template.description }}</div>
            </div>
          </div>
        </div>

        <!-- 样式标签页 -->
        <div v-if="activePanelTab === 'style'" class="property-group">
          <h3>画中画设置</h3>
          <div class="style-controls">
            <div class="control-item">
              <label>位置</label>
              <select v-model="pipSettings.position">
                <option value="top-left">左上角</option>
                <option value="top-right">右上角</option>
                <option value="bottom-left">左下角</option>
                <option value="bottom-right">右下角</option>
              </select>
            </div>
            <div class="control-item">
              <label>大小: {{ pipSettings.size }}%</label>
              <input type="range" min="10" max="50" v-model="pipSettings.size">
            </div>
            <div class="control-item">
              <label>样式</label>
              <select v-model="pipSettings.style">
                <option value="simple">简洁</option>
                <option value="professional">专业</option>
                <option value="dynamic">活跃</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 动画标签页 -->
        <div v-if="activePanelTab === 'animation'" class="property-group">
          <h3>动画效果</h3>
          <div class="animation-controls">
            <button class="control-btn" @click="addFadeAnimation">淡入效果</button>
            <button class="control-btn" @click="addSlideAnimation">滑入效果</button>
            <button class="control-btn" @click="addZoomAnimation">缩放效果</button>
            <button class="control-btn" @click="clearAnimations">清除动画</button>
          </div>
        </div>

        <!-- AI助手标签页 -->
        <div v-if="activePanelTab === 'ai'" class="property-group">
          <h3>AI智能助手</h3>
          <div class="ai-assistant">
            <div class="ai-suggestions">
              <div class="suggestion-item">
                <span class="suggestion-icon">💡</span>
                <span>建议使用画中画模板突出演讲者</span>
              </div>
              <div class="suggestion-item">
                <span class="suggestion-icon">🎨</span>
                <span>检测到数据内容，推荐图表模板</span>
              </div>
              <div class="suggestion-item">
                <span class="suggestion-icon">⚡</span>
                <span>AI已自动优化颜色搭配</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 时间线 -->
  <div class="timeline">
    <div class="timeline-track">
      <div class="timeline-progress" :style="{ width: progressPercent + '%' }"></div>
      <div
        v-for="marker in timelineMarkers"
        :key="marker.id"
        class="timeline-marker"
        :style="{ left: marker.position + '%' }"
        @click="selectMarker(marker)"
      ></div>
    </div>
    <div class="timeline-controls">
      <button class="timeline-btn" @click="addMarker">➕ 添加标记</button>
      <button class="timeline-btn" @click="removeMarker" :disabled="!selectedMarkerId">🗑️ 删除标记</button>
      <span>标记数量: {{ timelineMarkers.length }}</span>
    </div>
  </div>
    <!-- 视频上传区域 -->
    <section
v-if="!videoSrc" class="upload-section"
role="region" aria-labelledby="upload-heading"
>
      <div class="upload-container">
        <h3 id="upload-heading">📤 上传视频</h3>
        <p>选择您要转换为PPT的视频文件</p>
        <label
for="video-file-input" class="sr-only"
>选择视频文件</label>
        <input
          id="video-file-input"
          type="file"
          accept="video/*"
          class="file-input"
          aria-describedby="upload-description"
          @change="handleFileSelect"
        />
        <div
id="upload-description" class="sr-only"
>
          支持MP4、AVI、MOV等常见视频格式，文件大小不超过500MB
        </div>
      </div>
    </section>

    <!-- 视频编辑区域 -->
    <main
v-else class="editor-section"
role="main" aria-labelledby="editor-heading"
>
      <div class="editor-layout">
        <!-- 左侧工具栏 -->
        <aside
class="left-panel" role="complementary"
aria-label="编辑工具面板"
>
          <section
class="panel-section" role="region"
aria-labelledby="template-section-heading"
>
            <h4 id="template-section-heading">🎨 模板选择</h4>
            <TemplateSelector @template-selected="handleTemplateSelected" />
          </section>

          <section
class="panel-section" role="region"
aria-labelledby="adjustment-section-heading"
>
            <h4 id="adjustment-section-heading">⚙️ 参数调整</h4>
            <UserAdjustmentPanel
              v-if="selectedTemplate"
              :template="selectedTemplate"
              :aria-label="`调整 ${selectedTemplate?.name || '选中模板'} 的参数`"
              @adjustment-changed="handleAdjustmentChanged"
            />
          </section>
        </aside>

        <!-- 主编辑区 -->
        <section
class="main-editor" role="region"
aria-labelledby="editor-heading"
>
          <h2
id="editor-heading" class="sr-only">视频编辑主区域</h2>

          <div class="canvas-container">
            <canvas
              ref="canvasRef"
              :width="canvasWidth"
              :height="canvasHeight"
              class="editor-canvas"
              role="img"
              :aria-label="`视频编辑画布，尺寸 ${canvasWidth}x${canvasHeight}`"
              tabindex="0"
              @keydown="handleCanvasKeydown"
            />

            <!-- 画中画控制 -->
            <div
v-if="pipEnabled" class="pip-controls"
role="region" aria-label="画中画效果控制"
>
              <PictureInPicture
                :video-element="videoElement"
                :pip-element="pipElement"
                :enabled="pipEnabled"
                :position="pipPosition"
                :size="pipSize"
                :style="pipStyle"
              />
            </div>
          </div>

          <!-- 动画控制 -->
          <section
class="animation-controls" role="region"
aria-labelledby="animation-heading"
>
            <h3
id="animation-heading" class="sr-only">动画效果控制</h3>
            <AnimationSystem
              :video-element="videoElement"
              :text-elements="textElements"
              aria-label="视频动画效果控制系统"
              @animation-start="handleAnimationStart"
              @animation-end="handleAnimationEnd"
            />
          </section>
        </section>
      </div>

      <!-- 右侧素材面板 -->
      <aside
class="right-panel" role="complementary"
aria-label="素材和监控面板"
>
        <!-- 暂时注释掉AssetBrowser以避免初始化错误 -->
        <!-- <section
class="panel-section" role="region"
aria-labelledby="asset-section-heading"
>
          <h4 id="asset-section-heading">🖼️ 素材浏览器</h4>
          <AssetBrowser
            aria-label="素材资源浏览器和选择器"
            @asset-selected="handleAssetSelected"
            @asset-previewed="handleAssetPreviewed"
          />
        </section> -->

        <section
class="panel-section" role="region"
aria-labelledby="monitor-section-heading"
>
          <h4 id="monitor-section-heading">📊 性能监控</h4>
          <PerformanceMonitor
            :auto-start="true"
            :update-interval="2000"
            aria-label="系统性能实时监控面板"
            @performance-alert="handlePerformanceAlert"
            @metrics-updated="handleMetricsUpdated"
          />
        </section>
      </aside>
    </main>
  </div>

  <!-- 底部控制栏 -->
  <footer
class="bottom-toolbar" role="toolbar"
aria-label="编辑器操作控制栏"
>
    <button
      class="export-btn"
      aria-label="导出演示结果"
      :aria-describedby="exportStatus ? 'export-status' : undefined"
      @click="openExportDialog"
    >
      导出
    </button>
    <div
v-if="exportStatus" id="export-status"
class="sr-only" aria-live="polite"
>
      {{ exportStatus }}
    </div>
    <button
class="preview-btn" @click="previewPPT">预览</button>
    <button
class="reset-btn" @click="resetAll">重置</button>
  </footer>

  <!-- 导出对话框 -->
  <ExportDialog
    :visible="showExportDialog"
    :canvas="canvasRef"
    :slides="exportSlides"
    @close="closeExportDialog"
    @export-complete="handleExportComplete"
  />
</template>

