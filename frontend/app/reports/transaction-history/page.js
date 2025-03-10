'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getAllTransactions } from '@/utils/api';
import { formatCurrency, formatDate } from '@/utils/format';

export default function TransactionHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0
  });
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const offset = (pagination.page - 1) * pagination.limit;
        
        const response = await getAllTransactions(
          pagination.limit,
          offset,
          filter.startDate,
          filter.endDate,
          filter.type === 'all' ? null : filter.type
        );
        
        setTransactions(response.data.transactions || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }));
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [filter.startDate, filter.endDate, filter.type, pagination.page, pagination.limit]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
    
    // Reset to page 1 when filter changes
    if (name !== 'search') {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Here you would implement searching logic
    console.log('Searching for:', filter.search);
  };
  
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Filter transactions by search term
  const filteredTransactions = transactions.filter(transaction => {
    if (!filter.search) return true;
    
    const searchLower = filter.search.toLowerCase();
    return (
      transaction.narration?.toLowerCase().includes(searchLower) ||
      transaction.debit_ledger_name?.toLowerCase().includes(searchLower) ||
      transaction.credit_ledger_name?.toLowerCase().includes(searchLower) ||
      formatCurrency(transaction.amount).includes(filter.search)
    );
  });
  
  // Calculate total pages
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  return (
    <div className="pb-20">
      <Header 
        title="Transaction History" 
        backButton={true} 
        backButtonHref="/reports" 
      />
      
      <div className="p-4">
        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filter.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filter.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <select
              id="type"
              name="type"
              value={filter.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="payment">Payments</option>
              <option value="receipt">Receipts</option>
              <option value="transfer">Transfers</option>
              <option value="journal">Journal Entries</option>
            </select>
          </div>
          
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              placeholder="Search transactions..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
            >
              <i className="fa-solid fa-search"></i>
            </button>
          </form>
        </div>
        
        {/* Transaction Count */}
        <div className="bg-gray-200 rounded-lg p-3 text-center mb-4">
          <span className="text-gray-700">
            {loading ? 'Loading...' : `Showing ${filteredTransactions.length} of ${pagination.total} transactions`}
          </span>
        </div>
        
        {/* Transactions Table */}
        <div className="bg-white rounded-xl border overflow-hidden mb-4">
          {loading ? (
            <div className="p-4">
              <div className="flex justify-center">
                <div className="w-10 h-10 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
              </div>
              <p className="text-center text-gray-600 mt-2">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Description</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Amount</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(transaction.transaction_date)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{transaction.narration}</div>
                        <div className="text-xs text-gray-500">
                          {transaction.debit_ledger_name} → {transaction.credit_ledger_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium whitespace-nowrap">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="inline-flex rounded-full bg-gray-100 p-4 mb-4">
                <i className="fa-solid fa-file-circle-question text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No Transactions Found</h3>
              <p className="text-gray-500 text-sm mb-4">
                Try adjusting your filters or search criteria.
              </p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center bg-white rounded-xl border p-3 mb-4">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className={`px-3 py-1 rounded ${
                pagination.page <= 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <i className="fa-solid fa-chevron-left mr-1"></i>
              Previous
            </button>
            
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {totalPages}
            </div>
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, pagination.page + 1))}
              disabled={pagination.page >= totalPages}
              className={`px-3 py-1 rounded ${
                pagination.page >= totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
              <i className="fa-solid fa-chevron-right ml-1"></i>
            </button>
          </div>
        )}
        
        {/* Export Button */}
        <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg flex items-center justify-center">
          <i className="fa-solid fa-file-export mr-2"></i>
          Export Transactions
        </button>
      </div>
      
      <BottomNav />
    </div>
  );
}

// Helper function to get color based on transaction type
function getTypeColor(type) {
  switch (type?.toLowerCase()) {
    case 'payment':
      return 'bg-red-100 text-red-700';
    case 'receipt':
      return 'bg-green-100 text-green-700';
    case 'transfer':
      return 'bg-blue-100 text-blue-700';
    case 'journal':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
} 