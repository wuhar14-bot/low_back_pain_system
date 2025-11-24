using LowBackPain.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace LowBackPain.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class LowBackPainController : AbpControllerBase
{
    protected LowBackPainController()
    {
        LocalizationResource = typeof(LowBackPainResource);
    }
}
