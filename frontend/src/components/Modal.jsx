import { useEffect, useRef } from 'react';

function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  actions,
  maxWidth = 'sm:max-w-3xl',
  closeButtonLabel = '关闭'
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // 保存当前焦点元素
      previousFocusRef.current = document.activeElement;
      
      // 将焦点移到模态框
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // 添加ESC键监听
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      
      // 防止背景滚动
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
        
        // 恢复之前的焦点
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 处理遮罩层点击
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 overflow-y-auto z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-gray-500 opacity-75 transition-opacity" 
        aria-hidden="true"
        onClick={handleBackdropClick}
      />
      
      {/* 容器层 - 确保内容在遮罩层之上 */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* 占位元素，用于居中对齐 */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          {/* 模态框内容 */}
          <div 
            ref={modalRef}
            className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${maxWidth} sm:w-full relative z-20`}
            tabIndex="-1"
            onClick={(e) => e.stopPropagation()}
          >
          {/* 头部 */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-start">
                  <h3 
                    id="modal-title"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    {title}
                  </h3>
                  <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
                    aria-label={closeButtonLabel}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* 内容区域 */}
                <div className="mt-4">
                  {children}
                </div>
              </div>
            </div>
          </div>
          
          {/* 底部操作按钮 */}
          {actions && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {actions}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal; 