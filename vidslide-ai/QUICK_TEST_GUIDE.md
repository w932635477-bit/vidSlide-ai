# VidSlide AI - 多智能体系统快速测试指南

**日期**: 2026-01-25
**版本**: 2.0

---

## 🚀 快速启动

### 方法1: 使用启动脚本（推荐）

```bash
cd "/Users/weilei/VidSlide AI"
./start-server.sh
```

### 方法2: 手动启动

```bash
cd "/Users/weilei/VidSlide AI/vidslide-ai"
node server.js
```

---

## 🧪 测试步骤

### 1. 启动后端服务器

```bash
cd "/Users/weilei/VidSlide AI/vidslide-ai"
node server.js
```

**预期输出**:
```
🚀 VidSlide AI 多智能体后端服务器启动成功
  - HTTP地址: http://localhost:3002
  - WebSocket: ws://localhost:3002
  - 上传目录: /Users/weilei/VidSlide AI/uploads
  - 输出目录: /Users/weilei/VidSlide AI/output

📋 可用的 API 端点:
  - GET  /health
  - POST /api/multi-agent/process
  - GET  /api/multi-agent/status/:taskId
  - GET  /api/multi-agent/timeline/:taskId
  - GET  /api/multi-agent/download/:taskId

🤖 多智能体系统:
  - Phase 1: ContentAnalyst (内容理解)
  - Phase 2: SceneDesigner (场景设计)
  - Phase 3: LayerOrchestrator (层编排)
  - Phase 4: QualityDirector (质量检查)
  - Phase 5: VideoEngineer (视频合成)
```

### 2. 测试健康检查

在新终端中运行：
```bash
curl http://localhost:3002/health | python3 -m json.tool
```

**预期输出**:
```json
{
  "status": "ok",
  "message": "VidSlide AI Multi-Agent Server is running",
  "version": "2.0",
  "agents": [
    "ContentAnalyst",
    "SceneDesigner",
    "LayerOrchestrator",
    "VideoEngineer",
    "QualityDirector"
  ]
}
```

### 3. 打开测试页面

```bash
open "/Users/weilei/VidSlide AI/multi-agent-test.html"
```

或在浏览器中访问：
```
file:///Users/weilei/VidSlide AI/multi-agent-test.html
```

### 4. 上传测试视频

**测试视频位置**: `/Users/weilei/Desktop/测试3.MP4`

**操作步骤**:
1. 拖拽视频文件到上传区域
2. 或点击上传区域选择文件
3. 确认文件信息显示正确
4. 点击"🚀 开始处理"按钮

### 5. 观察处理过程

**实时监控**:
- ✅ 进度条从0%增长到100%
- ✅ Phase跟踪器依次激活（1→2→3→4→5）
- ✅ 状态消息实时更新
- ✅ 处理日志实时显示

**Phase进度映射**:
- 0-20%: Phase 1 (ContentAnalyst) - 内容理解
- 20-40%: Phase 2 (SceneDesigner) - 场景设计
- 40-60%: Phase 3 (LayerOrchestrator) - 层编排
- 60-80%: Phase 4 (QualityDirector) - 质量检查
- 80-100%: Phase 5 (VideoEngineer) - 视频合成

### 6. 查看Timeline统计

**预期显示**:
- 总Clip数: 9个（5个原视频 + 4个多层场景）
- 多层场景: 4个
- 总层数: 20个（4个场景 × 5层）

### 7. 预览和下载视频

**操作**:
1. 处理完成后，视频自动显示在预览区域
2. 点击"💾 下载视频"按钮保存视频
3. 播放视频，验证多层组合效果

---

## 🔍 验证要点

### 多层场景验证

**预期效果**:
每个多层场景应包含5层：
1. **Layer 0**: 高质量科技背景（全屏）
2. **Layer 1**: 搜索素材图片（全屏）
3. **Layer 2**: 磨砂玻璃遮罩（半透明模糊）
4. **Layer 3**: 文字卡片（关键词）
5. **Layer 4**: 人脸视频PIP（小窗口）

### Timeline验证

**检查项**:
- [ ] Timeline数据正确提取
- [ ] Clip数量正确（9个）
- [ ] 多层场景数量正确（4个）
- [ ] 层数量正确（20个）
- [ ] 每个多层场景包含5层

### 视频质量验证

**检查项**:
- [ ] 视频分辨率: 1080x1920（抖音规格）
- [ ] 视频时长: ~40秒
- [ ] 多层组合效果清晰可见
- [ ] 背景图片循环使用（11张）
- [ ] 卡片文字清晰
- [ ] PIP人脸视频正常显示

---

## 🐛 常见问题

### 问题1: WebSocket连接失败
**原因**: 服务器未启动或端口被占用
**解决**:
```bash
# 检查端口
lsof -i :3002
# 如果被占用，杀死进程或更改端口
```

### 问题2: 视频上传失败
**原因**: 文件大小超过500MB限制
**解决**: 使用较小的测试视频或增加限制

### 问题3: Timeline数据为空
**原因**: ProjectManager执行失败
**解决**: 检查服务器日志，查看错误信息

### 问题4: 进度卡在某个Phase
**原因**: 某个智能体执行失败
**解决**:
1. 检查服务器日志
2. 检查API密钥配置（.env文件）
3. 检查网络连接（百度API）

---

## 📝 测试日志示例

**成功的测试日志**:
```
[16:00:00] 系统初始化完成
[16:00:05] 已选择文件: 测试3.MP4 (15.2 MB)
[16:00:06] 开始上传视频...
[16:00:08] 任务已创建: task_1737795608123_abc123def
[16:00:08] 等待多智能体系统处理...
[16:00:09] WebSocket已连接
[16:00:10] 进度: 0% - 初始化多智能体系统...
[16:00:12] 进度: 10% - 🚀 Phase 1: 内容理解 (ContentAnalyst)
[16:00:45] 进度: 90% - ✅ Timeline已生成
[16:00:45] Timeline更新: 9个Clip, 4个多层场景, 20个层
[16:01:20] 进度: 100% - ✅ 处理完成！
[16:01:20] 视频处理完成！
```

---

## ✅ 测试清单

### 启动测试
- [ ] 后端服务器启动成功
- [ ] 健康检查返回正确数据
- [ ] 测试页面正常打开

### 功能测试
- [ ] 视频上传成功
- [ ] WebSocket连接成功
- [ ] 进度条正常更新
- [ ] Phase跟踪器正常切换
- [ ] Timeline统计正确显示
- [ ] 视频预览正常
- [ ] 视频下载成功

### 质量测试
- [ ] 多层场景正确生成（4个）
- [ ] 所有层正确渲染（20个）
- [ ] 背景图片循环使用
- [ ] 视频质量符合预期
- [ ] 无错误或警告

---

**测试指南完成时间**: 2026-01-25
**状态**: ✅ 准备测试
