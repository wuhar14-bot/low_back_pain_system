$env:PGPASSWORD = "postgres"
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d LowBackPainDb -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
