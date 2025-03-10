'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const [showActions, setShowActions] = useState(false);
  const [previousScrollPos, setPreviousScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  // Handle scroll to hide/show navigation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const visible = previousScrollPos > currentScrollPos || currentScrollPos < 10;
      
      setPreviousScrollPos(currentScrollPos);
      setVisible(visible);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [previousScrollPos]);

  // Action button items
  const actionItems = [
    { name: 'Receipt', icon: 'fa-arrow-down', color: 'bg-green-500', path: '/transactions/new/receipt' },
    { name: 'Payment', icon: 'fa-arrow-up', color: 'bg-red-500', path: '/transactions/new/payment' },
    { name: 'Transfer', icon: 'fa-right-left', color: 'bg-blue-500', path: '/transactions/new/transfer' },
    { name: 'Journal', icon: 'fa-pen', color: 'bg-purple-500', path: '/transactions/new/journal' },
  ];

  // Main navigation items
  const navItems = [
    { name: 'Dashboard', icon: 'fa-house', path: '/dashboard' },
    { name: 'Accounts', icon: 'fa-wallet', path: '/ledgers' },
    { name: 'Transactions', icon: 'fa-list', path: '/transactions' },
    { name: 'Reports', icon: 'fa-chart-pie', path: '/reports' },
  ];

  const toggleActions = () => {
    setShowActions(!showActions);
  };

  const closeActionsOnOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowActions(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay for action menu */}
      {showActions && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={closeActionsOnOverlayClick}
        ></div>
      )}
      
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${!visible ? 'translate-y-full' : 'translate-y-0'}`}>
        {/* Action buttons popup */}
        {showActions && (
          <div className="mx-auto max-w-[450px] px-4">
            <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-xl p-5 animate-slide-up">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">New Transaction</h3>
              
              <div className="grid grid-cols-4 gap-3">
                {actionItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className="flex flex-col items-center group"
                    onClick={() => setShowActions(false)}
                  >
                    <div className={`w-14 h-14 ${item.color} rounded-full flex items-center justify-center text-white mb-2 shadow-md group-hover:shadow-lg transform group-hover:scale-105 transition-all`}>
                      <i className={`fa-solid ${item.icon} text-lg`}></i>
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                  </Link>
                ))}
              </div>
              
              <button 
                className="mt-5 w-full py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowActions(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main bottom navigation */}
        <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg rounded-t-xl">
          <div className="flex justify-around items-center h-16 relative">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex flex-col items-center py-1 px-2 relative ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {isActive && (
                    <div className="absolute -top-1 w-1/2 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                  <i className={`fa-solid ${item.icon} text-xl ${isActive ? 'mb-1' : 'mb-0.5'}`}></i>
                  <span className={`text-xs mt-0.5 ${isActive ? 'font-medium' : ''}`}>{item.name}</span>
                </Link>
              );
            })}

            {/* Action button (centered, floating) */}
            <button
              onClick={toggleActions}
              className={`absolute -top-7 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl hover:shadow-blue-500/30 transition-all duration-300 ${
                showActions 
                  ? 'rotate-45 scale-110' 
                  : 'hover:scale-105'
              }`}
              aria-label="Add new transaction"
            >
              <i className="fa-solid fa-plus text-xl"></i>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
} 