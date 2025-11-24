using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace LowBackPain;

[Dependency(ReplaceServices = true)]
public class LowBackPainBrandingProvider : DefaultBrandingProvider
{
    public override string AppName => "LowBackPain";
}
