import React, { createContext, useContext, useState } from 'react';

// Toast类型
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// 创建Toast上下文
const ToastContext = createContext({
  showToast: () => {},
  hideToast: () => {},
  toasts: [],
});

// Toast提供者组件
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // 显示Toast消息
  const showToast = ({ type, message, duration = 5000 }) => {
    const id = Date.now();
    
    // 添加新的Toast
    setToasts((prevToasts) => [...prevToasts, { id, type, message }]);
    
    // 设置自动消失
    if (duration) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
    
    return id;
  };

  // 隐藏特定Toast
  const hideToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// 自定义钩子，方便组件使用Toast功能
export const useToast = () => useContext(ToastContext);

// Toast容器组件
const ToastContainer = () => {
  const { toasts, hideToast } = useContext(ToastContext);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
      ))}
    </div>
  );
};

// 单个Toast组件
const Toast = ({ toast, onClose }) => {
  const { type, message } = toast;

  // 根据类型设置样式
  const getToastStyles = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return {
          containerClass: 'bg-green-50 border-green-400',
          iconClass: 'text-green-400',
          textClass: 'text-green-800',
          icon: (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        };
      case TOAST_TYPES.ERROR:
        return {
          containerClass: 'bg-red-50 border-red-400',
          iconClass: 'text-red-400',
          textClass: 'text-red-800',
          icon: (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
        };
      case TOAST_TYPES.WARNING:
        return {
          containerClass: 'bg-yellow-50 border-yellow-400',
          iconClass: 'text-yellow-400',
          textClass: 'text-yellow-800',
          icon: (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
        };
      case TOAST_TYPES.INFO:
      default:
        return {
          containerClass: 'bg-blue-50 border-blue-400',
          iconClass: 'text-blue-400',
          textClass: 'text-blue-800',
          icon: (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className={`rounded-md border-l-4 p-4 shadow-md transform transition-all duration-300 ease-in-out ${styles.containerClass}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.iconClass}`}>{styles.icon}</div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${styles.textClass}`}>{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${styles.iconClass} hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50`}
            >
              <span className="sr-only">关闭</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastContext;
