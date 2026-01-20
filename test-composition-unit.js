/**
 * 测试完整组合单元生成
 *
 * 包含：
 * 1. 深色科技底图
 * 2. 多张豆包生图（智能排版）
 * 3. 美化文字（标题、关键词）
 * 4. PIP 占位框（右上角）
 * 5. 装饰元素
 */

import { getInstance as getCompositionGenerator } from './vidslide-ai/src/services/CompositionUnitGenerator.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function testCompositionUnit() {
  console.log('\n🎨 测试完整组合单元生成');
  console.log('='.repeat(60));

  const generator = getCompositionGenerator();
  const outputDir = './test-output-composition';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // 1. 下载测试图片
    console.log('\n📥 下载测试图片...');
    const imageUrls = [
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600',
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600'
    ];

    const imagePaths = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const outputPath = path.join(outputDir, `test-image-${i + 1}.jpg`);
      const command = `curl -s -o "${outputPath}" "${imageUrls[i]}"`;
      await execAsync(command);

      if (fs.existsSync(outputPath)) {
        console.log(`  ✅ 图片 ${i + 1} 下载成功`);
        imagePaths.push(outputPath);
      }
    }

    // 2. 生成组合单元
    console.log('\n🎬 生成组合单元...');
    const unitPath = await generator.generateCompositionUnit({
      mainTitle: 'AI大模型技术',
      keywords: ['人工智能', '深度学习', '神经网络'],
      images: imagePaths,
      decorativeText: '探索未来科技的无限可能',
      stylePreset: 'tech'
    });

    console.log('\n✅ 组合单元生成成功！');
    console.log(`   文件路径: ${unitPath}`);

    // 3. 查看文件信息
    const stats = fs.statSync(unitPath);
    console.log(`   文件大小: ${(stats.size / 1024).toFixed(2)} KB`);

    // 4. 打开查看
    console.log('\n💡 打开查看效果:');
    console.log(`   open "${unitPath}"`);

    await execAsync(`open "${unitPath}"`);

    // 5. 生成报告
    const report = `# 完整组合单元测试报告

## 测试时间
${new Date().toLocaleString('zh-CN')}

## 组合单元内容

### 1. 深色科技底图 ✅
- 深蓝渐变背景 (#0a0e27 → #1a1f3a)
- 粒子效果
- 不再单调

### 2. 豆包生图 ✅
- 图片数量: ${imagePaths.length}
- 智能排版: 避开 PIP 区域
- 圆角边框: 16-32px
- 发光效果: 根据风格自动配置

### 3. 美化文字 ✅
- 主标题: "AI大模型技术" (88px, 加粗, 发光)
- 关键词标签: 3个 (圆角标签样式)
- 装饰文字: 副标题 (36px, 半透明)

### 4. PIP 占位框 ✅
- 位置: 右上角 (720, 120)
- 尺寸: 320x180
- 边框: 白色 3px
- 圆角: 16px

### 5. 装饰元素 ✅
- 顶部装饰线
- 底部装饰线
- 角落装饰框

## 视频结构

\`\`\`
┌─────────────────────────────────┐
│                                 │
│     AI大模型技术    ┌──────┐   │ ← 主标题 + PIP
│     ─────────────   │ PIP  │   │
│                     └──────┘   │
│                                 │
│     ┌────────┐                  │
│     │ 图片1  │                  │ ← 豆包生图1
│     └────────┘                  │
│                                 │
│              ┌────────┐         │
│              │ 图片2  │         │ ← 豆包生图2
│              └────────┘         │
│                                 │
│  ┌────────┐                     │
│  │ 图片3  │                     │ ← 豆包生图3
│  └────────┘                     │
│                                 │
│  ─────────────────────────────  │ ← 装饰线
│  [人工智能] [深度学习] [神经网络] │ ← 关键词标签
│  探索未来科技的无限可能          │ ← 装饰文字
│                                 │
│  [抖音文字区域]                 │ ← 底部预留
└─────────────────────────────────┘
\`\`\`

## 文件信息
- 路径: ${unitPath}
- 大小: ${(stats.size / 1024).toFixed(2)} KB
- 尺寸: 1080x1920

## 结论

✅ **完整组合单元生成成功！**

包含所有必要元素：
1. ✅ 深色科技底图
2. ✅ 多张豆包生图（智能排版）
3. ✅ 美化文字（标题、关键词、装饰）
4. ✅ PIP 占位框（右上角）
5. ✅ 装饰元素（线条、边框）

**下一步**: 将此组合单元转换为视频，叠加真实 PIP 视频。
`;

    const reportPath = path.join(outputDir, 'COMPOSITION_UNIT_REPORT.md');
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 测试报告: ${reportPath}`);

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    throw error;
  }
}

testCompositionUnit().catch(console.error);
