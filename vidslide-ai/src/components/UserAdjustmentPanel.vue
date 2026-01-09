/** * UserAdjustmentPanel.vue * VidSlide AI - 紧急补齐阶段 *
实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统 */

<template>
  <div class="user-adjustment-panel">
    <!-- 面板头部 -->
    <header
class="panel-header" role="banner"
>
      <h2
id="panel-title" class="panel-title"
>
        <el-icon aria-hidden="true">
          <setting />
        </el-icon>
        {{ currentTemplate?.name || '模板设置' }}
      </h2>
      <div
class="panel-actions" role="toolbar"
aria-label="面板操作"
>
        <el-tag
          :type="complianceScore >= 80 ? 'success' : complianceScore >= 60 ? 'warning' : 'danger'"
          size="small"
          aria-live="polite"
          :aria-label="`合规度: ${complianceScore}%`"
        >
          合规度: {{ complianceScore }}%
        </el-tag>
        <el-button
          type="primary"
          size="small"
          :loading="isApplying"
          :disabled="!hasChanges"
          :aria-label="hasChanges ? '应用更改' : '无更改需要应用'"
          :aria-describedby="isApplying ? 'applying-status' : undefined"
          @click="applyChanges"
        >
          应用更改
        </el-button>
        <span
v-if="isApplying" id="applying-status"
class="sr-only"
>正在应用更改...</span>
      </div>
    </header>

    <!-- 面板内容 -->
    <main
class="panel-content" role="main"
aria-labelledby="panel-title"
>
      <!-- 基本设置 -->
      <div class="setting-section">
        <h4 class="section-title">
          <el-icon><grid /></el-icon>
          基本设置
        </h4>

        <!-- 位置选择 (仅画中画) -->
        <div
v-if="isPictureInPicture" class="setting-item"
>
          <label
class="setting-label" for="position-select"
>位置</label>
          <el-select
            id="position-select"
            v-model="adjustments.position"
            placeholder="选择位置"
            size="small"
            aria-label="选择画中画显示位置"
            aria-describedby="position-help"
            @change="onAdjustmentChange"
          >
            <el-option
label="左上角" value="top-left"
/>
            <el-option
label="右上角" value="top-right"
/>
            <el-option
label="左下角" value="bottom-left"
/>
            <el-option
label="右下角" value="bottom-right"
/>
            <el-option
label="居中" value="center"
/>
          </el-select>
          <span
id="position-help" class="sr-only"
>选择画中画效果在视频中的显示位置</span>
          <div
v-if="validationErrors.position" class="error-tip"
role="alert" aria-live="polite"
>
            {{ validationErrors.position }}
          </div>
        </div>

        <!-- 大小调整 -->
        <div class="setting-item">
          <label
class="setting-label" for="size-slider"
>大小</label>
          <el-slider
            id="size-slider"
            v-model="adjustments.size"
            :min="10"
            :max="100"
            :step="5"
            show-input
            :show-input-controls="false"
            size="small"
            aria-label="调整元素大小"
            aria-valuetext="当前大小{{ adjustments.size }}%"
            @change="onAdjustmentChange"
          />
          <div class="size-display"
aria-live="polite"
>
{{ adjustments.size }}%
</div>
          <div
v-if="validationErrors.size" class="error-tip"
role="alert" aria-live="polite"
>
            {{ validationErrors.size }}
          </div>
        </div>

        <!-- 颜色选择 -->
        <div class="setting-item">
          <label class="setting-label">颜色主题</label>
          <div class="color-palette">
            <div
              v-for="color in colorOptions"
              :key="color.id"
              class="color-option"
              :class="{ active: adjustments.colorTheme === color.id }"
              @click="selectColorTheme(color.id)"
            >
              <div
class="color-preview" :style="{ background: color.preview }"
/>
              <span class="color-name">{{ color.name }}</span>
            </div>
          </div>
          <div
v-if="validationErrors.color" class="error-tip"
>
            {{ validationErrors.color }}
          </div>
        </div>
      </div>

      <!-- 内容编辑 -->
      <div class="setting-section">
        <h4 class="section-title">
          <el-icon><edit /></el-icon>
          内容编辑
        </h4>

        <!-- 文字内容编辑 -->
        <div class="setting-item">
          <label
