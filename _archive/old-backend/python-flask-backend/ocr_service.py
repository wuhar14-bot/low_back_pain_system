#!/usr/bin/env python3
"""
PaddleOCR Service for Medical Image Text Extraction
Provides OCR processing for uploaded medical images (X-rays, reports, etc.)
"""

import os
import sys
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import paddleocr
import json

app = Flask(__name__)
CORS(app)

# Global OCR instance (initialized once for efficiency)
ocr = None

def initialize_ocr():
    """Initialize PaddleOCR with GPU acceleration"""
    global ocr
    if ocr is None:
        print("Initializing PaddleOCR (GPU)...")
        try:
            ocr = paddleocr.PaddleOCR(
                use_angle_cls=True,    # Auto-rotate text detection
                lang='ch',             # Chinese + English support
                use_gpu=True,          # GPU acceleration
                show_log=False         # Reduce console output
            )
            print("[OK] PaddleOCR initialized successfully with GPU")
        except Exception as e:
            print(f"[WARN] GPU initialization failed, falling back to CPU: {e}")
            ocr = paddleocr.PaddleOCR(
                use_angle_cls=True,
                lang='ch',
                use_gpu=False,
                show_log=False
            )
            print("[OK] PaddleOCR initialized with CPU")
    return ocr

def resize_image_if_needed(image_path, max_size=2000):
    """
    Resize image if dimensions exceed max_size to prevent GPU memory overflow

    Args:
        image_path: Path to image file
        max_size: Maximum dimension in pixels (default 2000)

    Returns:
        PIL Image object (resized if necessary)
    """
    img = Image.open(image_path)
    width, height = img.size

    if width > max_size or height > max_size:
        scale = max_size / max(width, height)
        new_width = int(width * scale)
        new_height = int(height * scale)
        img = img.resize((new_width, new_height), Image.LANCZOS)
        print(f"  [RESIZE] {width}x{height} -> {new_width}x{new_height}")

    return img

def extract_text_from_ocr_result(ocr_result):
    """
    Extract all text lines from OCR result

    Args:
        ocr_result: PaddleOCR result object

    Returns:
        List of text strings
    """
    if not ocr_result or not ocr_result[0]:
        return []

    texts = []
    for line in ocr_result[0]:
        # line format: [[[x1,y1], [x2,y2], [x3,y3], [x4,y4]], (text, confidence)]
        text = line[1][0]
        confidence = line[1][1]

        # Only include text with confidence > 0.6 (adjust threshold as needed)
        if confidence > 0.6:
            texts.append(text)

    return texts

def extract_structured_data(ocr_result):
    """
    Extract structured data with positions and confidence scores

    Args:
        ocr_result: PaddleOCR result object

    Returns:
        List of dicts with text, position, and confidence
    """
    if not ocr_result or not ocr_result[0]:
        return []

    structured_data = []
    for line in ocr_result[0]:
        box = line[0]  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
        text = line[1][0]
        confidence = line[1][1]

        # Calculate center position
        center_x = (box[0][0] + box[2][0]) / 2
        center_y = (box[0][1] + box[2][1]) / 2

        structured_data.append({
            'text': text,
            'confidence': round(confidence, 3),
            'position': {
                'x': round(center_x, 1),
                'y': round(center_y, 1)
            },
            'bbox': box  # Full bounding box for advanced processing
        })

    return structured_data

