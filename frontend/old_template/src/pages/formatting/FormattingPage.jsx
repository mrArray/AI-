import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import AlertMessage from '../../components/shared/AlertMessage';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

// Language strings
const translations = {
  zh: {
    title: 'AI论文排版助手',
    subtitle: '智能文档格式化，让排版更简单',
    register: '立即注册',
    login: '已有账号？登录',
    uploadTitle: '简单上传',
    uploadDesc: '支持拖拽上传Word文档，或直接粘贴文字内容',
    aiTitle: 'AI智能处理',
    aiDesc: '基于DeepSeek AI，自动识别内容结构并进行专业排版',
    formatTitle: '多种格式',
    formatDesc: '支持论文、策划书、报告等多种文档格式',
    inputContent: '输入内容',
    remainingCredits: '剩余积分',
    paperMode: '论文模式',
    paperDesc: '学术论文格式',
    proposalMode: '策划书模式',
    proposalDesc: '项目策划书格式',
    reportMode: '报告模式',
    reportDesc: '结课报告格式',
    dragFile: '拖拽文件到此处',
    clickToSelect: '点击选择文件',
    supportedFormats: '支持 .doc, .docx, .txt 格式，最大10MB',
    directInput: '也可以直接在此输入文字内容',
    inputPlaceholder: '请输入要格式化的内容，或拖拽文件到此处...',
    charCount: '字符',
    minChars: '最少需要200字符',
    needMore: '还需要',
    chars: '个字符',
    startFormat: '开始格式化',
    generating: 'AI正在生成内容，请稍候...',
    previewTitle: '预览结果',
    previewPlaceholder: '格式化结果将在此处显示',
    selectAll: '选中全部文本',
    downloadHtml: '下载HTML文件',
    copyText: '复制纯文本'
  },
  en: {
    title: 'AI Paper Formatting Assistant',
    subtitle: 'Smart document formatting made simple',
    register: 'Register Now',
    login: 'Already have an account? Login',
    uploadTitle: 'Easy Upload',
    uploadDesc: 'Support drag and drop Word documents, or directly paste text content',
    aiTitle: 'AI Processing',
    aiDesc: 'Based on DeepSeek AI, automatically recognize content structure and format professionally',
    formatTitle: 'Multiple Formats',
    formatDesc: 'Support papers, proposals, reports and other document formats',
    inputContent: 'Input Content',
    remainingCredits: 'Remaining Credits',
    paperMode: 'Paper Mode',
    paperDesc: 'Academic paper format',
    proposalMode: 'Proposal Mode',
    proposalDesc: 'Project proposal format',
    reportMode: 'Report Mode',
    reportDesc: 'Course report format',
    dragFile: 'Drag files here',
    clickToSelect: 'Click to select file',
    supportedFormats: 'Supports .doc, .docx, .txt formats, max 10MB',
    directInput: 'You can also directly input text content here',
    inputPlaceholder: 'Please enter content to format, or drag files here...',
    charCount: 'characters',
    minChars: 'minimum 200 characters required',
    needMore: 'Need',
    chars: 'more characters',
    startFormat: 'Start Formatting',
    generating: 'AI is generating content, please wait...',
    previewTitle: 'Preview Result',
    previewPlaceholder: 'Formatted result will be displayed here',
    selectAll: 'Select all text',
    downloadHtml: 'Download HTML file',
    copyText: 'Copy plain text'
  }
};

