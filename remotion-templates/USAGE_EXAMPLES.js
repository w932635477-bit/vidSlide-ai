/**
 * 使用示例：如何动态插入文字和图片
 */

// ============================================
// 示例 1：基础使用 - 只有文字
// ============================================
const example1 = {
  template: 'ProductShowcaseEnhanced',
  props: {
    title: '革命性AI产品',
    subtitle: '改变世界的创新',
    description: '利用最先进的人工智能技术，为您提供前所未有的体验',
    brandColor: '#007AFF',
  }
};

// ============================================
// 示例 2：添加图片
// ============================================
const example2 = {
  template: 'ProductShowcaseEnhanced',
  props: {
    title: '产品展示',
    subtitle: '三大核心功能',
    images: [
      '/path/to/image1.jpg',  // 本地图片路径
      '/path/to/image2.jpg',
      'https://example.com/image3.jpg', // 或者URL
    ],
    brandColor: '#FF6B6B',
  }
};

// ============================================
// 示例 3：完整配置 - 文字 + 图片 + 特性
// ============================================
const example3 = {
  template: 'ProductShowcaseEnhanced',
  props: {
    // 文字内容
    title: 'VidSlide AI',
    subtitle: '智能视频生成平台',
    description: '一键将视频转换为精美PPT，支持AI智能剪辑',
    features: [
      'AI智能分析',
      '自动配乐',
      '一键导出',
      '云端渲染'
    ],

    // 图片内容
    images: [
      '/Users/weilei/Desktop/隔空投送/IMG_3620 2.PNG',
      '/Users/weilei/Desktop/隔空投送/IMG_3630 2.PNG',
      '/Users/weilei/Desktop/隔空投送/IMG_3640 2.PNG',
    ],
    logo: '/path/to/logo.png',
    backgroundImage: '/path/to/background.jpg',

    // 样式配置
    brandColor: '#667eea',
    backgroundColor: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    textColor: 'white',

    // 动画配置
    animationSpeed: 1.2, // 加快20%
    cardCount: 3,
  }
};

// ============================================
// 示例 4：从用户数据动态生成
// ============================================
function generateVideoFromUserContent(userContent) {
  // 假设 userContent 来自用户上传
  const { text, images, keywords } = userContent;

  // AI 分析关键词，选择模板
  const template = matchTemplate(keywords); // 'ProductShowcaseEnhanced'

  // 提取标题和描述
  const title = extractTitle(text); // AI提取主标题
  const subtitle = extractSubtitle(text); // AI提取副标题
  const features = extractFeatures(text); // AI提取特性列表

  // 组装 props
  return {
    template,
    props: {
      title,
      subtitle,
      features,
      images: images.slice(0, 3), // 取前3张图片
      brandColor: detectBrandColor(images[0]), // AI检测主色调
    }
  };
}

// ============================================
// 示例 5：与你的 Vue 项目集成
// ============================================
// 在 Vue 组件中使用
export async function renderVideoInVue(userContent) {
  // 1. 分析用户内容
  const analysis = await analyzeContent(userContent);

  // 2. 选择模板
  const template = selectTemplate(analysis.keywords);

  // 3. 准备 props
  const props = {
    title: analysis.title,
    subtitle: analysis.subtitle,
    description: analysis.description,
    images: userContent.images,
    features: analysis.features,
    brandColor: analysis.brandColor,
  };

  // 4. 调用 Remotion 渲染服务
  const response = await fetch('http://localhost:3001/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template, props })
  });

  const result = await response.json();
  return result.outputPath; // 返回视频路径
}

// ============================================
// 关键词匹配示例
// ============================================
const templateMatcher = {
  keywords: {
    'ProductShowcaseEnhanced': ['产品', '展示', '介绍', '特性', '功能'],
    'SplitComparison': ['对比', '比较', 'VS', '前后', '优劣'],
    'DataVisualization': ['数据', '图表', '统计', '分析', '趋势'],
    'Timeline': ['时间', '流程', '步骤', '历程', '发展'],
  },

  match(userKeywords) {
    let bestMatch = null;
    let maxScore = 0;

    for (const [template, keywords] of Object.entries(this.keywords)) {
      const score = userKeywords.filter(k =>
        keywords.some(tk => k.includes(tk) || tk.includes(k))
      ).length;

      if (score > maxScore) {
        maxScore = score;
        bestMatch = template;
      }
    }

    return bestMatch || 'ProductShowcaseEnhanced'; // 默认模板
  }
};

// 使用示例
const userKeywords = ['产品', '功能', '展示'];
const selectedTemplate = templateMatcher.match(userKeywords);
console.log(selectedTemplate); // 'ProductShowcaseEnhanced'
