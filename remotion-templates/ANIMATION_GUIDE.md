# 动画效果调节指南

## 🎬 可调节的动画参数

### 1. 动画速度
```javascript
{
  animationSpeed: 1.0,  // 1.0 = 正常速度
                        // 0.5 = 慢一半
                        // 2.0 = 快一倍
}
```

### 2. 动画时长
```javascript
// 在 Root.jsx 中配置
<Composition
  durationInFrames={150}  // 150帧 = 5秒 (30fps)
                          // 90帧 = 3秒
                          // 300帧 = 10秒
  fps={30}                // 帧率：30fps 或 60fps
/>
```

### 3. 动画缓动函数
```javascript
// 在模板中配置 spring 参数
spring({
  frame,
  fps,
  config: {
    damping: 100,      // 阻尼：越大越快停止 (10-200)
    stiffness: 200,    // 刚度：越大越快速 (50-500)
    mass: 0.5,         // 质量：越大越慢 (0.1-2)
  }
})
```

### 4. 入场动画类型

#### 淡入 (Fade In)
```javascript
const opacity = interpolate(progress, [0, 1], [0, 1])
```

#### 滑入 (Slide In)
```javascript
const translateY = interpolate(progress, [0, 1], [100, 0])  // 从下往上
const translateX = interpolate(progress, [0, 1], [-100, 0]) // 从左往右
```

#### 缩放 (Scale)
```javascript
const scale = interpolate(progress, [0, 1], [0, 1])  // 从小到大
const scale = interpolate(progress, [0, 1], [2, 1])  // 从大到小
```

#### 旋转 (Rotate)
```javascript
const rotate = interpolate(progress, [0, 1], [180, 0])  // 旋转入场
```

#### 3D 翻转 (3D Flip)
```javascript
const rotateY = interpolate(progress, [0, 1], [90, 0])  // Y轴翻转
const rotateX = interpolate(progress, [0, 1], [90, 0])  // X轴翻转
```

### 5. 延迟和错开

#### 元素依次出现
```javascript
elements.map((el, index) => {
  const delay = index * 10  // 每个元素延迟10帧
  const progress = spring({
    frame: frame - delay,
    fps,
  })
})
```

#### 波浪效果
```javascript
const delay = index * 5 + Math.sin(index) * 10
```

## 🎨 预设动画方案

### 方案 1：快速动感（适合产品展示）
```javascript
{
  animationSpeed: 1.5,
  config: {
    damping: 80,
    stiffness: 300,
    mass: 0.3,
  }
}
```

### 方案 2：平滑优雅（适合高端品牌）
```javascript
{
  animationSpeed: 0.8,
  config: {
    damping: 120,
    stiffness: 150,
    mass: 0.8,
  }
}
```

### 方案 3：弹性活泼（适合年轻化产品）
```javascript
{
  animationSpeed: 1.2,
  config: {
    damping: 60,
    stiffness: 400,
    mass: 0.5,
  }
}
```

### 方案 4：稳重专业（适合企业宣传）
```javascript
{
  animationSpeed: 1.0,
  config: {
    damping: 150,
    stiffness: 180,
    mass: 1.0,
  }
}
```

## 🔧 自定义动画示例

### 示例 1：自定义卡片入场动画
```javascript
// 创建自定义动画配置
const customAnimation = {
  // 卡片从右侧飞入
  entrance: {
    translateX: [500, 0],
    translateY: [0, 0],
    rotate: [45, 0],
    scale: [0.5, 1],
    opacity: [0, 1],
  },

  // 动画时机
  timing: {
    start: 20,      // 第20帧开始
    duration: 40,   // 持续40帧
  },

  // 缓动配置
  easing: {
    damping: 100,
    stiffness: 200,
  }
}

// 应用到模板
const cardProgress = spring({
  frame: frame - customAnimation.timing.start,
  fps,
  config: customAnimation.easing,
})

const translateX = interpolate(
  cardProgress,
  [0, 1],
  customAnimation.entrance.translateX
)
```

