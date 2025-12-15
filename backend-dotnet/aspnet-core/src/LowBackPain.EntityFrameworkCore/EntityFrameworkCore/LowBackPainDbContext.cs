using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using LowBackPain.Entities;

namespace LowBackPain.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ConnectionStringName("Default")]
public class LowBackPainDbContext :
    AbpDbContext<LowBackPainDbContext>,
    IIdentityDbContext,
    ITenantManagementDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */

    // Low Back Pain System Entities
    public DbSet<Patient> Patients { get; set; }
    public DbSet<PatientImage> PatientImages { get; set; }

    #region Entities from the modules

    /* Notice: We only implemented IIdentityDbContext and ITenantManagementDbContext
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityDbContext and ITenantManagementDbContext.
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

    //Identity
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }

    // Tenant Management
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }

    #endregion

    public LowBackPainDbContext(DbContextOptions<LowBackPainDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureFeatureManagement();
        builder.ConfigureTenantManagement();

        /* Configure your own tables/entities inside here */

        // Patient Entity Configuration
        builder.Entity<Patient>(b =>
        {
            b.ToTable(LowBackPainConsts.DbTablePrefix + "Patients", LowBackPainConsts.DbSchema);
            b.ConfigureByConvention(); // Auto configure for the base class props (Id, CreationTime, etc.)

            // Required fields
            b.Property(x => x.StudyId).IsRequired().HasMaxLength(50);
            b.Property(x => x.Name).IsRequired(false).HasMaxLength(200); // Name is optional
            b.Property(x => x.WorkspaceId).IsRequired();
            b.Property(x => x.WorkspaceName).HasMaxLength(200);
            b.Property(x => x.DoctorId).IsRequired();
            b.Property(x => x.DoctorName).HasMaxLength(200);

            // Optional fields
            b.Property(x => x.Gender).HasMaxLength(10);
            b.Property(x => x.Phone).HasMaxLength(50);
            b.Property(x => x.ChiefComplaint).HasMaxLength(500);

            // JSON fields - stored as text
            b.Property(x => x.MedicalHistoryJson).HasColumnType("jsonb");
            b.Property(x => x.PainAreasJson).HasColumnType("jsonb");
            b.Property(x => x.SubjectiveExamJson).HasColumnType("jsonb");
            b.Property(x => x.ObjectiveExamJson).HasColumnType("jsonb");
            b.Property(x => x.FunctionalScoresJson).HasColumnType("jsonb");
            b.Property(x => x.AiPostureAnalysisJson).HasColumnType("jsonb");
            b.Property(x => x.InterventionJson).HasColumnType("jsonb");

            // Indexes
            b.HasIndex(x => x.StudyId).IsUnique();
            b.HasIndex(x => x.WorkspaceId);
            b.HasIndex(x => x.DoctorId);
            b.HasIndex(x => x.CreationTime);

            // Relationships
            b.HasMany(x => x.Images)
                .WithOne(x => x.Patient)
                .HasForeignKey(x => x.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // PatientImage Entity Configuration
        builder.Entity<PatientImage>(b =>
        {
            b.ToTable(LowBackPainConsts.DbTablePrefix + "PatientImages", LowBackPainConsts.DbSchema);
            b.ConfigureByConvention();

            // Required fields
            b.Property(x => x.PatientId).IsRequired();
            b.Property(x => x.ImageType).IsRequired().HasMaxLength(50);
            b.Property(x => x.FileName).IsRequired().HasMaxLength(255);
            b.Property(x => x.FilePath).IsRequired().HasMaxLength(500);
            b.Property(x => x.MimeType).IsRequired().HasMaxLength(100);
            b.Property(x => x.FileSize).IsRequired();

            // Optional fields
            b.Property(x => x.Description).HasMaxLength(500);

            // Indexes
            b.HasIndex(x => x.PatientId);
            b.HasIndex(x => x.UploadedAt);
        });
    }
}
