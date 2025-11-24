# Low Back Pain System - New API Design
## .NET 7.0 + ABP vNext 7.3 Backend API

**更新日期**: 2024-11-14
**状态**: 设计中

---

## 目录
1. [基础架构](#基础架构)
2. [认证与授权](#认证与授权)
3. [Patient API](#patient-api)
4. [Image Upload API](#image-upload-api)
5. [External Integration API](#external-integration-api)
6. [数据模型](#数据模型)
7. [错误处理](#错误处理)

---

## 基础架构

### Base URL
```
Development: http://localhost:5000/api
Production:  https://lbp-api.example.com/api
```

### 请求头
```http
Content-Type: application/json
Authorization: Bearer {external_token}
X-Workspace-Id: {workspace_id}
X-Doctor-Id: {doctor_id}
```

### 响应格式
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-11-14T12:00:00Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "PATIENT_NOT_FOUND",
    "message": "Patient with ID xxx not found",
    "details": { ... }
  },
  "timestamp": "2024-11-14T12:00:00Z"
}
```

---

## 认证与授权

### 1. 验证外部 Token

**Endpoint**: `POST /api/auth/validate-external-token`

**请求**:
```json
{
  "token": "external_system_token",
  "workspaceId": "ws-001",
  "doctorId": "doc-001"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "workspace": {
      "id": "ws-001",
      "name": "HKU Orthopedics"
    },
    "doctor": {
      "id": "doc-001",
      "name": "Dr. Hao Wu"
    },
    "expiresAt": "2024-11-15T12:00:00Z"
  }
}
```

**错误码**:
- `INVALID_TOKEN`: Token 无效或已过期
- `WORKSPACE_NOT_FOUND`: 工作室不存在
- `DOCTOR_NOT_FOUND`: 医生不存在
- `UNAUTHORIZED`: 无权限访问

---

## Patient API

### 1. 获取患者列表

**Endpoint**: `GET /api/patients`

**Query Parameters**:
```
?workspaceId=ws-001          // 必需
&sortBy=created_date         // 可选: created_date, name, age
&sortOrder=desc              // 可选: asc, desc
&page=1                      // 可选: 页码
&pageSize=20                 // 可选: 每页数量
&search=                     // 可选: 搜索关键词
```

**请求头**:
```http
Authorization: Bearer {token}
X-Workspace-Id: ws-001
```

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "patient-123",
        "studyId": "LBP001",
        "name": "张三",
        "age": 45,
        "gender": "男",
        "phone": "13800138000",
        "onsetDate": "2024-10-01",
        "chiefComplaint": "腰痛3天",
        "createdDate": "2024-11-14T10:00:00Z",
        "lastModifiedDate": "2024-11-14T11:30:00Z",
        "workspaceId": "ws-001",
        "doctorId": "doc-001"
      }
    ],
    "totalCount": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

---

### 2. 获取单个患者详情

**Endpoint**: `GET /api/patients/{id}`

**路径参数**:
- `id`: 患者 ID

**请求头**:
```http
Authorization: Bearer {token}
X-Workspace-Id: ws-001
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "patient-123",
    "studyId": "LBP001",
    "name": "张三",
    "age": 45,
    "gender": "男",
    "phone": "13800138000",
    "onsetDate": "2024-10-01",
    "chiefComplaint": "腰痛3天",

    // 病史资料
    "medicalHistory": {
      "previousTreatment": "曾接受物理治疗",
      "surgicalHistory": "无",
      "medications": "布洛芬",
      "allergies": "无"
    },

    // 疼痛区域
    "painAreas": [
      {
        "area": "lower_back",
        "intensity": 7,
        "description": "钝痛"
      }
    ],

    // 主观检查
    "subjectiveExam": {
      "painDuration": "3天",
      "painPattern": "间歇性",
      "aggravatingFactors": "久坐",
      "relievingFactors": "休息"
    },

    // 客观检查
    "objectiveExam": {
      "rangeOfMotion": {
        "flexion": 45,
        "extension": 20
      },
      "neurologicalExam": "正常",
      "specialTests": {
        "slr": "阴性",
        "fabere": "阴性"
      }
    },

    // 功能评分
    "functionalScores": {
      "vas": 7,
      "oswestry": 40,
      "rolandMorris": 12
    },

    // AI 姿势分析
    "aiPostureAnalysis": {
      "standingTrunkAngle": 85.3,
      "flexionTrunkAngle": 132.7,
      "romDegrees": 47.4,
      "romAssessment": "轻度受限",
      "compensations": "膝关节轻度屈曲"
    },

    // 干预建议
    "intervention": {
      "diagnosis": "非特异性腰痛",
      "treatmentPlan": "物理治疗 + 运动疗法",
      "recommendations": "避免久坐，定期活动"
    },

    // 图像
    "images": [
      {
        "id": "img-001",
        "type": "xray",
        "url": "/api/images/img-001",
        "uploadedAt": "2024-11-14T10:30:00Z"
      }
    ],

    // 元数据
    "workspaceId": "ws-001",
    "workspaceName": "HKU Orthopedics",
    "doctorId": "doc-001",
    "doctorName": "Dr. Hao Wu",
    "createdDate": "2024-11-14T10:00:00Z",
    "lastModifiedDate": "2024-11-14T11:30:00Z"
  }
}
```

**错误码**:
- `PATIENT_NOT_FOUND`: 患者不存在
- `UNAUTHORIZED`: 无权限访问该患者

---

### 3. 创建患者

**Endpoint**: `POST /api/patients`

**请求头**:
```http
Content-Type: application/json
Authorization: Bearer {token}
X-Workspace-Id: ws-001
X-Doctor-Id: doc-001
```

**请求体**:
```json
{
  "studyId": "LBP001",
  "name": "张三",
  "age": 45,
  "gender": "男",
  "phone": "13800138000",
  "onsetDate": "2024-10-01",
  "chiefComplaint": "腰痛3天",
  "medicalHistory": { ... },
  "painAreas": [ ... ],
  "subjectiveExam": { ... },
  "objectiveExam": { ... },
  "functionalScores": { ... },
  "intervention": { ... }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "patient-123",
    "studyId": "LBP001",
    "createdDate": "2024-11-14T12:00:00Z",
    "message": "患者创建成功"
  }
}
```

**错误码**:
- `DUPLICATE_STUDY_ID`: Study ID 已存在
- `INVALID_DATA`: 数据验证失败
- `WORKSPACE_NOT_FOUND`: 工作室不存在

---

### 4. 更新患者

**Endpoint**: `PUT /api/patients/{id}`

**请求头**:
```http
Content-Type: application/json
Authorization: Bearer {token}
X-Workspace-Id: ws-001
```

**请求体**: 同创建患者（部分字段可选）

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "patient-123",
    "lastModifiedDate": "2024-11-14T13:00:00Z",
    "message": "患者更新成功"
  }
}
```

---

### 5. 删除患者

**Endpoint**: `DELETE /api/patients/{id}`

**请求头**:
```http
Authorization: Bearer {token}
X-Workspace-Id: ws-001
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "patient-123",
    "message": "患者删除成功"
  }
}
```

**错误码**:
- `PATIENT_NOT_FOUND`: 患者不存在
- `UNAUTHORIZED`: 无权限删除

---

## Image Upload API

### 1. 上传图像

**Endpoint**: `POST /api/patients/{patientId}/images`

**请求头**:
```http
Content-Type: multipart/form-data
Authorization: Bearer {token}
X-Workspace-Id: ws-001
```

**请求体** (multipart/form-data):
```
file: [binary data]
imageType: xray | mri | photo | posture
description: "站立位X光片"
```

**响应**:
```json
{
  "success": true,
  "data": {
    "imageId": "img-001",
    "url": "/api/images/img-001",
    "thumbnailUrl": "/api/images/img-001/thumbnail",
    "fileSize": 1024000,
    "mimeType": "image/jpeg",
    "uploadedAt": "2024-11-14T12:00:00Z"
  }
}
```

**限制**:
- 最大文件大小: 10MB
- 支持格式: JPG, PNG, DICOM
- 每个患者最多 50 张图像

---

### 2. 获取图像

**Endpoint**: `GET /api/images/{imageId}`

**响应**: 图像二进制数据

---

### 3. 删除图像

**Endpoint**: `DELETE /api/patients/{patientId}/images/{imageId}`

**响应**:
```json
{
  "success": true,
  "data": {
    "message": "图像删除成功"
  }
}
```

---

## External Integration API

### 1. 健康检查

**Endpoint**: `GET /api/health`

**响应**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "database": "connected",
    "timestamp": "2024-11-14T12:00:00Z"
  }
}
```

---

### 2. 获取工作室信息（只读）

**Endpoint**: `GET /api/workspaces/{workspaceId}`

**请求头**:
```http
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "ws-001",
    "name": "HKU Orthopedics",
    "description": "Hong Kong University Orthopedics Department",
    "isActive": true
  }
}
```

---

### 3. 获取医生信息（只读）

**Endpoint**: `GET /api/doctors/{doctorId}`

**请求头**:
```http
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "doc-001",
    "name": "Dr. Hao Wu",
    "email": "kafwu@connect.hku.hk",
    "specialty": "Orthopedics"
  }
}
```

---

## 数据模型

### Patient Entity (C#)

```csharp
public class Patient : FullAuditedAggregateRoot<Guid>
{
    // 基本信息
    public string StudyId { get; set; }
    public string Name { get; set; }
    public int? Age { get; set; }
    public string Gender { get; set; }
    public string Phone { get; set; }
    public DateTime? OnsetDate { get; set; }
    public string ChiefComplaint { get; set; }

