'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { createLedgerGroup } from '@/utils/api';

export default function NewLedgerGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    description: ''
  });
  const [error, setError] = useState('');
  
  const typeOptions = [
    { value: 'bank', label: 'Bank Account' },
    { value: 'credit-card', label: 'Credit Card' },
    { value: 'debtor', label: 'Debtor' },
    { value: 'cash', label: 'Cash' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await createLedgerGroup(formData);
      router.push('/ledgers');
      
    } catch (err) {
      setError(err.message || 'Failed to create ledger group');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="pb-20">
      <Header 
        title="New Ledger Group" 
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
              Group Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter group name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Group Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description (optional)"
              rows="3"
            ></textarea>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Creating...
              </span>
            ) : 'Create Ledger Group'}
          </button>
        </form>
      </div>
      
      <BottomNav />
    </div>
  );
} 