#!/bin/bash

echo "🌤️  Weather MCP Server"
echo "======================"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build the project"
    exit 1
fi

echo "🚀 Starting the server..."
echo "Server will be available at: http://localhost:3000"
echo "SSE endpoint: http://localhost:3000/sse"
echo "Messages endpoint: http://localhost:3000/messages"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run start:prod 