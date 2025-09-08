// 格式化积分价格 API
import { apiClient } from './client';
import { buildQueryString, normalizePaginatedResponse } from './utils';

class FormatCreditPriceAPI {
  // Helper to add auth header
  getAuthConfig(token) {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  // 获取所有格式化积分价格
  async getAll(params = {}, token) {
    const query = buildQueryString(params);
    const data = await apiClient.get(`/papers/format-credit-prices/${query}`, this.getAuthConfig(token));
    return normalizePaginatedResponse(data);
  }

  // 获取单个价格
  async get(id, token) {
    return apiClient.get(`/papers/format-credit-prices/${id}/`, this.getAuthConfig(token));
  }

  // 创建价格
  async create(data, token) {
    return apiClient.post('/papers/format-credit-prices/', data, this.getAuthConfig(token));
  }

  // 更新价格
  async update(id, data, token) {
    return apiClient.put(`/papers/format-credit-prices/${id}/`, data, this.getAuthConfig(token));
  }

  // 删除价格
  async delete(id, token) {
    return apiClient.delete(`/papers/format-credit-prices/${id}/`, this.getAuthConfig(token));
  }
}

export const formatCreditPriceAPI = new FormatCreditPriceAPI();
