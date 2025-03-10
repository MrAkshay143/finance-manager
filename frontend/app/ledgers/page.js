'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import LedgerItem from '@/components/LedgerItem';
import { 
  getLedgers, 
  getLedgersByType, 
  getLedgerGroups, 
  deleteLedger, 
  deleteLedgerGroup 
} from '@/utils/api';
import DeleteLedgerGroupDialog from '@/components/DeleteLedgerGroupDialog';

export default function LedgersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type');
  
  const [ledgers, setLedgers] = useState([]);
  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState(initialType || 'all');
  
  const [deleteGroupDialog, setDeleteGroupDialog] = useState({
    isOpen: false,
    groupId: null,
    groupName: '',
    affectedLedgers: []
  });
  
  // Fetch ledgers and groups data
  const fetchLedgers = async () => {
    try {
      setLoading(true);
      
      // Fetch ledger groups for filter tabs
      const groups = await getLedgerGroups();
      setLedgerGroups(groups);
      
      // Fetch ledgers based on active type
      let data;
      if (activeType === 'all') {
        data = await getLedgers();
      } else {
        data = await getLedgersByType(activeType);
      }
      
      setLedgers(data);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLedgers();
  }, [activeType]);
  
  // Handle ledger deletion
  const handleLedgerDelete = (id) => {
    // Remove the deleted ledger from the state
    setLedgers(prevLedgers => 
      prevLedgers.filter(ledger => ledger.id !== id)
    );
  };
  
  // Get unique ledger types from groups
  const ledgerTypes = ledgerGroups.reduce((types, group) => {
    if (!types.includes(group.type)) {
      types.push(group.type);
    }
    return types;
  }, []);
  
  // Filter tabs with friendly names
  const filterTabs = [
    { id: 'all', name: 'All' },
    { id: 'bank', name: 'Bank' },
    { id: 'credit-card', name: 'Credit Cards' },
    { id: 'cash', name: 'Cash' },
    { id: 'debtor', name: 'Debtors' },
    { id: 'income', name: 'Income' },
    { id: 'expense', name: 'Expense' },
  ].filter(tab => tab.id === 'all' || ledgerTypes.includes(tab.id));
  
  const handleDeleteGroup = async (groupId, groupName) => {
    try {
      // First check if there are ledgers in this group
      const ledgersInGroup = ledgers.filter(ledger => ledger.group_id === groupId);
      
      if (ledgersInGroup.length > 0) {
        // Open confirmation dialog with the affected ledgers
        setDeleteGroupDialog({
          isOpen: true,
          groupId,
          groupName,
          affectedLedgers: ledgersInGroup
        });
      } else {
        // No ledgers, confirm simple deletion
        const confirmed = window.confirm(`Are you sure you want to delete the group "${groupName}"?`);
        
        if (confirmed) {
          setLoading(true);
          await deleteLedgerGroup(groupId);
          // Refresh data after deletion
          await fetchLedgers();
        }
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      setError(`Error deleting group: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteLedger = async (ledgerId, ledgerName) => {
    try {
      const confirmed = window.confirm(`Are you sure you want to delete the ledger "${ledgerName}"?`);
      
      if (confirmed) {
        setLoading(true);
        await deleteLedger(ledgerId);
        // Refresh data after deletion
        await fetchLedgers();
      }
    } catch (err) {
      console.error('Error deleting ledger:', err);
      setError(`Error deleting ledger: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="pb-20">
      <Header title="Accounts" />
      
      {/* Filter tabs */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="overflow-x-auto">
          <div className="flex whitespace-nowrap p-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 rounded-full text-sm font-medium mr-2 ${
                  activeType === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveType(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Action buttons - visible always instead of dropdown */}
        <div className="flex gap-3 mb-4">
          <Link href="/ledgers/new" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl py-3 px-4 flex items-center justify-center shadow-sm hover:shadow-md transition-all">
            <i className="fa-solid fa-wallet mr-2"></i>
            <span className="font-medium">New Account</span>
          </Link>
          <Link href="/ledgers/group/new" className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl py-3 px-4 flex items-center justify-center shadow-sm hover:shadow-md transition-all">
            <i className="fa-solid fa-folder-plus mr-2"></i>
            <span className="font-medium">New Group</span>
          </Link>
        </div>
        
        {/* Refresh button */}
        <div className="flex justify-end mb-2">
          <button 
            onClick={fetchLedgers}
            className="text-sm text-blue-600 flex items-center hover:text-blue-700"
          >
            <i className="fa-solid fa-arrows-rotate mr-1"></i>
            Refresh
          </button>
        </div>

        {/* Ledger list */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {loading ? (
            // Loading skeleton
            Array(8).fill().map((_, i) => (
              <div key={i} className="animate-pulse flex p-3 border-b">
                <div className="rounded-full bg-gray-200 h-10 w-10 mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))
          ) : ledgers.length > 0 ? (
            // Ledger items
            ledgers.map(ledger => (
              <LedgerItem 
                key={ledger.id} 
                ledger={ledger} 
                onDelete={handleDeleteLedger}
              />
            ))
          ) : (
            // Empty state
            <div className="p-8 text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-wallet text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No accounts found</h3>
              <p className="text-gray-500 text-sm mb-4">
                {activeType === 'all'
                  ? 'You have not created any accounts yet.'
                  : `You have not created any ${activeType} accounts yet.`}
              </p>
              <Link 
                href="/ledgers/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-block text-sm hover:bg-blue-700 transition-colors"
              >
                Add Account
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <BottomNav />
      
      <DeleteLedgerGroupDialog
        isOpen={deleteGroupDialog.isOpen}
        onClose={() => setDeleteGroupDialog({ isOpen: false, groupId: null, groupName: '', affectedLedgers: [] })}
        groupId={deleteGroupDialog.groupId}
        groupName={deleteGroupDialog.groupName}
        affectedLedgers={deleteGroupDialog.affectedLedgers}
        onSuccess={fetchLedgers}
      />
    </div>
  );
} 