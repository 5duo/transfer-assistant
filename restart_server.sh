#!/bin/bash

# Transfer Assistant 重启脚本
# 用于重启剪贴板同步项目的后端服务

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "正在重启 Transfer Assistant 服务..."

# 先停止服务
$SCRIPT_DIR/stop_server.sh

# 等待片刻
sleep 2

# 再启动服务
$SCRIPT_DIR/start_server.sh