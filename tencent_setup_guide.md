# 🚀 腾讯云轻量级服务器科学上网配置指南

## 📋 配置概述

使用腾讯云轻量级服务器 + V2Ray + TCP连接，实现稳定快速的科学上网。

**优势**:
- ✅ 腾讯云网络质量优异
- ✅ 轻量级服务器性价比高
- ✅ V2Ray协议稳定可靠
- ✅ TCP连接避免复杂配置
- ✅ 一键安装和配置

## 🎯 第一步：腾讯云服务器信息

请提供以下信息：
- 服务器IP地址：`___`
- 服务器登录密码：`___`
- 服务器地区：`___`（推荐香港、新加坡、日本）

## ⚡ 第二步：一键安装服务器端

### 服务器端安装脚本

在腾讯云控制台中：

1. 进入服务器控制台
2. 点击"登录"按钮
3. 复制并运行以下命令：

```bash
# 一键安装V2Ray服务器
curl -L https://install.direct/go.sh | bash

# 配置V2Ray服务
cat > /usr/local/etc/v2ray/config.json << 'EOF'
{
  "inbounds": [
    {
      "port": 443,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "tencent-$(uuidgen)",
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

# 启动V2Ray服务
systemctl enable v2ray
systemctl start v2ray

# 检查服务状态
systemctl status v2ray

# 检查端口监听
netstat -tlnp | grep :443
```

## 📱 第三步：本地客户端配置

### 下载V2Ray客户端

```bash
# 下载V2Ray客户端
curl -L -o v2ray-macos.zip https://github.com/v2fly/v2ray-core/releases/latest/download/v2ray-macos-64.zip
unzip v2ray-macos.zip
```

### 创建本地配置文件

```bash
cat > config.json << 'EOF'
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
            "address": "你的腾讯云服务器IP",
            "port": 443,
            "users": [
              {
                "id": "tencent-生成的UUID",
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
```

## 🌐 第四步：系统代理设置

```bash
# 设置系统代理
networksetup -setwebproxy Wi-Fi 127.0.0.1 1081
networksetup -setsecurewebproxy Wi-Fi 127.0.0.1 1081

# 启动V2Ray客户端
./v2ray run -c config.json &
```

## 🧪 第五步：测试连接

```bash
# 测试代理连接
curl -x http://127.0.0.1:1081 -I https://www.google.com
curl -x http://127.0.0.1:1081 -I https://github.com

# 检查网络状态
curl -s https://httpbin.org/ip | jq .origin
```

## 🔧 故障排除

### 1. 服务器端检查
```bash
# 检查V2Ray服务状态
systemctl status v2ray

# 查看日志
journalctl -u v2ray -f

# 检查防火墙
firewall-cmd --list-all
```

### 2. 客户端检查
```bash
# 检查本地端口
lsof -i :1080
lsof -i :1081

# 测试服务器连接
telnet 你的服务器IP 443
```

### 3. 腾讯云安全组配置
在腾讯云控制台：
1. 进入轻量级服务器控制台
2. 找到你的服务器
3. 点击"防火墙"
4. 添加规则：
   - 协议：TCP
   - 端口：443
   - 源：0.0.0.0/0

## 🎉 使用说明

- 启动：`./v2ray run -c config.json &`
- 停止：`pkill -f v2ray`
- 重启：先停止再启动
- 状态：`ps aux | grep v2ray`

## 💰 费用说明

腾讯云轻量级服务器：
- 香港地区：¥24/月起
- 新加坡地区：¥12/月起
- 日本地区：¥18/月起

推荐选择**香港地区**，网络质量最佳。