# 图片素材API注册指南

## 🎯 目的
获取Unsplash和Pexels的免费API KEY，用于MaterialSearchService搜索素材。

---

## 1️⃣ Unsplash API注册

### **步骤1：访问Unsplash开发者平台**
```
https://unsplash.com/developers
```

### **步骤2：注册/登录账号**
- 点击"Join" 或 "Sign in"
- 使用邮箱注册（免费）

### **步骤3：创建应用**
1. 登录后，点击"Your apps"
2. 点击"New Application"
3. 接受开发者条款
4. 填写应用信息：
   - **Application name**: VidSlide AI
   - **Description**: AI视频生成系统，自动搜索素材
5. 点击"Create application"

### **步骤4：获取Access Key**
创建成功后，你会看到：
```
Access Key: abc123xyz...
Secret Key: def456uvw...
```

**复制Access Key**（不需要Secret Key）

### **步骤5：添加到.env文件**
```bash
UNSPLASH_ACCESS_KEY=abc123xyz...
```

### **免费额度**
- ✅ 50 requests/hour
- ✅ 无限制的开发测试
- ✅ 商业使用需申请

---

## 2️⃣ Pexels API注册

### **步骤1：访问Pexels API页面**
```
https://www.pexels.com/api/
```

### **步骤2：注册/登录账号**
- 点击"Get Started"
- 使用邮箱注册（免费）

### **步骤3：生成API Key**
1. 登录后，访问：https://www.pexels.com/api/new/
2. 填写应用信息：
   - **Description**: VidSlide AI - 视频素材搜索
   - **URL**: https://github.com/your-username/vidslide-ai （可选）
3. 点击"Generate API Key"

### **步骤4：获取API Key**
页面会显示你的API Key：
```
API Key: xyz789abc...
```

**复制并保存**

### **步骤5：添加到.env文件**
```bash
PEXELS_API_KEY=xyz789abc...
```

### **免费额度**
- ✅ 200 requests/hour
- ✅ 无限制的月度请求
- ✅ 完全免费，无商业限制

---

## 3️⃣ Pixabay API注册（可选）

### **步骤1：访问Pixabay**
```
https://pixabay.com/api/docs/
```

### **步骤2：注册账号**
- 点击"Get Started"
- 使用邮箱注册

### **步骤3：获取API Key**
- 登录后，在API文档页面会显示你的key

### **免费额度**
- ✅ 5,000 requests/day
- ✅ 完全免费

---

## 4️⃣ 配置验证

### **检查.env文件**
```bash
# 图片素材平台 API 配置
UNSPLASH_ACCESS_KEY=你的Unsplash Key
PEXELS_API_KEY=你的Pexels Key
```

### **运行测试**
```bash
cd vidslide-ai
node test_material_search.js
```

### **预期输出**
```
🧪 测试素材搜索服务

✅ MaterialSearchService 初始化完成
  缓存目录: /path/to/cache/materials
  已缓存素材: 0个

========================================
测试1: 搜索素材
========================================

[1/4] 测试关键词: "抖音"
────────────────────────────────────────
🔍 搜索素材: "抖音"
  ✅ Unsplash找到素材
  📥 下载素材: Unsplash
  💾 素材已保存: material_5d41402abc4b2a.jpg
  ✅ 素材已缓存: material_5d41402abc4b2a.jpg
✅ 成功: /path/to/cache/materials/material_5d41402abc4b2a.jpg
⏱️  耗时: 2834ms
```

---

## 5️⃣ 常见问题

### **Q1: API Key无效**
- 检查是否复制完整
- 检查是否有多余空格
- 重新生成API Key

### **Q2: 请求失败**
- 检查网络连接
- 检查API免费额度是否用完
- 查看错误日志

### **Q3: 没有返回结果**
- 关键词可能太具体
- 尝试更通用的关键词
- 使用英文关键词

---

## 6️⃣ API使用建议

### **优先级策略**
```
1. Unsplash (高质量，艺术性强)
2. Pexels (高质量，商业性强)
3. Pixabay (数量多，质量中等)
```

### **节省额度**
- ✅ 使用缓存（自动）
- ✅ 预热常用关键词
- ✅ 避免重复搜索

### **最佳实践**
- 使用有意义的应用名称
- 遵守平台使用条款
- 标注图片来源（可选）

---

## 📊 估算使用量

### **场景：每天生成10个视频**
```
每个视频: 4个关键词
每天搜索: 40次

第1天: 40次API调用 (在Unsplash免费额度内)
第7天: 20次API调用 (缓存命中率50%)
第30天: 5次API调用 (缓存命中率90%)
```

**结论**：完全在免费额度内 ✅

---

## ✅ 配置完成后

1. 确认.env文件已更新
2. 重启应用程序
3. 运行测试脚本
4. 检查缓存目录

**现在可以开始测试MaterialSearchService了！** 🚀
