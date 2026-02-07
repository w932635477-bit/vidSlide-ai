<template>
  <div class="fitness-homepage">
    <!-- SVG Gradients -->
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#EF4444;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>
    <!-- 导航栏 -->
    <header class="fitness-navbar">
      <div class="nav-container">
        <a href="/" class="brand">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#FF6B35" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="brand-text">VidSlide<span class="brand-accent">.AI</span></span>
        </a>

        <nav class="nav-links">
          <a href="#templates" class="nav-link">演示模板</a>
          <a href="#progress" class="nav-link">效果展示</a>
          <a href="#stories" class="nav-link">用户案例</a>
          <a href="#pricing" class="nav-link">订阅方案</a>
        </nav>

        <div class="nav-actions">
          <button class="btn-primary-fire" @click="scrollToDemo">
            查看演示
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
          <button class="btn-primary-fire" @click="goToWorkspace">
            免费开始
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Hero 区域 -->
    <section class="hero-section">
      <!-- 全屏背景图片 -->
      <div class="hero-background">
        <img src="/assets/demo/hero_demo.png" alt="VidSlide AI Demo" class="hero-bg-image" />
        <!-- 磨砂玻璃遮罩 -->
        <div class="hero-glass-overlay"></div>
      </div>

      <div class="hero-bg-pattern"></div>
      <div class="hero-glow-orb glow-1"></div>
      <div class="hero-glow-orb glow-2"></div>

      <div class="hero-container">
        <!-- 左侧内容 -->
        <div class="hero-content">
          <div class="hero-badge-large">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2.5">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/>
            </svg>
            <span>AI-Powered Video to Presentation</span>
          </div>

          <h1 class="hero-title">
            <span class="title-main">TRANSFORM</span>
            <span class="title-gradient">YOUR VIDEOS</span>
            <span class="title-main">INTO PROFESSIONAL</span>
            <span class="title-highlight">PRESENTATIONS</span>
          </h1>

          <p class="hero-subtitle">
            Upload your video, AI analyzes and generates stunning presentations automatically.
            No skills needed, 3-5 minutes to complete.
          </p>

          <!-- 统计卡片 -->
          <div class="hero-stats-grid">
            <div class="hero-stat-card">
              <div class="stat-number">3-5<span class="stat-suffix">min</span></div>
              <div class="stat-label">Quick Generation</div>
            </div>
            <div class="hero-stat-card">
              <div class="stat-number">100<span class="stat-suffix">%</span></div>
              <div class="stat-label">Privacy Protected</div>
            </div>
            <div class="hero-stat-card">
              <div class="stat-number">∞<span class="stat-suffix">times</span></div>
              <div class="stat-label">Free Forever</div>
            </div>
          </div>

          <div class="hero-cta-group">
            <button class="btn-hero-primary" @click="goToWorkspace">
              START FREE
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
              </svg>
            </button>
            <button class="btn-hero-secondary" @click="scrollToDemo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Watch Demo
            </button>
          </div>
        </div>

        <!-- 右侧演示区域 -->
        <div class="hero-demo" ref="demoRef">
          <div class="demo-showcase">
            <!-- 演示效果图 -->
            <div class="demo-main-image">
              <img src="/assets/demo/hero_demo.png" alt="VidSlide AI Demo" class="demo-img" />
              <div class="demo-overlay-gradient"></div>
            </div>

            <!-- 底部进度条 -->
            <div class="demo-progress-bar">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: progressValue + '%' }"></div>
              </div>
              <div class="progress-info">
                <span class="progress-status">Generating...</span>
                <span class="progress-percent">{{ progressValue }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能演示卡片 (第二屏) -->
    <section id="templates" class="templates-section">
      <div class="section-header">
        <div class="header-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="12 2 15 8.5 22 9 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9 9 8.5 12 2"/>
          </svg>
          <span>核心功能</span>
        </div>
        <h2 class="header-title">强大的 AI 驱动功能</h2>
        <p class="header-desc">一站式视频转演示解决方案，让您的创作更加高效</p>
      </div>

      <div class="templates-grid">
        <!-- AI 智能分析 -->
        <div class="feature-card-new">
          <div class="feature-image-wrapper">
            <img src="/assets/demo/ai_analysis_interface.png" alt="AI Analysis" class="feature-img" />
            <div class="feature-overlay"></div>
            <div class="feature-badge">智能分析</div>
          </div>
          <div class="feature-content-new">
            <h3 class="feature-title-new">AI 智能分析</h3>
            <p class="feature-desc-new">自动识别视频内容，提取关键信息和主题</p>
            <div class="feature-meta">
              <span class="feature-tag">语音识别</span>
              <span class="feature-tag">内容提取</span>
            </div>
          </div>
        </div>

        <!-- 视频编辑器 -->
        <div class="feature-card-new">
          <div class="feature-image-wrapper">
            <img src="/assets/demo/video_editor_interface.png" alt="Video Editor" class="feature-img" />
            <div class="feature-overlay"></div>
            <div class="feature-badge">实时编辑</div>
          </div>
          <div class="feature-content-new">
            <h3 class="feature-title-new">实时预览编辑</h3>
            <p class="feature-desc-new">所见即所得的编辑体验，在线调整演示效果</p>
            <div class="feature-meta">
              <span class="feature-tag">实时预览</span>
              <span class="feature-tag">在线编辑</span>
            </div>
          </div>
        </div>

        <!-- 模板库 -->
        <div class="feature-card-new">
          <div class="feature-image-wrapper">
            <img src="/assets/demo/video_templates_gallery.png" alt="Templates" class="feature-img" />
            <div class="feature-overlay"></div>
            <div class="feature-badge">丰富模板</div>
          </div>
          <div class="feature-content-new">
            <h3 class="feature-title-new">精美模板库</h3>
            <p class="feature-desc-new">多种风格模板，适配不同场景和内容类型</p>
            <div class="feature-meta">
              <span class="feature-tag">商务风格</span>
              <span class="feature-tag">创意设计</span>
            </div>
          </div>
        </div>

        <!-- 导出完成 -->
        <div class="feature-card-new">
          <div class="feature-image-wrapper">
            <img src="/assets/demo/video_export_complete.png" alt="Export" class="feature-img" />
            <div class="feature-overlay"></div>
            <div class="feature-badge">快速导出</div>
          </div>
          <div class="feature-content-new">
            <h3 class="feature-title-new">多格式导出</h3>
            <p class="feature-desc-new">支持 MP4 视频、PPT 演示文稿等多种格式</p>
            <div class="feature-meta">
              <span class="feature-tag">MP4/PPT</span>
              <span class="feature-tag">高清输出</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 进度追踪演示 (类似 Progress Tracking Demo) -->
    <section id="progress" class="progress-section">
      <div class="progress-bg"></div>
      <div class="progress-container">
        <div class="section-header">
          <div class="header-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 20V10"/>
              <path d="M18 20V4"/>
              <path d="M6 20v-4"/>
            </svg>
            <span>效果展示</span>
          </div>
          <h2 class="header-title">实时追踪生成进度</h2>
          <p class="header-desc">每个步骤清晰可见，让您的创作过程更加可控</p>
        </div>

        <div class="progress-dashboard">
          <!-- 中央进度环 -->
          <div class="progress-center">
            <div class="progress-ring">
              <svg class="progress-ring-svg" viewBox="0 0 200 200">
                <circle class="progress-ring-bg" cx="100" cy="100" r="85"/>
                <circle class="progress-ring-fill" cx="100" cy="100" r="85"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="circumference - (circumference * displayProgress) / 100"/>
              </svg>
              <div class="progress-inner">
                <div class="progress-percentage">{{ displayProgress }}<span class="percent-symbol">%</span></div>
                <div class="progress-status">{{ progressStatus }}</div>
              </div>
            </div>
          </div>

          <!-- 周围统计卡片 -->
          <div class="progress-stats">
            <div class="progress-stat-card" v-for="stat in progressStats" :key="stat.id">
              <div class="stat-icon" :class="stat.iconClass">
                <component :is="stat.icon" />
              </div>
              <div class="stat-info">
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-value" :class="{ 'stat-fire': stat.highlight }">{{ stat.value }}</div>
              </div>
              <div class="stat-trend" :class="stat.trendClass">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                <span>{{ stat.trend }}</span>
              </div>
            </div>
          </div>

          <!-- 底部进度条 -->
          <div class="progress-timeline">
            <div class="timeline-item" v-for="(step, index) in timelineSteps" :key="index"
              :class="{ 'active': index <= currentStep, 'completed': index < currentStep }">
              <div class="timeline-dot">
                <svg v-if="index < currentStep" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div class="timeline-content">
                <div class="timeline-title">{{ step.title }}</div>
                <div class="timeline-desc">{{ step.desc }}</div>
              </div>
              <div class="timeline-time">{{ step.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 用户案例/教练档案 (类似 Trainer Profiles) -->
    <section id="stories" class="stories-section">
      <div class="section-header">
        <div class="header-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>用户案例</span>
        </div>
        <h2 class="header-title">看看他们如何使用 VidSlide AI</h2>
        <p class="header-desc">来自不同行业的成功案例，激发您的创作灵感</p>
      </div>

      <div class="stories-grid">
        <div class="story-card" v-for="story in userStories" :key="story.id">
          <div class="story-header">
            <div class="story-avatar" :class="story.avatarClass">
              <span class="avatar-initial">{{ story.initial }}</span>
              <div class="avatar-glow"></div>
            </div>
            <div class="story-info">
              <h3 class="story-name">{{ story.name }}</h3>
              <div class="story-badges">
                <span class="story-badge" :class="badge.class" v-for="badge in story.badges" :key="badge.text">
                  {{ badge.text }}
                </span>
              </div>
            </div>
          </div>
          <div class="story-stats">
            <div class="story-stat" v-for="stat in story.stats" :key="stat.label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
          <p class="story-quote">{{ story.quote }}</p>
          <div class="story-footer">
            <div class="story-rating">
              <svg v-for="n in 5" :key="n" width="18" height="18" viewBox="0 0 24 24" :fill="n <= story.rating ? 'currentColor' : 'none'">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>{{ story.rating }}.0</span>
            </div>
            <button class="story-btn" @click="goToWorkspace">
              立即开始
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section class="features-section">
      <div class="section-header">
        <div class="header-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="12 2 15 8.5 22 9 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9 9 8.5 12 2"/>
          </svg>
          <span>强大功能</span>
        </div>
        <h2 class="header-title">为什么选择 VidSlide AI</h2>
        <p class="header-desc">完整的 AI 驱动解决方案，从视频到专业演示的完美转换</p>
      </div>

      <div class="features-cards">
        <div class="feature-card-main" v-for="feature in mainFeatures" :key="feature.id">
          <div class="feature-image" :class="feature.imageClass">
            <component :is="feature.icon" />
          </div>
          <div class="feature-content">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
            <div class="feature-stats">
              <div class="mini-stat" v-for="stat in feature.stats" :key="stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>{{ stat }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 订阅方案区域 (类似 Subscription CTAs) -->
    <section id="pricing" class="pricing-section">
      <div class="pricing-bg"></div>
      <div class="pricing-container">
        <div class="pricing-header">
          <div class="header-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
            <span>订阅方案</span>
          </div>
          <h2 class="header-title">选择最适合您的方案</h2>
          <p class="header-desc">透明定价，无隐藏费用，7天免费试用</p>
        </div>

        <div class="pricing-grid">
          <!-- 基础版 -->
          <div class="pricing-card pricing-basic">
            <div class="pricing-top">
              <h3 class="plan-name">基础版</h3>
              <div class="plan-desc">适合个人用户和轻度使用</div>
            </div>
            <div class="plan-price">
              <span class="price-currency">¥</span>
              <span class="price-amount">0</span>
              <span class="price-period">/永久</span>
            </div>
            <ul class="plan-features">
              <li v-for="feature in basicFeatures" :key="feature">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ feature }}
              </li>
            </ul>
            <button class="btn-plan btn-basic" @click="goToWorkspace">
              立即开始使用
            </button>
          </div>

          <!-- 专业版 -->
          <div class="pricing-card pricing-pro">
            <div class="featured-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polygon points="12 2 15 8.5 22 9 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9 9 8.5 12 2"/>
              </svg>
              <span>最受欢迎</span>
            </div>
            <div class="pricing-top">
              <h3 class="plan-name">专业版</h3>
              <div class="plan-desc">解锁所有高级功能</div>
            </div>
            <div class="plan-price">
              <span class="price-currency">¥</span>
              <span class="price-amount">0</span>
              <span class="price-period">/永久</span>
            </div>
            <div class="trial-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>7天免费试用</span>
            </div>
            <ul class="plan-features">
              <li v-for="feature in proFeatures" :key="feature" class="featured-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ feature }}
              </li>
            </ul>
            <button class="btn-plan btn-pro" @click="goToWorkspace">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
              </svg>
              开始7天免费试用
            </button>
          </div>

          <!-- 团队版 -->
          <div class="pricing-card pricing-team">
            <div class="pricing-top">
              <h3 class="plan-name">团队版</h3>
              <div class="plan-desc">适合团队协作和企业使用</div>
            </div>
            <div class="plan-price">
              <span class="price-currency">¥</span>
              <span class="price-amount">0</span>
              <span class="price-period">/永久</span>
            </div>
            <ul class="plan-features">
              <li v-for="feature in teamFeatures" :key="feature">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ feature }}
              </li>
            </ul>
            <button class="btn-plan btn-team" @click="goToWorkspace">
              联系销售
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 区域 -->
    <section class="cta-section">
      <div class="cta-fire-bg"></div>
      <div class="cta-particles"></div>
      <div class="cta-container">
        <div class="cta-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2C12 2 15 6 15 9C15 11 13.5 12 12 12C10.5 12 9 11 9 9C9 6 12 2 12 2Z"/>
            <path d="M12 14C9 14 6 16 6 19C6 21 8 22 12 22C16 22 18 21 18 19C18 16 15 14 12 14Z"/>
          </svg>
        </div>
        <h2 class="cta-title">准备好让您的视频内容火力全开了吗？</h2>
        <p class="cta-desc">立即加入数千名用户，体验 AI 驱动的视频转演示转换</p>
        <div class="cta-stats">
          <div class="cta-stat">
            <div class="cta-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div class="cta-stat-value">100%</div>
            <div class="cta-stat-label">完全免费</div>
          </div>
          <div class="cta-stat">
            <div class="cta-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="cta-stat-value">5分钟</div>
            <div class="cta-stat-label">快速完成</div>
          </div>
          <div class="cta-stat">
            <div class="cta-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="cta-stat-value">本地</div>
            <div class="cta-stat-label">隐私安全</div>
          </div>
        </div>
        <button class="btn-cta-fire" @click="goToWorkspace">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          免费开始使用
        </button>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#FF6B35" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="footer-brand-text">VidSlide AI</span>
        </div>
        <p class="footer-text">© 2026 VidSlide AI. 让您的视频内容火力全开。</p>
        <div class="footer-social">
          <a href="https://github.com" target="_blank" class="social-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176-.77.84-1.235 1.911-1.235 3.221 0 4.609 2.807 5.624 5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, h, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const demoRef = ref(null)

