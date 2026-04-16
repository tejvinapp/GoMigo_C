@echo off
echo ============================================
echo    GoMiGo - Starting Local Server
echo ============================================
echo.

:: Check if .env.local exists
if not exist ".env.local" (
    echo [!] Setup not done yet. Please run SETUP.bat first!
    echo.
    pause
    exit
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [!] Node.js not found. Please run SETUP.bat first!
    pause
    exit
)

echo Starting GoMiGo app...
echo.
echo The app will be available at:
echo.
echo    >>> http://localhost:3000 <<<
echo.
echo Opening browser in 5 seconds...
echo To STOP the server: press Ctrl+C
echo.

:: Open browser after 5 seconds delay
start /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

:: Start the dev server
npm run dev
