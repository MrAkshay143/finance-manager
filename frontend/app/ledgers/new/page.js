'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { createLedger, getLedgerGroups } from '@/utils/api';
import Link from 'next/link';

export default function NewLedgerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    group_id: '',
    opening_balance: 0,
    account_number: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const groupsData = await getLedgerGroups();
        setGroups(groupsData);
        
        // Set default group if available
        if (groupsData.length > 0) {
          setFormData(prev => ({ ...prev, group_id: groupsData[0].id }));
        }
      } catch (err) {
        console.error('Error fetching ledger groups:', err);
      } finally {
        setLoadingGroups(false);
      }
    };
    
    fetchGroups();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'opening_balance' ? parseFloat(value) || 0 : value 
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Ledger name is required');
      return;
    }
    
    if (!formData.group_id) {
      setError('Please select a ledger group');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await createLedger(formData);
      router.push('/ledgers');
      
    } catch (err) {
      setError(err.message || 'Failed to create ledger');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="pb-20">
      <Header 
        title="New Ledger" 
        backButton={true} 
        backButtonHref="/ledgers" 
      />
      
      <div className="p-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Ledger Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter ledger name"
              required
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="group_id" className="block text-sm font-medium text-gray-700">
                Ledger Group *
              </label>
              <Link href="/ledgers/group/new" className="text-sm text-blue-600">
                + Add Group
              </Link>
            </div>
            
            {loadingGroups ? (
              <div className="w-full h-10 bg-gray-100 animate-pulse rounded-lg"></div>
            ) : (
              <>
                {groups.length > 0 ? (
                  <select
                    id="group_id"
                    name="group_id"
                    value={formData.group_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.type})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm mb-2">
                    No ledger groups available. Please create a group first.
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="opening_balance" className="block text-sm font-medium text-gray-700 mb-1">
              Opening Balance
            </label>
            <input
              type="number"
              id="opening_balance"
              name="opening_balance"
              value={formData.opening_balance}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              id="account_number"
              name="account_number"
              value={formData.account_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter account number (optional)"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter notes (optional)"
              rows="3"
            ></textarea>
          </div>
          
          <button
            type="submit"
            disabled={loading || loadingGroups || groups.length === 0}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
              loading || loadingGroups || groups.length === 0 ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Creating...
              </span>
            ) : 'Create Ledger'}
          </button>
        </form>
      </div>
      
      <BottomNav />
    </div>
  );
} 