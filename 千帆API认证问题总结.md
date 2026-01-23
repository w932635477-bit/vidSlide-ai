# 千帆平台文心一言API认证问题总结

## 📋 问题概述

在实现VidSlide AI的多智能体系统时，ContentAnalyst智能体需要调用百度千帆平台的文心一言API进行内容分析。但是在认证环节遇到了问题。

## ✅ 已完成的工作

### 1. 百度语音识别（ASR）- 成功 ✅
- **服务**: BaiduASRService
- **认证方式**: OAuth 2.0 (API Key + Secret Key)
- **测试结果**: 100%成功
- **性能**: 400字符文本，3-4秒识别完成
- **状态**: 已集成到ContentAnalyst，工作正常

### 2. 文心一言API - 失败 ❌
- **服务**: QianfanWenxinService / QianfanIAMService
- **认证方式**: 尝试了多种方式
- **测试结果**: 全部失败
- **状态**: 需要用户提供正确的密钥

## 🔍 认证问题分析

### 当前提供的密钥
```
Access Key: ALTAK-rcrLqDcwe4h2DuEqNK5CK
Secret Key: 916a0a8f85d4354539b00ffcfac9c59a18188396
应用类型: 预置推理服务-ERNIE-3.5-8K
认证协议: v2协议 IAM安全认证
```

### 尝试的认证方式

#### 方式1: OAuth 2.0 Token认证
```javascript
// 使用client_credentials流程获取access_token
const url = `https://aip.baidubce.com/oauth/2.0/token`;
const params = {
  grant_type: 'client_credentials',
  client_id: accessKey,
  client_secret: secretKey
};
```
**结果**: ❌ `{"error": "invalid_client", "error_description": "unknown client id"}`

#### 方式2: BCE IAM签名认证
```javascript
// 使用BCE签名算法生成Authorization头
const authString = `bce-auth-v1/${accessKey}/${timestamp}/${expiration}`;
const signature = HMAC-SHA256(signingKey, canonicalRequest);
```
**结果**: ❌ `{"error_code": 14, "error_msg": "IAM Certification failed"}`

### 问题根源

1. **密钥类型不匹配**:
   - 提供的是BCE Access Key（ALTAK-xxx格式）
   - 这是百度云引擎（BCE）的IAM密钥
   - 但千帆平台的文心一言API可能需要不同类型的密钥

2. **应用类型限制**:
   - 当前应用是"预置推理服务"类型
   - 这种类型可能不支持直接的API调用
   - 可能需要"应用接入"类型的应用

3. **认证协议不明确**:
   - 文档说明使用"v2协议 IAM安全认证"
   - 但具体的认证流程和签名算法不清楚
   - 官方文档对此描述不够详细

## 💡 解决方案

### 方案1: 创建"应用接入"类型的应用（推荐）

**步骤**:
1. 访问千帆控制台: https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application
2. 点击"创建应用"
3. 选择"应用接入"类型（不是"预置推理服务"）
4. 填写应用信息并创建
5. 在应用详情页查找"API Key"和"Secret Key"
6. 将这些密钥提供给我

**预期密钥格式**:
```
API Key: ALTAKxxx（可能没有连字符）或其他格式
Secret Key: 32位十六进制字符串
```

### 方案2: 检查当前应用的其他密钥

**步骤**:
1. 登录千帆控制台
2. 找到当前的"预置推理服务"应用
3. 查看应用详情页
4. 检查是否有"API Key"和"Secret Key"标签页（不是"Access Key"）
5. 如果有，提供这些密钥

### 方案3: 使用官方SDK（最简单）

**步骤**:
1. 安装官方SDK:
   ```bash
   npm install @baiducloud/qianfan
   ```
2. 使用SDK的认证方法（SDK会自动处理认证细节）
3. 我可以重写QianfanWenxinService使用SDK

## 📝 需要用户提供的信息

请用户提供以下信息之一：

### 选项A: 新的API密钥（推荐）
```
API Key: _______________
Secret Key: _______________
应用类型: 应用接入
```

### 选项B: 当前应用的完整信息
- 应用名称
- 应用ID
- 所有可用的密钥（包括API Key、Secret Key、Access Key等）
- 应用详情页的截图

### 选项C: 使用其他LLM服务
如果千帆平台配置复杂，可以考虑使用：
- 通义千问（阿里云）
- 智谱AI（GLM-4）
- DeepSeek
- 其他支持的LLM服务

## 🔧 临时解决方案

在等待正确密钥期间，我可以：

1. **使用Mock数据**: 创建一个模拟的文心一言服务，返回预设的分析结果
2. **跳过内容分析**: 让ContentAnalyst只做语音识别，跳过深度分析
3. **使用简单规则**: 基于关键词匹配的简单分析，不调用LLM

## 📊 当前系统状态

### 已实现的智能体
- ✅ **ContentAnalyst**: 语音识别部分工作正常
- ⏳ **SceneDesigner**: 等待ContentAnalyst的完整输出
- ⏳ **VisualDesigner**: 等待SceneDesigner的输出
- ⏳ **VideoEngineer**: 等待VisualDesigner的输出
- ⏳ **QualityDirector**: 等待VideoEngineer的输出

### 阻塞点
**ContentAnalyst的文心一言分析功能** - 需要正确的API密钥才能继续

## 🎯 下一步行动

1. **用户**: 提供正确的千帆平台API密钥
2. **我**: 更新QianfanWenxinService使用新密钥
3. **测试**: 运行完整的ContentAnalyst测试
4. **继续**: 实现和测试其他智能体

---

**创建时间**: 2026-01-23
**状态**: 等待用户提供API密钥
