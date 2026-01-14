module.exports = {
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