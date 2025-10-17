# Medical System Backend

A secure, local Node.js backend with SQLite database for managing medical patient data.

## 🏗️ Architecture

```
Backend Components:
├── Express.js API Server (Port 3001)
├── SQLite Database (File-based)
├── JWT Authentication
├── Prisma ORM
├── Automated Backups
└── Activity Logging
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- NPM or Yarn

### Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup Database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init

   # Seed database with sample data
   npm run db:seed
   ```

3. **Configure Environment**
   ```bash
   # Copy and edit environment variables
   cp .env.example .env

   # Update JWT_SECRET and ENCRYPTION_KEY with secure values
   ```

4. **Start Server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```

## 🔐 Default Credentials

After seeding, use these credentials for first login:

- **Admin**: username=`admin`, password=`admin123`
- **Doctor**: username=`doctor`, password=`doctor123`

⚠️ **Change these passwords immediately in production!**

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Patients
- `GET /api/patients` - List patients (with filtering)
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/stats` - Get statistics
- `GET /api/patients/export` - Export to CSV

### File Management
- `POST /api/patients/:id/files` - Upload file
- `GET /api/patients/:id/files` - List patient files
- `DELETE /api/patients/:id/files/:fileId` - Delete file

### Workspaces
- `GET /api/workspaces` - List workspaces
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace

### System
- `GET /api/system/health` - Health check
- `GET /api/system/logs` - Activity logs
- `POST /api/system/backup` - Manual backup
- `GET /api/system/stats` - System statistics

## 🗃️ Database Schema

### Core Tables
- **users** - System users (doctors, admins)
- **workspaces** - Research/clinic workspaces
- **patients** - Main patient data
- **patient_red_flags** - Red flag indicators
- **patient_cervical_function** - Cervical function assessments
- **patient_files** - Uploaded files (X-rays, documents)
- **activity_log** - System activity tracking

## 💾 Backup System

### Automated Backups
- **Schedule**: Daily at 2 AM (configurable)
- **Retention**: 30 days (configurable)
- **Format**: SQLite database file copies
- **Location**: `./backups/` directory

### Manual Backup
```bash
# Create immediate backup
npm run backup

# Or via API
curl -X POST http://localhost:3001/api/system/backup \
  -H "Authorization: Bearer <admin_token>"
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-based Access** - Admin/Doctor permissions
- **Password Hashing** - bcrypt with salt
- **Input Validation** - Request sanitization
- **CORS Protection** - Frontend-only access
- **Rate Limiting** - Prevent abuse
- **Activity Logging** - Full audit trail
- **File Upload Security** - Type/size validation

## 📁 File Structure

```
backend/
├── src/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation, error handling
│   ├── routes/         # API route definitions
│   ├── utils/          # Helper functions
│   └── app.js          # Express app setup
├── database/
│   ├── schema.prisma   # Database schema
│   ├── migrations/     # Schema change history
│   └── medical_data.db # SQLite database file
├── backups/           # Automated backups
├── uploads/           # User-uploaded files
├── .env              # Environment variables
└── package.json      # Dependencies and scripts
```

## 🛠️ Development

### Database Operations
```bash
# View database in browser
npx prisma studio

# Reset database (⚠️ destroys data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

### Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   JWT_SECRET=<secure-secret-key>
   ENCRYPTION_KEY=<32-character-key>
   ```

2. **Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

3. **Process Management**
   ```bash
   # Use PM2 for production
   npm install -g pm2
   pm2 start src/app.js --name medical-backend
   ```

## 📈 Monitoring

- **Health Check**: `GET /api/system/health`
- **Logs**: Available via API or database query
- **Metrics**: Patient counts, file sizes, system stats

## 🔧 Configuration

Key environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `DATABASE_URL` | file:./database/medical_data.db | SQLite connection |
| `JWT_SECRET` | (required) | JWT signing key |
| `JWT_EXPIRES_IN` | 24h | Token expiration |
| `MAX_FILE_SIZE` | 10MB | Upload limit |
| `BACKUP_SCHEDULE` | 0 2 * * * | Cron schedule |

## 🆘 Troubleshooting

### Common Issues

1. **Database locked**: Restart server
2. **Permission errors**: Check file permissions
3. **Port in use**: Change PORT in .env
4. **Migration fails**: Reset and re-migrate

### Backup Recovery
```bash
# List available backups
ls -la backups/

# Restore from backup
cp backups/backup-YYYY-MM-DD.db database/medical_data.db
```

## 📞 Support

For issues or questions:
1. Check logs: `npm run logs`
2. Verify health: `curl http://localhost:3001/api/system/health`
3. Review documentation above
4. Contact system administrator