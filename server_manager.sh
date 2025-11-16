#!/bin/bash

# Transfer Assistant 后端服务管理脚本

PROJECT_ROOT="/root/projects/TransferAssistant/clipboard-sync"
BACKEND_DIR="$PROJECT_ROOT/backend"
PORT=5681

case "$1" in
    start)
        # 检查服务是否已在运行
        if lsof -i :$PORT > /dev/null; then
            echo "服务已在运行 (端口 $PORT)"
            exit 0
        fi

        echo "正在启动 Transfer Assistant 服务..."
        cd "$BACKEND_DIR"
        
        # 启动后端服务并后台运行
        nohup npm start > backend.log 2>&1 &
        
        # 等待服务启动
        sleep 5
        
        if lsof -i :$PORT > /dev/null; then
            echo "Transfer Assistant 服务已成功启动"
            echo "访问地址: http://localhost:$PORT"
        else
            echo "服务启动失败，请检查日志: $BACKEND_DIR/backend.log"
            exit 1
        fi
        ;;
    stop)
        echo "正在停止 Transfer Assistant 服务..."
        
        # 查找并终止后端进程
        if lsof -i :$PORT > /dev/null; then
            pkill -f "node.*backend/dist/index.js" || true
            sleep 2
            echo "服务已停止"
        else
            echo "服务未运行"
        fi
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        if lsof -i :$PORT > /dev/null; then
            echo "Transfer Assistant 服务正在运行 (端口 $PORT)"
        else
            echo "Transfer Assistant 服务未运行"
        fi
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac