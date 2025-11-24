#!/usr/bin/env python3
"""
Generate 143 realistic patients for the low back pain clinical system
"""

import json
import random
from datetime import datetime, timedelta
import uuid

# Chinese surnames and given names
SURNAMES = [
    "李", "王", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高",
    "林", "何", "郭", "马", "罗", "梁", "宋", "郑", "谢", "韩", "唐", "冯", "于", "董", "萧",
    "程", "曹", "袁", "邓", "许", "傅", "沈", "曾", "彭", "吕", "苏", "卢", "蒋", "蔡", "贾",
    "丁", "魏", "薛", "叶", "阎", "余", "潘", "杜", "戴", "夏", "钟", "汪", "田", "任", "姜"
]

MALE_NAMES = [
    "伟", "强", "明", "军", "建", "华", "志", "峰", "勇", "杰", "涛", "超", "辉", "鹏", "磊",
    "刚", "龙", "文", "斌", "俊", "豪", "宇", "凯", "飞", "健", "东", "炜", "宏", "力", "威",
    "博", "雄", "浩", "昊", "阳", "晨", "轩", "泽", "睿", "宸", "翔", "烨", "琛", "煜", "晖"
]

FEMALE_NAMES = [
    "丽", "娟", "敏", "静", "慧", "燕", "红", "霞", "玲", "芳", "艳", "梅", "莹", "雪", "琳",
    "萍", "倩", "婷", "蕾", "洁", "雯", "欣", "颖", "瑶", "怡", "妍", "佳", "嘉", "思", "琪",
    "涵", "晴", "悦", "薇", "诗", "语", "心", "月", "华", "君", "馨", "韵", "晶", "妮", "娜"
]

# Low back pain specific chief complaints - ALL contain "腰痛"
CHIEF_COMPLAINTS = [
    "腰痛3个月", "腰痛伴左腿放射痛", "腰痛2周", "慢性腰痛6个月", "腰痛伴腰椎间盘突出",
    "腰痛伴腰骶部不适1月", "腰痛伴晨僵", "腰痛伴活动受限", "腰痛伴双下肢放射痛", "腰痛伴腰椎管狭窄",
    "腰痛反复发作2年", "腰痛伴外伤史3天", "腰痛伴腰椎滑脱", "腰痛伴肌筋膜炎", "腰痛伴坐骨神经痛",
    "腰痛伴腰椎退行性变", "腰痛伴腰部僵硬", "腰痛伴间歇性跛行", "腰痛伴小关节紊乱", "腰痛伴臀部放射痛",
    "急性腰痛1周", "亚急性腰痛4周", "慢性腰痛8个月", "腰痛伴左侧坐骨神经痛", "腰痛伴右下肢放射痛",
    "机械性腰痛", "非特异性腰痛", "腰痛伴活动障碍", "腰痛伴肌痉挛", "腰痛夜间加重",
    "腰痛伴臀部疼痛", "腰痛伴下肢麻木", "腰痛伴弯腰受限", "腰痛伴翻身困难", "腰痛持续性疼痛"
]

PAIN_TYPES = ["机械性", "炎症性"]
HISTORY_TYPES = ["首次发作", "复发"]
CONDITION_PROGRESS = ["改善", "恶化", "稳定", "波动"]

AGGRAVATING_FACTORS = [
    "久坐", "弯腰", "咳嗽", "负重", "活动", "寒冷", "久站", "翻身", "行走", "上楼梯"
]

RELIEVING_FACTORS = [
    "休息", "热敷", "按摩", "理疗", "卧床", "药物", "针灸", "牵引", "温水浴", "改变体位"
]

MEDICATIONS = [
    "布洛芬 200mg 每日2次", "塞来昔布 200mg 每日1次", "双氯芬酸钠 75mg 每日2次",
    "美洛昔康 15mg 每日1次", "氨糖美辛肠溶片", "复方氯唑沙宗胶囊", "甲钴胺片",
    "维生素B1片", "舒筋活血片", "骨刺消痛胶囊", "腰痛宁胶囊", "独一味胶囊"
]

CERVICAL_POSTURES = ["颈椎前凸过度", "正常曲度", "颈椎前凸消失", "颈椎后凸"]
LUMBAR_POSTURES = ["腰椎前凸过度", "正常曲度", "腰椎曲度变平", "腰椎后凸"]

