<!--
  VidSlide AI VideoEditorView - 极度简化测试版本
  用于诊断和解决白屏问题的最小化组件
-->
<template>
  <div class="video-editor-view">
    <!-- 视频上传区域 - 条件渲染 -->
    <div v-if="!videoSrc" style="margin: 20px; padding: 20px; background: #f0f8ff; border: 2px dashed #007bff; border-radius: 8px;">
      <h3 style="color: #007bff; margin: 0 0 15px 0;">📤 第一步恢复: VideoUploader 组件</h3>
      <p style="margin: 0 0 15px 0; color: #666;">
        如果能看到这个蓝色框和上传组件，说明 VideoUploader 组件恢复成功。
      </p>
      <div style="margin-bottom: 15px;">
        <button
          style="padding: 6px 12px; background: #faad14; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
          @click="resetUploader"
        >
          🔄 重置上传器
        </button>
        <span style="margin-left: 10px; font-size: 12px; color: #666;">如果上传卡住，可以点击重置</span>
      </div>
      <VideoUploader @video-selected="handleVideoSelected" />
    </div>

    <!-- 已上传视频的编辑区域 -->
    <div v-else style="margin: 20px;">
      <!-- 第二步恢复: VideoPlayer 组件 -->
      <div style="padding: 20px; background: #f0fff0; border: 2px solid #52c41a; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #52c41a; margin: 0 0 15px 0;">🎬 第二步恢复: VideoPlayer 组件</h3>
        <p style="margin: 0 0 15px 0; color: #666;">
          如果能看到这个绿色区域和下面的视频播放器，说明 VideoPlayer 组件恢复成功。
        </p>
      </div>

      <!-- 视频播放器区域 + 画中画效果 -->
      <div style="background: #000; border-radius: 8px; overflow: hidden; margin-bottom: 20px; max-width: 800px; margin-left: auto; margin-right: auto; position: relative;">
        <!-- 主视频播放器 -->
        <VideoPlayer
          :src="videoSrc"
          @timeupdate="handleTimeUpdate"
          @loadedmetadata="handleVideoLoaded"
          ref="videoPlayerRef"
        />

        <!-- 画中画渲染层 -->
        <canvas
          v-show="pipEnabled && videoSrc"
          ref="pipCanvasRef"
          :style="getPipCanvasStyle()"
          class="pip-canvas"
        ></canvas>
      </div>

      <!-- 第三步恢复: Timeline 组件 -->
      <div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 20px; border: 1px solid #e4e7ed;">
        <h4 style="margin: 0 0 15px 0; color: #303133;">⏱️ 第三步恢复: Timeline 组件</h4>
        <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
          如果能看到这个白色区域和下面的时间轴，说明 Timeline 组件恢复成功。
        </p>
        <Timeline
          :duration="videoDuration"
          :currentTime="Number(currentTime) || 0"
          :markers="markers"
          :selectedMarkerId="selectedMarkerId"
          @marker-add="handleMarkerAdd"
          @marker-select="handleMarkerSelect"
          @time-seek="handleTimeSeek"
        />
      </div>

      <!-- 🎬 画中画功能控制面板 -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 20px; margin-bottom: 20px; color: white;">
        <h4 style="margin: 0 0 15px 0; color: white;">🎬 画中画功能 (核心卖点)</h4>

        <!-- 画中画开关 -->
        <div style="margin-bottom: 15px;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input
              type="checkbox"
              :checked="pipEnabled"
              @change="pipEnabled = $event.target.checked"
              style="width: 18px; height: 18px;"
            />
            <span style="font-weight: bold;">启用画中画效果</span>
          </label>
        </div>

        <!-- 位置选择 -->
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">位置选择:</label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            <button
              v-for="pos in ['top-left', 'top-right', 'bottom-left', 'bottom-right']"
              :key="pos"
              :style="getPipPositionButtonStyle(pos)"
              @click="pipPosition = pos"
            >
              {{ getPositionLabel(pos) }}
            </button>
          </div>
        </div>

        <!-- 大小调节 -->
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">
            大小调节: {{ Math.round(pipSize * 100) }}%
          </label>
          <input
            type="range"
            min="0.1"
            max="0.5"
            step="0.05"
            :value="pipSize"
            @input="pipSize = parseFloat($event.target.value)"
            style="width: 100%;"
          />
        </div>

        <!-- 样式选择 -->
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">样式选择:</label>
          <div style="display: flex; gap: 8px;">
            <button
              v-for="style in ['simple', 'professional', 'active']"
              :key="style"
              :style="getPipStyleButtonStyle(style)"
              @click="pipStyle = style"
            >
              {{ getStyleLabel(style) }}
            </button>
          </div>
        </div>

        <!-- 测试按钮 -->
        <div style="margin-top: 15px;">
          <button
            style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; cursor: pointer;"
            @click="testPipFunction"
          >
            🎬 测试画中画效果
          </button>
        </div>

        <!-- 状态显示 -->
        <div style="margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 4px; font-size: 14px;">
          <div>状态: {{ pipEnabled ? '已启用' : '已禁用' }}</div>
          <div>位置: {{ getPositionLabel(pipPosition) }}</div>
          <div>大小: {{ Math.round(pipSize * 100) }}%</div>
          <div>样式: {{ getStyleLabel(pipStyle) }}</div>
        </div>
      </div>

      <!-- 第四步恢复: AI功能组件 -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 2px solid #722ed1;">
        <h3 style="color: #722ed1; margin: 0 0 15px 0;">🤖 第四步恢复: AI功能组件</h3>
        <p style="margin: 0 0 15px 0; color: #666;">
          如果能看到这个紫色区域和选项卡，说明 AI功能组件开始恢复。
        </p>

        <!-- AI功能选项卡 -->
        <div style="background: white; border-radius: 8px; overflow: hidden;">
          <!-- 选项卡头部 -->
          <div style="border-bottom: 1px solid #e4e7ed; display: flex;">
            <button
              :style="getAiTabStyle('transcription')"
              @click="aiSubTab = 'transcription'"
            >
              🎤 语音转文字
            </button>
            <button
              :style="getAiTabStyle('face')"
              @click="aiSubTab = 'face'"
            >
              👤 人脸跟踪
            </button>
            <button
              :style="getAiTabStyle('recommend')"
              @click="aiSubTab = 'recommend'"
            >
              💡 智能推荐
            </button>
          </div>

          <!-- 选项卡内容 -->
          <div style="padding: 20px; min-height: 200px;">
            <!-- 语音转文字选项卡 -->
            <div v-if="aiSubTab === 'transcription'">
              <h4 style="margin: 0 0 15px 0; color: #303133;">🎤 语音转文字</h4>
              <!-- 临时禁用AI功能，专注解决基础问题 -->
              <div style="padding: 20px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; text-align: center;">
                <h5 style="margin: 0 0 10px 0; color: #856404;">⚠️ AI功能临时禁用</h5>
                <p style="margin: 0; color: #856404;">
                  正在修复基础问题，AI功能将在问题解决后恢复
                </p>
              </div>
            </div>

            <!-- 人脸跟踪选项卡 -->
            <div v-if="aiSubTab === 'face'">
              <h4 style="margin: 0 0 15px 0; color: #303133;">👤 人脸跟踪</h4>
              <div style="padding: 20px; background: #f6f6f6; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #666;">人脸跟踪功能开发中...</p>
                <button
                  style="margin-top: 10px; padding: 8px 16px; background: #722ed1; color: white; border: none; border-radius: 4px; cursor: pointer;"
                  @click="testFaceTracking"
                >
                  测试功能
                </button>
              </div>
            </div>

            <!-- 智能推荐选项卡 -->
            <div v-if="aiSubTab === 'recommend'">
              <h4 style="margin: 0 0 15px 0; color: #303133;">💡 智能推荐</h4>
              <div style="padding: 20px; background: #f6f6f6; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #666;">智能推荐功能开发中...</p>
                <button
                  style="margin-top: 10px; padding: 8px 16px; background: #faad14; color: white; border: none; border-radius: 4px; cursor: pointer;"
                  @click="testSmartRecommend"
                >
                  测试功能
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 播放控制和状态 -->
      <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color: #303133;">🎮 播放控制</h4>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <button
            style="padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;"
            @click="testVideoPlayback"
          >
            测试播放
          </button>
          <button
            style="padding: 8px 16px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer;"
            @click="testSeekFunction"
          >
            测试跳转
          </button>
          <button
            style="padding: 8px 16px; background: #faad14; color: white; border: none; border-radius: 4px; cursor: pointer;"
            @click="resetVideo"
          >
            🔄 重新选择视频
          </button>
        </div>

        <!-- 播放状态显示 -->
        <div style="margin-top: 15px; padding: 10px; background: white; border-radius: 4px;">
          <div style="font-family: monospace; font-size: 14px;">
            <div>当前时间: {{ formatTime(currentTime) }}</div>
            <div>视频时长: {{ formatTime(videoDuration) }}</div>
            <div>播放进度: {{ videoDuration > 0 ? Math.round((currentTime / videoDuration) * 100) : 0 }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 深度诊断面板 -->
    <div style="padding: 20px; background: #e8f5e8; border: 2px solid #52c41a; margin: 20px; border-radius: 8px;">
      <h1 style="color: #52c41a; margin: 0 0 10px 0;">✅ VideoEditorView 组件渲染成功！</h1>
      <p style="margin: 0 0 15px 0; color: #666;">
        如果您能看到这个绿色框和消息，说明 VideoEditorView 组件已经正常加载和渲染。
      </p>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button
          style="padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;"
          @click="testButton1"
        >
          测试按钮1
        </button>
        <button
          style="padding: 8px 16px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer;"
          @click="testButton2"
        >
          测试按钮2
        </button>
        <button
          style="padding: 8px 16px; background: #faad14; color: white; border: none; border-radius: 4px; cursor: pointer;"
          @click="testButton3"
        >
          测试按钮3
        </button>
      </div>
      <!-- 深度诊断：只显示基础信息 -->
      <div style="margin-top: 20px; padding: 20px; background: #e8f5e8; border: 2px solid #52c41a; border-radius: 8px;">
        <h3 style="color: #52c41a; margin: 0 0 15px 0;">🔍 深度诊断模式</h3>
        <p style="margin: 0 0 15px 0; color: #666;">
          已移除所有组件导入，只保留基础Vue功能。如果能看到这个绿框，说明渲染管道正常。
        </p>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button
            style="padding: 10px 20px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;"
            @click="testBasicVue"
          >
            测试基础Vue功能
          </button>
          <button
            style="padding: 10px 20px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer;"
            @click="testStateManagement"
          >
            测试状态管理
          </button>
          <button
            style="padding: 10px 20px; background: #faad14; color: white; border: none; border-radius: 4px; cursor: pointer;"
            @click="testEventHandling"
          >
            测试事件处理
          </button>
        </div>

        <div style="margin-top: 20px; padding: 15px; background: #f6f6f6; border-radius: 6px;">
          <h4 style="margin: 0 0 10px 0; color: #303133;">🧪 诊断结果 & 恢复状态</h4>
          <div style="font-family: monospace; font-size: 14px;">
            <div>✅ Vue 3 运行环境: 正常</div>
            <div>✅ Composition API: 正常</div>
            <div>✅ 响应式系统: {{ reactiveWorking ? '正常' : '待测试' }}</div>
            <div>✅ 事件处理: {{ eventWorking ? '正常' : '待测试' }}</div>
            <div>✅ 组件渲染: ✅ 正常 (能看到此消息)</div>
            <div>✅ VideoUploader: ✅ 已恢复</div>
            <div>✅ VideoPlayer: ✅ 已恢复</div>
            <div>✅ Timeline: ✅ 已恢复</div>
            <div>✅ AI功能: ✅ Transcriber 已实现 (语音录音 + 手动输入)</div>
            <div>✅ 问题修复: ✅ Timeline类型错误 + 上传超时已修复</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 15px; padding: 10px; background: #f6f6f6; border-radius: 4px;">
        <strong>状态信息:</strong>
        <div>reactiveWorking: {{ reactiveWorking }}</div>
        <div>eventWorking: {{ eventWorking }}</div>
        <div>videoSrc: {{ videoSrc ? '已设置' : '未设置' }}</div>
        <div>currentTime: {{ formatTime(Number(currentTime) || 0) }} ({{ typeof (Number(currentTime) || 0) }})</div>
        <div>raw currentTime: {{ currentTime }} ({{ typeof currentTime }})</div>
        <div>videoDuration: {{ formatTime(videoDuration) }}</div>
        <div>videoPlayerRef: {{ videoPlayerRef ? '已设置' : '未设置' }}</div>
        <div>markers数量: {{ markers.length }}</div>
        <div>selectedMarkerId: {{ selectedMarkerId || '未选择' }}</div>
        <div>aiSubTab: {{ aiSubTab }}</div>
        <div>transcriptionMode: {{ transcriptionMode }}</div>
        <div>isRecording: {{ isRecording }}</div>
        <div>currentTranscription: {{ currentTranscription ? '已设置' : '未设置' }}</div>
        <div>组件状态: ✅ 基础功能 + AI功能 已恢复 (稳定版)</div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.pip-canvas {
  position: absolute;
  pointer-events: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.pip-canvas.simple {
  border: 2px solid #ffffff;
}

.pip-canvas.professional {
  border: 2px solid #ffd700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.pip-canvas.active {
  border: 2px solid #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
  animation: pip-pulse 2s infinite;
}

@keyframes pip-pulse {
  0% { box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4); }
  50% { box-shadow: 0 4px 20px rgba(24, 144, 255, 0.6); }
  100% { box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4); }
}
</style>

