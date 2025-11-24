#!/usr/bin/env python3
"""
Database Setup for Medical System
Creates SQLite database with all necessary tables and imports patient data
"""

import sqlite3
import json
import os
import sys
import hashlib
from datetime import datetime
from pathlib import Path

class MedicalDatabase:
    def __init__(self, db_path="database/medical_data.db"):
        self.db_path = db_path
        self.ensure_db_directory()

    def ensure_db_directory(self):
        """Create database directory if it doesn't exist"""
        db_dir = Path(self.db_path).parent
        db_dir.mkdir(parents=True, exist_ok=True)

    def create_connection(self):
        """Create a database connection"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row  # Enable column access by name
            return conn
        except Exception as e:
            print(f"Error creating database connection: {e}")
            return None

    def create_tables(self):
        """Create all necessary database tables"""

        tables_sql = {
            "users": """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'doctor',
                    full_name VARCHAR(100),
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """,

            "workspaces": """
                CREATE TABLE IF NOT EXISTS workspaces (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    created_by INTEGER REFERENCES users(id),
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """,

            "patients": """
                CREATE TABLE IF NOT EXISTS patients (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    workspace_id INTEGER REFERENCES workspaces(id),
                    study_id VARCHAR(50) UNIQUE NOT NULL,

                    -- Demographics
                    age INTEGER,
                    gender VARCHAR(10),
                    phone VARCHAR(20),

                    -- Clinical Information
                    chief_complaint TEXT,
                    history_type VARCHAR(50),
                    first_onset_date DATETIME,
                    pain_type VARCHAR(50),
                    aggravating_factors TEXT,
                    relieving_factors TEXT,
                    has_radiation BOOLEAN,
                    radiation_location TEXT,
                    previous_treatment TEXT,
                    condition_progress VARCHAR(50),

                    -- Scores & Measurements
                    pain_score INTEGER CHECK (pain_score >= 0 AND pain_score <= 10),
                    sitting_tolerance INTEGER,
                    standing_tolerance INTEGER,
                    walking_tolerance INTEGER,
                    claudication_distance VARCHAR(20),
                    rmdq_score INTEGER,
                    ndi_score INTEGER,

                    -- Physical Exam
                    assistive_tools TEXT,
                    cervical_posture TEXT,
                    lumbar_posture TEXT,
                    distal_pulse VARCHAR(20),

                    -- Medication
                    medication_details TEXT,

                    -- Notes
                    remarks TEXT,

                    -- Audit
                    created_by INTEGER REFERENCES users(id),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """,

            "patient_red_flags": """
                CREATE TABLE IF NOT EXISTS patient_red_flags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
                    weight_loss BOOLEAN DEFAULT 0,
                    appetite_loss BOOLEAN DEFAULT 0,
                    fever BOOLEAN DEFAULT 0,
                    night_pain BOOLEAN DEFAULT 0,
                    bladder_bowel_dysfunction BOOLEAN DEFAULT 0,
                    saddle_numbness BOOLEAN DEFAULT 0,
                    bilateral_limb_weakness BOOLEAN DEFAULT 0,
                    bilateral_sensory_abnormal BOOLEAN DEFAULT 0,
                    hand_clumsiness BOOLEAN DEFAULT 0,
                    gait_abnormal BOOLEAN DEFAULT 0
                );
            """,

            "patient_cervical_function": """
                CREATE TABLE IF NOT EXISTS patient_cervical_function (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
                    dropping_objects BOOLEAN DEFAULT 0,
                    difficulty_picking_small_items BOOLEAN DEFAULT 0,
                    writing_difficulty BOOLEAN DEFAULT 0,
                    phone_usage_difficulty BOOLEAN DEFAULT 0,
                    buttoning_difficulty BOOLEAN DEFAULT 0,
                    chopstick_usage_difficulty BOOLEAN DEFAULT 0
                );
            """,

            "patient_files": """
                CREATE TABLE IF NOT EXISTS patient_files (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
                    file_name VARCHAR(255) NOT NULL,
                    file_path TEXT NOT NULL,
                    file_type VARCHAR(50),
                    file_size INTEGER,
                    description TEXT,
                    uploaded_by INTEGER REFERENCES users(id),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """,

            "activity_log": """
                CREATE TABLE IF NOT EXISTS activity_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER REFERENCES users(id),
                    action VARCHAR(50),
                    table_name VARCHAR(50),
                    record_id INTEGER,
                    changes TEXT,
                    ip_address VARCHAR(45),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """
        }

        conn = self.create_connection()
        if not conn:
            return False

        try:
            cursor = conn.cursor()

            for table_name, sql in tables_sql.items():
                print(f"Creating table: {table_name}")
                cursor.execute(sql)

            conn.commit()
            print("SUCCESS: All database tables created successfully")
            return True

        except Exception as e:
            print(f"ERROR: Error creating tables: {e}")
            return False
        finally:
            conn.close()

    def create_initial_users(self):
        """Create default admin and doctor users"""

        # Simple password hashing (use bcrypt in production)
        def hash_password(password):
            return hashlib.sha256(password.encode()).hexdigest()

        users = [
            {
                "username": "admin",
                "email": "admin@medical-system.local",
                "password_hash": hash_password("admin123"),
                "role": "admin",
                "full_name": "System Administrator"
            },
            {
                "username": "doctor",
                "email": "doctor@medical-system.local",
                "password_hash": hash_password("doctor123"),
                "role": "doctor",
                "full_name": "Dr. Hao Wu"
            }
        ]

        conn = self.create_connection()
        if not conn:
            return False

        try:
            cursor = conn.cursor()

            for user in users:
                cursor.execute("""
                    INSERT OR REPLACE INTO users
                    (username, email, password_hash, role, full_name)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    user["username"], user["email"], user["password_hash"],
                    user["role"], user["full_name"]
                ))

            conn.commit()
            print("SUCCESS: Initial users created successfully")
            print("CREDENTIALS: Default credentials:")
            print("   Admin: username=admin, password=admin123")
            print("   Doctor: username=doctor, password=doctor123")
            return True

        except Exception as e:
            print(f"ERROR: Error creating users: {e}")
            return False
        finally:
            conn.close()

    def create_default_workspace(self):
        """Create default workspace"""

        conn = self.create_connection()
        if not conn:
            return False

        try:
            cursor = conn.cursor()

            # Get admin user ID
            cursor.execute("SELECT id FROM users WHERE username = 'admin'")
            admin_user = cursor.fetchone()
            if not admin_user:
                print("ERROR: Admin user not found")
                return False

            admin_id = admin_user[0]

            cursor.execute("""
                INSERT OR REPLACE INTO workspaces
                (id, name, description, created_by)
                VALUES (1, ?, ?, ?)
            """, (
                "HKU Orthopedics Research",
                "University of Hong Kong orthopedics department research workspace",
                admin_id
            ))

            conn.commit()
            print("SUCCESS: Default workspace created successfully")
            return True

        except Exception as e:
            print(f"ERROR: Error creating workspace: {e}")
            return False
        finally:
            conn.close()

    def import_patient_data(self, json_file_path="../generated_patients.json"):
        """Import patient data from JSON file"""

        if not os.path.exists(json_file_path):
            print(f"WARNING: Patient data file not found: {json_file_path}")
            return False

        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                patients_data = json.load(f)
        except Exception as e:
            print(f"ERROR: Error reading patient data: {e}")
            return False

        conn = self.create_connection()
        if not conn:
            return False

        try:
            cursor = conn.cursor()

            # Get doctor user ID
            cursor.execute("SELECT id FROM users WHERE username = 'doctor'")
            doctor_user = cursor.fetchone()
            doctor_id = doctor_user[0] if doctor_user else 1

            imported_count = 0

            for patient_data in patients_data:
                try:
                    # Insert main patient data
                    cursor.execute("""
                        INSERT INTO patients (
                            workspace_id, study_id, age, gender, phone,
                            chief_complaint, history_type, first_onset_date,
                            pain_type, aggravating_factors, relieving_factors,
                            has_radiation, radiation_location, previous_treatment,
                            condition_progress, pain_score, sitting_tolerance,
                            standing_tolerance, walking_tolerance, claudication_distance,
                            rmdq_score, ndi_score, assistive_tools, cervical_posture,
                            lumbar_posture, distal_pulse, medication_details,
                            remarks, created_by, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        1,  # workspace_id
                        patient_data.get('study_id'),
                        patient_data.get('age'),
                        patient_data.get('gender'),
                        patient_data.get('phone'),
                        patient_data.get('chief_complaint'),
                        patient_data.get('history_type'),
                        patient_data.get('first_onset_date'),
                        patient_data.get('pain_type'),
                        patient_data.get('aggravating_factors'),
                        patient_data.get('relieving_factors'),
                        patient_data.get('has_radiation'),
                        patient_data.get('radiation_location'),
                        patient_data.get('previous_treatment'),
                        patient_data.get('condition_progress'),
                        patient_data.get('pain_score'),
                        patient_data.get('sitting_tolerance'),
                        patient_data.get('standing_tolerance'),
                        patient_data.get('walking_tolerance'),
                        patient_data.get('claudication_distance'),
                        patient_data.get('rmdq_score'),
                        patient_data.get('ndi_score'),
                        patient_data.get('assistive_tools'),
                        patient_data.get('cervical_posture'),
                        patient_data.get('lumbar_posture'),
                        patient_data.get('distal_pulse'),
                        patient_data.get('medication_details'),
                        patient_data.get('remarks'),
                        doctor_id,
                        patient_data.get('created_date', datetime.now().isoformat())
                    ))

                    patient_id = cursor.lastrowid

                    # Insert red flags data
                    red_flags = patient_data.get('red_flags', {})
                    if red_flags:
                        cursor.execute("""
                            INSERT INTO patient_red_flags (
                                patient_id, weight_loss, appetite_loss, fever,
                                night_pain, bladder_bowel_dysfunction, saddle_numbness,
                                bilateral_limb_weakness, bilateral_sensory_abnormal,
                                hand_clumsiness, gait_abnormal
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            patient_id,
                            red_flags.get('weight_loss', False),
                            red_flags.get('appetite_loss', False),
                            red_flags.get('fever', False),
                            red_flags.get('night_pain', False),
                            red_flags.get('bladder_bowel_dysfunction', False),
                            red_flags.get('saddle_numbness', False),
                            red_flags.get('bilateral_limb_weakness', False),
                            red_flags.get('bilateral_sensory_abnormal', False),
                            red_flags.get('hand_clumsiness', False),
                            red_flags.get('gait_abnormal', False)
                        ))

                    # Insert cervical function data
                    cervical_function = patient_data.get('cervical_function_problems', {})
                    if cervical_function:
                        cursor.execute("""
                            INSERT INTO patient_cervical_function (
                                patient_id, dropping_objects, difficulty_picking_small_items,
                                writing_difficulty, phone_usage_difficulty, buttoning_difficulty,
                                chopstick_usage_difficulty
                            ) VALUES (?, ?, ?, ?, ?, ?, ?)
                        """, (
                            patient_id,
                            cervical_function.get('dropping_objects', False),
                            cervical_function.get('difficulty_picking_small_items', False),
                            cervical_function.get('writing_difficulty', False),
                            cervical_function.get('phone_usage_difficulty', False),
                            cervical_function.get('buttoning_difficulty', False),
                            cervical_function.get('chopstick_usage_difficulty', False)
                        ))

                    imported_count += 1

                except Exception as e:
                    print(f"WARNING: Failed to import patient {patient_data.get('study_id', 'unknown')}: {e}")

            conn.commit()
            print(f"SUCCESS: Successfully imported {imported_count} patients")
            return True

        except Exception as e:
            print(f"ERROR: Error importing patient data: {e}")
            return False
        finally:
            conn.close()

    def get_database_stats(self):
        """Get database statistics"""

        conn = self.create_connection()
        if not conn:
            return None

        try:
            cursor = conn.cursor()

            stats = {}

            # Get table counts
            tables = ['users', 'workspaces', 'patients', 'patient_red_flags',
                     'patient_cervical_function', 'patient_files', 'activity_log']

            for table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                stats[table] = count

            return stats

        except Exception as e:
            print(f"ERROR: Error getting database stats: {e}")
            return None
        finally:
            conn.close()

def main():
    """Main setup function"""

    print("Medical System Database Setup")
    print("="*50)

    # Initialize database
    db = MedicalDatabase()

    # Create tables
    print("\nCreating database tables...")
    if not db.create_tables():
        sys.exit(1)

    # Create initial users
    print("\nCreating initial users...")
    if not db.create_initial_users():
        sys.exit(1)

    # Create default workspace
    print("\nCreating default workspace...")
    if not db.create_default_workspace():
        sys.exit(1)

    # Import patient data
    print("\nImporting patient data...")
    db.import_patient_data()

    # Show statistics
    print("\nDatabase Statistics:")
    stats = db.get_database_stats()
    if stats:
        for table, count in stats.items():
            print(f"   {table}: {count} records")

    print("\nDatabase setup completed successfully!")
    print("\nYour database is ready at: database/medical_data.db")
    print("You can now start the backend server")

if __name__ == "__main__":
    main()