// 进度动画
const progressValue = ref(0)
const displayProgress = ref(75)
const currentStep = ref(2)
const circumference = 2 * Math.PI * 85

const progressStatus = computed(() => {
  if (displayProgress.value < 25) return '上传中...'
  if (displayProgress.value < 50) return 'AI 分析中...'
  if (displayProgress.value < 75) return '生成演示中...'
  if (displayProgress.value < 100) return '即将完成...'
  return '完成！'
})

// 进度动画循环
let progressInterval = null

onMounted(() => {
  progressInterval = setInterval(() => {
    progressValue.value += 1
    if (progressValue.value > 100) {
      progressValue.value = 0
    }
  }, 100)
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})

// 图标组件
const UploadIcon = () => h('svg', { width: 48, height: 48, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
  h('polyline', { points: '17 8 12 3 7 8' }),
  h('line', { x1: 12, y1: 3, x2: 12, y2: 15 })
])

const BrainIcon = () => h('svg', { width: 48, height: 48, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' })
])

const MagicIcon = () => h('svg', { width: 48, height: 48, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { d: 'M12 2L9 9H2l6 4-3 8 7-5 7 5-3-8 6-4h-7L12 2z' })
])

const DownloadIcon = () => h('svg', { width: 48, height: 48, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
  h('polyline', { points: '7 10 12 15 17 10' }),
  h('line', { x1: 12, y1: 15, x2: 12, y2: 3 })
])

