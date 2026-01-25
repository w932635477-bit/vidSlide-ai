/**
 * 5层视频合成测试
 *
 * 测试完整的5层视频结构：
 * Layer 1 (zIndex=0): 黑科技背景
 * Layer 2 (zIndex=1): 关键词相关素材
 * Layer 3 (zIndex=2): 遮罩/装饰层
 * Layer 4 (zIndex=3): 明亮关键词卡片
 * Layer 5 (zIndex=4): 人脸跟踪PIP
 */

import dotenv from 'dotenv';
dotenv.config();

import ServerVideoCompositionService from './src/services/ServerVideoCompositionService.js';
import MaterialSearchService from './src/services/MaterialSearchService.js';
import ProfessionalCardGenerator from './src/services/ProfessionalCardGenerator.js';
import BackgroundGeneratorService from './src/services/BackgroundGeneratorService.js';
import FaceVideoExtractorServiceV2 from './src/services/FaceVideoExtractorServiceV2.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 测试5层视频合成
 */
async function test5LayerComposition() {
  console.log('\n' + '='.repeat(80));
  console.log('🎬 VidSlide AI - 5层视频合成测试');
  console.log('='.repeat(80));
  console.log('\n📋 5层结构:');
  console.log('  Layer 1 (zIndex=0): 黑科技背景 (全屏)');
  console.log('  Layer 2 (zIndex=1): 关键词相关素材 (全屏)');
  console.log('  Layer 3 (zIndex=2): 遮罩/装饰层 (待实现)');
  console.log('  Layer 4 (zIndex=3): 明亮关键词卡片 (底部)');
  console.log('  Layer 5 (zIndex=4): 人脸跟踪PIP (画中画)');
  console.log('='.repeat(80));

  // 测试视频路径
  const videoPath = '/Users/weilei/Desktop/测试视频.MP4';

  // 验证文件存在
  if (!fs.existsSync(videoPath)) {
    console.error(`\n❌ 错误: 找不到测试视频: ${videoPath}`);
    console.error('💡 请确保视频文件存在，或修改videoPath变量指向正确的路径');
    process.exit(1);
  }

  // 获取视频信息
  const videoStats = fs.statSync(videoPath);
  console.log(`\n📹 输入视频信息:`);
  console.log(`  路径: ${videoPath}`);
  console.log(`  大小: ${(videoStats.size / 1024 / 1024).toFixed(2)} MB`);

  // 创建输出目录
  const outputDir = path.join(__dirname, 'output/5-layer-test');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  console.log(`  输出目录: ${outputDir}`);

  // 初始化服务
  console.log(`\n🔧 初始化服务...`);
  const compositionService = new ServerVideoCompositionService();
  const materialSearch = new MaterialSearchService({
    logger: console,
    unsplashKey: process.env.UNSPLASH_ACCESS_KEY,
    pexelsKey: process.env.PEXELS_API_KEY
  });
  const cardGenerator = new ProfessionalCardGenerator();
  const backgroundGenerator = new BackgroundGeneratorService();
  const faceExtractor = new FaceVideoExtractorServiceV2();

  console.log('  ✅ ServerVideoCompositionService');
  console.log('  ✅ MaterialSearchService');
  console.log('  ✅ ProfessionalCardGenerator');
  console.log('  ✅ BackgroundGeneratorService');
  console.log('  ✅ FaceVideoExtractorServiceV2');

  // 定义测试关键词
  const keywords = [
    { text: '抖音', startTime: 0, endTime: 3 },
    { text: '直播带货', startTime: 3, endTime: 6 }
  ];

  console.log(`\n📝 测试关键词: ${keywords.map(k => k.text).join(', ')}`);

  // 记录开始时间
  const startTime = Date.now();

  try {
    // ========================================
    // 步骤1: 提取人脸视频 (Layer 5)
    // ========================================
    console.log(`\n` + '='.repeat(80));
    console.log('1️⃣  提取人脸视频 (Layer 5)');
    console.log('='.repeat(80));

    const faceVideoPath = await faceExtractor.extractVerticalFaceVideo(
      videoPath,
      null, // 使用中心裁剪
      'douyin'
    );

    console.log(`✅ 人脸视频提取完成: ${faceVideoPath}`);

    // ========================================
    // 步骤2: 准备各层素材
    // ========================================
    console.log(`\n` + '='.repeat(80));
    console.log('2️⃣  准备各层素材');
    console.log('='.repeat(80));

    const layers = [];

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const sceneId = `scene_${i + 1}`;

      console.log(`\n📦 场景 ${i + 1}: "${keyword.text}" (${keyword.startTime}s - ${keyword.endTime}s)`);

      // Layer 1: 黑科技背景
      console.log('  → 生成背景 (Layer 1)...');
      const backgroundPath = await backgroundGenerator.generateBackground(
        1080,
        1920,
        'dark' // 使用纯色深色背景（避免渐变FFmpeg语法问题）
      );
      console.log(`    ✅ 背景: ${path.basename(backgroundPath)}`);

      layers.push({
        layerType: 'background',
        path: backgroundPath,
        sceneId: sceneId,
        startTime: keyword.startTime,
        endTime: keyword.endTime,
        zIndex: 0
      });

      // Layer 2: 关键词相关素材
      console.log('  → 搜索素材 (Layer 2)...');
      const materialPath = await materialSearch.searchMaterial(keyword.text);
      console.log(`    ✅ 素材: ${path.basename(materialPath)}`);

      // 注意：素材作为第二层背景，也使用 'background' 类型但 zIndex 更高
      layers.push({
        layerType: 'background',
        path: materialPath,
        sceneId: sceneId,
        startTime: keyword.startTime,
        endTime: keyword.endTime,
        zIndex: 1,
        content: { opacity: 0.7 } // 可选：降低透明度以显示底层背景
      });

      // Layer 3: 遮罩/装饰层（磨砂玻璃效果）
      console.log('  → 添加遮罩层 (Layer 3)...');

      // 遮罩层不需要额外的素材文件，直接通过FFmpeg滤镜实现
      layers.push({
        layerType: 'mask',
        path: null, // 遮罩层不需要素材文件
        sceneId: sceneId,
        startTime: keyword.startTime,
        endTime: keyword.endTime,
        zIndex: 2,
        content: {
          blurStrength: 3,    // 模糊强度 (轻微模糊)
          opacity: 0.15,      // 透明度 (15%，能看到下层素材)
          color: 'white'      // 白色遮罩
        }
      });
      console.log('    ✅ 遮罩层: 磨砂玻璃效果 (模糊=3, 透明度=0.15)');

      // Layer 4: 明亮关键词卡片
      console.log('  → 生成卡片 (Layer 4)...');
      const cardPath = await cardGenerator.generateCard(keyword, {
        style: 'bright',
        width: 600,
        height: 300,
        animation: {
          enabled: true,
          type: 'slideInFromBottom',
          duration: 0.5,
          delay: 0.2
        }
      });
      console.log(`    ✅ 卡片: ${path.basename(cardPath)}`);

      layers.push({
        layerType: 'card',
        path: cardPath,
        sceneId: sceneId,
        startTime: keyword.startTime,
        endTime: keyword.endTime,
        zIndex: 3,
        content: {
          position: i % 2 === 0 ? 'top' : 'bottom', // 交替位置
          animationDelay: 0.2
        }
      });

      // Layer 5: 人脸PIP (每个场景都添加)
      console.log('  → 添加人脸PIP (Layer 5)...');
      layers.push({
        layerType: 'pip',
        path: faceVideoPath,
        sceneId: sceneId,
        startTime: keyword.startTime,
        endTime: keyword.endTime,
        zIndex: 4,
        content: {
          position: 'bottom' // 底部中央
        }
      });

      console.log(`  ✅ 场景 ${i + 1} 素材准备完成 (完整5层)`);
    }

    console.log(`\n📊 总计: ${layers.length}个图层`);

    // 按层类型统计
    const bgLayers = layers.filter(l => l.layerType === 'background');
    const maskLayers = layers.filter(l => l.layerType === 'mask');
    const pipLayers = layers.filter(l => l.layerType === 'pip');
    const cardLayers = layers.filter(l => l.layerType === 'card');

    console.log(`  - 背景层: ${bgLayers.length}个 (包含素材层)`);
    console.log(`  - 遮罩层: ${maskLayers.length}个 (磨砂玻璃)`);
    console.log(`  - 卡片层: ${cardLayers.length}个`);
    console.log(`  - PIP层: ${pipLayers.length}个`);

    // ========================================
    // 步骤3: 定义场景
    // ========================================
    console.log(`\n` + '='.repeat(80));
    console.log('3️⃣  定义场景');
    console.log('='.repeat(80));

    const scenes = keywords.map((keyword, i) => ({
      id: `scene_${i + 1}`,
      type: 'multi-layer-composition',
      startTime: keyword.startTime,
      endTime: keyword.endTime,
      keyword: keyword.text
    }));

    scenes.forEach((scene, i) => {
      console.log(`  场景 ${i + 1}: ${scene.keyword} (${scene.startTime}s - ${scene.endTime}s)`);
    });

    // ========================================
    // 步骤4: 执行5层合成
    // ========================================
    console.log(`\n` + '='.repeat(80));
    console.log('4️⃣  执行5层视频合成');
    console.log('='.repeat(80));

    const composedVideo = await compositionService.composeVideoWithLayers(
      videoPath,
      scenes,
      layers,
      'douyin'
    );

    // 记录结束时间
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // ========================================
    // 结果报告
    // ========================================
    console.log(`\n` + '='.repeat(80));
    console.log('✅ 5层视频合成完成！');
    console.log('='.repeat(80));

    const outputStats = fs.statSync(composedVideo);
    console.log(`\n📊 执行结果:`);
    console.log(`  耗时: ${duration} 秒`);
    console.log(`  输出视频: ${composedVideo}`);
    console.log(`  文件大小: ${(outputStats.size / 1024 / 1024).toFixed(2)} MB`);

    console.log(`\n🎬 5层结构验证:`);
    console.log(`  ✅ Layer 1: 黑科技背景 (${bgLayers.filter(l => l.zIndex === 0).length}个)`);
    console.log(`  ✅ Layer 2: 关键词素材 (${bgLayers.filter(l => l.zIndex === 1).length}个)`);
    console.log(`  ✅ Layer 3: 磨砂玻璃遮罩 (${maskLayers.length}个)`);
    console.log(`  ✅ Layer 4: 明亮卡片 (${cardLayers.length}个)`);
    console.log(`  ✅ Layer 5: 人脸PIP (${pipLayers.length}个)`);

    console.log(`\n💡 提示:`);
    console.log(`  1. 播放视频查看5层合成效果`);
    console.log(`  2. 验证各层是否按zIndex顺序正确渲染`);
    console.log(`  3. 检查卡片动画和PIP位置是否正确`);

    console.log(`\n✨ 测试完成！`);
    console.log('='.repeat(80));

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n` + '='.repeat(80));
    console.log('❌ 测试失败！');
    console.log('='.repeat(80));
    console.log(`\n错误: ${error.message}`);
    console.log(`\n堆栈信息:`);
    console.log(error.stack);
    console.log(`\n⏱️  耗时: ${duration} 秒`);
    console.log('='.repeat(80));
    process.exit(1);
  }
}

// 运行测试
console.log('');
test5LayerComposition().catch(error => {
  console.error('\n💥 未捕获的错误:', error);
  process.exit(1);
});
