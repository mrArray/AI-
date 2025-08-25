import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useTranslation } from 'react-i18next';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  
  // Check if user is already logged in on initial render
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        try {
          // You would typically validate the token with your backend here
          const userData = JSON.parse(sessionStorage.getItem('user'));
          setUser(userData);
        } catch (err) {
          console.error('Authentication error:', err);
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login({ username, password });
      const { access, refresh, user: userData } = response.data;
      
      // Store tokens in sessionStorage
      sessionStorage.setItem('accessToken', access);
      sessionStorage.setItem('refreshToken', refresh);
      
      // Store user info
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.login.loginFailed');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register({ username, email, password });
      return { success: true, message: response.data.message || t('auth.register.registrationSuccess') };
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('common.error');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Verify email function
  const verifyEmail = async (email, code) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.verify({ email, code });
      return { success: true, message: response.data.message || t('auth.verify.verificationSuccess') };
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.verify.verificationFailed');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Resend verification code
  const resendVerification = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.resendVerification(email);
      return { success: true, message: response.data.message || t('auth.verify.resendSuccess') };
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.verify.resendFailed');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Forgot password function
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.forgotPassword(email);
      return { success: true, message: response.data.message || t('auth.forgotPassword.sendSuccess') };
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.forgotPassword.sendFailed');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password function
  const resetPassword = async (email, code, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.resetPassword({ email, code, password });
      return { success: true, message: response.data.message || t('auth.resetPassword.resetSuccess') };
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.resetPassword.resetFailed');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Change password function (for logged in users)
  const changePassword = async (oldPassword, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.changePassword({ 
        old_password: oldPassword, 
        new_password: newPassword 
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.resetPassword.resetFailed');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      verifyEmail, 
      resendVerification,
      forgotPassword,
      resetPassword,
      changePassword,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
