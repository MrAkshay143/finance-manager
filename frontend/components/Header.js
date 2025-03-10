'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header({ title, showBack = false, showMenu = true }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-4 sticky top-0 z-40 shadow-md">
      <div className="container mx-auto px-4 max-w-screen-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showBack && (
              <button
                onClick={handleBack}
                className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
            )}
            
            <h1 className="text-xl font-bold">{title}</h1>
          </div>

          {showMenu && (
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              >
                <i className="fa-solid fa-ellipsis-vertical"></i>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                  {user && (
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-700">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email || user.username}</p>
                    </div>
                  )}

                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`block px-4 py-2 text-sm ${
                        pathname === item.path ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <i className={`fa-solid ${item.icon} mr-2 w-5 text-center`}></i>
                      {item.name}
                    </Link>
                  ))}

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <i className="fa-solid fa-right-from-bracket mr-2 w-5 text-center"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 