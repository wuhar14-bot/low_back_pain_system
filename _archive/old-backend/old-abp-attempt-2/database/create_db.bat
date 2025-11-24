@echo off
set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE \"LowBackPainDb\";"
echo.
echo Database created. Now run: .\run_schema.bat
pause
