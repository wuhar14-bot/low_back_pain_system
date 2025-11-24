$env:PGPASSWORD = "postgres"
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d LowBackPainDb -c "\d patients"
