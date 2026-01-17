# VidSlide AI - Remotion 视频模板系统

## 📋 项目说明

这是一个基于 Remotion 的视频模板渲染系统，可以生成专业级的视频效果。

## 🎯 已实现的模板

### 1. ProductShowcase（产品展示）
- **效果**：3D 卡片堆叠、透视、阴影
- **适用场景**：产品展示、特性介绍
- **参数**：
  - `title`: 主标题
  - `subtitle`: 副标题
  - `images`: 图片数组（最多3张）
  - `brandColor`: 品牌颜色

### 2. SplitComparison（分屏对比）
- **效果**：左右分屏、VS 标识、对比动画
- **适用场景**：前后对比、优劣对比
- **参数**：
  - `leftTitle`: 左侧标题
  - `rightTitle`: 右侧标题
  - `leftImage`: 左侧图片
  - `rightImage`: 右侧图片
  - `leftColor`: 左侧颜色
  - `rightColor`: 右侧颜色

## 🚀 使用方法

### 方式1：可视化预览（推荐用于开发）

```bash
cd remotion-templates
npm start
```

这会启动 Remotion Studio，你可以在浏览器中实时预览和调整模板效果。

### 方式2：渲染服务器（用于生产环境）

#### 快速启动
```bash
cd remotion-templates
./start-server.sh
```

服务器会在 `http://localhost:3002` 启动。

#### 手动启动
```bash
cd remotion-templates
node server.js
```

#### 测试服务器
```bash
cd remotion-templates
./test-server.sh
```

#### API 使用示例

**渲染视频：**
```bash
curl -X POST http://localhost:3002/render \
  -H "Content-Type: application/json" \
  -d '{
    "template": "ProductShowcase",
    "props": {
      "title": "革命性产品",
      "subtitle": "改变世界的创新",
      "brandColor": "#007AFF"
    }
  }'
```

**获取模板列表：**
```bash
curl http://localhost:3002/templates
```

## 🔗 集成到 Vue 项目

在你的 Vue 项目中调用渲染服务：

```javascript
// vidslide-ai/src/services/RemotionService.js
export class RemotionService {
  constructor() {
    this.baseURL = 'http://localhost:3002'
  }

  async renderVideo(template, props) {
    const response = await fetch(`${this.baseURL}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ template, props }),
    })

    return response.json()
  }

  async getTemplates() {
    const response = await fetch(`${this.baseURL}/templates`)
    return response.json()
  }
}

// 使用示例
const remotionService = new RemotionService()

const result = await remotionService.renderVideo('ProductShowcase', {
  title: userContent.text,
  images: userContent.images,
  brandColor: '#007AFF',
})

console.log('视频已生成:', result.outputPath)
```

## 📦 项目结构

```
remotion-templates/
├── src/
│   ├── templates/           # 模板组件
│   │   ├── ProductShowcase.jsx
│   │   └── SplitComparison.jsx
│   ├── Root.jsx            # 主入口
│   └── index.jsx           # 注册入口
├── public/
│   └── index.html
├── output/                 # 渲染输出目录
├── server.js              # 渲染服务器
├── remotion.config.js     # Remotion 配置
└── package.json

```

## 🎨 添加新模板

1. 在 `src/templates/` 创建新组件：

```jsx
// src/templates/MyTemplate.jsx
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const MyTemplate = ({ title }) => {
  const frame = useCurrentFrame();

  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
};
```

2. 在 `src/Root.jsx` 注册：

```jsx
import { MyTemplate } from './templates/MyTemplate';

<Composition
  id="MyTemplate"
  component={MyTemplate}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{
    title: '默认标题',
  }}
/>
```

## 🔧 配置说明

### 视频参数
- **分辨率**：1920x1080 (Full HD)
- **帧率**：30 FPS
- **时长**：150 帧（5秒）
- **编码**：H.264
- **质量**：90%

### 性能优化
- 并发渲染：4 线程
- 图片格式：JPEG
- 自动覆盖输出

## 📊 与参考图片的对比

### ProductShowcase 模板
- ✅ 3D 卡片堆叠效果
- ✅ 透视和景深
- ✅ 阴影和光效
- ✅ 动画入场效果
- ✅ 渐变背景

### SplitComparison 模板
- ✅ 左右分屏
- ✅ VS 标识动画
- ✅ 对比色彩
- ✅ 滑入动画
- ✅ 中间分割线

## 🎯 下一步计划

1. 添加更多模板（目标 20-30 个）
2. 实现关键词匹配系统
3. 优化渲染性能
4. 添加模板预览缩略图
5. 支持自定义字体和素材

## 💡 技术优势

- ✅ 100% 可编程，完全可控
- ✅ 支持所有 CSS、Three.js 效果
- ✅ 渲染质量专业级
- ✅ 可以实现参考图片中 95% 的效果
- ✅ 开源免费（开发阶段）
- ✅ 可自己部署，无外部依赖

## 📝 注意事项

1. 首次运行会比较慢（需要打包项目）
2. 渲染视频需要一定时间（1-5分钟/视频）
3. 确保有足够的磁盘空间存储输出视频
4. 商业使用需要购买 Remotion 许可证（$15/月）
