"""
Direct test without proxy for MediaPipe Pose Service
"""

import requests
import base64
import json
import os

# Disable proxy for localhost
os.environ['NO_PROXY'] = 'localhost,127.0.0.1'
session = requests.Session()
session.trust_env = False

def encode_image_to_base64(image_path):
    """Encode image file to base64 string"""
    with open(image_path, 'rb') as f:
        image_data = f.read()
    encoded = base64.b64encode(image_data).decode('utf-8')
    ext = os.path.splitext(image_path)[1].lower()
    mime_type = 'image/png' if ext == '.png' else 'image/jpeg'
    return f'data:{mime_type};base64,{encoded}'

# Test images
standing_img = '../test_images/test_1_upright.png'
flexion_img = '../test_images/test_1_bend.png'

print("=" * 60)
print("MediaPipe Pose Analysis Test")
print("=" * 60)
print()

# Check images exist
if not os.path.exists(standing_img):
    print(f"[ERROR] Standing image not found: {standing_img}")
    exit(1)

if not os.path.exists(flexion_img):
    print(f"[ERROR] Flexion image not found: {flexion_img}")
    exit(1)

print(f"[INFO] Standing image: {standing_img}")
print(f"[INFO] Flexion image: {flexion_img}")
print()

# Encode images
print("[PROCESS] Encoding images to base64...")
standing_b64 = encode_image_to_base64(standing_img)
flexion_b64 = encode_image_to_base64(flexion_img)

print(f"[INFO] Standing image size: {len(standing_b64)} characters")
print(f"[INFO] Flexion image size: {len(flexion_b64)} characters")
print()

# Prepare request
payload = {
    'standing_image': standing_b64,
    'flexion_image': flexion_b64,
    'calculate_rom': True,
    'detect_compensations': True
}

# Send request
print("[REQUEST] Sending analysis request to http://localhost:5002/pose/analyze-static")
print()

try:
    response = session.post(
        'http://localhost:5002/pose/analyze-static',
        json=payload,
        headers={'Content-Type': 'application/json'},
        timeout=30
    )

    if response.status_code == 200:
        print("[OK] Analysis successful!")
        print()

        data = response.json()

        # Display results
        print("=" * 60)
        print("ANALYSIS RESULTS")
        print("=" * 60)
        print()

        # Standing analysis
        standing = data['standing_analysis']
        print("Standing Position:")
        print(f"  Trunk angle: {standing['trunk_angle']}°")
        print(f"  Pelvic tilt: {standing['pelvic_tilt']}°")
        print(f"  Knee angle: {standing['knee_angle']}°")
        print(f"  Image size: {standing['image_info']['width']}x{standing['image_info']['height']}")
        print(f"  Landmarks detected: {len(standing['landmarks'])}")
        print()

        # Flexion analysis
        flexion = data['flexion_analysis']
        print("Forward Flexion Position:")
        print(f"  Trunk angle: {flexion['trunk_angle']}°")
        print(f"  Pelvic tilt: {flexion['pelvic_tilt']}°")
        print(f"  Knee angle: {flexion['knee_angle']}°")
        print(f"  Image size: {flexion['image_info']['width']}x{flexion['image_info']['height']}")
        print(f"  Landmarks detected: {len(flexion['landmarks'])}")
        print()

        # ROM analysis
        rom = data['rom_analysis']
        print("=" * 60)
        print("CLINICAL ASSESSMENT")
        print("=" * 60)
        print(f"  ROM: {rom['rom_degrees']}°")
        print(f"  Assessment: {rom['rom_assessment']}")
        print(f"  Compensations: {rom['compensations']}")
        print(f"  Recommendations: {rom['recommendations']}")
        print()

        # Save results
        output_file = 'pose_analysis_results.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"[SAVE] Full results saved to: {output_file}")
        print()

        print("=" * 60)
        print("TEST COMPLETE - SUCCESS!")
        print("=" * 60)

    else:
        print(f"[ERROR] Analysis failed: {response.status_code}")
        print(f"[ERROR] Response: {response.text}")

except Exception as e:
    print(f"[ERROR] Test failed: {str(e)}")
    import traceback
    traceback.print_exc()
