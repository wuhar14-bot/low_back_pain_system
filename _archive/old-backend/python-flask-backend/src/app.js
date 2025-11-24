const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const workspaceRoutes = require('./routes/workspaces');
const systemRoutes = require('./routes/system');

// Import middleware
const { authenticate } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { setupBackupSchedule } = require('./utils/backup');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false // Allow file uploads
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', authenticate, patientRoutes);
app.use('/api/workspaces', authenticate, workspaceRoutes);
app.use('/api/system', authenticate, systemRoutes);

// Static file serving for uploads
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🏥 Medical System Backend running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV}`);

  // Setup automated backups
  setupBackupSchedule();
});

module.exports = app;