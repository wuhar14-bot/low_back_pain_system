# Low Back Pain System - Development Environment Setup
## .NET 7.0 + ABP vNext 7.3 + PostgreSQL

**创建日期**: 2024-11-14
**状态**: 环境配置指南

---

## 目录
1. [前置要求](#前置要求)
2. [.NET 7.0 SDK 安装](#net-70-sdk-安装)
3. [ABP CLI 安装](#abp-cli-安装)
4. [PostgreSQL 安装配置](#postgresql-安装配置)
5. [IDE 设置](#ide-设置)
6. [创建 ABP vNext 项目](#创建-abp-vnext-项目)
7. [配置 PostgreSQL 连接](#配置-postgresql-连接)
8. [验证环境](#验证环境)

---

## 前置要求

### 操作系统
- Windows 10/11 (x64)
- 或 Linux/macOS (需调整安装命令)

### 必需软件
- ✅ Git (版本控制)
- ✅ Node.js 16+ (用于前端工具)
- ✅ 文本编辑器 (VS Code 推荐)

---

## .NET 7.0 SDK 安装

### ⚠️ 重要提示
**.NET 7.0 已于 2024 年 5 月 14 日结束支持 (EOL)**
如果可能，建议使用 .NET 8.0 或更高版本。但由于项目需求指定 .NET 7.0，我们将继续使用。

### 安装方法 1: 官方安装包 (推荐)

**步骤 1**: 访问官方下载页面
```
https://dotnet.microsoft.com/en-us/download/dotnet/7.0
```

**步骤 2**: 下载 SDK 7.0.20 (最后版本)
- 选择 "SDK 7.0.20" → Windows x64 Installer
- 文件名: `dotnet-sdk-7.0.410-win-x64.exe`

**步骤 3**: 运行安装程序
- 双击下载的 `.exe` 文件
- 点击 "Install" 并按照提示完成安装

### 安装方法 2: WinGet (Windows 包管理器)

```bash
winget install Microsoft.DotNet.SDK.7
```

### 安装方法 3: Chocolatey

```bash
choco install dotnet-7.0-sdk
```

### 验证安装

打开 PowerShell 或 CMD，运行：

```bash
dotnet --version
```

**期望输出**:
```
7.0.410 (或类似 7.0.xxx 版本)
```

**检查已安装的 SDK**:
```bash
dotnet --list-sdks
```

**期望输出**:
```
7.0.410 [C:\Program Files\dotnet\sdk]
```

---

## ABP CLI 安装

### 安装 ABP CLI 7.3

ABP CLI 是一个 .NET Global Tool，通过 dotnet 命令安装。

**步骤 1**: 安装指定版本的 ABP CLI

```bash
dotnet tool install -g Volo.Abp.Cli --version 7.3.0
```

**步骤 2**: 验证安装

```bash
abp --version
```

**期望输出**:
```
7.3.0
```

### 如果需要更新或重新安装

**卸载旧版本**:
```bash
dotnet tool uninstall -g Volo.Abp.Cli
```

**重新安装**:
```bash
dotnet tool install -g Volo.Abp.Cli --version 7.3.0
```

### ABP CLI 常用命令

| 命令 | 用途 |
|:---|:---|
| `abp new <project-name>` | 创建新项目 |
| `abp new <project-name> -u mvc` | 创建 MVC 项目 |
| `abp new <project-name> -u angular` | 创建 Angular 前端项目 |
| `abp new <project-name> -d mongodb` | 使用 MongoDB 数据库 |
| `abp new <project-name> -d ef -dbms PostgreSQL` | 使用 PostgreSQL 数据库 |
| `abp update` | 更新 ABP 相关包 |
| `abp add-module <module-name>` | 添加模块 |

---

## PostgreSQL 安装配置

### 安装 PostgreSQL 15/16

**步骤 1**: 下载 PostgreSQL

访问官方下载页面:
```
https://www.postgresql.org/download/windows/
```

或使用 Chocolatey:
```bash
choco install postgresql
```

或使用 WinGet:
```bash
winget install PostgreSQL.PostgreSQL
```

**步骤 2**: 运行安装程序

- 选择安装路径 (默认: `C:\Program Files\PostgreSQL\15\`)
- **记住您设置的 postgres 用户密码** (例如: `admin123`)
- 端口: 5432 (默认)
- 区域设置: [Default locale]

**步骤 3**: 验证安装

打开 PowerShell，运行:

```bash
psql --version
```

**期望输出**:
```
psql (PostgreSQL) 15.x
```

### 创建数据库

**步骤 1**: 连接到 PostgreSQL

```bash
psql -U postgres
```

输入您在安装时设置的密码。

**步骤 2**: 创建数据库

```sql
CREATE DATABASE LowBackPainDB;
```

**步骤 3**: 创建专用用户 (可选但推荐)

```sql
CREATE USER lbp_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE LowBackPainDB TO lbp_admin;
```

**步骤 4**: 退出 psql

```sql
\q
```

### 安装 pgAdmin (图形化管理工具，可选)

**下载**: https://www.pgadmin.org/download/
**功能**: 可视化管理 PostgreSQL 数据库、查看表结构、执行 SQL 查询

---

## IDE 设置

### 选项 1: Visual Studio Code (推荐用于本项目)

**优点**:
- 轻量级
- 优秀的 C# 扩展支持
- 集成终端
- 免费

**必装扩展**:
```
1. C# (Microsoft)
2. C# Dev Kit (Microsoft)
3. NuGet Package Manager
4. PostgreSQL (Chris Kolkman) - 用于数据库查询
5. REST Client - 用于测试 API
```

**安装方法**:
- 打开 VS Code
- 按 `Ctrl+Shift+X` 打开扩展面板
- 搜索并安装上述扩展

### 选项 2: Visual Studio 2022 Community (完整 IDE)

**优点**:
- 完整的 .NET 开发环境
- 强大的调试工具
- NuGet 包管理
- 数据库工具集成

**下载**: https://visualstudio.microsoft.com/downloads/
**工作负载**:
- ✅ ASP.NET 和 Web 开发
- ✅ .NET 桌面开发

---

## 创建 ABP vNext 项目

### 使用 ABP CLI 创建项目

**步骤 1**: 导航到项目根目录

```bash
cd E:\claude-code\
mkdir LowBackPainBackend
cd LowBackPainBackend
```

**步骤 2**: 创建 ABP 应用程序

```bash
abp new LowBackPain -u none -d ef -dbms PostgreSQL --version 7.3.0
```

**参数说明**:
- `LowBackPain`: 项目名称
- `-u none`: 无 UI (我们将使用独立前端)
- `-d ef`: 使用 Entity Framework Core
- `-dbms PostgreSQL`: 使用 PostgreSQL 数据库
- `--version 7.3.0`: 指定 ABP 版本

**步骤 3**: 等待项目创建

创建过程可能需要几分钟，会自动下载 NuGet 包。

**期望输出**:
```
Creating your project...
Project is successfully created!
```

### 项目结构

创建后的目录结构:
```
LowBackPain/
├── src/
│   ├── LowBackPain.Application/          # 应用服务层
│   ├── LowBackPain.Application.Contracts/ # DTO 和接口
│   ├── LowBackPain.Domain/               # 领域层 (Entities)
│   ├── LowBackPain.Domain.Shared/        # 共享常量
│   ├── LowBackPain.EntityFrameworkCore/  # EF Core 配置
│   └── LowBackPain.HttpApi.Host/         # Web API 主机
├── test/
│   ├── LowBackPain.Application.Tests/
│   ├── LowBackPain.Domain.Tests/
│   └── LowBackPain.EntityFrameworkCore.Tests/
└── LowBackPain.sln                       # 解决方案文件
```

---

## 配置 PostgreSQL 连接

### 步骤 1: 更新连接字符串

编辑 `src/LowBackPain.HttpApi.Host/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=LowBackPainDB;Username=postgres;Password=your_password"
  }
}
```

**参数说明**:
- `Host`: 数据库服务器地址 (本地开发使用 `localhost`)
- `Port`: PostgreSQL 端口 (默认 5432)
- `Database`: 数据库名称 (之前创建的 `LowBackPainDB`)
- `Username`: 用户名 (`postgres` 或 `lbp_admin`)
- `Password`: 您的数据库密码

### 步骤 2: 安装 Npgsql 包 (如果需要)

ABP PostgreSQL 模板已包含必要的包，但如果缺失，手动安装:

```bash
cd src/LowBackPain.EntityFrameworkCore
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 7.0.11
```

### 步骤 3: 验证 EF Core 配置

检查 `src/LowBackPain.EntityFrameworkCore/LowBackPainDbContext.cs`:

应该已包含 PostgreSQL 配置:
```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder.UseNpgsql();
}
```

---

## 验证环境

### 步骤 1: 构建解决方案

```bash
cd E:\claude-code\LowBackPainBackend\LowBackPain
dotnet build
```

**期望输出**:
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### 步骤 2: 创建初始数据库迁移

```bash
cd src/LowBackPain.EntityFrameworkCore
dotnet ef migrations add InitialCreate
```

**期望输出**:
```
Build started...
Build succeeded.
Done. To undo this action, use 'dotnet ef migrations remove'
```

### 步骤 3: 应用迁移到数据库

```bash
cd ../LowBackPain.DbMigrator
dotnet run
```

**期望输出**:
```
[INF] Started database migrations...
[INF] Migrating schema for host database...
[INF] Executing host database seed...
[INF] Successfully completed host database migrations.
```

### 步骤 4: 运行 API 服务

```bash
cd ../LowBackPain.HttpApi.Host
dotnet run
```

**期望输出**:
```
Now listening on: https://localhost:5001
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

### 步骤 5: 测试 API

打开浏览器访问:
```
http://localhost:5000/api
```

或访问 Swagger UI:
```
http://localhost:5000/swagger
```

**期望结果**: 显示 ABP API 文档页面

---

## 常见问题

### 问题 1: "dotnet: command not found"

**原因**: .NET SDK 未正确安装或未添加到 PATH
**解决方案**:
1. 重新安装 .NET 7.0 SDK
2. 重启终端/PowerShell
3. 验证环境变量中包含 `C:\Program Files\dotnet`

### 问题 2: "abp: command not found"

**原因**: ABP CLI 未安装或未添加到 PATH
**解决方案**:
```bash
dotnet tool install -g Volo.Abp.Cli --version 7.3.0
```

### 问题 3: PostgreSQL 连接失败

**原因**: 连接字符串错误或 PostgreSQL 服务未启动
**解决方案**:
1. 检查 PostgreSQL 服务状态:
   ```bash
   Get-Service -Name postgresql*
   ```
2. 启动服务:
   ```bash
   Start-Service -Name postgresql-x64-15
   ```
3. 验证连接字符串中的密码和数据库名称

### 问题 4: EF Core 迁移失败

**原因**: 数据库不存在或权限不足
**解决方案**:
1. 确认数据库已创建: `psql -U postgres -c "\l"`
2. 检查用户权限: `GRANT ALL PRIVILEGES ON DATABASE LowBackPainDB TO postgres;`

---

## 下一步

环境配置完成后，可以开始:

1. ✅ 实现 Patient Entity (根据 `POSTGRESQL_SCHEMA.md`)
2. ✅ 创建 Repository 和 Application Service
3. ✅ 实现 API Endpoints (根据 `NEW_API_DESIGN.md`)
4. ✅ 添加外部 Token 验证
5. ✅ 实现图像上传功能

---

**参考文档**:
- [ABP Framework Documentation](https://docs.abp.io/)
- [Entity Framework Core PostgreSQL](https://docs.abp.io/en/abp/latest/Entity-Framework-Core-PostgreSQL)
- [.NET 7.0 Documentation](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-7)
