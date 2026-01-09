#!/bin/bash
# 腾讯云V2Ray修复脚本

echo "🔧 腾讯云V2Ray修复脚本"
echo "======================="

# 检查当前用户
echo "当前用户: $(whoami)"
if [ "$(whoami)" != "root" ]; then
    echo "⚠️  需要root权限，请使用: sudo bash $0"
    exit 1
fi

echo ""
echo "第一步：检查V2Ray安装状态"
which v2ray || echo "❌ V2Ray未找到"
ls -la /usr/local/bin/v2ray 2>/dev/null || echo "❌ V2Ray二进制文件不存在"

echo ""
echo "第二步：重新安装V2Ray"
curl -L https://install.direct/go.sh | bash

echo ""
echo "第三步：检查安装结果"
which v2ray && echo "✅ V2Ray已安装" || echo "❌ V2Ray安装失败"
ls -la /usr/local/bin/v2ray && echo "✅ 二进制文件存在" || echo "❌ 二进制文件不存在"

echo ""
echo "第四步：检查服务文件"
ls -la /etc/systemd/system/v2ray.service && echo "✅ 服务文件存在" || echo "❌ 服务文件不存在"

echo ""
echo "第五步：重新加载systemd"
systemctl daemon-reload

echo ""
echo "第六步：启用并启动服务"
systemctl enable v2ray && echo "✅ 服务已启用" || echo "❌ 服务启用失败"
systemctl start v2ray && echo "✅ 服务已启动" || echo "❌ 服务启动失败"

echo ""
echo "第七步：检查服务状态"
systemctl status v2ray --no-pager -l

echo ""
echo "第八步：检查端口监听"
netstat -tlnp | grep :443 && echo "✅ 443端口正在监听" || echo "❌ 443端口未监听"

echo ""
echo "🎉 修复完成！请检查上述输出确认一切正常。"