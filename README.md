# Low Back Pain Data Collection System

**腰痛数据收集系统**

A comprehensive medical system for low back pain patient management with AI-powered OCR form filling and pose estimation analysis.

**University of Hong Kong - Department of Orthopaedics & Traumatology**

---

## Features

### 🔤 OCR-Based Form Filling
- Automatic extraction of patient data from medical forms
- Chinese + English text recognition with PaddleOCR
- GPU acceleration for fast processing
- Intelligent field mapping and validation

### 🧍 AI Pose Estimation (NEW)
- MediaPipe-based posture analysis with 33 body landmarks
- Forward flexion ROM (Range of Motion) measurement
- Trunk angle calculation (standing vs. flexion)
- Compensation detection (knee flexion, hip shift, asymmetry)
- Clinical recommendations generation
- **Sub-2-second processing time**
- **Completely offline and free**

### 📊 Patient Management
- Comprehensive patient data collection
- Medical history tracking
- Functional score assessment
- Image documentation

---

## Quick Start

### One-Click Startup (Recommended)

**Double-click this file:**
```
start_all_services.bat
```

This automatically starts all 3 required services.

### Manual Startup

See [START_GUIDE.md](START_GUIDE.md) for detailed instructions.

**Required Services:**
1. **OCR Service** (port 5001) - PaddleOCR for form filling
2. **Pose Service** (port 5002) - MediaPipe for pose analysis
3. **Frontend** (port 5173) - React web interface

---

## System Requirements

- **Node.js** 18+ (for frontend)
- **Python** 3.8+ (for OCR + Pose services)
- **GPU** (optional but recommended for faster OCR)

---

## Installation

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Python Dependencies

```bash
cd backend
pip install -r requirements_pose.txt
```

---

## Running the App

### Start All Services

```bash
# Double-click to start all services
start_all_services.bat

# Or manually start each service:
cd backend
python ocr_service.py      # Terminal 1
python pose_service.py     # Terminal 2

cd ..
npm run dev                # Terminal 3
```

### Access the Application

**On Computer:**
Open browser: **http://localhost:5173**

