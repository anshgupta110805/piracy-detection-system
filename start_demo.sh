#!/bin/bash
echo "🚀 STARTING VERTEXGUARD 1-CLICK DEMO..."

# 1. Start Python Backend
echo "--> Booting FastAPI AI Engine..."
cd backend
python3 main.py &
BACKEND_PID=$!
cd ..

sleep 3

# 2. Seed Database
echo "--> Seeding Realistic Attack Database..."
cd backend
python3 mock_data.py
cp sample_data.json ../frontend/public/sample_data.json
python3 seed_db.py
cd ..

# 3. Start React Frontend
echo "--> Launching React Dashboard..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 2

# 4. Start Traffic Simulator
echo "--> Engaging Traffic Simulation and Bot Networks..."
cd backend
python3 mock_app.py &
SIMULATOR_PID=$!
cd ..

# 5. Open Browser
echo "--> Opening Browser..."
open http://localhost:5173

echo "✅ VertexGuard Demo Ready! Show your teacher now 🚀"

# Wait for Ctrl+C to kill everything
trap "echo 'Shutting down cluster...'; kill $BACKEND_PID; kill $FRONTEND_PID; kill $SIMULATOR_PID; exit" INT
wait
