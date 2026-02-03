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

    // 停用词（恢复完整版 - 过滤无意义词汇）
    this.stopWords = new Set([
      // 基础停用词
      '的', '了', '是', '在', '和', '有', '就', '不', '都',
      '一个', '这个', '那个', '什么', '怎么', '哪里',

      // 恢复常见无意义词（提升关键词质量）
      '人', '上', '也', '很', '到', '说', '要', '去', '你',
      '会', '着', '没有', '看', '好', '自己', '这', '那', '个',
      '需要', '可能', '应该', '必须', '可以', '能够', '想要', '做',
      '已经', '正在', '开始', '结束', '进行', '发生', '出现',
      '非常', '特别', '十分', '比较', '更加', '最', '更', '还', '太',
      '但是', '然后', '因为', '所以', '如果', '虽然', '而且', '不过',
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
    // ⭐ 修改：动态计算topN
    const topN = options.topN || this.calculateOptimalTopN(text.length, videoDuration);
    const method = options.method || 'both'; // 'tfidf', 'textrank', 'both'
    const asrWords = options.asrWords || []; // ⭐ 新增：接收ASR词级时间戳

    this.logger.info('🔍 LocalKeywordExtractor: 开始提取关键词');
    this.logger.info(`  文本长度: ${text.length}字`);
    this.logger.info(`  视频时长: ${videoDuration.toFixed(2)}秒`);
    this.logger.info(`  提取方法: ${method}`);
    this.logger.info(`  目标数量: ${topN}个`);
    if (asrWords.length > 0) {
      this.logger.info(`  ASR词级时间戳: ${asrWords.length}个词`);
    }

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

        // 过滤条件（优化版 - 放宽限制）
        if (this.stopWords.has(keyword)) continue;
        if (keyword.length < 2) continue;  // 保持长度≥2
        // ✅ 允许纯英文关键词（如"AI"、"API"）
        // ❌ 已删除：if (!/[\u4e00-\u9fa5]/.test(keyword)) continue;

        // ⭐ 新增：权重阈值过滤（避免低质量关键词）
        if (item.weight < 3) continue;  // 权重<3的过滤掉

        // 查找关键词在文本中的首次出现位置
        const firstOccurrence = this.findFirstOccurrence(text, keyword);
        if (!firstOccurrence) continue; // 如果在文本中找不到，跳过

        // ⭐ 修改：优先使用ASR词级时间戳
        let timestamp;
        let timestampMethod = 'interpolation';
        if (asrWords.length > 0) {
          timestamp = this.calculateTimestampFromWords(keyword, asrWords);
          if (timestamp) {
            timestampMethod = 'asr';
          }
        }

        // 降级：使用字符位置插值
        if (!timestamp) {
          timestamp = this.calculateTimestamp(text, firstOccurrence.charIndex, videoDuration);
        }

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
          method: method,
          timestampMethod: timestampMethod // ⭐ 标记时间戳来源
        });

        // 达到topN个停止
        if (results.length >= topN) break;
      }

      this.logger.info(`  ✅ 成功提取 ${results.length} 个关键词`);
      if (asrWords.length > 0) {
        const asrCount = results.filter(r => r.timestampMethod === 'asr').length;
        this.logger.info(`  → ASR精确时间戳: ${asrCount}个, 插值时间戳: ${results.length - asrCount}个`);
      }

      return results;

    } catch (error) {
      this.logger.error('关键词提取失败:', error.message);
      return this.getFallbackKeywords(text, videoDuration, topN);
    }
  }

  /**
   * ⭐ 优化：动态计算最优topN（增强版 - 提升关键词数量）
   * @param {number} textLength - 文本长度
   * @param {number} videoDuration - 视频时长（秒）
   * @returns {number} 最优topN值
   */
  calculateOptimalTopN(textLength, videoDuration) {
    // 基于文本长度（提升提取数量）
    let topN = 8; // ✅ 默认值从5增加到8

    if (textLength < 500) {
      topN = 8;  // ✅ 短文本提取8个（从5增加）
    } else if (textLength < 2000) {
      topN = Math.min(15, Math.ceil(textLength / 150));  // ✅ 从250改为150，提取更多
    } else if (textLength < 5000) {
      topN = Math.min(25, Math.ceil(textLength / 200));  // ✅ 中等文本最多25个
    } else {
      topN = Math.min(35, Math.ceil(textLength / 250));  // ✅ 超长文本最多35个
    }

    // 基于视频时长调整（增强）
    if (videoDuration > 180) { // 超过3分钟
      topN = Math.min(topN + 5, 40);  // ✅ 从+3改为+5，上限从15改为40
    } else if (videoDuration > 120) { // 超过2分钟
      topN = Math.min(topN + 3, 30);  // ✅ 新增：2-3分钟增加3个
    }

    this.logger.info(`  → 动态topN: ${topN} (文本长度: ${textLength}, 视频时长: ${videoDuration}s)`);
    return topN;
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
   * ⭐ 新增：从ASR词级时间戳计算精确时间
   * @param {string} keyword - 关键词
   * @param {Array} words - ASR词级时间戳数组
   * @returns {Object|null} 时间戳对象或null
   */
  calculateTimestampFromWords(keyword, words) {
    if (!words || words.length === 0) {
      return null; // 降级到字符位置插值
    }

    // 在words数组中查找包含关键词的词
    const matchedWords = [];
    for (const word of words) {
      // ⭐ 验证字段有效性
      if (!word.text ||
          typeof word.beginTime !== 'number' ||
          typeof word.endTime !== 'number' ||
          word.beginTime < 0 ||
          word.endTime < word.beginTime) {
        continue;
      }

      // ⭐ 改进匹配逻辑：优先完全匹配，其次关键词包含ASR词
      if (keyword === word.text || keyword.includes(word.text)) {
        matchedWords.push(word);
      }
    }

    if (matchedWords.length > 0) {
      const firstWord = matchedWords[0];
      const lastWord = matchedWords[matchedWords.length - 1];

      // ⭐ 使用安全的数值转换
      const beginTime = parseFloat(firstWord.beginTime) || 0;
      const endTime = parseFloat(lastWord.endTime) || 0;

      return {
        start: Math.max(0, beginTime - 0.5),  // 提前0.5秒
        end: endTime + 1.0,                     // 延后1秒
        exact: (beginTime + endTime) / 2
      };
    }

    return null; // 未找到匹配，降级
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
      context: kw.context,
      // ⭐ 新增：次关键词（用于卡片组）
      subKeywords: kw.subKeywords || []
    }));
  }

  /**
   * ⭐⭐⭐ 为主关键词生成次关键词（v2.0 - 从句子中提取有意义的词）
   *
   * 策略：
   * 1. 从关键词所在句子中提取名词、动词
   * 2. 排除主关键词本身
   * 3. 排除停用词和无意义词
   * 4. 优先选择与主关键词语义相关的词
   *
   * 例如："如何创办自己的公司" → 主关键词"创办" → 次关键词["公司", "自己的"]
   *
   * @param {string} mainKeyword - 主关键词
   * @param {string} context - 上下文（关键词所在句子）
   * @param {string} fullText - 完整文本
   * @returns {Array} 次关键词数组
   */
  generateSubKeywords(mainKeyword, context, fullText) {
    const subKeywords = [];

    // ⭐ 无意义词列表（这些词不应该作为次关键词）
    const meaninglessWords = new Set([
      '详解', '解析', '分析', '介绍', '说明', '讲解', '解读',
      '什么', '怎么', '如何', '为什么', '哪些', '哪个', '哪里',
      '这个', '那个', '这些', '那些', '这里', '那里',
      '就是', '可以', '能够', '应该', '需要', '必须',
      '一个', '一些', '一种', '一下', '一起',
      '非常', '特别', '十分', '很', '太', '最',
      '今天', '明天', '昨天', '现在', '以后', '之前',
      '大家', '我们', '你们', '他们', '自己',
      '其实', '所以', '因为', '但是', '而且', '或者',
      '第一', '第二', '第三', '首先', '然后', '最后'
    ]);

    // 1. 对上下文进行分词，提取有意义的词
    const contextWords = nodejieba.cut(context);
    const meaningfulWords = [];

    for (const word of contextWords) {
      // 跳过停用词
      if (this.stopWords.has(word)) continue;
      // 跳过无意义词
      if (meaninglessWords.has(word)) continue;
      // 跳过太短或太长的词
      if (word.length < 2 || word.length > 6) continue;
      // 跳过非中文词
      if (!/[\u4e00-\u9fa5]/.test(word)) continue;
      // 跳过主关键词本身
      if (word === mainKeyword) continue;
      // 跳过包含主关键词的词
      if (word.includes(mainKeyword) || mainKeyword.includes(word)) continue;

      meaningfulWords.push(word);
    }

    // 2. 使用词性标注对词语进行重要性排序
    const wordScores = [];
    for (const word of meaningfulWords) {
      // 计算词语的重要性分数
      let score = 0;

      // 名词和动词加分
      const tags = nodejieba.tag(word);
      for (const tag of tags) {
        if (tag.tag === 'n' || tag.tag === 'v' || tag.tag === 'vn') {
          score += 2;
        }
      }

      // 在全文中出现次数加分
      const occurrences = (fullText.match(new RegExp(word, 'g')) || []).length;
      score += Math.min(occurrences, 3);

      // 词长加分（2-4字最佳）
      if (word.length >= 2 && word.length <= 4) {
        score += 1;
      }

      wordScores.push({ word, score });
    }

    // 3. 按分数排序，取前3个
    wordScores.sort((a, b) => b.score - a.score);

    for (const { word } of wordScores.slice(0, 3)) {
      // 避免重复
      if (subKeywords.some(sk => sk.text === word)) continue;

      subKeywords.push({
        text: word,
        english: this.translateToEnglish(word),
        source: 'sentence'
      });
    }

    // 4. 如果从句子中提取不够，从关联词库补充
    if (subKeywords.length < 2) {
      const relatedWords = this.getRelatedWords(mainKeyword);
      for (const related of relatedWords) {
        if (subKeywords.some(sk => sk.text === related)) continue;
        if (meaninglessWords.has(related)) continue;
        if (fullText.includes(related)) {
          subKeywords.push({
            text: related,
            english: this.translateToEnglish(related),
            source: 'related'
          });
        }
        if (subKeywords.length >= 3) break;
      }
    }

    return subKeywords.slice(0, 3);
  }

  /**
   * ⭐ 获取关联词
   * @param {string} keyword - 关键词
   * @returns {Array} 关联词数组
   */
  getRelatedWords(keyword) {
    const relatedMap = {
      '抖音': ['短视频', '流量', '推荐', '算法'],
      '流量': ['曝光', '转化', '获客', '增长'],
      '获客': ['转化', '成本', '效率', '精准'],
      '推送': ['触达', '精准', '用户', '转化'],
      '营销': ['推广', '投放', '转化', '品牌'],
      '转化': ['成交', '订单', '效果', '提升'],
      '用户': ['粉丝', '客户', '受众', '群体'],
      '增长': ['提升', '翻倍', '突破', '爆发'],
      '数据': ['分析', '报表', '指标', '效果'],
      '算法': ['推荐', '机制', '规则', '逻辑'],
      '广告': ['投放', '素材', '创意', '效果'],
      '内容': ['创作', '素材', '文案', '脚本'],
      '视频': ['拍摄', '剪辑', '制作', '发布'],
      '直播': ['带货', '互动', '转化', '流量'],
      '粉丝': ['关注', '互动', '留存', '活跃'],
      '运营': ['策略', '执行', '优化', '复盘'],
      '品牌': ['曝光', '认知', '形象', '价值']
    };

    for (const [key, values] of Object.entries(relatedMap)) {
      if (keyword.includes(key)) {
        return values;
      }
    }

    return [];
  }

  /**
   * ⭐ 提取关键词（增强版 - 包含次关键词）
   * @param {string} text - 完整文本
   * @param {number} videoDuration - 视频总时长（秒）
   * @param {Object} options - 选项
   * @returns {Array} 关键词数组（包含次关键词）
   */
  extractKeywordsWithSubKeywords(text, videoDuration, options = {}) {
    // 先提取主关键词
    const mainKeywords = this.extractKeywordsWithTimestamp(text, videoDuration, options);

    // 为每个主关键词生成次关键词
    for (const kw of mainKeywords) {
      kw.subKeywords = this.generateSubKeywords(kw.text, kw.context, text);
      this.logger.info(`  → "${kw.text}" 次关键词: ${kw.subKeywords.map(sk => sk.text).join(', ') || '无'}`);
    }

    return mainKeywords;
  }
}

export default LocalKeywordExtractorV2;
