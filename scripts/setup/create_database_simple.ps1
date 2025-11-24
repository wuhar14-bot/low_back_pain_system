# Simple Database Setup Script
# Low Back Pain System

Write-Host "Low Back Pain System - Database Setup" -ForegroundColor Cyan
Write-Host ""

# Get password
Write-Host "Enter PostgreSQL postgres password:" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Set environment variable
$env:PGPASSWORD = $passwordPlain
$psqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"

Write-Host ""
Write-Host "Testing connection..." -ForegroundColor Yellow

# Test connection
$testCmd = "SELECT 1"
$testResult = & $psqlPath -U postgres -c $testCmd 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Connection failed! Check your password." -ForegroundColor Red
    exit 1
}

Write-Host "Connection OK!" -ForegroundColor Green
Write-Host ""

# Check if database exists
Write-Host "Checking if database exists..." -ForegroundColor Yellow
$checkCmd = "SELECT 1 FROM pg_database WHERE datname='LowBackPainDb'"
$dbCheck = & $psqlPath -U postgres -t -c $checkCmd 2>&1

if ($dbCheck -match "1") {
    Write-Host "Database already exists!" -ForegroundColor Yellow
    $response = Read-Host "Drop and recreate? (yes/no)"

    if ($response -eq "yes") {
        Write-Host "Dropping database..." -ForegroundColor Yellow
        $dropCmd = 'DROP DATABASE IF EXISTS "LowBackPainDb"'
        & $psqlPath -U postgres -c $dropCmd | Out-Null
    } else {
        Write-Host "Keeping existing database" -ForegroundColor Yellow
        exit 0
    }
}

# Create database
Write-Host "Creating database LowBackPainDb..." -ForegroundColor Yellow
$createCmd = 'CREATE DATABASE "LowBackPainDb"'
& $psqlPath -U postgres -c $createCmd | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created!" -ForegroundColor Green
} else {
    Write-Host "Failed to create database" -ForegroundColor Red
    exit 1
}

# Run schema
$schemaPath = Join-Path $PSScriptRoot "LowBackPainSystem.Backend\database\schema.sql"

if (Test-Path $schemaPath) {
    Write-Host "Running schema.sql..." -ForegroundColor Yellow
    & $psqlPath -U postgres -d LowBackPainDb -f $schemaPath | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Tables created!" -ForegroundColor Green
    } else {
        Write-Host "Failed to create tables" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "schema.sql not found at: $schemaPath" -ForegroundColor Red
    exit 1
}

# Verify
Write-Host ""
Write-Host "Verifying tables..." -ForegroundColor Yellow
$tablesCmd = "SELECT tablename FROM pg_tables WHERE schemaname='public'"
$tables = & $psqlPath -U postgres -d LowBackPainDb -t -c $tablesCmd 2>&1

Write-Host "Created tables:" -ForegroundColor Green
$tables -split "`n" | Where-Object { $_.Trim() -ne "" } | ForEach-Object {
    Write-Host "  - $($_.Trim())" -ForegroundColor White
}

Write-Host ""
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Connection string:" -ForegroundColor Yellow
Write-Host "Host=localhost;Port=5432;Database=LowBackPainDb;Username=postgres;Password=YOUR_PASSWORD" -ForegroundColor White
Write-Host ""
