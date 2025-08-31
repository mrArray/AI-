import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Brain,
  CheckCircle,
  XCircle,
  Zap,
  DollarSign,
  Clock,
  Layers,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  TestTube
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import DynamicForm from '../../components/admin/DynamicForm';
import Modal from '../../components/admin/Modal';
import { coreAPI } from '../../api/core';
import { useTranslation } from 'react-i18next';

const LLMModels = () => {
  const { t } = useTranslation('dashboard');
  const [models, setModels] = useState([]);
  const [providers, setProviders] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null, page: 1 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: null, model: null });
  const [activeBox, setActiveBox] = useState({ type: null, model: null });
  const [editValues, setEditValues] = useState({});
  // Local message state for form feedback
  const [formMessage, setFormMessage] = useState(null); // { type: 'success'|'error', text: string }
  const [testingModel, setTestingModel] = useState(null);
  const navigate = useNavigate();

  // Fetch models and providers with full CRUD support

  useEffect(() => {
    fetchData(1);
  }, []);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      // Fetch models using CRUD endpoint (paginated)
      const params = { page };
      const modelsRes = await coreAPI.getAllLLMModels(params);
      let modelsData = modelsRes.data || modelsRes;
      // If paginated, extract results
      if (modelsData && typeof modelsData === 'object' && Array.isArray(modelsData.results)) {
        setModels(modelsData.results);
        setPagination({
          count: modelsData.count,
          next: modelsData.next,
          previous: modelsData.previous,
          page
        });
      } else {
        setModels(Array.isArray(modelsData) ? modelsData : [modelsData]);
        setPagination({ count: 0, next: null, previous: null, page: 1 });
      }

      // Fetch providers for dropdown
      const providersRes = await coreAPI.getAllLLMProviders();
      let providersData = providersRes.data || providersRes;
      // If paginated, extract results
      if (providersData && typeof providersData === 'object' && Array.isArray(providersData.results)) {
        providersData = providersData.results;
      } else if (providersData && !Array.isArray(providersData)) {
        providersData = [providersData];
      }
      setProviders(providersData || []);
    } catch (e) {
      console.error('Failed to fetch data:', e);
      setModels([]);
      setProviders([]);
      setPagination({ count: 0, next: null, previous: null, page: 1 });
    }
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    fetchData(newPage);
  };

  const columns = [
    {
      key: 'display_name',
      label: t('llmModels.table.model'),
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
      key: 'provider_name',
      label: t('llmModels.table.provider'),
      render: (value, item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value || (item.provider && item.provider.name) || 'Unknown'}
        </span>
      )
    },
    {
      key: 'context_length',
      label: t('llmModels.table.contextLength'),
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Layers className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{typeof value === 'number' ? value.toLocaleString() : '-'}</span>
        </div>
      )
    },
    {
      key: 'cost_per_1k_tokens',
      label: t('llmModels.table.costPer1K'),
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
      label: t('llmModels.table.streaming'),
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
      label: t('llmModels.table.status'),
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
      label: t('llmModels.table.added'),
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

  // CRUD actions
  const openModal = (type, model = null) => {
    setModal({ open: true, type, model });
  };

  const closeModal = () => {
    setModal({ open: false, type: null, model: null });
  };

  const handleAdd = () => {
    if (providers.length === 0) {
      setFormMessage({ type: 'error', text: 'No providers available. Please create a provider first.' });
      return;
    }
    setActiveBox({ type: 'add', model: null });
    setEditValues({
      name: '',
      display_name: '',
      description: '',
      provider: providers[0].id,
      context_length: 4096,
      max_tokens: 2048,
      temperature_default: 0.7,
      supports_streaming: true,
      is_active: true,
      is_default: false,
      cost_per_1k_tokens: 0
    });
    setFormMessage(null);
  };

  const handleEdit = (model) => {
    setActiveBox({ type: 'edit', model });
    // If provider is an object or string, always use id for the form
    let providerId = model.provider;
    if (model.provider && typeof model.provider === 'object') {
      providerId = model.provider.id;
    }
    setEditValues({ ...model, provider: providerId });
    setFormMessage(null);
  };

  const handleView = (model) => {
    console.log('View model:', model);
    // Could navigate to model detail page if needed
  };

  const handleDelete = (model) => openModal('delete', model);

  const handleTestModel = async (model) => {
    setTestingModel(model.id);
    try {
      // Simulate model test
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Model test successful for ${model.display_name}`);
    } catch (error) {
      alert(`Model test failed for ${model.display_name}: ${error.message}`);
    } finally {
      setTestingModel(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Ensure provider is sent as id
      if (typeof formData.provider === 'object' && formData.provider.id) {
        formData.provider = formData.provider.id;
      }
      if (activeBox.type === 'add') {
        // Generate name from display_name if not provided
        if (!formData.name && formData.display_name) {
          formData.name = formData.display_name.toLowerCase().replace(/\s+/g, '_');
        }
        await coreAPI.createLLMModel(formData);
        setFormMessage({ type: 'success', text: t('llmModels.createSuccess', 'Model created successfully!') });
        setTimeout(() => setFormMessage(null), 3000);
      } else if (activeBox.type === 'edit' && activeBox.model) {
        await coreAPI.updateLLMModel(activeBox.model.id, formData);
        setFormMessage({ type: 'success', text: t('llmModels.updateSuccess', 'Model updated successfully!') });
        setTimeout(() => setFormMessage(null), 3000);
      }
      setActiveBox({ type: null, model: null });
      await fetchData();
    } catch (error) {
      console.error('Form submission failed:', error);
      // Use error.data for ApiError, not error.response.data
      let errorText = error?.message || t('llmModels.createError', 'Operation failed!');
      if (error && typeof error === 'object' && error.data && typeof error.data === 'object') {
        const errObj = error.data;
        if (typeof errObj === 'string') {
          errorText = errObj;
        } else {
          errorText = (
            <ul className="list-disc pl-5 space-y-1 text-left">
              {Object.entries(errObj).map(([field, messages]) =>
                Array.isArray(messages)
                  ? messages.map((msg, i) => (
                      <li key={field + i}><span className="font-semibold">{field}:</span> {msg}</li>
                    ))
                  : <li key={field}><span className="font-semibold">{field}:</span> {messages}</li>
              )}
            </ul>
          );
        }
      }
      setFormMessage({ type: 'error', text: errorText });
      setTimeout(() => setFormMessage(null), 6000);
    }
  };

  const handleModalSubmit = async () => {
    try {
      if (modal.type === 'delete' && modal.model) {
        await coreAPI.deleteLLMModel(modal.model.id);
        closeModal();
        await fetchData();
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
      alert(`Delete failed: ${error.message || 'Unknown error'}`);
    }
  };

  const closeBox = () => {
    setActiveBox({ type: null, model: null });
    setFormMessage(null);
  };

  const providerStats = models.reduce((acc, model) => {
    const providerName = model.provider_name || (model.provider && model.provider.name) || 'Unknown';
    acc[providerName] = (acc[providerName] || 0) + 1;
    return acc;
  }, {});

  const providerOptions = providers.map(provider => ({
    value: provider.id,
    label: provider.name
  }));

  const formFields = [
    {
      section: t('llmModels.form.basicInfo'),
      fields: [
        { 
          label: t('llmModels.form.displayName'), 
          name: 'display_name', 
          required: true,
          placeholder: 'Enter model display name'
        },
        { 
          label: t('llmModels.form.name'), 
          name: 'name', 
          required: true,
          placeholder: 'Enter model identifier (lowercase, underscores)'
        },
        { 
          label: t('llmModels.form.provider'), 
          name: 'provider', 
          required: true, 
          type: 'select',
          options: providerOptions
        },
        { 
          label: t('llmModels.form.description'), 
          name: 'description',
          type: 'textarea',
          placeholder: 'Enter model description'
        }
      ]
    },
    {
      section: t('llmModels.form.configuration'),
      fields: [
        { 
          label: t('llmModels.form.contextLength'), 
          name: 'context_length', 
          type: 'number',
          required: true,
          defaultValue: 4096,
          min: 1
        },
        { 
          label: t('llmModels.form.maxTokens'), 
          name: 'max_tokens', 
          type: 'number',
          required: true,
          defaultValue: 2048,
          min: 1
        },
        { 
          label: t('llmModels.form.temperature'), 
          name: 'temperature_default', 
          type: 'number',
          step: 0.1,
          min: 0,
          max: 2,
          defaultValue: 0.7
        },
        { 
          label: t('llmModels.form.costPer1K'), 
          name: 'cost_per_1k_tokens', 
          type: 'number',
          step: 0.001,
          min: 0,
          defaultValue: 0
        }
      ]
    },
    {
      section: t('llmModels.form.settings'),
      fields: [
        { 
          label: t('llmModels.form.streaming'), 
          name: 'supports_streaming', 
          type: 'checkbox',
          defaultValue: true
        },
        { 
          label: t('llmModels.form.active'), 
          name: 'is_active', 
          type: 'checkbox',
          defaultValue: true
        },
        { 
          label: t('llmModels.form.default'), 
          name: 'is_default', 
          type: 'checkbox',
          defaultValue: false
        }
      ]
    }
  ];

  return (
  <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('llmModels.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('llmModels.description')}
          </p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('llmModels.addModel')}
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-sm font-medium text-gray-600">{t('llmModels.stats.total')}</p>
            <p className="text-lg font-semibold text-gray-900">{models.length}</p>
          </div>
        </div>
      </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-4 shadow"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('llmModels.stats.active')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('llmModels.stats.default')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('llmModels.stats.avgCost')}</p>
              <p className="text-lg font-semibold text-gray-900">
                ${models.length > 0 ? (models.reduce((sum, m) => sum + m.cost_per_1k_tokens, 0) / models.length).toFixed(3) : '0.000'}
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('llmModels.byProvider')}</h3>
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

        {activeBox.type === null && (
          <>
            <DataTable
              data={models}
              columns={columns}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              searchable={true}
              filterable={true}
              pagination={false}
              customActions={(item) => (
                <button
                  onClick={() => handleTestModel(item)}
                  disabled={testingModel === item.id}
                  className="p-1 text-gray-400 hover:text-green-600 disabled:opacity-50"
                  title="Test Model"
                >
                  {testingModel === item.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                </button>
              )}
            />
            {/* Pagination Controls */}
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.previous}
              >
                {t('actions.prev', 'Previous')}
              </button>
              <span className="px-2 py-1 text-gray-700">{t('actions.page', 'Page')} {pagination.page}</span>
              <button
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.next}
              >
                {t('actions.next', 'Next')}
              </button>
            </div>
          </>
        )}

        {/* Add/Edit Form */}
        {(activeBox.type === 'add' || activeBox.type === 'edit') && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {activeBox.type === 'add' ? t('llmModels.addModel') : t('llmModels.editModel')}
            </h2>
            {formMessage && (
              <div
                className={`mb-4 px-4 py-3 rounded text-sm font-medium border transition-all duration-300 ${
                  formMessage.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800 text-center'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
                role="alert"
                style={{ wordBreak: 'break-word' }}
              >
                {formMessage.text}
              </div>
            )}
            <DynamicForm
              modelName="LLMModel"
              title={activeBox.type === 'add' ? t('llmModels.addModel') : t('llmModels.editModel')}
              fields={formFields}
              initialValues={editValues}
              onSubmit={handleFormSubmit}
              onCancel={closeBox}
              saveText={activeBox.type === 'add' ? t('llmModels.create') : t('llmModels.save')}
              cancelText={t('llmModels.cancel')}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          open={modal.open && modal.type === 'delete'}
          title={t('llmModels.deleteModel')}
          onClose={closeModal}
          actions={
            <>
              <button 
                onClick={closeModal} 
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {t('llmModels.cancel')}
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                {t('llmModels.confirmDelete')}
              </button>
            </>
          }
        >
          {modal.model && (
            <div className="text-gray-700">
              <p className="mb-2">Are you sure you want to delete the model:</p>
              <p className="font-semibold text-red-600">{modal.model.display_name}</p>
              <p className="mt-2 text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          )}
        </Modal>
      </motion.div>
    </div>
  );
};

export default LLMModels;

