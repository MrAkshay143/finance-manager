'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLedgerGroup, updateLedgerGroup } from '@/utils/api';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function EditLedgerGroupPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [group, setGroup] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getLedgerGroup(id);
        
        if (response && response.data) {
          setGroup(response.data);
          setFormData({
            name: response.data.name || '',
            type: response.data.type || '',
            description: response.data.description || ''
          });
        } else {
          setError('Failed to fetch ledger group data');
        }
      } catch (err) {
        console.error('Error fetching ledger group:', err);
        setError(`Error loading ledger group: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      setError('Name and type are required');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      const response = await updateLedgerGroup(id, formData);
      
      if (response && (response.success || response.data)) {
        setSuccess('Ledger group updated successfully');
        // Update local data
        setGroup(response.data || response);
        
        // Navigate back after a delay
        setTimeout(() => {
          router.push('/ledgers');
        }, 1500);
      } else {
        setError('Failed to update ledger group');
      }
    } catch (err) {
      console.error('Error updating ledger group:', err);
      setError(`Failed to update ledger group: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="pb-20 bg-gray-50 min-h-screen">
        <Header title="Edit Ledger Group" showBack={true} />
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-t-4 border-blue-600 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ledger group data...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }
  
  if (!group) {
    return (
      <div className="pb-20 bg-gray-50 min-h-screen">
        <Header title="Group Not Found" showBack={true} />
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-triangle-exclamation text-red-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ledger Group Not Found</h2>
            <p className="text-gray-500 mb-6">The ledger group you are looking for does not exist or was deleted.</p>
            <button
              onClick={() => router.push('/ledgers')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Ledgers
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header title="Edit Ledger Group" showBack={true} />
      
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Edit Ledger Group</h2>
            <p className="text-gray-500 text-sm">Update the ledger group details</p>
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
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter group name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select group type</option>
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                  <option value="equity">Equity</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="loan">Loan</option>
                  <option value="investment">Investment</option>
                </select>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/ledgers')}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={submitting}
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
                    'Update Group'
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