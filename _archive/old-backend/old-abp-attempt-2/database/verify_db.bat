@echo off
set PGPASSWORD=postgres
set PGCLIENTENCODING=UTF8
echo Checking database tables...
echo.
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d LowBackPainDb -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
echo.
echo Checking workspaces data...
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d LowBackPainDb -c "SELECT name, code FROM workspaces;"
echo.
pause
