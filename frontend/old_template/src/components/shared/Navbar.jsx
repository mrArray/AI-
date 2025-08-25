import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

// Language strings
const translations = {
  zh: {
    title: 'AI论文排版助手',
    formatPaper: '论文排版',
    history: '历史记录',
    earnCredits: '赚取积分',
    adminConsole: '管理员控制台',
    dashboard: '控制台概览',
    userManagement: '用户管理',
    taskManagement: '任务管理',
    credits: '积分',
    rechargeCredits: '充值积分',
    logout: '退出登录',
    login: '登录',
    register: '注册',
    switchToEnglish: 'English',
  },
  en: {
    title: 'AI Paper Formatting Assistant',
    formatPaper: 'Format Paper',
    history: 'History',
    earnCredits: 'Earn Credits',
    adminConsole: 'Admin Console',
    dashboard: 'Dashboard',
    userManagement: 'User Management',
    taskManagement: 'Task Management',
    credits: 'Credits',
    rechargeCredits: 'Recharge Credits',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    switchToChinese: '中文',
  }
};

const Navbar = ({ user, onLogout }) => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container">
        <a className="navbar-brand" href="/">
          <i className="fas fa-file-alt me-2"></i>{t.title}
        </a>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user && (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/">
                    <i className="fas fa-file-alt me-1"></i>{t.formatPaper}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/history">
                    <i className="fas fa-history me-1"></i>{t.history}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/recharge">
                    <i className="fas fa-coins me-1"></i>{t.earnCredits}
                  </a>
                </li>
                {user.isAdmin && (
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                      <i className="fas fa-cog me-1"></i>{t.adminConsole}
                    </a>
                    <ul className="dropdown-menu">
                      <li>
                        <a className="dropdown-item" href="/admin/dashboard">
                          <i className="fas fa-chart-bar me-2"></i>{t.dashboard}
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="/admin/users">
                          <i className="fas fa-users me-2"></i>{t.userManagement}
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="/admin/tasks">
                          <i className="fas fa-tasks me-2"></i>{t.taskManagement}
                        </a>
                      </li>
                    </ul>
                  </li>
                )}
              </>
            )}
          </ul>
          
          <ul className="navbar-nav">
            {/* Language switcher */}
            <li className="nav-item me-2">
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={toggleLanguage}
              >
                {language === 'zh' ? 'English' : '中文'}
              </button>
            </li>
            
            {user ? (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                  <span className="credits-badge me-2">{user.credits} {t.credits}</span>
                  <i className="fas fa-user me-1"></i>{user.email}
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="/recharge">
                      <i className="fas fa-credit-card me-2"></i>{t.rechargeCredits}
                    </a>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a className="dropdown-item" href="#" onClick={(e) => {
                      e.preventDefault();
                      onLogout();
                    }}>
                      <i className="fas fa-sign-out-alt me-2"></i>{t.logout}
                    </a>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/login">{t.login}</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/register">{t.register}</a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
