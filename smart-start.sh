#!/bin/bash

# Smart Start Script for Obsidian Paper Note
# Automatically detects available ports and starts both backend and frontend

echo "🚀 Starting Obsidian Paper Note with Smart Port Detection..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Common ports to try
PORTS=(8000 8001 8080 3001 5000)
BACKEND_PORT=""
BACKEND_PID=""

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 1  # Port is busy
    else
        return 0  # Port is available
    fi
}

# Function to wait for backend to be ready
wait_for_backend() {
    local port=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for backend to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port/api/health" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is ready on port $port${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 1
        ((attempt++))
    done
    
    echo -e "${RED}❌ Backend failed to start on port $port${NC}"
    return 1
}

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "python.*main.py" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
sleep 2

# Find available port for backend
echo "🔍 Finding available port for backend..."
for port in "${PORTS[@]}"; do
    if check_port $port; then
        BACKEND_PORT=$port
        echo -e "${GREEN}✅ Found available port: $port${NC}"
        break
    else
        echo -e "${YELLOW}⚠️  Port $port is busy${NC}"
    fi
done

if [ -z "$BACKEND_PORT" ]; then
    echo -e "${RED}❌ No available ports found. Please free up one of: ${PORTS[*]}${NC}"
    exit 1
fi

# Start backend
echo "🖥️  Starting backend on port $BACKEND_PORT..."
cd src/main/python

# Set environment variable for port
export PORT=$BACKEND_PORT

# Start backend in background
python3 main.py > ../../../backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
if wait_for_backend $BACKEND_PORT; then
    echo -e "${GREEN}🎉 Backend started successfully!${NC}"
    echo -e "${BLUE}📋 Health check: http://localhost:$BACKEND_PORT/api/health${NC}"
    echo -e "${BLUE}📚 API docs: http://localhost:$BACKEND_PORT/docs${NC}"
else
    echo -e "${RED}❌ Failed to start backend${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend
echo "🌐 Starting frontend..."
cd ../react

# Set React environment variable for API URL
export REACT_APP_API_URL="http://localhost:$BACKEND_PORT"

# Start frontend
echo -e "${YELLOW}📱 Frontend will be available at: http://localhost:3000${NC}"
echo -e "${YELLOW}🔗 Backend API running at: http://localhost:$BACKEND_PORT${NC}"

# Start frontend (this will block)
npm start

# Cleanup when script exits
cleanup() {
    echo -e "\n🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

trap cleanup EXIT INT TERM