import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';

function HistoryPage() {
  const { t } = useTranslation('history');
  const [selectedHistory, setSelectedHistory] = useState(null);
  
  // Mock history data
  const historyRecords = [
    {
      id: 1,
      title: '人工智能在医疗领域的应用研究',
      template: '北京大学本科毕业论文',
      date: '2025-06-01',
      type: 'aiExtension',
      status: 'completed'
    },
    {
      id: 2,
      title: '可持续发展与环境保护策略分析',
      template: '清华大学硕士学位论文',
      date: '2025-05-28',
      type: 'formatting',
      status: 'completed'
    },
    {
      id: 3,
      title: '区块链技术在供应链管理中的应用',
      template: '中国科学院学报论文',
      date: '2025-05-25',
      type: 'aiExtension',
      status: 'completed'
    },
    {
      id: 4,
      title: '量子计算的发展现状与未来趋势',
      template: '通用课程作业模板',
      date: '2025-05-20',
      type: 'aiExtension',
      status: 'completed'
    },
    {
      id: 5,
      title: '新能源汽车市场分析报告',
      template: '实验报告模板',
      date: '2025-05-15',
      type: 'formatting',
      status: 'completed'
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header activePage="history" />

      {/* Main Content */}
      <div className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('page.title')}
            </h1>
            <p className="mt-2 text-gray-600">
              {t('page.description')}
            </p>
          </div>
          
          {/* History List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {historyRecords.map((record) => (
                <li key={record.id}>
                  <div 
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedHistory(record)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {record.title}
                          </p>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>
                                {t('table.date')}: {record.date}
                              </span>
                            </div>
                            <div className="ml-4 flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>
                                {t('table.template')}: {record.template}
                              </span>
                            </div>
                            <div className="ml-4 flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>
                                {t('table.type')}: {t(`types.${record.type}`)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* History Detail Modal */}
          <Modal
            isOpen={!!selectedHistory}
            onClose={() => setSelectedHistory(null)}
            title={selectedHistory?.title || ''}
            closeButtonLabel={t('modal.closeButton')}
            actions={
              <>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {t('modal.downloadButton')}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    window.location.href = '/'
                  }}
                >
                  {t('modal.editButton')}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedHistory(null)}
                >
                  {t('modal.closeButton')}
                </button>
              </>
            }
          >
            {selectedHistory && (
              <>
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t('modal.generationDate')}
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedHistory.date}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t('modal.templateUsed')}
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedHistory.template}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t('modal.generationType')}
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {t(`types.${selectedHistory.type}`)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t('modal.status')}
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t(`status.${selectedHistory.status}`)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-300 rounded-md h-64 flex items-center justify-center bg-gray-50 mb-4">
                  <div className="text-center text-gray-400">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2">
                      {t('modal.documentPreview')}
                    </p>
                  </div>
                </div>
              </>
            )}
          </Modal>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default HistoryPage;