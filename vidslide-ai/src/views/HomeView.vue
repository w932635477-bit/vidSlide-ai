<template>
  <div class="vidslide-home">
    <!-- 导航栏 -->
    <nav class="vidslide-navbar">
      <div class="navbar-container">
        <a href="/" class="navbar-logo">
          <div class="navbar-logo-icon">
            <span class="logo-letter">V</span>
          </div>
          <span>VidSlide AI</span>
        </a>

        <div class="navbar-nav">
          <a href="#features" class="navbar-nav-link">{{ t('nav.features') }}</a>
          <a href="#pricing" class="navbar-nav-link">{{ t('nav.pricing') }}</a>
          <a href="#about" class="navbar-nav-link">{{ t('nav.about') }}</a>
        </div>

        <div class="navbar-actions">
          <!-- <LanguageSwitcher @change="handleLanguageChange" /> -->
          <button class="btn-login">{{ t('nav.login') }}</button>
          <button class="btn-signup" @click="goToWorkspace">{{ t('nav.signup') }}</button>
        </div>
      </div>
    </nav>

    <!-- 英雄区 -->
    <section class="hero-section">
      <div class="hero-video-container">
        <div class="hero-gradient-bg"></div>
      </div>

      <div class="hero-content">
        <div class="hero-badge">
          <div class="hero-badge-dot"></div>
          <span>{{ t('hero.badge') }}</span>
        </div>

        <h1 class="hero-title" v-html="t('hero.title')"></h1>

        <p class="hero-subtitle">
          {{ t('hero.subtitle') }}
        </p>

        <div class="hero-cta">
          <button class="btn-primary" @click="goToWorkspace">
            <span>{{ t('hero.cta.primary') }}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="btn-secondary" @click="watchDemo">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.3 4.1C6.3 3.21 7.34 2.67 8.1 3.2L15.5 8.6C16.17 9.07 16.17 10.07 15.5 10.54L8.1 15.94C7.34 16.47 6.3 15.93 6.3 15.04V4.1Z"/>
            </svg>
            <span>{{ t('hero.cta.secondary') }}</span>
          </button>
        </div>

        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">10K+</div>
            <div class="stat-label">{{ t('hero.stats.users') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">3-5h</div>
            <div class="stat-label">{{ t('hero.stats.time') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">100%</div>
            <div class="stat-label">{{ t('hero.stats.local') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能区 -->
    <section id="features" class="features-section">
      <div class="features-container">
        <div class="section-header">
          <span class="section-badge">{{ t('features.badge') }}</span>
          <h2 class="section-title">{{ t('features.title') }}</h2>
          <p class="section-subtitle">
            {{ t('features.subtitle') }}
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ t('features.items.ai.title') }}</h3>
            <p class="feature-description">
              {{ t('features.items.ai.desc') }}
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ t('features.items.pip.title') }}</h3>
            <p class="feature-description">
              {{ t('features.items.pip.desc') }}
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ t('features.items.export.title') }}</h3>
            <p class="feature-description">
              {{ t('features.items.export.desc') }}
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ t('features.items.preview.title') }}</h3>
            <p class="feature-description">
              {{ t('features.items.preview.desc') }}
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ t('features.items.templates.title') }}</h3>
            <p class="feature-description">
              {{ t('features.items.templates.desc') }}
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ t('features.items.local.title') }}</h3>
            <p class="feature-description">
              {{ t('features.items.local.desc') }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
// import LanguageSwitcher from '../components/LanguageSwitcher.vue'

// 临时翻译函数
const t = (key) => {
  const translations = {
    'nav.features': '功能',
    'nav.pricing': '定价',
    'nav.about': '关于',
    'nav.login': '登录',
    'nav.signup': '免费试用',
    'hero.badge': 'AI驱动的视频转PPT工具',
    'hero.title': '3分钟将口播视频转换为专业PPT演示',
    'hero.subtitle': 'VidSlide AI 自动分析视频内容，智能生成现代化PPT幻灯片，与原视频完美融合。节省3-5小时工作量，让内容创作更高效。',
    'hero.cta.primary': '立即开始',
    'hero.cta.secondary': '观看演示',
    'hero.stats.users': '活跃用户',
    'hero.stats.time': '节省时间',
    'hero.stats.local': '本地处理'
  };
  return translations[key] || key;
};

const router = useRouter()

const handleLanguageChange = (locale) => {
  // 语言切换由LanguageSwitcher组件内部处理
  console.log('Language changed to:', locale)
}

const goToWorkspace = () => {
  console.log('🚀 点击了"立即开始"按钮')
  console.log('📍 当前路由:', router.currentRoute.value.path)
  console.log('🎯 准备跳转到: /workspace')

  try {
    router.push('/workspace')
    console.log('✅ 路由跳转命令已执行')
  } catch (error) {
    console.error('❌ 路由跳转失败:', error)
  }
}

const watchDemo = () => {
  console.log('观看演示视频')
}
</script>

<style scoped>
@import '../styles/home-apple-style.css';
</style>
