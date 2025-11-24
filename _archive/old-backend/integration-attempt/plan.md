# Low Back Pain System Integration Plan
## 集成到 ABP vNext 7.3 系统计划

**Target System:**
- Backend: .NET 7.0 + ABP Framework v7.3
- Database: PostgreSQL
- Frontend: Vue.js (SPA) + Element UI

**Source System:**
- Backend: Python Flask (3 microservices)
- Database: SQLite 3
- Frontend: React + Vite + shadcn/ui

**Integration Goal:** 将低腰痛数据收集系统作为模块集成到现有 ABP 系统中

---

## 📋 Table of Contents

1. [Integration Architecture](#integration-architecture)
2. [Database Migration](#database-migration)
3. [Backend Integration](#backend-integration)
4. [Frontend Integration](#frontend-integration)
5. [Authentication & Authorization](#authentication--authorization)
6. [Microservices Integration](#microservices-integration)
7. [Deployment Strategy](#deployment-strategy)
8. [Testing Plan](#testing-plan)
9. [Timeline & Milestones](#timeline--milestones)

---

## 1. Integration Architecture

### 1.1 Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ABP vNext System                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                Vue.js Frontend                        │  │
│  │              (Element UI Components)                  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Low Back Pain Module (React Components)       │  │  │
│  │  │  - 嵌入为 Web Component 或 iframe              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │           ABP Backend (.NET 7.0)                     │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  LowBackPain.Application Module              │  │  │
│  │  │  - PatientAppService                          │  │  │
│  │  │  - WorkspaceAppService                        │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  LowBackPain.Domain Module                   │  │  │
│  │  │  - Patient Entity                             │  │  │
│  │  │  - Workspace Entity                           │  │  │
│  │  │  - Repositories                               │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  LowBackPain.EntityFrameworkCore             │  │  │
│  │  │  - EF Core DbContext                          │  │  │
│  │  │  - Repository Implementations                 │  │  │
│  │  └────────────────┬─────────────────────────────┘  │  │
│  └───────────────────┼─────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │               PostgreSQL Database                     │  │
│  │  - PatientRecords Table                               │  │
│  │  - Workspaces Table                                   │  │
│  │  - (ABP standard tables: Users, Roles, etc.)          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

External Python Microservices (可保持独立):
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ OCR Service  │  │ Pose Service │  │ LLM Service  │
│   :5001      │  │   :5002      │  │   :5004      │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 1.2 Integration Approach

**Option A: Modular Integration (推荐)**
- 将 Low Back Pain System 作为 ABP 模块开发
- 前端 React 组件通过 Web Components 或 iframe 嵌入 Vue 应用
- Python 微服务保持独立，通过 HTTP API 调用

**Option B: Full Rewrite**
- 前端完全用 Vue + Element UI 重写
- 后端用 .NET 重写所有逻辑
- Python 服务用 C# 重新实现或集成 ML.NET

**Recommendation:** Option A - 保留现有 Python AI 服务，减少开发成本

---

## 2. Database Migration

### 2.1 SQLite → PostgreSQL Migration

#### 2.1.1 Schema Design for PostgreSQL

**ABP Entity Base Classes Integration:**

```csharp
// Domain/Entities/PatientRecord.cs
using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace LowBackPain.Domain.Entities
{
    public class PatientRecord : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        // ABP Standard Fields (auto-managed)
        public Guid? TenantId { get; set; }
        // CreationTime, CreatorId (from FullAuditedAggregateRoot)
        // LastModificationTime, LastModifierId
        // DeletionTime, DeleterId, IsDeleted (soft delete)

        // Patient Basic Info (Required)
        public string StudyId { get; set; }  // 研究编号
        public string Gender { get; set; }   // 性别: "男"/"女"
        public int Age { get; set; }         // 年龄

        // Patient Basic Info (Optional)
        public string Name { get; set; }     // 患者姓名 (可匿名)
        public string Phone { get; set; }    // 联系电话

        // Medical History
        public DateTime? OnsetDate { get; set; }        // 首次发作日期
        public string ChiefComplaint { get; set; }      // 主诉 (大文本)
        public string MedicalHistory { get; set; }      // 病史 (JSON)
        public string PainAreas { get; set; }           // 疼痛区域 (JSON array)

        // Clinical Examination
        public string SubjectiveExam { get; set; }      // 主观检查 (JSON)
        public string ObjectiveExam { get; set; }       // 客观检查 (JSON)
        public string FunctionalScores { get; set; }    // 功能评分 (JSON)
        public string Intervention { get; set; }        // 干预措施 (JSON)

        // AI Analysis Results
        public string AiPostureAnalysis { get; set; }   // AI姿态分析 (JSON)

        // Additional Metadata
        public string Remarks { get; set; }             // 备注
        public string LastSyncTimestamp { get; set; }   // 最后同步时间
        public Guid? WorkspaceId { get; set; }          // 工作区ID

        // Full Data Backup
        public string DataJson { get; set; }            // 完整数据备份 (JSON)

        // Navigation Properties
        public virtual Workspace Workspace { get; set; }
    }
}
```

**Workspace/Studio Integration:**

⚠️ **注意：现有系统已有工作室管理，无需创建新的 Workspace entity**

- 直接使用 ABP 的 `TenantId` 字段关联到现有工作室
- 如需工作室信息，通过 ABP 的 ITenantRepository 查询
- PatientRecord 的 `WorkspaceId` 字段改为可选，优先使用 `TenantId`

#### 2.1.2 Migration SQL Script

```sql
-- 1. Create PatientRecords table
CREATE TABLE "PatientRecords" (
    -- Primary Key
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ABP Auditing Fields
    "CreationTime" TIMESTAMP NOT NULL DEFAULT NOW(),
    "CreatorId" UUID,
    "LastModificationTime" TIMESTAMP,
    "LastModifierId" UUID,
    "DeletionTime" TIMESTAMP,
    "DeleterId" UUID,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE,

    -- Multi-Tenancy
    "TenantId" UUID,

    -- Required Fields
    "StudyId" VARCHAR(100) NOT NULL,
    "Gender" VARCHAR(10) NOT NULL CHECK ("Gender" IN ('男', '女')),
    "Age" INTEGER NOT NULL CHECK ("Age" >= 0 AND "Age" <= 150),

    -- Optional Basic Info
    "Name" VARCHAR(200),
    "Phone" VARCHAR(50),

    -- Medical History
    "OnsetDate" DATE,
    "ChiefComplaint" TEXT,
    "MedicalHistory" JSONB,
    "PainAreas" JSONB,

    -- Clinical Examination (JSONB for better query performance)
    "SubjectiveExam" JSONB,
    "ObjectiveExam" JSONB,
    "FunctionalScores" JSONB,
    "Intervention" JSONB,

    -- AI Analysis
    "AiPostureAnalysis" JSONB,

    -- Metadata
    "Remarks" TEXT,
    "LastSyncTimestamp" TIMESTAMP,
    "WorkspaceId" UUID,

    -- Full Backup
    "DataJson" JSONB,

    -- Foreign Keys
    CONSTRAINT "FK_PatientRecords_Workspaces_WorkspaceId"
        FOREIGN KEY ("WorkspaceId")
        REFERENCES "Workspaces"("Id")
        ON DELETE SET NULL
);

-- 2. Create Indexes
CREATE INDEX "IX_PatientRecords_StudyId" ON "PatientRecords"("StudyId");
CREATE INDEX "IX_PatientRecords_CreationTime" ON "PatientRecords"("CreationTime");
CREATE INDEX "IX_PatientRecords_WorkspaceId" ON "PatientRecords"("WorkspaceId");
CREATE INDEX "IX_PatientRecords_TenantId" ON "PatientRecords"("TenantId");
CREATE INDEX "IX_PatientRecords_IsDeleted" ON "PatientRecords"("IsDeleted");

-- 3. JSONB Indexes for common queries
CREATE INDEX "IX_PatientRecords_SubjectiveExam_PainScore"
    ON "PatientRecords" USING GIN (("SubjectiveExam"->'pain_score'));

CREATE INDEX "IX_PatientRecords_PainAreas"
    ON "PatientRecords" USING GIN ("PainAreas");

-- 4. 不需要创建 Workspaces table
-- 使用现有 ABP 系统的 Tenants/Studios 表
-- PatientRecords 通过 TenantId 字段关联到现有工作室系统
```

#### 2.1.3 Data Migration Script

**Python Migration Script: `migrate_sqlite_to_postgresql.py`**

```python
import sqlite3
import psycopg2
import json
from datetime import datetime
from uuid import uuid4

def migrate_data():
    # Connect to SQLite
    sqlite_conn = sqlite3.connect('backend/low_back_pain.db')
    sqlite_cursor = sqlite_conn.cursor()

    # Connect to PostgreSQL
    pg_conn = psycopg2.connect(
        host='localhost',
        database='abp_database',
        user='postgres',
        password='your_password'
    )
    pg_cursor = pg_conn.cursor()

    # Fetch all patients from SQLite
    sqlite_cursor.execute("SELECT * FROM patients")
    patients = sqlite_cursor.fetchall()

    for patient in patients:
        # Map SQLite fields to PostgreSQL
        patient_id = str(uuid4())
        study_id = patient[1]  # study_id from SQLite
        name = patient[2]
        gender = patient[3]
        age = patient[4]
        # ... map other fields

        # Insert into PostgreSQL
        pg_cursor.execute("""
            INSERT INTO "PatientRecords" (
                "Id", "StudyId", "Name", "Gender", "Age",
                "CreationTime", "IsDeleted",
                "ChiefComplaint", "MedicalHistory", "PainAreas",
                "SubjectiveExam", "ObjectiveExam",
                "FunctionalScores", "Intervention",
                "AiPostureAnalysis", "Remarks", "DataJson"
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        """, (
            patient_id, study_id, name, gender, age,
            datetime.now(), False,
            # Convert TEXT to JSONB where needed
            patient[7],  # chief_complaint
            patient[8],  # medical_history (JSON string → JSONB)
            patient[9],  # pain_areas (JSON string → JSONB)
            # ... other fields
        ))

    pg_conn.commit()
    print(f"Migrated {len(patients)} patients successfully")

    sqlite_conn.close()
    pg_conn.close()

if __name__ == "__main__":
    migrate_data()
```

---

## 3. Backend Integration

### 3.1 ABP Module Structure

```
LowBackPain/
├── src/
│   ├── LowBackPain.Domain/
│   │   ├── Entities/
│   │   │   ├── PatientRecord.cs
│   │   │   └── Workspace.cs
│   │   ├── Repositories/
│   │   │   ├── IPatientRecordRepository.cs
│   │   │   └── IWorkspaceRepository.cs
│   │   └── LowBackPainDomainModule.cs
│   │
│   ├── LowBackPain.Application.Contracts/
│   │   ├── Patients/
│   │   │   ├── IPatientAppService.cs
│   │   │   ├── CreatePatientDto.cs
│   │   │   ├── UpdatePatientDto.cs
│   │   │   └── PatientDto.cs
│   │   ├── Workspaces/
│   │   │   ├── IWorkspaceAppService.cs
│   │   │   └── WorkspaceDto.cs
│   │   └── LowBackPainApplicationContractsModule.cs
│   │
│   ├── LowBackPain.Application/
│   │   ├── Patients/
│   │   │   └── PatientAppService.cs
│   │   ├── Workspaces/
│   │   │   └── WorkspaceAppService.cs
│   │   └── LowBackPainApplicationModule.cs
│   │
│   ├── LowBackPain.EntityFrameworkCore/
│   │   ├── EntityFrameworkCore/
│   │   │   ├── LowBackPainDbContext.cs
│   │   │   └── LowBackPainDbContextModelCreatingExtensions.cs
│   │   ├── Repositories/
│   │   │   ├── PatientRecordRepository.cs
│   │   │   └── WorkspaceRepository.cs
│   │   └── LowBackPainEntityFrameworkCoreModule.cs
│   │
│   └── LowBackPain.HttpApi/
│       ├── Controllers/
│       │   ├── PatientController.cs
│       │   └── WorkspaceController.cs
│       └── LowBackPainHttpApiModule.cs
│
└── test/
    ├── LowBackPain.Domain.Tests/
    ├── LowBackPain.Application.Tests/
    └── LowBackPain.EntityFrameworkCore.Tests/
```

### 3.2 Key Implementation Files

#### 3.2.1 Application Service

```csharp
// Application/Patients/PatientAppService.cs
using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace LowBackPain.Application.Patients
{
    public class PatientAppService : CrudAppService<
        PatientRecord,
        PatientDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreatePatientDto,
        UpdatePatientDto>
    {
        private readonly IRepository<PatientRecord, Guid> _patientRepository;

        public PatientAppService(
            IRepository<PatientRecord, Guid> repository)
            : base(repository)
        {
            _patientRepository = repository;
        }

        // Additional custom methods
        public async Task<PatientDto> GetByStudyIdAsync(string studyId)
        {
            var patient = await _patientRepository
                .FirstOrDefaultAsync(p => p.StudyId == studyId);

            return ObjectMapper.Map<PatientRecord, PatientDto>(patient);
        }

        public async Task<ListResultDto<PatientDto>> GetPatientsByWorkspaceAsync(Guid workspaceId)
        {
            var patients = await _patientRepository
                .GetListAsync(p => p.WorkspaceId == workspaceId);

            return new ListResultDto<PatientDto>(
                ObjectMapper.Map<List<PatientRecord>, List<PatientDto>>(patients)
            );
        }
    }
}
```

#### 3.2.2 DTO Definitions

```csharp
// Application.Contracts/Patients/PatientDto.cs
using System;
using Volo.Abp.Application.Dtos;

namespace LowBackPain.Application.Contracts.Patients
{
    public class PatientDto : FullAuditedEntityDto<Guid>
    {
        public string StudyId { get; set; }
        public string Name { get; set; }
        public string Gender { get; set; }
        public int Age { get; set; }
        public string Phone { get; set; }

        public DateTime? OnsetDate { get; set; }
        public string ChiefComplaint { get; set; }

        // JSON fields as strings (front-end will parse)
        public string MedicalHistory { get; set; }
        public string PainAreas { get; set; }
        public string SubjectiveExam { get; set; }
        public string ObjectiveExam { get; set; }
        public string FunctionalScores { get; set; }
        public string Intervention { get; set; }
        public string AiPostureAnalysis { get; set; }

        public string Remarks { get; set; }
        public Guid? WorkspaceId { get; set; }
        public string WorkspaceName { get; set; }
    }

    public class CreatePatientDto
    {
        [Required]
        [StringLength(100)]
        public string StudyId { get; set; }

        [Required]
        public string Gender { get; set; }

        [Required]
        [Range(0, 150)]
        public int Age { get; set; }

        // ... other fields
    }
}
```

#### 3.2.3 DbContext Configuration

```csharp
// EntityFrameworkCore/LowBackPainDbContext.cs
using Microsoft.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;

namespace LowBackPain.EntityFrameworkCore
{
    public class LowBackPainDbContext : AbpDbContext<LowBackPainDbContext>
    {
        public DbSet<PatientRecord> PatientRecords { get; set; }
        public DbSet<Workspace> Workspaces { get; set; }

        public LowBackPainDbContext(
            DbContextOptions<LowBackPainDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ConfigureLowBackPain();
        }
    }
}

// EntityFrameworkCore/LowBackPainDbContextModelCreatingExtensions.cs
public static class LowBackPainDbContextModelCreatingExtensions
{
    public static void ConfigureLowBackPain(
        this ModelBuilder builder)
    {
        builder.Entity<PatientRecord>(b =>
        {
            b.ToTable("PatientRecords");

            b.ConfigureByConvention(); // ABP standard fields

            // Required fields
            b.Property(x => x.StudyId).IsRequired().HasMaxLength(100);
            b.Property(x => x.Gender).IsRequired().HasMaxLength(10);
            b.Property(x => x.Age).IsRequired();

            // JSON columns (PostgreSQL JSONB)
            b.Property(x => x.MedicalHistory).HasColumnType("jsonb");
            b.Property(x => x.PainAreas).HasColumnType("jsonb");
            b.Property(x => x.SubjectiveExam).HasColumnType("jsonb");
            b.Property(x => x.ObjectiveExam).HasColumnType("jsonb");
            b.Property(x => x.FunctionalScores).HasColumnType("jsonb");
            b.Property(x => x.Intervention).HasColumnType("jsonb");
            b.Property(x => x.AiPostureAnalysis).HasColumnType("jsonb");
            b.Property(x => x.DataJson).HasColumnType("jsonb");

            // Indexes
            b.HasIndex(x => x.StudyId);
            b.HasIndex(x => x.WorkspaceId);

            // Relationships
            b.HasOne(x => x.Workspace)
             .WithMany(w => w.Patients)
             .HasForeignKey(x => x.WorkspaceId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<Workspace>(b =>
        {
            b.ToTable("Workspaces");
            b.ConfigureByConvention();

            b.Property(x => x.Name).IsRequired().HasMaxLength(200);
        });
    }
}
```

---

## 4. Frontend Integration

### 4.1 Integration Approach

**Option 1: Web Components (推荐)**

将 React 应用打包为 Web Components，嵌入 Vue 应用：

```javascript
// React App - Build as Web Component
import React from 'react';
import ReactDOM from 'react-dom';
import PatientForm from './components/PatientForm';

class LowBackPainWidget extends HTMLElement {
  connectedCallback() {
    const mountPoint = document.createElement('div');
    this.attachShadow({ mode: 'open' }).appendChild(mountPoint);

    ReactDOM.render(
      <PatientForm />,
      mountPoint
    );
  }
}

customElements.define('low-back-pain-widget', LowBackPainWidget);
```

```vue
<!-- Vue Application -->
<template>
  <div>
    <el-card>
      <low-back-pain-widget
        :api-endpoint="apiEndpoint"
        :auth-token="authToken"
      />
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      apiEndpoint: '/api/patients',
      authToken: this.$store.state.auth.token
    };
  },
  mounted() {
    // Load Web Component script
    const script = document.createElement('script');
    script.src = '/modules/low-back-pain/widget.js';
    document.head.appendChild(script);
  }
};
</script>
```

**Option 2: iframe Embedding**

```vue
<template>
  <el-card>
    <iframe
      ref="lowBackPainFrame"
      :src="iframeUrl"
      frameborder="0"
      style="width: 100%; height: 800px;"
    />
  </el-card>
</template>

<script>
export default {
  computed: {
    iframeUrl() {
      return `/modules/low-back-pain?token=${this.authToken}`;
    }
  },
  mounted() {
    // Listen for messages from iframe
    window.addEventListener('message', this.handleIframeMessage);
  },
  methods: {
    handleIframeMessage(event) {
      if (event.data.type === 'PATIENT_CREATED') {
        this.$message.success('患者创建成功');
        this.refreshPatientList();
      }
    }
  }
};
</script>
```

### 4.2 Build Configuration

**Vite Build for Production:**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/modules/low-back-pain',
    lib: {
      entry: 'src/main.tsx',
      name: 'LowBackPainWidget',
      fileName: 'widget',
      formats: ['iife'] // For Web Components
    },
    rollupOptions: {
      external: [], // Bundle all dependencies
      output: {
        inlineDynamicImports: true
      }
    }
  }
});
```

---

## 5. Authentication & Authorization

### 5.1 Use Existing ABP Authentication System

**重要说明：** 现有系统已有完整的登录和工作室管理系统，无需重新开发。

**Integration Strategy:**
- ✅ 使用现有 ABP 用户系统 (AbpUsers table)
- ✅ 使用现有工作室/租户系统 (不需要新建 Workspace entity)
- ✅ PatientRecord 直接关联到 ABP 的 TenantId
- ✅ 使用现有 JWT Token 认证

### 5.2 JWT Token Integration

现有 ABP 系统生成 JWT Token → 传递给 React 组件 → React 组件调用 API

```csharp
// .NET Backend - PatientController.cs
[Authorize]
[Route("api/low-back-pain/patients")]
public class PatientController : AbpController
{
    private readonly IPatientAppService _patientAppService;

    public PatientController(IPatientAppService patientAppService)
    {
        _patientAppService = patientAppService;
    }

    [HttpGet]
    public async Task<PagedResultDto<PatientDto>> GetListAsync(
        [FromQuery] PagedAndSortedResultRequestDto input)
    {
        return await _patientAppService.GetListAsync(input);
    }

    [HttpPost]
    [Authorize(LowBackPainPermissions.Patients.Create)]
    public async Task<PatientDto> CreateAsync(
        [FromBody] CreatePatientDto input)
    {
        return await _patientAppService.CreateAsync(input);
    }
}
```

**Permission Definitions:**

```csharp
// Application.Contracts/Permissions/LowBackPainPermissions.cs
public static class LowBackPainPermissions
{
    public const string GroupName = "LowBackPain";

    public static class Patients
    {
        public const string Default = GroupName + ".Patients";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
}
```

### 5.2 React Component Authentication

```typescript
// React - API Client with JWT
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/low-back-pain',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to all requests
apiClient.interceptors.request.use(config => {
  const token = window.parent.getAuthToken(); // Get from parent Vue app
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## 6. Microservices Integration

### 6.1 Python Services as External APIs

保持 Python 微服务独立运行，通过 HTTP API 调用：

```
ABP Backend (.NET)  →  HTTP Proxy  →  Python Services
                         ↓
                    OCR Service (5001)
                    Pose Service (5002)
                    LLM Service (5004)
```

**Implementation:**

```csharp
// Application/Services/OcrProxyService.cs
public class OcrProxyService : ITransientDependency
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public OcrProxyService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<OcrResultDto> ProcessImageAsync(
        IFormFile imageFile)
    {
        var ocrServiceUrl = _configuration["PythonServices:OcrUrl"];

        using var content = new MultipartFormDataContent();
        using var fileContent = new StreamContent(imageFile.OpenReadStream());
        content.Add(fileContent, "image", imageFile.FileName);

        var response = await _httpClient.PostAsync(
            $"{ocrServiceUrl}/ocr/process",
            content
        );

        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadAsStringAsync();

        return JsonSerializer.Deserialize<OcrResultDto>(result);
    }
}

// appsettings.json
{
  "PythonServices": {
    "OcrUrl": "http://localhost:5001",
    "PoseUrl": "http://localhost:5002",
    "LlmUrl": "http://localhost:5004"
  }
}
```

### 6.2 Docker Compose Deployment

```yaml
# docker-compose.yml
version: '3.8'

services:
  abp-backend:
    image: abp-backend:latest
    ports:
      - "5000:80"
    environment:
      - ConnectionStrings__Default=Host=postgres;Database=abp_db;Username=postgres;Password=pass
      - PythonServices__OcrUrl=http://ocr-service:5001
      - PythonServices__PoseUrl=http://pose-service:5002
    depends_on:
      - postgres
      - ocr-service
      - pose-service

  ocr-service:
    image: low-back-pain-ocr:latest
    ports:
      - "5001:5001"
    environment:
      - FLASK_ENV=production

  pose-service:
    image: low-back-pain-pose:latest
    ports:
      - "5002:5002"
    environment:
      - FLASK_ENV=production

  postgres:
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=abp_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 7. Deployment Strategy

### 7.1 Development Environment

```
Local Development:
- ABP Backend: http://localhost:5000
- Vue Frontend: http://localhost:8080
- React Module: http://localhost:5173
- OCR Service: http://localhost:5001
- Pose Service: http://localhost:5002
```

### 7.2 Production Environment

```
Production:
- Reverse Proxy (Nginx)
  ├── /api/* → ABP Backend (IIS/Kestrel)
  ├── /modules/low-back-pain/* → React Static Files
  ├── /ocr/* → OCR Service (Gunicorn)
  └── /pose/* → Pose Service (Gunicorn)
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name app.example.com;

    # Vue Frontend
    location / {
        root /var/www/vue-app;
        try_files $uri $uri/ /index.html;
    }

    # ABP Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # React Module Static Files
    location /modules/low-back-pain/ {
        root /var/www/;
        try_files $uri $uri/ =404;
    }

    # OCR Service
    location /ocr/ {
        proxy_pass http://localhost:5001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Pose Service
    location /pose/ {
        proxy_pass http://localhost:5002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 8. Testing Plan

### 8.1 Unit Tests

```csharp
// Test/Application.Tests/Patients/PatientAppService_Tests.cs
public class PatientAppService_Tests : LowBackPainApplicationTestBase
{
    private readonly IPatientAppService _patientAppService;

    public PatientAppService_Tests()
    {
        _patientAppService = GetRequiredService<IPatientAppService>();
    }

    [Fact]
    public async Task Should_Create_Patient()
    {
        // Arrange
        var input = new CreatePatientDto
        {
            StudyId = "TEST001",
            Gender = "男",
            Age = 45
        };

        // Act
        var result = await _patientAppService.CreateAsync(input);

        // Assert
        result.Id.ShouldNotBe(Guid.Empty);
        result.StudyId.ShouldBe("TEST001");
    }
}
```

### 8.2 Integration Tests

- Database migration tests
- API endpoint tests
- Python service integration tests
- Authentication flow tests

### 8.3 E2E Tests

- User workflow tests (Cypress/Playwright)
- Cross-browser compatibility
- Performance testing

---

## 9. Timeline & Milestones

### Phase 1: Database & Backend (Week 1-2)

- [ ] Design PostgreSQL schema
- [ ] Create ABP domain entities
- [ ] Implement repositories
- [ ] Create application services
- [ ] Write unit tests
- [ ] Migrate SQLite data to PostgreSQL

### Phase 2: API Integration (Week 3)

- [ ] Implement HTTP controllers
- [ ] Set up authentication/authorization
- [ ] Create Python service proxies
- [ ] Test API endpoints
- [ ] API documentation (Swagger)

### Phase 3: Frontend Integration (Week 4-5)

- [ ] Build React app as Web Component
- [ ] Integrate into Vue application
- [ ] Implement authentication flow
- [ ] Test cross-component communication
- [ ] UI/UX testing

### Phase 4: Deployment (Week 6)

- [ ] Docker containerization
- [ ] Nginx reverse proxy configuration
- [ ] Production environment setup
- [ ] Load testing
- [ ] Security audit

### Phase 5: Documentation & Training (Week 7)

- [ ] API documentation
- [ ] User manual
- [ ] Admin guide
- [ ] Developer documentation
- [ ] Team training sessions

---

## 10. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|:---|:---|:---|:---|
| Data loss during migration | High | Low | Backup SQLite DB, test migration on staging first |
| Performance degradation | Medium | Medium | Add database indexes, optimize JSON queries |
| Authentication conflicts | High | Low | Use ABP standard JWT, thorough testing |
| Python service downtime | Medium | Medium | Implement retry logic, health checks |
| Cross-origin issues | Low | Medium | Proper CORS configuration |
| Frontend compatibility | Medium | Low | Polyfills, browser testing |

---

## 11. Success Criteria

✅ All patient data successfully migrated to PostgreSQL
✅ ABP module passes all unit tests (>80% coverage)
✅ API endpoints return correct responses (<200ms)
✅ React components render correctly in Vue app
✅ Authentication works seamlessly
✅ Python services integrated and functional
✅ Production deployment successful
✅ Zero data loss
✅ User acceptance testing passed

---

## 12. Next Steps

1. **Review this plan** with the development team
2. **Approve technical decisions** (Web Components vs iframe, etc.)
3. **Set up development environment** (PostgreSQL, ABP template)
4. **Create Git repository** structure
5. **Start Phase 1** implementation

---

**Document Prepared by:** Hao Wu
**Date:** 2025-10-24
**Version:** 1.0
