# Low Back Pain System - Backend (.NET + ABP vNext)

**后端系统 - 基于.NET 7.0 和 ABP vNext 7.3**

---

## 📋 目录结构

```
LowBackPainSystem.Backend/
├── src/
│   ├── LowBackPainSystem.Domain/              # 领域层
│   │   ├── Patients/Patient.cs                # 患者实体
│   │   ├── Workspaces/Workspace.cs            # 工作室实体
│   │   └── Doctors/Doctor.cs                  # 医生实体
│   │
│   ├── LowBackPainSystem.Application.Contracts/  # 应用服务接口
│   │   ├── Patients/
│   │   │   ├── IPatientAppService.cs          # 患者服务接口
│   │   │   ├── PatientDto.cs                  # 数据传输对象
│   │   │   ├── CreatePatientDto.cs
│   │   │   ├── UpdatePatientDto.cs
│   │   │   └── GetPatientsInput.cs
│   │   └── Services/
│   │       ├── IOcrService.cs                 # OCR服务接口
│   │       ├── IPoseService.cs                # 姿态分析服务接口
│   │       └── DTO classes...
│   │
│   ├── LowBackPainSystem.Application/         # 应用服务实现
│   │   ├── Patients/
│   │   │   ├── PatientAppService.cs           # 患者服务实现
│   │   │   └── PatientProfile.cs              # AutoMapper配置
│   │   └── Services/
│   │       ├── PythonOcrService.cs            # OCR服务实现
│   │       └── PythonPoseService.cs           # 姿态分析服务实现
│   │
│   ├── LowBackPainSystem.EntityFrameworkCore/ # EF Core数据访问
│   │   └── EntityFrameworkCore/
│   │       └── LowBackPainDbContext.cs        # 数据库上下文
│   │
│   └── LowBackPainSystem.HttpApi.Host/        # Web API主机
│       ├── Controllers/
│       ├── appsettings.json                   # 配置文件
│       └── Program.cs
│
├── database/
│   ├── schema.sql                             # PostgreSQL数据库架构
│   └── migration_from_sqlite.py               # SQLite迁移脚本
│
└── README.md                                  # 本文件
```

---

## 🚀 快速开始

### 前置要求

