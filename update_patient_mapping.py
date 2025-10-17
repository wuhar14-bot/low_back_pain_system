#!/usr/bin/env python3
"""
Patient ID Mapping Updater
Automatically updates the CSV mapping file when new patients are added
"""

import json
import csv
import os
from datetime import datetime

def get_next_study_id():
    """Generate the next available study ID"""
    csv_file = 'patient_id_mapping.csv'

    if not os.path.exists(csv_file):
        return 'LBP-001'

    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        study_ids = [row[0] for row in reader if row]

    if not study_ids:
        return 'LBP-001'

    # Extract numbers and find the highest
    numbers = []
    for study_id in study_ids:
        if study_id.startswith('LBP-'):
            try:
                num = int(study_id[4:])
                numbers.append(num)
            except ValueError:
                continue

    if numbers:
        next_num = max(numbers) + 1
        return f'LBP-{next_num:03d}'

    return 'LBP-001'

def update_mapping_file(study_id, patient_name, phone):
    """Add new patient to mapping file"""
    csv_file = 'patient_id_mapping.csv'

    # Create file if it doesn't exist
    if not os.path.exists(csv_file):
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['study_id', 'patient_name', 'phone'])

    # Append new patient
    with open(csv_file, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([study_id, patient_name, phone])

    print(f"Added to mapping: {study_id} -> {patient_name}")

def sync_all_patients():
    """Sync all patients from generated_patients.json to CSV"""
    json_file = 'generated_patients.json'
    csv_file = 'patient_id_mapping.csv'

    if not os.path.exists(json_file):
        print("No patient data file found")
        return

    with open(json_file, 'r', encoding='utf-8') as f:
        patients = json.load(f)

    # Create fresh CSV file
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['study_id', 'patient_name', 'phone'])

        for patient in patients:
            writer.writerow([
                patient['study_id'],
                patient['name'],
                patient['phone']
            ])

    print(f"Updated mapping file with {len(patients)} patients")

if __name__ == "__main__":
    import sys

    if len(sys.argv) == 1:
        # Default: sync all patients
        sync_all_patients()
    elif len(sys.argv) == 2 and sys.argv[1] == '--next-id':
        # Get next study ID
        print(get_next_study_id())
    elif len(sys.argv) == 4:
        # Add specific patient: study_id, name, phone
        study_id, name, phone = sys.argv[1], sys.argv[2], sys.argv[3]
        update_mapping_file(study_id, name, phone)
    else:
        print("Usage:")
        print("  python update_patient_mapping.py                    # Sync all patients")
        print("  python update_patient_mapping.py --next-id          # Get next study ID")
        print("  python update_patient_mapping.py <id> <name> <phone> # Add patient")