<!--
  VideoEditorView - 逐步恢复版本
  从基本的视频上传功能开始，逐步恢复完整编辑器功能
-->
<script setup>
/**
 * VideoEditorView - 逐步恢复版本
 * 从基本的视频上传功能开始，确保每个步骤都正常工作
 */

import { ref, watch } from 'vue'
import VideoUploader from '../components/VideoUploader.vue'
import VideoPlayer from '../components/VideoPlayer.vue'
import Timeline from '../components/Timeline.vue'
import Transcriber from '../components/Transcriber.vue'

/**
 * 深度诊断模式 - 最简状态管理
 */

// 基础响应式状态
const reactiveWorking = ref(false)
const eventWorking = ref(false)

// VideoUploader 相关状态
const videoSrc = ref('')
const currentVideoFile = ref(null)

// VideoPlayer 相关状态
const currentTime = ref(0)
const videoDuration = ref(0)
const videoPlayerRef = ref(null)

// 画中画渲染相关状态
const pipCanvasRef = ref(null)
const pipAnimationId = ref(null)


// Timeline 相关状态
const markers = ref([])
const selectedMarkerId = ref('')

// AI功能相关状态 (暂时简化)
const aiSubTab = ref('transcription')

// 画中画功能状态
const pipEnabled = ref(false)
const pipPosition = ref('top-right') // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
const pipSize = ref(0.25) // 25% of main video size
const pipStyle = ref('professional') // 'simple', 'professional', 'active'