class="setting-label" for="title-input"
>标题</label>
          <el-input
            id="title-input"
            v-model="adjustments.title"
            placeholder="输入标题内容"
            size="small"
            :maxlength="50"
            show-word-limit
            aria-describedby="title-help"
            @input="onAdjustmentChange"
          />
          <div id="title-help"
class="sr-only"
>
为模板元素设置主要标题文本
</div>
        </div>

        <div class="setting-item">
          <label
class="setting-label" for="subtitle-input"
>副标题</label>
          <el-input
            id="subtitle-input"
            v-model="adjustments.subtitle"
            placeholder="输入副标题内容（可选）"
            size="small"
            :maxlength="100"
            show-word-limit
            aria-describedby="subtitle-help"
            @input="onAdjustmentChange"
          />
          <div id="subtitle-help"
class="sr-only"
>
为模板元素设置辅助标题文本
</div>
        </div>

        <!-- 多行内容 (仅信息卡片) -->
        <div
v-if="isInfoCard" class="setting-item"
>
          <label class="setting-label">内容行</label>
          <div class="content-lines">
            <div
              v-for="(line, index) in adjustments.contentLines"
              :key="index"
              class="content-line"
            >
              <el-input
                v-model="adjustments.contentLines[index]"
                :placeholder="`第${index + 1}行内容`"
                size="small"
                :maxlength="80"
                :aria-label="`内容行 ${index + 1}`"
                :aria-describedby="`content-line-help-${index}`"
                @input="onAdjustmentChange"
              />
              <div
:id="`content-line-help-${index}`" class="sr-only"
>
                信息卡片的第{{ index + 1 }}行显示内容
              </div>
              <el-button
                type="danger"
                size="small"
                icon="Delete"
                :disabled="adjustments.contentLines.length <= 1"
                :aria-label="`删除第${index + 1}行内容`"
                @click="removeContentLine(index)"
              />
            </div>
            <el-button
              type="primary"
              size="small"
              icon="Plus"
              :disabled="adjustments.contentLines.length >= 5"
              aria-label="添加新的内容行"
              @click="addContentLine"
            >
              添加行
            </el-button>
          </div>
        </div>

        <!-- 数据内容 (仅图表) -->
        <div
v-if="isChart" class="setting-item"
>
          <label class="setting-label">图表数据</label>
          <div class="chart-data-editor">
            <div
              v-for="(dataPoint, index) in adjustments.chartData"
              :key="index"
              class="data-point"
            >
              <el-input
                v-model="dataPoint.label"
                placeholder="标签"
                size="small"
                style="width: 100px"
                :aria-label="`数据点 ${index + 1} 的标签`"
              />
              <el-input-number
                v-model="dataPoint.value"
                :min="0"
                :max="1000"
                size="small"
                style="width: 80px"
                :aria-label="`数据点 ${index + 1} 的数值`"
                @change="onAdjustmentChange"
              />
              <el-button
                type="danger"
                size="small"
                icon="Delete"
                :disabled="adjustments.chartData.length <= 2"
                :aria-label="`删除第${index + 1}个数据点`"
                @click="removeDataPoint(index)"
              />
            </div>
            <el-button
              type="primary"
              size="small"
              icon="Plus"
              :disabled="adjustments.chartData.length >= 8"
              aria-label="添加新的图表数据点"
              @click="addDataPoint"
            >
              添加数据点
            </el-button>
          </div>
        </div>
      </div>

      <!-- 素材替换 -->
      <div class="setting-section">
        <h4 class="section-title">
          <el-icon><picture /></el-icon>
          素材替换
        </h4>

        <div class="setting-item">
          <label class="setting-label">当前素材</label>
          <div class="current-material">
            <div
v-if="currentMaterial" class="material-preview"
>
              <img
                v-if="currentMaterial.type === 'image'"
                :src="currentMaterial.url"
                alt="当前素材"
                class="material-image"
              >
              <div
v-else class="material-placeholder"
>
                <el-icon size="32">
                  <video-play />
                </el-icon>
                <span>{{ currentMaterial.name }}</span>
              </div>
            </div>
            <div
