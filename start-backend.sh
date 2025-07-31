#!/bin/bash
# Start Backend Development Server

echo "🚀 Starting Obsidian Paper Note Backend..."

# Check if .env file exists
if [ ! -f "src/main/python/config/.env" ]; then
    echo "❌ Error: .env file not found in src/main/python/config/"
    echo "Please create .env file with your OpenAI API key"
    exit 1
fi

# Check if OpenAI API key is set
if ! grep -q "OPENAI_API_KEY=sk-" src/main/python/config/.env; then
    echo "⚠️  Warning: OpenAI API key may not be properly set in .env file"
    echo "Please ensure OPENAI_API_KEY is configured in src/main/python/config/.env"
fi

# Start backend server
echo "📡 Starting FastAPI server on http://localhost:8000..."
cd src/main/python
python3 main.py