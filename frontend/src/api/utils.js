// API工具函数和错误处理

// 标准化错误响应
export function normalizeError(error) {
  if (error instanceof Error) {
    // API错误
    if (error.name === 'ApiError') {
      return {
        message: error.message,
        status: error.status,
        details: error.data,
      };
    }
    
    // 网络错误
    return {
      message: error.message || '网络错误，请稍后重试',
      status: 0,
      details: null,
    };
  }
  
  // 未知错误
  return {
    message: '未知错误',
    status: 0,
    details: error,
  };
}

// 提取字段错误信息
export function extractFieldErrors(errorData) {
  const fieldErrors = {};
  
  if (!errorData || typeof errorData !== 'object') {
    return fieldErrors;
  }
  
  // 处理Django REST Framework的错误格式
  Object.entries(errorData).forEach(([field, value]) => {
    if (Array.isArray(value)) {
      fieldErrors[field] = value[0]; // 取第一个错误信息
    } else if (typeof value === 'string') {
      fieldErrors[field] = value;
    }
  });
  
  return fieldErrors;
}

// 构建查询字符串
export function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// 处理分页响应
export function normalizePaginatedResponse(response) {
  // DRF分页格式
  if ('results' in response && 'count' in response) {
    return {
      data: response.results,
      total: response.count,
      next: response.next,
      previous: response.previous,
    };
  }
  
  // 非分页格式
  return {
    data: Array.isArray(response) ? response : [response],
    total: Array.isArray(response) ? response.length : 1,
    next: null,
    previous: null,
  };
}

// 重试配置
export const retryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1秒
  retryableStatuses: [502, 503, 504], // 网关错误
};

// 带重试的请求包装器
export async function withRetry(requestFn, config = retryConfig) {
  let lastError;
  
  for (let i = 0; i <= config.maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // 检查是否应该重试
      const shouldRetry = 
        i < config.maxRetries &&
        error.name === 'ApiError' &&
        config.retryableStatuses.includes(error.status);
      
      if (!shouldRetry) {
        throw error;
      }
      
      // 等待后重试
      await new Promise(resolve => 
        setTimeout(resolve, config.retryDelay * Math.pow(2, i))
      );
    }
  }
  
  throw lastError;
}

// 处理流式响应
export async function* handleStreamResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            yield data;
          } catch (e) {
            // 忽略无法解析的行
            console.warn('Failed to parse stream chunk:', line);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}