const ShieldIcon = () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
])

const ImageIcon = () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 }),
  h('circle', { cx: 8.5, cy: 8.5, r: 1.5 }),
  h('polyline', { points: '21 15 16 10 5 21' })
])

const EyeIcon = () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
  h('circle', { cx: 12, cy: 12, r: 3 })
])

const VideoIcon = () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('polygon', { points: '23 7 16 12 23 17 23 7' }),
  h('rect', { x: 1, y: 5, width: 15, height: 14, rx: 2, ry: 2 })
])

const ZapIcon = () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' })
])

const FlameIcon = () => h('svg', { width: 40, height: 40, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { d: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' })
])

const PresentationIcon = () => h('svg', { width: 40, height: 40, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('rect', { x: 2, y: 3, width: 20, height: 14, rx: 2, ry: 2 }),
  h('line', { x1: 8, y1: 21, x2: 16, y2: 21 }),
  h('line', { x1: 12, y1: 17, x2: 12, y2: 21 })
])

const ChartIcon = () => h('svg', { width: 40, height: 40, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
  h('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
  h('line', { x1: 6, y1: 20, x2: 6, y2: 14 })
])

const PlayIcon = () => h('svg', { width: 40, height: 40, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('polygon', { points: '5 3 19 12 5 21 5 3' })
])

const UsersIcon = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: 9, cy: 7, r: 4 }),
  h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
  h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
])

