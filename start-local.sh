#!/usr/bin/env bash
# Agent Platform - Local Development Script (Bash version for cross-platform)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service configuration
declare -A SERVICES=(
    ["controltower"]="python main.py:8000:../ControlTower"
    ["authservice"]="python -m app.main:8001:../AuthService"
    ["agentplane"]="python -m app.main:8002:../AgentPlane"
    ["frontend"]="npm run dev:3000:../ControlPlaneUX"
)

function print_header() {
    echo -e "${CYAN}🚀 Agent Platform - Local Development${NC}"
    echo -e "${CYAN}====================================${NC}"
}

function check_port() {
    local port=$1
    if command -v nc >/dev/null 2>&1; then
        nc -z localhost $port 2>/dev/null
    elif command -v telnet >/dev/null 2>&1; then
        timeout 1 telnet localhost $port >/dev/null 2>&1
    else
        # Fallback using Python
        python3 -c "import socket; sock=socket.socket(); sock.settimeout(1); result=sock.connect_ex(('localhost', $port)); sock.close(); exit(0 if result == 0 else 1)" 2>/dev/null
    fi
}

function stop_services() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    
    for service_name in "${!SERVICES[@]}"; do
        local service_info="${SERVICES[$service_name]}"
        local port=$(echo $service_info | cut -d':' -f2)
        
        if check_port $port; then
            echo -e "   Stopping $service_name (port $port)..."
            if command -v lsof >/dev/null 2>&1; then
                local pid=$(lsof -ti:$port)
                if [ ! -z "$pid" ]; then
                    kill -TERM $pid 2>/dev/null || true
                    sleep 2
                    kill -KILL $pid 2>/dev/null || true
                fi
            elif command -v fuser >/dev/null 2>&1; then
                fuser -k $port/tcp 2>/dev/null || true
            fi
            echo -e "   ${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "   ${BLUE}ℹ️  $service_name not running${NC}"
        fi
    done
}

function check_status() {
    echo -e "${YELLOW}🔍 Checking service status...${NC}"
    
    for service_name in "${!SERVICES[@]}"; do
        local service_info="${SERVICES[$service_name]}"
        local port=$(echo $service_info | cut -d':' -f2)
        
        if check_port $port; then
            echo -e "   ${GREEN}✅ $service_name - Running (Port $port)${NC}"
        else
            echo -e "   ${RED}❌ $service_name - Not running (Port $port)${NC}"
        fi
    done
}

function check_requirements() {
    echo -e "${YELLOW}🔧 Checking required tools...${NC}"
    
    # Check Python
    if command -v python3 >/dev/null 2>&1; then
        local python_version=$(python3 --version)
        echo -e "   ${GREEN}✅ Python found: $python_version${NC}"
    elif command -v python >/dev/null 2>&1; then
        local python_version=$(python --version)
        echo -e "   ${GREEN}✅ Python found: $python_version${NC}"
    else
        echo -e "   ${RED}❌ Python not found. Please install Python 3.11+${NC}"
        exit 1
    fi
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        echo -e "   ${GREEN}✅ Node.js found: $node_version${NC}"
    else
        echo -e "   ${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
        exit 1
    fi
    
    # Check npm
    if command -v npm >/dev/null 2>&1; then
        local npm_version=$(npm --version)
        echo -e "   ${GREEN}✅ npm found: v$npm_version${NC}"
    else
        echo -e "   ${RED}❌ npm not found. Please install npm${NC}"
        exit 1
    fi
}

function install_dependencies() {
    echo -e "${YELLOW}📦 Checking and installing dependencies...${NC}"
    
    # Check Python services
    for service_name in "controltower" "authservice" "agentplane"; do
        local service_info="${SERVICES[$service_name]}"
        local service_path=$(echo $service_info | cut -d':' -f3)
        
        if [ -d "$service_path" ]; then
            echo -e "   Checking $service_name..."
            if [ -f "$service_path/requirements.txt" ]; then
                echo -e "   ${GREEN}✅ Requirements found for $service_name${NC}"
            else
                echo -e "   ${YELLOW}⚠️  No requirements.txt found for $service_name${NC}"
            fi
        else
            echo -e "   ${RED}❌ $service_path not found${NC}"
        fi
    done
    
    # Check Node.js service
    local frontend_path="../ControlPlaneUX"
    if [ -d "$frontend_path" ]; then
        echo -e "   Checking frontend dependencies..."
        if [ ! -d "$frontend_path/node_modules" ]; then
            echo -e "   ${YELLOW}Installing frontend dependencies...${NC}"
            cd "$frontend_path"
            npm install
            cd - >/dev/null
            echo -e "   ${GREEN}✅ Frontend dependencies installed${NC}"
        else
            echo -e "   ${GREEN}✅ Frontend dependencies found${NC}"
        fi
    else
        echo -e "   ${RED}❌ Frontend path not found${NC}"
    fi
}