def generate_chinese_name():
    """Generate a realistic Chinese name"""
    surname = random.choice(SURNAMES)
    if random.choice([True, False]):  # Male
        given_name = random.choice(MALE_NAMES)
        if random.random() < 0.3:  # 30% chance of two-character given name
            given_name += random.choice(MALE_NAMES)
        gender = "男"
    else:  # Female
        given_name = random.choice(FEMALE_NAMES)
        if random.random() < 0.3:  # 30% chance of two-character given name
            given_name += random.choice(FEMALE_NAMES)
        gender = "女"

    return surname + given_name, gender

def generate_phone():
    """Generate a realistic Chinese phone number with masking"""
    prefixes = ["138", "139", "150", "151", "152", "157", "158", "159", "182", "183", "184", "187", "188"]
    prefix = random.choice(prefixes)
    suffix = f"{random.randint(1000, 9999):04d}{random.randint(1000, 9999):04d}"
    # Mask middle digits
    return f"{prefix}****{suffix[4:]}"

def generate_study_id(index):
    """Generate study ID"""
    return f"LBP-{index:03d}"

def generate_date_in_range(days_ago_min=1, days_ago_max=365):
    """Generate a date within the specified range"""
    days_ago = random.randint(days_ago_min, days_ago_max)
    return (datetime.now() - timedelta(days=days_ago)).isoformat()

def generate_realistic_patient(index):
    """Generate a single realistic patient record"""
    name, gender = generate_chinese_name()
    age = random.randint(18, 65)

    # Generate correlated medical data
    pain_score = random.randint(3, 10)
    rmdq_score = min(24, max(0, pain_score * 2 + random.randint(-3, 3)))
    ndi_score = min(100, max(0, pain_score * 5 + random.randint(-10, 10)))

    # Generate red flags (boolean values)
    red_flags = {
        "weight_loss": random.random() < 0.05,
        "appetite_loss": random.random() < 0.08,
        "fever": random.random() < 0.03,
        "night_pain": random.random() < 0.15,
        "bladder_bowel_dysfunction": random.random() < 0.02,
        "saddle_numbness": random.random() < 0.03,
        "bilateral_limb_weakness": random.random() < 0.05,
        "bilateral_sensory_abnormal": random.random() < 0.07,
        "hand_clumsiness": random.random() < 0.08,
        "gait_abnormal": random.random() < 0.12
    }

    # Generate cervical function problems
    cervical_function_problems = {
        "dropping_objects": random.random() < 0.10,
        "difficulty_picking_small_items": random.random() < 0.12,
        "writing_difficulty": random.random() < 0.08,
        "phone_usage_difficulty": random.random() < 0.06,
        "buttoning_difficulty": random.random() < 0.09,
        "chopstick_usage_difficulty": random.random() < 0.07
    }

    patient = {
        "id": f"patient-{index}",
        "workspace_id": "workspace-1",
        "name": name,
        "study_id": generate_study_id(index),
        "age": age,
        "gender": gender,
        "phone": generate_phone(),
        "chief_complaint": random.choice(CHIEF_COMPLAINTS),
        "history_type": random.choice(HISTORY_TYPES),
        "first_onset_date": generate_date_in_range(30, 730),  # 1 month to 2 years ago
        "pain_type": random.choice(PAIN_TYPES),
        "aggravating_factors": random.choice(AGGRAVATING_FACTORS),
        "relieving_factors": random.choice(RELIEVING_FACTORS),
        "has_radiation": random.random() < 0.4,
        "radiation_location": "左下肢" if random.random() < 0.6 else "右下肢" if random.random() < 0.5 else "双下肢",
        "previous_treatment": f"口服{random.choice(['止痛药', '消炎药', '肌松药'])}、{random.choice(['理疗', '针灸', '推拿', '牵引'])}治疗",
        "condition_progress": random.choice(CONDITION_PROGRESS),
        "pain_score": pain_score,
        "sitting_tolerance": random.randint(15, 120),
        "standing_tolerance": random.randint(20, 180),
        "walking_tolerance": random.randint(10, 60),
        "assistive_tools": "无" if random.random() < 0.7 else random.choice(["拐杖", "助行器", "腰围"]),
        "claudication_distance": f"{random.randint(50, 500)}米" if random.random() < 0.2 else "无",
        "cervical_posture": random.choice(CERVICAL_POSTURES),
        "lumbar_posture": random.choice(LUMBAR_POSTURES),
        "distal_pulse": "存在" if random.random() < 0.95 else "不存在",
        "rmdq_score": rmdq_score,
        "ndi_score": ndi_score,
        "medication_details": random.choice(MEDICATIONS),
        "red_flags": red_flags,
        "cervical_function_problems": cervical_function_problems,
        "created_date": generate_date_in_range(1, 90),  # Last 3 months
        "remarks": f"患者{name}，{age}岁，{gender}性，主诉下腰痛。" +
                  ("病程较长，腰痛症状反复发作。" if random.random() < 0.3 else "腰痛症状典型，诊断明确。" if random.random() < 0.5 else "腰痛需要进一步观察治疗效果。")
    }

    # Add radiation location only if has_radiation is True
    if not patient["has_radiation"]:
        patient["radiation_location"] = ""

    return patient

