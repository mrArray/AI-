
import React from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const translations = {
  zh: {},
  en: {}
};

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language] || translations['zh'];

  return (
    <>
      <Navbar user={user} onLogout={logout} />
      <main className="main-content">{children}</main>
      <Footer />
    </>
  );
};

export default MainLayout;