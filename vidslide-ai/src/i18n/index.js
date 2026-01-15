import { createI18n } from 'vue-i18n'
import { locales } from './locales.js'

const i18n = createI18n({
  legacy: false, // 使用Composition API模式
  locale: 'zhCN', // 默认语言
  fallbackLocale: 'enUS', // 回退语言
  messages: locales,
  globalInjection: true, // 全局注入$t函数
  allowComposition: true // 允许Composition API使用
})

export default i18n