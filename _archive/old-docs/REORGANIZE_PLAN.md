# Low Back Pain System 重组方案

**日期**: 2025-10-27
**目标**: 将独立的 Low Back Pain System 重组为与现有工作室系统集成的架构

---

## 一、当前架构概述

### 现有系统架构
```
Low Back Pain System (独立部署)
├── Frontend (React + Vite, Port 5173)
│   ├── 独立的用户界面
│   ├── 独立的认证系统
│   └── 独立的数据管理
├── Backend Services
│   ├── OCR Service (Python Flask, Port 5001)
│   ├── Pose Service (Python Flask, Port 5002)
│   └── Database Service (SQLite, Port 5003)
└── 数据存储
    └── SQLite 数据库 (low_back_pain.db)
```

### 现有数据库
- **类型**: SQLite 3
- **位置**: `backend/low_back_pain.db`
- **表结构**: patients 表包含完整的患者数据

---

## 二、重组目标架构

### 新架构设计
```
现有工作室系统 (Existing System)
├── Frontend UI
│   └── 新增跳转链接 → Low Back Pain System
│       (传递: 工作室ID, 医生ID)
│
Low Back Pain System (独立前端 + 集成后端)
├── Frontend (React, 单独部署的 URL)
│   ├── 接收工作室和医生信息
│   ├── 独立的患者管理界面
│   └── 调用后端 API
│
├── Backend (.NET 7.0 + ABP vNext 7.3)
│   ├── PostgreSQL 数据库
│   ├── ABP 架构层次
│   │   ├── Domain Layer
│   │   ├── Application Layer
│   │   ├── API Layer (Controllers)
│   │   └── Infrastructure Layer
│   ├── 集成现有 Python 服务
│   │   ├── OCR Service (保留)
│   │   ├── Pose Service (保留)
│   │   └── .NET 后端调用这些服务
│   └── 工作室/医生认证集成
│
└── 数据库 (PostgreSQL)
    ├── Patients 表
    ├── Workspaces 表 (可选)
    └── Doctors 表 (可选)
```

---

## 三、重组详细步骤

### 阶段 1: 后端架构重构 (.NET + ABP vNext + PostgreSQL)

#### 1.1 创建 ABP vNext 项目

**步骤**:
1. 使用 ABP CLI 创建新项目:
   ```bash
   abp new LowBackPainSystem -t app -u mvc -d ef -dbms PostgreSQL
   ```

2. 项目结构:
   ```
   LowBackPainSystem.sln
   ├── src/
   │   ├── LowBackPainSystem.Domain/           # 领域层
   │   ├── LowBackPainSystem.Application/      # 应用服务层
   │   ├── LowBackPainSystem.HttpApi/          # API控制器
   │   ├── LowBackPainSystem.EntityFrameworkCore/  # EF Core
   │   └── LowBackPainSystem.HttpApi.Host/     # Web API主机
   └── test/
   ```

3. 配置 PostgreSQL 连接:
   ```json
   // appsettings.json
   {
     "ConnectionStrings": {
       "Default": "Host=localhost;Database=LowBackPainDb;Username=postgres;Password=***"
     }
   }
   ```

#### 1.2 数据库设计 (PostgreSQL)

**患者表 (Patients)**:
```sql
CREATE TABLE patients (
    -- ABP 基础字段
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creation_time TIMESTAMP NOT NULL DEFAULT NOW(),
    creator_id UUID,
    last_modification_time TIMESTAMP,
    last_modifier_id UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleter_id UUID,
    deletion_time TIMESTAMP,

    -- 业务字段
    study_id VARCHAR(50),
    workspace_id UUID NOT NULL,           -- 工作室ID (关键字段)
    doctor_id UUID NOT NULL,              -- 医生ID (关键字段)

    -- 患者信息
    name VARCHAR(100),
    gender VARCHAR(10),                    -- '男' or '女'
    age INTEGER,
    phone VARCHAR(20),

    -- 医疗信息
    onset_date DATE,
    chief_complaint TEXT,
    medical_history TEXT,
    pain_areas JSONB,                      -- JSON数组

    -- 检查信息
    subjective_exam TEXT,
    objective_exam TEXT,
    functional_scores JSONB,               -- JSON对象
    intervention TEXT,

    -- AI分析
    ai_posture_analysis JSONB,             -- MediaPipe结果

    -- 附加信息
    remarks TEXT,

    -- 完整数据备份
    data_json JSONB,

    -- 索引
    CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
    CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- 索引
CREATE INDEX idx_patients_workspace_id ON patients(workspace_id);
CREATE INDEX idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX idx_patients_study_id ON patients(study_id);
CREATE INDEX idx_patients_created ON patients(creation_time DESC);
CREATE INDEX idx_pain_areas_gin ON patients USING GIN(pain_areas);
CREATE INDEX idx_ai_analysis_gin ON patients USING GIN(ai_posture_analysis);
```