const ClockIcon = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('circle', { cx: 12, cy: 12, r: 10 }),
  h('polyline', { points: '12 6 12 12 16 14' })
])

const FireStatIcon = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { d: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' })
])

const FolderIcon = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('path', { d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' })
])

const TrendIcon = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('polyline', { points: '23 6 13.5 15.5 8.5 10.5 1 18' }),
  h('polyline', { points: '17 6 23 6 23 12' })
])

// 演示模板 (类似 Workout Preview Cards)
const templates = [
  {
    id: 1,
    icon: PresentationIcon,
    name: '商务演示模板',
    duration: '3-5 分钟',
    level: '中级',
    progress: 85,
    users: '2.5k+',
    rating: '4.9',
    badge: '热门',
    previewClass: 'preview-orange'
  },
  {
    id: 2,
    icon: FlameIcon,
    name: '产品介绍模板',
    duration: '2-4 分钟',
    level: '初级',
    progress: 72,
    users: '1.8k+',
    rating: '4.8',
    badge: '推荐',
    previewClass: 'preview-red'
  },
  {
    id: 3,
    icon: PlayIcon,
    name: '教学视频模板',
    duration: '5-8 分钟',
    level: '高级',
    progress: 68,
    users: '1.2k+',
    rating: '4.7',
    badge: '新',
    previewClass: 'preview-yellow'
  },
  {
    id: 4,
    icon: ChartIcon,
    name: '数据分析模板',
    duration: '4-6 分钟',
    level: '中级',
    progress: 91,
    users: '980+',
    rating: '4.9',
    badge: '热销',
    previewClass: 'preview-fire'
  }
]

// 进度统计数据
const progressStats = [
  {
    id: 1,
    icon: UsersIcon,
    label: '活跃用户',
    value: '5,280',
    trend: '+12%',
    iconClass: 'stat-orange',
    trendClass: 'trend-up',
    highlight: false
  },
  {
    id: 2,
    icon: FolderIcon,
    label: '生成项目',
    value: '12,450',
    trend: '+28%',
    iconClass: 'stat-red',
    trendClass: 'trend-up',
    highlight: true
  },
  {
    id: 3,
    icon: ClockIcon,
    label: '节省时间',
    value: '3,280h',
    trend: '+45%',
    iconClass: 'stat-yellow',
    trendClass: 'trend-up',
    highlight: false
  },
  {
    id: 4,
    icon: FireStatIcon,
    label: '连续天数',
    value: '7 天',
    trend: '保持',
    iconClass: 'stat-fire',
    trendClass: 'trend-neutral',
    highlight: false
  }
]

// 时间线步骤
const timelineSteps = [
  { title: '上传视频', desc: '支持多种格式', time: '30秒' },
  { title: 'AI 分析', desc: '智能提取内容', time: '1-2分钟' },
  { title: '生成演示', desc: '自动匹配素材', time: '1-2分钟' },
  { title: '导出成品', desc: '高清质量输出', time: '即时完成' }
]

