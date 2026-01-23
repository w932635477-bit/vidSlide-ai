/**
 * 千帆平台密钥诊断和解决方案
 *
 * 问题分析：
 * 1. 用户提供的是BCE Access Key（ALTAK-xxx格式）
 * 2. OAuth 2.0认证失败：unknown client id
 * 3. IAM签名认证失败：IAM Certification failed
 *
 * 可能的原因：
 * 1. 千帆平台的"预置推理服务"可能不支持这种认证方式
 * 2. 需要创建"应用接入"类型的应用，而不是"预置推理服务"
 * 3. 需要使用API Key/Secret Key，而不是Access Key/Secret Key
 *
 * 解决方案：
 * 用户需要在千帆控制台创建一个新的应用：
 * 1. 访问：https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application
 * 2. 点击"创建应用"
 * 3. 选择"应用接入"类型（不是"预置推理服务"）
 * 4. 创建后会获得API Key和Secret Key（不是Access Key）
 * 5. API Key格式通常是：ALTAKxxx（不带连字符）或其他格式
 * 6. 使用这些密钥进行OAuth 2.0认证
 */

console.log('\\n' + '='.repeat(70));
console.log('🔍 千帆平台密钥诊断报告');
console.log('='.repeat(70));

console.log('\\n【当前情况】');
console.log('  Access Key: ALTAK-rcrLqDcwe4h2DuEqNK5CK');
console.log('  Secret Key: 916a0a8f85d4354539b00ffcfac9c59a18188396');
console.log('  应用类型: 预置推理服务-ERNIE-3.5-8K');
console.log('  认证协议: v2协议 IAM安全认证');

console.log('\\n【测试结果】');
console.log('  ❌ OAuth 2.0认证: unknown client id');
console.log('  ❌ IAM签名认证: IAM Certification failed');

console.log('\\n【问题分析】');
console.log('  1. Access Key格式（ALTAK-xxx）是BCE云平台的Access Key');
console.log('  2. 这种密钥通常用于BCE云服务的IAM认证');
console.log('  3. 但千帆平台的文心一言API可能需要不同类型的密钥');
console.log('  4. "预置推理服务"可能不支持直接API调用');

console.log('\\n【解决方案】');
console.log('\\n方案1: 创建"应用接入"类型的应用（推荐）');
console.log('  步骤：');
console.log('  1. 访问千帆控制台');
console.log('     https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application');
console.log('  2. 点击"创建应用"');
console.log('  3. 选择"应用接入"类型');
console.log('  4. 填写应用信息并创建');
console.log('  5. 在应用详情页获取API Key和Secret Key');
console.log('  6. 使用这些密钥替换当前的Access Key/Secret Key');

console.log('\\n方案2: 检查当前应用的API调用权限');
console.log('  步骤：');
console.log('  1. 登录千帆控制台');
console.log('  2. 找到当前的"预置推理服务"应用');
console.log('  3. 检查是否有"API Key"和"Secret Key"标签页');
console.log('  4. 如果有，使用这些密钥而不是Access Key');

console.log('\\n方案3: 使用千帆SDK（最简单）');
console.log('  步骤：');
console.log('  1. 安装官方SDK: npm install @baiducloud/qianfan');
console.log('  2. 使用SDK提供的认证方法');
console.log('  3. SDK会自动处理认证细节');

console.log('\\n【下一步操作】');
console.log('  请用户：');
console.log('  1. 登录千帆控制台');
console.log('  2. 检查当前应用类型和可用的密钥');
console.log('  3. 如果只有Access Key，创建新的"应用接入"类型应用');
console.log('  4. 提供新的API Key和Secret Key');

console.log('\\n【临时解决方案】');
console.log('  如果急需使用，可以考虑：');
console.log('  1. 使用其他LLM服务（如通义千问、智谱AI）');
console.log('  2. 使用百度的其他API（如ERNIE Bot API）');
console.log('  3. 等待用户提供正确的API密钥');

console.log('\\n' + '='.repeat(70));
console.log('📝 建议：请用户提供"应用接入"类型应用的API Key和Secret Key');
console.log('='.repeat(70));
console.log('');
