import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '../api/base44Client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Simple token validation - no API call needed
        setIsAuthenticated(true);
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
        setUser(userInfo);
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // For now, we'll use a simple client-side validation
      // In production, this should call a proper authentication API
      const validCredentials = {
        'kafwu@connect.hku.hk': '2749'
      };

      if (validCredentials[email] === password) {
        const token = btoa(`${email}:${Date.now()}`); // Simple token generation
        const userInfo = {
          email: email,
          name: 'Hao Wu',
          role: 'Researcher'
        };

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_info', JSON.stringify(userInfo));

        setUser(userInfo);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};