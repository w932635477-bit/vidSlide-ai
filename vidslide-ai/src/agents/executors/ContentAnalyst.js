import BaiduASRService from '../../services/BaiduASRService.js';
import QianfanService from '../../services/QianfanService.js';

/**
 * ContentAnalyst - 内容分析师
 *
 * 职责：
 * 1. 语音识别（百度ASR）
 * 2. 内容分析（千帆平台 - 文心一言）
 * 3. 提取关键词、观点、解释
 */
class ContentAnalyst {
  constructor(options = {}) {
    this.name = 'ContentAnalyst';
    this.asrService = new BaiduASRService();
    this.qianfanService = new QianfanService();
    this.logger = options.logger || console;
    this.errorHandler = options.errorHandler;
  }

  /**
   * 语音识别
   * @param {Object} input - 输入参数
   * @param {string} input.videoPath - 视频路径
   * @returns {Promise<Object>} 包含transcript字段
   */
  async speechToText(input) {
    const { videoPath } = input;

    this.logger.info('🎤 ContentAnalyst: 开始语音识别');
    this.logger.info(`  视频路径: ${videoPath}`);

    try {
      // 使用长音频识别方法，每段30秒（百度ASR短语音识别限制）
      const transcript = await this.asrService.transcribeLong(videoPath, 30);

      this.logger.info('  ✅ 语音识别完成');
      this.logger.info(`    - 文本长度: ${transcript.length}字`);

      return {
        transcript: transcript,
        wordCount: transcript.length
      };

    } catch (error) {
      this.logger.error('❌ 语音识别失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 文心一言分析（基于时间轴）
   * @param {Object} input - 输入参数
   * @param {Object} input.task_0 - TimelineBuilder的输出（基础时间轴）
   * @returns {Promise<Object>} 包含understanding字段
   */
  async analyzeWithWenxin(input) {
    const { task_0 } = input;
    const baseTimeline = task_0.baseTimeline;

    this.logger.info('🧠 ContentAnalyst: 开始文心一言分析');
    this.logger.info(`  基于时间轴的语音分段: ${baseTimeline.speechSegments.length}个`);

    try {
      // 从语音分段中提取完整文本
      const transcript = baseTimeline.speechSegments
        .filter(s => !s.isPause)
        .map(s => s.text)
        .join('');

      this.logger.info(`  文本长度: ${transcript.length}字`);

      // 调用千帆平台进行内容分析
      const understanding = await this.qianfanService.analyzeContent(transcript);

      this.logger.info('  ✅ 内容分析完成');
      this.logger.info(`    - 关键词: ${understanding.keywords.length}个`);
      this.logger.info(`    - 观点: ${understanding.viewpoints.length}个`);
      this.logger.info(`    - 解释: ${understanding.explanations.length}个`);

      return {
        understanding: understanding
      };

    } catch (error) {
      this.logger.error('❌ 内容分析失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 映射到时间轴
   * @param {Object} input - 输入参数
   * @param {Object} input.task_0 - TimelineBuilder的输出
   * @param {Object} input.task_1_1 - analyzeWithWenxin的输出
   * @returns {Promise<Object>} 包含映射后的understanding
   */
  async mapToTimeline(input) {
    const { task_0, task_1_1 } = input;
    const baseTimeline = task_0.baseTimeline;
    const understanding = task_1_1.understanding;

    this.logger.info('🗺️  ContentAnalyst: 映射到时间轴');
    this.logger.info(`  插入点数量: ${baseTimeline.insertionPoints.length}个`);
    this.logger.info(`  观点数量: ${understanding.viewpoints.length}个`);

    try {
      // 将观点映射到插入点
      understanding.viewpoints = understanding.viewpoints.map((vp, index) => {
        // 找到对应的插入点（优先选择高适合度的）
        const highSuitabilityPoints = baseTimeline.insertionPoints.filter(p => p.suitability === 'high');
        const mediumSuitabilityPoints = baseTimeline.insertionPoints.filter(p => p.suitability === 'medium');

        let point;
        if (index < highSuitabilityPoints.length) {
          point = highSuitabilityPoints[index];
        } else if (index < highSuitabilityPoints.length + mediumSuitabilityPoints.length) {
          point = mediumSuitabilityPoints[index - highSuitabilityPoints.length];
        } else {
          point = baseTimeline.insertionPoints[index % baseTimeline.insertionPoints.length];
        }

        return {
          ...vp,
          startTime: point ? point.time : 0,
          insertionPoint: point
        };
      });

      // 将解释映射到插入点
      understanding.explanations = understanding.explanations.map((exp, index) => {
        const offset = understanding.viewpoints.length;
        const pointIndex = offset + index;
        const point = baseTimeline.insertionPoints[pointIndex % baseTimeline.insertionPoints.length];

        return {
          ...exp,
          startTime: point ? point.time : 0,
          insertionPoint: point
        };
      });

      this.logger.info('  ✅ 映射完成');
      this.logger.info(`    - 已映射观点: ${understanding.viewpoints.length}个`);
      this.logger.info(`    - 已映射解释: ${understanding.explanations.length}个`);

      return {
        understanding: understanding
      };

    } catch (error) {
      this.logger.error('❌ 映射失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 构建分析提示词
   * @param {string} transcript - 文本
   * @returns {string} 提示词
   */
  buildAnalysisPrompt(transcript) {
    return `你是一个专业的视频内容分析师。请分析以下视频文本，提取关键信息。

视频文本：
${transcript}

请按照以下JSON格式返回分析结果（只返回JSON，不要其他内容）：

{
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "viewpoints": [
    {
      "text": "观点1（不超过15字）",
      "timestamp": "大致出现时间（秒）",
      "importance": "high/medium/low"
    }
  ],
  "explanations": [
    {
      "keyword": "需要解释的关键词",
      "explanation": "详细解释（20-30字）",
      "relatedKeywords": ["相关词1", "相关词2"]
    }
  ],
  "intent": "视频的主要意图（教育/营销/娱乐/新闻等）",
  "tone": "视频的语气（正式/轻松/专业/幽默等）",
  "targetAudience": "目标受众描述"
}

要求：
1. 关键词3-5个，准确提取核心概念
2. 观点1-3个，简洁明了，不超过15字
3. 解释针对专业术语或重要概念
4. 所有字段必须填写，不能为空`;
  }

  /**
   * 解析文心一言响应
   * @param {string} response - 响应文本
   * @returns {Object} 解析后的对象
   */
  parseWenxinResponse(response) {
    try {
      // 提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('响应中未找到JSON');
      }

      const json = JSON.parse(jsonMatch[0]);

      // 验证必需字段
      const requiredFields = ['keywords', 'viewpoints', 'explanations', 'intent'];
      for (const field of requiredFields) {
        if (!json[field]) {
          throw new Error(`缺少必需字段: ${field}`);
        }
      }

      // 验证数据类型
      if (!Array.isArray(json.keywords) || json.keywords.length === 0) {
        throw new Error('keywords必须是非空数组');
      }

      if (!Array.isArray(json.viewpoints) || json.viewpoints.length === 0) {
        throw new Error('viewpoints必须是非空数组');
      }

      if (!Array.isArray(json.explanations)) {
        throw new Error('explanations必须是数组');
      }

      return json;

    } catch (error) {
      this.logger.error('解析文心一言响应失败', { error: error.message, response });
      throw new Error(`JSON解析失败: ${error.message}`);
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
        asr: !!this.asrService,
        qianfan: !!this.qianfanService
      }
    };
  }
}

export default ContentAnalyst;
