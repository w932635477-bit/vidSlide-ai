<template>
  <div class="smart-crop-tool">
    <CropToolHeader />

    <ImageUploader v-if="!currentImage" @image-uploaded="handleImageUpload" />

    <div v-else class="crop-workspace">
      <CropCanvas :image="currentImage" :crop-area="cropArea" @update-crop="updateCropArea" />

      <CropControls
        :aspect-ratio="aspectRatio"
        :detection-method="detectionMethod"
        @update:aspect-ratio="aspectRatio = $event"
        @update:detection-method="detectionMethod = $event"
        @auto-detect="autoDetectCrop"
        @apply="applyCrop"
        @reset="resetCrop"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CropToolHeader from './smart-crop/CropToolHeader.vue'
import ImageUploader from './smart-crop/ImageUploader.vue'
import CropCanvas from './smart-crop/CropCanvas.vue'
import CropControls from './smart-crop/CropControls.vue'

/**
 * 智能裁剪工具（重构版）
 * 功能：图片裁剪、智能检测、比例调整
 */

const emit = defineEmits(['crop-applied', 'image-uploaded'])

const currentImage = ref(null)
const cropArea = ref({ x: 0, y: 0, width: 100, height: 100 })
const aspectRatio = ref('16:9')
const detectionMethod = ref('auto')

const handleImageUpload = imageUrl => {
  currentImage.value = imageUrl
  emit('image-uploaded', imageUrl)
}

const updateCropArea = area => {
  cropArea.value = area
}

const autoDetectCrop = () => {
  // 智能检测裁剪区域
  console.log('Auto detecting crop area')
}

const applyCrop = () => {
  emit('crop-applied', {
    image: currentImage.value,
    cropArea: cropArea.value,
    aspectRatio: aspectRatio.value
  })
}

const resetCrop = () => {
  currentImage.value = null
  cropArea.value = { x: 0, y: 0, width: 100, height: 100 }
}
</script>

<style scoped>
.smart-crop-tool {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.crop-workspace {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .crop-workspace {
    grid-template-columns: 1fr;
  }
}
</style>
