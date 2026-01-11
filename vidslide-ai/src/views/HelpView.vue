<!--
  VidSlide AI - 帮助中心
  常见问题解答和故障排除指南
-->
<template>
  <div class="help-view">
    <div class="help-container">
      <header class="help-header">
        <h1>🆘 帮助中心</h1>
        <p>VidSlide AI 常见问题解答和技术支持</p>
      </header>

      <nav
class="help-nav" aria-label="帮助中心导航"
>
        <div class="nav-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['nav-tab', { active: activeTab === tab.id }]"
            :aria-selected="activeTab === tab.id"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </nav>

      <main class="help-content">
        <!-- 常见问题 -->
        <section
v-if="activeTab === 'faq'" class="help-section"
>
          <h2>❓ 常见问题</h2>

          <div class="faq-list">
            <details
v-for="faq in faqs" class="faq-item"
:key="faq.id"
>
              <summary class="faq-question">
                {{ faq.question }}
              </summary>
              <div
class="faq-answer" v-html="faq.answer"
/>
            </details>
          </div>
        </section>

        <!-- 故障排除 -->
        <section
v-if="activeTab === 'troubleshooting'" class="help-section"
>
          <h2>🔧 故障排除</h2>

          <div class="troubleshooting-grid">
            <article
v-for="issue in troubleshooting" :key="issue.id"
class="troubleshoot-card"
>
              <h3>{{ issue.title }}</h3>
              <p>{{ issue.description }}</p>
              <ol class="solution-steps">
                <li
v-for="step in issue.steps" :key="step"
>
                  {{ step }}
                </li>
              </ol>
            </article>
          </div>
        </section>

        <!-- 技术支持 -->
        <section
v-if="activeTab === 'support'" class="help-section"
>
          <h2>📞 技术支持</h2>

          <div class="support-options">
            <div class="support-card">
              <h3>📧 邮件支持</h3>
              <p>发送详细的问题描述和截图至：</p>
              <code>support@vidslide.ai</code>
            </div>

            <div class="support-card">
              <h3>📋 提交反馈</h3>
              <p>在GitHub上报告问题或建议新功能</p>
              <a
href="https://github.com/vidslide-ai/issues" target="_blank"
class="support-link"
>
                GitHub Issues
              </a>
            </div>

            <div class="support-card">
              <h3>📖 文档中心</h3>
              <p>查看详细的使用文档和API参考</p>
              <a
href="/docs" class="support-link"
>查看文档</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 导航标签
const tabs = [
  { id: 'faq', label: '常见问题' },
  { id: 'troubleshooting', label: '故障排除' },
  { id: 'support', label: '技术支持' }
]

const activeTab = ref('faq')

// 常见问题
const faqs = [
  {
    id: 'upload-failed',
    question: '视频上传失败怎么办？',
    answer: `
      <p>视频上传失败可能由以下原因造成：</p>
      <ul>
        <li>文件大小超过限制（最大500MB）</li>
        <li>网络连接不稳定</li>
        <li>浏览器不支持该视频格式</li>
      </ul>
      <p><strong>解决方案：</strong></p>
      <ul>
        <li>检查文件大小和格式</li>
        <li>尝试使用稳定的网络连接</li>
        <li>使用Chrome或Firefox浏览器</li>
      </ul>
    `
  },
  {
    id: 'processing-slow',
    question: '视频处理速度很慢怎么办？',
    answer: `
      <p>处理速度受以下因素影响：</p>
      <ul>
        <li>视频长度和质量</li>
        <li>服务器负载情况</li>
        <li>网络连接速度</li>
      </ul>
      <p><strong>建议：</strong></p>
      <ul>
        <li>上传较短的视频片段（建议5分钟以内）</li>
        <li>在网络较好的时间段使用</li>
        <li>避免同时处理多个视频</li>
      </ul>
    `
  },
  {
    id: 'template-not-working',
    question: '模板效果不理想怎么办？',
    answer: `
      <p>如果生成的效果不满意：</p>
      <ul>
        <li>尝试调整模板参数</li>
        <li>选择不同的模板类型</li>
        <li>优化原始视频质量</li>
      </ul>
      <p><strong>提示：</strong>不同的模板适用于不同类型的视频内容。</p>
    `
  }
]

// 故障排除
const troubleshooting = [
  {
    id: 'browser-issues',
    title: '浏览器兼容性问题',
    description: '某些浏览器可能不支持VidSlide AI的全部功能',
    steps: [
      '使用最新版本的Chrome、Firefox或Safari',
      '启用JavaScript功能',
      '清除浏览器缓存和Cookie',
      '尝试使用无痕浏览模式'
    ]
  },
  {
    id: 'network-issues',
    title: '网络连接问题',
    description: '网络不稳定可能导致上传或处理失败',
    steps: [
      '检查网络连接是否正常',
      '尝试使用不同的网络（WiFi/4G）',
      '关闭VPN或代理服务器',
      '等待网络恢复后重试'
    ]
  },
  {
    id: 'performance-issues',
    title: '性能问题',
    description: '应用运行缓慢或卡顿',
    steps: ['关闭其他浏览器标签页', '重启浏览器', '检查计算机内存使用情况', '更新浏览器到最新版本']
  }
]
</script>

<style scoped>
.help-view {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;
}

.help-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.help-header {
  text-align: center;
  margin-bottom: 3rem;
}

.help-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.help-header p {
  font-size: 1.2rem;
  color: #6c757d;
}

.help-nav {
  margin-bottom: 2rem;
}

.nav-tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.nav-tab {
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1.1rem;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-tab:hover {
  color: #007bff;
}

.nav-tab.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.help-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.help-section h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.faq-question {
  padding: 1.5rem;
  background: #f8f9fa;
  font-weight: 600;
  cursor: pointer;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 1.1rem;
}

.faq-question:hover {
  background: #e9ecef;
}

.faq-answer {
  padding: 1.5rem;
  line-height: 1.6;
}

.troubleshooting-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.troubleshoot-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f8f9fa;
}

.troubleshoot-card h3 {
  color: #dc3545;
  margin-bottom: 0.5rem;
}

.troubleshoot-card p {
  color: #6c757d;
  margin-bottom: 1rem;
}

.solution-steps {
  padding-left: 1.5rem;
}

.solution-steps li {
  margin-bottom: 0.5rem;
  color: #495057;
}

.support-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.support-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  background: #f8f9fa;
}

.support-card h3 {
  color: #28a745;
  margin-bottom: 1rem;
}

.support-card p {
  color: #6c757d;
  margin-bottom: 1rem;
}

.support-card code {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.support-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.support-link:hover {
  background: #0056b3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .help-container {
    padding: 0 1rem;
  }

  .nav-tabs {
    flex-direction: column;
  }

  .nav-tab {
    text-align: center;
  }

  .troubleshooting-grid,
  .support-options {
    grid-template-columns: 1fr;
  }

  .help-header h1 {
    font-size: 2rem;
  }
}
</style>
