using LowBackPain.EntityFrameworkCore;
using Volo.Abp.Modularity;

namespace LowBackPain;

[DependsOn(
    typeof(LowBackPainEntityFrameworkCoreTestModule)
    )]
public class LowBackPainDomainTestModule : AbpModule
{

}
