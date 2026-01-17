#!/bin/bash

# 大文件优化验证脚本
echo "======================================"
echo "VidSlide AI 大文件优化验证"
echo "======================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((FAILED++))
    fi
}

echo "1. 检查文件结构..."
echo "-----------------------------------"

[ -f "vidslide-ai/src/components/asset-browser/AssetBrowserHeader.vue" ] && test_result 0 "AssetBrowserHeader.vue 存在" || test_result 1 "AssetBrowserHeader.vue 不存在"
[ -f "vidslide-ai/src/components/asset-browser/AssetSearchFilters.vue" ] && test_result 0 "AssetSearchFilters.vue 存在" || test_result 1 "AssetSearchFilters.vue 不存在"
[ -f "vidslide-ai/src/components/asset-browser/AssetItem.vue" ] && test_result 0 "AssetItem.vue 存在" || test_result 1 "AssetItem.vue 不存在"
[ -f "vidslide-ai/src/components/asset-browser/AssetGrid.vue" ] && test_result 0 "AssetGrid.vue 存在" || test_result 1 "AssetGrid.vue 不存在"

echo ""
echo "2. 检查构建..."
echo "-----------------------------------"

cd vidslide-ai && npm run build > /dev/null 2>&1 && test_result 0 "项目构建成功" || test_result 1 "项目构建失败"

cd ..

echo ""
echo "======================================"
echo "验证结果: 通过 $PASSED, 失败 $FAILED"
echo "======================================"

[ $FAILED -eq 0 ] && echo -e "${GREEN}✓ 验证通过！${NC}" && exit 0 || echo -e "${RED}✗ 验证失败${NC}" && exit 1
