# Remotion渲染服务器快速参考

## 快速启动

```bash
cd remotion-templates
./start-server.sh
```

## 快速测试

```bash
cd remotion-templates
./test-server.sh
```

## API端点

### 基础URL
```
http://localhost:3002
```

### 1. 健康检查
```bash
GET /health

# 示例
curl http://localhost:3002/health
```

### 2. 获取模板列表
```bash
GET /templates

# 示例
curl http://localhost:3002/templates
```

### 3. 创建渲染任务
```bash
POST /render
Content-Type: application/json

{
  "composition": "模板ID",
  "props": {
    "title": "标题",
    "subtitle": "副标题"
  },
  "options": {
    "codec": "h264"
  }
}

# 示例
curl -X POST http://localhost:3002/render \
  -H "Content-Type: application/json" \
  -d '{
    "composition": "GlassmorphismStack",
    "props": {
      "title": "我的视频",
      "subtitle": "精彩内容"
    }
  }'
```

### 4. 查询渲染进度
```bash
GET /progress/:renderId

# 示例
curl http://localhost:3002/progress/your-render-id
```

### 5. 取消渲染
```bash
POST /cancel/:renderId

# 示例
curl -X POST http://localhost:3002/cancel/your-render-id
```

### 6. 下载视频
```bash
GET /download/:renderId

# 示例
curl http://localhost:3002/download/your-render-id -o video.mp4
```

## 可用模板

### 展示类 (showcase)
- `GlassmorphismStack` - 磨砂玻璃3D堆叠
- `LuxuryProductShowcase` - 奢华金色卡片
- `NeumorphismSoft` - 新拟态柔和
- `HolographicRainbow` - 全息彩虹
- `MinimalWhiteSpace` - 极简留白

### 对比类 (comparison)
- `SplitComparison` - 分屏对比
- `BeforeAfterSlider` - 前后滑动对比
- `DiagonalSplit` - 对角线分割
- `CircularReveal` - 圆形揭示
- `FlipCard` - 3D翻转卡片

### 数据可视化 (data)
- `AnimatedBarChart` - 动态柱状图
- `CircularProgress` - 环形进度图
- `LineChartFlow` - 流动曲线图
- `RadarChart` - 雷达图展示
- `InfographicGrid` - 信息图表网格

### 文字动画 (text)
- `KineticTypography` - 动态字体分解
- `NeonGlowText` - 霓虹发光文字
- `LiquidMorphText` - 液态变形文字
- `GlitchText` - 故障艺术文字
- `ThreeDExtrudeText` - 3D挤出文字

### 特效类 (effects)
- `ParticleExplosion` - 粒子爆炸
- `RippleWave` - 涟漪波纹
- `LightBeamScan` - 光束扫描
- `MorphShapeTransition` - 形态变换
- `FloatingIslands` - 漂浮岛屿

### 混合效果 (mixed)
- `MagneticCards` - 磁吸卡片
- `PerspectiveGallery` - 透视画廊
- `SplitFlap` - 翻页显示屏
- `CrystalPrism` - 水晶棱镜
- `InkSpread` - 墨水扩散

## 渲染状态

- `pending` - 等待中
- `rendering` - 渲染中
- `done` - 完成
- `error` - 错误
- `cancelled` - 已取消

## 常见问题

### 服务器无法启动
```bash
# 检查端口是否被占用
lsof -i :3002

# 杀死占用端口的进程
kill -9 <PID>
```

### 依赖安装失败
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 渲染失败
- 检查模板ID是否正确
- 检查props参数是否符合模板要求
- 查看服务器日志获取详细错误信息

## 目录结构

```
remotion-templates/
├── src/                    # 模板源代码
│   ├── index.jsx          # 入口文件
│   └── templates/         # 模板组件
├── output/                # 渲染输出目录
├── server.js              # 渲染服务器
├── start-server.sh        # 启动脚本
├── test-server.sh         # 测试脚本
├── package.json           # 依赖配置
└── remotion.config.js     # Remotion配置
```

## 性能建议

1. **并发控制**: 建议同时渲染任务不超过3个
2. **内存管理**: 每个渲染任务约需1-2GB内存
3. **磁盘空间**: 确保output目录有足够空间
4. **清理策略**: 定期清理旧的渲染文件

## 集成到VidSlide AI

在RemotionService.js中配置：

```javascript
const REMOTION_SERVER = 'http://localhost:3002'

// 获取模板列表
const templates = await fetch(`${REMOTION_SERVER}/templates`)

// 创建渲染任务
const response = await fetch(`${REMOTION_SERVER}/render`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    composition: 'GlassmorphismStack',
    props: { title: '标题', subtitle: '副标题' }
  })
})

// 轮询进度
const checkProgress = async (renderId) => {
  const response = await fetch(`${REMOTION_SERVER}/progress/${renderId}`)
  return response.json()
}
```
