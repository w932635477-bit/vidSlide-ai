# 🚀 腾讯云轻量级服务器科学上网指南

## 📋 概述

使用腾讯云轻量级服务器 + V2Ray 实现稳定快速的科学上网，完全替代所有其他方案。

**优势**:
- ✅ 腾讯云网络质量优异（推荐香港地区）
- ✅ 轻量级服务器性价比高（¥12-24/月）
- ✅ 一键配置，操作简单
- ✅ 稳定可靠，无需复杂维护

## 🎯 快速开始

### 第一步：配置腾讯云服务器

```bash
# 运行配置脚本（替换为你的服务器信息）
./tencent_proxy_setup.sh 你的服务器IP 你的服务器密码
```

### 第二步：启动科学上网

```bash
# 启动代理服务
./start_tencent_proxy.sh
```

### 第三步：验证连接

```bash
# 检查状态
./status_tencent_proxy.sh

# 测试网络
curl -I https://www.google.com
curl -I https://github.com
```

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `tencent_proxy_setup.sh` | 一键配置腾讯云服务器 |
| `start_tencent_proxy.sh` | 启动本地代理服务 |
| `stop_tencent_proxy.sh` | 停止代理服务 |
| `status_tencent_proxy.sh` | 检查服务状态 |
| `proxy` | 🚀 **一键启动脚本**（推荐使用） |
| `install_proxy_global.sh` | 安装全局proxy命令 |
| `tencent_setup_guide.md` | 详细配置指南 |
| `TENCENT_README.md` | 本使用说明 |

## 🔧 手动配置步骤

如果自动脚本有问题，可以参考 `tencent_setup_guide.md` 进行手动配置。

### 服务器端配置

在腾讯云控制台登录服务器，运行：

```bash
# 安装V2Ray
curl -L https://install.direct/go.sh | bash

# 编辑配置文件
nano /usr/local/etc/v2ray/config.json
# 粘贴生成的服务器配置

# 启动服务
systemctl enable v2ray
systemctl start v2ray
```

### 客户端配置

在本地Mac上：

```bash
# 启动V2Ray
./v2ray run -c tencent_client_config.json &

# 设置系统代理
networksetup -setwebproxy Wi-Fi 127.0.0.1 1081
networksetup -setsecurewebproxy Wi-Fi 127.0.0.1 1081
```

## 🧪 测试和故障排除

### 测试连接
```bash
# 基本测试
curl -x http://127.0.0.1:1081 -I https://www.google.com

# 完整测试
./status_tencent_proxy.sh
```

### 常见问题

1. **连接失败**
   - 检查腾讯云安全组是否开放443端口
   - 确认服务器IP和UUID正确
   - 查看V2Ray服务状态：`systemctl status v2ray`

2. **速度慢**
   - 选择香港地区服务器
   - 检查本地网络质量
   - 避免高峰时段使用

3. **服务无法启动**
   - 检查端口是否被占用：`lsof -i :1080`
   - 重启服务：`./stop_tencent_proxy.sh && ./start_tencent_proxy.sh`

## 💰 费用和推荐

### 推荐配置
- **地区**: 香港（网络质量最佳）
- **规格**: 轻量级2核2G（¥24/月）
- **系统**: Ubuntu 20.04

### 价格对比
- 香港: ¥24/月
- 新加坡: ¥12/月
- 日本: ¥18/月

## 🎉 完成配置后

配置完成后，你可以：
- ✅ 正常访问Google、GitHub等网站
- ✅ 使用V0.dev进行UI设计
- ✅ 下载各种开发工具和资源
- ✅ 享受高速稳定的网络体验

## ⚡ 一键启动功能

### 安装全局命令（推荐）
```bash
./install_proxy_global.sh
```

### 使用方法
安装后，你可以在**任何目录**使用以下命令：

```bash
# 启动科学上网
proxy start

# 停止科学上网
proxy stop

# 查看状态
proxy status

# 测试连接
proxy test

# 显示帮助
proxy help
```

### 快捷使用
```bash
# 最常用：一键启动
proxy

# 快速检查状态
proxy status

# 测试是否正常工作
proxy test
```

## 💰 费用和维护说明

### 推荐配置
- **地区**: 新加坡（已配置）
- **规格**: 轻量级2核2G（¥12/月）
- **系统**: Ubuntu 20.04

### 维护说明
- **腾讯云服务器**: 每月自动续费
- **V2Ray服务**: 服务器端自动运行，无需管理
- **本地代理**: 需要时启动，用完可停止
- **网络测试**: 随时运行 `proxy test` 检查连接

## 📞 技术支持

如果遇到问题：
1. 运行 `proxy status` 检查状态
2. 查看 `tencent_setup_guide.md` 详细指南
3. 检查腾讯云控制台的服务状态

---

**🎯 目标**: 告别网络限制，专注VidSlide AI开发！

**🚀 现在就开始使用V0.dev进行UI设计吧！**