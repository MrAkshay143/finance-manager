'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/Card';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Check if redirected from registration
    const registered = searchParams.get('registered');
    if (registered) {
      toast.success('Registration successful! Please login with your credentials.');
    }
    
    // Redirect if already authenticated
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router, searchParams, toast]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast.error('Username and password are required');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(credentials.username, credentials.password);
      
      if (!result.success) {
        toast.error(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="flex-1 flex flex-col justify-center p-4">
        {/* Logo and App Name */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 mb-3 text-white text-2xl">
            <i className="fa-solid fa-wallet"></i>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
            Finance Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Your personal finance companion</p>
        </div>
        
        <Card
          className="mb-6 animate-fadeIn border-none shadow-lg"
          noPadding={true}
        >
          {/* Card Header */}
          <div className="p-6 pb-0">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Sign in to your account</p>
          </div>
          
          {/* Card Body */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    <i className="fa-solid fa-user"></i>
                  </span>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:text-white"
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:text-white"
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-800 transition-colors flex items-center justify-center shadow-md"
              >
                {loading ? (
                  <>
                    <span className="mr-2 animate-spin">
                      <i className="fa-solid fa-circle-notch"></i>
                    </span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
          
          {/* Card Footer */}
          <div className="p-6 text-center border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </Card>
        
        {/* Developer Credit */}
        <div className="text-center text-gray-500 dark:text-gray-400 text-xs">
          <p>Developed by</p>
          <a 
            href="https://github.com/MrAkshay143" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center mt-1"
          >
            <i className="fa-brands fa-github mr-1"></i>
            MrAkshay143
          </a>
          <p className="mt-2">&copy; {new Date().getFullYear()} Finance Manager</p>
        </div>
      </div>
    </div>
  );
} 