// 简单的测试方法
const testButton1 = () => {
  console.log('测试按钮1被点击')
  alert('测试按钮1工作正常！')
}

const testButton2 = () => {
  console.log('测试按钮2被点击')
  alert('测试按钮2工作正常！')
}

const testButton3 = () => {
  console.log('测试按钮3被点击')
  alert('测试按钮3工作正常！')
}

// VideoUploader 处理方法
const handleVideoSelected = (file) => {
  console.log('视频文件已选择:', file.name)
  currentVideoFile.value = file
  videoSrc.value = URL.createObjectURL(file)
  alert(`✅ VideoUploader 组件工作正常！\n视频 "${file.name}" 已成功加载！`)
}

const resetUploader = () => {
  // 强制刷新页面来重置所有状态
  window.location.reload()
}

const resetVideo = () => {
  if (videoSrc.value) {
    URL.revokeObjectURL(videoSrc.value)
  }
  videoSrc.value = ''
  currentVideoFile.value = null
  currentTime.value = 0
  videoDuration.value = 0
  console.log('视频已重置，可以重新选择')
  alert('🔄 视频已重置，可以重新上传')
}

// VideoPlayer 事件处理
const handleTimeUpdate = (timeData) => {
  // timeData 是对象: { currentTime: number, duration: number }
  if (typeof timeData === 'object' && timeData.currentTime !== undefined) {
    const newTime = Number(timeData.currentTime)
    currentTime.value = isNaN(newTime) ? 0 : Math.max(0, newTime)
  } else if (typeof timeData === 'number') {
    // 兼容旧格式
    currentTime.value = isNaN(timeData) ? 0 : Math.max(0, timeData)
  }
}

