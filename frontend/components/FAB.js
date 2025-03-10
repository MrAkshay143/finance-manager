'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FAB({ 
  mainIcon = 'fa-plus', 
  mainAction = null, 
  mainHref = null, 
  actions = [], 
  position = 'bottom-right',
  color = 'blue'
}) {
  const [open, setOpen] = useState(false);
  
  // Determine position classes
  let positionClasses = '';
  switch (position) {
    case 'bottom-right':
      positionClasses = 'bottom-24 right-4';
      break;
    case 'bottom-left':
      positionClasses = 'bottom-24 left-4';
      break;
    case 'top-right':
      positionClasses = 'top-24 right-4';
      break;
    case 'top-left':
      positionClasses = 'top-24 left-4';
      break;
    default:
      positionClasses = 'bottom-24 right-4';
  }
  
  // Determine color classes
  let colorClasses = '';
  switch (color) {
    case 'blue':
      colorClasses = 'bg-blue-600 hover:bg-blue-700';
      break;
    case 'green':
      colorClasses = 'bg-green-600 hover:bg-green-700';
      break;
    case 'red':
      colorClasses = 'bg-red-600 hover:bg-red-700';
      break;
    case 'purple':
      colorClasses = 'bg-purple-600 hover:bg-purple-700';
      break;
    default:
      colorClasses = 'bg-blue-600 hover:bg-blue-700';
  }
  
  // Toggle the menu
  const toggleOpen = () => {
    if (actions.length > 0) {
      setOpen(!open);
    } else if (mainAction) {
      mainAction();
    }
  };
  
  // Main button - either a Link or a button
  const MainButton = () => (
    <button 
      onClick={toggleOpen}
      className={`${colorClasses} text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors z-10`}
      aria-label="Floating action button"
    >
      <i className={`fa-solid ${open && actions.length > 0 ? 'fa-times' : mainIcon} text-xl`}></i>
    </button>
  );
  
  // If there are no actions, and there's a href, render as a Link
  if (actions.length === 0 && mainHref) {
    return (
      <div className={`fixed ${positionClasses} z-50`}>
        <Link 
          href={mainHref}
          className={`${colorClasses} text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors`}
        >
          <i className={`fa-solid ${mainIcon} text-xl`}></i>
        </Link>
      </div>
    );
  }
  
  return (
    <div className={`fixed ${positionClasses} z-50`}>
      <div className="relative">
        {/* Main FAB button */}
        <MainButton />
        
        {/* Action buttons - displayed when open */}
        {actions.length > 0 && (
          <div className={`absolute ${position.includes('bottom') ? 'bottom-16' : 'top-16'} transition-all ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div className="flex flex-col items-center space-y-2">
              {actions.map((action, index) => (
                action.href ? (
                  <Link 
                    key={index}
                    href={action.href}
                    className="flex items-center"
                  >
                    <span className="bg-gray-800 text-white text-sm py-1 px-3 rounded-lg shadow-md mr-2">
                      {action.label}
                    </span>
                    <div className={`${colorClasses} text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md`}>
                      <i className={`fa-solid ${action.icon} text-sm`}></i>
                    </div>
                  </Link>
                ) : (
                  <button 
                    key={index}
                    onClick={() => {
                      action.onClick();
                      setOpen(false);
                    }}
                    className="flex items-center"
                  >
                    <span className="bg-gray-800 text-white text-sm py-1 px-3 rounded-lg shadow-md mr-2">
                      {action.label}
                    </span>
                    <div className={`${colorClasses} text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md`}>
                      <i className={`fa-solid ${action.icon} text-sm`}></i>
                    </div>
                  </button>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 