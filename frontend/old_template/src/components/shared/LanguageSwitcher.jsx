import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

// Enhanced LanguageSwitcher component with i18next integration
const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();
  const { i18n, t } = useTranslation();
  
  // Sync i18n language with context language
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);
  
  return (
    <button 
      className="btn btn-sm btn-outline-secondary" 
      onClick={toggleLanguage}
      aria-label={language === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      {language === 'zh' ? t('nav.switchToEnglish') : t('nav.switchToChinese')}
    </button>
  );
};

export default LanguageSwitcher;
