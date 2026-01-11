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
  },
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue生态
          'vue-vendor': ['vue', '@vue/runtime-core', '@vue/runtime-dom'],
          // UI库
          'ui-vendor': ['element-plus'],
          // AI和多媒体处理
          'ai-vendor': ['face-api.js', '@ffmpeg/ffmpeg'],
          // 导出功能
          'export-vendor': ['pptxgenjs'],
          // 工具库
          'utils-vendor': ['@vueuse/core']
        }
      }
    },
    // 构建优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 分块大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用source map用于生产环境调试
    sourcemap: false
  }
})
