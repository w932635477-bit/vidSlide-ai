/**
 * VidSlide AI 配置文件
 *
 * 用于配置应用的各种选项
 */

export const config = {
  // 服务器端 API 配置
  server: {
    // 是否使用服务器端 API 进行一键生成
    // true: 使用服务器端（支持豆包生图、人脸检测、智能裁剪）
    // false: 使用浏览器端（功能受限，但不需要服务器）
    useServerAPI: true,

    // 服务器地址
    url: 'http://localhost:3002',

    // 轮询间隔（毫秒）
    pollInterval: 1000
  },

  // 视频处理配置
  video: {
    // 默认目标平台
    defaultPlatform: 'douyin',

    // 视频压缩质量
    compressionQuality: 0.8
  },

  // 调试配置
  debug: {
    // 是否启用详细日志
    verbose: true,

    // 是否显示性能指标
    showPerformance: false
  }
}

export default config
