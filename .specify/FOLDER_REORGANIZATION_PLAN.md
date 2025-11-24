# 文件夹重组计划 - Low Back Pain System

**创建日期**: 2025-11-14
**目的**: 简化项目结构，使用 `.specify` 作为标准参考

---

## 📋 当前问题

根目录下文件混乱，包含：
- 59+ 个各类文档文件 (.md)
- 多个临时脚本 (.py, .ps1, .bat, .js)
- 测试文件、生成文件、配置文件混杂
- 缺乏清晰的文件夹组织结构

**用户反馈**: "现在的结构我已经看不懂了"

---

## 🎯 重组目标

1. **清晰的文件夹层次结构** - 按功能区分目录
2. **以 `.specify` 为标准** - 保留最新、最权威的文档
3. **归档历史文件** - 旧文档移到 `_archive` 文件夹
4. **删除临时文件** - 清理生成文件和测试脚本

---

## 📁 新文件夹结构

```
low back pain system/
├── .specify/                        # ✅ 标准文档（保持不变）
│   ├── REQUIREMENTS.md              # 需求文档
│   ├── NEW_API_DESIGN.md            # 最新 API 设计
│   ├── POSTGRESQL_SCHEMA.md         # 数据库 Schema
│   ├── DEVELOPMENT_SETUP.md         # 开发环境配置
│   ├── IMPLEMENTATION_PROGRESS.md   # 实时进度
│   └── [其他现有文档]
│
├── docs/                            # 📚 项目文档（新建）
│   ├── README.md                    # 项目主文档（从根目录移入）
│   ├── START_GUIDE.md               # 快速开始指南
│   ├── BACKEND_IMPLEMENTATION_SUMMARY.md  # 后端实现总结
│   └── architecture/                # 架构文档子文件夹
│       ├── SYSTEM_ARCHITECTURE_DIAGRAM.md
│       ├── SYSTEM_ARCHITECTURE_DIAGRAM.html
│       ├── DATABASE_STRUCTURE_GUIDE.md
│       └── BACKEND_OVERVIEW.md
│
├── src/                             # ✅ 前端源代码（已存在，保持）
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   └── ...
│
├── backend-dotnet/                  # ✅ .NET 后端（已存在，保持）
│   ├── aspnet-core/
│   ├── SETUP_INSTRUCTIONS.md
│   ├── TEST_DB_CONNECTION.md
│   └── test-db.ps1
│
├── scripts/                         # 🔧 实用脚本（新建）
│   ├── setup/                       # 配置脚本
│   │   ├── create_abp_project.bat
│   │   ├── setup_db_no_password.bat
│   │   ├── create_database_interactive.ps1
│   │   └── create_database_simple.ps1
│   ├── migration/                   # 数据库迁移脚本
│   │   └── migrate-database.ps1
│   ├── testing/                     # 测试脚本
│   │   ├── view-page.js
│   │   └── screenshot.js
│   └── data-generation/             # 数据生成
│       ├── generate_patients.py
│       └── update_patient_mapping.py
│
├── _archive/                        # 📦 归档文件夹（新建）
│   ├── old-docs/                    # 旧文档
│   │   ├── MEDIAPIPE_*.md
│   │   ├── OCR_*.md
│   │   ├── PATIENT_ANONYMIZATION.md
│   │   ├── MOBILE_TESTING_GUIDE.md
│   │   ├── UI_IMPROVEMENTS_2025-10-24.md
│   │   ├── REORGANIZE_PLAN.md
│   │   ├── IMPLEMENTATION_LOG.md
│   │   ├── REORGANIZATION_SUMMARY.md
│   │   ├── NEXT_STEPS.md
│   │   ├── PROGRESS_RECORD.md
│   │   ├── RESUME_HERE.md
│   │   ├── NEXT_ACTIONS.md
│   │   ├── START_HERE.md
│   │   ├── MANUAL_STEPS.md
│   │   ├── RESUME_GUIDE.md
│   │   └── scenario_recommendation.md
│   └── old-scripts/                 # 旧脚本
│       ├── test_ocr*.py
│       ├── local_ocr_server.py
│       └── integrate_code.ps1
│
├── reference/                       # 📖 参考资料（新建）
│   ├── Digital Pain Mapping and Tracking.pdf
│   └── back-pain-location-charts.pdf
│
├── temp/                            # 🗑️ 临时文件（新建）
│   ├── generated_patients.json
│   ├── patient_id_mapping.csv
│   ├── screenshot.png
│   ├── page-content.html
│   └── page-text.txt
│
└── [配置文件保留在根目录]
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── components.json
    ├── index.html
    ├── NuGet.Config
    └── LowBackPainSystem.sln
```