v-else class="no-material"
>
              <el-icon size="24">
                <picture />
              </el-icon>
              <span>无素材</span>
            </div>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">替换素材</label>
          <div class="material-actions">
            <el-upload
              ref="uploadRef"
              :action="uploadAction"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="onUploadSuccess"
              :on-error="onUploadError"
              accept="image/*,video/*"
            >
              <el-button
size="small" type="primary"
:loading="isUploading"
>
                <el-icon><upload /></el-icon>
                上传新素材
              </el-button>
            </el-upload>
            <el-button
size="small" @click="openMaterialLibrary"
>
              <el-icon><folder /></el-icon>
              从库中选择
            </el-button>
          </div>
        </div>
      </div>

      <!-- 进度条微调 -->
      <div class="setting-section">
        <h4 class="section-title">
          <el-icon><timer /></el-icon>
          时间控制
        </h4>

        <div class="setting-item">
          <label class="setting-label">出现时间</label>
          <el-slider
            v-model="adjustments.startTime"
            :min="0"
            :max="videoDuration || 100"
            :step="0.1"
            show-input
            :show-input-controls="false"
            size="small"
            @change="onAdjustmentChange"
          />
          <div class="time-display">
            {{ formatTime(adjustments.startTime) }}
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">持续时间</label>
          <el-slider
            v-model="adjustments.duration"
            :min="1"
            :max="30"
            :step="0.5"
            show-input
            :show-input-controls="false"
            size="small"
            @change="onAdjustmentChange"
          />
          <div class="time-display">
{{ adjustments.duration }}秒
</div>
        </div>

        <div class="setting-item">
          <label class="setting-label">淡入淡出</label>
          <el-slider
            v-model="adjustments.fadeDuration"
            :min="0"
            :max="2"
            :step="0.1"
            show-input
            :show-input-controls="false"
            size="small"
            @change="onAdjustmentChange"
          />
          <div class="time-display">
{{ adjustments.fadeDuration }}秒
</div>
        </div>
      </div>
    </main>
  </div>

  <!-- 实时预览区域 -->
  <div class="preview-section">
    <h4 class="preview-title">
      <el-icon><view /></el-icon>
      实时预览
    </h4>
    <div class="preview-canvas">
      <canvas
        ref="previewCanvas"
        :width="previewSize.width"
        :height="previewSize.height"
        class="preview-canvas-element"
      />
      <div
v-if="isPreviewLoading" class="preview-loading"
>
        <el-icon class="is-loading">
          <loading />
        </el-icon>
        <span>预览更新中...</span>
      </div>
    </div>
  </div>

  <!-- 约束验证区域 -->
  <div class="validation-section">
    <!-- ConstraintValidator 已移至备份目录 -->
    :validation-result="validationResult" :adjustments="adjustments"
    :template-type="currentTemplate?.name" :show-history="false" @quick-fix-applied="handleQuickFix"
    @validation-requested="requestValidation" />
  </div>

  <!-- 智能提示区域 -->
  <div
v-if="smartSuggestions.length > 0" class="suggestions-section"
>
    <h4 class="suggestions-title">
      <el-icon><light-bulb /></el-icon>
      智能建议
    </h4>
    <div class="suggestions-list">
      <el-alert
        v-for="(suggestion, index) in smartSuggestions"
        :key="index"
        :type="suggestion.type"
        :closable="false"
        show-icon
        class="suggestion-item"
      >
        {{ suggestion.message }}
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting,
  Grid,
  Edit,
  Picture,
  Timer,
  View,
  Bulb,
  Upload,
  Folder,
  Delete,
  Plus,
  VideoPlay,
  Loading
} from '@element-plus/icons-vue'
import { TEMPLATE_TYPES } from '../core/template-engine'
import { ConstraintSystem } from '../core/template-engine'

