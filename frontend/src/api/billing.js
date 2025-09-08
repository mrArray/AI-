// 计费相关API
import { apiClient } from './client';
import { buildQueryString, normalizePaginatedResponse } from './utils';

class BillingAPI {
  // Helper method to add authorization header
  getAuthConfig(token) {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  // 获取套餐列表
  async getPackages(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.get(`/billing/packages/${query}`);
    return normalizePaginatedResponse(data);
  }
  async updateBillingPackage(packageId, packageData, token) {
    return apiClient.patch(`/billing/packages/${packageId}/`, packageData, this.getAuthConfig(token));
  }
  async createBillingPackage(packageData, token) {
    return apiClient.post('/billing/packages/', packageData, this.getAuthConfig(token));
  }
  async deleteBillingPackage(packageId, token) {
    return apiClient.delete(`/billing/packages/${packageId}/`, this.getAuthConfig(token));
  }

  // 获取价格信息
  async getPricingInfo(token) {
    return apiClient.get('/billing/pricing/', this.getAuthConfig(token));
  }

  // 获取用户交易记录
  async getTransactions(params = {}, token) {
    const query = buildQueryString(params);
    const data = await apiClient.get(`/billing/transactions/${query}`, this.getAuthConfig(token));
    return normalizePaginatedResponse(data);
  }

  // 购买套餐
  async purchasePackage(packageId ,token) {
    return apiClient.post('/billing/purchase/', {
      package_id: packageId,
    }, this.getAuthConfig(token));
  }

  // 获取用户订阅列表
  async getSubscriptions(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.get(`/billing/subscriptions/${query}`);
    return normalizePaginatedResponse(data);
  }

  // 取消订阅
  async cancelSubscription(subscriptionId) {
    return apiClient.post(`/billing/subscriptions/${subscriptionId}/cancel/`);
  }

  // 获取用户账单信息
  async getBillingInfo() {
    return apiClient.get('/billing/info/');
  }

  // 更新账单信息
  async updateBillingInfo(billingData) {
    return apiClient.patch('/billing/info/', billingData);
  }

  // 获取支付方式列表
  async getPaymentMethods() {
    const data = await apiClient.get('/billing/payment-methods/');
    return normalizePaginatedResponse(data);
  }

  // 添加支付方式
  async addPaymentMethod(paymentData) {
    return apiClient.post('/billing/payment-methods/', paymentData);
  }

  // 删除支付方式
  async deletePaymentMethod(methodId) {
    return apiClient.delete(`/billing/payment-methods/${methodId}/`);
  }

  // 设置默认支付方式
  async setDefaultPaymentMethod(methodId) {
    return apiClient.post(`/billing/payment-methods/${methodId}/set-default/`);
  }

  // 获取积分历史（兼容旧接口）
  async getCreditHistory(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.get(`/billing/transactions/${query}`);
    return normalizePaginatedResponse(data);
  }

  // 管理员接口 - 调整用户积分
  async adjustUserCredits(userId, amount, reason) {
    return apiClient.post('/billing/admin/adjust-credits/', {
      user_id: userId,
      amount,
      reason,
    });
  }

  // 管理员接口 - 获取账单统计
  async getBillingStats(params = {}) {
    const query = buildQueryString(params);
    return apiClient.get(`/billing/admin/stats/${query}`);
  }
}

export const billingAPI = new BillingAPI();