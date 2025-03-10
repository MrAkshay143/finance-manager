'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import TransactionItem from '@/components/TransactionItem';
import { getAllTransactions } from '@/utils/api';
import { formatDate } from '@/utils/format';
import Link from 'next/link';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0], // Today
  });
  
  // Function to get all transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Use the API function to get transactions with date filter
      const response = await getAllTransactions(100, 0, dateFilter.startDate, dateFilter.endDate);
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTransactions();
  }, [dateFilter]);
  
  // Handle date filter changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle transaction deletion
  const handleDeleteTransaction = (id) => {
    // Remove transaction from state to update UI immediately
    setTransactions(prevTransactions => 
      prevTransactions.filter(transaction => transaction.id !== id)
    );
  };
  
  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.transaction_date.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));
  
  return (
    <div className="pb-20">
      <Header title="Transactions" />
      
      {/* Date filter */}
      <div className="bg-white border-b p-3 sticky top-16 z-30">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-2">
            <label htmlFor="startDate" className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateFilter.startDate}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="endDate" className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateFilter.endDate}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          // Loading skeleton
          Array(5).fill().map((_, i) => (
            <div key={i} className="animate-pulse mb-4">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="bg-white rounded-xl border overflow-hidden">
                {Array(3).fill().map((_, j) => (
                  <div key={j} className="flex p-3 border-b">
                    <div className="rounded-full bg-gray-200 h-10 w-10 mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : sortedDates.length > 0 ? (
          // Transactions grouped by date
          sortedDates.map(date => (
            <div key={date} className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">
                {formatDate(date, 'full')}
              </h3>
              <div className="bg-white rounded-xl border overflow-hidden">
                {groupedTransactions[date].map(transaction => (
                  <TransactionItem 
                    key={transaction.id} 
                    transaction={transaction} 
                    showDate={false}
                    onDelete={handleDeleteTransaction}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Empty state
          <div className="bg-white rounded-xl border p-8 text-center">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-receipt text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No transactions found</h3>
            <p className="text-gray-500 text-sm mb-4">
              There are no transactions in the selected date range.
            </p>
            <Link href="/transactions/new/payment">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Add Transaction
              </button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Floating action button for adding new transaction */}
      <div className="fixed bottom-24 right-4">
        <div className="relative group">
          <button 
            onClick={() => router.push('/transactions/new/payment')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
          >
            <i className="fa-solid fa-plus text-xl"></i>
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              Add Transaction
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
} 