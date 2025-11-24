# 手动执行步骤指南

**当前状态**: 所有软件已安装，代码已生成，准备创建 ABP 项目

---

## 为什么需要手动执行？

ABP CLI 是 .NET 全局工具，安装后需要在**新的 PowerShell 会话**中才能使用。

---

## 📋 执行步骤（每步都很简单！）

### 步骤 1: 打开 PowerShell

**按 Windows 键，输入 "PowerShell"，回车**

或者：右键点击开始菜单 → Windows PowerShell

---

### 步骤 2: 验证 ABP CLI 已安装

在 PowerShell 中输入：
```powershell
abp --version
```

应该看到: `7.4.5`

如果看到 "command not found"，再试试：
```powershell
dotnet tool list -g | findstr abp
```

---

### 步骤 3: 创建 ABP 项目

复制粘贴以下命令到 PowerShell：
```powershell
cd "E:\claude-code\low back pain system"
abp new LowBackPainSystem -t app-nolayers --database-provider PostgreSQL --version 7.3.0
```

**等待 2-5 分钟**，会看到进度输出：
- Downloading template...
- Creating solution...
- Restoring NuGet packages...

**完成标志**: 看到 "Successfully created" 或 "Congratulations"

---

### 步骤 4: 整合代码文件

在同一个 PowerShell 窗口中：
```powershell
.\integrate_code.ps1
```

如果提示权限问题，运行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\integrate_code.ps1
```

**完成标志**: 看到 "Integration Complete!" 和文件复制清单

---

### 步骤 5: 配置数据库

**选项 A**: 如果你知道 PostgreSQL 密码
```powershell
cd LowBackPainSystem.Backend\database
.\setup_database.ps1 -PostgresPassword "你的密码"
```

**选项 B**: 使用 pgAdmin（图形界面）
1. 打开 pgAdmin: `C:\Program Files\PostgreSQL\15\pgAdmin 4\runtime\pgAdmin4.exe`
2. 创建数据库 `LowBackPainDb`
3. 运行 SQL 文件: `LowBackPainSystem.Backend\database\schema.sql`

**完成标志**: 数据库 LowBackPainDb 创建成功，包含 patients, workspaces, doctors 表

---

### 步骤 6: 配置连接字符串

用 VS Code 或记事本打开:
```
E:\claude-code\low back pain system\LowBackPainSystem\appsettings.json
```

找到 `"ConnectionStrings"` 部分，修改为:
```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=LowBackPainDb;Username=postgres;Password=你的postgres密码"
  }
}
```

保存文件。

---

### 步骤 7: 编译和运行

在 PowerShell 中：
```powershell
cd LowBackPainSystem
dotnet restore
dotnet build
dotnet run
```

**完成标志**: 看到 "Now listening on: http://localhost:5000"

---

### 步骤 8: 测试 API

打开浏览器，访问:
```
http://localhost:5000/swagger
```

应该看到 Swagger API 文档界面。

---

## 🎯 快速检查清单

运行每一步后打勾：

- [ ] PowerShell 已打开
- [ ] `abp --version` 显示 7.4.5
- [ ] ABP 项目已创建（看到 LowBackPainSystem 文件夹）
- [ ] 代码文件已整合（integrate_code.ps1 执行成功）
- [ ] 数据库已配置（LowBackPainDb 存在）
- [ ] 连接字符串已更新（appsettings.json）
- [ ] 项目编译成功（`dotnet build` 无错误）
- [ ] API 运行成功（http://localhost:5000/swagger 可访问）

---

## ⚠️ 常见问题

### Q: abp 命令找不到？
**A**: 关闭 PowerShell，重新打开新的窗口。.NET 工具需要新会话生效。

### Q: ABP 项目创建失败，提示版本不兼容？
**A**: 去掉版本号，运行:
```powershell
abp new LowBackPainSystem -t app-nolayers --database-provider PostgreSQL
```

### Q: integrate_code.ps1 无法执行？
**A**: 运行:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: 编译失败？
**A**:
1. 确认代码文件已正确复制
2. 运行 `dotnet restore` 重新还原 NuGet 包
3. 检查是否有编译错误提示

### Q: 数据库连接失败？
**A**:
1. 检查 PostgreSQL 服务是否运行: `sc query postgresql-x64-15`
2. 检查密码是否正确
3. 检查数据库 LowBackPainDb 是否存在

---

## 📚 详细文档参考

如果遇到问题，查看:
- **START_HERE.md** - 完整开始指南
- **SETUP_GUIDE.md** - 详细设置指南（在 LowBackPainSystem.Backend 文件夹）
- **NEXT_ACTIONS.md** - 详细操作步骤说明

---

## 💡 提示

- 每个命令执行后等待完成再继续下一步
- 有红色错误提示时停下来检查
- PowerShell 窗口保持打开，所有命令在同一窗口执行
- 复制粘贴命令时确保没有多余的空格或换行

---

**准备好了？打开 PowerShell 开始吧！** 🚀

从步骤 1 开始执行，完成每一步后打勾。
