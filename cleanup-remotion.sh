#!/bin/bash

# Remotion 完全清理脚本
# 此脚本将彻底删除所有 Remotion 相关的代码和模板

echo "=========================================="
echo "Remotion 完全清理脚本"
echo "=========================================="
echo ""

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 备份 remotion-templates 目录
echo "📦 步骤 1: 备份 remotion-templates 目录..."
if [ -d "remotion-templates" ]; then
    BACKUP_DIR="backup/remotion-templates-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r remotion-templates "$BACKUP_DIR/"
    echo -e "${GREEN}✓ 已备份到: $BACKUP_DIR${NC}"
else
    echo -e "${YELLOW}⚠️  remotion-templates 目录不存在${NC}"
fi

echo ""

# 2. 删除 remotion-templates 目录
echo "🗑️  步骤 2: 删除 remotion-templates 目录..."
if [ -d "remotion-templates" ]; then
    rm -rf remotion-templates
    echo -e "${GREEN}✓ 已删除 remotion-templates 目录${NC}"
else
    echo -e "${YELLOW}⚠️  remotion-templates 目录不存在${NC}"
fi

echo ""

# 3. 删除 Remotion 服务文件
echo "🗑️  步骤 3: 删除 Remotion 服务文件..."

FILES_TO_DELETE=(
    "vidslide-ai/src/services/RemotionService.js"
    "vidslide-ai/src/services/RemotionRenderer.js"
)

for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        # 先备份
        BACKUP_FILE="backup/services-$(date +%Y%m%d)/${file##*/}"
        mkdir -p "$(dirname "$BACKUP_FILE")"
        cp "$file" "$BACKUP_FILE"

        # 删除
        rm "$file"
        echo -e "${GREEN}✓ 已删除: $file${NC}"
    else
        echo -e "${YELLOW}⚠️  文件不存在: $file${NC}"
    fi
done

echo ""

# 4. 删除旧的组合单元生成器
echo "🗑️  步骤 4: 删除旧的组合单元生成器..."

OLD_GENERATORS=(
    "vidslide-ai/src/services/CompositionUnitGenerator.js"
    "vidslide-ai/src/services/CompositionUnitGeneratorFixed.js"
)

for file in "${OLD_GENERATORS[@]}"; do
    if [ -f "$file" ]; then
        BACKUP_FILE="backup/services-$(date +%Y%m%d)/${file##*/}"
        mkdir -p "$(dirname "$BACKUP_FILE")"
        cp "$file" "$BACKUP_FILE"
        rm "$file"
        echo -e "${GREEN}✓ 已删除: $file${NC}"
    else
        echo -e "${YELLOW}⚠️  文件不存在: $file${NC}"
    fi
done

echo ""

# 5. 删除旧的微场景生成器
echo "🗑️  步骤 5: 删除旧的微场景生成器..."

if [ -f "vidslide-ai/src/services/MicroSceneGenerator.js" ]; then
    BACKUP_FILE="backup/services-$(date +%Y%m%d)/MicroSceneGenerator.js"
    mkdir -p "$(dirname "$BACKUP_FILE")"
    cp "vidslide-ai/src/services/MicroSceneGenerator.js" "$BACKUP_FILE"
    rm "vidslide-ai/src/services/MicroSceneGenerator.js"
    echo -e "${GREEN}✓ 已删除: vidslide-ai/src/services/MicroSceneGenerator.js${NC}"
else
    echo -e "${YELLOW}⚠️  文件不存在: vidslide-ai/src/services/MicroSceneGenerator.js${NC}"
fi

echo ""

# 6. 删除旧的布局服务
echo "🗑️  步骤 6: 删除旧的布局服务..."

if [ -f "vidslide-ai/src/services/SmartLayoutService.js" ]; then
    BACKUP_FILE="backup/services-$(date +%Y%m%d)/SmartLayoutService.js"
    mkdir -p "$(dirname "$BACKUP_FILE")"
    cp "vidslide-ai/src/services/SmartLayoutService.js" "$BACKUP_FILE"
    rm "vidslide-ai/src/services/SmartLayoutService.js"
    echo -e "${GREEN}✓ 已删除: vidslide-ai/src/services/SmartLayoutService.js${NC}"
else
    echo -e "${YELLOW}⚠️  文件不存在: vidslide-ai/src/services/SmartLayoutService.js${NC}"
fi

echo ""

# 7. 删除测试文件
echo "🗑️  步骤 7: 删除 Remotion 相关测试文件..."

TEST_FILES=(
    "test-multilayer-template.js"
    "test-render-real.js"
    "test-complete-solution.js"
    "test-render-templates.js"
    "test-template-rendering.js"
)

for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        BACKUP_FILE="backup/tests-$(date +%Y%m%d)/${file}"
        mkdir -p "$(dirname "$BACKUP_FILE")"
        cp "$file" "$BACKUP_FILE"
        rm "$file"
        echo -e "${GREEN}✓ 已删除: $file${NC}"
    else
        echo -e "${YELLOW}⚠️  文件不存在: $file${NC}"
    fi
done

echo ""

# 8. 统计结果
echo "=========================================="
echo "📊 清理统计"
echo "=========================================="

echo ""
echo "已删除的目录:"
echo "  - remotion-templates/"

echo ""
echo "已删除的服务文件:"
echo "  - RemotionService.js"
echo "  - RemotionRenderer.js"
echo "  - CompositionUnitGenerator.js (旧版)"
echo "  - CompositionUnitGeneratorFixed.js (旧版)"
echo "  - MicroSceneGenerator.js (旧版)"
echo "  - SmartLayoutService.js (旧版)"

echo ""
echo "已删除的测试文件:"
for file in "${TEST_FILES[@]}"; do
    echo "  - $file"
done

echo ""
echo "备份位置:"
echo "  - backup/remotion-templates-*/"
echo "  - backup/services-$(date +%Y%m%d)/"
echo "  - backup/tests-$(date +%Y%m%d)/"

echo ""
echo -e "${GREEN}=========================================="
echo "✓ Remotion 清理完成！"
echo "==========================================${NC}"

echo ""
echo "⚠️  注意事项:"
echo "  1. 请手动检查并更新以下文件中的 Remotion 引用:"
echo "     - vidslide-ai/src/services/MasterAutoGenerationAgent.js"
echo "     - vidslide-ai/src/services/VideoCompositionService.js"
echo "     - vidslide-ai/src/utils/TemplateArchitecture.js"
echo ""
echo "  2. 如果需要恢复，可以从 backup/ 目录中找到备份"
echo ""
echo "  3. 建议运行测试确保系统正常工作:"
echo "     node test-e2e-integration.js"
echo ""
