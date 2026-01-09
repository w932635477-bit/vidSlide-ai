# 🎨 如何从HTML导出VidSlide AI苹果风格PNG模板

## 📁 文件位置
`placeholder-templates.html` 已经创建完成！

## 🚀 导出PNG的3种方法

### 方法1: 开发者工具截图 ⭐⭐⭐ (推荐 - 最精确)

1. **打开HTML文件**
   ```bash
   # 在浏览器中打开
   open "/Users/weilei/VidSlide AI/placeholder-templates.html"
   # 或者直接在Finder中双击文件
   ```

2. **按F12打开开发者工具**
   - Chrome/Safari: 按 **F12** 或 **右键 → 检查**
   - 切换到 **"Elements"** 标签

3. **选择模板元素**
   - 在HTML结构中找到 `<div class="template pip-template">`
   - 右键点击这个元素

4. **截图导出**
   - 选择 **"Capture node screenshot"**
   - 自动保存为PNG文件

5. **重命名文件**
   - `Capture 1.png` → `vidSlide-pip-template.png`
   - `Capture 2.png` → `vidSlide-info-card-template.png`
   - 依此类推...

### 方法2: 浏览器截图 ⭐⭐ (简单快捷)

1. **打开HTML文件** 在浏览器中

2. **调整页面**
   - 按 **Ctrl+0** (Windows) 或 **Cmd+0** (Mac) 恢复100%缩放
   - 确保页面完整显示

3. **截图每个模板**
   - **Mac**: Cmd+Shift+4，拖拽选择模板区域
   - **Windows**: Win+Shift+S，选择区域
   - **Chrome**: Ctrl+Shift+P → "截取区域截图"

4. **保存并重命名**
   - 保存为PNG格式
   - 重命名为正确的模板名称

### 方法3: 全页截图后裁剪 ⭐ (一次性完成)

1. **Chrome浏览器截图**
   - 按 **Ctrl+Shift+P** (Cmd+Shift+P on Mac)
   - 输入 "截取全页截图" 或 "Capture full size screenshot"
   - 保存完整页面

2. **使用图片编辑软件裁剪**
   - PhotoShop、Preview、Paint等
   - 裁剪每个1920x1080的模板区域
   - 保存为单独的PNG文件

## 📋 需要导出的10个PNG文件

### 模板文件 (5个):
```
✅ vidSlide-pip-template.png           - 画中画模板
✅ vidSlide-info-card-template.png     - 信息卡片模板
✅ vidSlide-keyword-highlight-template.png - 关键词高亮模板
✅ vidSlide-document-display-template.png - 文件展示模板
✅ vidSlide-title-text-template.png     - 标题文字模板
```

### 组件文件 (2个):
```
✅ vidSlide-property-panel.png         - 属性面板
✅ vidSlide-timeline-editor.png        - 时间轴编辑器
```

### 响应式文件 (3个):
```
✅ vidSlide-templates-desktop.png      - 桌面版本
✅ vidSlide-templates-tablet.png       - 平板版本
✅ vidSlide-templates-mobile.png       - 手机版本
```

## 🎯 质量检查标准

### ✅ 导出要求:
- **分辨率**: 保持原始尺寸 (1920x1080)
- **格式**: PNG-24 (支持透明背景)
- **质量**: 无压缩损失
- **颜色**: 金色 #FFD700 正确保留

### ✅ 设计特点:
- **苹果风格**: 圆角设计、优雅阴影
- **专业布局**: 清晰的视觉层次
- **占位内容**: 符合VidSlide AI定位

## 📤 导出完成后

1. **复制到正确目录**
   ```bash
   cp *.png /Users/weilei/VidSlide\ AI/v0-design-exports/templates/
   cp property-panel.png timeline-editor.png /Users/weilei/VidSlide\ AI/v0-design-exports/components/
   cp desktop.png tablet.png mobile.png /Users/weilei/VidSlide\ AI/v0-design-exports/responsive/
   ```

2. **验证文件**
   ```bash
   cd "/Users/weilei/VidSlide AI"
   ./auto-download-v0-designs.sh
   ```

3. **上传到GitHub**
   - 访问你的v0-vid-slide-ai-apple-style-templates仓库
   - 上传所有PNG文件

## 🎉 完成标志

当你拥有10个PNG文件时:
- ✅ 可以立即开始VidSlide AI的UI集成开发
- ✅ 所有文件符合苹果设计规范
- ✅ 为后续真实设计替换做好准备

**开始导出PNG文件吧！推荐使用方法1（开发者工具），最精确！** 🎨✨

---

**提示**: 如果HTML页面显示不完整，请刷新页面或调整浏览器窗口大小。
