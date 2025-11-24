#!/usr/bin/env python3
import requests
import base64
import json
import os

# Disable proxy for local testing
os.environ['NO_PROXY'] = 'localhost,127.0.0.1'

def test_ocr_with_image(image_path):
    with open(image_path, 'rb') as img_file:
        image_data = base64.b64encode(img_file.read()).decode('utf-8')
        image_data_url = f"data:image/jpeg;base64,{image_data}"

    payload = {"image": image_data_url}

    try:
        # Explicitly disable proxies
        response = requests.post('http://localhost:3001/ocr',
                               headers={'Content-Type': 'application/json'},
                               json=payload,
                               timeout=30,
                               proxies={'http': None, 'https': None})

        if response.status_code == 200:
            result = response.json()
            print("SUCCESS: OCR processing completed")
            print(f"Model used: {result.get('model_used', 'unknown')}")
            print(f"Tokens used: {result.get('tokens_used', 'unknown')}")

            raw_text = result.get('raw_text', '')
            if raw_text:
                print(f"Raw text length: {len(raw_text)}")
                print(f"Preview (first 300 chars):")
                print(repr(raw_text[:300]))

            if result.get('response'):
                try:
                    medical_data = json.loads(result['response'])
                    print("\nExtracted medical data:")
                    for key, value in medical_data.items():
                        if value and value != "":
                            print(f"  {key}: {repr(value)}")
                except json.JSONDecodeError:
                    print("Failed to parse medical data JSON")

        else:
            print(f"ERROR: OCR API returned status {response.status_code}")
            print(f"Response: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

if __name__ == '__main__':
    test_image = r"E:\claude-code\images\sunlogin_202508151656180401.jpg"
    print(f"Testing OCR with image: {test_image}")
    test_ocr_with_image(test_image)