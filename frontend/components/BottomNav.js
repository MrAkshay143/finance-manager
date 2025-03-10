'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const [showActions, setShowActions] = useState(false);

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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Action buttons popup */}
      {showActions && (
        <div className="container mx-auto max-w-md px-4">
          <div className="bg-white rounded-t-xl shadow-lg p-5 animate-slide-up">
            <div className="grid grid-cols-4 gap-3">
              {actionItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="flex flex-col items-center"
                  onClick={() => setShowActions(false)}
                >
                  <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white mb-1`}>
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <span className="text-xs">{item.name}</span>
                </Link>
              ))}
            </div>
            <button 
              className="mt-3 w-full py-2 bg-gray-200 rounded-lg text-sm font-medium"
              onClick={() => setShowActions(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main bottom navigation */}
      <nav className="bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto px-4 max-w-screen-md">
          <div className="flex justify-around items-center h-16 relative">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`flex flex-col items-center ${pathname === item.path ? 'text-blue-600' : 'text-gray-500'}`}
              >
                <i className={`fa-solid ${item.icon} text-lg`}></i>
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            ))}

            {/* Action button (centered, floating) */}
            <button
              onClick={toggleActions}
              className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-transform ${showActions ? 'rotate-45' : ''}`}
            >
              <i className="fa-solid fa-plus text-xl"></i>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
} 