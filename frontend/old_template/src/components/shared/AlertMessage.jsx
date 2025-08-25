import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

// Language strings
const translations = {
  zh: {
    error: '错误',
    warning: '警告',
    info: '信息',
    success: '成功'
  },
  en: {
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    success: 'Success'
  }
};

const AlertMessage = ({ type, message, onClose }) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  // Map alert types to Bootstrap classes and icons
  const alertClass = type === 'error' ? 'danger' : 
                    type === 'warning' ? 'warning' : 
                    type === 'info' ? 'info' : 'success';
  
  const iconClass = type === 'error' ? 'exclamation-circle' : 
                   type === 'warning' ? 'exclamation-triangle' : 
                   type === 'info' ? 'info-circle' : 'check-circle';

  return (
    <div className={`alert alert-${alertClass} alert-dismissible fade show`} role="alert">
      <i className={`fas fa-${iconClass} me-2`}></i>
      {message}
      <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
  );
};

export default AlertMessage;
