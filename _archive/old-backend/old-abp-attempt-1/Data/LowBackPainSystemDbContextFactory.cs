using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LowBackPainSystem.Data;

public class LowBackPainSystemDbContextFactory : IDesignTimeDbContextFactory<LowBackPainSystemDbContext>
{
    public LowBackPainSystemDbContext CreateDbContext(string[] args)
    {
        // https://www.npgsql.org/efcore/release-notes/6.0.html#opting-out-of-the-new-timestamp-mapping-logic
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        var configuration = BuildConfiguration();

        var builder = new DbContextOptionsBuilder<LowBackPainSystemDbContext>()
            .UseNpgsql(configuration.GetConnectionString("Default"));

        return new LowBackPainSystemDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false);

        return builder.Build();
    }
}
