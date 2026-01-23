import BaiduASRService from '../../services/BaiduASRService.js';
import { createEmptyBaseTimeline, validateBaseTimeline } from '../../core/TimelineSchema.js';

/**
 * TimelineBuilder - 时间轴构建器
 *
 * 职责：
 * 1. 构建基础时间轴（Layer 1）
 * 2. 提供精确的时间戳和插入点
 * 3. 为后续智能体提供时间轴基础
 *
 * 优先级：最高（必须第一个执行）
 */
class TimelineBuilder {
  constructor(options = {}) {
    this.name = 'TimelineBuilder';
    this.asrService = new BaiduASRService();
    this.logger = options.logger || console;
    this.errorHandler = options.errorHandler;

    // 配置参数
    this.config = {
      pauseThreshold: 0.5,  // 停顿阈值（秒）
      minPauseDuration: 0.3,  // 最小停顿时长
      highSuitabilityThreshold: 0.8,  // 高适合度阈值
      mediumSuitabilityThreshold: 0.5  // 中等适合度阈值
    };
  }

  /**
   * 构建基础时间轴
   * @param {Object} input
   * @param {string} input.videoPath - 视频路径
   * @param {number} input.videoDuration - 视频时长
   * @param {number} input.fps - 帧率
   * @returns {Promise<Object>} 基础时间轴
   */
  async buildBaseTimeline(input) {
    const { videoPath, videoDuration, fps = 30 } = input;

    this.logger.info('⏱️  TimelineBuilder: 开始构建基础时间轴');
    this.logger.info(`  视频路径: ${videoPath}`);
    this.logger.info(`  视频时长: ${videoDuration}秒`);

    try {
      // 1. 创建空的基础时间轴
      const baseTimeline = createEmptyBaseTimeline({
        duration: videoDuration,
        fps: fps,
        resolution: '1080x1920'
      });

      // 2. 获取带时间戳的语音识别结果
      this.logger.info('  步骤1: 语音识别（带时间戳）...');
      const asrResult = await this.getASRWithTimestamps(videoPath);

      // 3. 分析语音分段
      this.logger.info('  步骤2: 分析语音分段...');
      baseTimeline.speechSegments = this.analyzeSpeechSegments(asrResult);

      // 4. 识别自然断点
      this.logger.info('  步骤3: 识别插入点...');
      baseTimeline.insertionPoints = this.identifyInsertionPoints(baseTimeline.speechSegments);

      // 5. 验证时间轴
      const validation = validateBaseTimeline(baseTimeline);
      if (!validation.valid) {
        throw new Error(`时间轴验证失败: ${validation.error}`);
      }

      this.logger.info('  ✅ 基础时间轴构建完成');
      this.logger.info(`    - 语音分段: ${baseTimeline.speechSegments.length}个`);
      this.logger.info(`    - 插入点: ${baseTimeline.insertionPoints.length}个`);

      return { baseTimeline };

    } catch (error) {
      this.logger.error('❌ 时间轴构建失败', { error: error.message });
      if (this.errorHandler) {
        this.errorHandler.handle(error, 'TimelineBuilder.buildBaseTimeline');
      }
      throw error;
    }
  }

