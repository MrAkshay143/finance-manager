'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';

export default function MetricCard({ 
  title, 
  value, 
  previousValue = null, 
  icon, 
  accentColor = 'blue', 
  loading = false,
  showPercentage = true,
  isCurrency = true
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [changePercentage, setChangePercentage] = useState(0);
  const [isPositiveChange, setIsPositiveChange] = useState(true);
  
  // Map color names to Tailwind classes
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    red: 'bg-red-100 text-red-600 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    pink: 'bg-pink-100 text-pink-600 border-pink-200',
    indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    teal: 'bg-teal-100 text-teal-600 border-teal-200',
  };
  
  // Gradient background for the card
  const gradientMap = {
    blue: 'from-blue-50 to-white',
    green: 'from-green-50 to-white',
    red: 'from-red-50 to-white',
    yellow: 'from-yellow-50 to-white',
    purple: 'from-purple-50 to-white',
    pink: 'from-pink-50 to-white',
    indigo: 'from-indigo-50 to-white',
    teal: 'from-teal-50 to-white',
  };
  
  // Calculate percentage change if previous value exists
  useEffect(() => {
    if (previousValue !== null && previousValue !== 0 && value !== null) {
      const change = value - previousValue;
      const percentage = (change / Math.abs(previousValue)) * 100;
      
      setChangePercentage(Math.abs(parseFloat(percentage.toFixed(1))));
      setIsPositiveChange(change >= 0);
    } else {
      setChangePercentage(0);
    }
  }, [value, previousValue]);
  
  // Animate the value count
  useEffect(() => {
    if (value !== null && !loading) {
      const duration = 1000; // Animation duration in milliseconds
      const frameDuration = 1000 / 60; // 60fps
      const totalFrames = Math.round(duration / frameDuration);
      const valueIncrement = (value - animatedValue) / totalFrames;
      
      let currentFrame = 0;
      const timer = setInterval(() => {
        currentFrame++;
        setAnimatedValue(prevValue => {
          const newValue = prevValue + valueIncrement;
          
          if (currentFrame === totalFrames) {
            return value;
          }
          
          return newValue;
        });
        
        if (currentFrame === totalFrames) {
          clearInterval(timer);
        }
      }, frameDuration);
      
      return () => clearInterval(timer);
    }
  }, [value, loading]);
  
  return (
    <div className={`rounded-xl p-4 border bg-gradient-to-br ${gradientMap[accentColor]} animate-fade-in shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
          
          {loading ? (
            <div className="h-7 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-2xl font-bold">
              {isCurrency ? formatCurrency(animatedValue) : animatedValue}
            </p>
          )}
          
          {showPercentage && previousValue !== null && !loading && (
            <p className={`text-xs mt-1 ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
              <i className={`fa-solid ${isPositiveChange ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
              {changePercentage}% from last month
            </p>
          )}
        </div>
        
        <div className={`rounded-full p-2 ${colorMap[accentColor]}`}>
          <i className={`fa-solid ${icon} text-lg`}></i>
        </div>
      </div>
    </div>
  );
} 