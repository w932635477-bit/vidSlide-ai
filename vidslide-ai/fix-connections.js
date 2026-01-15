/**
 * VidSlide AI - 连接修复脚本
 * 修复UI界面与核心功能的连接问题
 */

console.log('🔧 开始修复VidSlide AI功能连接...\n')

// 修复1: 确保VideoEditorView正确导入和使用服务
console.log('1️⃣ 修复VideoEditorView的服务连接...')

// 检查TemplateRenderer的renderTemplate方法调用
const templateRendererFix = `
// 在VideoEditorView.vue中添加完整的服务调用
import TemplateRenderer from '@/utils/TemplateRenderer.js'
import MaterialService from '@/services/MaterialService.js'

const templateRenderer = ref(null)
const materialService = ref(null)

// 初始化服务
onMounted(async () => {
  try {
    // 初始化TemplateRenderer
    templateRenderer.value = new TemplateRenderer(canvasRef.value)
    await templateRenderer.value.initialize()

    // 初始化MaterialService
    materialService.value = new MaterialService()
    await materialService.value.initialize()

    console.log('✅ 服务初始化成功')
  } catch (error) {
    console.error('❌ 服务初始化失败:', error)
  }
})

// 修复handleTemplateSelected方法
const handleTemplateSelected = async (template) => {
  console.log('🎨 模板选择:', template)

  selectedTemplate.value = template

  // 立即调用TemplateRenderer渲染模板
  if (templateRenderer.value) {
    try {
      const templateData = {
        videoUrl: videoSrc.value,
        template: template,
        adjustments: adjustmentParams.value
      }

      await templateRenderer.value.renderTemplate(template, templateData, {
        mode: 'editor',
        quality: 'high'
      })

      console.log('✅ 模板渲染成功')
    } catch (error) {
      console.error('❌ 模板渲染失败:', error)
    }
  }
}

// 修复handleAdjustmentChanged方法
const handleAdjustmentChanged = async (adjustments) => {
  console.log('⚙️ 参数调整:', adjustments)

  adjustmentParams.value = { ...adjustmentParams.value, ...adjustments }

  // 重新渲染模板
  if (templateRenderer.value && selectedTemplate.value) {
    try {
      const templateData = {
        videoUrl: videoSrc.value,
        template: selectedTemplate.value,
        adjustments: adjustmentParams.value
      }

      await templateRenderer.value.renderTemplate(selectedTemplate.value, templateData, {
        mode: 'editor',
        quality: 'high'
      })

      console.log('✅ 参数调整渲染成功')
    } catch (error) {
      console.error('❌ 参数调整渲染失败:', error)
    }
  }
}
`

console.log('✅ VideoEditorView修复代码已生成')
console.log(templateRendererFix.substring(0, 200) + '...\n')

// 修复2: 确保TemplateSelector正确发出事件
console.log('2️⃣ 检查TemplateSelector事件发出...')

const templateSelectorFix = `
// 在TemplateSelector.vue中确保正确的事件发出
const selectTemplate = (template) => {
  selectedTemplate.value = template

  // 确保发出template-selected事件
  emit('template-selected', template)

  console.log('🎯 TemplateSelector发出事件:', template)
}

// 在template中使用正确的语法
<template>
  <div
    v-for="template in templates"
    :key="template.id"
    class="template-card"
    @click="selectTemplate(template)"
  >
    <!-- 模板内容 -->
  </div>
</template>
`

console.log('✅ TemplateSelector修复代码已生成\n')

// 修复3: 确保UserAdjustmentPanel正确发出事件
console.log('3️⃣ 检查UserAdjustmentPanel事件发出...')

const adjustmentPanelFix = `
// 在UserAdjustmentPanel.vue中确保参数变化时发出事件
const updateParameter = (param, value) => {
  adjustments.value[param] = value

  // 发出adjustment-changed事件
  emit('adjustment-changed', adjustments.value)

  console.log('⚙️ UserAdjustmentPanel参数更新:', param, value)
}

// 在template中使用v-model和@input
<template>
  <div class="adjustment-panel">
    <div class="adjustment-item">
      <label>大小</label>
      <input
        type="range"
        min="50"
        max="200"
        :value="adjustments.size"
        @input="updateParameter('size', parseInt($event.target.value))"
      />
      <span>{{ adjustments.size }}%</span>
    </div>
  </div>
</template>
`

console.log('✅ UserAdjustmentPanel修复代码已生成\n')

// 修复4: 确保PictureInPicture组件正确集成
console.log('4️⃣ 检查PictureInPicture组件集成...')

const pipFix = `
// 在VideoEditorView.vue中正确使用PictureInPicture组件
<template>
  <div v-if="pipEnabled" class="pip-container">
    <PictureInPicture
      :video-element="videoElement"
      :pip-element="pipElement"
      :pip-settings="pipSettings"
      @pip-updated="handlePipUpdated"
    />
  </div>
</template>

// 确保pipEnabled状态正确管理
const pipEnabled = computed(() => {
  return selectedTemplate.value?.id === 'pip' ||
         (selectedTemplate.value && pipSettings.value.enabled)
})

// 处理PIP更新事件
const handlePipUpdated = (settings) => {
  pipSettings.value = { ...pipSettings.value, ...settings }

  // 通知TemplateRenderer更新PIP效果
  if (templateRenderer.value) {
    templateRenderer.value.updatePipEffect(settings)
  }
}
`

console.log('✅ PictureInPicture修复代码已生成\n')

// 修复5: 确保导出功能连接
console.log('5️⃣ 检查导出功能连接...')

const exportFix = `
// 在VideoEditorView.vue中添加导出功能
import VideoExporter from '@/utils/videoExporter.js'

const videoExporter = ref(null)

// 初始化导出器
onMounted(async () => {
  videoExporter.value = new VideoExporter()
  await videoExporter.value.initialize()
})

// 处理导出
const handleExport = async () => {
  if (!videoExporter.value || !selectedTemplate.value) {
    console.error('❌ 导出条件不满足')
    return
  }

  try {
    const exportData = {
      videoUrl: videoSrc.value,
      template: selectedTemplate.value,
      adjustments: adjustmentParams.value,
      pipSettings: pipSettings.value
    }

    await videoExporter.value.exportVideo(exportData, {
      format: 'mp4',
      quality: 'high'
    })

    console.log('✅ 导出成功')
  } catch (error) {
    console.error('❌ 导出失败:', error)
  }
}
`

console.log('✅ 导出功能修复代码已生成\n')

console.log('🎯 所有连接修复代码已生成完毕！')
console.log('请按照以下步骤应用修复：')
console.log('1. 将templateRendererFix应用到VideoEditorView.vue')
console.log('2. 将templateSelectorFix应用到TemplateSelector.vue')
console.log('3. 将adjustmentPanelFix应用到UserAdjustmentPanel.vue')
console.log('4. 将pipFix应用到VideoEditorView.vue')
console.log('5. 将exportFix应用到VideoEditorView.vue')
