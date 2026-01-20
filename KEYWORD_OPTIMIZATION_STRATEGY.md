# 🎨 关键词优化策略

**日期**: 2026-01-20
**版本**: v2.2.0
**状态**: 📋 关键设计

---

## 🔍 问题分析

### 直接提交 vs 优化后提交

| 方案 | 输入示例 | 输出效果 | 问题 |
|------|---------|---------|------|
| **直接提交** | "人工智能" | 随机风格的AI图片 | ❌ 风格不统一<br>❌ 质量不可控<br>❌ 可能不符合黑色背景 |
| **优化后提交** | "人工智能，科技感，蓝色光效，简洁现代，黑色背景，高清4K" | 符合预期的科技风格 | ✅ 风格统一<br>✅ 质量可控<br>✅ 符合设计规范 |

### 核心问题

1. **风格一致性**: 直接提交关键词，每次生成的风格可能完全不同
2. **质量保证**: 没有质量控制词（如"高清"、"4K"），可能生成低质量图片
3. **背景适配**: 可能生成带有复杂背景的图片，不适合黑色背景叠加
4. **视觉统一**: 无法保证整个视频的视觉风格统一

---

## 💡 解决方案：Prompt工程

### 核心思路

```
原始关键词 → Prompt优化器 → 增强型Prompt → 豆包生图 → 高质量图片
```

### Prompt结构设计

```
[核心关键词] + [风格描述] + [视觉效果] + [背景要求] + [质量控制]
```

---

## 🎨 Prompt模板设计

### 1. 基础模板（通用场景）

```javascript
const baseTemplate = {
  structure: '{keyword}，{style}，{visual}，{background}，{quality}',
  
  style: [
    '科技感',
    '现代简约',
    '扁平化设计',
    '商务风格'
  ],
  
  visual: [
    '蓝紫色调',
    '渐变光效',
    '几何图形',
    '线条元素'
  ],
  
  background: [
    '纯色背景',
    '简洁背景',
    '透明背景',
    '深色背景'
  ],
  
  quality: [
    '高清',
    '4K',
    '专业摄影',
    '精细细节'
  ]
}

// 示例输出
"人工智能，科技感，蓝紫色调，渐变光效，纯色背景，高清4K"
```

### 2. 强调类模板（高重要性关键词）

```javascript
const emphasisTemplate = {
  structure: '{keyword}，{emphasis}，{style}，{visual}，{background}，{quality}',
  
  emphasis: [
    '视觉冲击力',
    '大气磅礴',
    '震撼效果',
    '突出主体'
  ],
  
  style: [
    '未来科技',
    '赛博朋克',
    '极简主义',
    '工业设计'
  ],
  
  visual: [
    '强烈光效',
    '霓虹发光',
    '粒子特效',
    '能量波纹'
  ],
  
  background: [
    '纯黑背景',
    '深空背景',
    '暗色调',
    '极简背景'
  ],
  
  quality: [
    '超高清',
    '8K',
    '电影级',
    '专业级'
  ]
}

// 示例输出
"人工智能，视觉冲击力，未来科技，强烈光效，霓虹发光，纯黑背景，超高清8K"
```

### 3. 图标类模板（简洁场景）

```javascript
const iconTemplate = {
  structure: '{keyword}，图标风格，{style}，{visual}，{background}，{quality}',
  
  style: [
    '扁平化',
    '线性图标',
    '极简设计',
    '现代风格'
  ],
  
  visual: [
    '单色',
    '渐变色',
    '描边',
    '填充'
  ],
  
  background: [
    '透明背景',
    '纯色背景',
    '无背景',
    '简洁背景'
  ],
  
  quality: [
    '矢量图',
    '高清',
    '清晰锐利',
    '专业设计'
  ]
}

// 示例输出
"人工智能，图标风格，扁平化，渐变色，透明背景，矢量图高清"
```

### 4. 产品类模板（具体物品）

```javascript
const productTemplate = {
  structure: '{keyword}，{style}，{lighting}，{angle}，{background}，{quality}',
  
  style: [
    '产品摄影',
    '商业摄影',
    '专业拍摄',
    '精致展示'
  ],
  
  lighting: [
    '柔和光线',
    '专业布光',
    '工作室灯光',
    '自然光'
  ],
  
  angle: [
    '正面视角',
    '45度角',
    '俯视图',
    '特写镜头'
  ],
  
  background: [
    '纯色背景',
    '白色背景',
    '深色背景',
    '简洁背景'
  ],
  
  quality: [
    '高清',
    '4K',
    '专业级',
    '细节丰富'
  ]
}

// 示例输出
"智能手机，产品摄影，专业布光，45度角，纯色背景，高清4K"
```

### 5. 抽象概念模板（抽象关键词）

