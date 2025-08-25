import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // 加载翻译文件的后端
  .use(Backend)
  // 自动检测用户语言
  .use(LanguageDetector)
  // 将i18n实例传递给react-i18next
  .use(initReactI18next)
  // 初始化i18next
  .init({
    fallbackLng: 'zh-CN',
    debug: import.meta.env.VITE_NODE_ENV === 'development',
    
    // 公共命名空间，可以在所有组件中使用   
    ns: ['common', 'profile' ,'home' ,
      'template' ,'history', 
      'document-generator'],
    defaultNS: 'common', 

    
    interpolation: {
      escapeValue: false, // React已经安全地转义了
    },
    
    backend: {
      // 翻译文件的路径
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    detection: {
      // 检测用户语言的选项
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
