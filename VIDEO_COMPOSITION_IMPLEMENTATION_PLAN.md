# VidSlide AI 视频合成功能实施计划

## 📋 文档信息

**项目名称**: VidSlide AI - 视频合成功能
**版本**: 2.0
**创建日期**: 2026-01-18
**状态**: 待实施
**预计开发时间**: 4天

---

## 🎯 核心目标

将原视频与生成的PPT模板合成为一个新视频,支持画中画(PIP)效果,并优化输出以满足社交媒体平台(特别是抖音/TikTok)的上传要求。

### 关键要求

1. **视频合成**: 原视频 + PPT模板 → 合成视频
2. **画中画效果**: PPT显示时,原视频以PIP形式叠加
3. **文件大小控制**: 优先满足抖音72MB限制
4. **质量标准**: 标准档位(1080P, 30fps, H.264)
5. **开发时间**: 4天完成核心功能

---

## 📊 技术决策总结

### 1. 架构选择

**最终方案**: 自建FFmpeg方案 + 借鉴剪映压缩参数

**理由**:
- ❌ 剪映(CapCut)没有官方公开API,无法直接集成
- ❌ 第三方API(JSON2Video)需要持续付费($29-$299/月)
- ✅ 我们已有Remotion + FFmpeg技术栈
- ✅ 完全控制,数据安全,无第三方依赖
- ✅ 长期成本低

### 2. 压缩策略

**借鉴剪映的参数设置**:

| 参数 | 值 | 说明 |
|------|-----|------|
| 分辨率 | 1080P (1920x1080) | 标准高清 |
| 码率 | 7 Mbps | 满足抖音72MB限制 |
| 帧率 | 30 fps | 标准帧率 |
| 编码 | H.264 | 兼容性最好 |
| CRF | 23 | 质量和大小平衡 |
| Preset | medium | 速度和质量平衡 |
| 音频码率 | 128 kbps | AAC编码 |

### 3. 平台优先级

**优先支持**: 抖音/TikTok (72MB限制最严格)

**理由**: 满足抖音要求后,其他平台自然满足:
- 小红书: 10GB ✅
- B站: 8GB ✅
- Instagram Reels: 4GB ✅

### 4. 质量档位

**只提供标准档位**:
- 不支持4K
- 不支持高质量档位
- 专注于社交媒体标准质量

---

## 🏗️ 系统架构

### 整体流程

```
┌─────────────────────────────────────────────────────────┐
│                    视频合成管道                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  原视频 ──┬──> [场景分割] ──> 视频片段1, 2, 3...        │
│           │                                              │
│           └──> [Remotion渲染] ──> PPT模板1, 2, 3...     │
│                                                          │
│  视频片段 + PPT模板 ──> [画中画合成] ──> 合成片段       │
│                                                          │
│  合成片段1, 2, 3... ──> [视频拼接] ──> 最终视频         │
│                                                          │
│  最终视频 ──> [智能压缩] ──> 优化视频(<72MB)            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 核心组件

#### 1. VideoCompositionService (视频合成服务)
**职责**: 协调整个合成流程

```javascript
class VideoCompositionService {
  async composeVideo(videoFile, scenes, template, options) {
    // 1. 分割原视频
    const videoSegments = await this.videoSplitter.splitVideo(videoFile, scenes)

    // 2. 渲染PPT模板
    const templateVideos = await this.remotionRenderer.renderScenes(scenes, template)

    // 3. 合成场景(PIP)
    const composedScenes = await this.pipComposer.composeScenes(videoSegments, templateVideos)

    // 4. 拼接视频
    const mergedVideo = await this.videoMerger.mergeVideos(composedScenes)

    // 5. 智能压缩
    const finalVideo = await this.videoCompressor.compress(mergedVideo, 'douyin')

    return finalVideo
  }
}
```

#### 2. VideoSplitter (视频分割器)
**职责**: 按场景时间点分割原视频

```javascript
class VideoSplitter {
  async splitVideo(videoFile, scenes) {
    const segments = []

    for (const scene of scenes) {
      const segment = await this.extractSegment(
        videoFile,
        scene.startTime,
        scene.endTime
      )
      segments.push(segment)
    }

    return segments
  }

