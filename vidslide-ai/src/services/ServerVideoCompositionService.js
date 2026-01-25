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
import { createRequire } from 'module';
import BackgroundGeneratorService from './BackgroundGeneratorService.js';
import FaceVideoExtractorServiceV2 from './FaceVideoExtractorServiceV2.js';
import { DOUYIN_SPECS, getSafePIPPosition, getSafeCardPosition } from '../utils/douyinSpecs.js';

// 使用V2版本作为默认
const FaceVideoExtractorService = FaceVideoExtractorServiceV2;

// 导入CommonJS模块（RoundedCornerService）
const require = createRequire(import.meta.url);
const RoundedCornerService = require('./RoundedCornerService.cjs');

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

    // 初始化服务
    this.backgroundGenerator = new BackgroundGeneratorService();
    this.faceExtractor = new FaceVideoExtractorService();
    this.faceExtractorV2 = new FaceVideoExtractorServiceV2();
    // TextRendererService暂时禁用
    // this.textRenderer = new TextRendererService();
    this.textRenderer = null;

    // 初始化圆角服务
    this.roundedCornerService = new RoundedCornerService();
    console.log('✅ ServerVideoCompositionService 初始化完成（已集成圆角服务）');
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
   * ⭐ 新方法：基于layers的多层视频合成
   * 区分背景层、PIP层、卡片层
   * @param {string} videoPath - 原视频路径
   * @param {Array} scenes - 场景列表
   * @param {Array} renderData - 渲染数据列表（包含layerType）
   * @param {string} platform - 目标平台
   * @returns {Promise<string>} 最终视频路径
   */
  async composeVideoWithLayers(videoPath, scenes, renderData, platform = 'douyin') {
    console.log('🎬 开始多层视频合成（基于scene.layers）');
    console.log(`  - 原视频: ${videoPath}`);
    console.log(`  - 场景数量: ${scenes.length}`);
    console.log(`  - 渲染层数: ${renderData.length}`);

    // 统计各层
    const bgLayers = renderData.filter(item => item.layerType === 'background');
    const maskLayers = renderData.filter(item => item.layerType === 'mask');
    const pipLayers = renderData.filter(item => item.layerType === 'pip');
    const cardLayers = renderData.filter(item => item.layerType === 'card');

    console.log(`  - 背景层: ${bgLayers.length}个 (全屏)`);
    console.log(`  - 遮罩层: ${maskLayers.length}个 (磨砂玻璃)`);
    console.log(`  - PIP层: ${pipLayers.length}个 (画中画)`);
    console.log(`  - 卡片层: ${cardLayers.length}个 (底部)`);

    try {
      // 步骤1: 分割原视频
      console.log('  1️⃣ 分割原视频...');
      const segments = await this.splitVideo(videoPath, scenes);

      // 步骤2: 为每个片段添加多层内容
      console.log('  2️⃣ 为每个片段添加多层内容...');
      const composedSegments = [];

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const segment = segments[i];

        console.log(`    - 处理片段 ${i + 1}/${scenes.length} (${scene.type})`);

        // 查找这个场景对应的所有渲染层
        const sceneLayers = renderData.filter(item => item.sceneId === scene.id);

        if (sceneLayers.length === 0) {
          // 原视频场景，直接使用
          console.log(`      → 原视频场景，无图层`);
          composedSegments.push(segment.path);
          continue;
        }

        // 按zIndex排序（从底层到顶层）
        sceneLayers.sort((a, b) => a.zIndex - b.zIndex);

        console.log(`      → 有 ${sceneLayers.length} 个层（zIndex: ${sceneLayers.map(l => l.zIndex).join(' → ')}）`);

        // 依次叠加各层
        let currentVideo = segment.path;

        for (let j = 0; j < sceneLayers.length; j++) {
          const layer = sceneLayers[j];
          console.log(`        - 叠加层 ${j + 1}: ${layer.layerType} (zIndex=${layer.zIndex})`);

          if (layer.layerType === 'background') {
            // 背景层：全屏显示
            currentVideo = await this.overlayBackgroundLayer(currentVideo, layer, platform);
          } else if (layer.layerType === 'mask') {
            // 遮罩层：磨砂玻璃效果
            currentVideo = await this.overlayMaskLayer(currentVideo, layer);
          } else if (layer.layerType === 'pip') {
            // PIP层：画中画（右上角或底部）
            const position = layer.content?.position || 'top-right';
            currentVideo = await this.overlayPIPLayer(currentVideo, layer, platform, position);
          } else if (layer.layerType === 'card') {
            // 卡片层：底部显示
            const position = layer.content?.position || 'top';
            const animationDelay = layer.content?.animationDelay || 0;
            currentVideo = await this.overlayCardLayer(currentVideo, layer, position, animationDelay);
          }
        }

        composedSegments.push(currentVideo);
      }

      // 步骤3: 合并所有片段
      console.log('  3️⃣ 合并所有片段...');
      const mergedVideo = await this.mergeComposedSegments(composedSegments);

      // 步骤4: 最终压缩
      console.log('  4️⃣ 最终压缩...');
      const finalVideo = await this.finalCompress(mergedVideo);

      // 清理临时文件
      segments.forEach(s => {
        if (fs.existsSync(s.path)) fs.unlinkSync(s.path);
      });
      composedSegments.forEach(path => {
        if (path !== finalVideo && fs.existsSync(path)) fs.unlinkSync(path);
      });

      console.log('✅ 多层视频合成完成');
      return finalVideo;

    } catch (error) {
      console.error('❌ 多层视频合成失败:', error);
      throw error;
    }
  }

  /**
   * 叠加背景层（全屏）
   */
  async overlayBackgroundLayer(videoPath, layer, platform) {
    const outputPath = path.join(this.cacheDir, `bg_${Date.now()}_${layer.sceneId}.mp4`);

    console.log(`        → 背景层: 全屏显示 ${layer.path}`);

    try {
      // ⭐ 修复：确保背景图片缩放到偶数尺寸（避免libx264编码失败）
      // 使用scale + pad确保最终尺寸是精确的1080x1920
      const filterComplex =
        `[0:v]scale=${DOUYIN_SPECS.width}:${DOUYIN_SPECS.height}:force_original_aspect_ratio=decrease,` +
        `pad=${DOUYIN_SPECS.width}:${DOUYIN_SPECS.height}:(ow-iw)/2:(oh-ih)/2:color=black[bg];` +
        `[1:v]scale=${DOUYIN_SPECS.width}:${DOUYIN_SPECS.height}[scaled];` +
        `[bg][scaled]overlay=(W-w)/2:(H-h)/2:format=auto,setsar=1`;

      const cmd = `ffmpeg -i "${layer.path}" -i "${videoPath}" -filter_complex "${filterComplex}" -map 0:a? -c:v libx264 -preset fast -pix_fmt yuv420p -shortest "${outputPath}" -y`;

      await execAsync(cmd);
      return outputPath;
    } catch (error) {
      console.error(`        ❌ 背景层叠加失败:`, error.message);
      return videoPath; // 失败则返回原视频
    }
  }

  /**
   * 叠加PIP层（画中画）
   */
  async overlayPIPLayer(videoPath, layer, platform, position = 'top-right') {
    const outputPath = path.join(this.cacheDir, `pip_${Date.now()}_${layer.sceneId}.mp4`);

    console.log(`        → PIP层: 位置=${position} ${layer.path}`);

    try {
      // 获取PIP配置
      const pipConfig = this.faceExtractorV2?.verticalPIPConfig?.[platform];
      const pipWidth = pipConfig?.width || 324;
      const pipHeight = pipConfig?.height || 576;

      // 计算位置
      let pipX, pipY;
      if (position === 'top-right') {
        pipX = 1080 - pipWidth - 80;
        pipY = 200;
      } else if (position === 'bottom') {
        pipX = pipConfig?.position?.x || 378;
        pipY = pipConfig?.position?.y || 1200;
      } else if (position === 'center') {
        pipX = (1080 - pipWidth) / 2;
        pipY = (1920 - pipHeight) / 2;
      }

      console.log(`          坐标: x=${pipX}, y=${pipY}, 尺寸=${pipWidth}x${pipHeight}`);

      // 叠加PIP视频
      const filterComplex = `[1:v]scale=${pipWidth}:${pipHeight}[pip];[0:v][pip]overlay=${pipX}:${pipY}:format=auto`;
      const cmd = `ffmpeg -i "${videoPath}" -i "${layer.path}" -filter_complex "${filterComplex}" -map 0:a? -c:v libx264 -preset fast -pix_fmt yuv420p -shortest "${outputPath}" -y`;

      await execAsync(cmd);
      return outputPath;
    } catch (error) {
      console.error(`        ❌ PIP层叠加失败:`, error.message);
      return videoPath;
    }
  }

  /**
   * 叠加遮罩层（磨砂玻璃效果）
   */
  async overlayMaskLayer(videoPath, layer) {
    const outputPath = path.join(this.cacheDir, `mask_${Date.now()}_${layer.sceneId}.mp4`);

    console.log(`        → 遮罩层: 磨砂玻璃效果`);

    try {
      // 磨砂玻璃效果参数
      const blurStrength = layer.content?.blurStrength || 3; // 模糊强度 (1-10)
      const opacity = layer.content?.opacity || 0.15; // 遮罩透明度 (0.1-0.3)
      const maskColor = layer.content?.color || 'white'; // 遮罩颜色

      console.log(`          模糊强度: ${blurStrength}, 透明度: ${opacity}, 颜色: ${maskColor}`);

      // 创建磨砂玻璃效果：
      // 1. 对视频应用轻微的高斯模糊
      // 2. 叠加一个半透明的白色遮罩
      const filterComplex = `[0:v]boxblur=${blurStrength}:${blurStrength}[blurred];` +
        `[blurred]drawbox=x=0:y=0:w=iw:h=ih:color=${maskColor}@${opacity}:t=fill[masked]`;

      const cmd = `ffmpeg -i "${videoPath}" -filter_complex "${filterComplex}" -map "[masked]" -map 0:a? -c:v libx264 -preset fast -pix_fmt yuv420p -shortest "${outputPath}" -y`;

      await execAsync(cmd);
      console.log(`          ✅ 磨砂玻璃效果已应用`);
      return outputPath;
    } catch (error) {
      console.error(`        ❌ 遮罩层叠加失败:`, error.message);
      return videoPath;
    }
  }

  /**
   * 叠加卡片层（底部）
   */
  async overlayCardLayer(videoPath, layer, position = 'top', animationDelay = 0) {
    const outputPath = path.join(this.cacheDir, `card_${Date.now()}_${layer.sceneId}_${layer.zIndex}.mp4`);

    console.log(`        → 卡片层: 位置=${position}, 延迟=${animationDelay}s ${layer.path}`);

    try {
      // 卡片尺寸
      const cardWidth = 600;
      const cardHeight = 300;

      // 计算位置
      const douyinBottomSafeArea = DOUYIN_SPECS.safeArea.bottom; // 400px
      const bottomMargin = 20;

      let x, y;
      if (position === 'bottom') {
        // 第二张卡片在更下方
        x = Math.round((1080 - cardWidth) / 2);
        y = Math.round(1920 - cardHeight - douyinBottomSafeArea - bottomMargin - 150);
      } else {
        // 第一张卡片在上方
        x = Math.round((1080 - cardWidth) / 2);
        y = Math.round(1920 - cardHeight - douyinBottomSafeArea - bottomMargin - 350);
      }

      console.log(`          坐标: x=${x}, y=${y}, 尺寸=${cardWidth}x${cardHeight}`);

      // 计算时间（考虑动画延迟）
      const startTime = layer.startTime + animationDelay;
      const endTime = layer.endTime;

      // 叠加卡片
      const filterComplex = `[1:v]scale=${cardWidth}:${cardHeight}[card];[0:v][card]overlay=${x}:${y}:enable='between(t,${startTime},${endTime})':format=auto`;
      const cmd = `ffmpeg -i "${videoPath}" -i "${layer.path}" -filter_complex "${filterComplex}" -map 0:a? -c:v libx264 -preset fast -pix_fmt yuv420p -shortest "${outputPath}" -y`;

      await execAsync(cmd);
      return outputPath;
    } catch (error) {
      console.error(`        ❌ 卡片层叠加失败:`, error.message);
      return videoPath;
    }
  }

  /**
   * 合并已合成的片段
   */
  async mergeComposedSegments(segments) {
    console.log(`    - 合并 ${segments.length} 个已合成片段...`);

    if (segments.length === 1) {
      console.log(`    ✅ 只有一个片段，直接返回`);
      return segments[0];
    }

    // 创建合并列表文件
    const listPath = path.join(this.cacheDir, `concat_composed_${Date.now()}.txt`);
    const listContent = segments.map(s => `file '${s}'`).join('\n');
    fs.writeFileSync(listPath, listContent);

    // 合并视频
    const outputPath = path.join(this.outputDir, `merged_composed_${Date.now()}.mp4`);
    const cmd = `ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}" -y`;

    await execAsync(cmd);

    // 清理列表文件
    fs.unlinkSync(listPath);

    console.log(`    ✅ 片段合并完成: ${outputPath}`);
    return outputPath;
  }

  /**
   * 使用全屏图片合成视频（新方法）
   * 策略：将AI生成的图片作为全屏背景，人脸视频作为画中画
   */
  async composeWithFullscreenImages(videoPath, scenes, images, platform) {
    console.log('  🎬 全屏图片合成模式（卡片背景 + 人脸画中画）');

    try {
      // 步骤 1: 提取人脸视频（画中画）
      console.log('  1️⃣ 提取人脸视频（画中画）...');
      let faceVideo = null;
      try {
        faceVideo = await this.faceExtractorV2.extractVerticalFaceVideo(
          videoPath,
          null, // 暂时不传人脸检测结果，使用中心裁剪
          platform
        );
        console.log(`    ✅ 人脸视频提取成功: ${faceVideo}`);
      } catch (error) {
        console.error('    ⚠️ 人脸视频提取失败，将跳过画中画:', error.message);
      }

      // 步骤 2: 为每个场景创建图片视频片段
      console.log('  2️⃣ 创建图片视频片段...');
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

      // 步骤 3: 合并所有图片片段
      console.log('  3️⃣ 合并图片片段...');
      const mergedVideo = await this.mergeImageSegments(imageSegments);

      // 步骤 4: 叠加人脸视频（画中画）到卡片背景
      let videoWithFace = mergedVideo;
      if (faceVideo) {
        console.log('  4️⃣ 叠加人脸视频（画中画）到卡片背景...');
        videoWithFace = await this.overlayFaceVideoPIP(mergedVideo, faceVideo, platform);
      } else {
        console.log('  4️⃣ 跳过人脸画中画（未提取到人脸视频）');
      }

      // 步骤 5: 添加原视频音频
      console.log('  5️⃣ 添加原视频音频...');
      const videoWithAudio = await this.addAudioFromVideo(videoWithFace, videoPath);

      // 步骤 6: 压缩视频
      console.log('  6️⃣ 压缩视频...');
      const compressedVideo = await this.compressVideo(videoWithAudio, platform);

      // 清理临时文件
      imageSegments.forEach(seg => {
        if (fs.existsSync(seg.path)) {
          fs.unlinkSync(seg.path);
        }
      });
      if (faceVideo && fs.existsSync(faceVideo)) {
        fs.unlinkSync(faceVideo);
      }

      console.log('✅ 全屏图片视频合成完成（卡片背景 + 人脸画中画）');
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

      // 步骤 3: 先缩放到目标平台尺寸（1080x1920）
      console.log('  3️⃣ 缩放视频到目标尺寸...');
      const scaledVideo = await this.scaleVideoToTargetSize(mergedVideo, platform);

      // 步骤 4: 图片叠加（在正确的尺寸上叠加）
      let finalVideo = scaledVideo;
      if (images.length > 0) {
        console.log('  4️⃣ 叠加图片...');
        finalVideo = await this.overlayImages(scaledVideo, images);
      }

      // 步骤 5: 最终压缩（不再改变尺寸）
      console.log('  5️⃣ 最终压缩...');
      const compressedVideo = await this.finalCompress(finalVideo);

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

      // 使用重新编码来避免音画不同步
      // 移除 -c copy，使用 libx264 + aac 重新编码
      const cmd = `ffmpeg -i "${videoPath}" -ss ${startTime} -t ${duration} -c:v libx264 -preset fast -c:a aac "${outputPath}" -y`;

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
   * 叠加图片（简化版 - 移除复杂的geq圆角滤镜）
   * @param {string} videoPath - 视频路径
   * @param {Array} images - 图片列表，每个图片包含 {path, startTime, endTime}
   * @returns {Promise<string>} 叠加后的视频路径
   */
  async overlayImages(videoPath, images) {
    console.log(`    - 叠加 ${images.length} 张图片...`);

    if (images.length === 0) {
      console.log('    ⚠️ 没有图片需要叠加');
      return videoPath;
    }

    try {
      // 使用固定的1080x1920尺寸（视频已经缩放到这个尺寸）
      const videoWidth = DOUYIN_SPECS.width;   // 1080
      const videoHeight = DOUYIN_SPECS.height; // 1920

      console.log(`    - 视频尺寸: ${videoWidth}x${videoHeight}`);

      const outputPath = path.join(this.outputDir, `overlay_${Date.now()}.mp4`);

      // 策略：逐个叠加图片，每次生成一个中间视频
      let currentVideo = videoPath;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        console.log(`      - 叠加图片 ${i + 1}/${images.length}: ${img.path}`);

        // 卡片尺寸
        const cardWidth = 600;
        const cardHeight = 300;

        // 抖音底部安全区域约400px（包含文字、点赞、评论、分享等UI）
        // 卡片应该放在安全区域之上
        const douyinBottomSafeArea = DOUYIN_SPECS.safeArea.bottom; // 400px
        const bottomMargin = 20; // 额外留20px边距

        // 根据1080x1920尺寸计算位置（底部居中，避开抖音UI）
        const x = Math.round((videoWidth - cardWidth) / 2);
        const y = Math.round(videoHeight - cardHeight - douyinBottomSafeArea - bottomMargin);

        const width = cardWidth;
        const height = cardHeight;
        const startTime = img.startTime || 0;
        const endTime = img.endTime || 999999;

        console.log(`        → 时间: ${startTime}s - ${endTime}s`);
        console.log(`        → 位置: x=${x}, y=${y} (避开抖音底部UI)`);
        console.log(`        → 尺寸: ${width}x${height}`);

        // 生成输出路径
        const tempOutput = i === images.length - 1
          ? outputPath
          : path.join(this.cacheDir, `temp_overlay_${Date.now()}_${i}.mp4`);

        // 简化的FFmpeg overlay滤镜（移除geq圆角和淡入淡出）
        // 只做：1. 缩放图片  2. 叠加到视频上
        const filterComplex =
          `[1:v]scale=${width}:${height}[scaled];` +
          `[0:v][scaled]overlay=${x}:${y}:enable='between(t,${startTime},${endTime})'`;

        // 执行 FFmpeg 命令
        const cmd = `ffmpeg -i "${currentVideo}" -i "${img.path}" -filter_complex "${filterComplex}" -c:a copy -preset fast "${tempOutput}" -y`;

        console.log(`        → FFmpeg命令: ${cmd.substring(0, 200)}...`);

        try {
          const result = await execAsync(cmd);
          console.log(`      ✅ 图片 ${i + 1} 叠加完成`);

          // 清理上一个临时文件（如果不是原始视频）
          if (currentVideo !== videoPath && fs.existsSync(currentVideo)) {
            fs.unlinkSync(currentVideo);
          }

          // 更新当前视频为新生成的视频
          currentVideo = tempOutput;

        } catch (error) {
          console.error(`      ❌ 图片 ${i + 1} 叠加失败:`, error.message);
          console.error(`      FFmpeg错误输出:`, error.stderr || error.stdout);
          throw error;
        }
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
   * 叠加人脸视频（画中画）- 用于卡片背景场景
   * 位置：底部中央（符合抖音习惯）
   * @param {string} videoPath - 背景视频路径（卡片）
   * @param {string} faceVideoPath - 人脸视频路径
   * @param {string} platform - 目标平台
   * @param {string} position - 画中画位置 ('bottom' | 'center' | 'topRight')
   * @returns {Promise<string>} 叠加后的视频路径
   */
  async overlayFaceVideoPIP(videoPath, faceVideoPath, platform = 'douyin', position = 'bottom') {
    console.log(`    - 叠加人脸视频（画中画）到卡片背景...`);

    const outputPath = path.join(this.outputDir, `with_face_pip_${Date.now()}.mp4`);

    try {
      // 获取平台配置
      const pipConfig = this.faceExtractorV2.verticalPIPConfig[platform];
      const style = pipConfig.style || {};

      // 画中画位置选项：
      let pipX, pipY;

      if (position === 'topRight') {
        pipX = 1080 - pipConfig.width - 80;
        pipY = 200;
        console.log(`    📍 画中画位置: 右上角`);
      } else if (position === 'center') {
        pipX = (1080 - pipConfig.width) / 2;
        pipY = (1920 - pipConfig.height) / 2;
        console.log(`    📍 画中画位置: 中央`);
      } else {
        pipX = pipConfig.position.x;
        pipY = pipConfig.position.y;
        console.log(`    📍 画中画位置: 底部中央`);
      }

      console.log(`    📐 坐标: x=${pipX}, y=${pipY}, 尺寸=${pipConfig.width}x${pipConfig.height}`);

      // 样式参数
      const borderWidth = style.borderWidth || 4;
      const borderColor = style.borderColor || 'white';
      const cornerRadius = style.borderRadius || 20;
      const shadowEnabled = style.shadow || false;

      console.log(`    🎨 应用圆角 (${cornerRadius}px) + 边框 (${borderWidth}px) + 阴影 (${shadowEnabled ? '启用' : '禁用'})...`);

      // 使用新的圆角服务处理人脸视频
      const roundedFaceVideoPath = await this.roundedCornerService.applyRoundedCornersToVideo(
        faceVideoPath,
        cornerRadius,
        {
          width: pipConfig.width,
          height: pipConfig.height,
          borderWidth: borderWidth,
          borderColor: borderColor,
          shadow: {
            enabled: shadowEnabled,
            offsetX: 2,
            offsetY: 6,
            blur: 4,
            opacity: 0.3
          },
          useVP9: true  // 使用VP9编码器以支持透明度
        }
      );

      // 将处理后的圆角视频叠加到背景视频
      // 注意：由于圆角视频已经包含边框和阴影，我们需要调整叠加位置
      const totalWidth = pipConfig.width + borderWidth * 2 + (shadowEnabled ? 16 : 0);
      const totalHeight = pipConfig.height + borderWidth * 2 + (shadowEnabled ? 16 : 0);
      const offsetX = shadowEnabled ? 8 : 0;
      const offsetY = shadowEnabled ? 8 : 0;

      const overlayX = pipX - borderWidth - offsetX;
      const overlayY = pipY - borderWidth - offsetY;

      // 使用FFmpeg叠加圆角视频到背景
      const cmd = `ffmpeg -i "${videoPath}" -i "${roundedFaceVideoPath}" -filter_complex "[0:v][1:v]overlay=${overlayX}:${overlayY}:format=auto" -c:a copy -preset fast "${outputPath}" -y`;

      await execAsync(cmd);

      // 清理临时文件
      if (fs.existsSync(roundedFaceVideoPath)) {
        fs.unlinkSync(roundedFaceVideoPath);
      }

      console.log(`    ✅ 人脸画中画叠加完成（圆角+边框+阴影）: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('    ❌ 人脸画中画叠加失败:', error);
      console.error('    ⚠️ 尝试使用简化版本（仅边框）...');

      // 降级方案：只添加边框，不添加圆角
      try {
        const pipConfig = this.faceExtractorV2.verticalPIPConfig[platform];
        const style = pipConfig.style || {};
        const borderWidth = style.borderWidth || 4;
        const borderColor = style.borderColor || 'white';

        let pipX, pipY;
        if (position === 'topRight') {
          pipX = 1080 - pipConfig.width - 80;
          pipY = 200;
        } else if (position === 'center') {
          pipX = (1080 - pipConfig.width) / 2;
          pipY = (1920 - pipConfig.height) / 2;
        } else {
          pipX = pipConfig.position.x;
          pipY = pipConfig.position.y;
        }

        const simpleFilter = `[1:v]scale=${pipConfig.width}:${pipConfig.height},pad=${pipConfig.width + borderWidth * 2}:${pipConfig.height + borderWidth * 2}:${borderWidth}:${borderWidth}:${borderColor}[pip];[0:v][pip]overlay=${pipX - borderWidth}:${pipY - borderWidth}`;
        const simpleCmd = `ffmpeg -i "${videoPath}" -i "${faceVideoPath}" -filter_complex "${simpleFilter}" -c:a copy -preset fast "${outputPath}" -y`;

        await execAsync(simpleCmd);
        console.log(`    ✅ 使用简化版本完成（仅边框）`);
        return outputPath;
      } catch (fallbackError) {
        console.error('    ❌ 简化版本也失败:', fallbackError);
        return videoPath;
      }
    }
  }

  /**
   * 叠加人脸视频（画中画）- 旧方法（保留兼容性）
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
   * 获取视频信息（宽度、高度、时长等）
   * @param {string} videoPath - 视频路径
   * @returns {Promise<Object>} 视频信息 {width, height, duration}
   */
  async getVideoInfo(videoPath) {
    try {
      const cmd = `ffprobe -v quiet -print_format json -show_streams "${videoPath}"`;
      const { stdout } = await execAsync(cmd);
      const info = JSON.parse(stdout);

      // 查找视频流
      const videoStream = info.streams.find(s => s.codec_type === 'video');

      if (!videoStream) {
        throw new Error('未找到视频流');
      }

      return {
        width: videoStream.width,
        height: videoStream.height,
        duration: parseFloat(videoStream.duration || 0)
      };
    } catch (error) {
      console.error('获取视频信息失败:', error.message);
      // 返回默认值（假设是竖屏视频）
      return {
        width: 1080,
        height: 1920,
        duration: 0
      };
    }
  }

  /**
   * 压缩视频并确保符合平台规范
   */
  async compressVideo(videoPath, platform) {
    console.log(`    - 压缩视频（平台: ${platform}）...`);

    const outputPath = path.join(this.outputDir, `compressed_${Date.now()}.mp4`);

    // 根据平台选择参数
    let bitrate = '12M';
    let preset = 'medium';
    let scaleFilter = '';

    if (platform === 'douyin') {
      bitrate = '12M';  // 抖音高质量
      preset = 'medium';
      // 确保视频尺寸符合抖音规范：1080x1920
      scaleFilter = `-vf "scale=${DOUYIN_SPECS.width}:${DOUYIN_SPECS.height}:force_original_aspect_ratio=decrease,pad=${DOUYIN_SPECS.width}:${DOUYIN_SPECS.height}:(ow-iw)/2:(oh-ih)/2:black"`;
    }

    // 使用 FFmpeg 压缩视频，确保尺寸正确
    const cmd = `ffmpeg -i "${videoPath}" ${scaleFilter} -c:v libx264 -preset ${preset} -crf 20 -b:v ${bitrate} -maxrate ${bitrate} -bufsize ${parseInt(bitrate) * 2}M -c:a aac -b:a 192k "${outputPath}" -y`;

    await execAsync(cmd);

    // 清理原始文件
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    console.log(`    ✅ 压缩完成: ${outputPath}`);
    return outputPath;
  }

  /**
   * 缩放视频到目标平台尺寸（不压缩）
   * @param {string} videoPath - 视频路径
   * @param {string} platform - 目标平台
   * @returns {Promise<string>} 缩放后的视频路径
   */
  async scaleVideoToTargetSize(videoPath, platform) {
    console.log(`    - 缩放视频到目标尺寸...`);

    const outputPath = path.join(this.outputDir, `scaled_${Date.now()}.mp4`);

    // 根据平台获取目标尺寸
    let targetWidth = DOUYIN_SPECS.width;   // 1080
    let targetHeight = DOUYIN_SPECS.height; // 1920

    if (platform === 'douyin') {
      targetWidth = DOUYIN_SPECS.width;
      targetHeight = DOUYIN_SPECS.height;
    }

    console.log(`    - 目标尺寸: ${targetWidth}x${targetHeight}`);

    // 缩放并填充黑边以保持纵横比
    const scaleFilter = `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:black`;
    const cmd = `ffmpeg -i "${videoPath}" -vf "${scaleFilter}" -c:v libx264 -preset fast -c:a aac "${outputPath}" -y`;

    await execAsync(cmd);

    // 清理原始文件
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    console.log(`    ✅ 缩放完成: ${outputPath}`);
    return outputPath;
  }

  /**
   * 最终压缩（不改变尺寸）
   * @param {string} videoPath - 视频路径
   * @returns {Promise<string>} 压缩后的视频路径
   */
  async finalCompress(videoPath) {
    console.log(`    - 最终压缩...`);

    const outputPath = path.join(this.outputDir, `final_${Date.now()}.mp4`);

    // 使用高质量压缩参数
    const bitrate = '12M';
    const preset = 'medium';

    // 只压缩，不改变尺寸
    const cmd = `ffmpeg -i "${videoPath}" -c:v libx264 -preset ${preset} -crf 20 -b:v ${bitrate} -maxrate ${bitrate} -bufsize ${parseInt(bitrate) * 2}M -c:a aac -b:a 192k "${outputPath}" -y`;

    await execAsync(cmd);

    // 清理原始文件
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    console.log(`    ✅ 最终压缩完成: ${outputPath}`);
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
    console.log('🎬 使用组合单元合成视频（竖版画中画优化版）');
    console.log(`  - 原视频: ${videoPath}`);
    console.log(`  - 组合单元: ${compositionUnitPath}`);
    console.log(`  - 目标平台: ${platform}`);

    try {
      // 步骤 1: 提取竖版人脸视频（画中画）- 使用V2优化版
      console.log('  1️⃣ 提取竖版人脸视频...');
      const faceVideo = await this.faceExtractorV2.extractVerticalFaceVideo(
        videoPath,
        faceDetection,
        platform
      );

      // 步骤 2: 从组合单元图片创建视频
      console.log('  2️⃣ 从组合单元创建视频...');
      const compositionVideo = await this.createVideoFromImage(compositionUnitPath, 10); // 10秒

      // 步骤 3: 叠加竖版人脸视频到组合单元视频的 PIP 位置
      console.log('  3️⃣ 叠加竖版人脸视频到 PIP 位置...');
      const videoWithPIP = await this.overlayVerticalFaceVideoToPIP(compositionVideo, faceVideo, platform);

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

      console.log('✅ 组合单元视频合成完成（竖版画中画）');
      return finalVideo;

    } catch (error) {
      console.error('❌ 组合单元视频合成失败:', error);
      throw error;
    }
  }

  /**
   * 叠加竖版人脸视频到 PIP 位置（优化版）
   * @param {string} videoPath - 背景视频路径
   * @param {string} faceVideoPath - 竖版人脸视频路径
   * @param {string} platform - 目标平台
   * @returns {Promise<string>} 叠加后的视频路径
   */
  async overlayVerticalFaceVideoToPIP(videoPath, faceVideoPath, platform = 'douyin') {
    console.log(`    - 叠加竖版人脸视频到 PIP 位置...`);

    const outputPath = path.join(this.outputDir, `with_vertical_pip_${Date.now()}.mp4`);

    try {
      // 获取平台配置
      const pipConfig = this.faceExtractorV2.verticalPIPConfig[platform];

      // 使用 FFmpeg overlay 叠加竖版人脸视频
      const filterComplex = `[1:v]scale=${pipConfig.width}:${pipConfig.height}[pip];[0:v][pip]overlay=${pipConfig.position.x}:${pipConfig.position.y}`;

      const cmd = `ffmpeg -i "${videoPath}" -i "${faceVideoPath}" -filter_complex "${filterComplex}" -c:a copy -preset fast "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`    ✅ 竖版 PIP 叠加完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('    ❌ 竖版 PIP 叠加失败:', error);
      return videoPath; // 返回原视频
    }
  }
}

export default ServerVideoCompositionService;
