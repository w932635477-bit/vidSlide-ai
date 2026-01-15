# 占位符图片说明

## 📁 图片位置

所有占位符图片已从桌面UI设计文件夹复制到项目中：
- **位置**: `public/assets/placeholders/`
- **英雄区背景**: `public/assets/hero-bg.png`

## 🖼️ 可用图片列表

### 英雄区背景图
- **文件**: `hero-bg.png` (3MB)
- **用途**: 首页英雄区淡背景
- **当前状态**: ✅ 已应用（透明度8%）

### UI设计截图（占位符）
以下图片可用作功能展示卡片的背景或示例图：

1. **截屏2026-01-09 13.48.18.png** (1.9MB)
   - 建议用途: 大卡片背景（AI智能分析）

2. **截屏2026-01-09 14.10.26.png** (183KB)
   - 建议用途: 小卡片图标或缩略图

3. **截屏2026-01-09 15.53.06.png** (2.0MB)
   - 建议用途: 中卡片背景（画中画效果）

4. **截屏2026-01-09 15.54.29.png** (422KB)
   - 建议用途: 功能演示图

5. **截屏2026-01-09 15.54.41.png** (1.3MB)
   - 建议用途: 模板展示图

6. **截屏2026-01-09 15.54.57.png** (1.8MB)
   - 建议用途: 工作流程图

7. **截屏2026-01-09 15.55.17.png** (259KB)
   - 建议用途: 小功能图标

8. **截屏2026-01-09 15.55.30.png** (108KB)
   - 建议用途: 按钮图标或小图标

## 🎨 如何使用这些图片

### 方法1: 作为Bento卡片背景

在 `HomeView.vue` 中，为每个 `.bento-card` 添加背景图：

```vue
<div class="bento-card bento-large" style="background-image: url('/assets/placeholders/截屏2026-01-09 13.48.18.png'); background-size: cover; background-position: center;">
  <!-- 卡片内容 -->
</div>
```

### 方法2: 在CSS中添加背景

在 `home-apple-style.css` 中添加：

```css
.bento-card.feature-ai {
  background-image: url('/assets/placeholders/截屏2026-01-09 13.48.18.png');
  background-size: cover;
  background-position: center;
  background-blend-mode: overlay;
}

.bento-card.feature-ai::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.92);  /* 白色遮罩 */
  z-index: 0;
}

.bento-content {
  position: relative;
  z-index: 1;
}
```

### 方法3: 作为独立图片元素

```vue
<div class="bento-card">
  <img src="/assets/placeholders/截屏2026-01-09 15.54.29.png"
       alt="功能演示"
       class="feature-image">
  <div class="bento-content">
    <!-- 内容 -->
  </div>
</div>
```

## 🔄 建议的图片重命名

为了更好的可维护性，建议将这些截图重命名为：

```bash
# 在 public/assets/placeholders/ 目录下执行
mv "截屏2026-01-09 13.48.18.png" "feature-ai-analysis.png"
mv "截屏2026-01-09 14.10.26.png" "feature-icon-small.png"
mv "截屏2026-01-09 15.53.06.png" "feature-pip-effect.png"
mv "截屏2026-01-09 15.54.29.png" "feature-demo.png"
mv "截屏2026-01-09 15.54.41.png" "feature-templates.png"
mv "截屏2026-01-09 15.54.57.png" "feature-workflow.png"
mv "截屏2026-01-09 15.55.17.png" "feature-icon-medium.png"
mv "截屏2026-01-09 15.55.30.png" "feature-icon-tiny.png"
```

## 📝 当前应用状态

### ✅ 已应用
- 英雄区背景图 (`hero-bg.png`) - 透明度8%，带白色渐变遮罩

### ⏳ 待应用
- Bento Grid卡片背景图
- 功能演示图片
- 模板预览图

## 🎯 下一步建议

1. **优化图片大小**
   - 使用 ImageOptim 或 TinyPNG 压缩图片
   - 目标：将大图压缩到 < 500KB

2. **生成WebP格式**
   ```bash
   # 使用 cwebp 转换
   for img in *.png; do
     cwebp -q 85 "$img" -o "${img%.png}.webp"
   done
   ```

3. **添加懒加载**
   ```vue
   <img loading="lazy" src="/assets/placeholders/feature-demo.png">
   ```

4. **使用响应式图片**
   ```vue
   <picture>
     <source srcset="/assets/placeholders/feature-demo.webp" type="image/webp">
     <img src="/assets/placeholders/feature-demo.png" alt="功能演示">
   </picture>
   ```

## 🔍 图片质量检查

| 图片 | 大小 | 尺寸 | 建议 |
|------|------|------|------|
| hero-bg.png | 3.0MB | 需检查 | ⚠️ 需要压缩 |
| 截屏...13.48.18 | 1.9MB | 需检查 | ⚠️ 需要压缩 |
| 截屏...14.10.26 | 183KB | 需检查 | ✅ 大小合适 |
| 截屏...15.53.06 | 2.0MB | 需检查 | ⚠️ 需要压缩 |
| 截屏...15.54.29 | 422KB | 需检查 | ✅ 大小合适 |
| 截屏...15.54.41 | 1.3MB | 需检查 | ⚠️ 需要压缩 |
| 截屏...15.54.57 | 1.8MB | 需检查 | ⚠️ 需要压缩 |
| 截屏...15.55.17 | 259KB | 需检查 | ✅ 大小合适 |
| 截屏...15.55.30 | 108KB | 需检查 | ✅ 大小合适 |

---

**更新时间**: 2026-01-14
**图片来源**: 桌面/UI设计文件夹