// 用户案例 (类似 Trainer Profiles)
const userStories = [
  {
    id: 1,
    name: '张老师',
    initial: '张',
    avatarClass: 'avatar-orange',
    badges: [
      { text: '教育专家', class: 'badge-orange' },
      { text: 'VIP 用户', class: 'badge-fire' }
    ],
    stats: [
      { value: '50+', label: '生成课件' },
      { value: '4.9', label: '用户评分' }
    ],
    quote: 'VidSlide AI 让我的课程制作效率提升了10倍！学生们都说课件更生动有趣了。',
    rating: 5
  },
  {
    id: 2,
    name: '李经理',
    initial: '李',
    avatarClass: 'avatar-red',
    badges: [
      { text: '商务达人', class: 'badge-red' },
      { text: '企业版', class: 'badge-pro' }
    ],
    stats: [
      { value: '100+', label: '演示文稿' },
      { value: '4.8', label: '客户好评' }
    ],
    quote: '从口播视频到专业演示，只需要几分钟。客户反馈非常专业，成单率提升了30%。',
    rating: 5
  },
  {
    id: 3,
    name: '王主播',
    initial: '王',
    avatarClass: 'avatar-yellow',
    badges: [
      { text: '内容创作者', class: 'badge-yellow' },
      { text: '早期用户', class: 'badge-early' }
    ],
    stats: [
      { value: '200+', label: '视频转演示' },
      { value: '4.7', label: '粉丝喜爱' }
    ],
    quote: '每次直播后的内容都能快速变成可分享的演示，粉丝互动量明显增加了。',
    rating: 5
  },
  {
    id: 4,
    name: '陈设计师',
    initial: '陈',
    avatarClass: 'avatar-fire',
    badges: [
      { text: '创意总监', class: 'badge-fire' },
      { text: '金牌用户', class: 'badge-gold' }
    ],
    stats: [
      { value: '80+', label: '提案演示' },
      { value: '5.0', label: '完美评分' }
    ],
    quote: '作为设计师，我非常挑剔。但 VidSlide AI 的生成质量真的让我惊艳，强烈推荐！',
    rating: 5
  }
]

// 主功能特性
const mainFeatures = [
  {
    id: 1,
    icon: ShieldIcon,
    title: '本地隐私保护',
    desc: '所有视频数据在本地处理，绝不上传到云端，确保您的隐私安全。',
    stats: ['100% 本地', '零数据上传'],
    imageClass: 'image-shield'
  },
  {
    id: 2,
    icon: BrainIcon,
    title: 'AI 智能分析',
    desc: '先进的 AI 算法自动分析视频内容，智能提取关键信息和主题。',
    stats: ['智能识别', '自动提取'],
    imageClass: 'image-brain'
  },
  {
    id: 3,
    icon: ImageIcon,
    title: '智能素材匹配',
    desc: '根据视频内容自动选择最合适的素材，让演示更加生动专业。',
    stats: ['自动匹配', '高清素材'],
    imageClass: 'image-image'
  },
  {
    id: 4,
    icon: EyeIcon,
    title: '实时预览效果',
    desc: '即时查看生成结果，支持在线编辑调整，所见即所得的体验。',
    stats: ['实时预览', '在线编辑'],
    imageClass: 'image-eye'
  },
  {
    id: 5,
    icon: VideoIcon,
    title: '多格式导出',
    desc: '支持 MP4 视频、PPT 演示文稿等多种格式导出，满足不同需求。',
    stats: ['MP4/PPT', '高清输出'],
    imageClass: 'image-video'
  },
  {
    id: 6,
    icon: ZapIcon,
    title: '极速处理引擎',
    desc: '优化的处理引擎，3-5 分钟即可完成整个转换流程，高效快捷。',
    stats: ['3-5 分钟', '高效处理'],
    imageClass: 'image-zap'
  }
]

// 定价功能列表
const basicFeatures = [
  '无限制使用次数',
  '所有 AI 功能开放',
  '本地处理隐私安全',
  'MP4 格式导出',
  '社区支持'
]

const proFeatures = [
  '包含基础版所有功能',
  '无限制使用次数',
  '所有 AI 功能完全开放',
  '本地处理隐私安全',
  'MP4 + PPT 双格式导出',
  '实时预览编辑功能',
  '优先技术支持',
  '持续更新新功能'
]

const teamFeatures = [
  '包含专业版所有功能',
  '多人协作支持',
  '团队管理功能',
  '企业级技术支持',
  '定制化服务选项',
  'API 访问权限'
]

const goToWorkspace = () => {
  router.push('/workspace')
}

const scrollToDemo = () => {
  demoRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<style scoped>
/* ==================== CSS 变量 ==================== */
:root {
  /* 主色调 - 橙/红/黄活力配色 */
  --color-fire: #FF6B35;
  --color-fire-light: #FF8C42;
  --color-fire-dark: #E85D2A;
  --color-red: #EF4444;
  --color-red-dark: #DC2626;
  --color-yellow: #FBBF24;
  --color-yellow-light: #FCD34D;
  --color-orange: #F97316;
  --color-orange-light: #FB923C;

  /* 中性色 */
  --bg-dark: #0a0a0f;
  --bg-card: #15151f;
  --bg-card-hover: #1a1a28;
  --bg-elevated: #1f1f2e;
  --bg-border: rgba(255, 107, 53, 0.1);

  /* 文字颜色 */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.5);

  /* 渐变 */
  --gradient-fire: linear-gradient(135deg, #FF6B35 0%, #EF4444 100%);
  --gradient-fire-alt: linear-gradient(135deg, #FF8C42 0%, #FBBF24 100%);
  --gradient-dark: linear-gradient(180deg, #0a0a0f 0%, #15151f 100%);
  --gradient-card: linear-gradient(145deg, #15151f 0%, #1a1a28 100%);

  /* 阴影 */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 24px 48px rgba(0, 0, 0, 0.5);
  --shadow-fire: 0 0 40px rgba(255, 107, 53, 0.3);
  --shadow-fire-intense: 0 0 60px rgba(255, 107, 53, 0.4);

  /* 边框 */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-medium: rgba(255, 255, 255, 0.1);
  --border-fire: rgba(255, 107, 53, 0.3);
  --border-fire-hover: rgba(255, 107, 53, 0.5);
}

/* ==================== 全局样式 ==================== */
.fitness-homepage {
  min-height: 100vh;
  background: var(--bg-dark);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

button, a {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
}

/* ==================== 导航栏 ==================== */
.fitness-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(10, 10, 15, 0.6);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.brand-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-fire);
  border-radius: 12px;
}

.brand-text {
  font-weight: 800;
  font-size: 1.25rem;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.brand-accent {
  color: var(--color-fire);
}

.nav-links {
  display: flex;
  gap: 2.5rem;
}

.nav-link {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--gradient-fire);
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-ghost {
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.btn-ghost:hover {
  color: var(--text-primary);
}

.btn-primary-fire {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  background: var(--gradient-fire);
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-fire);
}

.btn-primary-fire:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-fire-intense);
}

/* ==================== Hero 区域 ==================== */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 7rem 2rem 5rem;
}

/* 全屏背景图片 */
.hero-background {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}

.hero-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 磨砂玻璃遮罩 - 浅色 */
.hero-glass-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 15, 0.55);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  pointer-events: none;
}

