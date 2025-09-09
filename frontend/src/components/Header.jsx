import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

function Header({ activePage }) {
  const { t } = useTranslation('common');
  const { isAuthenticated, logout, user, refreshProfile } = useAuth();
  const { openLoginModal, openRegisterModal } = useModal();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // Removed local profile state, use profile from context

  React.useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    }
    // Only depend on isAuthenticated to avoid infinite loop
  }, [isAuthenticated]);

  // 处理购买积分点击
  const handleRechargeClick = () => {
    window.location.href = '/pricing';
  };

  // 处理Admin点击
  const handleAdminClick = () => {
    window.location.href = '/admin';
  };

  // 处理用户菜单项点击
  const handleUserMenuItemClick = (action) => {
    setIsUserMenuOpen(false);
    if (action === 'profile') {
      window.location.href = '/profile';
    } else if (action === 'logout') {
      logout();
    }
  };
  
  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="ml-2 text-indigo-600 text-xl font-bold whitespace-nowrap">
                {t('app.name')}
              </span>
            </div>
            <nav className="ml-10 hidden md:flex space-x-8">
                <a 
                  href="/" 
                  className={`${activePage === 'home' ? 'text-gray-900 border-b-2 border-indigo-600' : 'text-gray-500'} hover:text-indigo-600 px-3 py-2 text-sm font-medium whitespace-nowrap`}
                >
                  {t('nav.home')}
                </a>
                <a 
                  href="/pricing" 
                  className={`${activePage === 'pricing' ? 'text-gray-900 border-b-2 border-indigo-600' : 'text-gray-500'} hover:text-indigo-600 px-3 py-2 text-sm font-medium whitespace-nowrap`}
                >
                  {t('nav.pricing')}
                </a>
            </nav>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* 管理员按钮 */}
                  {user?.user_type === 'admin' && (
                    <button
                      onClick={handleAdminClick}
                      className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-900 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      {t('actions.admin')}
                    </button>
                  )}
                {/* 购买积分按钮 */}
                <button 
                  onClick={handleRechargeClick}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  {t('actions.recharge')}
                </button>

                {/* 用户菜单 */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    {/* Show avatar if available, else fallback to initial */}
                    {user?.profile?.avatar ? (
                      <img
                        src={user.profile.avatar}
                        alt="avatar"
                        className="rounded-full w-8 h-8 object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {user?.profile?.nickname?.charAt(0)?.toUpperCase() || user?.first_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium whitespace-nowrap">
                      {user?.profile?.nickname || user?.first_name || user?.email?.split('@')[0] || '用户'}
                    </span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 下拉菜单 */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                      {/* 用户信息 */}
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.profile?.nickname || user?.first_name || user?.email?.split('@')[0] || '用户'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      {/* 积分显示 */}
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{t('user.pointsBalance')}</span>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{user?.credits || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* 语言切换 */}
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{t('user.languageSetting')}</span>
                          <div className="scale-75">
                            <LanguageSwitcher />
                          </div>
                        </div>
                      </div>

                      {/* 菜单项 */}
                      <button
                        onClick={() => handleUserMenuItemClick('profile')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {t('nav.profile')}
                        </div>
                      </button>
                      <button
                        onClick={() => handleUserMenuItemClick('logout')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {t('actions.logout')}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <LanguageSwitcher />
                <button 
                  onClick={openLoginModal}
                  className="ml-4 text-gray-700 hover:text-indigo-600 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:border-indigo-300 transition-all whitespace-nowrap"
                >
                  {t('actions.login')}
                </button>
                <button 
                  onClick={openRegisterModal}
                  className="ml-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  {t('actions.register')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 点击外部关闭菜单 */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
}

export default Header;
