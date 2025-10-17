#!/usr/bin/env python3
"""
Local OCR Server using Tesseract
Provides OCR API for the low back pain system
"""

import os
import json
import tempfile
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from PIL import Image
import io
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Tesseract path
TESSERACT_CMD = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_medical_data(text):
    """Extract medical information from OCR text"""

    # Clean up text
    text = re.sub(r'\s+', ' ', text.strip())

    # Basic medical data structure
    medical_data = {
        "name": "",
        "age": None,
        "gender": "",
        "phone": "",
        "chief_complaint": "",
        "pain_location": "",
        "pain_nature": "",
        "pain_duration": "",
        "pain_score": None,
        "pain_triggers": [],
        "pain_relief": [],
        "history_present": "",
        "history_past": "",
        "physical_exam": {
            "posture": "",
            "range_of_motion": "",
            "straight_leg_raise": "",
            "neurological": ""
        },
        "imaging": "",
        "diagnosis": "",
        "treatment_plan": [],
        "medications": []
    }

    # Extract patterns (basic regex matching)
    # Name patterns
    name_patterns = [
        r'姓名[：:]\s*([^\s]+)',
        r'患者[：:]\s*([^\s]+)',
        r'病人[：:]\s*([^\s]+)'
    ]

    for pattern in name_patterns:
        match = re.search(pattern, text)
        if match:
            medical_data["name"] = match.group(1)
            break

    # Age patterns
    age_patterns = [
        r'年龄[：:]\s*(\d+)',
        r'(\d+)\s*岁',
        r'年龄\s*(\d+)'
    ]

    for pattern in age_patterns:
        match = re.search(pattern, text)
        if match:
            medical_data["age"] = int(match.group(1))
            break

    # Gender patterns
    if '男' in text and '女' not in text:
        medical_data["gender"] = "男"
    elif '女' in text and '男' not in text:
        medical_data["gender"] = "女"

    # Phone patterns
    phone_match = re.search(r'电话[：:]?\s*(1[3-9]\d{9})', text)
    if not phone_match:
        phone_match = re.search(r'(1[3-9]\d{9})', text)
    if phone_match:
        phone = phone_match.group(1)
        medical_data["phone"] = phone[:3] + "****" + phone[7:]

    # Chief complaint patterns
    complaint_patterns = [
        r'主诉[：:]\s*([^。！？\n]+)',
        r'症状[：:]\s*([^。！？\n]+)',
        r'不适[：:]\s*([^。！？\n]+)'
    ]

    for pattern in complaint_patterns:
        match = re.search(pattern, text)
        if match:
            medical_data["chief_complaint"] = match.group(1).strip()
            break

    # Pain-related information
    if '腰痛' in text or '腰部' in text:
        medical_data["pain_location"] = "腰部"
        medical_data["chief_complaint"] = medical_data["chief_complaint"] or "腰痛"

    if '疼痛' in text or '痛' in text:
        if '钝痛' in text:
            medical_data["pain_nature"] = "钝痛"
        elif '刺痛' in text:
            medical_data["pain_nature"] = "刺痛"
        elif '胀痛' in text:
            medical_data["pain_nature"] = "胀痛"

    # Duration patterns
    duration_patterns = [
        r'(\d+)\s*个?月',
        r'(\d+)\s*周',
        r'(\d+)\s*天'
    ]

    for pattern in duration_patterns:
        match = re.search(pattern, text)
        if match:
            unit = "个月" if "月" in match.group(0) else ("周" if "周" in match.group(0) else "天")
            medical_data["pain_duration"] = f"{match.group(1)}{unit}"
            break

    # If no specific medical data found, put raw text in history
    if not any([medical_data["name"], medical_data["age"], medical_data["chief_complaint"]]):
        medical_data["history_present"] = text[:200] + "..." if len(text) > 200 else text

    return medical_data

@app.route('/ocr', methods=['POST'])
def process_ocr():
    """Process OCR request"""
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400

        # Decode base64 image
        image_data = data['image']
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]

        image_bytes = base64.b64decode(image_data)

        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            temp_file.write(image_bytes)
            temp_file_path = temp_file.name

        try:
            # Run Tesseract OCR
            cmd = [
                TESSERACT_CMD,
                temp_file_path,
                'stdout',
                '-l', 'chi_sim+eng',
                '--psm', '6'
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                encoding='utf-8',
                check=True
            )

            ocr_text = result.stdout.strip()

            # Extract medical data from OCR text
            medical_data = extract_medical_data(ocr_text)

            # Format response similar to base44 API
            response = {
                "success": True,
                "response": json.dumps(medical_data, ensure_ascii=False, indent=2),
                "raw_text": ocr_text,
                "model_used": "tesseract-local",
                "tokens_used": len(ocr_text.split())
            }

            return jsonify(response)

        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except:
                pass

    except subprocess.CalledProcessError as e:
        return jsonify({
            "success": False,
            "error": f"OCR processing failed: {e.stderr}"
        }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "tesseract_available": os.path.exists(TESSERACT_CMD)
    })

if __name__ == '__main__':
    print("Starting Local OCR Server...")
    print(f"Tesseract path: {TESSERACT_CMD}")
    print(f"Tesseract available: {os.path.exists(TESSERACT_CMD)}")
    print("Server running on http://localhost:3001")
    print("Press Ctrl+C to stop")

    app.run(host='localhost', port=3001, debug=True)