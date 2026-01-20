/**
 * 布局预览工具
 * 生成 HTML 页面，可视化展示不同布局方案
 */

import { getInstance as getLayoutService } from './vidslide-ai/src/services/SmartLayoutServiceV2.js';
import fs from 'fs';
import path from 'path';

class LayoutPreviewGenerator {
  constructor() {
    this.layoutService = getLayoutService();
    this.outputDir = './layout-previews';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 生成预览 HTML
   */
  generatePreviewHTML() {
    const layouts = {
      single: this.layoutService.generateLayouts(1, { layoutStyle: 'auto' }),
      doubleH: this.layoutService.generateLayouts(2, { layoutStyle: 'auto' }),
      doubleV: this.layoutService.generateLayouts(2, { layoutStyle: 'vertical' }),
      triplePyramid: this.layoutService.generateLayouts(3, { layoutStyle: 'auto' }),
      tripleGrid: this.layoutService.generateLayouts(3, { layoutStyle: 'grid' }),
      quad: this.layoutService.generateLayouts(4, { layoutStyle: 'auto' })
    };

    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VidSlide AI - 布局预览</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      background: #f5f5f5;
      padding: 40px 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 40px;
      font-size: 36px;
    }

    .layout-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }

    .layout-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .layout-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .layout-header {
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .layout-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .layout-desc {
      font-size: 14px;
      opacity: 0.9;
    }

    .layout-canvas {
      position: relative;
      width: 100%;
      padding-top: 177.78%; /* 9:16 aspect ratio */
      background: linear-gradient(180deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
      overflow: hidden;
    }

    .canvas-content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .image-box {
      position: absolute;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: 3px solid white;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 18px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      opacity: 0.9;
    }

    .pip-box {
      position: absolute;
      border: 3px solid white;
      border-radius: 12px;
      opacity: 0.6;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
    }

    .title-area {
      position: absolute;
      top: 11.5%;
      left: 5.5%;
      right: 5.5%;
      text-align: center;
      color: white;
      font-size: 28px;
      font-weight: bold;
      text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }

    .keyword-area {
      position: absolute;
      bottom: 11.5%;
      left: 5.5%;
      right: 5.5%;
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    .keyword-tag {
      background: #667eea;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .layout-info {
      padding: 20px;
      border-top: 1px solid #eee;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .info-label {
      color: #666;
    }

    .info-value {
      color: #333;
      font-weight: 500;
    }

    .validation-status {
      margin-top: 12px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
    }

    .validation-pass {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .validation-fail {
      background: #ffebee;
      color: #c62828;
    }

    .legend {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-top: 40px;
    }

    .legend-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #333;
    }

    .legend-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .legend-color {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 2px solid #ddd;
    }

    .legend-text {
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 VidSlide AI 布局预览</h1>

    <div class="layout-grid">
      ${this.generateLayoutCard('单图布局', '适合产品展示、人物特写', layouts.single, 'single')}
      ${this.generateLayoutCard('双图布局 - 左右', '适合前后对比、AB测试', layouts.doubleH, 'doubleH')}
      ${this.generateLayoutCard('双图布局 - 上下', '适合步骤流程、时间线', layouts.doubleV, 'doubleV')}
      ${this.generateLayoutCard('三图布局 - 金字塔', '适合层次展示、重点突出', layouts.triplePyramid, 'triplePyramid')}
      ${this.generateLayoutCard('三图布局 - 网格', '适合多角度、系列展示', layouts.tripleGrid, 'tripleGrid')}
      ${this.generateLayoutCard('四图布局 - 网格', '适合多产品、对比矩阵', layouts.quad, 'quad')}
    </div>

    <div class="legend">
      <div class="legend-title">📐 设计规范</div>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-color" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
          <div class="legend-text">图片区域</div>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: transparent; border-color: white;"></div>
          <div class="legend-text">PIP 视频框</div>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #667eea;"></div>
          <div class="legend-text">关键词标签</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * 生成单个布局卡片
   */
  generateLayoutCard(title, description, layouts, id) {
    const validation = this.layoutService.validateLayout(layouts);
    const pipArea = this.layoutService.pipArea;

    return `
      <div class="layout-card">
        <div class="layout-header">
          <div class="layout-title">${title}</div>
          <div class="layout-desc">${description}</div>
        </div>

        <div class="layout-canvas">
          <div class="canvas-content">
            <!-- 标题区域 -->
            <div class="title-area">示例标题</div>

            <!-- 图片 -->
            ${layouts.map((layout, index) => {
              const x = (layout.position.x / 1080) * 100;
              const y = (layout.position.y / 1920) * 100;
              const w = (layout.size.width / 1080) * 100;
              const h = (layout.size.height / 1920) * 100;

              return `
                <div class="image-box" style="
                  left: ${x - w/2}%;
                  top: ${y - h/2}%;
                  width: ${w}%;
                  height: ${h}%;
                  border-radius: ${(layout.style.borderRadius / 1080) * 100}%;
                ">
                  图${index + 1}
                </div>
              `;
            }).join('')}

            <!-- PIP -->
            <div class="pip-box" style="
              left: ${(pipArea.x / 1080) * 100}%;
              top: ${(pipArea.y / 1920) * 100}%;
              width: ${(pipArea.width / 1080) * 100}%;
              height: ${(pipArea.height / 1920) * 100}%;
            ">
              PIP
            </div>

            <!-- 关键词 -->
            <div class="keyword-area">
              <div class="keyword-tag">关键词1</div>
              <div class="keyword-tag">关键词2</div>
              <div class="keyword-tag">关键词3</div>
            </div>
          </div>
        </div>

        <div class="layout-info">
          <div class="info-row">
            <span class="info-label">图片数量</span>
            <span class="info-value">${layouts.length} 张</span>
          </div>
          <div class="info-row">
            <span class="info-label">布局ID</span>
            <span class="info-value">${id}</span>
          </div>
          ${layouts.map((layout, index) => `
            <div class="info-row">
              <span class="info-label">图${index + 1} 尺寸</span>
              <span class="info-value">${layout.size.width}x${layout.size.height}</span>
            </div>
          `).join('')}

          <div class="validation-status ${validation.valid ? 'validation-pass' : 'validation-fail'}">
            ${validation.valid ? '✓ 布局验证通过' : '✗ ' + validation.issues.join(', ')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 保存预览 HTML
   */
  savePreview() {
    const html = this.generatePreviewHTML();
    const outputPath = path.join(this.outputDir, 'layout-preview.html');

    fs.writeFileSync(outputPath, html, 'utf-8');

    console.log(`\n[预览] 布局预览已生成:`);
    console.log(`  文件: ${outputPath}`);
    console.log(`  在浏览器中打开查看效果`);

    return outputPath;
  }
}

// 运行生成器
const generator = new LayoutPreviewGenerator();
const outputPath = generator.savePreview();

console.log(`\n✓ 完成！`);
console.log(`\n打开方式:`);
console.log(`  1. 在 Finder 中双击打开`);
console.log(`  2. 或运行: open "${outputPath}"`);
