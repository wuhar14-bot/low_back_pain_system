@echo off
echo ====================================
echo Creating ABP vNext Project
echo ====================================
echo.

cd /d "E:\claude-code\low back pain system"

echo Current directory: %CD%
echo.

echo Step 1: Checking ABP CLI version...
abp --version
echo.

echo Step 2: Creating ABP project...
echo This may take several minutes. Please wait...
echo.

abp new LowBackPainSystem -t app-nolayers --database-provider PostgreSQL --version 7.3.0

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo SUCCESS: ABP project created!
    echo ====================================
    echo.
    echo Project location: E:\claude-code\low back pain system\LowBackPainSystem
    echo.
    echo Next steps:
    echo 1. Configure database connection in appsettings.json
    echo 2. Copy generated C# files to the project
    echo 3. Run: dotnet build
    echo 4. Run: dotnet run
    echo.
) else (
    echo.
    echo ====================================
    echo ERROR: Failed to create ABP project
    echo ====================================
    echo.
    echo If the version 7.3.0 is not available, try:
    echo   abp new LowBackPainSystem -t app-nolayers --database-provider PostgreSQL
    echo.
)

pause
