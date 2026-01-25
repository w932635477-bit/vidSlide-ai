/**
 * VideoProcessingService - 视频处理服务
 *
 * 连接到多智能体后端API
 * 功能：
 * - 上传视频到多智能体系统
 * - 实时进度跟踪
 * - Timeline数据获取
 * - 视频下载
 */

import axios from 'axios'

const API_BASE_URL = 'http://localhost:3002'

class VideoProcessingService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 300000 // 5分钟超时
    })
  }

  /**
   * 检查服务健康状态
   */
  async checkHealth() {
    try {
      const response = await this.api.get('/health')
      return response.data
    } catch (error) {
      throw new Error(`服务健康检查失败: ${error.message}`)
    }
  }

  /**
   * 上传视频到多智能体系统
   * @param {File} videoFile - 视频文件
   * @param {Object} options - 选项
   * @param {string} options.platform - 目标平台 (douyin, kuaishou, etc.)
   * @param {boolean} options.allowRework - 是否允许返工
   * @param {Function} options.onProgress - 进度回调
   * @returns {Promise<Object>} 任务信息
   */
  async uploadVideo(videoFile, options = {}) {
    const formData = new FormData()
    formData.append('video', videoFile)
    formData.append('platform', options.platform || 'douyin')
    formData.append('allowRework', options.allowRework ? 'true' : 'false')

    try {
      const response = await this.api.post('/api/multi-agent/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          if (options.onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            options.onProgress(percentCompleted)
          }
        }
      })

      return response.data
    } catch (error) {
      throw new Error(`视频上传失败: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * 查询任务状态
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 任务状态
   */
  async getTaskStatus(taskId) {
    try {
      const response = await this.api.get(`/api/multi-agent/status/${taskId}`)
      return response.data
    } catch (error) {
      throw new Error(`查询任务状态失败: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * 获取Timeline数据
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} Timeline数据
   */
  async getTimeline(taskId) {
    try {
      const response = await this.api.get(`/api/multi-agent/timeline/${taskId}`)
      return response.data
    } catch (error) {
      throw new Error(`获取Timeline失败: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * 下载最终视频
   * @param {string} taskId - 任务ID
   * @returns {Promise<string>} 视频URL
   */
  async downloadVideo(taskId) {
    try {
      const response = await this.api.get(`/api/multi-agent/download/${taskId}`, {
        responseType: 'blob'
      })
      return URL.createObjectURL(new Blob([response.data]))
    } catch (error) {
      throw new Error(`下载视频失败: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * 创建WebSocket连接监听实时更新
   * @param {string} taskId - 任务ID
   * @param {Function} onUpdate - 更新回调
   * @returns {Object} WebSocket连接
   */
  subscribeToUpdates(taskId, onUpdate) {
    // 动态加载socket.io客户端
    if (typeof io === 'undefined') {
      console.error('Socket.IO客户端未加载')
      return null
    }

    const socket = io(API_BASE_URL)

    socket.on('connect', () => {
      console.log('✅ WebSocket已连接')
    })

    // 监听任务更新
    socket.on(`task-update-${taskId}`, (taskData) => {
      if (onUpdate) {
        onUpdate(taskData)
      }
    })

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket已断开')
    })

    socket.on('error', (error) => {
      console.error('❌ WebSocket错误:', error)
    })

    return socket
  }

  /**
   * 轮询任务状态（备用方案）
   * @param {string} taskId - 任务ID
   * @param {Function} onProgress - 进度回调
   * @param {number} interval - 轮询间隔（毫秒）
   * @returns {Promise<Object>} 最终任务状态
   */
  async pollTaskStatus(taskId, onProgress, interval = 1000) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getTaskStatus(taskId)

          if (onProgress) {
            onProgress(status)
          }

          if (status.status === 'completed') {
            resolve(status)
          } else if (status.status === 'failed') {
            reject(new Error(status.error || '任务失败'))
          } else {
            setTimeout(poll, interval)
          }
        } catch (error) {
          reject(error)
        }
      }

      poll()
    })
  }
}

// 单例模式
let serviceInstance = null

/**
 * 获取VideoProcessingService单例
 * @returns {VideoProcessingService}
 */
export function getVideoProcessingService() {
  if (!serviceInstance) {
    serviceInstance = new VideoProcessingService()
  }
  return serviceInstance
}

export default VideoProcessingService
