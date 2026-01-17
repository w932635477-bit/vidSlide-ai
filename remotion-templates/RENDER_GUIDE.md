# 🎬 模板渲染指南

## 当前状态

正在下载 Chrome Headless Shell（首次运行需要，约 85MB）...

下载完成后会自动开始渲染。

---

## 🚀 更快的方法：使用 Remotion Studio 手动导出

### 步骤：

1. **打开浏览器**
   访问：http://localhost:3001

2. **选择模板**
   在左侧列表中点击以下模板：
   - GlassmorphismStack（磨砂玻璃）
   - LuxuryProductShowcase（金色奢华）
   - PremiumSplitScreen（高级分屏）
   - GlowingText（发光文字）
   - ParticleExplosion（粒子爆炸）

3. **导出视频**
   - 点击右上角的 **"Render"** 按钮
   - 在弹出的对话框中：
     - Codec: 选择 "H264"
     - Quality: 保持默认
     - 点击 "Render" 开始

4. **等待渲染**
   - 每个视频约需 1-3 分钟
   - 渲染完成后会自动下载

5. **查看效果**
   - 视频会下载到你的下载文件夹
   - 或者保存在 `remotion-templates/output/` 目录

---

## 📊 推荐渲染顺序

### 1. GlassmorphismStack（必看）⭐⭐⭐⭐⭐
**特点**：
- 磨砂玻璃效果
- 多层阴影
- 双边框
- 3D 卡片堆叠

**参数建议**：
- title: "高级产品展示"
- subtitle: "磨砂玻璃质感"
- brandColor: "#007AFF"

### 2. LuxuryProductShowcase（必看）⭐⭐⭐⭐⭐
**特点**：
- 金色光泽
- 奢华渐变
- 精致阴影
- 装饰线条

**参数建议**：
- title: "奢华系列"
- subtitle: "尊贵品质"
- accentColor: "#FFD700"

### 3. PremiumSplitScreen（必看）⭐⭐⭐⭐⭐
**特点**：
- 磨砂分割线
- 高级分屏
- 对比动画

**参数建议**：
- title: "高级对比"
- leftTitle: "传统方案"
- rightTitle: "创新方案"

### 4. GlowingText（推荐）⭐⭐⭐⭐
**特点**：
- 霓虹发光
- 光晕扩散
- 渐变色彩

**参数建议**：
- title: "发光文字效果"
- brandColor: "#FD79A8"

### 5. ParticleExplosion（推荐）⭐⭐⭐⭐
**特点**：
- 粒子系统
- 爆炸效果
- 光点飞散

**参数建议**：
- title: "粒子特效"
- brandColor: "#FF7675"

---

## 🎨 如何在 Studio 中调整参数

1. 选择模板后，右侧会显示参数面板
2. 可以修改：
   - **title**: 主标题文字
   - **subtitle**: 副标题文字
   - **brandColor**: 品牌颜色（输入颜色代码，如 #007AFF）
   - **images**: 图片数组（暂时留空，使用默认占位符）

3. 修改后实时预览
4. 满意后点击 Render 导出

---

## 💡 提示

### 如果想添加自己的图片
在参数面板的 `images` 字段中，输入图片路径：
```json
[
  "/Users/weilei/Desktop/隔空投送/IMG_3620 2.PNG",
  "/Users/weilei/Desktop/隔空投送/IMG_3630 2.PNG",
  "/Users/weilei/Desktop/隔空投送/IMG_3640 2.PNG"
]
```

### 如果想修改视频时长
在 Studio 中无法修改，需要在代码中修改 `durationInFrames`：
- 150 帧 = 5 秒（30fps）
- 90 帧 = 3 秒
- 300 帧 = 10 秒

---

## 📁 输出位置

渲染的视频会保存在：
- **Studio 导出**：下载文件夹
- **命令行渲染**：`remotion-templates/output/`

---

## ⏱️ 预计时间

- 下载 Chrome Headless Shell：3-5 分钟（仅首次）
- 每个视频渲染：1-3 分钟
- 总计 5 个视频：约 10-15 分钟

---

**🎬 现在就去 http://localhost:3001 开始导出吧！**
