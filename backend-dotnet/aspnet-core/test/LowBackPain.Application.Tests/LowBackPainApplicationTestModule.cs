using Volo.Abp.Modularity;

namespace LowBackPain;

[DependsOn(
    typeof(LowBackPainApplicationModule),
    typeof(LowBackPainDomainTestModule)
    )]
public class LowBackPainApplicationTestModule : AbpModule
{

}
