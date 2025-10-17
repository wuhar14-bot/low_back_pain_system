# Patient Data Anonymization (匿名化处理)

## Overview
The low back pain system has been configured for patient data anonymization to protect patient privacy and comply with research ethics requirements.

## Changes Made

### 1. User Interface Updates
- **Dashboard.jsx**:
  - Search function now searches by Study ID instead of patient name
  - Export function shows "研究编号" (Study ID) instead of "患者姓名" (Patient Name)
  - Delete confirmation shows Study ID instead of patient name

- **PatientDetail.jsx**:
  - Patient header displays Study ID instead of patient name

### 2. Data Mapping File
- **File**: `patient_id_mapping.csv`
- **Location**: Root directory of the project
- **Contents**: Maps Study IDs to patient names and phone numbers
- **Format**:
  ```csv
  study_id,patient_name,phone
  LBP-001,黄宇,159****7387
  LBP-002,吴妍,188****5783
  ...
  ```

### 3. Security Measures
- CSV mapping file added to `.gitignore` to prevent accidental commits
- Only authorized personnel should have access to the mapping file
- System displays only Study IDs (LBP-001, LBP-002, etc.) to end users

## Study ID Format
- **Pattern**: LBP-XXX (where XXX is a 3-digit number)
- **Example**: LBP-001, LBP-002, LBP-143
- **Total Patients**: 143 patients mapped

## Usage Instructions

### For Researchers
- Use Study IDs when referencing patients in research papers
- Store the CSV mapping file securely and separately from the main system
- Only use patient names when absolutely necessary for clinical care

### For System Administrators
- The CSV file should be backed up securely
- Access to the mapping file should be restricted
- Regular audits should ensure patient names are not displayed in the UI

## Data Protection
- Patient names are no longer visible in the system interface
- All patient identification is done through Study IDs
- Original patient data remains intact in the database
- Mapping between Study IDs and names is stored separately

## Adding New Patients (Future Entries)

### Process for New Patient Data Entry
1. **Patient Form Completion**: Enter patient information normally in the system
2. **Auto Study ID Generation**: System automatically assigns next Study ID (LBP-144, LBP-145, etc.)
3. **System Display**: Only Study ID is shown throughout the interface
4. **Mapping Update**: Patient name and Study ID are automatically added to CSV file

### Manual CSV Update (if needed)
Use the helper script to manage patient mappings:

```bash
# Get next available Study ID
python update_patient_mapping.py --next-id

# Add new patient manually
python update_patient_mapping.py LBP-144 "新患者姓名" "138****1234"

# Sync all patients from database
python update_patient_mapping.py
```

### Key Points for New Patients
- ✅ **System shows**: Study ID only (LBP-XXX)
- ✅ **CSV stores**: Study ID + Patient Name + Phone
- ✅ **Auto-increment**: Next Study ID generated automatically
- ✅ **Privacy maintained**: No patient names visible in UI

## Emergency Access
If patient names are needed for clinical purposes, authorized personnel can:
1. Access the `patient_id_mapping.csv` file
2. Look up the Study ID to find the corresponding patient name
3. Follow institutional protocols for patient data access

## Maintenance Tools
- **Script**: `update_patient_mapping.py`
- **Purpose**: Manage Study ID assignments and CSV updates
- **Location**: Root directory of the project

---
**Created**: 2025-09-26
**Updated**: 2025-09-26
**Purpose**: Research data anonymization and patient privacy protection