import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';


const outputFormats = [
  { key: 'docx', icon: 'fas fa-file-word text-blue-600', label: 'DOCX' },
  { key: 'pdf', icon: 'fas fa-file-pdf text-red-600', label: 'PDF' },
  { key: 'latex', icon: 'fas fa-code text-green-600', label: 'LaTeX' },
  { key: 'md', icon: 'fab fa-markdown text-purple-600', label: 'MD' },
];

function HomePage() {
  const [activeMode, setActiveMode] = useState('formatter'); // 默认显示排版功能
  const fileInputRef = useRef();
  const { t } = useTranslation('home');

  const [file, setFile] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('docx');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // File upload handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setShowFileModal(true);
    }
  };

  const closeFileModal = () => {
    setShowFileModal(false);
    setShowFilePreview(true);
  };

  // Format selection
  const handleFormatSelect = (key) => {
    setSelectedFormat(key);
  };

  // Start formatting simulation
  const handleStart = () => {
    if (!file) {
      setShowFilePreview(true);
    }
    setProcessing(true);
    setShowSuccess(false);
    setDownloaded(false);
    setProgress(0);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setProcessing(false);
          setShowSuccess(true);
        }, 1000);
      }
    }, 300);
  };

  // Download simulation
  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <Header />

      {/* Main Converter Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('formatter.title')}</h2>
          <p className="text-gray-600">{t('formatter.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Left Panel */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <i className="fas fa-file-upload mr-2 text-indigo-600"></i>
                {t('formatter.uploadTitle')}
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current.click()}
              >
                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 group-hover:text-indigo-500 transition-colors mb-3"></i>
                <p className="text-gray-600 mb-2">{t('formatter.uploadPlaceholder')}</p>
                <p className="text-xs text-gray-500 mb-3">{t('formatter.supportedFormats')}</p>
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={e => { e.stopPropagation(); fileInputRef.current.click(); }}
                >
                  {t('formatter.browseFiles', 'Browse Files')}
                </button>
                <input
                  type="file"
                  accept=".doc,.docx,.pdf,.txt,.md"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
              {/* File Preview */}
              {showFilePreview && file && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200" id="file-preview">
                  <div className="flex items-center text-blue-800">
                    <i className="fas fa-file-alt mr-2"></i>
                    <span className="text-sm">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                    <button
                      className="ml-auto text-blue-600 hover:text-blue-800"
                      onClick={() => { setFile(null); setShowFilePreview(false); }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Requirements Input */}
            <div className="mb-6 flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <i className="fas fa-list-alt mr-2 text-indigo-600"></i>
                {t('formatter.requirements')}
              </label>
              <textarea
                className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder={t('formatter.requirementsPlaceholder')}
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
              />
            </div>

            {/* Output Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <i className="fas fa-file-export mr-2 text-indigo-600"></i>
                {t('formatter.formatStyleTitle', 'Output Format')}
              </label>
              <div className="flex space-x-3">
                {outputFormats.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={`format-btn flex-1 p-3 border-2 rounded-lg text-center transition-all group ${selectedFormat === f.key ? 'active border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                    onClick={() => handleFormatSelect(f.key)}
                  >
                    <i className={`${f.icon} text-xl mb-1 block`}></i>
                    <span className="text-sm font-medium text-gray-700">{t(`formatter.formats.${f.key}`, f.label)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Processing Status */}
            {processing && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200" id="processing-status">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">{t('formatter.processingStatusTitle', 'AI Processing Status')}</span>
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    <span className="text-sm text-indigo-600">{t('formatter.processing', 'Processing...')}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: progress + '%' }}
                    id="progress-bar"
                  ></div>
                </div>
                <p className="text-xs text-gray-600">{t('formatter.processingStatusDesc', 'Document analysis and formatting in progress...')}</p>
              </div>
            )}

            {/* Start Button */}
            <button
              id="start-btn"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={handleStart}
              disabled={processing}
            >
              {processing ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i>{t('formatter.processing', 'Processing...')}</>
              ) : (
                <><i className="fas fa-magic mr-2"></i>{showSuccess ? t('formatter.formatButton') : t('formatter.startButton', 'Start AI Formatting')}</>
              )}
            </button>
          </div>

          {/* Right Panel */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
            {/* Preview Area */}
            <div className="flex-1 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-eye text-indigo-600 mr-3"></i>
                {t('formatter.previewTitle', 'Overview of The Finished One')}
              </h3>
              <div className="bg-gray-50 rounded-xl h-full p-4 border-2 border-gray-200 overflow-y-auto min-h-[400px]">
                {/* Default Preview State */}
                {!processing && !showSuccess && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <i className="fas fa-file-alt text-6xl mb-4"></i>
                    <p className="text-lg font-medium mb-2">{t('formatter.preview.title')}</p>
                    <p className="text-sm text-center">{t('formatter.preview.content')}</p>
                  </div>
                )}
                {/* Formatted Document Preview */}
                {(processing || showSuccess) && (
                  <div className="bg-white p-6 rounded-lg shadow-sm min-h-full">
                    <div className="text-center mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('formatter.title')}</h2>
                      <p className="text-gray-600">{t('formatter.subtitle')}</p>
                      <p className="text-xs text-gray-500">University of Technology</p>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h2 className="font-semibold mb-2 text-base">Abstract</h2>
                        <p className="text-gray-700 leading-relaxed text-justify">This paper presents a comprehensive analysis of machine learning applications in modern healthcare systems. We examine various algorithms and their practical implementations in clinical settings, demonstrating significant improvements in diagnostic accuracy and patient outcomes.</p>
                      </div>
                      <div>
                        <h2 className="font-semibold mb-2 text-base">1. Introduction</h2>
                        <p className="text-gray-700 leading-relaxed text-justify">Healthcare systems worldwide are experiencing rapid digital transformation. Machine learning technologies offer unprecedented opportunities to improve patient outcomes, reduce costs, and enhance the efficiency of medical processes. This study investigates the current state and future potential of AI-driven healthcare solutions.</p>
                      </div>
                      <div>
                        <h2 className="font-semibold mb-2 text-base">2. Literature Review</h2>
                        <p className="text-gray-700 leading-relaxed text-justify">Recent advances in deep learning have revolutionized medical image analysis, natural language processing of clinical notes, and predictive modeling for patient risk assessment. Studies have shown...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Download Section */}
            <div className="mt-auto">
              {/* Success State */}
              {showSuccess && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-800">Formatting Complete!</p>
                      <p className="text-sm text-green-600">research_paper_formatted.docx</p>
                    </div>
                    <i className="fas fa-check-circle text-green-500 text-2xl"></i>
                  </div>
                </div>
              )}

              {/* Download Button */}
              <button
                id="download-btn"
                className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg ${!showSuccess ? 'disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed' : ''}`}
                disabled={!showSuccess}
                onClick={handleDownload}
              >
                {downloaded ? (
                  <><i className="fas fa-check mr-2"></i>{t('formatter.downloaded', 'Downloaded!')}</>
                ) : (
                  <><i className="fas fa-download mr-2"></i>{t('formatter.download', 'Download')}</>
                )}
              </button>

              {/* Additional Options */}
              <div className="mt-3 flex space-x-2">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50" disabled>
                  <i className="fas fa-share mr-1"></i>
                  {t('formatter.share', 'Share')}
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50" disabled>
                  <i className="fas fa-history mr-1"></i>
                  {t('formatter.history', 'History')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileModal && file && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">File Uploaded Successfully</h3>
              <p className="text-gray-600 mb-6" id="file-info">
                {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB) has been uploaded and is ready for processing.
              </p>
              <button
                onClick={closeFileModal}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Features Section */}
      <div className="py-16 bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              {t('features.subtitle')}
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t('features.title')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {['speed', 'plagiarism', 'templates'].map((feature) => (
              <div key={feature} className="bg-white rounded-2xl p-8 shadow-xl border border-indigo-100 transform transition hover:-translate-y-2">
                <div className="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(`features.items.${feature}.title`)}
                </h3>
                <p className="text-gray-600">
                  {t(`features.items.${feature}.content`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              {t('testimonials.subtitle')}
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t('testimonials.title')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {['student', 'professor', 'researcher'].map((role) => (
              <div key={role} className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                  <div className="ml-4">
                    <h4 className="font-bold">{t(`testimonials.items.${role}.name`)}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  {t(`testimonials.items.${role}.content`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-indigo-200">
            {t('cta.description')}
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => window.location.href = '/register'}
              className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-50 transition"
            >
              {t('cta.register')}
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="ml-4 bg-indigo-800 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-900 transition"
            >
              {t('cta.demo')}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default HomePage;

