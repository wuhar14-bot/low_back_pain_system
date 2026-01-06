/**
 * 患者API客户端
 * Patient API Client
 *
 * 与后端.NET API通信的患者管理接口
 * Patient management interface for communicating with .NET backend API
 */

import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT, OCR_SERVICE_URL, POSE_SERVICE_URL } from './config';
import { getAuthHeaders, getWorkspaceId, getDoctorId } from '../utils/auth';

// 创建axios实例
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT.DEFAULT,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器 - 自动添加认证Token
apiClient.interceptors.request.use(
    (config) => {
        const authHeaders = getAuthHeaders();
        config.headers = {
            ...config.headers,
            ...authHeaders
        };
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response || error);

        if (error.response) {
            // 服务器返回错误
            const { status, data } = error.response;

            if (status === 401) {
                console.error('❌ Unauthorized - Please login again');
                // 可以在这里触发重新登录
            } else if (status === 403) {
                console.error('❌ Forbidden - Access denied');
            } else if (status === 404) {
                console.error('❌ Not found');
            } else if (status >= 500) {
                console.error('❌ Server error');
            }

            return Promise.reject({
                status,
                message: data.error?.message || data.message || 'Unknown error',
                details: data.error?.details || data.details
            });
        } else if (error.request) {
            // 请求已发送但没有收到响应
            console.error('❌ No response from server');
            return Promise.reject({
                message: 'Cannot connect to server',
                details: 'Please check if the backend service is running'
            });
        } else {
            // 请求配置错误
            console.error('❌ Request error:', error.message);
            return Promise.reject({
                message: error.message
            });
        }
    }
);

/**
 * 患者API
 */
export const PatientApi = {
    /**
     * 获取患者列表 (分页)
     * @param {Object} params - 查询参数
     * @param {string} params.workspaceId - 工作室ID (可选,默认使用当前登录工作室)
     * @param {string} params.doctorId - 医生ID (可选)
     * @param {number} params.skipCount - 跳过数量 (分页)
     * @param {number} params.maxResultCount - 最大返回数量
     * @param {string} params.sorting - 排序字段
     */
    async getList(params = {}) {
        const {
            workspaceId = getWorkspaceId(),
            doctorId,
            skipCount = 0,
            maxResultCount = 10,
            sorting = 'CreationTime DESC',
            ...filters
        } = params;

        const response = await apiClient.get(API_ENDPOINTS.PATIENTS, {
            params: {
                workspaceId,
                doctorId,
                skipCount,
                maxResultCount,
                sorting,
                ...filters
            }
        });

        return response;
    },

    /**
     * 获取单个患者详情
     * @param {string} id - 患者ID
     */
    async get(id) {
        const response = await apiClient.get(`${API_ENDPOINTS.PATIENTS}/${id}`);
        return response;
    },

    /**
     * 创建新患者
     * @param {Object} patientData - 患者数据
     */
    async create(patientData) {
        // 自动添加工作室和医生ID
        const data = {
            ...patientData,
            workspaceId: patientData.workspaceId || getWorkspaceId(),
            doctorId: patientData.doctorId || getDoctorId()
        };

        const response = await apiClient.post(API_ENDPOINTS.PATIENTS, data);
        console.log('✅ Created patient:', response.id);
        return response;
    },

    /**
     * 更新患者信息
     * @param {string} id - 患者ID
     * @param {Object} patientData - 更新的数据
     */
    async update(id, patientData) {
        const response = await apiClient.put(
            `${API_ENDPOINTS.PATIENTS}/${id}`,
            patientData
        );
        console.log('✅ Updated patient:', id);
        return response;
    },

    /**
     * 删除患者
     * @param {string} id - 患者ID
     */
    async delete(id) {
        await apiClient.delete(`${API_ENDPOINTS.PATIENTS}/${id}`);
        console.log('✅ Deleted patient:', id);
    },

    /**
     * 更新患者的AI姿态分析结果
     * @param {string} id - 患者ID
     * @param {Object} poseAnalysisData - 姿态分析数据
     */
    async updatePoseAnalysis(id, poseAnalysisData) {
        const response = await apiClient.put(
            API_ENDPOINTS.PATIENT_POSE_ANALYSIS(id),
            { poseAnalysisJson: JSON.stringify(poseAnalysisData) }
        );
        console.log('✅ Updated pose analysis for patient:', id);
        return response;
    },

    /**
     * 获取工作室的所有患者
     * @param {string} workspaceId - 工作室ID
     */
    async getByWorkspace(workspaceId = getWorkspaceId()) {
        const response = await apiClient.get(
            API_ENDPOINTS.PATIENTS_BY_WORKSPACE(workspaceId)
        );
        return response.items || response;
    },

    /**
     * 获取医生的所有患者
     * @param {string} doctorId - 医生ID
     */
    async getByDoctor(doctorId = getDoctorId()) {
        const response = await apiClient.get(
            API_ENDPOINTS.PATIENTS_BY_DOCTOR(doctorId)
        );
        return response.items || response;
    }
};

/**
 * OCR服务API (直接访问Python服务)
 */
export const OcrApi = {
    /**
     * 处理OCR图片
     * @param {string} base64Image - Base64编码的图片
     */
    async processImage(base64Image) {
        const response = await axios.post(
            `${OCR_SERVICE_URL}/ocr/process`,
            { image: base64Image },
            { timeout: API_TIMEOUT.OCR }
        );
        return response.data;
    },

    /**
     * 检查OCR服务健康状态
     */
    async checkHealth() {
        try {
            await axios.get(`${OCR_SERVICE_URL}/health`);
            return true;
        } catch {
            return false;
        }
    }
};

/**
 * 姿态分析服务API (直接访问Python服务)
 */
export const PoseApi = {
    /**
     * 分析静态姿态图片
     * @param {string} standingImageBase64 - 站立姿态图片 (Base64)
     * @param {string} flexionImageBase64 - 屈曲姿态图片 (Base64)
     */
    async analyzeStatic(standingImageBase64, flexionImageBase64) {
        const response = await axios.post(
            `${POSE_SERVICE_URL}/pose/analyze-static`,
            {
                standing_image: standingImageBase64,
                flexion_image: flexionImageBase64
            },
            { timeout: API_TIMEOUT.POSE }
        );
        return response.data;
    },

    /**
     * 检查姿态分析服务健康状态
     */
    async checkHealth() {
        try {
            await axios.get(`${POSE_SERVICE_URL}/health`);
            return true;
        } catch {
            return false;
        }
    }
};

// 导出默认API
export default {
    patient: PatientApi,
    ocr: OcrApi,
    pose: PoseApi
};
