using Volo.Abp.Settings;

namespace LowBackPain.Settings;

public class LowBackPainSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(LowBackPainSettings.MySetting1));
    }
}
