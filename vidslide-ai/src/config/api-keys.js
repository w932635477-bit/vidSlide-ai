/**
 * VidSlide AI - API密钥配置文件
 * 集中管理所有外部API的密钥配置
 */

// 百度翻译API配置
export const BAIDU_TRANSLATE_CONFIG = {
  appid: '20251129002508451',
  key: 'YuG2_d5hh1ouae048ssik22kg',
  secret: '7HSjcjQ7aETcw0HqpMA7'
}

// Unsplash API配置
export const UNSPLASH_CONFIG = {
  accessKey: 'zPjqHo_L8Vx-gckbifgYM1bJxnYbFRgFXLXFwWcAN30',
  appId: '851289'
}

// Pexels API配置
export const PEXELS_CONFIG = {
  apiKey: 'LnDV3UqDXRD71HMtGzXByhFF1mwwuHdU4RKXsMKtjgHOaCOV1iwrA0Xz'
}

// Pixabay API配置
export const PIXABAY_CONFIG = {
  apiKey: '52722038-7ac4769e00433c06f9c6333bc'
}

// Google Custom Search API配置 (用于最新时事图片)
export const GOOGLE_SEARCH_CONFIG = {
  apiKey: process.env.GOOGLE_SEARCH_API_KEY || '',
  cx: process.env.GOOGLE_SEARCH_CX || '', // 自定义搜索引擎ID
  baseUrl: 'https://www.googleapis.com/customsearch/v1'
}

// Bing Search API配置 (备用搜索引擎)
export const BING_SEARCH_CONFIG = {
  apiKey: process.env.BING_SEARCH_API_KEY || '',
  endpoint: 'https://api.bing.microsoft.com/v7.0/images/search'
}

// NewsAPI配置 (专业新闻图片)
export const NEWSAPI_CONFIG = {
  apiKey: process.env.NEWSAPI_KEY || '',
  baseUrl: 'https://newsapi.org/v2'
}

// Twitter API配置 (实时社交图片)
export const TWITTER_CONFIG = {
  bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
  baseUrl: 'https://api.twitter.com/2'
}

// OpenAI DALL-E配置 (AI生成图片兜底)
export const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseUrl: 'https://api.openai.com/v1'
}

// API配置集合
export const API_CONFIGS = {
  baiduTranslate: BAIDU_TRANSLATE_CONFIG,
  unsplash: UNSPLASH_CONFIG,
  pexels: PEXELS_CONFIG,
  pixabay: PIXABAY_CONFIG,
  googleSearch: GOOGLE_SEARCH_CONFIG,
  bingSearch: BING_SEARCH_CONFIG,
  newsapi: NEWSAPI_CONFIG,
  twitter: TWITTER_CONFIG,
  openai: OPENAI_CONFIG
}

/**
 * 获取API配置
 * @param {string} apiName - API名称
 * @returns {Object} API配置对象
 */
export function getAPIConfig(apiName) {
  return API_CONFIGS[apiName]
}

/**
 * 获取所有API配置
 * @returns {Object} 所有API配置
 */
export function getAllAPIConfigs() {
  return API_CONFIGS
}

/**
 * 检查API配置是否完整
 * @param {string} apiName - API名称
 * @returns {boolean} 是否配置完整
 */
export function isAPIConfigured(apiName) {
  const config = API_CONFIGS[apiName]
  if (!config) return false

  // 检查必需字段
  switch (apiName) {
    case 'baiduTranslate':
      return !!(config.appid && config.key)
    case 'unsplash':
      return !!config.accessKey
    case 'pexels':
      return !!config.apiKey
    case 'pixabay':
      return !!config.apiKey
    case 'googleSearch':
      return !!(config.apiKey && config.cx)
    case 'bingSearch':
      return !!config.apiKey
    case 'newsapi':
      return !!config.apiKey
    case 'twitter':
      return !!config.bearerToken
    case 'openai':
      return !!config.apiKey
    default:
      return false
  }
}

export default API_CONFIGS
