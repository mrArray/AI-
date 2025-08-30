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

  // 获取LLM提供商列表
  async getLLMProviders() {
    // GET /llm/providers/
    return apiClient.get('/llm/providers/');
  }

  // 获取LLM模型列表
  async getLLMModels(provider_id) {
    // GET /models/?provider_id=...
    const params = provider_id ? { provider_id } : {};
    return apiClient.get('/llm/models/', { params });
  }
}

export const coreAPI = new CoreAPI();