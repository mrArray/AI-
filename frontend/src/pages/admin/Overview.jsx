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

const Overview = () => {
  const stats = [
    {
      name: 'LLM Providers',
      value: '4',
      change: '+1',
      changeType: 'positive',
      icon: Server,
      color: 'blue',
      href: '/admin/providers'
    },
    {
      name: 'Active Models',
      value: '12',
      change: '+3',
      changeType: 'positive',
      icon: Brain,
      color: 'green',
      href: '/admin/models'
    },
    {
      name: 'Prompt Templates',
      value: '8',
      change: '0',
      changeType: 'neutral',
      icon: FileText,
      color: 'purple',
      href: '/admin/templates'
    },
    {
      name: 'API Calls Today',
      value: '1,247',
      change: '+15%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'orange',
      href: '/admin/analytics'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'provider_added',
      message: 'New provider "Anthropic Claude" was added',
      time: '2 minutes ago',
      status: 'success',
      user: 'Admin User'
    },
    {
      id: 2,
      type: 'model_updated',
      message: 'GPT-4 model configuration updated',
      time: '15 minutes ago',
      status: 'info',
      user: 'Admin User'
    },
    {
      id: 3,
      type: 'template_created',
      message: 'New prompt template "Code Review" created',
      time: '1 hour ago',
      status: 'success',
      user: 'Admin User'
    },
    {
      id: 4,
      type: 'provider_error',
      message: 'Connection test failed for OpenAI provider',
      time: '2 hours ago',
      status: 'error',
      user: 'System'
    },
    {
      id: 5,
      type: 'config_updated',
      message: 'System configuration updated',
      time: '3 hours ago',
      status: 'info',
      user: 'Admin User'
    }
  ];

  const quickActions = [
    {
      name: 'Add Provider',
      description: 'Connect a new LLM provider',
      icon: Server,
      href: '/admin/providers/new',
      color: 'blue'
    },
    {
      name: 'Create Model',
      description: 'Add a new model configuration',
      icon: Brain,
      href: '/admin/models/new',
      color: 'green'
    },
    {
      name: 'New Template',
      description: 'Create a prompt template',
      icon: FileText,
      href: '/admin/templates/new',
      color: 'purple'
    },
    {
      name: 'System Config',
      description: 'Update system settings',
      icon: Settings,
      href: '/admin/config',
      color: 'gray'
    }
  ];

  const systemHealth = [
    { name: 'OpenAI Provider', status: 'healthy', latency: '120ms' },
    { name: 'Anthropic Provider', status: 'healthy', latency: '95ms' },
    { name: 'Local Provider', status: 'warning', latency: '250ms' },
    { name: 'Database', status: 'healthy', latency: '15ms' }
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
    <div className="space-y-4">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Admin!</h1>
            <p className="text-blue-100 mt-2">
              Your LLM infrastructure is running smoothly. Here's what's happening today.
            </p>
          </div>
          <div className="hidden md:block">
            <Activity className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-all cursor-pointer"
            >
              <Link to={stat.href} className="block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">from last week</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-lg shadow"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Link to="/admin/activity" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
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
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
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
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className={`p-2 rounded-lg bg-${action.color}-100 mr-3`}>
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
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
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

