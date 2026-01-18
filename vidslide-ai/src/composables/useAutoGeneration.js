/**
 * VidSlide AI - 自动化生成 Composable
 *
 * 提供自动化生成的逻辑和状态
 */

import { computed } from 'vue'
import { useAutoGenerationStore } from '@/stores/autoGenerationStore'
import { ElMessage } from 'element-plus'

export function useAutoGeneration() {
  const autoGenStore = useAutoGenerationStore()

  // 计算属性
  const isProcessing = computed(() => autoGenStore.isProcessing)
  const progress = computed(() => autoGenStore.progress)
  const currentStep = computed(() => autoGenStore.currentStep)
  const showProgress = computed(() => autoGenStore.showProgress)
  const showResult = computed(() => autoGenStore.showResult)
  const result = computed(() => autoGenStore.result)
  const error = computed(() => autoGenStore.error)
  const canStartGeneration = computed(() => autoGenStore.canStartGeneration)
  const canExport = computed(() => autoGenStore.canExport)
  const isPreviewReady = computed(() => autoGenStore.isPreviewReady)

  /**
   * 一键自动生成
   * @param {File} videoFile - 视频文件
   * @returns {Promise<Object>} 生成结果
   */
  const autoGenerate = async videoFile => {
    if (!videoFile) {
      ElMessage.error('请先上传视频!')
      return
    }

    if (!canStartGeneration.value) {
      ElMessage.warning('正在处理中，请稍候...')
      return
    }

    try {
      console.log('🚀 Composable: 开始一键自动生成...')

      const result = await autoGenStore.startAutoGeneration(videoFile)

      console.log('✅ Composable: 自动生成完成!', result)
      ElMessage.success('自动生成完成!')

      return result
    } catch (error) {
      console.error('❌ Composable: 自动生成失败:', error)
      ElMessage.error(`生成失败: ${error.message}`)
      throw error
    }
  }

  /**
   * 取消生成
   */
  const cancelGeneration = () => {
    autoGenStore.cancelGeneration()
    ElMessage.info('已取消生成')
  }

  /**
   * 关闭结果预览
   */
  const closeResult = () => {
    autoGenStore.closeResult()
  }

  /**
   * 重新生成
   * @param {File} videoFile - 视频文件
   * @returns {Promise<Object>} 生成结果
   */
  const regenerate = async videoFile => {
    autoGenStore.reset()
    return await autoGenerate(videoFile)
  }

  /**
   * 重置状态
   */
  const reset = () => {
    autoGenStore.reset()
  }

  return {
    // 状态
    isProcessing,
    progress,
    currentStep,
    showProgress,
    showResult,
    result,
    error,
    canStartGeneration,
    canExport,
    isPreviewReady,

    // 方法
    autoGenerate,
    cancelGeneration,
    closeResult,
    regenerate,
    reset
  }
}
