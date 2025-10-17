#!/usr/bin/env python3
"""
Test Script for PaddleOCR Integration
Tests OCR service with sample medical images and system integration
"""

import os
import sys
import time
import requests
import json
from pathlib import Path

# Configuration
OCR_SERVICE_URL = "http://localhost:5001"
BACKEND_API_URL = "http://localhost:3001"

# ANSI colors for output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    """Print styled header"""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text:^70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*70}{Colors.RESET}\n")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.RESET}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ {text}{Colors.RESET}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.RESET}")

def test_ocr_service_health():
    """Test 1: Check OCR service health"""
    print_header("Test 1: OCR Service Health Check")

    try:
        response = requests.get(f"{OCR_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("OCR service is running")
            print_info(f"Status: {data.get('status')}")
            print_info(f"OCR Status: {data.get('ocr_status')}")
            print_info(f"GPU Available: {data.get('gpu_available')}")
            print_info(f"GPU Count: {data.get('gpu_count')}")
            return True
        else:
            print_error(f"OCR service returned status code {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to OCR service")
        print_warning(f"Make sure OCR service is running: python backend/ocr_service.py")
        return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def create_test_image():
    """Create a simple test image with text"""
    print_header("Test 2: Creating Test Image")

    try:
        from PIL import Image, ImageDraw, ImageFont

        # Create test image
        img = Image.new('RGB', (800, 400), color='white')
        draw = ImageDraw.Draw(img)

        # Add text
        texts = [
            "Patient Information",
            "Name: 张三 (Zhang San)",
            "Age: 45 years old",
            "Diagnosis: Non-specific Low Back Pain",
            "Pain Score: 7/10",
            "Date: 2025-10-13"
        ]

        y_position = 50
        for text in texts:
            draw.text((50, y_position), text, fill='black')
            y_position += 50

        # Save test image
        test_dir = Path("test_images")
        test_dir.mkdir(exist_ok=True)
        test_image_path = test_dir / "test_medical_report.jpg"
        img.save(test_image_path)

        print_success(f"Test image created: {test_image_path}")
        return str(test_image_path)

    except ImportError:
        print_warning("PIL not available, will use existing test images")
        return None
    except Exception as e:
        print_error(f"Error creating test image: {e}")
        return None

def test_single_image_ocr(image_path=None):
    """Test 3: Process single image with OCR"""
    print_header("Test 3: Single Image OCR Processing")

    if not image_path:
        # Try to find a test image
        test_paths = [
            "test_images/test_medical_report.jpg",
            "../abc/screenshots/screenshot_001.jpg",
            "../images/test.jpg"
        ]

        for test_path in test_paths:
            if os.path.exists(test_path):
                image_path = test_path
                break

    if not image_path or not os.path.exists(image_path):
        print_warning("No test image available, skipping single image test")
        print_info("You can place a test image at: test_images/test_medical_report.jpg")
        return None

    print_info(f"Processing image: {image_path}")

    try:
        response = requests.post(
            f"{OCR_SERVICE_URL}/ocr/process",
            json={
                "image_path": os.path.abspath(image_path),
                "options": {
                    "extract_structured": True,
                    "confidence_threshold": 0.6
                }
            },
            timeout=60
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success("OCR processing successful")
                print_info(f"Lines extracted: {data.get('line_count')}")
                print_info(f"Image size: {data['image_info']['width']}x{data['image_info']['height']}")
                print_info(f"Image resized: {data['image_info']['resized']}")

                print(f"\n{Colors.BOLD}Extracted Text:{Colors.RESET}")
                print("-" * 70)
                for i, line in enumerate(data.get('text_lines', [])[:10], 1):
                    print(f"{i:2d}. {line}")
                if len(data.get('text_lines', [])) > 10:
                    print(f"    ... and {len(data['text_lines']) - 10} more lines")
                print("-" * 70)

                return data
            else:
                print_error("OCR processing failed")
                return None
        else:
            print_error(f"OCR service returned status code {response.status_code}")
            print_error(f"Response: {response.text}")
            return None

    except Exception as e:
        print_error(f"Error: {e}")
        return None

def test_batch_ocr():
    """Test 4: Batch OCR processing"""
    print_header("Test 4: Batch OCR Processing")

    # Find multiple test images
    test_dir = Path("test_images")
    if not test_dir.exists():
        print_warning("No test_images directory found, skipping batch test")
        return None

    image_files = list(test_dir.glob("*.jpg")) + list(test_dir.glob("*.png"))

    if len(image_files) < 2:
        print_warning(f"Found only {len(image_files)} image(s), need at least 2 for batch test")
        return None

    print_info(f"Found {len(image_files)} images for batch processing")

    try:
        response = requests.post(
            f"{OCR_SERVICE_URL}/ocr/batch",
            json={
                "image_paths": [str(f.absolute()) for f in image_files[:5]],  # Test with max 5 images
                "options": {
                    "extract_structured": False,
                    "confidence_threshold": 0.6
                }
            },
            timeout=300  # 5 minutes for batch
        )

        if response.status_code == 200:
            data = response.json()
            summary = data.get('summary', {})

            print_success("Batch processing completed")
            print_info(f"Total: {summary.get('total')}")
            print_info(f"Success: {summary.get('success')}")
            print_info(f"Failed: {summary.get('failed')}")

            # Show results summary
            print(f"\n{Colors.BOLD}Results Summary:{Colors.RESET}")
            for i, result in enumerate(data.get('results', []), 1):
                filename = os.path.basename(result['image_path'])
                if result['success']:
                    print(f"  {i}. {filename}: {Colors.GREEN}✓{Colors.RESET} ({result.get('line_count', 0)} lines)")
                else:
                    print(f"  {i}. {filename}: {Colors.RED}✗{Colors.RESET} ({result.get('error', 'Unknown error')})")

            return data
        else:
            print_error(f"Batch processing failed with status code {response.status_code}")
            return None

    except Exception as e:
        print_error(f"Error: {e}")
        return None

def test_database_schema():
    """Test 5: Verify database schema for OCR fields"""
    print_header("Test 5: Database Schema Verification")

    schema_path = Path("backend/database/schema.prisma")
    if not schema_path.exists():
        print_error("Schema file not found")
        return False

    try:
        schema_content = schema_path.read_text()

        required_fields = [
            'ocrProcessed',
            'ocrText',
            'ocrTextLines',
            'ocrStructured',
            'ocrProcessedAt',
            'ocrError'
        ]

        missing_fields = []
        for field in required_fields:
            if field not in schema_content:
                missing_fields.append(field)

        if not missing_fields:
            print_success("All OCR fields present in schema")
            print_info("Fields: " + ", ".join(required_fields))
            return True
        else:
            print_error(f"Missing fields: {', '.join(missing_fields)}")
            print_warning("Run database migration to add OCR fields")
            return False

    except Exception as e:
        print_error(f"Error reading schema: {e}")
        return False

def print_setup_instructions():
    """Print setup and usage instructions"""
    print_header("Setup & Usage Instructions")

    print(f"{Colors.BOLD}1. Start OCR Service:{Colors.RESET}")
    print("   cd backend")
    print("   python ocr_service.py")
    print("   (Service will run on http://localhost:5001)")
    print()

    print(f"{Colors.BOLD}2. Update Database Schema:{Colors.RESET}")
    print("   cd backend")
    print("   npx prisma migrate dev --name add_ocr_fields")
    print("   (Creates migration for new OCR fields)")
    print()

    print(f"{Colors.BOLD}3. Start Backend API:{Colors.RESET}")
    print("   cd backend")
    print("   python server.py")
    print("   (API will run on http://localhost:3001)")
    print()

    print(f"{Colors.BOLD}4. Upload Medical Images:{Colors.RESET}")
    print("   • Upload images through the web interface")
    print("   • OCR will process images automatically")
    print("   • View extracted text in patient file details")
    print()

    print(f"{Colors.BOLD}5. Test with Sample Images:{Colors.RESET}")
    print("   • Place test images in: test_images/")
    print("   • Run this test script again")
    print()

    print(f"{Colors.BOLD}OCR Features:{Colors.RESET}")
    print("   ✓ Automatic text extraction from uploaded images")
    print("   ✓ GPU acceleration (if CUDA available)")
    print("   ✓ Chinese + English text recognition")
    print("   ✓ Structured data with text positions")
    print("   ✓ Batch processing support")
    print()

def main():
    """Run all tests"""
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print("=" * 70)
    print("  PaddleOCR Integration Test Suite")
    print("  Low Back Pain System - Medical Image OCR")
    print("=" * 70)
    print(Colors.RESET)

    results = {
        'ocr_health': False,
        'test_image': None,
        'single_ocr': None,
        'batch_ocr': None,
        'schema_check': False
    }

    # Run tests
    results['ocr_health'] = test_ocr_service_health()

    if results['ocr_health']:
        results['test_image'] = create_test_image()
        results['single_ocr'] = test_single_image_ocr(results['test_image'])
        results['batch_ocr'] = test_batch_ocr()
    else:
        print_warning("Skipping OCR tests because service is not running")

    results['schema_check'] = test_database_schema()

    # Summary
    print_header("Test Summary")

    tests = [
        ("OCR Service Health", results['ocr_health']),
        ("Test Image Creation", results['test_image'] is not None),
        ("Single Image OCR", results['single_ocr'] is not None),
        ("Batch OCR Processing", results['batch_ocr'] is not None),
        ("Database Schema", results['schema_check'])
    ]

    passed = 0
    total = len(tests)

    for test_name, test_result in tests:
        if test_result:
            print_success(f"{test_name}")
            passed += 1
        else:
            print_error(f"{test_name}")

    print()
    if passed == total:
        print_success(f"All tests passed! ({passed}/{total})")
    else:
        print_warning(f"Some tests failed ({passed}/{total} passed)")

    # Instructions
    if not results['ocr_health']:
        print()
        print_setup_instructions()

    print()
    print(f"{Colors.BOLD}Next Steps:{Colors.RESET}")
    if not results['ocr_health']:
        print("  1. Start the OCR service: python backend/ocr_service.py")
    if not results['schema_check']:
        print("  2. Run database migration to add OCR fields")
    print("  3. Upload medical images through the web interface")
    print("  4. OCR will automatically extract text from images")
    print()

if __name__ == '__main__':
    main()