def generate_all_patients():
    """Generate 143 realistic patients"""
    print("Generating 143 realistic patients...")
    patients = []

    for i in range(1, 144):  # 1 to 143
        patient = generate_realistic_patient(i)
        patients.append(patient)
        if i % 10 == 0:
            print(f"Generated {i} patients...")

    return patients

def update_entities_file(patients):
    """Update the entities.js file with new patient data"""
    # Read the current entities file
    with open(r"E:\claude-code\low back pain system\src\api\entities.js", 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the mockPatients array and replace it
    start_marker = "const mockPatients = ["
    end_marker = "];"

    start_index = content.find(start_marker)
    if start_index == -1:
        print("Error: Could not find mockPatients array in entities.js")
        return False

    # Find the end of the array
    bracket_count = 0
    current_index = start_index + len(start_marker) - 1  # Start from the opening bracket

    while current_index < len(content):
        if content[current_index] == '[':
            bracket_count += 1
        elif content[current_index] == ']':
            bracket_count -= 1
            if bracket_count == 0:
                end_index = current_index + 1
                break
        current_index += 1
    else:
        print("Error: Could not find end of mockPatients array")
        return False

    # Generate the new patients array as JavaScript
    patients_js = "const mockPatients = [\n"
    for i, patient in enumerate(patients):
        patients_js += "  {\n"
        for key, value in patient.items():
            if isinstance(value, str):
                patients_js += f'    {key}: "{value}",\n'
            elif isinstance(value, bool):
                patients_js += f'    {key}: {str(value).lower()},\n'
            elif isinstance(value, dict):
                patients_js += f'    {key}: {{\n'
                for sub_key, sub_value in value.items():
                    if isinstance(sub_value, bool):
                        patients_js += f'      {sub_key}: {str(sub_value).lower()},\n'
                    else:
                        patients_js += f'      {sub_key}: "{sub_value}",\n'
                patients_js += '    },\n'
            elif value is None:
                patients_js += f'    {key}: null,\n'
            else:
                patients_js += f'    {key}: {value},\n'
        patients_js += "  }" + ("," if i < len(patients) - 1 else "") + "\n"
    patients_js += "];"

    # Replace the old array with the new one
    new_content = content[:start_index] + patients_js + content[end_index:]

    # Write back to file
    with open(r"E:\claude-code\low back pain system\src\api\entities.js", 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Successfully updated entities.js with {len(patients)} patients")
    return True

if __name__ == '__main__':
    # Generate patients
    patients = generate_all_patients()

    # Save to JSON file for backup
    with open(r"E:\claude-code\low back pain system\generated_patients.json", 'w', encoding='utf-8') as f:
        json.dump(patients, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(patients)} patients to generated_patients.json")

    # Update the entities.js file
    if update_entities_file(patients):
        print("✅ Successfully generated 143 realistic patients!")
        print("📊 Patient statistics:")
        print(f"   - Total patients: {len(patients)}")
        print(f"   - Male: {sum(1 for p in patients if p['gender'] == '男')}")
        print(f"   - Female: {sum(1 for p in patients if p['gender'] == '女')}")
        print(f"   - Average age: {sum(p['age'] for p in patients) / len(patients):.1f}")
        print(f"   - Average pain score: {sum(p['pain_score'] for p in patients) / len(patients):.1f}")
        print("🌐 You can now view all patients at: http://localhost:5182")
    else:
        print("❌ Failed to update entities.js file")