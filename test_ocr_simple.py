#!/usr/bin/env python3
import requests
import base64
import json

def test_ocr_with_image(image_path):
    # Read and encode image
    with open(image_path, 'rb') as img_file:
        image_data = base64.b64encode(img_file.read()).decode('utf-8')
        image_data_url = f"data:image/jpeg;base64,{image_data}"

    payload = {"image": image_data_url}

    try:
        response = requests.post('http://localhost:3001/ocr',
                               headers={'Content-Type': 'application/json'},
                               json=payload,
                               timeout=30)

        if response.status_code == 200:
            result = response.json()
            print("OCR SUCCESS")
            print(f"Model: {result.get('model_used', 'unknown')}")
            print(f"Tokens: {result.get('tokens_used', 'unknown')}")

            raw_text = result.get('raw_text', '')
            if raw_text:
                print(f"Raw text length: {len(raw_text)}")
                print(f"First 300 chars: {raw_text[:300]}...")

            if result.get('response'):
                try:
                    medical_data = json.loads(result['response'])
                    print("Medical data extracted:")
                    for key, value in medical_data.items():
                        if value and value != "":
                            print(f"  {key}: {value}")
                except json.JSONDecodeError:
                    print("Could not parse medical data JSON")

        else:
            print(f"OCR API ERROR: {response.status_code}")
            print(f"Error: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

if __name__ == '__main__':
    test_image = r"E:\claude-code\images\sunlogin_202508151656180401.jpg"
    print(f"Testing image: {test_image}")
    test_ocr_with_image(test_image)