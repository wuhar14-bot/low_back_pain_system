# PostgreSQL Password Reset Script
# This script will safely reset the postgres user password

# Requires Administrator privileges
#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"

# Configuration
$pgVersion = "15"
$pgDataPath = "C:\Program Files\PostgreSQL\$pgVersion\data"
$pgBinPath = "C:\Program Files\PostgreSQL\$pgVersion\bin"
$pgHbaFile = "$pgDataPath\pg_hba.conf"
$pgHbaBackup = "$pgDataPath\pg_hba.conf.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$serviceName = "postgresql-x64-$pgVersion"
$newPassword = "postgres"  # You can change this to whatever you want

Write-Host "================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Password Reset Tool" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if running as Administrator
Write-Host "[1/7] Checking administrator privileges..." -ForegroundColor Yellow
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ Error: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Step 2: Verify PostgreSQL paths
Write-Host "[2/7] Verifying PostgreSQL installation..." -ForegroundColor Yellow
if (-not (Test-Path $pgDataPath)) {
    Write-Host "❌ Error: PostgreSQL data directory not found at: $pgDataPath" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $pgHbaFile)) {
    Write-Host "❌ Error: pg_hba.conf not found at: $pgHbaFile" -ForegroundColor Red
    exit 1
}
Write-Host "✅ PostgreSQL installation found" -ForegroundColor Green
Write-Host ""

# Step 3: Backup pg_hba.conf
Write-Host "[3/7] Backing up pg_hba.conf..." -ForegroundColor Yellow
try {
    Copy-Item -Path $pgHbaFile -Destination $pgHbaBackup -Force
    Write-Host "✅ Backup created: $pgHbaBackup" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating backup: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Modify pg_hba.conf to allow trust authentication
Write-Host "[4/7] Modifying pg_hba.conf to enable password-less login..." -ForegroundColor Yellow
try {
    $content = Get-Content $pgHbaFile
    $newContent = @()

    foreach ($line in $content) {
        # Replace scram-sha-256 or md5 with trust for local connections
        if ($line -match "^host\s+all\s+all\s+127\.0\.0\.1/32\s+(scram-sha-256|md5|password)") {
            $newContent += $line -replace "(scram-sha-256|md5|password)", "trust"
            Write-Host "  Modified: $line" -ForegroundColor Gray
        } elseif ($line -match "^host\s+all\s+all\s+::1/128\s+(scram-sha-256|md5|password)") {
            $newContent += $line -replace "(scram-sha-256|md5|password)", "trust"
            Write-Host "  Modified: $line" -ForegroundColor Gray
        } else {
            $newContent += $line
        }
    }

    Set-Content -Path $pgHbaFile -Value $newContent -Force
    Write-Host "✅ pg_hba.conf modified" -ForegroundColor Green
} catch {
    Write-Host "❌ Error modifying pg_hba.conf: $_" -ForegroundColor Red
    Write-Host "Restoring backup..." -ForegroundColor Yellow
    Copy-Item -Path $pgHbaBackup -Destination $pgHbaFile -Force
    exit 1
}
Write-Host ""

# Step 5: Restart PostgreSQL service
Write-Host "[5/7] Restarting PostgreSQL service..." -ForegroundColor Yellow
try {
    Restart-Service $serviceName -Force
    Start-Sleep -Seconds 3
    $service = Get-Service $serviceName
    if ($service.Status -ne "Running") {
        throw "Service is not running after restart"
    }
    Write-Host "✅ PostgreSQL service restarted successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error restarting service: $_" -ForegroundColor Red
    Write-Host "Restoring backup..." -ForegroundColor Yellow
    Copy-Item -Path $pgHbaBackup -Destination $pgHbaFile -Force
    exit 1
}
Write-Host ""

# Step 6: Reset password using psql
Write-Host "[6/7] Resetting postgres user password..." -ForegroundColor Yellow
Write-Host "New password will be: $newPassword" -ForegroundColor Cyan
try {
    $psqlPath = "$pgBinPath\psql.exe"
    if (-not (Test-Path $psqlPath)) {
        throw "psql.exe not found at: $psqlPath"
    }

    # Execute password reset
    $env:PGPASSWORD = ""
    $sqlCommand = "ALTER USER postgres WITH PASSWORD '$newPassword';"
    $result = & $psqlPath -U postgres -d postgres -c $sqlCommand 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Password reset successfully!" -ForegroundColor Green
    } else {
        throw "psql command failed: $result"
    }
} catch {
    Write-Host "❌ Error resetting password: $_" -ForegroundColor Red
    Write-Host "Restoring backup..." -ForegroundColor Yellow
    Copy-Item -Path $pgHbaBackup -Destination $pgHbaFile -Force
    Restart-Service $serviceName -Force
    exit 1
}
Write-Host ""

# Step 7: Restore pg_hba.conf security settings
Write-Host "[7/7] Restoring pg_hba.conf security settings..." -ForegroundColor Yellow
try {
    Copy-Item -Path $pgHbaBackup -Destination $pgHbaFile -Force
    Restart-Service $serviceName -Force
    Start-Sleep -Seconds 3
    Write-Host "✅ Security settings restored" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Warning: Error restoring pg_hba.conf: $_" -ForegroundColor Yellow
    Write-Host "You may need to manually restore from: $pgHbaBackup" -ForegroundColor Yellow
}
Write-Host ""

# Step 8: Test the new password
Write-Host "Testing new password..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = $newPassword
    $testResult = & $psqlPath -U postgres -d postgres -c "SELECT version();" 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Password verified - connection successful!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Warning: Could not verify password" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Warning: Password verification failed" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ PASSWORD RESET COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "New credentials:" -ForegroundColor Cyan
Write-Host "  Username: postgres" -ForegroundColor White
Write-Host "  Password: $newPassword" -ForegroundColor White
Write-Host ""
Write-Host "Connection string for appsettings.json:" -ForegroundColor Cyan
Write-Host "  Host=localhost;Port=5432;Database=LowBackPainDB;User ID=postgres;Password=$newPassword;" -ForegroundColor White
Write-Host ""
Write-Host "Backup file saved at:" -ForegroundColor Cyan
Write-Host "  $pgHbaBackup" -ForegroundColor White
Write-Host ""
