#!/usr/bin/env python3
"""
Test script for local OCR API
"""

import requests
import base64
import json

def test_ocr_with_image(image_path):
    """Test OCR API with a specific image"""

    # Read and encode image
    with open(image_path, 'rb') as img_file:
        image_data = base64.b64encode(img_file.read()).decode('utf-8')
        image_data_url = f"data:image/jpeg;base64,{image_data}"

    # Prepare request
    payload = {
        "image": image_data_url
    }

    try:
        # Call local OCR API
        response = requests.post('http://localhost:3001/ocr',
                               headers={'Content-Type': 'application/json'},
                               json=payload,
                               timeout=30)

        if response.status_code == 200:
            result = response.json()
            print(f"✅ OCR处理成功")
            print(f"模型: {result.get('model_used', 'unknown')}")
            print(f"令牌数: {result.get('tokens_used', 'unknown')}")
            print(f"原始文本长度: {len(result.get('raw_text', ''))}")

            # Print first 200 characters of raw text
            raw_text = result.get('raw_text', '')
            if raw_text:
                print(f"原始文本预览: {raw_text[:200]}...")

            # Try to parse extracted medical data
            if result.get('response'):
                try:
                    medical_data = json.loads(result['response'])
                    print(f"提取到的医疗数据:")
                    for key, value in medical_data.items():
                        if value and value != "":
                            print(f"  {key}: {value}")
                except json.JSONDecodeError:
                    print("无法解析医疗数据JSON")

        else:
            print(f"❌ OCR API错误: {response.status_code}")
            print(f"错误信息: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"❌ 请求失败: {e}")

if __name__ == '__main__':
    # Test with the sunlogin image that user mentioned
    test_image = r"E:\claude-code\images\sunlogin_202508151656180401.jpg"
    print(f"测试图片: {test_image}")
    test_ocr_with_image(test_image)

    print("\n" + "="*60 + "\n")

    # Test with the copy version too
    test_image2 = r"E:\claude-code\images\sunlogin_202508151656180401 - 副本.jpg"
    print(f"测试图片: {test_image2}")
    test_ocr_with_image(test_image2)