# API Endpoints

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Check if OCR is initialized
        ocr_status = "initialized" if ocr is not None else "not_initialized"

        # Check GPU availability
        import paddle
        gpu_available = paddle.device.cuda.device_count() > 0

        return jsonify({
            'status': 'healthy',
            'ocr_status': ocr_status,
            'gpu_available': gpu_available,
            'gpu_count': paddle.device.cuda.device_count() if gpu_available else 0
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/ocr/process', methods=['POST'])
def process_ocr():
    """
    Process an image file with OCR

    Request JSON (Option 1 - File path):
        {
            "image_path": "/path/to/image.jpg",
            "options": {...}
        }

    Request JSON (Option 2 - Base64):
        {
            "image_base64": "data:image/jpeg;base64,/9j/4AAQ...",
            "options": {...}
        }

    Response JSON:
        {
            "success": true,
            "text_lines": ["Line 1", "Line 2", ...],
            "full_text": "All text combined",
            "structured_data": [...],
            "image_info": {...}
        }
    """
    try:
        data = request.get_json()
        image_path = data.get('image_path')
        image_base64 = data.get('image_base64')
        options = data.get('options', {})

        # Initialize OCR if needed
        ocr_engine = initialize_ocr()

        # Handle base64 image
        if image_base64:
            import base64
            import io
            import numpy as np

            print("[INFO] Processing base64 image...")

            # Remove data URL prefix if present
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]

            # Decode base64
            image_bytes = base64.b64decode(image_base64)
            img = Image.open(io.BytesIO(image_bytes))

            # Resize if needed
            original_size = img.size
            width, height = img.size
            if width > 2000 or height > 2000:
                scale = 2000 / max(width, height)
                new_width = int(width * scale)
                new_height = int(height * scale)
                img = img.resize((new_width, new_height), Image.LANCZOS)
                print(f"  [RESIZE] {width}x{height} -> {new_width}x{new_height}")

            was_resized = img.size != original_size

            # Perform OCR
            print("  [OCR] Running OCR...")
            img_array = np.array(img)
            ocr_result = ocr_engine.ocr(img_array, cls=True)

        # Handle file path
        elif image_path:
            if not os.path.exists(image_path):
                return jsonify({'error': 'Image file not found'}), 404

            print(f"[INFO] Processing: {os.path.basename(image_path)}")
            img = resize_image_if_needed(image_path, max_size=2000)

            original_size = Image.open(image_path).size
            was_resized = img.size != original_size

            # Perform OCR - convert PIL Image to numpy array
            print("  [OCR] Running OCR...")
            import numpy as np
            img_array = np.array(img)
            ocr_result = ocr_engine.ocr(img_array, cls=True)

        else:
            return jsonify({'error': 'Either image_path or image_base64 is required'}), 400

        # Extract text
        text_lines = extract_text_from_ocr_result(ocr_result)
        full_text = '\n'.join(text_lines)

        print(f"  [OK] Extracted {len(text_lines)} text lines")

        # Try to print results, but don't crash if console encoding fails
        try:
            print("\n" + "="*50)
            print("[RESULT] OCR Recognition Results:")
            print("="*50)
            for i, line in enumerate(text_lines, 1):
                print(f"{i}. {line}")
            print("="*50 + "\n")
        except UnicodeEncodeError:
            print("[RESULT] OCR completed (console encoding doesn't support Chinese characters)")
            print(f"[RESULT] Extracted {len(text_lines)} lines - see JSON response for full text")

        # Build response
        response = {
            'success': True,
            'text_lines': text_lines,
            'full_text': full_text,
            'line_count': len(text_lines),
            'image_info': {
                'width': img.size[0],
                'height': img.size[1],
                'resized': was_resized
            }
        }

        # Include structured data if requested
        if options.get('extract_structured', False):
            structured_data = extract_structured_data(ocr_result)
            response['structured_data'] = structured_data

        return jsonify(response)

    except Exception as e:
        print(f"  [ERROR] OCR Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/ocr/batch', methods=['POST'])
def batch_process_ocr():
    """
    Process multiple images in batch

    Request JSON:
        {
            "image_paths": ["/path/1.jpg", "/path/2.jpg", ...],
            "options": {...}
        }

    Response JSON:
        {
            "results": [
                {"image_path": "...", "success": true, "text_lines": [...], ...},
                ...
            ],
            "summary": {
                "total": 10,
                "success": 9,
                "failed": 1
            }
        }
    """
    try:
        data = request.get_json()
        image_paths = data.get('image_paths', [])
        options = data.get('options', {})

        if not image_paths:
            return jsonify({'error': 'image_paths is required'}), 400

        # Initialize OCR
        ocr_engine = initialize_ocr()

        print(f"[BATCH] Processing {len(image_paths)} images...")

        results = []
        success_count = 0
        failed_count = 0

        for idx, image_path in enumerate(image_paths, 1):
            print(f"\n[{idx}/{len(image_paths)}] Processing: {os.path.basename(image_path)}")

            if not os.path.exists(image_path):
                results.append({
                    'image_path': image_path,
                    'success': False,
                    'error': 'File not found'
                })
                failed_count += 1
                continue

            try:
                # Process single image
                img = resize_image_if_needed(image_path, max_size=2000)
                import numpy as np
                img_array = np.array(img)
                ocr_result = ocr_engine.ocr(img_array, cls=True)

                text_lines = extract_text_from_ocr_result(ocr_result)
                full_text = '\n'.join(text_lines)

                result = {
                    'image_path': image_path,
                    'success': True,
                    'text_lines': text_lines,
                    'full_text': full_text,
                    'line_count': len(text_lines)
                }

                if options.get('extract_structured', False):
                    result['structured_data'] = extract_structured_data(ocr_result)

                results.append(result)
                success_count += 1
                print(f"  [OK] Extracted {len(text_lines)} lines")

            except Exception as e:
                results.append({
                    'image_path': image_path,
                    'success': False,
                    'error': str(e)
                })
                failed_count += 1
                print(f"  [ERROR] Error: {e}")

        print(f"\n[OK] Batch complete: {success_count} succeeded, {failed_count} failed")

        return jsonify({
            'results': results,
            'summary': {
                'total': len(image_paths),
                'success': success_count,
                'failed': failed_count
            }
        })

    except Exception as e:
        print(f"[ERROR] Batch processing error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("PaddleOCR Service for Medical System")
    print("=" * 60)
    print("\nFeatures:")
    print("  [OK] GPU Acceleration (if available)")
    print("  [OK] Chinese + English text recognition")
    print("  [OK] Auto image resizing (prevents GPU overflow)")
    print("  [OK] Confidence-based filtering")
    print("  [OK] Batch processing support")
    print("\nAPI Endpoints:")
    print("  GET  /health              - Health check & GPU status")
    print("  POST /ocr/process         - Process single image")
    print("  POST /ocr/batch           - Batch process multiple images")
    print("\n" + "=" * 60)

    # Pre-initialize OCR on startup
    initialize_ocr()

    print("\n[START] Starting server on http://localhost:5001")
    print("Press Ctrl+C to stop\n")

    app.run(host='0.0.0.0', port=5001, debug=False)
