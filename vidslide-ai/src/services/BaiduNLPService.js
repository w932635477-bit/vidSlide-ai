/**
 * VidSlide AI - 百度NLP服务
 * 使用百度NLP API进行关键词提取
 *
 * API文档: https://ai.baidu.com/ai-doc/NLP/nk6z52eu3
 */

import { BAIDU_NLP_CONFIG } from '../config/api-keys.js'

class BaiduNLPService {
  constructor() {
    this.accessToken = null
    this.tokenExpireTime = 0
  }

  /**
   * 获取Access Token
   */
  async getAccessToken() {
    // 检查token是否有效（提前5分钟刷新）
    if (this.accessToken && Date.now() < this.tokenExpireTime - 300000) {
      return this.accessToken
    }

    const { apiKey, secretKey } = BAIDU_NLP_CONFIG

    try {
      const url = `/api/baidu/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(`API错误: ${data.error_description || data.error}`)
      }

      this.accessToken = data.access_token
      // token有效期通常是30天，这里设置过期时间
      this.tokenExpireTime = Date.now() + (data.expires_in * 1000)

      console.log('[BaiduNLP] Access Token获取成功')
      return this.accessToken

    } catch (error) {
      console.error('[BaiduNLP] 获取Token失败:', error)
      throw error
    }
  }

  /**
   * 提取关键词
   * @param {string} text - 要提取关键词的文本
   * @param {number} num - 返回的关键词数量，默认10个
   * @returns {Promise<Array>} 关键词列表
   */
  async extractKeywords(text, num = 15) {
    if (!text || text.length < 5) {
      return []
    }

    try {
      const token = await this.getAccessToken()

      // 百度NLP关键词提取API
      const url = `/api/baidu/rpc/2.0/nlp/v1/keyword?access_token=${token}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: '视频内容',  // 标题不能为空
          content: text  // 正文内容
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`)
      }

      const result = await response.json()

      if (result.error_code) {
        console.error('[BaiduNLP] API错误:', result.error_msg)
        // 如果API调用失败，回退到本地算法
        return this.localExtractKeywords(text, num)
      }

      // 处理返回的关键词
      const apiKeywords = (result.items || []).slice(0, num).map((item, index) => ({
        text: item.tag,
        score: item.score,
        importance: Math.max(0.5, 1 - index * 0.03)
      }))

      console.log('[BaiduNLP] API返回关键词:', apiKeywords.length, '个')

      // 如果API返回的关键词太少（少于5个），使用本地算法补充
      if (apiKeywords.length < 5) {
        console.log('[BaiduNLP] API返回关键词较少，使用本地算法补充...')
        const localKeywords = this.localExtractKeywords(text, num)

        // 合并关键词：API关键词优先，本地关键词补充
        const mergedKeywords = [...apiKeywords]
        const existingTexts = new Set(apiKeywords.map(k => k.text))

        for (const localKw of localKeywords) {
          if (!existingTexts.has(localKw.text) && mergedKeywords.length < num) {
            // 降低本地关键词的重要性
            mergedKeywords.push({
              ...localKw,
              importance: localKw.importance * 0.9
            })
            existingTexts.add(localKw.text)
          }
        }

        console.log('[BaiduNLP] 合并后关键词:', mergedKeywords.length, '个')
        return mergedKeywords
      }

      return apiKeywords

    } catch (error) {
      console.error('[BaiduNLP] 关键词提取失败:', error)
      // 回退到本地算法
      return this.localExtractKeywords(text, num)
    }
  }

  /**
   * 本地关键词提取算法（作为备用）
   * 使用基于词典匹配 + 词频统计的方法
   * @param {string} text - 文本内容
   * @param {number} num - 关键词数量
   * @returns {Array} 关键词列表
   */
  localExtractKeywords(text, num = 15) {
    if (!text || text.length < 5) return []

    console.log('[BaiduNLP] 使用本地算法提取关键词...')

    // 大型领域词典（短视频/营销/电商领域）
    // 注意：长词放前面，短词放后面，优先匹配长词
    const domainDictionary = new Set([
      // 平台
      '抖音', '快手', '视频号', '小红书', 'B站', '微博', '微信', '淘宝', '京东', '拼多多',
      '天猫', '闲鱼', '得物', '知乎', '豆瓣', '头条', '西瓜视频', '火山', '皮皮虾',
      // 内容形式
      '短视频', '直播', '带货', '种草', '测评', '开箱', '教程', '攻略', '干货', '分享',
      '视频', '图文', '笔记', '帖子', '动态', '故事', '合集', '专栏',
      // 营销术语 - 投放相关（重要！）
      '巨量AD', '巨量ad', '质量AD', '质量ad', '投放巨量', '头发巨量',  // 语音识别常见错误
      '巨量引擎', '巨量千川', '磁力金牛', '腾讯广告', '信息流广告',
      '巨量', '千川', '信息流', 'DOU+', 'AD', 'ROI', 'GMV', 'UV', 'PV', 'CTR', 'CVR',
      // 营销术语 - 流量相关
      '流量', '粉丝', '用户', '客户', '获客', '转化', '变现', '引流', '涨粉', '掉粉',
      '投放', '广告', '推广', '营销', '运营', '增长', '裂变', '私域', '公域',
      // 内容创作
      '拍摄', '剪辑', '文案', '脚本', '素材', '封面', '标题', '配音', '字幕', '特效',
      '滤镜', '转场', 'BGM', '音乐', '贴纸', '模板', '剪映', 'PR', 'AE',
      // 账号运营
      '做IP', '做ip', 'IP', '人设', '账号', '矩阵', '爆款', '热门', '上热门', '推荐', '首页',
      '垂直', '领域', '赛道', '定位', '标签', '话题', '挑战', '活动',
      // 数据指标
      '播放量', '点赞', '评论', '转发', '收藏', '关注', '完播率', '互动率', '转化率',
      '曝光', '展现', '点击', '浏览', '停留', '跳出', '留存', '复购',
      // 商业变现
      '变现', '盈利', '收益', '订单', '成交', '客单价', '利润', '佣金', '分成',
      '橱窗', '小店', '商品', '链接', '挂车', '购物车', '团购', '优惠券',
      // 用户相关
      '粉丝', '铁粉', '路人', '黑粉', '水军', '僵尸粉', '真粉', '活粉',
      '目标用户', '精准用户', '潜在客户', '意向客户', '成交客户', '目标人群',
      // 流量相关（重要！）
      '自然流量', '付费流量', '精准流量', '陌生流量', '泛流量', '私域流量', '公域流量',
      '流量池', '流量推送', '推送机制', '算法', '推荐算法',
      '原生互动', '良性循环', '增量用户',  // 新增
      // 策略方法
      '玩法', '打法', '套路', '技巧', '方法', '策略', '模式', '体系', '闭环',
      '起号', '养号', '破播', '破千', '破万', '爆单', '爆款', '对标',
      // 行业术语
      '电商', '直播电商', '内容电商', '兴趣电商', '社交电商', '跨境电商',
      '达人', '博主', '网红', 'KOL', 'KOC', 'MCN', '主播', '带货主播',
      // 其他常用
      '老板', '商家', '品牌', '产品', '服务', '项目', '案例', '效果', '结果',
      '数据', '分析', '复盘', '优化', '测试', '迭代', '升级'
    ])

    // 停用词（单字）
    const stopChars = new Set([
      '的', '地', '得', '了', '着', '过', '吗', '呢', '吧', '啊', '呀', '哦', '嗯',
      '是', '有', '在', '和', '与', '或', '但', '而', '就', '才', '只', '都', '也',
      '很', '太', '真', '挺', '更', '最', '比', '被', '把', '让', '给', '从', '向',
      '我', '你', '他', '她', '它', '这', '那', '哪', '谁', '什', '么', '怎',
      '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万',
      '个', '只', '条', '件', '种', '些', '点', '下', '次', '遍', '会', '能', '要',
      '不', '没', '无', '非', '别', '去', '来', '到', '说', '看', '想', '做', '用'
    ])

    // 停用词组
    const stopPhrases = new Set([
      '可以', '需要', '知道', '觉得', '认为', '希望', '喜欢', '应该', '必须', '可能',
      '已经', '正在', '将要', '一定', '肯定', '因为', '所以', '如果', '虽然', '但是',
      '而且', '或者', '还是', '不过', '然后', '接着', '于是', '那么', '这样', '那样',
      '这里', '那里', '现在', '以前', '以后', '时候', '地方', '东西', '事情', '问题',
      '越来越', '出现', '完全', '目前', '通过', '达到', '起到', '进行', '开始', '结束',
      '一个', '一些', '一点', '一下', '一样', '一起', '没有', '不是', '不要', '不能',
      '什么', '怎么', '为什么', '怎样', '如何', '多少', '哪里', '哪个', '哪些'
    ])

    // 第一步：从文本中提取所有领域词典中的词
    // 优先匹配长词（按词长排序）
    const sortedDomainWords = [...domainDictionary].sort((a, b) => b.length - a.length)
    const foundDomainWords = {}

    for (const word of sortedDomainWords) {
      const regex = new RegExp(word, 'gi')  // 忽略大小写
      const matches = text.match(regex)
      if (matches && matches.length > 0) {
        // 使用标准化的词（优先使用大写版本）
        const normalizedWord = word.toUpperCase().includes('AD') || word.toUpperCase().includes('IP')
          ? word.replace(/ad$/i, 'AD').replace(/ip$/i, 'IP').replace(/^做ip$/i, '做IP')
          : word
        foundDomainWords[normalizedWord] = (foundDomainWords[normalizedWord] || 0) + matches.length
      }
    }

    // 第二步：使用N-gram方法提取高频词组（2-4字）
    const ngramCounts = {}
    const cleanText = text.replace(/[，。！？、；：""''（）【】《》\s\n\r\t]+/g, ' ')
    const segments = cleanText.split(' ').filter(s => s.length > 0)

    for (const segment of segments) {
      // 提取2-4字的n-gram
      for (let n = 2; n <= 4; n++) {
        for (let i = 0; i <= segment.length - n; i++) {
          const ngram = segment.substring(i, i + n)

          // 跳过包含停用字符开头或结尾的词
          if (stopChars.has(ngram[0]) || stopChars.has(ngram[ngram.length - 1])) {
            continue
          }

          // 跳过停用词组
          if (stopPhrases.has(ngram)) {
            continue
          }

          // 跳过全是停用字符的词
          let allStop = true
          for (const char of ngram) {
            if (!stopChars.has(char)) {
              allStop = false
              break
            }
          }
          if (allStop) continue

          // 跳过已经在领域词典中的词（避免重复计数）
          if (domainDictionary.has(ngram)) continue

          ngramCounts[ngram] = (ngramCounts[ngram] || 0) + 1
        }
      }
    }

    // 第三步：合并领域词和高频n-gram，计算分数
    const wordScores = []

    // 添加领域词（高权重）
    for (const [word, count] of Object.entries(foundDomainWords)) {
      let score = count * 5  // 领域词基础权重5倍

      // 词长加权
      if (word.length >= 4) score *= 1.5
      else if (word.length === 3) score *= 1.3

      // 位置加权
      const firstPos = text.indexOf(word)
      if (firstPos < text.length * 0.2) score *= 1.3
      else if (firstPos < text.length * 0.4) score *= 1.1

      // 英文词加权
      if (/[A-Za-z]/.test(word)) score *= 1.5

      wordScores.push({ text: word, count, score, isDomain: true })
    }

    // 添加高频n-gram（只添加出现2次以上的）
    for (const [word, count] of Object.entries(ngramCounts)) {
      if (count < 2) continue  // 只保留出现2次以上的词

      let score = count

      // 词长加权
      if (word.length >= 4) score *= 1.5
      else if (word.length === 3) score *= 1.2

      // 位置加权
      const firstPos = text.indexOf(word)
      if (firstPos !== -1) {
        if (firstPos < text.length * 0.2) score *= 1.2
        else if (firstPos < text.length * 0.4) score *= 1.1
      }

      wordScores.push({ text: word, count, score, isDomain: false })
    }

    // 按分数排序
    wordScores.sort((a, b) => b.score - a.score)

    // 去重：去除被其他词包含的词
    const filteredKeywords = []
    const usedWords = new Set()

    for (const item of wordScores) {
      let shouldAdd = true

      // 检查是否与已选词有包含关系
      for (const used of usedWords) {
        // 如果当前词被已选词包含，跳过
        if (used.includes(item.text)) {
          shouldAdd = false
          break
        }
        // 如果当前词包含已选词，且当前词是领域词或分数更高，替换
        if (item.text.includes(used)) {
          if (item.isDomain || item.score > filteredKeywords.find(k => k.text === used)?.score * 1.5) {
            usedWords.delete(used)
            const idx = filteredKeywords.findIndex(k => k.text === used)
            if (idx !== -1) filteredKeywords.splice(idx, 1)
          } else {
            shouldAdd = false
          }
          break
        }
      }

      if (shouldAdd && filteredKeywords.length < num) {
        filteredKeywords.push(item)
        usedWords.add(item.text)
      }
    }

    // 计算重要性分数
    const maxScore = filteredKeywords[0]?.score || 1
    const keywords = filteredKeywords.map((item, index) => ({
      text: item.text,
      count: item.count,
      score: item.score / maxScore,
      importance: Math.max(0.5, 1 - index * 0.03)
    }))

    console.log('[BaiduNLP] 本地算法提取关键词:', keywords.map(k => k.text).join(', '))
    return keywords
  }
}

// 单例实例
let nlpServiceInstance = null

export function getBaiduNLPService() {
  if (!nlpServiceInstance) {
    nlpServiceInstance = new BaiduNLPService()
  }
  return nlpServiceInstance
}

export default BaiduNLPService
