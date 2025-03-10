'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/utils/api';
import Card from '@/components/Card';
import { useToast } from '@/context/ToastContext';
import { isValidEmail, isStrongPassword, getPasswordStrength } from '@/utils/validation';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    userType: 'user', // New field for multi-user support
  });
  
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Check password strength when password field changes
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username || !formData.password || !formData.name || !formData.email) {
      toast.error('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!isStrongPassword(formData.password)) {
      toast.error('Password is not strong enough. Please use at least 8 characters with uppercase, lowercase, and numbers.');
      return;
    }
    
    try {
      setLoading(true);
      
      const { username, password, name, email, userType } = formData;
      const response = await register(username, password, name, email, userType);
      
      if (response.success) {
        toast.success('Registration successful!');
        // Redirect to login
        router.push('/login?registered=true');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const renderPasswordStrength = () => {
    if (!formData.password) return null;
    
    const { score, feedback } = passwordStrength;
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    
    return (
      <div className="mt-1">
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
          <div 
            className={`h-1.5 rounded-full ${colors[score]}`} 
            style={{ width: `${(score + 1) * 20}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${colors[score].replace('bg-', 'text-')}`}>
            {labels[score]}
          </span>
          {feedback && <span className="text-xs text-gray-500 dark:text-gray-400">{feedback}</span>}
        </div>
      </div>
    );
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
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Create your account</p>
        </div>
        
        <Card
          className="mb-6 animate-fadeIn border-none shadow-lg"
          noPadding={true}
        >
          {/* Card Header */}
          <div className="p-6 pb-0">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Sign Up</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Join the Finance Manager community</p>
          </div>
          
          {/* Card Body */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                      <i className="fa-solid fa-user"></i>
                    </span>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:text-white"
                    />
                  </div>
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                      <i className="fa-solid fa-envelope"></i>
                    </span>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:text-white"
                    />
                  </div>
                </div>
                
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                      <i className="fa-solid fa-at"></i>
                    </span>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:text-white"
                    />
                  </div>
                </div>
                
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                      <i className="fa-solid fa-lock"></i>
                    </span>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:text-white"
                    />
                  </div>
                  {renderPasswordStrength()}
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                      <i className="fa-solid fa-lock"></i>
                    </span>
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:text-white"
                    />
                  </div>
                </div>
                
                {/* Account Type */}
                <div>
                  <label htmlFor="userType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Type
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                      <i className="fa-solid fa-user-tag"></i>
                    </span>
                    <select
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none dark:text-white"
                    >
                      <option value="user">Personal User</option>
                      <option value="business">Business User</option>
                      <option value="accountant">Accountant</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 pointer-events-none">
                      <i className="fa-solid fa-chevron-down"></i>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-800 transition-colors flex items-center justify-center shadow-md"
              >
                {loading ? (
                  <>
                    <span className="mr-2 animate-spin">
                      <i className="fa-solid fa-circle-notch"></i>
                    </span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
          
          {/* Card Footer */}
          <div className="p-6 text-center border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                Sign In
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