# PaddleOCR Integration Guide
## Low Back Pain System - Medical Image Text Extraction

---

## Overview

This document describes the integration of **PaddleOCR** into the Low Back Pain System for automatic text extraction from uploaded medical images (X-rays, reports, scanned documents).

### Features

✅ **Automatic OCR Processing** - Images are processed immediately after upload
✅ **GPU Acceleration** - Uses CUDA if available for fast processing
✅ **Bilingual Support** - Recognizes both Chinese and English text
✅ **Structured Data** - Extracts text with position information
✅ **Error Handling** - Gracefully handles OCR failures
✅ **Async Processing** - Doesn't block file upload responses

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Upload Image                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend API (Node.js)                                          │
│  POST /api/patients/:id/files                                   │
│  • Receives image upload                                        │
│  • Saves to disk (uploads/patients/:id/)                        │
│  • Creates database record                                      │
│  • Returns success to user immediately                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ (Async call - non-blocking)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  OCR Service (Python)                                           │
│  POST http://localhost:5001/ocr/process                         │
│  • Loads image from disk                                        │
│  • Resizes if > 2000px (prevents GPU overflow)                  │
│  • Runs PaddleOCR with GPU acceleration                         │
│  • Extracts text lines and positions                            │
│  • Returns structured OCR results                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Database Update (SQLite)                                       │
│  UPDATE patient_files SET                                       │
│    ocr_processed = true                                         │
│    ocr_text = "Full extracted text..."                          │
│    ocr_text_lines = ["Line 1", "Line 2", ...]                   │
│    ocr_structured = [{text, position, confidence}, ...]         │
│    ocr_processed_at = NOW()                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Installation & Setup

### 1. Prerequisites

**System Requirements:**
- Windows 10/11 (tested) or Linux
- Python 3.8+
- NVIDIA GPU with CUDA 12.x (optional, but recommended for performance)
- Node.js 16+ (for backend API)

**Python Dependencies:**
```bash
pip install paddlepaddle-gpu  # GPU version
# OR
pip install paddlepaddle      # CPU version

pip install paddleocr flask flask-cors pillow
```

Refer to [E:\claude-code\refer\PaddleOCR_GPU_Setup_Guide.md](E:\claude-code\refer\PaddleOCR_GPU_Setup_Guide.md) for detailed GPU setup.

### 2. Database Migration

Add OCR fields to the database schema:

```bash
cd backend
npx prisma migrate dev --name add_ocr_fields
```

This creates the following new fields in `patient_files` table:
- `ocr_processed` (Boolean) - Whether OCR has been attempted
- `ocr_text` (Text) - Full extracted text
- `ocr_text_lines` (JSON) - Array of text lines
- `ocr_structured` (JSON) - Structured data with positions
- `ocr_processed_at` (DateTime) - When OCR was completed
- `ocr_error` (Text) - Error message if OCR failed

### 3. Start OCR Service

```bash
cd backend
python ocr_service.py
```

**Expected Output:**
```
============================================================
PaddleOCR Service for Medical System
============================================================

Features:
  ✓ GPU Acceleration (if available)
  ✓ Chinese + English text recognition
  ✓ Auto image resizing (prevents GPU overflow)
  ✓ Confidence-based filtering
  ✓ Batch processing support

API Endpoints:
  GET  /health              - Health check & GPU status
  POST /ocr/process         - Process single image
  POST /ocr/batch           - Batch process multiple images

============================================================
Initializing PaddleOCR (GPU)...
✅ PaddleOCR initialized successfully with GPU

🚀 Starting server on http://localhost:5001
Press Ctrl+C to stop
```

### 4. Configure Backend API (Optional)

The backend API is pre-configured to connect to OCR service at `http://localhost:5001`.

To use a different URL, set environment variable:
```bash
export OCR_SERVICE_URL=http://your-ocr-server:5001
```

Or add to [backend/.env](backend/.env):
```
OCR_SERVICE_URL=http://localhost:5001
```

### 5. Start Backend API

```bash
cd backend
python server.py
```

---

## Usage

