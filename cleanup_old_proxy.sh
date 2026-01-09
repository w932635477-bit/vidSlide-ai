#!/bin/bash
echo "🧹 清理所有失败的科学上网配置..."

# 删除阿里云ECS相关的文件
rm -f ecs_*.sh
rm -f diagnose_ecs_connection.sh
rm -f test_ecs_*.sh
rm -f quick_ecs_*.sh
rm -f fix_ecs_*.sh
rm -f ecs_*.md
rm -f restart_ecs_*.md

# 删除V2Ray相关配置（保留腾讯云新配置）
rm -f v2rayu_config.json*
rm -f ARM64_V2Ray下载.sh
rm -f 一键安装V2Ray.sh
rm -f diagnose_v2ray_issues.sh

# 删除代理相关文件
rm -f SwitchyOmega配置.json
rm -f ~/.config/clash/config.yaml
rm -f check_proxy_status.sh
rm -f test_network.sh

# 删除VPN相关文档
rm -f access_protonvpn_solutions.md
rm -f alternative_vpn_solutions.md
rm -f protonvpn_setup_guide.md
rm -f quick_vpn_setup.md
rm -f temp_vpn_solutions.md

# 删除科学上网相关文档
rm -f china_network_solutions.md
rm -f solve_paradox_guide.md
rm -f phone_hotspot_guide.md
rm -f final_proxy_fix.md
rm -f final_solution.md
rm -f fix_sci_proxy_*.md
rm -f simple_sci_proxy_solutions.md

# 删除启动器脚本
rm -f 一键启动科学上网.sh
rm -f 科学上网启动器.command
rm -f 科学上网向导.sh
rm -f 一键科学上网.scpt

echo "✅ 清理完成！只保留腾讯云轻量级服务器配置。"