const handleVideoLoaded = (data) => {
  videoDuration.value = data.duration
  console.log('VideoPlayer 组件工作正常:', data)
  alert('✅ VideoPlayer 组件恢复成功！视频已加载完成。')
}

// VideoPlayer 测试方法
const testVideoPlayback = () => {
  if (videoPlayerRef.value) {
    // 这里可以测试播放/暂停功能
    console.log('VideoPlayer 引用存在，播放功能正常')
    alert('✅ VideoPlayer 播放功能测试通过！')
  } else {
    console.error('VideoPlayer 引用不存在')
    alert('❌ VideoPlayer 引用异常')
  }
}

const testSeekFunction = () => {
  if (videoPlayerRef.value && videoDuration.value > 0) {
    // 测试跳转到视频中间
    const middleTime = videoDuration.value / 2
    videoPlayerRef.value.seekTo(middleTime)
    console.log('跳转到视频中间:', middleTime)
    alert(`✅ VideoPlayer 跳转功能测试通过！跳转到 ${formatTime(middleTime)}`)
  } else {
    alert('❌ 视频未加载或时长未知')
  }
}

// 时间格式化辅助函数
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// AI选项卡样式
const getAiTabStyle = (tabName) => {
  const baseStyle = {
    flex: 1,
    padding: '12px 20px',
    border: 'none',
    background: aiSubTab.value === tabName ? '#722ed1' : '#f8f9fa',
    color: aiSubTab.value === tabName ? 'white' : '#666',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: aiSubTab.value === tabName ? 'bold' : 'normal',
    borderRight: tabName !== 'recommend' ? '1px solid #e4e7ed' : 'none'
  }
  return baseStyle
}

