#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function main() {
  console.log('🔧 使用正确的比例重新生成...');
  console.log('画中画尺寸: 500x888 (正确的9:16比例)');
  
  const videoPath = '/Users/weilei/Desktop/测试视频2.MP4';
  const outputPath = '/Users/weilei/VidSlide AI/output/correct-pip.mp4';
  
  // 裁剪并缩放到正确的比例
  const cmd = `ffmpeg -i "${videoPath}" -vf "crop=1284:2282:0:248,scale=500:888" -t 5 -c:v libx264 -preset fast -crf 20 "${outputPath}" -y`;
  
  await execAsync(cmd);
  console.log('✅ 完成！');
  console.log('输出:', outputPath);
}

main().catch(console.error);
