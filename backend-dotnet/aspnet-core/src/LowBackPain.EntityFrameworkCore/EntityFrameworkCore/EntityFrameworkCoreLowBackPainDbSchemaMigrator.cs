using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using LowBackPain.Data;
using Volo.Abp.DependencyInjection;

namespace LowBackPain.EntityFrameworkCore;

public class EntityFrameworkCoreLowBackPainDbSchemaMigrator
    : ILowBackPainDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoreLowBackPainDbSchemaMigrator(
        IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolving the LowBackPainDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<LowBackPainDbContext>()
            .Database
            .MigrateAsync();
    }
}
