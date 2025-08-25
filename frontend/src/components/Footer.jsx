import React from 'react';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation('home');
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold">
                {t('header.logoText')}
              </span>
            </div>
            <p className="mt-4 text-gray-400">
              {t('footer.slogan')}
            </p>
          </div>
          
          {/* Links Section - About Us */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {t('footer.about.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition">
                  {t('footer.about.items.0')}
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-400 hover:text-white transition">
                  {t('footer.about.items.1')}
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-white transition">
                  {t('footer.about.items.2')}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition">
                  {t('footer.about.items.3')}
                </a>
              </li>
            </ul>
          </div>
          
          {/* Templates Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {t('footer.templates.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/templates" className="text-gray-400 hover:text-white transition">
                  {t('footer.templates.items.0')}
                </a>
              </li>
              <li>
                <a href="/templates" className="text-gray-400 hover:text-white transition">
                  {t('footer.templates.items.1')}
                </a>
              </li>
              <li>
                <a href="/templates" className="text-gray-400 hover:text-white transition">
                  {t('footer.templates.items.2')}
                </a>
              </li>
              <li>
                <a href="/templates" className="text-gray-400 hover:text-white transition">
                  {t('footer.templates.items.3')}
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {t('footer.contact.title')}
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {t('footer.contact.email')}
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {t('footer.contact.address')}
              </li>
            </ul>
          </div>
        </div>
        
      </div>
    </footer>
  );
}

export default Footer;
