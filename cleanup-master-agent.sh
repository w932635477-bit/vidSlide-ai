#!/bin/bash

# MasterAutoGenerationAgent.js 自动清理脚本
# 用于删除旧的素材匹配代码

FILE="/Users/weilei/VidSlide AI/vidslide-ai/src/services/MasterAutoGenerationAgent.js"
BACKUP="/Users/weilei/VidSlide AI/vidslide-ai/src/services/MasterAutoGenerationAgent.js.backup"

echo "🔧 开始清理 MasterAutoGenerationAgent.js..."

# 1. 创建备份
echo "📦 创建备份..."
cp "$FILE" "$BACKUP"
echo "✅ 备份已创建: $BACKUP"

# 2. 检查需要删除的内容
echo ""
echo "🔍 检查旧代码引用..."
echo "MaterialService 引用:"
grep -n "MaterialService" "$FILE" | head -5
echo ""
echo "matchMaterials 引用:"
grep -n "matchMaterials" "$FILE" | head -5
echo ""
echo "assignMaterialsToScene 引用:"
grep -n "assignMaterialsToScene" "$FILE" | head -5
echo ""
echo "SmartImageCropper 引用:"
grep -n "SmartImageCropper" "$FILE" | head -5

echo ""
echo "⚠️  需要手动完成以下修改:"
echo ""
echo "1. 删除 matchMaterials() 方法（约第210-277行）"
echo "2. 删除 assignMaterialsToScene() 方法（约第404行开始）"
echo "3. 修改 composeContent() 方法:"
echo "   - 删除 materials 参数"
echo "   - 删除素材扁平化代码"
echo "   - 修改 generateMicroScenes 调用（添加 await，删除 allMaterials）"
echo "   - 使用 imageUrl 而不是 backgroundMaterial"
echo "   - 删除返回值中的 materials 字段"
echo ""
echo "详细说明请查看: MASTERAGENT_CLEANUP_GUIDE.md"
echo ""
echo "✅ 检查完成！请按照指南手动完成修改。"
