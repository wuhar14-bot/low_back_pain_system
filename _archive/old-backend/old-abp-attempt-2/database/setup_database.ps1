# PostgreSQL Database Setup Script
# Low Back Pain System

param(
    [Parameter(Mandatory=$true)]
    [string]$PostgresPassword
)

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Database Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# PostgreSQL 路径
$PG_BIN = "C:\Program Files\PostgreSQL\15\bin"
$PSQL = "$PG_BIN\psql.exe"

# 设置密码环境变量
$env:PGPASSWORD = $PostgresPassword

# 步骤 1: 检查 PostgreSQL 服务
Write-Host "[1/5] 检查 PostgreSQL 服务状态..." -ForegroundColor Yellow
$service = sc query postgresql-x64-15 | Select-String "STATE"
if ($service -match "RUNNING") {
    Write-Host "✓ PostgreSQL 服务正在运行" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL 服务未运行，正在启动..." -ForegroundColor Red
    sc start postgresql-x64-15
    Start-Sleep -Seconds 3
}

# 步骤 2: 测试连接
Write-Host ""
Write-Host "[2/5] 测试数据库连接..." -ForegroundColor Yellow
$testResult = & $PSQL -U postgres -c "SELECT version();" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 数据库连接成功" -ForegroundColor Green
} else {
    Write-Host "✗ 数据库连接失败" -ForegroundColor Red
    Write-Host "错误: $testResult" -ForegroundColor Red
    Write-Host "请检查密码是否正确" -ForegroundColor Yellow
    exit 1
}

# 步骤 3: 创建数据库
Write-Host ""
Write-Host "[3/5] 创建 LowBackPainDb 数据库..." -ForegroundColor Yellow
$dbExists = & $PSQL -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='LowBackPainDb'" 2>&1
if ($dbExists -eq "1") {
    Write-Host "! 数据库 LowBackPainDb 已存在" -ForegroundColor Yellow
    $confirm = Read-Host "是否删除并重新创建? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-Host "正在删除现有数据库..." -ForegroundColor Yellow
        & $PSQL -U postgres -c "DROP DATABASE \"LowBackPainDb\";" 2>&1 | Out-Null
        & $PSQL -U postgres -c "CREATE DATABASE \"LowBackPainDb\";" 2>&1 | Out-Null
        Write-Host "✓ 数据库已重新创建" -ForegroundColor Green
    } else {
        Write-Host "✓ 使用现有数据库" -ForegroundColor Green
    }
} else {
    & $PSQL -U postgres -c "CREATE DATABASE \"LowBackPainDb\";" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 数据库创建成功" -ForegroundColor Green
    } else {
        Write-Host "✗ 数据库创建失败" -ForegroundColor Red
        exit 1
    }
}

# 步骤 4: 运行 schema.sql
Write-Host ""
Write-Host "[4/5] 创建数据库表结构..." -ForegroundColor Yellow
$schemaFile = "$PSScriptRoot\schema.sql"
if (Test-Path $schemaFile) {
    $schemaResult = & $PSQL -U postgres -d LowBackPainDb -f $schemaFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 数据库表创建成功" -ForegroundColor Green
    } else {
        Write-Host "✗ 表创建失败" -ForegroundColor Red
        Write-Host "错误: $schemaResult" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ schema.sql 文件不存在: $schemaFile" -ForegroundColor Red
    exit 1
}

# 步骤 5: 验证表创建
Write-Host ""
Write-Host "[5/5] 验证数据库结构..." -ForegroundColor Yellow
$tables = & $PSQL -U postgres -d LowBackPainDb -tAc "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 找到以下数据表:" -ForegroundColor Green
    $tables -split "`n" | Where-Object { $_ -ne "" } | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor Cyan
    }
} else {
    Write-Host "✗ 无法验证表结构" -ForegroundColor Red
    exit 1
}

# 完成
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "✓ 数据库设置完成!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "数据库连接信息:" -ForegroundColor Yellow
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  Database: LowBackPainDb" -ForegroundColor White
Write-Host "  Username: postgres" -ForegroundColor White
Write-Host ""
Write-Host "连接字符串 (用于 appsettings.json):" -ForegroundColor Yellow
Write-Host "Host=localhost;Port=5432;Database=LowBackPainDb;Username=postgres;Password=你的密码" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步: 运行以下命令创建 ABP 项目" -ForegroundColor Yellow
Write-Host "cd 'E:\claude-code\low back pain system'" -ForegroundColor Cyan
Write-Host "abp new LowBackPainSystem -t app-nolayers --database-provider PostgreSQL --version 7.3.0" -ForegroundColor Cyan
Write-Host ""

# 清理环境变量
Remove-Item Env:\PGPASSWORD
