<template>
  <div v-if="visible" class="export-dialog-overlay" @click="close">
    <div class="export-dialog" @click.stop>
      <div class="dialog-header">
        <h2>导出演示文稿</h2>
        <button
class="close-btn" @click="close" aria-label="关闭">×</button>
      </div>

      <div class="dialog-body">
        <!-- 导出格式选择 -->
        <div class="export-section">
          <h3>导出格式</h3>
          <div class="format-options">
            <label v-for="format in availableFormats" class="format-option" :key="format.id">
              <input
                v-model="selectedFormat"
                type="radio"
                :value="format.id"
                :disabled="!format.available"
              />
              <div class="format-info">
                <div class="format-name">{{ format.name }}</div>
                <div class="format-description">{{ format.description }}</div>
                <div
                  class="format-status"
                  :class="{ available: format.available, unavailable: !format.available }"
                >
                  {{ format.available ? '✓ 支持' : '✗ 不支持' }}
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- 导出选项 -->
        <div v-if="currentFormat" class="export-section">
          <h3>导出选项</h3>
          <div class="export-options">
            <!-- 视频导出选项 -->
            <template v-if="currentFormat.id === 'video'">
              <div class="option-group">
                <label class="option-label">
                  <span>分辨率</span>
                  <select v-model="videoOptions.resolution" class="option-select">
                    <option value="720p">720p (1280×720)</option>
                    <option value="1080p">1080p (1920×1080)</option>
                    <option value="4k" :disabled="!is4KSupported">4K (3840×2160)</option>
                  </select>
                </label>
              </div>
              <div class="option-group">
                <label class="option-label">
                  <span>质量</span>
                  <select v-model="videoOptions.quality" class="option-select">
                    <option value="low">低质量 (较小文件)</option>
                    <option value="medium">中等质量</option>
                    <option value="high">高质量</option>
                    <option value="ultra">超高质量 (仅4K)</option>
                  </select>
                </label>
              </div>
              <div class="option-group">
                <label class="option-label">
                  <span>帧率</span>
                  <select v-model="videoOptions.frameRate" class="option-select">
                    <option value="24">24 fps</option>
                    <option value="30">30 fps</option>
                    <option value="60">60 fps</option>
                  </select>
                </label>
              </div>
              <div class="option-group">
                <label class="option-label">
                  <span>格式</span>
                  <select v-model="videoOptions.format" class="option-select">
                    <option v-for="format in supportedVideoFormats" :key="format" :value="format">
                      {{ getFormatDisplayName(format) }}
                    </option>
                  </select>
                </label>
              </div>
            </template>

            <!-- HTML导出选项 -->
            <template v-if="currentFormat.id === 'html'">
              <div class="option-group">
                <label class="option-label">
                  <span>模板样式</span>
                  <select v-model="htmlOptions.template" class="option-select">
                    <option value="modern">现代化</option>
                    <option value="professional">专业版</option>
                    <option value="minimal">极简版</option>
                  </select>
                </label>
              </div>
              <div class="option-group">
                <label class="checkbox-option">
                  <input
v-model="htmlOptions.includeControls" type="checkbox" />
                  <span>包含播放控制</span>
                </label>
              </div>
              <div class="option-group">
                <label class="checkbox-option">
                  <input
v-model="htmlOptions.autoPlay" type="checkbox" />
                  <span>自动播放</span>
                </label>
              </div>
            </template>

            <!-- 水印选项 -->
            <div class="option-group">
              <label class="checkbox-option">
                <input
v-model="exportOptions.applyWatermark" type="checkbox" />
                <span>应用水印 ({{ watermarkDescription }})</span>
              </label>
            </div>

            <!-- 通用选项 -->
            <div class="option-group">
              <label class="option-label">
                <span>文件名</span>
                <input
                  v-model="exportOptions.filename"
                  type="text"
                  class="option-input"
                  placeholder="输入文件名"
                />
              </label>
            </div>
          </div>
        </div>

        <!-- 水印选项 (仅付费用户) -->
        <div v-if="showWatermarkOptions" class="export-section">
          <h3>水印设置</h3>
          <div class="watermark-options">
            <div class="watermark-notice">
              <div class="notice-icon">💡</div>
              <div class="notice-content">
                <div class="notice-title">VidSlide AI 演示</div>
                <div class="notice-description">
                  免费用户导出会显示水印，升级到付费版本可移除水印
                </div>
              </div>
            </div>
            <div v-if="watermarkPreview" class="watermark-preview">
              <div class="preview-label">水印预览:</div>
              <div ref="watermarkCanvas" class="preview-canvas" />
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <div v-if="estimatedSize" class="export-info">
          <span>预计文件大小: {{ formatFileSize(estimatedSize) }}</span>
        </div>
        <div class="dialog-actions">
          <button
