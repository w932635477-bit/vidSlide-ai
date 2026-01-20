/**
 * 调试 Sharp composite 功能
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sharp = require('./remotion-templates/node_modules/sharp');
import fs from 'fs';

async function debugSharp() {
  console.log('🔍 调试 Sharp composite 功能\n');

  try {
    // 1. 创建简单的背景
    console.log('1. 创建背景...');
    const bgSvg = `
      <svg width="1080" height="1920">
        <rect width="1080" height="1920" fill="#0a0e27" />
      </svg>
    `;

    const background = sharp(Buffer.from(bgSvg));
    await background.toFile('debug-bg.png');
    console.log('   ✅ 背景创建成功: debug-bg.png');

    // 2. 测试叠加图片
    console.log('\n2. 测试叠加图片...');
    const imagePath = 'test-output-composition/test-image-1.jpg';

    if (!fs.existsSync(imagePath)) {
      console.error('   ❌ 测试图片不存在');
      return;
    }

    // 处理图片
    const processedImage = await sharp(imagePath)
      .resize(600, 600, { fit: 'cover' })
      .toBuffer();

    console.log('   ✅ 图片处理成功');

    // 叠加到背景
    const composed = await sharp(Buffer.from(bgSvg))
      .composite([
        {
          input: processedImage,
          top: 400,
          left: 240
        }
      ])
      .toFile('debug-composed.png');

    console.log('   ✅ 图片叠加成功: debug-composed.png');
    console.log('   尺寸:', composed.width, 'x', composed.height);

    // 3. 测试添加文字 SVG
    console.log('\n3. 测试添加文字...');
    const textSvg = `
      <svg width="1080" height="1920">
        <text
          x="540"
          y="200"
          font-family="Arial"
          font-size="88"
          font-weight="bold"
          fill="white"
          text-anchor="middle"
        >测试标题</text>
      </svg>
    `;

    const withText = await sharp(Buffer.from(bgSvg))
      .composite([
        {
          input: processedImage,
          top: 400,
          left: 240
        },
        {
          input: Buffer.from(textSvg),
          top: 0,
          left: 0
        }
      ])
      .toFile('debug-with-text.png');

    console.log('   ✅ 文字添加成功: debug-with-text.png');

    console.log('\n✅ 所有测试通过！');
    console.log('\n查看结果:');
    console.log('   open debug-bg.png');
    console.log('   open debug-composed.png');
    console.log('   open debug-with-text.png');

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    console.error('错误详情:', error.stack);
  }
}

debugSharp();