---

## 📝 文件分类详情

### 1️⃣ 保留在根目录（配置文件）

**前端配置**:
- `package.json`, `package-lock.json`
- `vite.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `eslint.config.js`
- `jsconfig.json`
- `components.json`
- `index.html`

**后端配置**:
- `NuGet.Config`
- `LowBackPainSystem.sln`

**其他**:
- `.gitignore` (如果有)
- `node_modules/` (保持)

---

### 2️⃣ 移到 `docs/` 文件夹

**主文档**:
- `README.md` → `docs/README.md`
- `START_GUIDE.md` → `docs/START_GUIDE.md`
- `BACKEND_IMPLEMENTATION_SUMMARY.md` → `docs/BACKEND_IMPLEMENTATION_SUMMARY.md`

**架构文档**:
- `SYSTEM_ARCHITECTURE_DIAGRAM.md` → `docs/architecture/`
- `SYSTEM_ARCHITECTURE_DIAGRAM.html` → `docs/architecture/`
- `系统架构图 - Low Back Pain System.pdf` → `docs/architecture/`
- `DATABASE_STRUCTURE_GUIDE.md` → `docs/architecture/`
- `BACKEND_OVERVIEW.md` → `docs/architecture/`
- `patient_collection_form_data_structure.html` → `docs/architecture/`
- `Low Back Pain System - Patient Collection Form Data Structure.pdf` → `docs/architecture/`

---

### 3️⃣ 移到 `scripts/` 文件夹

**配置脚本** (`scripts/setup/`):
- `create_abp_project.bat`
- `setup_db_no_password.bat`
- `create_database_interactive.ps1`
- `create_database_simple.ps1`

**迁移脚本** (`scripts/migration/`):
- `migrate-database.ps1`

**测试脚本** (`scripts/testing/`):
- `view-page.js`
- `screenshot.js`

**数据生成** (`scripts/data-generation/`):
- `generate_patients.py`
- `update_patient_mapping.py`

---

### 4️⃣ 归档到 `_archive/` 文件夹

**旧文档** (`_archive/old-docs/`):
- `MEDIAPIPE_INTEGRATION_COMPLETE.md`
- `MEDIAPIPE_INTEGRATION_PLAN.md`
- `MEDIAPIPE_SETUP_COMPLETE.md`
- `MMRC_Gap_Analysis.md`
- `OCR_ARCHITECTURE_DIAGRAM.md`
- `OCR_INTEGRATION_SUMMARY.md`
- `OCR_INTEGRATION_GUIDE.md`
- `QUICK_START_OCR_TEST.md`
- `PATIENT_ANONYMIZATION.md`
- `MOBILE_TESTING_GUIDE.md`
- `UI_IMPROVEMENTS_2025-10-24.md`
- `REORGANIZE_PLAN.md`
- `IMPLEMENTATION_LOG.md`
- `REORGANIZATION_SUMMARY.md`
- `NEXT_STEPS.md`
- `PROGRESS_RECORD.md`
- `RESUME_HERE.md`
- `NEXT_ACTIONS.md`
- `START_HERE.md`
- `MANUAL_STEPS.md`
- `RESUME_GUIDE.md`
- `scenario_recommendation.md`
- `SCREENSHOT_LOCATIONS.md`
- `achitecture.md` (旧架构文档)

**旧脚本** (`_archive/old-scripts/`):
- `test_ocr_noproxy.py`
- `test_ocr.py`
- `test_ocr_integration.py`
- `test_ocr_simple.py`
- `local_ocr_server.py`
- `integrate_code.ps1`
- `start_all_services.bat` (如果不再需要)

---

### 5️⃣ 移到 `reference/` 文件夹

**参考资料**:
- `Digital Pain Mapping and Tracking in Patients With Chronic Pain.pdf`
- `back-pain-location-charts.pdf`

---

### 6️⃣ 移到 `temp/` 文件夹（或考虑删除）

**临时文件**:
- `generated_patients.json`
- `patient_id_mapping.csv`
- `screenshot.png`
- `page-content.html`
- `page-text.txt`

**建议**: 这些是自动生成的文件，可以考虑添加到 `.gitignore` 并定期清理。

---

## 🚀 执行步骤

### 阶段 1: 创建新文件夹结构

```powershell
# 创建新文件夹
New-Item -ItemType Directory -Path "docs/architecture" -Force
New-Item -ItemType Directory -Path "scripts/setup" -Force
New-Item -ItemType Directory -Path "scripts/migration" -Force
New-Item -ItemType Directory -Path "scripts/testing" -Force
New-Item -ItemType Directory -Path "scripts/data-generation" -Force
New-Item -ItemType Directory -Path "_archive/old-docs" -Force
New-Item -ItemType Directory -Path "_archive/old-scripts" -Force
New-Item -ItemType Directory -Path "reference" -Force
New-Item -ItemType Directory -Path "temp" -Force
```

### 阶段 2: 移动文件

**主文档**:
```powershell
Move-Item "README.md" "docs/"
Move-Item "START_GUIDE.md" "docs/"
Move-Item "BACKEND_IMPLEMENTATION_SUMMARY.md" "docs/"
```

**架构文档**:
```powershell
Move-Item "SYSTEM_ARCHITECTURE_DIAGRAM.md" "docs/architecture/"
Move-Item "SYSTEM_ARCHITECTURE_DIAGRAM.html" "docs/architecture/"
Move-Item "系统架构图 - Low Back Pain System.pdf" "docs/architecture/"
Move-Item "DATABASE_STRUCTURE_GUIDE.md" "docs/architecture/"
Move-Item "BACKEND_OVERVIEW.md" "docs/architecture/"
Move-Item "patient_collection_form_data_structure.html" "docs/architecture/"
Move-Item "Low Back Pain System - Patient Collection Form Data Structure.pdf" "docs/architecture/"
```

**脚本文件**:
```powershell
Move-Item "create_abp_project.bat" "scripts/setup/"
Move-Item "setup_db_no_password.bat" "scripts/setup/"
Move-Item "create_database_interactive.ps1" "scripts/setup/"
Move-Item "create_database_simple.ps1" "scripts/setup/"
Move-Item "migrate-database.ps1" "scripts/migration/"
Move-Item "view-page.js" "scripts/testing/"
Move-Item "screenshot.js" "scripts/testing/"
Move-Item "generate_patients.py" "scripts/data-generation/"
Move-Item "update_patient_mapping.py" "scripts/data-generation/"
```

**归档旧文档**:
```powershell
Move-Item "MEDIAPIPE_*.md" "_archive/old-docs/"
Move-Item "OCR_*.md" "_archive/old-docs/"
Move-Item "PATIENT_ANONYMIZATION.md" "_archive/old-docs/"
Move-Item "MOBILE_TESTING_GUIDE.md" "_archive/old-docs/"
Move-Item "UI_IMPROVEMENTS_2025-10-24.md" "_archive/old-docs/"
Move-Item "REORGANIZE_PLAN.md" "_archive/old-docs/"
Move-Item "IMPLEMENTATION_LOG.md" "_archive/old-docs/"
Move-Item "REORGANIZATION_SUMMARY.md" "_archive/old-docs/"
Move-Item "NEXT_STEPS.md" "_archive/old-docs/"
Move-Item "PROGRESS_RECORD.md" "_archive/old-docs/"
Move-Item "RESUME_HERE.md" "_archive/old-docs/"
Move-Item "NEXT_ACTIONS.md" "_archive/old-docs/"
Move-Item "START_HERE.md" "_archive/old-docs/"
Move-Item "MANUAL_STEPS.md" "_archive/old-docs/"
Move-Item "RESUME_GUIDE.md" "_archive/old-docs/"
Move-Item "scenario_recommendation.md" "_archive/old-docs/"
Move-Item "SCREENSHOT_LOCATIONS.md" "_archive/old-docs/"
Move-Item "achitecture.md" "_archive/old-docs/"
Move-Item "MMRC_Gap_Analysis.md" "_archive/old-docs/"
Move-Item "QUICK_START_OCR_TEST.md" "_archive/old-docs/"
```

**归档旧脚本**:
```powershell
Move-Item "test_ocr*.py" "_archive/old-scripts/"
Move-Item "local_ocr_server.py" "_archive/old-scripts/"
Move-Item "integrate_code.ps1" "_archive/old-scripts/"
Move-Item "start_all_services.bat" "_archive/old-scripts/"
```

**参考资料**:
```powershell
Move-Item "Digital Pain Mapping and Tracking in Patients With Chronic Pain.pdf" "reference/"
Move-Item "back-pain-location-charts.pdf" "reference/"
```

**临时文件**:
```powershell
Move-Item "generated_patients.json" "temp/"
Move-Item "patient_id_mapping.csv" "temp/"
Move-Item "screenshot.png" "temp/"
Move-Item "page-content.html" "temp/"
Move-Item "page-text.txt" "temp/"
```

### 阶段 3: 验证

检查根目录是否清晰：
```powershell
Get-ChildItem "E:\claude-code\low back pain system" -File | Select-Object Name
```

预期结果：只剩配置文件（package.json, vite.config.js 等）

---

## ✅ 重组后的根目录文件

**应该只包含**:
- `package.json`
- `package-lock.json`
- `vite.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `eslint.config.js`
- `jsconfig.json`
- `components.json`
- `index.html`
- `NuGet.Config`
- `LowBackPainSystem.sln`

