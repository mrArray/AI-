import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus,
  Brain,
  CheckCircle,
  XCircle,
  Zap,
  DollarSign,
  Clock,
  Layers
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';

const LLMModels = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockModels = [
      {
        id: 1,
        name: 'gpt-4',
        display_name: 'GPT-4',
        provider: 'OpenAI',
        provider_id: 1,
        context_length: 8192,
        max_tokens: 4096,
        temperature_default: 0.7,
        supports_streaming: true,
        is_active: true,
        is_default: true,
        cost_per_1k_tokens: 0.03,
        created_at: '2024-01-15T10:30:00Z',
        description: 'Most capable GPT-4 model'
      },
      {
        id: 2,
        name: 'gpt-3.5-turbo',
        display_name: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        provider_id: 1,
        context_length: 4096,
        max_tokens: 2048,
        temperature_default: 0.7,
        supports_streaming: true,
        is_active: true,
        is_default: false,
        cost_per_1k_tokens: 0.002,
        created_at: '2024-01-15T10:30:00Z',
        description: 'Fast and efficient model for most tasks'
      },
      {
        id: 3,
        name: 'claude-3-opus',
        display_name: 'Claude 3 Opus',
        provider: 'Anthropic',
        provider_id: 2,
        context_length: 200000,
        max_tokens: 4096,
        temperature_default: 0.7,
        supports_streaming: true,
        is_active: true,
        is_default: false,
        cost_per_1k_tokens: 0.015,
        created_at: '2024-01-18T09:15:00Z',
        description: 'Most powerful Claude model'
      },
      {
        id: 4,
        name: 'claude-3-sonnet',
        display_name: 'Claude 3 Sonnet',
        provider: 'Anthropic',
        provider_id: 2,
        context_length: 200000,
        max_tokens: 4096,
        temperature_default: 0.7,
        supports_streaming: true,
        is_active: true,
        is_default: false,
        cost_per_1k_tokens: 0.003,
        created_at: '2024-01-18T09:15:00Z',
        description: 'Balanced performance and cost'
      },
      {
        id: 5,
        name: 'llama2-7b',
        display_name: 'Llama 2 7B',
        provider: 'Local Ollama',
        provider_id: 3,
        context_length: 4096,
        max_tokens: 2048,
        temperature_default: 0.7,
        supports_streaming: true,
        is_active: false,
        is_default: false,
        cost_per_1k_tokens: 0,
        created_at: '2024-01-19T16:45:00Z',
        description: 'Open source model running locally'
      }
    ];

    setTimeout(() => {
      setModels(mockModels);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      key: 'display_name',
      label: 'Model',
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 font-mono">{item.name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'provider',
      label: 'Provider',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      )
    },
    {
      key: 'context_length',
      label: 'Context Length',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Layers className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'cost_per_1k_tokens',
      label: 'Cost per 1K',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-900">
            {value === 0 ? 'Free' : `$${value}`}
          </span>
        </div>
      )
    },
    {
      key: 'supports_streaming',
      label: 'Streaming',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
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
      label: 'Added',
      type: 'date',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      )
    }
  ];

  const handleEdit = (model) => {
    console.log('Edit model:', model);
  };

  const handleDelete = (model) => {
    console.log('Delete model:', model);
  };

  const handleView = (model) => {
    console.log('View model:', model);
  };

  const providerStats = models.reduce((acc, model) => {
    acc[model.provider] = (acc[model.provider] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LLM Models</h1>
          <p className="text-gray-600 mt-1">
            Manage available models and their configurations
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/admin/models/new"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Model
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Models</p>
              <p className="text-lg font-semibold text-gray-900">{models.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Active Models</p>
              <p className="text-lg font-semibold text-gray-900">
                {models.filter(m => m.is_active).length}
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
              <p className="text-sm font-medium text-gray-600">Default Model</p>
              <p className="text-lg font-semibold text-gray-900">
                {models.find(m => m.is_default)?.display_name || 'None'}
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Cost/1K</p>
              <p className="text-lg font-semibold text-gray-900">
                ${(models.reduce((sum, m) => sum + m.cost_per_1k_tokens, 0) / models.length).toFixed(3)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Provider Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg p-6 shadow"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Models by Provider</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(providerStats).map(([provider, count]) => (
            <div key={provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{provider}</span>
              <span className="text-sm text-gray-600">{count} models</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <DataTable
          data={models}
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

      {/* Model Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg p-6 shadow"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Context Length Distribution</h4>
            <div className="space-y-2">
              {models.map((model) => (
                <div key={model.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{model.display_name}</span>
                  <span className="font-medium">{model.context_length.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Cost Analysis</h4>
            <div className="space-y-2">
              {models.map((model) => (
                <div key={model.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{model.display_name}</span>
                  <span className="font-medium">
                    {model.cost_per_1k_tokens === 0 ? 'Free' : `$${model.cost_per_1k_tokens}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LLMModels;

