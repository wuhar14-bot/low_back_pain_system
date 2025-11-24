# 下一步行动指南

**项目**: Low Back Pain System 重组
**当前状态**: 代码生成完成 (85%)
**最后更新**: 2025-10-27

---

## 🎯 当前进度

✅ **已完成**:
- 完整的.NET ABP vNext代码架构
- PostgreSQL数据库设计
- SQLite数据迁移脚本
- 前端API集成代码
- 完整文档

⏳ **待完成**:
- 在有.NET环境的机器上配置和运行
- 数据迁移
- 测试
- 部署

---

## 📝 立即可做的事情 (无需.NET环境)

### 1. 阅读文档了解架构

推荐阅读顺序:

1. **[REORGANIZATION_SUMMARY.md](REORGANIZATION_SUMMARY.md)** (本次重组总结)
   - 快速了解完成了什么
   - 查看架构对比
   - 了解技术栈

2. **[REORGANIZE_PLAN.md](REORGANIZE_PLAN.md)** (详细重组方案)
   - 深入了解架构设计
   - 查看代码示例
   - 理解数据流

3. **[LowBackPainSystem.Backend/README.md](LowBackPainSystem.Backend/README.md)** (后端文档)
   - API端点列表
   - 配置说明
   - 故障排查

4. **[IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md)** (实施日志)
   - 查看每一步的详细记录
   - 了解文件清单
   - 查看待办任务

### 2. 审查生成的代码

#### 后端代码位置:
```
E:\claude-code\low back pain system\LowBackPainSystem.Backend\
└── src/
    ├── LowBackPainSystem.Domain/
    ├── LowBackPainSystem.Application.Contracts/
    ├── LowBackPainSystem.Application/
    └── LowBackPainSystem.EntityFrameworkCore/
```

#### 前端代码位置:
```
E:\claude-code\low back pain system\
├── src/api/config.js
├── src/utils/auth.js
└── src/api/patientApi.js
```

#### 数据库文件:
```
E:\claude-code\low back pain system\LowBackPainSystem.Backend\database\
├── schema.sql
└── migration_from_sqlite.py
```

### 3. 准备工作清单

在转移到有.NET环境的机器之前,确认以下事项:

- [ ] 已阅读所有文档
- [ ] 理解新架构设计
- [ ] 知道如何配置PostgreSQL连接字符串
- [ ] 了解数据迁移流程
- [ ] 准备好现有工作室系统的集成信息 (如何传递workspaceId和doctorId)

---

## 🖥️ 在有.NET环境的机器上操作

### 前置要求

