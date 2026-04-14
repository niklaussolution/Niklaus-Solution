#!/bin/bash

# Quick Setup Script for Local Development

echo "================================"
echo "Niklaus Solution - Local Setup"
echo "================================"
echo ""

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env file not found!"
    echo ""
    echo "Please create backend/.env with the following variables:"
    echo ""
    echo "RAZORPAY_KEY_ID=your_key_id"
    echo "RAZORPAY_SECRET_KEY=your_secret_key"
    echo "FIREBASE_PROJECT_ID=your_project_id"
    echo "FIREBASE_PRIVATE_KEY=your_private_key"
    echo "FIREBASE_CLIENT_EMAIL=your_client_email"
    echo ""
    exit 1
fi

echo "✅ backend/.env file found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend
npm install
cd ..
echo "✅ Dependencies installed"
echo ""

echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "To start development:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  npm run dev"
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
