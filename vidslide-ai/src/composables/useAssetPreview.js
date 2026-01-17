/**
 * useAssetPreview.js
 * VidSlide AI - 素材预览逻辑
 *
 * 提供素材预览、多分辨率图像生成、预览缓存等功能
 *
 * 功能：
 * - 多分辨率预览
 * - 图像缓存管理
 * - 预览对话框状态管理
 * - 版权信息展示
 */

import { ref, watch } from 'vue'

/**
 * 素材预览组合式函数
 * @param {Function} emit - 事件发射器
 * @returns {Object} 预览相关状态和方法
 */
export function useAssetPreview(emit) {
  // ==================== 预览状态 ====================

  // 预览对话框显示状态
  const previewDialogVisible = ref(false)

  // 当前预览的素材数据
  const previewAssetData = ref(null)

  // 多分辨率预览配置
  const previewResolutions = [
    { label: '低清 (256px)', value: 'low', maxSize: 256, quality: 0.6 },
    { label: '中等 (512px)', value: 'medium', maxSize: 512, quality: 0.8 },
    { label: '高清 (1024px)', value: 'high', maxSize: 1024, quality: 0.9 },
    { label: '原图', value: 'original', maxSize: null, quality: 1.0 }
  ]

  // 当前预览分辨率
  const currentPreviewResolution = ref('medium')

  // 预览图像缓存
  const previewImageCache = ref(new Map())

  // 当前预览URL
  const currentPreviewUrl = ref('')

  // 预览加载状态
  const previewLoading = ref(false)

  // ==================== 预览方法 ====================

  /**
   * 打开素材预览
   * @param {Object} asset - 素材对象
   */
  const previewAsset = (asset) => {
    previewAssetData.value = asset
    previewDialogVisible.value = true
    emit('asset-previewed', asset)

    // 初始化预览
    updatePreviewImage()
  }

  /**
   * 关闭预览对话框
   */
  const closePreview = () => {
    previewDialogVisible.value = false
    previewAssetData.value = null
    currentPreviewUrl.value = ''
  }

  /**
   * 更新预览图像
   * 根据当前选择的分辨率生成预览图像
   */
  const updatePreviewImage = async () => {
    if (!previewAssetData.value?.url) {
      currentPreviewUrl.value = ''
      return
    }

    const asset = previewAssetData.value
    const resolution = currentPreviewResolution.value
    const cacheKey = `${asset.id}_${resolution}`

    // 检查缓存
    if (previewImageCache.value.has(cacheKey)) {
      currentPreviewUrl.value = previewImageCache.value.get(cacheKey)
      return
    }

    previewLoading.value = true

    try {
      const previewUrl = await generatePreviewImage(asset.url, resolution)
      currentPreviewUrl.value = previewUrl

      // 缓存预览图像
      previewImageCache.value.set(cacheKey, previewUrl)

      // 限制缓存大小
      if (previewImageCache.value.size > 50) {
        const firstKey = previewImageCache.value.keys().next().value
        previewImageCache.value.delete(firstKey)
      }
    } catch (error) {
      console.error('生成预览图像失败:', error)
      // 降级到原始图像
      currentPreviewUrl.value = asset.url
    } finally {
      previewLoading.value = false
    }
  }

  /**
   * 生成预览图像
   * @param {string} originalUrl - 原始图像URL
   * @param {string} resolution - 分辨率级别
   * @returns {Promise<string>} 预览图像URL
   */
  const generatePreviewImage = async (originalUrl, resolution) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          const resolutionConfig = previewResolutions.find((r) => r.value === resolution)
          if (!resolutionConfig) {
            resolve(originalUrl)
            return
          }

          let { width, height } = img

          // 计算缩放尺寸
          if (resolutionConfig.maxSize) {
            const maxSize = resolutionConfig.maxSize
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width
                width = maxSize
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height
                height = maxSize
              }
            }
          }

          // 设置canvas尺寸
          canvas.width = Math.round(width)
          canvas.height = Math.round(height)

          // 绘制图像
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // 转换为DataURL
          const previewUrl = canvas.toDataURL('image/jpeg', resolutionConfig.quality)
          resolve(previewUrl)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('图像加载失败'))
      }

      img.src = originalUrl
    })
  }

  /**
   * 发射素材选择事件
   * @param {Object} asset - 素材对象
   */
  const emitAssetSelected = (asset) => {
    emit('asset-selected', asset)
    closePreview()
  }

  // ==================== 工具方法 ====================

  /**
   * 获取素材来源的显示名称
   * @param {string} source - 素材来源标识
   * @returns {string} 显示名称
   */
  const getSourceDisplayName = (source) => {
    const sourceNames = {
      unsplash: 'Unsplash',
      pexels: 'Pexels',
      pixabay: 'Pixabay',
      local: '本地',
      uploaded: '上传'
    }
    return sourceNames[source] || source || '未知'
  }

  /**
   * 格式化文件大小显示
   * @param {number} bytes - 文件大小（字节）
   * @returns {string} 格式化的文件大小字符串
   */
  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * 获取版权状态对应的CSS类名
   * @param {Object} copyrightInfo - 版权信息对象
   * @returns {string} CSS类名
   */
  const getCopyrightClass = (copyrightInfo) => {
    if (copyrightInfo.isSafe) return 'safe'
    if (copyrightInfo.status === 'unknown') return 'unknown'
    return 'unsafe'
  }

  /**
   * 获取版权状态对应的Element Plus标签类型
   * @param {Object} copyrightInfo - 版权信息对象
   * @returns {string} 标签类型
   */
  const getCopyrightTagType = (copyrightInfo) => {
    if (copyrightInfo.isSafe) return 'success'
    if (copyrightInfo.status === 'unknown') return 'warning'
    return 'danger'
  }

  /**
   * 获取版权状态的文本描述
   * @param {Object} copyrightInfo - 版权信息对象
   * @returns {string} 状态文本
   */
  const getCopyrightStatusText = (copyrightInfo) => {
    const statusTexts = {
      free: '免费使用',
      cc: '创意共享',
      paid: '付费许可证',
      copyrighted: '受版权保护',
      unknown: '未知状态'
    }
    return statusTexts[copyrightInfo.status] || '未知'
  }

  /**
   * 处理图像加载错误
   * @param {Event} event - 错误事件
   */
  const handleImageError = (event) => {
    // 图片加载失败时显示占位符
    const img = event.target
    img.style.display = 'none'
    const placeholder = img.parentElement.querySelector('.thumbnail-placeholder')
    if (placeholder) {
      placeholder.style.display = 'flex'
    }
  }

  // ==================== 监听器 ====================

  // 监听分辨率变化，自动更新预览
  watch(currentPreviewResolution, () => {
    if (previewDialogVisible.value && previewAssetData.value) {
      updatePreviewImage()
    }
  })

  // ==================== 返回值 ====================

  return {
    // 状态
    previewDialogVisible,
    previewAssetData,
    previewResolutions,
    currentPreviewResolution,
    previewImageCache,
    currentPreviewUrl,
    previewLoading,

    // 方法
    previewAsset,
    closePreview,
    updatePreviewImage,
    generatePreviewImage,
    emitAssetSelected,
    getSourceDisplayName,
    formatFileSize,
    getCopyrightClass,
    getCopyrightTagType,
    getCopyrightStatusText,
    handleImageError
  }
}
