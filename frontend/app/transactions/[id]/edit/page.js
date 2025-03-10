'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTransaction, updateTransaction, getLedgers } from '@/utils/api';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function EditTransactionPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState(null);
  
  const [formData, setFormData] = useState({
    transaction_date: '',
    transaction_type: '',
    amount: '',
    narration: '',
    debit_ledger_id: '',
    credit_ledger_id: '',
    reference_number: ''
  });
  
  // Get transaction data and ledgers on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch transaction and ledgers in parallel
        const [transactionResponse, ledgersData] = await Promise.all([
          getTransaction(id),
          getLedgers()
        ]);
        
        // Check if transaction data is valid
        if (!transactionResponse || (!transactionResponse.data && !transactionResponse.transaction_date)) {
          console.error('Invalid transaction data:', transactionResponse);
          setError('Failed to load transaction data');
          setLoading(false);
          return;
        }
        
        // Extract transaction data from response
        const transactionData = transactionResponse.data || transactionResponse;
        
        // Set transaction data
        setTransaction(transactionData);
        
        // Populate form with transaction data
        setFormData({
          transaction_date: transactionData.transaction_date ? transactionData.transaction_date.split('T')[0] : '',
          transaction_type: transactionData.transaction_type || '',
          amount: transactionData.amount || '',
          narration: transactionData.narration || '',
          debit_ledger_id: transactionData.debit_ledger_id || '',
          credit_ledger_id: transactionData.credit_ledger_id || '',
          reference_number: transactionData.reference_number || ''
        });
        
        // Set ledgers
        if (Array.isArray(ledgersData)) {
          setLedgers(ledgersData);
        } else if (ledgersData && ledgersData.data) {
          setLedgers(ledgersData.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Error loading transaction: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Filter ledgers by type
  const allLedgers = ledgers;
  const bankCashLedgers = ledgers.filter(ledger => 
    ledger.group_type === 'bank' || ledger.group_type === 'cash'
  );
  const expenseLedgers = ledgers.filter(ledger => 
    ledger.group_type === 'expense'
  );
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.debit_ledger_id || !formData.credit_ledger_id) {
      setError('Amount, debit account, and credit account are required');
      return;
    }
    
    if (formData.debit_ledger_id === formData.credit_ledger_id) {
      setError('Debit and credit accounts cannot be the same');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Log the data being sent
      console.log('Transaction update data:', formData);
      
      const response = await updateTransaction(id, formData);
      
      if (response && (response.success || response.id)) {
        router.push('/transactions');
      } else {
        let errorMsg = 'Failed to update transaction';
        if (response && response.message) {
          errorMsg += `: ${response.message}`;
        } else if (response && response.error) {
          errorMsg += `: ${response.error}`;
        }
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(`Failed to update transaction: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="pb-20 bg-gray-50 min-h-screen">
        <Header title="Edit Transaction" showBack={true} />
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-t-4 border-blue-600 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transaction data...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }
  
  if (!transaction) {
    return (
      <div className="pb-20 bg-gray-50 min-h-screen">
        <Header title="Transaction Not Found" showBack={true} />
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-triangle-exclamation text-red-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Transaction Not Found</h2>
            <p className="text-gray-500 mb-6">The transaction you are looking for does not exist or was deleted.</p>
            <button
              onClick={() => router.push('/transactions')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Transactions
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header title="Edit Transaction" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Edit {formData.transaction_type} Transaction</h2>
            <p className="text-gray-500 text-sm">Update transaction details</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="transaction_date"
                  value={formData.transaction_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              {/* Transaction Type - Read-only because changing type needs different form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <input
                  type="text"
                  value={formData.transaction_type}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Transaction type cannot be changed</p>
              </div>
              
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
              
              {/* From Account (Credit) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Account (Credit)</label>
                <select
                  name="credit_ledger_id"
                  value={formData.credit_ledger_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select account</option>
                  {allLedgers.map(ledger => (
                    <option key={ledger.id} value={ledger.id}>
                      {ledger.name} {ledger.group_type ? `(${ledger.group_type})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* To Account (Debit) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Account (Debit)</label>
                <select
                  name="debit_ledger_id"
                  value={formData.debit_ledger_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select account</option>
                  {allLedgers.map(ledger => (
                    <option key={ledger.id} value={ledger.id}>
                      {ledger.name} {ledger.group_type ? `(${ledger.group_type})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="narration"
                  value={formData.narration}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>
              
              {/* Reference Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input
                  type="text"
                  name="reference_number"
                  value={formData.reference_number}
                  onChange={handleChange}
                  placeholder="Enter reference number (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Submit Button */}
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/transactions')}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                      Updating...
                    </>
                  ) : (
                    'Update Transaction'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
} 