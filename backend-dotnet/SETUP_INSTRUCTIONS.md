# Low Back Pain System - Backend Setup Instructions

## 当前状态

✅ **已完成**:
1. ABP vNext 7.3.3 项目创建成功
2. Patient 和 PatientImage 实体实现
3. EF Core DbContext 配置完成
4. 数据库迁移文件已生成 (`20251114075903_AddPatientEntities.cs`)
5. Application Service (CRUD API) 实现完成
6. 项目构建成功 (0 errors, 0 warnings)

⏳ **待配置**:
- PostgreSQL 数据库连接配置

---

## 需要用户操作：配置 PostgreSQL 密码

### 问题
数据库迁移失败，错误信息：
```
password authentication failed for user "postgres"
```

### 原因
连接字符串中的密码 (`admin123`) 与您实际的 PostgreSQL 密码不匹配。

---

## 解决方案步骤

### 步骤 1: 找到您的 PostgreSQL 密码

PostgreSQL 密码是您在安装时设置的。常见的默认密码包括：
- `postgres`
- `password`
- `123456`
- 您自己设置的密码

### 步骤 2: 更新配置文件

需要更新以下两个文件中的密码：

**文件 1**: `src/LowBackPain.HttpApi.Host/appsettings.json`
**文件 2**: `src/LowBackPain.DbMigrator/appsettings.json`

找到连接字符串：
```json
"ConnectionStrings": {
  "Default": "Host=localhost;Port=5432;Database=LowBackPainDB;User ID=postgres;Password=admin123;"
}
```

将 `Password=admin123` 改为您的实际密码，例如：
```json
"ConnectionStrings": {
  "Default": "Host=localhost;Port=5432;Database=LowBackPainDB;User ID=postgres;Password=YOUR_ACTUAL_PASSWORD;"
}
```

### 步骤 3: 应用数据库迁移

打开 PowerShell 或命令提示符，执行：

```bash
cd "E:\claude-code\low back pain system\backend-dotnet\aspnet-core\src\LowBackPain.DbMigrator"
dotnet run
```

**期望输出**:
```
[INF] Started database migrations...
[INF] Migrating schema for host database...
[INF] Executing host database seed...
[INF] Successfully completed host database migrations.
```

### 步骤 4: 启动 API 服务

```bash
cd "E:\claude-code\low back pain system\backend-dotnet\aspnet-core\src\LowBackPain.HttpApi.Host"
dotnet run
```

**期望输出**:
```
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

### 步骤 5: 访问 Swagger API 文档

打开浏览器访问：
```
http://localhost:5000/swagger
```

您应该能看到 ABP API 文档，包括 Patient 相关的 CRUD 端点。

---

## 如果忘记 PostgreSQL 密码

### 方法 1: 重置密码

1. 找到 PostgreSQL 配置文件 `pg_hba.conf`
   - 通常位于: `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`

2. **备份原文件**后，将身份验证方法改为 `trust`:
   ```
   # TYPE  DATABASE        USER            ADDRESS                 METHOD
   host    all             all             127.0.0.1/32            trust
   ```

3. 重启 PostgreSQL 服务:
   ```powershell
   Restart-Service postgresql-x64-15
   ```

4. 不使用密码连接并重置:
   ```bash
   # 如果 psql 在 PATH 中
   "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
   ```

   然后执行 SQL:
   ```sql
   ALTER USER postgres WITH PASSWORD 'new_password';
   \q
   ```

5. 将 `pg_hba.conf` 改回 `scram-sha-256` 并重启服务

### 方法 2: 创建新数据库用户

使用管理员账户创建新用户（如果可以连接）:
```sql
CREATE USER lbp_admin WITH PASSWORD 'your_secure_password';
CREATE DATABASE "LowBackPainDB" OWNER lbp_admin;
GRANT ALL PRIVILEGES ON DATABASE "LowBackPainDB" TO lbp_admin;
```

然后更新连接字符串使用新用户：
```
Host=localhost;Port=5432;Database=LowBackPainDB;User ID=lbp_admin;Password=your_secure_password;
```

---

## 验证 PostgreSQL 服务状态

检查服务是否运行：
```powershell
Get-Service -Name postgresql*
```

如果服务未运行，启动它：
```powershell
Start-Service postgresql-x64-15
```

---

## API 端点预览

配置完成后，您将可以使用以下 API 端点：

### Patient CRUD
- `GET /api/app/patient` - 获取患者列表
- `GET /api/app/patient/{id}` - 获取单个患者
- `POST /api/app/patient` - 创建患者
- `PUT /api/app/patient/{id}` - 更新患者
- `DELETE /api/app/patient/{id}` - 删除患者

### 自定义端点
- `GET /api/app/patient/by-workspace/{workspaceId}` - 按工作室ID获取患者
- `GET /api/app/patient/by-study-id/{studyId}` - 按StudyID获取患者
- `GET /api/app/patient/is-study-id-exists/{studyId}` - 检查StudyID是否存在

---

## 下一步开发任务

数据库配置完成后，继续以下任务：

1. ⏳ 测试 Patient CRUD API
2. ⏳ 实现图像上传功能
3. ⏳ 实现外部Token验证
4. ⏳ 前端集成测试

---

## 需要帮助？

如果遇到问题，请检查：
1. PostgreSQL 服务是否运行
2. 数据库 `LowBackPainDB` 是否已创建（迁移会自动创建）
3. 防火墙是否阻止端口 5432 或 5000

**参考文档**:
- [DEVELOPMENT_SETUP.md](../.specify/DEVELOPMENT_SETUP.md) - 完整环境配置指南
- [NEW_API_DESIGN.md](../.specify/NEW_API_DESIGN.md) - API 接口设计
- [POSTGRESQL_SCHEMA.md](../.specify/POSTGRESQL_SCHEMA.md) - 数据库 Schema
- [TEST_DB_CONNECTION.md](./TEST_DB_CONNECTION.md) - 数据库连接故障排除
