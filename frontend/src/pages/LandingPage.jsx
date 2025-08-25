import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useToast, TOAST_TYPES } from '../contexts/ToastContext';

const LandingPage = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'pure'
  const [prompt, setPrompt] = useState('');
  
  const handleGenerateClick = () => {
    if (!prompt.trim()) {
      showToast({
        type: TOAST_TYPES.WARNING,
        message: t('home.input.empty_prompt_warning')
      });
      return;
    }
    
    showToast({
      type: TOAST_TYPES.INFO,
      message: t('home.preview.generating')
    });
    
    // 模拟生成过程
    setTimeout(() => {
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: t('home.preview.generation_complete')
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header activePage="home" />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {t('app.name')}
              </h1>
              <p className="text-xl md:text-2xl font-medium">
                {t('app.tagline')}
              </p>
              <p className="text-lg opacity-90">
                {t('landing.hero.description')}
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg font-medium text-lg shadow-lg transform transition hover:scale-105"
                  onClick={() => showToast({
                    type: TOAST_TYPES.SUCCESS,
                    message: t('landing.hero.try_now_message')
                  })}
                >
                  {t('landing.hero.try_now')}
                </button>
                <button className="bg-transparent border-2 border-white hover:bg-white hover:text-indigo-600 px-6 py-3 rounded-lg font-medium text-lg transition">
                  {t('landing.hero.learn_more')}
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="/hero-image.png" 
                alt="AI Paper Generation" 
                className="w-full h-auto rounded-lg shadow-2xl transform -rotate-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600x400?text=AI+Paper+Generation';
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path 
              fill="#ffffff" 
              fillOpacity="1" 
              d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,69.3C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>
      
      {/* Main Interactive Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('landing.interactive.title')}</h2>
            <p className="mt-4 text-xl text-gray-600">{t('landing.interactive.subtitle')}</p>
          </div>
          
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                className={`px-6 py-3 text-sm font-medium rounded-l-lg ${
                  activeTab === 'ai'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('ai')}
              >
                {t('home.features.ai.title')}
              </button>
              <button
                type="button"
                className={`px-6 py-3 text-sm font-medium rounded-r-lg ${
                  activeTab === 'pure'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('pure')}
              >
                {t('home.features.pure.title')}
              </button>
            </div>
          </div>
          
          {/* Interactive Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Input */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {t('home.input.title')}
              </h3>
              <div className="mb-4">
                <textarea
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={
                    activeTab === 'ai'
                      ? t('home.input.placeholder')
                      : t('home.input.pure_placeholder')
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('home.template.title')}
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="undergraduate">{t('home.template.undergraduate')}</option>
                  <option value="master">{t('home.template.master')}</option>
                  <option value="course">{t('home.template.course')}</option>
                  <option value="journal">{t('home.template.journal')}</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                {activeTab === 'ai' && (
                  <div className="text-sm text-gray-600">
                    <span>{t('home.points.consume')} </span>
                    <span className="font-bold text-indigo-600">10 </span>
                    <span>{t('home.points.points')}</span>
                  </div>
                )}
                <button
                  className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transform transition hover:scale-105"
                  onClick={handleGenerateClick}
                >
                  {activeTab === 'ai' ? t('actions.generate') : t('actions.format')}
                </button>
              </div>
            </div>
            
            {/* Right Column - Preview */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {t('home.preview.title')}
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg h-64 p-4 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2">{t('home.preview.empty')}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium">
                  {t('actions.download.word')}
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium">
                  {t('actions.download.pdf')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('home.features.title')}</h2>
            <p className="mt-4 text-xl text-gray-600">{t('home.features.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pure Formatting */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105">
              <div className="p-8">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.features.pure.title')}</h3>
                <p className="text-gray-600">{t('home.features.pure.description')}</p>
              </div>
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
                <button 
                  className="text-blue-600 font-medium hover:text-blue-800 flex items-center"
                  onClick={() => setActiveTab('pure')}
                >
                  {t('landing.features.try_feature')}
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* AI Extension */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105">
              <div className="p-8">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.features.ai.title')}</h3>
                <p className="text-gray-600">{t('home.features.ai.description')}</p>
              </div>
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
                <button 
                  className="text-purple-600 font-medium hover:text-purple-800 flex items-center"
                  onClick={() => setActiveTab('ai')}
                >
                  {t('landing.features.try_feature')}
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('landing.testimonials.title')}</h2>
            <p className="mt-4 text-xl text-gray-600">{t('landing.testimonials.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t(`landing.testimonials.user${i}.name`)}</h4>
                    <p className="text-sm text-gray-600">{t(`landing.testimonials.user${i}.role`)}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{t(`landing.testimonials.user${i}.quote`)}"</p>
                <div className="mt-4 flex text-yellow-400">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">{t('landing.cta.title')}</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">{t('landing.cta.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-lg font-bold text-lg shadow-lg transform transition hover:scale-105">
              {t('landing.cta.start_now')}
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg transition">
              {t('landing.cta.view_pricing')}
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
