import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { marked } from 'marked';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { papersAPI } from '../api/papers';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

const outputFormats = [
  { key: 'docx', icon: 'fas fa-file-word text-blue-600', label: 'DOCX' },
  { key: 'pdf', icon: 'fas fa-file-pdf text-red-600', label: 'PDF' },
  { key: 'latex', icon: 'fas fa-code text-green-600', label: 'LaTeX' },
  { key: 'md', icon: 'fab fa-markdown text-purple-600', label: 'MD' },
];

function HomePage() {
  const fileInputRef = useRef();
  const { t } = useTranslation('home');
  const { isAuthenticated } = useAuth();
  const { openRegisterModal } = useModal();

  const [file, setFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('docx');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [formattedContent, setFormattedContent] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [viewMode, setViewMode] = useState('beautify');

  const mathJaxConfig = {
    loader: { load: ['[tex]/ams', '[tex]/color', '[tex]/boldsymbol'] },
    tex: {
      packages: { '[+]': ['ams', 'color', 'boldsymbol'] },
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
      processEnvironments: true,
      macros: {
        RR: '{\\mathbb{R}}',
        bold: ['{\\bf #1}', 1],
      }
    },
    options: { renderActions: { addMenu: [] } },
    startup: {
      typeset: false
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setShowFilePreview(true);
    }
  };

  const handleFormatSelect = (key) => setSelectedFormat(key);

  const handleStart = async () => {
    setShowFilePreview(true);
    setProcessing(true);
    setShowSuccess(false);
    setDownloaded(false);
    setProgress(0);
    setErrorMsg('');
    setFormattedContent(null);
    setFileUrl(null);
    setFileName('');

    if (!file || !requirements) {
      setProcessing(false);
      setErrorMsg(t('formatter.setErrorMsg', 'Please upload a file and enter requirements.'));
      return;
    }

    try {
      let prog = 0;
      const interval = setInterval(() => {
        prog += 10;
        setProgress(prog);
        if (prog >= 100) clearInterval(interval);
      }, 300);

      const data = await papersAPI.aiFormatPaper({
        file,
        requirements,
        output_format: selectedFormat,
        title: '',
        language: 'en',
      });

      setProcessing(false);
      if (data.error) {
        setErrorMsg(data.error || 'Formatting failed.');
        return;
      }

      setShowSuccess(true);
      setFormattedContent(data.formatted_content || null);

      // Extract original filename without extension for use in download
      const originalName = file.name.replace(/\.[^/.]+$/, '');

      if (selectedFormat === 'md' || selectedFormat === 'latex') {
        if (data.file_base64) {
          const byteCharacters = atob(data.file_base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: data.content_type || 'text/plain',
          });
          const url = window.URL.createObjectURL(blob);
          setFileUrl(url);
          setFileName(
            data.file_name || `${originalName}_formatted.${selectedFormat}`
          );
        }
      } else {
        setFileUrl(data.file_url);
        setFileName(
          data.file_name || `${originalName}_formatted.${selectedFormat}`
        );
      }
    } catch (err) {
      setProcessing(false);
      setErrorMsg(err.message || 'Network or server error.');
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    }
  };

  const renderMarkdownWithMath = (content) =>
    marked(content || '', { breaks: true, gfm: true });

  const processLatexContent = (latexContent) => {
    if (!latexContent) return '';
    
    // Remove document class and preamble commands for display
    let content = latexContent
      .replace(/\\documentclass\{[^}]*\}/g, '')
      .replace(/\\usepackage\{[^}]*\}/g, '')
      .replace(/\\usepackage\[[^\]]*\]\{[^}]*\}/g, '')
      .replace(/\\begin\{document\}/g, '')
      .replace(/\\end\{document\}/g, '')
      .replace(/\\maketitle/g, '')
      .replace(/\\author\{[^}]*\}/g, '')
      .replace(/\\date\{[^}]*\}/g, '');

    // Handle LaTeX lists (itemize, enumerate)
    content = content
      .replace(/\\begin\{itemize\}/g, '<ul class="list-disc list-inside ml-4 mb-4">')
      .replace(/\\end\{itemize\}/g, '</ul>')
      .replace(/\\begin\{enumerate\}/g, '<ol class="list-decimal list-inside ml-4 mb-4">')
      .replace(/\\end\{enumerate\}/g, '</ol>')
      .replace(/\\begin\{description\}/g, '<dl class="ml-4 mb-4">')
      .replace(/\\end\{description\}/g, '</dl>')
      .replace(/\\item\s*/g, '<li class="mb-1">');

    // Handle description list items
    content = content.replace(/\\item\[([^\]]*)\]/g, '<dt class="font-semibold mt-2">$1</dt><dd class="ml-4 mb-2">');

    // Handle LaTeX tables
    content = content
      .replace(/\\begin\{table\}(\[.*?\])?/g, '<div class="table-container my-6">')
      .replace(/\\end\{table\}/g, '</div>')
      .replace(/\\begin\{tabular\}\{[^}]*\}/g, '<table class="min-w-full border-collapse border border-gray-300 my-4">')
      .replace(/\\end\{tabular\}/g, '</table>')
      .replace(/\\begin\{longtable\}\{[^}]*\}/g, '<table class="min-w-full border-collapse border border-gray-300 my-4">')
      .replace(/\\end\{longtable\}/g, '</table>')
      .replace(/\\begin\{tabularx\}\{[^}]*\}\{[^}]*\}/g, '<table class="min-w-full border-collapse border border-gray-300 my-4">')
      .replace(/\\end\{tabularx\}/g, '</table>')
      .replace(/\\hline/g, '')
      .replace(/\\centering/g, '')
      .replace(/\\caption\{([^}]*)\}/g, '<caption class="text-sm font-medium text-gray-700 mb-2">$1</caption>');

    // Handle table rows and cells (basic conversion)
    content = content.replace(/([^\\&\n]+)(\s*&\s*[^\\&\n]+)*\s*\\\\/g, (match) => {
      const cells = match.replace(/\s*\\\\$/, '').split('&').map(cell => cell.trim());
      const tableCells = cells.map(cell => 
        `<td class="border border-gray-300 px-3 py-2 text-sm">${cell}</td>`
      ).join('');
      return `<tr>${tableCells}</tr>`;
    });

    // Handle text environments
    content = content
      .replace(/\\begin\{abstract\}/g, '<div class="abstract bg-gray-100 p-4 rounded-lg mb-6"><h3 class="font-semibold mb-2">Abstract</h3>')
      .replace(/\\end\{abstract\}/g, '</div>')
      .replace(/\\begin\{quote\}/g, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">')
      .replace(/\\end\{quote\}/g, '</blockquote>')
      .replace(/\\begin\{quotation\}/g, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4 text-justify">')
      .replace(/\\end\{quotation\}/g, '</blockquote>')
      .replace(/\\begin\{verse\}/g, '<div class="verse italic text-center my-4 leading-relaxed">')
      .replace(/\\end\{verse\}/g, '</div>');

    // Handle mathematical environments
    content = content
      .replace(/\\begin\{equation\}/g, '<div class="equation my-4 text-center">$$')
      .replace(/\\end\{equation\}/g, '$$</div>')
      .replace(/\\begin\{equation\*\}/g, '<div class="equation my-4 text-center">$$')
      .replace(/\\end\{equation\*\}/g, '$$</div>')
      .replace(/\\begin\{align\}/g, '<div class="align my-4 text-center">\\begin{align}')
      .replace(/\\end\{align\}/g, '\\end{align}</div>')
      .replace(/\\begin\{align\*\}/g, '<div class="align my-4 text-center">\\begin{align*}')
      .replace(/\\end\{align\*\}/g, '\\end{align*}</div>')
      .replace(/\\begin\{eqnarray\}/g, '<div class="eqnarray my-4 text-center">\\begin{eqnarray}')
      .replace(/\\end\{eqnarray\}/g, '\\end{eqnarray}</div>')
      .replace(/\\begin\{eqnarray\*\}/g, '<div class="eqnarray my-4 text-center">\\begin{eqnarray*}')
      .replace(/\\end\{eqnarray\*\}/g, '\\end{eqnarray*}</div>')
      .replace(/\\begin\{gather\}/g, '<div class="gather my-4 text-center">\\begin{gather}')
      .replace(/\\end\{gather\}/g, '\\end{gather}</div>')
      .replace(/\\begin\{gather\*\}/g, '<div class="gather my-4 text-center">\\begin{gather*}')
      .replace(/\\end\{gather\*\}/g, '\\end{gather*}</div>')
      .replace(/\\begin\{multline\}/g, '<div class="multline my-4 text-center">\\begin{multline}')
      .replace(/\\end\{multline\}/g, '\\end{multline}</div>')
      .replace(/\\begin\{multline\*\}/g, '<div class="multline my-4 text-center">\\begin{multline*}')
      .replace(/\\end\{multline\*\}/g, '\\end{multline*}</div>');

    // Handle figure environments
    content = content
      .replace(/\\begin\{figure\}(\[.*?\])?/g, '<div class="figure my-6 text-center">')
      .replace(/\\end\{figure\}/g, '</div>')
      .replace(/\\begin\{figure\*\}(\[.*?\])?/g, '<div class="figure my-6 text-center">')
      .replace(/\\end\{figure\*\}/g, '</div>')
      .replace(/\\includegraphics(\[.*?\])?\{([^}]*)\}/g, '<img src="$2" class="max-w-full h-auto mx-auto" alt="Figure">')
      .replace(/\\label\{([^}]*)\}/g, '<span class="label hidden" data-label="$1"></span>');

    // Handle code environments
    content = content
      .replace(/\\begin\{verbatim\}/g, '<pre class="verbatim bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto"><code>')
      .replace(/\\end\{verbatim\}/g, '</code></pre>')
      .replace(/\\begin\{lstlisting\}(\[.*?\])?/g, '<pre class="lstlisting bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto"><code>')
      .replace(/\\end\{lstlisting\}/g, '</code></pre>')
      .replace(/\\verb\|([^|]*)\|/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');

    // Handle theorem-like environments
    content = content
      .replace(/\\begin\{theorem\}/g, '<div class="theorem bg-blue-50 border-l-4 border-blue-400 p-4 my-4"><strong class="text-blue-800">Theorem:</strong> ')
      .replace(/\\end\{theorem\}/g, '</div>')
      .replace(/\\begin\{lemma\}/g, '<div class="lemma bg-green-50 border-l-4 border-green-400 p-4 my-4"><strong class="text-green-800">Lemma:</strong> ')
      .replace(/\\end\{lemma\}/g, '</div>')
      .replace(/\\begin\{proposition\}/g, '<div class="proposition bg-purple-50 border-l-4 border-purple-400 p-4 my-4"><strong class="text-purple-800">Proposition:</strong> ')
      .replace(/\\end\{proposition\}/g, '</div>')
      .replace(/\\begin\{corollary\}/g, '<div class="corollary bg-indigo-50 border-l-4 border-indigo-400 p-4 my-4"><strong class="text-indigo-800">Corollary:</strong> ')
      .replace(/\\end\{corollary\}/g, '</div>')
      .replace(/\\begin\{definition\}/g, '<div class="definition bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4"><strong class="text-yellow-800">Definition:</strong> ')
      .replace(/\\end\{definition\}/g, '</div>')
      .replace(/\\begin\{example\}/g, '<div class="example bg-gray-50 border-l-4 border-gray-400 p-4 my-4"><strong class="text-gray-800">Example:</strong> ')
      .replace(/\\end\{example\}/g, '</div>')
      .replace(/\\begin\{proof\}/g, '<div class="proof bg-slate-50 border-l-4 border-slate-400 p-4 my-4"><strong class="text-slate-800">Proof:</strong> ')
      .replace(/\\end\{proof\}/g, ' ∎</div>')
      .replace(/\\begin\{remark\}/g, '<div class="remark bg-orange-50 border-l-4 border-orange-400 p-4 my-4"><strong class="text-orange-800">Remark:</strong> ')
      .replace(/\\end\{remark\}/g, '</div>')
      .replace(/\\begin\{note\}/g, '<div class="note bg-cyan-50 border-l-4 border-cyan-400 p-4 my-4"><strong class="text-cyan-800">Note:</strong> ')
      .replace(/\\end\{note\}/g, '</div>');

    // Handle special environments
    content = content
      .replace(/\\begin\{center\}/g, '<div class="text-center my-4">')
      .replace(/\\end\{center\}/g, '</div>')
      .replace(/\\begin\{flushleft\}/g, '<div class="text-left my-4">')
      .replace(/\\end\{flushleft\}/g, '</div>')
      .replace(/\\begin\{flushright\}/g, '<div class="text-right my-4">')
      .replace(/\\end\{flushright\}/g, '</div>')
      .replace(/\\begin\{minipage\}(\[.*?\])?\{[^}]*\}/g, '<div class="minipage inline-block align-top mx-2">')
      .replace(/\\end\{minipage\}/g, '</div>');

    // Handle bibliography environments
    content = content
      .replace(/\\begin\{thebibliography\}\{[^}]*\}/g, '<div class="bibliography mt-8"><h3 class="text-lg font-semibold mb-4">References</h3><ol class="list-decimal list-inside space-y-2">')
      .replace(/\\end\{thebibliography\}/g, '</ol></div>')
      .replace(/\\bibitem(\[.*?\])?\{([^}]*)\}/g, '<li class="text-sm" id="ref-$2">');

    // Handle appendix
    content = content
      .replace(/\\appendix/g, '<div class="appendix mt-8 pt-4 border-t-2 border-gray-300">')
      .replace(/\\begin\{appendices\}/g, '<div class="appendices mt-8">')
      .replace(/\\end\{appendices\}/g, '</div>');

    // Convert LaTeX sections to HTML headers
    content = content
      .replace(/\\title\{([^}]*)\}/g, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/\\section\{([^}]*)\}/g, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/\\subsection\{([^}]*)\}/g, '<h3 class="text-lg font-medium mt-4 mb-2">$1</h3>')
      .replace(/\\subsubsection\{([^}]*)\}/g, '<h4 class="text-base font-medium mt-3 mb-2">$1</h4>')
      .replace(/\\paragraph\{([^}]*)\}/g, '<h5 class="text-sm font-medium mt-2 mb-1">$1</h5>')
      .replace(/\\subparagraph\{([^}]*)\}/g, '<h6 class="text-xs font-medium mt-1 mb-1">$1</h6>');

    // Handle text formatting
    content = content
      .replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>')
      .replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>')
      .replace(/\\emph\{([^}]*)\}/g, '<em>$1</em>')
      .replace(/\\texttt\{([^}]*)\}/g, '<code class="bg-gray-100 px-1 rounded font-mono text-sm">$1</code>')
      .replace(/\\textsc\{([^}]*)\}/g, '<span class="uppercase text-xs tracking-wider">$1</span>')
      .replace(/\\underline\{([^}]*)\}/g, '<u>$1</u>')
      .replace(/\\textcolor\{[^}]*\}\{([^}]*)\}/g, '$1')
      .replace(/\\footnote\{([^}]*)\}/g, '<sup class="text-xs text-blue-600 cursor-pointer" title="$1">[*]</sup>');

    // Handle line breaks and paragraphs
    content = content
      .replace(/\\\\/g, '<br>')
      .replace(/\\par/g, '</p><p>')
      .replace(/\\newpage/g, '<div class="page-break my-8 border-t border-gray-300"></div>')
      .replace(/\\clearpage/g, '<div class="page-break my-8 border-t border-gray-300"></div>')
      .replace(/\n\n+/g, '</p><p>');

    // Wrap in paragraph tags if not already wrapped
    if (!content.trim().startsWith('<')) {
      content = '<p>' + content + '</p>';
    }

    // Clean up empty paragraphs
    content = content.replace(/<p>\s*<\/p>/g, '');

    return content;
  };

  const renderBeautifiedContent = () => {
    if (!formattedContent) return null;

    if (selectedFormat === 'latex') {
      const processedLatex = processLatexContent(formattedContent);
      
      return (
        <MathJaxContext config={mathJaxConfig}>
          <MathJax dynamic>
            <div 
              className="prose max-w-none latex-content"
              dangerouslySetInnerHTML={{ __html: processedLatex }}
            />
          </MathJax>
        </MathJaxContext>
      );
    } else if (selectedFormat === 'md') {
      return (
        <MathJaxContext config={mathJaxConfig}>
          <MathJax dynamic>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: renderMarkdownWithMath(formattedContent),
              }}
            />
          </MathJax>
        </MathJaxContext>
      );
    } else {
      return (
        <pre className="whitespace-pre-wrap break-words text-sm">
          {formattedContent}
        </pre>
      );
    }
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('formatter.title')}
          </h2>
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
                <p className="text-gray-600 mb-2">
                  {t('formatter.uploadPlaceholder')}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {t('formatter.supportedFormats')}
                </p>
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current.click();
                  }}
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
              {showFilePreview && file && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center text-blue-800">
                    <i className="fas fa-file-alt mr-2"></i>
                    <span className="text-sm">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                    <button
                      className="ml-auto text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        setFile(null);
                        setShowFilePreview(false);
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="mb-6 flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <i className="fas fa-list-alt mr-2 text-indigo-600"></i>
                {t('formatter.requirements')}
              </label>
              <textarea
                className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder={t('formatter.requirementsPlaceholder')}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>

            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <i className="fas fa-file-export mr-2 text-indigo-600"></i>
                {t('formatter.formatStyleTitle', 'Output Format')}
              </label>
              <div className="flex space-x-3">
                {outputFormats.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className={`flex-1 p-3 border-2 rounded-lg text-center transition-all group ${
                      selectedFormat === f.key
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300'
                    }`}
                    onClick={() => handleFormatSelect(f.key)}
                  >
                    <i className={`${f.icon} text-xl mb-1 block`}></i>
                    <span className="text-sm font-medium text-gray-700">
                      {t(`formatter.formats.${f.key}`, f.label)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Processing */}
            {processing && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {t('formatter.processingStatusTitle')}
                  </span>
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    <span className="text-sm text-indigo-600">
                      {t('formatter.processing')}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: progress + '%' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">
                  {t(
                    'formatter.processingStatusDesc'
                  )}
                </p>
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Start Button */}
            <button
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl text-lg font-semibold"
              onClick={isAuthenticated ? handleStart : openRegisterModal}
              disabled={processing}
            >
              {processing ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {t('formatter.processing')}
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  {t('formatter.startButton')}
                </>
              )}
            </button>
          </div>

          {/* Right Panel */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <i className="fas fa-eye text-indigo-600 mr-3"></i>
                {t('formatter.previewTitle')}
              </h3>
              {selectedFormat !== 'docx' && selectedFormat !== 'pdf' && (
                <div className="border-b border-gray-200">
                  <ul className="flex -mb-px text-sm font-medium text-center text-gray-500">
                    <li className="mr-2">
                      <button
                        className={`p-4 border-b-2 ${
                          viewMode === 'beautify'
                            ? 'text-indigo-600 border-indigo-600'
                            : 'border-transparent hover:text-gray-600'
                        }`}
                        onClick={() => setViewMode('beautify')}
                      >
                        Beautify
                      </button>
                    </li>
                    <li className="mr-2">
                      <button
                        className={`p-4 border-b-2 ${
                          viewMode === 'raw'
                            ? 'text-indigo-600 border-indigo-600'
                            : 'border-transparent hover:text-gray-600'
                        }`}
                        onClick={() => setViewMode('raw')}
                      >
                        {selectedFormat.toUpperCase()}
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 h-[400px] overflow-y-auto overflow-x-auto">
              {formattedContent ? (
                (selectedFormat === 'docx' || selectedFormat === 'pdf') ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <i className="fas fa-file-alt text-6xl mb-4"></i>
                    <p className="text-lg font-medium mb-2">
                      {t('formatter.preview.notAvailable')}
                    </p>
                    <p className="text-sm text-center">
                      {t('formatter.preview.binaryFileMessage')}
                    </p>
                  </div>
                ) : (
                  viewMode === 'beautify' ? (
                    renderBeautifiedContent()
                  ) : (
                    <pre className="text-xs whitespace-pre font-mono overflow-x-auto">
                      {formattedContent}
                    </pre>
                  )
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <i className="fas fa-file-alt text-6xl mb-4"></i>
                  <p className="text-lg font-medium mb-2">
                    {t('formatter.preview.notAvailable')}
                  </p>
                  <p className="text-sm text-center">
                    {t('formatter.preview.content')}
                  </p>
                </div>
              )}
            </div>

            {fileUrl && (
              <button
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl text-lg font-semibold"
                disabled={!showSuccess || !fileUrl}
                onClick={handleDownload}
              >
                {downloaded ? (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    {t('formatter.downloaded')}
                  </>
                ) : (
                  <>
                    <i className="fas fa-download mr-2"></i>
                    {t('formatter.download')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .latex-content {
          line-height: 1.6;
        }
        .latex-content h1, .latex-content h2, .latex-content h3, .latex-content h4 {
          color: #1f2937;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .latex-content p {
          margin-bottom: 1rem;
          text-align: justify;
        }
        .latex-content strong {
          font-weight: 600;
        }
        .latex-content em {
          font-style: italic;
        }
        .latex-content ul, .latex-content ol {
          margin: 1rem 0;
        }
        .latex-content li {
          margin-bottom: 0.25rem;
        }
        .latex-content .abstract {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .latex-content blockquote {
          color: #4a5568;
        }
      `}</style>
    </div>
  );
}

export default HomePage;