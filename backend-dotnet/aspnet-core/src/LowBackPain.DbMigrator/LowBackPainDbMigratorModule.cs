using LowBackPain.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace LowBackPain.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(LowBackPainEntityFrameworkCoreModule),
    typeof(LowBackPainApplicationContractsModule)
    )]
public class LowBackPainDbMigratorModule : AbpModule
{
}
