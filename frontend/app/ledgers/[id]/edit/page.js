'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLedger, updateLedger, getLedgerGroups } from '@/utils/api';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function EditLedgerPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [groups, setGroups] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    group_id: '',
    account_number: '',
    notes: ''
  });
  
  // Fetch ledger and groups data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch ledger and groups in parallel
        const [ledgerData, groupsData] = await Promise.all([
          getLedger(id),
          getLedgerGroups()
        ]);
        
        // Check if ledger data is valid
        if (!ledgerData || !ledgerData.data) {
          console.error('Invalid ledger data:', ledgerData);
          setError('Failed to load ledger data');
          setLoading(false);
          return;
        }
        
        const ledger = ledgerData.data;
        setLedger(ledger);
        
        // Populate form
        setFormData({
          name: ledger.name || '',
          group_id: ledger.group_id || '',
          account_number: ledger.account_number || '',
          notes: ledger.notes || ''
        });
        
        // Set groups
        if (Array.isArray(groupsData)) {
          setGroups(groupsData);
        } else if (groupsData && groupsData.data) {
          setGroups(groupsData.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Error loading account details: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Account name is required');
      return;
    }
    
    if (!formData.group_id) {
      setError('Account group is required');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      await updateLedger(id, formData);
      setSuccess('Account updated successfully');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/ledgers');
      }, 1500);
    } catch (err) {
      console.error('Error updating account:', err);
      setError(`Failed to update account: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="pb-20 bg-gray-50 min-h-screen">
        <Header title="Edit Account" showBack={true} />
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-t-4 border-blue-600 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading account data...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }
  
  if (!ledger) {
    return (
      <div className="pb-20 bg-gray-50 min-h-screen">
        <Header title="Account Not Found" showBack={true} />
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-triangle-exclamation text-red-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Account Not Found</h2>
            <p className="text-gray-500 mb-6">The account you are looking for does not exist or was deleted.</p>
            <button
              onClick={() => router.push('/ledgers')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Accounts
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header title="Edit Account" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Edit Account</h2>
            <p className="text-gray-500 text-sm">Update account details</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              <i className="fa-solid fa-circle-check mr-2"></i>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Account Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account name"
                  required
                />
              </div>
              
              {/* Account Group */}
              <div>
                <label htmlFor="group_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Group *
                </label>
                <select
                  id="group_id"
                  name="group_id"
                  value={formData.group_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.type})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Account Number */}
              <div>
                <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  id="account_number"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account number (optional)"
                />
              </div>
              
              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter notes (optional)"
                  rows="3"
                ></textarea>
              </div>
              
              {/* Current Balance - Read-only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Balance
                </label>
                <input
                  type="text"
                  value={ledger.current_balance ? `${ledger.current_balance.toLocaleString()}` : '0.00'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Balance can only be changed through transactions
                </p>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/ledgers')}
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
                    'Update Account'
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