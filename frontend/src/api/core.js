// 核心LLM功能相关API
import { apiClient } from './client';
import { handleStreamResponse } from './utils';

class CoreAPI {
  // Helper method to add authorization header
  getAuthConfig(token) {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  // 生成内容
  async generateContent(params, token) {
    // POST /generate/
    return apiClient.post('/generate/', params, this.getAuthConfig(token));
  }

  // 流式生成内容
  async* streamContent(params, token) {
    // POST /stream/ (SSE streaming)
    const response = await fetch(
      `${apiClient.baseURL}/stream/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
  async detectLanguage(content, token) {
    // POST /detect-language/
    return apiClient.post('/detect-language/', { content }, this.getAuthConfig(token));
  }

  // 获取提示词模板
  async getPromptTemplates(params = {}, token) {
    // GET /prompt-templates/?language=...&prompt_type=...
    return apiClient.get('/llm/prompt-templates/', { 
      params,
      ...this.getAuthConfig(token)
    });
  }

  // === LLM Provider CRUD ===
  // 获取LLM提供商列表 (legacy endpoint - active only)
  async getLLMProviders(token) {
    // GET /llm/providers/
    return apiClient.get('/llm/providers/', this.getAuthConfig(token));
  }

  // 获取所有LLM提供商 (CRUD endpoint - includes inactive)
  async getAllLLMProviders(params = {}, token) {
    // GET /llm/providers/ (ViewSet)
    return apiClient.get('/llm/providers/', { 
      params,
      ...this.getAuthConfig(token)
    });
  }

  // 获取单个LLM提供商
  async getLLMProvider(id, token) {
    // GET /llm/providers/:id/
    return apiClient.get(`/llm/providers/${id}/`, this.getAuthConfig(token));
  }

  // 创建LLM提供商
  async createLLMProvider(data, token) {
    // POST /llm/providers/ with auth token in header
    return apiClient.post('/llm/providers/', data, this.getAuthConfig(token));
  }

  // 更新LLM提供商 (完整更新)
  async updateLLMProvider(id, data, token) {
    // PUT /llm/providers/:id/
    return apiClient.put(`/llm/providers/${id}/`, data, this.getAuthConfig(token));
  }

  // 部分更新LLM提供商
  async partialUpdateLLMProvider(id, data, token) {
    // PATCH /llm/providers/:id/
    return apiClient.patch(`/llm/providers/${id}/`, data, this.getAuthConfig(token));
  }

  // 删除LLM提供商
  async deleteLLMProvider(id, token) {
    // DELETE /llm/providers/:id/
    return apiClient.delete(`/llm/providers/${id}/`, this.getAuthConfig(token));
  }

  // === LLM Model CRUD ===
  // 获取LLM模型列表 (legacy endpoint - active only)
  async getLLMModels(provider_id, token) {
    // GET /llm/models/?provider_id=...
    const params = provider_id ? { provider_id } : {};
    return apiClient.get('/llm/models/', { 
      params,
      ...this.getAuthConfig(token)
    });
  }

  // 获取所有LLM模型 (CRUD endpoint - includes inactive)
  async getAllLLMModels(params = {}, token) {
    // GET /llm/models/ (ViewSet)
    return apiClient.get('/llm/models/', { 
      params,
      ...this.getAuthConfig(token)
    });
  }

  // 获取单个LLM模型
  async getLLMModel(id, token) {
    // GET /llm/models/:id/
    return apiClient.get(`/llm/models/${id}/`, this.getAuthConfig(token));
  }

  // 创建LLM模型
  async createLLMModel(data, token) {
    // POST /llm/models/
    return apiClient.post('/llm/models/', data, this.getAuthConfig(token));
  }

  // 更新LLM模型 (完整更新)
  async updateLLMModel(id, data, token) {
    // PUT /llm/models/:id/
    return apiClient.put(`/llm/models/${id}/`, data, this.getAuthConfig(token));
  }

  // 部分更新LLM模型
  async partialUpdateLLMModel(id, data, token) {
    // PATCH /llm/models/:id/
    return apiClient.patch(`/llm/models/${id}/`, data, this.getAuthConfig(token));
  }

  // 删除LLM模型
  async deleteLLMModel(id, token) {
    // DELETE /llm/models/:id/
    return apiClient.delete(`/llm/models/${id}/`, this.getAuthConfig(token));
  }

  // === Prompt Template CRUD ===
  // 获取所有提示词模板 (CRUD endpoint - includes inactive)
  async getAllPromptTemplates(params = {}, token) {
    // GET /llm/prompt-templates/ (ViewSet)
    return apiClient.get('/llm/prompt-templates/', { 
      params,
      ...this.getAuthConfig(token)
    });
  }

  // 获取单个提示词模板
  async getPromptTemplate(id, token) {
    // GET /llm/prompt-templates/:id/
    return apiClient.get(`/llm/prompt-templates/${id}/`, this.getAuthConfig(token));
  }

  // 创建提示词模板
  async createPromptTemplate(data, token) {
    // POST /llm/prompt-templates/
    return apiClient.post('/llm/prompt-templates/', data, this.getAuthConfig(token));
  }

  // 更新提示词模板 (完整更新)
  async updatePromptTemplate(id, data, token) {
    // PUT /llm/prompt-templates/:id/
    return apiClient.put(`/llm/prompt-templates/${id}/`, data, this.getAuthConfig(token));
  }

  // 部分更新提示词模板
  async partialUpdatePromptTemplate(id, data, token) {
    // PATCH /llm/prompt-templates/:id/
    return apiClient.patch(`/llm/prompt-templates/${id}/`, data, this.getAuthConfig(token));
  }

  // 删除提示词模板
  async deletePromptTemplate(id, token) {
    // DELETE /llm/prompt-templates/:id/
    return apiClient.delete(`/llm/prompt-templates/${id}/`, this.getAuthConfig(token));
  }
}

// Export the singleton instance
export const coreAPI = new CoreAPI();