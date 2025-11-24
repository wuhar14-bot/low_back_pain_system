# PostgreSQL Database Schema Design
## Low Back Pain Data Collection System - .NET 7.0 + ABP vNext 7.3

**更新日期**: 2024-11-14
**状态**: 设计完成
**基于**: SQLite Schema + API Design

---

## 目录
1. [数据库概览](#数据库概览)
2. [核心表设计](#核心表设计)
3. [索引设计](#索引设计)
4. [数据类型映射](#数据类型映射)
5. [迁移策略](#迁移策略)
6. [性能优化](#性能优化)

---

## 数据库概览

### 技术栈
- **数据库**: PostgreSQL 14+
- **连接池**: Npgsql (ADO.NET Provider)
- **ORM**: Entity Framework Core 7.0 (ABP vNext 集成)
- **Schema**: `public` (默认)
- **字符集**: UTF-8

### 连接字符串示例
```
Host=localhost;Port=5432;Database=LowBackPainDb;Username=lbp_user;Password=your_password;
```

---

## 核心表设计

### 1. Patients 表

```sql
CREATE TABLE "Patients" (
    -- Primary Key (ABP Convention)
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Information
    "StudyId" VARCHAR(50),
    "Name" VARCHAR(200),
    "Age" INTEGER,
    "Gender" VARCHAR(20),
    "Phone" VARCHAR(50),
    "OnsetDate" TIMESTAMP,
    "ChiefComplaint" TEXT,

    -- External Relations (from external system)
    "WorkspaceId" UUID NOT NULL,
    "WorkspaceName" VARCHAR(200),
    "DoctorId" UUID NOT NULL,
    "DoctorName" VARCHAR(200),

    -- Clinical Data (JSON columns for flexibility)
    "MedicalHistoryJson" JSONB,
    "PainAreasJson" JSONB,
    "SubjectiveExamJson" JSONB,
    "ObjectiveExamJson" JSONB,
    "FunctionalScoresJson" JSONB,
    "AiPostureAnalysisJson" JSONB,
    "InterventionJson" JSONB,

    -- Additional Notes
    "Remarks" TEXT,

    -- ABP Audit Fields (FullAuditedAggregateRoot)
    "CreationTime" TIMESTAMP NOT NULL DEFAULT NOW(),
    "CreatorId" UUID,
    "LastModificationTime" TIMESTAMP,
    "LastModifierId" UUID,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "DeleterId" UUID,
    "DeletionTime" TIMESTAMP,

    -- Concurrency Token (ABP Convention)
    "ConcurrencyStamp" VARCHAR(40),

    -- Extra Properties (ABP IHasExtraProperties)
    "ExtraProperties" JSONB
);

-- Comments
COMMENT ON TABLE "Patients" IS '患者信息表';
COMMENT ON COLUMN "Patients"."Id" IS '患者唯一标识';
COMMENT ON COLUMN "Patients"."StudyId" IS '研究编号（用户自定义）';
COMMENT ON COLUMN "Patients"."WorkspaceId" IS '工作室ID（外部系统）';
COMMENT ON COLUMN "Patients"."DoctorId" IS '医生ID（外部系统）';
COMMENT ON COLUMN "Patients"."MedicalHistoryJson" IS '病史信息（JSON格式）';
COMMENT ON COLUMN "Patients"."IsDeleted" IS '软删除标记';
```

---

### 2. PatientImages 表

```sql
CREATE TABLE "PatientImages" (
    -- Primary Key
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Key
    "PatientId" UUID NOT NULL,

    -- Image Information
    "ImageType" VARCHAR(50) NOT NULL, -- xray, mri, photo, posture
    "FileName" VARCHAR(500) NOT NULL,
    "FilePath" VARCHAR(1000) NOT NULL,
    "MimeType" VARCHAR(100) NOT NULL,
    "FileSize" BIGINT NOT NULL,
    "Description" TEXT,

    -- ABP Audit Fields (CreationAuditedEntity)
    "CreationTime" TIMESTAMP NOT NULL DEFAULT NOW(),
    "CreatorId" UUID,

    -- Soft Delete
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "DeleterId" UUID,
    "DeletionTime" TIMESTAMP,

    -- Foreign Key Constraint
    CONSTRAINT "FK_PatientImages_Patients"
        FOREIGN KEY ("PatientId")
        REFERENCES "Patients"("Id")
        ON DELETE CASCADE
);

-- Comments
COMMENT ON TABLE "PatientImages" IS '患者图像表';
COMMENT ON COLUMN "PatientImages"."ImageType" IS '图像类型: xray, mri, photo, posture';
COMMENT ON COLUMN "PatientImages"."FilePath" IS '文件存储路径';
```

---

### 3. ExternalTokens 表 (可选)

用于缓存和验证外部系统 Token

```sql
CREATE TABLE "ExternalTokens" (
    -- Primary Key
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Token Information
    "Token" VARCHAR(1000) NOT NULL,
    "WorkspaceId" UUID NOT NULL,
    "DoctorId" UUID NOT NULL,
    "ExpiresAt" TIMESTAMP NOT NULL,

    -- Validation
    "IsValid" BOOLEAN NOT NULL DEFAULT TRUE,
    "LastValidatedAt" TIMESTAMP,

    -- Audit
    "CreationTime" TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Unique Constraint
    CONSTRAINT "UQ_Token" UNIQUE ("Token")
);

-- Comments
COMMENT ON TABLE "ExternalTokens" IS '外部系统Token缓存表';
COMMENT ON COLUMN "ExternalTokens"."Token" IS '外部系统提供的认证Token';
COMMENT ON COLUMN "ExternalTokens"."ExpiresAt" IS 'Token过期时间';
```

---

## 索引设计

### Patients 表索引

```sql
-- Primary Key Index (自动创建)
-- PRIMARY KEY ("Id")

-- Study ID 唯一索引 (防重复)
CREATE UNIQUE INDEX "IX_Patients_StudyId_WorkspaceId"
ON "Patients"("StudyId", "WorkspaceId")
WHERE "IsDeleted" = FALSE;

-- Workspace 查询索引
CREATE INDEX "IX_Patients_WorkspaceId"
ON "Patients"("WorkspaceId")
WHERE "IsDeleted" = FALSE;

-- Doctor 查询索引
CREATE INDEX "IX_Patients_DoctorId"
ON "Patients"("DoctorId")
WHERE "IsDeleted" = FALSE;

-- 创建时间索引 (排序查询)
CREATE INDEX "IX_Patients_CreationTime"
ON "Patients"("CreationTime" DESC)
WHERE "IsDeleted" = FALSE;

-- 姓名搜索索引 (使用 GIN 支持中文全文搜索)
CREATE INDEX "IX_Patients_Name_Gin"
ON "Patients" USING GIN (to_tsvector('simple', "Name"));

-- Soft Delete 索引
CREATE INDEX "IX_Patients_IsDeleted"
ON "Patients"("IsDeleted");

-- JSON 字段索引 (示例：功能评分)
CREATE INDEX "IX_Patients_FunctionalScores_VAS"
ON "Patients" ((("FunctionalScoresJson"->>'vas')::int));
```

### PatientImages 表索引

```sql
-- Foreign Key 索引
CREATE INDEX "IX_PatientImages_PatientId"
ON "PatientImages"("PatientId")
WHERE "IsDeleted" = FALSE;

-- Image Type 索引
CREATE INDEX "IX_PatientImages_ImageType"
ON "PatientImages"("ImageType")
WHERE "IsDeleted" = FALSE;

-- Creation Time 索引
CREATE INDEX "IX_PatientImages_CreationTime"
ON "PatientImages"("CreationTime" DESC);
```

### ExternalTokens 表索引

```sql
-- Token 唯一索引 (已在表定义中)
-- UNIQUE ("Token")

-- Workspace + Doctor 索引
CREATE INDEX "IX_ExternalTokens_WorkspaceId_DoctorId"
ON "ExternalTokens"("WorkspaceId", "DoctorId");

-- 过期时间索引 (清理任务)
CREATE INDEX "IX_ExternalTokens_ExpiresAt"
ON "ExternalTokens"("ExpiresAt");
```

---

## 数据类型映射

### SQLite → PostgreSQL 映射

| SQLite Type | PostgreSQL Type | EF Core Type | 说明 |
|:---|:---|:---|:---|
| TEXT | VARCHAR(n) / TEXT | string | 字符串 |
| TEXT (JSON) | JSONB | string | JSON数据（JSONB性能更好） |
| INTEGER | INTEGER | int | 整数 |
| REAL | DOUBLE PRECISION | double | 浮点数 |
| TEXT (timestamp) | TIMESTAMP | DateTime | 时间戳 |
| TEXT (id) | UUID | Guid | 唯一标识符 |

### JSONB 字段示例

**MedicalHistoryJson**:
```json
{
  "previousTreatment": "曾接受物理治疗",
  "surgicalHistory": "无",
  "medications": ["布洛芬", "对乙酰氨基酚"],
  "allergies": "无"
}
```

**PainAreasJson**:
```json
[
  {
    "area": "lower_back",
    "intensity": 7,
    "description": "钝痛",
    "side": "bilateral"
  },
  {
    "area": "left_leg",
    "intensity": 5,
    "description": "放射痛"
  }
]
```

**FunctionalScoresJson**:
```json
{
  "vas": 7,
  "oswestry": 40,
  "rolandMorris": 12,
  "sf36": {
    "physical": 45,
    "mental": 60
  }
}
```

**AiPostureAnalysisJson**:
```json
{
  "standingTrunkAngle": 85.3,
  "flexionTrunkAngle": 132.7,
  "romDegrees": 47.4,
  "romAssessment": "轻度受限",
  "compensations": "膝关节轻度屈曲",
  "landmarks": [...]
}
```

---

## 迁移策略

### Phase 1: 初始化 PostgreSQL

```bash
# 1. 创建数据库
CREATE DATABASE "LowBackPainDb"
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8';

# 2. 创建用户
CREATE USER lbp_user WITH PASSWORD 'your_secure_password';

# 3. 授权
GRANT ALL PRIVILEGES ON DATABASE "LowBackPainDb" TO lbp_user;

# 4. 切换到目标数据库
\c LowBackPainDb

# 5. 授权 Schema
GRANT ALL ON SCHEMA public TO lbp_user;
```

### Phase 2: ABP Migration

使用 Entity Framework Core Migrations：

```bash
# Add Migration
dotnet ef migrations add InitialCreate

# Update Database
dotnet ef database update
```

### Phase 3: 数据迁移 (SQLite → PostgreSQL)

```sql
-- 迁移脚本示例
INSERT INTO "Patients" (
    "Id",
    "StudyId",
    "Name",
    "Age",
    "Gender",
    "Phone",
    "OnsetDate",
    "ChiefComplaint",
    "WorkspaceId",
    "WorkspaceName",
    "DoctorId",
    "DoctorName",
    "MedicalHistoryJson",
    "PainAreasJson",
    "FunctionalScoresJson",
    "CreationTime",
    "IsDeleted"
)
SELECT
    CAST(id AS UUID),
    study_id,
    name,
    age,
    gender,
    phone,
    CAST(onset_date AS TIMESTAMP),
    chief_complaint,
    CAST(workspace_id AS UUID),
    'Default Workspace',
    CAST('00000000-0000-0000-0000-000000000000' AS UUID),
    'Unknown Doctor',
    CAST(medical_history AS JSONB),
    CAST(pain_areas AS JSONB),
    CAST(functional_scores AS JSONB),
    CAST(created_date AS TIMESTAMP),
    FALSE
FROM sqlite_patients;
```

---

## 性能优化

### 1. JSONB 查询优化

```sql
-- 创建 GIN 索引加速 JSONB 查询
CREATE INDEX "IX_Patients_FunctionalScores_Gin"
ON "Patients" USING GIN ("FunctionalScoresJson");

-- 查询示例
SELECT * FROM "Patients"
WHERE "FunctionalScoresJson" @> '{"vas": 7}';
```

### 2. 分区表 (大数据量场景)

```sql
-- 按创建时间分区 (按年)
CREATE TABLE "Patients_2024" PARTITION OF "Patients"
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE "Patients_2025" PARTITION OF "Patients"
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 3. 物化视图 (统计查询)

```sql
CREATE MATERIALIZED VIEW "PatientStatistics" AS
SELECT
    "WorkspaceId",
    COUNT(*) AS "TotalPatients",
    AVG(("FunctionalScoresJson"->>'vas')::int) AS "AvgVAS",
    COUNT(CASE WHEN ("FunctionalScoresJson"->>'vas')::int >= 7 THEN 1 END) AS "HighPainCount"
FROM "Patients"
WHERE "IsDeleted" = FALSE
GROUP BY "WorkspaceId";

-- 刷新物化视图
REFRESH MATERIALIZED VIEW "PatientStatistics";
```

### 4. 连接池配置

```csharp
// appsettings.json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=LowBackPainDb;Username=lbp_user;Password=xxx;Pooling=true;MinPoolSize=5;MaxPoolSize=100;"
  }
}
```

---

## ABP vNext 配置

### DbContext 配置

```csharp
public class LowBackPainDbContext : AbpDbContext<LowBackPainDbContext>
{
    public DbSet<Patient> Patients { get; set; }
    public DbSet<PatientImage> PatientImages { get; set; }
    public DbSet<ExternalToken> ExternalTokens { get; set; }

    public LowBackPainDbContext(DbContextOptions<LowBackPainDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ConfigureLowBackPain();
    }
}
```

### Entity Configuration

```csharp
public static class LowBackPainDbContextModelCreatingExtensions
{
    public static void ConfigureLowBackPain(this ModelBuilder builder)
    {
        builder.Entity<Patient>(b =>
        {
            b.ToTable("Patients");

            b.ConfigureByConvention(); // ABP Convention

            b.Property(x => x.StudyId).HasMaxLength(50);
            b.Property(x => x.Name).HasMaxLength(200);
            b.Property(x => x.WorkspaceName).HasMaxLength(200);
            b.Property(x => x.DoctorName).HasMaxLength(200);

            // JSONB Columns
            b.Property(x => x.MedicalHistoryJson).HasColumnType("jsonb");
            b.Property(x => x.PainAreasJson).HasColumnType("jsonb");
            b.Property(x => x.FunctionalScoresJson).HasColumnType("jsonb");

            // Indexes
            b.HasIndex(x => new { x.StudyId, x.WorkspaceId })
                .IsUnique()
                .HasFilter("\"IsDeleted\" = false");

            b.HasIndex(x => x.WorkspaceId);
            b.HasIndex(x => x.CreationTime);
        });

        builder.Entity<PatientImage>(b =>
        {
            b.ToTable("PatientImages");

            b.ConfigureByConvention();

            b.Property(x => x.FileName).HasMaxLength(500).IsRequired();
            b.Property(x => x.FilePath).HasMaxLength(1000).IsRequired();

            // Foreign Key
            b.HasOne<Patient>()
                .WithMany(x => x.Images)
                .HasForeignKey(x => x.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasIndex(x => x.PatientId);
        });
    }
}
```

---

## 备份策略

### 1. 逻辑备份 (pg_dump)

```bash
# 备份整个数据库
pg_dump -U lbp_user -d LowBackPainDb -F c -f backup_$(date +%Y%m%d).dump

# 恢复
pg_restore -U lbp_user -d LowBackPainDb backup_20241114.dump
```

### 2. 物理备份 (pg_basebackup)

```bash
# 基础备份
pg_basebackup -U lbp_user -D /backup/base -F tar -z -P
```

### 3. 定时备份脚本

```bash
#!/bin/bash
# backup_cron.sh
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U lbp_user -d LowBackPainDb -F c -f "$BACKUP_DIR/lbp_$DATE.dump"

# 保留最近30天的备份
find $BACKUP_DIR -name "lbp_*.dump" -mtime +30 -delete
```

---

## 监控查询

### 1. 查看表大小

```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2. 慢查询分析

```sql
-- 启用慢查询日志
ALTER DATABASE "LowBackPainDb" SET log_min_duration_statement = 1000; -- 1秒

-- 查看慢查询
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 安全配置

### 1. 行级安全 (Row-Level Security)

```sql
-- 启用 RLS
ALTER TABLE "Patients" ENABLE ROW LEVEL SECURITY;

-- 创建策略（示例：只能访问自己工作室的数据）
CREATE POLICY "workspace_isolation" ON "Patients"
FOR ALL
USING ("WorkspaceId" = current_setting('app.current_workspace_id')::uuid);
```

### 2. 敏感数据加密

```sql
-- 使用 pgcrypto 扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 加密存储（示例）
UPDATE "Patients"
SET "Phone" = pgp_sym_encrypt("Phone", 'encryption_key');
```

---

**下一步**: 创建 ABP vNext 项目并配置 PostgreSQL 连接
