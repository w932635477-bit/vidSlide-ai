<template>
  <div class="template-custom-editor">
    <!-- 头部 -->
    <EditorHeader
      :show-preview="showPreview"
      :has-changes="hasChanges"
      @toggle-preview="togglePreview"
      @save="saveTemplate"
      @show-load="showLoadDialog = true"
      @export="exportTemplate"
    />

    <!-- 编辑模式 -->
    <div v-if="!showPreview" class="editor-content">
      <EditorSidebar
        :elements="availableElements"
        :theme="templateData.theme"
        @drag-start="onDragStart"
        @update-theme="updateTheme"
      />

      <EditorCanvas
        :slides="templateData.slides"
        :active-slide-index="activeSlideIndex"
        :selected-element="selectedElement"
        @add-slide="addNewSlide"
        @select-slide="setActiveSlide"
        @move-slide-up="moveSlideUp"
        @move-slide-down="moveSlideDown"
        @delete-slide="deleteSlide"
        @drop="onDrop"
        @select-element="selectElement"
        @edit-element="editElement"
        @delete-element="deleteElement"
        @start-resize="startResize"
      />

      <EditorProperties
        :active-slide-index="activeSlideIndex"
        :slide="templateData.slides[activeSlideIndex]"
        :selected-element="selectedElement"
        @update-slide="updateSlideProperty"
        @update-element="updateElementProperty"
      />
    </div>

    <!-- 预览模式 -->
    <EditorPreview
      v-else
      :slides="templateData.slides"
      :current-slide-index="currentSlideIndex"
      @prev-slide="prevSlide"
      @next-slide="nextSlide"
    />

    <!-- 加载模板对话框 -->
    <LoadTemplateDialog
      :show="showLoadDialog"
      :templates="savedTemplates"
      @close="showLoadDialog = false"
      @load="loadTemplate"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import EditorHeader from './template-editor/EditorHeader.vue'
import EditorSidebar from './template-editor/EditorSidebar.vue'
import EditorCanvas from './template-editor/EditorCanvas.vue'
import EditorProperties from './template-editor/EditorProperties.vue'
import EditorPreview from './template-editor/EditorPreview.vue'
import LoadTemplateDialog from './template-editor/LoadTemplateDialog.vue'

/**
 * 模板自定义编辑器（重构版）
 * 功能：幻灯片编辑、元素拖拽、样式配置、预览、保存/加载/导出
 */

const emit = defineEmits([
  'template-saved',
  'template-loaded',
  'template-exported',
  'theme-changed'
])

// 状态
const templateData = ref({
  name: '新模板',
  theme: {
    primaryColor: '#007aff',
    backgroundColor: '#ffffff',
    fontFamily: 'PingFang SC, -apple-system',
    borderRadius: 8
  },
  slides: [{ background: '#ffffff', transition: 'fade', elements: [] }]
})

const showPreview = ref(false)
const showLoadDialog = ref(false)
const activeSlideIndex = ref(0)
const currentSlideIndex = ref(0)
const selectedElement = ref(null)
const savedTemplates = ref([])
const hasChanges = ref(false)
const isResizing = ref(false)
const resizeData = ref(null)

// 可用元素
const availableElements = ref([
  {
    type: 'text',
    name: '文本',
    description: '添加文本内容',
    icon: '📝',
    defaultProps: {
      content: '输入文本内容',
      fontSize: 24,
      color: '#1d1d1f',
      fontWeight: 'normal',
      textAlign: 'left'
    }
  },
  {
    type: 'image',
    name: '图片',
    description: '添加图片元素',
    icon: '🖼️',
    defaultProps: {
      src: '',
      alt: '图片',
      objectFit: 'cover'
    }
  },
  {
    type: 'shape',
    name: '形状',
    description: '添加几何形状',
    icon: '🔷',
    defaultProps: {
      shape: 'rectangle',
      fill: '#007aff',
      stroke: '#007aff',
      strokeWidth: 2
    }
  },
  {
    type: 'chart',
    name: '图表',
    description: '添加数据图表',
    icon: '📊',
    defaultProps: {
      type: 'bar',
      data: [],
      colors: ['#007aff', '#34c759', '#ff9f0a']
    }
  }
])

