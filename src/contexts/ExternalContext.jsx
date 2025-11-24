import React, { createContext, useState, useContext, useEffect } from 'react';

const ExternalContext = createContext();

export const useExternal = () => {
  const context = useContext(ExternalContext);
  if (!context) {
    throw new Error('useExternal must be used within an ExternalProvider');
  }
  return context;
};

export const ExternalProvider = ({ children }) => {
  const [workspaceId, setWorkspaceId] = useState(null);
  const [workspaceName, setWorkspaceName] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [doctorName, setDoctorName] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isExternalMode, setIsExternalMode] = useState(false);

  useEffect(() => {
    // 解析 URL 参数
    const params = new URLSearchParams(window.location.search);

    const workspace = params.get('workspace');
    const workspaceNameParam = params.get('workspaceName');
    const doctor = params.get('doctor');
    const doctorNameParam = params.get('doctorName');
    const token = params.get('token');

    // 如果有外部参数，则进入外部模式
    if (workspace || doctor || token) {
      setIsExternalMode(true);

      if (workspace) {
        setWorkspaceId(workspace);
        localStorage.setItem('currentWorkspaceId', workspace);
      }

      if (workspaceNameParam) {
        setWorkspaceName(workspaceNameParam);
        localStorage.setItem('currentWorkspaceName', workspaceNameParam);
      }

      if (doctor) {
        setDoctorId(doctor);
        localStorage.setItem('currentDoctorId', doctor);
      }

      if (doctorNameParam) {
        setDoctorName(doctorNameParam);
        localStorage.setItem('currentDoctorName', doctorNameParam);
      }

      if (token) {
        setAuthToken(token);
        localStorage.setItem('external_auth_token', token);
      }

      console.log('✅ 外部参数已加载:', {
        workspaceId: workspace,
        workspaceName: workspaceNameParam,
        doctorId: doctor,
        doctorName: doctorNameParam,
        hasToken: !!token
      });
    } else {
      // 尝试从 localStorage 恢复
      const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      const storedWorkspaceName = localStorage.getItem('currentWorkspaceName');
      const storedDoctorId = localStorage.getItem('currentDoctorId');
      const storedDoctorName = localStorage.getItem('currentDoctorName');
      const storedToken = localStorage.getItem('external_auth_token');

      if (storedWorkspaceId || storedDoctorId) {
        setIsExternalMode(true);
        setWorkspaceId(storedWorkspaceId);
        setWorkspaceName(storedWorkspaceName);
        setDoctorId(storedDoctorId);
        setDoctorName(storedDoctorName);
        setAuthToken(storedToken);

        console.log('✅ 从 localStorage 恢复外部参数');
      } else {
        setIsExternalMode(false);
        console.log('⚠️ 未检测到外部参数，使用本地模式');
      }
    }
  }, []);

  const clearExternalData = () => {
    setWorkspaceId(null);
    setWorkspaceName(null);
    setDoctorId(null);
    setDoctorName(null);
    setAuthToken(null);
    setIsExternalMode(false);

    localStorage.removeItem('currentWorkspaceId');
    localStorage.removeItem('currentWorkspaceName');
    localStorage.removeItem('currentDoctorId');
    localStorage.removeItem('currentDoctorName');
    localStorage.removeItem('external_auth_token');
  };

  const value = {
    workspaceId,
    workspaceName,
    doctorId,
    doctorName,
    authToken,
    isExternalMode,
    clearExternalData
  };

  return (
    <ExternalContext.Provider value={value}>
      {children}
    </ExternalContext.Provider>
  );
};
