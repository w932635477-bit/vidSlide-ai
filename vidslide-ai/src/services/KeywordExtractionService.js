import nodejieba from 'nodejieba';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * KeywordExtractionService - 关键词提取服务
 *
 * 基于最佳实践：
 * - 使用Jieba中文分词（准确率92%+）
 * - 词性标注（只提取名词）
 * - 自定义词典（领域专有名词）
 * - TF-IDF权重计算
 * - 语义去重
 */
class KeywordExtractionService {
  constructor() {
    // 加载自定义词典
    const dictPath = path.join(__dirname, '../../config/custom_dict.txt');
    try {
      nodejieba.load({
        userDict: dictPath
      });
      console.log('✅ Jieba自定义词典加载成功');
    } catch (error) {
      console.warn('⚠️  Jieba自定义词典加载失败，使用默认词典:', error.message);
    }

    // 停用词列表（扩展版）
    this.stopWords = new Set([
      // 基础停用词
      '的', '了', '是', '在', '和', '有', '就', '不', '人', '都',
      '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你',
      '会', '着', '没有', '看', '好', '自己', '这', '那', '个',

      // 量词和指示词
      '一种', '这个', '那个', '这些', '那些', '每个', '某个', '几个',
      '一些', '所有', '全部', '整个', '各种', '这样', '那样',

      // 动词标记词
      '需要', '可能', '应该', '必须', '可以', '能够', '已经', '正在',
      '开始', '结束', '进行', '发生', '出现', '产生', '采用', '使用',

      // 指代词和连接词
      '指的', '就是', '即是', '而是', '或者', '还是', '以及', '并且',

      // 形容词和副词
      '非常', '特别', '十分', '比较', '更加', '最', '更', '还', '太',

      // 连接词
      '但是', '然后', '因为', '所以', '如果', '虽然', '尽管', '而且',
      '不过', '只是', '才能', '才会',

      // 无意义的短词
      '短视', '一下', '一点', '有点', '一起', '之后', '之前', '以后',
      '之间', '当中', '其中', '什么', '怎么', '如何', '哪里', '哪些',

      // 单字词（通常无意义）
      '等', '为', '与', '及', '对', '从', '把', '被', '让', '给'
    ]);

    // 预定义的高优先级关键词
    this.priorityKeywords = new Set([
      '巨量ad', '抖音', '快手', '小红书', '视频号', '短视频',
      '流量', '粉丝', '播放量', '转化', '投放', '广告',
      '算法', '推荐', '曝光', '变现', '带货', '直播',
      '千川', '巨量引擎', '用户', '数据', '运营', '策略'
    ]);
  }

  /**
   * 从文本中提取多个关键词（用于卡片序列）
   * @param {string} text - 输入文本
   * @param {Object} options - 选项
   * @returns {Array} 关键词数组 [{ keyword, score, method }]
   */
  extractKeywords(text, options = {}) {
    const maxLength = options.maxLength || 4;  // 最多4个字
    const minLength = options.minLength || 2;  // 最少2个字
    const count = options.count || 3;  // 提取3个关键词

    try {
      // 1. 使用Jieba分词 + 词性标注
      const taggedWords = nodejieba.tag(text);

      // 2. 过滤：只保留名词，过滤停用词
      const nouns = taggedWords
        .filter(item => {
          // 只保留名词（n开头）和专有名词（nr, ns, nt等）
          const isNoun = item.tag.startsWith('n');
          const notStopWord = !this.stopWords.has(item.word);
          const validLength = item.word.length >= minLength && item.word.length <= maxLength;

          return isNoun && notStopWord && validLength;
        })
        .map(item => item.word);

      // 3. 计算TF-IDF权重
      const wordFreq = this.calculateFrequency(nouns);
      const scoredWords = this.calculateTFIDF(wordFreq, text);

      // 4. 语义去重
      const dedupedWords = this.semanticDeduplication(scoredWords.map(w => w.word));

      // 5. 重新评分（考虑优先级）
      const finalScored = dedupedWords.map(word => {
        const originalScore = scoredWords.find(w => w.word === word)?.score || 0;
        const isPriority = this.priorityKeywords.has(word);

        return {
          keyword: word,
          score: isPriority ? originalScore * 1.5 : originalScore,  // 优先词加权
          method: isPriority ? 'predefined' : 'jieba'
        };
      });

      // 6. 排序并返回Top-N
      finalScored.sort((a, b) => b.score - a.score);
      const results = finalScored.slice(0, count);

      // 7. 如果提取失败，使用降级方案
      if (results.length === 0) {
        return [{
          keyword: this.extractFallback(text, maxLength),
          score: 0.5,
          method: 'fallback'
        }];
      }

      return results;

    } catch (error) {
      console.error('Jieba分词失败，使用降级方案:', error);
      // 降级到简单方法
      return this.extractKeywordsFallback(text, { maxLength, minLength, count });
    }
  }

