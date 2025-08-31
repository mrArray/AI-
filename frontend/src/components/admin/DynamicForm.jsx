import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { schemaParser } from '../../utils/schemaParser';

const DynamicForm = ({
  modelName,
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  title = 'Form',
  fields = null,
  cancelText = 'Cancel',
  saveText = 'Save'
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  const [formConfig, setFormConfig] = useState(null);

  useEffect(() => {
    const config = schemaParser.getFormConfig(modelName);
    setFormConfig(config);
  }, [modelName]);

  useEffect(() => {
    if (!formConfig) return;
    // Only set defaults if formData is empty and initialData is empty
    if (Object.keys(formData).length === 0 && Object.keys(initialData).length === 0) {
      const defaults = {};
      formConfig.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue;
        }
      });
      setFormData(defaults);
    } else if (Object.keys(initialData).length > 0) {
      // Only set if different to avoid loop
      const isDifferent = Object.keys(initialData).some(key => formData[key] !== initialData[key]);
      if (isDifferent) {
        setFormData(initialData);
      }
    }
  }, [formConfig, initialData]);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formConfig) return newErrors;

    formConfig.fields.forEach(field => {
      const value = formData[field.name];
      
      // Required field validation
      if (field.required && (!value || value === '')) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      // Skip validation for empty optional fields
      if (!value && !field.required) return;

      // Type-specific validation
      if (field.validation) {
        const { min, max, maxLength, format } = field.validation;
        
        if (maxLength && value.length > maxLength) {
          newErrors[field.name] = `${field.label} must be ${maxLength} characters or less`;
        }
        
        if (min !== undefined && value < min) {
          newErrors[field.name] = `${field.label} must be at least ${min}`;
        }
        
        if (max !== undefined && value > max) {
          newErrors[field.name] = `${field.label} must be at most ${max}`;
        }
        
        if (format === 'uri' && value && !isValidUrl(value)) {
          newErrors[field.name] = `${field.label} must be a valid URL`;
        }
        
        if (format === 'email' && value && !isValidEmail(value)) {
          newErrors[field.name] = `${field.label} must be a valid email`;
        }
      }
    });

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSubmit(formData);
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const isPassword = field.type === 'password';
    const showPassword = showPasswords[field.name];

    const baseInputClasses = `
      w-full px-3 py-2 border rounded-lg transition-colors
      ${error 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
      }
      ${field.readOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
    `;

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={field.readOnly}
            className={baseInputClasses}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              disabled={field.readOnly}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">{field.description}</span>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={field.readOnly}
            rows={4}
            className={baseInputClasses}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || '')}
            disabled={field.readOnly}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.validation?.step || 'any'}
            className={baseInputClasses}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              disabled={field.readOnly}
              className={`${baseInputClasses} pr-10`}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(field.name)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={field.readOnly}
            maxLength={field.validation?.maxLength}
            className={baseInputClasses}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  if (!formConfig) {
    return (
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If fields prop is provided (for i18n), use it; otherwise, use default field grouping
  let fieldSections;
  if (fields) {
    // Map 'section' to 'title' for i18n support
    fieldSections = fields.map(section => ({
      ...section,
      title: section.section || section.title
    }));
  } else {
    fieldSections = [
      {
        title: 'Basic Information',
        fields: formConfig.fields.filter(f => 
          ['name', 'display_name', 'provider_type', 'language', 'prompt_type'].includes(f.name)
        )
      },
      {
        title: 'Configuration',
        fields: formConfig.fields.filter(f => 
          ['base_url', 'api_key', 'timeout', 'max_retries', 'context_length', 'max_tokens', 'temperature_default'].includes(f.name)
        )
      },
      {
        title: 'Content',
        fields: formConfig.fields.filter(f => 
          ['description', 'template', 'variables'].includes(f.name)
        )
      },
      {
        title: 'Status & Settings',
        fields: formConfig.fields.filter(f => 
          ['is_active', 'is_default', 'supports_streaming', 'cost_per_1k_tokens'].includes(f.name)
        )
      },
      {
        title: 'System',
        fields: formConfig.fields.filter(f => 
          ['id', 'created_at', 'updated_at'].includes(f.name)
        )
      }
    ].filter(section => section.fields.length > 0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow"
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {fieldSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
              {section.title}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field, fieldIndex) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (sectionIndex * 0.1) + (fieldIndex * 0.05) }}
                  className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                    {field.description && (
                      <div className="group relative inline-block ml-1">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                          {field.description}
                        </div>
                      </div>
                    )}
                  </label>
                  
                  {renderField(field)}
                  
                  {errors[field.name] && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center mt-1 text-sm text-red-600"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors[field.name]}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Saving...' : saveText}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

// Helper functions
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default DynamicForm;

