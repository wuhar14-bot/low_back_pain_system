# Database Specification

Complete database documentation for the Low Back Pain Data Collection System.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Data Types](#data-types)
4. [Indexes](#indexes)
5. [Data Flow](#data-flow)
6. [Backup & Recovery](#backup--recovery)
7. [Query Examples](#query-examples)
8. [Migration Guide](#migration-guide)
9. [Performance Optimization](#performance-optimization)

---

## Overview

### Technology

**Database:** SQLite 3
**Location:** `backend/low_back_pain.db`
**Service:** Flask REST API on port 5003
**Access:** HTTP endpoints for CRUD operations

### Why SQLite?

✅ **Zero configuration** - No separate database server required
✅ **File-based** - Easy backup (just copy the .db file)
✅ **Fast for single-user** - Perfect for clinical research scenarios
✅ **Cross-platform** - Works on Windows, Mac, Linux
✅ **Reliable** - ACID compliant, crash-safe
✅ **Lightweight** - ~1 MB memory footprint
✅ **Serverless** - No network overhead

### Limitations

- **Concurrent writes:** ~1000 writes/second max
- **Database size:** Recommended max 281 TB (practical limit ~1 TB)
- **Single file:** No built-in replication
- **Network access:** Requires API layer (Flask service)

**Recommendation:** SQLite is perfect for <1000 patients and single-clinic deployments. For multi-site or >5000 patients, consider PostgreSQL migration.

---

## Database Schema

### Patients Table

```sql
CREATE TABLE patients (
    -- Primary Identification
    id TEXT PRIMARY KEY,                    -- Format: "patient-1760686123456"
    study_id TEXT,                          -- User-defined study identifier

    -- Demographics
    name TEXT,                              -- Patient name (can be anonymized)
    gender TEXT,                            -- "男" or "女"
    age INTEGER,                            -- Age in years
    phone TEXT,                             -- Contact phone number

    -- Medical Information
    onset_date TEXT,                        -- Date when symptoms started (ISO 8601)
    chief_complaint TEXT,                   -- Primary complaint description
    medical_history TEXT,                   -- Past medical history
    pain_areas TEXT,                        -- JSON array: ["lower_back", "left_leg"]

    -- Clinical Examination
    subjective_exam TEXT,                   -- Subjective examination findings
    objective_exam TEXT,                    -- Objective examination findings
    functional_scores TEXT,                 -- JSON object: {"oswestry": 42, "vas": 7}
    intervention TEXT,                      -- Treatment/intervention plan

    -- AI Analysis
    ai_posture_analysis TEXT,               -- JSON object with pose estimation results

    -- Additional Notes
    remarks TEXT,                           -- Clinician notes

    -- Metadata
    created_date TEXT NOT NULL,             -- ISO 8601 timestamp
    last_sync_timestamp TEXT,               -- Last update timestamp (ISO 8601)
    workspace_id TEXT,                      -- Multi-workspace support

    -- Complete Data Storage
    data_json TEXT                          -- Full patient data as JSON backup
);
```

### Field Details

| Field | Type | Nullable | Description | Example |
|:---|:---|:---|:---|:---|
| `id` | TEXT | NO | Primary key, auto-generated | `"patient-1760686123456"` |
| `study_id` | TEXT | YES | User-defined study identifier | `"HKU2025001"` |
| `name` | TEXT | YES | Patient name | `"张三"` |
| `gender` | TEXT | YES | Gender | `"男"` or `"女"` |
| `age` | INTEGER | YES | Age in years | `45` |
| `phone` | TEXT | YES | Contact phone | `"13800138000"` |
| `onset_date` | TEXT | YES | Symptom onset date | `"2025-10-15"` |
| `chief_complaint` | TEXT | YES | Primary complaint | `"腰痛3个月，加重1周"` |
| `medical_history` | TEXT | YES | Past medical history | `"高血压病史5年"` |
| `pain_areas` | TEXT | YES | JSON array of pain locations | `"[\"lower_back\", \"left_leg\"]"` |
| `subjective_exam` | TEXT | YES | Subjective findings | `"VAS 7/10, 晨起加重"` |
| `objective_exam` | TEXT | YES | Objective findings | `"L4-L5压痛(+)"` |
| `functional_scores` | TEXT | YES | JSON scores object | `"{\"oswestry\": 42, \"vas\": 7}"` |
| `intervention` | TEXT | YES | Treatment plan | `"物理治疗，药物治疗"` |
| `ai_posture_analysis` | TEXT | YES | JSON pose analysis | `"{\"rom_degrees\": 47.4, ...}"` |
| `remarks` | TEXT | YES | Additional notes | `"患者依从性良好"` |
| `created_date` | TEXT | NO | Creation timestamp | `"2025-10-17T10:30:00.000Z"` |
| `last_sync_timestamp` | TEXT | YES | Last update timestamp | `"2025-10-17T15:45:00.000Z"` |
| `workspace_id` | TEXT | YES | Workspace identifier | `"workspace-1"` |
| `data_json` | TEXT | YES | Complete data backup | `"{...}"` |

---

## Data Types

### JSON Fields

Three fields store JSON data as TEXT:

#### 1. `pain_areas` (JSON Array)

**Purpose:** Store multiple pain locations

**Format:**
```json
["lower_back", "left_leg", "right_leg", "buttocks"]
```

**Valid Values:**
- `"lower_back"` - 下腰部
- `"upper_back"` - 上腰部
- `"left_leg"` - 左腿
- `"right_leg"` - 右腿
- `"buttocks"` - 臀部
- `"neck"` - 颈部

#### 2. `functional_scores` (JSON Object)

**Purpose:** Store standardized clinical scores

**Format:**
```json
{
  "oswestry": 42,           // Oswestry Disability Index (0-100)
  "vas": 7,                 // Visual Analog Scale (0-10)
  "sf36_physical": 65,      // SF-36 Physical Component
  "sf36_mental": 72,        // SF-36 Mental Component
  "rolland_morris": 14      // Roland-Morris Disability Questionnaire (0-24)
}
```

#### 3. `ai_posture_analysis` (JSON Object)

**Purpose:** Store MediaPipe pose estimation results

**Format:**
```json
{
  "rom_degrees": 47.4,
  "rom_assessment": "轻度受限",
  "standing_trunk_angle": 85.3,
  "flexion_trunk_angle": 132.7,
  "pelvic_tilt": 12.5,
  "knee_angle": 178.2,
  "compensations": "膝关节轻度屈曲",
  "recommendations": "加强核心稳定性训练，改善髋关节灵活性",
  "landmarks": [
    {"x": 0.45, "y": 0.32, "z": -0.1, "visibility": 0.98},
    ...
  ],
  "analysis_timestamp": "2025-10-17T14:30:00.000Z",
  "images": {
    "standing": "data:image/jpeg;base64,...",
    "flexion": "data:image/jpeg;base64,..."
  }
}
```

#### 4. `data_json` (Complete Backup)

**Purpose:** Store complete patient data as JSON backup

**Contains:** All fields merged into single JSON object for flexibility and future compatibility

---

## Indexes

### Current Indexes

**Primary Key Index (Automatic):**
```sql
-- SQLite automatically creates index on PRIMARY KEY
-- Index name: sqlite_autoindex_patients_1
-- Indexed column: id
```

### Recommended Additional Indexes

For performance optimization with >100 patients:

```sql
-- Index on study_id for research queries
CREATE INDEX idx_patients_study_id ON patients(study_id);

-- Index on created_date for sorting
CREATE INDEX idx_patients_created_date ON patients(created_date DESC);

-- Index on workspace_id for multi-workspace filtering
CREATE INDEX idx_patients_workspace_id ON patients(workspace_id);

-- Composite index for common query patterns
CREATE INDEX idx_patients_workspace_created ON patients(workspace_id, created_date DESC);
```

### Index Usage

```sql
-- Fast lookup by ID (uses primary key index)
SELECT * FROM patients WHERE id = 'patient-1760686123456';

-- Fast sorting by date (uses idx_patients_created_date)
SELECT * FROM patients ORDER BY created_date DESC LIMIT 10;

-- Fast workspace filtering (uses idx_patients_workspace_id)
SELECT * FROM patients WHERE workspace_id = 'workspace-1';
```

---

## Data Flow

### Create Patient Flow

```
Frontend (PC)
    ↓
entities.js: Patient.create(data)
    ↓
POST http://localhost:5003/api/patients
    ↓
database_service.py: create_patient()
    ↓
Generate ID: f"patient-{int(datetime.now().timestamp() * 1000)}"
    ↓
SQLite: INSERT INTO patients (...) VALUES (...)
    ↓
Return JSON: {id, created_date, ...}
    ↓
Frontend: Update state + localStorage backup
```

### Cross-Device Sync Flow

```
PC: Create patient → Database INSERT
    ↓
Phone: Poll every 3 seconds (Patient.list())
    ↓
GET http://172.20.10.4:5003/api/patients
    ↓
Database: SELECT * FROM patients ORDER BY created_date DESC
    ↓
Return all patients
    ↓
Phone UI updates automatically
```

### Update Patient Flow (Photo Upload)

```
Phone: Take photo with camera
    ↓
MediaPipe: Analyze pose → get ROM data
    ↓
entities.js: Patient.update(id, {ai_posture_analysis: {...}})
    ↓
PUT http://172.20.10.4:5003/api/patients/{id}
    ↓
database_service.py: update_patient()
    ↓
Load existing data + merge updates
    ↓
SQLite: UPDATE patients SET ... WHERE id = ?
    ↓
Update last_sync_timestamp
    ↓
Return updated patient
    ↓
PC: Poll detects update → UI refreshes
```

---

## Backup & Recovery

### Manual Backup

**Simple file copy:**
```bash
# Windows
copy "E:\claude-code\low back pain system\backend\low_back_pain.db" "E:\backups\low_back_pain_2025-10-17.db"

# Linux/Mac
cp backend/low_back_pain.db backups/low_back_pain_$(date +%Y-%m-%d).db
```

### Automated Backup Script

**Windows Batch Script:** `backup_database.bat`
```batch
@echo off
set BACKUP_DIR=E:\backups\low_back_pain
set DB_FILE=E:\claude-code\low back pain system\backend\low_back_pain.db
set DATE=%date:~-4%%date:~3,2%%date:~0,2%

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
copy "%DB_FILE%" "%BACKUP_DIR%\low_back_pain_%DATE%.db"
echo Backup completed: %BACKUP_DIR%\low_back_pain_%DATE%.db
```

**Schedule in Windows Task Scheduler:**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 11:59 PM
4. Action: Start a program → `backup_database.bat`

### SQLite Backup Command

**Using SQLite CLI:**
```bash
sqlite3 low_back_pain.db ".backup 'low_back_pain_backup.db'"
```

### Recovery

**Restore from backup:**
```bash
# Stop database service first!
# Then copy backup over current database:
copy "E:\backups\low_back_pain_20251017.db" "E:\claude-code\low back pain system\backend\low_back_pain.db"

# Restart database service
python database_service.py
```

### Export to CSV

**Using SQLite CLI:**
```bash
sqlite3 low_back_pain.db
.mode csv
.output patients.csv
SELECT * FROM patients;
.quit
```

**Using Python:**
```python
import sqlite3
import csv

conn = sqlite3.connect('low_back_pain.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM patients')

with open('patients.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow([desc[0] for desc in cursor.description])  # Headers
    writer.writerows(cursor.fetchall())

conn.close()
```

---

## Query Examples

### Basic Queries

**Get all patients:**
```sql
SELECT * FROM patients ORDER BY created_date DESC;
```

**Get patient by ID:**
```sql
SELECT * FROM patients WHERE id = 'patient-1760686123456';
```

**Get patient by study ID:**
```sql
SELECT * FROM patients WHERE study_id = 'HKU2025001';
```

**Count total patients:**
```sql
SELECT COUNT(*) as total FROM patients;
```

### Filtered Queries

**Get male patients:**
```sql
SELECT * FROM patients WHERE gender = '男';
```

**Get patients by age range:**
```sql
SELECT * FROM patients WHERE age BETWEEN 40 AND 60;
```

**Get patients created today:**
```sql
SELECT * FROM patients
WHERE DATE(created_date) = DATE('now');
```

**Get patients by workspace:**
```sql
SELECT * FROM patients
WHERE workspace_id = 'workspace-1'
ORDER BY created_date DESC;
```

### Advanced Queries

**Get patients with pose analysis:**
```sql
SELECT id, name, study_id, ai_posture_analysis
FROM patients
WHERE ai_posture_analysis IS NOT NULL
  AND ai_posture_analysis != '{}';
```

**Get recent patients (last 7 days):**
```sql
SELECT * FROM patients
WHERE created_date >= datetime('now', '-7 days')
ORDER BY created_date DESC;
```

**Get patients with severe ROM limitation:**
```sql
SELECT id, name, study_id,
       json_extract(ai_posture_analysis, '$.rom_degrees') as rom,
       json_extract(ai_posture_analysis, '$.rom_assessment') as assessment
FROM patients
WHERE json_extract(ai_posture_analysis, '$.rom_assessment') = '重度受限';
```

**Get average age by gender:**
```sql
SELECT gender,
       COUNT(*) as count,
       AVG(age) as avg_age,
       MIN(age) as min_age,
       MAX(age) as max_age
FROM patients
WHERE age IS NOT NULL
GROUP BY gender;
```

### JSON Queries

**Extract ROM degrees:**
```sql
SELECT id, name,
       json_extract(ai_posture_analysis, '$.rom_degrees') as rom_degrees
FROM patients
WHERE ai_posture_analysis IS NOT NULL;
```

**Extract functional scores:**
```sql
SELECT id, name,
       json_extract(functional_scores, '$.oswestry') as oswestry,
       json_extract(functional_scores, '$.vas') as vas
FROM patients
WHERE functional_scores IS NOT NULL;
```

**Search pain areas:**
```sql
SELECT id, name, pain_areas
FROM patients
WHERE pain_areas LIKE '%lower_back%';
```

---

## Migration Guide

### SQLite → PostgreSQL Migration

For scaling beyond 1000 patients or multi-site deployments:

#### 1. Install PostgreSQL

```bash
# Windows: Download installer from postgresql.org
# Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# Mac:
brew install postgresql
```

#### 2. Create PostgreSQL Database

```sql
CREATE DATABASE low_back_pain;
CREATE USER lbp_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE low_back_pain TO lbp_user;
```

#### 3. Export SQLite Data

```bash
sqlite3 low_back_pain.db .dump > dump.sql
```

#### 4. Convert SQL (SQLite → PostgreSQL)

```bash
# Install pgloader
sudo apt-get install pgloader

# Migrate data
pgloader low_back_pain.db postgresql://lbp_user:password@localhost/low_back_pain
```

#### 5. Update Backend Service

**Modify `database_service.py`:**
```python
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(
        host='localhost',
        database='low_back_pain',
        user='lbp_user',
        password='secure_password',
        cursor_factory=RealDictCursor
    )
```

#### 6. Update Schema

PostgreSQL version with better JSON support:

```sql
CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    study_id TEXT,
    name TEXT,
    gender TEXT,
    age INTEGER,
    phone TEXT,
    onset_date DATE,
    chief_complaint TEXT,
    medical_history TEXT,
    pain_areas JSONB,                    -- Native JSON type
    subjective_exam TEXT,
    objective_exam TEXT,
    functional_scores JSONB,             -- Native JSON type
    intervention TEXT,
    ai_posture_analysis JSONB,           -- Native JSON type
    remarks TEXT,
    created_date TIMESTAMP NOT NULL DEFAULT NOW(),
    last_sync_timestamp TIMESTAMP,
    workspace_id TEXT,
    data_json JSONB                      -- Native JSON type
);

-- Create indexes
CREATE INDEX idx_patients_study_id ON patients(study_id);
CREATE INDEX idx_patients_created_date ON patients(created_date DESC);
CREATE INDEX idx_patients_workspace_id ON patients(workspace_id);
CREATE INDEX idx_pain_areas_gin ON patients USING GIN(pain_areas);
CREATE INDEX idx_functional_scores_gin ON patients USING GIN(functional_scores);
```

---

## Performance Optimization

### Current Performance

| Operation | Time | Notes |
|:---|---:|:---|
| Single INSERT | <10ms | Individual patient creation |
| Single SELECT by ID | <5ms | Primary key lookup |
| SELECT all (100 patients) | <50ms | Full table scan |
| SELECT all (1000 patients) | <200ms | With indexes |
| UPDATE by ID | <15ms | Single patient update |
| DELETE by ID | <10ms | Single patient deletion |

### Optimization Strategies

#### 1. Add Indexes (See [Indexes](#indexes) section)

#### 2. Use Transactions for Batch Operations

```python
conn = get_db_connection()
cursor = conn.cursor()

try:
    cursor.execute('BEGIN TRANSACTION')

    for patient in patients:
        cursor.execute('INSERT INTO patients (...) VALUES (...)', patient)

    cursor.execute('COMMIT')
except Exception as e:
    cursor.execute('ROLLBACK')
    raise e
finally:
    conn.close()
```

#### 3. VACUUM Database Regularly

```bash
sqlite3 low_back_pain.db "VACUUM;"
```

Reduces file size and improves performance. Run monthly or after large deletions.

#### 4. Analyze Tables

```bash
sqlite3 low_back_pain.db "ANALYZE;"
```

Updates query planner statistics for better query optimization.

#### 5. Increase Cache Size

```python
conn = sqlite3.connect('low_back_pain.db')
conn.execute('PRAGMA cache_size = -64000')  # 64 MB cache
```

#### 6. Enable WAL Mode

```python
conn = sqlite3.connect('low_back_pain.db')
conn.execute('PRAGMA journal_mode=WAL')
```

Write-Ahead Logging improves concurrent read performance.

---

## Database Maintenance

### Health Check Script

```python
import sqlite3

def check_database_health():
    conn = sqlite3.connect('low_back_pain.db')
    cursor = conn.cursor()

    # Check integrity
    cursor.execute('PRAGMA integrity_check')
    integrity = cursor.fetchone()[0]
    print(f"Integrity: {integrity}")

    # Count patients
    cursor.execute('SELECT COUNT(*) FROM patients')
    count = cursor.fetchone()[0]
    print(f"Total Patients: {count}")

    # Database size
    cursor.execute('PRAGMA page_count')
    page_count = cursor.fetchone()[0]
    cursor.execute('PRAGMA page_size')
    page_size = cursor.fetchone()[0]
    size_mb = (page_count * page_size) / (1024 * 1024)
    print(f"Database Size: {size_mb:.2f} MB")

    conn.close()

if __name__ == '__main__':
    check_database_health()
```

### Compact Database

```bash
# Create new optimized copy
sqlite3 low_back_pain.db "VACUUM INTO 'low_back_pain_optimized.db'"

# Replace old with new (backup first!)
move low_back_pain.db low_back_pain_backup.db
move low_back_pain_optimized.db low_back_pain.db
```

---

**Last Updated:** 2025-10-17
**Version:** 1.0.0
**Database Engine:** SQLite 3.40+