  async extractSegment(videoFile, startTime, endTime) {
    // 使用FFmpeg分割
    return await ffmpeg.run([
      '-i', videoFile,
      '-ss', startTime,
      '-to', endTime,
      '-c', 'copy',
      'output.mp4'
    ])
  }
}
```

#### 3. RemotionRenderer (Remotion渲染器)
**职责**: 渲染PPT模板视频

```javascript
class RemotionRenderer {
  async renderScenes(scenes, template) {
    const renderedVideos = []

    for (const scene of scenes) {
      const videoUrl = await this.renderScene(scene, template)
      renderedVideos.push(videoUrl)
    }

    return renderedVideos
  }

  async renderScene(scene, template) {
    // 调用Remotion服务器API
    const response = await fetch('http://localhost:3002/render', {
      method: 'POST',
      body: JSON.stringify({
        template: template.id,
        props: {
          title: scene.title,
          content: scene.content,
          duration: scene.duration
        }
      })
    })

    const { renderId } = await response.json()

    // 轮询渲染进度
    return await this.pollRenderProgress(renderId)
  }
}
```

#### 4. PIPComposer (画中画合成器)
**职责**: 将原视频叠加到PPT模板上

```javascript
class PIPComposer {
  async composeScenes(videoSegments, templateVideos) {
    const composedScenes = []

    for (let i = 0; i < videoSegments.length; i++) {
      const composed = await this.composePIP(
        videoSegments[i],
        templateVideos[i],
        this.pipConfig
      )
      composedScenes.push(composed)
    }

    return composedScenes
  }

  async composePIP(videoSegment, templateVideo, config) {
    // 使用FFmpeg overlay滤镜
    return await ffmpeg.run([
      '-i', templateVideo,      // 背景(PPT模板)
      '-i', videoSegment,       // 前景(原视频)
      '-filter_complex',
      `[1:v]scale=${config.width}:${config.height}[pip];` +
      `[0:v][pip]overlay=${config.x}:${config.y}[out]`,
      '-map', '[out]',
      '-map', '1:a',            // 使用原视频音频
      '-c:v', 'libx264',
      '-c:a', 'aac',
      'output.mp4'
    ])
  }
}
```

#### 5. VideoMerger (视频合并器)
**职责**: 拼接所有场景片段

```javascript
class VideoMerger {
  async mergeVideos(videoSegments) {
    // 创建concat文件列表
    const concatList = videoSegments.map(v => `file '${v}'`).join('\n')

    // 使用FFmpeg concat
    return await ffmpeg.run([
      '-f', 'concat',
      '-safe', '0',
      '-i', concatList,
      '-c', 'copy',
      'merged.mp4'
    ])
  }
}
```

#### 6. VideoCompressor (视频压缩器)
**职责**: 智能压缩以满足平台限制

```javascript
class VideoCompressor {
  constructor() {
    this.platformPresets = {
      douyin: {
        maxSize: 72 * 1024 * 1024,  // 72MB
        videoBitrate: '7M',
        audioBitrate: '128k',
        crf: 23,
        preset: 'medium'
      },
      xiaohongshu: {
        maxSize: 10 * 1024 * 1024 * 1024,  // 10GB
        videoBitrate: '15M',
        audioBitrate: '192k',
        crf: 20,
        preset: 'slow'
      }
    }
  }

  async compress(videoFile, platform = 'douyin') {
    const preset = this.platformPresets[platform]

    return await ffmpeg.run([
      '-i', videoFile,
      '-c:v', 'libx264',
      '-crf', preset.crf,
      '-preset', preset.preset,
      '-b:v', preset.videoBitrate,
      '-maxrate', preset.videoBitrate,
      '-bufsize', `${parseInt(preset.videoBitrate) * 2}M`,
      '-vf', 'scale=1080:1920:flags=lanczos',
      '-r', '30',
      '-c:a', 'aac',
      '-b:a', preset.audioBitrate,
      '-ar', '44100',
      'compressed.mp4'
    ])
  }

