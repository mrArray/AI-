import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { papersAPI } from '../api/papers';


function DocumentGenerator() {
  const { t, i18n } = useTranslation('document-generator');
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [apiPaper, setApiPaper] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewContent, setPreviewContent] = useState('');
  const [error, setError] = useState(null);
  const { openLoginModal } = useModal();

  // Fetch templates for all users (authenticated or guest)
  useEffect(() => {
    if (authLoading) return;

    const fetchTemplates = async () => {
      try {
        const { data } = await papersAPI.getTemplates({ language: i18n.language });
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(data[0].id);
        }
      } catch (error) {
        setError(t('coreFeatures.errors.templates'));
      }
    };

    fetchTemplates();
  }, [authLoading, t, i18n.language]);

  // Update form data when template changes
  useEffect(() => {
    if (!selectedTemplate || templates.length === 0) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const inputs = {};

    template.required_fields.forEach(field => {
      if (field.type === 'number') {
        // Set to numeric value
        inputs[field.name] = field.min_value || 0;
      } else if (field.type === 'select' && field.options?.length > 0) {
        inputs[field.name] = field.options[0];
      } else {
        inputs[field.name] = '';
      }
    });

    setFormData({
      title: '',
      ...inputs
    });
  }, [selectedTemplate, templates]);

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setPreviewContent('');
    setApiPaper(null);
    setError(null);
  };


  const handleInputChange = (field, value) => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Find field definition to determine type
    const fieldDefinition = [
      ...template.required_fields,
      ...(template.optional_fields || [])
    ].find(f => f.name === field);

    setFormData(prev => ({
      ...prev,
      [field]: fieldDefinition?.type === 'number' && value !== ''
        ? Number(value)  // Convert to number
        : value          // Keep as string for other types
    }));
  };

  // Only change: show login modal if not authenticated, else generate
  const handleGenerateClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    generatePaper();
  };

  const generatePaper = async () => {
    if (!selectedTemplate || !token || !isAuthenticated) {
      setError(t('coreFeatures.errors.auth'));
      return;
    }

    setIsGenerating(true);
    setPreviewContent('');
    setError(null);

    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) {
        throw new Error('Template not found');
      }

      // Validate required fields
      const missingFields = template.required_fields
        .filter(field => field.required && !formData[field.name])
        .map(field => field.label);

      if (missingFields.length > 0) {
        throw new Error(
          t('coreFeatures.errors.missingFields', { fields: missingFields.join(', ') })
        );
      }

      const payload = {
        template_id: selectedTemplate,
        title: formData.title || `${formData.topic || 'Generated'} Paper`,
        user_inputs: {}
      };

      template.required_fields.forEach(field => {
        payload.user_inputs[field.name] = formData[field.name];
      });

      template.optional_fields.forEach(field => {
        if (formData[field.name]) {
          payload.user_inputs[field.name] = formData[field.name];
        }
      });

      const data = await papersAPI.generatePaper(payload);
      setApiPaper(data);
      setPreviewContent(data.content);

    } catch (error) {
      console.error('Error generating paper:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || {};

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-12 w-12 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // UI always shown, login modal only on generate click
  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl shadow-xl overflow-hidden">
      <div className="md:flex">
        {/* Input Section */}
        <div className="md:w-1/2 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="bg-sky-100 text-sky-800 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 极 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </span>
              {t('coreFeatures.inputSection.title')}
            </h2>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Template Selection (Horizontal Slider) */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
              <span className="bg-sky-100 text-sky-800 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </span>
              {t('coreFeatures.templates.title')}
            </h3>

            {/* Custom Horizontal Template Slider */}
            <div className="relative overflow-hidden group">
              <div className="flex overflow-x-auto pb-4 -mx-2 hide-scrollbar scroll-smooth px-2 snap-x snap-mandatory scroll-px-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`flex-shrink-0 w-60 mx-2 border rounded-xl p-4 cursor-pointer transition-all duration-300 snap-start ${selectedTemplate === template.id
                        ? 'border-sky-500 bg-sky-50 shadow-md ring-2 ring-sky-200'
                        : 'border-gray-300 hover:border-sky-300 hover:bg-sky-50'
                      }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">
                        {template.paper_type === 'research' ? '🔬' :
                          template.paper_type === 'essay' ? '📝' :
                            template.paper_type === 'proposal' ? '📋' : '📄'}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <div className="text-xs mt-1">
                          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">
                            {template.estimated_credits} credits
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Custom Scroll Indicators */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gradient-to-r from-sky-50 to-transparent w-full h-full flex items-center pl-2">
                  <div className="bg-gray-800 bg-opacity-40 rounded-full p-1 shadow-md text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gradient-to-l from-sky-50 to-transparent w-full h-full flex items-center justify-end pr-2">
                  <div className="bg-gray-800 bg-opacity-40 rounded-full p-1 shadow-md text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Paper Requirements (Only shown when template is selected) */}
          {selectedTemplate && currentTemplate.required_fields && (
            <div className="mb-6 transition-all duration-500">
              <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <span className="bg-sky-100 text-sky-800 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm4 11a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </span>
                {t('coreFeatures.requirements.title')}
              </h3>

              <div className="bg-sky-50 rounded-xl p-5 border border-sky-100 shadow-sm">
                {/* Paper Title */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('coreFeatures.requirements.paperTitle')}
                    <span className="text-gray-400 font-normal"> ({t('coreFeatures.requirements.optional')})</span>
                  </label>
                  <input
                    type="text"
                    className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    placeholder={t('coreFeatures.requirements.titlePlaceholder')}
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                {/* Template-specific Fields */}
                <div className="space-y-4">
                  {currentTemplate.required_fields.map((field) => (
                    <div key={field.name} className="bg-white p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          rows="3"
                          className="block w-full border border-gray-300 rounded-lg p-3 text-sm"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          className="block w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-sky-500 focus:border-sky-500"
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                        >
                          {field.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : field.type === 'number' ? (
                        <div className="flex items-center max-w-xs">
                          <input
                            type="number"
                            className="block w-full border border-gray-300 rounded-lg p-3 text-sm"
                            placeholder={field.placeholder}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            min={field.min_value}
                            max={field.max_value}
                            required={field.required}
                          />
                          <span className="ml-3 text-gray-500 text-sm">{t('coreFeatures.requirements.words')}</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="block w-full border border-gray-300 rounded-lg p-3 text-sm"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                          minLength={field.min_length}
                          maxLength={field.max_length}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="mt-6">
            <button
              onClick={handleGenerateClick}
              disabled={!selectedTemplate || isGenerating}
              className={`w-full py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center transition-all shadow-lg ${selectedTemplate && !isGenerating
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('coreFeatures.generateButton.loading')}
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  {t('coreFeatures.generateButton.default')}
                </>
              )}
            </button>
            <div className="mt-3 flex justify-between text-sm text-gray-500">
              <span>{t('coreFeatures.credits.remaining')}: <strong>{user?.credits ?? '0'}</strong></span>
              {currentTemplate.estimated_credits && (
                <span>{t('coreFeatures.credits.cost')}: <strong>{currentTemplate.estimated_credits}</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="md:w-1/2 bg-gradient-to-br from-sky-500 to-blue-600 p-8 flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              {t('coreFeatures.preview.title')}
            </h2>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 transition disabled:opacity-50 flex items-center"
                onClick={() => {
                  if (apiPaper?.docx_file) {
                    window.open(apiPaper.docx_file, '_blank');
                  }
                }}
                disabled={!apiPaper?.docx_file}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Word
              </button>
              <button
                className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 transition disabled:opacity-50 flex items-center"
                onClick={() => {
                  if (apiPaper?.pdf_file) {
                    window.open(apiPaper.pdf_file, '_blank');
                  }
                }}
                disabled={!apiPaper?.pdf_file}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                PDF
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl overflow-hidden shadow-2xl flex-grow flex flex-col">
            <div className="bg-gray-50 border-b px-4 py-2 flex items-center">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="ml-4 text-sm text-gray-500 truncate">
                {selectedTemplate
                  ? `${currentTemplate.name} - ${formData.title || t('coreFeatures.preview.untitled')}`
                  : t('coreFeatures.preview.emptyTitle')}
              </div>
            </div>

            <div className="p-6 flex-grow overflow-auto bg-gray-50">
              {selectedTemplate ? (
                <div className="bg-white border rounded-lg p-6 shadow-inner h-full">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <svg className="animate-spin h-12 w-12 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-4 text-gray-600">{t('coreFeatures.generateButton.loading')}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {t('coreFeatures.generationTime')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {previewContent ? (
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewContent }} />
                      ) : (
                        <>
                          <div>
                            <h3 className="font-bold text-lg mb-2">
                              {t('coreFeatures.preview.sections.abstract')}
                            </h3>
                            <p className="text-gray-700">
                              {t('coreFeatures.preview.sections.abstractContent', { context: currentTemplate.paper_type })}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-2">
                              {t('coreFeatures.preview.sections.introduction')}
                            </h3>
                            <p className="text-gray-700">
                              {t('coreFeatures.preview.sections.introductionContent', { context: currentTemplate.paper_type })}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-2">
                              {t('coreFeatures.preview.sections.methodology')}
                            </h3>
                            <p className="text-gray-700">
                              {t('coreFeatures.preview.sections.methodologyContent')}
                            </p>
                          </div>

                          <div className="text-right text-sm text-gray-500">
                            <p>
                              {t('coreFeatures.preview.sections.pageInfo', { page: 1, total: 5 })}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="bg-sky-100 p-4 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium text-lg mb-2">
                    {t('coreFeatures.preview.emptyTitle')}
                  </h3>
                  <p className="text-black-100 text-sm">
                    {t('coreFeatures.preview.emptyDescription')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentGenerator;