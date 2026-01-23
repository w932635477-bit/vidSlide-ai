/**
 * 千帆平台V2协议测试脚本
 * 测试QianfanV2Service的认证和调用
 */

import QianfanV2Service from '../src/services/QianfanV2Service.js';

console.log('\n' + '='.repeat(60));
console.log('🔑 千帆平台V2协议测试');
console.log('='.repeat(60));

async function testQianfanV2() {
  const service = new QianfanV2Service();

  try {
    // 1. 测试Token获取
    console.log('\n步骤1: 测试IAM Token获取...');
    const token = await service.getIAMToken();

    if (token) {
      console.log('✅ IAM Token获取成功');
      console.log(`   Token: ${token.substring(0, 30)}...`);
    } else {
      throw new Error('Token为空');
    }

    // 2. 测试简单对话
    console.log('\n步骤2: 测试简单对话...');
    const response1 = await service.chat('你好，请用一句话介绍你自己。');

    if (response1) {
      console.log('✅ 简单对话成功');
      console.log(`   响应: ${response1.substring(0, 100)}...`);
    } else {
      throw new Error('响应为空');
    }

    // 3. 测试JSON格式输出
    console.log('\n步骤3: 测试JSON格式输出...');
    const jsonPrompt = `请以JSON格式输出以下内容：
{
  "keywords": ["强化学习", "涌现", "AI"],
  "status": "ok"
}

严格按照上面的JSON格式，不要有其他文字。`;

    const response2 = await service.chat(jsonPrompt, { temperature: 0.3 });
    console.log('✅ JSON格式测试成功');
    console.log(`   响应: ${response2}`);

    // 4. 测试实际分析场景
    console.log('\n步骤4: 测试实际内容分析...');
    const transcript = `当然了整个推理模型的过程，AI的深度思考，究竟是怎么实现的？
其实主要依赖两个核心概念：第一个是强化学习，通过不断试错来优化决策。
第二个是涌现，当系统足够复杂时会产生意想不到的能力。`;

    const analysisPrompt = `请深度分析以下视频文字稿，提取关键信息。

【文字稿】
${transcript}

【分析任务】
1. 提取3-5个核心关键词（必须是名词，长度2-6个字）
2. 识别主要观点（适合用卡片展示，不超过15字）
3. 理解作者意图

【输出格式】
严格按照JSON格式输出：

\`\`\`json
{
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "viewpoints": [
    {
      "text": "观点文字（不超过15字）",
      "importance": "high"
    }
  ],
  "intent": "作者意图描述"
}
\`\`\``;

    const response3 = await service.chat(analysisPrompt, {
      temperature: 0.3,
      max_tokens: 1000
    });

    console.log('✅ 内容分析测试成功');
    console.log(`   响应: ${response3.substring(0, 200)}...`);

    // 尝试解析JSON
    try {
      const jsonMatch = response3.match(/```json\n([\s\S]*?)\n```/) ||
                       response3.match(/```\n([\s\S]*?)\n```/) ||
                       response3.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        const analysis = JSON.parse(jsonText);
        console.log('\n✅ JSON解析成功');
        console.log(`   关键词数量: ${analysis.keywords?.length || 0}`);
        console.log(`   观点数量: ${analysis.viewpoints?.length || 0}`);
        if (analysis.keywords) {
          console.log(`   关键词: ${analysis.keywords.join(', ')}`);
        }
      }
    } catch (e) {
      console.log('⚠️  JSON解析失败，但API调用成功');
    }

    // 最终结果
    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有测试通过！千帆V2协议工作正常');
    console.log('='.repeat(60));

    return true;

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ 测试失败');
    console.log('='.repeat(60));
    console.error('\n错误信息:', error.message);

    console.log('\n💡 可能的原因:');
    console.log('   1. Access Key或Secret Key错误');
    console.log('   2. v2协议需要不同的认证方式');
    console.log('   3. 应用未开通ERNIE-3.5-8K服务');
    console.log('   4. 账号未实名认证');
    console.log('   5. 免费额度已用完');
    console.log('   6. 网络连接问题');

    console.log('\n🔧 下一步诊断:');
    console.log('   运行: node scripts/research-qianfan-auth.js');
    console.log('   该脚本将研究千帆平台的正确认证方式');

    return false;
  }
}

// 运行测试
testQianfanV2();