class="cancel-btn" @click="close" :disabled="isExporting">取消</button>
          <button class="export-btn" @click="startExport" :disabled="!canExport || isExporting">
            {{ isExporting ? '导出中...' : '开始导出' }}
          </button>
        </div>
      </div>

      <!-- 导出进度 -->
      <div v-if="isExporting" class="export-progress">
        <div class="progress-overlay">
          <div class="progress-content">
            <div class="progress-spinner" />
            <div class="progress-text">
              {{ progressMessage }}
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
            </div>
            <div v-if="progressDetails" class="progress-details">
              {{ progressDetails }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { VideoExporter } from '../utils/videoExporter.js'
import { HtmlExporter } from '../utils/htmlExporter.js'
import { PdfExporter } from '../utils/pdfExporter.js'
import { PptxExporter } from '../utils/pptxExporter.js'
import { getWatermarkGenerator } from '../utils/WatermarkGenerator.js'

export default {
  name: 'ExportDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    canvas: {
      type: HTMLCanvasElement,
      required: true
    },
    slides: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedFormat: 'html',
      isExporting: false,
      progressPercent: 0,
      progressMessage: '',
      progressDetails: '',

      // 视频导出选项
      videoOptions: {
        resolution: '1080p',
        quality: 'high',
        frameRate: 30,
        format: 'video/webm;codecs=vp9'
      },

      // HTML导出选项
      htmlOptions: {
        template: 'modern',
        includeControls: true,
        autoPlay: false
      },

      // 通用选项
      exportOptions: {
        filename: ''
      },

      // 内部状态
      supportedVideoFormats: [],
      estimatedSize: null,
      watermarkPreview: null,
      watermarkGenerator: null
    }
  },
  computed: {
    availableFormats() {
      return [
        {
          id: 'html',
          name: 'HTML演示文稿',
          description: '自包含的网页，支持离线播放',
          available: true
        },
        {
          id: 'video',
          name: '视频文件',
          description: 'MP4/WebM视频格式',
          available: VideoExporter.isSupported()
        },
        {
          id: 'pdf',
          name: 'PDF文档',
          description: '标准文档格式，支持中文字体',
          available: true // 现在支持PDF导出
        },
        {
          id: 'pptx',
          name: 'PPTX演示文稿',
          description: 'PowerPoint格式，支持企业编辑',
          available: true // 现在支持PPTX导出
        },
        {
          id: 'pptx',
          name: 'PowerPoint',
          description: 'PPTX演示文稿',
          available: false // 需要服务端支持
        }
      ]
    },

    currentFormat() {
      return this.availableFormats.find(f => f.id === this.selectedFormat)
    },

    canExport() {
      return (
        this.currentFormat && this.currentFormat.available && this.exportOptions.filename.trim()
      )
    },

    watermarkDescription() {
      if (!this.watermarkGenerator) return '免费版'
      return this.watermarkGenerator.getUserTierDescription()
    },

    showWatermarkOptions() {
      // 显示水印选项，但免费版用户默认启用
      return (
        this.currentFormat &&
        (this.currentFormat.id === 'video' || this.currentFormat.id === 'html')
      )
    },

    is4KSupported() {
      // 检查WebCodecs API对4K的支持
      if (!('VideoEncoder' in window) || !('VideoDecoder' in window)) {
        return false
      }

      // 检查内存是否充足 (需要至少4GB)
      if ('deviceMemory' in navigator && navigator.deviceMemory < 4) {
        return false
      }

      // 检查硬件并发性 (需要至少4核)
      if ('hardwareConcurrency' in navigator && navigator.hardwareConcurrency < 4) {
        return false
      }

      return true
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initDialog()
      }
    },

    selectedFormat() {
      this.updateEstimatedSize()
      this.updateFilename()
    },

    'videoOptions.resolution'() {
      this.updateEstimatedSize()
    },

    'videoOptions.frameRate'() {
      this.updateEstimatedSize()
    },

    'videoOptions.quality'() {
      this.updateEstimatedSize()
    }
  },
  methods: {
    initDialog() {
      // 初始化水印生成器
      this.watermarkGenerator = getWatermarkGenerator()

      // 初始化支持的视频格式
      this.supportedVideoFormats = VideoExporter.getSupportedFormats()

      // 设置默认视频格式
      if (this.supportedVideoFormats.length > 0) {
        this.videoOptions.format = this.supportedVideoFormats[0]
      }

      // 设置默认水印选项 (免费版默认启用)
      this.exportOptions.applyWatermark = !this.watermarkGenerator.canRemoveWatermark()

      // 生成默认文件名
      this.updateFilename()

      // 计算预估大小
      this.updateEstimatedSize()

      // 准备水印预览
      this.prepareWatermarkPreview()
    },

    updateFilename() {
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '')
      const prefix = this.currentFormat ? this.currentFormat.name : '导出'
      this.exportOptions.filename = `${prefix}_${timestamp}`
    },

    updateEstimatedSize() {
      if (this.selectedFormat === 'video') {
        // 估算视频文件大小
        const duration = 30 // 假设30秒
        const resolution = this.parseResolution(this.videoOptions.resolution)

        // 根据分辨率和质量计算基础比特率
        const pixels = resolution.width * resolution.height
        const baseBitrate = pixels * 0.1 // 每像素0.1字节/秒的基础比特率

        // 根据质量调整比特率
        const qualityMultipliers = {
          low: 0.5,
          medium: 0.75,
          high: 1.0,
          ultra: 1.5
        }

        const qualityMultiplier = qualityMultipliers[this.videoOptions.quality] || 1.0
        const bitrate = Math.max(baseBitrate * qualityMultiplier, 1000000) // 最低1Mbps

        this.estimatedSize = (bitrate * duration) / 8 // 字节
      } else if (this.selectedFormat === 'html') {
        // 估算HTML文件大小 (基础内容 + 资源)
        const baseSize = 50000 // 50KB基础
        const assetSize = this.slides.reduce((total, _slide) => {
          // 估算每个幻灯片的资源大小
          return total + 100000 // 假设100KB per slide
        }, 0)
        this.estimatedSize = baseSize + assetSize
      } else {
        this.estimatedSize = null
      }
    },

    prepareWatermarkPreview() {
      this.$nextTick(() => {
        const canvas = this.$refs.watermarkCanvas
        if (canvas) {
          const ctx = canvas.getContext('2d')
          canvas.width = 200
          canvas.height = 40

          // 绘制水印预览
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.font = '14px Arial'
          ctx.textAlign = 'right'
          ctx.textBaseline = 'bottom'
          ctx.fillText('Made with VidSlide AI', 190, 35)
        }
      })
    },

    async startExport() {
      if (!this.canExport || this.isExporting) return

      this.isExporting = true
      this.progressPercent = 0
      this.progressMessage = '准备导出...'

      try {
        if (this.selectedFormat === 'video') {
          await this.exportVideo()
        } else if (this.selectedFormat === 'html') {
          await this.exportHtml()
        } else if (this.selectedFormat === 'pdf') {
          await this.exportPdf()
        } else if (this.selectedFormat === 'pptx') {
          await this.exportPptx()
        }

        this.progressMessage = '导出完成！'
        this.progressPercent = 100

        // 延迟关闭对话框
        setTimeout(() => {
          this.close()
          this.$emit('export-complete')
        }, 1500)
      } catch (error) {
        console.error('导出失败:', error)
        this.progressMessage = `导出失败: ${error.message}`
        this.progressDetails = '请检查设置后重试'

        // 显示错误状态一段时间
        setTimeout(() => {
          this.isExporting = false
          this.progressMessage = ''
          this.progressDetails = ''
        }, 3000)
      }
    },

    async exportVideo() {
      const resolution = this.parseResolution(this.videoOptions.resolution)
      const exporter = new VideoExporter()

      // 创建临时canvas用于导出
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = resolution.width
      exportCanvas.height = resolution.height

      // 复制当前canvas内容到导出canvas
      const ctx = exportCanvas.getContext('2d')
      ctx.drawImage(this.canvas, 0, 0, resolution.width, resolution.height)

      const _result = await new Promise((resolve, reject) => {
        exporter.exportVideo({
          canvas: exportCanvas,
          duration: 10, // 测试用短视频
          frameRate: this.videoOptions.frameRate,
          format: this.videoOptions.format,
          resolution: this.videoOptions.resolution,
          quality: this.videoOptions.quality,
          applyWatermark: this.exportOptions.applyWatermark,
          onProgress: progress => {
            this.progressPercent = progress.progress * 100
            this.progressMessage = progress.message
          },
          onComplete: resolve,
          onError: reject
        })
      })

      // 下载文件
      this.downloadFile(result.blob, `${this.exportOptions.filename}.webm`)
    },

    async exportHtml() {
      const exporter = new HtmlExporter()

      const _result = await exporter.exportHtml({
        slides: this.slides,
        template: this.htmlOptions.template,
        title: this.exportOptions.filename,
        includeControls: this.htmlOptions.includeControls,
        autoPlay: this.htmlOptions.autoPlay,
        applyWatermark: this.exportOptions.applyWatermark
      })

      this.downloadFile(result.blob, result.filename)
    },

    async exportPdf() {
      this.progressMessage = '正在生成PDF...'
      this.progressPercent = 30

      const exporter = new PdfExporter()

      this.progressMessage = '正在导出PDF...'
      this.progressPercent = 60

      const _result = await exporter.exportPdf({
        slides: this.slides,
        template: this.pdfOptions.template || 'standard',
        title: this.exportOptions.filename,
        layout: this.pdfOptions.layout || 'A4',
        orientation: this.pdfOptions.orientation || 'portrait',
        applyWatermark: this.exportOptions.applyWatermark
      })

      this.progressMessage = 'PDF导出完成'
      this.progressPercent = 90

      // PDF导出直接保存，不需要downloadFile
      // 文件已由jsPDF自动保存
    },

    async exportPptx() {
      this.progressMessage = '正在生成PPTX...'
      this.progressPercent = 30

      const exporter = new PptxExporter()

      this.progressMessage = '正在导出PPTX...'
      this.progressPercent = 60

      const _result = await exporter.exportPptx({
        slides: this.slides,
        template: this.pptxOptions.template || 'professional',
        title: this.exportOptions.filename,
        layout: this.pptxOptions.layout || '16x9',
        author: this.pptxOptions.author || 'VidSlide AI',
        company: this.pptxOptions.company || 'VidSlide AI',
        subject: this.pptxOptions.subject || 'AI生成的演示文稿',
        applyWatermark: this.exportOptions.applyWatermark
      })

      this.progressMessage = 'PPTX导出完成'
      this.progressPercent = 90

      // PPTX导出直接保存，不需要downloadFile
      // 文件已由PptxGenJS自动保存
    },

    parseResolution(resolution) {
      const resolutions = {
        '720p': { width: 1280, height: 720 },
        '1080p': { width: 1920, height: 1080 },
        '4k': { width: 3840, height: 2160 }
      }
      return resolutions[resolution] || resolutions['1080p']
    },

    downloadFile(blob, filename) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    formatFileSize(bytes) {
      if (!bytes) return ''
      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`
    },

    getFormatDisplayName(format) {
      const names = {
        'video/webm;codecs=vp9': 'WebM (VP9)',
        'video/webm;codecs=vp8': 'WebM (VP8)',
        'video/webm': 'WebM',
        'video/mp4;codecs=h264': 'MP4 (H.264)',
        'video/mp4': 'MP4'
      }
      return names[format] || format
    },

    close() {
      if (!this.isExporting) {
        this.$emit('update:visible', false)
        this.$emit('close')
      }
    }
  }
}
</script>

<style scoped>
.export-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.export-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.dialog-body {
  padding: 24px;
}

.export-section {
  margin-bottom: 32px;
}

.export-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.format-options {
  display: grid;
  gap: 12px;
}

.format-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.format-option:hover {
  border-color: #007aff;
}

.format-option input[type='radio'] {
  margin-top: 2px;
  flex-shrink: 0;
}

.format-info {
  flex: 1;
}

.format-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.format-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.format-status {
  font-size: 12px;
  font-weight: 500;
}

.format-status.available {
  color: #28a745;
}

.format-status.unavailable {
  color: #dc3545;
}

.export-options {
  display: grid;
  gap: 16px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #333;
}

.option-select,
.option-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 120px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
}

.checkbox-option input[type='checkbox'] {
  margin: 0;
}

.watermark-options {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.watermark-notice {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.notice-icon {
  font-size: 24px;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.notice-description {
  color: #666;
  font-size: 14px;
}

.watermark-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-label {
  font-weight: 500;
  color: #333;
}

.preview-canvas {
  border: 1px solid #ddd;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.8);
}

.dialog-footer {
  padding: 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.export-info {
  color: #666;
  font-size: 14px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn,
.export-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f8f9fa;
  border: 1px solid #ddd;
  color: #666;
}

.cancel-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.export-btn {
  background: #007aff;
  border: 1px solid #007aff;
  color: white;
}

.export-btn:hover:not(:disabled) {
  background: #0056cc;
}

.cancel-btn:disabled,
.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.progress-overlay {
  text-align: center;
}

.progress-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.progress-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.progress-bar {
  width: 200px;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin: 0 auto 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007aff, #5856d6);
  width: 0%;
  transition: width 0.3s ease;
}

.progress-details {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .export-dialog {
    width: 95%;
    margin: 20px;
  }

  .dialog-header,
  .dialog-body,
  .dialog-footer {
    padding: 16px;
  }

  .option-label {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .option-select,
  .option-input {
    width: 100%;
  }
}
</style>
