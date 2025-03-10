'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth, login as apiLogin, logout as apiLogout } from '@/utils/api';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await checkAuth();
        if (userData) {
          setUser(userData.user);
        } else {
          setUser(null);
          // If we're not on the login or register page, redirect to login
          if (
            window.location.pathname !== '/login' && 
            window.location.pathname !== '/register' && 
            !window.location.pathname.startsWith('/_next') && 
            window.location.pathname !== '/favicon.ico'
          ) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
        // Prevent redirect loop if auth check fails repeatedly
        if (
          window.location.pathname !== '/login' && 
          window.location.pathname !== '/register' && 
          !window.location.pathname.startsWith('/_next') && 
          window.location.pathname !== '/favicon.ico'
        ) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, [router]);
  
  // Login function
  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await apiLogin(username, password);
      setUser(response.data.user);
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 