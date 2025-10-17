# Quick Start - Testing OCR Integration

## 5-Minute Test Guide

Follow these steps to test the PaddleOCR integration in your Low Back Pain System.

---

## Prerequisites Check

```bash
# 1. Check Python
python --version
# Should be 3.8 or higher

# 2. Check PaddleOCR installation
python -c "import paddleocr; print('PaddleOCR installed ✓')"

# 3. Check GPU (optional)
python -c "import paddle; print(f'GPU available: {paddle.device.cuda.device_count() > 0}')"
```

If any check fails, see [E:\claude-code\refer\PaddleOCR_GPU_Setup_Guide.md](E:/claude-code/refer/PaddleOCR_GPU_Setup_Guide.md)

---

## Step 1: Start OCR Service (Terminal 1)

```bash
cd "E:\claude-code\low back pain system\backend"
python ocr_service.py
```

**Expected Output:**
```
============================================================
PaddleOCR Service for Medical System
============================================================
Initializing PaddleOCR (GPU)...
✅ PaddleOCR initialized successfully with GPU
🚀 Starting server on http://localhost:5001
```

**✓ Service is ready when you see "Starting server"**

Leave this terminal running!

---

## Step 2: Test OCR Service (Terminal 2)

Open a new terminal and run:

```bash
cd "E:\claude-code\low back pain system"
python test_ocr_integration.py
```

**Expected Output:**
```
======================================================================
  PaddleOCR Integration Test Suite
  Low Back Pain System - Medical Image OCR
======================================================================

======================================================================
                    Test 1: OCR Service Health Check
======================================================================

✓ OCR service is running
ℹ Status: healthy
ℹ OCR Status: initialized
ℹ GPU Available: True
ℹ GPU Count: 1

======================================================================
                    Test 2: Creating Test Image
======================================================================

✓ Test image created: test_images\test_medical_report.jpg

... (more tests) ...

======================================================================
                           Test Summary
======================================================================

✓ OCR Service Health
✓ Test Image Creation
✓ Single Image OCR
✓ Batch OCR Processing
✓ Database Schema

✓ All tests passed! (5/5)
```

---

## Step 3: Test with Your Own Image

### 3A. Create a test image

Place any medical image (X-ray, report, document) in the test_images folder:

```bash
# Create test directory
mkdir "test_images"

# Copy your test image
copy "C:\path\to\your\medical_image.jpg" "test_images\my_test.jpg"
```

### 3B. Test OCR on your image

```bash
# Quick test via curl (Windows PowerShell)
curl -X POST http://localhost:5001/ocr/process `
  -H "Content-Type: application/json" `
  -d '{\"image_path\": \"E:\\claude-code\\low back pain system\\test_images\\my_test.jpg\", \"options\": {\"extract_structured\": true}}'

# Or use Python
python -c "
import requests
import json

response = requests.post('http://localhost:5001/ocr/process', json={
    'image_path': r'E:\claude-code\low back pain system\test_images\my_test.jpg',
    'options': {'extract_structured': True}
})

result = response.json()
print('Success:', result['success'])
print('Lines extracted:', result.get('line_count', 0))
print('\nExtracted text:')
for i, line in enumerate(result.get('text_lines', [])[:10], 1):
    print(f'{i}. {line}')
"
```

---

## Step 4: Update Database Schema

Before running the full system, add OCR fields to database:

```bash
cd backend
npx prisma migrate dev --name add_ocr_fields
```

**Expected Output:**
```
Prisma schema loaded from database\schema.prisma
Datasource "db": SQLite database "medical_data.db"

✔ Enter a name for the new migration: … add_ocr_fields
Applying migration `20251013_add_ocr_fields`

The following migration(s) have been applied:

migrations/
  └─ 20251013_add_ocr_fields/
      └─ migration.sql

✔ Generated Prisma Client
```

---

## Step 5: Start Backend API (Terminal 3)

```bash
cd backend
python server.py
```

**Expected Output:**
```
Medical System Backend Server
========================================
Database: database/medical_data.db
Server starting on http://localhost:3001
API endpoints available:
  POST /api/auth/login
  GET  /api/patients
  ...

Default credentials:
  Admin: username=admin, password=admin123
```

---

