const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');

/**
 * Create a backup of the SQLite database
 * @returns {Promise<string>} Path to the backup file
 */
const createBackup = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const timeString = new Date().toISOString().split('T')[1].replace(/[:.]/g, '-').split('.')[0];
    const backupFileName = `backup-${timestamp}-${timeString}.db`;

    const sourceDb = path.resolve('./database/medical_data.db');
    const backupDir = path.resolve('./backups');
    const backupPath = path.join(backupDir, backupFileName);

    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    // Copy database file
    await fs.copyFile(sourceDb, backupPath);

    console.log(`✅ Database backup created: ${backupPath}`);

    // Clean up old backups
    await cleanupOldBackups();

    return backupPath;

  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
};

/**
 * Clean up old backup files (keep only the most recent ones)
 * @param {number} maxBackups - Maximum number of backups to keep
 */
const cleanupOldBackups = async (maxBackups = 30) => {
  try {
    const backupDir = path.resolve('./backups');

    // Check if backup directory exists
    try {
      await fs.access(backupDir);
    } catch (error) {
      // Backup directory doesn't exist, nothing to clean up
      return;
    }

    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        stat: null
      }));

    // Get file stats for sorting by creation time
    for (const file of backupFiles) {
      try {
        file.stat = await fs.stat(file.path);
      } catch (error) {
        console.warn(`Could not get stats for backup file ${file.name}:`, error);
      }
    }

    // Sort by creation time (newest first)
    backupFiles
      .filter(file => file.stat)
      .sort((a, b) => b.stat.birthtime - a.stat.birthtime);

    // Delete old backups if we have too many
    if (backupFiles.length > maxBackups) {
      const filesToDelete = backupFiles.slice(maxBackups);

      for (const file of filesToDelete) {
        try {
          await fs.unlink(file.path);
          console.log(`🗑️ Deleted old backup: ${file.name}`);
        } catch (error) {
          console.error(`Failed to delete backup file ${file.name}:`, error);
        }
      }
    }

  } catch (error) {
    console.error('Failed to cleanup old backups:', error);
  }
};

/**
 * Setup automated backup schedule
 */
const setupBackupSchedule = () => {
  const schedule = process.env.BACKUP_SCHEDULE || '0 2 * * *'; // Daily at 2 AM by default

  console.log(`📅 Setting up automated backups with schedule: ${schedule}`);

  cron.schedule(schedule, async () => {
    try {
      console.log('🔄 Starting scheduled backup...');
      await createBackup();
      console.log('✅ Scheduled backup completed');
    } catch (error) {
      console.error('❌ Scheduled backup failed:', error);
    }
  });
};

/**
 * Restore database from backup
 * @param {string} backupPath - Path to the backup file
 */
const restoreFromBackup = async (backupPath) => {
  try {
    const sourceDb = path.resolve('./database/medical_data.db');

    // Verify backup file exists
    await fs.access(backupPath);

    // Create a backup of current database before restoring
    const currentBackupPath = await createBackup();
    console.log(`📋 Current database backed up to: ${currentBackupPath}`);

    // Restore from backup
    await fs.copyFile(backupPath, sourceDb);

    console.log(`✅ Database restored from: ${backupPath}`);

  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw error;
  }
};

/**
 * List all available backups
 * @returns {Promise<Array>} Array of backup file information
 */
const listBackups = async () => {
  try {
    const backupDir = path.resolve('./backups');
    const files = await fs.readdir(backupDir);

    const backupFiles = [];

    for (const file of files) {
      if (file.startsWith('backup-') && file.endsWith('.db')) {
        const filePath = path.join(backupDir, file);
        const stat = await fs.stat(filePath);

        backupFiles.push({
          name: file,
          path: filePath,
          size: stat.size,
          createdAt: stat.birthtime,
          modifiedAt: stat.mtime
        });
      }
    }

    // Sort by creation time (newest first)
    backupFiles.sort((a, b) => b.createdAt - a.createdAt);

    return backupFiles;

  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
};

module.exports = {
  createBackup,
  cleanupOldBackups,
  setupBackupSchedule,
  restoreFromBackup,
  listBackups
};