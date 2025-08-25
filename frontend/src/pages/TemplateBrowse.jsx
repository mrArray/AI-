import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Modal from '../components/Modal'
import { useTranslation } from 'react-i18next';

function TemplateBrowse() {
  const { t } = useTranslation('templates');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Template categories
  const categories = [
    { id: 'all', name: t('categories.all') },
    { id: 'undergraduate', name: t('categories.undergraduate') },
    { id: 'master', name: t('categories.master') },
    { id: 'journal', name: t('categories.journal') },
    { id: 'course', name: t('categories.course') }
  ];
  
  // Template data
  const templates = [
    {
      id: 1,
      name: '北京大学本科毕业论文',
      category: 'undergraduate',
      thumbnail: '/templates/pku-undergraduate.png',
      description: '符合北京大学本科毕业论文格式要求，包含封面、摘要、目录、正文、参考文献等完整结构。',
      popularity: 98
    },
    {
      id: 2,
      name: '清华大学硕士学位论文',
      category: 'master',
      thumbnail: '/templates/tsinghua-master.png',
      description: '按照清华大学研究生院要求设计，包含中英文摘要、目录、图表索引、正文、参考文献、致谢等部分。',
      popularity: 95
    },
    {
      id: 3,
      name: '中国科学院学报论文',
      category: 'journal',
      thumbnail: '/templates/cas-journal.png',
      description: '符合中国科学院学报投稿格式，包含标题、作者信息、摘要、关键词、正文、参考文献等。',
      popularity: 87
    },
    {
      id: 4,
      name: '通用课程作业模板',
      category: 'course',
      thumbnail: '/templates/general-course.png',
      description: '适用于大多数大学课程作业的通用模板，包含封面、目录、正文、参考文献等基本结构。',
      popularity: 92
    },
    {
      id: 5,
      name: '复旦大学本科论文',
      category: 'undergraduate',
      thumbnail: '/templates/fudan-undergraduate.png',
      description: '符合复旦大学本科生毕业论文规范，包含封面、声明、摘要、目录、正文、参考文献等。',
      popularity: 89
    },
    {
      id: 6,
      name: '浙江大学硕士论文',
      category: 'master',
      thumbnail: '/templates/zju-master.png',
      description: '按照浙江大学研究生院要求设计，包含所有必要章节和格式规范。',
      popularity: 86
    },
    {
      id: 7,
      name: 'IEEE会议论文',
      category: 'journal',
      thumbnail: '/templates/ieee-conference.png',
      description: '符合IEEE会议论文投稿要求，双栏排版，包含摘要、引言、方法、结果、讨论、参考文献等。',
      popularity: 90
    },
    {
      id: 8,
      name: '实验报告模板',
      category: 'course',
      thumbnail: '/templates/lab-report.png',
      description: '适用于各类实验课程的报告模板，包含实验目的、原理、步骤、结果分析、结论等部分。',
      popularity: 94
    }
  ];
  
  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header activePage="templates" />

      {/* Main Content */}
      <div className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('pageTitle')}
            </h1>
            <p className="mt-2 text-gray-600">
              {t('pageDescription')}
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${selectedCategory === category.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    `}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Template Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`
                  bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all
                  ${selectedTemplate?.id === template.id ? 'ring-2 ring-indigo-600' : 'hover:shadow-md'}
                `}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-400">{t('templateDetail.title')}</div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {template.name}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {t('templateItem.popularity', { percentage: template.popularity })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {template.description}
                  </p>
                </div>
                <div className="bg-gray-50 px-4 py-3">
                  <button className="w-full bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700">
                    {t('templateItem.useButton')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Template Detail Modal */}
          <Modal
            isOpen={!!selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            title={selectedTemplate?.name || ''}
            closeButtonLabel={t('templateDetail.close')}
            actions={
              <>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    window.location.href = '/'
                  }}
                >
                  {t('templateDetail.useTemplate')}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  {t('templateDetail.cancel')}
                </button>
              </>
            }
          >
            {selectedTemplate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-gray-400">{t('templateDetail.title')}</div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      {t('templateDetail.description')}
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTemplate.description}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      {t('templateDetail.applicability')}
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {t(`templateDetail.applicabilityOptions.${selectedTemplate.category}`)}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      {t('templateDetail.sections')}
                    </h4>
                    <ul className="mt-1 text-sm text-gray-900 list-disc pl-5 space-y-1">
                      {t('templateDetail.defaultSections', { returnObjects: true }).map((section, index) => (
                        <li key={index}>{section}</li>
                      ))}
                      {t(`templateDetail.additionalSections.${selectedTemplate.category}`, { returnObjects: true, defaultValue: [] }).map((section, index) => (
                        <li key={`extra-${index}`}>{section}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default TemplateBrowse;