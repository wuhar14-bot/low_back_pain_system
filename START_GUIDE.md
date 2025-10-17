# Low Back Pain System - Complete Startup Guide

**Last Updated:** 2025-10-17

---

## Quick Start (Recommended Method)

### ⚡ One-Click Startup

**Double-click this file:**
```
start_all_services.bat
```

This automatically starts all 3 required services and opens the browser.

---

## System Overview

This medical system provides:
1. **OCR-based form filling** for patient data collection
2. **AI pose estimation** for posture analysis
3. **Patient management** interface

**Required Services:**

| Service | Port | Purpose |
|:---|:---:|:---|
| **OCR Service** | 5001 | Form filling (PaddleOCR) |
| **Pose Service** | 5002 | Posture analysis (MediaPipe) |
| **Frontend** | 5173 | Web interface (React/Vite) |

**⚠️ All 3 services MUST be running for full functionality!**

---

## Manual Startup (Alternative)

If you prefer to start services manually in separate terminals:

### Terminal 1: OCR Service

```bash
cd "E:\claude-code\low back pain system\backend"
python ocr_service.py
```

**Expected Output:**
```
[OK] PaddleOCR initialized successfully with GPU
[START] Starting server on http://localhost:5001
```

### Terminal 2: Pose Service

```bash
cd "E:\claude-code\low back pain system\backend"
python pose_service.py
```

**Expected Output:**
```
[OK] MediaPipe Pose initialized successfully
[START] Starting server on http://localhost:5002
```

### Terminal 3: Frontend

```bash
cd "E:\claude-code\low back pain system"
npm run dev
```

**Expected Output:**
```
VITE v6.3.6  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## Access the Application

Open browser: **http://localhost:5173**

---

## Common Issues & Quick Fixes

### Issue 1: "ERR_CONNECTION_REFUSED"

**Symptom:** Image upload fails with connection errors

**Cause:** One or more backend services not running

**Fix:**
- Check which port is failing (5001 = OCR, 5002 = Pose)
- Start the missing service(s)
- Refresh browser

### Issue 2: "Port already in use"

**Fix:**
```bash
# Find process
netstat -ano | findstr :5001

# Kill process
taskkill /PID <process_id> /F
```

### Issue 3: "You must be logged in to access this app"

**Symptom:** Modal shows login required message

**Cause:** Application requires authentication (demo/development mode may bypass this)

**Fix:** Check if there's a default login or contact system admin

### Issue 4: Unicode/Chinese character errors in Python console

**Symptom:** Service crashes with `UnicodeEncodeError`

**Status:** Already fixed in latest code (wrapped in try-except)

**Note:** JSON responses always work correctly - only console logging affected

---

## Stopping Services

### Stop All at Once
```bash
# Kill all node (Frontend)
taskkill /IM node.exe /F

# Kill all python (OCR + Pose)
taskkill /IM python.exe /F
```

### Stop Individual Service
Press `Ctrl+C` in the terminal running that service

---

## Health Checks

Verify services are running:

```bash
# OCR Service
curl http://localhost:5001/health

# Pose Service
curl http://localhost:5002/health

# Frontend
# Open: http://localhost:5173
```

---

## Service Details

### OCR Service (Port 5001)

**Features:**
- Chinese + English text recognition
- GPU acceleration (if available)
- Automatic field extraction for medical forms
- Auto image resizing

**Endpoints:**
- `GET /health` - Health check
- `POST /ocr/process` - Process single image
- `POST /ocr/batch` - Batch processing

### Pose Service (Port 5002)

**Features:**
- MediaPipe Pose with 33 landmarks
- Trunk angle calculation
- ROM (Range of Motion) measurement
- Compensation detection
- Clinical recommendations

**Endpoints:**
- `GET /health` - Health check
- `POST /pose/analyze-static` - Analyze 2 photos (standing + flexion)

### Frontend (Port 5173)

**Features:**
- Patient data collection with OCR
- AI posture analysis (姿态分析)
- Patient management dashboard
- Medical form processing

---

## Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.8+ (for OCR + Pose services)
- **GPU** (optional but recommended for faster OCR)

**Python packages installed via:**
- `pip install -r requirements_pose.txt` (MediaPipe dependencies)
- PaddlePaddle + PaddleOCR (already configured)

---

## Troubleshooting Tips

### Services won't start?

1. Check if ports are available:
   ```bash
   netstat -ano | findstr :5001
   netstat -ano | findstr :5002
   netstat -ano | findstr :5173
   ```

2. Kill conflicting processes if needed

3. Check Python/Node.js are installed:
   ```bash
   python --version
   node --version
   ```

### Frontend errors?

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Verify backend services are running (check /health endpoints)

### OCR not working?

1. Verify OCR service is running on port 5001
2. Check GPU status: `curl http://localhost:5001/health`
3. Look for GPU warnings in OCR service console

### Pose analysis not working?

1. Verify Pose service is running on port 5002
2. Check service: `curl http://localhost:5002/health`
3. Ensure MediaPipe model downloaded successfully

---

## File Structure

```
low back pain system/
├── start_all_services.bat    # One-click startup script
├── START_GUIDE.md            # This file
├── frontend/                 # React application source
├── backend/
│   ├── ocr_service.py       # OCR service (port 5001)
│   ├── pose_service.py      # Pose service (port 5002)
│   ├── requirements_pose.txt
│   └── POSE_SERVICE_README.md
├── test_images/             # Sample test images
└── package.json             # Frontend dependencies
```

---

## Quick Reference Commands

```bash
# Start all services (recommended)
# Just double-click: start_all_services.bat

# Manual startup
cd "E:\claude-code\low back pain system\backend"
python ocr_service.py        # Terminal 1
python pose_service.py       # Terminal 2

cd "E:\claude-code\low back pain system"
npm run dev                  # Terminal 3

# Health checks
curl http://localhost:5001/health  # OCR
curl http://localhost:5002/health  # Pose
start http://localhost:5173        # Open browser

# Stop all
taskkill /IM node.exe /F && taskkill /IM python.exe /F
```

---

## Additional Documentation

- **[POSE_SERVICE_README.md](backend/POSE_SERVICE_README.md)** - Pose service API details
- **[MEDIAPIPE_INTEGRATION_COMPLETE.md](MEDIAPIPE_INTEGRATION_COMPLETE.md)** - MediaPipe integration summary
- **[OCR_INTEGRATION_GUIDE.md](OCR_INTEGRATION_GUIDE.md)** - OCR integration details
- **[PATIENT_ANONYMIZATION.md](PATIENT_ANONYMIZATION.md)** - Privacy features

---

**Need help?** Check the issue trackers or review detailed documentation in the files above.

**System Status:** ✅ All services operational and tested (2025-10-17)
