#!/bin/bash

# Transfer Assistant 服务管理脚本
# 用于启动、停止、重启和查看剪贴板同步项目的后端服务状态

PROJECT_ROOT="/root/projects/TransferAssistant/clipboard-sync"
BACKEND_DIR="$PROJECT_ROOT/backend"
PORT=5681

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${GREEN}$1${NC}"
}

print_warn() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

case "$1" in
    start)
        # 检查服务是否已在运行
        if lsof -i :$PORT > /dev/null; then
            print_warn "服务已在运行 (端口 $PORT)"
            exit 0
        fi

        print_info "正在启动 Transfer Assistant 服务..."
        cd "$BACKEND_DIR"
        
        # 启动后端服务并后台运行
        nohup npm start > backend.log 2>&1 &
        
        # 等待服务启动
        sleep 5
        
        if lsof -i :$PORT > /dev/null; then
            print_info "Transfer Assistant 服务已成功启动"
            print_info "访问地址: http://localhost:$PORT"
        else
            print_error "服务启动失败，请检查日志: $BACKEND_DIR/backend.log"
            exit 1
        fi
        ;;
    stop)
        if lsof -i :$PORT > /dev/null; then
            print_info "正在停止 Transfer Assistant 服务..."
            pkill -f "node.*backend/dist/index.js" || true
            sleep 2
            print_info "服务已停止"
        else
            print_warn "服务未运行"
        fi
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        if lsof -i :$PORT > /dev/null; then
            print_info "Transfer Assistant 服务正在运行 (端口 $PORT)"
        else
            print_warn "Transfer Assistant 服务未运行"
        fi
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status}"
        echo ""
        echo "命令说明:"
        echo "  start   - 启动服务"
        echo "  stop    - 停止服务"
        echo "  restart - 重启服务"
        echo "  status  - 查看服务状态"
        exit 1
        ;;
esac