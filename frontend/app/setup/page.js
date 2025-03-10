'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [setupData, setSetupData] = useState({
    siteName: 'Finance Manager',
    adminUsername: '',
    adminPassword: '',
    adminEmail: '',
    dbHost: 'localhost',
    dbName: '',
    dbUser: '',
    dbPassword: '',
    siteUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [connectionTested, setConnectionTested] = useState(false);
  
  const totalSteps = 4;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSetupData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateCurrentStep = () => {
    let stepErrors = {};
    let isValid = true;
    
    switch (currentStep) {
      case 1:
        // Welcome page - no validation needed
        break;
      case 2:
        // System requirements check - no validation needed
        break;
      case 3:
        // Database config validation
        if (!setupData.dbHost) {
          stepErrors.dbHost = 'Database host is required';
          isValid = false;
        }
        if (!setupData.dbName) {
          stepErrors.dbName = 'Database name is required';
          isValid = false;
        }
        if (!setupData.dbUser) {
          stepErrors.dbUser = 'Database username is required';
          isValid = false;
        }
        if (!setupData.dbPassword) {
          stepErrors.dbPassword = 'Database password is required';
          isValid = false;
        }
        break;
      case 4:
        // Admin account validation
        if (!setupData.siteName) {
          stepErrors.siteName = 'Site name is required';
          isValid = false;
        }
        if (!setupData.adminUsername) {
          stepErrors.adminUsername = 'Admin username is required';
          isValid = false;
        }
        if (!setupData.adminPassword) {
          stepErrors.adminPassword = 'Admin password is required';
          isValid = false;
        } else if (setupData.adminPassword.length < 8) {
          stepErrors.adminPassword = 'Password must be at least 8 characters';
          isValid = false;
        }
        if (!setupData.adminEmail) {
          stepErrors.adminEmail = 'Admin email is required';
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(setupData.adminEmail)) {
          stepErrors.adminEmail = 'Please enter a valid email';
          isValid = false;
        }
        if (!setupData.siteUrl) {
          stepErrors.siteUrl = 'Site URL is required';
          isValid = false;
        }
        break;
    }
    
    setErrors(stepErrors);
    return isValid;
  };
  
  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      } else {
        completeSetup();
      }
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const testConnection = () => {
    setLoading(true);
    // Simulate database connection test
    setTimeout(() => {
      setLoading(false);
      setConnectionTested(true);
      // Add logic here to actually test the connection
    }, 2000);
  };
  
  const completeSetup = () => {
    setLoading(true);
    // Simulate installation process
    setTimeout(() => {
      setLoading(false);
      setSetupCompleted(true);
      // Add logic here to actually complete the setup
    }, 3000);
  };
  
  const goToDashboard = () => {
    router.push('/login');
  };
  
  // Step content renderers
  const renderStepOne = () => {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
          <h2 className="text-xl font-medium text-blue-800 dark:text-blue-300 mb-3">Welcome to Finance Manager!</h2>
          <p className="text-blue-700 dark:text-blue-400">This setup wizard will help you configure your Finance Manager application. The setup process is simple and should only take a few minutes.</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <i className="fa-solid fa-check-circle text-green-500 text-xl"></i>
            </div>
            <div className="ml-3">
              <h3 className="font-medium">Easy Installation</h3>
              <p className="text-gray-600 dark:text-gray-400">Set up your Finance Manager in minutes with our simple installation wizard.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <i className="fa-solid fa-check-circle text-green-500 text-xl"></i>
            </div>
            <div className="ml-3">
              <h3 className="font-medium">Secure and Private</h3>
              <p className="text-gray-600 dark:text-gray-400">Your data remains on your server, giving you complete control over your information.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <i className="fa-solid fa-check-circle text-green-500 text-xl"></i>
            </div>
            <div className="ml-3">
              <h3 className="font-medium">Mobile-Friendly</h3>
              <p className="text-gray-600 dark:text-gray-400">Access your finances from any device with our responsive design.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fa-solid fa-triangle-exclamation text-yellow-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Before proceeding, make sure you have your database credentials ready. You'll need your database name, username, and password.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderStepTwo = () => {
    // Simulate system requirements check
    const requirements = [
      { name: 'PHP Version', required: '≥ 8.0', current: '8.1', met: true },
      { name: 'MySQL Version', required: '≥ 5.7', current: '8.0', met: true },
      { name: 'PDO Extension', required: 'Enabled', current: 'Enabled', met: true },
      { name: 'Curl Extension', required: 'Enabled', current: 'Enabled', met: true },
      { name: 'File Permissions', required: 'Writable', current: 'Writable', met: true },
      { name: 'GD Library', required: 'Enabled', current: 'Enabled', met: true },
    ];
    
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
          <h2 className="text-xl font-medium text-blue-800 dark:text-blue-300 mb-2">System Requirements Check</h2>
          <p className="text-blue-700 dark:text-blue-400">We'll check if your server meets the minimum requirements needed to run Finance Manager.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Requirement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Required</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {requirements.map((req, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{req.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{req.required}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{req.current}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {req.met ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                        <i className="fa-solid fa-check mr-1"></i> Passed
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                        <i className="fa-solid fa-times mr-1"></i> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fa-solid fa-check-circle text-green-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-400">
                Great! Your server meets all the requirements for running Finance Manager.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderStepThree = () => {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
          <h2 className="text-xl font-medium text-blue-800 dark:text-blue-300 mb-2">Database Configuration</h2>
          <p className="text-blue-700 dark:text-blue-400">Enter your database connection details. This information should be available from your hosting provider.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Database Host</label>
              <input
                type="text"
                name="dbHost"
                value={setupData.dbHost}
                onChange={handleChange}
                placeholder="localhost"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.dbHost ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
              />
              {errors.dbHost && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dbHost}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">In most cases this will be "localhost"</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Database Name</label>
              <input
                type="text"
                name="dbName"
                value={setupData.dbName}
                onChange={handleChange}
                placeholder="finance_manager"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.dbName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
              />
              {errors.dbName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dbName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Database Username</label>
              <input
                type="text"
                name="dbUser"
                value={setupData.dbUser}
                onChange={handleChange}
                placeholder="db_user"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.dbUser ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
              />
              {errors.dbUser && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dbUser}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Database Password</label>
              <input
                type="password"
                name="dbPassword"
                value={setupData.dbPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.dbPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
              />
              {errors.dbPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dbPassword}</p>}
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                  Testing Connection...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-database mr-2"></i>
                  Test Connection
                </>
              )}
            </button>
            
            {connectionTested && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm">
                <i className="fa-solid fa-check-circle mr-2"></i>
                Connection successful! Database exists and credentials are valid.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderStepFour = () => {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
          <h2 className="text-xl font-medium text-blue-800 dark:text-blue-300 mb-2">Site Configuration</h2>
          <p className="text-blue-700 dark:text-blue-400">Set up your site details and create your admin account to manage Finance Manager.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Site Details</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={setupData.siteName}
                onChange={handleChange}
                placeholder="Finance Manager"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.siteName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
              />
              {errors.siteName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.siteName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site URL</label>
              <input
                type="text"
                name="siteUrl"
                value={setupData.siteUrl}
                onChange={handleChange}
                placeholder="https://erp.imakshay.in"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.siteUrl ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
              />
              {errors.siteUrl && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.siteUrl}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter the full URL including http:// or https://</p>
            </div>
          </div>
          
          <hr className="my-6 border-gray-200 dark:border-gray-700" />
          
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Admin Account</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Username</label>
              <input
                type="text"
                name="adminUsername"
                value={setupData.adminUsername}
                onChange={handleChange}
                placeholder="admin"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.adminUsername ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
              />
              {errors.adminUsername && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.adminUsername}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Email</label>
              <input
                type="email"
                name="adminEmail"
                value={setupData.adminEmail}
                onChange={handleChange}
                placeholder="admin@example.com"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.adminEmail ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
              />
              {errors.adminEmail && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.adminEmail}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Password</label>
              <input
                type="password"
                name="adminPassword"
                value={setupData.adminPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.adminPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
              />
              {errors.adminPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.adminPassword}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Must be at least 8 characters</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fa-solid fa-info-circle text-yellow-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                This is the admin account you'll use to log in to Finance Manager. Make sure to keep these credentials safe.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderCompletionStep = () => {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-scale">
            <i className="fa-solid fa-check text-5xl text-green-500 dark:text-green-400"></i>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Installation Complete!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            Finance Manager has been successfully installed. You can now log in with your admin account.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6 w-full max-w-md">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 dark:text-gray-400">Site URL:</span>
              <span className="font-medium">{setupData.siteUrl || 'https://erp.imakshay.in'}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 dark:text-gray-400">Username:</span>
              <span className="font-medium">{setupData.adminUsername || 'admin'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Email:</span>
              <span className="font-medium">{setupData.adminEmail || 'admin@example.com'}</span>
            </div>
          </div>
          
          <button
            onClick={goToDashboard}
            className="w-full max-w-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center mb-8"
          >
            <i className="fa-solid fa-right-to-bracket mr-2"></i>
            Login to Dashboard
          </button>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 w-full max-w-md">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Developed by Akshay Mondal</p>
            <div className="flex justify-center space-x-4">
              <a 
                href="https://github.com/MrAkshay143" 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <i className="fa-brands fa-github text-xl"></i>
              </a>
              <a 
                href="https://instagram.com/mr.akshay_mondal" 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-pink-600 transition-colors"
              >
                <i className="fa-brands fa-instagram text-xl"></i>
              </a>
              <a 
                href="https://imakshay.in" 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
              >
                <i className="fa-solid fa-globe text-xl"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="relative flex-1 p-6 flex flex-col">
        {/* Logo and Heading */}
        <div className="text-center mb-8">
          <div className="mb-3 inline-flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center text-white">
              <i className="fa-solid fa-wallet text-2xl"></i>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Finance Manager Setup</h1>
        </div>
        
        {/* Setup Steps */}
        {!setupCompleted ? (
          <>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            
            {/* Steps Indicator */}
            <div className="flex justify-center mb-8">
              <ol className="flex items-center space-x-2 sm:space-x-4">
                {Array.from({ length: totalSteps }).map((_, index) => {
                  const stepNum = index + 1;
                  const isCurrent = stepNum === currentStep;
                  const isCompleted = stepNum < currentStep;
                  
                  return (
                    <li key={index} className="flex items-center">
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                        } transition-colors`}
                      >
                        {isCompleted ? (
                          <i className="fa-solid fa-check"></i>
                        ) : (
                          stepNum
                        )}
                      </div>
                      
                      {index < totalSteps - 1 && (
                        <div className={`w-8 h-0.5 sm:w-16 ${
                          stepNum < currentStep 
                            ? 'bg-green-500' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}></div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
            
            {/* Step Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 animate-fade-in">
              {currentStep === 1 && renderStepOne()}
              {currentStep === 2 && renderStepTwo()}
              {currentStep === 3 && renderStepThree()}
              {currentStep === 4 && renderStepFour()}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-auto">
              <button
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
                className={`px-6 py-2.5 rounded-xl font-medium ${
                  currentStep === 1 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                } border border-gray-200 dark:border-gray-700 transition-colors`}
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>
                Previous
              </button>
              
              <button
                onClick={nextStep}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    {currentStep < totalSteps ? 'Next' : 'Complete Setup'}
                    <i className="fa-solid fa-arrow-right ml-2"></i>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          renderCompletionStep()
        )}
      </div>
    </div>
  );
} 