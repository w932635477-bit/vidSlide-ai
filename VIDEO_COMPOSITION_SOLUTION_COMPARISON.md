# 视频合成方案对比分析

## 📋 执行摘要

**核心发现**: 剪映(CapCut)不提供官方公开API,无法直接集成。

**推荐方案**: 混合方案 - 自建FFmpeg视频合成 + 借鉴剪映压缩参数

---

## 1. 剪映集成可行性分析

### 1.1 官方API状态

❌ **剪映没有官方公开API**

来源: [JSON2Video - CapCut API说明](https://json2video.com/how-to/capcut-api/)

> "Capcut does not offer a public API."

### 1.2 非官方方案

虽然GitHub上有一些非官方的CapCut自动化工具,但都存在问题:

| 项目 | 类型 | 问题 |
|------|------|------|
| CapCutAPI | Python自动化 | 需要安装CapCut桌面版,通过UI自动化控制 |
| capcut2srt | 字幕提取 | 只能提取字幕,不能编辑视频 |
| OpenCut | 开源替代品 | 独立项目,不是CapCut集成 |

**结论**: 无法通过API方式集成剪映功能

---

## 2. 替代方案对比

### 方案A: JSON2Video API (第三方视频编辑API)

#### 优势
- ✅ 完整的视频编辑API
- ✅ JSON驱动,易于集成
- ✅ 支持画中画、文字动画、配音
- ✅ 云端渲染,无需本地资源
- ✅ 专为自动化视频生成设计

#### 劣势
- ⚠️ 需要付费(按渲染次数计费)
- ⚠️ 依赖第三方服务
- ⚠️ 需要上传视频到他们的服务器
- ⚠️ 可能有隐私和数据安全问题

#### 成本估算
- 免费套餐: 10个视频/月
- 付费套餐: $29-$299/月

来源: [JSON2Video官网](https://json2video.com/)

---

### 方案B: 自建FFmpeg方案 (推荐)

#### 优势
- ✅ 完全控制,无第三方依赖
- ✅ 无API费用
- ✅ 数据隐私安全
- ✅ 已有技术栈(Remotion + FFmpeg)
- ✅ 可以精确模仿剪映的压缩参数

#### 劣势
- ⚠️ 需要开发时间
- ⚠️ 需要自己优化压缩算法
- ⚠️ 需要处理各种边界情况

#### 开发时间估算
- 基础功能: 2-3天
- 优化完善: 1-2天
- 总计: 3-5天

---

### 方案C: Remotion + FFmpeg混合方案 (当前架构)

#### 优势
- ✅ Remotion渲染高质量PPT模板
- ✅ FFmpeg处理视频合成和压缩
- ✅ 前端Canvas实时预览
- ✅ 灵活可控

#### 劣势
- ⚠️ 需要协调两个系统
- ⚠️ Remotion渲染耗时

---

## 3. 剪映压缩参数分析

### 3.1 剪映推荐的导出设置

基于对剪映导出界面的研究:

| 参数 | 1080P视频 | 4K视频 | 说明 |
|------|-----------|--------|------|
| **分辨率** | 1920x1080 | 3840x2160 | 不超过原素材分辨率 |
| **码率** | 12 Mbps | 18-20 Mbps | 抖音推荐值 |
| **帧率** | 30 fps | 30 fps | 60fps用于高动态内容 |
| **编码** | H.264 | H.264 | 兼容性最好 |
| **音频码率** | 128 kbps | 128 kbps | AAC编码 |

### 3.2 关键洞察

1. **平台会二次压缩**:
   - 抖音对超过6 Mbps的视频会二次压缩
   - 所以不需要过高的码率

2. **码率不是越高越好**:
   - 12 Mbps对1080P已经足够清晰
   - 过高码率会被平台压缩,浪费资源

3. **分辨率原则**:
   - 导出分辨率 ≤ 原素材分辨率
   - 强制提升分辨率会导致画面发虚

4. **智能高清**:
   - 剪映使用"智能高清"算法优化转码
   - 减少画质损失

---

## 4. FFmpeg参数配置(模仿剪映)

### 4.1 社交媒体优化配置

#### 抖音/TikTok (目标: <72MB)

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -crf 23 \
  -preset medium \
  -profile:v high \
  -level 4.0 \
  -b:v 12M \
  -maxrate 12M \
  -bufsize 24M \
  -vf "scale=1080:1920:flags=lanczos" \
  -r 30 \
  -c:a aac \
  -b:a 128k \
  -ar 44100 \
  output.mp4
```

#### 小红书/Instagram (目标: 更高质量)

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -crf 20 \
  -preset slow \
  -profile:v high \
  -level 4.0 \
  -b:v 15M \
  -maxrate 15M \
  -bufsize 30M \
  -vf "scale=1080:1920:flags=lanczos" \
  -r 30 \
  -c:a aac \
  -b:a 192k \
  -ar 48000 \
  output.mp4
```

#### B站 (目标: 高质量)

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -crf 18 \
  -preset slow \
  -profile:v high \
  -level 4.0 \
  -b:v 18M \
  -maxrate 20M \
  -bufsize 40M \
  -vf "scale=1920:1080:flags=lanczos" \
  -r 30 \
  -c:a aac \
  -b:a 192k \
  -ar 48000 \
  output.mp4
```

### 4.2 CRF参数详解

| CRF值 | 质量 | 码率(相对) | 文件大小 | 适用场景 |
|-------|------|-----------|----------|----------|
| 18 | 极高 | 2x | 很大 | B站、YouTube |
| 20 | 很高 | 1.5x | 大 | 小红书、Instagram |
| 23 | 高(默认) | 1x | 中等 | **抖音、TikTok** |
| 26 | 中等 | 0.5x | 小 | 文件大小严格限制 |
| 28 | 中低 | 0.35x | 很小 | 极端压缩 |

**规则**: CRF每增加6,码率约减半;每减少6,码率约翻倍

来源: [FFmpeg H.264 Encoding Guide](https://trac.ffmpeg.org/wiki/Encode/H.264)

### 4.3 Preset参数详解

| Preset | 编码速度 | 压缩效率 | 文件大小 | 推荐场景 |
|--------|---------|---------|----------|----------|
| ultrafast | 最快 | 最低 | 最大 | 实时预览 |
| fast | 快 | 低 | 大 | 快速导出 |
| medium | 中等 | 中等 | 中等 | **推荐(平衡)** |
| slow | 慢 | 高 | 小 | 高质量导出 |
| veryslow | 很慢 | 最高 | 最小 | 极致质量 |

**推荐**: 使用`medium`或`slow`,在速度和质量间取得平衡

---

## 5. 文件大小预估

### 5.1 计算公式

```
文件大小(MB) = (视频码率 + 音频码率) × 时长(秒) / 8 / 1024
```

### 5.2 78秒视频文件大小预估

| 平台 | 视频码率 | 音频码率 | 预估大小 | 平台限制 | 是否满足 |
|------|---------|---------|----------|----------|----------|
| 抖音/TikTok | 12 Mbps | 128 kbps | 116 MB | 72 MB | ❌ 需要降低 |
| 小红书 | 15 Mbps | 192 kbps | 145 MB | 10 GB | ✅ |
| B站 | 18 Mbps | 192 kbps | 173 MB | 8 GB | ✅ |

### 5.3 抖音优化方案

要满足72MB限制,需要调整参数:

**方案1: 降低码率**
```bash
-b:v 7M -maxrate 7M -bufsize 14M
```
预估大小: 68 MB ✅

**方案2: 降低分辨率**
```bash
-vf "scale=720:1280" -b:v 10M
```
预估大小: 97 MB (仍超标)

**方案3: 提高CRF**
```bash
-crf 26 -b:v 10M -maxrate 10M
```
预估大小: 约60-70 MB ✅

**推荐**: 方案1(降低码率到7M)或方案3(CRF 26)

---

## 6. 最终推荐方案

### 6.1 架构选择

**推荐: 自建FFmpeg方案 + 借鉴剪映参数**

理由:
1. ✅ 剪映没有API,无法直接集成
2. ✅ 第三方API有成本和隐私问题
3. ✅ 我们已有Remotion + FFmpeg技术栈
4. ✅ 可以精确控制压缩参数
5. ✅ 无第三方依赖,长期成本低

### 6.2 实施策略

#### 阶段1: 基础视频合成 (2天)
- 实现视频分割
- 实现画中画合成
- 实现视频拼接

#### 阶段2: 压缩优化 (1天)
- 实现平台预设配置
- 实现智能码率调整
- 实现文件大小预估

#### 阶段3: 测试优化 (1天)
- 测试各平台上传
- 优化压缩参数
- 性能优化

**总计**: 4天开发时间

### 6.3 技术栈

```
前端:
  - Vue 3 (已有)
  - Canvas API (实时预览)

后端:
  - Remotion (PPT模板渲染)
  - FFmpeg (视频处理和压缩)
  - Node.js Express (已有)

压缩策略:
  - 借鉴剪映参数
  - 平台预设配置
  - 智能码率调整
```

---

## 7. 风险和缓解

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| FFmpeg性能不足 | 高 | 低 | 使用服务器端FFmpeg |
| 压缩质量不理想 | 中 | 中 | 参考剪映参数,多次测试 |
| 文件大小超限 | 高 | 中 | 实现智能压缩,提供多档位 |
| 开发时间超预期 | 中 | 中 | 分阶段实施,MVP优先 |

---

## 8. 成本对比

### 自建方案
- 开发成本: 4天开发时间
- 运营成本: 服务器资源(已有)
- 长期成本: 维护成本

### JSON2Video API方案
- 开发成本: 1天集成时间
- 运营成本: $29-$299/月
- 长期成本: 持续付费 + 依赖第三方

**结论**: 自建方案长期成本更低,控制力更强

---

## 9. 下一步行动

### 立即行动
1. ✅ 确认采用自建FFmpeg方案
2. ⏭️ 创建视频压缩服务 `VideoCompressionService.js`
3. ⏭️ 实现平台预设配置
4. ⏭️ 集成到现有架构

### 需要确认的问题
1. 是否接受4天开发时间?
2. 是否优先支持抖音/TikTok(72MB限制)?
3. 是否需要提供多个质量档位供用户选择?

---

## 10. 参考资料

- [JSON2Video - CapCut API说明](https://json2video.com/how-to/capcut-api/)
- [FFmpeg H.264 Encoding Guide](https://trac.ffmpeg.org/wiki/Encode/H.264)
- [FFmpeg Compress Video Guide](https://cloudinary.com/guides/video-effects/ffmpeg-compress-video)
- [7 Best video editing APIs](https://www.plainlyvideos.com/blog/best-video-editing-api)
- [JSON2Video官网](https://json2video.com/)
