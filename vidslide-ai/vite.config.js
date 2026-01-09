import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, // 使用Vite默认端口
    host: 'localhost', // 使用localhost避免权限问题
    strictPort: false,
    // 允许跨域访问
    cors: true,
    // 额外网络配置
    open: false,
    fs: {
      strict: false
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
