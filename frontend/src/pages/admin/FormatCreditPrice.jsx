import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  File,
  FileInput,
  FileOutput,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import DynamicForm from '../../components/admin/DynamicForm';
import Modal from '../../components/admin/Modal';
import { formatCreditPriceAPI } from '../../api/formatCreditPrice';
import { useTranslation } from 'react-i18next';
import { useToast, TOAST_TYPES } from '../../contexts/ToastContext';
import AuthContext from '../../contexts/AuthContext';

const FormatCreditPrices = () => {
  const { t } = useTranslation('dashboard');
  const { showToast } = useToast();
  const [prices, setPrices] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null, page: 1 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: null, price: null });
  const [activeBox, setActiveBox] = useState({ type: null, price: null });
  const [editValues, setEditValues] = useState({});
  const [formMessage, setFormMessage] = useState(null);
  const { token } = useContext(AuthContext);

  // Fetch prices with full CRUD support
  useEffect(() => {
    fetchData(1);
  }, []);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      const pricesRes = await formatCreditPriceAPI.getAll(params, token);
      let pricesData = pricesRes.data || pricesRes;
      
      if (pricesData && typeof pricesData === 'object' && Array.isArray(pricesData.results)) {
        setPrices(pricesData.results);
        setPagination({
          count: pricesData.count,
          next: pricesData.next,
          previous: pricesData.previous,
          page
        });
      } else {
        setPrices(Array.isArray(pricesData) ? pricesData : [pricesData]);
        setPagination({ count: 0, next: null, previous: null, page: 1 });
      }
    } catch (e) {
      console.error('Failed to fetch format prices:', e);
      setPrices([]);
      setPagination({ count: 0, next: null, previous: null, page: 1 });
      showToast({ 
        type: TOAST_TYPES.ERROR, 
        message: t('formatPrices.fetchError', 'Failed to fetch format prices') 
      });
    }
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    fetchData(newPage);
  };

  const getFormatIcon = (format) => {
    switch(format) {
      case 'docx':
        return <FileText className="w-4 h-4" />;
      case 'pdf':
        return <File className="w-4 h-4" />;
      case 'latex':
        return <FileInput className="w-4 h-4" />;
      case 'md':
        return <FileOutput className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const columns = [
    {
      key: 'format',
      label: t('formatPrices.format'),
      render: (value) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100">
              {getFormatIcon(value)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 uppercase">{value}</div>
            <div className="text-sm text-gray-500">{t(`formatPrices.${value}`, value)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'credit_price',
      label: t('formatPrices.creditPrice'),
      render: (value) => (
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-900">{value}</span>
          <span className="text-sm text-gray-500">{t('formatPrices.credits')}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: t('formatPrices.created'),
      type: 'date',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    }
  ];

  // CRUD actions
  const openModal = (type, price = null) => {
    setModal({ open: true, type, price });
  };

  const closeModal = () => {
    setModal({ open: false, type: null, price: null });
  };

  const handleAdd = () => {
    setActiveBox({ type: 'add', price: null });
    setEditValues({
      format: 'docx',
      credit_price: 1
    });
    setFormMessage(null);
  };

  const handleEdit = async (price) => {
    let latestPrice = price;
    try {
      const res = await formatCreditPriceAPI.get(price.id, token);
      latestPrice = res.data || res;
    } catch (e) {
      // fallback to passed price
    }
    setEditValues({
      format: latestPrice.format,
      credit_price: latestPrice.credit_price
    });
    setActiveBox({ type: 'edit', price });
    setFormMessage(null);
  };

  const handleDelete = (price) => openModal('delete', price);

  const handleFormSubmit = async (formData) => {
    try {
      if (activeBox.type === 'add') {
        await formatCreditPriceAPI.create(formData, token);
        setFormMessage({ type: 'success', text: t('formatPrices.createSuccess', 'Format price created successfully!') });
        showToast({ 
          type: TOAST_TYPES.SUCCESS, 
          message: t('formatPrices.createSuccess', 'Format price created successfully!') 
        });
        setTimeout(() => setFormMessage(null), 3000);
      } else if (activeBox.type === 'edit' && activeBox.price) {
        await formatCreditPriceAPI.update(activeBox.price.id, formData, token);
        setFormMessage({ type: 'success', text: t('formatPrices.updateSuccess', 'Format price updated successfully!') });
        showToast({ 
          type: TOAST_TYPES.SUCCESS, 
          message: t('formatPrices.updateSuccess', 'Format price updated successfully!') 
        });
        setTimeout(() => setFormMessage(null), 3000);
      }
      setActiveBox({ type: null, price: null });
      await fetchData();
    } catch (error) {
      console.error('Form submission failed:', error);
      let errorText = error?.message || t('formatPrices.createError', 'Operation failed!');
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
        message: error?.message || t('formatPrices.createError', 'Operation failed!') 
      });
      setTimeout(() => setFormMessage(null), 6000);
    }
  };

  const handleModalSubmit = async () => {
    try {
      if (modal.type === 'delete' && modal.price) {
        await formatCreditPriceAPI.delete(modal.price.id, token);
        showToast({ 
          type: TOAST_TYPES.SUCCESS, 
          message: t('formatPrices.deleteSuccess', 'Format price deleted successfully!') 
        });
        closeModal();
        await fetchData();
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
      showToast({ 
        type: TOAST_TYPES.ERROR, 
        message: t('formatPrices.deleteError', `Delete failed: ${error.message || 'Unknown error'}`) 
      });
    }
  };

  const closeBox = () => {
    setActiveBox({ type: null, price: null });
    setFormMessage(null);
  };

  const formatOptions = [
    { value: 'docx', label: t('formatPrices.docx', 'DOCX') },
    { value: 'pdf', label: t('formatPrices.pdf', 'PDF') },
    { value: 'latex', label: t('formatPrices.latex', 'LaTeX') },
    { value: 'md', label: t('formatPrices.md', 'Markdown') }
  ];

  const formFields = [
    {
      section: t('formatPrices.form.settings', 'Settings'),
      fields: [
        { 
          label: t('formatPrices.form.format', 'Format'), 
          name: 'format', 
          required: true,
          type: 'select',
          options: formatOptions
        },
        { 
          label: t('formatPrices.form.creditPrice', 'Credit Price'), 
          name: 'credit_price', 
          type: 'number',
          required: true,
          min: 1,
          step: 1,
          defaultValue: 1
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('formatPrices.title', 'Format Credit Prices')}</h1>
          <p className="text-gray-600 mt-1">
            {t('formatPrices.description', 'Manage credit prices for each paper format.')}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t('header.lastUpdated', 'Last updated: 2 minutes ago')}</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchData()}
            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('formatPrices.refresh', 'Refresh')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('formatPrices.addPrice', 'Add Price')}
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
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('formatPrices.totalFormats', 'Total Formats')}</p>
              <p className="text-lg font-semibold text-gray-900">{prices.length}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('formatPrices.active', 'Active')}</p>
              <p className="text-lg font-semibold text-gray-900">{prices.length}</p>
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
              <File className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('formatPrices.pdf', 'PDF')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {prices.find(p => p.format === 'pdf')?.credit_price || 'N/A'}
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
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileInput className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('formatPrices.docx', 'DOCX')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {prices.find(p => p.format === 'docx')?.credit_price || 'N/A'}
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
        {activeBox.type === null ? (
          <>
            <DataTable
              data={prices}
              columns={columns}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              actions={true}
              actionsLabel={t('formatPrices.actions', 'Actions')}
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
        ) : null}

        {/* Add/Edit Form */}
        {(activeBox.type === 'add' || activeBox.type === 'edit') && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {activeBox.type === 'add' ? t('formatPrices.addPrice', 'Add Price') : t('formatPrices.editPrice', 'Edit Price')}
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
              modelName="FormatCreditPrice"
              title={activeBox.type === 'add' ? t('formatPrices.addPrice', 'Add Price') : t('formatPrices.editPrice', 'Edit Price')}
              fields={formFields}
              initialValues={editValues}
              onSubmit={handleFormSubmit}
              onCancel={closeBox}
              saveText={t('formatPrices.form.save', 'Save')}
              cancelText={t('formatPrices.form.cancel', 'Cancel')}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          open={modal.open && modal.type === 'delete'}
          title={t('formatPrices.deletePrice', 'Delete Price')}
          onClose={closeModal}
          actions={
            <>
              <button 
                onClick={closeModal} 
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {t('formatPrices.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                {t('formatPrices.confirmDelete', 'Confirm Delete')}
              </button>
            </>
          }
        >
          {modal.price && (
            <div className="text-gray-700">
              <p className="mb-2">{t('formatPrices.deleteConfirm', 'Are you sure you want to delete the price for:')}</p>
              <p className="font-semibold text-red-600 uppercase">{modal.price.format}</p>
              <p className="mt-2 text-sm text-gray-500">
                {t('formatPrices.deleteWarning', 'This action cannot be undone.')}
              </p>
            </div>
          )}
        </Modal>
      </motion.div>
    </div>
  );
};

export default FormatCreditPrices;