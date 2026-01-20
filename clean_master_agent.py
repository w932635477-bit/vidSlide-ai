#!/usr/bin/env python3
"""
清理 MasterAutoGenerationAgent.js 中的旧代码
"""

import re

def clean_master_agent(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. 删除 matchMaterials 方法
    # 匹配从方法定义到下一个方法定义之前
    pattern1 = r'  async matchMaterials\(.*?\) \{[\s\S]*?\n  \}\n\n  /\*\*'
    content = re.sub(pattern1, '  /**', content)

    # 2. 删除 assignMaterialsToScene 方法
    pattern2 = r'  async assignMaterialsToScene\(.*?\) \{[\s\S]*?\n  \}\n\n  /\*\*'
    content = re.sub(pattern2, '  /**', content)

    # 3. 修改 composeContent 方法签名
    content = re.sub(
        r'async composeContent\(analysisResult, template, materials, onProgress\)',
        'async composeContent(analysisResult, template, onProgress)',
        content
    )

    # 4. 删除素材扁平化代码块
    # 查找并删除 "将素材扁平化为数组" 到 "可用素材总数" 之间的代码
    pattern4 = r"    // 将素材扁平化为数组[\s\S]*?console\.log\('📦 可用素材总数:', allMaterials\.length\)\n\n"
    content = re.sub(pattern4, '', content)

    # 5. 修改 generateMicroScenes 调用
    # 删除 allMaterials 参数，添加 await
    content = re.sub(
        r'const microScenes = MicroSceneGenerator\.generateMicroScenes\(\s*segmentWithTranscript,\s*analysisResult\.keywords,\s*allMaterials\s*\)',
        'const microScenes = await MicroSceneGenerator.generateMicroScenes(\n        segmentWithTranscript,\n        analysisResult.keywords\n      )',
        content
    )

    # 6. 删除 assignMaterialsToScene 调用
    content = re.sub(
        r'const sceneMaterials = await this\.assignMaterialsToScene\(microScene, allMaterials\)\s*\n\s*',
        '',
        content
    )

    # 7. 删除 generateChartData 调用
    content = re.sub(
        r'const chartData = this\.generateChartData\(microScene\)\s*\n\s*',
        '',
        content
    )

    # 8. 替换 backgroundMaterial 为 imageUrl
    content = re.sub(
        r'backgroundMaterial: microScene\.material \|\| sceneMaterials\.background,',
        'imageUrl: microScene.imageUrl, // 豆包生成的图片',
        content
    )

    # 9. 删除 chartData 字段
    content = re.sub(
        r',?\s*chartData: chartData,?\s*\n',
        '',
        content
    )

    # 10. 删除返回值中的 materials 字段
    content = re.sub(
        r',?\s*materials,?\s*\n',
        '',
        content
    )

    if content != original_content:
        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ 文件已更新")
        return True
    else:
        print("⚠️  没有发现需要修改的内容")
        return False

if __name__ == '__main__':
    file_path = '/Users/weilei/VidSlide AI/vidslide-ai/src/services/MasterAutoGenerationAgent.js'
    clean_master_agent(file_path)
