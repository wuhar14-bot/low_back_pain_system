@echo off
echo ========================================
echo Low Back Pain System - Database Setup
echo ========================================
echo.

set PGPATH=C:\Program Files\PostgreSQL\15\bin
set PGDATA=C:\Program Files\PostgreSQL\15\data

echo [Step 1] Checking PostgreSQL service...
sc query postgresql-x64-15 | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo   PostgreSQL is running
) else (
    echo   PostgreSQL is not running! Starting...
    net start postgresql-x64-15
)

echo.
echo [Step 2] Creating database...
echo   This will prompt for postgres password.
echo   Common passwords to try: postgres, admin, password, 123456
echo.

"%PGPATH%\createdb.exe" -U postgres LowBackPainDb

if %errorlevel% equ 0 (
    echo   Database created successfully!
    echo.
    echo [Step 3] Running schema.sql...
    "%PGPATH%\psql.exe" -U postgres -d LowBackPainDb -f "%~dp0LowBackPainSystem.Backend\database\schema.sql"

    if %errorlevel% equ 0 (
        echo.
        echo ========================================
        echo   SUCCESS! Database is ready!
        echo ========================================
        echo.
        echo Next steps:
        echo 1. Run: create_abp_project.bat
        echo 2. Run: integrate_code.ps1
        echo.
    ) else (
        echo   Failed to run schema.sql
    )
) else (
    echo   Failed to create database
    echo   Please check your password
)

pause
