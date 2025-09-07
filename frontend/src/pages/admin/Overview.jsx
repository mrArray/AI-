import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Server,
  Brain,
  FileText,
  Settings,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Overview = () => {
  const { t } = useTranslation('dashboard');
  const stats = [
    {
      name: t('overview.llmProviders'),
      value: '4',
      change: '+1',
      changeType: 'positive',
      icon: Server,
      color: 'blue',
      href: '/admin/providers'
    },
    {
      name: t('overview.activeModels'),
      value: '12',
      change: '+3',
      changeType: 'positive',
      icon: Brain,
      color: 'green',
      href: '/admin/models'
    },
    {
      name: t('overview.promptTemplates'),
      value: '8',
      change: '0',
      changeType: 'neutral',
      icon: FileText,
      color: 'purple',
      href: '/admin/templates'
    },
    {
      name: t('overview.apiCallsToday'),
      value: '1,247',
      change: '+15%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'orange',
      href: '/admin/analytics'
    },
    {
      name: t('overview.billingPackages'),
      value: '6',
      change: '+2',
      changeType: 'positive',
      icon: Settings,
      color: 'teal',
      href: '/admin/billing-packages'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'provider_added',
      message: t('overview.activity.newProvider', { provider: 'Anthropic Claude' }),
      time: '2 minutes ago',
      status: 'success',
      user: t('overview.activity.providerTimeAgo', { time: '2 minutes', user: t('overview.activity.adminUser', 'Admin User') })
    },
    {
      id: 2,
      type: 'model_updated',
      message: t('overview.activity.modelUpdated', { model: 'GPT-4' }),
      time: '15 minutes ago',
      status: 'info',
      user: t('overview.activity.adminUser', 'Admin User')
    },
    {
      id: 3,
      type: 'template_created',
      message: t('overview.activity.templateCreated', { template: 'Code Review' }),
      time: '1 hour ago',
      status: 'success',
      user: t('overview.activity.adminUser', 'Admin User')
    },
    {
      id: 4,
      type: 'provider_error',
      message: t('overview.activity.connectionFailed', { provider: 'OpenAI' }),
      time: '2 hours ago',
      status: 'error',
      user: t('overview.activity.system', 'System')
    },
    {
      id: 5,
      type: 'config_updated',
      message: t('overview.activity.systemConfigUpdated'),
      time: '3 hours ago',
      status: 'info',
      user: t('overview.activity.adminUser', 'Admin User')
    }
  ];

  const quickActions = [
    {
      name: t('overview.addProvider'),
      description: t('overview.addProviderDesc'),
      icon: Server,
      href: '/admin/providers/new',
      color: 'blue'
    },
    {
      name: t('overview.createModel'),
      description: t('overview.createModelDesc'),
      icon: Brain,
      href: '/admin/models/new',
      color: 'green'
    },
    {
      name: t('overview.newTemplate'),
      description: t('overview.newTemplateDesc'),
      icon: FileText,
      href: '/admin/templates/new',
      color: 'purple'
    },
    {
      name: t('overview.systemConfig'),
      description: t('overview.systemConfigDesc'),
      icon: Settings,
      href: '/admin/config',
      color: 'gray'
    }
  ];

  const systemHealth = [
    { name: t('overview.openaiProvider'), status: 'healthy', latency: '120ms' },
    { name: t('overview.anthropicProvider'), status: 'healthy', latency: '95ms' },
    { name: t('overview.localProvider'), status: 'warning', latency: '250ms' },
    { name: t('overview.database'), status: 'healthy', latency: '15ms' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold">{t('overview.welcome')}</h1>
            <p className="text-blue-100 mt-2">
              {t('overview.subtitle')}
            </p>
          </div>
          <div className="hidden sm:block">
            <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-blue-200" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-4 sm:p-6 shadow hover:shadow-md transition-all cursor-pointer"
            >
              <Link to={stat.href} className="block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stat.value}</p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <span className={`text-xs sm:text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500 ml-1">{t('overview.fromLastWeek')}</span>
                    </div>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg bg-${stat.color}-100`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-lg shadow"
        >
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t('overview.recentActivity')}</h2>
              <Link to="/admin/activity" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                {t('overview.viewAll')}
              </Link>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{activity.user}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & System Health */}
        <div className="space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow"
          >
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Link
                        to={action.href}
                        className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className={`p-1 sm:p-2 rounded-lg bg-${action.color}-100 mr-3`}>
                          <Icon className={`w-4 h-4 text-${action.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{action.name}</p>
                          <p className="text-xs text-gray-500">{action.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow"
          >
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('overview.systemHealth')}</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                {systemHealth.map((system, index) => (
                  <motion.div
                    key={system.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(system.status)}
                      <span className="text-sm font-medium text-gray-900">{system.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{system.latency}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Overview;