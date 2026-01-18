/**
 * Remotion渲染器
 *
 * 功能:
 * - 为视频合成流程提供Remotion渲染能力
 * - 渲染每个场景的PPT模板
 * - 支持进度轮询
 * - 错误处理和重试
 *
 * 技术方案:
 * - 调用Remotion服务器API (http://localhost:3002)
 * - 异步渲染,轮询进度
 * - 支持30个专业模板
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import remotionService from './RemotionService.js'

class RemotionRenderer {
  constructor() {
    this.remotionService = remotionService
    this.maxRetries = 3
    this.pollInterval = 2000 // 2秒轮询一次
    this.renderTimeout = 600000 // 10分钟超时

    console.log('✅ RemotionRenderer 初始化完成')
  }

  /**
   * 渲染多个场景
   *
   * @param {Array} scenes - 场景数据数组
   * @param {Object} template - PPT模板配置
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Array>} 渲染后的视频数组
   */
  async renderScenes(scenes, template, onProgress = null) {
    console.log('🎨 开始渲染PPT模板')
    console.log('  - 场景数量:', scenes.length)
    console.log('  - 模板ID:', template.id)

    const renderedVideos = []

    try {
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i]
        console.log(`🎨 渲染场景 ${i + 1}/${scenes.length}`)

        const videoData = await this.renderScene(scene, template)
        renderedVideos.push(videoData)

        // 更新进度
        if (onProgress) {
          onProgress((i + 1) / scenes.length)
        }

        console.log(`✅ 场景 ${i + 1} 渲染完成`)
      }

      console.log('✅ PPT模板渲染完成,共', renderedVideos.length, '个视频')
      return renderedVideos
    } catch (error) {
      console.error('❌ PPT模板渲染失败:', error)
      throw error
    }
  }

  /**
   * 渲染单个场景
   *
   * @param {Object} scene - 场景数据
   * @param {Object} template - PPT模板配置
   * @returns {Promise<Object>} 渲染后的视频数据
   */
  async renderScene(scene, template) {
    let retries = 0

    while (retries < this.maxRetries) {
      try {
        // 准备渲染参数
        const props = {
          title: scene.title || `场景 ${scene.id}`,
          subtitle: scene.subtitle || '',
          content: scene.content || scene.text || '',
          duration: scene.duration || 5,
          materials: scene.materials || [],
          keywords: scene.keywords || []
        }

        const options = {
          codec: 'h264',
          fps: 30,
          width: 1920,
          height: 1080
        }

        console.log('  - 渲染参数:', props)

        // 提交渲染任务
        const renderResult = await this.remotionService.renderVideo(template.id, props, options)

        console.log('  - 渲染任务ID:', renderResult.renderId)

        // 轮询渲染进度
        const videoUrl = await this.pollRenderProgress(renderResult.renderId)

        // 下载视频为Blob
        const blob = await this.downloadVideoAsBlob(videoUrl)
        const url = URL.createObjectURL(blob)

        return {
          index: scene.id,
          sceneId: scene.id,
          blob,
          url,
          duration: scene.duration || 5,
          templateId: template.id
        }
      } catch (error) {
        retries++
        console.error(`  - 渲染失败 (尝试 ${retries}/${this.maxRetries}):`, error.message)

        if (retries >= this.maxRetries) {
          throw new Error(`场景 ${scene.id} 渲染失败: ${error.message}`)
        }

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
  }

  /**
   * 轮询渲染进度
   *
   * @param {string} renderId - 渲染任务ID
   * @returns {Promise<string>} 视频URL
   */
  async pollRenderProgress(renderId) {
    const startTime = Date.now()
    let isCompleted = false

    while (!isCompleted) {
      // 检查超时
      if (Date.now() - startTime > this.renderTimeout) {
        throw new Error('渲染超时')
      }

      try {
        const progress = await this.remotionService.getRenderProgress(renderId)

        console.log(`  - 渲染进度: ${(progress.progress * 100).toFixed(1)}%`)

        if (progress.status === 'completed') {
          console.log('  - 渲染完成,视频URL:', progress.videoUrl)
          return progress.videoUrl
        }

        if (progress.status === 'failed') {
          throw new Error(`渲染失败: ${progress.error}`)
        }

        // 等待后继续轮询
        await new Promise(resolve => setTimeout(resolve, this.pollInterval))
      } catch (error) {
        // 如果是网络错误,继续重试
        if (error.message.includes('fetch')) {
          await new Promise(resolve => setTimeout(resolve, this.pollInterval))
          continue
        }

        throw error
      }
    }
  }

  /**
   * 下载视频为Blob
   *
   * @param {string} videoUrl - 视频URL
   * @returns {Promise<Blob>} 视频Blob
   */
  async downloadVideoAsBlob(videoUrl) {
    try {
      const response = await fetch(videoUrl)

      if (!response.ok) {
        throw new Error('下载视频失败')
      }

      return await response.blob()
    } catch (error) {
      console.error('❌ 下载视频失败:', error)
      throw error
    }
  }

  /**
   * 取消渲染任务
   *
   * @param {string} renderId - 渲染任务ID
   */
  async cancelRender(renderId) {
    try {
      await this.remotionService.cancelRender(renderId)
      console.log('⚠️ 渲染任务已取消:', renderId)
    } catch (error) {
      console.error('❌ 取消渲染失败:', error)
    }
  }

  /**
   * 检查Remotion服务是否可用
   *
   * @returns {Promise<boolean>} 是否可用
   */
  async checkServiceAvailability() {
    return await this.remotionService.checkServiceAvailability()
  }

  /**
   * 获取可用模板列表
   *
   * @returns {Promise<Array>} 模板列表
   */
  async getAvailableTemplates() {
    const result = await this.remotionService.getAvailableTemplates()
    return result.templates || []
  }

  /**
   * 清理资源
   */
  cleanup() {
    console.log('🧹 RemotionRenderer 资源清理完成')
  }
}

// 导出类(不是单例,因为可能需要多个实例)
export default RemotionRenderer
