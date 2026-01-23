import BaiduASRService from '../../services/BaiduASRService.js';
import QianfanV2BearerService from '../../services/QianfanV2BearerService.js';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * ContentAnalyst - 内容分析师
 *
 * 职责：
 * 1. 语音识别（调用BaiduASRService）
 * 2. 文心一言深度分析（调用WenxinAPI）
 * 3. 提取关键词、观点、解释
 * 4. 生成理解文档
 */
class ContentAnalyst {
  constructor(options = {}) {
    this.name = 'ContentAnalyst';
    this.speechService = new BaiduASRService();
    this.wenxinAPI = new QianfanV2BearerService();
    this.logger = options.logger || console;
    this.errorHandler = options.errorHandler;
  }

  /**
   * 语音转文字
   * @param {Object} input - 输入参数
   * @param {string} input.videoPath - 视频文件路径
   * @returns {Promise<Object>} 包含transcript、audioPath、wordCount
   */
  async speechToText(input) {
    const { videoPath } = input;

    this.logger.info('🎤 ContentAnalyst: 开始语音识别', { videoPath });

    try {
      // 1. 提取音频
      const audioPath = await this.extractAudio(videoPath);
      this.logger.info('  ✓ 音频提取完成', { audioPath });

      // 2. 获取音频时长
      const duration = this.speechService.getAudioDuration(audioPath);
      this.logger.info(`  → 音频时长: ${duration.toFixed(2)}秒`);

      // 3. 调用百度ASR（根据时长选择方法）
      this.logger.info('  → 调用百度语音识别API...');
      let transcript;

      if (duration > 60) {
        // 长音频，使用分段识别
        this.logger.info('  → 音频超过60秒，使用分段识别...');
        transcript = await this.speechService.transcribeLong(videoPath, 50); // 每段50秒
      } else {
        // 短音频，直接识别
        transcript = await this.speechService.recognizeSpeech(audioPath);
      }

      // 4. 验证结果
      if (!transcript || transcript.length < 10) {
        throw new Error('语音识别失败或内容过短');
      }

      this.logger.info(`  ✅ 识别到 ${transcript.length} 个字符`);

      return {
        transcript: transcript,
        audioPath: audioPath,
        wordCount: transcript.length
      };

    } catch (error) {
      this.logger.error('❌ 语音识别失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 提取音频
   * @param {string} videoPath - 视频文件路径
   * @returns {Promise<string>} 音频文件路径
   */
  async extractAudio(videoPath) {
    const audioPath = videoPath.replace(path.extname(videoPath), '.wav');

    // 检查音频文件是否已存在
    if (fs.existsSync(audioPath)) {
      this.logger.info('  → 使用已存在的音频文件');
      return audioPath;
    }

    try {
      // 使用FFmpeg提取音频
      const cmd = `ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}" -y`;

      this.logger.info('  → 提取音频中...');
      execSync(cmd, { stdio: 'pipe' });

      if (!fs.existsSync(audioPath)) {
        throw new Error('音频提取失败');
      }

      return audioPath;

    } catch (error) {
      this.logger.error('音频提取失败', { error: error.message });
      throw new Error(`音频提取失败: ${error.message}`);
    }
  }

  /**
   * 文心一言分析
   * @param {Object} input - 输入参数
   * @param {Object} input.task_1_1 - 上一个任务的输出
   * @returns {Promise<Object>} 包含understanding和transcript
   */
  async analyzeWithWenxin(input) {
    const { task_1_1 } = input;
    const transcript = task_1_1.transcript;

    this.logger.info('🧠 ContentAnalyst: 开始文心一言分析');
    this.logger.info(`  → 文字稿长度: ${transcript.length} 字符`);

    try {
      // 1. 构建精准提示词
      const prompt = this.buildAnalysisPrompt(transcript);

      // 2. 调用文心一言
      this.logger.info('  → 调用文心一言API...');
      let response = await this.wenxinAPI.chat(prompt, {
        temperature: 0.3,  // 低温度，更确定性
        max_tokens: 2000
      });

      // 3. 解析JSON结果
      let analysis = this.parseJSON(response);

      // 4. 验证结果
      const validation = this.validateAnalysis(analysis);

      if (!validation.passed) {
        this.logger.warn('  ⚠️ 分析结果不合格，重新分析', { issues: validation.issues });

        // 第2次分析：更详细的提示词
        const detailedPrompt = this.buildDetailedPrompt(transcript, validation.issues);
        response = await this.wenxinAPI.chat(detailedPrompt, {
          temperature: 0.5
        });
        analysis = this.parseJSON(response);
      }

      this.logger.info(`  ✅ 提取到 ${analysis.keywords.length} 个关键词`);
      this.logger.info(`  ✅ 识别到 ${analysis.viewpoints.length} 个观点`);
      this.logger.info(`  ✅ 识别到 ${analysis.explanations.length} 个解释`);

      return {
        understanding: analysis,
        transcript: transcript
      };

    } catch (error) {
      this.logger.error('❌ 文心一言分析失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 构建分析提示词
   * @param {string} transcript - 文字稿
   * @returns {string} 提示词
   */
  buildAnalysisPrompt(transcript) {
    return `请深度分析以下视频文字稿，提取关键信息。

【文字稿】
${transcript}

【分析任务】
1. 提取3-5个核心关键词
   - 必须是名词
   - 长度2-6个字
   - 代表核心概念

2. 识别主要观点（适合用卡片展示）
   - 简短论断，不超过15字
   - 标注重要程度（high/medium/low）
   - 标注时间戳（估算）

3. 识别解释性内容（需要深度展示）
   - 关联到具体关键词
   - 标注时间戳

4. 理解作者意图

【输出格式】
严格按照JSON格式输出，不要有任何额外文字：

\`\`\`json
{
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "viewpoints": [
    {
      "text": "观点文字（不超过15字）",
      "importance": "high",
      "timestamp": { "start": 2, "end": 6 }
    }
  ],
  "explanations": [
    {
      "text": "解释文字",
      "keyword": "关联的关键词",
      "timestamp": { "start": 7, "end": 13 }
    }
  ],
  "intent": "作者意图描述"
}
\`\`\`

【验证规则】
- keywords数组长度必须在3-5之间
- viewpoints至少1个
- 每个viewpoint的text长度 ≤ 15
- 所有timestamp必须合理`;
  }

  /**
   * 构建详细提示词（第二次分析）
   * @param {string} transcript - 文字稿
   * @param {Array} issues - 问题列表
   * @returns {string} 提示词
   */
  buildDetailedPrompt(transcript, issues) {
    const issuesText = issues.map(issue => `- ${issue}`).join('\n');

    return `请重新分析以下视频文字稿，并修正之前的问题。

【文字稿】
${transcript}

【需要修正的问题】
${issuesText}

【分析要求】
1. 关键词：3-5个，必须是名词，长度2-6个字
2. 观点：至少1个，每个不超过15字
3. 解释：关联到具体关键词
4. 时间戳：必须合理

【输出格式】
严格按照JSON格式输出：

\`\`\`json
{
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "viewpoints": [
    {
      "text": "观点文字",
      "importance": "high",
      "timestamp": { "start": 2, "end": 6 }
    }
  ],
  "explanations": [
    {
      "text": "解释文字",
      "keyword": "关联的关键词",
      "timestamp": { "start": 7, "end": 13 }
    }
  ],
  "intent": "作者意图描述"
}
\`\`\``;
  }

  /**
   * 解析JSON结果
   * @param {string} text - 文本
   * @returns {Object} 解析后的对象
   */
  parseJSON(text) {
    try {
      // 尝试直接解析
      return JSON.parse(text);
    } catch (e) {
      // 提取JSON代码块
      const match = text.match(/```json\n([\s\S]*?)\n```/) ||
                    text.match(/```\n([\s\S]*?)\n```/) ||
                    text.match(/\{[\s\S]*\}/);

      if (match) {
        const jsonText = match[1] || match[0];
        return JSON.parse(jsonText);
      }

      throw new Error('无法解析JSON结果');
    }
  }

  /**
   * 验证分析结果
   * @param {Object} analysis - 分析结果
   * @returns {Object} 验证结果
   */
  validateAnalysis(analysis) {
    const issues = [];

    // 验证keywords
    if (!analysis.keywords || !Array.isArray(analysis.keywords)) {
      issues.push('缺少keywords数组');
    } else if (analysis.keywords.length < 3 || analysis.keywords.length > 5) {
      issues.push(`keywords数量不符合要求（当前${analysis.keywords.length}个，需要3-5个）`);
    }

    // 验证viewpoints
    if (!analysis.viewpoints || !Array.isArray(analysis.viewpoints)) {
      issues.push('缺少viewpoints数组');
    } else if (analysis.viewpoints.length < 1) {
      issues.push('至少需要1个viewpoint');
    } else {
      // 验证每个viewpoint
      for (let i = 0; i < analysis.viewpoints.length; i++) {
        const vp = analysis.viewpoints[i];
        if (!vp.text || vp.text.length > 15) {
          issues.push(`viewpoint[${i}]的text长度超过15字`);
        }
        if (!vp.importance || !['high', 'medium', 'low'].includes(vp.importance)) {
          issues.push(`viewpoint[${i}]的importance无效`);
        }
        if (!vp.timestamp || typeof vp.timestamp.start !== 'number' || typeof vp.timestamp.end !== 'number') {
          issues.push(`viewpoint[${i}]的timestamp无效`);
        }
      }
    }

    // 验证explanations
    if (!analysis.explanations || !Array.isArray(analysis.explanations)) {
      issues.push('缺少explanations数组');
    }

    // 验证intent
    if (!analysis.intent || typeof analysis.intent !== 'string') {
      issues.push('缺少intent字段');
    }

    return {
      passed: issues.length === 0,
      issues: issues
    };
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
        speechService: !!this.speechService,
        wenxinAPI: !!this.wenxinAPI
      }
    };
  }
}

export default ContentAnalyst;