1. **.NET 7.0 SDK** - [下载](https://dotnet.microsoft.com/download/dotnet/7.0)
2. **PostgreSQL 15+** - [下载](https://www.postgresql.org/download/)
3. **ABP CLI** (可选) - `dotnet tool install -g Volo.Abp.Cli`
4. **Python 3.8+** - 用于运行OCR和Pose服务

### 步骤 1: 安装PostgreSQL并创建数据库

```bash
# 以PostgreSQL用户登录
psql -U postgres

# 创建数据库
CREATE DATABASE LowBackPainDb;

# 创建用户 (可选)
CREATE USER lbp_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE LowBackPainDb TO lbp_user;

# 退出
\q
```

### 步骤 2: 导入数据库架构

```bash
# 导入schema.sql
psql -U postgres -d LowBackPainDb -f database/schema.sql
```

### 步骤 3: 迁移SQLite数据 (可选)

如果你有现有的SQLite数据需要迁移:

```bash
# 安装Python依赖
pip install psycopg2-binary

# 修改迁移脚本中的数据库密码
# 编辑 database/migration_from_sqlite.py 第18行

# 执行迁移
python database/migration_from_sqlite.py
```

### 步骤 4: 配置.NET应用

创建 `src/LowBackPainSystem.HttpApi.Host/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=LowBackPainDb;Username=postgres;Password=your_password"
  },
  "PythonServices": {
    "OcrUrl": "http://localhost:5001",
    "PoseUrl": "http://localhost:5002"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "Origins": "http://localhost:5173,http://localhost:3000"
  }
}
```

### 步骤 5: 安装.NET依赖并运行

```bash
cd src/LowBackPainSystem.HttpApi.Host

# 恢复NuGet包
dotnet restore

# 运行应用
dotnet run
```

后端API将在 `http://localhost:5000` 运行。

### 步骤 6: 启动Python服务

```bash
# 终端1: OCR服务
cd backend
python ocr_service.py

# 终端2: Pose服务
python pose_service.py
```

---

## 📡 API端点

### 患者管理

| 方法 | 端点 | 描述 |
|:---|:---|:---|
| GET | `/api/app/patient` | 获取患者列表 (分页) |
| GET | `/api/app/patient/{id}` | 获取患者详情 |
| POST | `/api/app/patient` | 创建新患者 |
| PUT | `/api/app/patient/{id}` | 更新患者信息 |
| DELETE | `/api/app/patient/{id}` | 删除患者 |
| PUT | `/api/app/patient/{id}/pose-analysis` | 更新AI姿态分析 |
| GET | `/api/app/patient/by-workspace/{workspaceId}` | 获取工作室的所有患者 |
| GET | `/api/app/patient/by-doctor/{doctorId}` | 获取医生的所有患者 |

### OCR服务

| 方法 | 端点 | 描述 |
|:---|:---|:---|
| POST | `/api/services/ocr` | 处理OCR图片 |
| GET | `/api/services/ocr/health` | 健康检查 |

### 姿态分析服务

| 方法 | 端点 | 描述 |
|:---|:---|:---|
| POST | `/api/services/pose` | 分析静态姿态 |
| GET | `/api/services/pose/health` | 健康检查 |

---

## 🗄️ 数据库

### 表结构

- **patients** - 患者数据表
- **workspaces** - 工作室表 (可选)
- **doctors** - 医生表 (可选)

### 重要字段

**patients表**:
- `id` (UUID) - 主键
- `workspace_id` (UUID) - 工作室ID (必填)
- `doctor_id` (UUID) - 医生ID (必填)
- `pain_areas` (JSONB) - 疼痛部位
- `functional_scores` (JSONB) - 功能评分
- `ai_posture_analysis` (JSONB) - AI姿态分析结果

### 索引优化

```sql
-- 已创建的索引
idx_patients_workspace_id
idx_patients_doctor_id
idx_patients_study_id
idx_patients_creation_time
idx_pain_areas_gin (JSONB)
idx_ai_posture_analysis_gin (JSONB)
```

---

## 🔧 配置说明

### 连接字符串

修改 `appsettings.json` 中的 PostgreSQL 连接字符串:

```json
{
  "ConnectionStrings": {
    "Default": "Host=your-host;Database=LowBackPainDb;Username=your-user;Password=your-password"
  }
}
```

### Python服务URL

```json
{
  "PythonServices": {
    "OcrUrl": "http://localhost:5001",
    "PoseUrl": "http://localhost:5002"
  }
}
```

### CORS配置

允许前端访问的域名:

```json
{
  "Cors": {
    "Origins": "http://localhost:5173,http://your-frontend-domain.com"
  }
}
```

---

## 📊 监控与日志

### 健康检查

```bash
# 检查.NET API
curl http://localhost:5000/health

# 检查OCR服务
curl http://localhost:5000/api/services/ocr/health

# 检查Pose服务
curl http://localhost:5000/api/services/pose/health
```

### 日志位置

默认日志输出到控制台。可以配置到文件:

```json
{
  "Serilog": {
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "File",
        "Args": { "path": "Logs/log-.txt", "rollingInterval": "Day" }
      }
    ]
  }
}
```

---

## 🐛 故障排查

### 问题 1: 无法连接到PostgreSQL

**解决方案**:
1. 检查PostgreSQL服务是否运行: `systemctl status postgresql`
2. 检查连接字符串是否正确
3. 检查PostgreSQL允许远程连接: `pg_hba.conf`

### 问题 2: Python服务不可用

**解决方案**:
1. 检查OCR/Pose服务是否运行
2. 检查端口5001和5002是否被占用
3. 查看Python服务日志

### 问题 3: CORS错误

**解决方案**:
1. 检查 `appsettings.json` 中的 `Cors.Origins`
2. 确保前端URL在允许列表中
3. 检查浏览器控制台错误信息

---

## 📦 部署

### 发布应用

```bash
cd src/LowBackPainSystem.HttpApi.Host
dotnet publish -c Release -o ./publish
```

### IIS部署 (Windows)

1. 安装 .NET 7.0 Runtime
2. 创建应用程序池 (无托管代码)
3. 指向 `publish` 目录
4. 配置 `web.config`

### Linux部署

```bash
# 使用systemd创建服务
sudo nano /etc/systemd/system/lowbackpain-api.service

[Unit]
Description=Low Back Pain System API

[Service]
WorkingDirectory=/var/www/lowbackpain
ExecStart=/usr/bin/dotnet /var/www/lowbackpain/LowBackPainSystem.HttpApi.Host.dll
Restart=always
RestartSec=10
SyslogIdentifier=lowbackpain-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target

# 启动服务
sudo systemctl enable lowbackpain-api
sudo systemctl start lowbackpain-api
```

---

## 📚 参考资料

- [ABP Framework文档](https://docs.abp.io/)
- [.NET 7.0文档](https://learn.microsoft.com/en-us/dotnet/core/)
- [PostgreSQL文档](https://www.postgresql.org/docs/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)

---

**版本**: 1.0.0
**最后更新**: 2025-10-27
**作者**: Claude + User
