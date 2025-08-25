import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

// Language strings
const translations = {
  zh: {
    loading: '加载中...'
  },
  en: {
    loading: 'Loading...'
  }
};

const LoadingSpinner = ({ size = 'md', fullscreen = false }) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  // Size classes
  const spinnerSize = size === 'sm' ? 'spinner-border-sm' : 
                      size === 'lg' ? 'spinner-border spinner-border-lg' : 
                      'spinner-border';
  
  // If fullscreen, render a centered overlay
  if (fullscreen) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 1050 }}>
        <div className="text-center">
          <div className={`${spinnerSize} text-primary mb-2`} role="status">
            <span className="visually-hidden">{t.loading}</span>
          </div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }
  
  // Regular inline spinner
  return (
    <div className="d-inline-block">
      <div className={`${spinnerSize} text-primary`} role="status">
        <span className="visually-hidden">{t.loading}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
