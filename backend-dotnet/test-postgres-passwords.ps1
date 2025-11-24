# Test Common PostgreSQL Passwords
# This script tests common passwords to find the correct one

$commonPasswords = @(
    "postgres",
    "",
    "admin",
    "123456",
    "12345678",
    "password",
    "admin123",
    "root",
    "Password1",
    "qwerty"
)

$pgHost = "localhost"
$port = "5432"
$database = "postgres"  # Connect to default postgres database first
$user = "postgres"

Write-Host "Testing common PostgreSQL passwords..." -ForegroundColor Cyan
Write-Host "Host: $pgHost" -ForegroundColor Gray
Write-Host "Port: $port" -ForegroundColor Gray
Write-Host "User: $user" -ForegroundColor Gray
Write-Host ""

$found = $false

foreach ($pwd in $commonPasswords) {
    $displayPwd = if ($pwd -eq "") { "(empty/blank)" } else { $pwd }
    Write-Host "Testing password: $displayPwd" -ForegroundColor Yellow -NoNewline

    # Build connection string
    if ($pwd -eq "") {
        $connectionString = "Host=$pgHost;Port=$port;Database=$database;User ID=$user;"
    } else {
        $connectionString = "Host=$pgHost;Port=$port;Database=$database;User ID=$user;Password=$pwd;"
    }

    # Test connection using .NET Npgsql
    try {
        Add-Type -Path "E:\claude-code\low back pain system\backend-dotnet\aspnet-core\src\LowBackPain.DbMigrator\bin\Debug\net7.0\Npgsql.dll"

        $conn = New-Object Npgsql.NpgsqlConnection($connectionString)
        $conn.Open()

        # Success!
        Write-Host " ✅ SUCCESS!" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "FOUND WORKING PASSWORD: $displayPwd" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Connection string:" -ForegroundColor Cyan
        Write-Host $connectionString -ForegroundColor White

        $conn.Close()
        $found = $true

        # Return the working password
        return $pwd

    } catch {
        Write-Host " ❌ Failed" -ForegroundColor Red
    }
}

if (-not $found) {
    Write-Host ""
    Write-Host "❌ None of the common passwords worked." -ForegroundColor Red
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Try to remember your PostgreSQL installation password" -ForegroundColor White
    Write-Host "2. Reset the PostgreSQL password (see SETUP_INSTRUCTIONS.md)" -ForegroundColor White
    Write-Host "3. Or create a new database user with a known password" -ForegroundColor White
}
