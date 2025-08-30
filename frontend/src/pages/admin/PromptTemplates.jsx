
import React, { useState, useEffect } from 'react';
import { coreAPI } from '../../api/core';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  Zap,
  Globe,
  Tag,
  Calendar,
  Eye,
  Copy
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import { useTranslation } from 'react-i18next';


const PromptTemplates = () => {
  const { t } = useTranslation('dashboard');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      try {
        const res = await coreAPI.getPromptTemplates();
        let data = res.data || res;
        console.log('PromptTemplates API response:', data);
        // Ensure data is always an array
        if (data && !Array.isArray(data)) {
          data = [data];
        }
        setTemplates(data || []);
      } catch (e) {
        console.error('Failed to fetch prompt templates:', e);
        setTemplates([]);
      }
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value) => value
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      )
    }
  ];

  const handleEdit = (template) => {
    console.log('Edit template:', template);
  };

  const handleDelete = (template) => {
    console.log('Delete template:', template);
  };

  const handleView = (template) => {
    console.log('View template:', template);
  };

  const handleDuplicate = (template) => {
    console.log('Duplicate template:', template);
  };

  const languageStats = templates.reduce((acc, template) => {
    acc[template.language] = (acc[template.language] || 0) + 1;
    return acc;
  }, {});

  const typeStats = templates.reduce((acc, template) => {
    acc[template.prompt_type] = (acc[template.prompt_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('promptTemplates.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('promptTemplates.description')}
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/admin/templates/new"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('promptTemplates.createTemplate')}
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
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('promptTemplates.totalTemplates')}</p>
              <p className="text-lg font-semibold text-gray-900">{templates.length}</p>
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('promptTemplates.active')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {templates.filter(t => t.is_active).length}
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('promptTemplates.languages')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {Object.keys(languageStats).length}
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <Eye className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('promptTemplates.totalUsage')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {templates.reduce((sum, t) => sum + t.usage_count, 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Template Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('promptTemplates.byLanguage')}</h3>
          <div className="space-y-3">
            {Object.entries(languageStats).map(([language, count]) => (
              <div key={language} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900 uppercase">{language}</span>
                </div>
                <span className="text-sm text-gray-600">{t('promptTemplates.templatesCount', { count })}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-6 shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('promptTemplates.byType')}</h3>
          <div className="space-y-3">
            {Object.entries(typeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{type.replace('_', ' ')}</span>
                </div>
                <span className="text-sm text-gray-600">{t('promptTemplates.templatesCount', { count })}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <DataTable
          data={templates}
          columns={columns}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchable={true}
          filterable={true}
          pagination={true}
          actions={true}
        />
      </motion.div>

      {/* Popular Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg p-6 shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('promptTemplates.mostUsed')}</h3>
          <Link to="/admin/templates/analytics" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            {t('promptTemplates.viewAnalytics')}
          </Link>
        </div>
        <div className="space-y-4">
          {templates
            .sort((a, b) => b.usage_count - a.usage_count)
            .slice(0, 3)
            .map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-sm text-gray-500">{t('promptTemplates.type.' + template.prompt_type, { defaultValue: template.prompt_type.replace('_', ' ') })}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{t('promptTemplates.uses', { count: template.usage_count })}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(template)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="p-1 text-gray-400 hover:text-green-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PromptTemplates;