function start_services() {
    echo -e "${YELLOW}🚀 Starting services with hot reloading...${NC}"
    
    # Set development environment
    export ENVIRONMENT=dev
    
    # Start each service in background
    for service_name in "${!SERVICES[@]}"; do
        local service_info="${SERVICES[$service_name]}"
        local command=$(echo $service_info | cut -d':' -f1)
        local port=$(echo $service_info | cut -d':' -f2)
        local path=$(echo $service_info | cut -d':' -f3)
        
        if [ -d "$path" ]; then
            echo -e "   ${CYAN}Starting $service_name...${NC}"
            cd "$path"
            
            if [ "$service_name" == "frontend" ]; then
                # Start Node.js service
                nohup $command > "../AgentPlatform/logs/$service_name.log" 2>&1 &
            else
                # Start Python service
                export ENVIRONMENT=dev
                nohup $command > "../AgentPlatform/logs/$service_name.log" 2>&1 &
            fi
            
            echo $! > "../AgentPlatform/pids/$service_name.pid"
            cd - >/dev/null
            sleep 2
        else
            echo -e "   ${RED}❌ $path not found, skipping $service_name${NC}"
        fi
    done
}

function wait_and_check() {
    echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
    sleep 10
    
    echo -e "${YELLOW}🔍 Performing health checks...${NC}"
    local all_healthy=true
    
    # Health check URLs
    declare -A HEALTH_URLS=(
        ["controltower"]="http://localhost:8000/health"
        ["authservice"]="http://localhost:8001/"
        ["agentplane"]="http://localhost:8002/health"
        ["frontend"]="http://localhost:3000"
    )
    
    for service_name in "${!SERVICES[@]}"; do
        local health_url="${HEALTH_URLS[$service_name]}"
        
        if command -v curl >/dev/null 2>&1; then
            if curl -s --max-time 5 "$health_url" >/dev/null 2>&1; then
                echo -e "   ${GREEN}✅ $service_name is healthy${NC}"
            else
                echo -e "   ${RED}❌ $service_name health check failed${NC}"
                all_healthy=false
            fi
        else
            echo -e "   ${YELLOW}⚠️  Cannot check $service_name (curl not available)${NC}"
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        echo -e "\n${GREEN}🎉 All services are running!${NC}"
    else
        echo -e "\n${YELLOW}⚠️  Some services may need more time to start${NC}"
    fi
}

function show_info() {
    echo -e "\n${YELLOW}🌐 Service URLs:${NC}"
    echo -e "   ${CYAN}Control Tower (Backend):  http://localhost:8000${NC}"
    echo -e "   ${CYAN}Auth Service:             http://localhost:8001${NC}"
    echo -e "   ${CYAN}Agent Plane (Backend):    http://localhost:8002${NC}"
    echo -e "   ${CYAN}Control Plane UX:         http://localhost:3000${NC}"
    
    echo -e "\n${YELLOW}📚 API Documentation:${NC}"
    echo -e "   ${CYAN}Control Tower API:  http://localhost:8000/docs${NC}"
    echo -e "   ${CYAN}Auth Service API:   http://localhost:8001/docs${NC}"
    echo -e "   ${CYAN}Agent Plane API:    http://localhost:8002/docs${NC}"
    
    echo -e "\n${YELLOW}🛠️  Management Commands:${NC}"
    echo -e "   ${BLUE}Check status:     ./start-local.sh status${NC}"
    echo -e "   ${BLUE}Stop services:    ./start-local.sh stop${NC}"
    echo -e "   ${BLUE}View logs:        tail -f logs/*.log${NC}"
    
    echo -e "\n${YELLOW}📱 Development Features:${NC}"
    echo -e "   ${GREEN}🔄 Hot reload enabled for all services${NC}"
    echo -e "   ${GREEN}🗄️  Shared SQLite database: ai_platform.db${NC}"
    echo -e "   ${GREEN}🔧 Environment: DEVELOPMENT${NC}"
}

function cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    
    # Stop services by PID files
    for service_name in "${!SERVICES[@]}"; do
        if [ -f "pids/$service_name.pid" ]; then
            local pid=$(cat "pids/$service_name.pid")
            if kill -0 $pid 2>/dev/null; then
                echo -e "   Stopping $service_name (PID: $pid)..."
                kill -TERM $pid 2>/dev/null || true
                sleep 1
                kill -KILL $pid 2>/dev/null || true
            fi
            rm -f "pids/$service_name.pid"
        fi
    done
    
    # Fallback: stop by port
    stop_services
    
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Create necessary directories
mkdir -p logs pids

# Handle command line arguments
case "${1:-start}" in
    "stop")
        print_header
        stop_services
        exit 0
        ;;
    "status")
        print_header
        check_status
        exit 0
        ;;
    "start")
        print_header
        check_requirements
        install_dependencies
        stop_services  # Stop any existing services
        start_services
        wait_and_check
        show_info
        
        echo -e "\n${BLUE}Press Ctrl+C to stop all services${NC}"
        
        # Set up signal handlers
        trap cleanup EXIT INT TERM
        
        # Keep script running
        while true; do
            sleep 5
            # Could add periodic health checks here
        done
        ;;
    *)
        echo "Usage: $0 [start|stop|status]"
        echo "  start  - Start all services (default)"
        echo "  stop   - Stop all services"  
        echo "  status - Check service status"
        exit 1
        ;;
esac
