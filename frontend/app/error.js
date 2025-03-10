'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="bg-red-100 text-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Something Went Wrong</h1>
          <p className="text-gray-600 mb-6">
            We apologize for the inconvenience. Please try again or return to the dashboard.
          </p>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={() => reset()}
            className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <Link href="/dashboard" className="block w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 