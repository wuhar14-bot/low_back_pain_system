# Low Back Pain Data Collection System - 项目需求规格

**更新日期**: 2024-10-24
**来源**: 苏小波 (Server)
**状态**: 需要实施

---

## 核心需求变更

### 1. 后端技术栈要求

**数据库**:
- PostgreSQL（必须）

**开发语言和框架**:
- .NET 7.0
- ABP vNext 7.3 架构

### 2. 系统集成方式

**前端部署**:
- Low Back Pain System 将独立部署
- 不再是现有系统的一部分

**参数传递**:
```
现有系统 UI → 跳转链接 → Low Back Pain System
                    ↓
            传递参数（URL参数或Token）:
            - 工作室信息 (Workspace ID/Name)
            - 医生信息 (Doctor ID/Name)
```

### 3. 功能简化

**移除功能**:
- ❌ 工作室管理模块 (WorkspaceManager)
- ❌ 医生管理功能

**原因**:
- 工作室和医生信息由现有系统传递
- Low Back Pain System 只负责接收和使用这些信息
- 不需要自己管理工作室和医生

---

## 系统架构

### 当前架构（需要迁移）
```
React Frontend → Base44 SDK → localStorage/API (http://localhost:5003)
```

### 目标架构
```
[现有系统 UI]
    ↓ (跳转 + 参数)
[Low Back Pain Frontend (React + Vite)]
    ↓ (API调用)
[ABP vNext 7.3 Backend (.NET 7.0)]
    ↓
[PostgreSQL Database]
```

---

## 实施步骤

### Phase 1: 后端迁移
- [ ] 设置 .NET 7.0 开发环境
- [ ] 初始化 ABP vNext 7.3 项目
- [ ] 配置 PostgreSQL 数据库连接
- [ ] 设计数据库 Schema
- [ ] 实现 Patient Entity 和 Repository
- [ ] 创建 Patient CRUD API 端点

### Phase 2: 前端调整
- [ ] 移除 WorkspaceManager 页面和路由
- [ ] 移除医生管理相关组件
- [ ] 实现 URL 参数接收（工作室、医生）
- [ ] 将 Base44 SDK 替换为直接 API 调用
- [ ] 更新 API 端点到新的 .NET 后端

### Phase 3: 集成开发
- [ ] 实现外部参数验证
- [ ] 实现工作室/医生信息存储到 Context
- [ ] 更新患者表单，关联工作室和医生信息
- [ ] 实现图像上传到新后端

### Phase 4: 测试和部署
- [ ] 本地测试完整流程
- [ ] 与现有系统进行集成测试
- [ ] 部署 PostgreSQL 数据库
- [ ] 部署 .NET 后端
- [ ] 部署 React 前端

---

## API 设计（新后端）

### 基础端点
```
GET    /api/patients              - 获取患者列表
GET    /api/patients/{id}         - 获取患者详情
POST   /api/patients              - 创建患者
PUT    /api/patients/{id}         - 更新患者
DELETE /api/patients/{id}         - 删除患者
POST   /api/patients/{id}/images  - 上传图像
```

### 外部集成端点
```
GET    /api/workspaces/{id}       - 验证工作室（只读）
GET    /api/doctors/{id}          - 验证医生（只读）
POST   /api/auth/external         - 外部系统认证
```

---

## 数据模型调整

### Patient Entity
```csharp
public class Patient : FullAuditedEntity<Guid>
{
    public string Name { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string Gender { get; set; }

    // 外部关联（只存储ID和名称，不管理）
    public Guid WorkspaceId { get; set; }
    public string WorkspaceName { get; set; }
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; }

    // 临床数据
    public string MedicalHistory { get; set; }
    public string ExaminationResults { get; set; }
    // ... 其他字段
}
```

---

## 前端参数接收示例

### URL 格式
```
http://lbp-system.example.com?workspace=<id>&doctor=<id>&token=<auth>
```

### 实现方式
```javascript
// 在 App.jsx 或根组件中
const params = new URLSearchParams(window.location.search);
const workspaceId = params.get('workspace');
const doctorId = params.get('doctor');
const authToken = params.get('token');

// 验证并存储到 Context
```

---

## 技术栈对比

| 组件 | 当前 | 目标 |
|:---|:---|:---|
| 前端框架 | React 18 + Vite | React 18 + Vite ✓ |
| UI库 | shadcn/ui | shadcn/ui ✓ |
| 后端 | Base44 SDK | .NET 7.0 + ABP vNext 7.3 |
| 数据库 | localStorage + API | PostgreSQL |
| 认证 | 简单本地认证 | 外部系统集成 |

---

## 注意事项

1. **ABP vNext 学习曲线**: 需要熟悉 ABP 框架的 DDD 架构
2. **PostgreSQL 配置**: 确保开发和生产环境的数据库配置
3. **外部集成安全**: 实现 Token 验证机制
4. **数据迁移**: 如果有现有数据，需要迁移方案
5. **向后兼容**: localStorage fallback 可以保留作为离线支持

---

## 相关文档

- [ARCHITECTURE.md](.specify/ARCHITECTURE.md) - 系统架构设计
- [DATABASE.md](.specify/DATABASE.md) - 数据库设计
- [API.md](.specify/API.md) - API 接口文档
- [DEPLOYMENT.md](.specify/DEPLOYMENT.md) - 部署指南
