"""
SQLite Database Service for Low Back Pain System

This service provides a real database backend for patient data storage.
Replaces mock/localStorage with persistent SQLite database.

Port: 5003
Endpoints:
  - GET  /health
  - GET  /api/patients
  - POST /api/patients
  - GET  /api/patients/<id>
  - PUT  /api/patients/<id>
  - DELETE /api/patients/<id>

Author: Low Back Pain System
Date: 2025-10-17
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime
import sys

app = Flask(__name__)
CORS(app)

# Database configuration
DB_PATH = os.path.join(os.path.dirname(__file__), 'low_back_pain.db')

print("=" * 60)
print("SQLite Database Service for Low Back Pain System")
print("=" * 60)
print()

# ============================================================
# Database Initialization
# ============================================================

def init_database():
    """Initialize SQLite database with patients table"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Create patients table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS patients (
                id TEXT PRIMARY KEY,
                study_id TEXT,
                name TEXT,
                gender TEXT,
                age INTEGER,
                phone TEXT,
                onset_date TEXT,
                chief_complaint TEXT,
                medical_history TEXT,
                pain_areas TEXT,
                subjective_exam TEXT,
                objective_exam TEXT,
                functional_scores TEXT,
                intervention TEXT,
                ai_posture_analysis TEXT,
                remarks TEXT,
                created_date TEXT NOT NULL,
                last_sync_timestamp TEXT,
                workspace_id TEXT,
                data_json TEXT
            )
        ''')

        conn.commit()
        conn.close()

        print("[OK] Database initialized successfully")
        print(f"    - Database path: {DB_PATH}")
        print()

    except Exception as e:
        print(f"[ERROR] Failed to initialize database: {str(e)}")
        sys.exit(1)

# Initialize database on startup
init_database()

# ============================================================
# Helper Functions
# ============================================================

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

def row_to_dict(row):
    """Convert SQLite row to dictionary"""
    if row is None:
        return None
    return dict(row)

# ============================================================
# API Endpoints
# ============================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as count FROM patients')
        result = cursor.fetchone()
        conn.close()

        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'total_patients': result['count'],
            'db_path': DB_PATH
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/api/patients', methods=['GET'])
def list_patients():
    """List all patients"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get sort order from query params
        sort_order = request.args.get('sort', '-created_date')

        if sort_order == '-created_date':
            order_sql = 'ORDER BY created_date DESC'
        else:
            order_sql = 'ORDER BY created_date ASC'

        cursor.execute(f'SELECT * FROM patients {order_sql}')
        rows = cursor.fetchall()
        conn.close()

        patients = [row_to_dict(row) for row in rows]

        # Parse JSON fields
        for patient in patients:
            if patient.get('data_json'):
                try:
                    extra_data = json.loads(patient['data_json'])
                    patient.update(extra_data)
                except:
                    pass

        return jsonify(patients)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Get single patient by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM patients WHERE id = ?', (patient_id,))
        row = cursor.fetchone()
        conn.close()

        if row is None:
            return jsonify({'error': 'Patient not found'}), 404

        patient = row_to_dict(row)

        # Parse JSON data
        if patient.get('data_json'):
            try:
                extra_data = json.loads(patient['data_json'])
                patient.update(extra_data)
            except:
                pass

        return jsonify(patient)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients', methods=['POST'])
def create_patient():
    """Create new patient"""
    try:
        data = request.json

        # Generate ID if not provided
        patient_id = data.get('id', f"patient-{int(datetime.now().timestamp() * 1000)}")
        created_date = data.get('created_date', datetime.now().isoformat())
        last_sync = datetime.now().isoformat()

        # Extract main fields
        main_fields = {
            'id': patient_id,
            'study_id': data.get('study_id'),
            'name': data.get('name'),
            'gender': data.get('gender'),
            'age': data.get('age'),
            'phone': data.get('phone'),
            'onset_date': data.get('onset_date'),
            'chief_complaint': data.get('chief_complaint'),
            'medical_history': data.get('medical_history'),
            'pain_areas': json.dumps(data.get('pain_areas', [])) if isinstance(data.get('pain_areas'), list) else data.get('pain_areas'),
            'subjective_exam': data.get('subjective_exam'),
            'objective_exam': data.get('objective_exam'),
            'functional_scores': json.dumps(data.get('functional_scores', {})) if isinstance(data.get('functional_scores'), dict) else data.get('functional_scores'),
            'intervention': data.get('intervention'),
            'ai_posture_analysis': json.dumps(data.get('ai_posture_analysis', {})) if isinstance(data.get('ai_posture_analysis'), dict) else data.get('ai_posture_analysis'),
            'remarks': data.get('remarks'),
            'created_date': created_date,
            'last_sync_timestamp': last_sync,
            'workspace_id': data.get('workspace_id'),
            'data_json': json.dumps(data)  # Store complete data as JSON
        }

        conn = get_db_connection()
        cursor = conn.cursor()

        placeholders = ', '.join(['?' for _ in main_fields])
        columns = ', '.join(main_fields.keys())

        cursor.execute(
            f'INSERT INTO patients ({columns}) VALUES ({placeholders})',
            tuple(main_fields.values())
        )

        conn.commit()
        conn.close()

        print(f"✅ Created patient: {patient_id} (Study ID: {data.get('study_id', 'N/A')})")

        return jsonify({**data, 'id': patient_id, 'created_date': created_date, 'last_sync_timestamp': last_sync}), 201

    except Exception as e:
        print(f"❌ Error creating patient: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<patient_id>', methods=['PUT'])
def update_patient(patient_id):
    """Update existing patient"""
    try:
        data = request.json
        last_sync = datetime.now().isoformat()

        # Get existing patient
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM patients WHERE id = ?', (patient_id,))
        existing = cursor.fetchone()

        if existing is None:
            conn.close()
            return jsonify({'error': 'Patient not found'}), 404

        # Merge with existing data
        existing_dict = row_to_dict(existing)
        if existing_dict.get('data_json'):
            try:
                existing_data = json.loads(existing_dict['data_json'])
                merged_data = {**existing_data, **data}
            except:
                merged_data = data
        else:
            merged_data = data

        # Update fields
        update_fields = {
            'study_id': merged_data.get('study_id'),
            'name': merged_data.get('name'),
            'gender': merged_data.get('gender'),
            'age': merged_data.get('age'),
            'phone': merged_data.get('phone'),
            'onset_date': merged_data.get('onset_date'),
            'chief_complaint': merged_data.get('chief_complaint'),
            'medical_history': merged_data.get('medical_history'),
            'pain_areas': json.dumps(merged_data.get('pain_areas', [])) if isinstance(merged_data.get('pain_areas'), list) else merged_data.get('pain_areas'),
            'subjective_exam': merged_data.get('subjective_exam'),
            'objective_exam': merged_data.get('objective_exam'),
            'functional_scores': json.dumps(merged_data.get('functional_scores', {})) if isinstance(merged_data.get('functional_scores'), dict) else merged_data.get('functional_scores'),
            'intervention': merged_data.get('intervention'),
            'ai_posture_analysis': json.dumps(merged_data.get('ai_posture_analysis', {})) if isinstance(merged_data.get('ai_posture_analysis'), dict) else merged_data.get('ai_posture_analysis'),
            'remarks': merged_data.get('remarks'),
            'last_sync_timestamp': last_sync,
            'data_json': json.dumps(merged_data)
        }

        set_clause = ', '.join([f'{key} = ?' for key in update_fields.keys()])
        cursor.execute(
            f'UPDATE patients SET {set_clause} WHERE id = ?',
            (*update_fields.values(), patient_id)
        )

        conn.commit()
        conn.close()

        print(f"✅ Updated patient: {patient_id}")

        return jsonify({**merged_data, 'id': patient_id, 'last_sync_timestamp': last_sync})

    except Exception as e:
        print(f"❌ Error updating patient: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    """Delete patient"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if exists
        cursor.execute('SELECT * FROM patients WHERE id = ?', (patient_id,))
        existing = cursor.fetchone()

        if existing is None:
            conn.close()
            return jsonify({'error': 'Patient not found'}), 404

        cursor.execute('DELETE FROM patients WHERE id = ?', (patient_id,))
        conn.commit()
        conn.close()

        print(f"✅ Deleted patient: {patient_id}")

        return jsonify(row_to_dict(existing))

    except Exception as e:
        print(f"❌ Error deleting patient: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============================================================
# Run Server
# ============================================================

if __name__ == '__main__':
    print("[START] Starting database server on http://localhost:5003")
    print("=" * 60)
    print()

    app.run(
        host='0.0.0.0',
        port=5003,
        debug=False
    )
