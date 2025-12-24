@echo off
REM This batch file runs both frontend and backend together

echo.
echo ========================================
echo Starting Workshop Landing Page App
echo ========================================
echo.

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo [1/4] Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [3/4] Building backend...
call npm run build
if errorlevel 1 (
    echo ERROR: Failed to build backend
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo IMPORTANT: Open TWO separate terminals/PowerShells
echo ========================================
echo.
echo Terminal 1 - Run this command for FRONTEND:
echo   npm run dev
echo.
echo Terminal 2 - Run these commands for BACKEND:
echo   cd backend
echo   npm run dev
echo.
echo Frontend will be at: http://localhost:5173
echo Backend will be at: http://localhost:5000
echo.
echo Press any key to open the frontend dev server...
pause

npm run dev
