# VidSlide AI

> 智能视频动态叙事系统 - 基于AI的自动化视频制作工具

[![Tests](https://img.shields.io/badge/tests-99%25%20passing-brightgreen)](./src/tests)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](./package.json)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## ✨ 特性

- 🤖 **智能叙事检测** - 自动识别4种叙事模式
- 🎨 **AI素材生成** - 豆包AI驱动的图片生成
- 🎬 **专业视频渲染** - FFmpeg多层合成和动画效果
- 📊 **完整测试覆盖** - 99个测试用例，99%通过率
- 🚀 **高性能** - 支持并发处理和缓存优化
- 📖 **完善文档** - API文档、部署指南、使用示例

## 🚀 快速开始

### 安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的API密钥
```

### 使用

```javascript
import MasterPipeline from './src/services/MasterPipeline.js'

// 创建主流程实例
const pipeline = new MasterPipeline()

// 执行完整流程
const result = await pipeline.run(
  '/path/to/video.mp4',
  '/path/to/audio.wav',
  '/path/to/output.mp4'
)

console.log('视频生成成功:', result.outputPath)
```

## 📚 文档

- [API使用文档](./API_DOCUMENTATION.md) - 详细的API参考和使用示例
- [部署指南](./DEPLOYMENT_GUIDE.md) - 生产环境部署说明
- [项目总结](./PROJECT_SUMMARY.md) - 完整的项目总结报告

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    MasterPipeline                        │
│                  (主流程控制器)                           │
└─────────────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────┼───────────────────────┐
    ↓                       ↓                       ↓
┌─────────┐         ┌─────────────┐         ┌─────────────┐
│ Content │  →      │  Narrative  │  →      │   Asset     │
│Analyzer │         │  Detector   │         │ Generator   │
└─────────┘         └─────────────┘         └─────────────┘
    ↓                                               ↓
┌─────────────┐                             ┌─────────────┐
│  Timeline   │  ←──────────────────────────│   Video     │
│ Generator   │  ──────────────────────────→│  Renderer   │
└─────────────┘                             └─────────────┘
```

## 🎯 核心功能

### 叙事模式

- **Sequential Reveal** - 顺序揭示（悬念→揭示循环）
- **Comparison** - 对比（左右对比布局）
- **Timeline** - 时间线（时间顺序展示）
- **Basic** - 基础（默认模式）

### 动画效果

- 淡入淡出（Fade）
- 翻转（Flip）
- 缩放（Scale）
- 滑动（Slide）

### AI集成

- 百度NLP - 关键词提取
- 文心一言 - 语义分析
- 豆包AI - 图片生成

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- src/tests/unit1-environment.test.js

# 运行性能测试
npm test -- src/tests/performance.test.js
```

### 测试结果

| 测试类型 | 数量 | 通过率 |
|---------|------|--------|
| 单元测试 | 89个 | 100% |
| 性能测试 | 10个 | 90% |
| **总计** | **99个** | **99%** |

## 📊 性能指标

| 指标 | 数值 |
|------|------|
| 单张图片生成 | 19.92秒 |
| 并发3张图片 | 21.54秒（平均7.18秒/张） |
| 批量生成5张 | 67.28秒（平均13.46秒/张） |
| 流程性能（无API） | <1ms |
| 内存使用（1000次） | <100MB |

## 🛠️ 技术栈

- **语言**: JavaScript (ES6+)
- **运行时**: Node.js v18+
- **测试**: Vitest
- **视频处理**: FFmpeg
- **AI服务**: 百度NLP、文心一言、豆包AI

## 📦 项目结构

```
vidslide-ai/
├── src/
│   ├── services/          # 核心服务模块
│   │   ├── MasterPipeline.js
│   │   ├── HybridContentAnalyzer.js
│   │   ├── SimpleNarrativeDetector.js
│   │   ├── VisualAssetGenerator.js
│   │   ├── PracticalTimelineGenerator.js
│   │   └── EnhancedVideoRenderer.js
│   ├── data/              # 数据文件
│   │   └── conceptLibrary.json
│   ├── tests/             # 测试文件
│   └── output/            # 输出目录
├── docs/                  # 文档
├── API_DOCUMENTATION.md   # API文档
├── DEPLOYMENT_GUIDE.md    # 部署指南
├── PROJECT_SUMMARY.md     # 项目总结
└── README.md              # 本文件
```

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证

## 🙏 致谢

- [FFmpeg](https://ffmpeg.org/) - 视频处理
- [Vitest](https://vitest.dev/) - 测试框架
- [百度AI](https://ai.baidu.com/) - NLP服务
- [豆包AI](https://www.volcengine.com/) - 图片生成

---

**VidSlide AI** - 让视频制作更智能 🎬✨
