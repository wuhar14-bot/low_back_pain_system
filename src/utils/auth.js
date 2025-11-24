/**
 * 认证工具函数
 * Authentication Utility Functions
 *
 * 处理工作室/医生信息的接收、存储和Token管理
 * Handles workspace/doctor info reception, storage, and token management
 */

import { AUTH_CONFIG } from '../api/config';

/**
 * 从URL参数获取工作室和医生信息
 * Get workspace and doctor info from URL parameters
 *
 * 支持两种方式:
 * 1. 直接传递ID: ?workspaceId=xxx&doctorId=yyy
 * 2. JWT Token: ?token=xxx (包含workspaceId和doctorId)
 */
export function initializeAuthFromUrl() {
    const params = new URLSearchParams(window.location.search);

    // 方式1: 直接从URL参数获取
    const workspaceId = params.get('workspaceId');
    const doctorId = params.get('doctorId');

    if (workspaceId && doctorId) {
        console.log('✅ Received workspace/doctor IDs from URL parameters');

        // 保存到localStorage
        localStorage.setItem(AUTH_CONFIG.WORKSPACE_ID_KEY, workspaceId);
        localStorage.setItem(AUTH_CONFIG.DOCTOR_ID_KEY, doctorId);

        // 清除URL参数 (避免暴露敏感信息)
        window.history.replaceState({}, document.title, window.location.pathname);

        return {
            workspaceId,
            doctorId,
            isValid: true
        };
    }

    // 方式2: 从JWT Token获取
    const token = params.get('token');
    if (token) {
        const context = parseTokenAndStore(token);
        if (context) {
            console.log('✅ Received workspace/doctor IDs from JWT token');

            // 清除URL参数
            window.history.replaceState({}, document.title, window.location.pathname);

            return context;
        }
    }

    // 方式3: 从localStorage读取 (已登录)
    const storedWorkspace = localStorage.getItem(AUTH_CONFIG.WORKSPACE_ID_KEY);
    const storedDoctor = localStorage.getItem(AUTH_CONFIG.DOCTOR_ID_KEY);

    if (storedWorkspace && storedDoctor) {
        console.log('✅ Using stored workspace/doctor IDs from localStorage');
        return {
            workspaceId: storedWorkspace,
            doctorId: storedDoctor,
            isValid: true
        };
    }

    // 未找到认证信息
    console.warn('⚠️  No authentication info found');
    return {
        workspaceId: null,
        doctorId: null,
        isValid: false
    };
}

/**
 * 解析JWT Token并存储信息
 * Parse JWT token and store information
 *
 * @param {string} token - JWT token字符串
 * @returns {Object|null} - 解析后的上下文对象,失败返回null
 */
function parseTokenAndStore(token) {
    try {
        // JWT Token格式: header.payload.signature
        // 我们需要解码payload部分
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }

        // Base64解码payload
        const payload = JSON.parse(atob(parts[1]));

        // 提取信息
        const workspaceId = payload.workspaceId || payload.workspace_id;
        const doctorId = payload.doctorId || payload.doctor_id;
        const userName = payload.userName || payload.user_name || payload.name;

        if (!workspaceId || !doctorId) {
            throw new Error('Token missing required fields');
        }

        // 存储Token和信息
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
        localStorage.setItem(AUTH_CONFIG.WORKSPACE_ID_KEY, workspaceId);
        localStorage.setItem(AUTH_CONFIG.DOCTOR_ID_KEY, doctorId);
        if (userName) {
            localStorage.setItem(AUTH_CONFIG.USER_NAME_KEY, userName);
        }

        return {
            workspaceId,
            doctorId,
            userName,
            isValid: true
        };
    } catch (error) {
        console.error('❌ Failed to parse JWT token:', error);
        return null;
    }
}

/**
 * 获取当前工作室ID
 * Get current workspace ID
 */
export function getWorkspaceId() {
    return localStorage.getItem(AUTH_CONFIG.WORKSPACE_ID_KEY);
}

/**
 * 获取当前医生ID
 * Get current doctor ID
 */
export function getDoctorId() {
    return localStorage.getItem(AUTH_CONFIG.DOCTOR_ID_KEY);
}

/**
 * 获取当前用户名
 * Get current user name
 */
export function getUserName() {
    return localStorage.getItem(AUTH_CONFIG.USER_NAME_KEY);
}

/**
 * 获取认证Token
 * Get authentication token
 */
export function getAuthToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

/**
 * 检查是否已认证
 * Check if authenticated
 */
export function isAuthenticated() {
    const workspaceId = getWorkspaceId();
    const doctorId = getDoctorId();
    return !!(workspaceId && doctorId);
}

/**
 * 获取完整的认证上下文
 * Get complete authentication context
 */
export function getAuthContext() {
    return {
        workspaceId: getWorkspaceId(),
        doctorId: getDoctorId(),
        userName: getUserName(),
        token: getAuthToken(),
        isValid: isAuthenticated()
    };
}

/**
 * 清除认证信息 (登出)
 * Clear authentication info (logout)
 */
export function clearAuth() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.WORKSPACE_ID_KEY);
    localStorage.removeItem(AUTH_CONFIG.DOCTOR_ID_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_NAME_KEY);
    console.log('✅ Authentication info cleared');
}

/**
 * 创建认证请求头
 * Create authentication headers
 */
export function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * React Hook: 使用认证上下文
 * React Hook: Use authentication context
 */
import { useState, useEffect } from 'react';

export function useAuth() {
    const [authContext, setAuthContext] = useState(getAuthContext());

    useEffect(() => {
        // 初始化时从URL读取
        const urlContext = initializeAuthFromUrl();
        if (urlContext.isValid) {
            setAuthContext(urlContext);
        }
    }, []);

    return authContext;
}