### Automatic OCR Processing

**1. Upload Image via Web Interface:**
- Navigate to patient detail page
- Click "Upload File" button
- Select medical image (JPEG, PNG, GIF)
- Add optional description
- Click "Upload"

**2. What Happens:**
- File is uploaded immediately and saved
- User receives success confirmation
- OCR processing starts in background (async)
- OCR results are saved to database within 1-30 seconds

**3. View OCR Results:**
- Refresh patient files list
- Click on the uploaded image
- See extracted text in file details panel

### Manual OCR Processing (API)

**Process Single Image:**
```bash
curl -X POST http://localhost:5001/ocr/process \
  -H "Content-Type: application/json" \
  -d '{
    "image_path": "/absolute/path/to/image.jpg",
    "options": {
      "extract_structured": true,
      "confidence_threshold": 0.6
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "text_lines": [
    "Patient Information",
    "Name: 张三",
    "Age: 45",
    "Diagnosis: Low Back Pain"
  ],
  "full_text": "Patient Information\nName: 张三\nAge: 45\nDiagnosis: Low Back Pain",
  "line_count": 4,
  "image_info": {
    "width": 1280,
    "height": 960,
    "resized": false
  },
  "structured_data": [
    {
      "text": "Patient Information",
      "confidence": 0.987,
      "position": {"x": 120.5, "y": 45.2},
      "bbox": [[100, 30], [500, 30], [500, 60], [100, 60]]
    },
    ...
  ]
}
```

**Batch Process Multiple Images:**
```bash
curl -X POST http://localhost:5001/ocr/batch \
  -H "Content-Type: application/json" \
  -d '{
    "image_paths": [
      "/path/to/xray1.jpg",
      "/path/to/report1.jpg",
      "/path/to/report2.jpg"
    ]
  }'
```

---

## Database Schema

### Updated `PatientFile` Model

```prisma
model PatientFile {
  id          Int      @id @default(autoincrement())
  patientId   Int
  fileName    String
  filePath    String
  fileType    String?
  fileSize    Int?
  description String?
  uploadedById Int
  createdAt   DateTime @default(now())

  // OCR Results (NEW)
  ocrProcessed   Boolean   @default(false)
  ocrText        String?                    // Full text (searchable)
  ocrTextLines   String?                    // JSON array of lines
  ocrStructured  String?                    // JSON with positions
  ocrProcessedAt DateTime?
  ocrError       String?                    // Error if OCR failed

  // Relations
  patient    Patient @relation(...)
  uploadedBy User    @relation(...)
}
```

### Example Database Records

**Before OCR:**
```json
{
  "id": 1,
  "fileName": "xray_spine_lateral.jpg",
  "filePath": "uploads/patients/5/xray-1697123456789.jpg",
  "fileType": "image/jpeg",
  "fileSize": 245678,
  "ocrProcessed": false,
  "ocrText": null,
  "ocrProcessedAt": null
}
```

**After OCR:**
```json
{
  "id": 1,
  "fileName": "xray_spine_lateral.jpg",
  "ocrProcessed": true,
  "ocrText": "L4-L5 Disc Space Narrowing\nPatient: Zhang San\nDate: 2025-10-13",
  "ocrTextLines": "[\"L4-L5 Disc Space Narrowing\", \"Patient: Zhang San\", \"Date: 2025-10-13\"]",
  "ocrStructured": "[{\"text\":\"L4-L5 Disc Space Narrowing\",\"confidence\":0.95,\"position\":{\"x\":120,\"y\":50}}]",
  "ocrProcessedAt": "2025-10-13T10:15:30.000Z",
  "ocrError": null
}
```

---

## Testing

### Run Test Suite

```bash
cd "E:\claude-code\low back pain system"
python test_ocr_integration.py
```

**Test Coverage:**
1. ✅ OCR Service Health Check
2. ✅ Test Image Creation
3. ✅ Single Image OCR Processing
4. ✅ Batch OCR Processing
5. ✅ Database Schema Verification

### Create Test Images

Place test medical images in `test_images/` directory:

