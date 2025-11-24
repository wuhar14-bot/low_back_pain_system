"""
Test script for MediaPipe Pose Service

This script tests the pose_service.py API with sample images.

Usage:
    python test_pose_service.py [standing_image_path] [flexion_image_path]

If no images provided, will test with placeholder data.
"""

import requests
import base64
import json
import sys
import os


def encode_image_to_base64(image_path):
    """
    Encode image file to base64 string

    Args:
        image_path: Path to image file

    Returns:
        str: Base64 encoded image with data URI prefix
    """
    with open(image_path, 'rb') as f:
        image_data = f.read()

    # Determine image format
    ext = os.path.splitext(image_path)[1].lower()
    if ext == '.jpg' or ext == '.jpeg':
        mime_type = 'image/jpeg'
    elif ext == '.png':
        mime_type = 'image/png'
    else:
        mime_type = 'image/jpeg'  # Default

    # Encode to base64
    encoded = base64.b64encode(image_data).decode('utf-8')

    # Add data URI prefix
    data_uri = f'data:{mime_type};base64,{encoded}'

    return data_uri


def test_health_endpoint():
    """Test the health check endpoint"""
    print("=" * 60)
    print("Testing /health endpoint")
    print("=" * 60)

    try:
        response = requests.get('http://localhost:5002/health')

        if response.status_code == 200:
            print("[OK] Service is healthy")
            data = response.json()
            print(f"[INFO] Service: {data['service']}")
            print(f"[INFO] Version: {data['version']}")
            print(f"[INFO] MediaPipe version: {data['mediapipe_version']}")
            print(f"[INFO] Landmarks: {data['landmarks_count']}")
            print()
            return True
        else:
            print(f"[ERROR] Health check failed: {response.status_code}")
            return False

    except Exception as e:
        print(f"[ERROR] Connection failed: {str(e)}")
        print("[ERROR] Make sure pose_service.py is running on port 5002")
        return False


def test_analyze_endpoint(standing_image_path=None, flexion_image_path=None):
    """Test the pose analysis endpoint"""
    print("=" * 60)
    print("Testing /pose/analyze-static endpoint")
    print("=" * 60)

    if not standing_image_path or not flexion_image_path:
        print("[SKIP] No test images provided")
        print("[INFO] Usage: python test_pose_service.py <standing_img> <flexion_img>")
        print()
        return

    try:
        # Check if files exist
        if not os.path.exists(standing_image_path):
            print(f"[ERROR] Standing image not found: {standing_image_path}")
            return

        if not os.path.exists(flexion_image_path):
            print(f"[ERROR] Flexion image not found: {flexion_image_path}")
            return

        print(f"[INFO] Standing image: {standing_image_path}")
        print(f"[INFO] Flexion image: {flexion_image_path}")
        print()

        # Encode images
        print("[PROCESS] Encoding images to base64...")
        standing_b64 = encode_image_to_base64(standing_image_path)
        flexion_b64 = encode_image_to_base64(flexion_image_path)

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
        response = requests.post(
            'http://localhost:5002/pose/analyze-static',
            json=payload,
            headers={'Content-Type': 'application/json'}
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
            print("Range of Motion (ROM) Analysis:")
            print(f"  ROM: {rom['rom_degrees']}°")
            print(f"  Assessment: {rom['rom_assessment']}")
            print(f"  Compensations: {rom['compensations']}")
            print(f"  Recommendations: {rom['recommendations']}")
            print()

            # Save results to file
            output_file = 'pose_analysis_results.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            print(f"[SAVE] Full results saved to: {output_file}")
            print()

        else:
            print(f"[ERROR] Analysis failed: {response.status_code}")
            print(f"[ERROR] Response: {response.text}")
            print()

    except Exception as e:
        print(f"[ERROR] Test failed: {str(e)}")
        import traceback
        traceback.print_exc()


def main():
    """Main test function"""
    print()
    print("=" * 60)
    print(" " * 10 + "MediaPipe Pose Service Test Suite")
    print("=" * 60)
    print()

    # Test health endpoint
    health_ok = test_health_endpoint()

    if not health_ok:
        print("[EXIT] Service not available, exiting tests")
        sys.exit(1)

    # Test analysis endpoint
    if len(sys.argv) >= 3:
        standing_img = sys.argv[1]
        flexion_img = sys.argv[2]
        test_analyze_endpoint(standing_img, flexion_img)
    else:
        test_analyze_endpoint()

    print("=" * 60)
    print("Test Suite Complete")
    print("=" * 60)
    print()


if __name__ == '__main__':
    main()
