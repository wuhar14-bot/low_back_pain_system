import { base44 } from './base44Client';

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

// Load patients from localStorage (real patients only, no mock data)
const loadPatients = () => {
  const stored = localStorage.getItem('realPatients');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored patients, starting fresh');
    }
  }
  return []; // Start with empty array - no mock patients!
};

// Save patients to localStorage
const savePatients = (patients) => {
  try {
    localStorage.setItem('realPatients', JSON.stringify(patients));
    console.log(`✅ Saved ${patients.length} patients to localStorage`);
  } catch (e) {
    console.error('Failed to save patients to localStorage:', e);
  }
};

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

// REAL PATIENTS ONLY - No mock data!
let mockPatients = loadPatients();

// Real Database API URL (dynamic for mobile compatibility)
const getApiUrl = () => `http://${window.location.hostname}:5003/api`;

// Real Database API Client with localStorage fallback
class MockPatient {
  static async list(sortOrder = "-created_date") {
    try {
      const response = await fetch(`${getApiUrl()}/patients?sort=${sortOrder}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const patients = await response.json();
      console.log(`✅ [DB] Loaded ${patients.length} patients from database`);

      // Sync to localStorage as backup
      mockPatients = patients;
      savePatients(patients);

      return patients;
    } catch (error) {
      console.warn('⚠️ [DB] Database unavailable, using localStorage:', error.message);
      // Fallback to localStorage
      const sorted = [...mockPatients].sort((a, b) => {
        if (sortOrder === "-created_date") {
          return new Date(b.created_date) - new Date(a.created_date);
        }
        return new Date(a.created_date) - new Date(b.created_date);
      });
      return sorted;
    }
  }

  static async get(id) {
    try {
      const response = await fetch(`${getApiUrl()}/patients/${id}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const patient = await response.json();
      console.log(`✅ [DB] Loaded patient ${id}`);
      return patient;
    } catch (error) {
      console.warn('⚠️ [DB] Using localStorage fallback:', error.message);
      return mockPatients.find(p => p.id === id) || null;
    }
  }

  static async create(data) {
    try {
      const response = await fetch(`${getApiUrl()}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const newPatient = await response.json();
      console.log(`✅ [DB] Created patient: ${newPatient.id}`);

      // Also save to localStorage as backup
      mockPatients.push(newPatient);
      savePatients(mockPatients);

      return newPatient;
    } catch (error) {
      console.warn('⚠️ [DB] Using localStorage only:', error.message);
      // Fallback to localStorage
      const newPatient = {
        id: `patient-${Date.now()}`,
        created_date: new Date().toISOString(),
        last_sync_timestamp: new Date().toISOString(),
        ...data
      };
      mockPatients.push(newPatient);
      savePatients(mockPatients);
      return newPatient;
    }
  }

  static async update(id, data) {
    try {
      const response = await fetch(`${getApiUrl()}/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const updated = await response.json();
      console.log(`✅ [DB] Updated patient: ${id}`);

      // Sync to localStorage
      const index = mockPatients.findIndex(p => p.id === id);
      if (index !== -1) {
        mockPatients[index] = updated;
      } else {
        mockPatients.push(updated);
      }
      savePatients(mockPatients);

      return updated;
    } catch (error) {
      console.warn('⚠️ [DB] Using localStorage only:', error.message);
      // Fallback to localStorage
      const index = mockPatients.findIndex(p => p.id === id);
      if (index !== -1) {
        mockPatients[index] = {
          ...mockPatients[index],
          ...data,
          last_sync_timestamp: new Date().toISOString()
        };
        savePatients(mockPatients);
        return mockPatients[index];
      }
      return null;
    }
  }

  static async delete(id) {
    try {
      const response = await fetch(`${getApiUrl()}/patients/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const deleted = await response.json();
      console.log(`✅ [DB] Deleted patient: ${id}`);

      // Remove from localStorage
      const index = mockPatients.findIndex(p => p.id === id);
      if (index !== -1) {
        mockPatients.splice(index, 1);
        savePatients(mockPatients);
      }

      return deleted;
    } catch (error) {
      console.warn('⚠️ [DB] Using localStorage only:', error.message);
      // Fallback to localStorage
      const index = mockPatients.findIndex(p => p.id === id);
      if (index !== -1) {
        const deleted = mockPatients.splice(index, 1)[0];
        savePatients(mockPatients);
        return deleted;
      }
      throw new Error("Patient not found");
    }
  }
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

// Use mock entities for local development
export const Patient = MockPatient;
export const Workspace = MockWorkspace;

// Export for testing/debugging
export { mockPatients, mockWorkspaces };