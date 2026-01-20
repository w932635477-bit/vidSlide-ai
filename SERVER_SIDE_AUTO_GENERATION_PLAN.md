# 服务器端一键生成实现方案

## 当前状态

✅ **已完成：**
- 视频分割、合并、压缩的服务器端 API
- 基础的一键生成 API 框架（`/api/auto-generate`）
- 任务状态查询 API（`/api/auto-generate/:taskId/status`）

⚠️ **待完成：**
- 将 MasterAutoGenerationAgent 改造为可在 Node.js 中运行
- 实现服务器端的完整一键生成流程
- 前端改造为调用服务器端 API

---

## 实现步骤

### 第一步：改造 MasterAutoGenerationAgent 为通用模块

**目标：** 让 MasterAutoGenerationAgent 可以同时在浏览器和 Node.js 环境中运行

**需要修改的文件：**
1. `vidslide-ai/src/services/MasterAutoGenerationAgent.js`
2. `vidslide-ai/src/services/DoubaoImageService.js`
3. `vidslide-ai/src/services/CompositionUnitGeneratorV3.js`
4. `vidslide-ai/src/services/MicroSceneGeneratorV3.js`

**改造要点：**
```javascript
// 检测环境
const isNode = typeof window === 'undefined';

// 根据环境导入不同的依赖
if (isNode) {
  // Node.js 环境：使用 fs, path 等
  const fs = require('fs');
  const path = require('path');
} else {
  // 浏览器环境：使用 fetch, Blob 等
}
```

### 第二步：实现服务器端的 processAutoGeneration 函数

**位置：** `vidslide-ai/server.js`

**完整流程：**
```javascript
async function processAutoGeneration(taskId, videoPath, platform, taskDir) {
  // 1. 初始化 MasterAutoGenerationAgent
  const agent = new MasterAutoGenerationAgent();

  // 2. 分析视频（语音识别、关键帧提取、场景检测）
  updateStatus(10, '分析视频中...');
  const analysis = await agent.analyzeVideo(videoPath);

  // 3. 推荐模板
  updateStatus(30, '推荐模板中...');
  const template = await agent.recommendTemplate(analysis);

  // 4. 组合内容（生成场景列表）
  updateStatus(50, '组合内容中...');
  const composition = await agent.composeContent(analysis, template);

  // 5. 生成图片（豆包生图）
  updateStatus(70, '生成图片中...');
  const images = await agent.generateImages(composition);

  // 6. 合成视频（分割、合并、叠加）
  updateStatus(85, '合成视频中...');
  const video = await agent.composeVideo(videoPath, composition, images);

  // 7. 压缩视频
  updateStatus(95, '压缩视频中...');
  const finalVideo = await agent.compressVideo(video, platform);

  // 8. 完成
  updateStatus(100, '处理完成!', {
    status: 'completed',
    videoUrl: `/output/${taskId}/final.mp4`,
    videoPath: finalVideo
  });
}
```

### 第三步：前端改造

**需要修改的文件：**
- `vidslide-ai/src/composables/useAutoGeneration.js`
- `vidslide-ai/src/stores/autoGenerationStore.js`

**改造方案：**
```javascript
// 1. 上传视频到服务器
const formData = new FormData();
formData.append('video', videoFile);
formData.append('platform', 'douyin');

const response = await fetch('http://localhost:3002/api/auto-generate', {
  method: 'POST',
  body: formData
});

const { taskId } = await response.json();

// 2. 轮询任务状态
const pollStatus = setInterval(async () => {
  const statusResponse = await fetch(`http://localhost:3002/api/auto-generate/${taskId}/status`);
  const status = await statusResponse.json();

  // 更新进度
  updateProgress(status.progress, status.message);

  if (status.status === 'completed') {
    clearInterval(pollStatus);
    // 下载视频并显示
    showPreview(status.videoUrl);
  } else if (status.status === 'failed') {
    clearInterval(pollStatus);
    showError(status.error);
  }
}, 1000); // 每秒查询一次
```

---

## 架构优势

### 当前架构（浏览器端）
```
浏览器
  ├─ 视频分析 ❌ 受限
  ├─ 豆包生图 ❌ 不可用
  ├─ 视频合成 ❌ 受限
  └─ 调用服务器 ✅ 仅用于 FFmpeg
```

### 新架构（服务器端）
```
浏览器
  └─ 上传视频 + 轮询状态 ✅ 轻量级

服务器
  ├─ 视频分析 ✅ 完整功能
  ├─ 豆包生图 ✅ 完整功能
  ├─ 视频合成 ✅ 完整功能
  └─ FFmpeg 处理 ✅ 本地调用
```

---

## 下一步行动

### 选项 1：快速验证（推荐）
先创建一个简化版的服务器端实现，验证整个流程：
```bash
# 创建测试脚本
node test-server-auto-generation.js
```

### 选项 2：完整实现
直接实现完整的服务器端一键生成功能：
1. 改造 MasterAutoGenerationAgent
2. 实现 processAutoGeneration
3. 改造前端调用

### 选项 3：分阶段实现
1. 第一阶段：只实现视频分析和模板推荐
2. 第二阶段：添加豆包生图
3. 第三阶段：添加视频合成
4. 第四阶段：前端集成

---

## 技术要点

### 1. 环境检测
```javascript
const isNode = typeof window === 'undefined';
const isBrowser = !isNode;
```

### 2. 文件处理
- Node.js: 使用 `fs.readFileSync()`, `fs.writeFileSync()`
- 浏览器: 使用 `Blob`, `File`, `FileReader`

### 3. 网络请求
- Node.js: 使用 `node-fetch` 或 `axios`
- 浏览器: 使用原生 `fetch`

### 4. 路径处理
- Node.js: 使用 `path.join()`, `path.resolve()`
- 浏览器: 使用 URL 对象

---

## 预期效果

完成后，用户体验：
1. 上传视频 → 立即返回任务ID
2. 显示实时进度条（每秒更新）
3. 后台处理完成后自动显示结果
4. 支持大文件和长时间处理
5. 可以关闭页面，稍后回来查看结果

---

## 估算工作量

- **选项 1（快速验证）**: 1-2 小时
- **选项 2（完整实现）**: 4-6 小时
- **选项 3（分阶段）**: 每阶段 1-2 小时

---

你想选择哪个方案？我建议从**选项 1**开始，先验证整个流程可行性。
