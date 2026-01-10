/** * HomeView.vue - VidSlide AI 首页 * 完全复刻桌面UI设计图 */

<template>
  <div class="vidslide-home">
    <!-- 顶部导航栏 -->
    <nav class="vidslide-navbar">
      <div class="navbar-container">
        <!-- 左侧Logo -->
        <a href="/" class="navbar-logo">
          <div class="navbar-logo-icon">
            <div class="logo-icon-bg" />
            <div class="logo-icon-glow" />
            <span class="logo-letter">V</span>
            <div class="logo-icon-shine" />
          </div>
          <span class="logo-text">
            <span class="logo-text-main">VidSlide</span>
            <span class="logo-text-ai">AI</span>
          </span>
        </a>

        <!-- 中间导航链接 -->
        <div class="navbar-nav">
          <a href="#features" class="navbar-nav-link">产品特点</a>
          <a href="#workspace" class="navbar-nav-link">工作空间</a>
          <a href="#pricing" class="navbar-nav-link">定价</a>
          <a href="#about" class="navbar-nav-link">关于我们</a>
        </div>

        <!-- 右侧操作按钮 -->
        <div class="navbar-actions">
          <!-- 多语言切换按钮 -->
          <div class="lang-switcher-wrapper" :class="{ 'show-menu': showLangMenu }">
            <button class="btn-lang-switcher" @click="toggleLangMenu" :title="currentLang.name">
              <span class="lang-flag">{{ currentLang.flag }}</span>
              <span class="lang-code">{{ currentLang.code }}</span>
              <span class="lang-arrow">▼</span>
            </button>
            <!-- 语言下拉菜单占位 -->
            <div ref="langMenuRef" />
          </div>
          <button class="btn-login">登录</button>
          <button class="btn-signup">注册</button>
        </div>
      </div>
    </nav>

    <!-- 语言下拉菜单 - 使用Teleport渲染到body -->
    <Teleport to="body">
      <div v-if="showLangMenu" class="lang-menu" :style="langMenuStyle" @click.stop>
        <button
          v-for="lang in languages"
          :key="lang.code"
          class="lang-menu-item"
          :class="{ active: currentLang.code === lang.code }"
          @click="switchLanguage(lang)"
        >
          <span class="lang-flag">{{ lang.flag }}</span>
          <span class="lang-name">{{ lang.name }}</span>
          <span class="lang-code-small">{{ lang.code }}</span>
        </button>
      </div>
    </Teleport>

    <!-- 英雄区域 -->
    <section class="hero-section">
      <!-- 左侧内容区域 -->
      <div class="hero-content">
        <!-- AI驱动标签 -->
        <div class="hero-tag">
          <div class="hero-tag-dot" />
          AI 驱动的视频转演示文稿
        </div>

        <!-- 主标题 -->
        <h1 class="hero-title">从视频到 完美演示文稿</h1>

        <!-- 副标题 -->
        <p class="hero-subtitle">
          上传视频，让 AI 自动分析并生成同步演示文稿。节省 80% 的内容创作时间。
        </p>

        <!-- 按钮组 -->
        <div class="hero-buttons">
          <button class="btn-primary-large" onclick="window.location.hash = '#/workspace'">
            免费开始 →
          </button>
          <button class="btn-secondary-large" @click="watchDemo">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M8 5v14l11-7z" />
            </svg>
            观看演示
          </button>
        </div>

        <!-- 底部指示器 -->
        <div class="hero-indicators">
          <div class="indicator-dots">
            <div class="indicator-dot active" />
            <div class="indicator-dot" />
            <div class="indicator-dot" />
            <div class="indicator-dot" />
          </div>
          <span class="indicator-text">10,000 + 创作者正在使用</span>
        </div>
      </div>

      <!-- 右侧手机展示区 -->
      <div class="hero-showcase">
        <!-- 科技光效背景 -->
        <div class="tech-effects">
          <div class="tech-lightning" />
          <div class="tech-lightning" />
          <div class="tech-lines" />
          <div class="tech-lines" />
        </div>

        <!-- 手机模型 -->
        <div class="phone-mockup">
          <div class="phone-screen">
            <!-- 手机顶部状态栏 -->
            <div class="phone-status-bar">
              <span class="status-time">9:16</span>
              <div class="status-icons">
                <span class="status-icon wifi-icon">📶</span>
                <span class="status-icon battery-icon">🔋</span>
              </div>
            </div>

            <!-- 应用顶部栏 -->
            <div class="app-header">
              <button class="app-menu-btn">☰</button>
              <span class="app-name">Saapte</span>
              <div class="app-header-actions">
                <button class="app-search-btn">🔍</button>
                <button class="app-more-btn">⋯</button>
              </div>
            </div>

            <!-- 聊天气泡区域 -->
            <div class="chat-bubbles">
              <div class="chat-bubble">Grioidy kath lleppik!</div>
              <div class="chat-bubble">Gumiijos alService</div>
            </div>

            <!-- 上传区域 - 动画展示区 -->
            <div class="upload-section">
              <div class="upload-header">
                {{ animationStepText }}
              </div>

              <!-- 步骤1: 视频上传 -->
              <div v-if="animationStep === 1" class="animation-step step-upload">
                <div class="upload-area">
                  <button class="upload-btn-left">
                    <span class="upload-icon">📤</span>
                    Upload
                  </button>
                  <div class="file-icon-container">
                    <div class="file-icon-large">
                      <div class="file-icon-content">
                        <div class="laptop-person">💻👤</div>
                      </div>
                    </div>
                    <div class="cursor-hand">👆</div>
                  </div>
                </div>
                <div class="upload-progress">
                  <div class="progress-bar" :style="{ width: uploadProgress + '%' }" />
                </div>
              </div>

              <!-- 步骤2: AI分析视频 -->
              <div v-if="animationStep === 2" class="animation-step step-analyze">
                <div class="analyze-container">
                  <div class="analyze-icon">🤖</div>
                  <div class="analyze-text">AI Analyzing Video...</div>
                  <div class="analyze-progress">
                    <div class="progress-bar" :style="{ width: analyzeProgress + '%' }" />
                  </div>
                  <!-- 粒子效果 -->
                  <div class="particles">
                    <div v-for="i in 12" :key="i" class="particle" :style="getParticleStyle(i)" />
                  </div>
                </div>
              </div>

              <!-- 步骤3: 生成PPT -->
              <div v-if="animationStep === 3" class="animation-step step-generate">
                <div class="generate-container">
                  <div class="ppt-preview">
                    <div
                      v-for="(slide, index) in pptSlides"
                      :key="index"
                      class="ppt-slide"
                      :class="{ active: index === currentSlideIndex }"
                    >
                      <div class="slide-content">
                        <div class="slide-title">
                          {{ slide.title }}
                        </div>
                        <div class="slide-bullets">
                          <div v-for="(bullet, bi) in slide.bullets" :key="bi" class="slide-bullet">
                            {{ bullet }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="generate-progress">
                    <div class="progress-text">
                      Generating Slides: {{ currentSlideIndex + 1 }}/{{ pptSlides.length }}
                    </div>
                    <div class="progress-bar" :style="{ width: generateProgress + '%' }" />
                  </div>
                </div>
              </div>

              <!-- 步骤4: 合成视频 - 画中画效果 -->
              <div v-if="animationStep === 4" class="animation-step step-compose">
                <div class="compose-container">
                  <div class="video-preview">
                    <div class="video-frame">
                      <div class="video-content">
                        <!-- 主视频背景 -->
                        <div class="main-video-bg">
                          <div class="video-pattern" />
                        </div>

                        <!-- PPT幻灯片 - 各种专业效果 -->
                        <div class="ppt-overlay">
                          <div
                            v-for="(slide, index) in pptSlides"
                            :key="index"
                            class="ppt-slide-overlay"
                            :class="getSlideAnimationClass(index)"
                            :style="getSlideOverlayStyle(index)"
                          >
                            <div class="slide-background" />
                            <div class="slide-content-overlay">
                              <div class="overlay-title">
                                {{ slide.title }}
                              </div>
                              <div class="overlay-bullets">
                                <div
                                  v-for="(bullet, bi) in slide.bullets"
                                  :key="bi"
                                  class="overlay-bullet"
                                >
                                  {{ bullet }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- 画中画人物视频 -->
                        <div
                          class="pip-person"
                          :class="{
                            'pip-minimized': isPipMinimized,
                            'pip-expanded': isPipExpanded
                          }"
                          :style="getPipStyle()"
                        >
                          <div class="pip-video-frame">
                            <div class="pip-person-icon">👤</div>
                            <div class="pip-wave" />
                          </div>
                        </div>

                        <!-- 视频时间轴 -->
                        <div class="video-timeline">
                          <div
                            class="timeline-progress"
                            :style="{ width: composeProgress + '%' }"
                          />
                          <div class="timeline-markers">
                            <div
                              v-for="(slide, index) in pptSlides"
                              :key="index"
                              class="timeline-marker"
                              :style="{ left: (index + 1) * 25 + '%' }"
                              :class="{ active: composeProgress >= (index + 1) * 25 }"
                            >
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="compose-progress">
                    <div class="progress-text">Composing Video with PPT Effects...</div>
                    <div class="progress-bar" :style="{ width: composeProgress + '%' }" />
                  </div>
                </div>
              </div>

              <!-- 步骤5: 完成 -->
              <div v-if="animationStep === 5" class="animation-step step-done">
                <div class="done-container">
                  <div class="done-icon-large">✅</div>
                  <div class="done-text">Video Ready!</div>
                  <div class="done-subtext">PPT slides inserted successfully</div>
                </div>
              </div>
            </div>

            <!-- 演示文稿列表 -->
            <div class="presentations-section">
              <div class="presentations-header">Presente</div>

              <div class="presentations-list">
                <div class="presentation-item">
                  <span class="presentation-name">Usmay.Lob</span>
                  <div class="presentation-actions">
                    <button class="action-icon">🔄</button>
                    <button class="action-icon">🔍</button>
                  </div>
                </div>

                <div class="presentation-item">
                  <span class="presentation-name">Dullyeebenit.npr</span>
                  <button class="action-icon">📷</button>
                </div>

                <button class="presentation-action-btn">Rrove.Soncilim</button>
              </div>

              <!-- 底部桌子图片 -->
              <div class="desk-image">
                <div class="desk-content">🖥️🪑</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      currentStep: 0,
      steps: [
        { title: 'Upload', icon: '📤', description: '上传你的视频内容' },
        { title: 'AI Magic', icon: '🤖', description: 'AI智能分析处理' },
        { title: 'Done!', icon: '✅', description: '生成专业PPT演示' }
      ],
      stepInterval: null,
      showLangMenu: false,
      langMenuStyle: {
        position: 'fixed',
        top: '0px',
        right: '0px'
      },
      langMenuRef: null,
      currentLang: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳'
      },
      languages: [
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
      ],
      // 动画状态
      animationStep: 1,
      uploadProgress: 0,
      analyzeProgress: 0,
      generateProgress: 0,
      composeProgress: 0,
      currentSlideIndex: 0,
      animationInterval: null,
      isPipMinimized: false,
      isPipExpanded: false,
      pipPosition: { x: 50, y: 50 },
      pptSlides: [
        { title: 'Introduction', bullets: ['Welcome', 'Overview', 'Agenda'], effect: 'fade' },
        { title: 'Key Points', bullets: ['Point 1', 'Point 2', 'Point 3'], effect: 'slide' },
        { title: 'Analysis', bullets: ['Data', 'Insights', 'Conclusion'], effect: 'zoom' },
        { title: 'Summary', bullets: ['Recap', 'Next Steps', 'Q&A'], effect: 'rotate' }
      ]
    }
  },
  computed: {
    animationStepText() {
      const texts = {
        1: 'Upload Your Video',
        2: 'AI Analyzing...',
        3: 'Generating PPT...',
        4: 'Composing Video...',
        5: 'Done!'
      }
      return texts[this.animationStep] || 'Upload Your Video'
    }
  },
  mounted() {
    // 启动步骤动画循环
    this.startStepAnimation()
    // 启动演示动画
    this.startDemoAnimation()
    // 点击外部关闭语言菜单
    document.addEventListener('click', this.handleClickOutside)
    // 从本地存储加载语言设置
    const savedLang = localStorage.getItem('vidslide-lang')
    if (savedLang) {
      const lang = this.languages.find(l => l.code === savedLang)
      if (lang) {
        this.currentLang = lang
      }
    }
  },
  beforeUnmount() {
    // 清理定时器
    if (this.stepInterval) {
      clearInterval(this.stepInterval)
    }
    if (this.animationInterval) {
      clearInterval(this.animationInterval)
    }
    // 移除事件监听
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    startStepAnimation() {
      this.stepInterval = setInterval(() => {
        this.currentStep = (this.currentStep + 1) % this.steps.length
      }, 3000) // 每3秒切换一步
    },

    startFree() {
      // 跳转到工作页面
      console.log('Start Free button clicked')
      // 直接使用hash模式跳转
      window.location.hash = '#/workspace'
    },

    watchDemo() {
      // 播放演示视频
      console.log('观看演示视频')
      // 这里可以添加视频播放逻辑
    },

    toggleLangMenu(event) {
      this.showLangMenu = !this.showLangMenu
      if (this.showLangMenu) {
        // 计算下拉菜单位置
        this.$nextTick(() => {
          const button = event.target.closest('.btn-lang-switcher')
          if (button) {
            const rect = button.getBoundingClientRect()
            this.langMenuStyle = {
              position: 'fixed',
              top: `${rect.bottom + 8}px`,
              right: `${window.innerWidth - rect.right}px`,
              zIndex: '99999'
            }
          }
        })
      } else {
        // 重置样式
        this.langMenuStyle = {
          position: 'fixed',
          top: '0px',
          right: '0px'
        }
      }
    },

    switchLanguage(lang) {
      this.currentLang = lang
      this.showLangMenu = false
      // 保存到本地存储
      localStorage.setItem('vidslide-lang', lang.code)
      // 这里可以添加实际的语言切换逻辑
      console.log('切换语言到:', lang.name)
    },

    handleClickOutside(event) {
      const wrapper = event.target.closest('.lang-switcher-wrapper')
      if (!wrapper && this.showLangMenu) {
        this.showLangMenu = false
      }
    },

    startDemoAnimation() {
      // 重置状态
      this.animationStep = 1
      this.uploadProgress = 0
      this.analyzeProgress = 0
      this.generateProgress = 0
      this.composeProgress = 0
      this.currentSlideIndex = 0

      // 步骤1: 上传视频 (2秒)
      const uploadInterval = setInterval(() => {
        this.uploadProgress += 2
        if (this.uploadProgress >= 100) {
          clearInterval(uploadInterval)
          setTimeout(() => {
            this.animationStep = 2
            this.startAnalyzeAnimation()
          }, 500)
        }
      }, 40)

      // 循环动画
      setTimeout(() => {
        if (this.animationStep === 5) {
          setTimeout(() => {
            this.startDemoAnimation()
          }, 2000)
        }
      }, 20000)
    },

    startAnalyzeAnimation() {
      // 步骤2: AI分析 (3秒)
      const analyzeInterval = setInterval(() => {
        this.analyzeProgress += 1.67
        if (this.analyzeProgress >= 100) {
          clearInterval(analyzeInterval)
          setTimeout(() => {
            this.animationStep = 3
            this.startGenerateAnimation()
          }, 500)
        }
      }, 50)
    },

    startGenerateAnimation() {
      // 步骤3: 生成PPT (4秒)
      this.currentSlideIndex = 0
      const slideInterval = setInterval(() => {
        this.generateProgress += 2.5
        if (this.generateProgress >= 100) {
          clearInterval(slideInterval)
          setTimeout(() => {
            this.animationStep = 4
            this.startComposeAnimation()
          }, 500)
        } else if (this.generateProgress >= (this.currentSlideIndex + 1) * 25) {
          this.currentSlideIndex++
        }
      }, 100)
    },

    startComposeAnimation() {
      // 步骤4: 合成视频 (4秒，更长时间展示效果)
      this.isPipMinimized = false
      this.isPipExpanded = false

      const composeInterval = setInterval(() => {
        this.composeProgress += 1.25 // 4秒完成 (100 / 80 = 1.25)

        // 控制画中画状态
        if (this.composeProgress >= 25 && !this.isPipMinimized) {
          this.isPipMinimized = true
        }
        if (this.composeProgress >= 75 && !this.isPipExpanded) {
          this.isPipExpanded = true
        }

        if (this.composeProgress >= 100) {
          clearInterval(composeInterval)
          setTimeout(() => {
            this.animationStep = 5
            setTimeout(() => {
              this.startDemoAnimation() // 重新开始循环
            }, 2000)
          }, 500)
        }
      }, 50)
    },

    getParticleStyle(index) {
      const angle = (index * 30 * Math.PI) / 180
      const radius = 30 + Math.sin(Date.now() / 500 + index) * 10
      return {
        left: `${50 + Math.cos(angle) * radius}%`,
        top: `${50 + Math.sin(angle) * radius}%`,
        animationDelay: `${index * 0.1}s`
      }
    },

    getSlideOpacity(index) {
      if (this.animationStep !== 4) return 0
      const progress = this.composeProgress
      const slideStart = index * 25
      const slideEnd = (index + 1) * 25
      if (progress < slideStart) return 0
      if (progress > slideEnd) return 0
      // 淡入淡出效果
      const fadeRange = 5
      if (progress < slideStart + fadeRange) {
        return (progress - slideStart) / fadeRange
      }
      if (progress > slideEnd - fadeRange) {
        return (slideEnd - progress) / fadeRange
      }
      return 1
    },

    getSlidePosition(index) {
      if (this.animationStep !== 4) return 0
      const progress = this.composeProgress
      const slideStart = index * 25
      return (progress - slideStart) * 2
    },

    getSlideAnimationClass(index) {
      if (this.animationStep !== 4) return ''
      const progress = this.composeProgress
      const slideStart = index * 25
      const slideEnd = (index + 1) * 25

      if (progress >= slideStart && progress <= slideEnd) {
        return `slide-effect-${this.pptSlides[index].effect} active`
      }
      return ''
    },

    getSlideOverlayStyle(index) {
      if (this.animationStep !== 4) {
        return { opacity: 0, transform: 'scale(0.8)' }
      }

      const progress = this.composeProgress
      const slideStart = index * 25
      const slideEnd = (index + 1) * 25

      if (progress < slideStart || progress > slideEnd) {
        return { opacity: 0 }
      }

      const slideProgress = (progress - slideStart) / (slideEnd - slideStart)
      const effect = this.pptSlides[index].effect

      let transform = ''
      let opacity = 1

      switch (effect) {
      case 'fade':
        opacity =
            slideProgress < 0.2
              ? slideProgress / 0.2
              : slideProgress > 0.8
                ? (1 - slideProgress) / 0.2
                : 1
        break
      case 'slide':
        const slideX = slideProgress < 0.3 ? (0.3 - slideProgress) * 100 : 0
        transform = `translateX(${slideX}px)`
        break
      case 'zoom':
        const scale =
            slideProgress < 0.3
              ? 0.5 + (slideProgress / 0.3) * 0.5
              : slideProgress > 0.7
                ? 1 - ((slideProgress - 0.7) / 0.3) * 0.2
                : 1
        transform = `scale(${scale})`
        break
      case 'rotate':
        const rotate = slideProgress < 0.3 ? (1 - slideProgress / 0.3) * 10 : 0
        transform = `rotate(${rotate}deg)`
        break
      }

      return {
        opacity,
        transform: transform || 'none',
        zIndex: progress >= slideStart && progress <= slideEnd ? 10 : 1
      }
    },

    getPipStyle() {
      if (this.animationStep !== 4) {
        return {
          width: '100%',
          height: '100%',
          top: '0',
          left: '0',
          borderRadius: '0'
        }
      }

      const progress = this.composeProgress

      // 前25%：画中画缩小到右下角
      if (progress < 25) {
        const pipProgress = progress / 25
        const size = 100 - pipProgress * 70 // 从100%缩小到30%
        const right = pipProgress * 10 // 移动到右边10%
        const bottom = pipProgress * 10 // 移动到底部10%

        return {
          width: `${size}%`,
          height: `${size}%`,
          top: 'auto',
          left: 'auto',
          right: `${right}%`,
          bottom: `${bottom}%`,
          borderRadius: '12px',
          transform: `scale(${0.8 + pipProgress * 0.2})`
        }
      }

      // 25%-75%：保持小尺寸
      if (progress < 75) {
        return {
          width: '30%',
          height: '30%',
          top: 'auto',
          left: 'auto',
          right: '10%',
          bottom: '10%',
          borderRadius: '12px',
          transform: 'scale(1)'
        }
      }

      // 75%-100%：放大回全屏
      const expandProgress = (progress - 75) / 25
      const size = 30 + expandProgress * 70
      const right = 10 - expandProgress * 10
      const bottom = 10 - expandProgress * 10

      return {
        width: `${size}%`,
        height: `${size}%`,
        top: 'auto',
        left: 'auto',
        right: `${right}%`,
        bottom: `${bottom}%`,
        borderRadius: `${12 - expandProgress * 12}px`,
        transform: `scale(${1 + expandProgress * 0.1})`
      }
    }
  }
}
</script>

<style scoped>
/* 样式已在全局 wegic-design-system.css 中定义 */
</style>
