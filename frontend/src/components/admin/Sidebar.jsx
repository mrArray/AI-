
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Server,
  Brain,
  FileText,
  Settings,
  X,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';


const Sidebar = ({ onClose }) => {
  const { t } = useTranslation('dashboard');
  const location = useLocation();

  const navigationItems = [
    {
      name: t('sidebar.overview', 'Overview'),
      href: '/admin',
      icon: LayoutDashboard,
      exact: true
    },
    {
      name: t('sidebar.providers', 'LLM Providers'),
      href: '/admin/providers',
      icon: Server,
      badge: t('sidebar.active', 'Active')
    },
    {
      name: t('sidebar.models', 'LLM Models'),
      href: '/admin/models',
      icon: Brain,
      badge: t('sidebar.new', 'New')
    },
    {
      name: t('sidebar.templates', 'Prompt Templates'),
      href: '/admin/templates',
      icon: FileText
    },
    {
      name: t('sidebar.config', 'Configuration'),
      href: '/admin/config',
      icon: Settings
    },
    {
      name: t('sidebar.billing', 'Billing Packages'),
      href: '/admin/billing-packages',
      icon: FileText
    },
    {
      name: t('sidebar.formatPrices', 'Format Credit Prices'),
      href: '/admin/format-credit-prices',
      icon: FileText
    }
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.href;
    }
    return location.pathname.startsWith(item.href);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{t('sidebar.title', 'Admin Panel')}</h1>
            <p className="text-sm text-gray-500">{t('sidebar.subtitle', 'LLM Management')}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.href}
                className={`
                  group flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                  ${active 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${item.badge === t('sidebar.active', 'Active') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`
                    w-4 h-4 transition-transform duration-200
                    ${active ? 'text-blue-600 rotate-90' : 'text-gray-400 group-hover:translate-x-1'}
                  `} />
                </div>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{t('sidebar.user', 'Admin User')}</p>
            <p className="text-xs text-gray-500 truncate">{t('sidebar.email', 'admin@example.com')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