const FormattingPage = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  const [selectedMode, setSelectedMode] = useState('paper');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [content, setContent] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [remainingChars, setRemainingChars] = useState(200);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formattedContent, setFormattedContent] = useState('');
  const [alert, setAlert] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Update character count when content changes
  useEffect(() => {
    const count = content.length;
    setCharCount(count);
    setRemainingChars(Math.max(0, 200 - count));
  }, [content]);

  // Toggle mode dropdown
  const toggleModeDropdown = () => {
    setShowModeDropdown(!showModeDropdown);
  };

  // Select formatting mode
  const selectMode = (mode) => {
    setSelectedMode(mode);
    setShowModeDropdown(false);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Process the selected file
  const handleFile = (file) => {
    // Check file type
    const validTypes = ['.doc', '.docx', '.txt', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const fileType = file.type;
    const fileName = file.name;

    if (!validTypes.some(type => fileType.includes(type) || fileName.endsWith(type))) {
      setAlert({
        type: 'error',
        message: 'Invalid file type. Please upload .doc, .docx, or .txt files.'
      });
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setAlert({
        type: 'error',
        message: 'File too large. Maximum size is 10MB.'
      });
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      setContent(e.target.result);
    };
    reader.onerror = () => {
      setAlert({
        type: 'error',
        message: 'Error reading file. Please try again.'
      });
    };

    if (fileType === 'text/plain') {
      reader.readAsText(file);
    } else {
      // For Word documents, we would need server-side processing
      // Here we'll just show an error for the demo
      setAlert({
        type: 'error',
        message: 'Word document processing requires server-side handling. Please paste text content directly.'
      });
    }
  };

  // Start formatting process
  // const startFormatting = () => {
  //   if (charCount < 200) {
  //     setAlert({
  //       type: 'warning',
  //       message: `Please enter at least 200 characters. Currently: ${charCount}`
  //     });
  //     return;
  //   }

  //   setIsGenerating(true);

  //   // Simulate API call with timeout
  //   setTimeout(() => {
  //     // Generate formatted content based on selected mode
  //     let formattedHtml = '';

  //     if (selectedMode === 'paper') {
  //       formattedHtml = `
  //         <div class="formatted-content">
  //           <h1>学术论文标题</h1>
  //           <p><strong>摘要：</strong>${content.substring(0, 150)}...</p>
  //           <h2>1. 引言</h2>
  //           <p>${content.substring(0, 200)}...</p>
  //           <h2>2. 研究方法</h2>
  //           <p>${content.substring(200, 400)}...</p>
  //           <h2>3. 结果分析</h2>
  //           <p>${content.substring(400, 600)}...</p>
  //           <h2>4. 结论</h2>
  //           <p>${content.substring(600, 800)}...</p>
  //           <h2>参考文献</h2>
  //           <p>[1] 作者. 论文题目[J]. 期刊名称, 年份, 卷(期): 起止页码.</p>
  //         </div>
  //       `;
  //     } else if (selectedMode === 'proposal') {
  //       formattedHtml = `
  //         <div class="formatted-content">
  //           <h1>项目策划书</h1>
  //           <h2>1. 项目概述</h2>
  //           <p>${content.substring(0, 200)}...</p>
  //           <h2>2. 市场分析</h2>
  //           <p>${content.substring(200, 400)}...</p>
  //           <h2>3. 实施计划</h2>
  //           <p>${content.substring(400, 600)}...</p>
  //           <h2>4. 预算规划</h2>
  //           <p>${content.substring(600, 800)}...</p>
  //           <h2>5. 预期效果</h2>
  //           <p>${content.substring(800, 1000)}...</p>
  //         </div>
  //       `;
  //     } else {
  //       formattedHtml = `
  //         <div class="formatted-content">
  //           <h1>结课报告</h1>
  //           <h2>1. 课程概述</h2>
  //           <p>${content.substring(0, 200)}...</p>
  //           <h2>2. 学习内容</h2>
  //           <p>${content.substring(200, 400)}...</p>
  //           <h2>3. 实践项目</h2>
  //           <p>${content.substring(400, 600)}...</p>
  //           <h2>4. 心得体会</h2>
  //           <p>${content.substring(600, 800)}...</p>
  //           <h2>5. 总结</h2>
  //           <p>${content.substring(800, 1000)}...</p>
  //         </div>
  //       `;
  //     }

  //     setFormattedContent(formattedHtml);
  //     setIsGenerating(false);
  //   }, 2000);
  // };
  const startFormatting = async () => {
    if (charCount < 200) {
      setAlert({
        type: 'warning',
        message: `Please enter at least 200 characters. Currently: ${charCount}`
      });
      return;
    }

    setIsGenerating(true);
    setFormattedContent('');
    setIsStreaming(true);

    try {
      const formData = new FormData();
      formData.append('mode', selectedMode);
      formData.append('input_content', content);

      const response = await fetch('http://127.0.0.1:8000/api/format/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('accessToken') || ''}`
        },
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed or no content returned.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let result = '';
      let hasStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        let chunk = decoder.decode(value, { stream: true });

        // 🚫 1. Remove any <think>...</think> blocks
        chunk = chunk.replace(/<think>[\s\S]*?<\/think>/gi, '');

        // 🚫 2. Remove all non-tag commentary (anything before first <tag>)
        if (!hasStarted) {
          const htmlStartIndex = chunk.search(/<(!DOCTYPE|html|head|body|div|section|h[1-6])/i);
          if (htmlStartIndex !== -1) {
            chunk = chunk.slice(htmlStartIndex); // start from actual HTML
            hasStarted = true;
          } else {
            continue; // skip this chunk if no HTML yet
          }
        }

        // ✅ 3. Append clean HTML to result and render it
        result += chunk;
        setFormattedContent(prev => prev + chunk);
      }

    } catch (error) {
      setAlert({
        type: 'error',
        message: `❌ ${error.message || 'Failed to format content'}`
      });
    } finally {
      setIsGenerating(false);
      setIsStreaming(false);
    }
  };


  // Select all text in preview
  const selectAllText = () => {
    const previewArea = document.getElementById('preview-area');
    if (previewArea) {
      const range = document.createRange();
      range.selectNodeContents(previewArea);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Download HTML file
  const downloadHtml = () => {
    const element = document.createElement('a');
    const file = new Blob([formattedContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `formatted_${selectedMode}_${new Date().getTime()}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Copy plain text
  const copyPlainText = () => {
    const previewArea = document.getElementById('preview-area');
    if (previewArea) {
      const plainText = previewArea.innerText;
      navigator.clipboard.writeText(plainText).then(() => {
        setAlert({
          type: 'success',
          message: 'Text copied to clipboard'
        });
      }).catch(() => {
        setAlert({
          type: 'error',
          message: 'Failed to copy text'
        });
      });
    }
  };

  // Guest view (not logged in)
  if (!user) {
    return (
      <MainLayout>
        <div className="hero-section">
          <div className="container text-center">
            <h1 className="display-4 fw-bold mb-4">{t.title}</h1>
            <p className="lead mb-4">{t.subtitle}</p>
            <div className="row justify-content-center">
              <div className="col-md-8">
                <p className="mb-4">{t.subtitle}</p>
                <a href="/register" className="btn btn-light btn-lg me-3">{t.register}</a>
                <a href="/login" className="btn btn-outline-light btn-lg">{t.login}</a>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card h-100 text-center">
                <div className="card-body">
                  <i className="fas fa-upload fa-3x text-primary mb-3"></i>
                  <h5 className="card-title">{t.uploadTitle}</h5>
                  <p className="card-text">{t.uploadDesc}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100 text-center">
                <div className="card-body">
                  <i className="fas fa-magic fa-3x text-success mb-3"></i>
                  <h5 className="card-title">{t.aiTitle}</h5>
                  <p className="card-text">{t.aiDesc}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100 text-center">
                <div className="card-body">
                  <i className="fas fa-file-export fa-3x text-info mb-3"></i>
                  <h5 className="card-title">{t.formatTitle}</h5>
                  <p className="card-text">{t.formatDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // User view (logged in)
  return (
    <MainLayout>
      <div className="container py-4">
        {alert && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="row">
          {/* Left side: Input area */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0"><i className="fas fa-edit me-2"></i>{t.inputContent}</h5>
                <span className="badge bg-success">{t.remainingCredits}: {user.credits}</span>
              </div>
              <div className="card-body">
                {/* Mode selector */}
                <div className="mode-selector mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={toggleModeDropdown}
                  >
                    <span>
                      {selectedMode === 'paper' ? t.paperMode :
                        selectedMode === 'proposal' ? t.proposalMode :
                          t.reportMode}
                    </span>
                    <i className="fas fa-chevron-down float-end mt-1"></i>
                  </button>

                  {showModeDropdown && (
                    <div className="mode-dropdown">
                      <div
                        className="mode-option"
                        onClick={() => selectMode('paper')}
                      >
                        <div className="d-flex align-items-center">
                          <i className="fas fa-graduation-cap text-primary me-3"></i>
                          <div>
                            <strong>{t.paperMode}</strong>
                            <div className="text-muted small">{t.paperDesc}</div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="mode-option"
                        onClick={() => selectMode('proposal')}
                      >
                        <div className="d-flex align-items-center">
                          <i className="fas fa-lightbulb text-warning me-3"></i>
                          <div>
                            <strong>{t.proposalMode}</strong>
                            <div className="text-muted small">{t.proposalDesc}</div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="mode-option"
                        onClick={() => selectMode('report')}
                      >
                        <div className="d-flex align-items-center">
                          <i className="fas fa-chart-line text-success me-3"></i>
                          <div>
                            <strong>{t.reportMode}</strong>
                            <div className="text-muted small">{t.reportDesc}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Unified input area */}
                <div
                  className={`unified-input-area mb-3 ${dragActive ? 'dragover' : ''} ${content ? 'has-content' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  {!content && (
                    <div className="input-overlay">
                      <i className="fas fa-cloud-upload-alt fa-2x text-primary mb-2"></i>
                      <p className="mb-2"><strong>{t.dragFile}</strong></p>
                      <p className="text-muted mb-2">
                        {t.clickToSelect}
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={() => document.getElementById('file-input').click()}
                        >
                          {t.clickToSelect}
                        </button>
                      </p>
                      <small className="text-muted">{t.supportedFormats}</small>
                      <div className="mt-2">
                        <small className="text-muted">{t.directInput}</small>
                      </div>
                    </div>
                  )}

                  <textarea
                    className="form-control unified-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t.inputPlaceholder}
                    rows="10"
                  />

                  <input
                    type="file"
                    id="file-input"
                    accept=".doc,.docx,.txt"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Character count display */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <small className="text-muted">
                    <span>{charCount}</span> / 200 {t.charCount} ({t.minChars})
                  </small>
                  <small className="text-muted">
                    {remainingChars > 0 ? (
                      <>{t.needMore} <span>{remainingChars}</span> {t.chars}</>
                    ) : (
                      <span className="text-success">✓</span>
                    )}
                  </small>
                </div>

                {/* Start button */}
                <div className="d-grid">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={startFormatting}
                    disabled={isGenerating || charCount < 200}
                  >
                    {isGenerating ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <><i className="fas fa-magic me-2"></i>{t.startFormat}</>
                    )}
                  </button>
                </div>

                {/* Progress indicator */}
                {isGenerating && (
                  <div className="progress-container">
                    <div className="progress mt-3" style={{ height: '6px' }}>
                      <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '100%' }}></div>
                    </div>
                    <div className="status-indicator status-generating">
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>{t.generating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Preview area */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0"><i className="fas fa-eye me-2"></i>{t.previewTitle}</h5>
                {formattedContent && (
                  <div className="preview-actions">
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={selectAllText}
                        title={t.selectAll}
                      >
                        <i className="fas fa-mouse-pointer"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={downloadHtml}
                        title={t.downloadHtml}
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info"
                        onClick={copyPlainText}
                        title={t.copyText}
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="card-body">
                <div
                  className={`preview-area ${formattedContent ? 'has-content' : ''}`}
                  id="preview-area"
                >
                  {formattedContent ? (
                    <>
                      <div className="typing-preview" dangerouslySetInnerHTML={{ __html: formattedContent }} />
                      {isStreaming && (
                        <div className="typing-cursor">
                          <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                        </div>
                      )}

                    </>
                  ) : (
                    <div className="text-center text-muted py-5">
                      <i className="fas fa-file-alt fa-4x mb-3 opacity-25"></i>
                      <p>{t.previewPlaceholder}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FormattingPage;
