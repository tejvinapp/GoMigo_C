@echo off
echo ============================================
echo    GoMiGo - Database Setup
echo    (Run this ONCE before starting the app)
echo ============================================
echo.

if not exist ".env.local" (
    echo [!] Please run SETUP.bat first to enter your credentials.
    pause
    exit
)

echo This will create all the database tables in your Supabase project.
echo Opening Supabase SQL Editor...
echo.
echo You need to copy and run 4 SQL files in order.
echo I will open the SQL editor and the files folder for you.
echo.
pause

:: Open Supabase SQL editor
start https://supabase.com/dashboard/project/kmpgkqgrkvelpyycbzma/sql/new

:: Open migrations folder so they can copy files
start "" "D:\GoMiGo\supabase\migrations"

echo.
echo ============================================
echo In the Supabase SQL Editor that just opened:
echo.
echo STEP 1: Open file 001_init.sql from the folder
echo         Select ALL text (Ctrl+A), Copy (Ctrl+C)
echo         Paste into SQL editor, click RUN
echo.
echo STEP 2: Do the same for 002_rls_policies.sql
echo.
echo STEP 3: Do the same for 005_feature_flags_seed.sql
echo.
echo STEP 4: Do the same for 006_platform_settings_seed.sql
echo.
echo After all 4 files are done, close this window
echo and double-click START.bat to launch the app!
echo ============================================
echo.
pause
