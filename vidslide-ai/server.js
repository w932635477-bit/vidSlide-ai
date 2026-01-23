/**
 * VidSlide AI 后端服务器
 * 提供视频处理 API
 *
 * 功能:
 * - 视频分割
 * - 视频合并
 * - 图片叠加
 * - 视频压缩
 */

// 加载环境变量
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

// 导入ServerAutoGenerationAgent
import ServerAutoGenerationAgent from './src/services/ServerAutoGenerationAgent.js';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 配置文件上传
const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB限制
});

// 确保必要的目录存在
const uploadsDir = path.join(__dirname, '../uploads');
const outputDir = path.join(__dirname, '../output');
const cacheDir = path.join(__dirname, '../cache');

[uploadsDir, outputDir, cacheDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'VidSlide AI Server is running' });
});

// 视频分割 API
app.post('/api/video/split', upload.single('video'), async (req, res) => {
  try {
    console.log('📥 收到视频分割请求');

    if (!req.file) {
      return res.status(400).json({ error: '未上传视频文件' });
    }

    const videoPath = req.file.path;
    const scenes = JSON.parse(req.body.scenes || '[]');

    // 生成任务ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const taskDir = path.join(outputDir, taskId);

    // 创建任务目录
    if (!fs.existsSync(taskDir)) {
      fs.mkdirSync(taskDir, { recursive: true });
    }

    console.log(`  - 任务ID: ${taskId}`);
    console.log(`  - 视频文件: ${req.file.originalname}`);
    console.log(`  - 场景数量: ${scenes.length}`);

    // 分割视频
    const segments = [];
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const outputPath = path.join(taskDir, `segment_${i}.mp4`);

      const startTime = scene.startTime || 0;
      const duration = (scene.endTime || 0) - startTime;

      // 使用 FFmpeg 分割视频
      const cmd = `ffmpeg -i "${videoPath}" -ss ${startTime} -t ${duration} -c copy "${outputPath}"`;

      try {
        await execAsync(cmd);
        segments.push({
          index: i,
          path: outputPath,
          startTime,
          endTime: scene.endTime
        });
        console.log(`  ✓ 分割片段 ${i + 1}/${scenes.length}`);
      } catch (error) {
        console.error(`  ✗ 分割片段 ${i + 1} 失败:`, error.message);
      }
    }

    // 清理上传的原始文件
    fs.unlinkSync(videoPath);

    console.log(`  ✅ 分割完成，任务ID: ${taskId}`);

    res.json({
      success: true,
      taskId: taskId,
      segmentCount: segments.length
    });

  } catch (error) {
    console.error('❌ 视频分割失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 视频合并 API
app.post('/api/video/merge', async (req, res) => {
  try {
    console.log('📥 收到视频合并请求');
    console.log('  - 请求体:', JSON.stringify(req.body).substring(0, 200));

    const { segments, segmentPaths } = req.body;

    // 兼容两种格式：segments 数组或 segmentPaths 数组
    let paths = [];
    if (segmentPaths && Array.isArray(segmentPaths)) {
      paths = segmentPaths;
    } else if (segments && Array.isArray(segments)) {
      paths = segments.map(s => s.path);
    }

    if (paths.length === 0) {
      return res.status(400).json({ error: '未提供视频片段' });
    }

    console.log(`  - 片段数量: ${paths.length}`);
    console.log(`  - 第一个片段: ${paths[0]}`);

    // 将相对路径转换为绝对路径
    const absolutePaths = paths.map(p => {
      // 如果是相对路径（如 task_xxx/segment_0.mp4），转换为绝对路径
      if (!path.isAbsolute(p)) {
        return path.join(outputDir, p);
      }
      return p;
    });

    console.log(`  - 第一个绝对路径: ${absolutePaths[0]}`);

    // 验证所有文件是否存在
    const missingFiles = absolutePaths.filter(p => !fs.existsSync(p));
    if (missingFiles.length > 0) {
      console.error('  ✗ 缺少文件:', missingFiles);
      return res.status(400).json({
        error: '部分视频片段不存在',
        missingFiles: missingFiles.map(f => path.basename(f))
      });
    }

    // 创建合并列表文件
    const listPath = path.join(cacheDir, `concat_${Date.now()}.txt`);
    const listContent = absolutePaths.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(listPath, listContent);

    console.log(`  - 合并列表文件: ${listPath}`);

    // 合并视频
    const taskId = `merged_${Date.now()}`;
    const outputPath = path.join(outputDir, `${taskId}.mp4`);
    const cmd = `ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`;

    console.log(`  - 执行命令: ${cmd.substring(0, 100)}...`);

    await execAsync(cmd);

    // 清理临时文件
    fs.unlinkSync(listPath);

    console.log('  ✓ 视频合并完成');
    console.log(`  - 输出文件: ${outputPath}`);

    res.json({
      success: true,
      taskId: taskId,
      url: `/output/${taskId}.mp4`,
      path: outputPath
    });

  } catch (error) {
    console.error('❌ 视频合并失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 图片叠加 API
app.post('/api/video/overlay', async (req, res) => {
  try {
    console.log('📥 收到图片叠加请求');

    const { videoPath, imagePath, options } = req.body;

    if (!videoPath || !imagePath) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const outputPath = path.join(outputDir, `overlay_${Date.now()}.mp4`);

    // 使用 FFmpeg 叠加图片
    const cmd = `ffmpeg -i "${videoPath}" -i "${imagePath}" -filter_complex "overlay=x=(W-w)/2:y=(H-h)/2" -c:a copy "${outputPath}"`;

    await execAsync(cmd);

    console.log('  ✓ 图片叠加完成');

    res.json({
      success: true,
      path: outputPath
    });

  } catch (error) {
    console.error('❌ 图片叠加失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 视频压缩 API
app.post('/api/video/compress', async (req, res) => {
  try {
    console.log('📥 收到视频压缩请求');
    console.log('  - 请求体:', JSON.stringify(req.body));

    const { videoPath, inputPath, platform } = req.body;
    const pathToUse = videoPath || inputPath;

    if (!pathToUse) {
      return res.status(400).json({ error: '缺少视频路径' });
    }

    console.log(`  - 视频路径: ${pathToUse}`);
    console.log(`  - 目标平台: ${platform}`);

    // 将相对路径转换为绝对路径
    let absolutePath = pathToUse;
    if (!path.isAbsolute(pathToUse)) {
      absolutePath = path.join(outputDir, pathToUse);
    }

    console.log(`  - 绝对路径: ${absolutePath}`);

    // 验证文件是否存在
    if (!fs.existsSync(absolutePath)) {
      console.error(`  ✗ 文件不存在: ${absolutePath}`);
      return res.status(400).json({ error: '视频文件不存在' });
    }

    const taskId = `compressed_${Date.now()}`;
    const outputPath = path.join(outputDir, `${taskId}.mp4`);

    // 根据平台选择压缩参数
    let bitrate = '7M';
    if (platform === 'douyin') {
      bitrate = '7M';
    }

    console.log(`  - 输出路径: ${outputPath}`);
    console.log(`  - 比特率: ${bitrate}`);

    // 使用 FFmpeg 压缩视频
    const cmd = `ffmpeg -i "${absolutePath}" -c:v libx264 -b:v ${bitrate} -c:a aac -b:a 128k "${outputPath}"`;

    console.log(`  - 执行命令: ${cmd.substring(0, 100)}...`);

    await execAsync(cmd);

    console.log('  ✓ 视频压缩完成');
    console.log(`  - 输出文件: ${outputPath}`);

    res.json({
      success: true,
      taskId: taskId,
      url: `/output/${taskId}.mp4`,
      path: outputPath
    });

  } catch (error) {
    console.error('❌ 视频压缩失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 静态文件服务
app.use('/output', express.static(outputDir));
app.use('/uploads', express.static(uploadsDir));

// 下载文件端点
app.get('/download/file/:taskId/:filename', (req, res) => {
  try {
    const { taskId, filename } = req.params;
    const filePath = path.join(outputDir, taskId, filename);

    console.log(`📥 下载请求: ${taskId}/${filename}`);

    if (!fs.existsSync(filePath)) {
      console.error(`  ✗ 文件不存在: ${filePath}`);
      return res.status(404).json({ error: '文件不存在' });
    }

    console.log(`  ✓ 发送文件: ${filePath}`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('❌ 下载失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 一键自动生成 API
app.post('/api/auto-generate', upload.single('video'), async (req, res) => {
  try {
    console.log('📥 收到一键自动生成请求');

    if (!req.file) {
      return res.status(400).json({ error: '未上传视频文件' });
    }

    const videoPath = req.file.path;
    const { platform = 'douyin' } = req.body;

    console.log(`  - 视频文件: ${req.file.originalname}`);
    console.log(`  - 目标平台: ${platform}`);

    // 生成任务ID
    const taskId = `autogen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const taskDir = path.join(outputDir, taskId);

    // 创建任务目录
    if (!fs.existsSync(taskDir)) {
      fs.mkdirSync(taskDir, { recursive: true });
    }

    console.log(`  - 任务ID: ${taskId}`);

    // 返回任务ID，让客户端轮询状态
    res.json({
      success: true,
      taskId: taskId,
      message: '任务已创建，正在处理中...'
    });

    // 异步处理任务
    processAutoGeneration(taskId, videoPath, platform, taskDir).catch(err => {
      console.error(`❌ 任务 ${taskId} 处理失败:`, err);
    });

  } catch (error) {
    console.error('❌ 一键自动生成失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 查询任务状态 API
app.get('/api/auto-generate/:taskId/status', (req, res) => {
  try {
    const { taskId } = req.params;
    const statusFile = path.join(outputDir, taskId, 'status.json');

    if (!fs.existsSync(statusFile)) {
      return res.status(404).json({ error: '任务不存在' });
    }

    const status = JSON.parse(fs.readFileSync(statusFile, 'utf-8'));
    res.json(status);

  } catch (error) {
    console.error('❌ 查询任务状态失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 异步处理一键自动生成
async function processAutoGeneration(taskId, videoPath, platform, taskDir) {
  const statusFile = path.join(taskDir, 'status.json');

  // 更新状态的辅助函数
  const updateStatus = (progress, message, data = {}) => {
    const status = {
      taskId,
      progress,
      message,
      timestamp: Date.now(),
      ...data
    };
    fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
    console.log(`  📊 ${taskId}: ${progress}% - ${message}`);
  };

  try {
    updateStatus(0, '开始处理...');

    // 创建服务器端自动生成代理实例
    const agent = new ServerAutoGenerationAgent();

    // 执行完整的一键自动生成流程
    const result = await agent.autoGenerate(videoPath, platform, updateStatus);

    // 将最终视频复制到任务目录
    const finalVideoPath = path.join(taskDir, 'final.mp4');
    if (fs.existsSync(result.videoPath)) {
      fs.copyFileSync(result.videoPath, finalVideoPath);
    }

    updateStatus(100, '处理完成!', {
      status: 'completed',
      videoUrl: `/output/${taskId}/final.mp4`,
      videoPath: finalVideoPath,
      template: result.template
    });

  } catch (error) {
    console.error(`❌ 任务 ${taskId} 失败:`, error);
    updateStatus(0, '处理失败', {
      status: 'failed',
      error: error.message
    });
  } finally {
    // 清理上传的原始文件
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
  }
}

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 VidSlide AI 后端服务器启动成功');
  console.log(`  - 地址: http://localhost:${PORT}`);
  console.log(`  - 上传目录: ${uploadsDir}`);
  console.log(`  - 输出目录: ${outputDir}`);
  console.log('');
  console.log('📋 可用的 API 端点:');
  console.log('  - GET  /health');
  console.log('  - POST /api/video/split');
  console.log('  - POST /api/video/merge');
  console.log('  - POST /api/video/overlay');
  console.log('  - POST /api/video/compress');
  console.log('  - POST /api/auto-generate');
  console.log('  - GET  /api/auto-generate/:taskId/status');
});
