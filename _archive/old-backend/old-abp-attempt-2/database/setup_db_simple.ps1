# PostgreSQL Database Setup Script - Low Back Pain System
# Simple English version to avoid encoding issues

param(
    [Parameter(Mandatory=$true)]
    [string]$PostgresPassword
)

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Database Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# PostgreSQL paths
$PG_BIN = "C:\Program Files\PostgreSQL\15\bin"
$PSQL = "$PG_BIN\psql.exe"

# Set password environment variable
$env:PGPASSWORD = $PostgresPassword

# Step 1: Check PostgreSQL service
Write-Host "[1/5] Checking PostgreSQL service..." -ForegroundColor Yellow
$service = sc query postgresql-x64-15 | Select-String "STATE"
if ($service -match "RUNNING") {
    Write-Host "[OK] PostgreSQL service is running" -ForegroundColor Green
} else {
    Write-Host "[WARN] PostgreSQL service not running, starting..." -ForegroundColor Red
    sc start postgresql-x64-15
    Start-Sleep -Seconds 3
}

# Step 2: Test connection
Write-Host ""
Write-Host "[2/5] Testing database connection..." -ForegroundColor Yellow
$testResult = & $PSQL -U postgres -c "SELECT version();" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Database connection successful" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Database connection failed" -ForegroundColor Red
    Write-Host "Error: $testResult" -ForegroundColor Red
    Write-Host "Please check if password is correct" -ForegroundColor Yellow
    exit 1
}

# Step 3: Create database
Write-Host ""
Write-Host "[3/5] Creating LowBackPainDb database..." -ForegroundColor Yellow
$dbExists = & $PSQL -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='LowBackPainDb'" 2>&1
if ($dbExists -eq "1") {
    Write-Host "[INFO] Database LowBackPainDb already exists" -ForegroundColor Yellow
    $confirm = Read-Host "Delete and recreate? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        & $PSQL -U postgres -c "DROP DATABASE IF EXISTS ""LowBackPainDb"";" 2>&1 | Out-Null
        & $PSQL -U postgres -c "CREATE DATABASE ""LowBackPainDb"";" 2>&1 | Out-Null
        Write-Host "[OK] Database recreated" -ForegroundColor Green
    } else {
        Write-Host "[OK] Using existing database" -ForegroundColor Green
    }
} else {
    & $PSQL -U postgres -c "CREATE DATABASE ""LowBackPainDb"";" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Database created successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Database creation failed" -ForegroundColor Red
        exit 1
    }
}

# Step 4: Run schema.sql
Write-Host ""
Write-Host "[4/5] Creating database tables..." -ForegroundColor Yellow
$schemaFile = "$PSScriptRoot\schema.sql"
if (Test-Path $schemaFile) {
    $schemaResult = & $PSQL -U postgres -d LowBackPainDb -f $schemaFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Database tables created successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Table creation failed" -ForegroundColor Red
        Write-Host "Error: $schemaResult" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[ERROR] schema.sql file not found: $schemaFile" -ForegroundColor Red
    exit 1
}

# Step 5: Verify tables
Write-Host ""
Write-Host "[5/5] Verifying database structure..." -ForegroundColor Yellow
$tables = & $PSQL -U postgres -d LowBackPainDb -tAc "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Found tables:" -ForegroundColor Green
    $tables -split "`n" | Where-Object { $_ -ne "" } | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor Cyan
    }
} else {
    Write-Host "[ERROR] Cannot verify table structure" -ForegroundColor Red
    exit 1
}

# Complete
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Database setup complete!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database connection info:" -ForegroundColor Yellow
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  Database: LowBackPainDb" -ForegroundColor White
Write-Host "  Username: postgres" -ForegroundColor White
Write-Host ""
Write-Host "Connection string (for appsettings.json):" -ForegroundColor Yellow
Write-Host "Host=localhost;Port=5432;Database=LowBackPainDb;Username=postgres;Password=$PostgresPassword" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Create ABP project with:" -ForegroundColor Yellow
Write-Host "cd 'E:\claude-code\low back pain system'" -ForegroundColor Cyan
Write-Host "abp new LowBackPainSystem -t app-nolayers --database-provider PostgreSQL" -ForegroundColor Cyan
Write-Host ""

# Clean up environment variable
Remove-Item Env:\PGPASSWORD
