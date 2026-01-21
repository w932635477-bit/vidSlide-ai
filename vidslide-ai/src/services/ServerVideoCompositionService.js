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
import BackgroundGeneratorService from './BackgroundGeneratorService.js';
import FaceVideoExtractorService from './FaceVideoExtractorService.js';
import TextRendererService from './TextRendererService.js';

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

    // 初始化新服务
    this.backgroundGenerator = new BackgroundGeneratorService();
    this.faceExtractor = new FaceVideoExtractorService();
    this.textRenderer = new TextRendererService();
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
      // 检查是否有全屏图片
      const hasFullscreenImages = images.some(img => img.fullscreen);

      if (hasFullscreenImages) {
        console.log('  🎨 使用全屏图片合成模式');
        return await this.composeWithFullscreenImages(videoPath, scenes, images, platform);
      } else {
        console.log('  🎨 使用画中画合成模式');
        return await this.composeWithPIPImages(videoPath, scenes, images, platform);
      }

    } catch (error) {
      console.error('❌ 视频合成失败:', error);
      throw error;
    }
  }

  /**
   * 使用全屏图片合成视频（新方法）
   * 策略：将AI生成的图片作为主要内容，原视频作为背景或不使用
   */
  async composeWithFullscreenImages(videoPath, scenes, images, platform) {
    console.log('  🎬 全屏图片合成模式');

    try {
      // 步骤 1: 为每个场景创建图片视频片段
      console.log('  1️⃣ 创建图片视频片段...');
      const imageSegments = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const duration = (img.endTime || 10) - (img.startTime || 0);

        console.log(`    - 创建片段 ${i + 1}/${images.length}: ${duration}秒`);

        // 使用 FFmpeg 将图片转换为视频片段
        const segmentPath = path.join(this.cacheDir, `img_segment_${Date.now()}_${i}.mp4`);

        // 创建图片视频片段，添加淡入淡出效果
        const cmd = `ffmpeg -loop 1 -i "${img.path}" -t ${duration} -vf "fade=in:0:30,fade=out:st=${duration - 1}:d=1,scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" -c:v libx264 -preset fast -pix_fmt yuv420p "${segmentPath}" -y`;

        try {
          await execAsync(cmd);
          imageSegments.push({
            path: segmentPath,
            duration
          });
          console.log(`    ✅ 片段 ${i + 1} 创建成功`);
        } catch (error) {
          console.error(`    ❌ 片段 ${i + 1} 创建失败:`, error.message);
        }
      }

      // 步骤 2: 合并所有图片片段
      console.log('  2️⃣ 合并图片片段...');
      const mergedVideo = await this.mergeImageSegments(imageSegments);

      // 步骤 3: 添加原视频音频（可选）
      console.log('  3️⃣ 添加原视频音频...');
      const videoWithAudio = await this.addAudioFromVideo(mergedVideo, videoPath);

      // 步骤 4: 压缩视频
      console.log('  4️⃣ 压缩视频...');
      const compressedVideo = await this.compressVideo(videoWithAudio, platform);

      // 清理临时文件
      imageSegments.forEach(seg => {
        if (fs.existsSync(seg.path)) {
          fs.unlinkSync(seg.path);
        }
      });

      console.log('✅ 全屏图片视频合成完成');
      return compressedVideo;

    } catch (error) {
      console.error('❌ 全屏图片合成失败:', error);
      throw error;
    }
  }

  /**
   * 使用画中画模式合成视频（原有方法）
   */
  async composeWithPIPImages(videoPath, scenes, images, platform) {
    console.log('  🎬 画中画合成模式');

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

      console.log('✅ 画中画视频合成完成');
      return compressedVideo;

    } catch (error) {
      console.error('❌ 画中画合成失败:', error);
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
   * 合并图片片段
   */
  async mergeImageSegments(segments) {
    console.log(`    - 合并 ${segments.length} 个图片片段...`);

    if (segments.length === 0) {
      throw new Error('没有图片片段可以合并');
    }

    if (segments.length === 1) {
      console.log(`    ✅ 只有一个片段，直接返回`);
      return segments[0].path;
    }

    // 创建合并列表文件
    const listPath = path.join(this.cacheDir, `concat_images_${Date.now()}.txt`);
    const listContent = segments.map(s => `file '${s.path}'`).join('\n');
    fs.writeFileSync(listPath, listContent);

    // 合并视频
    const outputPath = path.join(this.outputDir, `merged_images_${Date.now()}.mp4`);
    const cmd = `ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}" -y`;

    await execAsync(cmd);

    // 清理临时文件
    fs.unlinkSync(listPath);

    console.log(`    ✅ 图片片段合并完成: ${outputPath}`);
    return outputPath;
  }

  /**
   * 从原视频提取音频并添加到新视频
   */
  async addAudioFromVideo(videoPath, sourceVideoPath) {
    console.log(`    - 添加原视频音频...`);

    try {
      const outputPath = path.join(this.outputDir, `with_audio_${Date.now()}.mp4`);

      // 使用 FFmpeg 将原视频的音频添加到新视频
      // 如果新视频时长超过音频，循环音频；如果音频更长，截断音频
      const cmd = `ffmpeg -i "${videoPath}" -i "${sourceVideoPath}" -map 0:v -map 1:a -c:v copy -c:a aac -shortest "${outputPath}" -y`;

      await execAsync(cmd);

      // 清理原视频
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }

      console.log(`    ✅ 音频添加完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('    ⚠️ 音频添加失败，返回无音频视频:', error.message);
      return videoPath;
    }
  }

  /**
   * 完整的短视频风格合成（新方法）
   * 图层结构：深色背景 + 豆包图片组合 + 人脸画中画 + 文字
   * @param {string} videoPath - 原视频路径
   * @param {Array} images - 豆包生成的图片列表
   * @param {Object} faceDetection - 人脸检测结果
   * @param {string} title - 标题
   * @param {Array} keywords - 关键词列表
   * @param {string} platform - 目标平台
   * @returns {Promise<string>} 最终视频路径
   */
  async composeShortVideo(videoPath, images = [], faceDetection = null, title = '', keywords = [], platform = 'douyin') {
    console.log('🎬 开始短视频风格合成');
    console.log(`  - 原视频: ${videoPath}`);
    console.log(`  - 图片数量: ${images.length}`);
    console.log(`  - 标题: ${title}`);
    console.log(`  - 关键词: ${keywords.join(', ')}`);

    try {
      // 步骤 1: 生成深色科技背景
      console.log('  1️⃣ 生成深色科技背景...');
      const background = await this.backgroundGenerator.generateGradientBackground(1080, 1920, '#0a0e27', '#1a1f3a');

      // 步骤 2: 提取人脸视频
      console.log('  2️⃣ 提取人脸视频...');
      const faceVideo = await this.faceExtractor.extractFaceVideo(videoPath, faceDetection, 400, 400);

      // 步骤 3: 创建背景视频（从背景图片）
      console.log('  3️⃣ 创建背景视频...');
      const backgroundVideo = await this.createVideoFromImage(background, 10); // 10秒

      // 步骤 4: 叠加豆包图片到背景
      console.log('  4️⃣ 叠加豆包图片...');
      const videoWithImages = await this.overlayDoubaoImages(backgroundVideo, images);

      // 步骤 5: 叠加人脸视频（画中画）
      console.log('  5️⃣ 叠加人脸视频...');
      const videoWithFace = await this.overlayFaceVideo(videoWithImages, faceVideo, faceDetection);

      // 步骤 6: 添加原视频音频
      console.log('  6️⃣ 添加原视频音频...');
      const videoWithAudio = await this.addAudioFromVideo(videoWithFace, videoPath);

      // 步骤 7: 添加文字（标题和关键词）
      console.log('  7️⃣ 添加文字...');
      const videoWithText = await this.textRenderer.addTitleAndKeywords(videoWithAudio, title, keywords);

      // 步骤 8: 压缩视频
      console.log('  8️⃣ 压缩视频...');
      const finalVideo = await this.compressVideo(videoWithText, platform);

      // 清理临时文件
      [background, faceVideo, backgroundVideo, videoWithImages, videoWithFace, videoWithAudio, videoWithText].forEach(file => {
        if (file && file !== finalVideo && fs.existsSync(file)) {
          try {
            fs.unlinkSync(file);
          } catch (e) {
            // 忽略清理错误
          }
        }
      });

      console.log('✅ 短视频风格合成完成');
      return finalVideo;

    } catch (error) {
      console.error('❌ 短视频风格合成失败:', error);
      throw error;
    }
  }

  /**
   * 从图片创建视频
   * @param {string} imagePath - 图片路径
   * @param {number} duration - 视频时长（秒）
   * @returns {Promise<string>} 视频路径
   */
  async createVideoFromImage(imagePath, duration = 10) {
    console.log(`    - 从图片创建视频: ${duration}秒`);

    const outputPath = path.join(this.cacheDir, `img_video_${Date.now()}.mp4`);

    try {
      const cmd = `ffmpeg -loop 1 -i "${imagePath}" -t ${duration} -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" -c:v libx264 -preset fast -pix_fmt yuv420p "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`    ✅ 视频创建完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('    ❌ 视频创建失败:', error);
      throw error;
    }
  }

  /**
   * 叠加豆包图片到背景视频
   * @param {string} videoPath - 背景视频路径
   * @param {Array} images - 豆包图片列表
   * @returns {Promise<string>} 叠加后的视频路径
   */
  async overlayDoubaoImages(videoPath, images = []) {
    console.log(`    - 叠加 ${images.length} 张豆包图片...`);

    if (images.length === 0) {
      console.log('    ⚠️ 没有豆包图片需要叠加');
      return videoPath;
    }

    const outputPath = path.join(this.outputDir, `with_doubao_${Date.now()}.mp4`);

    try {
      // 简化版本：将图片组合显示在中上部
      // 如果有多张图片，横向排列
      const imgWidth = images.length > 1 ? 400 : 600;
      const imgHeight = images.length > 1 ? 400 : 600;
      const startX = images.length > 1 ? 100 : 240;
      const startY = 300;
      const spacing = 80;

      let filterComplex = '[0:v]';
      let currentInput = 0;

      for (let i = 0; i < Math.min(images.length, 2); i++) { // 最多显示2张
        const img = images[i];
        const x = startX + i * (imgWidth + spacing);
        const y = startY;

        currentInput++;
        filterComplex += `[${currentInput}:v]scale=${imgWidth}:${imgHeight}[img${i}];`;
        filterComplex += `[${i === 0 ? '0:v' : `tmp${i-1}`}][img${i}]overlay=${x}:${y}${i < Math.min(images.length, 2) - 1 ? `[tmp${i}]` : ''}`;
      }

      // 构建输入文件列表
      const inputs = [videoPath, ...images.slice(0, 2).map(img => img.path)];
      const inputArgs = inputs.map(p => `-i "${p}"`).join(' ');

      const cmd = `ffmpeg ${inputArgs} -filter_complex "${filterComplex}" -c:a copy -preset fast "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`    ✅ 豆包图片叠加完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('    ❌ 豆包图片叠加失败:', error);
      return videoPath; // 返回原视频
    }
  }

  /**
   * 叠加人脸视频（画中画）
   * @param {string} videoPath - 背景视频路径
   * @param {string} faceVideoPath - 人脸视频路径
   * @param {Object} faceDetection - 人脸检测结果
   * @returns {Promise<string>} 叠加后的视频路径
   */
  async overlayFaceVideo(videoPath, faceVideoPath, faceDetection = null) {
    console.log(`    - 叠加人脸视频...`);

    const outputPath = path.join(this.outputDir, `with_face_${Date.now()}.mp4`);

    try {
      // 计算人脸视频的位置（中部偏下）
      const faceX = 340; // 居中
      const faceY = 1000; // 中部偏下

      // 使用 FFmpeg overlay 叠加人脸视频
      const filterComplex = `[1:v]scale=400:400[face];[0:v][face]overlay=${faceX}:${faceY}`;

      const cmd = `ffmpeg -i "${videoPath}" -i "${faceVideoPath}" -filter_complex "${filterComplex}" -c:a copy -preset fast "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`    ✅ 人脸视频叠加完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('    ❌ 人脸视频叠加失败:', error);
      return videoPath; // 返回原视频
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

  /**
   * 使用组合单元合成视频（前端方案）
   * @param {string} videoPath - 原视频路径
   * @param {string} compositionUnitPath - 组合单元图片路径
   * @param {Object} faceDetection - 人脸检测结果
   * @param {string} platform - 目标平台
   * @returns {Promise<string>} 最终视频路径
   */
  async composeWithCompositionUnit(videoPath, compositionUnitPath, faceDetection = null, platform = 'douyin') {
    console.log('🎬 使用组合单元合成视频');
    console.log(`  - 原视频: ${videoPath}`);
    console.log(`  - 组合单元: ${compositionUnitPath}`);

    try {
      // 步骤 1: 提取人脸视频（画中画）
      console.log('  1️⃣ 提取人脸视频...');
      const faceVideo = await this.faceExtractor.extractFaceVideo(videoPath, faceDetection, 320, 180);

      // 步骤 2: 从组合单元图片创建视频
      console.log('  2️⃣ 从组合单元创建视频...');
      const compositionVideo = await this.createVideoFromImage(compositionUnitPath, 10); // 10秒

      // 步骤 3: 叠加人脸视频到组合单元视频的 PIP 位置
      console.log('  3️⃣ 叠加人脸视频到 PIP 位置...');
      const videoWithPIP = await this.overlayFaceVideoToPIP(compositionVideo, faceVideo);

      // 步骤 4: 添加原视频音频
      console.log('  4️⃣ 添加原视频音频...');
      const videoWithAudio = await this.addAudioFromVideo(videoWithPIP, videoPath);

      // 步骤 5: 压缩视频
      console.log('  5️⃣ 压缩视频...');
      const finalVideo = await this.compressVideo(videoWithAudio, platform);

      // 清理临时文件
      [faceVideo, compositionVideo, videoWithPIP, videoWithAudio].forEach(file => {
        if (file && file !== finalVideo && fs.existsSync(file)) {
          try {
            fs.unlinkSync(file);
          } catch (e) {
            // 忽略清理错误
          }
        }
      });

      console.log('✅ 组合单元视频合成完成');
      return finalVideo;

    } catch (error) {
      console.error('❌ 组合单元视频合成失败:', error);
      throw error;
    }
  }

  /**
   * 叠加人脸视频到 PIP 位置（右上角）
   * @param {string} videoPath - 背景视频路径
   * @param {string} faceVideoPath - 人脸视频路径
   * @returns {Promise<string>} 叠加后的视频路径
   */
  async overlayFaceVideoToPIP(videoPath, faceVideoPath) {
    console.log(`    - 叠加人脸视频到 PIP 位置...`);

    const outputPath = path.join(this.outputDir, `with_pip_${Date.now()}.mp4`);

    try {
      // PIP 位置（右上角，与组合单元生成器中的 pipArea 一致）
      const pipX = 720;
      const pipY = 120;

      // 使用 FFmpeg overlay 叠加人脸视频
      const filterComplex = `[1:v]scale=320:180[pip];[0:v][pip]overlay=${pipX}:${pipY}`;

      const cmd = `ffmpeg -i "${videoPath}" -i "${faceVideoPath}" -filter_complex "${filterComplex}" -c:a copy -preset fast "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`    ✅ PIP 叠加完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('    ❌ PIP 叠加失败:', error);
      return videoPath; // 返回原视频
    }
  }
}

export default ServerVideoCompositionService;
