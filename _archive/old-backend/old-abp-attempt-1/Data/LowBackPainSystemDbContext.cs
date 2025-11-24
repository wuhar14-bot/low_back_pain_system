using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using LowBackPainSystem.Entities;

namespace LowBackPainSystem.Data;

public class LowBackPainSystemDbContext : AbpDbContext<LowBackPainSystemDbContext>
{
    // Custom DbSets
    public DbSet<Patient> Patients { get; set; }
    public DbSet<Doctor> Doctors { get; set; }
    public DbSet<Workspace> Workspaces { get; set; }

    public LowBackPainSystemDbContext(DbContextOptions<LowBackPainSystemDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureAuditLogging();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureFeatureManagement();
        builder.ConfigureTenantManagement();

        /* Configure your own entities here */

        builder.Entity<Workspace>(b =>
        {
            b.ToTable("workspaces");
            b.HasKey(x => x.Id);

            // Map to database columns
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.Name).HasColumnName("name").IsRequired().HasMaxLength(128);
            b.Property(x => x.Code).HasColumnName("code").IsRequired().HasMaxLength(64);
            b.Property(x => x.IsActive).HasColumnName("is_active");
            b.Property(x => x.Description).HasColumnName("description");

            // Audit fields
            b.Property(x => x.CreationTime).HasColumnName("creation_time");
            b.Property(x => x.CreatorId).HasColumnName("creator_id");
            b.Property(x => x.LastModificationTime).HasColumnName("last_modification_time");
            b.Property(x => x.LastModifierId).HasColumnName("last_modifier_id");
            b.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            b.Property(x => x.DeleterId).HasColumnName("deleter_id");
            b.Property(x => x.DeletionTime).HasColumnName("deletion_time");

            // Ignore ABP properties not in database
            b.Ignore(x => x.ConcurrencyStamp);
            b.Ignore(x => x.ExtraProperties);

            b.HasIndex(x => x.Code).IsUnique();
        });

        builder.Entity<Doctor>(b =>
        {
            b.ToTable("doctors");
            b.HasKey(x => x.Id);

            // Map to database columns
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.WorkspaceId).HasColumnName("workspace_id");
            b.Property(x => x.Name).HasColumnName("name").IsRequired().HasMaxLength(128);
            b.Property(x => x.EmployeeId).HasColumnName("employee_id").HasMaxLength(64);
            b.Property(x => x.Specialty).HasColumnName("specialty").HasMaxLength(128);
            b.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(32);
            b.Property(x => x.Email).HasColumnName("email").HasMaxLength(128);
            b.Property(x => x.IsActive).HasColumnName("is_active");

            // Audit fields
            b.Property(x => x.CreationTime).HasColumnName("creation_time");
            b.Property(x => x.CreatorId).HasColumnName("creator_id");
            b.Property(x => x.LastModificationTime).HasColumnName("last_modification_time");
            b.Property(x => x.LastModifierId).HasColumnName("last_modifier_id");
            b.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            b.Property(x => x.DeleterId).HasColumnName("deleter_id");
            b.Property(x => x.DeletionTime).HasColumnName("deletion_time");

            // Ignore ABP properties not in database
            b.Ignore(x => x.ConcurrencyStamp);
            b.Ignore(x => x.ExtraProperties);
        });

        builder.Entity<Patient>(b =>
        {
            b.ToTable("patients");
            b.HasKey(x => x.Id);

            // Map property names to database column names (snake_case)
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.StudyId).HasColumnName("study_id").HasMaxLength(64);
            b.Property(x => x.WorkspaceId).HasColumnName("workspace_id");
            b.Property(x => x.DoctorId).HasColumnName("doctor_id");
            b.Property(x => x.Name).HasColumnName("name").HasMaxLength(128);
            b.Property(x => x.Gender).HasColumnName("gender").HasMaxLength(16);
            b.Property(x => x.Age).HasColumnName("age");
            b.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(32);
            b.Property(x => x.OnsetDate).HasColumnName("onset_date");
            b.Property(x => x.ChiefComplaint).HasColumnName("chief_complaint").HasMaxLength(512);
            b.Property(x => x.MedicalHistory).HasColumnName("medical_history").HasMaxLength(2048);
            b.Property(x => x.SubjectiveExam).HasColumnName("subjective_exam").HasMaxLength(2048);
            b.Property(x => x.ObjectiveExam).HasColumnName("objective_exam").HasMaxLength(2048);
            b.Property(x => x.Intervention).HasColumnName("intervention").HasMaxLength(2048);
            b.Property(x => x.Remarks).HasColumnName("remarks").HasMaxLength(2048);

            // JSON fields mapped to jsonb columns
            b.Property(x => x.PainAreasJson).HasColumnName("pain_areas").HasColumnType("jsonb");
            b.Property(x => x.FunctionalScoresJson).HasColumnName("functional_scores").HasColumnType("jsonb");
            b.Property(x => x.AiPostureAnalysisJson).HasColumnName("ai_posture_analysis").HasColumnType("jsonb");
            b.Property(x => x.DataJson).HasColumnName("data_json").HasColumnType("jsonb");

            // Audit fields
            b.Property(x => x.CreationTime).HasColumnName("creation_time");
            b.Property(x => x.CreatorId).HasColumnName("creator_id");
            b.Property(x => x.LastModificationTime).HasColumnName("last_modification_time");
            b.Property(x => x.LastModifierId).HasColumnName("last_modifier_id");
            b.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            b.Property(x => x.DeleterId).HasColumnName("deleter_id");
            b.Property(x => x.DeletionTime).HasColumnName("deletion_time");

            // Ignore ABP properties not in database
            b.Ignore(x => x.ConcurrencyStamp);
            b.Ignore(x => x.ExtraProperties);
        });
    }
}
