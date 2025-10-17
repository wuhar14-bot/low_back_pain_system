const express = require('express');
const { PrismaClient } = require('@prisma/client');

const { authorize } = require('../middleware/auth');
const { createBackup } = require('../utils/backup');

const router = express.Router();
const prisma = new PrismaClient();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Get activity logs
router.get('/logs', authorize(['admin']), async (req, res) => {
  try {
    const {
      user_id,
      action,
      table_name,
      start_date,
      end_date,
      page = 1,
      limit = 50
    } = req.query;

    const skip = (page - 1) * limit;
    const where = {};

    if (user_id) where.userId = parseInt(user_id);
    if (action) where.action = action;
    if (table_name) where.tableName = table_name;

    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt.gte = new Date(start_date);
      if (end_date) where.createdAt.lte = new Date(end_date);
    }

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { username: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.activityLog.count({ where });

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Create manual backup
router.post('/backup', authorize(['admin']), async (req, res) => {
  try {
    const backupPath = await createBackup();

    res.json({
      message: 'Backup created successfully',
      path: backupPath,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Backup failed' });
  }
});

// Get database statistics
router.get('/stats', authorize(['admin']), async (req, res) => {
  try {
    const [
      userCount,
      workspaceCount,
      patientCount,
      fileCount,
      logCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.patient.count(),
      prisma.patientFile.count(),
      prisma.activityLog.count()
    ]);

    // Get database file size (SQLite specific)
    const fs = require('fs').promises;
    const path = require('path');
    const dbPath = path.resolve('./database/medical_data.db');

    let dbSize = 0;
    try {
      const stats = await fs.stat(dbPath);
      dbSize = stats.size;
    } catch (error) {
      console.warn('Could not get database file size:', error.message);
    }

    res.json({
      users: userCount,
      workspaces: workspaceCount,
      patients: patientCount,
      files: fileCount,
      logs: logCount,
      databaseSize: dbSize,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
});

module.exports = router;