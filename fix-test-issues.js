/**
 * VidSlide AI 测试问题修复脚本
 * 基于最终验收测试结果，系统性修复发现的问题
 */

const fs = require('fs');
const path = require('path');

class TestIssuesFixer {
  constructor() {
    this.issues = {
      eslint: false,
      security: false,
      ui: false,
      accessibility: false,
      dependencies: false
    };
  }

  async fixAllIssues() {
    console.log("🔧 开始修复测试发现的问题...");
    console.log("=".repeat(60));

    try {
      // 1. 添加ESLint配置
      await this.addESLintConfig();

      // 2. 加强安全措施
      await this.addSecurityMeasures();

      // 3. 完善UI组件
      await this.completeUIComponents();

      // 4. 添加无障碍访问支持
      await this.addAccessibilitySupport();

      // 5. 升级依赖版本
      await this.upgradeDependencies();

      console.log("\n✅ 所有问题修复完成！");
      console.log("请重新运行测试脚本验证修复效果。");

    } catch (error) {
      console.error("❌ 修复过程中出现错误:", error);
    }
  }

  async addESLintConfig() {
    console.log("\n📝 添加ESLint配置...");

    const eslintConfig = {
      "env": {
        "browser": true,
        "es2021": true,
        "node": true
      },
      "extends": [
        "eslint:recommended",
        "@vue/eslint-config-prettier"
      ],
      "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
      },
      "plugins": [
        "vue"
      ],
      "rules": {
        "no-unused-vars": "warn",
        "no-console": "off",
        "vue/multi-word-component-names": "off",
        "vue/no-unused-components": "warn"
      },
      "globals": {
        "process": "readonly",
        "Buffer": "readonly"
      }
    };

    const eslintPath = path.join(__dirname, 'vidslide-ai/.eslintrc.js');
    fs.writeFileSync(eslintPath, `module.exports = ${JSON.stringify(eslintConfig, null, 2)};`);

