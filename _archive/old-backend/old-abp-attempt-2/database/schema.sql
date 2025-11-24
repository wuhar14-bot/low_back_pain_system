-- =====================================================
-- Low Back Pain System - PostgreSQL Database Schema
-- =====================================================
-- Version: 1.0
-- Date: 2025-10-27
-- Description: Complete database schema for Low Back Pain Data Collection System
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: workspaces
-- Description: 工作室表 (Optional - if not in existing system)
-- =====================================================
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- ABP审计字段
    creation_time TIMESTAMP NOT NULL DEFAULT NOW(),
    creator_id UUID,
    last_modification_time TIMESTAMP,
    last_modifier_id UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleter_id UUID,
    deletion_time TIMESTAMP
);

COMMENT ON TABLE workspaces IS '工作室表 - Workspace table';
COMMENT ON COLUMN workspaces.id IS '主键ID - Primary key';
COMMENT ON COLUMN workspaces.name IS '工作室名称 - Workspace name';
COMMENT ON COLUMN workspaces.code IS '工作室代码(唯一) - Workspace code (unique)';
COMMENT ON COLUMN workspaces.is_active IS '是否启用 - Is active';

-- =====================================================
-- Table: doctors
-- Description: 医生表 (Optional - if not in existing system)
-- =====================================================
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50),
    specialty VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- ABP审计字段
    creation_time TIMESTAMP NOT NULL DEFAULT NOW(),
    creator_id UUID,
    last_modification_time TIMESTAMP,
    last_modifier_id UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleter_id UUID,
    deletion_time TIMESTAMP,

    -- 外键约束 (如果workspaces表存在)
    CONSTRAINT fk_doctor_workspace FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id) ON DELETE RESTRICT
);

COMMENT ON TABLE doctors IS '医生表 - Doctor table';
COMMENT ON COLUMN doctors.workspace_id IS '所属工作室ID - Workspace ID';
COMMENT ON COLUMN doctors.employee_id IS '工号 - Employee ID';
COMMENT ON COLUMN doctors.specialty IS '专业/科室 - Specialty/Department';

-- =====================================================
-- Table: patients
-- Description: 患者表 - 核心数据表
-- =====================================================
CREATE TABLE patients (
    -- 主键和关联
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_id VARCHAR(50),
    workspace_id UUID NOT NULL,
    doctor_id UUID NOT NULL,

    -- 患者基本信息
    name VARCHAR(100),
    gender VARCHAR(10),                     -- '男' or '女'
    age INTEGER,
    phone VARCHAR(20),

    -- 医疗信息
    onset_date DATE,
    chief_complaint TEXT,
    medical_history TEXT,
    pain_areas JSONB,                       -- JSON数组: ["lower_back", "left_leg"]

    -- 临床检查
    subjective_exam TEXT,
    objective_exam TEXT,
    functional_scores JSONB,                -- JSON对象: {"oswestry": 42, "vas": 7}
    intervention TEXT,

    -- AI分析
    ai_posture_analysis JSONB,              -- MediaPipe姿态分析结果

    -- 附加信息
    remarks TEXT,
    data_json JSONB,                        -- 完整数据备份

    -- ABP审计字段
    creation_time TIMESTAMP NOT NULL DEFAULT NOW(),
    creator_id UUID,
    last_modification_time TIMESTAMP,
    last_modifier_id UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleter_id UUID,
    deletion_time TIMESTAMP

    -- 外键约束 (可选 - 取决于是否使用本地工作室/医生表)
    -- CONSTRAINT fk_patient_workspace FOREIGN KEY (workspace_id)
    --     REFERENCES workspaces(id) ON DELETE RESTRICT,
    -- CONSTRAINT fk_patient_doctor FOREIGN KEY (doctor_id)
    --     REFERENCES doctors(id) ON DELETE RESTRICT
);

COMMENT ON TABLE patients IS '患者表 - Patient table for low back pain data collection';
COMMENT ON COLUMN patients.study_id IS '研究ID - Study identifier';
COMMENT ON COLUMN patients.workspace_id IS '工作室ID - Workspace ID (from existing system)';
COMMENT ON COLUMN patients.doctor_id IS '医生ID - Doctor ID (from existing system)';
COMMENT ON COLUMN patients.pain_areas IS '疼痛部位JSON数组 - Pain areas as JSON array';
COMMENT ON COLUMN patients.functional_scores IS '功能评分JSON对象 - Functional scores as JSON';
COMMENT ON COLUMN patients.ai_posture_analysis IS 'AI姿态分析结果 - AI pose analysis results';
COMMENT ON COLUMN patients.data_json IS '完整数据备份 - Complete data backup as JSON';

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Workspaces索引
CREATE INDEX idx_workspaces_code ON workspaces(code);
CREATE INDEX idx_workspaces_creation_time ON workspaces(creation_time DESC);