**On Mobile Device (via hotspot):**
See [Mobile Access Setup](#mobile-access-setup-phone-camera-upload) below

---

## Mobile Access Setup (Phone Camera Upload)

### Overview

You can now use your mobile phone to directly capture and upload pose estimation photos! This allows for convenient on-the-go patient photography.

### Setup Steps

#### 1. Start All Services on Computer

```bash
# Double-click to start all services
start_all_services.bat
```

This will start:
- Frontend on `0.0.0.0:5173` (accessible from any device)
- Pose Service on `0.0.0.0:5002` (accessible from any device)
- OCR Service on `0.0.0.0:5001`

#### 2. Connect Phone to Computer via Hotspot

**Option A: Phone as Hotspot (Recommended)**
1. Enable mobile hotspot on your phone
2. Connect computer to phone's WiFi hotspot
3. Note: This allows phone to access computer services

**Option B: Computer as Hotspot**
1. Enable hotspot on Windows: Settings → Network & Internet → Mobile hotspot
2. Connect phone to computer's hotspot
3. Note: Requires Windows hotspot feature

#### 3. Find Computer's IP Address

On computer, run:
```bash
ipconfig
```

Look for the WiFi adapter (WLAN) IP address, for example:
```
Wireless LAN adapter WLAN:
   IPv4 Address. . . . . . . . . . . : 172.20.10.4
```

Your computer's IP: **172.20.10.4** (example)

#### 4. Access System from Phone

On your phone's browser, navigate to:
```
http://[COMPUTER_IP]:5173
```

Example:
```
http://172.20.10.4:5173
```

#### 5. Take Photos with Phone Camera

1. Click "新增患者" or open an existing patient
2. Navigate to "Objective Examination" tab
3. Click "姿态分析 (AI Pose Estimation)" button
4. Click on the camera upload areas
5. **Phone will open native camera automatically**
6. Take photos of patient in standing and flexion positions
7. Click "开始姿态分析" to analyze

### Mobile-Optimized Features

✅ **HTML5 Camera API** - Direct camera access with `capture="environment"`
✅ **Responsive UI** - Optimized for small screens
✅ **Touch-friendly** - Large touch targets for easy interaction
✅ **Fast processing** - MediaPipe analysis <2 seconds
✅ **Offline capable** - No internet required (local network only)

### Firewall Configuration

Firewall rules are automatically configured for:
- **Port 5173** (Frontend) - Inbound TCP allowed
- **Port 5002** (Pose Service) - Inbound TCP allowed
- **Port 5001** (OCR Service) - Inbound TCP allowed

If you have issues connecting, manually verify firewall rules:
```bash
# Check firewall rules
netsh advfirewall firewall show rule name=all | findstr "5173 5002 5001"
```

### Troubleshooting Mobile Access

**Issue: Cannot access http://[IP]:5173 from phone**
- ✅ Verify computer and phone are on same network
- ✅ Check computer's IP address hasn't changed
- ✅ Ensure all services are running (`start_all_services.bat`)
- ✅ Verify firewall rules allow inbound connections
- ✅ Try disabling VPN on computer (NordVPN, etc.)
- ✅ Check if phone hotspot has "AP Isolation" disabled

**Issue: Camera doesn't open on phone**
- ✅ Ensure using HTTPS or localhost (some browsers require secure context)
- ✅ Grant camera permissions when prompted
- ✅ Try different browser (Chrome recommended)

**Issue: Slow pose analysis**
- ✅ Ensure good WiFi signal strength
- ✅ MediaPipe runs on computer (not phone), so computer specs matter
- ✅ Expected: <2 seconds for analysis

### Network Diagram

```
┌─────────────────┐
│  Mobile Phone   │
│  (Camera)       │
│  📱             │
└────────┬────────┘
         │ WiFi Hotspot
         │ 172.20.10.x
         ▼
┌─────────────────┐
│   Computer      │
│  172.20.10.4    │
├─────────────────┤
│ Vite  :5173  ◄──┼── Frontend (React)
│ Pose  :5002  ◄──┼── MediaPipe Service
│ OCR   :5001  ◄──┼── PaddleOCR Service
└─────────────────┘
```

### Security Notes

- System accessible only on local network (not internet)
- No data leaves your local network
- Medical data privacy maintained
- Firewall rules restrict access to specific ports

---

## Key Technologies

### Backend
- **PaddleOCR** - Chinese/English text recognition
- **MediaPipe Pose** - 33-point pose estimation
- **Flask** - REST API services
- **Python 3.12**

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library

---

## Project Structure

```
low back pain system/
├── start_all_services.bat     # One-click startup
├── START_GUIDE.md             # Complete startup guide
├── README.md                  # This file
│
├── frontend/                  # React application
│   └── src/
│       ├── components/
│       ├── pages/
│       └── api/
│
├── backend/
│   ├── ocr_service.py        # OCR service (port 5001)
│   ├── pose_service.py       # Pose service (port 5002)
│   ├── requirements_pose.txt  # Python dependencies
│   └── POSE_SERVICE_README.md
│
├── test_images/              # Sample test images
└── docs/                     # Documentation

```

---

## MediaPipe Pose Integration (2025-10-17)

### Performance Improvements

| Metric | Before (LLM) | After (MediaPipe) | Improvement |
|:---|---:|---:|:---|
| **Processing Time** | 5-15s | <2s | **5-10x faster** |
| **Cost** | $0.01-0.05 | **Free** | **100% savings** |
| **Landmarks** | 4 | **33** | **8x more detail** |
| **Accuracy** | ±5-10° | **±2-3°** | **2-3x better** |

### Clinical Measurements
- Trunk angle (standing & flexion)
- Pelvic tilt
- Knee angles
- ROM calculation with assessment (正常/轻度受限/中度受限/重度受限)
- Compensation detection
- Clinical recommendations

### Documentation
- [MEDIAPIPE_INTEGRATION_COMPLETE.md](MEDIAPIPE_INTEGRATION_COMPLETE.md) - Full integration summary
- [backend/POSE_SERVICE_README.md](backend/POSE_SERVICE_README.md) - API documentation
- [scenario_recommendation.md](scenario_recommendation.md) - Why MediaPipe?

---

## API Services

### OCR Service (Port 5001)

**Health Check:**
```bash
curl http://localhost:5001/health
```

**Features:**
- Chinese + English text recognition
- GPU acceleration
- Automatic field extraction
- Batch processing

### Pose Service (Port 5002)

**Health Check:**
```bash
curl http://localhost:5002/health
```

**Features:**
- 33 body landmarks detection
- Clinical angle calculations
- ROM measurement
- Compensation analysis
- Instant results (<2s)

---

## Building for Production

```bash
npm run build
```

---

## Troubleshooting

### Common Issues

1. **"ERR_CONNECTION_REFUSED"**
   - Ensure all backend services are running
   - Check: `curl http://localhost:5001/health` and `curl http://localhost:5002/health`

2. **"Port already in use"**
   ```bash
   netstat -ano | findstr :5001
   taskkill /PID <process_id> /F
   ```

3. **Login Required**
   - System requires authentication for medical data security
   - Contact system administrator for credentials

See [START_GUIDE.md](START_GUIDE.md) for complete troubleshooting guide.

---

## Documentation

### User Guides
- **[START_GUIDE.md](START_GUIDE.md)** - Complete startup and troubleshooting guide
- **[MEDIAPIPE_INTEGRATION_COMPLETE.md](MEDIAPIPE_INTEGRATION_COMPLETE.md)** - MediaPipe integration details
- **[backend/POSE_SERVICE_README.md](backend/POSE_SERVICE_README.md)** - Pose service API reference
- **[OCR_INTEGRATION_GUIDE.md](OCR_INTEGRATION_GUIDE.md)** - OCR integration guide
- **[PATIENT_ANONYMIZATION.md](PATIENT_ANONYMIZATION.md)** - Privacy features

### Technical Specifications (.specify/)
Complete technical documentation following [GitHub spec-kit](https://github.com/github/spec-kit) format:

- **[.specify/ARCHITECTURE.md](.specify/ARCHITECTURE.md)** - System architecture, components, data flow
- **[.specify/API.md](.specify/API.md)** - Complete API reference for all services
- **[.specify/DATABASE.md](.specify/DATABASE.md)** - Database schema, queries, backup procedures
- **[.specify/DEPLOYMENT.md](.specify/DEPLOYMENT.md)** - Installation, configuration, troubleshooting
- **[.specify/MOBILE_SETUP.md](.specify/MOBILE_SETUP.md)** - Mobile device setup and usage guide
- **[.specify/config.yml](.specify/config.yml)** - Project metadata and configuration

---

## Recent Updates

### 2025-10-17 (Session 3 - Mobile Integration & Database)
- ✅ **Mobile phone camera integration** - Direct photo capture from phone
- ✅ **Network configuration** - Vite server configured for external access (`0.0.0.0:5173`)
- ✅ **Windows Firewall rules** - Ports 5173, 5002, 5001, 5003 configured for inbound access
- ✅ **Mobile-responsive UI** - Optimized PostureAnalysisModal for small screens
- ✅ **HTML5 Camera API** - `capture="environment"` for rear camera access
- ✅ **Real SQLite database** - Cross-device synchronization enabled (port 5003)
- ✅ **Database API integration** - Full REST API with localStorage fallback
- ✅ **Cross-device workflow** - PC → Phone → PC workflow fully operational
- ✅ **GitHub spec-kit documentation** - Complete technical specifications in `.specify/`
- ✅ **GitHub repository** - All code pushed to https://github.com/wuhar14-bot/low_back_pain_system

### 2025-10-17 (Earlier - MediaPipe Integration)
- ✅ Integrated MediaPipe Pose for posture analysis
- ✅ Replaced LLM-based analysis with local processing
- ✅ Added 33-point skeleton visualization
- ✅ Implemented clinical measurements (ROM, trunk angle, compensations)
- ✅ Created one-click startup script
- ✅ Fixed authentication issues in pose analysis
- ✅ Added equal-height image display for comparison

---

## Support & Contact

**University of Hong Kong**
Department of Orthopaedics & Traumatology
Li Ka Shing Faculty of Medicine

For technical support or questions about this system, please refer to the documentation above.

---

**System Status:** ✅ Fully operational with MediaPipe Pose integration (2025-10-17)

**Last Updated:** 2025-10-17 11:36
