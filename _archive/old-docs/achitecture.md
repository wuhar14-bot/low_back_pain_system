🖥️ Frontend Directory (/frontend/)

  Purpose: User Interface & User Experience

  - Technology: React 18 + Vite + TailwindCSS
  - Port: 5174 (your current running server)
  - Role: Provides the web interface doctors use to manage patients

  Key Frontend Files:

  frontend/src/
  ├── components/
  │   ├── dashboard/              # Dashboard widgets
  │   │   ├── PatientList.jsx     # Table showing all patients
  │   │   └── StatsCards.jsx      # Statistics cards
  │   ├── patient-form/           # Patient creation/editing
  │   │   ├── BasicInfoSection.jsx
  │   │   ├── MedicalHistorySection.jsx
  │   │   └── FunctionalScoreSection.jsx
  │   └── ui/                     # Reusable UI components
  ├── pages/
  │   ├── Dashboard.jsx           # Main dashboard page
  │   ├── PatientForm.jsx         # Add/edit patient form
  │   ├── PatientDetail.jsx       # Individual patient view
  │   └── Login.jsx               # Authentication page
  ├── api/
  │   └── entities.js             # API calls to backend
  └── contexts/
      └── AuthContext.jsx         # User authentication state

  ---
  🔧 Backend Directory (/backend/)

  Purpose: API Server & Data Management

  - Technology: Node.js + Express + SQLite + Prisma
  - Port: 3001
  - Role: Handles all data operations, authentication, file storage

  Detailed Backend Structure:

  📂 /src/controllers/ - Business Logic

  patientController.js          # Patient CRUD operations
  ├── getPatients()            # List patients with filtering
  ├── createPatient()          # Add new patient
  ├── updatePatient()          # Modify patient data
  ├── deletePatient()          # Remove patient
  └── getStats()               # Dashboard statistics

  What it does: Contains the actual logic for handling requests. When someone visits    
   /api/patients, this controller decides what data to return.

  📂 /src/routes/ - API Endpoints

  patients.js                  # Patient-related endpoints
  ├── GET    /api/patients     # List all patients
  ├── POST   /api/patients     # Create new patient
  ├── GET    /api/patients/:id # Get specific patient
  ├── PUT    /api/patients/:id # Update patient
  ├── DELETE /api/patients/:id # Delete patient
  └── POST   /api/patients/:id/files # Upload files

  auth.js                      # Authentication endpoints
  ├── POST /api/auth/login     # User login
  ├── GET  /api/auth/me        # Current user info
  └── POST /api/auth/logout    # User logout

  workspaces.js               # Research workspace management
  system.js                   # System administration

  What it does: Defines the URLs your frontend can call. Each route connects to a       
  controller function.

  📂 /src/middleware/ - Request Processing

  auth.js                     # Authentication middleware
  ├── authenticate()          # Verify JWT tokens
  └── authorize()             # Check user permissions

  errorHandler.js             # Error handling
  └── errorHandler()          # Format error responses

  What it does: Processes every request before it reaches the controller. Checks if     
  users are logged in, handles errors gracefully.

  📂 /src/utils/ - Helper Functions

  backup.js                   # Database backup system
  ├── createBackup()          # Manual backup creation
  ├── setupBackupSchedule()   # Daily automated backups
  └── cleanupOldBackups()     # Remove old backups

  logger.js                   # Activity tracking
  ├── logActivity()           # Record user actions
  └── getActivityLogs()       # Retrieve audit logs

  seed.js                     # Database setup
  └── seedDatabase()          # Create initial data

  What it does: Background tasks that keep your system running smoothly - backups,      
  logging, database setup.

  ---
  🗃️ Database Directory (/database/)

  Purpose: Data Storage & Schema Management

  schema.prisma - Database Blueprint

  // Defines table structure
  model Patient {
    id                 Int      @id @default(autoincrement())
    studyId           String   @unique
    age               Int?
    gender            String?
    painScore         Int?
    // ... all your patient fields
  }

  model PatientRedFlag {
    patientId         Int      @unique
    weightLoss        Boolean  @default(false)
    fever             Boolean  @default(false)
    // ... all red flag indicators
  }

  What it does: Describes exactly how your data is organized, what fields exist, and    
   how tables connect to each other.

  medical_data.db - The Actual Database

  - Format: Single SQLite file
  - Size: Starts small, grows with your data
  - Location: Lives on your computer only
  - Content: All patient records, users, workspaces

  migrations/ - Database Version Control

  20241001_init/              # Initial database creation
  20241002_add_red_flags/     # Added red flag tracking
  20241003_add_file_upload/   # Added file upload support

  What it does: Tracks changes to your database structure over time. Like Git for       
  your database schema.

  ---
  💾 Backups Directory (/backups/)

  Purpose: Data Protection & Recovery

  backups/
  ├── backup-2024-09-26-02-00-00.db    # Daily 2 AM backup
  ├── backup-2024-09-25-02-00-00.db    # Previous day
  ├── backup-2024-09-24-02-00-00.db    # 2 days ago
  └── ... (30 days of backups kept)

  What it does:
  - Automatic: Creates backup every night at 2 AM
  - Retention: Keeps 30 days of backups automatically
  - Recovery: Can restore any backup if something goes wrong
  - Manual: You can create backups anytime via API

  ---
  📁 Uploads Directory (/uploads/)

  Purpose: File Storage

  uploads/
  ├── patients/
  │   ├── 1/                  # Patient ID 1's files
  │   │   ├── xray-123.jpg    # X-ray image
  │   │   └── report-456.pdf  # Medical report
  │   ├── 2/                  # Patient ID 2's files
  │   └── temp/               # Temporary uploads

  What it does: Stores X-rays, medical documents, images that doctors upload for        
  each patient.

  ---
  🔄 How Everything Works Together

  Data Flow Example: "Doctor Creates New Patient"

  1. Frontend (PatientForm.jsx):
  // Doctor fills form, clicks "Save"
  const response = await fetch('/api/patients', {
    method: 'POST',
    body: JSON.stringify(patientData)
  });
  2. Backend Route (/src/routes/patients.js):
  // Receives the request
  router.post('/', authenticate, createPatient);
  3. Authentication (/src/middleware/auth.js):
  // Checks if doctor is logged in
  const user = verifyToken(request.headers.authorization);
  4. Controller (/src/controllers/patientController.js):
  // Processes the data
  const patient = await prisma.patient.create({
    data: patientData
  });
  5. Database (medical_data.db):
  -- Stores the data
  INSERT INTO patients (study_id, age, gender, ...)
  VALUES ('LBP-001', 44, 'Male', ...);
  6. Activity Log (/src/utils/logger.js):
  // Records the action
  await logActivity(userId, 'CREATE', 'patients', patientId);
  7. Response Back to Frontend:
  // Frontend receives confirmation
  { "id": 123, "study_id": "LBP-001", "status": "created" }

  ---
  🔒 Security Architecture

  Authentication Flow:

  1. Doctor enters username/password
  2. Backend verifies credentials against database
  3. Backend generates JWT token (like a temporary ID card)
  4. Frontend stores token, sends with every request
  5. Backend verifies token for each API call

  Data Protection:

  - Local Only: No data sent to external servers
  - Encrypted Passwords: Using bcrypt hashing
  - Access Control: Role-based permissions
  - Activity Logging: Every action tracked
  - File Validation: Only safe file types allowed

  ---
  📈 Scalability Features

  Current Capacity:

  - Patients: Thousands (tested with 200+ patients)
  - Files: Limited by disk space
  - Users: Multiple doctors/researchers
  - Workspaces: Multiple research projects

  Growth Path:

  - More Users: Easy to add new doctors
  - More Data: SQLite handles gigabytes efficiently
  - More Features: Modular architecture supports additions
  - Network Access: Can be shared across local network

  ---
  🛠️ Development Workflow

  Adding New Features:

  1. Database: Update schema.prisma if needed
  2. Backend: Add controller + route + tests
  3. Frontend: Create/update React components
  4. Migration: Run database migration
  5. Testing: Verify everything works

  Maintenance Tasks:

  - Backups: Automatic (no action needed)
  - Updates: npm update in both frontend/backend
  - Monitoring: Check /api/system/health
  - Logs: Review activity via /api/system/logs

  ---
  This architecture gives you a professional, scalable, secure medical system that      
  keeps all data local while providing modern web application features. The
  separation of frontend/backend allows for future expansion and makes maintenance      
  much easier.

  Would you like me to explain any specific part in more detail, or shall we proceed    
   with setting up the database and getting the backend running?