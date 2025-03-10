'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getMonthlySummary } from '@/utils/api';
import { formatCurrency, formatDate } from '@/utils/format';

export default function MonthlySummaryPage() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    months: [],
    incomeTrend: [],
    expenseTrend: [],
    savingsTrend: []
  });
  const [period, setPeriod] = useState('6m');
  const [displayMode, setDisplayMode] = useState('chart');
  
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        const data = await getMonthlySummary(period);
        setSummaryData(data);
      } catch (err) {
        console.error('Error fetching monthly summary:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummaryData();
  }, [period]);
  
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };
  
  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
  };
  
  // Calculate highest value for chart scaling
  const maxValue = Math.max(
    ...summaryData.incomeTrend,
    ...summaryData.expenseTrend,
    100 // Minimum scale
  );
  
  // Get current month data
  const currentMonthData = summaryData.months.length > 0 
    ? summaryData.months[summaryData.months.length - 1] 
    : null;
  
  // Calculate savings rate
  const calculateSavingsRate = (income, expenses) => {
    if (!income || income === 0) return 0;
    return ((income - expenses) / income) * 100;
  };
  
  return (
    <div className="pb-20">
      <Header 
        title="Monthly Summary" 
        backButton={true} 
        backButtonHref="/reports" 
      />
      
      <div className="p-4">
        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-4">
          <div className="flex flex-col space-y-3">
            <div>
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Mode
              </label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleDisplayModeChange('chart')}
                  className={`flex-1 py-2 text-center ${
                    displayMode === 'chart' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <i className="fa-solid fa-chart-bar mr-1"></i>
                  Chart
                </button>
                <button
                  onClick={() => handleDisplayModeChange('table')}
                  className={`flex-1 py-2 text-center ${
                    displayMode === 'table' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <i className="fa-solid fa-table-list mr-1"></i>
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Current Month Summary */}
        {currentMonthData && (
          <div className="bg-white rounded-xl border p-4 mb-4">
            <h2 className="font-semibold mb-3">
              {currentMonthData.month ? formatDate(currentMonthData.month, 'MMMM yyyy') : 'Current Month'}
            </h2>
            
            {loading ? (
              <div className="animate-pulse">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Income</p>
                    <p className="text-xl font-semibold text-green-600">
                      {formatCurrency(currentMonthData.income)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expenses</p>
                    <p className="text-xl font-semibold text-red-600">
                      {formatCurrency(currentMonthData.expenses)}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-3 mb-2">
                  <p className="text-sm text-gray-600">Savings</p>
                  <p className="text-xl font-semibold text-blue-600">
                    {formatCurrency(currentMonthData.income - currentMonthData.expenses)}
                  </p>
                </div>
                
                <p className="text-sm text-gray-600">
                  Savings Rate: 
                  <span className="font-medium ml-1">
                    {calculateSavingsRate(currentMonthData.income, currentMonthData.expenses).toFixed(1)}%
                  </span>
                </p>
              </>
            )}
          </div>
        )}
        
        {/* Chart or Table View */}
        {displayMode === 'chart' ? (
          // Chart View
          <div className="bg-white rounded-xl border overflow-hidden mb-4">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-semibold">Monthly Trends</h3>
            </div>
            
            {loading ? (
              <div className="p-4 animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ) : summaryData.months.length > 0 ? (
              <div className="p-4">
                <div className="h-64 flex items-end">
                  {summaryData.months.map((month, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                      title={`${formatDate(month.month, 'MMM yyyy')}`}
                    >
                      {/* Savings (Income - Expenses) */}
                      <div 
                        className="w-full border-l border-r border-t border-blue-300 bg-blue-200"
                        style={{ 
                          height: `${Math.max(
                            ((month.income - month.expenses) / maxValue) * 100, 
                            0
                          )}%` 
                        }}
                      ></div>
                      
                      {/* Expenses */}
                      <div 
                        className="w-full bg-red-500"
                        style={{ height: `${(month.expenses / maxValue) * 100}%` }}
                      ></div>
                      
                      {/* Month label */}
                      <div className="text-xs text-gray-600 mt-2 whitespace-nowrap overflow-hidden text-ellipsis" style={{ maxWidth: '100%' }}>
                        {formatDate(month.month, 'MMM')}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="mt-4 flex justify-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 mr-1"></div>
                    <span className="text-xs text-gray-600">Expenses</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-200 border border-blue-300 mr-1"></div>
                    <span className="text-xs text-gray-600">Savings</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No monthly data available for this period.</p>
              </div>
            )}
          </div>
        ) : (
          // Table View
          <div className="bg-white rounded-xl border overflow-hidden mb-4">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-semibold">Monthly Summary</h3>
            </div>
            
            {loading ? (
              <div className="p-4 animate-pulse space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="grid grid-cols-4 gap-2">
                    <div className="h-5 bg-gray-200 rounded"></div>
                    <div className="h-5 bg-gray-200 rounded"></div>
                    <div className="h-5 bg-gray-200 rounded"></div>
                    <div className="h-5 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : summaryData.months.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Month</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Income</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Expenses</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Savings</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.months.map((month, index) => {
                      const savings = month.income - month.expenses;
                      const savingsRate = calculateSavingsRate(month.income, month.expenses);
                      
                      return (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatDate(month.month, 'MMMM yyyy')}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-green-600">
                            {formatCurrency(month.income)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-red-600">
                            {formatCurrency(month.expenses)}
                          </td>
                          <td className={`px-4 py-3 text-sm text-right ${savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(savings)}
                          </td>
                          <td className={`px-4 py-3 text-sm text-right ${savingsRate >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {savingsRate.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No monthly data available for this period.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Insight Cards */}
        {!loading && summaryData.months.length > 1 && (
          <div className="grid grid-cols-1 gap-4 mb-4">
            {/* Income Trend */}
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-green-100 text-green-600 p-2 mr-2">
                  <i className="fa-solid fa-arrow-trend-up"></i>
                </div>
                <h3 className="font-semibold">Income Trend</h3>
              </div>
              
              {getSummaryStats(summaryData.incomeTrend).isIncreasing ? (
                <p className="text-sm text-gray-600">
                  Your income has <span className="text-green-600 font-medium">increased</span> by{' '}
                  <span className="font-medium">{getSummaryStats(summaryData.incomeTrend).changePercent.toFixed(1)}%</span>{' '}
                  compared to the beginning of this period.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Your income has <span className="text-red-600 font-medium">decreased</span> by{' '}
                  <span className="font-medium">{Math.abs(getSummaryStats(summaryData.incomeTrend).changePercent).toFixed(1)}%</span>{' '}
                  compared to the beginning of this period.
                </p>
              )}
            </div>
            
            {/* Expenses Trend */}
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-red-100 text-red-600 p-2 mr-2">
                  <i className="fa-solid fa-arrow-trend-down"></i>
                </div>
                <h3 className="font-semibold">Expenses Trend</h3>
              </div>
              
              {getSummaryStats(summaryData.expenseTrend).isIncreasing ? (
                <p className="text-sm text-gray-600">
                  Your expenses have <span className="text-red-600 font-medium">increased</span> by{' '}
                  <span className="font-medium">{getSummaryStats(summaryData.expenseTrend).changePercent.toFixed(1)}%</span>{' '}
                  compared to the beginning of this period.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Your expenses have <span className="text-green-600 font-medium">decreased</span> by{' '}
                  <span className="font-medium">{Math.abs(getSummaryStats(summaryData.expenseTrend).changePercent).toFixed(1)}%</span>{' '}
                  compared to the beginning of this period.
                </p>
              )}
            </div>
            
            {/* Savings Trend */}
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-blue-100 text-blue-600 p-2 mr-2">
                  <i className="fa-solid fa-piggy-bank"></i>
                </div>
                <h3 className="font-semibold">Savings Trend</h3>
              </div>
              
              {getSummaryStats(summaryData.savingsTrend).isIncreasing ? (
                <p className="text-sm text-gray-600">
                  Your savings rate has <span className="text-green-600 font-medium">improved</span> by{' '}
                  <span className="font-medium">{getSummaryStats(summaryData.savingsTrend).changePercent.toFixed(1)}%</span>{' '}
                  compared to the beginning of this period.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Your savings rate has <span className="text-red-600 font-medium">decreased</span> by{' '}
                  <span className="font-medium">{Math.abs(getSummaryStats(summaryData.savingsTrend).changePercent).toFixed(1)}%</span>{' '}
                  compared to the beginning of this period.
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Export Button */}
        {summaryData.months.length > 0 && (
          <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-file-export mr-2"></i>
            Export Report
          </button>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}

// Helper function to calculate trend statistics
function getSummaryStats(data) {
  if (!data || data.length < 2) {
    return { isIncreasing: false, changePercent: 0 };
  }
  
  const first = data[0];
  const last = data[data.length - 1];
  
  // Avoid division by zero
  if (first === 0) {
    return { isIncreasing: last > 0, changePercent: last > 0 ? 100 : 0 };
  }
  
  const change = ((last - first) / Math.abs(first)) * 100;
  
  return {
    isIncreasing: last > first,
    changePercent: change
  };
} 