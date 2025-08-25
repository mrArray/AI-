import React from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language resources
import zhTranslations from './zh.json';
import enTranslations from './en.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: {
        translation: zhTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    lng: localStorage.getItem('language') || 'zh', // Default language is Chinese
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
