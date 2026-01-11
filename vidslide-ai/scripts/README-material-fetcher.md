# VidSlide AI 自动素材获取器

自动从Unsplash、Pexels、Pixabay获取并组织VidSlide AI本地素材库的工具。

## 🚀 功能特性

- **多平台支持**: 同时从Unsplash、Pexels、Pixabay获取素材
- **智能分类**: 按功能类型和行业领域自动分类
- **用户导向**: 针对4种用户类型优化素材选择
- **质量筛选**: 自动过滤低质量和重复素材
- **增量更新**: 支持断点续传和增量下载
- **元数据管理**: 完整的素材信息和版权记录

## 📂 素材分类体系

### 功能类型
- **icons**: 基础图标 (technology, business, education, lifestyle)
- **charts**: 图表元素 (data, business_charts, education_charts)
- **backgrounds**: 背景模板 (modern, business, education, creative)
- **decorations**: 装饰元素 (arrows, shapes, dividers)

### 用户类型适配
- **自媒体创作者**: 现代潮流风格，适合社交媒体
- **知识博主**: 专业学术风格，建立权威形象
- **企业培训师**: 商务专业风格，企业品牌统一
- **教育工作者**: 生动友好风格，适合学生认知

## 🛠️ 使用方法

### 1. 安装依赖
```bash
npm install
```

### 2. 运行素材获取
```bash
# 获取所有分类的素材
npm run fetch-materials

# 或者直接运行脚本
node scripts/auto-material-fetcher.js
```

### 3. 查看结果
```bash
# 检查下载的素材
ls -la public/materials/

# 查看元数据
cat public/materials/materials-metadata.json

# 查看用户推荐配置
cat public/materials/user-recommendations.json
```

## ⚙️ 配置说明

### API配置
脚本已内置以下API密钥：
- **Unsplash**: `zPjqHo_L8Vx-gckbifgYM1bJxnYbFRgFXLXFwWcAN30`
- **Pexels**: `LnDV3UqDXRD71HMtGzXByhFF1mwwuHdU4RKXsMKtjgHOaCOV1iwrA0Xz`
- **Pixabay**: `52722038-7ac4769e00433c06f9c6333bc`

### 下载配置
```javascript
{
  maxImagesPerCategory: 50,    // 每个分类最大图片数
  maxImagesPerKeyword: 10,     // 每个关键词最大图片数
  minImageSize: 800,           // 最小图片尺寸
  outputDir: 'public/materials' // 输出目录
}
```

## 📊 输出结构

```
public/materials/
├── icons/
│   ├── technology/
│   ├── business/
│   ├── education/
│   └── lifestyle/
├── charts/
│   ├── data/
│   ├── business_charts/
│   └── education_charts/
├── backgrounds/
│   ├── modern/
│   ├── business/
│   ├── education/
│   └── creative/
├── decorations/
│   ├── arrows/
│   ├── shapes/
│   └── dividers/
├── materials-metadata.json      # 素材元数据
└── user-recommendations.json    # 用户推荐配置
```

## 📋 元数据格式

### 素材信息
```json
{
  "id": "素材ID",
  "title": "素材标题",
  "sourceUrl": "原始URL",
  "localPath": "本地路径",
  "width": 1920,
  "height": 1080,
  "source": "unsplash|pexels|pixabay",
  "author": "作者名",
  "license": "许可证",
  "tags": ["标签1", "标签2"],
  "downloadTime": "2024-01-11T10:00:00.000Z"
}
```

### 用户推荐配置
```json
{
  "自媒体创作者": {
    "icons": {
      "technology": {
        "keywords": ["modern", "computer", "digital"],
        "availableMaterials": 45,
        "recommended": true
      }
    }
  }
}
```

## 🔍 质量控制

### 筛选标准
- **尺寸过滤**: 最小800×800像素
- **比例过滤**: 宽高比0.1-10之间
- **去重检查**: 基于URL避免重复下载
- **版权合规**: 只选择免版税素材

### 性能优化
- **并发控制**: 避免API限制
- **断点续传**: 支持中断后继续
- **缓存机制**: 本地记录已下载素材

## 📈 统计信息

运行完成后会显示：
- 本次新增素材数量
- 总素材数量
- 各平台素材分布
- 分类完成情况

## 🛠️ 故障排除

### 常见问题

1. **网络连接失败**
   ```bash
   # 检查网络连接
   ping api.unsplash.com
   ```

2. **API限制错误**
   ```bash
   # API有速率限制，等待后重试
   sleep 60 && npm run fetch-materials
   ```

3. **磁盘空间不足**
   ```bash
   # 检查可用空间
   df -h
   ```

4. **权限问题**
   ```bash
   # 确保脚本有写入权限
   chmod +x scripts/auto-material-fetcher.js
   ```

## 🔄 更新机制

### 增量更新
脚本会自动检测已存在的素材，避免重复下载。

### 定期更新
建议每月运行一次，获取最新素材：
```bash
# 设置定时任务
crontab -e
# 添加: 0 2 1 * * cd /path/to/vidslide-ai && npm run fetch-materials
```

## 📝 注意事项

- 首次运行可能需要较长时间（30-60分钟）
- 确保网络连接稳定
- 下载的素材仅供VidSlide AI内部使用
- 尊重各平台的API使用条款

## 🤝 贡献

如需添加新的素材分类或改进算法，请修改 `MATERIAL_CATEGORIES` 配置和相关逻辑。