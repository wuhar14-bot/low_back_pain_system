#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple test to check what OCR actually outputs
"""

import sys
import io

# Force UTF-8 encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Test data to simulate OCR result
test_text_lines = [
    "姓名：张三",
    "年龄：26岁",
    "性别：女",
    "主诉：腰痛3个月"
]

print("\n" + "="*50)
print("📝 OCR识别结果测试:")
print("="*50)
for i, line in enumerate(test_text_lines, 1):
    print(f"{i}. {line}")
print("="*50 + "\n")

# Test pattern matching
import re

full_text = '\n'.join(test_text_lines)
print("完整文本:")
print(full_text)
print()

# Test patterns
print("正则表达式匹配测试:")
print("-" * 50)

# Age
age_match = re.search(r'年龄[：:]\s*(\d+)|(\d+)\s*岁', full_text)
print(f"年龄匹配: {age_match.group(1) or age_match.group(2) if age_match else 'None'}")

# Gender
gender_match = re.search(r'性别[：:]\s*(男|女)', full_text)
print(f"性别匹配: {gender_match.group(1) if gender_match else 'None'}")

# Name
name_match = re.search(r'姓名[：:]\s*([^\s\n]+)', full_text)
print(f"姓名匹配: {name_match.group(1) if name_match else 'None'}")

# Chief complaint
chief_complaint_match = re.search(r'主诉[：:]\s*([^\n]+)', full_text)
print(f"主诉匹配: {chief_complaint_match.group(1) if chief_complaint_match else 'None'}")

print("-" * 50)