```javascript
const abstractTemplate = {
  structure: '{keyword}，{representation}，{style}，{visual}，{background}，{quality}',
  
  representation: [
    '抽象表现',
    '概念艺术',
    '视觉隐喻',
    '符号化'
  ],
  
  style: [
    '几何抽象',
    '流体艺术',
    '数字艺术',
    '现代艺术'
  ],
  
  visual: [
    '渐变色彩',
    '光影效果',
    '粒子系统',
    '动态线条'
  ],
  
  background: [
    '深色背景',
    '纯黑背景',
    '渐变背景',
    '简洁背景'
  ],
  
  quality: [
    '高清',
    '艺术级',
    '精细渲染',
    '专业制作'
  ]
}

// 示例输出
"创新，抽象表现，几何抽象，渐变色彩，光影效果，深色背景，高清艺术级"
```

---

## 🤖 PromptOptimizer 服务实现

### 服务架构

```javascript
/**
 * Prompt优化器服务
 * 负责将原始关键词转换为高质量的生图Prompt
 */
class PromptOptimizer {
  constructor() {
    this.templates = {
      base: this.loadBaseTemplate(),
      emphasis: this.loadEmphasisTemplate(),
      icon: this.loadIconTemplate(),
      product: this.loadProductTemplate(),
      abstract: this.loadAbstractTemplate()
    };
    
    // 关键词分类器
    this.classifier = new KeywordClassifier();
  }

  /**
   * 优化关键词为完整Prompt
   * @param {string} keyword - 原始关键词
   * @param {object} context - 上下文信息
   * @returns {string} 优化后的Prompt
   */
  optimize(keyword, context = {}) {
    // 1. 分类关键词
    const category = this.classifier.classify(keyword, context);
    
    // 2. 选择模板
    const template = this.selectTemplate(category, context);
    
    // 3. 生成Prompt
    const prompt = this.generatePrompt(keyword, template, context);
    
    // 4. 后处理
    return this.postProcess(prompt);
  }

  /**
   * 选择合适的模板
   */
  selectTemplate(category, context) {
    // 根据场景类型选择
    if (context.sceneType === 'emphasis') {
      return this.templates.emphasis;
    }
    
    // 根据关键词类别选择
    switch (category) {
      case 'product':
        return this.templates.product;
      case 'icon':
        return this.templates.icon;
      case 'abstract':
        return this.templates.abstract;
      default:
        return this.templates.base;
    }
  }

  /**
   * 生成Prompt
   */
  generatePrompt(keyword, template, context) {
    const parts = [];
    
    // 核心关键词
    parts.push(keyword);
    
    // 风格描述
    if (template.style) {
      parts.push(this.randomSelect(template.style));
    }
    
    // 视觉效果
    if (template.visual) {
      parts.push(this.randomSelect(template.visual));
    }
    
    // 背景要求
    if (template.background) {
      parts.push(this.randomSelect(template.background));
    }
    
    // 质量控制
    if (template.quality) {
      parts.push(this.randomSelect(template.quality));
    }
    
    return parts.join('，');
  }

  /**
   * 后处理：去重、优化
   */
  postProcess(prompt) {
    // 去除重复词
    const words = prompt.split('，');
    const uniqueWords = [...new Set(words)];
    
    // 限制长度（豆包API可能有限制）
    if (uniqueWords.length > 10) {
      return uniqueWords.slice(0, 10).join('，');
    }
    
    return uniqueWords.join('，');
  }

  /**
   * 随机选择（增加多样性）
   */
  randomSelect(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}
```

### 关键词分类器

```javascript
/**
 * 关键词分类器
 * 判断关键词属于哪个类别
 */
class KeywordClassifier {
  constructor() {
    // 预定义类别关键词库
    this.categories = {
      product: ['手机', '电脑', '汽车', '产品', '设备', '工具'],
      icon: ['图标', '标志', 'logo', '符号', '标记'],
      abstract: ['创新', '未来', '梦想', '理念', '概念', '思维'],
      tech: ['AI', '人工智能', '机器学习', '算法', '数据', '云计算'],
      business: ['营销', '销售', '管理', '战略', '运营', '品牌']
    };
  }

  /**
   * 分类关键词
   */
  classify(keyword, context = {}) {
    const lowerKeyword = keyword.toLowerCase();
    
    // 检查每个类别
    for (const [category, keywords] of Object.entries(this.categories)) {
      if (keywords.some(k => lowerKeyword.includes(k))) {
        return category;
      }
    }
    
    // 根据上下文判断
    if (context.importance >= 0.8) {
      return 'emphasis';
    }
    
    // 默认类别
    return 'base';
  }
}
```

---

## 🎯 使用示例

### 示例1：基础关键词优化

```javascript
const optimizer = new PromptOptimizer();

// 输入
const keyword = "人工智能";

// 输出
const prompt = optimizer.optimize(keyword);
// "人工智能，科技感，蓝紫色调，渐变光效，纯色背景，高清4K"
```

### 示例2：强调类关键词优化

```javascript
// 输入
const keyword = "人工智能";
const context = {
  sceneType: 'emphasis',
  importance: 0.9
};

// 输出
const prompt = optimizer.optimize(keyword, context);
// "人工智能，视觉冲击力，未来科技，强烈光效，霓虹发光，纯黑背景，超高清8K"
```

### 示例3：产品类关键词优化

```javascript
// 输入
const keyword = "智能手机";

// 输出
const prompt = optimizer.optimize(keyword);
// "智能手机，产品摄影，专业布光，45度角，纯色背景，高清4K"
```

