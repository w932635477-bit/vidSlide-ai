# V0 设计提示词模板

## 🍎 苹果设计师的设计理念

**重要提示**: 请以苹果设计师的身份来设计这些模板。想象你是苹果设计团队的一员，为VidSlide AI设计专业的PPT模板系统。

### 苹果设计师的核心思考框架
- **用户为中心**: 每个设计决策都要服务于用户的核心需求
- **系统一致性**: 所有模板遵循相同的视觉语言和交互模式
- **细节完美主义**: 关注每一个像素、每一个动画的精确度
- **功能美学平衡**: 功能强大但设计优雅简洁
- **情感共鸣**: 创造让用户喜爱的体验

### 苹果设计原则应用到PPT模板
- **Clarity (清晰)**: 让内容一目了然，避免视觉噪音
- **Depth (深度)**: 使用阴影、透视创造层次感
- **Deference (谦逊)**: 模板服务于内容，不喧宾夺主
- **Fluidity (流畅)**: 动画自然流畅，如iOS般的体验
- **Consistency (一致)**: 金色强调色贯穿始终

### 参考苹果产品
- **iOS界面**: 圆角、留白、微妙的阴影
- **Keynote**: 优雅的过渡动画和模板设计
- **macOS**: 毛玻璃效果、深度层次
- **Apple Watch**: 信息密度与美学的完美平衡

## 🎯 核心设计指令 - 苹果风格

### 主提示词 (Primary Prompt) - 苹果设计师版本
```
As an Apple designer, design an elegant PPT template system for VidSlide AI with these 5 templates, following Apple's design principles of clarity, depth, deference, and fluidity:

1. Picture-in-Picture Template:
   - Circular video container (25% size, white 2px border)
   - 4 position options (top-right, top-left, bottom-right, bottom-left)
   - 3 styles: Simple (no shadow), Professional (light shadow), Active (animated border)
   - Black semi-transparent overlay (40% opacity)

2. Info Card Template:
   - Gold border (#FFD700), dark gray background (#1A1A1A)
   - Title area + 1-3 content rows with colored squares + gold arrows
   - Pulse highlight effect when speaking
   - 80% width × 60% height, center zoom animation

3. Keyword Highlight Template:
   - Centered highlight card (50% × 18%)
   - Gold border, white title + English subtitle
   - Black text shadow, fade-in + float animation
   - 45% black overlay background

4. Document Display Template:
   - 3D stacked layout (X:5° Y:10° rotation)
   - 1/3 overlap between documents
   - Focus zoom + subtle shake animation
   - 65% black overlay background

5. Title Text Template:
   - Full screen centered text (30% screen height)
   - Text shadow (2px offset), fade-in/out animation

Color scheme: Gold (#FFD700), White (#FFFFFF), Dark Gray (#1A1A1A), Black (#000000)
Style: Enterprise PPT quality, clean, modern, professional
```

## 🎨 模板专用提示词

### 画中画模板 (PIP Template) - 苹果风格
```
Design a picture-in-picture template with Apple-like elegance:
- Main video: full screen with subtle blur effect
- PIP container: perfectly rounded (16px corner radius), floating card style
- Glass morphism: semi-transparent background with blur effect
- Shadow: soft multi-layer shadows for depth
- Position: carefully positioned to avoid content obstruction
- Animation: smooth spring animation (like iOS transitions)
- Materials: use frosted glass effect, similar to macOS design
- Attention to detail: pixel-perfect alignment and spacing
```

### 信息卡片模板 (Info Card) - 苹果风格
```
Create an information card with iOS notification center aesthetics:
- Card design: large corner radius (24px), floating card appearance
- Material: frosted glass background with subtle texture
- Layout: generous white space, clear visual hierarchy
- Color accents: subtle gold accents, not overpowering
- Typography: SF Pro font family, perfect letter spacing
- Animation: gentle bounce entrance, smooth micro-interactions
- Depth: multi-layer shadows creating floating effect
- Attention to proportion: golden ratio inspired layout
```

### 关键词高亮模板 (Keyword Highlight) - 苹果风格
```
Design a keyword highlight with Apple alert/banner aesthetics:
- Card style: translucent white background, subtle blur effect
- Border: hairline gold accent, not heavy
- Typography: SF Pro Display for title, SF Pro Text for subtitle
- Spacing: generous padding, breathing room for text
- Shadow: soft shadow creating floating effect
- Animation: smooth slide-in from top with bounce
- Color: careful use of gold as accent, not dominant
- Timing: elegant entrance and exit transitions
```

