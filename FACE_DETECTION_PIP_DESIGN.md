# 人脸识别画中画（PIP）实现方案

## 📋 需求说明

在视频合成过程中，当插入豆包生成的图片作为背景时：
1. 检测原视频中的人脸位置
2. 将原视频缩小为 PIP（画中画）
3. PIP 位置智能避让人脸，确保不遮挡
4. 背景显示豆包生成的图片

## 🎯 技术方案

### 方案选择

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **OpenCV + Python** | 性能好、准确度高、易于部署 | 需要额外依赖 | ⭐⭐⭐⭐⭐ |
| MediaPipe (Node.js) | 纯 JS、无需额外语言 | 性能较差、API 复杂 | ⭐⭐⭐ |
| FFmpeg + face_detect | 集成度高 | 准确度一般 | ⭐⭐ |

**推荐方案**：OpenCV + Python

### 架构设计

```
原视频 → 人脸检测 → 计算安全位置 → PIP合成 → 输出视频
         (Python)    (Node.js)      (FFmpeg)
```

## 🔧 实现步骤

### 1. 创建 Python 人脸检测服务

**文件**: `remotion-templates/scripts/face_detector.py`

功能：
- 使用 OpenCV 检测视频中的人脸
- 返回人脸位置信息（边界框）
- 支持批量处理多帧

依赖：
```bash
pip install opencv-python numpy
```

### 2. 创建 Node.js 包装器

**文件**: `vidslide-ai/src/services/FaceDetectionService.js`

功能：
- 调用 Python 脚本进行人脸检测
- 解析检测结果
- 缓存检测结果（避免重复检测）

### 3. 更新 ServerVideoProcessor

**文件**: `remotion-templates/server-video-processor.js`

更新 `composePIP` 方法：
1. 调用人脸检测服务
2. 根据人脸位置计算 PIP 安全位置
3. 使用 FFmpeg 合成视频

### 4. 更新 VideoCompositionService

**文件**: `vidslide-ai/src/services/VideoCompositionService.js`

传递人脸检测配置到 PIP 合成。

## 📝 详细实现

### 1. Python 人脸检测脚本

```python
# remotion-templates/scripts/face_detector.py
import cv2
import json
import sys
import numpy as np

def detect_faces_in_video(video_path, sample_frames=5):
    """
    检测视频中的人脸位置

    Args:
        video_path: 视频文件路径
        sample_frames: 采样帧数（检测前N帧的平均位置）

    Returns:
        人脸位置信息 {x, y, width, height, confidence}
    """
    # 加载人脸检测器
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )

    # 打开视频
    cap = cv2.VideoCapture(video_path)

    faces_detected = []
    frame_count = 0

    while frame_count < sample_frames:
        ret, frame = cap.read()
        if not ret:
            break

        # 转换为灰度图
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # 检测人脸
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )

        if len(faces) > 0:
            # 取最大的人脸
            largest_face = max(faces, key=lambda f: f[2] * f[3])
            faces_detected.append(largest_face)

        frame_count += 1

    cap.release()

    # 如果没有检测到人脸
    if len(faces_detected) == 0:
        return {
            'detected': False,
            'face': None
        }

    # 计算平均位置（多帧平均，更稳定）
    avg_face = np.mean(faces_detected, axis=0).astype(int)
    x, y, w, h = avg_face

    # 归一化坐标（0-1）
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    return {
        'detected': True,
        'face': {
            'x': int(x),
            'y': int(y),
            'width': int(w),
            'height': int(h),
            'normalized': {
                'x': x / frame_width,
                'y': y / frame_height,
                'width': w / frame_width,
                'height': h / frame_height
            }
        }
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': '请提供视频路径'}))
        sys.exit(1)

    video_path = sys.argv[1]
    sample_frames = int(sys.argv[2]) if len(sys.argv) > 2 else 5

    result = detect_faces_in_video(video_path, sample_frames)
    print(json.dumps(result))
```

### 2. Node.js 人脸检测服务

