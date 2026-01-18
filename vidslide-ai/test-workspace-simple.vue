<template>
  <div class="test-workspace">
    <h1>🧪 简化工作空间测试</h1>
    <p>如果您能看到这个页面，说明路由和基本渲染正常。</p>

    <div class="status-info">
      <p><strong>当前URL:</strong> {{ currentUrl }}</p>
      <p><strong>路由参数:</strong> {{ $route ? $route.path : '无路由' }}</p>
    </div>

    <div class="component-test">
      <h2>组件测试</h2>
      <AssetBrowser v-if="showAssetBrowser" aria-label="测试素材浏览器" />
      <button @click="toggleAssetBrowser">
        {{ showAssetBrowser ? '隐藏' : '显示' }} AssetBrowser
      </button>
    </div>
  </div>
</template>

<script>
import AssetBrowser from './src/components/AssetBrowser.vue'

export default {
  name: 'TestWorkspaceSimple',
  components: {
    AssetBrowser
  },
  data() {
    return {
      showAssetBrowser: false,
      currentUrl: window.location.href
    }
  },
  mounted() {
    console.log('简化工作空间组件已挂载')
    console.log('当前路由:', this.$route)
  },
  methods: {
    toggleAssetBrowser() {
      this.showAssetBrowser = !this.showAssetBrowser
    }
  }
}
</script>

<style scoped>
.test-workspace {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.status-info {
  background: #e7f3ff;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.status-info p {
  margin: 5px 0;
}

.component-test {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>
