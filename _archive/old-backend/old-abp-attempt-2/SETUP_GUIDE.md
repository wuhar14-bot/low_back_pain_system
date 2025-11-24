# Low Back Pain System - 设置指南

## 当前进度

✅ 已完成的安装：
- .NET 7.0 SDK (版本 7.0.410)
- PostgreSQL 15 (版本 15.14-2)
- ABP CLI (版本 7.4.5)

## 下一步：设置PostgreSQL数据库

### 步骤 1: 设置 PostgreSQL 密码

PostgreSQL 安装时会要求设置 postgres 用户的密码。如果你记得安装时设置的密码，请记录下来。如果不记得，可以按以下步骤重置：

**选项 A: 使用 pgAdmin 图形界面 (推荐)**

1. 打开 pgAdmin 4
   - 位置: `C:\Program Files\PostgreSQL\15\pgAdmin 4\bin\pgAdmin4.exe`

2. 首次打开时会要求设置 master password（主密码），设置一个你记得住的密码

3. 连接到 PostgreSQL 服务器
   - 左侧树形菜单: Servers → PostgreSQL 15
   - 输入安装时设置的 postgres 密码

**选项 B: 命令行方式**

在 PowerShell 中运行（需要 postgres 密码）:
```powershell
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
```

### 步骤 2: 创建数据库

在 pgAdmin 中:
1. 右键点击 "Databases" → "Create" → "Database..."
2. Database name: `LowBackPainDb`
3. Owner: postgres
4. 点击 "Save"

或在 psql 命令行中:
```sql
CREATE DATABASE "LowBackPainDb";
```

### 步骤 3: 运行数据库 Schema

**方法 1: 使用 pgAdmin (推荐)**

1. 在 pgAdmin 中连接到 `LowBackPainDb` 数据库
2. 点击顶部菜单 Tools → Query Tool
3. 打开文件: `E:\claude-code\low back pain system\LowBackPainSystem.Backend\database\schema.sql`
4. 点击 "Execute/Refresh" 按钮 (或按 F5)
5. 检查输出确认所有表创建成功

**方法 2: 使用命令行**

在 PowerShell 中:
```powershell
$env:PGPASSWORD = "你的postgres密码"
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d LowBackPainDb -f "E:\claude-code\low back pain system\LowBackPainSystem.Backend\database\schema.sql"
```

### 步骤 4: 验证数据库结构

在 psql 或 pgAdmin Query Tool 中运行:
```sql
-- 查看所有表
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 应该看到以下表:
-- - patients
-- - workspaces
-- - doctors
```

### 步骤 5: 数据迁移 (可选)

如果你有现有的 SQLite 数据需要迁移:

1. 确保 Python 已安装
2. 安装依赖:
```powershell
pip install psycopg2-binary
```

3. 编辑 `database/migration_from_sqlite.py`，设置正确的连接信息:
```python
# SQLite 源数据库
SQLITE_DB_PATH = "path/to/your/low_back_pain.db"

# PostgreSQL 目标数据库
PG_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "LowBackPainDb",
    "user": "postgres",
    "password": "你的postgres密码"  # 修改这里
}
```

4. 运行迁移脚本:
```powershell
python "E:\claude-code\low back pain system\LowBackPainSystem.Backend\database\migration_from_sqlite.py"
```

## 下一步：创建 ABP vNext 项目

### 步骤 6: 创建 ABP 项目

打开**新的 PowerShell 窗口**（重要！ABP CLI需要新会话）:

```powershell
cd "E:\claude-code\low back pain system"

# 创建 ABP vNext 项目
abp new LowBackPainSystem -t app-nolayers --database-provider PostgreSQL --version 7.3.0

# 如果上面的命令失败，尝试不指定版本:
abp new LowBackPainSystem -t app-nolayers --database-provider PostgreSQL
```

### 步骤 7: 配置数据库连接字符串

编辑生成的项目中的 `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=LowBackPainDb;Username=postgres;Password=你的postgres密码"
  }
}
```

### 步骤 8: 整合已生成的代码

将以下已生成的代码文件复制到 ABP 项目对应位置:

**Domain Layer (领域层)**:
- `src/LowBackPainSystem.Domain/Patients/Patient.cs`
- `src/LowBackPainSystem.Domain/Workspaces/Workspace.cs`
- `src/LowBackPainSystem.Domain/Doctors/Doctor.cs`

**Application Contracts (应用契约层)**:
- `src/LowBackPainSystem.Application.Contracts/Patients/*.cs`
- `src/LowBackPainSystem.Application.Contracts/Services/*.cs`

**Application Layer (应用层)**:
- `src/LowBackPainSystem.Application/Patients/*.cs`
- `src/LowBackPainSystem.Application/Services/*.cs`

**EntityFrameworkCore Layer (数据访问层)**:
- `src/LowBackPainSystem.EntityFrameworkCore/EntityFrameworkCore/LowBackPainDbContext.cs`

### 步骤 9: 运行后端 API

```powershell
cd LowBackPainSystem
dotnet run
```

API 将运行在: `http://localhost:5000`

### 步骤 10: 配置前端

编辑前端项目的 `.env.development`:
```env
VITE_API_URL=http://localhost:5000
VITE_OCR_SERVICE_URL=http://localhost:5001
VITE_POSE_SERVICE_URL=http://localhost:5002
VITE_DEBUG=true
```

添加前端集成文件:
- `src/api/config.js`
- `src/utils/auth.js`
- `src/api/patientApi.js`

### 步骤 11: 启动完整系统

在不同的终端窗口中启动:

1. **后端 API**:
```powershell
cd "E:\claude-code\low back pain system\LowBackPainSystem"
dotnet run
```

2. **Python OCR 服务** (如果有):
```powershell
cd "E:\claude-code\low back pain system\ocr-service"
python app.py
```

3. **Python Pose 服务** (如果有):
```powershell
cd "E:\claude-code\low back pain system\pose-service"
python app.py
```

4. **前端**:
```powershell
cd "E:\claude-code\low back pain system\frontend"
npm run dev
```

访问: `http://localhost:5173`

## 故障排除

### 问题 1: psql 命令找不到
**解决**: 添加 PostgreSQL 到系统 PATH:
```
C:\Program Files\PostgreSQL\15\bin
```

### 问题 2: abp 命令找不到
**解决**: 打开新的 PowerShell 窗口，.NET 工具路径需要在新会话中生效

### 问题 3: PostgreSQL 连接失败
**解决**:
1. 检查服务是否运行: `sc query postgresql-x64-15`
2. 检查密码是否正确
3. 检查 `pg_hba.conf` 配置

### 问题 4: Entity Framework 迁移错误
**解决**:
1. 确保数据库已创建
2. 确保连接字符串正确
3. 运行: `dotnet ef database update`

## 安全提醒

**⚠️ 开发环境配置 - 不要用于生产！**

当前配置仅用于本地开发测试。生产环境需要:
1. 使用强密码
2. 修改 `pg_hba.conf` 限制访问
3. 启用 SSL 连接
4. 配置防火墙规则
5. 定期备份数据库

## 技术支持

如遇到问题，检查以下日志:
- PostgreSQL 日志: `C:\Program Files\PostgreSQL\15\data\log\`
- .NET 应用日志: 控制台输出
- 浏览器控制台: 前端错误信息

---

**下一步行动**: 请按照步骤 1-5 设置 PostgreSQL 数据库，完成后告诉我继续创建 ABP 项目。
