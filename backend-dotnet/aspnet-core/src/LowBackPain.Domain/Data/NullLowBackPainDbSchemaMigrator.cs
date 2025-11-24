using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace LowBackPain.Data;

/* This is used if database provider does't define
 * ILowBackPainDbSchemaMigrator implementation.
 */
public class NullLowBackPainDbSchemaMigrator : ILowBackPainDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