// Props
const props = defineProps({
  currentTemplate: {
    type: Object,
    default: null
  },
  videoDuration: {
    type: Number,
    default: 0
  },
  initialAdjustments: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits([
  'adjustment-change',
  'apply-changes',
  'material-upload',
  'material-select'
])

// 响应式数据

// 文件上传组件引用
const uploadRef = ref(null)

// 预览画布引用
const previewCanvas = ref(null)

// 预览画布尺寸
const previewSize = ref({ width: 400, height: 225 })

// 用户调整参数配置
const adjustments = ref({
  position: 'bottom-right', // 画中画位置
  size: 25, // 画中画大小百分比
  colorTheme: 'professional', // 颜色主题
  title: '', // 标题文本
  subtitle: '', // 副标题文本
  contentLines: [''], // 内容行数组
  chartData: [
    // 图表数据
    { label: '数据1', value: 100 },
    { label: '数据2', value: 150 },
    { label: '数据3', value: 200 }
  ],
  startTime: 0, // 开始时间（秒）
  duration: 5, // 持续时间（秒）
  fadeDuration: 0.3 // 淡入淡出时长（秒）
})

// 表单验证错误信息
const validationErrors = ref({})

// 组件状态
const isApplying = ref(false) // 是否正在应用调整
const isUploading = ref(false) // 是否正在上传
const isPreviewLoading = ref(false) // 预览是否正在加载
const hasChanges = ref(false) // 是否有未保存的更改
const validationResult = ref(null) // 验证结果

// 素材相关状态
const currentMaterial = ref(null) // 当前选中的素材
const uploadAction = ref('/api/upload') // 上传API地址（占位符，本地处理）

// 约束验证系统实例
const constraintSystem = new ConstraintSystem()

// 计算属性
const complianceScore = computed(() => {
  // 计算合规度分数
  let score = 100
  const errors = Object.keys(validationErrors.value).length

  if (errors > 0) score -= errors * 15
  if (!adjustments.value.title.trim()) score -= 10
  if (adjustments.value.size < 10 || adjustments.value.size > 100) score -= 10

  return Math.max(0, score)
})

/** isPictureInPicture - 计算属性 */

const isPictureInPicture = computed(() => {
  return props.currentTemplate?.name === TEMPLATE_TYPES.DIALOG_POPUP
})

/** isInfoCard - 计算属性 */

const isInfoCard = computed(() => {
  return (
    props.currentTemplate?.name === TEMPLATE_TYPES.DIALOG_POPUP ||
    props.currentTemplate?.name === TEMPLATE_TYPES.EMPHASIS_FOCUS
  )
})

/** isChart - 计算属性 */

const isChart = computed(() => {
  return props.currentTemplate?.name === TEMPLATE_TYPES.CHART_ANALYSIS
})

/** colorOptions - 计算属性 */

const colorOptions = computed(() => [
  { id: 'professional', name: '专业蓝', preview: 'linear-gradient(45deg, #007BFF, #0056B3)' },
  { id: 'elegant', name: '优雅灰', preview: 'linear-gradient(45deg, #6C757D, #495057)' },
  { id: 'vibrant', name: '活力橙', preview: 'linear-gradient(45deg, #FD7E14, #E8590C)' },
  { id: 'nature', name: '自然绿', preview: 'linear-gradient(45deg, #28A745, #1E7E34)' },
  { id: 'royal', name: '皇家紫', preview: 'linear-gradient(45deg, #6F42C1, #5A359A)' },
  { id: 'sunset', name: '日落红', preview: 'linear-gradient(45deg, #DC3545, #BD2130)' }
])

/** smartSuggestions - 计算属性 */

const smartSuggestions = computed(() => {
  const suggestions = []

  // 基于调整内容的智能建议
  if (!adjustments.value.title.trim()) {
    suggestions.push({
      type: 'warning',
      message: '建议添加标题，让内容更清晰明了'
    })
  }

  if (adjustments.value.size < 20) {
    suggestions.push({
      type: 'info',
      message: '当前尺寸较小，建议适当调大以提高可读性'
    })
  }

  if (adjustments.value.duration > 10) {
    suggestions.push({
      type: 'info',
      message: '显示时间较长，建议控制在5-8秒以保持节奏'
    })
  }

  if (isChart.value && adjustments.value.chartData.length < 3) {
    suggestions.push({
      type: 'warning',
      message: '图表数据点较少，建议至少添加3个数据点'
    })
  }

  return suggestions
})

// 颜色主题选择
const selectColorTheme = themeId => {
  adjustments.value.colorTheme = themeId
  onAdjustmentChange()
}

// 内容行管理
const addContentLine = () => {
  if (adjustments.value.contentLines.length < 5) {
    adjustments.value.contentLines.push('')
    onAdjustmentChange()
  }
}

const removeContentLine = index => {
  if (adjustments.value.contentLines.length > 1) {
    adjustments.value.contentLines.splice(index, 1)
    onAdjustmentChange()
  }
}

// 图表数据管理
const addDataPoint = () => {
  if (adjustments.value.chartData.length < 8) {
    adjustments.value.chartData.push({
      label: `数据${adjustments.value.chartData.length + 1}`,
      value: 0
    })
    onAdjustmentChange()
  }
}

const removeDataPoint = index => {
  if (adjustments.value.chartData.length > 2) {
    adjustments.value.chartData.splice(index, 1)
    onAdjustmentChange()
  }
}

// 素材管理
const beforeUpload = file => {
  const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/')
  const isValidSize = file.size / 1024 / 1024 < 10 // 10MB

  if (!isValidType) {
    ElMessage.error('只支持上传图片或视频文件')
    return false
  }

  if (!isValidSize) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }

  isUploading.value = true
  return true
}

/**


 * onUploadSuccess 函数


 * VidSlide AI 功能实现


 */

const onUploadSuccess = (response, file) => {
  isUploading.value = false
  currentMaterial.value = {
    name: file.name,
    url: response.url,
    type: file.type.startsWith('image/') ? 'image' : 'video'
  }
  ElMessage.success('素材上传成功')
  emit('material-upload', currentMaterial.value)
}

/**


 * onUploadError 函数


 * VidSlide AI 功能实现


 */

const onUploadError = () => {
  isUploading.value = false
  ElMessage.error('素材上传失败')
}

/**


 * openMaterialLibrary 函数


 * VidSlide AI 功能实现


 */

const openMaterialLibrary = () => {
  emit('material-select')
}

// 调整变化处理
const onAdjustmentChange = () => {
  hasChanges.value = true
  validateAdjustments()
  updatePreview()
  emit('adjustment-change', { ...adjustments.value })
}

// 验证调整
const validateAdjustments = () => {
  validationErrors.value = {}

  // 大小验证
  if (adjustments.value.size < 10 || adjustments.value.size > 100) {
    validationErrors.value.size = '尺寸必须在10%-100%之间'
  }

  // 位置验证（仅画中画）
  if (isPictureInPicture.value) {
    const validPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']
    if (!validPositions.includes(adjustments.value.position)) {
      validationErrors.value.position = '请选择有效的显示位置'
    }
  }

  // 时间验证
  if (adjustments.value.startTime < 0) {
    validationErrors.value.startTime = '开始时间不能为负数'
  }

  if (adjustments.value.duration < 1 || adjustments.value.duration > 30) {
    validationErrors.value.duration = '持续时间必须在1-30秒之间'
  }

  // 使用约束系统进行完整验证
  performConstraintValidation()
}

// 执行约束验证
const performConstraintValidation = () => {
  if (!props.currentTemplate) return

  try {
    const result = constraintSystem.validateAdjustments(
      adjustments.value,
      props.currentTemplate.name,
      {
        videoDuration: props.videoDuration,
        contentType: detectContentType()
      }
    )

    validationResult.value = result
  } catch (error) {
    console.error('约束验证失败:', error)
    validationResult.value = {
      isValid: false,
      violations: [{ message: '验证过程出错，请检查调整参数' }],
      warnings: [],
      suggestions: [],
      score: 0
    }
  }
}

// 检测内容类型
const detectContentType = () => {
  const content = adjustments.value.title + ' ' + adjustments.value.subtitle
  if (content.includes('数据') || content.includes('统计')) return 'analytics'
  if (content.includes('发展') || content.includes('历史')) return 'progress'
  if (content.includes('对比') || content.includes('比较')) return 'comparison'
  if (content.includes('重要') || content.includes('核心')) return 'emphasis'
  return 'general'
}

// 应用更改
const applyChanges = async () => {
  if (!hasChanges.value) return

  isApplying.value = true

  try {
    // 验证最终调整
    validateAdjustments()

    if (Object.keys(validationErrors.value).length > 0) {
      ElMessage.warning('存在验证错误，请检查并修正')
      return
    }

    // 应用更改
    emit('apply-changes', {
      template: props.currentTemplate,
      adjustments: { ...adjustments.value },
      complianceScore: complianceScore.value
    })

    hasChanges.value = false
    ElMessage.success('调整已应用')
  } catch (error) {
    console.error('应用调整失败:', error)
    ElMessage.error('应用调整失败，请重试')
  } finally {
    isApplying.value = false
  }
}

// 实时预览
const updatePreview = async () => {
  if (!previewCanvas.value || !props.currentTemplate) return

  isPreviewLoading.value = true

  try {
    // 这里应该调用模板引擎进行预览渲染
    // 暂时使用简单的占位符渲染
    const ctx = previewCanvas.value.getContext('2d')

    // 清空画布
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, previewSize.value.width, previewSize.value.height)

    // 绘制预览边框
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, previewSize.value.width, previewSize.value.height)

    // 绘制调整信息
    ctx.fillStyle = '#666'
    ctx.font = '12px Arial'
    ctx.fillText(`模板: ${props.currentTemplate.name}`, 10, 20)
    ctx.fillText(`尺寸: ${adjustments.value.size}%`, 10, 35)
    ctx.fillText(`位置: ${adjustments.value.position}`, 10, 50)
    ctx.fillText(`标题: ${adjustments.value.title || '无'}`, 10, 65)
  } catch (error) {
    console.error('预览更新失败:', error)
  } finally {
    isPreviewLoading.value = false
  }
}

