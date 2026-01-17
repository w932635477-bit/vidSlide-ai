<template>
  <div class="template-custom-editor">
    <div class="editor-header">
      <h3>模板自定义编辑器</h3>
      <div class="header-actions">
        <button class="preview-btn" @click="togglePreview" :class="{ active: showPreview }">
          {{ showPreview ? '编辑模式' : '预览模式' }}
        </button>
        <button class="save-btn" @click="saveTemplate" :disabled="!hasChanges">
          保存模板
        </button>
        <button class="load-btn" @click="showLoadDialog = true">
          加载模板
        </button>
        <button class="export-btn" @click="exportTemplate">
          导出模板
        </button>
      </div>
    </div>

    <div class="editor-content" v-if="!showPreview">
      <div class="editor-sidebar">
        <div class="sidebar-section">
          <h4>模板元素</h4>
          <div class="element-palette">
            <div
              v-for="element in availableElements"
              :key="element.type"
              class="element-item"
              draggable="true"
              @dragstart="onDragStart($event, element)"
            >
              <div class="element-icon">{{ element.icon }}</div>
              <div class="element-info">
                <div class="element-name">{{ element.name }}</div>
                <div class="element-desc">{{ element.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h4>全局样式</h4>
          <div class="style-controls">
            <div class="style-group">
              <label class="style-label">主题色</label>
              <input
                type="color"
                v-model="templateData.theme.primaryColor"
                @input="updateGlobalStyles"
                class="color-input"
              />
            </div>
            <div class="style-group">
              <label class="style-label">背景色</label>
              <input
                type="color"
                v-model="templateData.theme.backgroundColor"
                @input="updateGlobalStyles"
                class="color-input"
              />
            </div>
            <div class="style-group">
              <label class="style-label">字体</label>
              <select v-model="templateData.theme.fontFamily" @change="updateGlobalStyles">
                <option value="PingFang SC, -apple-system">苹方</option>
                <option value="Helvetica Neue, Arial">Helvetica</option>
                <option value="Microsoft YaHei">微软雅黑</option>
                <option value="SimSun">宋体</option>
              </select>
            </div>
            <div class="style-group">
              <label class="style-label">圆角半径</label>
              <input
                type="range"
                min="0"
                max="20"
                v-model="templateData.theme.borderRadius"
                @input="updateGlobalStyles"
                class="range-input"
              />
              <span class="range-value">{{ templateData.theme.borderRadius }}px</span>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-canvas">
        <div class="canvas-header">
          <h4>模板结构</h4>
          <div class="canvas-actions">
            <button class="add-slide-btn" @click="addNewSlide">
              添加幻灯片
            </button>
          </div>
        </div>

        <div class="slides-container">
          <div
            v-for="(slide, slideIndex) in templateData.slides"
            :key="slideIndex"
            class="slide-item"
            :class="{ active: activeSlideIndex === slideIndex }"
            @click="setActiveSlide(slideIndex)"
          >
            <div class="slide-header">
              <span class="slide-title">幻灯片 {{ slideIndex + 1 }}</span>
              <div class="slide-actions">
                <button class="move-up-btn" @click.stop="moveSlideUp(slideIndex)" :disabled="slideIndex === 0">
                  ↑
                </button>
                <button class="move-down-btn" @click.stop="moveSlideDown(slideIndex)" :disabled="slideIndex === templateData.slides.length - 1">
                  ↓
                </button>
                <button class="delete-slide-btn" @click.stop="deleteSlide(slideIndex)" :disabled="templateData.slides.length <= 1">
                  ✕
                </button>
              </div>
            </div>

            <div class="slide-canvas" @drop="onDrop($event, slideIndex)" @dragover.prevent>
              <div
                v-for="(element, elementIndex) in slide.elements"
                :key="elementIndex"
                class="canvas-element"
                :class="{ selected: selectedElement?.slideIndex === slideIndex && selectedElement?.elementIndex === elementIndex }"
                @click.stop="selectElement(slideIndex, elementIndex)"
                :style="getElementStyles(element)"
              >
                <div class="element-content" v-html="renderElementContent(element)"></div>
                <div class="element-overlay" v-if="selectedElement?.slideIndex === slideIndex && selectedElement?.elementIndex === elementIndex">
                  <div class="element-actions">
                    <button class="edit-element-btn" @click.stop="editElement(element)">编辑</button>
                    <button class="delete-element-btn" @click.stop="deleteElement(slideIndex, elementIndex)">删除</button>
                  </div>
                  <div class="resize-handles">
                    <div class="resize-handle nw" @mousedown="startResize($event, element, 'nw')"></div>
                    <div class="resize-handle ne" @mousedown="startResize($event, element, 'ne')"></div>
                    <div class="resize-handle sw" @mousedown="startResize($event, element, 'sw')"></div>
                    <div class="resize-handle se" @mousedown="startResize($event, element, 'se')"></div>
                  </div>
                </div>
              </div>

              <div class="drop-zone" v-if="slide.elements.length === 0">
                <div class="drop-zone-text">拖拽元素到此处</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-properties">
        <div class="properties-panel">
          <h4>属性面板</h4>

          <!-- 幻灯片属性 -->
          <div v-if="activeSlideIndex !== null && !selectedElement" class="property-section">
            <h5>幻灯片属性</h5>
            <div class="property-group">
              <label class="property-label">背景</label>
              <input
                type="color"
                v-model="templateData.slides[activeSlideIndex].background"
                @input="updateSlideProperty(activeSlideIndex, 'background', $event.target.value)"
              />
            </div>
            <div class="property-group">
              <label class="property-label">过渡效果</label>
              <select v-model="templateData.slides[activeSlideIndex].transition" @change="updateSlideProperty(activeSlideIndex, 'transition', $event.target.value)">
                <option value="fade">淡入淡出</option>
                <option value="slide">滑动</option>
                <option value="zoom">缩放</option>
                <option value="none">无</option>
              </select>
            </div>
          </div>

          <!-- 元素属性 -->
          <div v-if="selectedElement" class="property-section">
            <h5>元素属性</h5>
            <div class="property-group">
              <label class="property-label">类型</label>
              <span class="property-value">{{ selectedElement.element.type }}</span>
            </div>

            <div class="property-group">
              <label class="property-label">位置 X</label>
              <input
                type="number"
                v-model="selectedElement.element.x"
                @input="updateElementPosition"
                min="0"
                max="100"
              />
            </div>

            <div class="property-group">
              <label class="property-label">位置 Y</label>
              <input
                type="number"
                v-model="selectedElement.element.y"
                @input="updateElementPosition"
                min="0"
                max="100"
              />
            </div>

            <div class="property-group">
              <label class="property-label">宽度</label>
              <input
                type="number"
                v-model="selectedElement.element.width"
                @input="updateElementSize"
                min="10"
                max="100"
              />
            </div>

            <div class="property-group">
              <label class="property-label">高度</label>
              <input
                type="number"
                v-model="selectedElement.element.height"
                @input="updateElementSize"
                min="10"
                max="100"
              />
            </div>

            <!-- 文本元素特有属性 -->
            <div v-if="selectedElement.element.type === 'text'" class="property-group">
              <label class="property-label">文本内容</label>
              <textarea
                v-model="selectedElement.element.content"
                @input="updateElementContent"
                rows="3"
              ></textarea>
            </div>

            <div v-if="selectedElement.element.type === 'text'" class="property-group">
              <label class="property-label">字体大小</label>
              <input
                type="number"
                v-model="selectedElement.element.fontSize"
                @input="updateElementStyle"
                min="12"
                max="72"
              />
            </div>

            <div v-if="selectedElement.element.type === 'text'" class="property-group">
              <label class="property-label">字体颜色</label>
              <input
                type="color"
                v-model="selectedElement.element.color"
                @input="updateElementStyle"
              />
            </div>

            <!-- 图片元素特有属性 -->
            <div v-if="selectedElement.element.type === 'image'" class="property-group">
              <label class="property-label">图片URL</label>
              <input
                type="text"
                v-model="selectedElement.element.src"
                @input="updateElementContent"
                placeholder="输入图片URL"
              />
            </div>

            <div v-if="selectedElement.element.type === 'image'" class="property-group">
              <label class="property-label">适应方式</label>
              <select v-model="selectedElement.element.objectFit" @change="updateElementStyle">
                <option value="cover">覆盖</option>
                <option value="contain">包含</option>
                <option value="fill">填充</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览模式 -->
    <div class="preview-content" v-else>
      <div class="preview-controls">
        <button class="prev-slide-btn" @click="prevSlide" :disabled="currentSlideIndex === 0">
          ← 上一页
        </button>
        <span class="slide-counter">{{ currentSlideIndex + 1 }} / {{ templateData.slides.length }}</span>
        <button class="next-slide-btn" @click="nextSlide" :disabled="currentSlideIndex === templateData.slides.length - 1">
          下一页 →
        </button>
      </div>

      <div class="preview-canvas">
        <div
          class="preview-slide"
          v-for="(slide, index) in templateData.slides"
          :key="index"
          :style="{ background: slide.background }"
          v-show="index === currentSlideIndex"
        >
          <div
            v-for="(element, elementIndex) in slide.elements"
            :key="elementIndex"
            class="preview-element"
            :style="getElementStyles(element)"
          >
            <div class="element-content" v-html="renderElementContent(element)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载模板对话框 -->
    <div v-if="showLoadDialog" class="modal-overlay" @click="showLoadDialog = false">
      <div class="modal-content" @click.stop>
        <h4>加载模板</h4>
        <div class="template-list">
          <div
            v-for="(template, index) in savedTemplates"
            :key="index"
            class="template-item"
            @click="loadTemplate(template)"
          >
            <div class="template-name">{{ template.name }}</div>
            <div class="template-meta">
              {{ template.slides.length }} 页 · {{ new Date(template.updatedAt).toLocaleDateString() }}
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showLoadDialog = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// 组件状态
const templateData = ref({
  name: '新模板',
  theme: {
    primaryColor: '#007aff',
    backgroundColor: '#ffffff',
    fontFamily: 'PingFang SC, -apple-system',
    borderRadius: 8
  },
  slides: [
    {
      background: '#ffffff',
      transition: 'fade',
      elements: []
    }
  ]
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

// 计算属性
const currentSlide = computed(() => templateData.value.slides[currentSlideIndex.value])

// ==================== 核心方法 ====================

/**
 * 切换预览模式
 * 在编辑模式和预览模式之间切换
 */
const togglePreview = () => {
  showPreview.value = !showPreview.value
  if (showPreview.value) {
    currentSlideIndex.value = 0
  }
}

/**
 * 添加新幻灯片
 * 在模板末尾添加一个新的空白幻灯片
 */
const addNewSlide = () => {
  templateData.value.slides.push({
    background: '#ffffff',
    transition: 'fade',
    elements: []
  })
  activeSlideIndex.value = templateData.value.slides.length - 1
  hasChanges.value = true
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

const setActiveSlide = (index) => {
  activeSlideIndex.value = index
  selectedElement.value = null
}

const deleteSlide = (index) => {
  if (templateData.value.slides.length > 1) {
    templateData.value.slides.splice(index, 1)
    if (activeSlideIndex.value >= templateData.value.slides.length) {
      activeSlideIndex.value = templateData.value.slides.length - 1
    }
    hasChanges.value = true
  }
}

const moveSlideUp = (index) => {
  if (index > 0) {
    const temp = templateData.value.slides[index]
    templateData.value.slides[index] = templateData.value.slides[index - 1]
    templateData.value.slides[index - 1] = temp
    activeSlideIndex.value = index - 1
    hasChanges.value = true
  }
}

const moveSlideDown = (index) => {
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

/**
 * 处理元素拖拽放下事件
 * @param {DragEvent} event - 拖拽事件对象
 * @param {number} slideIndex - 目标幻灯片索引
 */
const onDrop = (event, slideIndex) => {
  event.preventDefault()
  try {
    const elementData = JSON.parse(event.dataTransfer.getData('application/json'))
    const rect = event.currentTarget.getBoundingClientRect()

    // 计算元素在幻灯片中的相对位置（百分比）
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    // 创建新元素，限制位置在有效范围内
    const newElement = {
      type: elementData.type,
      x: Math.max(0, Math.min(90, x)), // 限制在0-90%范围内
      y: Math.max(0, Math.min(90, y)), // 限制在0-90%范围内
      width: 30,  // 默认宽度30%
      height: 20, // 默认高度20%
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

const editElement = (element) => {
  // 这里可以打开一个编辑对话框
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
    startX: element.x,
    startY: element.y
  }

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

const handleResize = (event) => {
  if (!isResizing.value || !resizeData.value) return

  const deltaX = event.clientX - resizeData.value.startX
  const deltaY = event.clientY - resizeData.value.startY

  const element = resizeData.value.element
  let newWidth = resizeData.value.startWidth
  let newHeight = resizeData.value.startHeight
  let newX = resizeData.value.startX
  let newY = resizeData.value.startY

  switch (resizeData.value.handle) {
    case 'se':
      newWidth = Math.max(10, resizeData.value.startWidth + (deltaX / 4))
      newHeight = Math.max(10, resizeData.value.startHeight + (deltaY / 3))
      break
    case 'sw':
      newWidth = Math.max(10, resizeData.value.startWidth - (deltaX / 4))
      newHeight = Math.max(10, resizeData.value.startHeight + (deltaY / 3))
      newX = resizeData.value.startX + (deltaX / 4)
      break
    case 'ne':
      newWidth = Math.max(10, resizeData.value.startWidth + (deltaX / 4))
      newHeight = Math.max(10, resizeData.value.startHeight - (deltaY / 3))
      newY = resizeData.value.startY + (deltaY / 3)
      break
    case 'nw':
      newWidth = Math.max(10, resizeData.value.startWidth - (deltaX / 4))
      newHeight = Math.max(10, resizeData.value.startHeight - (deltaY / 3))
      newX = resizeData.value.startX + (deltaX / 4)
      newY = resizeData.value.startY + (deltaY / 3)
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

const updateGlobalStyles = () => {
  hasChanges.value = true
  emit('theme-changed', templateData.value.theme)
}

const updateSlideProperty = (slideIndex, property, value) => {
  templateData.value.slides[slideIndex][property] = value
  hasChanges.value = true
}

const updateElementPosition = () => {
  if (selectedElement.value) {
    hasChanges.value = true
  }
}

const updateElementSize = () => {
  if (selectedElement.value) {
    hasChanges.value = true
  }
}

const updateElementContent = () => {
  if (selectedElement.value) {
    hasChanges.value = true
  }
}

const updateElementStyle = () => {
  if (selectedElement.value) {
    hasChanges.value = true
  }
}

const getElementStyles = (element) => {
  return {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    height: `${element.height}%`,
    fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
    color: element.color || undefined,
    fontWeight: element.fontWeight || undefined,
    textAlign: element.textAlign || undefined,
    background: element.fill || undefined,
    border: element.stroke ? `${element.strokeWidth || 1}px solid ${element.stroke}` : undefined,
    borderRadius: element.borderRadius || undefined,
    objectFit: element.objectFit || undefined
  }
}

const renderElementContent = (element) => {
  switch (element.type) {
    case 'text':
      return element.content || '文本内容'
    case 'image':
      return element.src ? `<img src="${element.src}" alt="${element.alt || '图片'}" style="width: 100%; height: 100%; object-fit: ${element.objectFit || 'cover'};">` : '📷 图片占位符'
    case 'shape':
      return getShapeSVG(element)
    case 'chart':
      return '📊 图表占位符'
    default:
      return '未知元素'
  }
}

const getShapeSVG = (element) => {
  const fill = element.fill || '#007aff'
  const stroke = element.stroke || '#007aff'
  const strokeWidth = element.strokeWidth || 2

  switch (element.shape) {
    case 'circle':
      return `<svg width="100%" height="100%" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
      </svg>`
    case 'triangle':
      return `<svg width="100%" height="100%" viewBox="0 0 100 100">
        <polygon points="50,10 90,90 10,90" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
      </svg>`
    default: // rectangle
      return `<svg width="100%" height="100%" viewBox="0 0 100 100">
        <rect x="10" y="10" width="80" height="80" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
      </svg>`
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

  // 保存到本地存储
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

const loadTemplate = (template) => {
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

// 监听变化
watch(templateData, () => {
  hasChanges.value = true
}, { deep: true })

// 生命周期
onMounted(() => {
  loadSavedTemplates()

  // 键盘事件处理
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  stopResize()
})

const handleKeydown = (event) => {
  if (selectedElement.value && !showPreview.value) {
    const element = selectedElement.value.element
    const step = event.shiftKey ? 10 : 1

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        element.y = Math.max(0, element.y - step)
        break
      case 'ArrowDown':
        event.preventDefault()
        element.y = Math.min(90, element.y + step)
        break
      case 'ArrowLeft':
        event.preventDefault()
        element.x = Math.max(0, element.x - step)
        break
      case 'ArrowRight':
        event.preventDefault()
        element.x = Math.min(90, element.x + step)
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

// 事件定义
const emit = defineEmits([
  'template-saved',
  'template-loaded',
  'template-exported',
  'theme-changed'
])
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

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.editor-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.preview-btn,
.save-btn,
.load-btn,
.export-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn {
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.3);
  color: #007aff;
}

.preview-btn.active,
.preview-btn:hover {
  background: #007aff;
  color: white;
}

.save-btn {
  background: #34c759;
  border: 1px solid #34c759;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #28a745;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.load-btn {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.2);
  color: #1d1d1f;
}

.load-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.export-btn {
  background: #ff9f0a;
  border: 1px solid #ff9f0a;
  color: white;
}

.export-btn:hover {
  background: #e08e0b;
}

.editor-content {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 24px;
  height: 600px;
}

.editor-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  overflow-y: auto;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-section h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.element-palette {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: white;
  cursor: grab;
  transition: all 0.2s ease;
}

.element-item:hover {
  border-color: #007aff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.1);
}

.element-item:active {
  cursor: grabbing;
}

.element-icon {
  font-size: 20px;
}

.element-info {
  flex: 1;
}

.element-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 2px;
}

.element-desc {
  font-size: 12px;
  color: #86868b;
}

.style-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.style-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.style-label {
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
}

.color-input {
  width: 100%;
  height: 40px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  cursor: pointer;
}

.style-group select {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  font-size: 13px;
}

.range-input {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.1);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007aff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
}

.range-value {
  font-size: 12px;
  color: #86868b;
  text-align: center;
}

.editor-canvas {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.canvas-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.add-slide-btn {
  padding: 6px 12px;
  background: #007aff;
  border: 1px solid #007aff;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  cursor: pointer;
}

.add-slide-btn:hover {
  background: #0056cc;
}

.slides-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.slide-item {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slide-item:hover {
  border-color: rgba(0, 122, 255, 0.3);
}

.slide-item.active {
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.slide-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.slide-actions {
  display: flex;
  gap: 4px;
}

.move-up-btn,
.move-down-btn,
.delete-slide-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.1);
  color: #1d1d1f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.move-up-btn:hover:not(:disabled),
.move-down-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.2);
}

.delete-slide-btn:hover:not(:disabled) {
  background: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

.move-up-btn:disabled,
.move-down-btn:disabled,
.delete-slide-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slide-canvas {
  position: relative;
  height: 300px;
  background: white;
  overflow: hidden;
}

.canvas-element {
  position: absolute;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  overflow: hidden;
}

.canvas-element:hover {
  border-color: rgba(0, 122, 255, 0.5);
}

.canvas-element.selected {
  border-color: #007aff;
  box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.3);
}

.element-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  overflow: hidden;
}

.element-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 122, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.element-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px;
}

.edit-element-btn,
.delete-element-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.edit-element-btn {
  background: #007aff;
  color: white;
}

.delete-element-btn {
  background: #ff3b30;
  color: white;
}

.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #007aff;
  border-radius: 50%;
  cursor: pointer;
}

.resize-handle.nw { top: -4px; left: -4px; cursor: nw-resize; }
.resize-handle.ne { top: -4px; right: -4px; cursor: ne-resize; }
.resize-handle.sw { bottom: -4px; left: -4px; cursor: sw-resize; }
.resize-handle.se { bottom: -4px; right: -4px; cursor: se-resize; }

.drop-zone {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #86868b;
  pointer-events: none;
}

.drop-zone-text {
  font-size: 14px;
}

.editor-properties {
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  overflow-y: auto;
}

.properties-panel h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.property-section {
  margin-bottom: 24px;
}

.property-section h5 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.property-label {
  font-size: 12px;
  font-weight: 500;
  color: #86868b;
}

.property-value {
  font-size: 13px;
  color: #1d1d1f;
}

.property-group input,
.property-group select,
.property-group textarea {
  padding: 6px 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-size: 13px;
}

.property-group textarea {
  resize: vertical;
  min-height: 60px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.preview-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.prev-slide-btn,
.next-slide-btn {
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.prev-slide-btn:hover:not(:disabled),
.next-slide-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007aff;
}

.prev-slide-btn:disabled,
.next-slide-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slide-counter {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.preview-canvas {
  flex: 1;
  background: #f5f5f7;
  border-radius: 8px;
  overflow: hidden;
}

.preview-slide {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-element {
  position: absolute;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.template-item {
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-item:hover {
  background: rgba(0, 122, 255, 0.05);
  border-color: rgba(0, 122, 255, 0.3);
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.template-meta {
  font-size: 12px;
  color: #86868b;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
}

.cancel-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 响应式设计 */
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

  .editor-sidebar,
  .editor-properties {
    order: 2;
  }

  .editor-canvas {
    order: 1;
  }

  .editor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    flex-wrap: wrap;
  }
}
</style>