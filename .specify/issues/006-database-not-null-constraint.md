# Issue #006: Database NOT NULL Constraint on Name Column

## Date
2025-12-15

## Status
RESOLVED

## Problem Description
After making `Name` field optional in C# code (DTO and Entity), submissions still failed with 500 error.

**Error Message:**
```
Npgsql.PostgresException (0x80004005): 23502: null value in column "Name" of relation "AppPatients" violates not-null constraint
```

## Root Cause
Three layers need to be updated for a field to become nullable:

1. **DTO Layer** ✅ - `CreatePatientDto.cs` - removed `[Required]`, changed to `string?`
2. **Entity Layer** ✅ - `Patient.cs` - changed to `string?`, updated constructor and methods
3. **Database Layer** ❌ - `LowBackPainDbContext.cs` still had `IsRequired()` + database column was NOT NULL

The DbContext configuration explicitly set:
```csharp
b.Property(x => x.Name).IsRequired().HasMaxLength(200);
```

Even though the C# type was `string?`, the database schema still enforced NOT NULL.

## Solution

### 1. Update DbContext Configuration
```csharp
// Before:
b.Property(x => x.Name).IsRequired().HasMaxLength(200);

// After:
b.Property(x => x.Name).IsRequired(false).HasMaxLength(200);
```

### 2. Create EF Core Migration
```bash
# Add EF Design package (version must match .NET version)
dotnet add package Microsoft.EntityFrameworkCore.Design --version 7.0.20

# Create migration
cd src/LowBackPain.EntityFrameworkCore
dotnet ef migrations add MakePatientNameNullable --startup-project ../LowBackPain.HttpApi.Host
```

### 3. Generated Migration
```csharp
public partial class MakePatientNameNullable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(
            name: "Name",
            table: "AppPatients",
            type: "character varying(200)",
            maxLength: 200,
            nullable: true,  // Changed from false
            oldClrType: typeof(string),
            oldType: "character varying(200)",
            oldMaxLength: 200);
    }
}
```

### 4. Deploy
Push to GitHub → Render auto-deploys → Migration runs on startup

## Files Modified
- `LowBackPainDbContext.cs` - Changed `IsRequired()` to `IsRequired(false)`
- `LowBackPain.HttpApi.Host.csproj` - Added EF Design package
- New migration files in `Migrations/` folder

## Three Layers of Nullable Fields

| Layer | File | What to Change |
|-------|------|----------------|
| **DTO** | `CreatePatientDto.cs` | Remove `[Required]`, use `string?` |
| **Entity** | `Patient.cs` | Use `string?`, update constructor |
| **Database** | `DbContext.cs` | Use `IsRequired(false)` |
| **Database** | Migration | Run `ef migrations add` |

## Lessons Learned
- Making a field optional requires changes at ALL three layers
- C# nullable types (`string?`) don't automatically make database columns nullable
- Always check DbContext Fluent API configuration for `IsRequired()`
- EF Core Design package version must match your .NET version
- Empty migration = model hasn't changed (check DbContext config)
