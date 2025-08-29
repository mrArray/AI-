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
  Plus
} from 'lucide-react';

const Header = ({ onToggleSidebar, sidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (pathSegments.length === 1 && pathSegments[0] === 'admin') {
      return [{ name: 'Overview', path: '/admin' }];
    }

    breadcrumbs.push({ name: 'Admin', path: '/admin' });

    const routeMap = {
      'providers': 'LLM Providers',
      'models': 'LLM Models',
      'templates': 'Prompt Templates',
      'config': 'Configuration'
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
  const currentPage = breadcrumbs[breadcrumbs.length - 1]?.name || 'Dashboard';

  const notifications = [
    { id: 1, message: 'New LLM model added successfully', time: '2 min ago', type: 'success' },
    { id: 2, message: 'Provider connection test failed', time: '5 min ago', type: 'error' },
    { id: 3, message: 'System configuration updated', time: '1 hour ago', type: 'info' }
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
          <nav className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center space-x-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                <span className={`
                  text-sm font-medium
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

        {/* Center section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search providers, models, templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Quick action button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className={`
                          w-2 h-2 rounded-full mt-2
                          ${notification.type === 'success' ? 'bg-green-500' : 
                            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
                        `}></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>

          {/* User menu */}
          <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-700">Admin</span>
          </button>
        </div>
      </div>

      {/* Page title section */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{currentPage}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your LLM infrastructure and configurations
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Last updated: 2 minutes ago</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

