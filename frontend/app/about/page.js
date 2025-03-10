'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function AboutPage() {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header title="About" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="text-center mb-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-blue-500 overflow-hidden flex items-center justify-center bg-blue-100 text-blue-600 mb-3">
                <span className="text-3xl font-bold">FM</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Finance Manager</h1>
            <p className="text-gray-500">Version 1.0.0</p>
          </div>
          
          <p className="text-gray-700 mb-4 text-center">
            A comprehensive financial management application for tracking personal and business finances.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Double-entry accounting system</li>
                <li>• Transaction management</li>
                <li>• Ledger accounts and groups</li>
                <li>• Financial reports</li>
                <li>• Dashboard with key metrics</li>
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-700 mb-2">Technologies</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Next.js (React)</li>
                <li>• PHP Backend</li>
                <li>• MySQL Database</li>
                <li>• Tailwind CSS</li>
                <li>• Font Awesome Icons</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <span>Developer Details</span>
              <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'} ml-2`}></i>
            </button>
            
            {showDetails && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Akshay Mondal</h3>
                  <p className="text-gray-600">Full Stack Developer</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <i className="fas fa-envelope w-6 text-gray-400"></i>
                    <a href="mailto:contact@imakshay.in" className="text-blue-600 hover:underline ml-2">
                      contact@imakshay.in
                    </a>
                  </div>
                  
                  <div className="flex items-center">
                    <i className="fas fa-globe w-6 text-gray-400"></i>
                    <a href="https://www.imakshay.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                      www.imakshay.in
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Contact & Support</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              If you have any questions, feedback, or need support, please feel free to reach out:
            </p>
            
            <div className="flex items-start">
              <i className="fas fa-envelope mt-1 w-6 text-gray-400"></i>
              <div className="ml-2">
                <p className="font-medium text-gray-800">Email Support</p>
                <a href="mailto:support@financemanager.app" className="text-blue-600 hover:underline">
                  support@financemanager.app
                </a>
              </div>
            </div>
            
            <div className="flex items-start">
              <i className="fas fa-bug mt-1 w-6 text-gray-400"></i>
              <div className="ml-2">
                <p className="font-medium text-gray-800">Report Issues</p>
                <a href="https://github.com/akshaymondal/finance-manager/issues" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  GitHub Issues
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Finance Manager. All rights reserved.</p>
            <div className="mt-2 space-x-3">
              <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
} 