class AuthService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    this.accessToken = null;
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // 添加认证头
    if (this.accessToken && !options.skipAuth) {
      config.headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Token过期自动刷新
      if (response.status === 401 && this.refreshToken && !options.skipRefresh) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
          return fetch(url, config);
        }
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await this.request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access, data.refresh);
        return { success: true, user: data.user };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || '登录失败' };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  async sendVerificationCode(email) {
    try {
      const response = await this.request('/auth/pre-register-email/', {
        method: 'POST',
        body: JSON.stringify({ email }),
        skipAuth: true,
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.detail };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.email?.[0] || error.error || '发送验证码失败' 
        };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  async register(userData) {
    try {
      const response = await this.request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
        skipAuth: true,
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.detail };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.email?.[0] || error.username?.[0] || error.verification_code?.[0] || error.error || '注册失败' 
        };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.request('/auth/profile/', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.error || '更新用户信息失败' 
        };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  async getProfileDetail() {
    try {
      const response = await this.request('/auth/profile/');
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.error || '获取用户信息失败' 
        };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  async getUserStats() {
    try {
      const response = await this.request('/auth/stats/');
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.error || '获取用户统计失败' 
        };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  async uploadAvatar(avatarFile) {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await this.request('/auth/profile/', {
        method: 'POST',
        body: formData,
        headers: {
          // 不设置Content-Type，让浏览器自动设置multipart/form-data边界
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.error || '头像上传失败' 
        };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  async getCreditHistory() {
    try {
      const response = await this.request('/billing/transactions/');
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data: data.results || data };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.error || '获取积分历史失败' 
        };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      const response = await this.request('/auth/change-password/', {
        method: 'POST',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.error || '密码修改失败' 
        };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  async verifyEmail(email, code) {
    try {
      const response = await this.request('/auth/pre-register-verify/', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
        skipAuth: true,
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.detail };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || '验证失败' };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  async resetPassword(email) {
    try {
      const response = await this.request('/auth/reset-password/', {
        method: 'POST',
        body: JSON.stringify({ email }),
        skipAuth: true,
      });

      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || '发送失败' };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) return false;

    try {
      const response = await this.request('/auth/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh: this.refreshToken }),
        skipAuth: true,
        skipRefresh: true,
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access, data.refresh || this.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearTokens();
    return false;
  }

  async validateToken() {
    if (!this.accessToken && this.refreshToken) {
      return await this.refreshAccessToken();
    }
    return !!this.accessToken;
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    // 安全存储策略：refresh token存储在localStorage
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    // Access token存储在内存中，页面刷新时通过refresh token获取
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  async logout() {
    try {
      // 调用后端退出API
      await this.request('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: this.refreshToken }),
      });
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  getStoredUserData() {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  setUserData(userData) {
    localStorage.setItem('user_data', JSON.stringify(userData));
  }

  // 微信登录预留接口
  async wechatLogin(code) {
    try {
      const response = await this.request('/wechat/login/', {
        method: 'POST',
        body: JSON.stringify({ code }),
        skipAuth: true,
      });

      const data = await response.json();
      
      if (response.ok) {
        this.setTokens(data.access, data.refresh);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error, available: data.available };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  async getWechatConfig() {
    try {
      const response = await this.request('/wechat/login/', {
        method: 'GET',
        skipAuth: true,
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Get WeChat config failed:', error);
    }
    
    return { wechat_login_enabled: false };
  }
}

export const authService = new AuthService(); 