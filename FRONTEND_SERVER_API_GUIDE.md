# 前端调用服务器端 API - 使用指南

## 📊 概述

前端现在支持两种模式：
1. **服务器端模式**（推荐）- 使用服务器端 API，支持豆包生图、人脸检测、智能裁剪
2. **浏览器端模式** - 在浏览器中运行，功能受限

## 🚀 快速开始

### 1. 启动服务器

```bash
cd vidslide-ai
node server.js
```

服务器将在 `http://localhost:3002` 启动。

### 2. 配置前端

编辑 `vidslide-ai/src/config/app.config.js`：

```javascript
export const config = {
  server: {
    // 是否使用服务器端 API
    useServerAPI: true,  // 改为 false 使用浏览器端模式

    // 服务器地址
    url: 'http://localhost:3002',

    // 轮询间隔（毫秒）
    pollInterval: 1000
  }
}
```

### 3. 使用前端

打开前端应用，上传视频，点击"一键生成"。

前端会自动：
1. 上传视频到服务器
2. 创建生成任务
3. 轮询任务状态
4. 下载生成的视频

## 🔄 工作流程

### 服务器端模式流程

```
前端上传视频
    ↓
服务器创建任务
    ↓
服务器处理（豆包生图、人脸检测、智能裁剪、视频合成）
    ↓
前端轮询状态（每秒查询一次）
    ↓
服务器完成处理
    ↓
前端下载视频
    ↓
显示预览
```

### 浏览器端模式流程

```
前端分析视频
    ↓
前端推荐模板
    ↓
前端组合内容（跳过豆包生图）
    ↓
前端合成视频（只有原视频片段）
    ↓
显示预览
```

## 📋 功能对比

| 功能 | 服务器端模式 | 浏览器端模式 |
|------|------------|------------|
| 视频分析 | ✅ | ✅ |
| 场景检测 | ✅ | ✅ |
| 人脸检测 | ✅ | ❌ |
| 豆包生图 | ✅ | ❌ |
| 智能裁剪 | ✅ | ❌ |
| 图片叠加 | ✅ | ❌ |
| 视频合成 | ✅ | ✅ |
| 视频压缩 | ✅ | ✅ |

## 🎯 推荐使用场景

### 使用服务器端模式（推荐）

- ✅ 需要豆包生图功能
- ✅ 需要人脸检测和智能位置
- ✅ 需要智能裁剪
- ✅ 需要高质量的图片叠加
- ✅ 处理大视频文件

### 使用浏览器端模式

- ✅ 只需要视频分割和合并
- ✅ 不需要生成图片
- ✅ 快速测试和预览
- ✅ 没有服务器环境

## 🔧 配置选项

### app.config.js 完整配置

```javascript
export const config = {
  // 服务器端 API 配置
  server: {
    // 是否使用服务器端 API
    useServerAPI: true,

    // 服务器地址
    url: 'http://localhost:3002',

    // 轮询间隔（毫秒）
    pollInterval: 1000
  },

  // 视频处理配置
  video: {
    // 默认目标平台
    defaultPlatform: 'douyin',

    // 视频压缩质量
    compressionQuality: 0.8
  },

  // 调试配置
  debug: {
    // 是否启用详细日志
    verbose: true,

    // 是否显示性能指标
    showPerformance: false
  }
}
```

## 📊 API 端点

### POST /api/auto-generate

创建一键生成任务。

**请求**:
```javascript
const formData = new FormData()
formData.append('video', videoFile)
formData.append('platform', 'douyin')

fetch('http://localhost:3002/api/auto-generate', {
  method: 'POST',
  body: formData
})
```

**响应**:
```json
{
  "taskId": "autogen_xxx",
  "message": "任务已创建，正在处理中..."
}
```

### GET /api/auto-generate/:taskId/status

查询任务状态。

**响应**:
```json
{
  "taskId": "autogen_xxx",
  "progress": 70,
  "message": "生成图片中...",
  "status": "processing",
  "videoUrl": null
}
```

**完成时响应**:
```json
{
  "taskId": "autogen_xxx",
  "progress": 100,
  "message": "处理完成!",
  "status": "completed",
  "videoUrl": "/output/autogen_xxx/final.mp4",
  "videoPath": "/path/to/final.mp4"
}
```

## 🐛 故障排除

### 问题 1: 前端无法连接服务器

**症状**: 控制台显示 `Failed to fetch`

**解决方案**:
1. 检查服务器是否启动: `curl http://localhost:3002/health`
2. 检查配置文件中的服务器地址
3. 检查防火墙设置

### 问题 2: 任务一直处于 processing 状态

**症状**: 进度条卡住不动

**解决方案**:
1. 查看服务器日志: `tail -f vidslide-ai/server-logs.txt`
2. 检查服务器是否有错误
3. 检查豆包 API Key 是否配置正确

### 问题 3: 视频下载失败

**症状**: 任务完成但无法下载视频

**解决方案**:
1. 检查输出目录是否存在
2. 检查视频文件是否生成
3. 检查浏览器控制台错误

## 💡 最佳实践

### 1. 使用服务器端模式

默认启用服务器端模式，享受完整功能。

### 2. 合理设置轮询间隔

- 快速任务: 500ms
- 普通任务: 1000ms（默认）
- 长时间任务: 2000ms

### 3. 处理错误

```javascript
try {
  const result = await agent.autoGenerate(videoFile, onProgress)
  console.log('生成成功:', result)
} catch (error) {
  console.error('生成失败:', error.message)
  // 显示错误提示给用户
}
```

### 4. 显示进度

```javascript
const onProgress = (progress, message) => {
  console.log(`${progress}% - ${message}`)
  // 更新 UI 进度条
}
```

## 📈 性能优化

### 1. 减少轮询频率

对于长时间任务，可以增加轮询间隔：

```javascript
pollInterval: 2000  // 2秒查询一次
```

### 2. 使用缓存

服务器端会自动缓存豆包生图结果，相同关键词不会重复生成。

### 3. 并发控制

服务器端会自动处理并发请求，无需担心多个任务同时运行。

## 🎉 总结

现在前端已经完全支持调用服务器端 API！

**优势**:
- ✅ 完整功能（豆包生图、人脸检测、智能裁剪）
- ✅ 高性能（服务器端处理）
- ✅ 易于使用（自动轮询、自动下载）
- ✅ 灵活配置（可切换模式）

**下一步**:
1. 启动服务器
2. 配置前端
3. 上传视频测试
4. 享受完整功能！
