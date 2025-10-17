# Mobile Setup Guide

Complete guide for setting up and using the Low Back Pain system on mobile devices.

---

## Table of Contents

1. [Overview](#overview)
2. [Network Setup](#network-setup)
3. [Mobile Access](#mobile-access)
4. [Camera Usage](#camera-usage)
5. [Cross-Device Workflow](#cross-device-workflow)
6. [Troubleshooting](#troubleshooting)
7. [Browser Compatibility](#browser-compatibility)
8. [Tips & Best Practices](#tips--best-practices)

---

## Overview

### Why Mobile Access?

The Low Back Pain system supports mobile devices for:

✅ **Direct Camera Access** - Capture pose estimation photos with phone camera
✅ **Bedside Data Entry** - Enter patient data during clinical examination
✅ **Cross-Device Workflow** - Start on PC, continue on phone, finish on PC
✅ **Real-time Sync** - Changes sync between devices in 3 seconds
✅ **Portable** - No need to transfer photos via USB or email

### System Requirements

**Mobile Device:**
- iOS 14+ (iPhone) or Android 9+ (Phone)
- Modern browser (Chrome, Safari, Edge)
- WiFi capability
- Rear camera (for pose estimation)

**Computer:**
- Windows 10/11 (tested)
- WiFi adapter
- All services running (see [DEPLOYMENT.md](DEPLOYMENT.md))

---

## Network Setup

### Method 1: Phone as Hotspot (Recommended)

**Best for:** Field work, mobile clinics, locations without WiFi

**Steps:**

#### 1. Enable Phone Hotspot

**iOS (iPhone):**
1. Settings → Personal Hotspot
2. Toggle "Allow Others to Join" → ON
3. Note WiFi password

**Android:**
1. Settings → Network & Internet → Hotspot & Tethering
2. WiFi Hotspot → Turn ON
3. Note WiFi password

#### 2. Connect Computer to Phone Hotspot

**On Computer:**
1. Click WiFi icon in taskbar
2. Select your phone's hotspot name
3. Enter password
4. Wait for connection confirmation

#### 3. Find Computer's IP Address

**On Computer (Windows):**
```bash
ipconfig
```

Look for **"Wireless LAN adapter WLAN"** section:
```
Wireless LAN adapter WLAN:
   IPv4 Address. . . . . . . . . . . : 172.20.10.4
```

**Common IP ranges:**
- iPhone hotspot: `172.20.10.x`
- Android hotspot: `192.168.43.x` or `192.168.137.x`

#### 4. Access System from Phone

**On Phone Browser:**
```
http://172.20.10.4:5173
```

Replace `172.20.10.4` with your computer's actual IP address.

**Expected Result:**
- Low Back Pain system login page appears
- Login with credentials
- Full system functionality available

---

### Method 2: Computer as Hotspot

**Best for:** Locations with limited mobile data, office environments

**Steps:**

#### 1. Enable Computer Hotspot

**Windows 10/11:**
1. Settings → Network & Internet → Mobile hotspot
2. Share my Internet connection from: **WiFi** or **Ethernet**
3. Share over: **WiFi**
4. Toggle Mobile hotspot → **ON**
5. Note Network name and Password

#### 2. Connect Phone to Computer Hotspot

**On Phone:**
1. Settings → WiFi
2. Select computer's hotspot name
3. Enter password
4. Connect

#### 3. Find Computer's IP Address

**On Computer:**
```bash
ipconfig
```

Look for the adapter with the hotspot connection.

**Typical IP:** `192.168.137.1` (Windows default)

#### 4. Access System from Phone

**On Phone Browser:**
```
http://192.168.137.1:5173
```

---

### Method 3: Shared WiFi Network

**Best for:** Office/clinic with existing WiFi

**Steps:**

#### 1. Connect Both Devices to Same WiFi

**On Computer and Phone:**
- Connect to same WiFi network
- Ensure no VPN is active

#### 2. Find Computer's IP Address

```bash
ipconfig
```

Look for the WiFi adapter IP address.

#### 3. Access System from Phone

```
http://[COMPUTER_IP]:5173
```

⚠️ **Note:** Some enterprise WiFi networks use **AP Isolation** which blocks device-to-device communication. If this doesn't work, use Method 1 or 2 instead.

---

## Mobile Access

### Accessing the System

#### 1. Open Browser on Phone

**Recommended browsers:**
- **iOS:** Safari (pre-installed)
- **Android:** Chrome (pre-installed)

**Not recommended:**
- WeChat browser (limited HTML5 support)
- Third-party browsers (may have compatibility issues)

#### 2. Enter URL

```
http://172.20.10.4:5173
```

**Bookmark for easy access:**
- Tap Share button → Add to Home Screen
- Creates app-like icon on home screen

#### 3. Login

- Enter username and password
- System remembers login on mobile

#### 4. Navigate System

All features available:
- 数据录入 (Data Entry) - Full patient form
- 数据管理 (Data Management) - View/edit patients
- 数据看板 (Dashboard) - Statistics

---

## Camera Usage

### Taking Pose Estimation Photos

#### 1. Navigate to Patient Form

**On Mobile:**
1. 数据录入 (Data Entry)
2. Scroll to **Step 5: 姿势分析**
3. Tap **开始姿势分析** button

#### 2. Upload Standing Photo

**Two options appear:**
- 📷 **拍照** (Take Photo) - Opens camera
- 🖼️ **相册** (Gallery) - Choose existing photo

**For best results, use "拍照" (Take Photo):**
1. Tap "拍照"
2. Camera opens automatically
3. Position patient:
   - **Side view** (90° angle to camera)
   - **Full body** visible (head to feet)
   - **Standing upright** naturally
   - **Good lighting**
4. Take photo
5. Tap "Use Photo" to confirm

#### 3. Upload Flexion Photo

**Repeat for flexion pose:**
1. Tap "选择前屈照片" button
2. Position patient:
   - **Same side view** (90° angle)
   - **Bending forward** (trunk flexion)
   - **Full body** visible
   - **Natural movement** (no forced bending)
3. Take photo
4. Confirm

#### 4. Analyze Pose

1. Both photos uploaded successfully
2. Tap **分析姿势** button
3. Wait 2-3 seconds for analysis
4. Results appear with:
   - ROM (Range of Motion) measurement
   - Trunk angles
   - Compensations detected
   - Clinical recommendations
   - Annotated skeleton overlay

#### 5. Save Results

1. Review analysis results
2. Tap **保存分析结果** button
3. Data saved to database
4. Automatically syncs to PC

---

## Cross-Device Workflow

### Complete PC → Phone → PC Workflow

This is the **primary use case** for mobile integration:

#### Step 1-4: Basic Information (PC)

**On PC:**
1. Open patient form
2. Fill in patient demographics:
   - 病案号 (Study ID)
   - 姓名 (Name)
   - 性别 (Gender)
   - 年龄 (Age)
   - 联系电话 (Phone)
3. Fill in clinical history:
   - 发病日期 (Onset Date)
   - 主诉 (Chief Complaint)
   - 病史 (Medical History)
   - 疼痛区域 (Pain Areas)
4. Tap **保存草稿** (Save Draft)

**Result:** Patient created in database

---

#### Step 5: Pose Estimation (Phone)

**On Phone:**
1. Open system: `http://172.20.10.4:5173`
2. Navigate to 数据管理 (Data Management)
3. Wait 3 seconds - newly created patient appears!
4. Tap patient card to open
5. Scroll to **Step 5: 姿势分析**
6. Take standing photo with camera
7. Take flexion photo with camera
8. Tap **分析姿势** button
9. Review results
10. Tap **保存分析结果**

**Result:** Patient updated with pose analysis

---

#### Step 6-7: Clinical Findings (PC)

**On PC:**
1. Wait 3 seconds - patient updates with photos!
2. Review pose analysis results
3. Fill in remaining fields:
   - 主观检查 (Subjective Exam)
   - 客观检查 (Objective Exam)
   - 功能评分 (Functional Scores)
   - 干预措施 (Intervention)
4. Add 备注 (Remarks) if needed
5. Tap **提交** button

**Result:** Patient fully completed

---

### Synchronization Details

**How sync works:**
- Every 3 seconds, each device polls the database
- New/updated patients appear automatically
- No manual refresh needed
- Visual indicators show sync status

**Sync indicators:**
- ✅ Green badge: Recently updated
- 🔄 Loading spinner: Syncing
- ⚠️ Warning icon: Sync failed (check connection)

---

## Troubleshooting

### Issue 1: Can't Access System from Phone

**Symptoms:**
- Browser shows "Cannot connect" or "Connection refused"
- Page doesn't load

**Checklist:**

- [ ] **Computer and phone on same network?**
  - Check WiFi names match
  - Check IP address is correct

- [ ] **All services running on computer?**
  ```bash
  netstat -ano | findstr ":5173 :5001 :5002 :5003"
  ```
  Should show all 4 ports

- [ ] **Firewall rules configured?**
  ```powershell
  Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Low Back Pain*"}
  ```
  Should show 4 rules

- [ ] **VPN disabled on computer?**
  - Disable VPN and try again

- [ ] **Correct IP address?**
  - Run `ipconfig` again to verify

---

### Issue 2: Camera Not Opening

**Symptoms:**
- Tapping "拍照" does nothing
- Browser asks for permissions

**Solutions:**

**iOS Safari:**
1. Settings → Safari → Camera
2. Select "Ask" or "Allow"
3. Refresh page and try again

**Android Chrome:**
1. Open system URL
2. Tap lock icon in address bar
3. Camera → Allow
4. Refresh and try again

**If still not working:**
- Use "相册" (Gallery) option instead
- Take photos with default camera app
- Upload from gallery

---

### Issue 3: Pose Analysis Fails

**Symptoms:**
- Error: "姿势分析失败: Load failed"
- Analysis hangs

**Common causes:**

1. **Photos too large:**
   - Solution: Use phone's camera app, not gallery
   - System auto-resizes camera photos

2. **Person not fully visible:**
   - Solution: Retake photo showing full body (head to feet)

3. **Wrong angle:**
   - Solution: Take photos from side view (90° angle)

4. **Poor lighting:**
   - Solution: Use well-lit area

5. **Pose service not running:**
   ```bash
   curl http://localhost:5002/health
   ```
   Should return `{"status": "healthy"}`

---

### Issue 4: Photos Not Syncing to PC

**Symptoms:**
- Phone shows photos uploaded
- PC doesn't show photos

**Solutions:**

1. **Wait 3 seconds** - Automatic sync delay
2. **Check database service:**
   ```bash
   curl http://localhost:5003/health
   ```
3. **Check browser console** (PC):
   - Press F12 → Console tab
   - Look for errors with `[DB]` prefix
4. **Refresh patient list** on PC
5. **Check last_sync_timestamp** matches between devices

---

### Issue 5: System Slow on Mobile

**Symptoms:**
- Pages load slowly
- Lag when typing

**Solutions:**

1. **Check WiFi signal strength**
   - Move closer to computer/router
   - Reduce obstacles between devices

2. **Close other apps** on phone
   - Free up memory
   - Close unused browser tabs

3. **Clear browser cache:**
   - iOS Safari: Settings → Safari → Clear History and Website Data
   - Android Chrome: Settings → Privacy → Clear browsing data

4. **Restart services** on computer
   - Stop all services
   - Wait 5 seconds
   - Start again

---

## Browser Compatibility

### Tested Browsers

| Browser | Platform | Status | Notes |
|:---|:---|:---|:---|
| Safari | iOS 14+ | ✅ Fully Supported | Best for iPhone |
| Chrome | Android 9+ | ✅ Fully Supported | Best for Android |
| Chrome | iOS 14+ | ✅ Supported | Same as Safari on iOS |
| Edge | Android 9+ | ✅ Supported | Chrome-based |
| Firefox | iOS/Android | ⚠️ Mostly works | Some CSS issues |
| WeChat Browser | iOS/Android | ❌ Not recommended | Limited HTML5 support |

### Feature Support

| Feature | iOS Safari | Android Chrome | Notes |
|:---|:---:|:---:|:---|
| Camera API | ✅ | ✅ | `capture="environment"` supported |
| File Upload | ✅ | ✅ | Gallery selection works |
| Database API | ✅ | ✅ | Fetch API supported |
| Responsive CSS | ✅ | ✅ | TailwindCSS breakpoints work |
| localStorage | ✅ | ✅ | Offline fallback works |

---

## Tips & Best Practices

### Photography Tips

**For best pose estimation accuracy:**

1. **Lighting:**
   - Use natural light or bright indoor lighting
   - Avoid backlit photos (window behind patient)
   - Ensure even lighting on body

2. **Camera Position:**
   - Hold phone at patient's hip height
   - Maintain 2-3 meters distance
   - Keep camera level (not tilted)

3. **Patient Position:**
   - Side view (90° angle to camera)
   - Full body visible (head to feet)
   - Clear background (no clutter)
   - Tight-fitting clothes (easier landmark detection)

4. **Consistency:**
   - Same side for both photos (left or right)
   - Same distance from camera
   - Same lighting conditions

**Bad Photos:**
- ❌ Patient partially cropped
- ❌ Front or back view (not side)
- ❌ Too close or too far
- ❌ Baggy clothes hiding body shape
- ❌ Cluttered background

**Good Photos:**
- ✅ Clear side profile
- ✅ Full body in frame
- ✅ Good lighting
- ✅ Simple background
- ✅ Natural stance

---

### Workflow Tips

**Optimize PC → Phone → PC workflow:**

1. **Prepare patient info on PC first:**
   - Fill demographics and history while interviewing
   - Save draft before going to examination area

2. **Use phone only for photos:**
   - Don't try to type long notes on phone
   - Just capture photos and analysis
   - Return to PC for detailed notes

3. **Position computer near examination area:**
   - Reduces walking between devices
   - Enables quick PC → Phone → PC transitions

4. **Keep phone charged:**
   - Camera uses significant battery
   - Have charging cable nearby

5. **Bookmark system URL on phone:**
   - Add to home screen for quick access
   - Saves typing IP address each time

---

### Network Tips

**For stable connection:**

1. **Phone hotspot method (best):**
   - Most reliable connection
   - No dependency on clinic WiFi
   - Works anywhere

2. **Keep devices close:**
   - Within 5-10 meters for best signal
   - Reduces latency

3. **Disable mobile data on phone:**
   - Prevents accidental switching between WiFi/mobile
   - Ensures phone uses hotspot connection

4. **Monitor battery on phone:**
   - Hotspot drains battery quickly
   - Keep phone plugged in if possible

---

### Data Management Tips

**For smooth cross-device work:**

1. **Save drafts frequently:**
   - Don't lose work if connection drops
   - Automatic sync requires saved data

2. **Wait 3 seconds after changes:**
   - Give sync time to complete
   - Look for visual sync indicators

3. **Check sync status before switching devices:**
   - Ensure changes saved to database
   - Look for timestamp updates

4. **Use localStorage fallback if database fails:**
   - System still works offline
   - Data saved locally on each device
   - Sync when connection restored

---

### Security Tips

**Protect patient data:**

1. **Use private hotspot:**
   - Don't use public WiFi
   - Keep hotspot password secure

2. **Log out when done:**
   - Prevent unauthorized access
   - Especially on shared devices

3. **Lock phone screen:**
   - Use PIN/biometric lock
   - Prevent unauthorized camera use

4. **Don't expose ports to internet:**
   - Only local network access
   - Never open router ports

---

## Quick Reference Card

**Print this for quick access:**

```
╔══════════════════════════════════════════════════════════╗
║       Low Back Pain System - Mobile Quick Guide         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ 📱 ACCESS SYSTEM:                                        ║
║    http://172.20.10.4:5173                               ║
║    (replace IP with your computer's IP)                  ║
║                                                          ║
║ 📷 TAKE PHOTOS:                                          ║
║    • Side view (90° angle)                               ║
║    • Full body visible                                   ║
║    • Good lighting                                       ║
║    • 2-3 meters distance                                 ║
║                                                          ║
║ 🔄 WORKFLOW:                                             ║
║    1. Fill demographics on PC (Step 1-4)                 ║
║    2. Take photos on Phone (Step 5)                      ║
║    3. Complete notes on PC (Step 6-7)                    ║
║                                                          ║
║ 🔍 FIND COMPUTER IP:                                     ║
║    Windows: ipconfig                                     ║
║    Look for: IPv4 Address                                ║
║                                                          ║
║ 🆘 TROUBLESHOOTING:                                      ║
║    • Can't connect? Check WiFi and firewall              ║
║    • Camera won't open? Check browser permissions        ║
║    • Slow? Move closer to computer                       ║
║    • Not syncing? Wait 3 seconds, check database         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

**Last Updated:** 2025-10-17
**Version:** 1.0.0
**Mobile Support:** iOS 14+, Android 9+
