// 核心LLM功能相关API
import { apiClient } from './client';
import { handleStreamResponse } from './utils';

class CoreAPI {
  // 生成内容
  async generateContent(params) {
    // POST /generate/
    return apiClient.post('/generate/', params);
  }

  // 流式生成内容
  async* streamContent(params) {
    // POST /stream/ (SSE streaming)
    const response = await fetch(
      `${apiClient.baseURL}/stream/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiClient.accessToken ? { 'Authorization': `Bearer ${apiClient.accessToken}` } : {})
        },
        body: JSON.stringify(params),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Streaming failed');
    }
    yield* handleStreamResponse(response);
  }

  // 检测语言
  async detectLanguage(content) {
    // POST /detect-language/
    return apiClient.post('/detect-language/', { content });
  }

  // 获取提示词模板
  async getPromptTemplates(params = {}) {
    // GET /prompt-templates/?language=...&prompt_type=...
    return apiClient.get('/llm/prompt-templates/', { params });
  }

  // === LLM Provider CRUD ===
  
  // 获取LLM提供商列表 (legacy endpoint - active only)
  async getLLMProviders() {
    // GET /llm/providers/
    return apiClient.get('/llm/providers/');
  }

  // 获取所有LLM提供商 (CRUD endpoint - includes inactive)
  async getAllLLMProviders(params = {}) {
    // GET /llm/providers/ (ViewSet)
    return apiClient.get('/llm/providers/', { params });
  }

  // 获取单个LLM提供商
  async getLLMProvider(id) {
    // GET /llm/providers/:id/
    return apiClient.get(`/llm/providers/${id}/`);
  }

  // 创建LLM提供商
  async createLLMProvider(data, token) {
    // POST /llm/providers/ with auth token in header
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return apiClient.post('/llm/providers/', data, config);
  }

  // 更新LLM提供商 (完整更新)
  async updateLLMProvider(id, data) {
    // PUT /llm/providers/:id/
    return apiClient.put(`/llm/providers/${id}/`, data);
  }

  // 部分更新LLM提供商
  async partialUpdateLLMProvider(id, data) {
    // PATCH /llm/providers/:id/
    return apiClient.patch(`/llm/providers/${id}/`, data);
  }

  // 删除LLM提供商
  async deleteLLMProvider(id) {
    // DELETE /llm/providers/:id/
    return apiClient.delete(`/llm/providers/${id}/`);
  }

  // === LLM Model CRUD ===
  
  // 获取LLM模型列表 (legacy endpoint - active only)
  async getLLMModels(provider_id) {
    // GET /llm/models/?provider_id=...
    const params = provider_id ? { provider_id } : {};
    return apiClient.get('/llm/models/', { params });
  }

  // 获取所有LLM模型 (CRUD endpoint - includes inactive)
  async getAllLLMModels(params = {}) {
    // GET /llm/models/ (ViewSet)
    return apiClient.get('/llm/models/', { params });
  }

  // 获取单个LLM模型
  async getLLMModel(id) {
    // GET /llm/models/:id/
    return apiClient.get(`/llm/models/${id}/`);
  }

  // 创建LLM模型
  async createLLMModel(data) {
    // POST /llm/models/
    return apiClient.post('/llm/models/', data);
  }

  // 更新LLM模型 (完整更新)
  async updateLLMModel(id, data) {
    // PUT /llm/models/:id/
    return apiClient.put(`/llm/models/${id}/`, data);
  }

  // 部分更新LLM模型
  async partialUpdateLLMModel(id, data) {
    // PATCH /llm/models/:id/
    return apiClient.patch(`/llm/models/${id}/`, data);
  }

  // 删除LLM模型
  async deleteLLMModel(id) {
    // DELETE /llm/models/:id/
    return apiClient.delete(`/llm/models/${id}/`);
  }

  // === Prompt Template CRUD ===
  
  // 获取所有提示词模板 (CRUD endpoint - includes inactive)
  async getAllPromptTemplates(params = {}) {
    // GET /llm/prompt-templates/ (ViewSet)
    return apiClient.get('/llm/prompt-templates/', { params });
  }

  // 获取单个提示词模板
  async getPromptTemplate(id) {
    // GET /llm/prompt-templates/:id/
    return apiClient.get(`/llm/prompt-templates/${id}/`);
  }

  // 创建提示词模板
  async createPromptTemplate(data) {
    // POST /llm/prompt-templates/
    return apiClient.post('/llm/prompt-templates/', data);
  }

  // 更新提示词模板 (完整更新)
  async updatePromptTemplate(id, data) {
    // PUT /llm/prompt-templates/:id/
    return apiClient.put(`/llm/prompt-templates/${id}/`, data);
  }

  // 部分更新提示词模板
  async partialUpdatePromptTemplate(id, data) {
    // PATCH /llm/prompt-templates/:id/
    return apiClient.patch(`/llm/prompt-templates/${id}/`, data);
  }

  // 删除提示词模板
  async deletePromptTemplate(id) {
    // DELETE /llm/prompt-templates/:id/
    return apiClient.delete(`/llm/prompt-templates/${id}/`);
  }
}


// Export the singleton instance
export const coreAPI = new CoreAPI();

