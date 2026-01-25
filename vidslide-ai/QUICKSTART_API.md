# 🚀 文心一言API快速配置卡片

> **用时**: 10分钟 | **费用**: 免费试用 | **难度**: ⭐⭐☆☆☆

---

## 📝 核心步骤（5步）

### 1️⃣ 访问千帆平台
```
https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application
```
**登录**：使用您的百度账号

---

### 2️⃣ 创建应用
- 点击"创建应用"
- 应用名称：`VidSlide AI`
- 应用类型：其他
- 点击"确定"

---

### 3️⃣ 复制API密钥
在应用详情页复制：
- ✅ **API Key**: `ABCDefgh...`
- ✅ **Secret Key**: `XYZabcd...`

⚠️ **Secret Key只显示一次，请妥善保存**

---

### 4️⃣ 开通服务 ⭐ **重要**
进入"服务管理" → 开通以下服务：
- ✅ **ERNIE-4.0-Turbo-128K** （视觉理解）← 必需
- ✅ ERNIE-Bot （基础聊天）

**路径**：控制台 → 服务管理 → 我的服务

---

### 5️⃣ 配置到项目
```bash
# 1. 编辑配置文件
nano "/Users/weilei/VidSlide AI/vidslide-ai/.env"

# 2. 添加以下内容（末尾）
WENXIN_API_KEY=你的API_Key
WENXIN_SECRET_KEY=你的Secret_Key

# 3. 保存：Ctrl+O → Enter → Ctrl+X
```

---

## ✅ 验证配置

```bash
cd "/Users/weilei/VidSlide AI/vidslide-ai"
node test_api_key.js
```

**成功标志**：
```
✅ API密钥有效
✅ 文本聊天功能正常
✅ 视觉模型API调用成功
```

---

## 🎯 立即测试

### 测试MLLM视觉功能
```bash
node test_mllm_vision_api.js
```

### 端到端测试（MLLM模式）
```bash
USE_MOCK_VALIDATION=false node test_e2e_real_video.js
```

---

## ⚠️ 常见错误

| 错误 | 原因 | 解决 |
|------|------|------|
| 未配置 | .env格式错误 | 检查无空格、无引号 |
| No permission | 服务未开通 | 开通ERNIE-4.0-Turbo-128K |
| 配额不足 | 免费额度用完 | 充值¥10-20元 |

---

## 💰 成本参考

- **测试阶段**: 免费（新用户有试用额度）
- **一次图片对比**: ¥0.024
- **一个视频（5个场景）**: ¥0.145

---

## 📚 详细文档

- [MLLM_API_SETUP_GUIDE.md](./MLLM_API_SETUP_GUIDE.md) - 详细申请步骤
- [MLLM_VISION_API_GUIDE.md](./MLLM_VISION_API_GUIDE.md) - 完整API使用指南

---

**创建日期**: 2026-01-24
