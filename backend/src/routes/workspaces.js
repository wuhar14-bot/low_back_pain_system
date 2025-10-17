const express = require('express');
const { PrismaClient } = require('@prisma/client');

const { authorize } = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Get all workspaces
router.get('/', async (req, res) => {
  try {
    const { sort = 'created_at', order = 'desc' } = req.query;

    const workspaces = await prisma.workspace.findMany({
      include: {
        createdBy: { select: { username: true, fullName: true } },
        _count: { select: { patients: true } }
      },
      orderBy: { [sort]: order }
    });

    res.json(workspaces);

  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Get single workspace
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const workspace = await prisma.workspace.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: { select: { username: true, fullName: true } },
        _count: { select: { patients: true } }
      }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    res.json(workspace);

  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

// Create new workspace
router.post('/', authorize(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        createdById: req.user.id
      },
      include: {
        createdBy: { select: { username: true, fullName: true } },
        _count: { select: { patients: true } }
      }
    });

    // Log activity
    await logActivity(req.user.id, 'CREATE', 'workspaces', workspace.id, req.ip, {
      name: workspace.name
    });

    res.status(201).json(workspace);

  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// Update workspace
router.put('/:id', authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const workspace = await prisma.workspace.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        createdBy: { select: { username: true, fullName: true } },
        _count: { select: { patients: true } }
      }
    });

    // Log activity
    await logActivity(req.user.id, 'UPDATE', 'workspaces', parseInt(id), req.ip, {
      name: workspace.name,
      changes: Object.keys(req.body)
    });

    res.json(workspace);

  } catch (error) {
    console.error('Update workspace error:', error);
    res.status(500).json({ error: 'Failed to update workspace' });
  }
});

// Delete workspace
router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if workspace has patients
    const patientCount = await prisma.patient.count({
      where: { workspaceId: parseInt(id) }
    });

    if (patientCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete workspace with existing patients',
        patientCount
      });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: parseInt(id) },
      select: { name: true }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    await prisma.workspace.delete({
      where: { id: parseInt(id) }
    });

    // Log activity
    await logActivity(req.user.id, 'DELETE', 'workspaces', parseInt(id), req.ip, {
      name: workspace.name
    });

    res.json({ message: 'Workspace deleted successfully' });

  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

module.exports = router;