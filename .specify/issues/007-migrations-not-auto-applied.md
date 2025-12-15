# Issue #007: Database Migrations Not Auto-Applied on Render

## Date
2025-12-15

## Status
RESOLVED

## Problem Description
After adding EF Core migration for nullable Name column, the migration was not applied to the PostgreSQL database on Render. Submissions still failed with NOT NULL constraint error.

**Error persisted even after migration was created and pushed.**

## Root Cause
ABP Framework's HttpApi.Host doesn't automatically run EF Core migrations on startup by default. Migrations need to be:
1. Run manually via `dotnet ef database update`, or
2. Auto-applied via code on startup

On Render, we can't run manual commands easily, so auto-migration is needed.

## Solution
Added auto-migration code in `LowBackPainHttpApiHostModule.cs`:

```csharp
public override async Task OnApplicationInitializationAsync(ApplicationInitializationContext context)
{
    var app = context.GetApplicationBuilder();
    var env = context.GetEnvironment();

    // Auto-apply pending migrations on startup
    using (var scope = context.ServiceProvider.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<LowBackPainDbContext>();
        await dbContext.Database.MigrateAsync();
    }

    // ... rest of initialization
}
```

### Required Using Statements
```csharp
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
```

### Method Change
Changed from `OnApplicationInitialization` (sync) to `OnApplicationInitializationAsync` (async) to use `MigrateAsync()`.

## Files Modified
- `LowBackPainHttpApiHostModule.cs` - Added auto-migration code

## Migration Strategies Comparison

| Strategy | Pros | Cons |
|----------|------|------|
| **Manual CLI** | Full control | Not feasible on Render |
| **DbMigrator project** | ABP standard way | Requires separate run |
| **Auto on startup** | Always up to date | Slight startup delay |

## When Auto-Migration Runs
- Every time the application starts
- Only applies **pending** migrations (already-applied ones are skipped)
- Safe for production if migrations are tested first

## Lessons Learned
- ABP's HttpApi.Host doesn't auto-migrate by default
- Cloud platforms like Render need auto-migration or CI/CD pipeline for migrations
- Use `MigrateAsync()` in `OnApplicationInitializationAsync` for best practice
- Always test migrations locally before deploying
