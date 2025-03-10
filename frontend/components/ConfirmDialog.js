'use client';

import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  icon = 'fa-triangle-exclamation',
  iconClass = 'text-red-500',
  isLoading = false,
}) {
  const handleConfirm = () => {
    onConfirm();
  };
  
  const footer = (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelText}
      </button>
      <button
        type="button"
        className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center ${confirmButtonClass}`}
        onClick={handleConfirm}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
            Processing...
          </>
        ) : (
          confirmText
        )}
      </button>
    </div>
  );
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="sm"
      closeOnClickOutside={!isLoading}
      showCloseButton={!isLoading}
    >
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${iconClass} bg-opacity-10 flex items-center justify-center`}>
          <i className={`fa-solid ${icon} text-xl`}></i>
        </div>
        <div className="flex-1">
          <p className="text-gray-700">{message}</p>
        </div>
      </div>
    </Modal>
  );
} 