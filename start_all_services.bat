@echo off
REM Low Back Pain System - Start All Services
REM This script starts OCR, Pose, and Frontend services automatically

echo ============================================================
echo Starting Low Back Pain System - All Services
echo ============================================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%backend

echo [1/3] Starting OCR Service (Port 5001)...
start "OCR Service - Port 5001" cmd /k "cd /d "%BACKEND_DIR%" && python ocr_service.py"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Pose Service (Port 5002)...
start "Pose Service - Port 5002" cmd /k "cd /d "%BACKEND_DIR%" && python pose_service.py"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend (Port 5173)...
start "Frontend - Port 5173" cmd /k "cd /d "%SCRIPT_DIR%" && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ============================================================
echo All Services Started!
echo ============================================================
echo.
echo Services:
echo   - OCR Service:    http://localhost:5001
echo   - Pose Service:   http://localhost:5002
echo   - Frontend:       http://localhost:5173
echo.
echo Opening browser...
start http://localhost:5173

echo.
echo Press any key to close this window...
pause >nul