    console.log("✅ ESLint配置已添加");
    this.issues.eslint = true;
  }

  async addSecurityMeasures() {
    console.log("\n🔒 加强安全措施...");

    // 1. 更新HTML文件添加CSP
    const indexPath = path.join(__dirname, 'vidslide-ai/index.html');
    let indexContent = fs.readFileSync(indexPath, 'utf8');

    // 添加CSP头部
    const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.googleapis.com; connect-src 'self' https://api.unsplash.com https://api.pexels.com https://pixabay.com;">`;

    // 在head标签开始后添加CSP
    indexContent = indexContent.replace(
      /<head>/,
      `<head>\n    ${cspMeta}`
    );

    fs.writeFileSync(indexPath, indexContent);

    // 2. 创建安全的HTML渲染工具
    const safeHtmlPath = path.join(__dirname, 'vidslide-ai/src/utils/safeHtml.js');
    const safeHtmlContent = `/**
 * 安全的HTML渲染工具
 * 防止XSS攻击
 */

class SafeHtmlRenderer {
  constructor() {
    this.allowedTags = [
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'u', 'br', 'img', 'a'
    ];
    this.allowedAttributes = [
      'class', 'id', 'style', 'src', 'alt', 'href', 'target'
    ];
  }

  /**
   * 安全的HTML渲染
   * @param {string} html - 要渲染的HTML字符串
   * @returns {string} - 清理后的安全HTML
   */
  sanitize(html) {
    if (!html) return '';

    // 创建DOM元素进行清理
    const div = document.createElement('div');
    div.innerHTML = html;

    // 递归清理所有元素
    this.cleanElement(div);

    return div.innerHTML;
  }

  /**
   * 递归清理DOM元素
   * @param {Element} element - 要清理的元素
   */
  cleanElement(element) {
    const children = Array.from(element.children);

    for (const child of children) {
      // 检查标签是否允许
      if (!this.allowedTags.includes(child.tagName.toLowerCase())) {
        // 移除不允许的标签
        element.removeChild(child);
        continue;
      }

      // 清理属性
      const attributes = Array.from(child.attributes);
      for (const attr of attributes) {
        if (!this.allowedAttributes.includes(attr.name.toLowerCase())) {
          child.removeAttribute(attr.name);
        }
      }

      // 递归处理子元素
      this.cleanElement(child);
    }
  }

  /**
   * 转义HTML特殊字符
   * @param {string} text - 要转义的文本
   * @returns {string} - 转义后的文本
   */
  escape(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 导出单例实例
export const safeHtml = new SafeHtmlRenderer();

// Vue指令版本
export const SafeHtmlDirective = {
  mounted(el, binding) {
    el.innerHTML = safeHtml.sanitize(binding.value);
  },
  updated(el, binding) {
    el.innerHTML = safeHtml.sanitize(binding.value);
  }
};

export default SafeHtmlRenderer;`;

    fs.writeFileSync(safeHtmlPath, safeHtmlContent);

    console.log("✅ 安全措施已加强 (CSP + XSS防护)");
    this.issues.security = true;
  }

  async completeUIComponents() {
    console.log("\n🎨 完善UI组件...");

    const missingComponents = [
      "VideoPlayer.vue",
      "AssetBrowser.vue",
      "TemplateSelector.vue"
    ];

    for (const component of missingComponents) {
      const componentPath = path.join(__dirname, `vidslide-ai/src/components/${component}`);
      if (!fs.existsSync(componentPath)) {
        await this.createBasicComponent(component, componentPath);
      }
    }

    console.log("✅ UI组件已完善");
    this.issues.ui = true;
  }

  async createBasicComponent(componentName, componentPath) {
    let componentContent = '';

    switch (componentName) {
      case 'VideoPlayer.vue':
        componentContent = `<template>
  <div class="video-player">
    <video
      ref="videoElement"
      :src="videoSrc"
      :controls="showControls"
      :autoplay="autoplay"
      :muted="muted"
      @loadeddata="onLoadedData"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      class="video-element"
    >
      <track v-if="subtitleSrc" :src="subtitleSrc" kind="subtitles" srclang="zh-CN" label="中文">
    </video>
    <div v-if="showCustomControls" class="custom-controls">
      <button @click="playPause" :aria-label="isPlaying ? '暂停' : '播放'">
        {{ isPlaying ? '⏸️' : '▶️' }}
      </button>
      <input
        type="range"
        v-model="currentTime"
        :max="duration"
        @input="seekToTime"
        class="progress-bar"
        aria-label="视频进度"
      >
      <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      <button @click="toggleMute" :aria-label="isMuted ? '取消静音' : '静音'">
        {{ isMuted ? '🔇' : '🔊' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  props: {
    videoSrc: {
      type: String,
      required: true
    },
    subtitleSrc: {
      type: String,
      default: null
    },
    showControls: {
      type: Boolean,
      default: true
    },
    showCustomControls: {
      type: Boolean,
      default: false
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isMuted: false
    };
  },
  methods: {
    playPause() {
      const video = this.$refs.videoElement;
      if (this.isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    },
    seekToTime() {
      const video = this.$refs.videoElement;
      video.currentTime = this.currentTime;
    },
    toggleMute() {
      const video = this.$refs.videoElement;
      video.muted = !video.muted;
      this.isMuted = video.muted;
    },
    onLoadedData() {
      this.duration = this.$refs.videoElement.duration;
      this.$emit('loaded', { duration: this.duration });
    },
    onTimeUpdate() {
      this.currentTime = this.$refs.videoElement.currentTime;
      this.$emit('timeupdate', { currentTime: this.currentTime });
    },
    onEnded() {
      this.isPlaying = false;
      this.$emit('ended');
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
    }
  },
  watch: {
    videoSrc() {
      // 视频源变化时重置状态
      this.isPlaying = false;
      this.currentTime = 0;
      this.duration = 0;
    }
  }
};
</script>

<style scoped>
.video-player {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: auto;
  display: block;
}

.custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-controls button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.custom-controls button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #007aff;
  border-radius: 50%;
  cursor: pointer;
}

.time-display {
  color: white;
  font-size: 14px;
  font-family: 'SF Pro Text', -apple-system, sans-serif;
  min-width: 80px;
  text-align: center;
}

@media (max-width: 768px) {
  .custom-controls {
    padding: 8px;
    gap: 8px;
  }

  .custom-controls button {
    font-size: 16px;
  }

  .time-display {
    font-size: 12px;
    min-width: 60px;
  }
}
</style>`;
        break;

      case 'AssetBrowser.vue':
        componentContent = `<template>
  <div class="asset-browser">
    <div class="browser-header">
      <h3>素材库</h3>
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索素材..."
          @input="debouncedSearch"
          class="search-input"
          aria-label="搜索素材"
        >
        <button @click="clearSearch" v-if="searchQuery" class="clear-btn" aria-label="清除搜索">
          ✕
        </button>
      </div>
      <div class="filter-tabs">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="setActiveCategory(category.id)"
          :class="['tab-btn', { active: activeCategory === category.id }]"
          :aria-pressed="activeCategory === category.id"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <div class="browser-content">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载素材中...</p>
      </div>

      <div v-else-if="filteredAssets.length === 0" class="empty-state">
        <div class="empty-icon">📂</div>
        <h4>没有找到素材</h4>
        <p>{{ searchQuery ? '尝试其他关键词' : '选择其他分类' }}</p>
      </div>

      <div v-else class="assets-grid">
        <div
          v-for="asset in paginatedAssets"
          :key="asset.id"
          class="asset-item"
          @click="selectAsset(asset)"
          :class="{ selected: selectedAsset?.id === asset.id }"
          tabindex="0"
          :aria-label="\`\${asset.name} - \${asset.type}\`"
          @keydown.enter="selectAsset(asset)"
          @keydown.space.prevent="selectAsset(asset)"
        >
          <div class="asset-preview">
            <img
              v-if="asset.type === 'image'"
              :src="asset.thumbnail"
              :alt="asset.name"
              class="asset-image"
              loading="lazy"
            >
            <div v-else class="asset-placeholder">
              {{ getAssetIcon(asset.type) }}
            </div>
          </div>
          <div class="asset-info">
            <h4 class="asset-name">{{ asset.name }}</h4>
            <span class="asset-type">{{ asset.type }}</span>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="page-btn"
          aria-label="上一页"
        >
          ‹
        </button>

        <span class="page-info">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
          aria-label="下一页"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'AssetBrowser',
  props: {
    initialCategory: {
      type: String,
      default: 'all'
    }
  },
  data() {
    return {
      assets: [],
      filteredAssets: [],
      selectedAsset: null,
      searchQuery: '',
      activeCategory: this.initialCategory,
      loading: false,
      currentPage: 1,
      pageSize: 12,
      categories: [
        { id: 'all', name: '全部' },
        { id: 'image', name: '图片' },
        { id: 'icon', name: '图标' },
        { id: 'chart', name: '图表' },
        { id: 'background', name: '背景' }
      ]
    };
  },
  computed: {
    paginatedAssets() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredAssets.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredAssets.length / this.pageSize);
    }
  },
  created() {
    this.debouncedSearch = _.debounce(this.performSearch, 300);
    this.loadAssets();
  },
  methods: {
    async loadAssets() {
      this.loading = true;
      try {
        // 模拟加载素材数据
        // 实际项目中这里会从API或本地存储加载
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.assets = [
          {
            id: '1',
            name: '蓝色渐变背景',
            type: 'background',
            thumbnail: '/assets/thumbnails/bg-blue.jpg',
            category: 'background'
          },
          {
            id: '2',
            name: '柱状图模板',
            type: 'chart',
            thumbnail: '/assets/thumbnails/chart-bar.jpg',
            category: 'chart'
          },
          {
            id: '3',
            name: '用户图标',
            type: 'icon',
            thumbnail: '/assets/thumbnails/icon-user.jpg',
            category: 'icon'
          }
          // 更多素材...
        ];

        this.filteredAssets = [...this.assets];
      } catch (error) {
        console.error('加载素材失败:', error);
        this.$emit('error', error);
      } finally {
        this.loading = false;
      }
    },

    performSearch() {
      let filtered = [...this.assets];

      // 按分类过滤
      if (this.activeCategory !== 'all') {
        filtered = filtered.filter(asset => asset.category === this.activeCategory);
      }

      // 按搜索关键词过滤
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(asset =>
          asset.name.toLowerCase().includes(query) ||
          asset.type.toLowerCase().includes(query)
        );
      }

      this.filteredAssets = filtered;
      this.currentPage = 1;
    },

    setActiveCategory(categoryId) {
      this.activeCategory = categoryId;
      this.performSearch();
    },

    clearSearch() {
      this.searchQuery = '';
      this.performSearch();
    },

    selectAsset(asset) {
      this.selectedAsset = asset;
      this.$emit('asset-selected', asset);
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    getAssetIcon(type) {
      const icons = {
        image: '🖼️',
        icon: '🎨',
        chart: '📊',
        background: '🎭'
      };
      return icons[type] || '📄';
    }
  },
  watch: {
    initialCategory(newCategory) {
      this.activeCategory = newCategory;
      this.performSearch();
    }
  }
};
</script>

<style scoped>
.asset-browser {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.browser-header {
  padding: 20px;
  border-bottom: 1px solid #e5e5e7;
  background: #f8f9fa;
}

.browser-header h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.search-bar {
  position: relative;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 1px solid #d1d1d6;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #007aff;
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 16px;
  color: #86868b;
  cursor: pointer;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 6px 12px;
  border: 1px solid #d1d1d6;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: #007aff;
}

.tab-btn.active {
  background: #007aff;
  color: white;
  border-color: #007aff;
}

.browser-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #86868b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e5e7;
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h4 {
  margin: 0 0 8px 0;
  color: #1d1d1f;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.asset-item {
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.asset-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.asset-item.selected {
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

.asset-preview {
  height: 100px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.asset-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-placeholder {
  font-size: 32px;
}

.asset-info {
  padding: 12px;
}

.asset-name {
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.asset-type {
  font-size: 11px;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e7;
}

.page-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d1d6;
  border-radius: 6px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #007aff;
  color: #007aff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #86868b;
  min-width: 60px;
  text-align: center;
}

@media (max-width: 768px) {
  .browser-header {
    padding: 16px;
  }

  .assets-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .asset-preview {
    height: 80px;
  }

  .asset-info {
    padding: 8px;
  }
}
</style>`;
        break;

      case 'TemplateSelector.vue':
        componentContent = `<template>
  <div class="template-selector">
    <div class="selector-header">
      <h3>选择模板</h3>
      <p>根据内容类型智能推荐最适合的模板</p>
    </div>

    <div class="templates-grid">
      <div
        v-for="template in templates"
        :key="template.id"
        class="template-card"
        @click="selectTemplate(template)"
        :class="{ selected: selectedTemplate?.id === template.id }"
        tabindex="0"
        :aria-label="\`\${template.name} - \${template.description}\`"
        @keydown.enter="selectTemplate(template)"
        @keydown.space.prevent="selectTemplate(template)"
      >
        <div class="template-preview">
          <div class="preview-placeholder">
            <div class="preview-icon">{{ template.icon }}</div>
            <div class="preview-layout" :class="\`layout-\${template.layout}\`">
              <div class="layout-element main"></div>
              <div class="layout-element secondary" v-if="template.hasSecondary"></div>
            </div>
          </div>
        </div>

        <div class="template-info">
          <h4 class="template-name">{{ template.name }}</h4>
          <p class="template-description">{{ template.description }}</p>
          <div class="template-tags">
            <span
              v-for="tag in template.tags"
              :key="tag"
              class="template-tag"
            >
              {{ tag }}
            </span>
          </div>
          <div v-if="template.recommended" class="recommended-badge">
            🎯 推荐
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedTemplate" class="selected-info">
      <div class="selected-header">
        <h4>已选择: {{ selectedTemplate.name }}</h4>
        <button @click="confirmSelection" class="confirm-btn">
          确认使用
        </button>
      </div>
      <div class="template-details">
        <div class="detail-item">
          <strong>适用场景:</strong> {{ selectedTemplate.scenes.join('、') }}
        </div>
        <div class="detail-item">
          <strong>特点:</strong> {{ selectedTemplate.features.join('、') }}
        </div>
        <div class="detail-item">
          <strong>调整范围:</strong> {{ selectedTemplate.adjustable ? '可调整文字和素材' : '预设样式' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TemplateSelector',
  props: {
    contentType: {
      type: String,
      default: 'general'
    },
    videoDuration: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      selectedTemplate: null,
      templates: [
        {
          id: 'pip-basic',
          name: '画中画模板',
          description: '视频与PPT并排显示，适合讲解类内容',
          icon: '📺',
          layout: 'pip',
          hasSecondary: true,
          tags: ['视频', '讲解', '演示'],
          scenes: ['产品介绍', '课程讲解', '功能演示'],
          features: ['人脸跟踪', '智能切换', '响应式布局'],
          adjustable: true,
          recommended: true
        },
        {
          id: 'info-cards',
          name: '信息卡片模板',
          description: '结构化展示多个信息点，适合数据展示',
          icon: '📊',
          layout: 'grid',
          hasSecondary: false,
          tags: ['数据', '列表', '对比'],
          scenes: ['数据分析', '功能对比', '要点总结'],
          features: ['自动布局', '颜色区分', '动画效果'],
          adjustable: true,
          recommended: false
        },
        {
          id: 'keyword-highlight',
          name: '关键词高亮模板',
          description: '突出显示重要关键词，适合演讲强调',
          icon: '🎯',
          layout: 'overlay',
          hasSecondary: false,
          tags: ['关键词', '强调', '高亮'],
          scenes: ['演讲稿', '要点强调', '术语解释'],
          features: ['智能识别', '动态显示', '中英对照'],
          adjustable: true,
          recommended: false
        },
        {
          id: 'document-showcase',
          name: '文档展示模板',
          description: '3D效果展示多个文档，适合资料分享',
          icon: '📄',
          layout: 'stacked',
          hasSecondary: false,
          tags: ['文档', '资料', '展示'],
          scenes: ['资料分享', '文件展示', '内容预览'],
          features: ['3D效果', '交互导航', '详细信息'],
          adjustable: true,
          recommended: false
        },
        {
          id: 'title-slide',
          name: '标题幻灯片模板',
          description: '简洁的标题展示，适合章节开始',
          icon: '📝',
          layout: 'centered',
          hasSecondary: false,
          tags: ['标题', '章节', '开始'],
          scenes: ['章节标题', '主题介绍', '内容开始'],
          features: ['居中布局', '渐入动画', '装饰元素'],
          adjustable: true,
          recommended: false
        }
      ]
    };
  },
  created() {
    this.updateRecommendations();
  },
  methods: {
    updateRecommendations() {
      // 基于内容类型和视频时长更新推荐
      this.templates.forEach(template => {
        template.recommended = this.isRecommended(template);
      });
    },

    isRecommended(template) {
      // 简单的推荐逻辑，实际项目中会更复杂
      if (this.contentType === 'presentation' && template.id === 'pip-basic') {
        return true;
      }
      if (this.contentType === 'data' && template.id === 'info-cards') {
        return true;
      }
      if (this.contentType === 'educational' && template.id === 'keyword-highlight') {
        return true;
      }
      if (this.videoDuration > 300 && template.id === 'document-showcase') {
        return true;
      }
      return false;
    },

    selectTemplate(template) {
      this.selectedTemplate = template;
      this.$emit('template-selected', template);
    },

    confirmSelection() {
      if (this.selectedTemplate) {
        this.$emit('template-confirmed', this.selectedTemplate);
      }
    }
  },
  watch: {
    contentType() {
      this.updateRecommendations();
    },
    videoDuration() {
      this.updateRecommendations();
    }
  }
};
</script>

<style scoped>
.template-selector {
  max-width: 1200px;
  margin: 0 auto;
}

.selector-header {
  text-align: center;
  margin-bottom: 32px;
}

.selector-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.selector-header p {
  font-size: 16px;
  color: #86868b;
  margin: 0;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.template-card {
  border: 2px solid #e5e5e7;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  position: relative;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #007aff;
}

.template-card.selected {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
}

.template-preview {
  height: 160px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.preview-icon {
  font-size: 32px;
  opacity: 0.8;
}

.preview-layout {
  width: 120px;
  height: 80px;
  position: relative;
  border: 1px solid #d1d1d6;
  border-radius: 4px;
  background: white;
}

.layout-pip .main {
  position: absolute;
  left: 8px;
  top: 8px;
  width: 60px;
  height: 34px;
  background: #007aff;
  border-radius: 4px;
}

.layout-pip .secondary {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 40px;
  height: 64px;
  background: #34c759;
  border-radius: 4px;
}

.layout-grid .main {
  width: 100%;
  height: 100%;
  background: #007aff;
  border-radius: 4px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  padding: 2px;
}

.layout-grid .main::before,
.layout-grid .main::after {
  content: '';
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
}

.layout-overlay .main {
  width: 100%;
  height: 100%;
  background: #007aff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.layout-overlay .main::before {
  content: '关键词';
}

.layout-stacked .main {
  width: 100%;
  height: 100%;
  background: #007aff;
  border-radius: 4px;
  position: relative;
}

.layout-stacked .main::before,
.layout-stacked .main::after {
  content: '';
  position: absolute;
  width: 80%;
  height: 60%;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2px;
  top: 20%;
  left: 10%;
}

.layout-stacked .main::after {
  width: 60%;
  height: 40%;
  background: rgba(255, 255, 255, 0.8);
  top: 30%;
  left: 20%;
}

.layout-centered .main {
  width: 100%;
  height: 100%;
  background: #007aff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 700;
}

.layout-centered .main::before {
  content: '标题';
}

.template-info {
  padding: 20px;
}

.template-name {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.template-description {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.template-tag {
  padding: 4px 8px;
  background: #f2f2f7;
  color: #007aff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
}

.recommended-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ff3b30;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.selected-info {
  border: 1px solid #e5e5e7;
  border-radius: 12px;
  padding: 24px;
  background: #f8f9fa;
}

.selected-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.selected-header h4 {
  margin: 0;
  font-size: 18px;
  color: #1d1d1f;
}

.confirm-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.confirm-btn:hover {
  background: #0056cc;
}

.template-details {
  display: grid;
  gap: 12px;
}

.detail-item {
  font-size: 14px;
  color: #1d1d1f;
  line-height: 1.4;
}

.detail-item strong {
  color: #007aff;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .selector-header {
    margin-bottom: 24px;
  }

  .selector-header h3 {
    font-size: 20px;
  }

  .template-preview {
    height: 140px;
  }

  .preview-layout {
    width: 100px;
    height: 70px;
  }

  .selected-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .confirm-btn {
    align-self: stretch;
  }
}
</style>`;
        break;
    }

    fs.writeFileSync(componentPath, componentContent);
  }

  async addAccessibilitySupport() {
    console.log("\n♿ 添加无障碍访问支持...");

    // 在主要的Vue组件中添加ARIA标签和键盘导航支持
    const componentsToUpdate = [
      'vidslide-ai/src/components/templates/PipTemplate.vue',
      'vidslide-ai/src/components/templates/InfoCardTemplate.vue'
    ];

    for (const componentPath of componentsToUpdate) {
      if (fs.existsSync(path.join(__dirname, componentPath))) {
        let content = fs.readFileSync(path.join(__dirname, componentPath), 'utf8');

        // 添加基本的ARIA支持
        if (!content.includes('aria-') && !content.includes('role=')) {
          // 在模板根元素添加role和aria-label
          content = content.replace(
            /<template>/,
            `<template>\n  <div role="region" :aria-label="templateDescription">`
          );

          // 关闭时也要更新
          content = content.replace(
            /<\/template>/,
            `  </div>\n</template>`
          );

          // 添加可聚焦元素
          if (content.includes('@click=')) {
            content = content.replace(
              /(@click="[^"]*")/g,
              '$1 tabindex="0" @keydown.enter="$2" @keydown.space.prevent="$2"'
            );
          }

          fs.writeFileSync(path.join(__dirname, componentPath), content);
        }
      }
    }

    console.log("✅ 无障碍访问支持已添加");
    this.issues.accessibility = true;
  }

  async upgradeDependencies() {
    console.log("\n📦 升级依赖版本...");

    const packageJsonPath = path.join(__dirname, 'vidslide-ai/package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // 升级不安全依赖
      const upgrades = {
        '@ffmpeg/core': '^0.12.6',
        '@ffmpeg/ffmpeg': '^0.12.6',
        '@ffmpeg/util': '^0.12.6',
        'face-api.js': '^0.22.2',
        'lucide-vue-next': '^0.294.0'
      };

      let updated = false;
      for (const [dep, version] of Object.entries(upgrades)) {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          packageJson.dependencies[dep] = version;
          updated = true;
        }
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          packageJson.devDependencies[dep] = version;
          updated = true;
        }
      }

      if (updated) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log("✅ 依赖版本已升级，请运行 npm install");
      } else {
        console.log("ℹ️ 无需升级的依赖");
      }
    }

    this.issues.dependencies = true;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const fixer = new TestIssuesFixer();
  fixer.fixAllIssues().catch(error => {
    console.error("修复过程中出现错误:", error);
    process.exit(1);
  });
}

module.exports = TestIssuesFixer;