.hero-bg-pattern {
  position: absolute;
  inset: 0;
  z-index: 2;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.hero-glow-orb {
  position: absolute;
  z-index: 2;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  opacity: 0.3;
}

.glow-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.25) 0%, transparent 70%);
  top: 10%;
  right: 10%;
  animation: orb-float 8s ease-in-out infinite;
}

.glow-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%);
  bottom: 20%;
  left: 5%;
  animation: orb-float 10s ease-in-out infinite reverse;
}

@keyframes orb-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.1); }
}

.hero-container {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 3rem;
  max-width: 1600px;
  margin: 0 auto;
  align-items: center;
  width: 100%;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  position: relative;
  z-index: 20;
}

.hero-badge-large {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #FF6B35;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  line-height: 0.95;
}

.title-main {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #ffffff;
  text-transform: uppercase;
}

.title-gradient {
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 900;
  background: linear-gradient(135deg, #FF6B35 0%, #FBBF24 50%, #EF4444 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.title-highlight {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  background: linear-gradient(135deg, #FF6B35 0%, #EF4444 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.hero-subtitle {
  font-size: 1.125rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.6);
  max-width: 500px;
}

.hero-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.hero-stat-card {
  padding: 1.25rem 1rem;
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  text-align: center;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #FF6B35 0%, #FBBF24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-suffix {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.4);
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.25rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero-cta-group {
  display: flex;
  gap: 1rem;
}

.btn-hero-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.125rem 2.5rem;
  background: linear-gradient(135deg, #FF6B35 0%, #EF4444 100%);
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(255, 107, 53, 0.3);
  border: none;
}

.btn-hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(255, 107, 53, 0.4);
}

.btn-hero-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.125rem 2rem;
  background: transparent;
  border: 2px solid rgba(255, 107, 53, 0.4);
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  transition: all 0.3s ease;
}

.btn-hero-secondary:hover {
  background: rgba(255, 107, 53, 0.1);
  border-color: rgba(255, 107, 53, 0.6);
}

/* ==================== Hero 演示区域 ==================== */
.hero-demo {
  position: relative;
  width: 100%;
  z-index: 15;
}

.demo-showcase {
  position: relative;
  background: rgba(20, 20, 30, 0.4);
  backdrop-filter: blur(30px) saturate(150%);
  -webkit-backdrop-filter: blur(30px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 28px;
  overflow: hidden;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.3),
    0 0 80px rgba(255, 107, 53, 0.1);
}

.demo-main-image {
  position: relative;
  aspect-ratio: 16 / 10;
  min-height: 550px;
  overflow: hidden;
  border-radius: 24px;
}

.demo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.demo-overlay-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(10, 10, 15, 0.6) 100%);
  pointer-events: none;
}

.demo-progress-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(10, 10, 15, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.progress-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35 0%, #FBBF24 100%);
  border-radius: 100px;
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.progress-status {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.progress-percent {
  font-size: 0.9375rem;
  color: #FF6B35;
  font-weight: 700;
}

/* ==================== 演示模板区域 ==================== */
.templates-section {
  position: relative;
  padding: 8rem 2rem;
  background: var(--bg-card);
}

.section-header {
  text-align: center;
  margin-bottom: 5rem;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 107, 53, 0.15);
  border: 1px solid var(--border-fire);
  border-radius: 100px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-fire);
  margin-bottom: 1.5rem;
}

.header-title {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}

.header-desc {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.feature-card-new {
  background: var(--gradient-card);
  border: 1px solid var(--border-subtle);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.feature-card-new:hover {
  border-color: var(--border-fire);
  transform: translateY(-12px) scale(1.02);
  box-shadow: var(--shadow-lg), var(--shadow-fire);
}

.feature-image-wrapper {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 20px;
  margin: 12px;
}

.feature-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.4s ease;
}

.feature-card-new:hover .feature-img {
  transform: scale(1.05);
}

.feature-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(10, 10, 15, 0.9) 100%);
}

.feature-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0.5rem 1rem;
  background: var(--gradient-fire);
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  backdrop-filter: blur(10px);
}

