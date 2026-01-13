module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: ['eslint:recommended', '@vue/eslint-config-prettier', 'plugin:vue/vue3-recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['vue'],
  rules: {
    // Vue 3 规则
    'vue/multi-word-component-names': 'off', // 允许单词组件名
    'vue/no-unused-vars': 'warn', // 降级为警告
    'vue/require-v-for-key': 'warn', // 降级为警告
    'vue/no-use-v-if-with-v-for': 'warn', // 降级为警告

    // JavaScript 规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': [
      'warn', // 降级为警告而不是错误
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ],
    'prefer-const': 'warn', // 降级为警告
    'no-var': 'warn', // 降级为警告
    'no-case-declarations': 'off', // 允许在case块中使用词法声明

    // 代码风格
    'comma-dangle': ['warn', 'never'], // 降级为警告
    quotes: ['warn', 'single'], // 降级为警告
    semi: ['warn', 'never'], // 降级为警告
    indent: ['off'], // 完全禁用缩进检查，专注于代码逻辑错误
    'max-len': 'off',
    'object-curly-spacing': ['warn', 'always'] // 降级为警告
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
    // TensorFlow.js
    tf: 'readonly',
    // PDF and PPTX libraries
    jsPDF: 'readonly',
    PptxGenJS: 'readonly',
    // Web APIs
    VideoEncoder: 'readonly',
    VideoDecoder: 'readonly',
    VideoFrame: 'readonly',
    webkitAudioContext: 'readonly'
  }
}
