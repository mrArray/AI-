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

const DynamicForm = ({
  modelName,
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
  title = 'Form',
  fields = [],
  cancelText = 'Cancel',
  saveText = 'Save',
  hideActions = false,
  id
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({});

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormData(initialValues);
    } else {
      // Set default values if provided in field definitions
      const defaults = {};
      fields.forEach(section => {
        section.fields.forEach(field => {
          if (field.defaultValue !== undefined) {
            defaults[field.name] = field.defaultValue;
          }
        });
      });
      setFormData(defaults);
    }
  }, [initialValues, fields]);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    fields.forEach(section => {
      section.fields.forEach(field => {
        const value = formData[field.name];
        
        // Required field validation
        if (field.required && (!value && value !== false && value !== 0)) {
          newErrors[field.name] = `${field.label} is required`;
          return;
        }

        // Skip validation for empty optional fields
        if (!value && !field.required) return;

        // Type-specific validation
        if (field.min !== undefined && value < field.min) {
          newErrors[field.name] = `${field.label} must be at least ${field.min}`;
        }
        
        if (field.max !== undefined && value > field.max) {
          newErrors[field.name] = `${field.label} must be at most ${field.max}`;
        }
        
        if (field.maxLength && value.length > field.maxLength) {
          newErrors[field.name] = `${field.label} must be ${field.maxLength} characters or less`;
        }
      });
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
    const value = formData[field.name] ?? '';
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
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || '')}
            disabled={field.readOnly}
            min={field.min}
            max={field.max}
            step={field.step || 'any'}
            className={baseInputClasses}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
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
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
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
            type={field.type || 'text'}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={field.readOnly}
            maxLength={field.maxLength}
            className={baseInputClasses}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow"
    >
      

      <form onSubmit={handleSubmit} id={id} className="p-6 space-y-8">
        {fields.map((section, sectionIndex) => (
          <motion.div
            key={section.section || section.title || sectionIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
              {section.section || section.title}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {section.fields.map((field, fieldIndex) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (sectionIndex * 0.1) + (fieldIndex * 0.05) }}
                  className={`
                    ${field.type === 'textarea' || field.fullWidth ? 'md:col-span-3' : ''}
                    ${field.type === 'checkbox' ? 'flex items-center' : ''}
                  `}
                >
                  {field.type !== 'checkbox' && (
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
                  )}
                  
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
        {!hideActions && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Saving...' : saveText}
            </motion.button>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default DynamicForm;