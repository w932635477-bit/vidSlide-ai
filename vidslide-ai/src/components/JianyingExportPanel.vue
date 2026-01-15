<template>
  <div class="jianying-export-panel">
    <!-- 导出按钮 -->
    <button
      class="export-btn"
      @click="showExportDialog = true"
      :disabled="!selectedTemplate"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      导出到剪映
    </button>

    <!-- 导出对话框 -->
    <div v-if="showExportDialog" class="export-dialog-overlay" @click.self="showExportDialog = false">
      <div class="export-dialog">
        <div class="dialog-header">
          <h3>导出到剪映</h3>
          <button class="close-btn" @click="showExportDialog = false">&times;</button>
        </div>

        <div class="dialog-content">
          <!-- 模板选择 -->
          <div class="section">
            <label>选择模板</label>
            <select v-model="selectedTemplateId" class="template-select">
              <option value="">请选择模板</option>
              <option
                v-for="template in exportableTemplates"
                :key="template.id"
                :value="template.id"
              >
                {{ template.name }}
                <span v-if="template.hasJianyingPreset"> (推荐)</span>
              </option>
            </select>
          </div>

          <!-- 内容输入 -->
          <div class="section">
            <label>标题文字</label>
            <input
              v-model="exportContent.title"
              type="text"
              placeholder="输入主标题"
              class="text-input"
            />
          </div>

          <div class="section">
            <label>副标题</label>
            <input
              v-model="exportContent.subtitle"
              type="text"
              placeholder="输入副标题（可选）"
              class="text-input"
            />
          </div>

          <div class="section">
            <label>关键词（用逗号分隔）</label>
            <input
              v-model="keywordsInput"
              type="text"
              placeholder="关键词1, 关键词2, 关键词3"
              class="text-input"
            />
          </div>

          <div class="section">
            <label>视频时长</label>
            <select v-model="exportContent.duration" class="duration-select">
              <option :value="3000000">3秒</option>
              <option :value="5000000">5秒</option>
              <option :value="10000000">10秒</option>
              <option :value="15000000">15秒</option>
              <option :value="30000000">30秒</option>
              <option :value="60000000">60秒</option>
            </select>
          </div>

          <!-- 预览信息 -->
          <div v-if="selectedTemplateId" class="preview-info">
            <div class="preview-header">模板预览</div>
            <div class="preview-content">
              <div class="preview-item">
                <span class="label">剪映风格:</span>
                <span class="value">{{ currentPreset?.jianyingStyle || '默认' }}</span>
              </div>
              <div class="preview-item">
                <span class="label">推荐动画:</span>
                <span class="value">{{ currentPreset?.animations?.join(', ') || '无' }}</span>
              </div>
              <div class="preview-item">
                <span class="label">推荐滤镜:</span>
                <span class="value">{{ currentPreset?.filters?.join(', ') || '无' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn-secondary" @click="showExportDialog = false">取消</button>
          <button
            class="btn-primary"
            @click="handleExport"
            :disabled="!selectedTemplateId || isExporting"
          >
            <span v-if="isExporting">导出中...</span>
            <span v-else>下载草稿文件</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 导出成功提示 -->
    <div v-if="showSuccessDialog" class="success-dialog-overlay" @click.self="showSuccessDialog = false">
      <div class="success-dialog">
        <div class="success-icon">✓</div>
        <h3>导出成功！</h3>
        <p>草稿文件已下载，请按以下步骤导入剪映：</p>

        <div class="instructions">
          <div v-for="(step, index) in importInstructions.steps" :key="index" class="step">
            {{ step }}
          </div>
        </div>

        <div class="tips">
          <div class="tips-header">小贴士：</div>
          <ul>
            <li v-for="(tip, index) in importInstructions.tips" :key="index">{{ tip }}</li>
          </ul>
        </div>

        <button class="btn-primary" @click="showSuccessDialog = false">知道了</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import JianyingTemplateConverter from '../services/JianyingTemplateConverter.js'

export default {
  name: 'JianyingExportPanel',

  props: {
    selectedTemplate: {
      type: Object,
      default: null
    }
  },

  setup(props) {
    const showExportDialog = ref(false)
    const showSuccessDialog = ref(false)
    const isExporting = ref(false)
    const exportableTemplates = ref([])
    const selectedTemplateId = ref('')
    const keywordsInput = ref('')
    const importInstructions = ref({})

    const exportContent = ref({
      title: '',
      subtitle: '',
      keywords: [],
      duration: 5000000
    })

    // 当前选中模板的预设
    const currentPreset = computed(() => {
      if (!selectedTemplateId.value) return null
      return JianyingTemplateConverter.jianyingPresets[selectedTemplateId.value]
    })

    // 加载可导出的模板列表
    const loadTemplates = async () => {
      try {
        exportableTemplates.value = await JianyingTemplateConverter.getExportableTemplates()
      } catch (error) {
        console.error('加载模板列表失败:', error)
      }
    }

    // 处理导出
    const handleExport = async () => {
      if (!selectedTemplateId.value) return

      isExporting.value = true

      try {
        // 解析关键词
        const keywords = keywordsInput.value
          .split(/[,，]/)
          .map(k => k.trim())
          .filter(k => k.length > 0)

        const content = {
          ...exportContent.value,
          keywords
        }

        const result = await JianyingTemplateConverter.exportDraft(
          selectedTemplateId.value,
          content
        )

        // 触发下载
        const link = document.createElement('a')
        link.href = result.downloadUrl
        link.download = result.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 清理URL
        URL.revokeObjectURL(result.downloadUrl)

        // 保存导入说明
        importInstructions.value = result.instructions

        // 显示成功对话框
        showExportDialog.value = false
        showSuccessDialog.value = true

      } catch (error) {
        console.error('导出失败:', error)
        alert('导出失败: ' + error.message)
      } finally {
        isExporting.value = false
      }
    }

    // 监听外部模板选择
    onMounted(() => {
      loadTemplates()

      if (props.selectedTemplate) {
        selectedTemplateId.value = props.selectedTemplate.id
      }
    })

    return {
      showExportDialog,
      showSuccessDialog,
      isExporting,
      exportableTemplates,
      selectedTemplateId,
      keywordsInput,
      exportContent,
      currentPreset,
      importInstructions,
      handleExport
    }
  }
}
</script>

<style scoped>
.jianying-export-panel {
  position: relative;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #FF0050 0%, #FF4081 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 0, 80, 0.3);
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 0, 80, 0.4);
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-btn .icon {
  width: 18px;
  height: 18px;
}

/* 对话框遮罩 */
.export-dialog-overlay,
.success-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

/* 导出对话框 */
.export-dialog {
  background: #1a1a1a;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.dialog-content {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.section {
  margin-bottom: 20px;
}

.section label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #999;
}

.template-select,
.duration-select,
.text-input {
  width: 100%;
  padding: 12px 16px;
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.template-select:focus,
.duration-select:focus,
.text-input:focus {
  border-color: #FF0050;
}

.text-input::placeholder {
  color: #666;
}

/* 预览信息 */
.preview-info {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
}

.preview-header {
  font-size: 14px;
  font-weight: 600;
  color: #FF0050;
  margin-bottom: 12px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-item .label {
  color: #999;
  font-size: 13px;
}

.preview-item .value {
  color: #fff;
  font-size: 13px;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary {
  padding: 12px 24px;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-secondary:hover {
  background: #444;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #FF0050 0%, #FF4081 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 0, 80, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 成功对话框 */
.success-dialog {
  background: #1a1a1a;
  border-radius: 20px;
  padding: 32px;
  width: 90%;
  max-width: 450px;
  text-align: center;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
  margin: 0 auto 20px;
}

.success-dialog h3 {
  margin: 0 0 12px;
  font-size: 20px;
  color: #fff;
}

.success-dialog p {
  margin: 0 0 20px;
  color: #999;
  font-size: 14px;
}

.instructions {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  text-align: left;
  margin-bottom: 16px;
}

.step {
  padding: 8px 0;
  color: #ccc;
  font-size: 13px;
  line-height: 1.6;
  border-bottom: 1px solid #333;
}

.step:last-child {
  border-bottom: none;
}

.tips {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  text-align: left;
  margin-bottom: 20px;
}

.tips-header {
  color: #FFD700;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.tips ul {
  margin: 0;
  padding-left: 20px;
}

.tips li {
  color: #ccc;
  font-size: 12px;
  line-height: 1.8;
}
</style>
