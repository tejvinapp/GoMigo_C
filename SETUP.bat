@echo off
echo ============================================
echo    GoMiGo - First Time Setup
echo ============================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [!] Node.js is NOT installed on your computer.
    echo.
    echo Please download and install Node.js first:
    echo    1. Open this link in your browser:
    echo       https://nodejs.org/dist/v20.15.0/node-v20.15.0-x64.msi
    echo    2. Double-click the downloaded file and click Next, Next, Install
    echo    3. RESTART your computer
    echo    4. Double-click SETUP.bat again
    echo.
    pause
    start https://nodejs.org/dist/v20.15.0/node-v20.15.0-x64.msi
    exit
)

echo [OK] Node.js found:
node --version
echo.

:: Check if .env.local exists
if exist ".env.local" (
    echo [OK] .env.local already exists. Skipping setup.
    echo      If you want to re-enter credentials, delete .env.local and run SETUP.bat again.
    echo.
    goto :run
)

echo We need your Supabase API keys to connect the database.
echo.
echo Please open this link in your browser NOW and copy your keys:
echo    https://supabase.com/dashboard/project/kmpgkqgrkvelpyycbzma/settings/api
echo.
echo (Opening the link for you...)
start https://supabase.com/dashboard/project/kmpgkqgrkvelpyycbzma/settings/api
echo.
echo From that page you need:
echo   1. "anon public" key  (long text starting with eyJ...)
echo   2. "service_role" key (long text starting with eyJ...)
echo.
echo Also have your Supabase DATABASE PASSWORD ready
echo (the password you set when you created the project)
echo.
pause

echo.
set /p ANON_KEY="Paste your anon public key here and press Enter: "
echo.
set /p SERVICE_KEY="Paste your service_role key here and press Enter: "
echo.
set /p DB_PASS="Type your Supabase database password and press Enter: "

echo.
echo Creating .env.local file...

(
echo # GoMiGo Local Environment
echo # DO NOT share this file with anyone
echo.
echo NEXT_PUBLIC_SUPABASE_URL=https://kmpgkqgrkvelpyycbzma.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%ANON_KEY%
echo SUPABASE_SERVICE_ROLE_KEY=%SERVICE_KEY%
echo DATABASE_URL=postgresql://postgres:%DB_PASS%@db.kmpgkqgrkvelpyycbzma.supabase.co:5432/postgres
echo NEXT_PUBLIC_APP_URL=http://localhost:3000
echo NODE_ENV=development
) > .env.local

echo [OK] .env.local created successfully!
echo.

:run
echo ============================================
echo    Running database setup...
echo ============================================
echo.
echo NOTE: If you see errors below, it usually means the
echo tables already exist - that is OK, just continue.
echo.

:: Install dependencies if needed
echo Checking dependencies...
if not exist "node_modules\.bin\next" (
    echo Installing packages (this takes 2-3 minutes)...
    npm install
)

echo.
echo ============================================
echo    Starting GoMiGo...
echo ============================================
echo.
echo The app will open in your browser at:
echo    http://localhost:3000
echo.
echo To STOP the app: press Ctrl+C in this window
echo.
npm run dev

pause
