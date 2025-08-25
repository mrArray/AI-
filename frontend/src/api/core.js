// 核心LLM功能相关API
import { apiClient } from './client';
import { handleStreamResponse } from './utils';

class CoreAPI {
  // 生成内容
  async generateContent(params) {
    return apiClient.post('/llm/generate/', params);
  }

  // 流式生成内容
  async* streamContent(params) {
    const response = await fetch(
      `${apiClient.baseURL}/llm/stream/`,
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

  // 检测语言
  async detectLanguage(text) {
    return apiClient.post('/llm/detect-language/', { text });
  }

  // 获取提示词模板
  async getPromptTemplates() {
    return apiClient.get('/llm/prompt-templates/');
  }

  // 获取LLM提供商列表
  async getLLMProviders() {
    return apiClient.get('/llm/providers/');
  }

  // 获取LLM模型列表
  async getLLMModels(provider) {
    const params = provider ? { provider } : {};
    return apiClient.get('/llm/models/', { params });
  }
}

export const coreAPI = new CoreAPI();