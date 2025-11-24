# 数据库结构详解 - Low Back Pain System

**University of Hong Kong - Department of Orthopaedics & Traumatology**

**Last Updated:** 2025-10-24

**会议准备文档：用于讨论门诊腰痛数据收集表的后端数据库结构**

---

## 目录

1. [数据库技术选型](#数据库技术选型)
2. [当前数据表结构](#当前数据表结构)
3. [字段详细说明](#字段详细说明)
4. [JSON字段结构](#json字段结构)
5. [表单字段到数据库的映射](#表单字段到数据库的映射)
6. [需要讨论的问题](#需要讨论的问题)
7. [扩展建议](#扩展建议)

---

## 数据库技术选型

### 当前方案：SQLite 3

**数据库文件位置：** `backend/low_back_pain.db`

#### ✅ 优势

| 特点 | 说明 |
|:---|:---|
| **零配置** | 无需安装单独的数据库服务器，开箱即用 |
| **文件型存储** | 整个数据库就是一个文件，备份=复制文件 |
| **跨平台** | Windows、Mac、Linux全支持 |
| **轻量级** | 内存占用约1MB，不占用系统资源 |
| **事务安全** | ACID完全支持，数据可靠 |
| **适合场景** | 单中心、<1000患者、<5并发用户 |

#### ⚠️ 局限性

| 限制 | 影响 | 解决方案 |
|:---|:---|:---|
| **并发写入** | 同时只能1个用户写入 | 当前场景足够 |
| **网络访问** | 需要REST API包装 | 已实现（端口5003） |
| **多中心协作** | 不支持内置复制 | 升级到PostgreSQL |
| **大规模数据** | >5000患者性能下降 | 当前场景足够 |

#### 🔮 何时需要升级到PostgreSQL？

触发条件（满足任一条）：
- [ ] 患者数量 > 5000
- [ ] 并发用户 > 10
- [ ] 需要多中心数据共享
- [ ] 需要内置主从复制
- [ ] 需要高级查询优化

---

## 当前数据表结构

### Patients 表（核心表）

```sql
CREATE TABLE patients (
    ------------------------------------------------
    -- 主键和研究标识
    ------------------------------------------------
    id TEXT PRIMARY KEY,                    -- 自动生成，格式：patient-1760686123456
    study_id TEXT,                          -- 研究ID（必填）★

    ------------------------------------------------
    -- 基本人口学信息
    ------------------------------------------------
    name TEXT,                              -- 患者姓名
    gender TEXT,                            -- 性别："男" / "女"（必填）★
    age INTEGER,                            -- 年龄（必填）★
    phone TEXT,                             -- 联系电话

    ------------------------------------------------
    -- 病史信息
    ------------------------------------------------
    onset_date TEXT,                        -- 首次发作日期（ISO 8601格式）
    chief_complaint TEXT,                   -- 主诉（大文本）
    medical_history TEXT,                   -- 病史详情（大文本）
    pain_areas TEXT,                        -- 疼痛区域（JSON数组）

    ------------------------------------------------
    -- 临床检查
    ------------------------------------------------
    subjective_exam TEXT,                   -- 主观检查（大文本，包含JSON）
    objective_exam TEXT,                    -- 客观检查（大文本，包含JSON）
    functional_scores TEXT,                 -- 功能评分（JSON对象）
    intervention TEXT,                      -- 干预措施（大文本，包含JSON）

    ------------------------------------------------
    -- AI分析结果
    ------------------------------------------------
    ai_posture_analysis TEXT,               -- AI姿态分析结果（JSON对象）

    ------------------------------------------------
    -- 元数据
    ------------------------------------------------
    remarks TEXT,                           -- 备注
    created_date TEXT NOT NULL,             -- 创建时间（ISO 8601）
    last_sync_timestamp TEXT,               -- 最后更新时间（ISO 8601）
    workspace_id TEXT,                      -- 工作区ID（多工作区支持）

    ------------------------------------------------
    -- 完整数据备份
    ------------------------------------------------
    data_json TEXT                          -- 完整表单数据的JSON备份
);
```

**注：** ★ 表示前端标记为必填字段

---

## 字段详细说明

### 1. 主键和标识字段

| 字段 | 类型 | 约束 | 说明 | 示例 |
|:---|:---|:---|:---|:---|
| `id` | TEXT | PRIMARY KEY | 系统自动生成的唯一标识符 | `"patient-1760686123456"` |
| `study_id` | TEXT | 必填 | 研究编号，用户定义 | `"HKU2025001"` |
| `workspace_id` | TEXT | 可选 | 多工作区支持（预留） | `"workspace-1"` |

**生成规则：**
```javascript
// ID生成逻辑
const id = `patient-${Date.now()}`;  // patient-1760686123456
```

---

### 2. 基本人口学信息

| 字段 | 类型 | 约束 | 说明 | 示例 | 前端组件 |
|:---|:---|:---|:---|:---|:---|
| `name` | TEXT | 可选 | 患者姓名（可匿名化） | `"张三"` | Text Input |
| `gender` | TEXT | 必填 | 性别 | `"男"` / `"女"` | Radio Buttons |
| `age` | INTEGER | 必填 | 年龄（岁） | `45` | Number Input |
| `phone` | TEXT | 可选 | 联系电话 | `"13800138000"` | Text Input |

**匿名化支持：**
- 患者姓名可以用编号替代（如 "P001"）
- 系统支持匿名模式

---

### 3. 病史信息

| 字段 | 类型 | 说明 | 示例 |
|:---|:---|:---|:---|
| `onset_date` | TEXT | 首次发作日期（ISO 8601） | `"2025-10-15"` |
| `chief_complaint` | TEXT | 主诉（大文本，支持OCR识别） | `"腰痛3个月，加重1周，伴左下肢放射痛"` |
| `medical_history` | TEXT | 病史（大文本） | `"高血压病史5年，糖尿病史3年"` |
| `pain_areas` | TEXT | 疼痛区域（JSON数组） | `["lower_back", "left_leg"]` |

---

### 4. 临床检查字段

#### A. 主观检查 (`subjective_exam` - TEXT)

**存储内容：** JSON格式的复杂对象

**包含信息：**
- 疼痛评分 (NPRS 0-10)
- 耐受时间（坐、站、走）
- 辅助工具
- 间歇性跛行距离
- 危险信号筛查（红旗征象）
- 颈椎相关手功能问题

**数据结构示例：**
```json
{
  "pain_score": 7,
  "sitting_tolerance": 30,
  "standing_tolerance": 15,
  "walking_tolerance": 20,
  "assistive_tools": "拐杖",
  "has_assistive_tools": true,
  "claudication_distance": "200米",
  "has_claudication": true,
  "red_flags": {
    "weight_loss": false,
    "fever": false,
    "night_pain": true,
    "bladder_bowel_dysfunction": false
  },
  "cervical_function_problems": {
    "dropping_objects": false,
    "writing_difficulty": true
  }
}
```

#### B. 客观检查 (`objective_exam` - TEXT)

**存储内容：** JSON格式的复杂对象

**包含信息：**
- 体态检查（颈椎、腰椎）
- ROM活动度检查
- 特殊试验（直腿抬高、股神经牵拉）
- 反射检查（二头肌、三头肌、膝反射、踝反射）
- 远端下肢脉搏
- 审核状态标记

**数据结构示例：**
```json
{
  "cervical_posture": "正常曲度",
  "lumbar_posture": "腰椎前凸过度",

  "cervical_rom": {
    "flexion": "40°",
    "extension": "50°",
    "left_lateral": "35°",
    "right_lateral": "35°",
    "left_rotation": "70°",
    "right_rotation": "70°"
  },

  "lumbar_rom": {
    "flexion": "60°",
    "extension": "20°",
    "left_lateral": "25°",
    "right_lateral": "25°"
  },

  "rom_reviewed": true,

  "slr_test": {
    "left_angle": "45°",
    "right_angle": "70°"
  },

  "femoral_nerve_test": {
    "left": "阳性",
    "right": "阴性"
  },

  "special_test_reviewed": true,

  "reflexes": {
    "biceps_left": "++",
    "biceps_right": "++",
    "triceps_left": "+",
    "triceps_right": "+",
    "knee_left": "++",
    "knee_right": "+++",
    "ankle_left": "+",
    "ankle_right": "+"
  },

  "distal_pulse": "存在"
}
```

#### C. 功能评分 (`functional_scores` - TEXT)

**数据结构示例：**
```json
{
  "rmdq_score": 12,        // 罗兰-莫里斯残疾问卷 (0-24分)
  "ndi_score": 35          // 颈部残疾指数 (0-100%)
}
```

#### D. 干预措施 (`intervention` - TEXT)

**存储内容：** JSON格式对象

**数据结构示例：**
```json
{
  "interventions": {
    "posture_correction": true,
    "pain_management": true,
    "therapeutic_exercise": false,
    "gait_reeducation": false
  },

  "recommendations": {
    "discharge_with_advice": false,
    "specialist_followup": true,
    "outpatient_pt": true,
    "day_rehabilitation": false,
    "medication_intervention": true
  },

  "medication_details": "布洛芬缓释胶囊 200mg 每日2次 餐后服用 连续7天",

  "remarks": "患者依从性良好，建议2周后复诊"
}
```

---

### 5. AI分析结果

#### `ai_posture_analysis` (TEXT)

**存储内容：** MediaPipe姿态分析的结果

**数据结构示例：**
```json
{
  "rom_degrees": 47.4,
  "rom_assessment": "轻度受限",
  "trunk_angle_standing": 92.3,
  "trunk_angle_flexion": 139.7,
  "pelvic_tilt_standing": 8.5,
  "pelvic_tilt_flexion": 12.3,
  "knee_angle_left_standing": 178.5,
  "knee_angle_right_standing": 179.2,
  "knee_angle_left_flexion": 165.4,
  "knee_angle_right_flexion": 168.7,
  "compensations": "膝关节轻度屈曲，右侧髋部轻度偏移",
  "recommendations": "建议增加髋关节活动度训练，注意骨盆稳定性",
  "annotatedStandingUrl": "blob:http://localhost:5173/xxx",
  "annotatedFlexionUrl": "blob:http://localhost:5173/yyy"
}
```

**说明：**
- `rom_degrees`: 前屈ROM角度（度）
- `rom_assessment`: 中文评估（正常/轻度受限/中度受限/重度受限）
- 图片URL为blob URL，仅前端临时使用

---

### 6. 元数据字段

| 字段 | 类型 | 说明 | 示例 |
|:---|:---|:---|:---|
| `remarks` | TEXT | 备注（大文本） | `"患者对治疗反应良好"` |
| `created_date` | TEXT | 创建时间（ISO 8601） | `"2025-10-17T10:30:00.000Z"` |
| `last_sync_timestamp` | TEXT | 最后更新时间 | `"2025-10-17T15:45:00.000Z"` |

---

### 7. 完整数据备份

#### `data_json` (TEXT)

**目的：** 存储整个表单的完整结构化数据

**为什么需要？**
1. **向后兼容**：即使修改表结构，历史数据完整保留
2. **数据恢复**：单个字段损坏时可从完整备份恢复
3. **数据导出**：便于导出完整的患者数据
4. **审计追踪**：保留数据的原始完整形态

**数据结构：** 完整表单的嵌套JSON对象

---

## JSON字段结构

### 疼痛区域 (`pain_areas`)

**类型：** JSON数组

**可选值：**
```javascript
const PAIN_AREA_OPTIONS = [
  "lower_back",     // 下腰部
  "upper_back",     // 上腰部
  "left_leg",       // 左腿
  "right_leg",      // 右腿
  "buttocks",       // 臀部
  "neck"            // 颈部
];
```

**存储示例：**
```json
["lower_back", "left_leg", "buttocks"]
```

**前端显示：** 人体图点击选择

---

## 表单字段到数据库的映射

### 第1步：基本信息

| 前端字段 | 数据库字段 | 类型 | 必填 |
|:---|:---|:---|:---:|
| 患者姓名 | `name` | TEXT | ❌ |
| Study ID | `study_id` | TEXT | ✅ |
| 联系电话 | `phone` | TEXT | ❌ |
| 年龄 | `age` | INTEGER | ✅ |
| 性别 | `gender` | TEXT | ✅ |

### 第2步：疼痛区域

| 前端字段 | 数据库字段 | 类型 |
|:---|:---|:---|
| 疼痛区域（人体图） | `pain_areas` | JSON数组 |

### 第3步：病史

| 前端字段 | 数据库字段 | 存储位置 |
|:---|:---|:---|
| 主诉 | `chief_complaint` | 独立字段 |
| 现病史类型 | `medical_history` → `history_type` | JSON内 |
| 初次发作日期 | `onset_date` | 独立字段 |
| 疼痛类型 | `medical_history` → `pain_type` | JSON内 |
| 加重因素 | `medical_history` → `aggravating_factors` | JSON内 |
| 缓解因素 | `medical_history` → `relieving_factors` | JSON内 |
| 是否有放射痛 | `medical_history` → `has_radiation` | JSON内 |
| 放射至何处 | `medical_history` → `radiation_location` | JSON内 |
| 其他已接受治疗 | `medical_history` → `previous_treatment` | JSON内 |
| 病情进展 | `medical_history` → `condition_progress` | JSON内 |

### 第4步：主观检查

| 前端字段 | 存储位置 |
|:---|:---|
| 疼痛评分 (0-10) | `subjective_exam` → `pain_score` |
| 坐姿耐受时间 | `subjective_exam` → `sitting_tolerance` |
| 站立耐受时间 | `subjective_exam` → `standing_tolerance` |
| 行走耐受时间 | `subjective_exam` → `walking_tolerance` |
| 辅助工具 | `subjective_exam` → `assistive_tools` |
| 间歇性跛行距离 | `subjective_exam` → `claudication_distance` |
| 危险信号筛查 | `subjective_exam` → `red_flags` |
| 颈椎相关手功能 | `subjective_exam` → `cervical_function_problems` |

### 第5步：客观检查

| 前端字段 | 存储位置 |
|:---|:---|
| AI姿态分析 | `ai_posture_analysis` (独立字段) |
| 颈椎体态 | `objective_exam` → `cervical_posture` |
| 腰椎体态 | `objective_exam` → `lumbar_posture` |
| 颈椎活动度 | `objective_exam` → `cervical_rom` |
| 腰椎活动度 | `objective_exam` → `lumbar_rom` |
| ROM审核状态 | `objective_exam` → `rom_reviewed` |
| 直腿抬高试验 | `objective_exam` → `slr_test` |
| 股神经牵拉试验 | `objective_exam` → `femoral_nerve_test` |
| 特殊试验审核状态 | `objective_exam` → `special_test_reviewed` |
| 反射检查 | `objective_exam` → `reflexes` |
| 远端下肢脉搏 | `objective_exam` → `distal_pulse` |

### 第6步：功能评分

| 前端字段 | 存储位置 |
|:---|:---|
| RMDQ评分 | `functional_scores` → `rmdq_score` |
| NDI评分 | `functional_scores` → `ndi_score` |

### 第7步：干预措施

| 前端字段 | 存储位置 |
|:---|:---|
| 干预措施（多选） | `intervention` → `interventions` |
| 后续建议（多选） | `intervention` → `recommendations` |
| 药物信息 | `intervention` → `medication_details` |
| 备注 | `remarks` (独立字段) |

---

## 需要讨论的问题

### 1. 数据结构设计

#### 问题1.1：JSON字段 vs 关系型表
**当前设计：** 大部分复杂数据存储在JSON字段中

**优势：**
- ✅ 灵活：字段可动态扩展，不需要ALTER TABLE
- ✅ 版本兼容：历史数据结构变化不影响老数据
- ✅ 完整性：数据结构清晰，易于理解

**劣势：**
- ❌ 查询困难：无法直接SQL查询JSON内部字段
- ❌ 性能：大量数据时JSON解析开销大
- ❌ 数据约束：无法在数据库层面强制字段类型

**替代方案：拆分成多个关系表**

```sql
-- 方案2：关系型设计
CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    study_id TEXT,
    name TEXT,
    gender TEXT,
    age INTEGER,
    phone TEXT
);

CREATE TABLE medical_history (
    id INTEGER PRIMARY KEY,
    patient_id TEXT,
    history_type TEXT,
    pain_type TEXT,
    onset_date TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE rom_measurements (
    id INTEGER PRIMARY KEY,
    patient_id TEXT,
    cervical_flexion REAL,
    cervical_extension REAL,
    lumbar_flexion REAL,
    -- ...更多字段
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- ...更多表
```

**讨论点：**
- [ ] 当前JSON方案是否满足查询需求？
- [ ] 未来是否需要复杂的SQL查询和统计？
- [ ] 数据量预期（影响性能考虑）

#### 问题1.2：字段命名规范
**当前：** 混合使用
- 英文：`id`, `age`, `gender`
- 中文拼音：部分字段名称较长

**建议：** 统一命名规范
- 全英文（推荐）：`chief_complaint`, `pain_areas`
- 加注释说明中文含义

**讨论点：**
- [ ] 是否需要统一命名规范？
- [ ] 中文字段名在代码中的可维护性

#### 问题1.3：必填字段约束
**当前：** 数据库层面几乎无约束，仅前端验证

**建议：** 在数据库层面添加NOT NULL约束

```sql
CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    study_id TEXT NOT NULL,      -- 必填
    age INTEGER NOT NULL,         -- 必填
    gender TEXT NOT NULL,         -- 必填
    created_date TEXT NOT NULL,
    -- ...
);
```

**讨论点：**
- [ ] 哪些字段应该在数据库层面强制必填？
- [ ] 是否需要CHECK约束（如age > 0, age < 150）？

---

### 2. 数据完整性

#### 问题2.1：外键关系
**当前：** 无外键约束，单表设计

**未来扩展：** 如果需要多表

```sql
-- 示例：如果拆分成多表
CREATE TABLE patients (...);
CREATE TABLE examinations (
    id INTEGER PRIMARY KEY,
    patient_id TEXT NOT NULL,
    exam_date TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

**讨论点：**
- [ ] 是否需要拆分成多表？
- [ ] 如果拆分，删除患者时如何处理关联数据？（CASCADE / RESTRICT）

#### 问题2.2：数据验证
**当前：** 主要在前端验证

**可选方案：** 添加数据库CHECK约束

```sql
CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    age INTEGER CHECK (age >= 0 AND age <= 150),
    gender TEXT CHECK (gender IN ('男', '女')),
    -- ...
);
```

**讨论点：**
- [ ] 是否需要数据库层面的数据验证？
- [ ] 哪些字段需要CHECK约束？

---

### 3. 性能优化

#### 问题3.1：索引设计
**当前：** 仅id为主键，无其他索引

**建议索引：**
```sql
CREATE INDEX idx_study_id ON patients(study_id);
CREATE INDEX idx_created_date ON patients(created_date);
CREATE INDEX idx_name ON patients(name);
```

**讨论点：**
- [ ] 主要的查询场景是什么？（按姓名？按日期？）
- [ ] 需要在哪些字段上建立索引？

#### 问题3.2：JSON字段查询
**当前：** 无法高效查询JSON内部字段

**SQLite JSON扩展：**
```sql
-- 查询疼痛评分>7的患者
SELECT * FROM patients
WHERE json_extract(subjective_exam, '$.pain_score') > 7;

-- 查询有夜间疼痛的患者
SELECT * FROM patients
WHERE json_extract(subjective_exam, '$.red_flags.night_pain') = true;
```

**讨论点：**
- [ ] 是否需要频繁查询JSON字段？
- [ ] 如果需要，是否考虑拆表或添加计算列？

---

### 4. 数据备份与恢复

#### 问题4.1：备份策略
**当前：** 手动复制数据库文件

**建议：**
- [ ] 自动定时备份（每日/每周）
- [ ] 保留多个历史版本
- [ ] 备份到云存储（如有需要）

#### 问题4.2：数据导出
**需求：**
- [ ] 导出为Excel格式
- [ ] 导出为CSV格式
- [ ] 导出为PDF报告
- [ ] 是否需要匿名化导出？

---

### 5. 多用户与权限

#### 问题5.1：多用户协作
**当前：** 单用户设计，无用户表

**如需多用户：**
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT,  -- 'admin', 'doctor', 'researcher'
    created_date TEXT
);

ALTER TABLE patients ADD COLUMN created_by TEXT;
ALTER TABLE patients ADD FOREIGN KEY (created_by) REFERENCES users(id);
```

**讨论点：**
- [ ] 是否需要多用户支持？
- [ ] 是否需要权限管理？
- [ ] 数据是否需要按创建者隔离？

#### 问题5.2：审计日志
**需求：**
- [ ] 是否需要记录数据修改历史？
- [ ] 谁在何时修改了哪些数据？

```sql
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY,
    patient_id TEXT,
    user_id TEXT,
    action TEXT,  -- 'create', 'update', 'delete'
    changed_fields TEXT,  -- JSON
    timestamp TEXT
);
```

---

### 6. 数据迁移与版本管理

#### 问题6.1：数据库版本
**当前：** 无版本管理

**建议：** 添加版本表

```sql
CREATE TABLE schema_version (
    version INTEGER PRIMARY KEY,
    applied_date TEXT,
    description TEXT
);

INSERT INTO schema_version VALUES (1, '2025-10-24', 'Initial schema');
```

#### 问题6.2：字段变更
**场景：** 未来需要添加新字段

**策略：**
- [ ] 使用ALTER TABLE添加新字段
- [ ] 历史数据如何处理？（设置默认值？保留NULL？）
- [ ] 是否需要数据迁移脚本？

---

## 扩展建议

### 短期优化（<1个月）

1. **添加基本索引**
```sql
CREATE INDEX idx_study_id ON patients(study_id);
CREATE INDEX idx_created_date ON patients(created_date);
```

2. **添加必填约束**
```sql
-- 需要重建表，添加NOT NULL约束
ALTER TABLE patients ...
```

3. **实现自动备份脚本**
```bash
#!/bin/bash
# 每日备份
cp backend/low_back_pain.db backups/low_back_pain_$(date +%Y%m%d).db
```

### 中期优化（1-3个月）

1. **添加数据导出功能**
   - Excel导出
   - CSV导出
   - 匿名化选项

2. **添加数据统计报表**
   - 患者年龄分布
   - 疼痛评分统计
   - ROM测量趋势

3. **实现审核工作流**
   - 草稿/已审核状态
   - 审核人记录
   - 审核时间记录

### 长期规划（>3个月）

1. **多用户系统**
   - 用户表
   - 角色权限
   - 数据隔离

2. **数据库迁移（如需要）**
   - SQLite → PostgreSQL
   - 多中心数据同步
   - 云端部署

3. **高级查询功能**
   - 复杂条件筛选
   - 数据可视化
   - 机器学习分析

---

## 附录

### A. 完整建表语句

```sql
CREATE TABLE patients (
    -- 主键和标识
    id TEXT PRIMARY KEY,
    study_id TEXT NOT NULL,
    workspace_id TEXT,

    -- 基本信息
    name TEXT,
    gender TEXT NOT NULL CHECK (gender IN ('男', '女')),
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
    phone TEXT,

    -- 病史
    onset_date TEXT,
    chief_complaint TEXT,
    medical_history TEXT,
    pain_areas TEXT,

    -- 检查
    subjective_exam TEXT,
    objective_exam TEXT,
    functional_scores TEXT,
    intervention TEXT,

    -- AI分析
    ai_posture_analysis TEXT,

    -- 元数据
    remarks TEXT,
    created_date TEXT NOT NULL,
    last_sync_timestamp TEXT,

    -- 完整备份
    data_json TEXT
);

-- 索引
CREATE INDEX idx_study_id ON patients(study_id);
CREATE INDEX idx_created_date ON patients(created_date);
CREATE INDEX idx_name ON patients(name);
```

### B. 示例查询

```sql
-- 查询所有患者
SELECT id, study_id, name, age, gender, created_date FROM patients;

-- 按Study ID查询
SELECT * FROM patients WHERE study_id = 'HKU2025001';

-- 按日期范围查询
SELECT * FROM patients
WHERE created_date >= '2025-10-01' AND created_date < '2025-11-01';

-- 查询疼痛评分>7的患者（需要JSON解析）
SELECT
    study_id,
    name,
    json_extract(subjective_exam, '$.pain_score') as pain_score
FROM patients
WHERE json_extract(subjective_exam, '$.pain_score') > 7;

-- 统计患者年龄分布
SELECT
    CASE
        WHEN age < 30 THEN '18-30'
        WHEN age < 50 THEN '30-50'
        WHEN age < 70 THEN '50-70'
        ELSE '70+'
    END as age_group,
    COUNT(*) as count
FROM patients
GROUP BY age_group;
```

### C. 数据导出示例

```bash
# 导出为CSV
sqlite3 -header -csv backend/low_back_pain.db "SELECT * FROM patients;" > patients.csv

# 导出特定字段
sqlite3 -header -csv backend/low_back_pain.db \
  "SELECT study_id, name, age, gender, created_date FROM patients;" > patients_basic.csv
```

---

## 会议讨论清单

**准备材料：**
- [x] 当前数据库结构文档
- [x] 表单字段映射表
- [x] JSON字段示例数据
- [ ] 数据量预估（预期多少患者？）
- [ ] 查询场景需求（主要查询什么？）

**需要决定的事项：**
1. [ ] JSON字段 vs 关系型表设计
2. [ ] 必填字段和约束规则
3. [ ] 索引设计策略
4. [ ] 备份和恢复方案
5. [ ] 是否需要多用户支持
6. [ ] 是否需要审计日志
7. [ ] 数据导出需求
8. [ ] 未来扩展规划

---

**文档准备人：** 吴昊
**会议日期：** 待定
**参会人员：** Morgan, 小波, Poppy, 彭宇, Grace, 吴昊

**Last Updated:** 2025-10-24 22:00
