module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', '@vue/eslint-config-prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['vue'],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-components': 'warn',
    'vue/no-v-html': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off'
  },
  globals: {
    process: 'readonly',
    Buffer: 'readonly',
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  }
}
