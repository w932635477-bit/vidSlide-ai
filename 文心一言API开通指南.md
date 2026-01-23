# 文心一言API开通指南

## 🎯 目标
开通百度文心一言API权限，以便ContentAnalyst能够进行内容分析。

---

## 📋 开通步骤

### 步骤1: 访问百度智能云控制台

1. 打开浏览器，访问：https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application

2. 使用百度账号登录
   - 如果没有账号，点击"注册"创建新账号
   - 建议使用手机号注册

### 步骤2: 实名认证（如果还没有）

1. 点击右上角头像 → "账号管理"
2. 完成实名认证
   - 个人认证：需要身份证
   - 企业认证：需要营业执照

### 步骤3: 创建应用

1. 在"应用接入"页面，点击"创建应用"

2. 填写应用信息：
   ```
   应用名称: VidSlide AI
   应用描述: 智能视频生成系统，用于视频内容分析和自动化生成
   应用类型: 其他
   ```

3. 点击"确定"创建

### 步骤4: 开通服务

1. 创建应用后，会自动跳转到应用详情页

2. 在"服务管理"中，开通以下服务：
   - ✅ **ERNIE-Bot-turbo** (推荐，免费额度多)
   - ✅ **ERNIE-Bot** (备用)
   - ✅ **ERNIE-Bot-8K** (支持长文本)

3. 点击"立即开通"

### 步骤5: 获取API密钥

1. 在应用详情页，找到"API Key"和"Secret Key"

2. 复制这两个密钥：
   ```
   API Key: 24.xxxxxxxxxxxxxxxxxxxxx
   Secret Key: xxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **重要**: 妥善保管这些密钥，不要泄露

### 步骤6: 更新配置文件

1. 打开项目文件：`src/config/api-keys.js`

2. 找到`WENXIN_CONFIG`部分：
   ```javascript
   export const WENXIN_CONFIG = {
     apiKey: '您的新API_KEY',  // 替换这里
     secretKey: '您的新SECRET_KEY',  // 替换这里
     model: 'ernie_bot_8k',
     baseUrl: 'https://aip.baidubce.com'
   }
   ```

3. 将复制的API Key和Secret Key粘贴到对应位置

4. 保存文件

### 步骤7: 测试API权限

运行测试脚本验证权限：

```bash
cd /Users/weilei/VidSlide\ AI
node scripts/test-wenxin-permission.js
```

**预期输出**:
```
============================================================
🔑 文心一言API权限测试
============================================================

步骤1: 获取Access Token...
✅ Access Token获取成功
   Token: 24.xxxxxxxxxxxxx...
   有效期: 2592000秒 (约30天)

步骤2: 测试文心一言API调用...
✅ API调用成功
   模型: ernie_bot_8k
   响应: 你好！我是百度研发的知识增强大语言模型...

步骤3: 测试JSON格式输出...
✅ JSON格式输出测试成功
   响应: {"keywords": ["测试", "成功"], "status": "ok"}

============================================================
✅ 所有测试通过！文心一言API权限正常
============================================================
```

### 步骤8: 运行完整测试

权限验证通过后，运行完整的ContentAnalyst测试：

```bash
node scripts/test-phase2-content-analyst.js
```

---

## ⚠️ 常见问题

### 问题1: "No permission to access data"

**原因**: API密钥未开通文心一言服务

**解决**:
1. 返回控制台：https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application
2. 点击应用名称进入详情
3. 在"服务管理"中开通ERNIE-Bot服务
4. 等待1-2分钟生效

### 问题2: "Unsupported openapi method"

**原因**: 模型名称不正确

**解决**:
1. 检查`src/config/api-keys.js`中的`model`字段
2. 确保使用以下之一：
   - `ernie_bot_8k` (推荐)
   - `eb-instant` (ERNIE-Bot-turbo)
   - `completions` (ERNIE-Bot)

### 问题3: "Invalid client"

**原因**: API Key或Secret Key错误

**解决**:
1. 重新复制控制台中的密钥
2. 确保没有多余的空格
3. 确保引号正确

### 问题4: 免费额度不足

**原因**: 免费调用次数已用完

**解决**:
1. 访问：https://console.bce.baidu.com/qianfan/chargemanage/list
2. 查看剩余额度
3. 如需更多额度，可以充值或申请试用

---

## 💰 费用说明

### 免费额度（新用户）

- **ERNIE-Bot-turbo**: 100万tokens/月
- **ERNIE-Bot**: 50万tokens/月
- **ERNIE-Bot-8K**: 50万tokens/月

### 计费方式

- 按tokens计费
- 1个汉字 ≈ 2 tokens
- 1个英文单词 ≈ 1 token

### 预估使用量

对于VidSlide AI项目：
- 每次分析约400字文案
- 每次消耗约1000 tokens
- 免费额度可支持约500次分析

---

## 📞 获取帮助

### 官方文档
- 文心一言API文档: https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html
- 快速开始: https://cloud.baidu.com/doc/WENXINWORKSHOP/s/flfmc9do2

### 技术支持
- 百度智能云工单系统: https://console.bce.baidu.com/ticket/#/ticket/create
- 开发者社区: https://cloud.baidu.com/forum/bce

### 项目支持
- 如果遇到问题，请查看：`real-test-output/FINAL_TEST_SUMMARY.md`
- 或运行：`node scripts/test-wenxin-permission.js` 进行诊断

---

## ✅ 检查清单

开通完成后，请确认：

- [ ] 百度账号已实名认证
- [ ] 已创建应用"VidSlide AI"
- [ ] 已开通ERNIE-Bot服务
- [ ] 已获取API Key和Secret Key
- [ ] 已更新`src/config/api-keys.js`
- [ ] 运行`test-wenxin-permission.js`测试通过
- [ ] 准备运行完整测试

---

**准备好后，运行以下命令继续测试**:

```bash
# 1. 测试API权限
node scripts/test-wenxin-permission.js

# 2. 运行完整测试
node scripts/test-phase2-content-analyst.js
```

---

**文档创建时间**: 2026-01-23
**最后更新**: 2026-01-23