// 工具函数
const formatTime = seconds => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 快速修复处理
const handleQuickFix = fixUpdates => {
  // 应用快速修复
  Object.assign(adjustments.value, fixUpdates)
  hasChanges.value = true
  validateAdjustments()
  updatePreview()
  emit('adjustment-change', { ...adjustments.value })
}

// 验证请求处理
const requestValidation = () => {
  validateAdjustments()
}

// 初始化
const initializePanel = () => {
  // 从初始调整数据恢复
  if (props.initialAdjustments) {
    Object.assign(adjustments.value, props.initialAdjustments)
  }

  // 初始化验证
  validateAdjustments()

  // 初始预览
  updatePreview()
}

// 监听变化
watch(
  () => props.currentTemplate,
  () => {
    initializePanel()
  },
  { immediate: true }
)

watch(
  () => props.initialAdjustments,
  newAdjustments => {
    if (newAdjustments) {
      Object.assign(adjustments.value, newAdjustments)
      validateAdjustments()
      updatePreview()
    }
  },
  { deep: true }
)

onMounted(() => {
  initializePanel()
})

onUnmounted(() => {
  // 清理资源
})
</script>

<style scoped>
.user-adjustment-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.setting-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.color-option:hover {
  border-color: #007bff;
}

.color-option.active {
  border-color: #007bff;
  background: #f0f8ff;
}

