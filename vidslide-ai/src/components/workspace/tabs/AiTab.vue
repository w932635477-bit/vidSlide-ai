<template>
  <div class="ai-tab">
    <div class="ai-assistant">
      <div class="ai-header">
        <h3>🤖 AI助手</h3>
        <p>智能辅助您完成视频编辑</p>
      </div>

      <div class="ai-suggestions">
        <h4>智能建议</h4>
        <div class="suggestions-list">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            class="suggestion-card"
            @click="applySuggestion(suggestion)"
          >
            <span class="suggestion-icon">{{ suggestion.icon }}</span>
            <div class="suggestion-content">
              <h5>{{ suggestion.title }}</h5>
              <p>{{ suggestion.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="ai-chat">
        <h4>AI对话</h4>
        <div class="chat-messages">
          <div class="message ai-message">
            <span class="message-icon">🤖</span>
            <div class="message-content">
              您好！我是AI助手，可以帮您优化视频编辑。有什么需要帮助的吗？
            </div>
          </div>
        </div>
        <div class="chat-input">
          <input type="text" placeholder="输入您的问题..." @keyup.enter="sendMessage" />
          <button class="send-btn">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 智能建议
const suggestions = ref([
  {
    id: 1,
    icon: '✨',
    title: '优化视频质量',
    description: '自动调整亮度、对比度和色彩'
  },
  {
    id: 2,
    icon: '🎬',
    title: '智能剪辑',
    description: '根据内容自动生成精彩片段'
  },
  {
    id: 3,
    icon: '🎵',
    title: '添加背景音乐',
    description: '根据视频氛围推荐合适的音乐'
  },
  {
    id: 4,
    icon: '📝',
    title: '生成字幕',
    description: '自动识别语音并生成字幕'
  }
])

// 应用建议
const applySuggestion = suggestion => {
  ElMessage.info(`正在应用: ${suggestion.title}`)
  console.log('应用建议:', suggestion)
}

// 发送消息
const sendMessage = event => {
  const message = event.target.value.trim()
  if (message) {
    console.log('发送消息:', message)
    ElMessage.info('AI助手功能开发中...')
    event.target.value = ''
  }
}
</script>

<style scoped>
.ai-tab {
  height: 100%;
  overflow: auto;
}

.ai-assistant {
  padding: 20px;
}

.ai-header {
  margin-bottom: 24px;
}

.ai-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.ai-header p {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.ai-suggestions {
  margin-bottom: 24px;
}

.ai-suggestions h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
}

.suggestions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.suggestion-card {
  padding: 16px;
  border: 1px solid #e5e5e7;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  gap: 12px;
  transition: all 0.2s;
}

.suggestion-card:hover {
  border-color: #007aff;
  background: #f8f9fa;
}

.suggestion-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.suggestion-content h5 {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.suggestion-content p {
  font-size: 12px;
  color: #86868b;
  margin: 0;
}

.ai-chat h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
}

.chat-messages {
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.message-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  padding: 12px;
  background: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.chat-input {
  display: flex;
  gap: 8px;
}

.chat-input input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e5e5e7;
  border-radius: 8px;
  font-size: 14px;
}

.chat-input input:focus {
  outline: none;
  border-color: #007aff;
}

.send-btn {
  padding: 10px 24px;
  border: none;
  background: #007aff;
  color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover {
  background: #0056cc;
}
</style>
