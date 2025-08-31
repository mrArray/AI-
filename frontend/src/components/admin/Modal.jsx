import React from 'react';

const Modal = ({ open, title, children, onClose, actions }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <span className="text-xl">&times;</span>
        </button>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="mb-6">{children}</div>
        <div className="flex justify-end space-x-2">
          {actions}
        </div>
      </div>
    </div>
  );
};

export default Modal;
