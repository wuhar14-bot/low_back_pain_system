"""
MediaPipe Pose Estimation Service for Low Back Pain Assessment

This service provides pose estimation and clinical measurement capabilities
using MediaPipe Pose. It analyzes patient photos to extract body landmarks
and calculate clinically relevant measurements like ROM, trunk angles, etc.

Port: 5002
Endpoints:
  - GET  /health
  - POST /pose/analyze-static

Author: Low Back Pain System
Date: 2025-10-17
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import mediapipe as mp
import cv2
import numpy as np
import base64
import math
from PIL import Image
import io
import sys
import traceback

app = Flask(__name__)
CORS(app)

# ============================================================
# MediaPipe Initialization
# ============================================================

print("=" * 60)
print("MediaPipe Pose Service for Low Back Pain Assessment")
print("=" * 60)
print()

try:
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils
    mp_drawing_styles = mp.solutions.drawing_styles

    # Initialize pose estimator for static images
    pose_static = mp_pose.Pose(
        static_image_mode=True,
        model_complexity=2,  # Highest accuracy (0=lite, 1=full, 2=heavy)
        enable_segmentation=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    print("[OK] MediaPipe Pose initialized successfully")
    print("    - Model complexity: 2 (highest accuracy)")
    print("    - Detection confidence: 0.5")
    print("    - 33 landmarks per person")
    print()
except Exception as e:
    print(f"[ERROR] Failed to initialize MediaPipe Pose: {str(e)}")
    sys.exit(1)

# ============================================================
# Landmark Index Reference (MediaPipe Pose - 33 landmarks)
# ============================================================
"""
0: Nose
1-10: Face landmarks (eyes, ears, mouth)
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
"""

# Key landmarks for clinical assessment
LANDMARK_NAMES = {
    0: "nose",
    11: "left_shoulder",
    12: "right_shoulder",
    23: "left_hip",
    24: "right_hip",
    25: "left_knee",
    26: "right_knee",
    27: "left_ankle",
    28: "right_ankle"
}

# ============================================================
# Helper Functions
# ============================================================

def decode_base64_image(base64_string):
    """
    Decode base64 image string to numpy array

    Args:
        base64_string: Base64 encoded image (with or without data URI prefix)

    Returns:
        numpy array: BGR image
    """
    try:
        # Remove data URI prefix if present
        if base64_string.startswith('data:image'):
            base64_string = base64_string.split(',')[1]

        # Decode base64
        image_bytes = base64.b64decode(base64_string)

        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB (PIL uses RGB, OpenCV uses BGR)
        image_rgb = np.array(image)

        # Convert RGB to BGR for OpenCV
        if len(image_rgb.shape) == 3 and image_rgb.shape[2] == 3:
            image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
        else:
            image_bgr = image_rgb

        return image_bgr

    except Exception as e:
        raise ValueError(f"Failed to decode image: {str(e)}")


def process_image(image_bgr):
    """
    Process image with MediaPipe Pose to extract landmarks

    Args:
        image_bgr: OpenCV image (BGR format)

    Returns:
        dict: {
            'success': bool,
            'landmarks': list of 33 landmarks [{x, y, z, visibility}, ...],
            'image_info': {width, height}
        }
    """
    try:
        # Convert BGR to RGB for MediaPipe
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

        # Get image dimensions
        height, width, _ = image_rgb.shape

        # Process with MediaPipe
        results = pose_static.process(image_rgb)

        if not results.pose_landmarks:
            return {
                'success': False,
                'error': 'No person detected in image',
                'image_info': {'width': width, 'height': height}
            }

        # Extract landmarks (normalized coordinates 0-1)
        landmarks = []
        for landmark in results.pose_landmarks.landmark:
            landmarks.append({
                'x': landmark.x,
                'y': landmark.y,
                'z': landmark.z,
                'visibility': landmark.visibility
            })

        return {
            'success': True,
            'landmarks': landmarks,
            'image_info': {
                'width': width,
                'height': height
            }
        }

    except Exception as e:
        return {
            'success': False,
            'error': f"Processing error: {str(e)}"
        }


def calculate_angle(p1, p2, p3):
    """
    Calculate angle between three points (p1-p2-p3)

    Args:
        p1, p2, p3: Points with x, y coordinates

    Returns:
        float: Angle in degrees
    """
    try:
        # Vector from p2 to p1
        v1 = np.array([p1['x'] - p2['x'], p1['y'] - p2['y']])

        # Vector from p2 to p3
        v2 = np.array([p3['x'] - p2['x'], p3['y'] - p2['y']])

        # Calculate angle using dot product
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

        # Clamp to [-1, 1] to avoid numerical errors
        cos_angle = np.clip(cos_angle, -1.0, 1.0)

        angle = math.degrees(math.acos(cos_angle))

        return angle

    except Exception as e:
        print(f"[WARN] Angle calculation error: {str(e)}")
        return None


def calculate_trunk_angle(landmarks):
    """
    Calculate trunk angle relative to vertical

    Trunk line: Midpoint of hips -> Midpoint of shoulders
    Vertical reference: Straight down (parallel to y-axis)

    Args:
        landmarks: List of 33 landmarks

    Returns:
        float: Trunk angle in degrees (0 = vertical, 90 = horizontal)
    """
    try:
        # Get shoulder landmarks (11=left, 12=right)
        left_shoulder = landmarks[11]
        right_shoulder = landmarks[12]

        # Get hip landmarks (23=left, 24=right)
        left_hip = landmarks[23]
        right_hip = landmarks[24]

        # Calculate midpoints
        shoulder_mid_x = (left_shoulder['x'] + right_shoulder['x']) / 2
        shoulder_mid_y = (left_shoulder['y'] + right_shoulder['y']) / 2

        hip_mid_x = (left_hip['x'] + right_hip['x']) / 2
        hip_mid_y = (left_hip['y'] + right_hip['y']) / 2

        # Calculate trunk angle from vertical
        # Vector from hip to shoulder
        dx = shoulder_mid_x - hip_mid_x
        dy = shoulder_mid_y - hip_mid_y

        # Angle from vertical (y-axis points down in image coordinates)
        # atan2(dx, -dy) gives angle from vertical
        angle = abs(math.degrees(math.atan2(dx, -dy)))

        return round(angle, 2)

    except Exception as e:
        print(f"[WARN] Trunk angle calculation error: {str(e)}")
        return None


def calculate_pelvic_tilt(landmarks):
    """
    Calculate pelvic tilt angle

    Pelvic line: Left hip -> Right hip
    Horizontal reference: Parallel to x-axis

    Args:
        landmarks: List of 33 landmarks

    Returns:
        float: Pelvic tilt in degrees (0 = horizontal, positive = right hip higher)
    """
    try:
        left_hip = landmarks[23]
        right_hip = landmarks[24]

        # Calculate angle
        dy = right_hip['y'] - left_hip['y']
        dx = right_hip['x'] - left_hip['x']

        angle = math.degrees(math.atan2(dy, dx))

        return round(angle, 2)

    except Exception as e:
        print(f"[WARN] Pelvic tilt calculation error: {str(e)}")
        return None


def calculate_knee_angle(landmarks):
    """
    Calculate knee angle (hip-knee-ankle)

    Args:
        landmarks: List of 33 landmarks

    Returns:
        float: Average knee angle in degrees (180 = straight)
    """
    try:
        # Left leg
        left_hip = landmarks[23]
        left_knee = landmarks[25]
        left_ankle = landmarks[27]

        # Right leg
        right_hip = landmarks[24]
        right_knee = landmarks[26]
        right_ankle = landmarks[28]

        # Calculate both knee angles
        left_knee_angle = calculate_angle(left_hip, left_knee, left_ankle)
        right_knee_angle = calculate_angle(right_hip, right_knee, right_ankle)

        # Return average
        if left_knee_angle and right_knee_angle:
            return round((left_knee_angle + right_knee_angle) / 2, 2)
        elif left_knee_angle:
            return round(left_knee_angle, 2)
        elif right_knee_angle:
            return round(right_knee_angle, 2)
        else:
            return None

    except Exception as e:
        print(f"[WARN] Knee angle calculation error: {str(e)}")
        return None


def calculate_rom(standing_trunk_angle, flexion_trunk_angle):
    """
    Calculate Range of Motion (ROM) from standing to flexion

    Args:
        standing_trunk_angle: Trunk angle when standing
        flexion_trunk_angle: Trunk angle when flexed forward

    Returns:
        float: ROM in degrees
    """
    if standing_trunk_angle is None or flexion_trunk_angle is None:
        return None

    rom = abs(flexion_trunk_angle - standing_trunk_angle)
    return round(rom, 2)


def assess_rom(rom_degrees):
    """
    Assess ROM based on clinical standards for lumbar flexion

    Normal lumbar flexion: 70-110 degrees

    Args:
        rom_degrees: ROM in degrees

    Returns:
        str: Assessment category
    """
    if rom_degrees is None:
        return "无法评估"

    if rom_degrees >= 70:
        return "正常"
    elif rom_degrees >= 50:
        return "轻度受限"
    elif rom_degrees >= 30:
        return "中度受限"
    else:
        return "重度受限"


def detect_compensations(standing_landmarks, flexion_landmarks):
    """
    Detect common movement compensations during forward flexion

    Compensations checked:
    1. Knee flexion (should stay straight)
    2. Hip lateral shift (should stay centered)
    3. Shoulder asymmetry (should move symmetrically)

    Args:
        standing_landmarks: Landmarks in standing position
        flexion_landmarks: Landmarks in flexion position

    Returns:
        str: Description of compensations detected
    """
    compensations = []

    try:
        # 1. Check knee flexion compensation
        standing_knee_angle = calculate_knee_angle(standing_landmarks)
        flexion_knee_angle = calculate_knee_angle(flexion_landmarks)

        if standing_knee_angle and flexion_knee_angle:
            knee_bend = abs(180 - flexion_knee_angle) - abs(180 - standing_knee_angle)
            if knee_bend > 15:  # More than 15 degrees knee bend
                compensations.append(f"膝关节弯曲代偿 ({knee_bend:.1f}度)")

        # 2. Check hip lateral shift
        standing_hip_mid_x = (standing_landmarks[23]['x'] + standing_landmarks[24]['x']) / 2
        flexion_hip_mid_x = (flexion_landmarks[23]['x'] + flexion_landmarks[24]['x']) / 2

        hip_shift = abs(flexion_hip_mid_x - standing_hip_mid_x)
        if hip_shift > 0.05:  # More than 5% shift (normalized coordinates)
            compensations.append("髋关节侧移代偿")

        # 3. Check shoulder asymmetry
        standing_shoulder_width = abs(standing_landmarks[11]['y'] - standing_landmarks[12]['y'])
        flexion_shoulder_width = abs(flexion_landmarks[11]['y'] - flexion_landmarks[12]['y'])

        asymmetry = abs(flexion_shoulder_width - standing_shoulder_width)
        if asymmetry > 0.08:  # More than 8% asymmetry
            side = "左" if flexion_landmarks[11]['y'] < flexion_landmarks[12]['y'] else "右"
            compensations.append(f"肩部不对称代偿 ({side}侧下降)")

    except Exception as e:
        print(f"[WARN] Compensation detection error: {str(e)}")

    if not compensations:
        return "无明显代偿动作"
    else:
        return "、".join(compensations)


def generate_recommendations(rom_assessment, compensations):
    """
    Generate clinical recommendations based on ROM and compensations

    Args:
        rom_assessment: ROM assessment category
        compensations: Detected compensations

    Returns:
        str: Clinical recommendations
    """
    recommendations = []

    # ROM-based recommendations
    if rom_assessment == "正常":
        recommendations.append("活动范围正常，继续保持")
    elif rom_assessment == "轻度受限":
        recommendations.append("建议进行腰部灵活性训练")
    elif rom_assessment == "中度受限":
        recommendations.append("建议加强腰部和髋关节灵活性训练")
    else:  # 重度受限
        recommendations.append("活动范围显著受限，建议进一步评估并制定针对性康复方案")

    # Compensation-based recommendations
    if "膝关节" in compensations:
        recommendations.append("注意保持膝关节伸直，改善髋关节灵活性")

    if "侧移" in compensations:
        recommendations.append("注意核心稳定性训练，避免髋部代偿")

    if "不对称" in compensations:
        recommendations.append("注意双侧对称性训练，评估是否存在单侧疼痛或紧张")

    return "；".join(recommendations)


# ============================================================
# API Endpoints
# ============================================================

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint

    Returns service status and MediaPipe configuration
    """
    return jsonify({
        'status': 'healthy',
        'service': 'MediaPipe Pose Estimation',
        'version': '1.0.0',
        'mediapipe_version': mp.__version__,
        'model_complexity': 2,
        'landmarks_count': 33,
        'endpoints': {
            'health': 'GET /health',
            'analyze': 'POST /pose/analyze-static'
        }
    })


