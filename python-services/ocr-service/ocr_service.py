"""
Tesseract OCR Service for Medical System

This service provides OCR capabilities using Tesseract OCR engine.
Supports Chinese (Simplified & Traditional) and English text recognition.

Port: 5001
Endpoints:
  - GET  /health
  - POST /ocr/process

Author: Low Back Pain System
Date: 2025-11-26
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import cv2
import numpy as np
import base64
import io
import traceback

app = Flask(__name__)
CORS(app)

# ============================================================
# Tesseract OCR Initialization
# ============================================================

print("=" * 60)
print("Tesseract OCR Service for Medical System")
print("=" * 60)
print()
print("Features:")
print("  [OK] Chinese (Simplified & Traditional) text recognition")
print("  [OK] English text recognition")
print("  [OK] Image preprocessing for better accuracy")
print("  [OK] Confidence filtering")
print("  [OK] Base64 image support")
print()
print("API Endpoints:")
print("  GET  /health              - Health check")
print("  POST /ocr/process         - Process single image")
print()
print("=" * 60)

# Test Tesseract installation
try:
    tesseract_version = pytesseract.get_tesseract_version()
    print(f"Tesseract version: {tesseract_version}")
    print("[OK] Tesseract OCR initialized successfully")
except Exception as e:
    print(f"[ERROR] Tesseract initialization failed: {e}")

print("=" * 60)
print()

# ============================================================
# Helper Functions
# ============================================================

def preprocess_image(image):
    """
    Preprocess image for better OCR accuracy
    """
    # Convert to grayscale
    gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)

    # Apply thresholding
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Denoise
    denoised = cv2.fastNlMeansDenoising(binary, None, 10, 7, 21)

    return Image.fromarray(denoised)

def decode_base64_image(base64_string):
    """
    Decode base64 string to PIL Image
    """
    # Remove data URL prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]

    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))

    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')

    return image

# ============================================================
# API Endpoints
# ============================================================

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    try:
        version = pytesseract.get_tesseract_version()
        return jsonify({
            'status': 'healthy',
            'service': 'ocr',
            'engine': 'tesseract',
            'version': str(version),
            'languages': ['chi_sim', 'chi_tra', 'eng']
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/ocr/process', methods=['POST'])
def process_ocr():
    """
    Process single image for OCR

    Request body:
    {
        "image": "base64_encoded_image_string",
        "languages": ["chi_sim", "eng"],  // optional, default: chi_sim+eng
        "preprocess": true,                // optional, default: true
        "min_confidence": 0               // optional, default: 0 (no filtering)
    }

    Response:
    {
        "success": true,
        "text": "extracted text",
        "details": [
            {
                "text": "word",
                "confidence": 95.5,
                "box": [x, y, w, h]
            }
        ]
    }
    """
    try:
        data = request.get_json()

        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'No image data provided'
            }), 400

        # Decode image
        image = decode_base64_image(data['image'])

        # Get parameters
        languages = data.get('languages', ['chi_sim', 'eng'])
        preprocess = data.get('preprocess', True)
        min_confidence = data.get('min_confidence', 0)

        # Preprocess if requested
        if preprocess:
            image = preprocess_image(image)

        # Configure Tesseract
        lang_string = '+'.join(languages)
        custom_config = r'--oem 3 --psm 6'  # LSTM OCR Engine, Assume uniform block of text

        # Get detailed OCR data
        ocr_data = pytesseract.image_to_data(
            image,
            lang=lang_string,
            config=custom_config,
            output_type=pytesseract.Output.DICT
        )

        # Extract text with confidence filtering
        full_text = []
        details = []

        n_boxes = len(ocr_data['text'])
        for i in range(n_boxes):
            text = ocr_data['text'][i].strip()
            conf = float(ocr_data['conf'][i])

            if text and conf >= min_confidence:
                full_text.append(text)
                details.append({
                    'text': text,
                    'confidence': conf,
                    'box': [
                        int(ocr_data['left'][i]),
                        int(ocr_data['top'][i]),
                        int(ocr_data['width'][i]),
                        int(ocr_data['height'][i])
                    ]
                })

        # Get simple text extraction as fallback
        simple_text = pytesseract.image_to_string(
            image,
            lang=lang_string,
            config=custom_config
        ).strip()

        return jsonify({
            'success': True,
            'text': simple_text if simple_text else ' '.join(full_text),
            'details': details,
            'word_count': len(details),
            'languages_used': languages
        }), 200

    except Exception as e:
        print(f"[ERROR] OCR processing failed: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

# ============================================================
# Run Server
# ============================================================

if __name__ == '__main__':
    print()
    print("[START] Starting server on http://0.0.0.0:5001")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5001, debug=True)
