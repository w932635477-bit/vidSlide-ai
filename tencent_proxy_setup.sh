#!/bin/bash
# 🚀 腾讯云轻量级服务器科学上网一键配置脚本

set -e

echo "🚀 腾讯云轻量级服务器科学上网配置"
echo "================================="

# 检查参数
if [ $# -lt 2 ]; then
    echo "使用方法: $0 <腾讯云服务器IP> <服务器密码>"
    echo "示例: $0 123.123.123.123 your_password"
    exit 1
fi

SERVER_IP=$1
SERVER_PASS=$2
UUID=$(uuidgen)

echo "📋 配置信息："
echo "服务器IP: $SERVER_IP"
echo "UUID: $UUID"
echo ""

# 生成服务器端配置
echo "⚡ 第一步：生成服务器端配置"
cat > tencent_server_config.json << EOF
{
  "inbounds": [
    {
      "port": 443,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "$UUID",
            "alterId": 0
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "tcpSettings": {
          "header": {
            "type": "http",
            "request": {
              "version": "1.1",
              "method": "GET",
              "path": ["/"],
              "headers": {
                "Host": ["www.tencent.com", "cloud.tencent.com"],
                "User-Agent": [
                  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36"
                ],
                "Accept": ["text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"],
                "Connection": ["keep-alive"]
              }
            }
          }
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {}
    }
  ]
}
EOF

# 生成客户端配置
echo "📱 第二步：生成客户端配置"
cat > tencent_client_config.json << EOF
{
  "inbounds": [
    {
      "port": 1080,
      "listen": "127.0.0.1",
      "protocol": "socks",
      "settings": {
        "auth": "noauth",
        "udp": true
      }
    },
    {
      "port": 1081,
      "listen": "127.0.0.1",
      "protocol": "http",
      "settings": {
        "auth": "noauth"
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "$SERVER_IP",
            "port": 443,
            "users": [
              {
                "id": "$UUID",
                "alterId": 0,
                "security": "auto"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "tcpSettings": {
          "header": {
            "type": "http",
            "request": {
              "version": "1.1",
              "method": "GET",
              "path": ["/"],
              "headers": {
                "Host": ["www.tencent.com", "cloud.tencent.com"],
                "User-Agent": [
                  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36"
                ],
                "Accept": ["text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"],
                "Connection": ["keep-alive"]
              }
            }
          }
        }
      }
    }
  ]
}
EOF

echo "🔧 第三步：连接腾讯云服务器并配置"
echo "正在连接到腾讯云服务器..."

# 使用sshpass自动输入密码（需要先安装sshpass）
if ! command -v sshpass &> /dev/null; then
    echo "安装sshpass..."
    brew install hudochenkov/sshpass/sshpass
fi

# 上传服务器配置并安装
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << EOF
echo "正在腾讯云服务器上安装V2Ray..."

# 安装V2Ray
curl -L https://install.direct/go.sh | bash

# 备份原有配置
cp /usr/local/etc/v2ray/config.json /usr/local/etc/v2ray/config.json.backup 2>/dev/null || true

# 停止服务
systemctl stop v2ray 2>/dev/null || true

echo "配置已生成，请手动复制以下配置到服务器："
echo "=========================================="
cat tencent_server_config.json
echo "=========================================="

EOF

echo ""
echo "🎯 配置完成！"
echo ""
echo "📋 重要信息："
echo "服务器IP: $SERVER_IP"
echo "UUID: $UUID"
echo "本地SOCKS5端口: 1080"
echo "本地HTTP端口: 1081"
echo ""
echo "📝 下一步操作："
echo "1. 在腾讯云控制台配置安全组规则（开放443端口）"
echo "2. 在服务器上手动运行："
echo "   systemctl enable v2ray && systemctl start v2ray"
echo "3. 在本地运行："
echo "   ./v2ray run -c tencent_client_config.json &"
echo "4. 设置系统代理："
echo "   networksetup -setwebproxy Wi-Fi 127.0.0.1 1081"
echo "   networksetup -setsecurewebproxy Wi-Fi 127.0.0.1 1081"
echo ""
echo "🧪 测试命令："
echo "curl -x http://127.0.0.1:1081 -I https://www.google.com"