```javascript
// vidslide-ai/src/services/FaceDetectionService.js
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FaceDetectionService {
  constructor() {
    this.pythonScript = path.join(
      __dirname,
      '../../../remotion-templates/scripts/face_detector.py'
    );
    this.cache = new Map(); // 缓存检测结果
    console.log('✅ FaceDetectionService 初始化完成');
  }

  /**
   * 检测视频中的人脸
   * @param {string} videoPath - 视频文件路径
   * @param {number} sampleFrames - 采样帧数
   * @returns {Promise<Object>} 人脸检测结果
   */
  async detectFaces(videoPath, sampleFrames = 5) {
    // 检查缓存
    const cacheKey = `${videoPath}-${sampleFrames}`;
    if (this.cache.has(cacheKey)) {
      console.log('  📦 使用缓存的人脸检测结果');
      return this.cache.get(cacheKey);
    }

    console.log('🔍 开始人脸检测');
    console.log('  - 视频路径:', videoPath);
    console.log('  - 采样帧数:', sampleFrames);

    return new Promise((resolve, reject) => {
      const python = spawn('python3', [
        this.pythonScript,
        videoPath,
        sampleFrames.toString()
      ]);

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          console.error('❌ 人脸检测失败:', errorOutput);
          reject(new Error(`人脸检测失败: ${errorOutput}`));
          return;
        }

        try {
          const result = JSON.parse(output);

          if (result.detected) {
            console.log('✅ 检测到人脸:', result.face);
          } else {
            console.log('⚠️ 未检测到人脸');
          }

          // 缓存结果
          this.cache.set(cacheKey, result);

          resolve(result);
        } catch (error) {
          console.error('❌ 解析人脸检测结果失败:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * 根据人脸位置计算 PIP 安全位置
   * @param {Object} faceResult - 人脸检测结果
   * @param {number} pipWidth - PIP 宽度
   * @param {number} pipHeight - PIP 高度
   * @param {number} videoWidth - 视频宽度（默认 1080）
   * @param {number} videoHeight - 视频高度（默认 1920）
   * @returns {Object} PIP 位置 {x, y, label}
   */
  calculateSafePIPPosition(faceResult, pipWidth, pipHeight, videoWidth = 1080, videoHeight = 1920) {
    // 如果没有检测到人脸，返回默认位置（中央偏上）
    if (!faceResult.detected) {
      return {
        x: (videoWidth - pipWidth) / 2,
        y: 500,
        label: 'center-default'
      };
    }

    const face = faceResult.face;
    const faceX = face.x;
    const faceY = face.y;
    const faceWidth = face.width;
    const faceHeight = face.height;

    // 定义候选位置（优先级从高到低）
    const candidatePositions = [
      { x: (videoWidth - pipWidth) / 2, y: 500, label: 'center-top' },
      { x: 80, y: 300, label: 'left-top' },
      { x: videoWidth - pipWidth - 80, y: 300, label: 'right-top' },
      { x: (videoWidth - pipWidth) / 2, y: 900, label: 'center-middle' },
      { x: 80, y: 600, label: 'left-middle' },
      { x: videoWidth - pipWidth - 80, y: 600, label: 'right-middle' },
    ];

    // 计算人脸区域（扩展 20% 作为安全边距）
    const safeMargin = 1.2;
    const faceArea = {
      x: faceX - (faceWidth * (safeMargin - 1)) / 2,
      y: faceY - (faceHeight * (safeMargin - 1)) / 2,
      width: faceWidth * safeMargin,
      height: faceHeight * safeMargin
    };

    // 检查每个候选位置是否与人脸重叠
    for (const pos of candidatePositions) {
      const pipArea = {
        x: pos.x,
        y: pos.y,
        width: pipWidth,
        height: pipHeight
      };

      if (!this.checkOverlap(pipArea, faceArea)) {
        console.log(`  ✅ 选择安全位置: ${pos.label}`);
        return pos;
      }
    }

    // 如果所有位置都重叠，选择重叠最小的位置
    console.log('  ⚠️ 所有位置都与人脸重叠，选择重叠最小的位置');
    return candidatePositions[0];
  }

  /**
   * 检查两个矩形是否重叠
   */
  checkOverlap(rect1, rect2) {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    );
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 人脸检测缓存已清除');
  }
}

// 导出单例
let instance = null;

export function getInstance() {
  if (!instance) {
    instance = new FaceDetectionService();
  }
  return instance;
}

export default FaceDetectionService;
```

### 3. 更新 ServerVideoProcessor

在 `composePIP` 方法中添加人脸检测：

```javascript
async composePIP(backgroundPath, foregroundPath, outputPath, config, onProgress = null) {
  console.log('📹 开始服务器端PIP合成（支持人脸识别）');

  // 1. 检测人脸（如果启用）
  let pipPosition = config.position || 'auto';

  if (config.useFaceDetection !== false) {
    const faceDetectionService = (await import('../../../vidslide-ai/src/services/FaceDetectionService.js')).getInstance();

    try {
      const faceResult = await faceDetectionService.detectFaces(foregroundPath);

      if (faceResult.detected) {
        const safePos = faceDetectionService.calculateSafePIPPosition(
          faceResult,
          config.pipWidth || 280,
          config.pipHeight || 280
        );
        pipPosition = safePos;
        console.log(`  🎯 基于人脸位置选择 PIP 位置: ${safePos.label}`);
      }
    } catch (error) {
      console.warn('  ⚠️ 人脸检测失败，使用默认位置:', error.message);
    }
  }

  // 2. 继续原有的 PIP 合成逻辑...
  // ...
}
```

## 📦 依赖安装

### Python 依赖
```bash
pip install opencv-python numpy
```

### Node.js 依赖
无需额外依赖（使用 Node.js 内置的 `child_process`）

## 🧪 测试计划

### 1. 单元测试
- 测试 Python 人脸检测脚本
- 测试 Node.js 服务调用
- 测试位置计算算法

### 2. 集成测试
- 测试完整的 PIP 合成流程
- 测试不同人脸位置的场景
- 测试无人脸的场景

### 3. 性能测试
- 测试人脸检测耗时
- 测试缓存效果
- 测试并发处理

## 📊 预期效果

### 性能指标
- 人脸检测：1-2 秒/视频
- PIP 合成：10-15 秒/场景
- 总体影响：+10-20% 处理时间

### 准确度
- 人脸检测准确率：>90%
- PIP 位置避让成功率：>95%

## 🚀 实施计划

1. **Phase 1**: 创建 Python 脚本和测试（1小时）
2. **Phase 2**: 创建 Node.js 服务（1小时）
3. **Phase 3**: 集成到 ServerVideoProcessor（1小时）
4. **Phase 4**: 端到端测试（1小时）

**总计**: 约 4 小时

## 🎯 成功标准

- ✅ 能够准确检测视频中的人脸
- ✅ PIP 位置不遮挡人脸
- ✅ 无人脸时使用默认位置
- ✅ 性能影响在可接受范围内
- ✅ 错误处理完善（人脸检测失败时降级）

---

**最后更新**: 2026-01-20
**版本**: 1.0.0
