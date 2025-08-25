import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { papersAPI } from '../api/papers';

function extractHtmlParts(htmlString) {
  // Extract <style>...</style>
  const styleMatch = htmlString.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const style = styleMatch ? styleMatch[1] : '';
  // Extract <body>...</body>
  const bodyMatch = htmlString.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : htmlString;
  return { style, body };
}

function prefixCss(css, prefix = '.preview-html') {
  // Prefix each selector with .preview-html (very basic, does not handle @media or nested rules)
  return css.replace(/(^|\})\s*([^{@}][^{]*)\{/g, (match, brace, selector) => {
    // Skip empty selectors and @ rules
    if (!selector.trim() || selector.trim().startsWith('@')) return match;
    // Prefix each selector (can be comma separated)
    const prefixed = selector
      .split(',')
      .map(sel => `${prefix} ${sel.trim()}`)
      .join(', ');
    return `${brace} ${prefixed} {`;
  });
}

function DocumentFormatter() {
  const { t, i18n } = useTranslation('home');
  const { token, isAuthenticated } = useAuth();
  const { openLoginModal } = useModal();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [formats, setFormats] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [error, setError] = useState(null);
  const [formattedContent, setFormattedContent] = useState(null);
  const [formatDetail, setFormatDetail] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch formats as before
  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const { data } = await papersAPI.getFormats(i18n.language);
        const formatList = data || [];
        setFormats(formatList);
        if (formatList.length > 0) setSelectedFormat(formatList[0].id);
      } catch (err) {
        setError(t('formatter.errors.fetchFormats'));
      }
    };
    fetchFormats();
  }, [i18n.language, t]);

  // Fetch format detail when selectedFormat changes
  useEffect(() => {
    if (!selectedFormat) {
      setFormatDetail(null);
      return;
    }
    const fetchFormatDetail = async () => {
      try {
        const detail = await papersAPI.getFormatDetail(selectedFormat);
        setFormatDetail(detail);
      } catch (err) {
        setFormatDetail(null);
      }
    };
    fetchFormatDetail();
    setFormattedContent(null); // Reset preview to format detail on select
  }, [selectedFormat]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword' ||
        file.type === 'application/pdf'
      )
    ) {
      setUploadedFile(file);
      setError(null);
    } else {
      setError(t('formatter.errors.unsupportedFile'));
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFormattedContent(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFormatClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    formatDocument();
  };

  const formatDocument = async () => {
    if (!uploadedFile || !selectedFormat) return;
    setIsFormatting(true);
    setError(null);
    setFormattedContent(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('format_id', selectedFormat);
      formData.append('language', i18n.language);

      const data = await papersAPI.formatWithLLM({
        file: uploadedFile,
        format_id: selectedFormat,
        language: i18n.language,
      });
      setFormattedContent(data.formatted_content);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsFormatting(false);
    }
  };

  // Extract style and body from formattedContent if present
  let previewStyle = '';
  let previewBody = '';
  if (formattedContent) {
    const parts = extractHtmlParts(formattedContent);
    previewStyle = parts.style;
    previewBody = parts.body;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl shadow-xl overflow-hidden">
      <div className="md:flex">
        {/* Input Section */}
        <div className="md:w-1/2 p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="bg-purple-100 text-purple-800 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              {t('formatter.uploadTitle')}
            </h2>
            <div className="mt-4">
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        {t('formatter.uploadPlaceholder')}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {t('formatter.supportedFormats')}
                      </span>
                    </label>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".docx,.doc,.pdf"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {t('formatter.emptyDescription')}
              </p>
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <span className="bg-purple-100 text-purple-800 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </span>
              {t('formatter.formatStyleTitle')}
            </h3>
            {/* Horizontal slider for formats */}
            <div className="relative overflow-hidden group mt-4">
              <div className="flex overflow-x-auto pb-4 -mx-2 hide-scrollbar scroll-smooth px-2 snap-x snap-mandatory scroll-px-2">
                {formats.map((format) => (
                  <div
                    key={format.id}
                    className={`flex-shrink-0 w-60 mx-2 border rounded-xl p-4 cursor-pointer transition-all duration-300 snap-start ${
                      selectedFormat === format.id
                        ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200'
                        : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3 mt-1">
                        <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{format.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              onClick={handleFormatClick}
              disabled={!uploadedFile || !selectedFormat || isFormatting}
              className={`w-full py-3 px-6 rounded-xl font-bold text-white flex items-center justify-center transition-all shadow-lg ${
                uploadedFile && selectedFormat && !isFormatting
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isFormatting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('formatter.formatting')}
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('formatter.formatButton')}
                </>
              )}
            </button>
            <p className="mt-3 text-center text-sm text-gray-500">
              {t('formatter.costTip')}
            </p>
          </div>
        </div>
        {/* Preview Section */}
        <div className="md:w-1/2 bg-gradient-to-br from-purple-500 to-violet-600 p-8 flex flex-col">
          <div className="mt-6 bg-white rounded-xl overflow-hidden shadow-2xl flex-grow flex flex-col">
            <div className="p-6 flex-grow overflow-auto bg-gray-50">
              {isFormatting ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <svg className="animate-spin h-12 w-12 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-4 text-gray-600">{t('formatter.formatting')}</p>
                </div>
              ) : formattedContent ? (
                <div className="bg-white border rounded-lg p-6 shadow-inner h-full text-gray-900">
                  {/* Scope styles to preview only */}
                  <div className="preview-html">
                    <style>{prefixCss(previewStyle)}</style>
                    <div dangerouslySetInnerHTML={{ __html: previewBody }} />
                  </div>
                </div>
              ) : formatDetail ? (
                <div className="bg-white border rounded-lg p-6 shadow-inner h-full text-gray-900">
                  <h4 className="font-semibold mb-2">{formatDetail.name}</h4>
                  <p className="mb-2">{formatDetail.description}</p>
                  {formatDetail.template_structure && (
                    <>
                      <h5 className="font-semibold mt-4 mb-1">{t('Sections')}</h5>
                      <ul className="list-disc list-inside text-gray-700 mb-2">
                        {formatDetail.template_structure.sections.map(section => (
                          <li key={section.order}>
                            {section.name}
                            {section.required ? <span className="text-xs text-green-600 ml-2">({t('Required')})</span> : <span className="text-xs text-gray-400 ml-2">({t('Optional')})</span>}
                          </li>
                        ))}
                      </ul>
                      <h5 className="font-semibold mt-4 mb-1">{t('Formatting')}</h5>
                      <ul className="list-disc list-inside text-gray-700">
                        {formatDetail.template_structure.formatting && Object.entries(formatDetail.template_structure.formatting).map(([key, value]) => (
                          <li key={key}>
                            <span className="capitalize">{key.replace('_', ' ')}:</span> {value}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {formatDetail.style_guidelines && (
                    <div>
                      <h5 className="font-semibold mt-4 mb-1">{t('Style Guidelines')}</h5>
                      <pre className="bg-gray-100 rounded p-2 text-sm whitespace-pre-wrap">{formatDetail.style_guidelines}</pre>
                    </div>
                  )}
                  {formatDetail.citation_style && (
                    <div className="mt-2">
                      <span className="font-semibold">{t('Citation Style')}: </span>
                      <span>{formatDetail.citation_style}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="bg-purple-100 p-4 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-black font-medium text-lg mb-2">
                    {t('formatter.emptyTitle')}
                  </h3>
                  <p className="text-black-100 text-sm">
                    {t('formatter.preview.emptyDescription')}
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

export default DocumentFormatter;
