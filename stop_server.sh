#!/bin/bash

# Transfer Assistant 停止脚本
# 用于停止剪贴板同步项目的后端服务

# 停止后端服务
echo "正在停止 Transfer Assistant 后端服务..."

# 查找并终止后端进程
if pgrep -f "node.*backend/dist/index.js" > /dev/null; then
    pkill -f "node.*backend/dist/index.js"
    echo "后端服务已停止"
else
    echo "后端服务未运行"
fi