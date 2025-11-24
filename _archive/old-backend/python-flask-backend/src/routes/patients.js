const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');

const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getStats
} = require('../controllers/patientController');

const { authorize } = require('../middleware/auth');

const router = express.Router();

// OCR Service Configuration
const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:5001';

/**
 * Process uploaded file with OCR service
 * @param {number} fileId - Database file ID
 * @param {string} filePath - Physical file path
 */
async function processFileWithOCR(fileId, filePath) {
  try {
    console.log(`[OCR] Processing file ID ${fileId}: ${path.basename(filePath)}`);

    // Call OCR service
    const response = await axios.post(`${OCR_SERVICE_URL}/ocr/process`, {
      image_path: filePath,
      options: {
        extract_structured: true,
        confidence_threshold: 0.6
      }
    }, {
      timeout: 60000 // 60 second timeout
    });

    if (response.data.success) {
      const { text_lines, full_text, structured_data, line_count } = response.data;

      // Update database with OCR results
      await prisma.patientFile.update({
        where: { id: fileId },
        data: {
          ocrProcessed: true,
          ocrText: full_text,
          ocrTextLines: JSON.stringify(text_lines),
          ocrStructured: JSON.stringify(structured_data),
          ocrProcessedAt: new Date()
        }
      });

      console.log(`[OCR] ✅ Success: Extracted ${line_count} text lines from file ID ${fileId}`);
    } else {
      throw new Error('OCR service returned success: false');
    }

  } catch (error) {
    console.error(`[OCR] ❌ Error processing file ID ${fileId}:`, error.message);

    // Store error in database
    try {
      await prisma.patientFile.update({
        where: { id: fileId },
        data: {
          ocrProcessed: true,
          ocrError: error.message,
          ocrProcessedAt: new Date()
        }
      });
    } catch (dbError) {
      console.error('[OCR] Failed to save error to database:', dbError);
    }
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const patientDir = path.join(uploadDir, 'patients', req.params.id || 'temp');

    try {
      await fs.mkdir(patientDir, { recursive: true });
      cb(null, patientDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'));
    }
  }
});

// Routes

// Get all patients (with filtering, sorting, pagination)
router.get('/', getPatients);

// Get patient statistics
router.get('/stats', getStats);

// Search patients (alias for GET / with query params)
router.get('/search', getPatients);

// Export patients to CSV
router.get('/export', async (req, res) => {
  try {
    const { workspace_id } = req.query;
    const where = workspace_id ? { workspaceId: parseInt(workspace_id) } : {};

    const patients = await prisma.patient.findMany({
      where,
      include: {
        workspace: { select: { name: true } },
        redFlags: true,
        cervicalFunction: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Convert to CSV format
    const csvHeaders = [
      'Study ID', 'Age', 'Gender', 'Phone', 'Chief Complaint',
      'History Type', 'Pain Type', 'Pain Score', 'Has Radiation',
      'Red Flags', 'Workspace', 'Created Date'
    ];

    const csvRows = patients.map(patient => [
      patient.studyId || '',
      patient.age || '',
      patient.gender || '',
      patient.phone || '',
      patient.chiefComplaint || '',
      patient.historyType || '',
      patient.painType || '',
      patient.painScore || '',
      patient.hasRadiation ? 'Yes' : 'No',
      patient.redFlags ? getRedFlagsSummary(patient.redFlags) : '',
      patient.workspace?.name || '',
      patient.createdAt ? new Date(patient.createdAt).toISOString().split('T')[0] : ''
    ]);

    const csv = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const filename = `patients-export-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export patients' });
  }
});

// Get single patient by ID
router.get('/:id', getPatient);

// Create new patient
router.post('/', authorize(['doctor', 'admin']), createPatient);

// Update patient
router.put('/:id', authorize(['doctor', 'admin']), updatePatient);
router.patch('/:id', authorize(['doctor', 'admin']), updatePatient);

// Delete patient
router.delete('/:id', authorize(['admin']), deletePatient);

// File management routes

// Upload file for patient
router.post('/:id/files', authorize(['doctor', 'admin']), upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = await prisma.patientFile.create({
      data: {
        patientId: parseInt(id),
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        description: description || null,
        uploadedById: req.user.id
      },
      include: {
        uploadedBy: { select: { username: true, fullName: true } }
      }
    });

    // Log activity
    await logActivity(req.user.id, 'CREATE', 'patient_files', file.id, req.ip, {
      patientId: parseInt(id),
      fileName: req.file.originalname
    });

    // Trigger OCR processing for images (async, don't wait)
    const isImage = req.file.mimetype.startsWith('image/');
    if (isImage) {
      processFileWithOCR(file.id, req.file.path).catch(err => {
        console.error('OCR processing error:', err);
      });
    }

    res.status(201).json(file);

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get files for patient
router.get('/:id/files', async (req, res) => {
  try {
    const { id } = req.params;

    const files = await prisma.patientFile.findMany({
      where: { patientId: parseInt(id) },
      include: {
        uploadedBy: { select: { username: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(files);

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Delete file
router.delete('/:id/files/:fileId', authorize(['doctor', 'admin']), async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await prisma.patientFile.findUnique({
      where: { id: parseInt(fileId) }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from database
    await prisma.patientFile.delete({
      where: { id: parseInt(fileId) }
    });

    // Delete physical file
    try {
      await fs.unlink(file.filePath);
    } catch (error) {
      console.warn('Failed to delete physical file:', error);
    }

    // Log activity
    await logActivity(req.user.id, 'DELETE', 'patient_files', parseInt(fileId), req.ip, {
      fileName: file.fileName
    });

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Helper function to summarize red flags
function getRedFlagsSummary(redFlags) {
  if (!redFlags) return '';

  const activeFlags = [];
  if (redFlags.weightLoss) activeFlags.push('Weight Loss');
  if (redFlags.appetiteLoss) activeFlags.push('Appetite Loss');
  if (redFlags.fever) activeFlags.push('Fever');
  if (redFlags.nightPain) activeFlags.push('Night Pain');
  if (redFlags.bladderBowelDysfunction) activeFlags.push('Bladder/Bowel Dysfunction');
  if (redFlags.saddleNumbness) activeFlags.push('Saddle Numbness');
  if (redFlags.bilateralLimbWeakness) activeFlags.push('Bilateral Limb Weakness');
  if (redFlags.bilateralSensoryAbnormal) activeFlags.push('Bilateral Sensory Abnormal');
  if (redFlags.handClumsiness) activeFlags.push('Hand Clumsiness');
  if (redFlags.gaitAbnormal) activeFlags.push('Gait Abnormal');

  return activeFlags.join('; ');
}

module.exports = router;