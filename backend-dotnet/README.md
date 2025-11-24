# Low Back Pain System - .NET Backend

**框架**: ABP vNext 7.3.3
**数据库**: PostgreSQL 15+
**运行环境**: .NET 7.0

---

## 项目结构

```
aspnet-core/
├── src/
│   ├── LowBackPain.Application/          # 应用服务层 (AppServices)
│   ├── LowBackPain.Application.Contracts/ # DTO 和应用接口
│   ├── LowBackPain.Domain/               # 领域层 (Entities, Domain Services)
│   ├── LowBackPain.Domain.Shared/        # 领域共享 (常量, 枚举)
│   ├── LowBackPain.EntityFrameworkCore/  # EF Core 配置和仓储
│   ├── LowBackPain.HttpApi/              # API Controllers
│   ├── LowBackPain.HttpApi.Host/         # Web API 主机项目
│   ├── LowBackPain.HttpApi.Client/       # HTTP API 客户端
│   └── LowBackPain.DbMigrator/           # 数据库迁移工具
└── test/
    ├── LowBackPain.Application.Tests/
    ├── LowBackPain.Domain.Tests/
    ├── LowBackPain.EntityFrameworkCore.Tests/
    └── LowBackPain.HttpApi.Client.ConsoleTestApp/
```

---

## 配置说明

### 数据库连接

已配置 PostgreSQL 连接：
- **数据库名**: `LowBackPainDB`
- **主机**: `localhost:5432`
- **用户**: `postgres`
- **密码**: `admin123`

**配置文件**:
- `src/LowBackPain.HttpApi.Host/appsettings.json`
- `src/LowBackPain.DbMigrator/appsettings.json`

### API 配置

- **API 地址**: `http://localhost:5000`
- **Swagger UI**: `http://localhost:5000/swagger`
- **CORS 允许**: `http://localhost:5173` (前端), `http://localhost:3000`, `http://localhost:5000`

---

## 快速开始

### 1. 前置要求

确保已安装：
- ✅ .NET 7.0 SDK
- ✅ PostgreSQL 15+
- ✅ ABP CLI 7.3+

### 2. 创建数据库

使用 PostgreSQL 客户端 (psql 或 pgAdmin):

```sql
CREATE DATABASE "LowBackPainDB";
```

或者命令行:
```bash
psql -U postgres -c "CREATE DATABASE \"LowBackPainDB\";"
```

### 3. 应用数据库迁移

```bash
cd aspnet-core/src/LowBackPain.DbMigrator
dotnet run
```

**期望输出**:
```
[INF] Started database migrations...
[INF] Migrating schema for host database...
[INF] Executing host database seed...
[INF] Successfully completed host database migrations.
```

### 4. 运行 API 服务

```bash
cd aspnet-core/src/LowBackPain.HttpApi.Host
dotnet run
```

**期望输出**:
```
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

### 5. 访问 Swagger API 文档

打开浏览器访问:
```
http://localhost:5000/swagger
```

---

## 开发工作流

### 添加新的 Entity

1. 在 `LowBackPain.Domain/Entities/` 创建实体类
2. 在 `LowBackPainDbContext.cs` 添加 DbSet
3. 创建迁移: `dotnet ef migrations add AddYourEntity`
4. 应用迁移: `dotnet ef database update`

### 添加新的 API 端点

1. 在 `LowBackPain.Application.Contracts/` 创建 DTO
2. 在 `LowBackPain.Application.Contracts/` 创建应用服务接口
3. 在 `LowBackPain.Application/` 实现应用服务
4. 在 `LowBackPain.HttpApi/` 创建 Controller (可选，ABP 会自动生成)

### 运行测试

```bash
cd aspnet-core
dotnet test
```

---

## 数据库迁移

### 创建新迁移

```bash
cd aspnet-core/src/LowBackPain.EntityFrameworkCore
dotnet ef migrations add MigrationName
```

### 应用迁移

方式 1: 使用 DbMigrator (推荐)
```bash
cd aspnet-core/src/LowBackPain.DbMigrator
dotnet run
```

方式 2: 使用 EF Core CLI
```bash
cd aspnet-core/src/LowBackPain.HttpApi.Host
dotnet ef database update
```

### 移除最后一次迁移

```bash
cd aspnet-core/src/LowBackPain.EntityFrameworkCore
dotnet ef migrations remove
```

---

## 下一步开发任务

参考 `.specify/NEW_API_DESIGN.md` 和 `.specify/POSTGRESQL_SCHEMA.md`：

1. ✅ 创建 Patient Entity
2. ✅ 实现 PatientAppService (CRUD)
3. ✅ 添加 PatientImage Entity
4. ✅ 实现图像上传 API
5. ✅ 实现外部 Token 验证
6. ✅ 集成测试

---

## 故障排除

### 问题: "数据库连接失败"

检查 PostgreSQL 服务状态:
```bash
Get-Service -Name postgresql*
```

启动服务:
```bash
Start-Service -Name postgresql-x64-15
```

### 问题: "端口 5000 已被占用"

修改 `appsettings.json` 中的端口，或终止占用进程:
```bash
netstat -ano | findstr :5000
taskkill /PID <进程ID> /F
```

### 问题: "ABP 授权失败"

本项目使用外部系统授权，不依赖 ABP 内置授权。
需要实现自定义 Token 验证中间件（参考 `.specify/NEW_API_DESIGN.md`）。

---

## 参考文档

- [ABP Framework 文档](https://docs.abp.io/)
- [EF Core PostgreSQL](https://www.npgsql.org/efcore/)
- [API 设计文档](../.specify/NEW_API_DESIGN.md)
- [数据库 Schema](../.specify/POSTGRESQL_SCHEMA.md)
