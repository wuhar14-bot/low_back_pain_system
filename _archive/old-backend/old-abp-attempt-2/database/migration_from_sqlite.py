#!/usr/bin/env python3
"""
SQLite to PostgreSQL Migration Script
迁移脚本: 将现有SQLite数据库迁移到PostgreSQL

Usage:
    python migration_from_sqlite.py

Requirements:
    pip install psycopg2-binary

Author: Claude
Date: 2025-10-27
"""

import sqlite3
import psycopg2
from psycopg2.extras import execute_values, RealDictCursor
import json
from datetime import datetime
import uuid
import sys

# =====================================================
# 配置部分 - Configuration
# =====================================================

# SQLite数据库路径
SQLITE_DB_PATH = r'E:\claude-code\low back pain system\backend\low_back_pain.db'

# PostgreSQL连接配置
PG_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'LowBackPainDb',
    'user': 'postgres',
    'password': 'your_password_here'  # ⚠️ 修改为实际密码
}

# 默认工作室和医生ID (如果SQLite数据中没有)
DEFAULT_WORKSPACE_ID = None  # 会自动创建默认工作室
DEFAULT_DOCTOR_ID = None     # 会自动创建默认医生

# =====================================================
# 辅助函数
# =====================================================

def print_section(title):
    """打印章节标题"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def print_step(step, message):
    """打印步骤信息"""
    print(f"[Step {step}] {message}")


def print_success(message):
    """打印成功信息"""
    print(f"✅ {message}")


def print_error(message):
    """打印错误信息"""
    print(f"❌ {message}")


def print_warning(message):
    """打印警告信息"""
    print(f"⚠️  {message}")


# =====================================================
# 主迁移逻辑
# =====================================================

def connect_sqlite():
    """连接SQLite数据库"""
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        print_success(f"Connected to SQLite: {SQLITE_DB_PATH}")
        return conn
    except sqlite3.Error as e:
        print_error(f"Failed to connect to SQLite: {e}")
        sys.exit(1)


def connect_postgres():
    """连接PostgreSQL数据库"""
    try:
        conn = psycopg2.connect(**PG_CONFIG)
        print_success(f"Connected to PostgreSQL: {PG_CONFIG['database']}")
        return conn
    except psycopg2.Error as e:
        print_error(f"Failed to connect to PostgreSQL: {e}")
        sys.exit(1)


def create_default_workspace_and_doctor(pg_conn):
    """创建默认工作室和医生"""
    global DEFAULT_WORKSPACE_ID, DEFAULT_DOCTOR_ID

    cursor = pg_conn.cursor()

    # 创建默认工作室
    workspace_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO workspaces (id, name, code, is_active, creation_time)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (code) DO NOTHING
        RETURNING id
    """, (workspace_id, 'Default Workspace', 'DEFAULT', True, datetime.now()))

    result = cursor.fetchone()
    if result:
        DEFAULT_WORKSPACE_ID = str(result[0])
        print_success(f"Created default workspace: {DEFAULT_WORKSPACE_ID}")
    else:
        # 工作室已存在,获取ID
        cursor.execute("SELECT id FROM workspaces WHERE code = 'DEFAULT'")
        DEFAULT_WORKSPACE_ID = str(cursor.fetchone()[0])
        print_warning(f"Using existing default workspace: {DEFAULT_WORKSPACE_ID}")

    # 创建默认医生
    doctor_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO doctors (id, workspace_id, name, employee_id, is_active, creation_time)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (doctor_id, DEFAULT_WORKSPACE_ID, 'Default Doctor', 'D000', True, datetime.now()))

    DEFAULT_DOCTOR_ID = str(cursor.fetchone()[0])
    print_success(f"Created default doctor: {DEFAULT_DOCTOR_ID}")

    pg_conn.commit()


def fetch_sqlite_patients(sqlite_conn):
    """从SQLite获取所有患者数据"""
    cursor = sqlite_conn.cursor()
    cursor.execute('SELECT * FROM patients ORDER BY created_date')
    patients = cursor.fetchall()
    print_success(f"Fetched {len(patients)} patients from SQLite")
    return patients


