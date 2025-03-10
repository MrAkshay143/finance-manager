'use client';

import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { useEffect, useState } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true on client-side
    setMounted(true);
    
    // Check if dark mode is enabled in localStorage on initial load
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Finance Manager</title>
        <meta name="description" content="Personal finance management app" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        {/* Script to prevent flash of unstyled content */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var mode = localStorage.getItem('theme');
                if (mode === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body className={`${inter.className} dark:bg-gray-900 dark:text-white`} suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
              <div className="app-container w-full max-w-[450px] mx-auto min-h-screen bg-white dark:bg-gray-800 shadow-2xl overflow-hidden relative flex flex-col">
                {children}
              </div>
              
              {/* App frame design elements for desktop view */}
              <div className="hidden md:block fixed top-0 left-0 w-full h-12 bg-gray-800 z-10"></div>
              <div className="hidden md:flex fixed top-3 left-1/2 transform -translate-x-1/2 h-6 w-32 bg-black rounded-full z-20"></div>
            </div>
          </ToastProvider>
        </AuthProvider>
        
        <style jsx global>{`
          @media (min-width: 450px) {
            body {
              background-color: #f0f2f5 !important;
            }
            
            .app-container {
              border-radius: 2rem;
              overflow: hidden;
              height: calc(100vh - 40px);
              margin: 20px auto;
              position: relative;
            }
          }
        `}</style>
      </body>
    </html>
  );
} 