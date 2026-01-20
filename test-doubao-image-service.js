/**
 * DoubaoImageService 测试脚本
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getInstance } from './vidslide-ai/src/services/DoubaoImageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 .env 文件
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

loadEnv();

async function testDoubaoImageService() {
  console.log('🧪 开始测试 DoubaoImageService...\n');

  const service = getInstance();

  try {
    // 测试1: 生成基础图片
    console.log('📝 测试1: 生成基础图片');
    const imageUrl1 = await service.generateImage('人工智能', {
      sceneType: 'basic'
    });
    console.log(`✅ 基础图片生成成功`);
    console.log(`   URL: ${imageUrl1.substring(0, 100)}...\n`);

    // 等待3秒，避免速率限制
    console.log('⏳ 等待3秒...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 测试2: 生成强调图片
    console.log('📝 测试2: 生成强调图片');
    const imageUrl2 = await service.generateImage('创新科技', {
      sceneType: 'emphasis'
    });
    console.log(`✅ 强调图片生成成功`);
    console.log(`   URL: ${imageUrl2.substring(0, 100)}...\n`);

    // 测试3: 测试缓存（重复请求）
    console.log('📝 测试3: 测试缓存功能');
    const imageUrl3 = await service.generateImage('人工智能', {
      sceneType: 'basic'
    });
    console.log(`✅ 缓存测试成功（应该命中缓存）`);
    console.log(`   URL: ${imageUrl3.substring(0, 100)}...\n`);

    // 显示统计信息
    console.log('📊 统计信息:');
    const stats = service.getStats();
    console.log(JSON.stringify(stats, null, 2));

    console.log('\n✅ 所有测试通过！');
    return true;

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    return false;
  }
}

// 运行测试
testDoubaoImageService()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 测试脚本执行失败:', error);
    process.exit(1);
  });