-- Doctors索引
CREATE INDEX idx_doctors_workspace_id ON doctors(workspace_id);
CREATE INDEX idx_doctors_employee_id ON doctors(employee_id);
CREATE INDEX idx_doctors_creation_time ON doctors(creation_time DESC);

-- Patients索引
CREATE INDEX idx_patients_study_id ON patients(study_id);
CREATE INDEX idx_patients_workspace_id ON patients(workspace_id);
CREATE INDEX idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX idx_patients_creation_time ON patients(creation_time DESC);
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_gender ON patients(gender);
CREATE INDEX idx_patients_age ON patients(age);

-- JSONB字段的GIN索引 (用于JSON查询优化)
CREATE INDEX idx_pain_areas_gin ON patients USING GIN(pain_areas);
CREATE INDEX idx_functional_scores_gin ON patients USING GIN(functional_scores);
CREATE INDEX idx_ai_posture_analysis_gin ON patients USING GIN(ai_posture_analysis);

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- 插入测试工作室
INSERT INTO workspaces (id, name, code, is_active) VALUES
(uuid_generate_v4(), 'HKU Orthopedics', 'HKU-ORTHO', TRUE),
(uuid_generate_v4(), 'Test Workspace', 'TEST-WS', TRUE);

-- 插入测试医生 (需要先获取工作室ID)
DO $$
DECLARE
    workspace_id UUID;
BEGIN
    SELECT id INTO workspace_id FROM workspaces WHERE code = 'HKU-ORTHO' LIMIT 1;

    INSERT INTO doctors (id, workspace_id, name, employee_id, specialty, is_active) VALUES
    (uuid_generate_v4(), workspace_id, 'Dr. Zhang Wei', 'E001', 'Orthopedics', TRUE),
    (uuid_generate_v4(), workspace_id, 'Dr. Li Ming', 'E002', 'Spine Surgery', TRUE);
END $$;

-- =====================================================
-- Useful Queries for Maintenance
-- =====================================================

-- 查询患者总数
-- SELECT COUNT(*) FROM patients WHERE is_deleted = FALSE;

-- 查询有AI分析的患者
-- SELECT id, name, study_id,
--        ai_posture_analysis->>'rom_degrees' as rom_degrees,
--        ai_posture_analysis->>'rom_assessment' as rom_assessment
-- FROM patients
-- WHERE ai_posture_analysis IS NOT NULL
--   AND is_deleted = FALSE;

-- 查询某工作室的患者统计
-- SELECT
--     workspace_id,
--     COUNT(*) as total_patients,
--     COUNT(ai_posture_analysis) as with_ai_analysis,
--     AVG(age) as avg_age
-- FROM patients
-- WHERE is_deleted = FALSE
-- GROUP BY workspace_id;

-- 查询功能评分统计
-- SELECT
--     AVG((functional_scores->>'oswestry')::numeric) as avg_oswestry,
--     AVG((functional_scores->>'vas')::numeric) as avg_vas
-- FROM patients
-- WHERE functional_scores IS NOT NULL
--   AND is_deleted = FALSE;

-- =====================================================
-- Database Maintenance Commands
-- =====================================================

-- 分析表以优化查询
-- ANALYZE patients;
-- ANALYZE workspaces;
-- ANALYZE doctors;

-- 清理已删除的记录 (软删除)
-- VACUUM FULL patients;

-- 查看数据库大小
-- SELECT pg_size_pretty(pg_database_size('LowBackPainDb'));

-- 查看表大小
-- SELECT
--     tablename,
--     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- Backup Commands
-- =====================================================

-- 备份数据库
-- pg_dump -U postgres -d LowBackPainDb -F c -f lowbackpain_backup.dump

-- 恢复数据库
-- pg_restore -U postgres -d LowBackPainDb lowbackpain_backup.dump

-- =====================================================
-- End of Schema
-- =====================================================