.feature-content-new {
  padding: 0 1.5rem 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.feature-title-new {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.feature-desc-new {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
  flex: 1;
}

.feature-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.feature-tag {
  padding: 0.375rem 0.75rem;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: 100px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-fire);
}

/* ==================== 进度追踪区域 ==================== */
.progress-section {
  position: relative;
  padding: 8rem 2rem;
  overflow: hidden;
}

.progress-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 60%);
  filter: blur(100px);
  pointer-events: none;
}

.progress-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.progress-dashboard {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
}

.progress-center {
  display: flex;
  justify-content: center;
}

.progress-ring {
  position: relative;
  width: 280px;
  height: 280px;
}

.progress-ring-svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.progress-ring-bg {
  fill: none;
  stroke: var(--border-medium);
  stroke-width: 12;
}

.progress-ring-fill {
  fill: none;
  stroke: url(#progress-gradient);
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress-percentage {
  font-size: 4rem;
  font-weight: 900;
  background: var(--gradient-fire);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.percent-symbol {
  font-size: 2rem;
}

.progress-status {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  font-weight: 600;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.progress-stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border-radius: 12px;
}

.stat-orange { color: var(--color-orange); }
.stat-red { color: var(--color-red); }
.stat-yellow { color: var(--color-yellow); }
.stat-fire { color: var(--color-fire); }

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.stat-fire {
  font-size: 1.5rem;
  background: var(--gradient-fire);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.625rem;
  border-radius: 100px;
}

.trend-up {
  color: #22C55E;
  background: rgba(34, 197, 94, 0.1);
}

.trend-neutral {
  color: var(--text-muted);
  background: var(--border-medium);
}

.progress-timeline {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  position: relative;
}

.timeline-item.active {
  border-color: var(--border-fire);
}

.timeline-item.completed {
  background: rgba(255, 107, 53, 0.05);
}

.timeline-dot {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 2px solid var(--border-medium);
  border-radius: 50%;
  margin-bottom: 1rem;
  color: var(--text-muted);
}

.timeline-item.active .timeline-dot {
  border-color: var(--color-fire);
  color: var(--color-fire);
}

.timeline-item.completed .timeline-dot {
  background: var(--gradient-fire);
  border-color: transparent;
  color: white;
}

.timeline-title {
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 0.375rem;
}

.timeline-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.timeline-time {
  font-size: 0.6875rem;
  color: var(--color-fire);
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 100px;
}

/* ==================== 用户案例区域 ==================== */
.stories-section {
  position: relative;
  padding: 8rem 2rem;
  background: var(--bg-card);
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.story-card {
  background: var(--gradient-card);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
}

.story-card:hover {
  border-color: var(--border-fire);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md), var(--shadow-fire);
}

.story-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.story-avatar {
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: 800;
}

.avatar-orange { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); color: white; }
.avatar-red { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; }
.avatar-yellow { background: linear-gradient(135deg, #FBBF24 0%, #FCD34D 100%); color: #0a0a0f; }
.avatar-fire { background: linear-gradient(135deg, #FF6B35 0%, #EF4444 100%); color: white; }

.avatar-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: inherit;
  filter: blur(12px);
  opacity: 0.4;
  z-index: -1;
}

.story-info {
  flex: 1;
}

.story-name {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.375rem;
}

.story-badges {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.story-badge {
  font-size: 0.625rem;
  padding: 0.25rem 0.5rem;
  border-radius: 100px;
  font-weight: 600;
}

.badge-orange { background: rgba(255, 107, 53, 0.15); color: var(--color-orange); }
.badge-red { background: rgba(239, 68, 68, 0.15); color: var(--color-red); }
.badge-yellow { background: rgba(251, 191, 36, 0.15); color: var(--color-yellow); }
.badge-fire { background: var(--gradient-fire); color: white; }
.badge-pro { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
.badge-early { background: rgba(168, 85, 247, 0.15); color: #A855F7; }
.badge-gold { background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%); color: #0a0a0f; }

.story-stats {
  display: flex;
  gap: 1rem;
}

.story-stat {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.story-stat .stat-label {
  color: var(--text-muted);
}

.story-quote {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-secondary);
  font-style: italic;
  flex: 1;
}

.story-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}

.story-rating {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #FBBF24;
}

.story-btn {
  padding: 0.625rem 1rem;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid var(--border-fire);
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-fire);
  transition: all 0.3s ease;
}

.story-btn:hover {
  background: var(--gradient-fire);
  color: white;
}

/* ==================== 功能特性区域 ==================== */
.features-section {
  position: relative;
  padding: 8rem 2rem;
}

.features-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card-main {
  padding: 2rem;
  background: var(--gradient-card);
  border: 1px solid var(--border-medium);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.feature-card-main:hover {
  border-color: var(--border-fire);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md), var(--shadow-fire);
}

.feature-image {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border-radius: 16px;
  margin-bottom: 1.5rem;
}

.image-shield .feature-image { color: #22C55E; }
.image-brain .feature-image { color: var(--color-fire); }
.image-image .feature-image { color: var(--color-yellow); }
.image-eye .feature-image { color: #3B82F6; }
.image-video .feature-image { color: var(--color-orange); }
.image-zap .feature-image { color: var(--color-red); }

.feature-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.feature-desc {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.feature-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

/* ==================== 定价区域 ==================== */
.pricing-section {
  position: relative;
  padding: 8rem 2rem;
  overflow: hidden;
}

.pricing-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-card);
  opacity: 0.5;
}

.pricing-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-header {
  text-align: center;
  margin-bottom: 5rem;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  align-items: stretch;
}

.pricing-card {
  padding: 3rem 2rem;
  background: var(--gradient-card);
  border: 1px solid var(--border-medium);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.pricing-basic {
  border-color: var(--border-subtle);
}

.pricing-pro {
  border-color: var(--border-fire);
  background: linear-gradient(145deg, rgba(255, 107, 53, 0.08) 0%, var(--bg-card) 50%);
  box-shadow: var(--shadow-lg), var(--shadow-fire);
}

.pricing-pro:hover {
  box-shadow: var(--shadow-lg), var(--shadow-fire-intense);
}

.pricing-team {
  border-color: var(--border-subtle);
}

.featured-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1.25rem;
  background: var(--gradient-fire);
  border-radius: 100px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: white;
}

.pricing-top {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-name {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.plan-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
}

.price-currency {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.price-amount {
  font-size: 4rem;
  font-weight: 900;
  background: var(--gradient-fire);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.price-period {
  font-size: 1.125rem;
  color: var(--text-muted);
}

.trial-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-yellow);
  margin-bottom: 2rem;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  flex: 1;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.plan-features svg {
  flex-shrink: 0;
  color: var(--color-fire);
}

.featured-item {
  color: var(--text-primary);
  font-weight: 600;
}

.btn-plan {
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.3s ease;
}

.btn-basic {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
}

.btn-basic:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-fire);
}

.btn-pro {
  background: var(--gradient-fire);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-fire);
}

.btn-pro:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-fire-intense);
}

.btn-team {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
}

.btn-team:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-fire);
}

/* ==================== CTA 区域 ==================== */
.cta-section {
  position: relative;
  padding: 10rem 2rem;
  text-align: center;
  overflow: hidden;
}

.cta-fire-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 60%);
  filter: blur(100px);
  pointer-events: none;
}

