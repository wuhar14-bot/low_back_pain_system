# Deployment Guide

Complete deployment and setup instructions for the Low Back Pain Data Collection System.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Starting the System](#starting-the-system)
5. [Network Setup](#network-setup)
6. [Firewall Configuration](#firewall-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Backup & Recovery](#backup--recovery)

---

## System Requirements

### Hardware

**Minimum:**
- CPU: Intel Core i5 (6th gen) or equivalent
- RAM: 8GB
- Storage: 10GB free space
- Network: WiFi adapter

**Recommended:**
- CPU: Intel Core i7 (8th gen) or equivalent
- RAM: 16GB
- Storage: 50GB SSD
- GPU: NVIDIA GPU with CUDA support (for faster OCR)
- Network: WiFi 5 (802.11ac) or better

### Software

**Required:**
- Windows 10 (build 1903+) or Windows 11
- Node.js 18.x or later
- Python 3.8 - 3.12
- Git (for version control)

**Optional:**
- NVIDIA CUDA Toolkit (for GPU-accelerated OCR)
- Visual Studio Code (for development)

---

## Installation

### 1. Install Node.js

Download and install from: https://nodejs.org/

```bash
# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### 2. Install Python

Download and install from: https://www.python.org/downloads/

**Important:** Check "Add Python to PATH" during installation

```bash
# Verify installation
python --version  # Should show Python 3.8.x - 3.12.x
pip --version     # Should show pip 23.x.x or higher
```

### 3. Clone or Download Project

```bash
# Option A: Using Git
git clone https://github.com/wuhar14-bot/low_back_pain_system.git
cd "low_back_pain_system"

# Option B: Download ZIP
# Extract to: E:\claude-code\low back pain system\
```

### 4. Install Frontend Dependencies

```bash
cd "E:\claude-code\low back pain system"
npm install
```

Expected output:
```
added 234 packages, and audited 235 packages in 15s
found 0 vulnerabilities
```

### 5. Install Python Dependencies

```bash
cd backend
pip install -r requirements_pose.txt
```

This installs:
- Flask (web server)
- Flask-CORS (cross-origin support)
- PaddleOCR (OCR engine)
- MediaPipe (pose estimation)
- OpenCV (image processing)
- Pillow (image handling)

---

## Configuration

### 1. Vite Configuration

The frontend is already configured for external network access:

**File:** `vite.config.js`
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // ✅ Allow external connections
    port: 5173,
    allowedHosts: true
  },
  ...
})
```

### 2. Backend Services

All backend services are configured to listen on `0.0.0.0` (all network interfaces):

- OCR Service: `0.0.0.0:5001`
- Pose Service: `0.0.0.0:5002`
- Database Service: `0.0.0.0:5003`

No configuration changes needed!

### 3. Database Initialization

The SQLite database is created automatically on first run:

**Location:** `backend/low_back_pain.db`

The database service will create the `patients` table automatically.

---

## Starting the System

### Method 1: One-Click Startup (Recommended)

**Double-click:**
```
start_all_services.bat
```

This opens 3 terminal windows:
1. OCR Service (port 5001)
2. Pose Service (port 5002)
3. Frontend (port 5173)

The Database Service needs to be started separately:

```bash
cd backend
python database_service.py
```

### Method 2: Manual Startup

**Terminal 1 - OCR Service:**
```bash
cd "E:\claude-code\low back pain system\backend"
python ocr_service.py
```

**Terminal 2 - Pose Service:**
```bash
cd "E:\claude-code\low back pain system\backend"
python pose_service.py
```

**Terminal 3 - Database Service:**
```bash
cd "E:\claude-code\low back pain system\backend"
python database_service.py
```

**Terminal 4 - Frontend:**
```bash
cd "E:\claude-code\low back pain system"
npm run dev
```

### Verification

Check that all services are running:

```bash
# Check ports
netstat -ano | findstr ":5001 :5002 :5003 :5173"

# Should show:
#   TCP    0.0.0.0:5001    (OCR Service)
#   TCP    0.0.0.0:5002    (Pose Service)
#   TCP    0.0.0.0:5003    (Database Service)
#   TCP    0.0.0.0:5173    (Frontend)
```

### Health Checks

```bash
# OCR Service
curl http://localhost:5001/health

# Pose Service
curl http://localhost:5002/health

# Database Service
curl http://localhost:5003/health

# Frontend
# Open browser: http://localhost:5173
```

---

## Network Setup

### For PC-Only Use

**Access URL:**
```
http://localhost:5173
```

No additional setup needed!

### For Mobile Access (PC + Phone)

#### Option A: Phone as Hotspot (Recommended)

1. **On Phone:**
   - Settings → Mobile Hotspot → Turn ON
   - Note the WiFi name and password

2. **On Computer:**
   - Connect to phone's WiFi hotspot
   - Run `ipconfig` to find computer's IP address

3. **Find Computer's IP:**
   ```bash
   ipconfig
   ```

   Look for "Wireless LAN adapter WLAN":
   ```
   IPv4 Address. . . . . . . . . . . : 172.20.10.4
   ```

4. **On Phone Browser:**
   ```
   http://172.20.10.4:5173
   ```

#### Option B: Computer as Hotspot

1. **On Computer:**
   - Settings → Network & Internet → Mobile hotspot
   - Turn ON
   - Note the network name and password

2. **On Phone:**
   - Connect to computer's WiFi hotspot

3. **Find Computer's IP:**
   ```bash
   ipconfig
   ```

   Look for the hotspot adapter IP address

4. **On Phone Browser:**
   ```
   http://[COMPUTER_IP]:5173
   ```

---

## Firewall Configuration

### Automatic Configuration

Run PowerShell as Administrator and execute:

```powershell
# Frontend
New-NetFirewallRule -DisplayName 'Low Back Pain System - Frontend' -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow

# OCR Service
New-NetFirewallRule -DisplayName 'Low Back Pain System - OCR' -Direction Inbound -LocalPort 5001 -Protocol TCP -Action Allow

# Pose Service
New-NetFirewallRule -DisplayName 'Low Back Pain System - Pose' -Direction Inbound -LocalPort 5002 -Protocol TCP -Action Allow

# Database Service
New-NetFirewallRule -DisplayName 'Low Back Pain System - Database' -Direction Inbound -LocalPort 5003 -Protocol TCP -Action Allow
```

### Verification

```powershell
# Check firewall rules
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Low Back Pain*"} | Select-Object DisplayName, Enabled, Direction, Action
```

Expected output:
```
DisplayName                              Enabled Direction Action
-----------                              ------- --------- ------
Low Back Pain System - Frontend          True    Inbound   Allow
Low Back Pain System - OCR               True    Inbound   Allow
Low Back Pain System - Pose              True    Inbound   Allow
Low Back Pain System - Database          True    Inbound   Allow
```

### Manual Configuration (if automatic fails)

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule..."
4. Select "Port" → Next
5. TCP, Specific ports: `5173` → Next
6. Allow the connection → Next
7. Check all profiles → Next
8. Name: `Low Back Pain System - Frontend` → Finish
9. Repeat for ports 5001, 5002, 5003

---

## Troubleshooting

### Frontend Won't Start

**Issue:** `Port 5173 is already in use`

**Solution:**
```bash
# Find process using port 5173
netstat -ano | findstr ":5173"

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Restart frontend
npm run dev
```

### Backend Service Crashes

**Issue:** `ModuleNotFoundError: No module named 'paddleocr'`

**Solution:**
```bash
cd backend
pip install -r requirements_pose.txt --force-reinstall
```

### Mobile Can't Access System

**Issue:** Phone shows "Connection refused" or "Couldn't connect"

**Checklist:**
- [ ] Computer and phone on same WiFi network
- [ ] Firewall rules configured (see above)
- [ ] All services running (`netstat -ano | findstr ":5173"`)
- [ ] VPN disabled on computer
- [ ] Hotspot AP Isolation disabled (check phone settings)
- [ ] Using correct IP address (`ipconfig` on computer)

### Database Not Saving Data

**Issue:** Patients disappear after refresh

**Solution:**
```bash
# Check database service is running
curl http://localhost:5003/health

# Check database file exists
dir "E:\claude-code\low back pain system\backend\low_back_pain.db"

# Check browser console for errors
# Open DevTools (F12) → Console
# Look for "[DB]" messages
```

### OCR Not Working

**Issue:** OCR returns empty results

**Solution:**
```bash
# Check OCR service is running
curl http://localhost:5001/health

# Check GPU availability (if using CUDA)
python -c "import paddle; print(paddle.device.cuda.device_count())"

# Restart OCR service
```

### Pose Estimation Fails

**Issue:** "姿势分析失败: Load failed"

**Checklist:**
- [ ] Pose service running on port 5002
- [ ] Images uploaded successfully
- [ ] Images show person in full body (not cropped)
- [ ] Images taken from side view (90° angle)
- [ ] Check browser console for actual error message

---

## Backup & Recovery

### Database Backup

**Manual Backup:**
```bash
# Copy database file
copy "E:\claude-code\low back pain system\backend\low_back_pain.db" "E:\backups\low_back_pain_2025-10-17.db"
```

**Automated Backup Script:**

Create `backup_database.bat`:
```batch
@echo off
set BACKUP_DIR=E:\backups\low_back_pain
set DB_FILE=E:\claude-code\low back pain system\backend\low_back_pain.db
set DATE=%date:~-4%%date:~3,2%%date:~0,2%

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
copy "%DB_FILE%" "%BACKUP_DIR%\low_back_pain_%DATE%.db"
echo Backup completed: %BACKUP_DIR%\low_back_pain_%DATE%.db
```

**Schedule in Task Scheduler:**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 11:59 PM
4. Action: Start a program → backup_database.bat

### Database Restore

```bash
# Stop database service first
# Then restore from backup:
copy "E:\backups\low_back_pain_20251017.db" "E:\claude-code\low back pain system\backend\low_back_pain.db"

# Restart database service
python database_service.py
```

### Export Patient Data

```bash
# Export to CSV (future feature)
curl http://localhost:5003/api/patients > patients.json

# Or use SQLite CLI
sqlite3 low_back_pain.db
.mode csv
.output patients.csv
SELECT * FROM patients;
.quit
```

---

## Production Deployment Checklist

- [ ] All dependencies installed (Node.js, Python, packages)
- [ ] Firewall rules configured for all ports
- [ ] Database backup scheduled (daily recommended)
- [ ] Network setup tested (PC and mobile access)
- [ ] All health checks passing
- [ ] Login credentials configured
- [ ] User training completed
- [ ] Emergency contact information documented
- [ ] Data privacy policy reviewed
- [ ] HIPAA compliance verified (if applicable)

---

## Performance Optimization

### OCR Service

**GPU Acceleration:**
```bash
# Install CUDA Toolkit (NVIDIA GPUs only)
# Download from: https://developer.nvidia.com/cuda-downloads

# Verify CUDA
python -c "import paddle; print('CUDA available:', paddle.device.cuda.device_count() > 0)"
```

Expected speedup: 3-5x faster OCR processing

### Database Service

**For large datasets (>1000 patients):**

Consider PostgreSQL migration:
```bash
pip install psycopg2
# Update database_service.py to use PostgreSQL instead of SQLite
```

### Frontend

**Production build:**
```bash
npm run build
# Serve dist/ folder with nginx or similar
```

---

## Security Hardening

### Network Security

1. **Disable public network access:**
   - Ensure services only bind to local network interface
   - Never expose ports to internet

2. **Use VPN for remote access:**
   - Set up WireGuard or similar for secure remote access
   - Don't open ports on router

### Application Security

1. **Enable authentication:**
   - Configure user accounts in frontend
   - Add JWT tokens to API (future enhancement)

2. **Database encryption:**
   - Use SQLCipher for encrypted database
   ```bash
   pip install pysqlcipher3
   ```

3. **HTTPS (for production):**
   - Use self-signed certificate or Let's Encrypt
   - Configure Vite to serve over HTTPS

---

**Last Updated:** 2025-10-17
**Version:** 1.0.0
**Deployment Status:** Production Ready
