// 内容管理相关API
import { apiClient } from './client';
import { buildQueryString, normalizePaginatedResponse } from './utils';

class ContentAPI {
  // 获取落地页数据
  async getLandingPageData(language) {
    const query = buildQueryString({ language });
    return apiClient.get(`/content/landing-page/${query}`);
  }

  // 获取落地页区块列表
  async getLandingPageSections(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.get(`/content/sections/${query}`);
    return normalizePaginatedResponse(data);
  }

  // 获取用户评价列表
  async getTestimonials(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.get(`/content/testimonials/${query}`);
    return normalizePaginatedResponse(data);
  }

  // 获取功能特性列表
  async getFeatures(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.get(`/content/features/${query}`);
    return normalizePaginatedResponse(data);
  }

  // 获取常见问题列表
  async getFAQs(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.get(`/content/faqs/${query}`);
    return normalizePaginatedResponse(data);
  }

  // 获取本地化文本
  async getLocalizationTexts(language, section) {
    const query = buildQueryString({ language, section });
    return apiClient.get(`/content/localization/${query}`);
  }

  // 获取可用语言列表
  async getAvailableLanguages() {
    return apiClient.get('/content/languages/');
  }

  // 搜索内容
  async searchContent(searchParams) {
    const query = buildQueryString(searchParams);
    const data = await apiClient.get(`/content/search/${query}`);
    return normalizePaginatedResponse(data);
  }
}

export const contentAPI = new ContentAPI();