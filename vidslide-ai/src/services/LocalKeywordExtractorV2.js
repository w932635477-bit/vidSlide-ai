import nodejieba from 'nodejieba';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * LocalKeywordExtractorV2 - 本地关键词提取器（带时间戳）
 *
 * 特点：
 * 1. 使用nodejieba的TF-IDF和TextRank算法
 * 2. 提取的关键词必须在原文中存在
 * 3. 记录关键词的首次出现位置和时间戳
 * 4. 结果稳定，每次运行相同
 * 5. 无需依赖外部API
 */
class LocalKeywordExtractorV2 {
  constructor(options = {}) {
    this.logger = options.logger || console;

    // 加载自定义词典
    const dictPath = path.join(__dirname, '../../config/custom_dict.txt');
    try {
      nodejieba.load({
        userDict: dictPath
      });
      this.logger.info('✅ Jieba自定义词典加载成功');
    } catch (error) {
      this.logger.warn('⚠️  Jieba自定义词典加载失败:', error.message);
    }

    // 停用词（扩展版）
    this.stopWords = new Set([
      // 代词
      '的', '了', '是', '在', '和', '有', '就', '不', '人', '都',
      '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你',
      '会', '着', '没有', '看', '好', '自己', '这', '那', '个',
      '这个', '那个', '这些', '那些', '什么', '怎么', '哪里',

      // 动词
      '需要', '可能', '应该', '必须', '可以', '能够', '想要', '做',
      '已经', '正在', '开始', '结束', '进行', '发生', '出现',

      // 副词
      '非常', '特别', '十分', '比较', '更加', '最', '更', '还', '太',
      '反而', '越来越', '反复', '可能', '费心',

      // 连词
      '但是', '然后', '因为', '所以', '如果', '虽然', '而且', '不过',

      // 无意义词
      '方式', '问题', '思考', '老板', '后台', '私信'
    ]);

    // 英文翻译字典
    this.translationDict = {
      '抖音': 'Douyin',
      '流量': 'Traffic',
      '短视频': 'Short Video',
      '玩法': 'Strategy',
      '巨量ad': 'Giant Ads',
      '巨量': 'Massive',
      '推送': 'Push',
      '机制': 'Mechanism',
      '精准': 'Targeted',
      '互动': 'Interaction',
      '原生': 'Native',
      '获客': 'Customer Acquisition',
      '粉丝': 'Fans',
      '用户': 'User',
      '增量': 'Increment',
      '广告': 'Advertisement',
      '投放': 'Launch',
      '视频': 'Video',
      '拍摄': 'Shooting',
      '剪辑': 'Editing'
    };
  }

  /**
   * 获取视频时长（秒）
   */
  getVideoDuration(videoPath) {
    try {
      const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
      const output = execSync(cmd, { encoding: 'utf-8' });
      return parseFloat(output.trim());
    } catch (error) {
      this.logger.error('获取视频时长失败:', error.message);
      return 0;
    }
  }

  /**
   * 提取关键词（带时间戳）
   * @param {string} text - 完整文本
   * @param {number} videoDuration - 视频总时长（秒）
   * @param {Object} options - 选项
   * @returns {Array} 关键词数组
   */
  extractKeywordsWithTimestamp(text, videoDuration, options = {}) {
    const topN = options.topN || 5;
    const method = options.method || 'both'; // 'tfidf', 'textrank', 'both'

    this.logger.info('🔍 LocalKeywordExtractor: 开始提取关键词');
    this.logger.info(`  文本长度: ${text.length}字`);
    this.logger.info(`  视频时长: ${videoDuration.toFixed(2)}秒`);
    this.logger.info(`  提取方法: ${method}`);

    const results = [];

    try {
      // 方法1: TF-IDF
      let tfidfKeywords = [];
      if (method === 'tfidf' || method === 'both') {
        tfidfKeywords = nodejieba.extract(text, topN);
        this.logger.info(`  TF-IDF提取: ${tfidfKeywords.length}个`);
      }

      // 方法2: TextRank
      let textrankKeywords = [];
      if (method === 'textrank' || method === 'both') {
        textrankKeywords = nodejieba.textRankExtract(text, topN);
        this.logger.info(`  TextRank提取: ${textrankKeywords.length}个`);
      }

      // 合并结果
      const allKeywords = [...tfidfKeywords, ...textrankKeywords];

      // 去重并排序
      const uniqueMap = new Map();
      for (const item of allKeywords) {
        const word = item.word;
        const weight = item.weight;

        if (uniqueMap.has(word)) {
          // 取最高权重
          uniqueMap.set(word, Math.max(uniqueMap.get(word), weight));
        } else {
          uniqueMap.set(word, weight);
        }
      }

      // 转换为数组并排序
      const sortedKeywords = Array.from(uniqueMap.entries())
        .map(([word, weight]) => ({ word, weight }))
        .sort((a, b) => b.weight - a.weight);

      // 过滤和增强
      for (const item of sortedKeywords) {
        const keyword = item.word;

        // 过滤条件
        if (this.stopWords.has(keyword)) continue;
        if (keyword.length < 2) continue;
        if (!/[\u4e00-\u9fa5]/.test(keyword)) continue; // 必须包含中文

        // 查找关键词在文本中的首次出现位置
        const firstOccurrence = this.findFirstOccurrence(text, keyword);
        if (!firstOccurrence) continue; // 如果在文本中找不到，跳过

        // 计算时间戳
        const timestamp = this.calculateTimestamp(
          text,
          firstOccurrence.charIndex,
          videoDuration
        );

        // 获取英文翻译
        const english = this.translateToEnglish(keyword);

        // 分类
        const category = this.categorizeKeyword(keyword);

        results.push({
          text: keyword,
          english: english,
          category: category,
          weight: item.weight,
          charIndex: firstOccurrence.charIndex,
          timestamp: timestamp,
          context: firstOccurrence.context,
          method: method
        });

        // 达到topN个停止
        if (results.length >= topN) break;
      }

      this.logger.info(`  ✅ 成功提取 ${results.length} 个关键词`);

      return results;

    } catch (error) {
      this.logger.error('关键词提取失败:', error.message);
      return this.getFallbackKeywords(text, videoDuration, topN);
    }
  }

