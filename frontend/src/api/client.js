// API客户端基础类 - 统一处理所有API请求
class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    this.timeout = 30000; // 30秒超时
    this.accessToken = null;
    this.refreshToken = this.getStoredRefreshToken();
    this.refreshPromise = null;
  }

  // Token管理
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  getStoredRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  // 构建请求配置
  buildConfig(options = {}) {
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

    return config;
  }

  // 刷新访问令牌
  async refreshAccessToken() {
    if (!this.refreshToken) return false;

    // 避免重复刷新
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }

  async performTokenRefresh() {
    try {
      const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
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

  // 核心请求方法
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const config = this.buildConfig(options);

    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.timeout);
    config.signal = controller.signal;

    try {
      let response = await fetch(url, config);
      clearTimeout(timeoutId);

      // 处理401错误 - Token过期
      if (response.status === 401 && !options.skipAuth && !options.skipRefresh) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // 使用新token重试请求
          config.headers.Authorization = `Bearer ${this.accessToken}`;
          response = await fetch(url, config);
        }
      }

      // 处理响应
      const data = await this.parseResponse(response);
      
      if (!response.ok) {
        throw new ApiError(response.status, data);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new ApiError(0, { error: '请求超时' });
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(0, { error: '网络错误，请稍后重试' });
    }
  }

  // 解析响应
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  }

  // HTTP方法封装
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // 文件上传
  async upload(endpoint, formData, options = {}) {
    const config = {
      ...options,
      method: 'POST',
      body: formData,
      headers: {
        ...options.headers,
        // 不设置Content-Type，让浏览器自动设置
      },
    };

    if (this.accessToken && !options.skipAuth) {
      config.headers.Authorization = `Bearer ${this.accessToken}`;
    }

    return this.request(endpoint, config);
  }
}

// 自定义错误类
class ApiError extends Error {
  constructor(status, data) {
    const message = data?.error || data?.detail || '请求失败';
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// 导出单例实例
export const apiClient = new ApiClient();
export { ApiError };