**工作室表 (可选 - 如果不在现有系统中)**:
```sql
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    creation_time TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**医生表 (可选 - 如果不在现有系统中)**:
```sql
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50),
    specialty VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    creation_time TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_doctor_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);
```

#### 1.3 ABP Domain Layer 实体定义

**Patient.cs**:
```csharp
using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace LowBackPainSystem.Patients
{
    public class Patient : FullAuditedAggregateRoot<Guid>
    {
        public string StudyId { get; set; }
        public Guid WorkspaceId { get; set; }
        public Guid DoctorId { get; set; }

        // 患者信息
        public string Name { get; set; }
        public string Gender { get; set; }
        public int? Age { get; set; }
        public string Phone { get; set; }

        // 医疗信息
        public DateTime? OnsetDate { get; set; }
        public string ChiefComplaint { get; set; }
        public string MedicalHistory { get; set; }
        public string PainAreasJson { get; set; }  // JSONB

        // 检查信息
        public string SubjectiveExam { get; set; }
        public string ObjectiveExam { get; set; }
        public string FunctionalScoresJson { get; set; }  // JSONB
        public string Intervention { get; set; }

        // AI分析
        public string AiPostureAnalysisJson { get; set; }  // JSONB

        public string Remarks { get; set; }
        public string DataJson { get; set; }  // JSONB备份

        protected Patient() { }

        public Patient(
            Guid id,
            Guid workspaceId,
            Guid doctorId,
            string studyId = null
        ) : base(id)
        {
            WorkspaceId = workspaceId;
            DoctorId = doctorId;
            StudyId = studyId;
        }
    }
}
```

#### 1.4 ABP Application Layer 服务

**IPatientAppService.cs**:
```csharp
using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace LowBackPainSystem.Patients
{
    public interface IPatientAppService : IApplicationService
    {
        Task<PatientDto> GetAsync(Guid id);
        Task<PagedResultDto<PatientDto>> GetListAsync(GetPatientsInput input);
        Task<PatientDto> CreateAsync(CreatePatientDto input);
        Task<PatientDto> UpdateAsync(Guid id, UpdatePatientDto input);
        Task DeleteAsync(Guid id);

        // 特殊功能
        Task<PatientDto> UpdatePoseAnalysisAsync(Guid id, PoseAnalysisDto analysis);
        Task<List<PatientDto>> GetByWorkspaceAsync(Guid workspaceId);
    }
}
```

**PatientAppService.cs**:
```csharp
using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace LowBackPainSystem.Patients
{
    public class PatientAppService : ApplicationService, IPatientAppService
    {
        private readonly IRepository<Patient, Guid> _patientRepository;

        public PatientAppService(IRepository<Patient, Guid> patientRepository)
        {
            _patientRepository = patientRepository;
        }

        public async Task<PatientDto> GetAsync(Guid id)
        {
            var patient = await _patientRepository.GetAsync(id);
            return ObjectMapper.Map<Patient, PatientDto>(patient);
        }

        public async Task<PagedResultDto<PatientDto>> GetListAsync(GetPatientsInput input)
        {
            var queryable = await _patientRepository.GetQueryableAsync();

            // 过滤工作室
            if (input.WorkspaceId.HasValue)
            {
                queryable = queryable.Where(p => p.WorkspaceId == input.WorkspaceId.Value);
            }

            // 排序
            queryable = queryable.OrderByDescending(p => p.CreationTime);

            // 分页
            var totalCount = await AsyncExecuter.CountAsync(queryable);
            var items = await AsyncExecuter.ToListAsync(
                queryable.Skip(input.SkipCount).Take(input.MaxResultCount)
            );

            return new PagedResultDto<PatientDto>(
                totalCount,
                ObjectMapper.Map<List<Patient>, List<PatientDto>>(items)
            );
        }

        // ... 其他方法实现
    }
}
```

#### 1.5 集成 Python OCR/Pose 服务

**PythonServiceClient.cs** (在 Infrastructure 层):
```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace LowBackPainSystem.Services
{
    public class PythonServiceClient : IPythonServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _ocrServiceUrl;
        private readonly string _poseServiceUrl;

        public PythonServiceClient(
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _ocrServiceUrl = configuration["PythonServices:OcrUrl"] ?? "http://localhost:5001";
            _poseServiceUrl = configuration["PythonServices:PoseUrl"] ?? "http://localhost:5002";
        }

        public async Task<OcrResult> ProcessOcrAsync(string base64Image)
        {
            var request = new { image = base64Image };
            var content = new StringContent(
                JsonSerializer.Serialize(request),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync(
                $"{_ocrServiceUrl}/ocr/process",
                content
            );

            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<OcrResult>(json);
        }

        public async Task<PoseAnalysisResult> AnalyzePoseAsync(
            string standingImageBase64,
            string flexionImageBase64)
        {
            var request = new
            {
                standing_image = standingImageBase64,
                flexion_image = flexionImageBase64
            };

            var content = new StringContent(
                JsonSerializer.Serialize(request),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync(
                $"{_poseServiceUrl}/pose/analyze-static",
                content
            );

            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<PoseAnalysisResult>(json);
        }
    }
}
```

---

### 阶段 2: 数据迁移 (SQLite → PostgreSQL)

#### 2.1 导出现有 SQLite 数据

**Python 迁移脚本** (`migrate_to_postgres.py`):
```python
import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import json
from datetime import datetime
import uuid

# 连接 SQLite
sqlite_conn = sqlite3.connect('backend/low_back_pain.db')
sqlite_conn.row_factory = sqlite3.Row
sqlite_cursor = sqlite_conn.cursor()

# 连接 PostgreSQL
pg_conn = psycopg2.connect(
    host='localhost',
    database='LowBackPainDb',
    user='postgres',
    password='your_password'
)
pg_cursor = pg_conn.cursor()

# 读取 SQLite 患者数据
sqlite_cursor.execute('SELECT * FROM patients ORDER BY created_date')
patients = sqlite_cursor.fetchall()

print(f"Found {len(patients)} patients to migrate")

# 准备 PostgreSQL 插入数据
pg_data = []

for patient in patients:
    # 生成新的 UUID
    new_id = str(uuid.uuid4())

    # 提取数据
    data = {
        'id': new_id,
        'study_id': patient['study_id'],
        'workspace_id': patient['workspace_id'] or str(uuid.uuid4()),  # 默认工作室
        'doctor_id': str(uuid.uuid4()),  # 需要手动映射医生
        'name': patient['name'],
        'gender': patient['gender'],
        'age': patient['age'],
        'phone': patient['phone'],
        'onset_date': patient['onset_date'],
        'chief_complaint': patient['chief_complaint'],
        'medical_history': patient['medical_history'],
        'pain_areas': patient['pain_areas'],
        'subjective_exam': patient['subjective_exam'],
        'objective_exam': patient['objective_exam'],
        'functional_scores': patient['functional_scores'],
        'intervention': patient['intervention'],
        'ai_posture_analysis': patient['ai_posture_analysis'],
        'remarks': patient['remarks'],
        'data_json': patient['data_json'],
        'creation_time': patient['created_date'],
        'is_deleted': False
    }

    pg_data.append(data)

# 批量插入 PostgreSQL
insert_query = """
    INSERT INTO patients (
        id, study_id, workspace_id, doctor_id,
        name, gender, age, phone,
        onset_date, chief_complaint, medical_history, pain_areas,
        subjective_exam, objective_exam, functional_scores, intervention,
        ai_posture_analysis, remarks, data_json,
        creation_time, is_deleted
    ) VALUES %s
"""

execute_values(
    pg_cursor,
    insert_query,
    [tuple(d.values()) for d in pg_data],
    template="""(
        %(id)s, %(study_id)s, %(workspace_id)s, %(doctor_id)s,
        %(name)s, %(gender)s, %(age)s, %(phone)s,
        %(onset_date)s, %(chief_complaint)s, %(medical_history)s, %(pain_areas)s::jsonb,
        %(subjective_exam)s, %(objective_exam)s, %(functional_scores)s::jsonb, %(intervention)s,
        %(ai_posture_analysis)s::jsonb, %(remarks)s, %(data_json)s::jsonb,
        %(creation_time)s, %(is_deleted)s
    )"""
)

pg_conn.commit()
print(f"Migrated {len(pg_data)} patients successfully")

# 关闭连接
sqlite_conn.close()
pg_conn.close()
```

#### 2.2 验证迁移

```sql
-- 检查记录数
SELECT COUNT(*) FROM patients;

-- 检查 JSON 字段
SELECT id, name, pain_areas, ai_posture_analysis
FROM patients
WHERE ai_posture_analysis IS NOT NULL
LIMIT 5;

-- 检查数据完整性
SELECT
    COUNT(*) as total,
    COUNT(DISTINCT workspace_id) as workspaces,
    COUNT(DISTINCT doctor_id) as doctors,
    COUNT(ai_posture_analysis) as with_pose_analysis
FROM patients;
```

---

### 阶段 3: 前端集成

#### 3.1 前端接收工作室/医生信息

**方式 1: URL 参数传递**

现有系统跳转链接:
```html
<a href="http://lowbackpain.example.com?workspaceId={WORKSPACE_ID}&doctorId={DOCTOR_ID}">
    腰痛数据系统
</a>
```

React 前端接收:
```javascript
// src/hooks/useWorkspaceContext.js
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useWorkspaceContext() {
    const [searchParams] = useSearchParams();
    const [context, setContext] = useState({
        workspaceId: null,
        doctorId: null,
        isValid: false
    });

    useEffect(() => {
        const workspaceId = searchParams.get('workspaceId');
        const doctorId = searchParams.get('doctorId');

        if (workspaceId && doctorId) {
            // 保存到 localStorage
            localStorage.setItem('workspaceId', workspaceId);
            localStorage.setItem('doctorId', doctorId);

            setContext({
                workspaceId,
                doctorId,
                isValid: true
            });
        } else {
            // 尝试从 localStorage 读取
            const storedWorkspace = localStorage.getItem('workspaceId');
            const storedDoctor = localStorage.getItem('doctorId');

            if (storedWorkspace && storedDoctor) {
                setContext({
                    workspaceId: storedWorkspace,
                    doctorId: storedDoctor,
                    isValid: true
                });
            }
        }
    }, [searchParams]);

    return context;
}
```

**方式 2: JWT Token 传递 (更安全)**

现有系统生成 token:
```csharp
// 现有系统生成 JWT
var tokenHandler = new JwtSecurityTokenHandler();
var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"]);
var tokenDescriptor = new SecurityTokenDescriptor
{
    Subject = new ClaimsIdentity(new[]
    {
        new Claim("workspaceId", workspaceId.ToString()),
        new Claim("doctorId", doctorId.ToString()),
        new Claim("userName", currentUser.Name)
    }),
    Expires = DateTime.UtcNow.AddHours(8),
    SigningCredentials = new SigningCredentials(
        new SymmetricSecurityKey(key),
        SecurityAlgorithms.HmacSha256Signature
    )
};
var token = tokenHandler.CreateToken(tokenDescriptor);
var tokenString = tokenHandler.WriteToken(token);

// 跳转
return Redirect($"http://lowbackpain.example.com?token={tokenString}");
```

React 前端解析:
```javascript
// src/utils/auth.js
import jwt_decode from 'jwt-decode';

export function getContextFromToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt_decode(token);

        // 保存 token
        localStorage.setItem('authToken', token);

        return {
            workspaceId: decoded.workspaceId,
            doctorId: decoded.doctorId,
            userName: decoded.userName
        };
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}
```

#### 3.2 前端 API 调用更新

**修改 API 基础 URL**:
```javascript
// src/api/config.js
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    ENDPOINTS: {
        PATIENTS: '/api/app/patient',
        OCR: '/api/services/ocr',
        POSE: '/api/services/pose'
    }
};
```

**更新 API 调用**:
```javascript
// src/api/patients.js
import axios from 'axios';
import { API_CONFIG } from './config';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 添加认证拦截器
api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const PatientApi = {
    // 获取患者列表
    async getList(workspaceId, skipCount = 0, maxResultCount = 10) {
        const response = await api.get(API_CONFIG.ENDPOINTS.PATIENTS, {
            params: { workspaceId, skipCount, maxResultCount }
        });
        return response.data;
    },

    // 创建患者
    async create(patientData) {
        const workspaceId = localStorage.getItem('workspaceId');
        const doctorId = localStorage.getItem('doctorId');

        const data = {
            ...patientData,
            workspaceId,
            doctorId
        };

        const response = await api.post(API_CONFIG.ENDPOINTS.PATIENTS, data);
        return response.data;
    },

    // 更新患者
    async update(id, patientData) {
        const response = await api.put(
            `${API_CONFIG.ENDPOINTS.PATIENTS}/${id}`,
            patientData
        );
        return response.data;
    },

    // 删除患者
    async delete(id) {
        await api.delete(`${API_CONFIG.ENDPOINTS.PATIENTS}/${id}`);
    },

    // 更新姿态分析
    async updatePoseAnalysis(id, analysisData) {
        const response = await api.put(
            `${API_CONFIG.ENDPOINTS.PATIENTS}/${id}/pose-analysis`,
            analysisData
        );
        return response.data;
    }
};
```

---

### 阶段 4: 部署配置

#### 4.1 后端部署 (.NET API)

**发布配置**:
```bash
# 发布 .NET 应用
cd LowBackPainSystem.HttpApi.Host
dotnet publish -c Release -o ./publish

