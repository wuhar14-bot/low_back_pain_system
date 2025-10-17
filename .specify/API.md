# API Specification

Complete API documentation for all backend services in the Low Back Pain Data Collection System.

---

## Table of Contents

1. [Database Service (Port 5003)](#database-service-port-5003)
2. [OCR Service (Port 5001)](#ocr-service-port-5001)
3. [Pose Estimation Service (Port 5002)](#pose-estimation-service-port-5002)
4. [Frontend API Client](#frontend-api-client)

---

## Database Service (Port 5003)

**Base URL:** `http://localhost:5003/api`

**Mobile URL:** `http://172.20.10.4:5003/api`

**Technology:** Flask + SQLite3

### Health Check

#### `GET /health`

Check database service health and status.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "total_patients": 42,
  "db_path": "E:\\claude-code\\low back pain system\\backend\\low_back_pain.db"
}
```

---

### Patient Endpoints

#### `GET /api/patients`

List all patients with optional sorting.

**Query Parameters:**
- `sort` (optional): Sort order. Values: `-created_date` (newest first, default) or `created_date` (oldest first)

**Example:**
```
GET /api/patients?sort=-created_date
```

**Response:**
```json
[
  {
    "id": "patient-1760686123456",
    "study_id": "HKU2025001",
    "name": "张三",
    "gender": "男",
    "age": 45,
    "phone": "13800138000",
    "onset_date": "2025-10-15",
    "chief_complaint": "腰痛3个月，加重1周",
    "pain_areas": "[\"lower_back\", \"left_leg\"]",
    "created_date": "2025-10-17T10:30:00.000Z",
    "last_sync_timestamp": "2025-10-17T10:30:00.000Z",
    "workspace_id": "workspace-1",
    "ai_posture_analysis": "{...}",
    "data_json": "{...}"
  },
  ...
]
```

---

#### `GET /api/patients/<id>`

Get a single patient by ID.

**Path Parameters:**
- `id`: Patient ID (e.g., `patient-1760686123456`)

**Example:**
```
GET /api/patients/patient-1760686123456
```

**Response:**
```json
{
  "id": "patient-1760686123456",
  "study_id": "HKU2025001",
  "name": "张三",
  "gender": "男",
  "age": 45,
  "phone": "13800138000",
  "onset_date": "2025-10-15",
  "chief_complaint": "腰痛3个月，加重1周",
  "medical_history": "高血压病史5年",
  "pain_areas": ["lower_back", "left_leg"],
  "subjective_exam": "VAS 7/10",
  "objective_exam": "L4-L5压痛(+)",
  "functional_scores": {
    "oswestry": 42,
    "vas": 7
  },
  "intervention": "物理治疗，药物治疗",
  "ai_posture_analysis": {
    "rom_degrees": 47.4,
    "rom_assessment": "轻度受限",
    "standing_trunk_angle": 85.3,
    "flexion_trunk_angle": 132.7,
    "compensations": "膝关节轻度屈曲",
    "recommendations": "加强核心稳定性训练"
  },
  "remarks": "患者依从性良好",
  "created_date": "2025-10-17T10:30:00.000Z",
  "last_sync_timestamp": "2025-10-17T15:45:00.000Z",
  "workspace_id": "workspace-1"
}
```

**Error Response (404):**
```json
{
  "error": "Patient not found"
}
```

---

#### `POST /api/patients`

Create a new patient.

**Request Body:**
```json
{
  "study_id": "HKU2025001",
  "name": "张三",
  "gender": "男",
  "age": 45,
  "phone": "13800138000",
  "onset_date": "2025-10-15",
  "chief_complaint": "腰痛3个月，加重1周",
  "medical_history": "高血压病史5年",
  "pain_areas": ["lower_back", "left_leg"],
  "workspace_id": "workspace-1"
}
```

**Response (201 Created):**
```json
{
  "id": "patient-1760686123456",
  "study_id": "HKU2025001",
  "name": "张三",
  "gender": "男",
  "age": 45,
  "phone": "13800138000",
  "onset_date": "2025-10-15",
  "chief_complaint": "腰痛3个月，加重1周",
  "medical_history": "高血压病史5年",
  "pain_areas": ["lower_back", "left_leg"],
  "created_date": "2025-10-17T10:30:00.000Z",
  "last_sync_timestamp": "2025-10-17T10:30:00.000Z",
  "workspace_id": "workspace-1"
}
```

---

#### `PUT /api/patients/<id>`

Update an existing patient.

**Path Parameters:**
- `id`: Patient ID

**Request Body (partial update supported):**
```json
{
  "objective_exam": "L4-L5压痛(+)",
  "functional_scores": {
    "oswestry": 42,
    "vas": 7
  },
  "ai_posture_analysis": {
    "rom_degrees": 47.4,
    "rom_assessment": "轻度受限"
  }
}
```

**Response:**
```json
{
  "id": "patient-1760686123456",
  "study_id": "HKU2025001",
  "name": "张三",
  "objective_exam": "L4-L5压痛(+)",
  "functional_scores": {
    "oswestry": 42,
    "vas": 7
  },
  "ai_posture_analysis": {
    "rom_degrees": 47.4,
    "rom_assessment": "轻度受限"
  },
  "last_sync_timestamp": "2025-10-17T15:45:00.000Z",
  ...
}
```

---

#### `DELETE /api/patients/<id>`

Delete a patient.

**Path Parameters:**
- `id`: Patient ID

**Response:**
```json
{
  "id": "patient-1760686123456",
  "study_id": "HKU2025001",
  "name": "张三",
  ...
}
```

**Error Response (404):**
```json
{
  "error": "Patient not found"
}
```

---

## OCR Service (Port 5001)

**Base URL:** `http://localhost:5001`

**Mobile URL:** `http://172.20.10.4:5001`

**Technology:** Flask + PaddleOCR

### Health Check

#### `GET /health`

Check OCR service health and GPU status.

**Response:**
```json
{
  "status": "healthy",
  "gpu_available": true,
  "model_loaded": true,
  "version": "PaddleOCR 2.7.0"
}
```

---

### OCR Processing

#### `POST /ocr/process`

Process a single image with OCR.

**Request Body:**
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response:**
```json
{
  "success": true,
  "full_text": "姓名: 张三\n年龄: 45岁\n性别: 男\n主诉: 腰痛3个月，加重1周...",
  "text_lines": [
    "姓名: 张三",
    "年龄: 45岁",
    "性别: 男",
    "主诉: 腰痛3个月，加重1周"
  ],
  "bounding_boxes": [
    {
      "text": "姓名: 张三",
      "confidence": 0.95,
      "bbox": [[10, 20], [100, 20], [100, 40], [10, 40]]
    },
    ...
  ],
  "processing_time_ms": 1847
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid image format"
}
```

---

#### `POST /ocr/batch`

Batch process multiple images.

**Request Body:**
```json
{
  "images": [
    {"id": "img1", "image_base64": "data:image/jpeg;base64,..."},
    {"id": "img2", "image_base64": "data:image/jpeg;base64,..."}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "img1",
      "success": true,
      "full_text": "...",
      "text_lines": [...]
    },
    {
      "id": "img2",
      "success": true,
      "full_text": "...",
      "text_lines": [...]
    }
  ],
  "total_processing_time_ms": 3521
}
```

---

## Pose Estimation Service (Port 5002)

**Base URL:** `http://localhost:5002`

**Mobile URL:** `http://172.20.10.4:5002`

**Technology:** Flask + MediaPipe Pose

### Health Check

#### `GET /health`

Check pose service health.

**Response:**
```json
{
  "status": "healthy",
  "mediapipe_version": "0.10.8",
  "model_complexity": 2,
  "landmarks_count": 33
}
```

---

### Pose Analysis

#### `POST /pose/analyze-static`

Analyze static pose images (standing + flexion).

**Request Body:**
```json
{
  "standing_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "flexion_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "calculate_rom": true,
  "detect_compensations": true
}
```

**Response:**
```json
{
  "success": true,
  "standing_analysis": {
    "landmarks": [
      {"x": 0.45, "y": 0.32, "z": -0.1, "visibility": 0.98},
      ...
    ],
    "trunk_angle": 85.3,
    "pelvic_tilt": 12.5,
    "knee_angle": 178.2
  },
  "flexion_analysis": {
    "landmarks": [...],
    "trunk_angle": 132.7,
    "pelvic_tilt": 25.8,
    "knee_angle": 165.3
  },
  "rom_analysis": {
    "rom_degrees": 47.4,
    "rom_assessment": "轻度受限",
    "compensations": "膝关节轻度屈曲",
    "recommendations": "加强核心稳定性训练，改善髋关节灵活性"
  },
  "processing_time_ms": 1523
}
```

**ROM Assessment Values:**
- `"正常"` - Normal (>60°)
- `"轻度受限"` - Mild limitation (45-60°)
- `"中度受限"` - Moderate limitation (30-45°)
- `"重度受限"` - Severe limitation (<30°)

**Landmark Format:**
```json
{
  "x": 0.45,          // Normalized x coordinate (0-1)
  "y": 0.32,          // Normalized y coordinate (0-1)
  "z": -0.1,          // Depth (relative to hip center)
  "visibility": 0.98  // Confidence score (0-1)
}
```

**MediaPipe Landmark Indices:**
```
0: Nose
1-10: Face landmarks
11: Left shoulder
12: Right shoulder
13: Left elbow
14: Right elbow
15: Left wrist
16: Right wrist
17-22: Hand landmarks
23: Left hip
24: Right hip
25: Left knee
26: Right knee
27: Left ankle
28: Right ankle
29-32: Foot landmarks
```

**Error Response:**
```json
{
  "success": false,
  "error": "No pose detected in standing image"
}
```

---

## Frontend API Client

**File:** `src/api/entities.js`

### Patient Entity

The frontend uses a unified `Patient` entity class that abstracts database API calls:

```javascript
import { Patient } from '@/api/entities';

// List all patients
const patients = await Patient.list('-created_date');

// Get single patient
const patient = await Patient.get('patient-123');

// Create new patient
const newPatient = await Patient.create({
  study_id: 'HKU2025001',
  name: '张三',
  age: 45,
  ...
});

// Update patient
const updated = await Patient.update('patient-123', {
  objective_exam: 'New findings',
  ...
});

// Delete patient
await Patient.delete('patient-123');
```

### API URL Resolution

The frontend automatically uses the correct hostname for mobile compatibility:

```javascript
// On PC: http://localhost:5003/api
// On Mobile: http://172.20.10.4:5003/api
const getApiUrl = () => `http://${window.location.hostname}:5003/api`;
```

### Error Handling

All API calls include fallback to localStorage:

```javascript
try {
  // Try database API first
  const response = await fetch(`${getApiUrl()}/patients`);
  const patients = await response.json();
  return patients;
} catch (error) {
  // Fallback to localStorage
  console.warn('⚠️ [DB] Database unavailable, using localStorage');
  return loadPatientsFromLocalStorage();
}
```

---

## Common Response Codes

| Code | Meaning | Description |
|:---|:---|:---|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request body or parameters |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error occurred |

---

## CORS Configuration

All backend services are configured with CORS enabled:

```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # Allow all origins (local network only)
```

This allows the frontend (port 5173) to call backend services (ports 5001, 5002, 5003) without CORS errors.

---

## Rate Limiting

**Current:** No rate limiting (local deployment)

**Future:** Consider adding rate limiting for cloud deployment:
```python
from flask_limiter import Limiter

limiter = Limiter(app, default_limits=["100 per minute"])
```

---

## Authentication

**Current:** Login required at application level (handled by frontend)

**Future:** Consider JWT tokens for API authentication:
```python
from flask_jwt_extended import create_access_token, jwt_required

@app.route('/api/patients', methods=['GET'])
@jwt_required()
def list_patients():
    ...
```

---

**Last Updated:** 2025-10-17
**Version:** 1.0.0
**API Status:** Stable
