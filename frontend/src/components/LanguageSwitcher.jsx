import React, { useState, useEffect, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

// 创建语言上下文
const LanguageContext = createContext({
  currentLanguage: 'zh-CN',
  changeLanguage: () => {},
  languages: []
});

// 支持的语言列表
const supportedLanguages = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' }
];

// 语言提供者组件
export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'zh-CN');

  // 切换语言的函数
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setCurrentLanguage(langCode);
    // 保存到本地存储，确保页面刷新后保持选择
    localStorage.setItem('i18nextLng', langCode);
  };

  // 初始化时从本地存储获取语言设置
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang) {
      changeLanguage(savedLang);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      changeLanguage, 
      languages: supportedLanguages 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义钩子，方便组件使用语言上下文
export const useLanguage = () => useContext(LanguageContext);

// 语言切换器组件
const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // 获取当前语言对象
  const currentLangObj = languages.find(lang => lang.code === currentLanguage) || languages[0];

  // 切换下拉菜单的显示状态
  const toggleDropdown = () => setIsOpen(!isOpen);

  // 选择语言
  const selectLanguage = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && event.target.closest('.language-switcher') === null) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="language-switcher relative">
      <button 
        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 focus:outline-none"
        onClick={toggleDropdown}
      >
        <span className="text-lg">{currentLangObj.flag}</span>
        <span className="hidden md:inline">{currentLangObj.name}</span>
        <svg 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
              {t('language.select')}
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentLanguage === lang.code
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => selectLanguage(lang.code)}
                role="menuitem"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-2">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