.color-preview {
  width: 40px;
  height: 24px;
  border-radius: 3px;
  margin-bottom: 4px;
}

.color-name {
  font-size: 11px;
  color: #606266;
}

.content-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.content-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-data-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-point {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-material {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 80px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
}

.material-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}

.material-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #909399;
}

.no-material {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #c0c4cc;
}

.material-actions {
  display: flex;
  gap: 8px;
}

.time-display {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.error-tip {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
}

.size-display {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.preview-section {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.preview-canvas {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 225px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.preview-canvas-element {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-loading {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 12px;
}

.suggestions-section {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  background: #fefefe;
}

.suggestions-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #e6a23c;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  font-size: 12px;
}

/* 无障碍辅助样式 */
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

/* 焦点样式增强 */
.setting-item input:focus,
.setting-item .el-select:focus,
.setting-item .el-slider:focus {
  outline: 2px solid #007aff;
  outline-offset: 2px;
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .setting-label {
    font-weight: 700;
  }

  .panel-section {
    border-width: 2px;
  }

  .setting-item input:focus,
  .setting-item .el-select:focus,
  .setting-item .el-slider:focus {
    outline-width: 3px;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .panel-actions {
    width: 100%;
    justify-content: space-between;
  }

  .color-palette {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-line,
  .data-point {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .material-actions {
    flex-direction: column;
  }

  .preview-canvas {
    height: 180px;
  }
}
</style>