@app.route('/pose/analyze-static', methods=['POST'])
def analyze_static_pose():
    """
    Analyze two static posture photos (standing + flexion)

    Request JSON:
    {
        "standing_image": "data:image/jpeg;base64,...",
        "flexion_image": "data:image/jpeg;base64,...",
        "calculate_rom": true,
        "detect_compensations": true
    }

    Response JSON:
    {
        "success": true,
        "standing_analysis": {
            "landmarks": [...],
            "trunk_angle": 2.5,
            "pelvic_tilt": -1.2,
            "knee_angle": 178.5,
            "image_info": {...}
        },
        "flexion_analysis": {...},
        "rom_analysis": {
            "rom_degrees": 82.8,
            "rom_assessment": "正常",
            "compensations": "无明显代偿动作",
            "recommendations": "活动范围正常，继续保持"
        }
    }
    """
    try:
        # Parse request
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400

        standing_image_b64 = data.get('standing_image')
        flexion_image_b64 = data.get('flexion_image')

        if not standing_image_b64 or not flexion_image_b64:
            return jsonify({
                'success': False,
                'error': 'Both standing_image and flexion_image are required'
            }), 400

        print("[INFO] Received pose analysis request")
        print(f"[INFO] Standing image size: {len(standing_image_b64)} characters")
        print(f"[INFO] Flexion image size: {len(flexion_image_b64)} characters")

        # Process standing image
        print("[PROCESS] Decoding standing image...")
        standing_img = decode_base64_image(standing_image_b64)

        print("[PROCESS] Analyzing standing pose...")
        standing_result = process_image(standing_img)

        if not standing_result['success']:
            return jsonify({
                'success': False,
                'error': f"Standing image analysis failed: {standing_result.get('error')}"
            }), 400

        # Process flexion image
        print("[PROCESS] Decoding flexion image...")
        flexion_img = decode_base64_image(flexion_image_b64)

        print("[PROCESS] Analyzing flexion pose...")
        flexion_result = process_image(flexion_img)

        if not flexion_result['success']:
            return jsonify({
                'success': False,
                'error': f"Flexion image analysis failed: {flexion_result.get('error')}"
            }), 400

        # Calculate clinical measurements
        print("[CALCULATE] Computing clinical measurements...")

        standing_landmarks = standing_result['landmarks']
        flexion_landmarks = flexion_result['landmarks']

        # Trunk angles
        standing_trunk_angle = calculate_trunk_angle(standing_landmarks)
        flexion_trunk_angle = calculate_trunk_angle(flexion_landmarks)

        # Pelvic tilt
        standing_pelvic_tilt = calculate_pelvic_tilt(standing_landmarks)
        flexion_pelvic_tilt = calculate_pelvic_tilt(flexion_landmarks)

        # Knee angles
        standing_knee_angle = calculate_knee_angle(standing_landmarks)
        flexion_knee_angle = calculate_knee_angle(flexion_landmarks)

        # ROM calculation
        rom_degrees = calculate_rom(standing_trunk_angle, flexion_trunk_angle)
        rom_assessment = assess_rom(rom_degrees)

        # Compensation detection
        if data.get('detect_compensations', True):
            compensations = detect_compensations(standing_landmarks, flexion_landmarks)
        else:
            compensations = "未检测"

        # Generate recommendations
        recommendations = generate_recommendations(rom_assessment, compensations)

        # Print results (with encoding error handling for Windows console)
        try:
            print(f"[RESULT] Standing trunk angle: {standing_trunk_angle}°")
            print(f"[RESULT] Flexion trunk angle: {flexion_trunk_angle}°")
            print(f"[RESULT] ROM: {rom_degrees}° ({rom_assessment})")
            print(f"[RESULT] Compensations: {compensations}")
            print()
        except UnicodeEncodeError:
            print(f"[RESULT] Standing trunk angle: {standing_trunk_angle} degrees")
            print(f"[RESULT] Flexion trunk angle: {flexion_trunk_angle} degrees")
            print(f"[RESULT] ROM: {rom_degrees} degrees")
            print(f"[RESULT] Assessment: {len(rom_assessment)} characters (Chinese)")
            print(f"[RESULT] Compensations: {len(compensations)} characters (Chinese)")
            print("[INFO] Console encoding doesn't support Chinese - see JSON response")

        # Build response
        response = {
            'success': True,
            'standing_analysis': {
                'landmarks': standing_landmarks,
                'trunk_angle': standing_trunk_angle,
                'pelvic_tilt': standing_pelvic_tilt,
                'knee_angle': standing_knee_angle,
                'image_info': standing_result['image_info']
            },
            'flexion_analysis': {
                'landmarks': flexion_landmarks,
                'trunk_angle': flexion_trunk_angle,
                'pelvic_tilt': flexion_pelvic_tilt,
                'knee_angle': flexion_knee_angle,
                'image_info': flexion_result['image_info']
            },
            'rom_analysis': {
                'rom_degrees': rom_degrees,
                'rom_assessment': rom_assessment,
                'compensations': compensations,
                'recommendations': recommendations
            }
        }

        return jsonify(response)

    except Exception as e:
        print(f"[ERROR] Analysis failed: {str(e)}")
        traceback.print_exc()

        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


# ============================================================
# Main Entry Point
# ============================================================

if __name__ == '__main__':
    print("Features:")
    print("  [OK] MediaPipe Pose (33 landmarks)")
    print("  [OK] Trunk angle calculation")
    print("  [OK] Pelvic tilt measurement")
    print("  [OK] ROM calculation")
    print("  [OK] Compensation detection")
    print()
    print("[START] Starting server on http://localhost:5002")
    print("=" * 60)
    print()

    app.run(host='0.0.0.0', port=5002, debug=True)
