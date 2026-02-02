# VidSlide AI - UI实际测试指南

**测试日期**: 2026-02-02
**版本**: v2.0 (修复后)

---

## 🚀 服务器状态

### ✅ 后端服务器 (已启动)
- **地址**: http://localhost:3002
- **WebSocket**: ws://localhost:3002
- **状态**: 运行中 (PID: 20831)

### ✅ 前端服务器 (已启动)
- **地址**: http://localhost:5174
- **状态**: 运行中 (PID: 20929)

---

## 📋 测试场景清单

### 场景1: 素材准确性评分验证 ⭐⭐⭐⭐⭐

**目标**: 验证素材评分从0.00分提升到70+分

**测试步骤**:
1. 打开浏览器访问 http://localhost:5174
2. 上传测试视频（建议使用短视频，30-60秒）
3. 点击"开始处理"
4. 等待处理完成
5. 查看质量报告中的"素材准确性"部分

**预期结果**:
- ✅ 素材平均评分 ≥ 70分
- ✅ 每个素材都有validationScore字段
- ✅ 质量报告显示详细的评分信息
- ✅ 低分素材（<70分）会被标记

**验证点**:
- MaterialSearchService返回对象格式（包含validationScore）
- LayerOrchestrator正确传递评分
- QualityDirector正确读取和验证评分

---

### 场景2: 渲染稳定性测试 ⭐⭐⭐⭐⭐

**目标**: 验证渲染成功率从60%提升到95%+

**测试步骤**:
1. 上传较长的视频（2-5分钟）
2. 开始处理
3. 观察渲染进度
4. 检查是否有重试和降级提示
5. 验证最终视频输出

**预期结果**:
- ✅ 渲染成功完成
- ✅ 如果内存不足，自动降级规格
- ✅ 失败后自动重试（最多3次）
- ✅ 输出视频文件完整可播放

**验证点**:
- RemotionRenderServiceCLI的重试机制
- 超时控制（动态计算）
- 配置恢复（降级后恢复原始配置）
- 失败文件清理

---

### 场景3: 关键词数量动态调整 ⭐⭐⭐⭐

**目标**: 验证关键词数量从5个提升到10-15个

**测试步骤**:
1. 上传不同长度的视频：
   - 短视频（<1分钟）
   - 中等视频（1-3分钟）
   - 长视频（>3分钟）
2. 查看提取的关键词数量

**预期结果**:
- ✅ 短视频: 5个关键词
- ✅ 中等视频: 8-10个关键词
- ✅ 长视频: 12-15个关键词
- ✅ 关键词数量根据文本长度和视频时长动态调整

**验证点**:
- LocalKeywordExtractorV2的calculateOptimalTopN方法
- ContentAnalyst不再传递固定topN

---

### 场景4: 时间戳精度提升 ⭐⭐⭐⭐

**目标**: 验证时间戳精度从±1-2秒提升到±0.5秒

**测试步骤**:
1. 上传带有清晰语音的视频
2. 处理完成后，播放生成的视频
3. 对比关键词卡片出现时间和原视频中关键词提到的时间

**预期结果**:
- ✅ 卡片出现时机准确（误差<±0.5秒）
- ✅ 使用ASR词级时间戳的关键词更精确
- ✅ 日志显示"ASR精确时间戳"和"插值时间戳"的数量

**验证点**:
- LocalKeywordExtractorV2的calculateTimestampFromWords方法
- ASR词级时间戳优先使用
- 降级到插值方法正常工作

---

### 场景5: 多义词消歧验证 ⭐⭐⭐

**目标**: 验证多义词素材搜索的准确性

**测试步骤**:
1. 上传包含多义词的视频（如"粉丝"、"流量"）
2. 查看搜索到的素材图片
3. 检查是否排除了错误含义的素材

**预期结果**:
- ✅ "粉丝"搜索结果不包含"风扇"图片
- ✅ 如果所有候选被排除，触发降级搜索
- ✅ 降级搜索使用分类词或通用商务图片

**验证点**:
- MaterialSearchService的selectBestCandidate过滤逻辑
- searchWithFallback降级策略
- 避免关键词检查

---

## 🔍 调试工具

### 1. 浏览器开发者工具
```
打开方式: F12 或 Cmd+Option+I (Mac)
```

**查看内容**:
- **Console**: 查看前端日志和错误
- **Network**: 查看API请求和响应
- **Application > Local Storage**: 查看缓存数据

### 2. 后端日志
```bash
# 查看后端实时日志
tail -f /tmp/backend.log

# 查看前端实时日志
tail -f /tmp/frontend.log
```

### 3. API测试
```bash
# 健康检查
curl http://localhost:3002/health

# 查看任务状态
curl http://localhost:3002/api/multi-agent/status/{taskId}

# 查看Timeline数据
curl http://localhost:3002/api/multi-agent/timeline/{taskId}
```

---

## 📊 质量报告检查点

处理完成后，质量报告应包含以下信息：

### ✅ 内容理解检查
- 关键词数量: 10-15个
- 观点数量: ≥1个
- 所有必需字段存在

### ✅ 场景设计检查
- 原视频占比: ≤20%
- 时间轴连续性: 无间隙
- 场景多样性: 包含卡片和多层场景

### ✅ Timeline完整性检查
- 所有层状态: completed 或 ready
- 素材平均评分: ≥70分
- 失败层数: 0

### ✅ 素材准确性详情
```json
{
  "materialAccuracy": {
    "avgScore": 85.5,
    "totalMaterials": 10,
    "validMaterials": 9
  }
}
```

---

## 🐛 常见问题排查

### 问题1: 素材评分仍然是0分
**可能原因**:
- MaterialSearchService未正确返回对象格式
- LayerOrchestrator未传递validationScore

**检查方法**:
```bash
# 查看后端日志中的素材搜索部分
grep "素材评分" /tmp/backend.log
```

### 问题2: 渲染失败
**可能原因**:
- 内存不足
- 视频文件损坏
- FFmpeg未安装

**检查方法**:
```bash
# 查看渲染日志
grep "渲染" /tmp/backend.log

# 检查FFmpeg
ffmpeg -version
```

### 问题3: 关键词数量仍然是5个
**可能原因**:
- LocalKeywordExtractorV2未使用动态topN
- ContentAnalyst仍在传递固定topN

**检查方法**:
```bash
# 查看关键词提取日志
grep "动态topN" /tmp/backend.log
```

---

## 🎯 测试完成标准

所有以下条件都满足时，测试通过：

- ✅ 素材平均评分 ≥ 70分
- ✅ 渲染成功率 ≥ 95%
- ✅ 关键词数量 10-15个
- ✅ 时间戳精度 < ±0.5秒
- ✅ 多义词素材准确
- ✅ 质量报告完整
- ✅ 无严重错误

---

## 📞 支持信息

### 停止服务器
```bash
# 停止后端
lsof -ti :3002 | xargs kill

# 停止前端
lsof -ti :5174 | xargs kill
```

### 重启服务器
```bash
# 重启后端
cd "/Users/weilei/VidSlide AI/vidslide-ai" && npm run server

# 重启前端
cd "/Users/weilei/VidSlide AI/vidslide-ai" && npm run dev
```

### 查看完整日志
```bash
# 后端日志
cat /tmp/backend.log

# 前端日志
cat /tmp/frontend.log
```

---

**测试开始时间**: 请记录
**测试完成时间**: 请记录
**测试结果**: 请填写

祝测试顺利！🎉
