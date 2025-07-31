#!/bin/bash
# Start Frontend Development Server

echo "🚀 Starting Obsidian Paper Note Frontend..."

# Check if node_modules exists
if [ ! -d "src/main/react/node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    cd src/main/react
    npm install
    cd ../../..
fi

# Start frontend server
echo "⚛️  Starting React development server on http://localhost:3000..."
cd src/main/react
npm start