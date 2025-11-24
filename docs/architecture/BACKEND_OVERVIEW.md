# 后端架构介绍 - Low Back Pain System

**University of Hong Kong - Department of Orthopaedics & Traumatology**

**Last Updated:** 2025-10-24

---

## 目录

1. [整体架构](#整体架构)
2. [后端服务组成](#后端服务组成)
3. [数据库设计](#数据库设计)
4. [API接口](#api接口)
5. [部署架构](#部署架构)
6. [技术栈](#技术栈)

---

## 整体架构

```
┌─────────────────────────────────────────────────────┐
│                  前端 (React)                       │
│                  Port: 5173                         │
└────────┬──────────────┬─────────────┬──────────────┘
         │              │             │
         │              │             │
    ┌────▼────┐    ┌────▼────┐  ┌────▼────────┐
    │  OCR    │    │  Pose   │  │  Database   │
    │ Service │    │ Service │  │   Service   │
    │ :5001   │    │ :5002   │  │   :5003     │
    └─────────┘    └─────────┘  └──────┬──────┘
                                        │
                                        ▼
                                ┌───────────────┐
                                │   SQLite DB   │
                                │ low_back_pain │
                                │     .db       │
                                └───────────────┘
```

---

## 后端服务组成

### 1. OCR Service (文字识别服务)

**端口:** 5001
**文件:** `backend/ocr_service.py`
**技术:** Python + Flask + PaddleOCR

#### 功能
- 📄 **医疗表单自动识别**：从拍照或扫描的医疗表单中提取患者信息
- 🇨🇳 **中英文混合识别**：支持中文和英文文字识别
- ⚡ **GPU加速**：使用CUDA加速，2-5秒完成识别
- 🎯 **智能字段映射**：自动识别姓名、年龄、性别、主诉等字段

#### API端点
```bash
GET  /health             # 健康检查
POST /ocr/process        # 单张图片识别
POST /ocr/batch          # 批量图片识别
```

#### 使用场景
用户在前端上传患者信息表单照片 → OCR服务识别文字 → 自动填充表单字段

---

### 2. Pose Estimation Service (姿态分析服务)

**端口:** 5002
**文件:** `backend/pose_service.py`
**技术:** Python + Flask + MediaPipe

#### 功能
- 🧍 **姿态识别**：基于MediaPipe的33个关键点人体姿态识别
- 📐 **临床测量**：
  - 躯干角度计算（站立位 vs 前屈位）
  - ROM（活动范围）测量
  - 骨盆倾斜角度
  - 膝关节角度
- 🎯 **代偿检测**：识别异常代偿动作（膝关节屈曲、髋部偏移等）
- 💡 **临床建议**：根据测量结果生成临床建议

#### API端点
```bash
GET  /health                    # 健康检查
POST /pose/analyze-static       # 分析站立位和前屈位照片
```

#### 性能
- ⚡ **处理时间**：<2秒
- 💰 **成本**：完全免费（本地处理）
- 🎯 **精度**：±2-3度

#### 使用场景
用户上传患者站立和前屈两张照片 → 姿态分析服务处理 → 返回ROM测量、代偿检测、临床建议

---

### 3. Database Service (数据库服务)

**端口:** 5003
**文件:** `backend/database_service.py`
**技术:** Python + Flask + SQLite3

#### 功能
- 💾 **患者数据存储**：所有患者信息的持久化存储
- 🔄 **CRUD操作**：创建、读取、更新、删除患者记录
- 🔍 **数据查询**：支持按study_id、姓名等查询
- 📊 **跨设备同步**：支持多设备访问同一数据库

#### API端点
```bash
GET  /health                    # 健康检查
GET  /patients                  # 获取所有患者列表
GET  /patients/:id              # 获取单个患者详情
POST /patients                  # 创建新患者
PUT  /patients/:id              # 更新患者信息
DELETE /patients/:id            # 删除患者
```

#### 数据存储位置
```
backend/
  └── low_back_pain.db          # SQLite数据库文件
```

---

## 数据库设计

### 数据库技术选型：SQLite

#### 为什么选择SQLite？
- ✅ **零配置**：无需单独的数据库服务器
- ✅ **文件型数据库**：数据库就是一个文件，备份简单（复制文件即可）
- ✅ **跨平台**：Windows、Mac、Linux都支持
- ✅ **可靠性**：ACID事务支持，崩溃安全
- ✅ **轻量级**：内存占用小（~1MB）
- ✅ **适合单中心**：适合<1000患者的单中心研究

#### 何时需要升级？
如果未来需要以下功能，建议升级到PostgreSQL：
- 多中心协作（>5个中心同时使用）
- 大规模数据（>5000患者）
- 高并发写入（>100用户同时编辑）
- 内置数据库复制和备份

---

### 数据表结构：Patients表

```sql
CREATE TABLE patients (
    -- 基本信息
    id TEXT PRIMARY KEY,              -- 自动生成：patient-1760686123456
    study_id TEXT,                    -- 研究ID（必填）
    name TEXT,                        -- 患者姓名
    gender TEXT,                      -- 性别："男" or "女"
    age INTEGER,                      -- 年龄
    phone TEXT,                       -- 联系电话

    -- 病史信息
    onset_date TEXT,                  -- 发病日期
    chief_complaint TEXT,             -- 主诉
    medical_history TEXT,             -- 既往史
    pain_areas TEXT,                  -- 疼痛区域（JSON数组）

    -- 检查信息
    subjective_exam TEXT,             -- 主观检查
    objective_exam TEXT,              -- 客观检查
    functional_scores TEXT,           -- 功能评分（JSON对象）
    intervention TEXT,                -- 干预措施

    -- AI分析结果
    ai_posture_analysis TEXT,         -- AI姿态分析结果（JSON对象）

    -- 元数据
    remarks TEXT,                     -- 备注
    created_date TEXT NOT NULL,       -- 创建时间
    last_sync_timestamp TEXT,         -- 最后同步时间
    workspace_id TEXT,                -- 工作区ID

    -- 完整数据备份
    data_json TEXT                    -- 完整患者数据的JSON备份
);
```

---

### JSON字段说明

系统中有几个字段使用JSON格式存储复杂数据：

#### 1. `pain_areas` - 疼痛区域（JSON数组）
```json
["lower_back", "left_leg", "right_leg"]
```

可选值：
- `lower_back` - 下腰部
- `upper_back` - 上腰部
- `left_leg` - 左腿
- `right_leg` - 右腿
- `buttocks` - 臀部
- `neck` - 颈部

#### 2. `functional_scores` - 功能评分（JSON对象）
```json
{
  "rmdq_score": 12,           // 罗兰-莫里斯残疾问卷 (0-24)
  "ndi_score": 35,            // 颈部残疾指数 (0-100)
  "pain_score": 7             // NPRS疼痛评分 (0-10)
}
```

#### 3. `ai_posture_analysis` - AI姿态分析（JSON对象）
```json
{
  "rom_degrees": 47.4,                    // ROM角度（度）
  "rom_assessment": "轻度受限",            // ROM评估
  "trunk_angle_standing": 92.3,           // 站立位躯干角度
  "trunk_angle_flexion": 139.7,           // 前屈位躯干角度
  "compensations": "膝关节轻度屈曲",       // 代偿动作
  "recommendations": "建议增加髋关节活动度训练",
  "annotatedStandingUrl": "...",          // 标注图片URL
  "annotatedFlexionUrl": "..."            // 标注图片URL
}
```

#### 4. `data_json` - 完整数据备份（JSON对象）
存储整个表单的完整数据，包括所有字段的详细信息（嵌套对象）

---

## API接口

### 前端如何调用后端？

前端使用 `src/api/integrations.js` 中定义的函数调用后端API：

```javascript
// OCR服务调用
import { InvokeLLM, UploadFile } from '@/api/integrations';

// 上传文件获取URL
const { file_url } = await UploadFile({ file });

// 调用OCR识别
const text = await InvokeLLM({
  prompt: "提取这张图片中的文字",
  file_urls: [file_url]
});

// 姿态分析调用
const response = await fetch('http://localhost:5002/pose/analyze-static', {
  method: 'POST',
  body: formData
});

// 数据库操作
import { fetchPatients, createPatient, updatePatient } from '@/api/entities';

// 获取所有患者
const patients = await fetchPatients();

// 创建患者
const newPatient = await createPatient({
  study_id: "HKU2025001",
  name: "张三",
  age: 45,
  gender: "男"
});

// 更新患者
await updatePatient(patientId, updatedData);
```

---

## 部署架构

### 本地开发环境

```
E:\claude-code\low back pain system\
├── frontend/              # React前端代码
│   └── src/
├── backend/               # Python后端服务
│   ├── ocr_service.py    # OCR服务 (5001)
│   ├── pose_service.py   # 姿态服务 (5002)
│   ├── database_service.py  # 数据库服务 (5003)
│   └── low_back_pain.db  # SQLite数据库文件
└── start_all_services.bat # 一键启动脚本
```

### 启动方式

#### 方法1：一键启动（推荐）
```bash
双击：start_all_services.bat
```

#### 方法2：手动启动
```bash
# Terminal 1 - OCR服务
cd backend
python ocr_service.py

# Terminal 2 - 姿态服务
cd backend
python pose_service.py

# Terminal 3 - 数据库服务
cd backend
python database_service.py

# Terminal 4 - 前端
npm run dev
```

---

### 网络访问

**电脑端：** http://localhost:5173

**手机端（通过WiFi热点）：**
1. 手机开启热点，电脑连接
2. 查看电脑IP：`ipconfig`（例如：172.20.10.4）
3. 手机浏览器访问：http://172.20.10.4:5173

**防火墙配置：**
系统自动配置了防火墙规则，允许以下端口的入站连接：
- 5173 (前端)
- 5001 (OCR)
- 5002 (姿态)
- 5003 (数据库)

---

## 技术栈

### 后端技术
| 服务 | 语言 | 框架 | 核心库 | 端口 |
|:---|:---|:---|:---|:---:|
| OCR | Python 3.12 | Flask | PaddleOCR | 5001 |
| Pose | Python 3.12 | Flask | MediaPipe | 5002 |
| Database | Python 3.12 | Flask | SQLite3 | 5003 |

### 前端技术
- **框架**: React 18
- **构建工具**: Vite
- **UI库**: TailwindCSS + shadcn/ui
- **状态管理**: React Hooks
- **HTTP客户端**: Fetch API

### 数据库
- **类型**: SQLite 3
- **存储**: 文件型数据库 (`low_back_pain.db`)
- **访问**: REST API

---

## 数据流程示例

### 场景1：新增患者并填写信息

```
1. 用户点击"新增患者"
   ↓
2. 用户拍摄患者信息表单
   ↓
3. 前端上传图片到OCR服务 (5001)
   ↓
4. OCR服务识别文字并返回结构化数据
   ↓
5. 前端自动填充表单字段
   ↓
6. 用户完成其他信息填写
   ↓
7. 用户上传站立和前屈照片
   ↓
8. 前端发送照片到姿态服务 (5002)
   ↓
9. 姿态服务分析并返回ROM、代偿等数据
   ↓
10. 前端展示分析结果
    ↓
11. 用户点击"提交"
    ↓
12. 前端调用数据库服务API (5003)
    ↓
13. 数据保存到SQLite数据库
    ↓
14. 返回成功，显示在患者列表
```

---

## 备份与维护

### 数据备份
```bash
# 方法1：直接复制数据库文件
cp backend/low_back_pain.db backend/backups/low_back_pain_backup_$(date +%Y%m%d).db

# 方法2：使用SQLite命令
sqlite3 backend/low_back_pain.db ".backup backend/backups/backup.db"
```

### 数据恢复
```bash
# 直接替换数据库文件
cp backend/backups/backup.db backend/low_back_pain.db
```

### 数据库维护
```bash
# 查看数据库统计
sqlite3 backend/low_back_pain.db "SELECT COUNT(*) FROM patients;"

# 导出数据为CSV
sqlite3 -header -csv backend/low_back_pain.db "SELECT * FROM patients;" > patients.csv
```

---

## 性能指标

| 指标 | 数值 | 说明 |
|:---|:---|:---|
| OCR识别速度 | 2-5秒 | GPU加速，单张图片 |
| 姿态分析速度 | <2秒 | 2张照片分析 |
| 数据库响应 | <100ms | 单次查询 |
| 前端加载 | <3秒 | 首次加载 |
| 跨设备同步 | 3秒轮询 | 自动同步 |

---

## 安全性

### 数据隔离
- ✅ 本地网络访问：数据不离开本地网络
- ✅ 无云服务：所有处理在本地完成
- ✅ 患者隐私：支持匿名化功能

### 访问控制
- ⚠️ 当前版本：无身份验证（适用于单用户/研究环境）
- 🔮 未来版本：可添加用户登录和权限管理

---

## 未来扩展方向

### 短期（<3个月）
- [ ] 用户认证系统
- [ ] 数据导出功能（Excel、PDF）
- [ ] 批量患者导入
- [ ] 数据统计报表

### 中期（3-6个月）
- [ ] 多用户协作
- [ ] 角色权限管理
- [ ] 审计日志
- [ ] 自动化备份

### 长期（>6个月）
- [ ] 迁移到PostgreSQL（如需多中心）
- [ ] 云端部署选项
- [ ] 移动端原生App
- [ ] 高级数据分析和可视化

---

## 技术支持

**文档：**
- [README.md](README.md) - 项目总览
- [START_GUIDE.md](START_GUIDE.md) - 启动指南
- [.specify/ARCHITECTURE.md](.specify/ARCHITECTURE.md) - 系统架构详细文档
- [.specify/DATABASE.md](.specify/DATABASE.md) - 数据库详细文档
- [.specify/API.md](.specify/API.md) - API完整文档

**GitHub仓库：** https://github.com/wuhar14-bot/low_back_pain_system

---

**Last Updated:** 2025-10-24 21:45