# 运行
cd publish
dotnet LowBackPainSystem.HttpApi.Host.dll
```

**IIS 部署 (Windows)**:
1. 安装 .NET 7.0 Runtime
2. 创建应用程序池 (.NET CLR 版本: 无托管代码)
3. 创建网站指向 publish 目录
4. 配置 web.config

**Nginx 反向代理**:
```nginx
server {
    listen 80;
    server_name lowbackpain-api.example.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 4.2 Python 服务部署

**保持现有服务运行**:
```bash
# OCR Service
cd backend
python ocr_service.py  # Port 5001

# Pose Service
python pose_service.py  # Port 5002
```

**或使用 Supervisor (Linux) 守护进程**:
```ini
[program:ocr_service]
command=python /path/to/backend/ocr_service.py
directory=/path/to/backend
autostart=true
autorestart=true
stderr_logfile=/var/log/ocr_service.err.log
stdout_logfile=/var/log/ocr_service.out.log

[program:pose_service]
command=python /path/to/backend/pose_service.py
directory=/path/to/backend
autostart=true
autorestart=true
stderr_logfile=/var/log/pose_service.err.log
stdout_logfile=/var/log/pose_service.out.log
```

#### 4.3 前端部署

**构建生产版本**:
```bash
# 设置 API URL
echo "REACT_APP_API_URL=http://lowbackpain-api.example.com" > .env.production

# 构建
npm run build

# dist 目录包含静态文件
```

**Nginx 部署**:
```nginx
server {
    listen 80;
    server_name lowbackpain.example.com;
    root /var/www/lowbackpain/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 四、本地测试能力

### 能否在本地测试?

**✅ 完全可以在本地测试!**

#### 测试配置 1: 完整本地环境

```
本地计算机
├── PostgreSQL (localhost:5432)
│   └── LowBackPainDb 数据库
│
├── .NET API (localhost:5000)
│   └── ABP vNext 后端
│
├── Python OCR Service (localhost:5001)
│
├── Python Pose Service (localhost:5002)
│
└── React Frontend (localhost:5173)
    └── Vite 开发服务器
```

**启动步骤**:
```bash
# 1. 启动 PostgreSQL (通常作为服务自动运行)

# 2. 启动 .NET API
cd LowBackPainSystem.HttpApi.Host
dotnet run

# 3. 启动 Python 服务
cd backend
python ocr_service.py  # 终端1
python pose_service.py  # 终端2

# 4. 启动前端
npm run dev  # 终端3
```

**前端配置** (`.env.development`):
```env
REACT_APP_API_URL=http://localhost:5000
```

**测试方式**:
```
浏览器访问: http://localhost:5173?workspaceId=test-workspace&doctorId=test-doctor
```

#### 测试配置 2: 模拟跨域部署

```
本地计算机
├── .NET API (localhost:5000)
├── Python Services (5001, 5002)
└── React Frontend (localhost:3000)

模拟外部访问
└── 使用 hosts 文件:
    127.0.0.1  lowbackpain.local
    127.0.0.1  api.lowbackpain.local
```

**修改 hosts** (Windows: `C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1  lowbackpain.local
127.0.0.1  api.lowbackpain.local
```

**前端配置** (`.env.development`):
```env
REACT_APP_API_URL=http://api.lowbackpain.local:5000
```

**浏览器访问**:
```
http://lowbackpain.local:5173?workspaceId=xxx&doctorId=yyy
```

#### 测试配置 3: 使用 Docker Compose (推荐)

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: LowBackPainDb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: ./LowBackPainSystem
      dockerfile: Dockerfile
    ports:
      - "5000:80"
    environment:
      ConnectionStrings__Default: "Host=postgres;Database=LowBackPainDb;Username=postgres;Password=postgres"
      PythonServices__OcrUrl: "http://ocr:5001"
      PythonServices__PoseUrl: "http://pose:5002"
    depends_on:
      - postgres

  ocr:
    build:
      context: ./backend
      dockerfile: Dockerfile.ocr
    ports:
      - "5001:5001"

  pose:
    build:
      context: ./backend
      dockerfile: Dockerfile.pose
    ports:
      - "5002:5002"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "5173:80"
    environment:
      REACT_APP_API_URL: "http://localhost:5000"

volumes:
  postgres_data:
```

**启动所有服务**:
```bash
docker-compose up -d
```

**访问**:
```
http://localhost:5173?workspaceId=test&doctorId=test
```

---

## 五、关键问题与解决方案

### Q1: 如何处理工作室和医生信息?

**方案 A: 从现有系统同步**
- 如果现有系统有 Workspaces/Doctors 表,直接查询
- Low Back Pain System 不维护这些表,仅存储 ID

**方案 B: 在 Low Back Pain System 中维护**
- 创建独立的 Workspaces/Doctors 表
- 通过 API 与现有系统同步数据

**推荐**: 方案 A - 仅存储 ID,减少数据冗余

### Q2: 认证如何处理?

**方案**: 使用 JWT Token 统一认证
1. 用户在现有系统登录
2. 现有系统生成包含工作室/医生信息的 JWT
3. 跳转到 Low Back Pain System 时传递 token
4. Low Back Pain System 验证 token 并提取信息

### Q3: 数据隔离如何保证?

**方案**: 通过 ABP 数据过滤器
```csharp
// 自动过滤查询
public override void ConfigureServices(ServiceConfigurationContext context)
{
    Configure<AbpDataFilterOptions>(options =>
    {
        options.DefaultStates[typeof(IWorkspaceFilter)] = new DataFilterState(isEnabled: true);
    });
}

// 查询时自动添加 WHERE workspace_id = 当前工作室
```

### Q4: OCR/Pose 服务如何集成?

**方案**: .NET 后端作为中间层
```
React Frontend
    ↓ HTTP
.NET API
    ↓ HTTP
Python OCR/Pose Service
```

优点:
- 统一认证和授权
- 统一日志和监控
- 可以添加额外的业务逻辑

---

## 六、时间估算

| 阶段 | 任务 | 时间估算 |
|:---|:---|---:|
| 阶段 1 | 创建 ABP 项目骨架 | 2 小时 |
| | 设计 PostgreSQL 数据库 | 3 小时 |
| | 实现 Domain/Application 层 | 8 小时 |
| | 集成 Python 服务 | 4 小时 |
| | **小计** | **17 小时** |
| 阶段 2 | 编写数据迁移脚本 | 3 小时 |
| | 执行迁移并验证 | 2 小时 |
| | **小计** | **5 小时** |
| 阶段 3 | 前端接收工作室/医生信息 | 2 小时 |
| | 修改 API 调用 | 4 小时 |
| | 测试集成 | 3 小时 |
| | **小计** | **9 小时** |
| 阶段 4 | 配置部署环境 | 4 小时 |
| | 部署并测试 | 3 小时 |
| | **小计** | **7 小时** |
| **总计** | | **38 小时** |

预计 **5-7 个工作日** 完成全部重组工作。

---

## 七、风险与注意事项

### 风险 1: 数据迁移失败
**应对**:
- 在测试环境先演练迁移
- 备份原始 SQLite 数据库
- 逐步验证迁移结果

### 风险 2: Python 服务兼容性
**应对**:
- 保持 Python 服务 API 不变
- .NET 端做好错误处理和重试
- 添加健康检查端点

### 风险 3: 前端跨域问题
**应对**:
- 配置 CORS 策略
- 使用 Nginx 反向代理统一域名

### 风险 4: 性能下降
**应对**:
- PostgreSQL 索引优化
- 添加 Redis 缓存层
- 监控查询性能

---

## 八、后续优化建议

1. **添加 Redis 缓存** - 提升查询性能
2. **实现 WebSocket** - 替代 3 秒轮询,实现实时同步
3. **添加日志系统** - 使用 Serilog 记录操作日志
4. **实现数据导出** - 支持 Excel/CSV 导出
5. **添加单元测试** - 覆盖核心业务逻辑
6. **实现审计日志** - 记录所有数据变更

---

**文档版本**: 1.0
**创建日期**: 2025-10-27
**作者**: Claude
**审核状态**: 待审核