#### 必需软件:
1. **.NET 7.0 SDK** - [下载](https://dotnet.microsoft.com/download/dotnet/7.0)
2. **PostgreSQL 15+** - [下载](https://www.postgresql.org/download/)
3. **Node.js 18+** - [下载](https://nodejs.org/) (前端需要)
4. **Python 3.8+** - (OCR/Pose服务)

#### 可选工具:
- **ABP CLI**: `dotnet tool install -g Volo.Abp.Cli`
- **Visual Studio 2022** 或 **VS Code**
- **pgAdmin 4** (PostgreSQL管理工具)

### 步骤 1: 创建完整的ABP项目

#### 方式 A: 使用ABP CLI (推荐)

```bash
# 1. 安装ABP CLI (如果还没有)
dotnet tool install -g Volo.Abp.Cli

# 2. 创建新项目
abp new LowBackPainSystem -t app -u mvc -d ef -dbms PostgreSQL

# 3. 复制生成的代码到对应位置
# 将E:\claude-code\low back pain system\LowBackPainSystem.Backend\src\
# 下的文件复制到新创建的项目的src\目录
```

#### 方式 B: 手动创建项目文件

如果无法使用ABP CLI,需要手动创建以下文件:

1. **LowBackPainSystem.Domain.csproj**
2. **LowBackPainSystem.Application.Contracts.csproj**
3. **LowBackPainSystem.Application.csproj**
4. **LowBackPainSystem.EntityFrameworkCore.csproj**
5. **LowBackPainSystem.HttpApi.Host.csproj**

**NuGet包依赖** (参考版本):
- Volo.Abp.Autofac: 7.3.*
- Volo.Abp.EntityFrameworkCore.PostgreSql: 7.3.*
- Volo.Abp.AspNetCore.Mvc: 7.3.*
- AutoMapper.Extensions.Microsoft.DependencyInjection: 12.*
- Microsoft.EntityFrameworkCore.Tools: 7.*

### 步骤 2: 配置数据库

#### 2.1 安装PostgreSQL

```bash
# Windows: 下载安装器
# https://www.postgresql.org/download/windows/

# Linux (Ubuntu/Debian):
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2.2 创建数据库

```bash
# 以postgres用户登录
sudo -u postgres psql

# 在psql shell中:
CREATE DATABASE LowBackPainDb;
CREATE USER lbp_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE LowBackPainDb TO lbp_user;
\q
```

#### 2.3 导入数据库架构

```bash
# 执行schema.sql
psql -U postgres -d LowBackPainDb -f "E:\claude-code\low back pain system\LowBackPainSystem.Backend\database\schema.sql"
```

### 步骤 3: 迁移SQLite数据 (可选)

如果你有现有的SQLite数据需要迁移:

```bash
# 1. 安装Python依赖
pip install psycopg2-binary

# 2. 编辑迁移脚本,修改PostgreSQL密码
# 打开: E:\claude-code\low back pain system\LowBackPainSystem.Backend\database\migration_from_sqlite.py
# 修改第18行的密码

# 3. 运行迁移
python "E:\claude-code\low back pain system\LowBackPainSystem.Backend\database\migration_from_sqlite.py"
```

### 步骤 4: 配置.NET应用

创建或修改 `appsettings.json`:

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
      "Default": "Information"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "Origins": "http://localhost:5173,http://localhost:3000"
  }
}
```

### 步骤 5: 启动所有服务

#### Terminal 1: .NET API
```bash
cd src/LowBackPainSystem.HttpApi.Host
dotnet restore
dotnet run
```

#### Terminal 2: OCR Service
```bash
cd "E:\claude-code\low back pain system\backend"
python ocr_service.py
```

#### Terminal 3: Pose Service
```bash
cd "E:\claude-code\low back pain system\backend"
python pose_service.py
```

#### Terminal 4: Frontend
```bash
cd "E:\claude-code\low back pain system"
npm install  # 如果还没有安装依赖
npm run dev
```

### 步骤 6: 测试

#### 6.1 健康检查

```bash
# .NET API健康检查
curl http://localhost:5000/health

# OCR服务健康检查
curl http://localhost:5000/api/services/ocr/health

# Pose服务健康检查
curl http://localhost:5000/api/services/pose/health
```

#### 6.2 前端测试

```
浏览器访问: http://localhost:5173?workspaceId=test-workspace-id&doctorId=test-doctor-id
```

#### 6.3 API测试

使用Postman或curl测试API:

```bash
# 获取患者列表
curl -X GET "http://localhost:5000/api/app/patient?workspaceId=test-workspace-id"

# 创建患者
curl -X POST "http://localhost:5000/api/app/patient" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "test-workspace-id",
    "doctorId": "test-doctor-id",
    "name": "测试患者",
    "age": 45,
    "gender": "男"
  }'
```

---

## 🚀 部署到生产环境

### 1. 发布.NET应用

```bash
cd src/LowBackPainSystem.HttpApi.Host
dotnet publish -c Release -o ./publish
```

### 2. 部署到IIS (Windows)

1. 安装.NET 7.0 Runtime
2. 创建IIS网站
3. 指向publish目录
4. 配置应用程序池 (无托管代码)
5. 配置web.config

### 3. 部署到Linux (Nginx)

```bash
# 创建systemd服务
sudo nano /etc/systemd/system/lowbackpain-api.service

[Unit]
Description=Low Back Pain System API

[Service]
WorkingDirectory=/var/www/lowbackpain
ExecStart=/usr/bin/dotnet /var/www/lowbackpain/LowBackPainSystem.HttpApi.Host.dll
Restart=always
RestartSec=10
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target

# 启动服务
sudo systemctl enable lowbackpain-api
sudo systemctl start lowbackpain-api
```

### 4. 配置Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. 部署前端

```bash
# 构建前端
cd "E:\claude-code\low back pain system"
npm run build

# 复制dist目录到服务器
# 配置Nginx服务前端静态文件
```

---

## 📋 检查清单

### 代码审查
- [ ] 已审查所有生成的C#代码
- [ ] 已审查数据库架构
- [ ] 已审查前端API集成代码
- [ ] 理解数据迁移流程

### 环境准备
- [ ] 已安装.NET 7.0 SDK
- [ ] 已安装PostgreSQL
- [ ] 已安装Node.js和Python
- [ ] 已安装必要的开发工具

### 项目配置
- [ ] 已创建ABP项目或.csproj文件
- [ ] 已配置appsettings.json
- [ ] 已配置.env文件
- [ ] 已安装所有NuGet包依赖

### 数据库
- [ ] 已创建PostgreSQL数据库
- [ ] 已导入schema.sql
- [ ] 已迁移SQLite数据 (如果需要)
- [ ] 已验证数据完整性

### 测试
- [ ] 所有服务正常启动
- [ ] API健康检查通过
- [ ] 前端可以访问
- [ ] 工作室/医生认证工作正常
- [ ] CRUD操作正常
- [ ] OCR/Pose服务集成正常

### 部署
- [ ] 已发布.NET应用
- [ ] 已配置生产环境数据库
- [ ] 已部署前端
- [ ] 已配置Nginx/IIS
- [ ] 已配置SSL证书
- [ ] 已进行性能测试

---

## 🆘 常见问题

### Q1: 如何创建.csproj文件?

**A**: 使用ABP CLI是最简单的方式。如果必须手动创建,可以参考ABP官方文档的项目文件模板。

### Q2: PostgreSQL连接失败怎么办?

**A**:
1. 检查PostgreSQL服务是否运行
2. 检查连接字符串是否正确
3. 检查防火墙设置
4. 检查pg_hba.conf配置

### Q3: 前端如何获取workspaceId和doctorId?

**A**:
- 方式1: 现有系统跳转时通过URL参数传递
- 方式2: 现有系统生成JWT token,包含这些信息
- 详见: `src/utils/auth.js`

### Q4: 是否可以不使用PostgreSQL?

**A**: 可以,但需要修改代码。ABP支持多种数据库(SQL Server, MySQL等),但本次重组专门针对PostgreSQL优化。

### Q5: Python服务必须保留吗?

**A**: 是的,OCR和Pose服务仍然使用Python实现。.NET后端只是作为中间层调用这些服务。

---

## 📚 参考资料

### 文档
- [REORGANIZATION_SUMMARY.md](REORGANIZATION_SUMMARY.md) - 重组总结
- [REORGANIZE_PLAN.md](REORGANIZE_PLAN.md) - 详细方案
- [IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md) - 实施日志
- [LowBackPainSystem.Backend/README.md](LowBackPainSystem.Backend/README.md) - 后端README

### 外部资源
- [ABP Framework](https://docs.abp.io/)
- [.NET 7.0](https://learn.microsoft.com/en-us/dotnet/core/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)

---

## 💬 获取帮助

如果遇到问题:

1. 查看相关文档 (见上方参考资料)
2. 查看IMPLEMENTATION_LOG.md中的待办任务
3. 查看LowBackPainSystem.Backend/README.md的故障排查部分

---

**祝你好运!** 🎉

如果一切顺利,10小时内即可完成整个重组并部署上线。

---

**最后更新**: 2025-10-27
**作者**: Claude
