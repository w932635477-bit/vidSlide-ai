<template>
  <div class="color-matcher">
    <ColorMatcherHeader />

    <ImageUploader
      v-if="!uploadedImage"
      @image-uploaded="handleImageUpload"
    />

    <div v-else class="matcher-workspace">
      <ColorToolbar
        :show-palette="showPalette"
        :show-preview="showPreview"
        :palette-size="paletteSize"
        @toggle-palette="showPalette = !showPalette"
        @toggle-preview="showPreview = !showPreview"
        @change-palette-size="paletteSize = $event"
        @extract-colors="extractColors"
        @reset="resetMatcher"
      />

      <div class="workspace-content">
        <div class="image-section">
          <img
            :src="uploadedImage"
            alt="Uploaded image"
            ref="imageElement"
            class="uploaded-image"
            @load="onImageLoad"
          />
        </div>

        <ColorPaletteDisplay
          v-if="showPalette && colorPalette.length > 0"
          :colors="colorPalette"
          :selected-color="selectedColor"
          @select-color="selectColor"
          @copy-color="copyColor"
        />

        <ColorPreview
          v-if="showPreview && selectedColor"
          :color="selectedColor"
          @apply-color="applyColor"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ColorMatcherHeader from './color-matcher/ColorMatcherHeader.vue'
import ImageUploader from './color-matcher/ImageUploader.vue'
import ColorToolbar from './color-matcher/ColorToolbar.vue'
import ColorPaletteDisplay from './color-matcher/ColorPaletteDisplay.vue'
import ColorPreview from './color-matcher/ColorPreview.vue'

/**
 * 颜色匹配器组件（重构版）
 * 功能：图片颜色提取、调色板生成、颜色应用
 */

const emit = defineEmits(['color-applied', 'palette-extracted'])

// 状态
const uploadedImage = ref(null)
const imageElement = ref(null)
const colorPalette = ref([])
const selectedColor = ref(null)
const showPalette = ref(true)
const showPreview = ref(false)
const paletteSize = ref(5)

// 方法
const handleImageUpload = (imageUrl) => {
  uploadedImage.value = imageUrl
}

const onImageLoad = () => {
  extractColors()
}

const extractColors = () => {
  if (!imageElement.value) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = imageElement.value

  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const colors = extractDominantColors(imageData, paletteSize.value)

  colorPalette.value = colors
  emit('palette-extracted', colors)
}

const extractDominantColors = (imageData, count) => {
  const pixels = []
  const data = imageData.data

  for (let i = 0; i < data.length; i += 16) {
    pixels.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2]
    })
  }

  const clusters = kMeansClustering(pixels, count)
  return clusters.map(cluster => ({
    rgb: cluster,
    hex: rgbToHex(cluster.r, cluster.g, cluster.b),
    usage: Math.round(Math.random() * 30 + 10)
  }))
}

const kMeansClustering = (pixels, k) => {
  let centroids = pixels.slice(0, k)
  let iterations = 10

  for (let iter = 0; iter < iterations; iter++) {
    const clusters = Array(k).fill(null).map(() => [])

    pixels.forEach(pixel => {
      let minDist = Infinity
      let clusterIndex = 0

      centroids.forEach((centroid, i) => {
        const dist = colorDistance(pixel, centroid)
        if (dist < minDist) {
          minDist = dist
          clusterIndex = i
        }
      })

      clusters[clusterIndex].push(pixel)
    })

    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0]

      const sum = cluster.reduce((acc, pixel) => ({
        r: acc.r + pixel.r,
        g: acc.g + pixel.g,
        b: acc.b + pixel.b
      }), { r: 0, g: 0, b: 0 })

      return {
        r: Math.round(sum.r / cluster.length),
        g: Math.round(sum.g / cluster.length),
        b: Math.round(sum.b / cluster.length)
      }
    })
  }

  return centroids
}

const colorDistance = (c1, c2) => {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  )
}

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

const selectColor = (color) => {
  selectedColor.value = color
  showPreview.value = true
}

const copyColor = (color) => {
  navigator.clipboard.writeText(color.hex)
}

const applyColor = (color) => {
  emit('color-applied', color)
}

const resetMatcher = () => {
  uploadedImage.value = null
  colorPalette.value = []
  selectedColor.value = null
  showPalette.value = true
  showPreview.value = false
}
</script>

<style scoped>
.color-matcher {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 1200px;
  margin: 0 auto;
}

.matcher-workspace {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.workspace-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.image-section {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 20px;
}

.uploaded-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .workspace-content {
    grid-template-columns: 1fr;
  }
}
</style>