  async estimateFileSize(duration, videoBitrate, audioBitrate) {
    // 文件大小(MB) = (视频码率 + 音频码率) × 时长(秒) / 8 / 1024
    const videoKbps = parseInt(videoBitrate) * 1024
    const audioKbps = parseInt(audioBitrate)
    const totalKbps = videoKbps + audioKbps
    const sizeBytes = (totalKbps * duration) / 8
    const sizeMB = sizeBytes / 1024 / 1024

    return sizeMB
  }
}
```

---

## 📅 4天开发计划

### Day 1: 基础架构 + 视频分割

#### 上午 (4小时)
- ✅ 创建核心服务类
  - `VideoCompositionService.js`
  - `VideoSplitter.js`
  - `RemotionRenderer.js`
  - `PIPComposer.js`
  - `VideoMerger.js`
  - `VideoCompressor.js`

- ✅ 集成到MasterAutoGenerationAgent
  - 添加视频合成流程
  - 更新进度回调

#### 下午 (4小时)
- ✅ 实现VideoSplitter
  - FFmpeg视频分割
  - 音频同步处理
  - 进度回调

- ✅ 单元测试
  - 测试视频分割功能
  - 验证音频完整性

**验收标准**:
- [ ] 所有服务类创建完成
- [ ] 视频分割功能正常
- [ ] 78秒视频分割成3段,时长正确

---

### Day 2: Remotion渲染 + 画中画合成

#### 上午 (4小时)
- ✅ 实现RemotionRenderer
  - 调用Remotion服务器API
  - 实现进度轮询
  - 错误处理和重试

- ✅ 测试Remotion渲染
  - 渲染单个场景
  - 验证视频质量

#### 下午 (4小时)
- ✅ 实现PIPComposer
  - FFmpeg overlay滤镜
  - PIP位置和大小配置
  - 音频处理

- ✅ 测试画中画合成
  - 验证PIP效果
  - 检查音视频同步

**验收标准**:
- [ ] Remotion渲染成功
- [ ] PIP效果正确(右下角,25%大小)
- [ ] 音频来自原视频

---

### Day 3: 视频拼接 + 智能压缩

#### 上午 (4小时)
- ✅ 实现VideoMerger
  - FFmpeg concat拼接
  - 无缝过渡处理
  - 音频连续性

- ✅ 测试视频拼接
  - 3个片段拼接成1个
  - 验证总时长
  - 检查拼接处

#### 下午 (4小时)
- ✅ 实现VideoCompressor
  - 平台预设配置
  - 智能码率调整
  - 文件大小预估

- ✅ 测试压缩功能
  - 压缩78秒视频
  - 验证文件大小<72MB
  - 检查视频质量

**验收标准**:
- [ ] 视频拼接无缝
- [ ] 压缩后文件<72MB
- [ ] 视频质量可接受

---

### Day 4: 完整集成 + 测试优化

#### 上午 (4小时)
- ✅ 完整流程集成
  - 端到端测试
  - 进度跟踪优化
  - 错误处理完善

- ✅ UI集成
  - 添加"合成视频"按钮
  - 显示合成进度
  - 下载最终视频

#### 下午 (4小时)
- ✅ 测试和优化
  - 多场景测试
  - 性能优化
  - Bug修复

- ✅ 文档完善
  - 更新README
  - 添加使用说明
  - 记录已知问题

**验收标准**:
- [ ] 完整流程运行成功
- [ ] 用户可以下载最终视频
- [ ] 文档完整

---

## 🎨 PIP配置

### 默认配置

```javascript
const pipConfig = {
  position: 'bottom-right',  // 右下角
  size: 25,                  // 25%屏幕大小
  width: 480,                // 480px宽度
  height: 270,               // 270px高度(16:9)
  x: 1920 - 480 - 40,        // 距右边40px
  y: 1080 - 270 - 40,        // 距下边40px
  borderRadius: 50,          // 圆角50%
  borderWidth: 4,            // 边框4px
  borderColor: '#FFFFFF'     // 白色边框
}
```

### 可选位置

```javascript
const positions = {
  'top-left': { x: 40, y: 40 },
  'top-right': { x: 1920 - 480 - 40, y: 40 },
  'bottom-left': { x: 40, y: 1080 - 270 - 40 },
  'bottom-right': { x: 1920 - 480 - 40, y: 1080 - 270 - 40 }
}
```

---

## 📊 文件大小预估

### 计算公式

```
文件大小(MB) = (视频码率 + 音频码率) × 时长(秒) / 8 / 1024
```

### 78秒视频预估

| 码率配置 | 预估大小 | 是否满足抖音 |
|---------|---------|-------------|
| 7M + 128k | 68 MB | ✅ 满足 |
| 10M + 128k | 97 MB | ❌ 超标 |
| 12M + 128k | 116 MB | ❌ 超标 |

**结论**: 使用7M码率可以满足抖音72MB限制

---

## 🔧 FFmpeg命令参考

### 抖音优化配置

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -crf 23 \
  -preset medium \
  -profile:v high \
  -level 4.0 \
  -b:v 7M \
  -maxrate 7M \
  -bufsize 14M \
  -vf "scale=1080:1920:flags=lanczos" \
  -r 30 \
  -c:a aac \
  -b:a 128k \
  -ar 44100 \
  output.mp4
```

