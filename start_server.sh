#!/bin/bash

# Transfer Assistant 后台启动脚本
# 用于启动剪贴板同步项目的后端服务

# 项目根目录
PROJECT_ROOT="/root/projects/TransferAssistant/clipboard-sync"
BACKEND_DIR="$PROJECT_ROOT/backend"

# 检查后端进程是否已在运行
if pgrep -f "node.*backend/dist/index.js" > /dev/null; then
    echo "后端服务已在运行中..."
    exit 0
fi

# 进入后端目录并启动服务
cd "$BACKEND_DIR"

echo "正在启动 Transfer Assistant 后端服务..."

# 启动后端服务并后台运行
nohup npm start > backend.log 2>&1 &

# 获取进程ID
BACKEND_PID=$!

if [ $BACKEND_PID -gt 0 ]; then
    echo "Transfer Assistant 后端服务已启动 (PID: $BACKEND_PID)"
    echo "服务地址: http://localhost:5681"
    echo "日志文件: $BACKEND_DIR/backend.log"
else
    echo "启动失败"
    exit 1
fi

# 检查服务是否成功启动
sleep 2
if pgrep -f "node.*backend/dist/index.js" > /dev/null; then
    echo "服务运行正常"
else
    echo "服务启动失败，请检查日志文件"
fi