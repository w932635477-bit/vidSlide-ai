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
    'vue/no-unused-vars': 'error',
    'vue/require-v-for-key': 'error',
    'vue/no-use-v-if-with-v-for': 'error',

    // JavaScript 规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-case-declarations': 'off', // 允许在case块中使用词法声明

    // 代码风格
    'comma-dangle': ['error', 'never'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    indent: ['error', 2],
    'max-len': 'off',
    'object-curly-spacing': ['error', 'always']
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
