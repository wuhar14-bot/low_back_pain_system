# Pose Estimation Scenario Recommendations

**Date:** 2025-10-17
**Selected Solution:** MediaPipe Pose

---

## Decision Summary

After evaluating various pose estimation models (MoveNet, OpenPose, YOLOv8, MediaPipe Pose), we selected **MediaPipe Pose** as the primary solution for the low back pain assessment system.

---

## Three Scenarios & Recommendations

### Scenario 1: Two Static Photos

**Use Case:** Patient uploads front and side view photos for posture assessment

**Recommended:** MediaPipe Pose (Static Image Mode)

**Rationale:**
- 33 body landmarks including detailed spine tracking
- High accuracy for static images (min_detection_confidence=0.5)
- Perfect for clinical measurements (angles, distances, symmetry)
- Easy integration with existing Python backend

**Implementation:**
```python
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)
```

---

### Scenario 2: Video Analysis (Offline)

**Use Case:** Analyze patient movement videos for gait, range of motion, functional assessment

**Recommended:** MediaPipe Pose (Video Mode)

**Rationale:**
- Consistent tracking across frames
- Can analyze movement patterns over time
- Suitable for pre/post treatment comparisons
- Same library = consistent landmark definitions

**Implementation:**
```python
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
# Process video frame by frame
```

---

### Scenario 3: Real-Time Measurement

**Use Case:** Live feedback during physical therapy, exercise guidance, posture correction

**Recommended:** MediaPipe Pose (Real-Time Mode)

**Rationale:**
- 30+ FPS on standard hardware
- Low latency for immediate feedback
- Mobile-optimized (can work on tablets/phones)
- Same API as static/video modes

**Implementation:**
```python
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
cap = cv2.VideoCapture(0)  # Webcam
```

---

## Why MediaPipe Pose Over Alternatives

| Model | Pros | Cons | Decision |
|:---|:---|:---|:---|
| **MediaPipe Pose** | 33 landmarks, all scenarios, free, active support | - | ✅ **SELECTED** |
| MoveNet | Very fast, real-time optimized | Only 17 keypoints, less spine detail | ❌ Not detailed enough |
| OpenPose | Very detailed (25 keypoints) | Slower, harder setup, resource-heavy | ❌ Overkill for our needs |
| YOLOv8-Pose | Fast, versatile | Only 17 keypoints (COCO format) | ❌ Less spine detail |
| HigherHRNet | State-of-the-art accuracy | Complex setup, slow inference | ❌ Unnecessary complexity |

---

## Clinical Benefits for Low Back Pain System

### Objective Measurements
- **Lumbar spine angle:** Measure lordotic curvature
- **Pelvic tilt:** Assess anterior/posterior tilt
- **Shoulder symmetry:** Detect compensatory patterns
- **Hip alignment:** Check for leg length discrepancy indicators

### Progress Tracking
- Compare posture changes over treatment period
- Quantify improvement (angles, symmetry scores)
- Visual timeline of patient progress
- Evidence-based outcome measurement

### Integration Points
- Add to existing patient data collection workflow
- Store keypoint data in SQLite database
- Display visual overlays in React frontend
- Generate automated posture reports

---

## Technical Specifications

### MediaPipe Pose - 33 Landmarks

**Spine-Relevant Landmarks:**
- 0: Nose (head alignment)
- 11, 12: Shoulders (shoulder symmetry)
- 23, 24: Hips (pelvic alignment)
- 25, 26: Knees (leg alignment)
- 27, 28: Ankles (base support)

**Additional Landmarks:**
- Elbows, wrists, eyes, ears, mouth (full body context)

### Output Format
```json
{
  "landmarks": [
    {"x": 0.5, "y": 0.3, "z": -0.1, "visibility": 0.99},
    // 33 landmarks total
  ],
  "world_landmarks": [
    // 3D coordinates in meters
  ]
}
```

---

## System Architecture Integration

### New Components

**Backend:**
```
backend/src/
├── services/
│   └── poseEstimation.py      # MediaPipe processing script
├── controllers/
│   └── poseAnalysisController.js  # API endpoints
└── routes/
    └── poseAnalysis.js        # Routes
```

**Database Schema:**
```prisma
model PoseAnalysis {
  id              Int      @id @default(autoincrement())
  patientId       Int
  analysisDate    DateTime @default(now())
  imageType       String   // "front", "side", "video"
  keypointData    Json     // 33 landmarks
  spineAngle      Float?
  pelvicTilt      Float?
  shoulderSymmetry Float?
  postureScore    Int?
  imageUrl        String
}
```

**Frontend:**
```
frontend/src/
├── components/
│   ├── pose-analysis/
│   │   ├── PoseUpload.jsx     # Upload photos
│   │   ├── PoseVisualization.jsx  # Display skeleton overlay
│   │   └── PoseMetrics.jsx    # Show measurements
└── pages/
    └── PoseAssessment.jsx     # Main pose analysis page
```

---

## Next Steps

1. ✅ Document recommendation (this file)
2. ⏳ Review existing data collection workflow (Step 4/5)
3. ⏳ Set up MediaPipe Pose environment
4. ⏳ Create prototype for two static photos
5. ⏳ Integrate with patient upload workflow
6. ⏳ Design database schema for pose data
7. ⏳ Build frontend visualization components

---

## References

- [MediaPipe Pose Documentation](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- [MediaPipe Python API](https://google.github.io/mediapipe/solutions/pose.html)
- Clinical validation: Suitable for telehealth posture assessments
- Accuracy: Comparable to marker-based motion capture for clinical angles

---

**Status:** Architecture planning phase
**Next Action:** Identify integration point in data collection workflow
