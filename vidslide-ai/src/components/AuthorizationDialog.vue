<template>
  <div v-if="visible" class="authorization-dialog-overlay" @click.stop>
    <div
      class="authorization-dialog"
      role="dialog"
      aria-labelledby="auth-dialog-title"
      aria-describedby="auth-dialog-description"
    >
      <!-- 头部 -->
      <div class="dialog-header">
        <h2 id="auth-dialog-title" class="dialog-title">
          <el-icon><warning /></el-icon>
          外部素材获取授权
        </h2>
        <button class="close-btn" aria-label="关闭对话框" @click="closeDialog">
          <el-icon><close /></el-icon>
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="dialog-content">
        <div id="auth-dialog-description" class="description">
          <p class="main-description">
            系统检测到需要外部素材来优化您的演示效果。为确保最佳体验，VidSlide
            AI需要您的授权来搜索相关图片素材。
          </p>
        </div>

        <!-- 授权详情 -->
        <div class="auth-details">
          <div class="detail-section">
            <h3 class="section-title">
              <el-icon><search /></el-icon>
              搜索信息
            </h3>
            <div class="detail-content">
              <div class="info-item">
                <label class="info-label">关键词:</label>
                <span class="info-value">{{ searchKeywords.join(', ') }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">翻译服务:</label>
                <span class="info-value">百度翻译API (关键词翻译为英文)</span>
              </div>
              <div class="info-item">
                <label class="info-label">搜索来源:</label>
                <span class="info-value">Unsplash, Pexels, Pixabay (仅免版税素材)</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title">
              <el-icon><Lock /></el-icon>
              隐私保护
            </h3>
            <div class="detail-content">
              <div class="privacy-item">
                <el-icon class="privacy-icon"><check /></el-icon>
                <span>仅传输关键词，不包含您的原始视频内容</span>
              </div>
              <div class="privacy-item">
                <el-icon class="privacy-icon"><check /></el-icon>
                <span>搜索结果仅在当前会话使用，不会保存历史</span>
              </div>
              <div class="privacy-item">
                <el-icon class="privacy-icon"><check /></el-icon>
                <span>本地缓存7天后自动清理</span>
              </div>
              <div class="privacy-item">
                <el-icon class="privacy-icon"><check /></el-icon>
                <span>您可以随时在设置中关闭外部访问</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 授权复选框 -->
        <div class="consent-section">
          <el-checkbox
            v-model="userConsent"
            class="consent-checkbox"
            aria-describedby="consent-description"
          >
            我已阅读并同意授权搜索外部素材
          </el-checkbox>
          <div id="consent-description" class="consent-description">
            勾选此框表示您同意VidSlide AI使用上述关键词搜索免版税图片素材，以优化您的演示效果。
          </div>
        </div>

        <!-- 替代选项 -->
        <div class="alternative-section">
          <h4 class="alternative-title">替代方案</h4>
          <div class="alternative-options">
            <el-button type="info" plain class="alternative-btn" @click="useLocalOnly">
              <el-icon><home-filled /></el-icon>
              仅使用本地素材
            </el-button>
            <span class="alternative-desc">使用预加载的1000+本地素材库，处理更快且完全离线</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="dialog-actions">
        <el-button class="cancel-btn" @click="closeDialog"> 取消 </el-button>
        <el-button
          type="primary"
          :disabled="!userConsent"
          class="confirm-btn"
          @click="confirmAuthorization"
        >
          确认授权
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Warning, Close, Search, Lock, Check, HomeFilled } from '@element-plus/icons-vue'

/**
 * 外部素材获取授权对话框
 *
 * 功能特性：
 * - 详细说明搜索关键词和API使用情况
 * - 明确的隐私保护说明
 * - 用户授权确认机制
 * - 提供本地素材替代方案
 *
 * @emits authorize - 用户确认授权时触发
 * @emits cancel - 用户取消或关闭对话框时触发
 * @emits use-local-only - 用户选择仅使用本地素材时触发
 */

// ==================== Props定义 ====================

