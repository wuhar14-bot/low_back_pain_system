const { PrismaClient } = require('@prisma/client');
const { logActivity } = require('../utils/logger');

const prisma = new PrismaClient();

// Get all patients with filtering, sorting, and pagination
const getPatients = async (req, res) => {
  try {
    const {
      workspace_id,
      q, // text search
      pain_score_min,
      pain_score_max,
      age_min,
      age_max,
      has_red_flags,
      sort = 'created_at',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (workspace_id) {
      where.workspaceId = parseInt(workspace_id);
    }

    // Text search across multiple fields
    if (q) {
      where.OR = [
        { studyId: { contains: q, mode: 'insensitive' } },
        { chiefComplaint: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } }
      ];
    }

    // Pain score filter
    if (pain_score_min || pain_score_max) {
      where.painScore = {};
      if (pain_score_min) where.painScore.gte = parseInt(pain_score_min);
      if (pain_score_max) where.painScore.lte = parseInt(pain_score_max);
    }

    // Age filter
    if (age_min || age_max) {
      where.age = {};
      if (age_min) where.age.gte = parseInt(age_min);
      if (age_max) where.age.lte = parseInt(age_max);
    }

    // Red flags filter
    if (has_red_flags === 'true') {
      where.redFlags = {
        OR: [
          { weightLoss: true },
          { appetiteLoss: true },
          { fever: true },
          { nightPain: true },
          { bladderBowelDysfunction: true },
          { saddleNumbness: true },
          { bilateralLimbWeakness: true },
          { bilateralSensoryAbnormal: true },
          { handClumsiness: true },
          { gaitAbnormal: true }
        ]
      };
    }

    // Get patients with relationships
    const patients = await prisma.patient.findMany({
      where,
      include: {
        workspace: { select: { name: true } },
        redFlags: true,
        cervicalFunction: true,
        _count: { select: { files: true } }
      },
      orderBy: { [sort]: order },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    // Get total count for pagination
    const total = await prisma.patient.count({ where });

    // Log activity
    await logActivity(req.user.id, 'VIEW', 'patients', null, req.ip);

    res.json({
      patients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

// Get single patient by ID
const getPatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
      include: {
        workspace: { select: { name: true } },
        createdBy: { select: { username: true, fullName: true } },
        redFlags: true,
        cervicalFunction: true,
        files: {
          include: {
            uploadedBy: { select: { username: true, fullName: true } }
          }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Log activity
    await logActivity(req.user.id, 'VIEW', 'patients', parseInt(id), req.ip);

    res.json(patient);

  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
};

// Create new patient
const createPatient = async (req, res) => {
  try {
    const patientData = req.body;

    // Separate red flags and cervical function data
    const { red_flags, cervical_function_problems, ...mainData } = patientData;

    const patient = await prisma.patient.create({
      data: {
        ...mainData,
        createdById: req.user.id,
        redFlags: red_flags ? { create: red_flags } : undefined,
        cervicalFunction: cervical_function_problems ? { create: cervical_function_problems } : undefined
      },
      include: {
        workspace: { select: { name: true } },
        redFlags: true,
        cervicalFunction: true
      }
    });

    // Log activity
    await logActivity(req.user.id, 'CREATE', 'patients', patient.id, req.ip, {
      studyId: patient.studyId,
      workspaceId: patient.workspaceId
    });

    res.status(201).json(patient);

  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patientData = req.body;

    // Separate red flags and cervical function data
    const { red_flags, cervical_function_problems, ...mainData } = patientData;

    const patient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: {
        ...mainData,
        redFlags: red_flags ? {
          upsert: {
            create: red_flags,
            update: red_flags
          }
        } : undefined,
        cervicalFunction: cervical_function_problems ? {
          upsert: {
            create: cervical_function_problems,
            update: cervical_function_problems
          }
        } : undefined
      },
      include: {
        workspace: { select: { name: true } },
        redFlags: true,
        cervicalFunction: true
      }
    });

    // Log activity
    await logActivity(req.user.id, 'UPDATE', 'patients', parseInt(id), req.ip, {
      studyId: patient.studyId,
      changes: Object.keys(patientData)
    });

    res.json(patient);

  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
};

// Delete patient
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
      select: { studyId: true }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    await prisma.patient.delete({
      where: { id: parseInt(id) }
    });

    // Log activity
    await logActivity(req.user.id, 'DELETE', 'patients', parseInt(id), req.ip, {
      studyId: patient.studyId
    });

    res.json({ message: 'Patient deleted successfully' });

  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
};

// Get patient statistics for dashboard
const getStats = async (req, res) => {
  try {
    const { workspace_id } = req.query;
    const where = workspace_id ? { workspaceId: parseInt(workspace_id) } : {};

    const [
      totalPatients,
      highPainPatients,
      redFlagPatients,
      avgPainScore,
      recentPatients
    ] = await Promise.all([
      // Total patients
      prisma.patient.count({ where }),

      // High pain score patients (>= 7)
      prisma.patient.count({
        where: { ...where, painScore: { gte: 7 } }
      }),

      // Patients with red flags
      prisma.patient.count({
        where: {
          ...where,
          redFlags: {
            OR: [
              { weightLoss: true },
              { appetiteLoss: true },
              { fever: true },
              { nightPain: true },
              { bladderBowelDysfunction: true },
              { saddleNumbness: true },
              { bilateralLimbWeakness: true },
              { bilateralSensoryAbnormal: true },
              { handClumsiness: true },
              { gaitAbnormal: true }
            ]
          }
        }
      }),

      // Average pain score
      prisma.patient.aggregate({
        where,
        _avg: { painScore: true }
      }),

      // Recent patients (last 24 hours)
      prisma.patient.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    res.json({
      total: totalPatients,
      highPain: highPainPatients,
      redFlags: redFlagPatients,
      avgPainScore: avgPainScore._avg.painScore || 0,
      recent24h: recentPatients
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

module.exports = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getStats
};