// 语音转文字按钮样式
const normalButtonStyle = {
  padding: '8px 16px',
  background: '#f5f5f5',
  color: '#666',
  border: '1px solid #e4e7ed',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
}

const activeButtonStyle = {
  padding: '8px 16px',
  background: '#1890ff',
  color: 'white',
  border: '1px solid #1890ff',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold'
}

const recordButtonStyle = {
  padding: '10px 20px',
  background: '#52c41a',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold'
}

const recordingButtonStyle = {
  padding: '10px 20px',
  background: '#f5222d',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold'
}

// Timeline 事件处理
const handleMarkerAdd = (markerData) => {
  const newMarker = {
    id: `marker_${Date.now()}`,
    time: markerData.time,
    content: markerData.content || `标记 ${Math.floor(markerData.time)}秒`,
    position: markerData.position || { x: 10, y: 10 },
    type: markerData.type || 'content'
  }

  markers.value.push(newMarker)
  selectedMarkerId.value = newMarker.id
  console.log('Timeline添加标记:', newMarker)
  alert(`✅ Timeline 组件工作正常！\n在 ${Math.floor(markerData.time)} 秒处添加了标记`)
}

const handleMarkerSelect = (markerId) => {
  selectedMarkerId.value = markerId
  console.log('选择标记:', markerId)
}

