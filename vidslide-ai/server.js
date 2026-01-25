/**
 * VidSlide AI 后端服务器 - 多智能体系统集成
 *
 * 功能:
 * - 视频上传和处理
 * - 多智能体系统协调
 * - Timeline可视化数据提供
 * - WebSocket实时进度更新
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
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';

// 导入多智能体系统
import ProjectManager from './src/agents/coordinator/ProjectManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

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

// 任务存储（内存中，生产环境应使用Redis）
const tasks = new Map();

// ===== WebSocket 实时进度更新 =====
io.on('connection', (socket) => {
  console.log(`🔌 客户端连接: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 客户端断开: ${socket.id}`);
  });
});

// ===== API 端点 =====

// 健康检查
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'VidSlide AI Multi-Agent Server is running',
    version: '2.0',
    agents: ['ContentAnalyst', 'SceneDesigner', 'LayerOrchestrator', 'VideoEngineer', 'QualityDirector']
  });
});

// 多智能体视频处理 API
app.post('/api/multi-agent/process', upload.single('video'), async (req, res) => {
  try {
    console.log('📥 收到多智能体处理请求');

    if (!req.file) {
      return res.status(400).json({ error: '未上传视频文件' });
    }

    const videoPath = req.file.path;
    const { platform = 'douyin', allowRework = false } = req.body;

    console.log(`  - 视频文件: ${req.file.originalname}`);
    console.log(`  - 目标平台: ${platform}`);

    // 生成任务ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // 初始化任务状态
    tasks.set(taskId, {
      id: taskId,
      status: 'pending',
      progress: 0,
      message: '任务已创建',
      createdAt: Date.now(),
      videoPath: videoPath,
      platform: platform
    });

    console.log(`  - 任务ID: ${taskId}`);

    // 返回任务ID
    res.json({
      success: true,
      taskId: taskId,
      message: '任务已创建，开始处理...'
    });

    // 异步处理任务
    processMultiAgentTask(taskId, videoPath, platform, allowRework).catch(err => {
      console.error(`❌ 任务 ${taskId} 处理失败:`, err);

      const task = tasks.get(taskId);
      if (task) {
        task.status = 'failed';
        task.error = err.message;
        task.completedAt = Date.now();

        // 通知客户端失败
        io.emit(`task-update-${taskId}`, task);
      }
    });

  } catch (error) {
    console.error('❌ 创建任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 查询任务状态 API
app.get('/api/multi-agent/status/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const task = tasks.get(taskId);

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    res.json(task);

  } catch (error) {
    console.error('❌ 查询任务状态失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取Timeline数据 API
app.get('/api/multi-agent/timeline/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const task = tasks.get(taskId);

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (!task.timeline) {
      return res.status(404).json({ error: 'Timeline尚未生成' });
    }

    res.json(task.timeline);

  } catch (error) {
    console.error('❌ 获取Timeline失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 静态文件服务
app.use('/output', express.static(outputDir));
app.use('/uploads', express.static(uploadsDir));

// 下载最终视频
app.get('/api/multi-agent/download/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const task = tasks.get(taskId);

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (!task.outputVideoPath || !fs.existsSync(task.outputVideoPath)) {
      return res.status(404).json({ error: '视频文件不存在' });
    }

    console.log(`📥 下载请求: ${taskId}`);
    res.sendFile(task.outputVideoPath);

  } catch (error) {
    console.error('❌ 下载失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== 多智能体任务处理 =====

async function processMultiAgentTask(taskId, videoPath, platform, allowRework) {
  const task = tasks.get(taskId);

  // 更新状态的辅助函数
  const updateStatus = (status, progress, message, data = {}) => {
    task.status = status;
    task.progress = progress;
    task.message = message;
    task.updatedAt = Date.now();
    Object.assign(task, data);

    console.log(`  📊 ${taskId}: ${progress}% - ${message}`);

    // 通过WebSocket通知客户端
    io.emit(`task-update-${taskId}`, task);
  };

  try {
    updateStatus('processing', 0, '初始化多智能体系统...');

    // 创建ProjectManager实例
    const projectManager = new ProjectManager({
      logger: { level: 'info' }
    });

    updateStatus('processing', 10, '🚀 Phase 1: 内容理解 (ContentAnalyst)');

    // 执行多智能体工作流
    const result = await projectManager.execute(videoPath, {
      allowRework: allowRework === 'true' || allowRework === true,
      platform: platform
    });

    // 提取Timeline
    if (result.task_3_1 && result.task_3_1.timeline) {
      task.timeline = result.task_3_1.timeline;
      updateStatus('processing', 90, '✅ Timeline已生成', {
        timeline: task.timeline
      });
    }

    // 保存最终视频路径
    if (result.videoPath && fs.existsSync(result.videoPath)) {
      task.outputVideoPath = result.videoPath;
      updateStatus('completed', 100, '✅ 处理完成！', {
        outputVideoPath: result.videoPath,
        videoUrl: `/api/multi-agent/download/${taskId}`,
        result: result
      });
    } else {
      throw new Error('最终视频生成失败');
    }

    task.completedAt = Date.now();
    console.log(`✅ 任务 ${taskId} 处理完成`);

  } catch (error) {
    console.error(`❌ 任务 ${taskId} 失败:`, error);
    updateStatus('failed', task.progress, '处理失败', {
      error: error.message
    });
    task.completedAt = Date.now();
  } finally {
    // 清理上传的原始文件
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
  }
}

// 启动服务器
httpServer.listen(PORT, () => {
  console.log('🚀 VidSlide AI 多智能体后端服务器启动成功');
  console.log(`  - HTTP地址: http://localhost:${PORT}`);
  console.log(`  - WebSocket: ws://localhost:${PORT}`);
  console.log(`  - 上传目录: ${uploadsDir}`);
  console.log(`  - 输出目录: ${outputDir}`);
  console.log('');
  console.log('📋 可用的 API 端点:');
  console.log('  - GET  /health');
  console.log('  - POST /api/multi-agent/process');
  console.log('  - GET  /api/multi-agent/status/:taskId');
  console.log('  - GET  /api/multi-agent/timeline/:taskId');
  console.log('  - GET  /api/multi-agent/download/:taskId');
  console.log('');
  console.log('🤖 多智能体系统:');
  console.log('  - Phase 1: ContentAnalyst (内容理解)');
  console.log('  - Phase 2: SceneDesigner (场景设计)');
  console.log('  - Phase 3: LayerOrchestrator (层编排)');
  console.log('  - Phase 4: QualityDirector (质量检查)');
  console.log('  - Phase 5: VideoEngineer (视频合成)');
});
