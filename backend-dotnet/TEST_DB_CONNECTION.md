# PostgreSQL 连接配置说明

## 问题
数据库连接失败，密码认证错误。

## 当前配置
- **连接字符串**: `Host=localhost;Port=5432;Database=LowBackPainDB;User ID=postgres;Password=admin123;`
- **错误**: `password authentication failed for user "postgres"`

## 解决方案选项

### 选项 1: 使用正确的密码
如果您知道 PostgreSQL 的 postgres 用户密码，请更新以下文件：

1. `src/LowBackPain.HttpApi.Host/appsettings.json`
2. `src/LowBackPain.DbMigrator/appsettings.json`

将 `Password=admin123` 改为您的实际密码。

### 选项 2: 重置 PostgreSQL 密码

**Windows 系统**:

1. 找到 PostgreSQL 安装目录的 `pg_hba.conf` 文件
   通常位于: `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`

2. 备份原文件后，修改身份验证方法：
   ```
   # 将这一行:
   host    all             all             127.0.0.1/32            scram-sha-256

   # 临时改为:
   host    all             all             127.0.0.1/32            trust
   ```

3. 重启 PostgreSQL 服务：
   ```powershell
   Restart-Service postgresql-x64-15
   ```

4. 使用 psql 连接并重置密码：
   ```bash
   psql -U postgres
   ALTER USER postgres WITH PASSWORD 'admin123';
   \q
   ```

5. 将 `pg_hba.conf` 改回 `scram-sha-256` 并重启服务

### 选项 3: 创建新用户

```sql
-- 以 postgres 用户身份连接后执行:
CREATE USER lbp_admin WITH PASSWORD 'YourSecurePassword';
CREATE DATABASE "LowBackPainDB" OWNER lbp_admin;
GRANT ALL PRIVILEGES ON DATABASE "LowBackPainDB" TO lbp_admin;
```

然后更新连接字符串为:
```
Host=localhost;Port=5432;Database=LowBackPainDB;User ID=lbp_admin;Password=YourSecurePassword;
```

### 选项 4: 使用 Windows 身份验证 (如果可用)

某些 PostgreSQL 安装支持 Windows 身份验证，但这需要特殊配置。

## 推荐操作

1. 首先尝试查找您在安装 PostgreSQL 时设置的密码
2. 如果忘记密码，使用选项 2 重置密码
3. 更新 appsettings.json 文件中的密码
4. 重新运行 `dotnet run` 在 DbMigrator 项目

## 验证连接

使用 psql 命令测试连接：
```bash
psql -U postgres -h localhost -d postgres
```

如果能成功连接，说明密码正确。
