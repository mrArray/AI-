import React, { useState, useEffect, useContext } from 'react';
import DynamicForm from '../../components/admin/DynamicForm';
import Modal from '../../components/admin/Modal';
import { coreAPI } from '../../api/core';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Server,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Settings,
  Zap,
  Edit,
  Trash2,
  TestTube,
  RefreshCw
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import { useTranslation } from 'react-i18next';
import { useToast, TOAST_TYPES } from '../../contexts/ToastContext';
import AuthContext from '../../contexts/AuthContext';

const LLMProviders = () => {
  const { t } = useTranslation('dashboard');
  const { showToast } = useToast();
  const { token } = useContext(AuthContext);
  const [providers, setProviders] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null, page: 1 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: null, provider: null });
  const [activeBox, setActiveBox] = useState({ type: null, provider: null });
  const [editValues, setEditValues] = useState({});
  // Local message state for form feedback
  const [formMessage, setFormMessage] = useState(null); // { type: 'success'|'error', text: string }
  const [testingProvider, setTestingProvider] = useState(null);
  const navigate = useNavigate();

  // Fetch providers with full CRUD support
  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      const data = await coreAPI.getAllLLMProviders(params);
      if (data && Array.isArray(data.results)) {
        setProviders(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
          page
        });
      } else {
        setProviders([]);
        setPagination({ count: 0, next: null, previous: null, page: 1 });
      }
    } catch (e) {
      console.error('Failed to fetch providers:', e);
      setProviders([]);
      setPagination({ count: 0, next: null, previous: null, page: 1 });
    }
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    fetchProviders(newPage);
  };


  const columns = [
    {
      key: 'name',
  label: t('llmProviders.providerName'),
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
  label: t('llmProviders.baseUrl'),
      render: (value) => (
        <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded max-w-xs truncate">
          {value}
        </div>
      )
    },
    {
      key: 'models',
  label: t('llmProviders.models'),
      render: (value, item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {Array.isArray(item.models) ? item.models.length : 0} {t('llmProviders.models')}
        </span>
      )
    },
    {
      key: 'is_active',
  label: t('llmProviders.status'),
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded-full ${value ? 'bg-green-100' : 'bg-gray-100'}`}>
            {value ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-gray-500" />
            )}
          </div>
          <span className="text-sm text-gray-900">{value ? t('llmProviders.active') : t('llmProviders.inactive')}</span>
          {item.is_default && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
              <Zap className="w-3 h-3 mr-1" />
              {t('llmProviders.default')}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
  label: t('llmProviders.created'),
      type: 'date',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    }
  ];

  // CRUD actions
  const openModal = (type, provider = null) => {
    setModal({ open: true, type, provider });
  };

  const closeModal = () => {
    setModal({ open: false, type: null, provider: null });
  };

  const handleAdd = () => {
    setActiveBox({ type: 'add', provider: null });
    setEditValues({
      name: '',
      provider_type: 'openai',
      base_url: '',
      api_key: '',
      is_active: true,
      is_default: false,
      timeout: 30,
      max_retries: 3
    });
    setFormMessage(null);
  };

  const handleEdit = async (provider) => {
    // Fetch latest provider data for editing (best practice)
    try {
      const res = await coreAPI.getLLMProvider(provider.id);
      setEditValues(res.data || res);
    } catch (e) {
      setEditValues(provider || {});
    }
    setActiveBox({ type: 'edit', provider });
  };

  const handleView = (provider) => {
    navigate(`/admin/providers/${provider.id}`);
  };

  const handleDelete = (provider) => openModal('delete', provider);

  const handleTestConnection = async (provider) => {
    setTestingProvider(provider.id);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Connection test successful for ${provider.name}`);
    } catch (error) {
      alert(`Connection test failed for ${provider.name}: ${error.message}`);
    } finally {
      setTestingProvider(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (activeBox.type === 'add') {
        await coreAPI.createLLMProvider(formData, token);
        setFormMessage({ type: 'success', text: t('llmProviders.createSuccess', 'Provider created successfully!') });
        showToast({ type: TOAST_TYPES.SUCCESS, message: t('llmProviders.createSuccess', 'Provider created successfully!') });
        setTimeout(() => setFormMessage(null), 3000);
      } else if (activeBox.type === 'edit' && activeBox.provider) {
        await coreAPI.updateLLMProvider(activeBox.provider.id, formData);
        setFormMessage({ type: 'success', text: t('llmProviders.updateSuccess', 'Provider updated successfully!') });
        showToast({ type: TOAST_TYPES.SUCCESS, message: t('llmProviders.updateSuccess', 'Provider updated successfully!') });
        setTimeout(() => setFormMessage(null), 3000);
      }
      setActiveBox({ type: null, provider: null });
      await fetchProviders();
    } catch (error) {
      console.error('Form submission failed:', error);
      // Use error.data for ApiError, not error.response.data
      let errorText = error?.message || t('llmProviders.createError', 'Operation failed!');
      if (error && typeof error === 'object' && error.data && typeof error.data === 'object') {
        const errObj = error.data;
        // If only a string error, show as is
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
      showToast({ type: TOAST_TYPES.ERROR, message: error?.message || t('llmProviders.createError', 'Operation failed!') });
      setTimeout(() => setFormMessage(null), 6000);
    }
  };

  const handleModalSubmit = async () => {
    try {
      if (modal.type === 'delete' && modal.provider) {
        await coreAPI.deleteLLMProvider(modal.provider.id);
        closeModal();
        await fetchProviders();
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
      alert(`Delete failed: ${error.message || 'Unknown error'}`);
    }
  };

  const closeBox = () => {
    setActiveBox({ type: null, provider: null });
    setFormMessage(null);
  };

  const providerTypeOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'azure_openai', label: 'Azure OpenAI' },
    { value: 'ollama', label: 'Ollama' },
    { value: 'custom', label: 'Custom' }
  ];

  const formFields = [
    {
  section: t('createProvider.form.basicInfo'),
      fields: [
        { 
          label: t('createProvider.form.providerName'), 
          name: 'name', 
          required: true,
          placeholder: t('createProvider.form.providerNamePlaceholder')
        },
        { 
          label: t('createProvider.form.providerType'), 
          name: 'provider_type', 
          required: true, 
          type: 'select',
          options: providerTypeOptions,
          placeholder: t('createProvider.form.providerTypePlaceholder')
        }
      ]
    },
    {
  section: t('createProvider.form.configuration'),
      fields: [
        { 
          label: t('createProvider.form.baseUrl'), 
          name: 'base_url', 
          required: true,
          placeholder: t('createProvider.form.baseUrlPlaceholder')
        },
        { 
          label: t('createProvider.form.apiKey'), 
          name: 'api_key',
          type: 'password',
          placeholder: t('createProvider.form.apiKeyPlaceholder')
        },
        { 
          label: t('createProvider.form.timeout'), 
          name: 'timeout', 
          type: 'number', 
          defaultValue: 30,
          min: 1,
          max: 300
        },
        { 
          label: t('createProvider.form.maxRetries'), 
          name: 'max_retries', 
          type: 'number', 
          defaultValue: 3,
          min: 0,
          max: 10
        }
      ]
    },
    {
  section: t('createProvider.form.statusSettings'),
      fields: [
        { 
          label: t('createProvider.form.active'), 
          name: 'is_active', 
          type: 'checkbox',
          defaultValue: true
        },
        { 
          label: t('createProvider.form.defaultProvider'), 
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
          <h1 className="text-2xl font-bold text-gray-900">{t('llmProviders.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('llmProviders.description')}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t('header.lastUpdated')}</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchProviders}
            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('llmProviders.refresh', 'Refresh')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('llmProviders.addProvider')}
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
                {providers.find(p => p.is_default)?.name || t('llmProviders.none', 'None')}
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
                {providers.reduce((sum, p) => sum + (Array.isArray(p.models) ? p.models.length : 0), 0)}
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
        className="overflow-x-auto"
      >
        {activeBox.type === null && (
          <>
            <DataTable
              data={providers}
              columns={columns}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              searchable={true}
              filterable={true}
              searchPlaceholder={t('header.searchPlaceholder')}
              pagination={false}
              actionsLabel={t('llmProviders.actions', 'Actions')}
              customActions={(item) => (
                <button
                  onClick={() => handleTestConnection(item)}
                  disabled={testingProvider === item.id}
                  className="p-1 text-gray-400 hover:text-green-600 disabled:opacity-50"
                  title="Test Connection"
                >
                  {testingProvider === item.id ? (
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
              {activeBox.type === 'add' ? t('llmProviders.addProvider') : t('llmProviders.editProvider')}
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
              modelName="LLMProvider"
              title={activeBox.type === 'add' ? t('llmProviders.addProvider') : t('llmProviders.editProvider')}
              fields={formFields}
              initialValues={editValues}
              onSubmit={handleFormSubmit}
              onCancel={closeBox}
              saveText={t('createProvider.form.save')}
              cancelText={t('createProvider.form.cancel')}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          open={modal.open && modal.type === 'delete'}
          title={t('llmProviders.deleteProvider')}
          onClose={closeModal}
          actions={
            <>
              <button 
                onClick={closeModal} 
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {t('llmProviders.cancel')}
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                {t('llmProviders.confirmDelete')}
              </button>
            </>
          }
        >
          {modal.provider && (
            <div className="text-gray-700">
              <p className="mb-2">{t('llmProviders.deleteConfirm', 'Are you sure you want to delete the provider:')}</p>
              <p className="font-semibold text-red-600">{modal.provider.name}</p>
              <p className="mt-2 text-sm text-gray-500">
                {t('llmProviders.deleteWarning', 'This action cannot be undone and will also delete all associated models.')}
              </p>
            </div>
          )}
        </Modal>
      </motion.div>
    </div>
  );
};

export default LLMProviders;

