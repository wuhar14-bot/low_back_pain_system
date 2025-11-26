$passwords = @('postgres', 'password', '123456', 'root', 'admin', 'admin123', '')

foreach ($pwd in $passwords) {
    $env:PGPASSWORD = $pwd
    Write-Host "Testing password: '$pwd'..."

    $output = psql -U postgres -h localhost -c "\l" 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS! Password is: '$pwd'" -ForegroundColor Green
        break
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "All passwords failed. Please check PostgreSQL installation." -ForegroundColor Red
}
