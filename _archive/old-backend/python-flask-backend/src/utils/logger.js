const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Log user activity to the database
 * @param {number} userId - The ID of the user performing the action
 * @param {string} action - The action performed (CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT)
 * @param {string} tableName - The table/resource affected
 * @param {number} recordId - The ID of the affected record
 * @param {string} ipAddress - The IP address of the user
 * @param {object} changes - Additional data about the changes made
 */
const logActivity = async (userId, action, tableName, recordId = null, ipAddress = null, changes = null) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        tableName,
        recordId,
        ipAddress,
        changes: changes ? JSON.stringify(changes) : null
      }
    });
  } catch (error) {
    // Don't throw error for logging failures to prevent breaking the main operation
    console.error('Failed to log activity:', error);
  }
};

/**
 * Get activity logs with filtering
 * @param {object} filters - Filtering options
 * @returns {Promise<Array>} Array of activity logs
 */
const getActivityLogs = async (filters = {}) => {
  try {
    const {
      userId,
      action,
      tableName,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = filters;

    const where = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (tableName) where.tableName = tableName;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            fullName: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return logs;

  } catch (error) {
    console.error('Failed to get activity logs:', error);
    throw error;
  }
};

/**
 * Clean up old activity logs (keep only recent ones)
 * @param {number} daysToKeep - Number of days to keep logs for
 */
const cleanupOldLogs = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    console.log(`Cleaned up ${deletedCount.count} old activity logs`);
    return deletedCount.count;

  } catch (error) {
    console.error('Failed to cleanup old logs:', error);
    throw error;
  }
};

module.exports = {
  logActivity,
  getActivityLogs,
  cleanupOldLogs
};