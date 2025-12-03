import { patientService, patientImageService } from '../services/apiService';

// Default workspaces for local development
const defaultWorkspaces = [
  {
    id: "workspace-1",
    name: "HKU Orthopedics Research",
    description: "University of Hong Kong orthopedics department research workspace",
    is_active: true,
    created_date: "2024-09-01T00:00:00Z",
    created_by_name: "Hao WU"
  },
  {
    id: "workspace-2",
    name: "Clinical Trial Unit",
    description: "Low back pain clinical trial data collection",
    is_active: true,
    created_date: "2024-08-15T00:00:00Z",
    created_by_name: "Research Team"
  }
];

// Load workspaces from localStorage or use default
const loadWorkspaces = () => {
  const stored = localStorage.getItem('mockWorkspaces');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored workspaces, using defaults');
    }
  }
  return [...defaultWorkspaces];
};

// Save workspaces to localStorage
const saveWorkspaces = (workspaces) => {
  try {
    localStorage.setItem('mockWorkspaces', JSON.stringify(workspaces));
  } catch (e) {
    console.warn('Failed to save workspaces to localStorage');
  }
};

// Initialize with stored or default data
let mockWorkspaces = loadWorkspaces();

/**
 * Patient API wrapper using new backend
 * Connects to ABP vNext backend at https://localhost:44385
 */
class Patient {
  /**
   * Get all patients with optional sorting
   * @param {string} sortOrder - Sort order (not used in ABP, but kept for compatibility)
   * @param {Object} params - Additional query params
   */
  static async list(sortOrder = "-created_date", params = {}) {
    try {
      const response = await patientService.getPatients({
        skipCount: params.skipCount || 0,
        maxResultCount: params.maxResultCount || 100,
        ...params
      });

      console.log(`✅ [Backend] Loaded ${response.items?.length || 0} patients`);

      // ABP returns { items: [], totalCount: N }
      // Transform to frontend format for compatibility
      const patients = (response.items || []).map(transformToFrontend);
      return patients;
    } catch (error) {
      console.error('❌ [Backend] Failed to load patients:', error);
      throw error;
    }
  }

  /**
   * Get patient by ID
   * @param {string} id - Patient UUID
   */
  static async get(id) {
    try {
      const patient = await patientService.getPatientById(id);
      console.log(`✅ [Backend] Loaded patient ${id}`);
      return transformToFrontend(patient);
    } catch (error) {
      console.error(`❌ [Backend] Failed to load patient ${id}:`, error);
      return null;
    }
  }

  /**
   * Create new patient
   * @param {Object} data - Patient data
   */
  static async create(data) {
    try {
      // Transform frontend data to backend format
      const backendData = {
        studyId: data.study_id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        onsetDate: data.onset_date,
        chiefComplaint: data.chief_complaint,
        workspaceId: data.workspace_id,
        workspaceName: data.workspace_name,
        doctorId: data.doctor_id,
        doctorName: data.doctor_name,
        medicalHistoryJson: data.medical_history,
        painAreasJson: data.pain_areas,
        subjectiveExamJson: data.subjective_exam,
        objectiveExamJson: data.objective_exam,
        functionalScoresJson: data.functional_scores,
        aiPostureAnalysisJson: data.ai_analysis,
        interventionJson: data.intervention,
        remarks: data.remarks
      };

      const newPatient = await patientService.createPatient(backendData);
      console.log(`✅ [Backend] Created patient: ${newPatient.id}`);

      // Transform back to frontend format for consistency
      return transformToFrontend(newPatient);
    } catch (error) {
      console.error('❌ [Backend] Failed to create patient:', error);
      throw error;
    }
  }