### 示例 2：文字逐字出现动画
```javascript
function AnimatedText({ text, startFrame }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <div>
      {text.split('').map((char, index) => {
        const charProgress = spring({
          frame: frame - startFrame - index * 2,  // 每个字延迟2帧
          fps,
          config: { damping: 100, stiffness: 300 },
        })

        const opacity = interpolate(charProgress, [0, 1], [0, 1])
        const translateY = interpolate(charProgress, [0, 1], [20, 0])

        return (
          <span
            key={index}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              display: 'inline-block',
            }}
          >
            {char}
          </span>
        )
      })}
    </div>
  )
}
```

### 示例 3：粒子爆炸效果
```javascript
function ParticleExplosion({ centerX, centerY, particleCount = 20 }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <>
      {Array.from({ length: particleCount }).map((_, index) => {
        const angle = (index / particleCount) * Math.PI * 2
        const distance = 200

        const progress = spring({
          frame: frame - 10,
          fps,
          config: { damping: 80, stiffness: 200 },
        })

        const x = centerX + Math.cos(angle) * distance * progress
        const y = centerY + Math.sin(angle) * distance * progress
        const opacity = interpolate(progress, [0, 0.5, 1], [0, 1, 0])

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#FFD700',
              opacity,
            }}
          />
        )
      })}
    </>
  )
}
```

## 📊 动画参数对照表

| 参数 | 范围 | 效果 | 推荐值 |
|------|------|------|--------|
| damping | 10-200 | 阻尼，控制停止速度 | 100 |
| stiffness | 50-500 | 刚度，控制弹性 | 200 |
| mass | 0.1-2 | 质量，控制惯性 | 0.5 |
| animationSpeed | 0.5-2 | 整体速度倍数 | 1.0 |
| fps | 24/30/60 | 帧率 | 30 |

## 🎯 根据场景选择动画

### 产品展示
- 速度：中等 (1.0-1.2)
- 弹性：适中
- 重点：突出产品

### 数据分析
- 速度：较慢 (0.8-1.0)
- 弹性：较小
- 重点：清晰易读

### 创意广告
- 速度：较快 (1.2-1.5)
- 弹性：较大
- 重点：吸引眼球

### 企业宣传
- 速度：稳定 (1.0)
- 弹性：较小
- 重点：专业稳重

## 💡 实际使用示例

```javascript
// 在 Vue 项目中调用时指定动画配置
const videoConfig = {
  template: 'ProductShowcaseEnhanced',
  props: {
    title: '产品标题',
    images: [...],

    // 动画配置
    animationSpeed: 1.2,        // 快20%
    animationStyle: 'bouncy',   // 弹性风格

    // 自定义每个元素的动画
    titleAnimation: {
      type: 'slideUp',
      duration: 30,
      delay: 10,
    },
    cardAnimation: {
      type: '3dFlip',
      duration: 40,
      stagger: 5,  // 错开5帧
    },
  }
}

await remotionService.renderVideo(videoConfig.template, videoConfig.props)
```

## 🔄 动态调整动画

用户可以在界面上实时调整：

```javascript
// 在 Vue 组件中
<template>
  <div>
    <el-slider
      v-model="animationSpeed"
      :min="0.5"
      :max="2"
      :step="0.1"
      label="动画速度"
    />

    <el-select v-model="animationStyle">
      <el-option value="smooth" label="平滑" />
      <el-option value="bouncy" label="弹性" />
      <el-option value="fast" label="快速" />
      <el-option value="elegant" label="优雅" />
    </el-select>

    <el-button @click="previewAnimation">预览动画</el-button>
  </div>
</template>

<script setup>
const animationSpeed = ref(1.0)
const animationStyle = ref('smooth')

const previewAnimation = async () => {
  const config = getAnimationConfig(animationStyle.value)

  await remotionService.renderVideo('ProductShowcaseEnhanced', {
    ...userContent,
    animationSpeed: animationSpeed.value,
    ...config,
  })
}
</script>
```

## ✅ 总结

动画完全可调节，包括：
- ✅ 速度（0.5x - 2x）
- ✅ 时长（任意秒数）
- ✅ 缓动函数（弹性、平滑等）
- ✅ 入场方式（淡入、滑入、旋转等）
- ✅ 延迟和错开
- ✅ 自定义动画效果

用户可以通过界面调整，也可以预设多种风格供选择！
