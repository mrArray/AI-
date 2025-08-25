import { useState, useCallback } from 'react';
import { normalizeError } from '../api/utils';

/**
 * 通用的API调用Hook，管理loading、error和data状态
 * 
 * @example
 * const { data, loading, error, execute } = useApiCall(
 *   async (params) => await papersAPI.getFormats(params),
 *   { onSuccess: (data) => console.log(data) }
 * );
 */
export function useApiCall(apiFunction, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const normalizedError = normalizeError(err);
      setError(normalizedError);
      
      if (options.onError) {
        options.onError(normalizedError);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

/**
 * 用于处理分页API调用的Hook
 * 
 * @example
 * const {
 *   data,
 *   loading,
 *   error,
 *   page,
 *   hasMore,
 *   loadMore,
 *   refresh
 * } = usePaginatedApiCall(
 *   async (page) => await papersAPI.getHistory({ page, limit: 10 })
 * );
 */
export function usePaginatedApiCall(apiFunction, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(async (pageNum, isRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(pageNum);
      
      if (isRefresh) {
        setData(result.data);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      
      setHasMore(!!result.next);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const normalizedError = normalizeError(err);
      setError(normalizedError);
      
      if (options.onError) {
        options.onError(normalizedError);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, options]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const nextPage = page + 1;
    await loadPage(nextPage);
    setPage(nextPage);
  }, [hasMore, loading, page, loadPage]);

  const refresh = useCallback(async () => {
    setPage(1);
    await loadPage(1, true);
  }, [loadPage]);

  return {
    data,
    loading,
    error,
    page,
    hasMore,
    loadMore,
    refresh,
  };
}

/**
 * 用于处理表单提交的Hook
 * 
 * @example
 * const {
 *   submitting,
 *   error,
 *   fieldErrors,
 *   submit
 * } = useFormSubmit(
 *   async (data) => await authAPI.register(data),
 *   { onSuccess: () => navigate('/login') }
 * );
 */
export function useFormSubmit(apiFunction, options = {}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const submit = useCallback(async (formData) => {
    try {
      setSubmitting(true);
      setError(null);
      setFieldErrors({});
      
      const result = await apiFunction(formData);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const normalizedError = normalizeError(err);
      setError(normalizedError.message);
      
      // 提取字段错误
      if (normalizedError.details) {
        const errors = {};
        Object.entries(normalizedError.details).forEach(([field, value]) => {
          if (Array.isArray(value)) {
            errors[field] = value[0];
          } else if (typeof value === 'string') {
            errors[field] = value;
          }
        });
        setFieldErrors(errors);
      }
      
      if (options.onError) {
        options.onError(normalizedError);
      }
      
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [apiFunction, options]);

  const clearErrors = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  return {
    submitting,
    error,
    fieldErrors,
    submit,
    clearErrors,
  };
}