    // 外部关联 (从外部系统传入)
    public Guid WorkspaceId { get; set; }
    public string WorkspaceName { get; set; }
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; }

    // 临床数据 (JSON 存储)
    public string MedicalHistoryJson { get; set; }
    public string PainAreasJson { get; set; }
    public string SubjectiveExamJson { get; set; }
    public string ObjectiveExamJson { get; set; }
    public string FunctionalScoresJson { get; set; }
    public string AiPostureAnalysisJson { get; set; }
    public string InterventionJson { get; set; }

    // 图像关联
    public virtual ICollection<PatientImage> Images { get; set; }

    // 备注
    public string Remarks { get; set; }
}
```

### PatientImage Entity (C#)

```csharp
public class PatientImage : Entity<Guid>
{
    public Guid PatientId { get; set; }
    public string ImageType { get; set; } // xray, mri, photo, posture
    public string FileName { get; set; }
    public string FilePath { get; set; }
    public string MimeType { get; set; }
    public long FileSize { get; set; }
    public string Description { get; set; }
    public DateTime UploadedAt { get; set; }

    public virtual Patient Patient { get; set; }
}
```

---

## 错误处理

### HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|:---|:---|:---|
| 200 | OK | 请求成功 |
| 201 | Created | 创建成功 |
| 400 | Bad Request | 数据验证失败 |
| 401 | Unauthorized | Token 无效或缺失 |
| 403 | Forbidden | 无权限访问资源 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 数据冲突（如 Study ID 重复） |
| 500 | Internal Server Error | 服务器错误 |

### 错误码列表

| 错误码 | HTTP 状态 | 说明 |
|:---|:---:|:---|
| `INVALID_TOKEN` | 401 | Token 无效或已过期 |
| `UNAUTHORIZED` | 403 | 无权限访问 |
| `PATIENT_NOT_FOUND` | 404 | 患者不存在 |
| `WORKSPACE_NOT_FOUND` | 404 | 工作室不存在 |
| `DOCTOR_NOT_FOUND` | 404 | 医生不存在 |
| `DUPLICATE_STUDY_ID` | 409 | Study ID 已存在 |
| `INVALID_DATA` | 400 | 数据验证失败 |
| `FILE_TOO_LARGE` | 400 | 文件超过大小限制 |
| `UNSUPPORTED_FILE_TYPE` | 400 | 不支持的文件类型 |
| `IMAGE_LIMIT_EXCEEDED` | 400 | 图像数量超过限制 |
| `DATABASE_ERROR` | 500 | 数据库错误 |
| `INTERNAL_ERROR` | 500 | 内部服务器错误 |

---

## 实现优先级

### Phase 1 (核心功能)
1. ✅ Patient CRUD API
2. ✅ External Token 验证
3. ✅ 基础错误处理

### Phase 2 (图像功能)
4. ⏳ Image Upload API
5. ⏳ Image Storage (文件系统或 Azure Blob)

### Phase 3 (优化)
6. ⏳ 分页优化
7. ⏳ 搜索功能
8. ⏳ 日志记录
9. ⏳ 性能监控

---

## 测试计划

### 单元测试
- [ ] Patient Service 测试
- [ ] Image Upload 测试
- [ ] Token 验证测试

### 集成测试
- [ ] API 端点测试
- [ ] 数据库操作测试
- [ ] 文件上传测试

### 端到端测试
- [ ] 前后端集成测试
- [ ] 外部系统集成测试

---

**下一步**: 开始 ABP vNext 项目创建和 PostgreSQL 配置
