import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { authApi } from '../api/auth';
import api from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<{ message: string; data?: any; success?: boolean }>;
  logout: () => void;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = sessionStorage.getItem('accessToken');
      const storedUser = sessionStorage.getItem('user');

      if (accessToken && storedUser) {
        try {
          // Set token in API client
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          // Try to get fresh user data
          const response = await authApi.getMe();
          
          setState({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Update stored user
          sessionStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
          // Token might be expired, clear storage
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    
    const { accessToken, refreshToken, user } = response.data;
    
    // Store tokens in sessionStorage for reduced persistence
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(user));
    
    // Set token in API client
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    const response = await authApi.register({
      ...data,
      confirmPassword: data.password, // Add confirmPassword for API
    });
    return response;
  }, []);

  const logout = useCallback(() => {
    // Call logout API (optional, for server-side cleanup)
    authApi.logout().catch(() => {
      // Ignore logout API errors
    });
    
    // Clear session storage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    
    // Clear API client
    delete api.defaults.headers.common['Authorization'];
    
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    const response = await authApi.verifyEmail(email, otp);
    // Just return the response - user will need to login manually
    return response;
  }, []);

  const resendOTP = useCallback(async (email: string) => {
    await authApi.resendOTP(email);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await authApi.forgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
    await authApi.resetPassword({ email, otp, newPassword, confirmPassword: newPassword });
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const response = await authApi.updateMe(data);
    
    const updatedUser = response.user;
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    
    setState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword(currentPassword, newPassword);
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    verifyEmail,
    resendOTP,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
