using System;
using System.Collections.Generic;
using System.Text;
using LowBackPain.Localization;
using Volo.Abp.Application.Services;

namespace LowBackPain;

/* Inherit your application services from this class.
 */
public abstract class LowBackPainAppService : ApplicationService
{
    protected LowBackPainAppService()
    {
        LocalizationResource = typeof(LowBackPainResource);
    }
}
