using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;
using LowBackPainSystem.Patients;
using LowBackPainSystem.Workspaces;
using LowBackPainSystem.Doctors;

namespace LowBackPainSystem.EntityFrameworkCore
{
    /// <summary>
    /// 数据库上下文
    /// Database Context
    /// </summary>
    [ConnectionStringName("Default")]
    public class LowBackPainDbContext : AbpDbContext<LowBackPainDbContext>
    {
        #region DbSets

        public DbSet<Patient> Patients { get; set; }
        public DbSet<Workspace> Workspaces { get; set; }
        public DbSet<Doctor> Doctors { get; set; }

        #endregion

        public LowBackPainDbContext(DbContextOptions<LowBackPainDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // 配置表名和架构
            builder.ConfigureLowBackPain();
        }
    }

    /// <summary>
    /// 数据库模型配置扩展
    /// </summary>
    public static class LowBackPainDbContextModelCreatingExtensions
    {
        public static void ConfigureLowBackPain(this ModelBuilder builder)
        {
            // 配置 Patient 实体
            builder.Entity<Patient>(b =>
            {
                b.ToTable("patients");

                // 主键
                b.HasKey(p => p.Id);

                // 索引
                b.HasIndex(p => p.StudyId);
                b.HasIndex(p => p.WorkspaceId);
                b.HasIndex(p => p.DoctorId);
                b.HasIndex(p => p.CreationTime);

                // 字段配置
                b.Property(p => p.StudyId).HasMaxLength(50);
                b.Property(p => p.Name).HasMaxLength(100);
                b.Property(p => p.Gender).HasMaxLength(10);
                b.Property(p => p.Phone).HasMaxLength(20);
                b.Property(p => p.ChiefComplaint).HasColumnType("text");
                b.Property(p => p.MedicalHistory).HasColumnType("text");
                b.Property(p => p.PainAreasJson)
                    .HasColumnName("pain_areas")
                    .HasColumnType("jsonb");
                b.Property(p => p.SubjectiveExam).HasColumnType("text");
                b.Property(p => p.ObjectiveExam).HasColumnType("text");
                b.Property(p => p.FunctionalScoresJson)
                    .HasColumnName("functional_scores")
                    .HasColumnType("jsonb");
                b.Property(p => p.Intervention).HasColumnType("text");
                b.Property(p => p.AiPostureAnalysisJson)
                    .HasColumnName("ai_posture_analysis")
                    .HasColumnType("jsonb");
                b.Property(p => p.Remarks).HasColumnType("text");
                b.Property(p => p.DataJson)
                    .HasColumnName("data_json")
                    .HasColumnType("jsonb");

                // ABP审计字段使用snake_case命名
                b.Property(p => p.CreationTime).HasColumnName("creation_time");
                b.Property(p => p.CreatorId).HasColumnName("creator_id");
                b.Property(p => p.LastModificationTime).HasColumnName("last_modification_time");
                b.Property(p => p.LastModifierId).HasColumnName("last_modifier_id");
                b.Property(p => p.IsDeleted).HasColumnName("is_deleted");
                b.Property(p => p.DeleterId).HasColumnName("deleter_id");
                b.Property(p => p.DeletionTime).HasColumnName("deletion_time");
            });

            // 配置 Workspace 实体
            builder.Entity<Workspace>(b =>
            {
                b.ToTable("workspaces");

                b.HasKey(w => w.Id);
                b.HasIndex(w => w.Code).IsUnique();

                b.Property(w => w.Name).IsRequired().HasMaxLength(200);
                b.Property(w => w.Code).IsRequired().HasMaxLength(50);
                b.Property(w => w.Description).HasColumnType("text");

                b.Property(w => w.CreationTime).HasColumnName("creation_time");
                b.Property(w => w.CreatorId).HasColumnName("creator_id");
                b.Property(w => w.LastModificationTime).HasColumnName("last_modification_time");
                b.Property(w => w.LastModifierId).HasColumnName("last_modifier_id");
                b.Property(w => w.IsDeleted).HasColumnName("is_deleted");
                b.Property(w => w.DeleterId).HasColumnName("deleter_id");
                b.Property(w => w.DeletionTime).HasColumnName("deletion_time");
            });

            // 配置 Doctor 实体
            builder.Entity<Doctor>(b =>
            {
                b.ToTable("doctors");

                b.HasKey(d => d.Id);
                b.HasIndex(d => d.WorkspaceId);
                b.HasIndex(d => d.EmployeeId);

                b.Property(d => d.Name).IsRequired().HasMaxLength(100);
                b.Property(d => d.EmployeeId).HasMaxLength(50);
                b.Property(d => d.Specialty).HasMaxLength(100);
                b.Property(d => d.Phone).HasMaxLength(20);
                b.Property(d => d.Email).HasMaxLength(100);

                b.Property(d => d.CreationTime).HasColumnName("creation_time");
                b.Property(d => d.CreatorId).HasColumnName("creator_id");
                b.Property(d => d.LastModificationTime).HasColumnName("last_modification_time");
                b.Property(d => d.LastModifierId).HasColumnName("last_modifier_id");
                b.Property(d => d.IsDeleted).HasColumnName("is_deleted");
                b.Property(d => d.DeleterId).HasColumnName("deleter_id");
                b.Property(d => d.DeletionTime).HasColumnName("deletion_time");
            });
        }
    }
}
