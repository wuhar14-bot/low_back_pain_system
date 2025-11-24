# Code Integration Script
# Copies generated C# files to ABP project structure

param(
    [string]$TargetPath = "E:\claude-code\low back pain system\LowBackPainSystem"
)

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Code Integration Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$SourceRoot = "E:\claude-code\low back pain system\LowBackPainSystem.Backend\src"

# Check if ABP project exists
if (-not (Test-Path $TargetPath)) {
    Write-Host "ERROR: ABP project not found at: $TargetPath" -ForegroundColor Red
    Write-Host "Please run create_abp_project.bat first!" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Source: $SourceRoot" -ForegroundColor Yellow
Write-Host "Target: $TargetPath\src" -ForegroundColor Yellow
Write-Host ""

$TargetRoot = "$TargetPath\src"

# Function to copy directory
function Copy-ProjectFolder {
    param(
        [string]$Source,
        [string]$Target,
        [string]$FolderName
    )

    $SourceFolder = Join-Path $Source $FolderName
    $TargetFolder = Join-Path $Target $FolderName

    if (Test-Path $SourceFolder) {
        Write-Host "Copying $FolderName..." -ForegroundColor Yellow

        if (-not (Test-Path $TargetFolder)) {
            New-Item -ItemType Directory -Path $TargetFolder -Force | Out-Null
        }

        Copy-Item -Path "$SourceFolder\*" -Destination $TargetFolder -Recurse -Force
        Write-Host "  ✓ $FolderName copied successfully" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ! $FolderName not found in source" -ForegroundColor Yellow
        return $false
    }
}

# Copy Domain Layer
Write-Host ""
Write-Host "[1/4] Copying Domain Layer..." -ForegroundColor Cyan
$domainSource = "$SourceRoot\LowBackPainSystem.Domain"
$domainTarget = "$TargetRoot\LowBackPainSystem.Domain"

Copy-ProjectFolder $domainSource $domainTarget "Patients"
Copy-ProjectFolder $domainSource $domainTarget "Workspaces"
Copy-ProjectFolder $domainSource $domainTarget "Doctors"

# Copy Application Contracts Layer
Write-Host ""
Write-Host "[2/4] Copying Application Contracts Layer..." -ForegroundColor Cyan
$contractsSource = "$SourceRoot\LowBackPainSystem.Application.Contracts"
$contractsTarget = "$TargetRoot\LowBackPainSystem.Application.Contracts"

Copy-ProjectFolder $contractsSource $contractsTarget "Patients"
Copy-ProjectFolder $contractsSource $contractsTarget "Services"

# Copy Application Layer
Write-Host ""
Write-Host "[3/4] Copying Application Layer..." -ForegroundColor Cyan
$appSource = "$SourceRoot\LowBackPainSystem.Application"
$appTarget = "$TargetRoot\LowBackPainSystem.Application"

Copy-ProjectFolder $appSource $appTarget "Patients"
Copy-ProjectFolder $appSource $appTarget "Services"

# Copy EntityFrameworkCore Layer
Write-Host ""
Write-Host "[4/4] Copying EntityFrameworkCore Layer..." -ForegroundColor Cyan
$efSource = "$SourceRoot\LowBackPainSystem.EntityFrameworkCore\EntityFrameworkCore"
$efTarget = "$TargetRoot\LowBackPainSystem.EntityFrameworkCore\EntityFrameworkCore"

if (Test-Path "$efSource\LowBackPainDbContext.cs") {
    if (-not (Test-Path $efTarget)) {
        New-Item -ItemType Directory -Path $efTarget -Force | Out-Null
    }
    Copy-Item "$efSource\LowBackPainDbContext.cs" -Destination $efTarget -Force
    Write-Host "  ✓ LowBackPainDbContext.cs copied" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Integration Complete!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files copied to: $TargetRoot" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure database connection in appsettings.json" -ForegroundColor White
Write-Host "2. Run: dotnet restore" -ForegroundColor White
Write-Host "3. Run: dotnet build" -ForegroundColor White
Write-Host "4. Fix any compilation errors" -ForegroundColor White
Write-Host "5. Run: dotnet run" -ForegroundColor White
Write-Host ""

# List all copied files
Write-Host "Summary of copied files:" -ForegroundColor Cyan
$copiedFiles = Get-ChildItem -Path $TargetRoot -Recurse -File -Filter "*.cs" |
    Where-Object { $_.FullName -match "(Patients|Workspaces|Doctors|Services)" } |
    Select-Object -ExpandProperty FullName

Write-Host "Total files: $($copiedFiles.Count)" -ForegroundColor Green
Write-Host ""

pause
