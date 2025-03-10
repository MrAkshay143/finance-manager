'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getIncomeExpenseReport } from '@/utils/api';
import { formatCurrency } from '@/utils/format';

export default function IncomeExpensePage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    income: [],
    expenses: [],
    totals: { totalIncome: 0, totalExpenses: 0 }
  });
  const [period, setPeriod] = useState('month');
  const [displayMode, setDisplayMode] = useState('chart');
  
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const data = await getIncomeExpenseReport(period);
        setReportData(data);
      } catch (err) {
        console.error('Error fetching income/expense report:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [period]);
  
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };
  
  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
  };
  
  return (
    <div className="pb-20">
      <Header 
        title="Income & Expense" 
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
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="last-month">Last Month</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="last-year">Last Year</option>
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
                  <i className="fa-solid fa-chart-pie mr-1"></i>
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
        
        {/* Summary */}
        <div className="bg-white rounded-xl border p-4 mb-4">
          <h2 className="font-semibold mb-3">Summary</h2>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="text-xl font-semibold text-green-600">
                    {formatCurrency(reportData.totals.totalIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-xl font-semibold text-red-600">
                    {formatCurrency(reportData.totals.totalExpenses)}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600">Net Income</p>
                <p className={`text-xl font-semibold ${reportData.totals.totalIncome - reportData.totals.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(reportData.totals.totalIncome - reportData.totals.totalExpenses)}
                </p>
              </div>
            </>
          )}
        </div>
        
        {/* Charts or Tables */}
        {displayMode === 'chart' ? (
          // Chart View
          <div className="space-y-4">
            {/* Income Chart */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="p-3 border-b bg-green-50">
                <h3 className="font-semibold text-green-700">Income</h3>
              </div>
              
              {loading ? (
                <div className="p-4 animate-pulse">
                  <div className="h-40 bg-gray-200 rounded"></div>
                </div>
              ) : reportData.income.length > 0 ? (
                <div className="p-4">
                  <div className="h-40 flex items-end">
                    {reportData.income.map((item, index) => {
                      const percentage = (item.amount / reportData.totals.totalIncome) * 100;
                      return (
                        <div 
                          key={index} 
                          className="flex-1 flex flex-col items-center"
                          title={`${item.name}: ${formatCurrency(item.amount)}`}
                        >
                          <div 
                            className="w-full bg-green-500 rounded-t"
                            style={{ height: `${Math.max(percentage, 5)}%` }}
                          ></div>
                          <p className="text-xs text-gray-600 mt-2 truncate w-full text-center">
                            {item.name}
                          </p>
                          <p className="text-xs font-medium">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No income data available for this period.</p>
                </div>
              )}
            </div>
            
            {/* Expense Chart */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="p-3 border-b bg-red-50">
                <h3 className="font-semibold text-red-700">Expenses</h3>
              </div>
              
              {loading ? (
                <div className="p-4 animate-pulse">
                  <div className="h-40 bg-gray-200 rounded"></div>
                </div>
              ) : reportData.expenses.length > 0 ? (
                <div className="p-4">
                  <div className="h-40 flex items-end">
                    {reportData.expenses.map((item, index) => {
                      const percentage = (item.amount / reportData.totals.totalExpenses) * 100;
                      return (
                        <div 
                          key={index} 
                          className="flex-1 flex flex-col items-center"
                          title={`${item.name}: ${formatCurrency(item.amount)}`}
                        >
                          <div 
                            className="w-full bg-red-500 rounded-t"
                            style={{ height: `${Math.max(percentage, 5)}%` }}
                          ></div>
                          <p className="text-xs text-gray-600 mt-2 truncate w-full text-center">
                            {item.name}
                          </p>
                          <p className="text-xs font-medium">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No expense data available for this period.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Table View
          <div className="space-y-4">
            {/* Income Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="p-3 border-b bg-green-50">
                <h3 className="font-semibold text-green-700">Income</h3>
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
              ) : reportData.income.length > 0 ? (
                <div className="divide-y">
                  {reportData.income.map((item, index) => (
                    <div key={index} className="flex justify-between p-3">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-green-600">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between p-3 bg-gray-50 font-semibold">
                    <span>Total Income</span>
                    <span className="text-green-600">{formatCurrency(reportData.totals.totalIncome)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No income data available for this period.</p>
                </div>
              )}
            </div>
            
            {/* Expense Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="p-3 border-b bg-red-50">
                <h3 className="font-semibold text-red-700">Expenses</h3>
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
              ) : reportData.expenses.length > 0 ? (
                <div className="divide-y">
                  {reportData.expenses.map((item, index) => (
                    <div key={index} className="flex justify-between p-3">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-red-600">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between p-3 bg-gray-50 font-semibold">
                    <span>Total Expenses</span>
                    <span className="text-red-600">{formatCurrency(reportData.totals.totalExpenses)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No expense data available for this period.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Export Button */}
        <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg flex items-center justify-center mt-4">
          <i className="fa-solid fa-file-export mr-2"></i>
          Export Report
        </button>
      </div>
      
      <BottomNav />
    </div>
  );
} 