---

## 🔄 集成到现有流程

### DoubaoImageService 更新

```javascript
import PromptOptimizer from './PromptOptimizer.js';

class DoubaoImageService {
  constructor() {
    this.optimizer = new PromptOptimizer();
  }

  /**
   * 生成图片（自动优化关键词）
   */
  async generateImage(keyword, options = {}) {
    // 1. 优化关键词
    const optimizedPrompt = this.optimizer.optimize(keyword, options.context);
    
    console.log(`原始关键词: ${keyword}`);
    console.log(`优化后Prompt: ${optimizedPrompt}`);
    
    // 2. 调用豆包API
    const response = await this.callDoubaoAPI(optimizedPrompt, options);
    
    // 3. 返回图片URL
    return response.imageUrl;
  }

  /**
   * 生成强调类图片
   */
  async generateEmphasisImage(keyword, style = 'concept') {
    return await this.generateImage(keyword, {
      context: {
        sceneType: 'emphasis',
        importance: 0.9,
        style: style
      }
    });
  }
}
```

### MicroSceneGenerator 更新

```javascript
class MicroSceneGenerator {
  async generateMicroScenes(segment, keywords, materials) {
    const scenes = [];

    for (const keyword of keywords) {
      // 准备上下文信息
      const context = {
        sceneType: this.isEmphasisScene(keyword) ? 'emphasis' : 'normal',
        importance: keyword.importance,
        category: keyword.category
      };

      // 生成图片（自动优化关键词）
      const image = await doubaoService.generateImage(
        keyword.text,
        { context }
      );

      scenes.push({
        type: 'composition',
        template: context.sceneType === 'emphasis' 
          ? 'BlackBackgroundEmphasis' 
          : 'BlackBackgroundKeyword',
        imageUrl: image,
        keyword: keyword.text
      });
    }

    return scenes;
  }
}
```

---

## 📊 效果对比

### 测试案例

| 原始关键词 | 直接提交效果 | 优化后效果 | 改进 |
|-----------|------------|-----------|------|
| "人工智能" | 随机风格AI图 | 科技感蓝紫色调AI图 | ✅ 风格统一 |
| "创新" | 抽象概念图 | 几何抽象+光效 | ✅ 视觉冲击 |
| "手机" | 普通手机照片 | 产品摄影级手机图 | ✅ 质量提升 |
| "数据" | 随机数据图 | 科技感数据可视化 | ✅ 专业度高 |

---

## 🎨 高级优化策略

### 1. 上下文感知优化

```javascript
/**
 * 根据前后场景调整风格
 */
optimizeWithContext(keyword, previousScenes, nextScenes) {
  // 分析前后场景的风格
  const prevStyle = this.analyzeStyle(previousScenes);
  const nextStyle = this.analyzeStyle(nextScenes);
  
  // 保持风格连贯性
  if (prevStyle === nextStyle) {
    return this.optimize(keyword, { style: prevStyle });
  }
  
  // 过渡风格
  return this.optimize(keyword, { style: 'transition' });
}
```

### 2. 行业定制化

```javascript
/**
 * 根据行业调整Prompt
 */
optimizeForIndustry(keyword, industry) {
  const industryStyles = {
    tech: '科技感，未来风格，蓝色调',
    finance: '专业，商务，稳重，蓝灰色调',
    education: '清新，简洁，明亮，绿色调',
    healthcare: '温暖，关怀，白色调，柔和'
  };
  
  const style = industryStyles[industry] || industryStyles.tech;
  return `${keyword}，${style}，高清4K`;
}
```

### 3. A/B测试优化

```javascript
/**
 * 生成多个版本进行测试
 */
async generateVariants(keyword, count = 3) {
  const variants = [];
  
  for (let i = 0; i < count; i++) {
    const prompt = this.optimize(keyword, { variant: i });
    const image = await doubaoService.generateImage(prompt);
    variants.push({ prompt, image });
  }
  
  return variants;
}
```

---

## 📦 新增文件

1. `vidslide-ai/src/services/PromptOptimizer.js` - Prompt优化器
2. `vidslide-ai/src/services/KeywordClassifier.js` - 关键词分类器
3. `vidslide-ai/src/config/promptTemplates.js` - Prompt模板配置

---

## 🎯 实施建议

### Phase 1: 基础优化（必须）
- ✅ 实现PromptOptimizer基础功能
- ✅ 5个核心模板（base, emphasis, icon, product, abstract）
- ✅ 集成到DoubaoImageService

### Phase 2: 高级优化（可选）
- ⭐ 上下文感知优化
- ⭐ 行业定制化
- ⭐ A/B测试

---

## 📊 预期效果

### 优化前
```
关键词: "人工智能"
生图效果: 随机、不可控、风格不统一
```

### 优化后
```
关键词: "人工智能"
Prompt: "人工智能，科技感，蓝紫色调，渐变光效，纯色背景，高清4K"
生图效果: 统一、高质量、符合设计规范
```

---

**关键词优化是保证视觉质量的核心！** 🎨
