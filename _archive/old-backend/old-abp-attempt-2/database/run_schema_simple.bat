@echo off
echo Running schema with UTF-8 encoding...
set PGPASSWORD=postgres
set PGCLIENTENCODING=UTF8
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d LowBackPainDb -f schema.sql
echo.
echo Done!
pause
