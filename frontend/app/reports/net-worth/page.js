'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getNetWorthHistory } from '@/utils/api';
import { formatCurrency, formatDate } from '@/utils/format';

export default function NetWorthPage() {
  const [loading, setLoading] = useState(true);
  const [netWorthData, setNetWorthData] = useState({
    currentNetWorth: 0,
    history: [],
    assets: [],
    liabilities: []
  });
  const [period, setPeriod] = useState('6m');
  
  useEffect(() => {
    const fetchNetWorthData = async () => {
      try {
        setLoading(true);
        const data = await getNetWorthHistory(period);
        setNetWorthData(data);
      } catch (err) {
        console.error('Error fetching net worth data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNetWorthData();
  }, [period]);
  
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };
  
  // Calculate change from previous period
  const calculateChange = () => {
    if (netWorthData.history.length < 2) return { amount: 0, percentage: 0 };
    
    const current = netWorthData.history[netWorthData.history.length - 1].value;
    const previous = netWorthData.history[netWorthData.history.length - 2].value;
    const change = current - previous;
    const percentageChange = previous !== 0 ? (change / Math.abs(previous)) * 100 : 0;
    
    return { 
      amount: change, 
      percentage: percentageChange
    };
  };
  
  const change = calculateChange();
  
  // Find max value for chart scaling
  const maxValue = Math.max(
    ...netWorthData.history.map(point => Math.abs(point.value)),
    100  // Minimum scale to avoid division by zero
  );
  
  return (
    <div className="pb-20">
      <Header 
        title="Net Worth" 
        backButton={true} 
        backButtonHref="/reports" 
      />
      
      <div className="p-4">
        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-4">
          <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
            Time Period
          </label>
          <select
            id="period"
            value={period}
            onChange={handlePeriodChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last 1 Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        {/* Current Net Worth */}
        <div className="bg-white rounded-xl border p-4 mb-4">
          <h2 className="text-sm text-gray-600 mb-1">Current Net Worth</h2>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ) : (
            <>
              <p className={`text-2xl font-bold ${netWorthData.currentNetWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netWorthData.currentNetWorth)}
              </p>
              
              <div className={`flex items-center mt-1 ${change.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <i className={`fa-solid ${change.amount >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1 text-xs`}></i>
                <span className="text-sm font-medium">
                  {formatCurrency(Math.abs(change.amount))} ({Math.abs(change.percentage).toFixed(1)}%)
                </span>
                <span className="text-xs text-gray-500 ml-1">from previous period</span>
              </div>
            </>
          )}
        </div>
        
        {/* Net Worth Chart */}
        <div className="bg-white rounded-xl border overflow-hidden mb-4">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-semibold">Net Worth Trend</h3>
          </div>
          
          {loading ? (
            <div className="p-4 animate-pulse">
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          ) : netWorthData.history.length > 0 ? (
            <div className="p-4">
              <div className="h-40 flex items-end relative">
                {/* Zero line */}
                <div 
                  className="absolute h-px w-full bg-gray-300"
                  style={{ 
                    bottom: `${(0 - (netWorthData.history[0].value < 0 ? -maxValue : 0)) / (maxValue * 2) * 100}%` 
                  }}
                ></div>
                
                {netWorthData.history.map((point, index) => {
                  // Calculate height percentage (scaled from -maxValue to +maxValue)
                  const heightPercentage = ((point.value + maxValue) / (maxValue * 2)) * 100;
                  const isPositive = point.value >= 0;
                  
                  return (
                    <div 
                      key={index} 
                      className="flex-1 flex flex-col items-center justify-end h-full"
                      title={`${formatDate(point.date)}: ${formatCurrency(point.value)}`}
                    >
                      <div 
                        className={`w-full ${isPositive ? 'bg-green-500' : 'bg-red-500'} ${isPositive ? 'rounded-t' : 'rounded-b'}`}
                        style={{ height: `${Math.max(Math.abs(heightPercentage - 50), 2)}%` }}
                      ></div>
                      
                      {index % Math.ceil(netWorthData.history.length / 5) === 0 && (
                        <div className="text-xs text-gray-500 mt-2 -mb-5 transform -rotate-45 origin-top-left">
                          {formatDate(point.date, 'MMM yyyy')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No net worth history available for this period.</p>
            </div>
          )}
        </div>
        
        {/* Assets & Liabilities */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Assets */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="p-3 border-b bg-green-50">
              <h3 className="font-semibold text-green-700">Assets</h3>
            </div>
            
            {loading ? (
              <div className="p-4 animate-pulse space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : netWorthData.assets.length > 0 ? (
              <div className="divide-y">
                {netWorthData.assets.map((asset, index) => (
                  <div key={index} className="flex justify-between p-3">
                    <span className="font-medium">{asset.name}</span>
                    <span className="text-green-600">{formatCurrency(asset.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between p-3 bg-gray-50 font-semibold">
                  <span>Total Assets</span>
                  <span className="text-green-600">
                    {formatCurrency(
                      netWorthData.assets.reduce((sum, asset) => sum + asset.value, 0)
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No assets data available.</p>
              </div>
            )}
          </div>
          
          {/* Liabilities */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="p-3 border-b bg-red-50">
              <h3 className="font-semibold text-red-700">Liabilities</h3>
            </div>
            
            {loading ? (
              <div className="p-4 animate-pulse space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : netWorthData.liabilities.length > 0 ? (
              <div className="divide-y">
                {netWorthData.liabilities.map((liability, index) => (
                  <div key={index} className="flex justify-between p-3">
                    <span className="font-medium">{liability.name}</span>
                    <span className="text-red-600">{formatCurrency(Math.abs(liability.value))}</span>
                  </div>
                ))}
                <div className="flex justify-between p-3 bg-gray-50 font-semibold">
                  <span>Total Liabilities</span>
                  <span className="text-red-600">
                    {formatCurrency(
                      Math.abs(netWorthData.liabilities.reduce((sum, liability) => sum + liability.value, 0))
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No liabilities data available.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Export Button */}
        <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg flex items-center justify-center">
          <i className="fa-solid fa-file-export mr-2"></i>
          Export Report
        </button>
      </div>
      
      <BottomNav />
    </div>
  );
} 