```
test_images/
├── test_medical_report.jpg
├── xray_sample_1.jpg
├── xray_sample_2.jpg
└── patient_info_card.png
```

Then run the test script to process them.

---

## Performance & Best Practices

### Image Size Guidelines

⚠️ **CRITICAL:** Images must be resized to **< 2000 pixels** in both dimensions to prevent GPU memory overflow.

The OCR service automatically handles this:
```python
# Automatic resizing in ocr_service.py
img = resize_image_if_needed(image_path, max_size=2000)
```

### Processing Time

| Image Size | GPU Time | CPU Time |
|:-----------|:---------|:---------|
| 800x600    | 0.5s     | 2s       |
| 1280x960   | 0.8s     | 3s       |
| 1920x1080  | 1.2s     | 5s       |
| 2000x2000  | 2.0s     | 8s       |

### GPU Memory Usage

- **Single Image:** ~500MB GPU memory
- **Batch Processing:** ~500MB per image (sequential processing)
- **Model Loading:** ~300MB (one-time on startup)

### Confidence Threshold

Default: `0.6` (60% confidence)

- **Higher (0.8+):** More accurate, fewer false positives, may miss some text
- **Lower (0.4-0.6):** More text captured, may include false positives
- **Adjust based on your image quality**

### Async Processing Benefits

✅ User doesn't wait for OCR to complete
✅ Upload response is immediate (< 200ms)
✅ OCR runs in background
✅ Failures don't block file upload

---

## Troubleshooting

### OCR Service Won't Start

**Problem:** `ImportError: No module named 'paddleocr'`

**Solution:**
```bash
pip install paddleocr paddlepaddle-gpu
```

---

### GPU Not Detected

**Problem:** Service falls back to CPU mode

**Check GPU:**
```bash
nvidia-smi
```

**Verify CUDA:**
```bash
python -c "import paddle; print(paddle.device.cuda.device_count())"
```

**Solution:** See [E:\claude-code\refer\PaddleOCR_GPU_Setup_Guide.md](E:\claude-code\refer\PaddleOCR_GPU_Setup_Guide.md)

---

### OCR Results Empty

**Possible Causes:**
1. Image quality too low
2. Text too small
3. Extreme contrast issues
4. Non-standard fonts

**Solutions:**
- Increase image resolution before upload
- Adjust contrast/brightness
- Lower confidence threshold in OCR options
- Check `ocrError` field in database for details

---

### Connection Refused Error

**Problem:** Backend can't connect to OCR service

**Check:**
```bash
curl http://localhost:5001/health
```

**Solution:** Make sure OCR service is running:
```bash
python backend/ocr_service.py
```

---

### Images Not Processing Automatically

**Debug Steps:**

1. Check OCR service logs for errors
2. Verify image file type is allowed (JPEG, PNG, GIF)
3. Check backend logs for `[OCR]` messages
4. Manually test OCR endpoint:
   ```bash
   curl -X POST http://localhost:5001/ocr/process \
     -H "Content-Type: application/json" \
     -d '{"image_path": "/path/to/uploaded/image.jpg"}'
   ```

---

## API Reference

### OCR Service Endpoints

#### `GET /health`
Health check and GPU status

**Response:**
```json
{
  "status": "healthy",
  "ocr_status": "initialized",
  "gpu_available": true,
  "gpu_count": 1
}
```

---

#### `POST /ocr/process`
Process single image

**Request:**
```json
{
  "image_path": "/absolute/path/to/image.jpg",
  "options": {
    "extract_structured": true,
    "confidence_threshold": 0.6
  }
}
```

**Response:**
```json
{
  "success": true,
  "text_lines": ["Line 1", "Line 2", ...],
  "full_text": "All text combined",
  "line_count": 10,
  "image_info": {
    "width": 1280,
    "height": 960,
    "resized": false
  },
  "structured_data": [
    {
      "text": "Text content",
      "confidence": 0.95,
      "position": {"x": 100, "y": 50},
      "bbox": [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
    }
  ]
}
```

---

#### `POST /ocr/batch`
Batch process multiple images

