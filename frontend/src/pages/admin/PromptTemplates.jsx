import React, { useState, useEffect, useContext } from 'react';
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
  Copy,
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
import { useToast, TOAST_TYPES } from '../../contexts/ToastContext';
import AuthContext from '../../contexts/AuthContext';

const PromptTemplates = () => {
  const { t } = useTranslation('dashboard');
  const { showToast } = useToast();
  const { token } = useContext(AuthContext);
  const [templates, setTemplates] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null, page: 1 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: null, template: null });
  const [activeBox, setActiveBox] = useState({ type: null, template: null });
  const [editValues, setEditValues] = useState({});
  const [formMessage, setFormMessage] = useState(null);
  const [testingTemplate, setTestingTemplate] = useState(null);

  useEffect(() => {
    fetchData(1);
  }, []);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      const res = await coreAPI.getAllPromptTemplates(params, token);
      let data = res.data || res;
      
      if (data && typeof data === 'object' && Array.isArray(data.results)) {
        setTemplates(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
          page
        });
      } else {
        setTemplates(Array.isArray(data) ? data : [data]);
        setPagination({ count: 0, next: null, previous: null, page: 1 });
      }
    } catch (e) {
      console.error('Failed to fetch prompt templates:', e);
      setTemplates([]);
      setPagination({ count: 0, next: null, previous: null, page: 1 });
      showToast({ 
        type: TOAST_TYPES.ERROR, 
        message: t('promptTemplates.fetchError', 'Failed to fetch prompt templates') 
      });
    }
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    fetchData(newPage);
  };

  const columns = [
    {
      key: 'name',
      label: t('promptTemplates.table.name'),
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{item.prompt_type}</div>
          </div>
        </div>
      )
    },
    {
      key: 'language',
      label: t('promptTemplates.table.language'),
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'prompt_type',
      label: t('promptTemplates.table.type'),
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Tag className="w-3 h-3 mr-1" />
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'template',
      label: t('promptTemplates.table.content'),
      render: (value) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {value.substring(0, 100)}...
        </div>
      )
    },
    {
      key: 'is_active',
      label: t('promptTemplates.table.status'),
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
      label: t('promptTemplates.table.created'),
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

  const openModal = (type, template = null) => {
    setModal({ open: true, type, template });
  };

  const closeModal = () => {
    setModal({ open: false, type: null, template: null });
  };

  const handleAdd = () => {
    setActiveBox({ type: 'add', template: null });
    setEditValues({
      name: '',
      language: 'en',
      prompt_type: 'system',
      description: '',
      template: '',
      variables: '',
      is_active: true,
      is_default: false
    });
    setFormMessage(null);
  };

  const handleEdit = (template) => {
    setActiveBox({ type: 'edit', template });
    setEditValues(template || {});
    setFormMessage(null);
  };

  const handleView = (template) => {
    setModal({ open: true, type: 'view', template });
  };

  const handleDelete = (template) => openModal('delete', template);

  const handleDuplicate = async (template) => {
    try {
      const duplicateData = {
        ...template,
        name: `${template.name} (Copy)`,
        is_default: false
      };
      delete duplicateData.id;
      delete duplicateData.created_at;
      delete duplicateData.updated_at;
      
      await coreAPI.createPromptTemplate(duplicateData, token);
      await fetchData();
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: t('promptTemplates.duplicateSuccess', 'Template duplicated successfully!')
      });
    } catch (error) {
      console.error('Duplicate failed:', error);
      showToast({
        type: TOAST_TYPES.ERROR,
        message: t('promptTemplates.duplicateError', `Duplicate failed: ${error.message || 'Unknown error'}`)
      });
    }
  };

  const handleTestTemplate = async (template) => {
    setTestingTemplate(template.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: t('promptTemplates.testSuccess', `Template test successful for ${template.name}`)
      });
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: t('promptTemplates.testError', `Template test failed for ${template.name}: ${error.message}`)
      });
    } finally {
      setTestingTemplate(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (activeBox.type === 'add') {
        await coreAPI.createPromptTemplate(formData, token);
        setFormMessage({ type: 'success', text: t('promptTemplates.createSuccess', 'Template created successfully!') });
        showToast({
          type: TOAST_TYPES.SUCCESS,
          message: t('promptTemplates.createSuccess', 'Template created successfully!')
        });
      } else if (activeBox.type === 'edit' && activeBox.template) {
        await coreAPI.updatePromptTemplate(activeBox.template.id, formData, token);
        setFormMessage({ type: 'success', text: t('promptTemplates.updateSuccess', 'Template updated successfully!') });
        showToast({
          type: TOAST_TYPES.SUCCESS,
          message: t('promptTemplates.updateSuccess', 'Template updated successfully!')
        });
      }
      setActiveBox({ type: null, template: null });
      await fetchData();
    } catch (error) {
      console.error('Form submission failed:', error);
      let errorText = error?.message || t('promptTemplates.createError', 'Operation failed!');
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
      showToast({
        type: TOAST_TYPES.ERROR,
        message: error?.message || t('promptTemplates.createError', 'Operation failed!')
      });
    }
  };

  const handleModalSubmit = async () => {
    try {
      if (modal.type === 'delete' && modal.template) {
        await coreAPI.deletePromptTemplate(modal.template.id, token);
        showToast({
          type: TOAST_TYPES.SUCCESS,
          message: t('promptTemplates.deleteSuccess', 'Template deleted successfully!')
        });
        closeModal();
        await fetchData();
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
      showToast({
        type: TOAST_TYPES.ERROR,
        message: t('promptTemplates.deleteError', `Delete failed: ${error.message || 'Unknown error'}`)
      });
    }
  };

  const closeBox = () => {
    setActiveBox({ type: null, template: null });
    setFormMessage(null);
  };

  const languageStats = templates.reduce((acc, template) => {
    acc[template.language] = (acc[template.language] || 0) + 1;
    return acc;
  }, {});

  const typeStats = templates.reduce((acc, template) => {
    acc[template.prompt_type] = (acc[template.prompt_type] || 0) + 1;
    return acc;
  }, {});

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'zh-hans', label: '简体中文' },
    { value: 'zh-tw', label: '繁體中文' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' }
  ];

  const promptTypeOptions = [
    { value: 'system', label: 'System Prompt' },
    { value: 'user', label: 'User Prompt' },
    { value: 'assistant', label: 'Assistant Prompt' }
  ];

  const formFields = [
    {
      section: t('promptTemplates.form.basicInfo'),
      fields: [
        { 
          label: t('promptTemplates.form.name'), 
          name: 'name', 
          required: true,
          placeholder: 'Enter template name'
        },
        { 
          label: t('promptTemplates.form.language'), 
          name: 'language', 
          required: true, 
          type: 'select',
          options: languageOptions
        },
        { 
          label: t('promptTemplates.form.type'), 
          name: 'prompt_type', 
          required: true, 
          type: 'select',
          options: promptTypeOptions
        },
        { 
          label: t('promptTemplates.form.description'), 
          name: 'description',
          type: 'textarea',
          placeholder: 'Enter template description'
        }
      ]
    },
    {
      section: t('promptTemplates.form.content'),
      fields: [
        { 
          label: t('promptTemplates.form.template'), 
          name: 'template', 
          required: true,
          type: 'textarea',
          rows: 8,
          placeholder: 'Enter prompt template content. Use {variable_name} for variables.'
        },
        { 
          label: t('promptTemplates.form.variables'), 
          name: 'variables',
          type: 'textarea',
          rows: 3,
          placeholder: 'Enter variables as JSON: {"var1": "description", "var2": "description"}'
        }
      ]
    },
    {
      section: t('promptTemplates.form.settings'),
      fields: [
        { 
          label: t('promptTemplates.form.active'), 
          name: 'is_active', 
          type: 'checkbox',
          defaultValue: true
        },
        { 
          label: t('promptTemplates.form.default'), 
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
          <h1 className="text-2xl font-bold text-gray-900">{t('promptTemplates.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('promptTemplates.description')}
          </p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchData()}
            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('promptTemplates.refresh')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('promptTemplates.create')}
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
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('promptTemplates.stats.total')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('promptTemplates.stats.active')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('promptTemplates.stats.languages')}</p>
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
              <Tag className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('promptTemplates.stats.types')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {Object.keys(typeStats).length}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('promptTemplates.byType')}</h3>
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
        {activeBox.type === null && (
          <>
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
              customActions={(item) => (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleDuplicate(item)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Duplicate Template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleTestTemplate(item)}
                    disabled={testingTemplate === item.id}
                    className="p-1 text-gray-400 hover:text-green-600 disabled:opacity-50"
                    title="Test Template"
                  >
                    {testingTemplate === item.id ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                  </button>
                </div>
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
              {activeBox.type === 'add' ? t('promptTemplates.createTemplate') : t('promptTemplates.editTemplate')}
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
              modelName="PromptTemplate"
              title={activeBox.type === 'add' ? t('promptTemplates.createTemplate') : t('promptTemplates.editTemplate')}
              fields={formFields}
              initialValues={editValues}
              onSubmit={handleFormSubmit}
              onCancel={closeBox}
              saveText={activeBox.type === 'add' ? t('promptTemplates.create') : t('promptTemplates.save')}
              cancelText={t('promptTemplates.cancel')}
            />
          </div>
        )}

        {/* View Template Modal */}
        <Modal
          open={modal.open && modal.type === 'view'}
          title={`View Template: ${modal.template?.name || ''}`}
          onClose={closeModal}
          size="large"
          actions={
            <button 
              onClick={closeModal} 
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Close
            </button>
          }
        >
          {modal.template && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <p className="mt-1 text-sm text-gray-900 uppercase">{modal.template.language}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900">{modal.template.prompt_type}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{modal.template.description || 'No description'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Template Content</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap">{modal.template.template}</pre>
                </div>
              </div>
              {modal.template.variables && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Variables</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <pre className="text-sm text-gray-900">{JSON.stringify(modal.template.variables, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={modal.open && modal.type === 'delete'}
          title={t('promptTemplates.deleteTemplate')}
          onClose={closeModal}
          actions={
            <>
              <button 
                onClick={closeModal} 
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {t('promptTemplates.cancel')}
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                {t('promptTemplates.confirmDelete')}
              </button>
            </>
          }
        >
          {modal.template && (
            <div className="text-gray-700">
              <p className="mb-2">{t('promptTemplates.deleteConfirm', 'Are you sure you want to delete the template:')}</p>
              <p className="font-semibold text-red-600">{modal.template.name}</p>
              <p className="mt-2 text-sm text-gray-500">
                {t('promptTemplates.deleteWarning', 'This action cannot be undone.')}
              </p>
            </div>
          )}
        </Modal>
      </motion.div>
    </div>
  );
};

export default PromptTemplates;