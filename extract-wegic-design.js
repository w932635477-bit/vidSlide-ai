// Wegic.ai 设计提取工具
// 使用方法: 在Wegic设计页面打开浏览器控制台，粘贴并运行此代码

(function() {
    console.log('🚀 Wegic设计提取工具启动...');
    
    // 提取HTML结构
    const html = document.documentElement.outerHTML;
    
    // 提取CSS样式
    const styles = Array.from(document.styleSheets)
        .map(sheet => {
            try {
                return Array.from(sheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
            } catch (e) {
                return '';
            }
        })
        .join('\n');
    
    // 提取关键设计元素
    const designElements = {
        colors: [],
        fonts: [],
        layout: []
    };
    
    // 分析颜色
    const colorRegex = /#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g;
    const colors = html.match(colorRegex) || [];
    designElements.colors = [...new Set(colors)];
    
    // 分析字体
    const fontRegex = /font-family:\s*([^;]+)/g;
    const fonts = styles.match(fontRegex) || [];
    designElements.fonts = [...new Set(fonts.map(f => f.replace('font-family:', '').trim()))];
    
    // 创建下载文件
    const exportData = {
        html: html,
        css: styles,
        designElements: designElements,
        timestamp: new Date().toISOString(),
        source: 'Wegic.ai'
    };
    
    // 下载JSON文件
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wegic-design-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ 设计提取完成！');
    console.log('📊 提取统计:', {
        HTML长度: html.length + ' 字符',
        CSS长度: styles.length + ' 字符',
        颜色数量: designElements.colors.length,
        字体数量: designElements.fonts.length
    });
    
})();
