using LowBackPainSystem.Localization;
using Volo.Abp.Identity.Web.Navigation;
using Volo.Abp.SettingManagement.Web.Navigation;
using Volo.Abp.TenantManagement.Web.Navigation;
using Volo.Abp.UI.Navigation;

namespace LowBackPainSystem.Menus;

public class LowBackPainSystemMenuContributor : IMenuContributor
{
    public async Task ConfigureMenuAsync(MenuConfigurationContext context)
    {
        if (context.Menu.Name == StandardMenus.Main)
        {
            await ConfigureMainMenuAsync(context);
        }
    }

    private Task ConfigureMainMenuAsync(MenuConfigurationContext context)
    {
        var administration = context.Menu.GetAdministration();
        var l = context.GetLocalizer<LowBackPainSystemResource>();

        context.Menu.Items.Insert(
            0,
            new ApplicationMenuItem(
                LowBackPainSystemMenus.Home,
                l["Menu:Home"],
                "~/",
                icon: "fas fa-home",
                order: 0
            )
        );

        // Add Patients menu item
        context.Menu.AddItem(
            new ApplicationMenuItem(
                "Patients",
                "患者管理 / Patients",
                "/Patients",
                icon: "fas fa-user-injured",
                order: 1
            )
        );

        if (LowBackPainSystemModule.IsMultiTenant)
        {
            administration.SetSubItemOrder(TenantManagementMenuNames.GroupName, 1);
        }
        else
        {
            administration.TryRemoveMenuItem(TenantManagementMenuNames.GroupName);
        }

        return Task.CompletedTask;
    }
}