**Request:**
```json
{
  "image_paths": ["/path/1.jpg", "/path/2.jpg"],
  "options": {"confidence_threshold": 0.6}
}
```

**Response:**
```json
{
  "results": [
    {"image_path": "...", "success": true, "text_lines": [...], ...},
    {"image_path": "...", "success": false, "error": "..."}
  ],
  "summary": {
    "total": 2,
    "success": 1,
    "failed": 1
  }
}
```

---

## Integration with Frontend (Future Enhancement)

### Display OCR Results in UI

**Patient File Card Component:**
```jsx
function FileCard({ file }) {
  return (
    <div className="file-card">
      <h3>{file.fileName}</h3>

      {file.ocrProcessed && file.ocrText && (
        <div className="ocr-results">
          <h4>📄 Extracted Text</h4>
          <pre>{file.ocrText}</pre>

          <button onClick={() => copyToClipboard(file.ocrText)}>
            Copy Text
          </button>
        </div>
      )}

      {file.ocrProcessed && file.ocrError && (
        <div className="ocr-error">
          ⚠️ OCR failed: {file.ocrError}
        </div>
      )}

      {!file.ocrProcessed && (
        <div className="ocr-pending">
          🔄 Processing OCR...
        </div>
      )}
    </div>
  );
}
```

### Search OCR Text

Add full-text search capability:
```sql
-- Search across all OCR results
SELECT p.study_id, pf.file_name, pf.ocr_text
FROM patient_files pf
JOIN patients p ON p.id = pf.patient_id
WHERE pf.ocr_text LIKE '%L4-L5%'
ORDER BY pf.created_at DESC;
```

---

## Files Reference

### Core Integration Files

| File | Purpose |
|:-----|:--------|
| [backend/ocr_service.py](backend/ocr_service.py) | Python Flask service for OCR processing |
| [backend/src/routes/patients.js](backend/src/routes/patients.js) | Node.js route handler with OCR integration |
| [backend/database/schema.prisma](backend/database/schema.prisma) | Database schema with OCR fields |
| [test_ocr_integration.py](test_ocr_integration.py) | Comprehensive test suite |
| [OCR_INTEGRATION_GUIDE.md](OCR_INTEGRATION_GUIDE.md) | This document |

### Reference Documentation

| File | Purpose |
|:-----|:--------|
| [E:\claude-code\refer\PaddleOCR_GPU_Setup_Guide.md](E:/claude-code/refer/PaddleOCR_GPU_Setup_Guide.md) | Detailed GPU setup and usage guide |
| [E:\claude-code\abc\小红书博主\process_xiaohongshu_screenshots.py](E:/claude-code/abc/小红书博主/process_xiaohongshu_screenshots.py) | Real-world OCR example (90% accuracy) |

---

## Future Enhancements

### Phase 2: Advanced Features

- [ ] **Real-time OCR progress updates** via WebSocket
- [ ] **OCR text highlighting** on image overlay
- [ ] **Full-text search** across all patient files
- [ ] **Medical term extraction** (diagnoses, medications, scores)
- [ ] **OCR result editing** (correct misrecognized text)
- [ ] **Confidence visualization** (highlight low-confidence text)
- [ ] **Language auto-detection** (Chinese vs English)
- [ ] **Batch re-processing** for improved model versions

### Phase 3: AI Enhancement

- [ ] **Named Entity Recognition** (extract specific medical terms)
- [ ] **Automatic report summarization**
- [ ] **Patient info auto-fill** (extract name, age, date)
- [ ] **Pain score extraction** from reports
- [ ] **Red flag detection** from report text

---

## Support & Contact

**PaddleOCR Documentation:** https://github.com/PaddlePaddle/PaddleOCR
**Project Base:** E:\claude-code\low back pain system\
**Session Log:** E:\claude-code\2025_new_me_copy\focus-sessions\session [N] [YYYYMMDD].md

---

**Last Updated:** 2025-10-13
**Version:** 1.0
**Tested Environment:** Windows 11, CUDA 12.3, PaddlePaddle 3.0.0b2, RTX 3060
