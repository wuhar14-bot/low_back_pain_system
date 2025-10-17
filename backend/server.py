#!/usr/bin/env python3
"""
Simple Flask Backend Server for Medical System
Provides REST API endpoints to serve the SQLite database
"""

import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify, g
from flask_cors import CORS
import hashlib

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Database configuration
DATABASE = 'database/medical_data.db'

def get_db():
    """Get database connection"""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row  # Enable column access by name
    return db

@app.teardown_appcontext
def close_connection(exception):
    """Close database connection"""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    """Execute database query"""
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    """Execute database modification"""
    db = get_db()
    cur = db.execute(query, args)
    db.commit()
    return cur.lastrowid

# Authentication endpoints
@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400

        # Simple password hashing (use bcrypt in production)
        password_hash = hashlib.sha256(password.encode()).hexdigest()

        user = query_db(
            'SELECT * FROM users WHERE username = ? AND password_hash = ? AND is_active = 1',
            [username, password_hash], one=True
        )

        if user:
            return jsonify({
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'role': user['role'],
                    'full_name': user['full_name']
                },
                'token': 'simple_token_' + str(user['id'])  # Simplified token
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Patient endpoints
@app.route('/api/patients', methods=['GET'])
def get_patients():
    """Get all patients with optional filtering"""
    try:
        # Get query parameters
        workspace_id = request.args.get('workspace_id', 1)
        search_term = request.args.get('q', '')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        sort = request.args.get('sort', 'created_at')
        order = request.args.get('order', 'desc')

        offset = (page - 1) * limit

        # Build query
        where_conditions = ['p.workspace_id = ?']
        params = [workspace_id]

        if search_term:
            where_conditions.append('(p.study_id LIKE ? OR p.chief_complaint LIKE ? OR p.phone LIKE ?)')
            search_param = f'%{search_term}%'
            params.extend([search_param, search_param, search_param])

        where_clause = ' AND '.join(where_conditions)

        # Get patients with red flags
        query = f"""
            SELECT p.*,
                   w.name as workspace_name,
                   CASE WHEN (
                       rf.weight_loss = 1 OR rf.appetite_loss = 1 OR rf.fever = 1 OR
                       rf.night_pain = 1 OR rf.bladder_bowel_dysfunction = 1 OR
                       rf.saddle_numbness = 1 OR rf.bilateral_limb_weakness = 1 OR
                       rf.bilateral_sensory_abnormal = 1 OR rf.hand_clumsiness = 1 OR
                       rf.gait_abnormal = 1
                   ) THEN 1 ELSE 0 END as has_red_flags
            FROM patients p
            LEFT JOIN workspaces w ON p.workspace_id = w.id
            LEFT JOIN patient_red_flags rf ON p.id = rf.patient_id
            WHERE {where_clause}
            ORDER BY p.{sort} {order.upper()}
            LIMIT ? OFFSET ?
        """

        patients = query_db(query, params + [limit, offset])

        # Convert to list of dicts
        patients_list = []
        for patient in patients:
            patient_dict = dict(patient)
            patients_list.append(patient_dict)

        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM patients p WHERE {where_clause}"
        total = query_db(count_query, params, one=True)['total']

        return jsonify({
            'patients': patients_list,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Get single patient with full details"""
    try:
        # Get patient basic info
        patient = query_db(
            '''SELECT p.*, w.name as workspace_name, u.full_name as created_by_name
               FROM patients p
               LEFT JOIN workspaces w ON p.workspace_id = w.id
               LEFT JOIN users u ON p.created_by = u.id
               WHERE p.id = ?''',
            [patient_id], one=True
        )

        if not patient:
            return jsonify({'error': 'Patient not found'}), 404

        # Get red flags
        red_flags = query_db(
            'SELECT * FROM patient_red_flags WHERE patient_id = ?',
            [patient_id], one=True
        )

        # Get cervical function
        cervical_function = query_db(
            'SELECT * FROM patient_cervical_function WHERE patient_id = ?',
            [patient_id], one=True
        )

        # Get files
        files = query_db(
            '''SELECT pf.*, u.full_name as uploaded_by_name
               FROM patient_files pf
               LEFT JOIN users u ON pf.uploaded_by = u.id
               WHERE pf.patient_id = ?
               ORDER BY pf.created_at DESC''',
            [patient_id]
        )

        # Build response
        patient_dict = dict(patient)
        patient_dict['red_flags'] = dict(red_flags) if red_flags else {}
        patient_dict['cervical_function'] = dict(cervical_function) if cervical_function else {}
        patient_dict['files'] = [dict(f) for f in files]

        return jsonify(patient_dict)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/stats', methods=['GET'])
def get_patient_stats():
    """Get patient statistics for dashboard"""
    try:
        workspace_id = request.args.get('workspace_id', 1)

        # Total patients
        total = query_db(
            'SELECT COUNT(*) as count FROM patients WHERE workspace_id = ?',
            [workspace_id], one=True
        )['count']

        # High pain patients (score >= 7)
        high_pain = query_db(
            'SELECT COUNT(*) as count FROM patients WHERE workspace_id = ? AND pain_score >= 7',
            [workspace_id], one=True
        )['count']

        # Patients with red flags
        red_flags = query_db(
            '''SELECT COUNT(*) as count FROM patients p
               INNER JOIN patient_red_flags rf ON p.id = rf.patient_id
               WHERE p.workspace_id = ? AND (
                   rf.weight_loss = 1 OR rf.appetite_loss = 1 OR rf.fever = 1 OR
                   rf.night_pain = 1 OR rf.bladder_bowel_dysfunction = 1 OR
                   rf.saddle_numbness = 1 OR rf.bilateral_limb_weakness = 1 OR
                   rf.bilateral_sensory_abnormal = 1 OR rf.hand_clumsiness = 1 OR
                   rf.gait_abnormal = 1
               )''',
            [workspace_id], one=True
        )['count']

        # Average pain score
        avg_pain = query_db(
            'SELECT AVG(pain_score) as avg FROM patients WHERE workspace_id = ? AND pain_score IS NOT NULL',
            [workspace_id], one=True
        )
        avg_pain_score = round(avg_pain['avg'], 1) if avg_pain['avg'] else 0

        # Recent patients (last 24 hours)
        recent = query_db(
            '''SELECT COUNT(*) as count FROM patients
               WHERE workspace_id = ? AND created_at >= datetime('now', '-1 day')''',
            [workspace_id], one=True
        )['count']

        return jsonify({
            'total': total,
            'highPain': high_pain,
            'redFlags': red_flags,
            'avgPainScore': avg_pain_score,
            'recent24h': recent
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Workspace endpoints
@app.route('/api/workspaces', methods=['GET'])
def get_workspaces():
    """Get all workspaces"""
    try:
        workspaces = query_db(
            '''SELECT w.*, u.full_name as created_by_name,
                      (SELECT COUNT(*) FROM patients WHERE workspace_id = w.id) as patient_count
               FROM workspaces w
               LEFT JOIN users u ON w.created_by = u.id
               ORDER BY w.created_at DESC'''
        )

        return jsonify([dict(w) for w in workspaces])

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# System endpoints
@app.route('/api/system/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected'
    })

@app.route('/api/system/stats', methods=['GET'])
def system_stats():
    """Get system statistics"""
    try:
        stats = {}

        tables = ['users', 'workspaces', 'patients', 'patient_red_flags',
                 'patient_cervical_function', 'patient_files', 'activity_log']

        for table in tables:
            count = query_db(f'SELECT COUNT(*) as count FROM {table}', one=True)
            stats[table] = count['count']

        # Get database file size
        db_path = Path(DATABASE)
        db_size = db_path.stat().st_size if db_path.exists() else 0

        stats['database_size'] = db_size
        stats['timestamp'] = datetime.now().isoformat()

        return jsonify(stats)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Check if database exists
    if not os.path.exists(DATABASE):
        print("ERROR: Database not found. Please run database_setup.py first.")
        exit(1)

    print("Medical System Backend Server")
    print("=" * 40)
    print(f"Database: {DATABASE}")
    print("Server starting on http://localhost:3001")
    print("API endpoints available:")
    print("  POST /api/auth/login")
    print("  GET  /api/patients")
    print("  GET  /api/patients/<id>")
    print("  GET  /api/patients/stats")
    print("  GET  /api/workspaces")
    print("  GET  /api/system/health")
    print("  GET  /api/system/stats")
    print("\nDefault credentials:")
    print("  Admin: username=admin, password=admin123")
    print("  Doctor: username=doctor, password=doctor123")

    app.run(host='0.0.0.0', port=3001, debug=True)