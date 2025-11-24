# Mobile Phone Testing Guide
**Low Back Pain System - Pose Estimation via Phone Camera**

## Quick Start (5 Minutes)

### 1. Start Services on Computer
```bash
# Navigate to project directory
cd "E:\claude-code\low back pain system"

# Double-click to start all services
start_all_services.bat
```

Wait for confirmation that all 3 services are running:
- ✅ OCR Service (port 5001)
- ✅ Pose Service (port 5002)
- ✅ Frontend (port 5173)

### 2. Setup Network Connection

**Option A: Phone as Hotspot (Recommended)**
1. On phone: Settings → Mobile Hotspot → Turn ON
2. On computer: Connect to phone's WiFi hotspot
3. Note computer's new IP address

**Option B: Computer as Hotspot**
1. On computer: Settings → Network & Internet → Mobile hotspot → Turn ON
2. On phone: Connect to computer's WiFi
3. Note computer's IP address

### 3. Find Computer's IP Address

On computer terminal:
```bash
ipconfig
```

Look for `IPv4 Address` under **Wireless LAN adapter WLAN**:
```
Wireless LAN adapter WLAN:
   IPv4 Address. . . . . . . . . . . : 172.20.10.4
```

**Your IP:** `172.20.10.4` (example - yours will be different)

### 4. Access System from Phone

On phone browser (Chrome recommended):
```
http://172.20.10.4:5173
```

Replace `172.20.10.4` with YOUR computer's IP address.

### 5. Test Camera Functionality

1. Click "新增患者" (Add Patient)
2. Fill basic patient info (name, age, gender)
3. Navigate to "Objective Examination" tab
4. Click "姿态分析 (AI Pose Estimation)" button
5. Click on camera upload area
6. **Phone camera opens automatically**
7. Take photo of patient (standing position)
8. Repeat for flexion position
9. Click "开始姿态分析"
10. Wait <2 seconds for MediaPipe analysis

## Expected Results

✅ **Camera opens:** Phone's rear camera activates automatically
✅ **Upload works:** Photos visible in preview
✅ **Analysis fast:** <2 seconds processing time
✅ **Skeleton drawn:** 33 landmarks visualized on images
✅ **Results shown:** ROM, trunk angles, compensations, recommendations

## Common Issues

### Issue 1: Cannot access http://[IP]:5173

**Cause:** Computer and phone not on same network

**Solutions:**
- Verify both devices connected to same WiFi
- Check computer IP hasn't changed (run `ipconfig` again)
- Ensure all services running (`start_all_services.bat`)
- Temporarily disable VPN on computer (NordVPN, etc.)
- Check firewall rules (should be auto-configured)

**Verify firewall:**
```bash
netsh advfirewall firewall show rule name="Low Back Pain System - Frontend"
netsh advfirewall firewall show rule name="Low Back Pain System - Pose Service"
```

### Issue 2: Camera doesn't open

**Cause:** Browser security restrictions

**Solutions:**
- Grant camera permissions when prompted
- Use Chrome browser (best HTML5 support)
- Some browsers require HTTPS for camera (limitation)

### Issue 3: Slow analysis (>5 seconds)

**Cause:** Network or computer performance

**Solutions:**
- Check WiFi signal strength (phone should be close to computer)
- MediaPipe runs on computer (not phone) - ensure computer isn't overloaded
- Close unnecessary applications on computer
- Expected time: <2 seconds

### Issue 4: "Connection Refused" error

**Cause:** Services not running or firewall blocking

**Solutions:**
1. Verify all services running:
   ```bash
   # Check if ports are listening
   netstat -ano | findstr ":5173 :5002 :5001"
   ```

2. Restart services:
   ```bash
   # Close all terminal windows
   # Re-run start_all_services.bat
   ```

3. Verify firewall rules:
   ```bash
   # List all firewall rules for our ports
   netsh advfirewall firewall show rule name=all | findstr "5173 5002 5001"
   ```

## Technical Details

### Network Architecture
```
┌─────────────────────┐
│   Mobile Phone      │
│   172.20.10.X       │ ◄── Camera captures patient photos
└──────────┬──────────┘
           │ WiFi Hotspot
           │ HTTP requests
           ▼
┌─────────────────────┐
│   Computer          │
│   172.20.10.4       │
├─────────────────────┤
│ Port 5173: Frontend │ ◄── React UI (Vite dev server)
│ Port 5002: Pose AI  │ ◄── MediaPipe processing
│ Port 5001: OCR      │ ◄── PaddleOCR (optional)
└─────────────────────┘
           │
           ▼
     MediaPipe Analysis
     (33 landmarks)
     (<2 seconds)
```

### Modified Files
1. **vite.config.js**
   - `host: '0.0.0.0'` - Allow external connections
   - `port: 5173` - Explicit port binding

2. **PostureAnalysisModal.jsx**
   - `capture="environment"` - HTML5 camera API
   - Responsive CSS with `sm:` breakpoints
   - Mobile-optimized text and spacing

3. **Windows Firewall**
   - Rule: "Low Back Pain System - Frontend" (5173)
   - Rule: "Low Back Pain System - Pose Service" (5002)
   - Direction: Inbound, Protocol: TCP, Action: Allow

### Security Notes
- ✅ **Local network only** - System not accessible from internet
- ✅ **No cloud upload** - All data stays on local network
- ✅ **Medical privacy** - Patient data never leaves local environment
- ✅ **Firewall protected** - Only specific ports allowed

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] All 3 services running (OCR, Pose, Frontend)
- [ ] Computer and phone on same network
- [ ] Computer IP address correct (run `ipconfig`)
- [ ] Firewall rules configured
- [ ] Phone browser is Chrome (recommended)
- [ ] Camera permissions granted on phone
- [ ] VPN disabled on computer
- [ ] Phone hotspot AP Isolation is OFF

## Performance Benchmarks

| Metric | Expected | Notes |
|:---|---:|:---|
| Camera open time | <1s | Instant on modern phones |
| Photo upload | <2s | Depends on WiFi speed |
| Pose analysis | <2s | MediaPipe on computer |
| Total workflow | <10s | From camera → results |

## Next Steps After Testing

1. **If successful:**
   - Document any issues encountered
   - Test with real patient photos
   - Consider adding image compression for faster uploads

2. **If issues:**
   - Check this troubleshooting guide
   - Verify network configuration
   - Check system logs in terminal windows
   - Report specific error messages

3. **Future improvements:**
   - PWA offline mode (Service Worker)
   - Batch photo mode (multiple patients)
   - Image compression before upload
   - Dark mode for mobile UI

---

**Last Updated:** 2025-10-17
**Status:** ✅ Ready for testing
**GitHub:** https://github.com/wuhar14-bot/low_back_pain_system
