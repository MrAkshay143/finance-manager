'use client';

import { useState, useEffect } from 'react';

export default function Toast({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose,
  position = 'bottom-center'
}) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) setTimeout(onClose, 300); // Allow animation to complete
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  // Type-based styles
  const typeStyles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      icon: 'fa-circle-check'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      icon: 'fa-circle-exclamation'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: 'fa-triangle-exclamation'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'fa-circle-info'
    }
  };
  
  const styles = typeStyles[type] || typeStyles.info;
  
  // Position classes
  const positionClasses = {
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-center': 'bottom-20 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-20 left-4',
    'bottom-right': 'bottom-20 right-4'
  };
  
  const positionClass = positionClasses[position] || positionClasses['bottom-center'];
  
  return (
    <div 
      className={`fixed ${positionClass} z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className={`${styles.bg} ${styles.border} ${styles.text} border rounded-lg shadow-md px-4 py-3 max-w-md flex items-center`}>
        <i className={`fas ${styles.icon} mr-2`}></i>
        <p>{message}</p>
        <button 
          onClick={() => {
            setVisible(false);
            if (onClose) setTimeout(onClose, 300);
          }}
          className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
} 