### 文件展示模板 (Document Display) - 苹果风格
```
Create a document stack with macOS Finder aesthetics:
- Documents: realistic paper appearance with subtle textures
- 3D effect: gentle perspective, not exaggerated
- Materials: paper texture with soft drop shadows
- Corners: rounded corners (12px radius)
- Stacking: natural overlap with depth cues
- Animation: smooth slide-in with staggered timing
- Lighting: subtle highlights and shadows for realism
- Spacing: careful attention to proportions and alignment
```

### 标题文字模板 (Title Text) - 苹果风格
```
Design a full-screen title with Apple tvOS aesthetics:
- Typography: SF Pro Display, perfect kerning and leading
- Centering: pixel-perfect optical centering
- Shadow: subtle drop shadow for depth
- Animation: elegant fade transitions with easing
- Background: minimal, content-focused approach
- Scale: responsive sizing maintaining proportions
- Timing: carefully choreographed entrance and exit
```

## 🎛️ 界面组件提示词

### 属性面板 (Property Panel)
```
Design a right-side property panel (300px width):
- Header: "[Template Name] Settings"
- Basic Settings section:
  - Position dropdown (PIP only)
  - Size slider (10%-50%)
  - Color palette (5-8 preset colors)
- Content Edit section:
  - Text input fields (1-3 rows)
  - Add/Remove row buttons
- Asset Replace section:
  - Thumbnail preview + replace button
  - Drag-drop upload area

Style: Clean, grouped sections, consistent spacing
```

### 时间轴编辑器 (Timeline Editor)
```
Create a timeline editor (bottom 200px height):
- Time scale ruler on top
- Track lanes: Video, Text, Effects, Audio
- Keyframe markers: draggable circles
- Time indicator line: current position
- Zoom controls: zoom in/out buttons
- Current time display: MM:SS format

Interactive: click to seek, drag keyframes, hover tooltips
```

## 📱 响应式设计提示词

### 桌面版本 (Desktop)
```
Full-featured desktop design:
- Property panel: right sidebar 300px
- Timeline: bottom 200px
- Main canvas: remaining space
- All controls visible
- Drag-drop interactions
- Keyboard shortcuts support
```

### 平板版本 (Tablet)
```
Tablet-optimized design:
- Collapsible property panel
- Simplified timeline controls
- Touch-friendly interactions
- Larger touch targets
- Portrait/landscape adaptation
```

### 手机版本 (Mobile)
```
Mobile-first design:
- Hidden edit controls by default
- Tap to edit mode
- Simplified property panel
- Read-only preview mode
- Touch gestures for timeline
```

## 🎬 动画规范提示词

### 进入动画 (Entrance Animations)
```
Consistent entrance animations:
- Fade-in: 0.2-0.3 seconds, ease-out
- Scale: 0.9→1.0, ease-out-back
- Slide: from edge to center, ease-out-cubic
- All animations: smooth, professional, not distracting
```

### 交互动画 (Interaction Animations)
```
Subtle interaction feedback:
- Hover: slight scale up 1.0→1.05
- Click: brief scale down 1.0→0.95
- Focus: border color change
- Loading: smooth progress indicators
```

## 🎨 色彩和字体规范

### 色彩系统 (Color System)
```
Primary colors:
- Gold: #FFD700 (accents, borders, highlights)
- White: #FFFFFF (text, backgrounds)
- Dark Gray: #1A1A1A (card backgrounds)
- Black: #000000 (overlays, shadows)

Semantic colors:
- Success: #52C41A (green)
- Warning: #FAAD14 (yellow)
- Error: #FF4D4F (red)
- Info: #1890FF (blue)
```

### 字体系统 (Typography)
```
Font hierarchy:
- H1 Title: 48px+, Bold, Gold color
- H2 Subtitle: 32px+, Regular, White
- Body Text: 24px+, Regular, White
- Caption: 16px+, Regular, Light Gray

Font family: System font stack (inter, etc.)
```

## 🔧 快速迭代提示词

### 优化指令 (Optimization Prompts)
```
Make the design more professional:
- Increase border radius for modern look
- Add subtle shadows for depth
- Improve color contrast for accessibility
- Enhance spacing for better visual hierarchy
- Add micro-interactions for polish
```

```
Simplify the interface:
- Remove unnecessary elements
- Consolidate similar controls
- Use icons instead of text where possible
- Streamline the workflow
- Focus on core functionality
```

```
Make it more responsive:
- Adjust layouts for different screen sizes
- Optimize touch targets for mobile
- Simplify controls on small screens
- Ensure readability on all devices
```
