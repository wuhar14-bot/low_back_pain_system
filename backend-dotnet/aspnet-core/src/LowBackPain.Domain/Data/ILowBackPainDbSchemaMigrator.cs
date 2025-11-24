using System.Threading.Tasks;

namespace LowBackPain.Data;

public interface ILowBackPainDbSchemaMigrator
{
    Task MigrateAsync();
}
