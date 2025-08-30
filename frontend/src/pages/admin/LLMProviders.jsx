
import React, { useState, useEffect } from 'react';
import { coreAPI } from '../../api/core';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus,
  Server,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Settings,
  Zap
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import { useTranslation } from 'react-i18next';


const LLMProviders = () => {
  const { t } = useTranslation('dashboard');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    async function fetchProviders() {
      setLoading(true);
      try {
        // Use the correct endpoint for providers list
        const res = await coreAPI.getLLMProviders();
        let data = res.data || res;
        console.log('Providers API response:', data);
        // Ensure data is always an array
        if (data && !Array.isArray(data)) {
          data = [data];
        }
        setProviders(data || []);
      } catch (e) {
        console.error('Failed to fetch providers:', e);
        setProviders([]);
      }
      setLoading(false);
    }
    fetchProviders();
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Provider Name',
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Server className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{item.provider_type}</div>
          </div>
        </div>
      )
    },
    {
      key: 'base_url',
      label: 'Base URL',
      render: (value) => (
        <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
          {value}
        </div>
      )
    },
    {
      key: 'models',
      label: 'Models',
      render: (value, item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {Array.isArray(item.models) ? item.models.length : 0} models
        </span>
      )
    },
    {
      key: 'last_test',
      label: 'Status',
      render: (value, item) => {
        const statusConfig = {
          success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', text: 'Healthy' },
          warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100', text: 'Warning' },
          error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', text: 'Error' }
        };
        
        const config = statusConfig[value] || statusConfig.error;
        const Icon = config.icon;
        
        return (
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded-full ${config.bg}`}>
              <Icon className={`w-3 h-3 ${config.color}`} />
            </div>
            <span className="text-sm text-gray-900">{config.text}</span>
          </div>
        );
      }
    },
    {
      key: 'is_active',
      label: 'Active',
      type: 'boolean',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'is_default',
      label: 'Default',
      render: (value) => (
        value ? (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            <Zap className="w-3 h-3 mr-1" />
            Default
          </span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      type: 'date',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    }
  ];

  const handleEdit = (provider) => {
    console.log('Edit provider:', provider);
    // Navigate to edit page
  };

  const handleDelete = (provider) => {
    console.log('Delete provider:', provider);
    // Show confirmation dialog
  };

  const handleView = (provider) => {
    console.log('View provider:', provider);
    // Navigate to detail page
  };

  const handleTestConnection = async (provider) => {
    console.log('Testing connection for:', provider);
    // Implement connection test
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('llmProviders.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('llmProviders.description')}
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/admin/providers/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('llmProviders.addProvider')}
          </Link>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('llmProviders.totalProviders')}</p>
              <p className="text-lg font-semibold text-gray-900">{providers.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 shadow"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('llmProviders.active')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {providers.filter(p => p.is_active).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 shadow"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('llmProviders.default')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {providers.find(p => p.is_default)?.name || t('llmProviders.none')}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 shadow"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('llmProviders.totalModels')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {providers.reduce((sum, p) => sum + p.models_count, 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <DataTable
          data={providers}
          columns={columns}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchable={true}
          filterable={true}
          pagination={true}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg p-6 shadow"
      >
  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('llmProviders.quickActions.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleTestConnection()}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{t('llmProviders.quickActions.testAllConnections')}</p>
              <p className="text-sm text-gray-500">{t('llmProviders.quickActions.verifyAllConnections')}</p>
            </div>
          </button>

          <Link
            to="/admin/providers/import"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Server className="w-5 h-5 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{t('llmProviders.quickActions.importConfig')}</p>
              <p className="text-sm text-gray-500">{t('llmProviders.quickActions.importSettings')}</p>
            </div>
          </Link>

          <Link
            to="/admin/providers/export"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{t('llmProviders.quickActions.exportConfig')}</p>
              <p className="text-sm text-gray-500">{t('llmProviders.quickActions.exportSettings')}</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LLMProviders;

