import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Check if authentication is disabled via environment variable
  const isAuthDisabled = import.meta.env.VITE_DISABLE_AUTH === 'true';

  const [user, setUser] = useState(isAuthDisabled ? { username: 'test-user', id: 'test' } : null);
  const [isAuthenticated, setIsAuthenticated] = useState(isAuthDisabled);
  const [isLoading, setIsLoading] = useState(!isAuthDisabled);

  useEffect(() => {
    if (!isAuthDisabled) {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Validate token by fetching user profile
        try {
          const profile = await authService.getProfile();
          setIsAuthenticated(true);
          setUser(profile);
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    // If auth is disabled, bypass login
    if (isAuthDisabled) {
      const mockUser = { username: 'test-user', id: 'test' };
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true, user: mockUser };
    }

    try {
      // Call ABP backend login endpoint
      const response = await authService.login(username, password);

      if (response && response.access_token) {
        // Get user profile after successful login
        const profile = await authService.getProfile();
        setUser(profile);
        setIsAuthenticated(true);
        return { success: true, user: profile };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
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