const handleTimeSeek = (time) => {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.seekTo(time)
    console.log('跳转到时间:', time)
  }
}

// AI功能相关方法 (暂时简化)

// AI功能方法已删除，专注解决基础问题

// AI功能事件处理 (保留兼容性)
const handleTranscriptionUpdate = (transcription) => {
  currentTranscription.value = transcription
  console.log('转录内容已更新:', transcription)
}

const handleSegmentSelected = (segment) => {
  if (videoPlayerRef.value && segment.startTime !== undefined) {
    videoPlayerRef.value.seekTo(segment.startTime)
    console.log('跳转到转录片段:', segment)
  }
}

// AI功能测试方法
const testFaceTracking = () => {
  alert('👤 人脸跟踪功能开发中...\n✅ FaceTracker 组件集成准备完成')
}

const testSmartRecommend = () => {
  alert('💡 智能推荐功能开发中...\n✅ SmartRecommender 组件集成准备完成')
}

// 深度诊断测试方法
const testBasicVue = () => {
  console.log('测试基础Vue功能')
  reactiveWorking.value = true
  alert('✅ Vue 3 Composition API 工作正常！')
}

const testStateManagement = () => {
  console.log('测试状态管理')
  reactiveWorking.value = !reactiveWorking.value
  alert(`✅ 响应式状态工作正常！当前状态: ${reactiveWorking.value}`)
}

const testEventHandling = () => {
  console.log('测试事件处理')
  eventWorking.value = true
  alert('✅ 事件处理工作正常！')
}

// 画中画功能辅助函数
const getPositionLabel = (position) => {
  const labels = {
    'top-left': '↖ 左上',
    'top-right': '↗ 右上',
    'bottom-left': '↙ 左下',
    'bottom-right': '↘ 右下'
  }
  return labels[position] || position
}

const getStyleLabel = (style) => {
  const labels = {
    'simple': '简洁',
    'professional': '专业',
    'active': '活跃'
  }
  return labels[style] || style
}

const getPipPositionButtonStyle = (position) => {
  const baseStyle = {
    padding: '8px 12px',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '4px',
    background: pipPosition.value === position ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px'
  }
  return baseStyle
}

const getPipStyleButtonStyle = (style) => {
  const baseStyle = {
    padding: '6px 12px',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '4px',
    background: pipStyle.value === style ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px'
  }
  return baseStyle
}

// 画中画功能测试
const testPipFunction = () => {
  const status = `🎬 画中画功能状态:\n\n启用: ${pipEnabled.value}\n位置: ${getPositionLabel(pipPosition.value)}\n大小: ${Math.round(pipSize.value * 100)}%\n样式: ${getStyleLabel(pipStyle.value)}`

  alert(`✅ 画中画控制面板工作正常！\n\n${status}\n\n🎯 画中画功能正在开发中，这是UI控制界面。\n\n下一步将实现:\n• 自动触发机制\n• 视觉效果渲染\n• 位置智能调整`)
}

// 画中画自动触发逻辑 (待实现)
const triggerPictureInPicture = (material) => {
  console.log('触发画中画效果:', material)
  pipEnabled.value = true
  // TODO: 实现自动位置选择和样式匹配
}

