"""
Test MediaPipe Pose Service with test images
Tests the pose analysis functionality with standing and flexion images
"""

import requests
import base64
import json
import os

# Disable proxy for localhost
os.environ['NO_PROXY'] = 'localhost,127.0.0.1'

def encode_image_to_base64(image_path):
    """Read image file and encode to base64"""
    with open(image_path, 'rb') as f:
        image_bytes = f.read()
    return base64.b64encode(image_bytes).decode('utf-8')

def test_pose_analysis():
    """Test pose analysis with test images"""

    # Test image paths
    standing_image = r"E:\claude-code\low back pain system\test_images\test_1_upright.png"
    flexion_image = r"E:\claude-code\low back pain system\test_images\test_1_bend.png"

    print("=" * 70)
    print("MediaPipe Pose Service Test")
    print("=" * 70)
    print()

    # 1. Health check
    print("[1/3] Checking service health...")
    try:
        response = requests.get('http://localhost:5002/health', proxies={'http': None, 'https': None})
        if response.status_code == 200:
            health = response.json()
            print("[OK] Service is healthy")
            print(f"    MediaPipe version: {health['mediapipe_version']}")
            print(f"    Model complexity: {health['model_complexity']}")
            print(f"    Landmarks count: {health['landmarks_count']}")
            print()
        else:
            print(f"[ERROR] Health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"[ERROR] Cannot connect to service: {e}")
        print("   Make sure the service is running on http://localhost:5002")
        return

    # 2. Encode images
    print("[2/3] Encoding test images...")
    try:
        standing_b64 = encode_image_to_base64(standing_image)
        flexion_b64 = encode_image_to_base64(flexion_image)
        print(f"[OK] Standing image: {len(standing_b64)} bytes")
        print(f"[OK] Flexion image:  {len(flexion_b64)} bytes")
        print()
    except Exception as e:
        print(f"[ERROR] Failed to encode images: {e}")
        return

    # 3. Analyze pose
    print("[3/3] Analyzing pose...")
    try:
        payload = {
            "standing_image": f"data:image/png;base64,{standing_b64}",
            "flexion_image": f"data:image/png;base64,{flexion_b64}",
            "calculate_rom": True,
            "detect_compensations": True
        }

        response = requests.post(
            'http://localhost:5002/pose/analyze-static',
            json=payload,
            headers={'Content-Type': 'application/json'},
            proxies={'http': None, 'https': None}
        )

        if response.status_code == 200:
            result = response.json()
            print("[OK] Analysis completed successfully")
            print()
            print("=" * 70)
            print("RESULTS")
            print("=" * 70)
            print()

            # Standing analysis
            standing = result['standing_analysis']
            print("Standing Position:")
            print(f"   Trunk angle:  {standing['trunk_angle']} degrees")
            print(f"   Pelvic tilt:  {standing['pelvic_tilt']} degrees")
            print(f"   Knee angle:   {standing['knee_angle']} degrees")
            print(f"   Image size:   {standing['image_info']['width']}x{standing['image_info']['height']}")
            print()

            # Flexion analysis
            flexion = result['flexion_analysis']
            print("Flexion Position:")
            print(f"   Trunk angle:  {flexion['trunk_angle']} degrees")
            print(f"   Pelvic tilt:  {flexion['pelvic_tilt']} degrees")
            print(f"   Knee angle:   {flexion['knee_angle']} degrees")
            print(f"   Image size:   {flexion['image_info']['width']}x{flexion['image_info']['height']}")
            print()

            # ROM analysis
            rom = result['rom_analysis']
            print("Range of Motion Analysis:")
            print(f"   ROM:            {rom['rom_degrees']} degrees")
            print(f"   Assessment:     (see JSON file for Chinese text)")
            print(f"   Compensations:  (see JSON file for Chinese text)")
            print(f"   Recommendations: (see JSON file for Chinese text)")
            print()

            print("=" * 70)
            print("[OK] All tests passed!")
            print("=" * 70)

            # Save full result
            with open('test_mediapipe_result.json', 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            print("\n[SAVED] Full result saved to: test_mediapipe_result.json")

        else:
            print(f"[ERROR] Analysis failed: {response.status_code}")
            print(f"   Response: {response.text}")

    except Exception as e:
        print(f"[ERROR] Analysis error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_pose_analysis()
