# 🚀 快速开始 - 文心一言视觉API测试

> 5分钟快速测试文心一言视觉模型的图片对比功能

---

## ⚡ 快速测试步骤

### 步骤1: 验证API密钥（30秒）

```bash
# 检查.env文件
cat .env | grep WENXIN
```

**预期输出**:
```
WENXIN_API_KEY=your_api_key_here
WENXIN_SECRET_KEY=your_secret_key_here
```

❌ **如果没有**: 请先配置API密钥（见下方"配置API密钥"）

✅ **如果有**: 继续下一步

---

### 步骤2: 运行MLLM API测试（3分钟）

```bash
cd /Users/weilei/VidSlide\ AI/vidslide-ai
node test_mllm_vision_api.js
```

**测试内容**:
1. ✅ 导入服务
2. ✅ 提取测试图片（理想效果 + 生成结果）
3. ✅ 测试单张图片理解
4. ✅ 测试图片对比分析
5. ✅ 测试VisualValidationService（MLLM模式）

**成功输出示例**:

```
╔═══════════════════════════════════════════════════════════╗
║   文心一言视觉API测试 - MLLM图片对比功能               ║
╚═══════════════════════════════════════════════════════════╝

✅ API密钥已配置

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤1: 导入服务
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ WenxinService 导入成功
✅ VisualValidationService 导入成功

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤2: 准备测试图片
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

提取理想效果视频的关键帧...
✅ 理想效果关键帧: cache/reference_frame_test.jpg
✅ 生成视频关键帧: cache/test_frame_card.jpg

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤3: 测试WenxinService.visionChat()
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

测试单张图片理解...
✅ 单张图片理解成功
响应: 这张图片显示了一个抖音风格的短视频界面。画面中央是一位女性的正面视角...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤4: 测试WenxinService.compareImages()
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

对比理想效果和生成结果...
  理想效果: reference_frame_test.jpg
  生成结果: test_frame_card.jpg

✅ 图片对比成功

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
对比结果:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

总体通过: ✅ 是
总结: 所有检查项均通过，生成结果与理想效果高度一致

详细检查项:

1. 卡片位置:
   通过: ✅
   理想效果: 卡片位于画面中下部，y坐标约1200，避开了底部UI区域
   生成结果: 卡片位于画面中下部，y坐标约1200，与标准一致
   差异说明: 位置完全一致，符合标准

2. 卡片尺寸:
   通过: ✅
   理想效果: 约600x300像素
   生成结果: 约600x300像素
   差异说明: 尺寸一致

3. 文字长度:
   通过: ✅
   标准: 3-5个字
   实际: 4个字
   差异说明: 符合要求

4. 视觉样式:
   通过: ✅
   理想效果: 蓝色渐变背景、双边框、白色粗体文字
   生成结果: 蓝色渐变背景、双边框、白色粗体文字
   差异说明: 样式完全一致

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤5: 测试VisualValidationService (MLLM模式)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

设置环境变量: USE_MOCK_VALIDATION=false

✅ VisualValidationService MLLM模式验证成功
总体通过: ✅
总结: 所有检查项均通过，生成结果与理想效果高度一致

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
测试总结
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 所有测试通过！

功能验证:
  ✅ WenxinService.visionChat() - 单张图片理解
  ✅ WenxinService.compareImages() - 图片对比分析
  ✅ VisualValidationService (MLLM模式) - 质量验证

下一步:
  1. 在端到端测试中启用MLLM验证: USE_MOCK_VALIDATION=false
  2. 观察MLLM验证的准确性和性能
  3. 根据需要调整prompt以提高验证质量
```

---

### 步骤3: 在端到端测试中启用MLLM验证（可选）

```bash
# 使用MLLM验证运行完整的视频生成流程
USE_MOCK_VALIDATION=false node test_e2e_real_video.js
```

**注意**:
- ⚠️ 这将调用付费API（约¥0.024/次对比）
- ⚠️ 速度较慢（每个卡片场景约3-5秒）
- ✅ 验证准确性更高

---

## 🔧 配置API密钥

如果还没有配置API密钥，请按以下步骤操作：

### 1. 获取API密钥

