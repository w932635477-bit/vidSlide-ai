# VidSlide AI 资源文件说明

## 需要添加的资源文件

为了完整展示首页效果，请在此目录下添加以下文件：

### 1. 首页英雄区域视频
- **文件名**: `hero-demo.mp4`
- **建议内容**: 展示 VidSlide AI 将口播视频转换为 PPT 的过程
- **建议时长**: 10-15秒
- **建议尺寸**: 1920x1080 (Full HD)
- **建议格式**: MP4 (H.264编码)
- **建议大小**: < 5MB (优化后)

### 2. 视频海报图片
- **文件名**: `hero-poster.jpg`
- **建议内容**: 视频的第一帧或代表性画面
- **建议尺寸**: 1920x1080
- **建议格式**: JPG
- **建议大小**: < 500KB

## 临时替代方案

如果暂时没有视频文件，可以：

1. **使用纯色背景**：在 CSS 中将视频容器改为渐变背景
2. **使用静态图片**：将 `<video>` 标签替换为 `<img>` 标签
3. **使用占位视频**：从免费视频网站下载相关主题的视频

## 推荐的免费视频资源网站

- Pexels Videos: https://www.pexels.com/videos/
- Pixabay Videos: https://pixabay.com/videos/
- Coverr: https://coverr.co/

搜索关键词：
- "presentation"
- "video editing"
- "technology"
- "workspace"
- "creative work"

## 视频优化建议

使用 FFmpeg 优化视频大小：

```bash
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 2M -b:a 128k -vf scale=1920:1080 hero-demo.mp4
```

## 当前状态

✅ 首页设计完成 - 苹果风格全屏视频背景
✅ 工作页面设计完成 - 专业编辑器界面
⏳ 等待添加演示视频和海报图片