  /**
   * 查找关键词在文本中的首次出现
   */
  findFirstOccurrence(text, keyword) {
    const index = text.indexOf(keyword);
    if (index === -1) return null;

    // 获取上下文
    const contextStart = Math.max(0, index - 10);
    const contextEnd = Math.min(text.length, index + keyword.length + 10);
    const context = text.slice(contextStart, contextEnd);

    return {
      charIndex: index,
      context: context
    };
  }

  /**
   * 计算时间戳
   * 假设语速恒定，根据字符位置估算时间
   */
  calculateTimestamp(text, charIndex, videoDuration) {
    const ratio = charIndex / text.length;
    const timestamp = videoDuration * ratio;

    return {
      start: Math.max(0, timestamp - 1), // 提前1秒
      end: Math.min(videoDuration, timestamp + 2), // 延后2秒
      exact: timestamp
    };
  }

  /**
   * 翻译成英文
   */
  translateToEnglish(keyword) {
    // 查找字典
    for (const [cn, en] of Object.entries(this.translationDict)) {
      if (keyword.includes(cn)) {
        return en;
      }
    }

    // 默认返回拼音首字母
    return keyword.split('').map(c => c.charCodeAt(0).toString(36)).join('').toUpperCase().substring(0, 10);
  }

  /**
   * 关键词分类
   */
  categorizeKeyword(keyword) {
    const categories = {
      platform: ['抖音', '快手', '小红书', '视频号'],
      method: ['巨量', '投放', '广告', '推送', '互动'],
      concept: ['流量', '粉丝', '用户', '精准', '原生', '增量'],
      content: ['短视频', '视频', '拍摄', '剪辑'],
      strategy: ['玩法', '机制', '策略', '获客']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(k => keyword.includes(k))) {
        return category;
      }
    }

    return 'concept';
  }

  /**
   * 降级方案：使用简单规则
   */
  getFallbackKeywords(text, videoDuration, topN) {
    this.logger.warn('使用降级方案提取关键词');

    const keywords = [];
    const words = nodejieba.cut(text);

    for (const word of words) {
      if (this.stopWords.has(word)) continue;
      if (word.length < 2 || word.length > 6) continue;
      if (!/[\u4e00-\u9fa5]/.test(word)) continue;

      const occurrence = this.findFirstOccurrence(text, word);
      if (!occurrence) continue;

      const timestamp = this.calculateTimestamp(
        text,
        occurrence.charIndex,
        videoDuration
      );

      keywords.push({
        text: word,
        english: this.translateToEnglish(word),
        category: this.categorizeKeyword(word),
        weight: 0.5,
        charIndex: occurrence.charIndex,
        timestamp: timestamp,
        context: occurrence.context,
        method: 'fallback'
      });

      if (keywords.length >= topN) break;
    }

    return keywords;
  }

  /**
   * 从视频中提取关键词（完整流程）
   */
  async extractFromVideo(videoPath, transcript, options = {}) {
    const videoDuration = this.getVideoDuration(videoPath);
    const keywords = this.extractKeywordsWithTimestamp(
      transcript,
      videoDuration,
      options
    );

    return {
      keywords: keywords,
      stats: {
        totalKeywords: keywords.length,
        videoDuration: videoDuration,
        textLength: transcript.length,
        averageWeight: keywords.reduce((sum, k) => sum + k.weight, 0) / keywords.length
      }
    };
  }

  /**
   * 格式化输出（兼容现有系统）
   */
  formatForSystem(keywords) {
    return keywords.map(kw => ({
      text: kw.text,
      english: kw.english,
      category: kw.category,
      timestamp: kw.timestamp.exact,
      startTime: kw.timestamp.start,
      endTime: kw.timestamp.end,
      weight: kw.weight,
      explanation: `"${kw.text}"在视频${kw.timestamp.exact.toFixed(1)}秒处提到`,
      context: kw.context
    }));
  }
}

export default LocalKeywordExtractorV2;
