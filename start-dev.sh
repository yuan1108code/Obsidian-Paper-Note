#!/bin/bash
# Start Both Frontend and Backend Development Servers

echo "🚀 Starting Obsidian Paper Note Development Environment..."

# Function to cleanup background processes on script exit
cleanup() {
    echo "🛑 Shutting down development servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start backend in background
echo "📡 Starting backend server..."
./start-backend.sh > backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo "❌ Backend failed to start. Check backend.log for details."
    exit 1
fi

echo "✅ Backend running on http://localhost:8000"

# Start frontend in background
echo "⚛️  Starting frontend server..."
./start-frontend.sh > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
for i in {1..30}; do
    if curl -s http://localhost:3000/ > /dev/null 2>&1; then
        echo "✅ Frontend running on http://localhost:3000"
        break
    fi
    sleep 2
done

echo "🎉 Development environment ready!"
echo "📝 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 Backend Health: http://localhost:8000/api/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
while true; do
    sleep 1
done