访问 [百度智能云千帆平台](https://qianfan.cloud.baidu.com/):

1. 注册/登录账号
2. 进入"应用接入" → "新建应用"
3. 创建应用后，获取以下信息：
   - **API Key** (形如: `ABCDefgh1234567890`)
   - **Secret Key** (形如: `XYZabcd9876543210`)

### 2. 配置到.env文件

```bash
cd /Users/weilei/VidSlide\ AI/vidslide-ai

# 编辑.env文件
nano .env
```

添加以下行：

```bash
# 文心一言API密钥
WENXIN_API_KEY=你的API_Key
WENXIN_SECRET_KEY=你的Secret_Key
```

保存并退出（Ctrl+O, Enter, Ctrl+X）

### 3. 验证配置

```bash
node -e "
const dotenv = require('dotenv');
dotenv.config();
console.log('API Key:', process.env.WENXIN_API_KEY ? '✅ 已配置' : '❌ 未配置');
console.log('Secret Key:', process.env.WENXIN_SECRET_KEY ? '✅ 已配置' : '❌ 未配置');
"
```

---

## 📊 对比测试：Mock vs MLLM

运行对比测试查看两种模式的差异：

```bash
# Mock模式（快速，免费）
echo "Testing Mock mode..."
USE_MOCK_VALIDATION=true node test_e2e_real_video.js

# MLLM模式（准确，付费）
echo "Testing MLLM mode..."
USE_MOCK_VALIDATION=false node test_e2e_real_video.js
```

### 性能对比

| 维度 | Mock模式 | MLLM模式 |
|------|----------|----------|
| **速度** | ~1秒/场景 | ~3-5秒/场景 |
| **成本** | 免费 | ~¥0.024/场景 |
| **准确性** | 中等（规则检查） | 高（AI视觉理解） |
| **检查维度** | 仅文字长度 | 位置+尺寸+文字+样式 |
| **可靠性** | 依赖OCR | 视觉理解 |

---

## 🐛 常见问题

### Q1: 测试失败 - "API密钥未配置"

**解决方法**:
1. 检查.env文件是否存在
2. 确认API密钥格式正确（无多余空格）
3. 重新加载环境变量: `source .env`

### Q2: 测试失败 - "理想效果视频不存在"

**解决方法**:
```bash
# 检查理想效果视频是否存在
ls -lh reference/ideal_card_reference.mp4

# 如果不存在，请确保视频在正确位置
```

### Q3: 测试失败 - "生成视频不存在"

**解决方法**:
```bash
# 先运行端到端测试生成视频
node test_e2e_real_video.js

# 然后再运行MLLM测试
node test_mllm_vision_api.js
```

### Q4: API调用超时

**解决方法**:
- 检查网络连接
- 增加超时时间（在代码中修改timeout参数）
- 降低图片分辨率

### Q5: JSON解析失败

**症状**: `响应中未找到JSON格式的结果`

**解决方法**:
- 降低temperature参数（如0.3）
- 检查prompt是否清晰要求返回JSON
- 查看完整响应内容进行调试

---

## 📖 详细文档

查看完整的使用说明和API文档：

- [MLLM_VISION_API_GUIDE.md](./MLLM_VISION_API_GUIDE.md) - 完整的API使用指南
- [AGENTS.md](./AGENTS.md) - 质量标准规范
- [VALIDATION_REPORT.md](./VALIDATION_REPORT.md) - 验证报告

---

## 💡 快速命令参考

```bash
# 测试MLLM API
node test_mllm_vision_api.js

# Mock模式端到端测试（快速）
USE_MOCK_VALIDATION=true node test_e2e_real_video.js

# MLLM模式端到端测试（准确）
USE_MOCK_VALIDATION=false node test_e2e_real_video.js

# 检查API密钥配置
cat .env | grep WENXIN

# 查看生成的视频
open output/final_*.mp4

# 查看提取的关键帧
open cache/test_frame_card.jpg
open cache/reference_frame_test.jpg
```

---

**开始测试**: `node test_mllm_vision_api.js`

**遇到问题**: 请查看 [MLLM_VISION_API_GUIDE.md](./MLLM_VISION_API_GUIDE.md) 的"故障排查"章节
