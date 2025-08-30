
import React, { useState, useEffect } from 'react';
import { coreAPI } from '../../api/core';
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
import { useTranslation } from 'react-i18next';


const SystemConfig = () => {
  const { t } = useTranslation('dashboard');
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch providers and models
        const [providersRes, modelsRes] = await Promise.all([
          coreAPI.getLLMProviders(),
          coreAPI.getLLMModels()
        ]);
        setProviders(providersRes.data || providersRes);
        setModels(modelsRes.data || modelsRes);
        // TODO: Fetch config from backend if endpoint exists
        // setConfig(await coreAPI.getSystemConfig());
        // For now, keep config as empty or static
      } catch (e) {
        // handle error
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const [providers, setProviders] = useState([]);
  const [models, setModels] = useState([]);

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
      title: t('systemConfig.defaultSettings.title'),
      icon: Settings,
      color: 'blue',
      fields: [
        {
          key: 'default_provider',
          label: t('systemConfig.defaultSettings.defaultProvider.label'),
          type: 'select',
          options: providers.filter(p => p.is_active).map(p => ({ value: p.id, label: p.name })),
          description: t('systemConfig.defaultSettings.defaultProvider.description')
        },
        {
          key: 'default_model',
          label: t('systemConfig.defaultSettings.defaultModel.label'),
          type: 'select',
          options: models.filter(m => m.is_active).map(m => ({ value: m.id, label: m.name })),
          description: t('systemConfig.defaultSettings.defaultModel.description')
        },
        {
          key: 'default_temperature',
          label: t('systemConfig.defaultSettings.defaultTemperature.label'),
          type: 'range',
          min: 0,
          max: 2,
          step: 0.1,
          description: t('systemConfig.defaultSettings.defaultTemperature.description')
        },
        {
          key: 'default_max_tokens',
          label: t('systemConfig.defaultSettings.defaultMaxTokens.label'),
          type: 'number',
          min: 1,
          max: 8192,
          description: t('systemConfig.defaultSettings.defaultMaxTokens.description')
        }
      ]
    },
    {
      title: t('systemConfig.features.title'),
      icon: Zap,
      color: 'green',
      fields: [
        {
          key: 'enable_streaming',
          label: t('systemConfig.features.enableStreaming.label'),
          type: 'toggle',
          description: t('systemConfig.features.enableStreaming.description')
        },
        {
          key: 'enable_caching',
          label: t('systemConfig.features.enableCaching.label'),
          type: 'toggle',
          description: t('systemConfig.features.enableCaching.description')
        },
        {
          key: 'cache_ttl',
          label: t('systemConfig.features.cacheTtl.label'),
          type: 'number',
          min: 60,
          max: 86400,
          description: t('systemConfig.features.cacheTtl.description')
        }
      ]
    },
    {
      title: t('systemConfig.rateLimiting.title'),
      icon: Shield,
      color: 'orange',
      fields: [
        {
          key: 'rate_limit_per_minute',
          label: t('systemConfig.rateLimiting.requestsPerMinute.label'),
          type: 'number',
          min: 1,
          max: 1000,
          description: t('systemConfig.rateLimiting.requestsPerMinute.description')
        }
      ]
    },
    {
      title: t('systemConfig.logging.title'),
      icon: Activity,
      color: 'purple',
      fields: [
        {
          key: 'enable_logging',
          label: t('systemConfig.logging.enableLogging.label'),
          type: 'toggle',
          description: t('systemConfig.logging.enableLogging.description')
        },
        {
          key: 'log_level',
          label: t('systemConfig.logging.logLevel.label'),
          type: 'select',
          options: [
            { value: 'DEBUG', label: t('systemConfig.logging.logLevel.options.debug') },
            { value: 'INFO', label: t('systemConfig.logging.logLevel.options.info') },
            { value: 'WARNING', label: t('systemConfig.logging.logLevel.options.warning') },
            { value: 'ERROR', label: t('systemConfig.logging.logLevel.options.error') }
          ],
          description: t('systemConfig.logging.logLevel.description')
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
          <h1 className="text-2xl font-bold text-gray-900">{t('systemConfig.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('systemConfig.description')}
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
            {t('systemConfig.reset')}
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
            {saving ? t('systemConfig.saving') : t('systemConfig.saveChanges')}
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
          <h2 className="text-lg font-semibold text-gray-900">{t('systemConfig.systemStatus.title')}</h2>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">{t('systemConfig.systemStatus.operational')}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <Server className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{t('systemConfig.systemStatus.apiStatus')}</p>
              <p className="text-xs text-gray-600">{t('systemConfig.systemStatus.healthy')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Brain className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{t('systemConfig.systemStatus.activeModels')}</p>
              <p className="text-xs text-gray-600">{t('systemConfig.systemStatus.modelsCount', { count: 4 })}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{t('systemConfig.systemStatus.uptime')}</p>
              <p className="text-xs text-gray-600">{t('systemConfig.systemStatus.uptimeValue', { value: '99.9%' })}</p>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('systemConfig.recentChanges.title')}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">{t('systemConfig.recentChanges.defaultModelChanged')}</p>
              <p className="text-xs text-gray-500">{t('systemConfig.recentChanges.date1')}</p>
            </div>
            <span className="text-xs text-gray-500">{t('systemConfig.recentChanges.adminUser')}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">{t('systemConfig.recentChanges.streamingEnabled')}</p>
              <p className="text-xs text-gray-500">{t('systemConfig.recentChanges.date2')}</p>
            </div>
            <span className="text-xs text-gray-500">{t('systemConfig.recentChanges.adminUser')}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">{t('systemConfig.recentChanges.rateLimitIncreased')}</p>
              <p className="text-xs text-gray-500">{t('systemConfig.recentChanges.date3')}</p>
            </div>
            <span className="text-xs text-gray-500">{t('systemConfig.recentChanges.adminUser')}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SystemConfig;

