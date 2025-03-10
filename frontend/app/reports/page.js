'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('all');
  
  // Report categories
  const reportCategories = [
    { id: 'all', name: 'All' },
    { id: 'accounts', name: 'Accounts' },
    { id: 'transactions', name: 'Transactions' },
    { id: 'summary', name: 'Summary' },
  ];
  
  // Report items
  const reports = [
    {
      id: 'account-statement',
      name: 'Account Statement',
      description: 'Detailed transaction history for a specific account',
      icon: 'fa-file-lines',
      color: 'bg-blue-50 text-blue-600',
      category: 'accounts',
      path: '/reports/account-statement',
    },
    {
      id: 'income-expense',
      name: 'Income & Expense',
      description: 'Summary of income and expenses by category',
      icon: 'fa-chart-pie',
      color: 'bg-green-50 text-green-600',
      category: 'summary',
      path: '/reports/income-expense',
    },
    {
      id: 'net-worth',
      name: 'Net Worth',
      description: 'Track your net worth over time',
      icon: 'fa-chart-line',
      color: 'bg-purple-50 text-purple-600',
      category: 'summary',
      path: '/reports/net-worth',
    },
    {
      id: 'transaction-history',
      name: 'Transaction History',
      description: 'Complete history of all transactions',
      icon: 'fa-receipt',
      color: 'bg-yellow-50 text-yellow-600',
      category: 'transactions',
      path: '/reports/transaction-history',
    },
    {
      id: 'credit-card-dues',
      name: 'Credit Card Dues',
      description: 'Summary of all credit card balances',
      icon: 'fa-credit-card',
      color: 'bg-red-50 text-red-600',
      category: 'accounts',
      path: '/reports/credit-card-dues',
    },
    {
      id: 'monthly-summary',
      name: 'Monthly Summary',
      description: 'Month-by-month financial summary',
      icon: 'fa-calendar',
      color: 'bg-teal-50 text-teal-600',
      category: 'summary',
      path: '/reports/monthly-summary',
    },
  ];
  
  // Filter reports based on active tab
  const filteredReports = activeTab === 'all'
    ? reports
    : reports.filter(report => report.category === activeTab);
  
  return (
    <div className="pb-20">
      <Header title="Reports" />
      
      {/* Category tabs */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="overflow-x-auto">
          <div className="flex whitespace-nowrap p-2">
            {reportCategories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm font-medium mr-2 ${
                  activeTab === category.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => (
            <Link
              key={report.id}
              href={report.path}
              className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start">
                <div className={`rounded-full ${report.color} p-3 mr-4`}>
                  <i className={`fa-solid ${report.icon} text-lg`}></i>
                </div>
                <div>
                  <h3 className="font-medium mb-1">{report.name}</h3>
                  <p className="text-gray-500 text-sm">{report.description}</p>
                </div>
                <div className="ml-auto">
                  <i className="fa-solid fa-chevron-right text-gray-400"></i>
                </div>
              </div>
            </Link>
          ))}
          
          {filteredReports.length === 0 && (
            <div className="bg-white rounded-xl border p-8 text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-file-circle-question text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No reports found</h3>
              <p className="text-gray-500 text-sm">
                There are no reports in this category.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
} 