**文件夹**:
- `.specify/` (保持不变)
- `src/` (前端源码)
- `backend-dotnet/` (.NET 后端)
- `docs/` (新建 - 项目文档)
- `scripts/` (新建 - 实用脚本)
- `reference/` (新建 - 参考资料)
- `_archive/` (新建 - 归档文件)
- `temp/` (新建 - 临时文件)
- `node_modules/` (保持)

---

## 📊 重组效果

**重组前**:
- ❌ 根目录 59+ 个文件
- ❌ 文档、脚本、临时文件混杂
- ❌ 难以找到关键文件

**重组后**:
- ✅ 根目录 ~12 个配置文件
- ✅ 文档整理到 `docs/` 文件夹
- ✅ 脚本分类到 `scripts/` 文件夹
- ✅ 旧文件归档到 `_archive/`
- ✅ 参考资料集中到 `reference/`
- ✅ 清晰的文件夹层次结构

---

## 🔍 未来维护建议

1. **新文档**: 优先放入 `docs/` 或 `.specify/`
2. **新脚本**: 放入 `scripts/` 对应子文件夹
3. **临时文件**: 使用 `temp/` 文件夹，定期清理
4. **旧版本**: 立即归档到 `_archive/`
5. **Git 忽略**: 将 `temp/`, `_archive/`, `node_modules/` 添加到 `.gitignore`

---

## ⚠️ 注意事项

1. **备份**: 执行前建议备份整个项目文件夹
2. **Git 状态**: 如果使用 Git，注意文件移动会影响历史记录
3. **路径引用**: 检查代码中是否有硬编码的文件路径需要更新
4. **文档链接**: 更新文档中的相对路径链接

---

## 📌 下一步

1. **用户确认**: 审阅本重组计划
2. **执行重组**: 按阶段执行文件移动
3. **验证测试**: 确保前端和后端仍正常工作
4. **更新文档**: 修正文档中的路径引用
5. **Git 提交**: 提交重组后的文件结构

---

**创建者**: Claude Code
**参考标准**: `.specify` 文件夹中的最新文档
