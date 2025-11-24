# ====================================================
# Low Back Pain System - Interactive Database Setup
# ====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Low Back Pain System" -ForegroundColor Cyan
Write-Host "  Database Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check PostgreSQL service
Write-Host "[1/4] Checking PostgreSQL service..." -ForegroundColor Yellow
$service = Get-Service -Name "postgresql-x64-15" -ErrorAction SilentlyContinue

if ($service -and $service.Status -eq "Running") {
    Write-Host "  ✓ PostgreSQL service is running" -ForegroundColor Green
} else {
    Write-Host "  ✗ PostgreSQL service is not running" -ForegroundColor Red
    Write-Host "  Please start PostgreSQL service first!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Get password
Write-Host "[2/4] PostgreSQL Authentication" -ForegroundColor Yellow
Write-Host "  Please enter your PostgreSQL 'postgres' user password:" -ForegroundColor White
$password = Read-Host -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

Write-Host ""

# Set environment variable for psql
$env:PGPASSWORD = $passwordPlain

# Path to psql
$psqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "  ✗ psql.exe not found at: $psqlPath" -ForegroundColor Red
    exit 1
}

# Test connection
Write-Host "[3/4] Testing database connection..." -ForegroundColor Yellow
$testResult = & $psqlPath -U postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Connection successful!" -ForegroundColor Green
} else {
    Write-Host "  ✗ Connection failed. Please check your password." -ForegroundColor Red
    Write-Host "  Error: $testResult" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Create database
Write-Host "[4/4] Creating database and tables..." -ForegroundColor Yellow

# Check if database exists
$dbCheck = & $psqlPath -U postgres -t -c "SELECT 1 FROM pg_database WHERE datname='LowBackPainDb';" 2>&1
$dbExists = $dbCheck -match "1"

if ($dbExists) {
    Write-Host "  ! Database 'LowBackPainDb' already exists" -ForegroundColor Yellow
    $response = Read-Host "  Do you want to DROP and recreate it? (yes/no)"

    if ($response -eq "yes") {
        Write-Host "  → Dropping existing database..." -ForegroundColor Yellow
        & $psqlPath -U postgres -c "DROP DATABASE IF EXISTS ""LowBackPainDb"";" | Out-Null
        Write-Host "  ✓ Database dropped" -ForegroundColor Green
    } else {
        Write-Host "  → Keeping existing database" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Setup Skipped" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        exit 0
    }
}

# Create database
Write-Host "  → Creating database 'LowBackPainDb'..." -ForegroundColor Yellow
& $psqlPath -U postgres -c "CREATE DATABASE ""LowBackPainDb"";" | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Database created successfully!" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to create database" -ForegroundColor Red
    exit 1
}

# Run schema.sql
$schemaPath = Join-Path $PSScriptRoot "LowBackPainSystem.Backend\database\schema.sql"

if (-not (Test-Path $schemaPath)) {
    Write-Host "  ! schema.sql not found at: $schemaPath" -ForegroundColor Yellow
    Write-Host "  Please run schema.sql manually using pgAdmin" -ForegroundColor Yellow
} else {
    Write-Host "  → Running schema.sql..." -ForegroundColor Yellow
    & $psqlPath -U postgres -d LowBackPainDb -f $schemaPath | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Tables created successfully!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to create tables" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Verify tables
Write-Host "  Verifying database structure..." -ForegroundColor Yellow
$tables = & $psqlPath -U postgres -d LowBackPainDb -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" 2>&1

if ($tables -match "patients" -and $tables -match "workspaces") {
    Write-Host "  ✓ Database structure verified!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Created tables:" -ForegroundColor White
    $tables -split "`n" | Where-Object { $_.Trim() -ne "" } | ForEach-Object {
        Write-Host "    • $($_.Trim())" -ForegroundColor Gray
    }
} else {
    Write-Host "  ! Some tables may be missing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Database Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Connection string for appsettings.json:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Host=localhost;Port=5432;Database=LowBackPainDb;Username=postgres;Password=YOUR_PASSWORD" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create ABP project: .\create_abp_project.bat" -ForegroundColor White
Write-Host "2. Integrate code: .\integrate_code.ps1" -ForegroundColor White
Write-Host "3. Update appsettings.json with connection string" -ForegroundColor White
Write-Host "4. Run: cd LowBackPainSystem && dotnet build && dotnet run" -ForegroundColor White
Write-Host ""
