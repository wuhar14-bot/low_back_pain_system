/**
 * API配置文件
 * API Configuration
 *
 * 用于配置后端API的基础URL和端点
 * Configures backend API base URL and endpoints
 */

// 从环境变量获取API URL,默认为本地开发环境
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API端点配置
export const API_ENDPOINTS = {
    // 患者管理
    PATIENTS: '/api/app/patient',
    PATIENTS_BY_WORKSPACE: (workspaceId) => `/api/app/patient/by-workspace/${workspaceId}`,
    PATIENTS_BY_DOCTOR: (doctorId) => `/api/app/patient/by-doctor/${doctorId}`,
    PATIENT_POSE_ANALYSIS: (id) => `/api/app/patient/${id}/pose-analysis`,

    // Python服务 (通过.NET API转发)
    OCR: '/api/services/ocr',
    OCR_HEALTH: '/api/services/ocr/health',
    POSE: '/api/services/pose',
    POSE_HEALTH: '/api/services/pose/health',

    // 工作室和医生 (如果需要)
    WORKSPACES: '/api/app/workspace',
    DOCTORS: '/api/app/doctor',
};

// API请求超时配置 (毫秒)
export const API_TIMEOUT = {
    DEFAULT: 30000,      // 30秒
    OCR: 60000,          // OCR可能需要更长时间
    POSE: 60000,         // 姿态分析也需要更长时间
    UPLOAD: 120000,      // 文件上传2分钟
};

// 认证配置
export const AUTH_CONFIG = {
    // Token存储键
    TOKEN_KEY: 'authToken',
    WORKSPACE_ID_KEY: 'workspaceId',
    DOCTOR_ID_KEY: 'doctorId',
    USER_NAME_KEY: 'userName',

    // Token刷新时间 (毫秒)
    REFRESH_INTERVAL: 3600000,  // 1小时
};

// 调试模式
export const DEBUG_MODE = import.meta.env.MODE === 'development';

if (DEBUG_MODE) {
    console.log('🔧 API Configuration:');
    console.log('  - Base URL:', API_BASE_URL);
    console.log('  - Mode:', import.meta.env.MODE);
}