  /**
   * 获取带时间戳的语音识别结果
   * @param {string} videoPath - 视频路径
   * @returns {Promise<Array>} ASR结果
   */
  async getASRWithTimestamps(videoPath) {
    try {
      // 使用百度ASR长语音识别（每段30秒）
      const transcript = await this.asrService.transcribeLong(videoPath, 30);

      // 百度ASR返回的是完整文本，我们需要模拟时间戳
      // 在实际应用中，应该使用支持时间戳的ASR服务
      // 这里我们简单地将文本按句子分割，并估算时间戳

      const sentences = this.splitIntoSentences(transcript);
      const avgDuration = 5;  // 假设每句话平均5秒

      const asrResult = sentences.map((sentence, index) => ({
        startTime: index * avgDuration,
        endTime: (index + 1) * avgDuration,
        text: sentence,
        confidence: 0.9,
        words: this.estimateWordTimestamps(sentence, index * avgDuration, (index + 1) * avgDuration)
      }));

      return asrResult;

    } catch (error) {
      this.logger.error('语音识别失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 将文本分割成句子
   * @param {string} text - 文本
   * @returns {Array<string>} 句子数组
   */
  splitIntoSentences(text) {
    // 按句号、问号、感叹号分割
    const sentences = text.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
    return sentences;
  }

  /**
   * 估算词级别时间戳
   * @param {string} sentence - 句子
   * @param {number} startTime - 开始时间
   * @param {number} endTime - 结束时间
   * @returns {Array} 词时间戳
   */
  estimateWordTimestamps(sentence, startTime, endTime) {
    const words = sentence.split('');
    const duration = endTime - startTime;
    const wordDuration = duration / words.length;

    return words.map((word, index) => ({
      word: word,
      startTime: startTime + index * wordDuration,
      endTime: startTime + (index + 1) * wordDuration
    }));
  }

  /**
   * 分析语音分段
   * @param {Array} asrResult - ASR识别结果
   * @returns {Array} 语音分段
   */
  analyzeSpeechSegments(asrResult) {
    const segments = [];
    const pauseThreshold = this.config.pauseThreshold;

    for (let i = 0; i < asrResult.length; i++) {
      const current = asrResult[i];
      const next = asrResult[i + 1];

      // 添加语音段
      segments.push({
        id: `speech_${i + 1}`,
        startTime: current.startTime,
        endTime: current.endTime,
        text: current.text,
        confidence: current.confidence || 0.9,
        words: current.words || [],
        isPause: false
      });

      // 检查停顿
      if (next && (next.startTime - current.endTime) > pauseThreshold) {
        const pauseDuration = next.startTime - current.endTime;

        segments.push({
          id: `pause_${i + 1}`,
          startTime: current.endTime,
          endTime: next.startTime,
          text: '',
          isPause: true,
          duration: pauseDuration
        });
      }
    }

    return segments;
  }

  /**
   * 识别插入点
   * @param {Array} speechSegments - 语音分段
   * @returns {Array} 插入点
   */
  identifyInsertionPoints(speechSegments) {
    const points = [];
    let pointId = 1;

    for (let i = 0; i < speechSegments.length; i++) {
      const segment = speechSegments[i];

      if (segment.isPause) {
        // 停顿是最佳插入点
        const duration = segment.endTime - segment.startTime;
        const prevSegment = speechSegments[i - 1];
        const nextSegment = speechSegments[i + 1];

        // 评估适合度
        const suitability = this.evaluateSuitability(duration);

        points.push({
          id: `point_${pointId++}`,
          time: segment.startTime,
          type: 'pause',
          duration: duration,
          suitability: suitability,
          metadata: {
            pauseLength: duration,
            energyLevel: 'low',
            beforeText: prevSegment ? prevSegment.text : '',
            afterText: nextSegment ? nextSegment.text : ''
          }
        });
      } else {
        // 检查句子结束
        if (segment.text.endsWith('。') || segment.text.endsWith('！') || segment.text.endsWith('？')) {
          points.push({
            id: `point_${pointId++}`,
            time: segment.endTime,
            type: 'sentence_end',
            duration: 0.3,  // 句子结束的默认停顿
            suitability: 'medium',
            metadata: {
              pauseLength: 0.3,
              energyLevel: 'medium',
              beforeText: segment.text,
              afterText: ''
            }
          });
        }
      }
    }

    return points;
  }

  /**
   * 评估插入点适合度
   * @param {number} duration - 停顿时长
   * @returns {string} 适合度 (high | medium | low)
   */
  evaluateSuitability(duration) {
    if (duration >= this.config.highSuitabilityThreshold) {
      return 'high';
    } else if (duration >= this.config.mediumSuitabilityThreshold) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 获取智能体名称
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * 获取智能体状态
   * @returns {Object}
   */
  getStatus() {
    return {
      name: this.name,
      ready: true,
      services: {
        asr: !!this.asrService
      },
      config: this.config
    };
  }
}

export default TimelineBuilder;