// 方法
const togglePreview = () => {
  showPreview.value = !showPreview.value
  if (showPreview.value) {
    currentSlideIndex.value = 0
  }
}

const addNewSlide = () => {
  templateData.value.slides.push({
    background: '#ffffff',
    transition: 'fade',
    elements: []
  })
  activeSlideIndex.value = templateData.value.slides.length - 1
  hasChanges.value = true
}

const setActiveSlide = index => {
  activeSlideIndex.value = index
  selectedElement.value = null
}

const deleteSlide = index => {
  if (templateData.value.slides.length > 1) {
    templateData.value.slides.splice(index, 1)
    if (activeSlideIndex.value >= templateData.value.slides.length) {
      activeSlideIndex.value = templateData.value.slides.length - 1
    }
    hasChanges.value = true
  }
}

const moveSlideUp = index => {
  if (index > 0) {
    const temp = templateData.value.slides[index]
    templateData.value.slides[index] = templateData.value.slides[index - 1]
    templateData.value.slides[index - 1] = temp
    activeSlideIndex.value = index - 1
    hasChanges.value = true
  }
}

const moveSlideDown = index => {
  if (index < templateData.value.slides.length - 1) {
    const temp = templateData.value.slides[index]
    templateData.value.slides[index] = templateData.value.slides[index + 1]
    templateData.value.slides[index + 1] = temp
    activeSlideIndex.value = index + 1
    hasChanges.value = true
  }
}

const onDragStart = (event, element) => {
  event.dataTransfer.setData('application/json', JSON.stringify(element))
}

const onDrop = (event, slideIndex) => {
  event.preventDefault()
  try {
    const elementData = JSON.parse(event.dataTransfer.getData('application/json'))
    const rect = event.currentTarget.getBoundingClientRect()

    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    const newElement = {
      type: elementData.type,
      x: Math.max(0, Math.min(90, x)),
      y: Math.max(0, Math.min(90, y)),
      width: 30,
      height: 20,
      ...elementData.defaultProps
    }

    templateData.value.slides[slideIndex].elements.push(newElement)
    hasChanges.value = true
  } catch (error) {
    console.error('Drop error:', error)
  }
}

const selectElement = (slideIndex, elementIndex) => {
  selectedElement.value = {
    slideIndex,
    elementIndex,
    element: templateData.value.slides[slideIndex].elements[elementIndex]
  }
}

const deleteElement = (slideIndex, elementIndex) => {
  templateData.value.slides[slideIndex].elements.splice(elementIndex, 1)
  selectedElement.value = null
  hasChanges.value = true
}

const editElement = element => {
  console.log('Edit element:', element)
}

