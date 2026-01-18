/**
 * VidSlide AI - 自动化生成状态管理
 *
 * 管理一键自动生成的状态和流程
 */

import { defineStore } from 'pinia'
import { getMasterAutoGenerationAgent } from '@/services/MasterAutoGenerationAgent'

export const useAutoGenerationStore = defineStore('autoGeneration', {
  state: () => ({
    // 自动化引擎
    agent: null,

    // 处理状态
    isProcessing: false,
    currentStep: '',
    progress: 0,

    // 结果
    result: null,
    error: null,

    // UI状态
    showProgress: false,
    showResult: false
  }),

  getters: {
    /**
     * 是否可以开始生成
     */
    canStartGeneration: state => !state.isProcessing,

    /**
     * 是否有结果
     */
    hasResult: state => state.result !== null,

    /**
     * 是否可以导出
     */
    canExport: state => state.result?.canExport || false,

    /**
     * 是否预览就绪
     */
    isPreviewReady: state => state.result?.previewReady || false
  },

  actions: {
    /**
     * 初始化Agent
     */
    initAgent() {
      if (!this.agent) {
        this.agent = getMasterAutoGenerationAgent()
      }
    },

    /**
     * 开始自动生成
     * @param {File} videoFile - 视频文件
     * @returns {Promise<Object>} 生成结果
     */
    async startAutoGeneration(videoFile) {
      this.initAgent()

      this.isProcessing = true
      this.showProgress = true
      this.progress = 0
      this.error = null
      this.result = null

      try {
        console.log('🚀 Store: 开始自动生成...')

        const result = await this.agent.autoGenerate(videoFile, this.handleProgress.bind(this))

        console.log('✅ Store: 自动生成完成', result)

        this.result = result
        this.showProgress = false
        this.showResult = true

        return result
      } catch (error) {
        console.error('❌ Store: 自动生成失败', error)
        this.error = error.message
        this.showProgress = false
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    /**
     * 处理进度更新
     * @param {Object} progressData - {step: string, progress: number}
     */
    handleProgress({ step, progress }) {
      this.currentStep = step
      this.progress = progress
      console.log(`📊 进度: ${progress}% - ${step}`)
    },

    /**
     * 取消生成
     */
    cancelGeneration() {
      if (this.agent) {
        this.agent.cancel()
      }
      this.isProcessing = false
      this.showProgress = false
      this.progress = 0
      console.log('🛑 Store: 已取消生成')
    },

    /**
     * 关闭结果预览
     */
    closeResult() {
      this.showResult = false
    },

    /**
     * 重置状态
     */
    reset() {
      this.isProcessing = false
      this.currentStep = ''
      this.progress = 0
      this.result = null
      this.error = null
      this.showProgress = false
      this.showResult = false
      console.log('🔄 Store: 状态已重置')
    }
  }
})
