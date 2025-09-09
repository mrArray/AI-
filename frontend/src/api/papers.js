// 论文相关API
import { apiClient } from './client';
import { buildQueryString, normalizePaginatedResponse, handleStreamResponse } from './utils';

class PapersAPI {


  getAuthConfig(token) {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }
  // 获取论文格式列表
  async getFormats(language) {
    const query = buildQueryString({ language });
    const data = await apiClient.get(`/papers/formats/${query}`);
    return normalizePaginatedResponse(data);
  }

  // 获取单个格式详情
  async getFormatDetail(formatId) {
    return apiClient.get(`/papers/formats/${formatId}/`);
  }

  // 使用LLM格式化论文
  async formatWithLLM(params) {
    const { content, file, format_id, title, language } = params;
    
    const formData = new FormData();
    formData.append('format_id', format_id);
    formData.append('language', language || 'zh-CN');
    
    if (title) {
      formData.append('title', title);
    }
    
    if (file) {
      formData.append('file', file);
    } else if (content) {
      formData.append('content', content);
    }

    return apiClient.upload('/papers/formats/format/', formData);
  }

  // 获取模板列表
  async getTemplates(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.get(`/papers/templates/${query}`);
    return normalizePaginatedResponse(data);
  }

  // 搜索模板
  async searchTemplates(searchParams) {
    const query = buildQueryString(searchParams);
    const data = await apiClient.get(`/papers/templates/search/${query}`);
    return normalizePaginatedResponse(data);
  }

  // 获取精选模板
  async getFeaturedTemplates(language) {
    const query = buildQueryString({ language });
    const data = await apiClient.get(`/papers/templates/featured/${query}`);
    return normalizePaginatedResponse(data);
  }

  // 获取推荐模板
  async getRecommendedTemplates(language) {
    const query = buildQueryString({ language });
    const data = await apiClient.get(`/papers/templates/recommended/${query}`);
    return normalizePaginatedResponse(data);
  }

  // 生成论文
  async generatePaper(params) {
    return apiClient.post('/papers/generate/', params);
  }

  // 流式生成论文
  async* generatePaperStream(params) {
    const response = await fetch(
      `${apiClient.baseURL}/papers/generate/stream/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.accessToken}`,
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '生成失败');
    }

    yield* handleStreamResponse(response);
  }

  // 验证论文
  async validatePaper(content) {
    return apiClient.post('/papers/validate/', { content });
  }

  // 导出论文
  async exportPaper(paperId, format) {
    const query = buildQueryString({ format });
    const response = await fetch(
      `${apiClient.baseURL}/papers/export/${query}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiClient.accessToken}`,
        },
        body: JSON.stringify({ paper_id: paperId }),
      }
    );

    if (!response.ok) {
      throw new Error('导出失败');
    }

    // 获取文件名
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `paper.${format}`;

    // 下载文件
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // 获取生成历史
  async getHistory(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.get(`/papers/history/${query}`);
    return normalizePaginatedResponse(data);
  }

  // 获取论文详情
  async getPaperDetail(paperId) {
    return apiClient.get(`/papers/${paperId}/`);
  }

  // 删除论文
  async deletePaper(paperId) {
    return apiClient.delete(`/papers/${paperId}/`);
  }

  // 提交反馈
  async submitFeedback(feedback) {
    return apiClient.post('/papers/feedback/', feedback);
  }

  // 获取反馈列表
  async getFeedbackList(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.get(`/papers/feedback/${query}`);
    return normalizePaginatedResponse(data);
  }

  // AI Paper Formatting (HomePage integration)
  async aiFormatPaper({ file, requirements, output_format, title, language, token, timeout = 120000 }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requirements', requirements);
    formData.append('output_format', output_format);
    if (title) formData.append('title', title);
    if (language) formData.append('language', language);

    // Use fetch with timeout
    const apiUrl = apiClient.baseURL + '/papers/ai-format/';
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(id);
      if (!response.ok) {
        let errorMsg = '请求失败';
        try {
          const errJson = await response.json();
          errorMsg = errJson.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      if (output_format === 'pdf' || output_format === 'docx') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        let filename = 'formatted_paper.' + output_format;
        return {
          file_url: url,
          file_name: filename,
          content_type: blob.type || '',
        };
      }
      // For md/latex, expect JSON
      return await response.json();
    } catch (err) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error('请求超时，请稍后重试');
      }
      throw err;
    }
  }
}

export const papersAPI = new PapersAPI();