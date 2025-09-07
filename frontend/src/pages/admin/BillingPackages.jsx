import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Package,
  CheckCircle,
  XCircle,
  Zap,
  DollarSign,
  Percent,
  Edit,
  Trash2,
  RefreshCw,
  Star
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import DynamicForm from '../../components/admin/DynamicForm';
import Modal from '../../components/admin/Modal';
import { billingAPI } from '../../api/billing';
import { useTranslation } from 'react-i18next';
import { useToast, TOAST_TYPES } from '../../contexts/ToastContext';
import AuthContext from '../../contexts/AuthContext';

// Utility: Normalize model data for form
function normalizeModelForForm(model, formFields) {
  const normalized = {};
  formFields.forEach(section => {
    section.fields.forEach(field => {
      normalized[field.name] = model[field.name] !== undefined ? model[field.name] : (field.defaultValue !== undefined ? field.defaultValue : '');
    });
  });
  return normalized;
}

const BillingPackages = () => {
  const { t } = useTranslation('dashboard');
  const { showToast } = useToast();
  const [packages, setPackages] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null, page: 1 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: null, package: null });
  const [activeBox, setActiveBox] = useState({ type: null, package: null });
  const [editValues, setEditValues] = useState({});
  const [formMessage, setFormMessage] = useState(null);
  const { token } = useContext(AuthContext);

  // Fetch packages with full CRUD support
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      const packagesRes = await billingAPI.getPackages(params, token);
      let packagesData = packagesRes.data || packagesRes;
      
      if (packagesData && typeof packagesData === 'object' && Array.isArray(packagesData.results)) {
        setPackages(packagesData.results);
        setPagination({
          count: packagesData.count,
          next: packagesData.next,
          previous: packagesData.previous,
          page
        });
      } else {
        setPackages(Array.isArray(packagesData) ? packagesData : [packagesData]);
        setPagination({ count: 0, next: null, previous: null, page: 1 });
      }
    } catch (e) {
      console.error('Failed to fetch packages:', e);
      setPackages([]);
      setPagination({ count: 0, next: null, previous: null, page: 1 });
      showToast({ 
        type: TOAST_TYPES.ERROR, 
        message: t('billingPackages.fetchError', 'Failed to fetch packages data') 
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
      label: t('billingPackages.name'),
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
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
      key: 'credits',
      label: t('billingPackages.credits'),
      render: (value) => (
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-900">{value?.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'price',
      label: t('billingPackages.price'),
      render: (value, item) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-3 h-3 text-gray-400" />
          <span className="text-sm text-gray-900">
            {item.currency} {value}
            {item.discount_percentage > 0 && (
              <span className="ml-2 line-through text-gray-400">
                {item.original_price}
              </span>
            )}
          </span>
        </div>
      )
    },
    {
      key: 'price_per_credit',
      label: t('billingPackages.pricePerCredit'),
      render: (value) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-3 h-3 text-gray-400" />
          <span className="text-sm text-gray-900">{value?.toFixed(4)}</span>
        </div>
      )
    },
    {
      key: 'is_active',
      label: t('billingPackages.status'),
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded-full ${value ? 'bg-green-100' : 'bg-gray-100'}`}>
            {value ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-gray-500" />
            )}
          </div>
          <span className="text-sm text-gray-900">{value ? t('billingPackages.active') : t('billingPackages.inactive')}</span>
          {item.is_popular && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
              <Star className="w-3 h-3 mr-1" />
              {t('billingPackages.popular')}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
      label: t('billingPackages.created'),
      type: 'date',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    }
  ];

  // CRUD actions
  const openModal = (type, packageItem = null) => {
    setModal({ open: true, type, package: packageItem });
  };

  const closeModal = () => {
    setModal({ open: false, type: null, package: null });
  };

  const handleAdd = () => {
    setActiveBox({ type: 'add', package: null });
    setEditValues({
      name: '',
      description: '',
      credits: 1000,
      price: 10,
      currency: 'USD',
      features: [],
      is_popular: false,
      is_active: true,
      order: 0,
      discount_percentage: 0,
      original_price: 10
    });
    setFormMessage(null);
  };

  const handleEdit = async (packageItem) => {
    let latestPackage = packageItem;
    try {
      const res = await billingAPI.getBillingPackage(packageItem.id, token);
      latestPackage = res.data || res;
    } catch (e) {
      // fallback to passed package
    }
    const normalized = normalizeModelForForm(latestPackage, formFields);
    setEditValues(normalized);
    setActiveBox({ type: 'edit', package: packageItem });
    setFormMessage(null);
  };

  const handleView = (packageItem) => {
    console.log('View package:', packageItem);
  };

  const handleDelete = (packageItem) => openModal('delete', packageItem);

  const handleFormSubmit = async (formData) => {
    try {
      // Calculate original price if discount is applied
      if (formData.discount_percentage > 0 && formData.discount_percentage <= 100) {
        formData.original_price = formData.price;
        formData.price = formData.price * (1 - formData.discount_percentage / 100);
      } else {
        formData.discount_percentage = 0;
        formData.original_price = formData.price;
      }

      if (activeBox.type === 'add') {
        await billingAPI.createBillingPackage(formData, token);
        setFormMessage({ type: 'success', text: t('billingPackages.createSuccess', 'Package created successfully!') });
        showToast({ 
          type: TOAST_TYPES.SUCCESS, 
          message: t('billingPackages.createSuccess', 'Package created successfully!') 
        });
        setTimeout(() => setFormMessage(null), 3000);
      } else if (activeBox.type === 'edit' && activeBox.package) {
        await billingAPI.updateBillingPackage(activeBox.package.id, formData, token);
        setFormMessage({ type: 'success', text: t('billingPackages.updateSuccess', 'Package updated successfully!') });
        showToast({ 
          type: TOAST_TYPES.SUCCESS, 
          message: t('billingPackages.updateSuccess', 'Package updated successfully!') 
        });
        setTimeout(() => setFormMessage(null), 3000);
      }
      setActiveBox({ type: null, package: null });
      await fetchData();
    } catch (error) {
      console.error('Form submission failed:', error);
      let errorText = error?.message || t('billingPackages.createError', 'Operation failed!');
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
        message: error?.message || t('billingPackages.createError', 'Operation failed!') 
      });
      setTimeout(() => setFormMessage(null), 6000);
    }
  };

  const handleModalSubmit = async () => {
    try {
      if (modal.type === 'delete' && modal.package) {
        await billingAPI.deleteBillingPackage(modal.package.id, token);
        showToast({ 
          type: TOAST_TYPES.SUCCESS, 
          message: t('billingPackages.deleteSuccess', 'Package deleted successfully!') 
        });
        closeModal();
        await fetchData();
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
      showToast({ 
        type: TOAST_TYPES.ERROR, 
        message: t('billingPackages.deleteError', `Delete failed: ${error.message || 'Unknown error'}`) 
      });
    }
  };

  const closeBox = () => {
    setActiveBox({ type: null, package: null });
    setFormMessage(null);
  };

  const formFields = [
    {
      section: t('billingPackages.form.basicInfo'),
      fields: [
        { 
          label: t('billingPackages.form.name'), 
          name: 'name', 
          required: true,
          placeholder: 'Enter package name'
        },
        { 
          label: t('billingPackages.form.description'), 
          name: 'description',
          type: 'textarea',
          placeholder: 'Enter package description'
        },
        { 
          label: t('billingPackages.form.features'), 
          name: 'features',
          type: 'textarea',
          placeholder: 'Enter features (one per line)',
          transformValue: (value) => value.split('\n').filter(item => item.trim()),
          transformDisplay: (value) => Array.isArray(value) ? value.join('\n') : value
        }
      ]
    },
    {
      section: t('billingPackages.form.pricing'),
      fields: [
        { 
          label: t('billingPackages.form.credits'), 
          name: 'credits', 
          type: 'number',
          required: true,
          defaultValue: 1000,
          min: 1
        },
        { 
          label: t('billingPackages.form.price'), 
          name: 'price', 
          type: 'number',
          required: true,
          defaultValue: 10,
          min: 0,
          step: 0.01
        },
        { 
          label: t('billingPackages.form.currency'), 
          name: 'currency', 
          type: 'select',
          required: true,
          defaultValue: 'USD',
          options: [
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' },
            { value: 'GBP', label: 'GBP' },
            { value: 'JPY', label: 'JPY' },
            { value: 'CNY', label: 'CNY' }
          ]
        },
        { 
          label: t('billingPackages.form.discountPercentage'), 
          name: 'discount_percentage', 
          type: 'number',
          defaultValue: 0,
          min: 0,
          max: 100,
          step: 1,
          renderLabel: (value) => (
            <div className="flex items-center">
              <span>{t('billingPackages.form.discountPercentage')}</span>
              {value > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800">
                  {value}% OFF
                </span>
              )}
            </div>
          )
        }
      ]
    },
    {
      section: t('billingPackages.form.settings'),
      fields: [
        { 
          label: t('billingPackages.form.active'), 
          name: 'is_active', 
          type: 'checkbox',
          defaultValue: true
        },
        { 
          label: t('billingPackages.form.popular'), 
          name: 'is_popular', 
          type: 'checkbox',
          defaultValue: false
        },
        { 
          label: t('billingPackages.form.order'), 
          name: 'order', 
          type: 'number',
          defaultValue: 0,
          min: 0
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('billingPackages.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('billingPackages.description')}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t('header.lastUpdated')}</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchData()}
            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('billingPackages.refresh', 'Refresh')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('billingPackages.addPackage')}
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
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('billingPackages.totalPackages')}</p>
              <p className="text-lg font-semibold text-gray-900">{packages.length}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('billingPackages.active')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {packages.filter(p => p.is_active).length}
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
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('billingPackages.popular')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {packages.filter(p => p.is_popular).length}
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
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{t('billingPackages.discounted')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {packages.filter(p => p.discount_percentage > 0).length}
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
              data={packages}
              columns={columns}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              actions={true}
              actionsLabel={t('billingPackages.actions')}
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
              {activeBox.type === 'add' ? t('billingPackages.addPackage') : t('billingPackages.editPackage')}
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
              modelName="BillingPackage"
              title={activeBox.type === 'add' ? t('billingPackages.addPackage') : t('billingPackages.editPackage')}
              fields={formFields}
              initialValues={editValues}
              onSubmit={handleFormSubmit}
              onCancel={closeBox}
              saveText={t('billingPackages.form.save')}
              cancelText={t('billingPackages.form.cancel')}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          open={modal.open && modal.type === 'delete'}
          title={t('billingPackages.deletePackage')}
          onClose={closeModal}
          actions={
            <>
              <button 
                onClick={closeModal} 
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {t('billingPackages.cancel')}
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                {t('billingPackages.confirmDelete')}
              </button>
            </>
          }
        >
          {modal.package && (
            <div className="text-gray-700">
              <p className="mb-2">{t('billingPackages.deleteConfirm', 'Are you sure you want to delete the package:')}</p>
              <p className="font-semibold text-red-600">{modal.package.name}</p>
              <p className="mt-2 text-sm text-gray-500">
                {t('billingPackages.deleteWarning', 'This action cannot be undone.')}
              </p>
            </div>
          )}
        </Modal>
      </motion.div>
    </div>
  );
};

export default BillingPackages;