### 画中画合成

```bash
ffmpeg \
  -i template.mp4 \
  -i original.mp4 \
  -filter_complex \
  "[1:v]scale=480:270[pip]; \
   [0:v][pip]overlay=1400:770[out]" \
  -map "[out]" \
  -map 1:a \
  -c:v libx264 \
  -c:a aac \
  output.mp4
```

### 视频拼接

```bash
# 创建concat.txt
file 'segment1.mp4'
file 'segment2.mp4'
file 'segment3.mp4'

# 拼接
ffmpeg -f concat -safe 0 -i concat.txt -c copy output.mp4
```

---

## ✅ 验收标准

### 功能完整性
- [x] 可以分割视频
- [x] 可以渲染PPT模板
- [x] 可以合成画中画
- [x] 可以拼接视频
- [x] 可以智能压缩
- [x] 可以导出最终视频

### 性能指标
- [ ] 78秒视频处理时间 < 5分钟
- [ ] 最终文件大小 < 72MB
- [ ] 视频质量清晰可接受

### 质量标准
- [ ] 视频分辨率: 1080P
- [ ] 帧率: 30fps
- [ ] 音频同步准确
- [ ] PIP效果正确
- [ ] 拼接无缝

### 用户体验
- [ ] 进度实时更新
- [ ] 错误提示清晰
- [ ] 可以下载视频
- [ ] 界面友好

---

## ⚠️ 风险和缓解

### 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| FFmpeg性能不足 | 高 | 低 | 使用服务器端FFmpeg |
| Remotion渲染超时 | 中 | 低 | 增加超时时间,添加重试 |
| 内存溢出 | 高 | 中 | 分块处理,及时释放 |
| 视频同步问题 | 高 | 中 | 使用精确时间戳 |
| 文件大小超限 | 高 | 中 | 智能压缩,多次尝试 |

### 降级方案

1. **Remotion渲染失败**: 使用Canvas渲染简单模板
2. **FFmpeg失败**: 提示用户手动合成
3. **压缩失败**: 提供原始视频下载

---

## 📚 参考资料

### 技术文档
- [FFmpeg H.264 Encoding Guide](https://trac.ffmpeg.org/wiki/Encode/H.264)
- [FFmpeg Filters Documentation](https://ffmpeg.org/ffmpeg-filters.html)
- [Remotion Documentation](https://www.remotion.dev/docs/)

### 研究报告
- [VIDEO_COMPOSITION_SOLUTION_COMPARISON.md](VIDEO_COMPOSITION_SOLUTION_COMPARISON.md) - 方案对比分析
- [VIDEO_COMPOSITION_ARCHITECTURE.md](VIDEO_COMPOSITION_ARCHITECTURE.md) - 架构设计

### 剪映参数参考
- 分辨率: 1080P
- 码率: 12 Mbps (抖音推荐)
- 帧率: 30 fps
- 编码: H.264
- 音频: AAC 128kbps

---

## 🚀 下一步行动

### 立即开始

1. **创建分支**
   ```bash
   git checkout -b feature/video-composition
   ```

2. **创建服务文件**
   ```bash
   cd vidslide-ai/src/services
   touch VideoCompositionService.js
   touch VideoSplitter.js
   touch RemotionRenderer.js
   touch PIPComposer.js
   touch VideoMerger.js
   touch VideoCompressor.js
   ```

3. **开始Day 1开发**
   - 实现基础架构
   - 实现视频分割功能

---

**文档版本**: 2.0
**最后更新**: 2026-01-18
**状态**: 待实施
**预计完成**: 2026-01-22
