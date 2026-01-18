/**
 * VidSlide AI - 百度语音识别服务
 * 使用百度AI开放平台的语音识别API
 *
 * 功能：
 * 1. 从视频文件中提取音频
 * 2. 将音频转换为PCM格式
 * 3. 调用百度语音识别API进行转文字
 *
 * 申请地址: https://ai.baidu.com/tech/speech/asr
 */

import { BAIDU_SPEECH_CONFIG } from '../config/api-keys.js'

// Access Token缓存
let accessToken = null
let tokenExpireTime = 0

/**
 * 百度语音识别服务类
 */
export class BaiduSpeechService {
  constructor() {
    this.config = BAIDU_SPEECH_CONFIG
    this.isConfigured = !!(this.config.apiKey && this.config.secretKey)
  }

  /**
   * 检查服务是否已配置
   */
  checkConfiguration() {
    if (!this.isConfigured) {
      throw new Error(
        '百度语音识别API未配置，请在 src/config/api-keys.js 中填入 apiKey 和 secretKey'
      )
    }
  }

  /**
   * 获取Access Token
   * 百度API需要先获取token才能调用
   * 使用Vite代理解决CORS问题
   */
  async getAccessToken() {
    // 检查缓存的token是否有效
    if (accessToken && Date.now() < tokenExpireTime) {
      return accessToken
    }

    this.checkConfiguration()

    // 使用Vite代理路径，避免CORS问题
    const url = `/api/baidu/oauth/2.0/token?grant_type=client_credentials&client_id=${this.config.apiKey}&client_secret=${this.config.secretKey}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`获取Token失败: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(`百度API错误: ${data.error_description || data.error}`)
      }

      accessToken = data.access_token
      // Token有效期30天，提前1天刷新
      tokenExpireTime = Date.now() + (data.expires_in - 86400) * 1000