## Step 6: Test File Upload with OCR

### Option A: Use the Web Interface

1. Start frontend: `npm run dev` (in frontend directory)
2. Open http://localhost:5174
3. Login with admin/admin123
4. Navigate to any patient
5. Upload an image (JPEG/PNG)
6. Wait 5-10 seconds
7. Refresh the files list
8. Click on the image to see extracted OCR text

### Option B: Test via API

```bash
# Upload a file via API (replace paths and IDs)
curl -X POST http://localhost:3001/api/patients/1/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_images/my_test.jpg" \
  -F "description=Test OCR integration"

# Check OCR results after 10 seconds
curl http://localhost:3001/api/patients/1/files
```

---

## Verification Checklist

Check that everything is working:

- [ ] OCR service responds to health check
- [ ] Test script passes all 5 tests
- [ ] Can process your own test image
- [ ] Database migration completed successfully
- [ ] Backend API starts without errors
- [ ] Image upload triggers OCR processing
- [ ] OCR results saved to database

---

## Troubleshooting

### OCR Service Won't Start

**Error:** `ModuleNotFoundError: No module named 'paddleocr'`

**Fix:**
```bash
pip install paddleocr paddlepaddle-gpu
```

---

### Test Script Fails on Health Check

**Error:** `Cannot connect to OCR service`

**Fix:** Make sure OCR service is running in Terminal 1

---

### No OCR Results in Database

**Check backend logs:**
- Look for `[OCR] Processing file ID ...` messages
- Look for `[OCR] ✅ Success:` or `[OCR] ❌ Error:` messages

**Common causes:**
1. OCR service not running → Start it
2. Wrong file path → Check `filePath` in database
3. OCR timeout → Increase timeout in patients.js (default 60s)

---

### GPU Not Working

**Check GPU:**
```bash
nvidia-smi
python -c "import paddle; print(paddle.device.cuda.device_count())"
```

**If 0 GPUs detected:**
- OCR will still work (using CPU, slower)
- See [PaddleOCR_GPU_Setup_Guide.md](E:/claude-code/refer/PaddleOCR_GPU_Setup_Guide.md) for GPU setup

---

## Performance Expectations

### GPU Mode (NVIDIA RTX 3060)
- Image loading: 0.1s
- OCR processing: 0.5-2s
- Database update: 0.1s
- **Total: 1-3 seconds per image**

### CPU Mode
- Image loading: 0.1s
- OCR processing: 2-8s
- Database update: 0.1s
- **Total: 3-10 seconds per image**

---

## Sample Test Images

### Good Test Images (High Success Rate)

✅ Medical reports with printed text
✅ X-ray labels and annotations
✅ Patient information cards
✅ Scanned documents with clear text
✅ Screenshots with high contrast

### Challenging Images (Lower Accuracy)

⚠️ Handwritten notes (may not recognize)
⚠️ Very small text (< 12pt)
⚠️ Low-quality photos
⚠️ Extreme angles or rotations
⚠️ Complex backgrounds

---

## Next Steps

After successful testing:

1. **Review extracted text** - Check accuracy for your specific medical images
2. **Adjust confidence threshold** - Lower for more text, higher for accuracy
3. **Integrate with frontend** - Display OCR results in patient file UI
4. **Enable search** - Add full-text search across OCR results
5. **Monitor performance** - Check OCR processing times and GPU usage

See [OCR_INTEGRATION_GUIDE.md](OCR_INTEGRATION_GUIDE.md) for complete documentation.

---

## Quick Reference

### Service URLs
- OCR Service: http://localhost:5001
- Backend API: http://localhost:3001
- Frontend: http://localhost:5174

### Key Files
- OCR Service: `backend/ocr_service.py`
- Integration: `backend/src/routes/patients.js`
- Schema: `backend/database/schema.prisma`
- Test: `test_ocr_integration.py`

### Commands
```bash
# Start OCR service
python backend/ocr_service.py

# Run tests
python test_ocr_integration.py

# Check OCR health
curl http://localhost:5001/health

# Process image
curl -X POST http://localhost:5001/ocr/process -H "Content-Type: application/json" -d '{"image_path": "PATH"}'
```

---

**Ready to test?** Start with Step 1! 🚀
