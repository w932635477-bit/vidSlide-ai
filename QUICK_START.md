# VidSlide AI - 快速启动指南

## 🎉 设计已完成

首页和工作页面已经按照苹果设计标准重新设计完成！

## 🚀 启动项目

### 1. 安装依赖（如果还没安装）

```bash
cd vidslide-ai
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:5173 启动

### 3. 构建生产版本

```bash
npm run build
```

构建文件将输出到 `dist/` 目录

## 📱 查看效果

### 首页
- 访问: http://localhost:5173/
- 特点:
  - 全屏动态渐变背景（临时替代视频）
  - 苹果风格浮动导航栏
  - Bento Grid 功能展示
  - 响应式设计

### 工作页面
- 访问: http://localhost:5173/workspace
- 特点:
  - 专业深色主题
  - 三栏布局（工具栏 + 编辑区 + 属性面板）
  - 时间线编辑器
  - macOS 风格界面

## 🎨 设计特点

✅ **苹果设计标准**
- 圆角系统: 8px / 12px / 16px / 24px
- 毛玻璃效果: backdrop-filter
- 优雅字体: Playfair Display + Inter
- 柔和阴影: 多层次阴影系统

✅ **大气高级感**
- 动态渐变背景
- 大标题 (48-72px)
- 充足留白
- 精致细节

✅ **信任感强**
- 清晰的价值主张
- 数据指标展示
- 专业的视觉设计
- 无AI味道（纯SVG图标）

✅ **响应式设计**
- 桌面端 (>1024px) - 完整布局
- 平板端 (768-1024px) - 简化布局
- 移动端 (<768px) - 单栏布局

## 📝 关键文件

```
vidslide-ai/
├── src/
│   ├── views/
│   │   ├── HomeView.vue              # 首页
│   │   └── VideoEditorView.vue       # 工作页面
│   └── styles/
│       ├── home-apple-style.css      # 首页样式
│       └── workspace-apple-style.css # 工作页面样式
└── public/
    └── assets/
        └── README.md                  # 资源文件说明
```

## 🎥 添加演示视频（可选）

如果您想使用真实视频替代渐变背景：

1. 准备视频文件:
   - `hero-demo.mp4` (1920x1080, <5MB)
   - `hero-poster.jpg` (视频海报)

2. 放置到: `vidslide-ai/public/assets/`

3. 修改 `HomeView.vue` 第78-81行:
   ```vue
   <!-- 替换渐变背景为视频 -->
   <video
     class="hero-video"
     autoplay
     muted
     loop
     playsinline
     poster="/assets/hero-poster.jpg"
   >
     <source src="/assets/hero-demo.mp4" type="video/mp4">
   </video>
   ```

## 🐛 常见问题

### Q: 页面显示空白？
A: 检查浏览器控制台是否有错误，确保所有依赖已安装

### Q: 样式没有生效？
A: 清除浏览器缓存，或使用无痕模式访问

### Q: 构建失败？
A: 运行 `npm install` 重新安装依赖

### Q: 端口被占用？
A: 修改 `vite.config.js` 中的端口号

## 📚 更多文档

- [完整设计报告](../DESIGN_REPORT.md)
- [资源文件说明](../vidslide-ai/public/assets/README.md)
- [项目需求文档](../vidslide-ai/v0-template-requirements.md)

## 🎯 下一步

1. ✅ 首页设计完成
2. ✅ 工作页面设计完成
3. ⏳ 添加演示视频（可选）
4. ⏳ 实现视频上传功能
5. ⏳ 实现模板切换功能
6. ⏳ 实现时间线编辑功能

---

**设计完成时间**: 2026-01-14
**技术栈**: Vue 3 + Vite + Element Plus
**设计风格**: Apple Design System