  /**
   * Update patient
   * @param {string} id - Patient UUID
   * @param {Object} data - Updated patient data
   */
  static async update(id, data) {
    try {
      // Transform frontend data to backend format
      const backendData = {
        studyId: data.study_id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        onsetDate: data.onset_date,
        chiefComplaint: data.chief_complaint,
        workspaceId: data.workspace_id,
        workspaceName: data.workspace_name,
        doctorId: data.doctor_id,
        doctorName: data.doctor_name,
        medicalHistoryJson: data.medical_history,
        painAreasJson: data.pain_areas,
        subjectiveExamJson: data.subjective_exam,
        objectiveExamJson: data.objective_exam,
        functionalScoresJson: data.functional_scores,
        aiPostureAnalysisJson: data.ai_analysis,
        interventionJson: data.intervention,
        remarks: data.remarks
      };

      const updated = await patientService.updatePatient(id, backendData);
      console.log(`✅ [Backend] Updated patient: ${id}`);

      return transformToFrontend(updated);
    } catch (error) {
      console.error(`❌ [Backend] Failed to update patient ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete patient
   * @param {string} id - Patient UUID
   */
  static async delete(id) {
    try {
      await patientService.deletePatient(id);
      console.log(`✅ [Backend] Deleted patient: ${id}`);
      return { id };
    } catch (error) {
      console.error(`❌ [Backend] Failed to delete patient ${id}:`, error);
      throw error;
    }
  }
}

/**
 * Transform backend patient data to frontend format
 * @param {Object} backendPatient - Patient from ABP backend
 * @returns {Object} Frontend-compatible patient object
 */
function transformToFrontend(backendPatient) {
  return {
    id: backendPatient.id,
    study_id: backendPatient.studyId,
    name: backendPatient.name,
    age: backendPatient.age,
    gender: backendPatient.gender,
    phone: backendPatient.phone,
    onset_date: backendPatient.onsetDate,
    chief_complaint: backendPatient.chiefComplaint,
    workspace_id: backendPatient.workspaceId,
    workspace_name: backendPatient.workspaceName,
    doctor_id: backendPatient.doctorId,
    doctor_name: backendPatient.doctorName,
    medical_history: backendPatient.medicalHistoryJson,
    pain_areas: backendPatient.painAreasJson,
    subjective_exam: backendPatient.subjectiveExamJson,
    objective_exam: backendPatient.objectiveExamJson,
    functional_scores: backendPatient.functionalScoresJson,
    ai_analysis: backendPatient.aiPostureAnalysisJson,
    intervention: backendPatient.interventionJson,
    remarks: backendPatient.remarks,
    created_date: backendPatient.creationTime,
    created_by: backendPatient.creatorId,
    last_modified: backendPatient.lastModificationTime,
    last_modified_by: backendPatient.lastModifierId
  };
}

class MockWorkspace {
  static async list(sortOrder = "-created_date") {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockWorkspaces].sort((a, b) => {
      if (sortOrder === "-created_date") {
        return new Date(b.created_date) - new Date(a.created_date);
      }
      return new Date(a.created_date) - new Date(b.created_date);
    });
  }

  static async get(id) {
    await new Promise(resolve => setTimeout(resolve, 150));
    return mockWorkspaces.find(w => w.id === id) || null;
  }

  static async create(data) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newWorkspace = {
      id: `workspace-${Date.now()}`,
      created_date: new Date().toISOString(),
      is_active: true,
      ...data
    };
    mockWorkspaces.push(newWorkspace);
    saveWorkspaces(mockWorkspaces);
    return newWorkspace;
  }

  static async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockWorkspaces.findIndex(w => w.id === id);
    if (index !== -1) {
      mockWorkspaces[index] = { ...mockWorkspaces[index], ...data };
      saveWorkspaces(mockWorkspaces);
      return mockWorkspaces[index];
    }
    return null;
  }

  static async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockWorkspaces.findIndex(w => w.id === id);
    if (index !== -1) {
      const deleted = mockWorkspaces.splice(index, 1)[0];
      saveWorkspaces(mockWorkspaces);
      return deleted;
    }
    throw new Error("Workspace not found");
  }
}

/**
 * Patient Image API wrapper
 * Handles image upload/download for patients
 */
class PatientImage {
  /**
   * Upload an image for a patient
   * @param {string} patientId - Patient UUID
   * @param {File} file - File to upload
   * @param {string} imageType - Type: xray, mri, photo, posture, other
   * @param {string} description - Optional description
   */
  static async upload(patientId, file, imageType, description = '') {
    try {
      const result = await patientImageService.uploadImage(patientId, file, imageType, description);
      console.log(`✅ [Backend] Uploaded image for patient ${patientId}`);
      return result;
    } catch (error) {
      console.error(`❌ [Backend] Failed to upload image:`, error);
      throw error;
    }
  }

  /**
   * Get all images for a patient
   * @param {string} patientId - Patient UUID
   */
  static async listByPatient(patientId) {
    try {
      const images = await patientImageService.getImagesByPatient(patientId);
      console.log(`✅ [Backend] Loaded ${images.length} images for patient ${patientId}`);
      return images;
    } catch (error) {
      console.error(`❌ [Backend] Failed to load images:`, error);
      throw error;
    }
  }

  /**
   * Get image by ID
   * @param {string} id - Image UUID
   */
  static async get(id) {
    try {
      return await patientImageService.getImage(id);
    } catch (error) {
      console.error(`❌ [Backend] Failed to get image ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get download URL for an image
   * @param {string} id - Image UUID
   */
  static getDownloadUrl(id) {
    return patientImageService.getDownloadUrl(id);
  }

  /**
   * Delete an image
   * @param {string} id - Image UUID
   */
  static async delete(id) {
    try {
      await patientImageService.deleteImage(id);
      console.log(`✅ [Backend] Deleted image ${id}`);
    } catch (error) {
      console.error(`❌ [Backend] Failed to delete image ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update image description
   * @param {string} id - Image UUID
   * @param {string} description - New description
   */
  static async updateDescription(id, description) {
    try {
      const result = await patientImageService.updateDescription(id, description);
      console.log(`✅ [Backend] Updated description for image ${id}`);
      return result;
    } catch (error) {
      console.error(`❌ [Backend] Failed to update image description:`, error);
      throw error;
    }
  }
}

// Export entities for use throughout the app
export { Patient, PatientImage };
export const Workspace = MockWorkspace;

// Export for testing/debugging
export { mockWorkspaces };