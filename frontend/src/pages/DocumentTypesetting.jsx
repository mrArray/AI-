import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PointsRechargeModal from '../components/PointsRechargeModal'

function DocumentTypesetting() {
  const [prompt, setPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [typesettingMode, setTypesettingMode] = useState('pure') // 'pure' or 'ai'
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDocument, setGeneratedDocument] = useState(null)
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  
  // 模板数据
  const templates = [
    { id: 1, name: '北京大学本科毕业论文', category: 'undergraduate' },
    { id: 2, name: '清华大学硕士学位论文', category: 'master' },
    { id: 3, name: '中国科学院学报论文', category: 'journal' },
    { id: 4, name: '通用课程作业模板', category: 'course' }
  ]
  
  const handleGenerate = () => {
    if (!prompt || !selectedTemplate) {
      alert('请输入提示词并选择模板');
      return;
    }
    
    setIsGenerating(true);
    
    // 模拟生成过程
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedDocument({
        title: prompt.split(' ')[0] + '研究',
        template: templates.find(t => t.id === selectedTemplate).name,
        content: '这是基于您的提示词生成的论文内容...',
        mode: typesettingMode
      });
    }, 2000);
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航栏 */}
      <Header activePage="home" />

      {/* 标题部分 */}
      <div className="bg-indigo-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            秒出论文 — AI超高准确性，秒出作业论文Word/PDF
          </h1>
          <p className="mt-3 max-w-md mx-auto text-indigo-200 sm:text-lg">
            左侧输入提示词，选择预设模板，右侧即可预览生成的Word/PDF文档
          </p>
        </div>
      </div>

      {/* 功能部分 */}
      <div className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 排版模式选择 */}
          <div className="mb-6">
            <div className="flex justify-center">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    typesettingMode === 'pure'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setTypesettingMode('pure')}
                >
                  纯排版
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    typesettingMode === 'ai'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setTypesettingMode('ai')}
                >
                  AI扩展/自动写作
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="md:flex">
              {/* 左侧输入区域 */}
              <div className="md:w-1/2 border-r border-gray-200">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    {typesettingMode === 'pure' ? '输入论文内容' : '输入提示词'}
                  </h2>
                  <div className="mt-4">
                    <textarea
                      rows="12"
                      className="shadow-sm block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={typesettingMode === 'pure' 
                        ? "请粘贴您已有的论文内容，我们将按照选定模板进行排版..." 
                        : "请输入您的论文主题、关键词或具体要求..."}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900">选择模板</h3>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {templates.map((template) => (
                        <div 
                          key={template.id}
                          className={`border rounded-md p-3 cursor-pointer ${selectedTemplate === template.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'}`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          {template.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      className={`w-full px-4 py-3 rounded-md font-medium text-white ${
                        isGenerating 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? '生成中...' : typesettingMode === 'pure' ? '开始排版' : '生成论文'}
                    </button>
                  </div>
                  
                  {typesettingMode === 'ai' && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500">
                        AI生成需消耗 <span className="font-medium text-indigo-600">50.00</span> 积分
                        <button 
                          className="ml-2 text-indigo-600 hover:text-indigo-800 underline"
                          onClick={() => setShowRechargeModal(true)}
                        >
                          充值积分
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 右侧预览区域 */}
              <div className="md:w-1/2">
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">文档预览</h2>
                    {generatedDocument && (
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                          Word
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                          PDF
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 border border-gray-300 rounded-md h-96 bg-gray-50 overflow-auto">
                    {isGenerating ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                          <p className="mt-4 text-gray-600">
                            {typesettingMode === 'pure' ? '正在排版您的文档...' : '正在生成您的论文...'}
                          </p>
                        </div>
                      </div>
                    ) : generatedDocument ? (
                      <div className="p-6">
                        <div className="text-center mb-8">
                          <h1 className="text-xl font-bold">{generatedDocument.title}</h1>
                          <p className="text-gray-500 mt-2">{generatedDocument.template}</p>
                        </div>
                        
                        <div className="space-y-4">
                          <h2 className="text-lg font-semibold">摘要</h2>
                          <p className="text-gray-700">
                            本文研究了{prompt.substring(0, 20)}...的相关问题，通过分析和实验得出了一系列结论。
                          </p>
                          
                          <h2 className="text-lg font-semibold">引言</h2>
                          <p className="text-gray-700">
                            随着科技的发展，{prompt.substring(0, 30)}...领域受到了广泛关注。本文将从多个角度分析这一问题。
                          </p>
                          
                          <h2 className="text-lg font-semibold">研究方法</h2>
                          <p className="text-gray-700">
                            本研究采用了定量与定性相结合的研究方法，通过数据分析和案例研究进行深入探讨。
                          </p>
                          
                          <p className="text-gray-400 italic">
                            （预览内容仅供参考，完整内容请下载文档）
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-400">
                          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="mt-2">
                            {typesettingMode === 'pure' 
                              ? '请输入论文内容并选择模板' 
                              : '请输入提示词并选择模板'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能介绍部分 */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900">功能介绍</h2>
            <p className="mt-4 text-gray-500">我们提供两种文档排版方式，满足您的不同需求</p>
          </div>
          
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className={`bg-white overflow-hidden shadow rounded-lg ${typesettingMode === 'pure' ? 'ring-2 ring-indigo-600' : ''}`}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">纯排版</h3>
                  <p className="mt-2 text-gray-500">
                    将您已有的论文内容按照选定的模板进行专业排版，保持原有内容不变，
                    确保格式符合要求。适合已完成内容创作，仅需调整格式的用户。
                  </p>
                </div>
              </div>
              
              <div className={`bg-white overflow-hidden shadow rounded-lg ${typesettingMode === 'ai' ? 'ring-2 ring-indigo-600' : ''}`}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">AI扩展/自动写作</h3>
                  <p className="mt-2 text-gray-500">
                    基于您提供的关键词、提纲或主题，AI自动生成完整的论文内容，
                    并按照选定模板进行排版。适合需要快速完成作业或寻找写作灵感的用户。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部信息栏 */}
      <Footer />
      
      {/* 积分充值弹窗 */}
      <PointsRechargeModal 
        isOpen={showRechargeModal} 
        onClose={() => setShowRechargeModal(false)} 
      />
    </div>
  )
}

export default DocumentTypesetting
