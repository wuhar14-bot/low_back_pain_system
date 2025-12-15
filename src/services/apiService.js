/**
 * API Service Layer for Low Back Pain System
 * Replaces Base44 SDK with direct backend API calls
 *
 * Backend: .NET 7.0 + ABP vNext
 * Base URL: https://localhost:44385
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:44385';

/**
 * Base API client with common functionality
 */
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get auth token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Build headers for API requests
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error('❌ API Error Response:', errorData);

        // Handle ABP validation errors
        if (errorData.error) {
          errorMessage = errorData.error.message || errorData.error.details || errorMessage;
          if (errorData.error.validationErrors) {
            const validationMessages = errorData.error.validationErrors
              .map(e => `${e.members?.join(', ')}: ${e.message}`)
              .join('; ');
            errorMessage = `Validation failed: ${validationMessages}`;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
      }

      throw new Error(`API request failed: ${errorMessage}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  /**
   * Generic GET request
   */
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  /**
   * Generic POST request
   */
  async post(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  /**
   * Generic PUT request
   */
  async put(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  /**
   * Generic DELETE request
   */
  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }
}

/**
 * Patient API Service
 * Endpoints: /api/app/patient/*
 */
export class PatientService extends ApiClient {
  /**
   * Get all patients with pagination
   * @param {Object} params - { skipCount, maxResultCount }
   */
  async getPatients(params = {}) {
    return this.get('/api/app/patient', {
      skipCount: params.skipCount || 0,
      maxResultCount: params.maxResultCount || 10,
      ...params
    });
  }

  /**
   * Get patients by workspace ID
   * @param {string} workspaceId - Workspace UUID
   * @param {Object} params - Pagination params
   */
  async getPatientsByWorkspace(workspaceId, params = {}) {
    return this.get(`/api/app/patient/by-workspace/${workspaceId}`, params);
  }

  /**
   * Get patient by ID
   * @param {string} id - Patient UUID
   */
  async getPatientById(id) {
    return this.get(`/api/app/patient/${id}`);
  }

  /**
   * Get patient by Study ID
   * @param {string} studyId - Study ID string
   */
  async getPatientByStudyId(studyId) {
    return this.get(`/api/app/patient/by-study-id/${studyId}`);
  }

  /**
   * Check if Study ID exists
   * @param {string} studyId - Study ID to check
   * @returns {Promise<boolean>}
   */
  async isStudyIdExists(studyId) {
    return this.get(`/api/app/patient/is-study-id-exists/${studyId}`);
  }

  /**
   * Create new patient
   * @param {Object} patientData - Patient creation data
   */
  async createPatient(patientData) {
    return this.post('/api/app/patient', patientData);
  }

  /**
   * Update patient
   * @param {string} id - Patient UUID
   * @param {Object} patientData - Updated patient data
   */
  async updatePatient(id, patientData) {
    return this.put(`/api/app/patient/${id}`, patientData);
  }

  /**
   * Delete patient
   * @param {string} id - Patient UUID
   */
  async deletePatient(id) {
    return this.delete(`/api/app/patient/${id}`);
  }
}

/**
 * Authentication Service
 * Endpoints: /api/account/*
 */
export class AuthService extends ApiClient {
  /**
   * Login with username and password using OAuth 2.0 Password Grant
   * @param {string} username - Username or email
   * @param {string} password - Password
   */
  async login(username, password) {
    // ABP uses OAuth 2.0 Password Grant via OpenIddict
    // Endpoint: /connect/token (not /api/account/login)
    // Content-Type: application/x-www-form-urlencoded

    const formData = new URLSearchParams({
      grant_type: 'password',
      username: username,
      password: password,
      client_id: 'LowBackPain_App',
      scope: 'offline_access LowBackPain'
    });

    const response = await fetch(`${this.baseURL}/connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error_description: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(error.error_description || error.error || 'Login failed');
    }

    const data = await response.json();

    // Store tokens
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type,
        expires_in: data.expires_in
      };
    }

    throw new Error('No access token received');
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      await this.post('/api/account/logout');
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return this.get('/api/account/my-profile');
  }

  /**
   * Register new account
   * @param {Object} userData - { username, email, password, ... }
   */
  async register(userData) {
    return this.post('/api/account/register', userData);
  }

  /**
   * Change password
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(currentPassword, newPassword) {
    return this.post('/api/account/my-profile/change-password', {
      currentPassword,
      newPassword
    });
  }
}

/**
 * Patient Image Service
 * Endpoints: /api/app/patient-image/*
 */
export class PatientImageService extends ApiClient {
  /**
   * Upload an image for a patient
   * @param {string} patientId - Patient UUID
   * @param {File} file - File object to upload
   * @param {string} imageType - Type: xray, mri, photo, posture, other
   * @param {string} description - Optional description
   */
  async uploadImage(patientId, file, imageType, description = '') {
    const formData = new FormData();
    formData.append('patientId', patientId);
    formData.append('imageType', imageType);
    formData.append('description', description);
    formData.append('file', file);

    const token = this.getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - browser will set it with boundary

    const response = await fetch(`${this.baseURL}/api/app/patient-image/upload`, {
      method: 'POST',
      headers,
      body: formData
    });

    return this.handleResponse(response);
  }

  /**
   * Get all images for a patient
   * @param {string} patientId - Patient UUID
   */
  async getImagesByPatient(patientId) {
    return this.get(`/api/app/patient-image/by-patient/${patientId}`);
  }

  /**
   * Get image by ID
   * @param {string} id - Image UUID
   */
  async getImage(id) {
    return this.get(`/api/app/patient-image/${id}`);
  }

  /**
   * Get image download URL
   * @param {string} id - Image UUID
   */
  getDownloadUrl(id) {
    return `${this.baseURL}/api/app/patient-image/${id}/download`;
  }

  /**
   * Delete an image
   * @param {string} id - Image UUID
   */
  async deleteImage(id) {
    return this.delete(`/api/app/patient-image/${id}`);
  }

  /**
   * Update image description
   * @param {string} id - Image UUID
   * @param {string} description - New description
   */
  async updateDescription(id, description) {
    return this.put(`/api/app/patient-image/${id}/description`, { description });
  }
}

/**
 * Application Configuration Service
 * Get application settings, permissions, features
 */
export class ConfigService extends ApiClient {
  /**
   * Get application configuration
   */
  async getConfiguration() {
    return this.get('/api/abp/application-configuration');
  }

  /**
   * Get application localization
   */
  async getLocalization() {
    return this.get('/api/abp/application-localization');
  }
}

// Export singleton instances
export const patientService = new PatientService();
export const authService = new AuthService();
export const configService = new ConfigService();
export const patientImageService = new PatientImageService();

// Export default object with all services
export default {
  patient: patientService,
  auth: authService,
  config: configService,
  patientImage: patientImageService
};
