// 认证相关API
import { apiClient } from './client';
import { extractFieldErrors } from './utils';

class AuthAPI {
  // 登录
  async login(email, password) {
    try {
      const data = await apiClient.post('/auth/login/', { email, password }, { skipAuth: true });
      
      // 保存tokens
      apiClient.setTokens(data.access, data.refresh);
      
      // 保存用户数据
      if (data.user) {
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        fieldErrors: extractFieldErrors(error.data)
      };
    }
  }

  // 注册
  async register(userData) {
    try {
      const data = await apiClient.post('/auth/register/', userData, { skipAuth: true });
      return { success: true, message: data.detail || '注册成功' };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        fieldErrors: extractFieldErrors(error.data)
      };
    }
  }

  // 发送验证码
  async sendVerificationCode(email) {
    try {
      const data = await apiClient.post('/auth/pre-register-email/', { email }, { skipAuth: true });
      return { success: true, message: data.detail || '验证码已发送' };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        fieldErrors: extractFieldErrors(error.data)
      };
    }
  }

  // 验证邮箱验证码
  async verifyCode(email, verification_code) {
    try {
      const data = await apiClient.post('/auth/pre-register-verify/', 
        { email, verification_code }, 
        { skipAuth: true }
      );
      return { success: true, message: data.detail || '验证成功' };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        fieldErrors: extractFieldErrors(error.data)
      };
    }
  }

  // 退出登录
  async logout() {
    try {
      const refreshToken = apiClient.refreshToken;
      if (refreshToken) {
        await apiClient.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      apiClient.clearTokens();
    }
  }

  // 刷新token
  async refreshToken() {
    return apiClient.refreshAccessToken();
  }

  // 修改密码
  async changePassword(oldPassword, newPassword) {
    try {
      const data = await apiClient.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      return { success: true, message: data.detail || '密码修改成功' };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        fieldErrors: extractFieldErrors(error.data)
      };
    }
  }

  // 重置密码请求
  async requestPasswordReset(email) {
    try {
      const data = await apiClient.post('/auth/reset-password/', { email }, { skipAuth: true });
      return { success: true, message: data.detail || '重置邮件已发送' };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        fieldErrors: extractFieldErrors(error.data)
      };
    }
  }

  // 重置密码确认
  async confirmPasswordReset(token, password) {
    try {
      const data = await apiClient.post('/auth/reset-password/confirm/', 
        { token, password }, 
        { skipAuth: true }
      );
      return { success: true, message: data.detail || '密码重置成功' };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        fieldErrors: extractFieldErrors(error.data)
      };
    }
  }

  // 获取用户资料
  async getProfile() {
    try {
      const data = await apiClient.get('/auth/profile/');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 更新用户资料
  async updateProfile(profileData) {
    try {
      const data = await apiClient.patch('/auth/profile/', profileData);
      
      // 更新本地存储的用户数据
      const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        fieldErrors: extractFieldErrors(error.data)
      };
    }
  }

  // 获取用户统计信息
  async getUserStats() {
    try {
      const data = await apiClient.get('/auth/stats/');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 上传头像
  async uploadAvatar(avatarFile) {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const data = await apiClient.upload('/auth/profile/', formData);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 获取用户偏好设置
  async getPreferences() {
    try {
      const data = await apiClient.get('/auth/preferences/');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 更新用户偏好设置
  async updatePreferences(preferences) {
    try {
      const data = await apiClient.patch('/auth/preferences/', preferences);
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        fieldErrors: extractFieldErrors(error.data)
      };
    }
  }

  // 删除账户
  async deleteAccount(password) {
    try {
      await apiClient.post('/auth/delete-account/', { password });
      apiClient.clearTokens();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        fieldErrors: extractFieldErrors(error.data)
      };
    }
  }

  // 获取存储的用户数据
  getStoredUserData() {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // 检查是否已登录
  isAuthenticated() {
    return !!apiClient.accessToken || !!apiClient.refreshToken;
  }
}

export const authAPI = new AuthAPI();