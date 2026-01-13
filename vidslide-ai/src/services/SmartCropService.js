/**
 * SmartCropService - 智能裁剪服务
 *
 * 集成OpenCV.js实现自动裁剪功能，智能识别主体内容
 */

class SmartCropService {
  constructor() {
    this.opencv = null
    this.isInitialized = false
  }

  /**
   * 初始化OpenCV.js
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('正在加载OpenCV.js...')

      // 动态加载OpenCV.js
      if (typeof cv === 'undefined') {
        await this.loadOpenCV()
      }

      this.opencv = cv
      this.isInitialized = true

      console.log('OpenCV.js加载完成')
    } catch (error) {
      console.error('OpenCV.js初始化失败:', error)
      throw new Error('智能裁剪服务初始化失败，请检查OpenCV.js支持')
    }
  }

  /**
   * 加载OpenCV.js库
   * @returns {Promise<void>}
   */
  async loadOpenCV() {
    return new Promise((resolve, reject) => {
      // 检查是否已经存在OpenCV脚本
      if (document.querySelector('script[src*="opencv"]')) {
        // 如果已经加载，等待cv对象可用
        const checkCV = () => {
          if (typeof cv !== 'undefined') {
            resolve()
          } else {
            setTimeout(checkCV, 100)
          }
        }
        checkCV()
        return
      }

      // 动态加载OpenCV.js
      const script = document.createElement('script')
      script.src = 'https://docs.opencv.org/4.5.5/opencv.js'
      script.onload = () => {
        // 等待cv对象初始化
        const checkCV = () => {
          if (typeof cv !== 'undefined' && cv.Mat) {
            resolve()
          } else {
            setTimeout(checkCV, 100)
          }
        }
        checkCV()
      }
      script.onerror = () => reject(new Error('OpenCV.js加载失败'))
      document.head.appendChild(script)
    })
  }

