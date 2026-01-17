/**
 * 自动模板生成器
 * 根据模板定义批量生成高级模板文件
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { templates } from './template-list.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 高级样式库
const premiumStyles = {
  // 磨砂玻璃效果
  glassmorphism: `
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  `,

  // 多层阴影
  premiumShadow: `
    boxShadow: \`
      0 30px 80px rgba(0, 0, 0, 0.35),
      0 15px 40px rgba(0, 0, 0, 0.25),
      0 8px 20px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    \`,
  `,

  // 双边框
  doubleBorder: `
    border: '1px solid rgba(255, 255, 255, 0.18)',
    // 内边框
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 4,
      borderRadius: 'inherit',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      pointerEvents: 'none',
    }
  `,

  // 金色光泽
  goldGloss: `
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
  `,

  // 渐变背景
  premiumGradient: `
    background: \`
      linear-gradient(135deg,
        #0f0c29 0%,
        #302b63 50%,
        #24243e 100%)
    \`,
  `,
};

// 生成模板代码
function generateTemplateCode(template) {
  const { id, name, category, description } = template;

  return `/**
 * ${name}
 * 类别: ${category}
 * 特点: ${description}
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const ${id} = ({
  title = '${name}',
  subtitle = '',
  images = [],
  brandColor = '#007AFF',
  backgroundColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 标题动画 - 平滑缓动
  const titleProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 120, stiffness: 180, mass: 0.8 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [60, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 主内容动画
  const contentProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 100, stiffness: 160 },
  });

  const scale = interpolate(contentProgress, [0, 1], [0.8, 1]);
  const opacity = interpolate(contentProgress, [0, 1], [0, 1]);

  return (
    <div style={{
      width,
      height,
      background: backgroundColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景装饰 - 柔和光效 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: \`
          radial-gradient(circle at 30% 40%, \${brandColor}15 0%, transparent 60%),
          radial-gradient(circle at 70% 60%, rgba(255,255,255,0.05) 0%, transparent 50%)
        \`,
      }} />

      {/* 主内容容器 */}
      <div style={{
        transform: \`scale(\${scale})\`,
        opacity,
        position: 'relative',
      }}>
        {/* 高级卡片 */}
        <div style={{
          width: 600,
          height: 700,
          borderRadius: 32,
          overflow: 'hidden',
          position: 'relative',
          // 磨砂玻璃效果
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          // 多层阴影
          boxShadow: \`
            0 30px 80px rgba(0, 0, 0, 0.35),
            0 15px 40px rgba(0, 0, 0, 0.25),
            0 8px 20px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          \`,
        }}>
          {/* 内边框 - 双层效果 */}
          <div style={{
            position: 'absolute',
            inset: 6,
            borderRadius: 28,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
            zIndex: 2,
          }} />

          {/* 顶部光泽 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />

          {/* 内容区域 */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}>
            {images[0] ? (
              <Img
                src={images[0]}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 20,
                }}
              />
            ) : (
              <div style={{
                fontSize: 72,
                fontWeight: '800',
                background: \`linear-gradient(135deg, \${brandColor} 0%, rgba(255,255,255,0.8) 100%)\`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
              }}>
                ${name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 标题区域 */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: \`translateY(\${titleY}px)\`,
        opacity: titleOpacity,
      }}>
        <div style={{
          display: 'inline-block',
          padding: '25px 50px',
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}>
          <h1 style={{
            fontSize: 56,
            fontWeight: '800',
            color: 'white',
            margin: 0,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            letterSpacing: -1,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: 24,
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '10px 0 0 0',
              fontWeight: '500',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
`;
}

// 批量生成模板文件
async function generateAllTemplates() {
  console.log('🚀 开始生成模板...\n');

  let created = 0;
  let skipped = 0;

  for (const template of templates) {
    const filePath = path.join(__dirname, `${template.id}.jsx`);

    // 跳过已存在的文件
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  跳过: ${template.name} (已存在)`);
      skipped++;
      continue;
    }

    // 生成代码
    const code = generateTemplateCode(template);

    // 写入文件
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`✅ 创建: ${template.name} (${template.id}.jsx)`);
    created++;
  }

  console.log(`\n📊 生成完成:`);
  console.log(`   ✅ 新创建: ${created} 个`);
  console.log(`   ⏭️  跳过: ${skipped} 个`);
  console.log(`   📁 总计: ${templates.length} 个模板`);
}

// 执行生成
generateAllTemplates().catch(console.error);
