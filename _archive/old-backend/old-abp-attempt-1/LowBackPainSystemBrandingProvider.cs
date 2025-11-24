using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace LowBackPainSystem;

[Dependency(ReplaceServices = true)]
public class LowBackPainSystemBrandingProvider : DefaultBrandingProvider
{
    public override string AppName => "LowBackPainSystem";
}