  /**
   * 执行智能裁剪
   * @param {File|Blob} imageFile - 图片文件
   * @param {Object} options - 裁剪选项
   * @returns {Promise<Object>} 裁剪结果
   */
  async smartCrop(imageFile, options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      console.log('开始智能裁剪处理...')

      // 将图片转换为OpenCV Mat格式
      const imgElement = await this.fileToImage(imageFile)
      const src = this.opencv.imread(imgElement)
      const dst = new this.opencv.Mat()

      // 执行主体检测和裁剪
      const cropResult = await this.detectAndCrop(src, options)

      // 清理内存
      src.delete()
      dst.delete()

      console.log('智能裁剪处理完成')

      return cropResult
    } catch (error) {
      console.error('智能裁剪失败:', error)
      throw new Error(`智能裁剪处理失败: ${error.message}`)
    }
  }

  /**
   * 检测主体并裁剪
   * @param {cv.Mat} src - 源图片Mat
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 裁剪结果
   */
  async detectAndCrop(src, options = {}) {
    const {
      subjectType = 'auto',  // auto, face, object, text
      padding = 20,           // 裁剪边距
      minSubjectSize = 0.1,   // 最小主体占比
      maxSubjectSize = 0.9    // 最大主体占比
    } = options

    let subjectRect = null

    // 根据主体类型选择检测算法
    switch (subjectType) {
      case 'face':
        subjectRect = await this.detectFace(src)
        break
      case 'text':
        subjectRect = await this.detectText(src)
        break
      case 'object':
        subjectRect = await this.detectObject(src)
        break
      default:
        // 自动检测：优先人脸，然后是显著性区域
        subjectRect = await this.detectFace(src)
        if (!subjectRect) {
          subjectRect = await this.detectSaliency(src)
        }
    }

    if (!subjectRect) {
      throw new Error('无法检测到合适的裁剪区域')
    }

    // 验证主体大小
    const imageArea = src.rows * src.cols
    const subjectArea = subjectRect.width * subjectRect.height
    const subjectRatio = subjectArea / imageArea

    if (subjectRatio < minSubjectSize) {
      console.warn(`检测到的主体过小 (${(subjectRatio * 100).toFixed(1)}%)，使用备用方案`)
      subjectRect = await this.detectSaliency(src) || subjectRect
    }

    // 计算最终裁剪区域
    const cropRect = this.calculateCropRect(subjectRect, src.cols, src.rows, padding)

    // 执行裁剪
    const croppedMat = src.roi(cropRect)

    // 转换为Blob
    const croppedBlob = await this.matToBlob(croppedMat)

    // 清理内存
    croppedMat.delete()

    return {
      croppedBlob,
      cropRect,
      subjectRect,
      originalSize: { width: src.cols, height: src.rows },
      croppedSize: { width: cropRect.width, height: cropRect.height },
      confidence: this.calculateConfidence(subjectRect, cropRect, src),
      method: subjectType
    }
  }

  /**
   * 人脸检测
   * @param {cv.Mat} src - 源图片
   * @returns {Promise<Object|null>} 人脸区域
   */
  async detectFace(src) {
    try {
      // 转换为灰度图
      const gray = new this.opencv.Mat()
      this.opencv.cvtColor(src, gray, this.opencv.COLOR_RGBA2GRAY)

      // 加载人脸检测器（这里需要预训练的级联分类器）
      // 注意：在实际应用中，需要加载haarcascade_frontalface_default.xml
      const faceCascade = new this.opencv.CascadeClassifier()

      // 临时使用简化的检测逻辑
      // TODO: 集成真实的Haar cascades或DNN人脸检测器

      const faces = new this.opencv.RectVector()
      const msize = new this.opencv.Size(0, 0)

      // 这里应该调用faceCascade.detectMultiScale(gray, faces, ...)
      // 暂时返回模拟结果
      if (faces.size() > 0) {
        const face = faces.get(0)
        return {
          x: face.x,
          y: face.y,
          width: face.width,
          height: face.height
        }
      }

      // 清理内存
      gray.delete()
      faces.delete()
      msize.delete()

      return null
    } catch (error) {
      console.warn('人脸检测失败:', error)
      return null
    }
  }

  /**
   * 文本检测
   * @param {cv.Mat} src - 源图片
   * @returns {Promise<Object|null>} 文本区域
   */
  async detectText(src) {
    try {
      // 转换为灰度图
      const gray = new this.opencv.Mat()
      this.opencv.cvtColor(src, gray, this.opencv.COLOR_RGBA2GRAY)

      // 应用高斯模糊减少噪声
      const blurred = new this.opencv.Mat()
      this.opencv.GaussianBlur(gray, blurred, new this.opencv.Size(5, 5), 0)

      // 边缘检测
      const edges = new this.opencv.Mat()
      this.opencv.Canny(blurred, edges, 50, 150)

      // 寻找轮廓
      const contours = new this.opencv.MatVector()
      const hierarchy = new this.opencv.Mat()
      this.opencv.findContours(edges, contours, hierarchy, this.opencv.RETR_EXTERNAL, this.opencv.CHAIN_APPROX_SIMPLE)

      // 找到最大的轮廓（可能是文本区域）
      let maxArea = 0
      let textRect = null

      for (let i = 0; i < contours.size(); ++i) {
        const contour = contours.get(i)
        const area = this.opencv.contourArea(contour)

        if (area > maxArea) {
          const rect = this.opencv.boundingRect(contour)
          // 检查宽高比（文本通常比较扁平）
          const aspectRatio = rect.width / rect.height

          if (aspectRatio > 2 && aspectRatio < 10) {
            maxArea = area
            textRect = rect
          }
        }
      }

      // 清理内存
      gray.delete()
      blurred.delete()
      edges.delete()
      contours.delete()
      hierarchy.delete()

      if (textRect) {
        return {
          x: textRect.x,
          y: textRect.y,
          width: textRect.width,
          height: textRect.height
        }
      }

      return null
    } catch (error) {
      console.warn('文本检测失败:', error)
      return null
    }
  }

  /**
   * 物体检测（显著性检测）
   * @param {cv.Mat} src - 源图片
   * @returns {Promise<Object|null>} 物体区域
   */
  async detectObject(src) {
    // 简化的显著性检测实现
    return await this.detectSaliency(src)
  }

  /**
   * 显著性区域检测
   * @param {cv.Mat} src - 源图片
   * @returns {Promise<Object|null>} 显著区域
   */
  async detectSaliency(src) {
    try {
      // 转换为灰度图
      const gray = new this.opencv.Mat()
      this.opencv.cvtColor(src, gray, this.opencv.COLOR_RGBA2GRAY)

      // 计算Laplacian方差（衡量图像复杂度）
      const laplacian = new this.opencv.Mat()
      this.opencv.Laplacian(gray, laplacian, this.opencv.CV_64F)

      // 寻找方差最大的区域
      const mean = new this.opencv.Mat()
      const stddev = new this.opencv.Mat()
      this.opencv.meanStdDev(laplacian, mean, stddev)

      // 简化的显著性检测：返回中心区域
      const centerX = Math.floor(src.cols * 0.25)
      const centerY = Math.floor(src.rows * 0.25)
      const width = Math.floor(src.cols * 0.5)
      const height = Math.floor(src.rows * 0.5)

      // 清理内存
      gray.delete()
      laplacian.delete()
      mean.delete()
      stddev.delete()

      return {
        x: centerX,
        y: centerY,
        width: width,
        height: height
      }
    } catch (error) {
      console.warn('显著性检测失败:', error)
      return null
    }
  }

  /**
   * 计算裁剪矩形
   * @param {Object} subjectRect - 主体区域
   * @param {number} imageWidth - 图片宽度
   * @param {number} imageHeight - 图片高度
   * @param {number} padding - 内边距
   * @returns {Object} 裁剪矩形
   */
  calculateCropRect(subjectRect, imageWidth, imageHeight, padding) {
    let x = Math.max(0, subjectRect.x - padding)
    let y = Math.max(0, subjectRect.y - padding)
    let width = subjectRect.width + 2 * padding
    let height = subjectRect.height + 2 * padding

    // 确保不超过图片边界
    if (x + width > imageWidth) {
      width = imageWidth - x
    }
    if (y + height > imageHeight) {
      height = imageHeight - y
    }

    return { x, y, width, height }
  }

  /**
   * 计算置信度
   * @param {Object} subjectRect - 主体区域
   * @param {Object} cropRect - 裁剪区域
   * @param {cv.Mat} src - 源图片
   * @returns {number} 置信度 (0-1)
   */
  calculateConfidence(subjectRect, cropRect, src) {
    const imageArea = src.rows * src.cols
    const cropArea = cropRect.width * cropRect.height
    const subjectArea = subjectRect.width * subjectRect.height

    // 基于主体占比和裁剪效率计算置信度
    const subjectRatio = subjectArea / cropArea
    const cropEfficiency = cropArea / imageArea

    // 理想的裁剪应该包含大部分主体，但不裁剪过多背景
    let confidence = subjectRatio * 0.7 + (1 - cropEfficiency) * 0.3

    return Math.min(Math.max(confidence, 0), 1)
  }

  /**
   * 将文件转换为Image元素
   * @param {File|Blob} file - 图片文件
   * @returns {Promise<HTMLImageElement>} 图片元素
   */
  async fileToImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 将OpenCV Mat转换为Blob
   * @param {cv.Mat} mat - OpenCV矩阵
   * @returns {Promise<Blob>} 图片Blob
   */
  async matToBlob(mat) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      this.opencv.imshow(canvas, mat)
      canvas.toBlob(resolve, 'image/png')
    })
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 清理OpenCV资源
    if (this.opencv) {
      // 这里可以添加更详细的清理逻辑
    }
    this.isInitialized = false
  }
}

export default new SmartCropService()