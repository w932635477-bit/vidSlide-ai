/**
 * 服务器端视频合成服务
 *
 * 提供视频合成功能：
 * - 视频分割
 * - 视频合并
 * - 图片叠加
 * - 视频压缩
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ServerVideoCompositionService {
  constructor() {
    this.name = 'ServerVideoCompositionService';
    this.outputDir = path.join(__dirname, '../../../output');
    this.cacheDir = path.join(__dirname, '../../../cache');

    // 确保目录存在
    [this.outputDir, this.cacheDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 完整的视频合成流程
   * @param {string} videoPath - 原视频路径
   * @param {Array} scenes - 场景列表
   * @param {Array} images - 图片列表
   * @param {string} platform - 目标平台
   * @returns {Promise<string>} 最终视频路径
   */
  async composeVideo(videoPath, scenes, images = [], platform = 'douyin') {
    console.log('🎬 开始视频合成流程');
    console.log(`  - 原视频: ${videoPath}`);
    console.log(`  - 场景数量: ${scenes.length}`);
    console.log(`  - 图片数量: ${images.length}`);

    try {
      // 步骤 1: 分割视频
      console.log('  1️⃣ 分割视频...');
      const segments = await this.splitVideo(videoPath, scenes);

      // 步骤 2: 合并视频
      console.log('  2️⃣ 合并视频...');
      const mergedVideo = await this.mergeVideos(segments);

      // 步骤 3: 图片叠加（如果有图片）
      let finalVideo = mergedVideo;
      if (images.length > 0) {
        console.log('  3️⃣ 叠加图片...');
        finalVideo = await this.overlayImages(mergedVideo, images);
      }

      // 步骤 4: 压缩视频
      console.log('  4️⃣ 压缩视频...');
      const compressedVideo = await this.compressVideo(finalVideo, platform);

      console.log('✅ 视频合成完成');
      return compressedVideo;

    } catch (error) {
      console.error('❌ 视频合成失败:', error);
      throw error;
    }
  }

  /**
   * 分割视频
   */
  async splitVideo(videoPath, scenes) {
    console.log(`    - 分割成 ${scenes.length} 个片段...`);

    const taskId = `split_${Date.now()}`;
    const taskDir = path.join(this.outputDir, taskId);

    if (!fs.existsSync(taskDir)) {
      fs.mkdirSync(taskDir, { recursive: true });
    }

    const segments = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const outputPath = path.join(taskDir, `segment_${i}.mp4`);

      const startTime = scene.startTime || 0;
      const duration = (scene.endTime || 0) - startTime;

      // 使用 FFmpeg 分割视频
      const cmd = `ffmpeg -i "${videoPath}" -ss ${startTime} -t ${duration} -c copy "${outputPath}" -y`;

      try {
        await execAsync(cmd);
        segments.push({
          index: i,
          path: outputPath,
          startTime,
          endTime: scene.endTime
        });
      } catch (error) {
        console.error(`    ✗ 分割片段 ${i + 1} 失败:`, error.message);
      }
    }

    console.log(`    ✅ 分割完成，共 ${segments.length} 个片段`);
    return segments;
  }

  /**
   * 合并视频
   */
  async mergeVideos(segments) {
    console.log(`    - 合并 ${segments.length} 个片段...`);

    // 创建合并列表文件
    const listPath = path.join(this.cacheDir, `concat_${Date.now()}.txt`);
    const listContent = segments.map(s => `file '${s.path}'`).join('\n');
    fs.writeFileSync(listPath, listContent);

    // 合并视频
    const outputPath = path.join(this.outputDir, `merged_${Date.now()}.mp4`);
    const cmd = `ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}" -y`;

    await execAsync(cmd);

    // 清理临时文件
    fs.unlinkSync(listPath);
    segments.forEach(s => {
      if (fs.existsSync(s.path)) {
        fs.unlinkSync(s.path);
      }
    });

    console.log(`    ✅ 合并完成: ${outputPath}`);
    return outputPath;
  }

  /**
   * 叠加图片
   * @param {string} videoPath - 视频路径
   * @param {Array} images - 图片列表，每个图片包含 {path, position, startTime, endTime, width, height}
   * @returns {Promise<string>} 叠加后的视频路径
   */
  async overlayImages(videoPath, images) {
    console.log(`    - 叠加 ${images.length} 张图片...`);

    if (images.length === 0) {
      console.log('    ⚠️ 没有图片需要叠加');
      return videoPath;
    }

    try {
      const outputPath = path.join(this.outputDir, `overlay_${Date.now()}.mp4`);

      // 构建 FFmpeg 命令
      // 策略：逐个叠加图片，每次生成一个中间视频
      let currentVideo = videoPath;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        console.log(`      - 叠加图片 ${i + 1}/${images.length}: ${img.path}`);

        // 计算叠加位置（使用默认位置或指定位置）
        const x = img.position?.x || 100;
        const y = img.position?.y || 100;
        const width = img.width || 280;
        const height = img.height || 280;
        const startTime = img.startTime || 0;
        const endTime = img.endTime || 999999; // 默认一直显示

        // 生成输出路径
        const tempOutput = i === images.length - 1
          ? outputPath
          : path.join(this.cacheDir, `temp_overlay_${Date.now()}_${i}.mp4`);

        // 构建 FFmpeg overlay 滤镜
        // 使用 scale 调整图片大小，然后叠加
        const filterComplex = `[1:v]scale=${width}:${height}[scaled];[0:v][scaled]overlay=${x}:${y}:enable='between(t,${startTime},${endTime})'`;

        // 执行 FFmpeg 命令
        const cmd = `ffmpeg -i "${currentVideo}" -i "${img.path}" -filter_complex "${filterComplex}" -c:a copy -preset fast "${tempOutput}" -y`;

        try {
          await execAsync(cmd);
          console.log(`      ✅ 图片 ${i + 1} 叠加完成`);

          // 清理上一个临时文件（如果不是原始视频）
          if (currentVideo !== videoPath && fs.existsSync(currentVideo)) {
            fs.unlinkSync(currentVideo);
          }

          // 更新当前视频为新生成的视频
          currentVideo = tempOutput;

        } catch (error) {
          console.error(`      ❌ 图片 ${i + 1} 叠加失败:`, error.message);
          throw error;
        }
      }

      // 清理原始视频（如果不是输入视频）
      if (videoPath !== currentVideo && fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }

      console.log(`    ✅ 图片叠加完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('    ❌ 图片叠加失败:', error);
      throw error;
    }
  }

  /**
   * 压缩视频
   */
  async compressVideo(videoPath, platform) {
    console.log(`    - 压缩视频（平台: ${platform}）...`);

    const outputPath = path.join(this.outputDir, `compressed_${Date.now()}.mp4`);

    // 根据平台选择压缩参数
    let bitrate = '7M';
    if (platform === 'douyin') {
      bitrate = '7M';
    }

    // 使用 FFmpeg 压缩视频
    const cmd = `ffmpeg -i "${videoPath}" -c:v libx264 -b:v ${bitrate} -c:a aac -b:a 128k "${outputPath}" -y`;

    await execAsync(cmd);

    // 清理原始文件
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    console.log(`    ✅ 压缩完成: ${outputPath}`);
    return outputPath;
  }
}

export default ServerVideoCompositionService;
