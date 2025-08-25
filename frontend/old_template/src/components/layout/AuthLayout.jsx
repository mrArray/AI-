import React from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import { useLanguage } from '../../contexts/LanguageContext';

const translations = {
  zh: {
    backToLogin: '返回登录'
  },
  en: {
    backToLogin: 'Back to Login'
  }
};

const AuthLayout = ({ children, showBackLink = false }) => {
  const { language } = useLanguage();
  const t = translations[language] || translations['zh'];

  return (
    <>
      <Navbar user={null} onLogout={() => {}} />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            {children}
            {showBackLink && (
              <div className="text-center mt-3">
                <a href="/login" className="text-decoration-none">{t.backToLogin}</a>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AuthLayout;