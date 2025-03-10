'use client';

import { useEffect, useRef } from 'react';

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  confirmButtonClass = 'bg-blue-600 hover:bg-blue-700',
  icon = null,
  size = 'sm', // sm, md, lg - default to small for more concise dialogs
  danger = false
}) {
  const dialogRef = useRef(null);
  
  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  // Get size class based on prop
  const getDialogSizeClass = () => {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-lg';
      default: return 'max-w-md';
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Dialog container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Dialog */}
        <div 
          className={`bg-white rounded-xl shadow-xl transform transition-all ${getDialogSizeClass()} w-full animate-fade-in`}
          ref={dialogRef}
        >
          {/* More compact header with icon and title in one line */}
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center">
              {icon && (
                <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 
                  ${danger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  <i className={`fa-solid ${icon}`}></i>
                </div>
              )}
              <h3 className="text-base font-bold text-gray-900">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          {/* More compact content */}
          <div className="px-4 py-2 text-sm">
            {children}
          </div>
          
          {/* More compact footer */}
          <div className="px-4 py-3 bg-gray-50 rounded-b-xl flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : confirmButtonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 