#!/bin/bash

echo "🚀 Initializing Study Planner Guide..."

# Navigate to script directory
cd "$(dirname "$0")"

# 1. Setup Backend Environment
echo "📦 Setting up Python Virtual Environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✔ Created venv"
else
    echo "✔ venv already exists"
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "⬇ Installing dependencies..."
pip install -r backend/requirements.txt > /dev/null
echo "✔ Dependencies installed"

# 2. Start Backend
echo "🔥 Starting Backend Server..."
# Run in background, save PID to kill later
python3 backend/app.py &
BACKEND_PID=$!
sleep 2 # Wait for flask to start

echo "✔ Backend running on http://127.0.0.1:5001"

# 3. Open Frontend
echo "🌐 Opening Frontend..."
# Mac-specific open command, use 'xdg-open' for linux if needed, but user is on Mac.
open frontend/index.html

echo "=================================================="
echo "  STUDY PLANNER IS LIVE!"
echo "  Press CTRL+C to stop the server."
echo "=================================================="

# Wait for user to exit
wait $BACKEND_PID