const startResize = (event, element, handle) => {
  isResizing.value = true
  resizeData.value = {
    element,
    handle,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: element.width,
    startHeight: element.height,
    startElemX: element.x,
    startElemY: element.y
  }

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

const handleResize = event => {
  if (!isResizing.value || !resizeData.value) return

  const deltaX = event.clientX - resizeData.value.startX
  const deltaY = event.clientY - resizeData.value.startY

  const element = resizeData.value.element
  let newWidth = resizeData.value.startWidth
  let newHeight = resizeData.value.startHeight
  let newX = resizeData.value.startElemX
  let newY = resizeData.value.startElemY

  switch (resizeData.value.handle) {
    case 'se':
      newWidth = Math.max(10, resizeData.value.startWidth + deltaX / 4)
      newHeight = Math.max(10, resizeData.value.startHeight + deltaY / 3)
      break
    case 'sw':
      newWidth = Math.max(10, resizeData.value.startWidth - deltaX / 4)
      newHeight = Math.max(10, resizeData.value.startHeight + deltaY / 3)
      newX = resizeData.value.startElemX + deltaX / 4
      break
    case 'ne':
      newWidth = Math.max(10, resizeData.value.startWidth + deltaX / 4)
      newHeight = Math.max(10, resizeData.value.startHeight - deltaY / 3)
      newY = resizeData.value.startElemY + deltaY / 3
      break
    case 'nw':
      newWidth = Math.max(10, resizeData.value.startWidth - deltaX / 4)
      newHeight = Math.max(10, resizeData.value.startHeight - deltaY / 3)
      newX = resizeData.value.startElemX + deltaX / 4
      newY = resizeData.value.startElemY + deltaY / 3
      break
  }

  element.width = Math.min(100, Math.max(10, newWidth))
  element.height = Math.min(100, Math.max(10, newHeight))
  element.x = Math.min(90, Math.max(0, newX))
  element.y = Math.min(80, Math.max(0, newY))

  hasChanges.value = true
}

const stopResize = () => {
  isResizing.value = false
  resizeData.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

const updateTheme = (property, value) => {
  templateData.value.theme[property] = value
  hasChanges.value = true
  emit('theme-changed', templateData.value.theme)
}

const updateSlideProperty = (slideIndex, property, value) => {
  templateData.value.slides[slideIndex][property] = value
  hasChanges.value = true
}

const updateElementProperty = (property, value) => {
  if (selectedElement.value) {
    selectedElement.value.element[property] = value
    hasChanges.value = true
  }
}

const prevSlide = () => {
  if (currentSlideIndex.value > 0) {
    currentSlideIndex.value--
  }
}

const nextSlide = () => {
  if (currentSlideIndex.value < templateData.value.slides.length - 1) {
    currentSlideIndex.value++
  }
}

const saveTemplate = () => {
  const templateToSave = {
    ...templateData.value,
    updatedAt: new Date().toISOString()
  }

  const saved = JSON.parse(localStorage.getItem('vidslide-templates') || '[]')
  const existingIndex = saved.findIndex(t => t.name === templateToSave.name)

  if (existingIndex >= 0) {
    saved[existingIndex] = templateToSave
  } else {
    saved.push(templateToSave)
  }

  localStorage.setItem('vidslide-templates', JSON.stringify(saved))
  loadSavedTemplates()

  hasChanges.value = false
  emit('template-saved', templateToSave)
}

const loadTemplate = template => {
  templateData.value = { ...template }
  showLoadDialog.value = false
  activeSlideIndex.value = 0
  selectedElement.value = null
  currentSlideIndex.value = 0
  hasChanges.value = false

  emit('template-loaded', template)
}

const exportTemplate = () => {
  const templateJson = JSON.stringify(templateData.value, null, 2)
  const blob = new Blob([templateJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${templateData.value.name || 'template'}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  emit('template-exported', templateData.value)
}

const loadSavedTemplates = () => {
  try {
    savedTemplates.value = JSON.parse(localStorage.getItem('vidslide-templates') || '[]')
  } catch (error) {
    console.error('Failed to load saved templates:', error)
    savedTemplates.value = []
  }
}

const handleKeydown = event => {
  if (selectedElement.value && !showPreview.value) {
    const element = selectedElement.value.element
    const step = event.shiftKey ? 10 : 1

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        element.y = Math.max(0, element.y - step)
        hasChanges.value = true
        break
      case 'ArrowDown':
        event.preventDefault()
        element.y = Math.min(90, element.y + step)
        hasChanges.value = true
        break
      case 'ArrowLeft':
        event.preventDefault()
        element.x = Math.max(0, element.x - step)
        hasChanges.value = true
        break
      case 'ArrowRight':
        event.preventDefault()
        element.x = Math.min(90, element.x + step)
        hasChanges.value = true
        break
      case 'Delete':
      case 'Backspace':
        if (selectedElement.value) {
          event.preventDefault()
          deleteElement(selectedElement.value.slideIndex, selectedElement.value.elementIndex)
        }
        break
    }
  }
}

watch(
  templateData,
  () => {
    hasChanges.value = true
  },
  { deep: true }
)

onMounted(() => {
  loadSavedTemplates()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  stopResize()
})
</script>

<style scoped>
.template-custom-editor {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 1400px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.editor-content {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 24px;
  height: 600px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (max-width: 1200px) {
  .editor-content {
    grid-template-columns: 250px 1fr 250px;
  }
}

@media (max-width: 768px) {
  .editor-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    height: auto;
  }
}
</style>
