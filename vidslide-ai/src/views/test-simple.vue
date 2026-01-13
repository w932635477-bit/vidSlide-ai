<template>
  <div class="test-simple">
    <h1>🧪 简单测试组件</h1>
    <p>如果您能看到这个页面，说明组件渲染正常。</p>
    <p><strong>当前URL:</strong> {{ currentUrl }}</p>
    <p><strong>时间戳:</strong> {{ timestamp }}</p>
    <button @click="updateTime">更新时间</button>
  </div>
</template>

<script>
export default {
  name: 'TestSimple',
  data() {
    return {
      currentUrl: window.location.href,
      timestamp: new Date().toLocaleString()
    }
  },
  methods: {
    updateTime() {
      this.timestamp = new Date().toLocaleString()
    }
  },
  mounted() {
    console.log('简单测试组件已挂载')
  }
}
</script>

<style scoped>
.test-simple {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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