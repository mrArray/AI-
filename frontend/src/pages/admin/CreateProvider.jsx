
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import DynamicForm from '../../components/admin/DynamicForm';
import { useTranslation } from 'react-i18next';


const CreateProvider = () => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    
    // Simulate API call
    console.log('Creating provider with data:', formData);
    
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/admin/providers');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/providers');
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-96"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('createProvider.successTitle')}</h2>
          <p className="text-gray-600">{t('createProvider.successDesc')}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleCancel}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('createProvider.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('createProvider.desc')}
          </p>
        </div>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">{t('createProvider.infoCard.title')}</h3>
            <p className="text-sm text-blue-700 mt-1">
              {t('createProvider.infoCard.desc')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Form */}
      <DynamicForm
        modelName="LLMProvider"
        title="New LLM Provider"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />

      {/* Schema Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 rounded-lg p-6"
      >
  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('createProvider.schemaInfo.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('createProvider.schemaInfo.schemaParsing.title')}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>{t('createProvider.schemaInfo.schemaParsing.fetches')}</li>
              <li>{t('createProvider.schemaInfo.schemaParsing.parses')}</li>
              <li>{t('createProvider.schemaInfo.schemaParsing.generates')}</li>
              <li>{t('createProvider.schemaInfo.schemaParsing.supports')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('createProvider.schemaInfo.dynamicRendering.title')}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>{t('createProvider.schemaInfo.dynamicRendering.renders')}</li>
              <li>{t('createProvider.schemaInfo.dynamicRendering.applies')}</li>
              <li>{t('createProvider.schemaInfo.dynamicRendering.groups')}</li>
              <li>{t('createProvider.schemaInfo.dynamicRendering.handles')}</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateProvider;