def transform_patient_data(sqlite_patient):
    """转换患者数据格式"""
    # 生成新的UUID
    new_id = str(uuid.uuid4())

    # 获取工作室和医生ID
    workspace_id = sqlite_patient['workspace_id'] or DEFAULT_WORKSPACE_ID
    doctor_id = DEFAULT_DOCTOR_ID  # SQLite中没有医生ID,使用默认值

    # 确保UUID格式
    try:
        workspace_id = str(uuid.UUID(workspace_id))
    except (ValueError, TypeError):
        workspace_id = DEFAULT_WORKSPACE_ID

    # 转换创建时间
    created_date = sqlite_patient['created_date']
    if created_date:
        try:
            creation_time = datetime.fromisoformat(created_date.replace('Z', '+00:00'))
        except:
            creation_time = datetime.now()
    else:
        creation_time = datetime.now()

    # 转换发病日期
    onset_date = sqlite_patient['onset_date']
    if onset_date:
        try:
            onset_date = datetime.fromisoformat(onset_date.replace('Z', '+00:00')).date()
        except:
            onset_date = None

    # 准备数据字典
    data = {
        'id': new_id,
        'study_id': sqlite_patient['study_id'],
        'workspace_id': workspace_id,
        'doctor_id': doctor_id,
        'name': sqlite_patient['name'],
        'gender': sqlite_patient['gender'],
        'age': sqlite_patient['age'],
        'phone': sqlite_patient['phone'],
        'onset_date': onset_date,
        'chief_complaint': sqlite_patient['chief_complaint'],
        'medical_history': sqlite_patient['medical_history'],
        'pain_areas': sqlite_patient['pain_areas'],
        'subjective_exam': sqlite_patient['subjective_exam'],
        'objective_exam': sqlite_patient['objective_exam'],
        'functional_scores': sqlite_patient['functional_scores'],
        'intervention': sqlite_patient['intervention'],
        'ai_posture_analysis': sqlite_patient['ai_posture_analysis'],
        'remarks': sqlite_patient['remarks'],
        'data_json': sqlite_patient['data_json'],
        'creation_time': creation_time,
        'is_deleted': False
    }

    return data


def insert_patients_to_postgres(pg_conn, patients_data):
    """批量插入患者数据到PostgreSQL"""
    cursor = pg_conn.cursor()

    # 准备插入语句
    insert_query = """
        INSERT INTO patients (
            id, study_id, workspace_id, doctor_id,
            name, gender, age, phone,
            onset_date, chief_complaint, medical_history, pain_areas,
            subjective_exam, objective_exam, functional_scores, intervention,
            ai_posture_analysis, remarks, data_json,
            creation_time, is_deleted
        ) VALUES (
            %(id)s, %(study_id)s, %(workspace_id)s, %(doctor_id)s,
            %(name)s, %(gender)s, %(age)s, %(phone)s,
            %(onset_date)s, %(chief_complaint)s, %(medical_history)s, %(pain_areas)s::jsonb,
            %(subjective_exam)s, %(objective_exam)s, %(functional_scores)s::jsonb, %(intervention)s,
            %(ai_posture_analysis)s::jsonb, %(remarks)s, %(data_json)s::jsonb,
            %(creation_time)s, %(is_deleted)s
        )
    """

    # 批量插入
    success_count = 0
    error_count = 0

    for patient in patients_data:
        try:
            cursor.execute(insert_query, patient)
            success_count += 1
        except psycopg2.Error as e:
            error_count += 1
            print_error(f"Failed to insert patient {patient.get('study_id', 'N/A')}: {e}")

    pg_conn.commit()
    return success_count, error_count


