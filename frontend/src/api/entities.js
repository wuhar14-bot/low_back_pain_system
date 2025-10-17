import { base44 } from './base44Client';
import generatedPatients from '../../generated_patients.json';

// Default mock data for local development
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

const mockPatients = generatedPatients;

// Mock Entity classes that simulate Base44 API
class MockPatient {
  static async list(sortOrder = "-created_date") {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Sort mock data
    const sorted = [...mockPatients].sort((a, b) => {
      if (sortOrder === "-created_date") {
        return new Date(b.created_date) - new Date(a.created_date);
      }
      return new Date(a.created_date) - new Date(b.created_date);
    });

    return sorted;
  }

  static async get(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPatients.find(p => p.id === id) || null;
  }

  static async create(data) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newPatient = {
      id: `patient-${Date.now()}`,
      created_date: new Date().toISOString(),
      ...data
    };
    mockPatients.push(newPatient);
    return newPatient;
  }

  static async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockPatients.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPatients[index] = { ...mockPatients[index], ...data };
      return mockPatients[index];
    }
    return null;
  }

  static async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockPatients.findIndex(p => p.id === id);
    if (index !== -1) {
      const deleted = mockPatients.splice(index, 1)[0];
      return deleted;
    }
    throw new Error("Patient not found");
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