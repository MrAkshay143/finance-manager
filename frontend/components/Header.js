'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header({ title, showBack = false, showMenu = true }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleBack = () => {
    router.back();
  };

  const menuItems = [
    { name: 'Profile', icon: 'fa-user', path: '/profile' },
    { name: 'Settings', icon: 'fa-gear', path: '/settings' },
    { name: 'Help', icon: 'fa-circle-question', path: '/help' },
  ];

  return (
    <header 
      className={`bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-800 dark:to-gray-900 text-white py-3 sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showBack && (
              <button
                onClick={handleBack}
                className="mr-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Go back"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
            )}
            
            <h1 className="text-lg font-bold">{title}</h1>
          </div>

          {showMenu && (
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Open menu"
              >
                <i className="fa-solid fa-ellipsis"></i>
              </button>

              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 bg-black/20 z-40" 
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-gray-800 dark:border dark:border-gray-700 py-1.5 z-50 overflow-hidden">
                    {user && (
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 mb-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || user.username}</p>
                      </div>
                    )}

                    {menuItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.path}
                        className={`block px-4 py-2.5 text-sm ${
                          pathname === item.path 
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        } transition-colors`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <i className={`fa-solid ${item.icon} mr-3 w-5 text-center opacity-75`}></i>
                        {item.name}
                      </Link>
                    ))}

                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <i className="fa-solid fa-right-from-bracket mr-3 w-5 text-center opacity-75"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 