      return accessToken
    } catch (error) {
      console.error('获取百度Access Token失败:', error)
      throw error
    }
  }

  /**
   * 从视频文件中提取音频
   * @param {File} videoFile - 视频文件
   * @returns {Promise<AudioBuffer>} 音频数据
   */
  async extractAudioFromVideo(videoFile) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true

      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000 // 百度API要求16000采样率
      })

      video.onloadedmetadata = async () => {
        try {
          // 创建MediaElement源
          const source = audioContext.createMediaElementSource(video)
          const destination = audioContext.createMediaStreamDestination()
          source.connect(destination)

          // 使用MediaRecorder录制音频
          const mediaRecorder = new MediaRecorder(destination.stream, {
            mimeType: 'audio/webm'
          })

          const chunks = []
          mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) {
              chunks.push(e.data)
            }
          }

          mediaRecorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/webm' })
            const arrayBuffer = await blob.arrayBuffer()
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
            URL.revokeObjectURL(video.src)
            resolve(audioBuffer)
          }

          // 开始录制
          mediaRecorder.start()
          video.play()

          // 等待视频播放完成
          video.onended = () => {
            mediaRecorder.stop()
          }

          // 超时保护
          setTimeout(
            () => {
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop()
                video.pause()
              }
            },
            (video.duration + 5) * 1000
          )
        } catch (error) {
          URL.revokeObjectURL(video.src)
          reject(error)
        }
      }

      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        reject(new Error('无法加载视频文件'))
      }

      video.src = URL.createObjectURL(videoFile)
    })
  }

  /**
   * 从视频文件提取音频并转换为PCM格式
   * 优先使用 Web Audio API 直接解码（快速），失败则回退到实时播放捕获
   * @param {File} videoFile - 视频文件
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<ArrayBuffer>} PCM音频数据
   */
  async extractAudioAsPCM(videoFile, onProgress = null) {
    console.log('开始从视频提取音频...')

    // 方法1: 尝试直接使用 Web Audio API 解码（最快）
    try {
      if (onProgress) onProgress(0.05)
      console.log('尝试使用 Web Audio API 直接解码...')

      const arrayBuffer = await videoFile.arrayBuffer()
      if (onProgress) onProgress(0.2)

      const audioContext = new (window.AudioContext || window.webkitAudioContext)()

      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        console.log(
          'Web Audio API 解码成功，采样率:',
          audioBuffer.sampleRate,
          '时长:',
          audioBuffer.duration
        )

        if (onProgress) onProgress(0.5)

        // 转换为单声道
        const numChannels = audioBuffer.numberOfChannels
        const length = audioBuffer.length
        const monoData = new Float32Array(length)

        if (numChannels === 1) {
          monoData.set(audioBuffer.getChannelData(0))
        } else {
          const left = audioBuffer.getChannelData(0)
          const right = audioBuffer.getChannelData(1)
          for (let i = 0; i < length; i++) {
            monoData[i] = (left[i] + right[i]) / 2
          }
        }

        if (onProgress) onProgress(0.7)

        // 重采样到16000Hz
        const resampledAudio = this.resampleAudio(monoData, audioBuffer.sampleRate, 16000)

        if (onProgress) onProgress(0.9)

        // 转换为PCM
        const pcmData = this.float32ToPCM16(resampledAudio)

        await audioContext.close()

        console.log('音频提取完成（直接解码），PCM数据大小:', pcmData.byteLength)
        if (onProgress) onProgress(1.0)

        return pcmData
      } catch (decodeError) {
        console.warn('Web Audio API 解码失败，尝试备用方法:', decodeError.message)
        await audioContext.close()
      }
    } catch (e) {
      console.warn('读取文件失败:', e.message)
    }

    // 方法2: 使用 captureStream 实时捕获（正常速度播放）
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.crossOrigin = 'anonymous'
      video.preload = 'auto'

      const videoUrl = URL.createObjectURL(videoFile)
      let cleanedUp = false

      const cleanup = () => {
        if (cleanedUp) return
        cleanedUp = true
        URL.revokeObjectURL(videoUrl)
        video.src = ''
        video.load()
      }

      video.onloadedmetadata = async () => {
        try {
          const duration = video.duration
          console.log('视频时长:', duration, '秒，使用实时捕获方法')

          if (duration <= 0 || !isFinite(duration)) {
            cleanup()
            reject(new Error('无法获取视频时长'))
            return
          }

          if (onProgress) onProgress(0.1)

          // 使用 captureStream 实时捕获（正常速度）
          if (video.captureStream) {
            try {
              const pcmData = await this.extractViaCaptureStream(video, duration, onProgress)
              cleanup()
              resolve(pcmData)
              return
            } catch (e) {
              console.warn('captureStream 方法失败:', e)
            }
          }

          cleanup()
          reject(new Error('无法从视频中提取音频，请确保视频包含音频轨道'))
        } catch (error) {
          cleanup()
          reject(error)
        }
      }

      video.onerror = e => {
        console.error('视频加载错误:', e)
        cleanup()
        reject(new Error('无法加载视频文件'))
      }

      video.src = videoUrl
      video.load()
    })
  }

  /**
   * 使用 captureStream 提取音频
   * 注意：不能使用 video.muted = true，否则 captureStream 的音频也会静音
   */
  async extractViaCaptureStream(video, duration, onProgress) {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const audioChunks = []
      let isRecording = true

      // 获取视频流 - 必须在设置 muted 之前调用
      const stream = video.captureStream()
      const audioTracks = stream.getAudioTracks()

      if (audioTracks.length === 0) {
        reject(new Error('视频没有音频轨道'))
        return
      }

      console.log('检测到音频轨道:', audioTracks.length)

      // 创建音频源 - 从流中获取音频
      const source = audioContext.createMediaStreamSource(stream)

      // 创建增益节点用于静音输出（但不影响录制）
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 0 // 静音输出到扬声器

      // 使用 ScriptProcessor 捕获音频（在静音之前）
      const bufferSize = 4096
      const processor = audioContext.createScriptProcessor(bufferSize, 2, 2)

      processor.onaudioprocess = e => {
        if (!isRecording) return

        const left = e.inputBuffer.getChannelData(0)
        const right = e.inputBuffer.numberOfChannels > 1 ? e.inputBuffer.getChannelData(1) : left

        // 检查是否有实际音频数据
        let hasAudio = false
        for (let i = 0; i < left.length; i++) {
          if (Math.abs(left[i]) > 0.0001) {
            hasAudio = true
            break
          }
        }

        // 混合为单声道
        const mono = new Float32Array(left.length)
        for (let i = 0; i < left.length; i++) {
          mono[i] = (left[i] + right[i]) / 2
        }
        audioChunks.push(mono)

        if (hasAudio && audioChunks.length === 1) {
          console.log('检测到音频数据')
        }
      }

      // 连接节点：source -> processor -> gainNode -> destination
      // 这样可以捕获音频但不播放声音
      source.connect(processor)
      processor.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // 不要设置 muted，否则 captureStream 也会静音
      // 而是通过 gainNode 来静音
      video.volume = 0.01 // 设置很小的音量，几乎听不到
      // 注意：必须使用正常速度播放，否则音频会被压缩导致识别错误
      video.playbackRate = 1.0

      video.ontimeupdate = () => {
        if (duration > 0 && onProgress) {
          const progress = 0.1 + (video.currentTime / duration) * 0.6
          onProgress(Math.min(progress, 0.7))
        }
      }

      video.onended = async () => {
        isRecording = false

        try {
          if (onProgress) onProgress(0.75)

          // 合并音频块
          const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0)

          console.log('捕获的音频块数量:', audioChunks.length, '总采样数:', totalLength)

          if (totalLength === 0) {
            processor.disconnect()
            source.disconnect()
            gainNode.disconnect()
            await audioContext.close()
            reject(new Error('未能捕获到音频数据'))
            return
          }

          const mergedAudio = new Float32Array(totalLength)
          let offset = 0
          for (const chunk of audioChunks) {
            mergedAudio.set(chunk, offset)
            offset += chunk.length
          }

          // 检查音频是否全是静音
          let maxAmplitude = 0
          for (let i = 0; i < mergedAudio.length; i += 100) {
            maxAmplitude = Math.max(maxAmplitude, Math.abs(mergedAudio[i]))
          }
          console.log('音频最大振幅:', maxAmplitude)

          if (maxAmplitude < 0.001) {
            processor.disconnect()
            source.disconnect()
            gainNode.disconnect()
            await audioContext.close()
            reject(new Error('捕获的音频数据为静音'))
            return
          }

          if (onProgress) onProgress(0.85)

          // 重采样到16000Hz
          const resampledAudio = this.resampleAudio(mergedAudio, audioContext.sampleRate, 16000)

          if (onProgress) onProgress(0.95)

          // 转换为PCM
          const pcmData = this.float32ToPCM16(resampledAudio)

          processor.disconnect()
          source.disconnect()
          gainNode.disconnect()
          await audioContext.close()

          console.log('音频提取完成，PCM数据大小:', pcmData.byteLength)
          resolve(pcmData)
        } catch (error) {
          reject(error)
        }
      }

      video.onerror = () => {
        isRecording = false
        reject(new Error('视频播放出错'))
      }

      // 开始播放
      video.play().catch(err => {
        console.error('播放失败:', err)
        reject(new Error('无法播放视频'))
      })
    })
  }

  /**
   * 使用 MediaRecorder 提取音频（备用方法）
   */
  async extractViaMediaRecorder(video, duration, onProgress) {
    return new Promise((resolve, reject) => {
      // 创建一个 canvas 来捕获视频
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')

      // 获取视频流
      const stream = video.captureStream ? video.captureStream() : video.mozCaptureStream()

      if (!stream) {
        reject(new Error('浏览器不支持 captureStream'))
        return
      }

      const audioTracks = stream.getAudioTracks()
      if (audioTracks.length === 0) {
        reject(new Error('视频没有音频轨道'))
        return
      }

      // 只保留音频轨道
      const audioStream = new MediaStream(audioTracks)

      // 检查支持的 MIME 类型
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ]

      let selectedMimeType = ''
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }

      if (!selectedMimeType) {
        reject(new Error('浏览器不支持音频录制'))
        return
      }

      console.log('使用 MIME 类型:', selectedMimeType)

      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: selectedMimeType
      })

      const chunks = []

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        try {
          if (onProgress) onProgress(0.7)

          const blob = new Blob(chunks, { type: selectedMimeType })
          console.log('录制的音频大小:', blob.size)

          // 解码音频
          const arrayBuffer = await blob.arrayBuffer()
          const audioContext = new (window.AudioContext || window.webkitAudioContext)()

          if (onProgress) onProgress(0.8)

          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

          if (onProgress) onProgress(0.9)

          // 转换为单声道 Float32
          const numChannels = audioBuffer.numberOfChannels
          const length = audioBuffer.length
          const monoData = new Float32Array(length)

          if (numChannels === 1) {
            monoData.set(audioBuffer.getChannelData(0))
          } else {
            const left = audioBuffer.getChannelData(0)
            const right = audioBuffer.getChannelData(1)
            for (let i = 0; i < length; i++) {
              monoData[i] = (left[i] + right[i]) / 2
            }
          }

          // 重采样到16000Hz
          const resampledAudio = this.resampleAudio(monoData, audioBuffer.sampleRate, 16000)

          // 转换为PCM
          const pcmData = this.float32ToPCM16(resampledAudio)

          await audioContext.close()

          console.log('音频提取完成，PCM数据大小:', pcmData.byteLength)
          resolve(pcmData)
        } catch (error) {
          console.error('音频处理失败:', error)
          reject(error)
        }
      }

      mediaRecorder.onerror = e => {
        reject(new Error('录制出错: ' + e.error))
      }

      video.ontimeupdate = () => {
        if (duration > 0 && onProgress) {
          const progress = 0.1 + (video.currentTime / duration) * 0.5
          onProgress(Math.min(progress, 0.6))
        }
      }

      video.onended = () => {
        mediaRecorder.stop()
      }

      // 不要使用 muted，否则 captureStream 的音频也会静音
      // 使用很小的音量代替
      video.volume = 0.01
      // 注意：必须使用正常速度播放，否则音频会被压缩导致识别错误
      video.playbackRate = 1.0

      // 开始录制和播放
      mediaRecorder.start(100) // 每100ms收集一次数据
      video.play().catch(err => {
        mediaRecorder.stop()
        reject(new Error('无法播放视频: ' + err.message))
      })
    })
  }

  /**
   * 重采样音频数据
   * @param {Float32Array} audioData - 原始音频数据
   * @param {number} originalRate - 原始采样率
   * @param {number} targetRate - 目标采样率
   * @returns {Float32Array} 重采样后的音频数据
   */
  resampleAudio(audioData, originalRate, targetRate) {
    if (originalRate === targetRate) {
      return audioData
    }

    const ratio = originalRate / targetRate
    const newLength = Math.round(audioData.length / ratio)
    const result = new Float32Array(newLength)

    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio
      const srcIndexFloor = Math.floor(srcIndex)
      const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1)
      const fraction = srcIndex - srcIndexFloor

      // 线性插值
      result[i] = audioData[srcIndexFloor] * (1 - fraction) + audioData[srcIndexCeil] * fraction
    }

    return result
  }

  /**
   * 将Float32音频数据转换为16位PCM
   * @param {Float32Array} float32Data - 浮点音频数据
   * @returns {ArrayBuffer} PCM数据
   */
  float32ToPCM16(float32Data) {
    const pcmData = new Int16Array(float32Data.length)

    for (let i = 0; i < float32Data.length; i++) {
      // 限制在 -1 到 1 之间
      const sample = Math.max(-1, Math.min(1, float32Data[i]))
      // 转换为16位整数
      pcmData[i] = sample < 0 ? sample * 32768 : sample * 32767
    }

    return pcmData.buffer
  }

  /**
   * 将AudioBuffer转换为16位PCM数据
   * @param {AudioBuffer} audioBuffer - 音频缓冲区
   * @returns {ArrayBuffer} PCM数据
   */
  audioBufferToPCM(audioBuffer) {
    // 获取单声道数据（如果是立体声，取平均值）
    const numChannels = audioBuffer.numberOfChannels
    const length = audioBuffer.length
    const pcmData = new Int16Array(length)

    if (numChannels === 1) {
      const channelData = audioBuffer.getChannelData(0)
      for (let i = 0; i < length; i++) {
        // 将浮点数转换为16位整数
        pcmData[i] = Math.max(-32768, Math.min(32767, Math.round(channelData[i] * 32767)))
      }
    } else {
      // 多声道取平均
      const channels = []
      for (let c = 0; c < numChannels; c++) {
        channels.push(audioBuffer.getChannelData(c))
      }
      for (let i = 0; i < length; i++) {
        let sum = 0
        for (let c = 0; c < numChannels; c++) {
          sum += channels[c][i]
        }
        const avg = sum / numChannels
        pcmData[i] = Math.max(-32768, Math.min(32767, Math.round(avg * 32767)))
      }
    }

    return pcmData.buffer
  }

  /**
   * 调用百度语音识别API
   * @param {ArrayBuffer} pcmData - PCM音频数据
   * @returns {Promise<string>} 识别结果文本
   */
  async recognizeSpeech(pcmData) {
    const token = await this.getAccessToken()

    // 将PCM数据转换为Base64
    const base64Audio = this.arrayBufferToBase64(pcmData)

    const requestBody = {
      format: 'pcm',
      rate: 16000,
      channel: 1,
      cuid: this.config.cuid || 'vidslide_ai_client',
      token: token,
      dev_pid: this.config.devPid || 1537, // 普通话
      speech: base64Audio,
      len: pcmData.byteLength
    }

    try {
      // 使用Vite代理路径，避免CORS问题
      const response = await fetch('/api/speech/server_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`)
      }

      const result = await response.json()

      if (result.err_no !== 0) {
        // 错误码处理
        const errorMessages = {
          3300: '输入参数不正确',
          3301: '音频质量过差',
          3302: '鉴权失败',
          3303: '语音服务器后端问题',
          3304: '用户的请求QPS超限',
          3305: '用户的日pv超限',
          3307: '语音服务器后端识别出错问题',
          3308: '音频过长',
          3309: '音频数据问题',
          3310: '输入的音频文件过大',
          3311: '采样率rate参数不在选项里',
          3312: '音频格式format参数不在选项里'
        }
        throw new Error(errorMessages[result.err_no] || `识别失败: ${result.err_msg}`)
      }

      // 返回识别结果
      return result.result ? result.result.join('') : ''
    } catch (error) {
      console.error('百度语音识别失败:', error)
      throw error
    }
  }

  /**
   * 分段识别长音频
   * 百度API限制单次请求音频时长不超过60秒，且Base64编码后不超过2MB
   * @param {ArrayBuffer} pcmData - PCM音频数据
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<string>} 完整识别结果
   */
  async recognizeLongAudio(pcmData, onProgress = null) {
    const sampleRate = 16000
    const bytesPerSample = 2 // 16位
    // 减小每段时长到30秒，确保Base64编码后不超过2MB
    // 30秒 * 16000Hz * 2字节 = 960,000字节 ≈ 0.96MB，Base64后约1.28MB
    const maxDuration = 30 // 每段最大30秒
    const maxBytes = maxDuration * sampleRate * bytesPerSample

    const totalBytes = pcmData.byteLength
    const segments = Math.ceil(totalBytes / maxBytes)
    const results = []

    console.log(`📊 音频总大小: ${(totalBytes / 1024 / 1024).toFixed(2)}MB，将分为 ${segments} 段处理`)

    for (let i = 0; i < segments; i++) {
      const start = i * maxBytes
      const end = Math.min(start + maxBytes, totalBytes)
      const segment = pcmData.slice(start, end)

      console.log(`🎤 处理第 ${i + 1}/${segments} 段，大小: ${(segment.byteLength / 1024).toFixed(2)}KB`)

      if (onProgress) {
        onProgress((i + 0.5) / segments)
      }

      try {
        const text = await this.recognizeSpeech(segment)
        if (text) {
          results.push(text)
        }

        // 添加短暂延迟，避免API请求过快
        if (i < segments - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (error) {
        console.warn(`第${i + 1}段识别失败:`, error)
        // 继续处理下一段
      }

      // 避免请求过快
      if (i < segments - 1) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    if (onProgress) {
      onProgress(1)
    }

    return results.join('')
  }

  /**
   * 从视频文件识别语音（完整流程）
   * @param {File} videoFile - 视频文件
   * @param {Function} onProgress - 进度回调 (0-1)
   * @returns {Promise<string>} 识别结果文本
   */
  async transcribeVideo(videoFile, onProgress = null) {
    this.checkConfiguration()

    console.log('开始视频语音识别...')
    console.log(
      '视频文件:',
      videoFile.name,
      '大小:',
      (videoFile.size / 1024 / 1024).toFixed(2),
      'MB'
    )

    try {
      // 步骤1: 提取音频 (0-40%)
      if (onProgress) onProgress(0.05)
      console.log('步骤1: 开始提取音频...')

      const pcmData = await this.extractAudioAsPCM(videoFile, p => {
        if (onProgress) onProgress(p * 0.4)
      })

      console.log('音频提取完成，PCM数据大小:', pcmData.byteLength, '字节')

      if (!pcmData || pcmData.byteLength === 0) {
        throw new Error('提取的音频数据为空')
      }

      if (onProgress) onProgress(0.4)

      // 步骤2: 语音识别 (40-100%)
      console.log('步骤2: 开始调用百度语音识别API...')
      const text = await this.recognizeLongAudio(pcmData, p => {
        if (onProgress) onProgress(0.4 + p * 0.6)
      })

      console.log('语音识别完成，识别文本长度:', text ? text.length : 0)
      return text
    } catch (error) {
      console.error('视频语音识别失败:', error)
      throw error
    }
  }

  /**
   * ArrayBuffer转Base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * 检查是否支持
   */
  isSupported() {
    return this.isConfigured && typeof AudioContext !== 'undefined' && typeof fetch !== 'undefined'
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      isSupported: this.isSupported(),
      hasToken: !!accessToken && Date.now() < tokenExpireTime
    }
  }
}

// 单例实例
let serviceInstance = null

export function getBaiduSpeechService() {
  if (!serviceInstance) {
    serviceInstance = new BaiduSpeechService()
  }
  return serviceInstance
}

export default BaiduSpeechService
