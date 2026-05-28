# Quick Setup Script for Local Development (Windows PowerShell)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Niklaus Solution - Local Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "WARNING: backend\.env file not found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please create backend\.env with the following variables:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "RAZORPAY_KEY_ID=your_key_id"
    Write-Host "RAZORPAY_SECRET_KEY=your_secret_key"
    Write-Host "FIREBASE_PROJECT_ID=your_project_id"
    Write-Host "FIREBASE_PRIVATE_KEY=your_private_key"
    Write-Host "FIREBASE_CLIENT_EMAIL=your_client_email"
    Write-Host ""
    exit 1
}

Write-Host "✅ backend\.env file found" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Cyan
npm install

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
cd backend
npm install
cd ..

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "To start development:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Backend: http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
