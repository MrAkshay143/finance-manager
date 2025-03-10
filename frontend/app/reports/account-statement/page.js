'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getLedgers, getTransactionsByLedger } from '@/utils/api';
import { formatCurrency, formatDate } from '@/utils/format';

export default function AccountStatementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [ledgers, setLedgers] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [transactions, setTransactions] = useState([]);
  const [ledgerInfo, setLedgerInfo] = useState(null);
  
  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        setLoading(true);
        const ledgersData = await getLedgers();
        setLedgers(ledgersData);
        
        // Set default ledger if available
        if (ledgersData.length > 0) {
          setSelectedLedger(ledgersData[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching ledgers:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLedgers();
  }, []);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedLedger) return;
      
      try {
        setLoadingTransactions(true);
        const transactionsData = await getTransactionsByLedger(
          selectedLedger,
          100,
          0,
          dateRange.startDate,
          dateRange.endDate
        );
        
        setTransactions(transactionsData.transactions || []);
        
        // Set ledger info
        const selectedLedgerObj = ledgers.find(l => l.id.toString() === selectedLedger.toString());
        if (selectedLedgerObj) {
          setLedgerInfo({
            name: selectedLedgerObj.name,
            balance: selectedLedgerObj.current_balance,
            group: selectedLedgerObj.group_name || 'Unknown'
          });
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoadingTransactions(false);
      }
    };
    
    if (selectedLedger) {
      fetchTransactions();
    }
  }, [selectedLedger, dateRange, ledgers]);
  
  const handleLedgerChange = (e) => {
    setSelectedLedger(e.target.value);
  };
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  // Calculate totals
  const totals = transactions.reduce(
    (acc, transaction) => {
      const amount = parseFloat(transaction.amount);
      const isDebit = transaction.debit_ledger_id.toString() === selectedLedger.toString();
      const isCredit = transaction.credit_ledger_id.toString() === selectedLedger.toString();
      
      if (isDebit) {
        acc.debits += amount;
      } else if (isCredit) {
        acc.credits += amount;
      }
      
      return acc;
    },
    { debits: 0, credits: 0 }
  );
  
  return (
    <div className="pb-20">
      <Header 
        title="Account Statement" 
        backButton={true} 
        backButtonHref="/reports" 
      />
      
      <div className="p-4">
        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-4">
          <h2 className="font-semibold mb-3">Select Account</h2>
          
          <div className="mb-3">
            <select
              value={selectedLedger}
              onChange={handleLedgerChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? (
                <option>Loading ledgers...</option>
              ) : ledgers.length > 0 ? (
                ledgers.map(ledger => (
                  <option key={ledger.id} value={ledger.id}>
                    {ledger.name} ({formatCurrency(ledger.current_balance)})
                  </option>
                ))
              ) : (
                <option>No ledgers available</option>
              )}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
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
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Ledger Summary */}
        {ledgerInfo && (
          <div className="bg-white rounded-xl border p-4 mb-4">
            <h2 className="font-semibold mb-2">{ledgerInfo.name}</h2>
            <p className="text-gray-600 text-sm mb-2">Group: {ledgerInfo.group}</p>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className={`text-xl font-semibold ${ledgerInfo.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(ledgerInfo.balance)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-xl font-semibold text-blue-600">{transactions.length}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Transactions */}
        <div className="bg-white rounded-xl border overflow-hidden mb-4">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-semibold">Transaction History</h3>
          </div>
          
          {loadingTransactions ? (
            <div className="p-4">
              <div className="flex justify-center">
                <div className="w-10 h-10 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
              </div>
              <p className="text-center text-gray-600 mt-2">Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Description</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Debit</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => {
                      const isDebit = transaction.debit_ledger_id.toString() === selectedLedger.toString();
                      return (
                        <tr key={transaction.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(transaction.transaction_date)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium">{transaction.narration}</div>
                            <div className="text-xs text-gray-500">
                              {isDebit
                                ? `To: ${transaction.credit_ledger_name}`
                                : `From: ${transaction.debit_ledger_name}`}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {isDebit ? formatCurrency(transaction.amount) : ''}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {!isDebit ? formatCurrency(transaction.amount) : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 font-medium">
                    <tr>
                      <td colSpan="2" className="px-4 py-3 text-right">Total:</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totals.debits)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totals.credits)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="inline-flex rounded-full bg-gray-100 p-4 mb-4">
                <i className="fa-solid fa-receipt text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No Transactions Found</h3>
              <p className="text-gray-500 text-sm mb-4">
                There are no transactions for this account in the selected date range.
              </p>
              <button
                onClick={() => router.push('/transactions/new/payment')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Create New Transaction
              </button>
            </div>
          )}
        </div>
        
        {/* Export Button */}
        {transactions.length > 0 && (
          <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-file-export mr-2"></i>
            Export Statement
          </button>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
} 