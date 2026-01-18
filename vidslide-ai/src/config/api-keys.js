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

// 百度语音识别API配置
// 申请地址: https://ai.baidu.com/tech/speech/asr
// 需要开通"短语音识别标准版"服务
export const BAIDU_SPEECH_CONFIG = {
  // 百度语音识别API密钥
  apiKey: '5bAqP0hDvOJ5qjxqf8HCAp04',
  secretKey: 'EeGwJFeifTImA843vw3DozuR6hzBq7wJ',
  // 识别参数
  format: 'pcm', // 音频格式: pcm, wav, amr, m4a
  rate: 16000, // 采样率: 16000
  channel: 1, // 声道数: 1
  cuid: 'vidslide_ai_client', // 用户唯一标识
  devPid: 1537 // 语言模型: 1537=普通话(支持简单英文), 1737=英语
}

// 百度NLP API配置（关键词提取）
// 申请地址: https://ai.baidu.com/tech/nlp_basic/keyword
// AppID: 121846973 (VidSlide-G)
export const BAIDU_NLP_CONFIG = {
  apiKey: 'AvbQlOsHwzNJr79fa64EKmZy',
  secretKey: 'bhqnDHqT3ncpGbIBSGPCimE4gl8zW7Jz'
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
  apiKey: typeof process !== 'undefined' && process.env ? process.env.GOOGLE_SEARCH_API_KEY : '',
  cx: typeof process !== 'undefined' && process.env ? process.env.GOOGLE_SEARCH_CX : '', // 自定义搜索引擎ID
  baseUrl: 'https://www.googleapis.com/customsearch/v1'
}

// Bing Search API配置 (备用搜索引擎)
export const BING_SEARCH_CONFIG = {
  apiKey: typeof process !== 'undefined' && process.env ? process.env.BING_SEARCH_API_KEY : '',
  endpoint: 'https://api.bing.microsoft.com/v7.0/images/search'
}

// NewsAPI配置 (专业新闻图片)
export const NEWSAPI_CONFIG = {
  apiKey: typeof process !== 'undefined' && process.env ? process.env.NEWSAPI_KEY : '',
  baseUrl: 'https://newsapi.org/v2'
}

// Twitter API配置 (实时社交图片)
export const TWITTER_CONFIG = {
  bearerToken:
    typeof process !== 'undefined' && process.env ? process.env.TWITTER_BEARER_TOKEN : '',
  baseUrl: 'https://api.twitter.com/2'
}

// OpenAI DALL-E配置 (AI生成图片兜底)
export const OPENAI_CONFIG = {
  apiKey: typeof process !== 'undefined' && process.env ? process.env.OPENAI_API_KEY : '',
  baseUrl: 'https://api.openai.com/v1'
}

// Remove.bg API配置 (专业背景移除服务)
export const REMOVEBG_CONFIG = {
  apiKey: typeof process !== 'undefined' && process.env ? process.env.REMOVEBG_API_KEY : '',
  baseUrl: 'https://api.remove.bg/v1.0',
  endpoints: {
    removebg: '/removebg'
  }
}

// Claid.ai API配置 (AI图像处理服务)
export const CLAIDAI_CONFIG = {
  apiKey: typeof process !== 'undefined' && process.env ? process.env.CLAIDAI_API_KEY : '',
  baseUrl: 'https://api.claid.ai/v1',
  endpoints: {
    backgroundRemoval: '/background-removal'
  }
}

// API配置集合
export const API_CONFIGS = {
  baiduTranslate: BAIDU_TRANSLATE_CONFIG,
  baiduSpeech: BAIDU_SPEECH_CONFIG,
  baiduNlp: BAIDU_NLP_CONFIG,
  unsplash: UNSPLASH_CONFIG,
  pexels: PEXELS_CONFIG,
  pixabay: PIXABAY_CONFIG,
  googleSearch: GOOGLE_SEARCH_CONFIG,
  bingSearch: BING_SEARCH_CONFIG,
  newsapi: NEWSAPI_CONFIG,
  twitter: TWITTER_CONFIG,
  openai: OPENAI_CONFIG,
  removebg: REMOVEBG_CONFIG,
  claidai: CLAIDAI_CONFIG
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
    case 'baiduSpeech':
      return !!(config.apiKey && config.secretKey)
    case 'baiduNlp':
      return !!(config.apiKey && config.secretKey)
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
    case 'removebg':
      return !!config.apiKey
    case 'claidai':
      return !!config.apiKey
    default:
      return false
  }
}

export default API_CONFIGS
