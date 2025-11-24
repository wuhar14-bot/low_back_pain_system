using LowBackPain.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace LowBackPain.Permissions;

public class LowBackPainPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(LowBackPainPermissions.GroupName);
        //Define your own permissions here. Example:
        //myGroup.AddPermission(LowBackPainPermissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<LowBackPainResource>(name);
    }
}