.cta-particles {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(2px 2px at 20% 30%, white, transparent),
                    radial-gradient(2px 2px at 60% 70%, white, transparent),
                    radial-gradient(1px 1px at 50% 50%, white, transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.1;
  animation: particles 20s linear infinite;
  pointer-events: none;
}

@keyframes particles {
  0% { transform: translateY(0); }
  100% { transform: translateY(-200px); }
}

.cta-container {
  position: relative;
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.cta-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-fire);
  border-radius: 24px;
  color: white;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-fire-intense);
}

.cta-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.cta-desc {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.cta-stats {
  display: flex;
  gap: 3rem;
  margin: 1rem 0;
}

.cta-stat {
  text-align: center;
}

.cta-stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid var(--border-fire);
  border-radius: 12px;
  color: var(--color-fire);
  margin: 0 auto 0.75rem;
}

.cta-stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  background: var(--gradient-fire);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-stat-label {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  font-weight: 600;
}

.btn-cta-fire {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 3rem;
  background: var(--gradient-fire);
  border-radius: 16px;
  font-size: 1.0625rem;
  font-weight: 700;
  color: white;
  box-shadow: var(--shadow-fire);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-cta-fire:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: var(--shadow-fire-intense);
}

/* ==================== 页脚 ==================== */
.footer {
  border-top: 1px solid var(--border-subtle);
  padding: 3rem 2rem;
  background: var(--bg-card);
}

.footer-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-brand .brand-icon {
  width: 36px;
  height: 36px;
}

.footer-brand-text {
  font-weight: 700;
  font-size: 1.0625rem;
  color: var(--text-primary);
}

.footer-text {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.social-link:hover {
  color: var(--color-fire);
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 1200px) {
  .hero-container {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .templates-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .progress-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .progress-timeline {
    grid-template-columns: repeat(2, 1fr);
  }

  .stories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .pricing-card:last-child {
    grid-column: span 2;
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 1024px) {
  .hero-glass-overlay {
    background: rgba(10, 10, 15, 0.7);
  }

  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }

  .demo-showcase {
    max-width: 600px;
    margin: 0 auto;
  }

  .demo-main-image {
    min-height: 400px;
  }

  .hero-content {
    align-items: center;
  }

  .hero-badge-large,
  .hero-cta-group {
    justify-content: center;
  }

  .hero-stats-grid {
    justify-content: center;
  }

  .hero-subtitle {
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .nav-actions .btn-ghost {
    display: none;
  }

  .hero-glass-overlay {
    background: rgba(10, 10, 15, 0.8);
  }

  .templates-grid,
  .progress-stats,
  .progress-timeline,
  .stories-grid,
  .features-cards,
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .feature-image-wrapper {
    aspect-ratio: 16 / 9;
  }

  .pricing-card:last-child {
    grid-column: span 1;
    max-width: 100%;
  }

  .hero-cta-group {
    flex-direction: column;
  }

  .btn-hero-primary,
  .btn-hero-secondary {
    width: 100%;
    justify-content: center;
  }

  .cta-stats {
    flex-direction: column;
    gap: 1.5rem;
  }

  .footer-container {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 6rem 1rem 3rem;
  }

  .hero-glass-overlay {
    background: rgba(10, 10, 15, 0.85);
  }

  .hero-container {
    gap: 2rem;
  }

  .title-main {
    font-size: 1.75rem;
  }

  .title-gradient {
    font-size: 2rem;
  }

  .title-highlight {
    font-size: 1.75rem;
  }

  .hero-stats-grid {
    flex-direction: column;
    gap: 0.75rem;
  }

  .hero-stat-card {
    padding: 0.875rem;
  }

  .demo-main-image {
    min-height: 280px;
  }

  .hero-cta-group {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