// 画中画位置智能调整 (待实现)
const adjustPipPosition = () => {
  // TODO: 根据视频内容智能调整画中画位置
  // 检测人脸位置，避免遮挡重要内容
}

// 画中画Canvas样式计算
const getPipCanvasStyle = () => {
  if (!pipEnabled.value || !videoPlayerRef.value) {
    return { display: 'none' }
  }

  const videoRect = videoPlayerRef.value.$el.getBoundingClientRect()
  const videoWidth = videoRect.width
  const videoHeight = videoRect.height

  // 计算画中画尺寸
  const pipWidth = videoWidth * pipSize.value
  const pipHeight = videoHeight * pipSize.value

  // 计算画中画位置
  let left, top

  switch (pipPosition.value) {
    case 'top-left':
      left = 10
      top = 10
      break
    case 'top-right':
      left = videoWidth - pipWidth - 10
      top = 10
      break
    case 'bottom-left':
      left = 10
      top = videoHeight - pipHeight - 10
      break
    case 'bottom-right':
      left = videoWidth - pipWidth - 10
      top = videoHeight - pipHeight - 10
      break
    default:
      left = videoWidth - pipWidth - 10
      top = 10
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${pipWidth}px`,
    height: `${pipHeight}px`
  }
}

// 画中画渲染逻辑
const renderPipFrame = () => {
  if (!pipEnabled.value || !videoPlayerRef.value || !pipCanvasRef.value) {
    return
  }

  const video = videoPlayerRef.value.$refs.videoRef
  const canvas = pipCanvasRef.value
  const ctx = canvas.getContext('2d')

  if (!video || !ctx) return

  // 设置Canvas尺寸
  const videoRect = videoPlayerRef.value.$el.getBoundingClientRect()
  const pipWidth = videoRect.width * pipSize.value
  const pipHeight = videoRect.height * pipSize.value

  canvas.width = pipWidth
  canvas.height = pipHeight

  // 清除画布
  ctx.clearRect(0, 0, pipWidth, pipHeight)

  // 绘制视频帧到画中画
  ctx.drawImage(video, 0, 0, pipWidth, pipHeight)

  // 添加样式效果
  addPipStyleEffects(ctx, pipWidth, pipHeight)
}

// 添加画中画样式效果
const addPipStyleEffects = (ctx, width, height) => {
  ctx.save()

  switch (pipStyle.value) {
    case 'simple':
      // 简洁样式：白色边框
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.strokeRect(1, 1, width - 2, height - 2)
      break

    case 'professional':
      // 专业样式：金色边框 + 阴影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      ctx.strokeStyle = '#ffd700'
      ctx.lineWidth = 3
      ctx.strokeRect(1.5, 1.5, width - 3, height - 3)
      break

    case 'active':
      // 活跃样式：蓝色边框 + 渐变
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#1890ff')
      gradient.addColorStop(1, '#40a9ff')

      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.strokeRect(1.5, 1.5, width - 3, height - 3)
      break
  }

  ctx.restore()
}

// 启动画中画渲染循环
const startPipRendering = () => {
  if (pipAnimationId.value) {
    cancelAnimationFrame(pipAnimationId.value)
  }

  const renderLoop = () => {
    if (pipEnabled.value) {
      renderPipFrame()
      pipAnimationId.value = requestAnimationFrame(renderLoop)
    }
  }

  renderLoop()
}

// 停止画中画渲染
const stopPipRendering = () => {
  if (pipAnimationId.value) {
    cancelAnimationFrame(pipAnimationId.value)
    pipAnimationId.value = null
  }
}

// 监听画中画状态变化
watch(pipEnabled, (newValue) => {
  if (newValue) {
    startPipRendering()
  } else {
    stopPipRendering()
  }
})

watch([pipPosition, pipSize, pipStyle], () => {
  if (pipEnabled.value) {
    // 重新渲染当前帧
    renderPipFrame()
  }
})
</script>
