'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createBackup } from '@/utils/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Check if dark mode is already enabled
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const handleDarkModeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Save preference and apply changes
    if (newDarkMode) {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    }
    
    setSuccess('Theme preference saved');
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };
  
  const handleConfirmBackup = async () => {
    try {
      const response = await createBackup();
      
      if (response && response.success) {
        setShowConfirmation(false);
        setSuccess('Backup created successfully');
        
        // If download URL is provided, open it in a new tab
        if (response.download_url) {
          // Open the download in a new tab
          window.open(response.download_url, '_blank');
        }
      } else {
        setShowConfirmation(false);
        setError(response?.message || 'Failed to create backup');
      }
    } catch (err) {
      setShowConfirmation(false);
      setError(err.message || 'Failed to create backup');
    }
    
    // Hide success/error message after 3 seconds
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 3000);
  };
  
  const handleCancelBackup = () => {
    setShowConfirmation(false);
  };
  
  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          icon: 'fa-user',
          color: 'bg-blue-100 text-blue-600',
          title: 'Profile',
          description: 'Manage your personal information',
          path: '/profile'
        }
      ]
    },
    {
      title: 'Application',
      items: [
        {
          icon: 'fa-moon',
          color: isDarkMode ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600',
          title: 'Dark Mode',
          description: 'Toggle between light and dark themes',
          toggle: true,
          isToggled: isDarkMode,
          onToggle: handleDarkModeToggle
        },
        {
          icon: 'fa-database',
          color: 'bg-green-100 text-green-600',
          title: 'Backup Data',
          description: 'Create a backup of your financial data',
          action: true,
          actionText: 'Create Backup',
          onAction: () => setShowConfirmation(true)
        }
      ]
    },
    {
      title: 'Help & Support',
      items: [
        {
          icon: 'fa-book',
          color: 'bg-yellow-100 text-yellow-600',
          title: 'Help Center',
          description: 'Tutorials and user guides',
          path: '/help'
        },
        {
          icon: 'fa-info-circle',
          color: 'bg-teal-100 text-teal-600',
          title: 'About',
          description: 'App version and information',
          path: '/about'
        }
      ]
    }
  ];
  
  return (
    <div className="pb-20">
      <Header title="Settings" />
      
      <div className="p-4">
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm transition-opacity">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm transition-opacity">
            {error}
          </div>
        )}
        
        {/* Settings Groups */}
        {settingsGroups.map((group, index) => (
          <div key={index} className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{group.title}</h2>
            
            <div className="bg-white rounded-xl border overflow-hidden">
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex} className={`border-b last:border-b-0 ${item.path ? 'hover:bg-gray-50' : ''}`}>
                  {item.path ? (
                    <Link href={item.path} className="flex items-center p-4">
                      <div className={`${item.color} w-10 h-10 rounded-full flex items-center justify-center mr-3`}>
                        <i className={`fa-solid ${item.icon}`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-gray-500 text-sm">{item.description}</p>
                      </div>
                      <i className="fa-solid fa-chevron-right text-gray-400"></i>
                    </Link>
                  ) : item.toggle ? (
                    <div className="flex items-center p-4">
                      <div className={`${item.color} w-10 h-10 rounded-full flex items-center justify-center mr-3`}>
                        <i className={`fa-solid ${item.icon}`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-gray-500 text-sm">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={item.isToggled} 
                          onChange={item.onToggle}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ) : item.action ? (
                    <div className="flex items-center p-4">
                      <div className={`${item.color} w-10 h-10 rounded-full flex items-center justify-center mr-3`}>
                        <i className={`fa-solid ${item.icon}`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-gray-500 text-sm">{item.description}</p>
                      </div>
                      <button 
                        onClick={item.onAction}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        {item.actionText}
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* App Version */}
        <div className="text-center text-gray-500 text-xs mt-8">
          <p>Finance Manager v1.0.0</p>
          <p>© 2025 Akshay Mondal. All rights reserved.</p>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Create Backup?</h3>
            <p className="text-gray-600 mb-4">This will create a backup of all your financial data. The backup file will be available for download.</p>
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleCancelBackup}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmBackup}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Backup
              </button>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
} 