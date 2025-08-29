import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Server,
  Brain,
  Zap,
  Shield,
  Clock,
  Activity,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const SystemConfig = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockConfig = {
      default_provider: 1,
      default_model: 1,
      default_temperature: 0.7,
      default_max_tokens: 2048,
      enable_streaming: true,
      enable_caching: true,
      cache_ttl: 3600,
      rate_limit_per_minute: 60,
      enable_logging: true,
      log_level: 'INFO',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    };

    setTimeout(() => {
      setConfig(mockConfig);
      setLoading(false);
    }, 1000);
  }, []);

  const providers = [
    { id: 1, name: 'OpenAI', is_active: true },
    { id: 2, name: 'Anthropic Claude', is_active: true },
    { id: 3, name: 'Local Ollama', is_active: true }
  ];

  const models = [
    { id: 1, name: 'GPT-4', provider_id: 1, is_active: true },
    { id: 2, name: 'GPT-3.5 Turbo', provider_id: 1, is_active: true },
    { id: 3, name: 'Claude 3 Opus', provider_id: 2, is_active: true },
    { id: 4, name: 'Claude 3 Sonnet', provider_id: 2, is_active: true }
  ];

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSaving(false);
    setHasChanges(false);
    // Show success message
  };

  const handleReset = () => {
    // Reset to original values
    setHasChanges(false);
  };

  const configSections = [
    {
      title: 'Default Settings',
      icon: Settings,
      color: 'blue',
      fields: [
        {
          key: 'default_provider',
          label: 'Default Provider',
          type: 'select',
          options: providers.filter(p => p.is_active).map(p => ({ value: p.id, label: p.name })),
          description: 'The default LLM provider to use for new requests'
        },
        {
          key: 'default_model',
          label: 'Default Model',
          type: 'select',
          options: models.filter(m => m.is_active).map(m => ({ value: m.id, label: m.name })),
          description: 'The default model to use when no specific model is requested'
        },
        {
          key: 'default_temperature',
          label: 'Default Temperature',
          type: 'range',
          min: 0,
          max: 2,
          step: 0.1,
          description: 'Controls randomness in responses (0 = deterministic, 2 = very random)'
        },
        {
          key: 'default_max_tokens',
          label: 'Default Max Tokens',
          type: 'number',
          min: 1,
          max: 8192,
          description: 'Maximum number of tokens to generate in responses'
        }
      ]
    },
    {
      title: 'Features',
      icon: Zap,
      color: 'green',
      fields: [
        {
          key: 'enable_streaming',
          label: 'Enable Streaming',
          type: 'toggle',
          description: 'Allow real-time streaming of responses for better user experience'
        },
        {
          key: 'enable_caching',
          label: 'Enable Caching',
          type: 'toggle',
          description: 'Cache responses to improve performance and reduce API costs'
        },
        {
          key: 'cache_ttl',
          label: 'Cache TTL (seconds)',
          type: 'number',
          min: 60,
          max: 86400,
          description: 'How long to keep cached responses before expiring'
        }
      ]
    },
    {
      title: 'Rate Limiting',
      icon: Shield,
      color: 'orange',
      fields: [
        {
          key: 'rate_limit_per_minute',
          label: 'Requests per Minute',
          type: 'number',
          min: 1,
          max: 1000,
          description: 'Maximum number of requests allowed per minute per user'
        }
      ]
    },
    {
      title: 'Logging',
      icon: Activity,
      color: 'purple',
      fields: [
        {
          key: 'enable_logging',
          label: 'Enable Logging',
          type: 'toggle',
          description: 'Log requests and responses for debugging and analytics'
        },
        {
          key: 'log_level',
          label: 'Log Level',
          type: 'select',
          options: [
            { value: 'DEBUG', label: 'Debug' },
            { value: 'INFO', label: 'Info' },
            { value: 'WARNING', label: 'Warning' },
            { value: 'ERROR', label: 'Error' }
          ],
          description: 'Minimum level of logs to record'
        }
      ]
    }
  ];

  const renderField = (field) => {
    const value = config[field.key];

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleConfigChange(field.key, parseInt(e.target.value) || e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {field.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            min={field.min}
            max={field.max}
            onChange={(e) => handleConfigChange(field.key, parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={value || 0}
              min={field.min}
              max={field.max}
              step={field.step}
              onChange={(e) => handleConfigChange(field.key, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{field.min}</span>
              <span className="font-medium text-gray-900">{value}</span>
              <span>{field.max}</span>
            </div>
          </div>
        );

      case 'toggle':
        return (
          <button
            onClick={() => handleConfigChange(field.key, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-gray-600 mt-1">
            Configure global settings for your LLM infrastructure
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 text-orange-600"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Unsaved changes</span>
            </motion.div>
          )}
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">All systems operational</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <Server className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">API Status</p>
              <p className="text-xs text-gray-600">Healthy</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Brain className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Active Models</p>
              <p className="text-xs text-gray-600">4 models</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Uptime</p>
              <p className="text-xs text-gray-600">99.9%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Configuration Sections */}
      <div className="space-y-6">
        {configSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="bg-white rounded-lg shadow"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-${section.color}-100 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${section.color}-600`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {section.fields.map((field, fieldIndex) => (
                  <motion.div
                    key={field.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sectionIndex * 0.1) + (fieldIndex * 0.05) }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-900">
                        {field.label}
                      </label>
                      {field.description && (
                        <div className="group relative">
                          <Info className="w-4 h-4 text-gray-400 cursor-help" />
                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg">
                            {field.description}
                          </div>
                        </div>
                      )}
                    </div>
                    {renderField(field)}
                    {field.description && (
                      <p className="text-xs text-gray-500">{field.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Configuration History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg p-6 shadow"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Changes</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Default model changed to GPT-4</p>
              <p className="text-xs text-gray-500">January 20, 2024 at 2:30 PM</p>
            </div>
            <span className="text-xs text-gray-500">Admin User</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Streaming enabled</p>
              <p className="text-xs text-gray-500">January 19, 2024 at 4:15 PM</p>
            </div>
            <span className="text-xs text-gray-500">Admin User</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Rate limit increased to 60/min</p>
              <p className="text-xs text-gray-500">January 18, 2024 at 10:45 AM</p>
            </div>
            <span className="text-xs text-gray-500">Admin User</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SystemConfig;

