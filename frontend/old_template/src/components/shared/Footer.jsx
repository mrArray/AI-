import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

// Language strings
const translations = {
  zh: {
    copyright: '© 2024 AI论文排版助手. 智能文档格式化，让排版更简单.',
    poweredBy: 'Powered by DeepSeek AI'
  },
  en: {
    copyright: '© 2024 AI Paper Formatting Assistant. Smart document formatting made simple.',
    poweredBy: 'Powered by DeepSeek AI'
  }
};

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <p className="text-muted mb-0">{t.copyright}</p>
          </div>
          <div className="col-md-6 text-end">
            <small className="text-muted">{t.poweredBy}</small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
