
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  ChevronRight,
  Plus,
  Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';


const Header = ({ onToggleSidebar, sidebarOpen }) => {
  const { t } = useTranslation('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (pathSegments.length === 1 && pathSegments[0] === 'admin') {
      return [{ name: t('sidebar.overview', 'Overview'), path: '/admin' }];
    }

    breadcrumbs.push({ name: t('sidebar.title', 'Admin Panel'), path: '/admin' });

    const routeMap = {
      'providers': t('sidebar.providers', 'LLM Providers'),
      'models': t('sidebar.models', 'LLM Models'),
      'templates': t('sidebar.templates', 'Prompt Templates'),
      'config': t('sidebar.config', 'Configuration')
    };

    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const name = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const path = '/' + pathSegments.slice(0, i + 1).join('/');
      breadcrumbs.push({ name, path });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const currentPage = breadcrumbs[breadcrumbs.length - 1]?.name || t('header.dashboard', 'Dashboard');

  const notifications = [
    { id: 1, message: t('header.notifications.modelAdded', 'New LLM model added successfully'), time: t('header.notifications.time2min', '2 min ago'), type: 'success' },
    { id: 2, message: t('header.notifications.providerFailed', 'Provider connection test failed'), time: t('header.notifications.time5min', '5 min ago'), type: 'error' },
    { id: 3, message: t('header.notifications.configUpdated', 'System configuration updated'), time: t('header.notifications.time1hr', '1 hour ago'), type: 'info' }
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center space-x-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                <span className={`
                  text-sm font-medium truncate
                  ${index === breadcrumbs.length - 1
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                  }
                `}>
                  {crumb.name}
                </span>
              </div>
            ))}
          </nav>
        </div>
        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Quick action button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => window.location.href = '/'}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">{t('header.viewSite', 'View Site')}</span>
          </motion.button>

        </div>
      </div>


    </header>
  );
};

export default Header;