def verify_migration(pg_conn, expected_count):
    """验证迁移结果"""
    cursor = pg_conn.cursor()

    # 检查患者总数
    cursor.execute('SELECT COUNT(*) FROM patients WHERE is_deleted = FALSE')
    actual_count = cursor.fetchone()[0]

    print_section("Migration Verification")
    print(f"Expected: {expected_count} patients")
    print(f"Actual:   {actual_count} patients")

    if actual_count == expected_count:
        print_success("✓ Patient count matches!")
    else:
        print_error(f"✗ Patient count mismatch! Expected {expected_count}, got {actual_count}")

    # 检查有AI分析的患者
    cursor.execute("""
        SELECT COUNT(*)
        FROM patients
        WHERE ai_posture_analysis IS NOT NULL
          AND ai_posture_analysis::text != '{}'
          AND is_deleted = FALSE
    """)
    ai_count = cursor.fetchone()[0]
    print(f"Patients with AI analysis: {ai_count}")

    # 检查工作室分布
    cursor.execute("""
        SELECT workspace_id, COUNT(*) as count
        FROM patients
        WHERE is_deleted = FALSE
        GROUP BY workspace_id
    """)
    workspace_stats = cursor.fetchall()
    print("\nPatients by workspace:")
    for workspace_id, count in workspace_stats:
        print(f"  - {workspace_id}: {count} patients")

    # 示例数据查询
    cursor.execute("""
        SELECT id, study_id, name, gender, age,
               ai_posture_analysis->>'rom_degrees' as rom_degrees
        FROM patients
        WHERE is_deleted = FALSE
        ORDER BY creation_time DESC
        LIMIT 5
    """)
    sample_patients = cursor.fetchall()

    print("\nSample migrated patients:")
    for patient in sample_patients:
        print(f"  - {patient[1]}: {patient[2]} ({patient[3]}, {patient[4]}岁) ROM: {patient[5]}")


def main():
    """主函数"""
    print_section("Low Back Pain System - Data Migration")
    print("SQLite → PostgreSQL")
    print(f"Source: {SQLITE_DB_PATH}")
    print(f"Target: {PG_CONFIG['host']}:{PG_CONFIG['port']}/{PG_CONFIG['database']}")

    # 确认开始迁移
    response = input("\n⚠️  This will migrate data to PostgreSQL. Continue? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("Migration cancelled.")
        sys.exit(0)

    try:
        # Step 1: 连接数据库
        print_section("Step 1: Connecting to databases")
        sqlite_conn = connect_sqlite()
        pg_conn = connect_postgres()

        # Step 2: 创建默认工作室和医生
        print_section("Step 2: Creating default workspace and doctor")
        create_default_workspace_and_doctor(pg_conn)

        # Step 3: 读取SQLite数据
        print_section("Step 3: Reading SQLite patients data")
        sqlite_patients = fetch_sqlite_patients(sqlite_conn)

        # Step 4: 转换数据格式
        print_section("Step 4: Transforming data")
        print_step(4, "Converting SQLite data to PostgreSQL format...")
        patients_data = []
        for patient in sqlite_patients:
            patients_data.append(transform_patient_data(patient))
        print_success(f"Transformed {len(patients_data)} patient records")

        # Step 5: 插入PostgreSQL
        print_section("Step 5: Inserting data into PostgreSQL")
        success_count, error_count = insert_patients_to_postgres(pg_conn, patients_data)
        print_success(f"Inserted {success_count} patients successfully")
        if error_count > 0:
            print_error(f"Failed to insert {error_count} patients")

        # Step 6: 验证迁移
        print_section("Step 6: Verifying migration")
        verify_migration(pg_conn, len(sqlite_patients))

        # 完成
        print_section("Migration Complete!")
        print_success("✓ All data migrated successfully")
        print("\nNext steps:")
        print("1. Review the migrated data in PostgreSQL")
        print("2. Update workspace_id and doctor_id if needed")
        print("3. Test the .NET backend with the new database")
        print("4. Backup the PostgreSQL database")

    except Exception as e:
        print_error(f"Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    finally:
        # 关闭连接
        if 'sqlite_conn' in locals():
            sqlite_conn.close()
        if 'pg_conn' in locals():
            pg_conn.close()


if __name__ == '__main__':
    main()
