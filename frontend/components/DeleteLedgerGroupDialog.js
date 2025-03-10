'use client';

import { useState, useEffect } from 'react';
import { deleteLedgerGroup, getLedgerGroups } from '@/utils/api';

export default function DeleteLedgerGroupDialog({ 
  isOpen, 
  onClose, 
  groupId, 
  groupName, 
  affectedLedgers = [],
  onSuccess 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [action, setAction] = useState(''); // 'reassign' or 'delete'
  const [targetGroupId, setTargetGroupId] = useState('');
  const [availableGroups, setAvailableGroups] = useState([]);
  
  useEffect(() => {
    // Reset state when dialog opens
    if (isOpen) {
      setIsLoading(false);
      setError('');
      setAction('');
      setTargetGroupId('');
      
      // Fetch available groups for reassignment
      const fetchGroups = async () => {
        try {
          const response = await getLedgerGroups();
          // Filter out the current group being deleted
          const filteredGroups = response.filter(group => group.id !== groupId);
          setAvailableGroups(filteredGroups);
        } catch (err) {
          console.error('Error fetching ledger groups:', err);
          setError('Failed to load ledger groups for reassignment');
        }
      };
      
      fetchGroups();
    }
  }, [isOpen, groupId]);
  
  if (!isOpen) return null;
  
  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Prepare options based on selected action
      const options = {};
      if (action === 'reassign' && targetGroupId) {
        options.reassignTo = targetGroupId;
      } else if (action === 'delete') {
        options.deleteTransactions = true;
      } else if (affectedLedgers.length > 0) {
        setError('Please select an action for the affected ledgers');
        setIsLoading(false);
        return;
      }
      
      await deleteLedgerGroup(groupId, options);
      
      setIsLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error deleting ledger group:', err);
      setError(err.message || 'Failed to delete ledger group');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800">Delete Ledger Group</h3>
          <p className="text-gray-600 mt-1">
            Are you sure you want to delete the ledger group "{groupName}"?
          </p>
        </div>
        
        {affectedLedgers.length > 0 && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 mb-4">
              <div className="flex items-start">
                <i className="fas fa-exclamation-triangle mt-0.5 mr-2 text-yellow-600"></i>
                <div>
                  <p className="font-medium">This group has {affectedLedgers.length} account(s):</p>
                  <ul className="mt-1 ml-4 text-sm list-disc">
                    {affectedLedgers.slice(0, 5).map(ledger => (
                      <li key={ledger.id}>{ledger.name}</li>
                    ))}
                    {affectedLedgers.length > 5 && (
                      <li>...and {affectedLedgers.length - 5} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="font-medium text-gray-700 mb-2">Please choose what to do with these accounts:</p>
              
              <div className="space-y-3">
                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="action"
                    value="reassign"
                    checked={action === 'reassign'}
                    onChange={() => setAction('reassign')}
                    className="mt-0.5"
                  />
                  <div className="ml-2">
                    <p className="font-medium">Reassign accounts to another group</p>
                    <p className="text-sm text-gray-500">Accounts will be moved to the selected group</p>
                  </div>
                </label>
                
                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="action"
                    value="delete"
                    checked={action === 'delete'}
                    onChange={() => setAction('delete')}
                    className="mt-0.5"
                  />
                  <div className="ml-2">
                    <p className="font-medium">Delete all accounts and transactions</p>
                    <p className="text-sm text-red-600">Warning: This will delete all accounts and their transactions</p>
                  </div>
                </label>
              </div>
            </div>
            
            {action === 'reassign' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Group
                </label>
                <select
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={action === 'reassign'}
                >
                  <option value="">Select a target group</option>
                  {availableGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.type})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <i className="fas fa-circle-exclamation mr-2"></i>
            {error}
          </div>
        )}
        
        <div className="flex space-x-3 justify-end">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 