const props = defineProps({
  /** 对话框是否可见 */
  visible: {
    type: Boolean,
    default: false
  },
  /** 搜索关键词数组 */
  searchKeywords: {
    type: Array,
    default: () => []
  }
})

// ==================== Emits定义 ====================

const emit = defineEmits([
  'authorize', // 用户确认授权
  'cancel', // 用户取消
  'use-local-only' // 用户选择仅使用本地素材
])

// ==================== 响应式数据 ====================

/** 用户授权状态 */
const userConsent = ref(false)

// ==================== 方法 ====================

/**
 * 关闭对话框
 */
const closeDialog = () => {
  userConsent.value = false
  emit('cancel')
}

/**
 * 确认授权
 */
const confirmAuthorization = () => {
  if (userConsent.value) {
    emit('authorize', {
      keywords: props.searchKeywords,
      timestamp: new Date().toISOString()
    })
    closeDialog()
  }
}

/**
 * 选择仅使用本地素材
 */
const useLocalOnly = () => {
  emit('use-local-only')
  closeDialog()
}

// ==================== 监听器 ====================

// 当对话框打开时重置状态
watch(
  () => props.visible,
  newVisible => {
    if (newVisible) {
      userConsent.value = false
    }
  }
)
</script>

<style scoped>
.authorization-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.authorization-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: dialogSlideIn 0.3s ease-out;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 24px;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #666;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.dialog-content {
  padding: 0 24px;
}

.description {
  margin-bottom: 24px;
}

.main-description {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin: 0;
}

.auth-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.detail-content {
  background: white;
  border-radius: 6px;
  padding: 16px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  align-items: flex-start;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
  flex-shrink: 0;
}

.info-value {
  color: #333;
  flex: 1;
  word-break: break-word;
}

.privacy-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

.privacy-item:last-child {
  margin-bottom: 0;
}

.privacy-icon {
  color: #67c23a;
  flex-shrink: 0;
  margin-top: 1px;
}

.consent-section {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.consent-checkbox {
  margin-bottom: 8px;
  font-weight: 500;
}

.consent-description {
  font-size: 14px;
  color: #856404;
  line-height: 1.5;
}

.alternative-section {
  background: #f0f9ff;
  border: 1px solid #b3e5fc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.alternative-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.alternative-options {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alternative-btn {
  flex-shrink: 0;
}

.alternative-desc {
  font-size: 14px;
  color: #666;
  flex: 1;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e5e5;
}

.cancel-btn {
  padding: 10px 24px;
}

.confirm-btn {
  padding: 10px 24px;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .authorization-dialog {
    width: 95%;
    margin: 20px;
  }

  .dialog-header {
    padding: 20px 20px 0 20px;
  }

  .dialog-content {
    padding: 0 20px;
  }

  .dialog-actions {
    padding: 20px;
    flex-direction: column;
  }

  .cancel-btn,
  .confirm-btn {
    width: 100%;
  }

  .alternative-options {
    flex-direction: column;
    align-items: stretch;
  }

  .alternative-desc {
    margin-top: 8px;
  }
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  .authorization-dialog {
    animation: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .authorization-dialog {
    border: 2px solid #000;
  }

  .detail-content,
  .consent-section,
  .alternative-section {
    border: 1px solid #000;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .authorization-dialog {
    background: #1a1a1a;
    color: #e5e5e5;
  }

  .dialog-title {
    color: #e5e5e5;
  }

  .main-description {
    color: #ccc;
  }

  .auth-details {
    background: #2a2a2a;
  }

  .detail-content {
    background: #1a1a1a;
  }

  .info-label {
    color: #aaa;
  }

  .info-value {
    color: #e5e5e5;
  }

  .privacy-item {
    color: #ccc;
  }

  .consent-section {
    background: #2a1a0a;
    border-color: #5a3a0a;
  }

  .consent-description {
    color: #d4a574;
  }

  .alternative-section {
    background: #0a1a2a;
    border-color: #0a3a5a;
  }
}
</style>