  /**
   * 计算词频
   */
  calculateFrequency(words) {
    const freq = {};
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1;
    }
    return freq;
  }

  /**
   * 计算TF-IDF权重（简化版）
   */
  calculateTFIDF(wordFreq, text) {
    const totalWords = Object.values(wordFreq).reduce((a, b) => a + b, 0);
    const textLength = text.length;

    return Object.entries(wordFreq).map(([word, freq]) => {
      // TF: 词频 / 总词数
      const tf = freq / totalWords;

      // IDF简化：使用词的位置和长度作为权重
      const firstPosition = text.indexOf(word) / textLength;
      const positionScore = 1 - firstPosition;  // 越靠前得分越高
      const lengthScore = Math.min(word.length / 4, 1);  // 2-4字最佳

      // 综合得分
      const score = tf * 0.5 + positionScore * 0.3 + lengthScore * 0.2;

      return { word, score };
    });
  }

  /**
   * 语义去重（基于包含关系）
   */
  semanticDeduplication(keywords) {
    const result = [];

    for (const keyword of keywords) {
      // 检查是否被其他关键词包含
      const isContained = keywords.some(other => {
        // 如果other包含keyword，且other更长，则keyword被包含
        return other !== keyword && other.includes(keyword) && other.length > keyword.length;
      });

      if (!isContained) {
        result.push(keyword);
      }
    }

    return result;
  }

  /**
   * 降级方案：使用简单规则提取
   */
  extractKeywordsFallback(text, options) {
    const { maxLength, minLength, count } = options;

    // 简单分词：提取2-4字词组
    const words = [];
    for (let len = maxLength; len >= minLength; len--) {
      for (let i = 0; i <= text.length - len; i++) {
        const word = text.substr(i, len);
        if (!this.stopWords.has(word) && !/[，。！？、；：""''（）《》【】\s]/.test(word)) {
          words.push(word);
        }
      }
    }

    // 去重并返回
    const unique = [...new Set(words)];
    return unique.slice(0, count).map(kw => ({
      keyword: kw,
      score: 0.5,
      method: 'fallback'
    }));
  }

  /**
   * 降级提取（当其他方法失败时）
   */
  extractFallback(text, maxLength) {
    // 移除标点和空格
    const cleaned = text.replace(/[，。！？、；：""''（）《》【】\s]/g, '');

    // 取前maxLength个字
    return cleaned.substring(0, maxLength);
  }

  /**
   * 从文本中提取单个关键词（保留兼容性）
   */
  async extractKeyword(text, options = {}) {
    const keywords = this.extractKeywords(text, { ...options, count: 1 });
    return keywords.length > 0 ? keywords[0] : {
      keyword: text.substring(0, 4),
      score: 0.1,
      method: 'fallback'
    };
  }

  /**
   * 批量提取关键词
   */
  async extractKeywordsBatch(items) {
    const results = [];

    for (const item of items) {
      const { keyword, score, method } = await this.extractKeyword(item.text);

      results.push({
        originalText: item.text,
        keyword: keyword,
        score: score,
        method: method,
        insertionPoint: item.insertionPoint,
        importance: item.importance || 'medium'
      });
    }

    return results;
  }

  /**
   * 翻译成英文（使用千帆API）
   */
  async translateToEnglish(keyword, qianfanService) {
    try {
      const prompt = `将以下中文关键词翻译成英文（只返回英文翻译，不要解释）：${keyword}`;
      const response = await qianfanService.chat(prompt, { maxRetries: 2 });

      // 清理响应
      return response.trim().replace(/["""'''。.]/g, '');
    } catch (error) {
      console.error(`翻译失败: ${error.message}`);
      // 降级：使用简单映射
      return this.getFallbackTranslation(keyword);
    }
  }

  /**
   * 降级翻译
   */
  getFallbackTranslation(keyword) {
    const dictionary = {
      '饱和': 'Saturation',
      '流量': 'Traffic',
      '机制': 'Mechanism',
      '策略': 'Strategy',
      '用户': 'User',
      '增量': 'Increment',
      '推送': 'Push',
      '广告': 'Advertisement',
      '投放': 'Launch',
      '抖音': 'Douyin',
      '巨量': 'Massive',
      '获取': 'Acquire',
      '视频': 'Video',
      '曝光': 'Exposure',
      '粉丝': 'Fans',
      '算法': 'Algorithm',
      '转化': 'Conversion',
      '变现': 'Monetization',
      '带货': 'Live Commerce',
      '直播': 'Live Streaming',
      '千川': 'Qianchuan',
      '营销': 'Marketing',
      '推广': 'Promotion',
      '数据': 'Data',
      '分析': 'Analysis',
      '运营': 'Operation'
    };

    // 查找字典
    for (const [cn, en] of Object.entries(dictionary)) {
      if (keyword.includes(cn)) {
        return en;
      }
    }

    // 默认返回拼音首字母大写
    return keyword.charAt(0).toUpperCase() + keyword.slice(1);
  }

  /**
   * 从已有关键词列表中匹配
   */
  matchExistingKeyword(text, keywords) {
    for (const kw of keywords) {
      if (text.includes(kw.text)) {
        return {
          keyword: kw.text,
          english: kw.english,
          score: 1.0,
          method: 'matched'
        };
      }
    }
    return null;
  }
}

export default KeywordExtractionService;
