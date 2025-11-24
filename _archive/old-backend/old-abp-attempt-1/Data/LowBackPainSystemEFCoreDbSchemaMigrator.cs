using Microsoft.EntityFrameworkCore;
using Volo.Abp.DependencyInjection;

namespace LowBackPainSystem.Data;

public class LowBackPainSystemEFCoreDbSchemaMigrator : ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public LowBackPainSystemEFCoreDbSchemaMigrator(
        IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolve the LowBackPainSystemDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<LowBackPainSystemDbContext>()
            .Database
            .MigrateAsync();
    }
}
