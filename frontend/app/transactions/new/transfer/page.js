'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTransaction, getLedgers } from '@/utils/api';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function TransferTransactionPage() {
  const router = useRouter();
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_type: 'Contra',
    amount: '',
    narration: '',
    debit_ledger_id: '',
    credit_ledger_id: '',
    reference_number: ''
  });
  
  // Get all ledgers on mount
  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        setLoading(true);
        const response = await getLedgers();
        if (response && response.data) {
          setLedgers(response.data);
        }
      } catch (err) {
        console.error('Error fetching ledgers:', err);
        setError('Failed to load ledgers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLedgers();
  }, []);
  
  // Filter ledgers by type (bank and cash accounts for transfers)
  const bankCashLedgers = ledgers.filter(ledger => 
    ledger.group_type === 'bank' || ledger.group_type === 'cash'
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
      setError('Amount, from account, and to account are required');
      return;
    }
    
    if (formData.debit_ledger_id === formData.credit_ledger_id) {
      setError('From and to accounts cannot be the same');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const response = await createTransaction(formData);
      
      if (response && response.success) {
        router.push('/transactions');
      } else {
        setError(response?.message || 'Failed to create transaction');
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError('An error occurred while creating the transaction');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header title="New Transfer" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Transfer Transaction</h2>
            <p className="text-gray-500 text-sm">Move money between your accounts</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                <select
                  name="credit_ledger_id"
                  value={formData.credit_ledger_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select account</option>
                  {bankCashLedgers.map(ledger => (
                    <option key={ledger.id} value={ledger.id}>
                      {ledger.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* To Account (Debit) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                <select
                  name="debit_ledger_id"
                  value={formData.debit_ledger_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select account</option>
                  {bankCashLedgers.map(ledger => (
                    <option key={ledger.id} value={ledger.id}>
                      {ledger.name}
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
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    'Save Transfer'
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