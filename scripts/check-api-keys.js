/**
 * API配置检查脚本
 * 检查所有必需的API密钥是否配置完整
 */

import { isAPIConfigured, getAllAPIConfigs } from '../src/config/api-keys.js';

console.log('\n' + '='.repeat(60));
console.log('🔑 API配置检查');
console.log('='.repeat(60));

// 检查核心API（必需）
const coreAPIs = [
  { name: 'baiduSpeech', label: '百度语音识别', required: true },
  { name: 'wenxin', label: '文心一言', required: true },
  { name: 'baiduNlp', label: '百度NLP', required: false }
];

// 检查素材API（至少一个）
const materialAPIs = [
  { name: 'unsplash', label: 'Unsplash', required: false },
  { name: 'pexels', label: 'Pexels', required: false },
  { name: 'pixabay', label: 'Pixabay', required: false }
];

// 检查可选API
const optionalAPIs = [
  { name: 'googleSearch', label: 'Google搜索', required: false },
  { name: 'bingSearch', label: 'Bing搜索', required: false },
  { name: 'openai', label: 'OpenAI', required: false }
];

let allPassed = true;
let coreCount = 0;
let materialCount = 0;

console.log('\n📌 核心API（必需）:');
for (const api of coreAPIs) {
  const configured = isAPIConfigured(api.name);
  const status = configured ? '✅' : '❌';
  console.log(`  ${status} ${api.label} (${api.name})`);

  if (api.required && !configured) {
    allPassed = false;
  }
  if (configured) {
    coreCount++;
  }
}

console.log('\n🖼️  素材API（至少一个）:');
for (const api of materialAPIs) {
  const configured = isAPIConfigured(api.name);
  const status = configured ? '✅' : '⚪';
  console.log(`  ${status} ${api.label} (${api.name})`);

  if (configured) {
    materialCount++;
  }
}

if (materialCount === 0) {
  console.log('  ⚠️  警告: 没有配置任何素材API');
}

console.log('\n🔧 可选API:');
for (const api of optionalAPIs) {
  const configured = isAPIConfigured(api.name);
  const status = configured ? '✅' : '⚪';
  console.log(`  ${status} ${api.label} (${api.name})`);
}

console.log('\n' + '='.repeat(60));
console.log('📊 检查结果');
console.log('='.repeat(60));

console.log(`\n核心API: ${coreCount}/${coreAPIs.length} 已配置`);
console.log(`素材API: ${materialCount}/${materialAPIs.length} 已配置`);

if (allPassed && materialCount > 0) {
  console.log('\n✅ 所有必需的API都已配置，可以开始测试！');
  process.exit(0);
} else {
  console.log('\n❌ 部分必需的API未配置，请检查配置文件');

  if (!isAPIConfigured('baiduSpeech')) {
    console.log('\n⚠️  百度语音识别未配置:');
    console.log('   1. 访问 https://ai.baidu.com/tech/speech/asr');
    console.log('   2. 创建应用并获取API Key和Secret Key');
    console.log('   3. 更新 src/config/api-keys.js 中的 BAIDU_SPEECH_CONFIG');
  }

  if (!isAPIConfigured('wenxin')) {
    console.log('\n⚠️  文心一言未配置:');
    console.log('   1. 访问 https://cloud.baidu.com/product/wenxinworkshop');
    console.log('   2. 创建应用并获取API Key和Secret Key');
    console.log('   3. 更新 src/config/api-keys.js 中的 WENXIN_CONFIG');
  }

  if (materialCount === 0) {
    console.log('\n⚠️  素材API未配置:');
    console.log('   建议至少配置一个素材API（Unsplash/Pexels/Pixabay）');
    console.log('   1. Unsplash: https://unsplash.com/developers');
    console.log('   2. Pexels: https://www.pexels.com/api/');
    console.log('   3. Pixabay: https://pixabay.com/api/docs/');
  }

  process.exit(1);
}
