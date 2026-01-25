/**
 * MasterAutoGenerationAgent - 主自动生成代理
 *
 * 连接到多智能体后端API，实现一键自动生成功能
 * 功能：
 * - 上传视频到多智能体系统
 * - 实时进度跟踪
 * - Timeline数据获取
 * - 视频下载
 */

import { getVideoProcessingService } from './VideoProcessingService'

class MasterAutoGenerationAgent {
  constructor() {
    this.videoService = getVideoProcessingService()
    this.currentTaskId = null
    this.currentSocket = null
    this.isCancelled = false
  }

  /**
   * 自动生成视频
   * @param {File} videoFile - 视频文件
   * @param {Function} onProgress - 进度回调 ({step: string, progress: number})
   * @returns {Promise<Object>} 生成结果
   */
  async autoGenerate(videoFile, onProgress) {
    this.isCancelled = false

    try {
      // Step 1: 检查服务健康状态
      if (onProgress) {
        onProgress({ step: '检查后端服务...', progress: 0 })
      }

      const health = await this.videoService.checkHealth()
      console.log('✅ 后端服务正常:', health)

      // Step 2: 上传视频
      if (onProgress) {
        onProgress({ step: '上传视频到多智能体系统...', progress: 5 })
      }

      const uploadResult = await this.videoService.uploadVideo(videoFile, {
        platform: 'douyin',
        allowRework: true,
        onProgress: (uploadProgress) => {
          if (onProgress) {
            // 上传占5-10%的进度
            onProgress({
              step: `上传视频中... ${uploadProgress}%`,
              progress: 5 + (uploadProgress * 0.05)
            })
          }
        }
      })

      this.currentTaskId = uploadResult.taskId
      console.log(`✅ 任务已创建: ${this.currentTaskId}`)

      // Step 3: 监听实时更新
      if (onProgress) {
        onProgress({ step: '连接实时更新...', progress: 10 })
      }

      return new Promise((resolve, reject) => {
        let finalResult = null

        // 使用WebSocket监听实时更新
        this.currentSocket = this.videoService.subscribeToUpdates(
          this.currentTaskId,
          (taskData) => {
            if (this.isCancelled) {
              if (this.currentSocket) {
                this.currentSocket.disconnect()
              }
              reject(new Error('用户取消了生成'))
              return
            }

            console.log(`📊 进度: ${taskData.progress}% - ${taskData.message}`)

            // 更新进度（10-100%）
            if (onProgress) {
              onProgress({
                step: taskData.message || '处理中...',
                progress: Math.max(10, taskData.progress)
              })
            }

            // 保存Timeline数据
            if (taskData.timeline) {
              console.log('📋 收到Timeline数据:', taskData.timeline)
              finalResult = {
                ...finalResult,
                timeline: taskData.timeline
              }
            }

            // 任务完成
            if (taskData.status === 'completed') {
              console.log('✅ 多智能体处理完成')

              // 关闭WebSocket连接
              if (this.currentSocket) {
                this.currentSocket.disconnect()
                this.currentSocket = null
              }

              // 返回结果
              resolve({
                taskId: this.currentTaskId,
                timeline: finalResult?.timeline || taskData.timeline,
                videoPath: taskData.videoPath,
                canExport: true,
                previewReady: true,
                message: '视频生成完成'
              })
            }

            // 任务失败
            if (taskData.status === 'failed') {
              console.error('❌ 多智能体处理失败:', taskData.error)

              // 关闭WebSocket连接
              if (this.currentSocket) {
                this.currentSocket.disconnect()
                this.currentSocket = null
              }

              reject(new Error(taskData.error || '处理失败'))
            }
          }
        )

        // 如果WebSocket连接失败，使用轮询作为备用方案
        if (!this.currentSocket) {
          console.log('⚠️ WebSocket连接失败，使用轮询方式...')

          this.videoService
            .pollTaskStatus(this.currentTaskId, (taskData) => {
              if (this.isCancelled) {
                reject(new Error('用户取消了生成'))
                return
              }

              console.log(`📊 进度: ${taskData.progress}% - ${taskData.message}`)

              if (onProgress) {
                onProgress({
                  step: taskData.message || '处理中...',
                  progress: Math.max(10, taskData.progress)
                })
              }

              if (taskData.timeline) {
                finalResult = {
                  ...finalResult,
                  timeline: taskData.timeline
                }
              }
            })
            .then((finalTaskData) => {
              resolve({
                taskId: this.currentTaskId,
                timeline: finalResult?.timeline || finalTaskData.timeline,
                videoPath: finalTaskData.videoPath,
                canExport: true,
                previewReady: true,
                message: '视频生成完成'
              })
            })
            .catch((error) => {
              reject(error)
            })
        }
      })
    } catch (error) {
      console.error('❌ 自动生成失败:', error)
      throw error
    }
  }

  /**
   * 取消当前生成任务
   */
  cancel() {
    this.isCancelled = true
    if (this.currentSocket) {
      this.currentSocket.disconnect()
      this.currentSocket = null
    }
    console.log('🛑 已取消生成任务')
  }

  /**
   * 下载生成的视频
   * @param {string} taskId - 任务ID
   * @returns {Promise<string>} 视频URL
   */
  async downloadVideo(taskId) {
    try {
      return await this.videoService.downloadVideo(taskId)
    } catch (error) {
      throw new Error(`下载视频失败: ${error.message}`)
    }
  }

  /**
   * 获取Timeline数据
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} Timeline数据
   */
  async getTimeline(taskId) {
    try {
      return await this.videoService.getTimeline(taskId)
    } catch (error) {
      throw new Error(`获取Timeline失败: ${error.message}`)
    }
  }
}

// 单例模式
let agentInstance = null

/**
 * 获取MasterAutoGenerationAgent单例
 * @returns {MasterAutoGenerationAgent}
 */
export function getMasterAutoGenerationAgent() {
  if (!agentInstance) {
    agentInstance = new MasterAutoGenerationAgent()
  }
  return agentInstance
}

export default MasterAutoGenerationAgent
