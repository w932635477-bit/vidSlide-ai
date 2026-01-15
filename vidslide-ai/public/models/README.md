# Face-api.js 模型文件

## 模型加载策略

UnifiedFaceTracker 服务会按以下顺序尝试加载模型：

1. **CDN加载（推荐）**: `https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model`
2. **本地加载（备选）**: `/models/`

## 所需模型文件

如需本地部署，请下载以下文件到此目录：

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_tiny_model-weights_manifest.json`
- `face_landmark_68_tiny_model-shard1`

## 下载命令

```bash
# 从 jsdelivr CDN 下载
curl -LO "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/tiny_face_detector_model-weights_manifest.json"
curl -LO "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/tiny_face_detector_model-shard1"
curl -LO "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/face_landmark_68_tiny_model-weights_manifest.json"
curl -LO "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/face_landmark_68_tiny_model-shard1"
```

## 浏览器兼容性

| 浏览器 | 首选引擎 | 备选引擎 |
|--------|----------|----------|
| Chrome 80+ | MediaPipe | Face-api.js |
| Firefox 75+ | Face-api.js | MediaPipe |
| Safari 14+ | Face-api.js | - |
| Edge 80+ | MediaPipe | Face-api.js |
