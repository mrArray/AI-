import React, { useState, useEffect } from 'react';
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

const PromptTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockTemplates = [
      {
        id: 1,
        name: 'Code Review Assistant',
        language: 'en',
        prompt_type: 'code_review',
        description: 'Template for reviewing code and providing feedback',
        template: 'Please review the following code and provide constructive feedback:\n\n{code}\n\nFocus on:\n- Code quality\n- Best practices\n- Potential bugs\n- Performance improvements',
        variables: 'code',
        is_active: true,
        is_default: true,
        created_at: '2024-01-15T10:30:00Z',
        usage_count: 245
      },
      {
        id: 2,
        name: 'Document Summarizer',
        language: 'en',
        prompt_type: 'summarization',
        description: 'Template for summarizing long documents',
        template: 'Please provide a concise summary of the following document:\n\n{document}\n\nSummary should include:\n- Key points\n- Main conclusions\n- Action items (if any)',
        variables: 'document',
        is_active: true,
        is_default: false,
        created_at: '2024-01-16T14:20:00Z',
        usage_count: 189
      },
      {
        id: 3,
        name: 'Email Composer',
        language: 'en',
        prompt_type: 'email_generation',
        description: 'Template for composing professional emails',
        template: 'Compose a professional email with the following details:\n\nTo: {recipient}\nSubject: {subject}\nTone: {tone}\nKey points: {key_points}\n\nPlease make it clear, concise, and appropriate for business communication.',
        variables: 'recipient, subject, tone, key_points',
        is_active: true,
        is_default: false,
        created_at: '2024-01-17T09:45:00Z',
        usage_count: 156
      },
      {
        id: 4,
        name: 'Bug Report Analyzer',
        language: 'en',
        prompt_type: 'bug_analysis',
        description: 'Template for analyzing bug reports',
        template: 'Analyze the following bug report and provide:\n\n{bug_report}\n\n1. Severity assessment\n2. Potential root causes\n3. Suggested investigation steps\n4. Workaround recommendations',
        variables: 'bug_report',
        is_active: false,
        is_default: false,
        created_at: '2024-01-18T16:30:00Z',
        usage_count: 67
      },
      {
        id: 5,
        name: '中文文档翻译',
        language: 'zh-CN',
        prompt_type: 'translation',
        description: '用于翻译技术文档的模板',
        template: '请将以下文档翻译成中文，保持技术术语的准确性：\n\n{document}\n\n翻译要求：\n- 保持原文格式\n- 技术术语使用标准译名\n- 语言自然流畅',
        variables: 'document',
        is_active: true,
        is_default: false,
        created_at: '2024-01-19T11:15:00Z',
        usage_count: 98
      }
    ];

    setTimeout(() => {
      setTemplates(mockTemplates);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Template Name',
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{item.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'language',
      label: 'Language',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 uppercase">{value}</span>
        </div>
      )
    },
    {
      key: 'prompt_type',
      label: 'Type',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Tag className="w-3 h-3 mr-1" />
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'usage_count',
      label: 'Usage',
      render: (value) => (
        <div className="text-sm text-gray-900">
          <span className="font-medium">{value}</span>
          <span className="text-gray-500 ml-1">times</span>
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded-full ${value ? 'bg-green-100' : 'bg-gray-100'}`}>
            {value ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-gray-500" />
            )}
          </div>
          <span className="text-sm text-gray-900">{value ? 'Active' : 'Inactive'}</span>
          {item.is_default && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
              <Zap className="w-3 h-3 mr-1" />
              Default
            </span>
          )}
        </div>
      )
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
          <h1 className="text-2xl font-bold text-gray-900">Prompt Templates</h1>
          <p className="text-gray-600 mt-1">
            Create and manage reusable prompt templates for various tasks
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
            Create Template
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
              <p className="text-sm font-medium text-gray-600">Total Templates</p>
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
              <p className="text-sm font-medium text-gray-600">Active</p>
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
              <p className="text-sm font-medium text-gray-600">Languages</p>
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
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates by Language</h3>
          <div className="space-y-3">
            {Object.entries(languageStats).map(([language, count]) => (
              <div key={language} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900 uppercase">{language}</span>
                </div>
                <span className="text-sm text-gray-600">{count} templates</span>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates by Type</h3>
          <div className="space-y-3">
            {Object.entries(typeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{type.replace('_', ' ')}</span>
                </div>
                <span className="text-sm text-gray-600">{count} templates</span>
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
          <h3 className="text-lg font-semibold text-gray-900">Most Used Templates</h3>
          <Link to="/admin/templates/analytics" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Analytics
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
                    <p className="text-sm text-gray-500">{template.prompt_type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{template.usage_count} uses</span>
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

