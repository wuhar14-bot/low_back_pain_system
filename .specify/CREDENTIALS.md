# Low Back Pain System - Credentials

**Last Updated**: 2025-11-17

---

## PostgreSQL Database

```
Username: postgres
Password: postgres
Database: LowBackPainDB
Host: localhost
Port: 5432
```

**Connection String**:
```
Host=localhost;Port=5432;Database=LowBackPainDB;User ID=postgres;Password=postgres;
```

---

## API Server

**Development URLs**:
```
HTTPS: https://localhost:44385
Swagger UI: https://localhost:44385/swagger
HTTP (configured): http://localhost:5000
```

---

## Frontend Development

```
Development Server: http://localhost:5173
Vite Config: vite.config.js
```

---

## ABP Framework (Built-in)

### OpenIddict Applications

**LowBackPain_Web**:
```
Client ID: LowBackPain_Web
Client Secret: 1q2w3e*
Root URL: https://localhost:44384
```

**LowBackPain_App**:
```
Client ID: LowBackPain_App
Root URL: http://localhost:4200
```

**LowBackPain_Swagger**:
```
Client ID: LowBackPain_Swagger
Root URL: http://localhost:5000
```

---

## Default Admin Account (ABP)

After first migration, ABP creates a default admin account:

```
Username: admin
Password: 1q2w3E*
```

*(Note: This is the ABP framework default. You can change it after first login)*

---

## Redis (Optional - for caching)

```
Host: 127.0.0.1
Port: 6379 (default)
```

---

## Security Notes

⚠️ **IMPORTANT**:
- These are **development credentials only**
- Change all passwords before production deployment
- Never commit this file to public repositories
- Keep `.gitignore` updated to exclude credential files

---

## Password Reset Tools

If you forget the PostgreSQL password:

**Automated Reset Script**:
```powershell
# Run as Administrator
E:\claude-code\low back pain system\backend-dotnet\reset-postgres-password.ps1
```

**Manual Reset**:
See [SETUP_INSTRUCTIONS.md](../backend-dotnet/SETUP_INSTRUCTIONS.md) for manual reset instructions

---

## Configuration Files

Database connection strings are stored in:
- `backend-dotnet/aspnet-core/src/LowBackPain.DbMigrator/appsettings.json`
- `backend-dotnet/aspnet-core/src/LowBackPain.HttpApi.Host/appsettings.json`

---

**Created**: 2025-11-17
**Purpose**: Centralized credential reference for development
**Status**: Active Development Environment
